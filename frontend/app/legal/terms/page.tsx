import { LegalLayout } from "../LegalLayout";

const serviceName = "Route Snap";
const contactEmail = "kaiseif4e@gmail.com";

const enSections = [
  { title: "1. Scope", body: ["These terms apply to all use of the web app, PWA, APIs, related pages, pricing plans, and support. Users must agree to these terms, the pricing page, privacy policy, and notices shown in the service before using it."] },
  { title: "2. Service", body: ["The service supports field work that handles addresses, including delivery, visits, inspections, sales visits, care visits, cleaning, maintenance, property rounds, and facility management. It extracts address-like information from images, photos, screenshots, TXT, CSV, TSV, JSON, and similar sources, then lets users review and edit the result before opening it in external map services such as Google Maps.", "The service does not guarantee that an address exists, that a map location is correct, arrival time, traffic conditions, visit feasibility, or business outcomes."] },
  { title: "3. Accounts and authentication", body: ["Paid plans, usage management, billing, account settings, and usage history require login. Users must provide accurate registration information and manage authentication information at their own responsibility. If unauthorized use is suspected, contact the service promptly."] },
  { title: "4. AI processing and required review", body: ["Address extraction, route suggestions, and visit order organization may use AI processing. AI results may include misread text, inconsistent notation, missing building names or room numbers, mixed postal codes or phone numbers, confused multiple addresses, or incorrect place-name assumptions. The service does not guarantee the accuracy of AI address extraction, route suggestions, or visit ordering.", "Before actual delivery, visits, or travel, users must check addresses, facility names, building names, room numbers, phone numbers, visit times, visit conditions, traffic conditions, and routes. To the extent permitted by law, the service is not liable for delay, misdelivery, missed visits, or business loss caused by misrecognition, insufficient checking, or differences in external map services."] },
  { title: "5. External services", body: ["The service may use external services including Supabase for authentication and data management, Stripe for payments, OpenAI for AI processing, and Google Maps for maps and route display. Outages, failures, specification changes, usage limits, pricing changes, or map and route differences in those services may affect the functions and availability of this service."] },
  { title: "6. Fees, payments, and usage limits", body: ["Paid plan fees, usage limits, overage conditions, and target features are shown on the pricing page. Payments are processed through Stripe, and the service does not store credit card numbers. Subscriptions renew automatically for each billing period until cancelled by the user.", "Address reading, bulk destination import, route sorting, and similar features may be counted against plan usage limits. Duplicate processing caused by network errors, browser reloads, or resubmitting the same file may also consume usage."] },
  { title: "7. Cancellation and refunds", body: ["Subscriptions can be cancelled from billing management on the account page or by contacting support. Access may remain available until the end of the paid period. Because this is a digital service, customer-requested refunds, prorated refunds, and refunds for unused usage are not provided except where legally required, for duplicate payments, or for serious service-caused failures."] },
  { title: "8. Prohibited acts", body: ["Users must not perform unauthorized access, excessive automated requests, scraping, reverse engineering, infringement of third-party rights, legal violations, support for criminal or dangerous acts, false registration, improper upload of another person's personal information, or acts that interfere with service operation."] },
  { title: "9. Responsibility for uploaded data", body: ["Users represent that they have the necessary rights or lawful permission to upload images, files, addresses, memos, and visit conditions. When uploading personal information, customer information, or confidential business information, users must limit it to what is necessary for work and comply with internal rules and applicable laws."] },
  { title: "10. Disclaimer", body: ["The service is provided as is. The service does not guarantee AI output accuracy, address existence, map search results, routes, travel time, traffic conditions, continuity of external services, or user business outcomes. To the extent permitted by law, liability for damages caused by use or inability to use the service is limited to the amount the user paid to the service in the most recent one month."] },
  { title: "11. Changes and suspension", body: ["The service may change or suspend all or part of the service without prior notice for feature additions, specification changes, maintenance, failure response, external service changes, or legal compliance. Important changes will be notified by reasonable means such as in-service notices or email."] },
  { title: "12. Changes to terms, governing law, and contact", body: [`The service may change these terms as needed. If a user continues using the service after changes, the user is deemed to have agreed to the revised terms. These terms are governed by the laws of Japan. For questions about these terms, contact ${contactEmail}.`] },
] as const;

export default function TermsPage() {
  return (
    <LegalLayout
      title="利用規約"
      lead={`${serviceName} の利用条件、住所読み取り、ルート作成、有料プラン、禁止事項、責任範囲を定めます。`}
      enTitle="Terms of Service"
      enLead={`These terms define the conditions for using ${serviceName}, including address reading, route creation, paid plans, prohibited acts, and liability.`}
      enSections={[...enSections]}
    >
      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">1. 適用</h2>
        <p className="m-0 mt-2">
          本規約は、当サービスのウェブアプリ、PWA、API、関連ページ、料金プラン、サポートを利用するすべての方に適用されます。利用者は、本規約、料金ページ、プライバシーポリシー、その他当サービス上で表示される注意事項に同意したうえで当サービスを利用するものとします。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">2. サービス内容</h2>
        <p className="m-0 mt-2">
          当サービスは、配送、訪問業務、点検、営業訪問、訪問介護、清掃、保守、不動産巡回、設備管理など、住所を扱う現場業務を補助するための業務支援ツールです。画像、写真、スクリーンショット、TXT、CSV、TSV、JSONなどから住所らしい情報を抽出し、利用者が確認・編集したうえでGoogle Maps等の外部地図サービスへ連携します。
        </p>
        <p className="m-0 mt-2">
          当サービスは、住所の存在、地図上の位置、到着時間、交通状況、訪問可否、業務成果を保証するものではありません。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">3. アカウントと認証</h2>
        <p className="m-0 mt-2">
          有料プラン、利用枠管理、決済、アカウント設定、利用履歴の確認にはログインが必要です。利用者は正確な登録情報を提供し、認証情報を自己の責任で管理するものとします。不正利用が疑われる場合は、速やかに当サービスへ連絡してください。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">4. AI処理と確認義務</h2>
        <p className="m-0 mt-2">
          住所抽出、ルート提案、訪問順整理にはAI処理を利用する場合があります。AI処理の結果には、誤読、表記ゆれ、建物名の欠落、部屋番号の欠落、郵便番号や電話番号の混入、複数住所の取り違え、地名の誤推定が含まれる可能性があります。当サービスは、AIによる住所抽出、ルート提案、訪問順整理の正確性を保証しません。
        </p>
        <p className="m-0 mt-2">
          利用者は、実際の配送、訪問、移動の前に、住所、施設名、建物名、部屋番号、電話番号、訪問時間、訪問条件、交通状況、ルートを必ず確認してください。誤認識、確認不足、外部地図サービスの表示差異により生じた遅延、誤配送、訪問ミス、業務上の損害について、当サービスは法令で認められる範囲で責任を負いません。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">5. 外部サービス</h2>
        <p className="m-0 mt-2">
          当サービスは、認証・データ管理にSupabase、決済にStripe、AI処理にOpenAI、地図・ルート表示にGoogle Mapsなどの外部サービスを利用する場合があります。外部サービスの停止、障害、仕様変更、利用制限、料金改定、検索結果やルート表示の差異により、当サービスの機能や提供内容が影響を受けることがあります。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">6. 料金、決済、利用枠</h2>
        <p className="m-0 mt-2">
          有料プランの料金、利用枠、超過条件、対象機能は料金ページに表示します。決済はStripeを通じて処理され、当サービスはクレジットカード番号を保持しません。サブスクリプションは、利用者が解約するまで契約期間ごとに自動更新されます。
        </p>
        <p className="m-0 mt-2">
          住所読み取り、訪問先一括登録、ルート整理などは、プランごとの利用枠として集計される場合があります。通信障害、ブラウザの再読み込み、同一ファイルの再送信等により重複して処理された場合も、利用枠を消費することがあります。
        </p>
      </section>

      <section>
        <h2 className="m-0 text-lg font-black text-neutral-950">7. キャンセルと返金</h2>
        <p className="m-0 mt-2">
          サブスクリプションはアカウント画面の支払い管理、または問い合わせにより解約できます。解約後も支払い済み期間の終了までは利用できる場合があります。デジタルサービスの性質上、法令上必要な場合、重複決済、当サービス起因の重大な障害がある場合を除き、お客様都合による返金、日割り返金、未使用枠の返金は行いません。
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
          利用者は、アップロードする画像、ファイル、住所、メモ、訪問条件について、必要な権利または正当な利用権限を有しているものとします。個人情報、顧客情報、業務上の機密情報を含むデータをアップロードする場合、業務上必要な範囲に限定し、社内規程や関係法令を遵守してください。
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
