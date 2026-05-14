import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const contactToEmail = process.env.CONTACT_TO_EMAIL ?? "kaiseif4e@gmail.com";
const allowedTopics = new Set([
  "使い方について",
  "料金・決済について",
  "解約・返金について",
  "データの扱いについて",
  "不具合について",
  "その他",
]);

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
};

function asCleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, maxLength);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function POST(request: NextRequest) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  const name = asCleanText(payload.name, 80);
  const email = asCleanText(payload.email, 120);
  const topic = asCleanText(payload.topic, 40);
  const message = asCleanText(payload.message, 4000);

  if (!email || !isEmail(email)) {
    return NextResponse.json({ detail: "有効なメールアドレスを入力してください。" }, { status: 400 });
  }
  if (!allowedTopics.has(topic)) {
    return NextResponse.json({ detail: "お問い合わせ種別を選択してください。" }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ detail: "お問い合わせ内容を10文字以上で入力してください。" }, { status: 400 });
  }

  const transporter = getTransporter();
  const smtpUser = process.env.SMTP_USER;
  if (!transporter || !smtpUser) {
    return NextResponse.json(
      { detail: "メール送信設定が未設定です。SMTP_HOST、SMTP_USER、SMTP_PASS を設定してください。" },
      { status: 503 }
    );
  }

  const submittedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const fromName = process.env.CONTACT_FROM_NAME ?? "Route Snap";
  const from = `"${fromName}" <${smtpUser}>`;
  const adminSubject = `Route Snapへのお問い合わせ: ${topic}`;
  const adminText = [
    "Route Snapへのお問い合わせ",
    "",
    `送信日時: ${submittedAt}`,
    `お名前: ${name || "未入力"}`,
    `メールアドレス: ${email}`,
    `お問い合わせ種別: ${topic}`,
    "",
    "お問い合わせ内容:",
    message,
    "",
    "送信元ページ: /contact",
  ].join("\n");

  const adminHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; color: #111827;">
      <h1 style="font-size: 20px;">Route Snapへのお問い合わせ</h1>
      <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
        <tr><th align="left" style="padding: 8px; border: 1px solid #d1d5db;">送信日時</th><td style="padding: 8px; border: 1px solid #d1d5db;">${escapeHtml(submittedAt)}</td></tr>
        <tr><th align="left" style="padding: 8px; border: 1px solid #d1d5db;">お名前</th><td style="padding: 8px; border: 1px solid #d1d5db;">${escapeHtml(name || "未入力")}</td></tr>
        <tr><th align="left" style="padding: 8px; border: 1px solid #d1d5db;">メールアドレス</th><td style="padding: 8px; border: 1px solid #d1d5db;">${escapeHtml(email)}</td></tr>
        <tr><th align="left" style="padding: 8px; border: 1px solid #d1d5db;">お問い合わせ種別</th><td style="padding: 8px; border: 1px solid #d1d5db;">${escapeHtml(topic)}</td></tr>
      </table>
      <h2 style="font-size: 16px; margin-top: 24px;">お問い合わせ内容</h2>
      <pre style="white-space: pre-wrap; background: #f3f4f6; padding: 16px; border-radius: 12px;">${escapeHtml(message)}</pre>
      <p style="font-size: 12px; color: #6b7280;">送信元ページ: /contact</p>
    </div>
  `;

  const thanksSubject = "【Route Snap】お問い合わせを受け付けました";
  const thanksText = [
    `${name || "お客様"} 様`,
    "",
    "Route Snapへお問い合わせいただきありがとうございます。",
    "以下の内容でお問い合わせを受け付けました。",
    "通常3営業日以内に返信いたします。",
    "",
    "----------------------------------------",
    `お問い合わせ種別: ${topic}`,
    "",
    message,
    "----------------------------------------",
    "",
    "このメールはお問い合わせ受付時に自動送信されています。",
    "お心当たりがない場合は、このメールを破棄してください。",
    "",
    "Route Snap",
  ].join("\n");

  const thanksHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; color: #111827;">
      <h1 style="font-size: 20px;">お問い合わせを受け付けました</h1>
      <p>${escapeHtml(name || "お客様")} 様</p>
      <p>Route Snapへお問い合わせいただきありがとうございます。以下の内容でお問い合わせを受け付けました。</p>
      <p>通常3営業日以内に返信いたします。</p>
      <div style="margin-top: 20px; padding: 16px; border-radius: 12px; background: #f0fdf4; border: 1px solid #bbf7d0;">
        <p style="margin: 0 0 8px; font-weight: 700;">お問い合わせ種別: ${escapeHtml(topic)}</p>
        <pre style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</pre>
      </div>
      <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
        このメールはお問い合わせ受付時に自動送信されています。お心当たりがない場合は、このメールを破棄してください。
      </p>
      <p>Route Snap</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: contactToEmail,
      replyTo: email,
      subject: adminSubject,
      text: adminText,
      html: adminHtml,
    });

    await transporter.sendMail({
      from,
      to: email,
      replyTo: contactToEmail,
      subject: thanksSubject,
      text: thanksText,
      html: thanksHtml,
    });
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json({ detail: "メールの送信に失敗しました。時間をおいて再度お試しください。" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
