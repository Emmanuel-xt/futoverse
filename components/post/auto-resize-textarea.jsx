"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@components/ui/textarea";

export function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className = "",
}) {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    onChange(e);

    // Auto-resize the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    // Set initial height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`min-h-[40px] resize-none overflow-hidden ${className}`}
      rows={1}
    />
  );
}
