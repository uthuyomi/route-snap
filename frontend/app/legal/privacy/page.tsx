import { LegalLayout } from "../LegalLayout";

const serviceName = "Route Snap";
const contactEmail = "kaiseif4e@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="プライバシーポリシー"
      lead={`${serviceName}における個人情報、業務データ、アップロード画像、利用履歴、決済関連情報の取り扱いについて説明します。`}
    >
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">1. 取得する情報</h2>
        <p className="m-0 mt-2">
          当サービスは、メールアドレス、認証ID、アカウント情報、契約プラン、利用量、決済ステータス、問い合わせ内容、端末やブラウザに関する技術情報、アクセスログ、Cookie等の識別子を取得する場合があります。
        </p>
        <p className="m-0 mt-2">
          また、利用者がアップロードした画像、写真、スクリーンショット、TXT、CSV、TSV、JSON等のファイル、そこから抽出された住所、施設名、訪問メモ、時間指定、訪問条件、AI処理結果、ルート作成に必要な条件を処理します。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">2. 利用目的</h2>
        <p className="m-0 mt-2">
          取得した情報は、住所読み取り、訪問先の整理、ルート作成、Google Maps連携、現在地を起点としたルート開始、利用量の集計、本人確認、ログイン管理、決済管理、問い合わせ対応、不正利用防止、品質改善、障害調査、法令対応のために利用します。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">3. 画像・住所データの扱い</h2>
        <p className="m-0 mt-2">
          画像、ファイル、抽出テキスト、住所、施設名、訪問メモ等には、個人情報または業務上の機密情報が含まれる場合があります。利用者は、必要な権限を持つ情報のみをアップロードしてください。
        </p>
        <p className="m-0 mt-2">
          当サービスは、住所読み取り、ルート作成、利用履歴管理、不正利用防止、品質改善、問い合わせ対応に必要な範囲でこれらの情報を処理します。不要となった情報は、合理的な期間内に削除または匿名化します。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">4. 現在地情報</h2>
        <p className="m-0 mt-2">
          現在地からルートを開始する機能では、ブラウザの許可に基づき端末の位置情報を利用する場合があります。位置情報は、利用者が明示的に許可した場合に限り、ルート作成の目的で利用します。許可はブラウザやOSの設定から取り消せます。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">5. AI処理について</h2>
        <p className="m-0 mt-2">
          住所読み取りやルート作成のため、アップロード画像、抽出テキスト、住所、訪問条件などをAI処理サービスへ送信する場合があります。AI処理結果は正確とは限らず、住所、施設名、部屋番号、電話番号、訪問時間、ルート等に誤りが含まれる可能性があります。
        </p>
        <p className="m-0 mt-2">
          利用者は、出力結果を確認し、必要に応じて修正してから実際の配送、訪問、移動に利用してください。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">6. 外部サービスへの提供</h2>
        <p className="m-0 mt-2">
          当サービスは、認証とデータ管理にSupabase、決済にStripe、AI処理にOpenAI、地図やルート連携にGoogle Maps等の外部サービスを利用する場合があります。これらのサービスには、機能提供に必要な範囲で、認証情報、決済関連情報、アップロードデータ、住所、メモ、利用状況、操作情報が送信されることがあります。
        </p>
        <p className="m-0 mt-2">
          決済情報はStripeにより処理され、当サービスはクレジットカード番号を保持しません。外部サービスの利用には、それぞれの利用規約およびプライバシーポリシーが適用されます。
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
