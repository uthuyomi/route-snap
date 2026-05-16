import { LegalLayout, LegalTable } from "../LegalLayout";

const enSections = [
  {
    title: "Business disclosure",
    body: [
      "Seller: Kaisei Anzaki",
      "Operations manager: Kaisei Anzaki",
      "Address: Disclosed by email without delay when requested.",
      "Phone number: Disclosed by email without delay when requested.",
      "Email: kaiseif4e@gmail.com",
      "Service name: Route Snap",
      "Price: Monthly fees for each plan shown on the pricing page. Displayed prices are expected to include tax.",
      "Additional costs: Internet connection fees, communication fees, and device costs are borne by the customer.",
      "Payment method: Credit card payment. Payment processing is provided by Stripe.",
      "Payment timing: Payment is made at initial application and then automatically renewed and charged for each contract period.",
      "Service timing: Paid plan usage limits are granted immediately after payment is completed.",
      "Contract period and renewal: Paid plans are monthly subscriptions and renew automatically each month until cancelled.",
      "Sales quantity and usage limits: Usage is limited to the address reading, bulk destination import, and route sorting limits defined for each plan.",
      "Cancellation: Cancel from billing management on the account page or by email inquiry. Access may remain available until the end of the paid period.",
      "Returns, cancellation, and refunds: Because this is a digital service, customer-requested refunds are generally not provided after payment. Duplicate charges or service-caused failures are handled individually.",
      "Operating environment: Smartphones, tablets, and PCs with current major browsers. Camera and location permissions may be required for image reading and current-location features.",
      "Support hours: Accepted by email. We usually reply within 3 business days.",
    ],
  },
  {
    title: "Disclosure of address and phone number",
    body: [
      "To prevent nuisance or abusive contact, address and phone number are omitted from this page. If requested in connection with a transaction, they will be disclosed by email without delay in response to contact sent to the email address above.",
    ],
  },
] as const;

export default function TokushoPage() {
  return (
    <LegalLayout
      title="特定商取引法に基づく表記"
      lead="Route Snap のサブスクリプション提供に関する表示事項です。"
      enTitle="Specified Commercial Transactions Act Notice"
      enLead="Disclosure items related to Route Snap subscription services."
      enSections={[...enSections]}
    >
      <LegalTable
        rows={[
          ["販売事業者", "安崎海星"],
          ["運営責任者", "安崎海星"],
          ["所在地", "請求があった場合には、遅滞なく電子メールにて開示いたします。"],
          ["電話番号", "請求があった場合には、遅滞なく電子メールにて開示いたします。"],
          ["メールアドレス", "kaiseif4e@gmail.com"],
          ["サービス名", "Route Snap"],
          ["販売価格", "料金ページに表示された各プランの月額料金。表示価格は税込予定です。"],
          [
            "商品代金以外の必要料金",
            "インターネット接続料金、通信料金、端末費用はお客様の負担となります。",
          ],
          ["支払方法", "クレジットカード決済。決済処理は Stripe が提供します。"],
          [
            "支払時期",
            "初回申込時に決済され、以後は契約期間ごとに自動更新・自動決済されます。",
          ],
          [
            "サービス提供時期",
            "決済完了後、直ちに有料プランの利用枠が付与されます。",
          ],
          [
            "契約期間・更新",
            "各有料プランは月単位のサブスクリプションです。解約されるまで1か月ごとに自動更新されます。",
          ],
          [
            "販売数量・利用上限",
            "各プランに定める住所読み取り回数、訪問先一括登録件数、ルート整理回数を上限とします。",
          ],
          [
            "解約方法",
            "アカウントページの支払い管理、またはメールでの問い合わせにより解約できます。解約後も支払い済み期間の終了までは利用できる場合があります。",
          ],
          [
            "返品・キャンセル・返金",
            "デジタルサービスの性質上、決済完了後のお客様都合による返金は原則として行いません。重複決済や当サービス起因の障害がある場合は個別に対応します。解約後も支払い済み期間の終了までは利用できる場合があります。",
          ],
          [
            "動作環境",
            "最新版の主要ブラウザを搭載したスマートフォン、タブレット、PC。画像読み取りや現在地利用には、端末側のカメラ・位置情報の許可が必要です。",
          ],
          [
            "問い合わせ受付時間",
            "メールにて受け付けます。通常3営業日以内に返信します。",
          ],
        ]}
      />

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">所在地および電話番号の開示について</h2>
        <p className="m-0 mt-2">
          いたずら・迷惑行為防止のため、所在地および電話番号は本ページ上では省略しています。取引に関して請求があった場合、上記メールアドレス宛の連絡に対し、遅滞なく電子メールにて開示いたします。
        </p>
      </section>
    </LegalLayout>
  );
}
