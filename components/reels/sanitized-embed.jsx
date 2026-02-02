"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

export function SanitizedEmbed({ html, className }) {
  const sanitizedHtml = useMemo(() => {
    if (typeof window === "undefined") return "";

    // Configure DOMPurify to only allow safe iframe embeds
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
      ALLOWED_URI_REGEXP: /^(?:(?:https?:)?\/\/(?:www\.)?(?:tiktok\.com|youtube\.com|instagram\.com|facebook\.com))/i,
    });
  }, [html]);

  if (!html) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      className={className}
    />
  );
}
