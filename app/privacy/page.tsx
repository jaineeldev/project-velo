import Link from "next/link";
import { cn, focusRing } from "@/lib/utils";

export const metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your personal information.",
};

const linkClass = "text-primary hover:underline";

const sections = [
  { id: "what-information-do-we-collect", title: "What information do we collect?" },
  { id: "how-do-we-process-your-information", title: "How do we process your information?" },
  {
    id: "when-and-with-whom-do-we-share-your-personal-information",
    title: "When and with whom do we share your personal information?",
  },
  { id: "how-do-we-handle-your-social-logins", title: "How do we handle your social logins?" },
  { id: "how-long-do-we-keep-your-information", title: "How long do we keep your information?" },
  { id: "how-do-we-keep-your-information-safe", title: "How do we keep your information safe?" },
  { id: "do-we-collect-information-from-minors", title: "Do we collect information from minors?" },
  { id: "what-are-your-privacy-rights", title: "What are your privacy rights?" },
  { id: "controls-for-do-not-track-features", title: "Controls for do-not-track features" },
  {
    id: "do-other-regions-have-specific-privacy-rights",
    title: "Do other regions have specific privacy rights?",
  },
  { id: "do-we-make-updates-to-this-notice", title: "Do we make updates to this notice?" },
  {
    id: "how-can-you-contact-us-about-this-notice",
    title: "How can you contact us about this notice?",
  },
  {
    id: "how-can-you-review-update-or-delete-the-data-we-collect-from-you",
    title: "How can you review, update, or delete the data we collect from you?",
  },
];

function BackToTop() {
  return (
    <p className="not-prose mt-4">
      <a href="#table-of-contents" className={cn(linkClass, "text-sm")}>
        ↑ Back to top
      </a>
    </p>
  );
}

function MailLink({ address }: { address: string }) {
  return (
    <a href={`mailto:${address}`} className={linkClass}>
      {address}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            aria-label="Velo home"
            className={cn("flex items-center gap-2.5 rounded", focusRing)}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Velo
            </span>
          </Link>
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-1 rounded text-sm text-muted-foreground transition-colors hover:text-foreground",
              focusRing,
            )}
          >
            ← Back
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <article className="prose prose-neutral max-w-none dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated May 17, 2026</p>

          <p>
            This Privacy Notice for Jaineel Khatri (doing business as <strong>Velo</strong>)
            (&apos;we&apos;, &apos;us&apos;, or &apos;our&apos;), describes how and why we might
            access, collect, store, use, and/or share (&apos;process&apos;) your personal
            information when you use our services (&apos;Services&apos;), including when you:
          </p>
          <ul>
            <li>Visit our website or any website of ours that links to this Privacy Notice</li>
            <li>
              Download and use our mobile application, or any other application of ours that links
              to this Privacy Notice
            </li>
            <li>Engage with us in other related ways, including any marketing or events</li>
          </ul>
          <p>
            <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you
            understand your privacy rights and choices. We are responsible for making decisions
            about how your personal information is processed. If you do not agree with our policies
            and practices, please do not use our Services. If you still have any questions or
            concerns, please contact us at <MailLink address="jaineelk.dev@gmail.com" />.
          </p>

          <h2>Summary of key points</h2>
          <p>
            <em>
              This summary provides key points from our Privacy Notice, but you can find out more
              details about any of these topics by clicking the link following each key point or by
              using our{" "}
              <a href="#table-of-contents" className={linkClass}>
                table of contents
              </a>{" "}
              below to find the section you are looking for.
            </em>
          </p>
          <p>
            <strong>What personal information do we process?</strong> When you visit, use, or
            navigate our Services, we may process personal information depending on how you
            interact with us and the Services, the choices you make, and the products and features
            you use.
          </p>
          <p>
            <strong>Do we process any sensitive personal information?</strong> Some of the
            information may be considered &apos;special&apos; or &apos;sensitive&apos; in certain
            jurisdictions, for example your racial or ethnic origins, sexual orientation, and
            religious beliefs. We do not process sensitive personal information.
          </p>
          <p>
            <strong>Do we collect any information from third parties?</strong> We do not collect
            any information from third parties.
          </p>
          <p>
            <strong>How do we process your information?</strong> We process your information to
            provide, improve, and administer our Services, communicate with you, for security and
            fraud prevention, and to comply with law. We may also process your information for
            other purposes with your consent. We process your information only when we have a valid
            legal reason to do so.
          </p>
          <p>
            <strong>In what situations and with which parties do we share personal information?</strong>{" "}
            We may share information in specific situations and with specific third parties.
          </p>
          <p>
            <strong>How do we keep your information safe?</strong> We have adequate organisational
            and technical processes and procedures in place to protect your personal information.
            However, no electronic transmission over the internet or information storage technology
            can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers,
            cybercriminals, or other unauthorised third parties will not be able to defeat our
            security and improperly collect, access, steal, or modify your information.
          </p>
          <p>
            <strong>What are your rights?</strong> Depending on where you are located
            geographically, the applicable privacy law may mean you have certain rights regarding
            your personal information.
          </p>
          <p>
            <strong>How do you exercise your rights?</strong> The easiest way to exercise your
            rights is by visiting{" "}
            <Link href="/dashboard/settings" className={linkClass}>
              /dashboard/settings
            </Link>
            , or by contacting us. We will consider and act upon any request in accordance with
            applicable data protection laws.
          </p>
          <p>
            Want to learn more about what we do with any information we collect?{" "}
            <a href="#table-of-contents" className={linkClass}>
              Review the Privacy Notice in full
            </a>
            .
          </p>

          <h2 id="table-of-contents">Table of contents</h2>
          <ol className="not-prose list-decimal space-y-2 pl-6 text-foreground">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={linkClass}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>

          <section id="what-information-do-we-collect">
            <h2>1. What information do we collect?</h2>
            <h3>Personal information you disclose to us</h3>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>We collect personal information that you provide to us.</em>
            </p>
            <p>
              We collect personal information that you voluntarily provide to us when you register
              on the Services, express an interest in obtaining information about us or our
              products and Services, when you participate in activities on the Services, or
              otherwise when you contact us.
            </p>
            <p>
              <strong>Personal Information Provided by You.</strong> The personal information that
              we collect depends on the context of your interactions with us and the Services, the
              choices you make, and the products and features you use. The personal information we
              collect may include the following:
            </p>
            <ul>
              <li>names</li>
              <li>phone numbers</li>
              <li>email addresses</li>
              <li>usernames</li>
              <li>ABN</li>
              <li>business name</li>
            </ul>
            <p>
              <strong>Sensitive Information.</strong> We do not process sensitive information.
            </p>
            <p>
              <strong>Social Media Login Data.</strong> We may provide you with the option to
              register with us using your existing social media account details, like your
              Facebook, X, or other social media account. If you choose to register in this way, we
              will collect certain profile information about you from the social media provider, as
              described in the section called{" "}
              <a href="#how-do-we-handle-your-social-logins" className={linkClass}>
                &apos;How do we handle your social logins?&apos;
              </a>{" "}
              below.
            </p>
            <p>
              All personal information that you provide to us must be true, complete, and accurate,
              and you must notify us of any changes to such personal information.
            </p>
            <BackToTop />
          </section>

          <section id="how-do-we-process-your-information">
            <h2>2. How do we process your information?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>
                We process your information to provide, improve, and administer our Services,
                communicate with you, for security and fraud prevention, and to comply with law. We
                may also process your information for other purposes with your consent.
              </em>
            </p>
            <p>
              <strong>
                We process your personal information for a variety of reasons, depending on how you
                interact with our Services, including:
              </strong>
            </p>
            <ul>
              <li>
                <strong>
                  To facilitate account creation and authentication and otherwise manage user
                  accounts.
                </strong>{" "}
                We may process your information so you can create and log in to your account, as
                well as keep your account in working order.
              </li>
              <li>
                <strong>To deliver and facilitate delivery of services to the user.</strong> We may
                process your information to provide you with the requested service.
              </li>
              <li>
                <strong>To respond to user inquiries/offer support to users.</strong> We may
                process your information to respond to your inquiries and solve any potential
                issues you might have with the requested service.
              </li>
              <li>
                <strong>To send administrative information to you.</strong> We may process your
                information to send you details about our products and services, changes to our
                terms and policies, and other similar information.
              </li>
              <li>
                <strong>To request feedback.</strong> We may process your information when
                necessary to request feedback and to contact you about your use of our Services.
              </li>
              <li>
                <strong>To protect our Services.</strong> We may process your information as part
                of our efforts to keep our Services safe and secure, including fraud monitoring and
                prevention.
              </li>
              <li>
                <strong>
                  To evaluate and improve our Services, products, marketing, and your experience.
                </strong>{" "}
                We may process your information when we believe it is necessary to identify usage
                trends, determine the effectiveness of our promotional campaigns, and to evaluate
                and improve our Services, products, marketing, and your experience.
              </li>
              <li>
                <strong>To comply with our legal obligations.</strong> We may process your
                information to comply with our legal obligations, respond to legal requests, and
                exercise, establish, or defend our legal rights.
              </li>
            </ul>
            <BackToTop />
          </section>

          <section id="when-and-with-whom-do-we-share-your-personal-information">
            <h2>3. When and with whom do we share your personal information?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>
                We may share information in specific situations described in this section and/or
                with the following third parties.
              </em>
            </p>
            <p>
              <strong>Vendors, Consultants, and Other Third-Party Service Providers.</strong> We
              may share your data with third-party vendors, service providers, contractors, or
              agents (&apos;third parties&apos;) who perform services for us or on our behalf and
              require access to such information to do that work.
            </p>
            <p>The third parties we may share personal information with are as follows:</p>
            <ul>
              <li>
                <strong>Allow users to connect to their third-party accounts:</strong> GitHub
                account
              </li>
              <li>
                <strong>Communicate and chat with users:</strong> Resend
              </li>
              <li>
                <strong>Functionality and infrastructure optimisation:</strong> Neon (PostgreSQL
                database)
              </li>
              <li>
                <strong>User account registration and authentication:</strong> GitHub OAuth and
                Clerk
              </li>
              <li>
                <strong>Website hosting:</strong> Vercel
              </li>
            </ul>
            <p>We also may need to share your personal information in the following situations:</p>
            <ul>
              <li>
                <strong>Business Transfers.</strong> We may share or transfer your information in
                connection with, or during negotiations of, any merger, sale of company assets,
                financing, or acquisition of all or a portion of our business to another company.
              </li>
            </ul>
            <BackToTop />
          </section>

          <section id="how-do-we-handle-your-social-logins">
            <h2>4. How do we handle your social logins?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>
                If you choose to register or log in to our Services using a social media account,
                we may have access to certain information about you.
              </em>
            </p>
            <p>
              Our Services offer you the ability to register and log in using your third-party
              social media account details (like your Facebook or X logins). Where you choose to do
              this, we will receive certain profile information about you from your social media
              provider. The profile information we receive may vary depending on the social media
              provider concerned, but will often include your name, email address, friends list,
              and profile picture, as well as other information you choose to make public on such a
              social media platform.
            </p>
            <p>
              We will use the information we receive only for the purposes that are described in
              this Privacy Notice or that are otherwise made clear to you on the relevant Services.
              Please note that we do not control, and are not responsible for, other uses of your
              personal information by your third-party social media provider. We recommend that you
              review their privacy notice to understand how they collect, use, and share your
              personal information, and how you can set your privacy preferences on their sites and
              apps.
            </p>
            <BackToTop />
          </section>

          <section id="how-long-do-we-keep-your-information">
            <h2>5. How long do we keep your information?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>
                We keep your information for as long as necessary to fulfil the purposes outlined
                in this Privacy Notice unless otherwise required by law.
              </em>
            </p>
            <p>
              We will only keep your personal information for as long as it is necessary for the
              purposes set out in this Privacy Notice, unless a longer retention period is required
              or permitted by law (such as tax, accounting, or other legal requirements). No
              purpose in this notice will require us keeping your personal information for longer
              than the period of time in which users have an account with us.
            </p>
            <p>
              When we have no ongoing legitimate business need to process your personal
              information, we will either delete or anonymise such information, or, if this is not
              possible (for example, because your personal information has been stored in backup
              archives), then we will securely store your personal information and isolate it from
              any further processing until deletion is possible.
            </p>
            <BackToTop />
          </section>

          <section id="how-do-we-keep-your-information-safe">
            <h2>6. How do we keep your information safe?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>
                We aim to protect your personal information through a system of organisational and
                technical security measures.
              </em>
            </p>
            <p>
              We have implemented appropriate and reasonable technical and organisational security
              measures designed to protect the security of any personal information we process.
              However, despite our safeguards and efforts to secure your information, no electronic
              transmission over the Internet or information storage technology can be guaranteed to
              be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or
              other unauthorised third parties will not be able to defeat our security and
              improperly collect, access, steal, or modify your information. Although we will do
              our best to protect your personal information, transmission of personal information
              to and from our Services is at your own risk. You should only access the Services
              within a secure environment.
            </p>
            <BackToTop />
          </section>

          <section id="do-we-collect-information-from-minors">
            <h2>7. Do we collect information from minors?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>
                We do not knowingly collect data from or market to children under 18 years of age.
              </em>
            </p>
            <p>
              We do not knowingly collect, solicit data from, or market to children under 18 years
              of age, nor do we knowingly sell such personal information. By using the Services,
              you represent that you are at least 18 or that you are the parent or guardian of such
              a minor and consent to such minor dependent&apos;s use of the Services. If we learn
              that personal information from users less than 18 years of age has been collected, we
              will deactivate the account and take reasonable measures to promptly delete such data
              from our records. If you become aware of any data we may have collected from children
              under age 18, please contact us at <MailLink address="jaineelk.dev@gmail.com" />.
            </p>
            <BackToTop />
          </section>

          <section id="what-are-your-privacy-rights">
            <h2>8. What are your privacy rights?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>
                You may review, change, or terminate your account at any time, depending on your
                country, province, or state of residence.
              </em>
            </p>
            <p>
              <strong>
                <u>Withdrawing your consent:</u>
              </strong>{" "}
              If we are relying on your consent to process your personal information, which may be
              express and/or implied consent depending on the applicable law, you have the right to
              withdraw your consent at any time. You can withdraw your consent at any time by
              contacting us by using the contact details provided in the section{" "}
              <a href="#how-can-you-contact-us-about-this-notice" className={linkClass}>
                &apos;How can you contact us about this notice?&apos;
              </a>{" "}
              below.
            </p>
            <p>
              However, please note that this will not affect the lawfulness of the processing
              before its withdrawal nor, when applicable law allows, will it affect the processing
              of your personal information conducted in reliance on lawful processing grounds other
              than consent.
            </p>
            <h3>Account information</h3>
            <p>
              If you would at any time like to review or change the information in your account or
              terminate your account, you can:
            </p>
            <ul>
              <li>Log in to your account settings and update your user account.</li>
              <li>Uses GitHub to login.</li>
            </ul>
            <p>
              Upon your request to terminate your account, we will deactivate or delete your
              account and information from our active databases. However, we may retain some
              information in our files to prevent fraud, troubleshoot problems, assist with any
              investigations, enforce our legal terms and/or comply with applicable legal
              requirements.
            </p>
            <p>
              If you have questions or comments about your privacy rights, you may email us at{" "}
              <MailLink address="jaineelk.dev@gmail.com" />.
            </p>
            <BackToTop />
          </section>

          <section id="controls-for-do-not-track-features">
            <h2>9. Controls for do-not-track features</h2>
            <p>
              Most web browsers and some mobile operating systems and mobile applications include a
              Do-Not-Track (&apos;DNT&apos;) feature or setting you can activate to signal your
              privacy preference not to have data about your online browsing activities monitored
              and collected. At this stage, no uniform technology standard for recognising and
              implementing DNT signals has been finalised. As such, we do not currently respond to
              DNT browser signals or any other mechanism that automatically communicates your
              choice not to be tracked online. If a standard for online tracking is adopted that we
              must follow in the future, we will inform you about that practice in a revised
              version of this Privacy Notice.
            </p>
            <BackToTop />
          </section>

          <section id="do-other-regions-have-specific-privacy-rights">
            <h2>10. Do other regions have specific privacy rights?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>You may have additional rights based on the country you reside in.</em>
            </p>
            <h3>Australia</h3>
            <p>
              We collect and process your personal information under the obligations and conditions
              set by Australia&apos;s Privacy Act 1988 (Privacy Act).
            </p>
            <p>
              This Privacy Notice satisfies the notice requirements defined in the Privacy Act, in
              particular: what personal information we collect from you, from which sources, for
              which purposes, and other recipients of your personal information.
            </p>
            <p>
              If you do not wish to provide the personal information necessary to fulfil their
              applicable purpose, it may affect our ability to provide our services, in particular:
            </p>
            <ul>
              <li>offer you the products or services that you want</li>
              <li>respond to or help with your requests</li>
              <li>manage your account with us</li>
              <li>confirm your identity and protect your account</li>
            </ul>
            <p>
              At any time, you have the right to request access to or correction of your personal
              information. You can make such a request by contacting us by using the contact
              details provided in the section{" "}
              <a
                href="#how-can-you-review-update-or-delete-the-data-we-collect-from-you"
                className={linkClass}
              >
                &apos;How can you review, update, or delete the data we collect from you?&apos;
              </a>
            </p>
            <p>
              If you believe we are unlawfully processing your personal information, you have the
              right to submit a complaint about a breach of the Australian Privacy Principles to
              the{" "}
              <a
                href="https://www.oaic.gov.au/privacy/privacy-complaints/lodge-a-privacy-complaint-with-us"
                rel="noopener noreferrer"
                target="_blank"
                className={linkClass}
              >
                Office of the Australian Information Commissioner
              </a>
              .
            </p>
            <BackToTop />
          </section>

          <section id="do-we-make-updates-to-this-notice">
            <h2>11. Do we make updates to this notice?</h2>
            <p>
              <strong>
                <em>In short:</em>
              </strong>{" "}
              <em>Yes, we will update this notice as necessary to stay compliant with relevant laws.</em>
            </p>
            <p>
              We may update this Privacy Notice from time to time. The updated version will be
              indicated by an updated &apos;Revised&apos; date at the top of this Privacy Notice.
              If we make material changes to this Privacy Notice, we may notify you either by
              prominently posting a notice of such changes or by directly sending you a
              notification. We encourage you to review this Privacy Notice frequently to be
              informed of how we are protecting your information.
            </p>
            <BackToTop />
          </section>

          <section id="how-can-you-contact-us-about-this-notice">
            <h2>12. How can you contact us about this notice?</h2>
            <p>
              If you have questions or comments about this notice, you may email us at{" "}
              <MailLink address="jaineelk.dev@gmail.com" /> or contact us by post at:
            </p>
            <address className="not-italic">
              Jaineel Khatri
              <br />
              Brisbane, Queensland
              <br />
              Australia
            </address>
            <BackToTop />
          </section>

          <section id="how-can-you-review-update-or-delete-the-data-we-collect-from-you">
            <h2>13. How can you review, update, or delete the data we collect from you?</h2>
            <p>
              Based on the applicable laws of your country, you may have the right to request
              access to the personal information we collect from you, details about how we have
              processed it, correct inaccuracies, or delete your personal information. You may also
              have the right to withdraw your consent to our processing of your personal
              information. These rights may be limited in some circumstances by applicable law. To
              request to review, update, or delete your personal information, please visit:{" "}
              <Link href="/dashboard/settings" className={linkClass}>
                /dashboard/settings
              </Link>
              .
            </p>
            <BackToTop />
          </section>
        </article>
      </div>
    </main>
  );
}
