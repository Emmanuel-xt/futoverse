"use client";

import { useState, useRef } from "react";
import {
  X,
  ImageIcon,
  Mic,
  Edit2,
  Trash2,
  Globe,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { useCreatePost } from "hooks/use-post-mutation";
import { toast } from "sonner";

export function CreatePostDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userPicture,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const createPostMutation = useCreatePost();

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      let type = "DOCUMENT";

      if (file.type.startsWith("image/")) type = "IMAGE";
      else if (file.type.startsWith("video/")) type = "VIDEO";
      else if (file.type.startsWith("audio/")) type = "AUDIO";

      const newMedia = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        type,
        file,
      };

      setMedia((prev) => [...prev, newMedia]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (id) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please write something before posting");
      return;
    }

    try {
      setLoading(true);

      const uploadedMedia = [];

      for (const item of media) {
        if (!item.file) continue;

        const base64 = await convertToBase64(item.file);

        const response = await fetch("/api/cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await response.json();
        if (!response.ok || !data.url) {
          throw new Error("Media upload failed");
        }

        uploadedMedia.push({
          url: data.url,
          type: item.type,
        });
      }

      await createPostMutation.mutateAsync({
        title: title.trim() || undefined,
        content: content.trim(),
        media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
        creatorId: userId,
      });

      // Reset form
      setTitle("");
      setContent("");
      setMedia([]);
      onOpenChange(false);
      toast.success(
        "Post created successfully! It will be visible after approval."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleClose = () => {
    // Clean up blob URLs
    media.forEach((item) => {
      if (item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    });
    setTitle("");
    setContent("");
    setMedia([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle>Create post</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userPicture || undefined} />
              <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{userName || "User"}</p>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>Public</span>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <Input
            placeholder="Post title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 text-lg font-semibold placeholder:text-muted-foreground focus-visible:ring-0"
          />

          {/* Content Input */}
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] border-0 text-lg placeholder:text-muted-foreground resize-none focus-visible:ring-0"
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {media.map((item) => (
                <div key={item.id} className="relative group">
                  {item.type === "IMAGE" && (
                    <img
                      src={item.url || "/placeholder.svg"}
                      alt="Upload preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  {item.type === "VIDEO" && (
                    <video
                      src={item.url}
                      className="w-full h-32 object-cover rounded-lg"
                      controls={false}
                    />
                  )}
                  {(item.type === "AUDIO" || item.type === "DOCUMENT") && (
                    <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                      {item.type === "AUDIO" ? (
                        <Mic className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => removeMedia(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Media Options */}
          <div className="border rounded-lg p-3">
            <p className="text-sm font-medium mb-3">Add to your post</p>
            <div className="flex items-center justify-between">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-green-600 hover:bg-green-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Photos/videos</span>
              </Button>

              {/* <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50"
                disabled
              >
                <span>👥</span>
                <span>Tag people</span>
              </Button> */}

              {/* <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
                disabled
              >
                <span>📍</span>
                <span>Location</span>
              </Button> */}

              {/* <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-yellow-600 hover:bg-yellow-50"
                disabled
              >
                <span>😊</span>
                <span>Feeling</span>
              </Button> */}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || createPostMutation.isPending}
            className="w-full"
            size="lg"
          >
            {createPostMutation.isPending ? "Posting..." : "POST"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
