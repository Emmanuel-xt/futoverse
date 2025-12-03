"use client";
import { useState, useCallback } from "react";
// import { resolveEmbed, submitEmbed } from "@lib/actions/embed";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Loader2, Link2, Check, X, Play } from "lucide-react";
import { cn } from "@lib/utils";
import { resolveEmbed, submitEmbed } from "@lib/actions/reel-embed";

const platformConfig = {
  TIKTOK: { label: "TikTok", bg: "bg-black", icon: "🎵" },
  INSTAGRAM: {
    label: "Instagram",
    bg: "bg-gradient-to-r from-purple-500 to-pink-500",
    icon: "📸",
  },
  YOUTUBE: { label: "YouTube", bg: "bg-red-600", icon: "▶️" },
};

export function EmbedSubmitForm({ postedById, onSuccess }) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePaste = useCallback(async (pastedUrl) => {
    if (!pastedUrl.trim()) return;

    setIsResolving(true);
    setError(null);
    setPreview(null);

    const result = await resolveEmbed(pastedUrl);

    if (result.success) {
      setPreview(result.data);
    } else {
      setError(result.error);
    }

    setIsResolving(false);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    setSuccess(false);

    // Auto-resolve on paste (when value changes significantly)
    if (
      value.length > 10 &&
      (value.includes("tiktok") ||
        value.includes("instagram") ||
        value.includes("youtube") ||
        value.includes("youtu.be"))
    ) {
      handlePaste(value);
    }
  };

  const handleManualResolve = () => {
    if (url.trim()) {
      handlePaste(url);
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;

    setIsSubmitting(true);
    setError(null);

    const result = await submitEmbed({
      ...preview,
      postedById,
    });

    if (result.success) {
      setSuccess(true);
      setUrl("");
      setPreview(null);
      onSuccess?.();
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  const handleClear = () => {
    setUrl("");
    setPreview(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={url}
            onChange={handleInputChange}
            placeholder="Paste TikTok, Instagram, or YouTube link..."
            className="pl-10 pr-10"
            disabled={isResolving || isSubmitting}
          />
          {url && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleManualResolve}
          disabled={!url.trim() || isResolving}
          variant="secondary"
          size="icon"
        >
          {isResolving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Success Message */}
      {success && (
        <p className="text-sm text-green-600">Reel saved successfully!</p>
      )}

      {/* Preview Card */}
      {preview && (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="relative w-24 h-32 rounded-lg overflow-hidden bg-muted shrink-0">
                {preview.thumbnailUrl ? (
                  <img
                    src={preview.thumbnailUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {/* Platform badge */}
                <div
                  className={cn(
                    "absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white",
                    platformConfig[preview.platform].bg
                  )}
                >
                  {platformConfig[preview.platform].icon}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {platformConfig[preview.platform].label}
                </Badge>

                {preview.caption && (
                  <p className="text-sm line-clamp-2">{preview.caption}</p>
                )}

                {preview.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {preview.hashtags.slice(0, 5).map((tag) => (
                      <span key={tag} className="text-xs text-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground truncate">
                  {preview.originalUrl}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Reel"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Raw oEmbed Debug (optional - remove in production) */}
      {preview?.rawOEmbed && process.env.NODE_ENV === "development" && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            Raw oEmbed
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-h-32">
            {JSON.stringify(preview.rawOEmbed, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
