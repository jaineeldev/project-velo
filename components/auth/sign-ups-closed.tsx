import Link from "next/link";
import { REPO_URL } from "@/lib/site";
import { authCardCls, authPrimaryButtonCls, authSecondaryButtonCls } from "./shared";
import { AuthHeader } from "./chrome";

// Shown in place of the sign-up form while SIGNUPS_OPEN is false.
export function SignUpsClosed() {
  return (
    <div className={authCardCls}>
      <AuthHeader
        eyebrow="Concept project"
        title="Sign-ups are closed"
        description="Velo is a concept project, so it isn't taking new accounts. You can still look around the site or read the code."
      />
      <div className="space-y-3">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={authPrimaryButtonCls}
        >
          View the code
        </a>
        <Link href="/" className={authSecondaryButtonCls}>
          Back to Velo
        </Link>
      </div>
    </div>
  );
}
