import { LegalLayout } from "../LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="利用規約" lead="本規約は、Route Snapの利用条件を定めるものです。">
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">1. サービス内容</h2>
        <p className="m-0 mt-2">Route Snapは、画像またはファイルから住所情報を読み取り、住所確認やルート作成を補助するサービスです。読み取り結果やルートは補助情報であり、利用者は実際の訪問前に住所、建物名、訪問条件を確認するものとします。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">2. アカウント</h2>
        <p className="m-0 mt-2">有料プランの利用、利用枠の管理、決済情報の管理にはログインが必要です。利用者は登録情報を正確に管理し、第三者にアカウントを利用させないものとします。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">3. 料金と決済</h2>
        <p className="m-0 mt-2">有料プランの料金、利用枠、超過条件は料金ページに表示します。決済はStripeを通じて処理されます。サブスクリプションは解約されるまで契約期間ごとに自動更新されます。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">4. 禁止事項</h2>
        <p className="m-0 mt-2">不正アクセス、過度な自動リクエスト、第三者の権利を侵害する利用、法令に違反する利用、サービス運営を妨げる行為を禁止します。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">5. 免責</h2>
        <p className="m-0 mt-2">AIによる読み取り結果には誤認識が含まれる場合があります。当社は、住所誤認識、地図アプリ側の検索結果、移動経路、遅延、損害について、法令で認められる範囲で責任を負いません。</p>
      </section>
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">6. 規約変更</h2>
        <p className="m-0 mt-2">当社は、必要に応じて本規約を変更できるものとします。重要な変更はサービス上またはメール等で通知します。</p>
      </section>
    </LegalLayout>
  );
}

