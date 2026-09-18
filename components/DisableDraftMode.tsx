"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useIsPresentationTool } from "next-sanity/hooks";

/**
 * Banner shown when draft mode is on outside the Studio (e.g. after opening a
 * preview link in its own tab). Inside the Presentation tool the Studio's own
 * perspective switcher is in charge, so the banner hides itself there.
 */
export function DisableDraftMode() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const inPresentation = useIsPresentationTool();

  if (inPresentation !== false) return null;

  return (
    <div className="draft-banner" role="status">
      <span>Draft mode — you are seeing unpublished changes</span>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await fetch("/api/draft-mode/disable");
            router.refresh();
          })
        }
      >
        {pending ? "Exiting…" : "Exit draft mode"}
      </button>
    </div>
  );
}
