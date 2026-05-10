import base64
import hmac
import json
import os
import re
from typing import Any, Literal

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field


Locale = Literal["ja", "en"]


class AddressResult(BaseModel):
    raw_text: str = ""
    normalized_address: str = ""
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    notes: list[str] = Field(default_factory=list)


class RouteStop(BaseModel):
    index: int
    address: str


class RouteOptimizeRequest(BaseModel):
    stops: list[RouteStop]
    locale: Locale = "ja"


class RouteOptimizeResult(BaseModel):
    ordered_indices: list[int]
    notes: list[str] = Field(default_factory=list)


ERROR_MESSAGES = {
    "ja": {
        "image_required": "画像ファイルを送信してください",
        "api_key_missing": "OPENAI_API_KEY が設定されていません",
        "image_too_large": "画像サイズは8MB以下にしてください",
        "ai_failed": "AI解析に失敗しました",
        "json_failed": "AIの返答を住所として解析できませんでした",
    },
    "en": {
        "image_required": "Please upload an image file",
        "api_key_missing": "OPENAI_API_KEY is not configured",
        "image_too_large": "Image size must be 8MB or less",
        "ai_failed": "AI analysis failed",
        "json_failed": "Could not parse the AI response as an address",
    },
}


app = FastAPI(title="Route Snap API")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
allowed_origin_regex = os.getenv("ALLOWED_ORIGIN_REGEX", r"https://.*\.vercel\.app")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


def normalize_locale(locale: str) -> Locale:
    return "ja" if locale.lower().startswith("ja") else "en"


def error_message(locale: Locale, key: str) -> str:
    return ERROR_MESSAGES[locale][key]


def verify_api_token(provided_token: str | None) -> None:
    expected_token = os.getenv("ROUTE_SNAP_API_TOKEN")
    if not expected_token:
        return
    if not provided_token or not hmac.compare_digest(provided_token, expected_token):
        raise HTTPException(status_code=401, detail="Unauthorized")


def extract_json(text: str) -> dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("AI response did not contain JSON") from None
        return json.loads(match.group(0))


def build_prompt(locale: Locale) -> str:
    response_language = "Japanese" if locale == "ja" else "English"
    return f"""
Read the address-like text in the image and normalize it for delivery or navigation search.
Return JSON only. Do not wrap it in Markdown.
Write notes in {response_language}.

Expected schema:
{{
  "raw_text": "text read from the image",
  "normalized_address": "the most complete address possible, excluding postal code and recipient name",
  "confidence": 0.0,
  "notes": ["short notes about missing, ambiguous, or unreadable parts"]
}}

If no address is found, set normalized_address to an empty string and confidence to 0.
For Japanese addresses, preserve Japanese address order and use standard Japanese address notation.
""".strip()


def build_route_prompt(stops: list[RouteStop], locale: Locale) -> str:
    response_language = "Japanese" if locale == "ja" else "English"
    stops_text = "\n".join(f'{stop.index}: {stop.address}' for stop in stops)
    return f"""
Optimize the visit order for these delivery or navigation stops.
Use geographic knowledge, address order, and practical driving sequence.
Keep every provided index exactly once. Return JSON only. Do not wrap it in Markdown.
Write notes in {response_language}.

Stops:
{stops_text}

Expected schema:
{{
  "ordered_indices": [0, 1, 2],
  "notes": ["short reason for the ordering"]
}}
""".strip()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/config")
def health_config() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "openai_api_key_configured": bool(os.getenv("OPENAI_API_KEY")),
        "openai_model": os.getenv("OPENAI_MODEL", "gpt-5.2"),
        "route_snap_api_token_configured": bool(os.getenv("ROUTE_SNAP_API_TOKEN")),
    }


@app.post("/api/parse-address", response_model=AddressResult)
async def parse_address(
    image: UploadFile = File(...),
    locale: str = Form(default="ja"),
    x_route_snap_token: str | None = Header(default=None),
) -> AddressResult:
    active_locale = normalize_locale(locale)
    verify_api_token(x_route_snap_token)

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=error_message(active_locale, "image_required"))

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail=error_message(active_locale, "api_key_missing"))

    image_bytes = await image.read()
    if len(image_bytes) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail=error_message(active_locale, "image_too_large"))

    encoded = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{image.content_type};base64,{encoded}"

    client = OpenAI(api_key=api_key)
    model = os.getenv("OPENAI_MODEL", "gpt-5.2")

    try:
        response = client.responses.create(
            model=model,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": build_prompt(active_locale)},
                        {"type": "input_image", "image_url": data_url, "detail": "high"},
                    ],
                }
            ],
        )
    except Exception as exc:
        detail = f"{error_message(active_locale, 'ai_failed')}: {exc}"
        raise HTTPException(status_code=502, detail=detail) from exc

    try:
        payload = extract_json(response.output_text)
        return AddressResult.model_validate(payload)
    except Exception as exc:
        detail = f"{error_message(active_locale, 'json_failed')}: {exc}"
        raise HTTPException(status_code=502, detail=detail) from exc


@app.post("/api/optimize-route", response_model=RouteOptimizeResult)
async def optimize_route(
    request: RouteOptimizeRequest,
    x_route_snap_token: str | None = Header(default=None),
) -> RouteOptimizeResult:
    verify_api_token(x_route_snap_token)

    stops = [stop for stop in request.stops if stop.address.strip()]
    if len(stops) < 2:
        return RouteOptimizeResult(ordered_indices=[stop.index for stop in stops])

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail=error_message(request.locale, "api_key_missing"))

    client = OpenAI(api_key=api_key)
    model = os.getenv("OPENAI_MODEL", "gpt-5.2")

    try:
        response = client.responses.create(
            model=model,
            input=[
                {
                    "role": "user",
                    "content": [{"type": "input_text", "text": build_route_prompt(stops, request.locale)}],
                }
            ],
        )
    except Exception as exc:
        detail = f"{error_message(request.locale, 'ai_failed')}: {exc}"
        raise HTTPException(status_code=502, detail=detail) from exc

    try:
        payload = extract_json(response.output_text)
        result = RouteOptimizeResult.model_validate(payload)
    except Exception as exc:
        detail = f"{error_message(request.locale, 'json_failed')}: {exc}"
        raise HTTPException(status_code=502, detail=detail) from exc

    known_indices = {stop.index for stop in stops}
    ordered = [index for index in result.ordered_indices if index in known_indices]
    missing = [stop.index for stop in stops if stop.index not in ordered]
    return RouteOptimizeResult(ordered_indices=ordered + missing, notes=result.notes)
