import Script from "next/script";

function getPixelIds() {
  const rawPixelIds = process.env.NEXT_PUBLIC_X_PIXEL_ID ?? "";
  return rawPixelIds
    .split(",")
    .map((pixelId) => pixelId.trim())
    .filter(Boolean);
}

export function XPixel() {
  const pixelIds = getPixelIds();
  if (!pixelIds.length) return null;

  return (
    <>
      <Script id="x-pixel-base" strategy="afterInteractive">
        {`
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          ${pixelIds.map((pixelId) => `twq('config','${pixelId}');`).join("\n")}
        `}
      </Script>
      <noscript>
        {pixelIds.map((pixelId) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={pixelId}
            alt=""
            height="1"
            src={`https://analytics.twitter.com/i/adsct?txn_id=${encodeURIComponent(pixelId)}&p_id=Twitter&tw_sale_amount=0&tw_order_quantity=0`}
            style={{ display: "none" }}
            width="1"
          />
        ))}
      </noscript>
    </>
  );
}
