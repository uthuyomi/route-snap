import { LegalLayout, LegalTable } from "../LegalLayout";

const sellerName = process.env.NEXT_PUBLIC_LEGAL_SELLER_NAME ?? "販売事業者名を設定してください";
const representative = process.env.NEXT_PUBLIC_LEGAL_REPRESENTATIVE ?? "代表者名を設定してください";
const address = process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? "所在地を設定してください";
const phone = process.env.NEXT_PUBLIC_LEGAL_PHONE ?? "電話番号を設定してください";
const email = process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "support@example.com";

export default function TokushoPage() {
  return (
    <LegalLayout
      title="特定商取引法に基づく表記"
      lead="Route Snapのサブスクリプション提供に関する表示事項です。"
    >
      <LegalTable
        rows={[
          ["販売事業者", sellerName],
          ["運営責任者", representative],
          ["所在地", address],
          ["電話番号", phone],
          ["メールアドレス", email],
          ["販売価格", "料金ページに表示された各プランの月額料金。表示価格は税込想定です。"],
          ["商品代金以外の必要料金", "インターネット接続料金、通信料金、端末費用はお客様の負担となります。"],
          ["支払方法", "クレジットカード決済。決済処理はStripeが提供します。"],
          ["支払時期", "初回申込時に決済され、以後は契約期間ごとに自動更新されます。"],
          ["サービス提供時期", "決済完了後、直ちに有料プランの利用枠が付与されます。"],
          ["解約方法", "アカウントページの支払い管理、またはお問い合わせにより解約できます。解約後も当該契約期間の終了まで利用できます。"],
          ["返金・キャンセル", "デジタルサービスの性質上、決済完了後のお客様都合による返金は原則として承っておりません。重複決済や当社起因の障害がある場合は個別に対応します。"],
          ["動作環境", "最新版の主要ブラウザを搭載したスマートフォン、タブレット、PC。カメラ機能や位置情報機能の利用には端末側の許可が必要です。"]
        ]}
      />
    </LegalLayout>
  );
}

