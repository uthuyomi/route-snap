import { LegalLayout } from "../LegalLayout";

const contactEmail = process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "support@example.com";

export default function PrivacyPage() {
  return (
    <LegalLayout title="プライバシーポリシー" lead="Route Snapにおける個人情報の取り扱いについて説明します。">
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">1. 取得する情報</h2>
        <p className="m-0 mt-2">メールアドレス、認証情報、決済状態、利用プラン、利用量、アップロードされた画像またはファイルから読み取られる住所情報、端末やブラウザに関する技術情報を取得する場合があります。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">2. 利用目的</h2>
        <p className="m-0 mt-2">サービス提供、本人確認、利用枠管理、決済管理、問い合わせ対応、不正利用防止、品質改善、法令対応のために利用します。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">3. 外部サービス</h2>
        <p className="m-0 mt-2">認証とデータ管理にSupabase、決済にStripe、AI処理にOpenAIを利用します。決済情報はStripeにより処理され、当サービスはカード番号を保持しません。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">4. 画像・住所情報</h2>
        <p className="m-0 mt-2">アップロードされた画像や住所情報は、住所読み取り、ルート作成、利用量管理のために処理されます。利用者は、業務上必要な範囲で適切な情報をアップロードするものとします。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">5. 安全管理</h2>
        <p className="m-0 mt-2">取得した情報について、不正アクセス、漏えい、滅失、毀損を防止するために合理的な安全管理措置を講じます。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">6. お問い合わせ</h2>
        <p className="m-0 mt-2">個人情報の取り扱いに関するお問い合わせは、{contactEmail} までご連絡ください。</p>
      </section>
    </LegalLayout>
  );
}

