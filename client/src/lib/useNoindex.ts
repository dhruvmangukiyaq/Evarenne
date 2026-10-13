import { useEffect } from "react";

/**
 * Keeps the admin panel out of search indexes.
 *
 * The routes are already unlinked from the public site, but a noindex tag is
 * the belt to that suspenders: it is added while an admin page is mounted and
 * removed again on unmount, so public pages are never affected.
 */
export function useNoindex(title?: string): void {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    const previousTitle = document.title;
    if (title) document.title = title;

    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, [title]);
}
