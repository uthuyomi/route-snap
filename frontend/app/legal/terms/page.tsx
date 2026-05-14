import { LegalLayout } from "../LegalLayout";

const serviceName = "Route Snap";
const contactEmail = process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "support@example.com";

export default function TermsPage() {
  return (
    <LegalLayout
      title="利用規約"
      lead={`${serviceName}の利用条件、AIによる住所読み取り、ルート作成、有料プラン、禁止事項、免責事項を定めます。`}
    >
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">1. 適用</h2>
        <p className="m-0 mt-2">
          本規約は、当サービスのウェブアプリ、PWA、API、関連ページ、料金プラン、サポートを利用するすべての方に適用されます。利用者は、本規約および別途表示される料金、注意事項、プライバシーポリシーに同意したうえで当サービスを利用するものとします。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">2. サービス内容</h2>
        <p className="m-0 mt-2">
          当サービスは、画像、写真、スクリーンショット、TXT、CSV、TSV、JSONなどから住所らしい情報を抽出し、利用者が確認・編集したうえでGoogle Maps等の外部地図サービスへ連携するための補助ツールです。単一住所の読み取り、複数住所の取り込み、訪問順の作成、現在地を起点としたルート作成、住所ごとのメモ管理などを提供します。
        </p>
        <p className="m-0 mt-2">
          当サービスは配送、訪問、点検、営業、介護、イベント運営などの現場作業を補助するものであり、住所の存在、地図上の位置、到着時間、交通状況、訪問可否、業務成果を保証するものではありません。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">3. アカウントと認証</h2>
        <p className="m-0 mt-2">
          有料プラン、利用枠管理、決済、アカウント設定、利用履歴の確認にはログインが必要です。利用者は正確な登録情報を提供し、認証情報を自己の責任で管理するものとします。第三者による不正利用が疑われる場合、速やかに当サービスへ連絡してください。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">4. AI処理と確認義務</h2>
        <p className="m-0 mt-2">
          住所読み取りおよびルート順の提案にはAI処理を利用する場合があります。AIの出力には、誤読、表記ゆれ、建物名の欠落、郵便番号や電話番号の混入、複数住所の取り違え、地名の誤推定が含まれる可能性があります。利用者は、実際の訪問・配送・移動の前に、読み取り結果、住所、建物名、部屋番号、時間指定、訪問条件を必ず確認してください。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">5. 外部サービス</h2>
        <p className="m-0 mt-2">
          当サービスは、認証・データ管理にSupabase、決済にStripe、AI処理にOpenAI、地図・ルート表示にGoogle Mapsなどの外部サービスを利用する場合があります。外部サービスの停止、仕様変更、利用制限、料金改定、検索結果の差異により、当サービスの機能が影響を受けることがあります。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">6. 料金、決済、利用枠</h2>
        <p className="m-0 mt-2">
          有料プランの料金、利用枠、超過条件、対象機能は料金ページに表示します。決済はStripeを通じて処理され、当サービスはクレジットカード番号を保持しません。サブスクリプションは、利用者が解約するまで契約期間ごとに自動更新されます。
        </p>
        <p className="m-0 mt-2">
          画像OCR、ファイルから抽出された住所数、AIによるルート最適化回数などは、プランごとの利用枠として集計される場合があります。通信障害、ブラウザの再読み込み、同一ファイルの再送信等により重複して処理された場合も、利用枠を消費することがあります。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">7. キャンセルと返金</h2>
        <p className="m-0 mt-2">
          サブスクリプションはアカウント画面または決済ポータルから解約できます。解約後も、すでに支払済みの期間中は対象機能を利用できる場合があります。法令上必要な場合を除き、日割り返金、未使用枠の返金、利用者都合による返金は行いません。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">8. 禁止事項</h2>
        <p className="m-0 mt-2">
          利用者は、不正アクセス、過度な自動リクエスト、スクレイピング、リバースエンジニアリング、第三者の権利侵害、法令違反、犯罪や危険行為の助長、虚偽情報の登録、他人の個人情報の不適切なアップロード、サービス運営を妨げる行為を行ってはなりません。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">9. アップロードデータの責任</h2>
        <p className="m-0 mt-2">
          利用者は、アップロードする画像、ファイル、住所、メモ、訪問条件について、必要な権利または正当な利用権限を有しているものとします。個人情報、機密情報、顧客情報を含むデータをアップロードする場合、業務上必要な範囲に限定し、社内規程や関係法令を遵守してください。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">10. 免責</h2>
        <p className="m-0 mt-2">
          当サービスは現状有姿で提供されます。当サービスは、AI出力の正確性、住所の実在性、地図検索結果、ルート、所要時間、交通状況、外部サービスの継続性、利用者の業務成果について保証しません。当サービスの利用または利用不能により生じた損害について、当サービスの責任は、法令で認められる範囲で、直近1か月に利用者が当サービスへ支払った金額を上限とします。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">11. サービスの変更・停止</h2>
        <p className="m-0 mt-2">
          当サービスは、機能追加、仕様変更、保守、障害対応、外部サービスの変更、法令対応のため、事前通知なくサービスの全部または一部を変更・停止することがあります。重要な変更については、サービス上の表示またはメール等により合理的な方法で通知します。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">12. 規約変更、準拠法、問い合わせ</h2>
        <p className="m-0 mt-2">
          当サービスは、必要に応じて本規約を変更できます。変更後に利用者が当サービスを利用した場合、変更後の規約に同意したものとみなします。本規約は日本法に準拠します。本規約に関する問い合わせは {contactEmail} までご連絡ください。
        </p>
      </section>
    </LegalLayout>
  );
}
