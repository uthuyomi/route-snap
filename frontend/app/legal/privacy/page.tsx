import { LegalLayout } from "../LegalLayout";

const serviceName = "Route Snap";
const contactEmail = process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "support@example.com";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="プライバシーポリシー"
      lead={`${serviceName}における個人情報、住所データ、アップロード画像、利用履歴、決済関連情報の取り扱いを説明します。`}
    >
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">1. 取得する情報</h2>
        <p className="m-0 mt-2">
          当サービスは、メールアドレス、認証ID、アカウント情報、プラン情報、利用枠、決済ステータス、問い合わせ内容、ブラウザや端末に関する技術情報、アクセスログ、Cookie等の識別子を取得する場合があります。
        </p>
        <p className="m-0 mt-2">
          また、利用者がアップロードした画像、写真、スクリーンショット、TXT、CSV、TSV、JSON等のファイル、そこから抽出された住所、建物名、メモ、時間指定、訪問条件、AI処理結果、ルート作成のために入力された条件を処理します。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">2. 利用目的</h2>
        <p className="m-0 mt-2">
          取得した情報は、住所読み取り、住所リスト化、ルート作成、現在地を起点とした地図連携、利用枠の集計、本人確認、ログイン管理、決済管理、サポート対応、不正利用防止、品質改善、障害調査、法令対応のために利用します。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">3. 住所・画像データの取り扱い</h2>
        <p className="m-0 mt-2">
          アップロードされた画像や住所データには、顧客名、住所、建物名、部屋番号、電話番号、メモなどの個人情報または業務上の機密情報が含まれる場合があります。利用者は、必要最小限のデータのみをアップロードし、不要な個人情報が写り込む場合は事前に加工するなど、適切に管理してください。
        </p>
        <p className="m-0 mt-2">
          当サービスは、住所読み取りやルート作成に必要な範囲でこれらの情報を処理します。保存期間、保存対象、保存形式は、機能、プラン、障害対応、利用枠管理、法令対応の必要性に応じて変わる場合があります。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">4. 現在地情報</h2>
        <p className="m-0 mt-2">
          現在地を起点にGoogle Mapsを開く機能や訪問順の提案では、ブラウザの許可に基づき端末の位置情報を取得する場合があります。位置情報は、利用者が明示的に許可した場合に限り、ルート作成の目的で利用します。ブラウザやOSの設定から位置情報の許可を取り消せます。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">5. 外部サービスへの提供</h2>
        <p className="m-0 mt-2">
          当サービスは、認証・データ管理にSupabase、決済にStripe、AI処理にOpenAI、地図連携にGoogle Maps等を利用する場合があります。これらの外部サービスには、機能提供に必要な範囲で、認証情報、決済関連情報、アップロードデータ、住所、メモ、利用状況、技術情報が送信されることがあります。
        </p>
        <p className="m-0 mt-2">
          決済情報はStripeにより処理され、当サービスはクレジットカード番号を保持しません。外部サービスの利用には、それぞれの利用規約およびプライバシーポリシーが適用されます。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">6. AI処理に関する注意</h2>
        <p className="m-0 mt-2">
          住所読み取りや訪問順の提案のため、アップロード画像、抽出テキスト、住所、メモ、訪問条件をAI処理サービスへ送信する場合があります。AI処理の結果は正確とは限らないため、利用者は出力内容を確認し、必要に応じて修正してください。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">7. Cookie、ログ、分析</h2>
        <p className="m-0 mt-2">
          当サービスは、ログイン状態の維持、セキュリティ、利用状況の把握、障害調査、品質改善のため、Cookie、ローカルストレージ、アクセスログ、ブラウザ情報、参照元、操作履歴、エラー情報を利用する場合があります。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">8. 安全管理</h2>
        <p className="m-0 mt-2">
          当サービスは、取得した情報について、不正アクセス、漏えい、滅失、毀損を防止するため、アクセス制御、認証管理、通信の暗号化、権限管理、ログ監視など合理的な安全管理措置を講じます。ただし、インターネット上の通信や外部サービスを利用する性質上、完全な安全性を保証するものではありません。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">9. 保存期間</h2>
        <p className="m-0 mt-2">
          当サービスは、利用目的の達成、契約管理、請求管理、障害対応、不正利用防止、法令上の保存義務に必要な期間、情報を保存します。不要になった情報は、合理的な期間内に削除または匿名化します。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">10. 第三者提供</h2>
        <p className="m-0 mt-2">
          当サービスは、法令に基づく場合、利用者の同意がある場合、サービス提供に必要な委託先へ提供する場合、不正利用や権利侵害への対応に必要な場合を除き、個人情報を第三者へ提供しません。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">11. 開示、訂正、削除、問い合わせ</h2>
        <p className="m-0 mt-2">
          利用者は、法令の範囲内で、自己の個人情報の開示、訂正、利用停止、削除を請求できます。本人確認のうえ、合理的な範囲で対応します。個人情報の取り扱いに関する問い合わせは {contactEmail} までご連絡ください。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">12. 変更</h2>
        <p className="m-0 mt-2">
          当サービスは、法令改正、機能追加、外部サービスの変更、運用改善に応じて本ポリシーを変更することがあります。重要な変更は、サービス上の表示またはメール等の合理的な方法で通知します。
        </p>
      </section>
    </LegalLayout>
  );
}
