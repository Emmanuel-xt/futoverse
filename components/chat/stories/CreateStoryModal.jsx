"use client";

import { useState, useRef } from "react";
import { Upload, Type, Camera, Video, Mic } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Drawer, DrawerContent } from "@components/ui/drawer";
import { useStories } from "hooks/useStories";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const CreateStoryDrawer = ({ open, onClose }) => {
  const [storyType, setStoryType] = useState("TEXT");
  const [content, setContent] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#4FC3F7");
  const [textColor, setTextColor] = useState("#ffffff");
  const fileInputRef = useRef(null);
  const { createStory, isCreatingStory } = useStories();
  const { data: session } = useSession();

  const [isUploading, setIsUploading] = useState(false);

  const backgroundColors = [
    "#4FC3F7", // Light blue (default)
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#673AB7", // Deep purple
    "#3F51B5", // Indigo
    "#2196F3", // Blue
    "#00BCD4", // Cyan
    "#009688", // Teal
    "#4CAF50", // Green
    "#8BC34A", // Light green
    "#CDDC39", // Lime
    "#FFEB3B", // Yellow
    "#FF9800", // Orange
    "#FF5722", // Deep orange
    "#795548", // Brown
    "#607D8B", // Blue grey
    "#000000", // Black
    "#FFFFFF", // White
  ];

  const textColors = [
    "#FFFFFF", // White
    "#000000", // Black
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
  ];

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result);
    reader.readAsDataURL(file);

    if (file.type.startsWith("image/")) setStoryType("IMAGE");
    else if (file.type.startsWith("video/")) setStoryType("VIDEO");
  };

  const handleCreateStory = async () => {
    if (
      (storyType === "TEXT" && !content.trim()) ||
      ((storyType === "IMAGE" || storyType === "VIDEO") && !selectedFile)
    ) {
      toast.error("Please complete your story before sharing.");
      return;
    }

    try {
      let contentUrl = content;
      setIsUploading(true);

      if (storyType !== "TEXT" && selectedFile) {
        toast.loading("Uploading media...");

        const base64 = await convertToBase64(selectedFile);

        const response = await fetch("/api/cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await response.json();

        if (!response.ok || !data.url) {
          throw new Error("Failed to upload media");
        }

        contentUrl = data.url;
        toast.dismiss();
      }

      const storyData = {
        type: storyType,
        content: contentUrl,
        caption: caption.trim() || null,
        backgroundColor: storyType === "TEXT" ? backgroundColor : null,
        textColor: storyType === "TEXT" ? textColor : null,
        userId: Number(session?.user?.id),
      };

      await createStory(storyData);
      toast.success("Story shared!");
      handleClose();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to create story");
    } finally {
      setIsUploading(false); // 🔸 End uploading
    }
  };

  const handleClose = () => {
    setStoryType("TEXT");
    setContent("");
    setCaption("");
    setSelectedFile(null);
    setPreview("");
    setBackgroundColor("#4FC3F7");
    setTextColor("#ffffff");
    onClose();
  };

  const renderStoryPreview = () => {
    if (storyType === "TEXT") {
      return (
        <div
          className="absolute inset-0 flex items-center justify-center p-8"
          style={{ backgroundColor }}
        >
          <Textarea
            placeholder="Type status"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent border-none text-center text-2xl font-medium resize-none placeholder:text-opacity-70 focus:outline-none focus:ring-0 w-full max-w-md"
            style={{ color: textColor, placeholderColor: `${textColor}70` }}
            rows={4}
          />
        </div>
      );
    }

    if (storyType === "IMAGE" && preview) {
      return (
        <div className="absolute inset-0">
          <Image
            src={preview || "/placeholder.svg"}
            alt="Preview"
            fill
            className="object-cover"
          />
          {caption && (
            <div className="absolute bottom-20 left-0 right-0 p-4">
              <Input
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-black/30 border-none text-white placeholder:text-white/70 text-center"
              />
            </div>
          )}
        </div>
      );
    }

    if (storyType === "VIDEO" && preview) {
      return (
        <div className="absolute inset-0">
          <video
            src={preview}
            className="w-full h-full object-cover"
            controls={false}
            autoPlay
            muted
            loop
          />
          {caption && (
            <div className="absolute bottom-20 left-0 right-0 p-4">
              <Input
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-black/30 border-none text-white placeholder:text-white/70 text-center"
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div className="text-center text-white/70">
          <Upload className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">Select media to get started</p>
        </div>
      </div>
    );
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="h-screen max-h-screen p-0 rounded-none">
        <div className="relative h-full overflow-hidden">
          {/* Story Preview Background */}
          {renderStoryPreview()}

          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
            <Button
              onClick={handleClose}
              className="bg-white/20 backdrop-blur-sm text-white border-none hover:bg-white/30 rounded-full px-6"
              variant="ghost"
            >
              Done
            </Button>

            {storyType === "TEXT" && (
              <Button
                size="icon"
                className="bg-white/20 backdrop-blur-sm text-white border-none hover:bg-white/30 rounded-full"
                variant="ghost"
              >
                <Type className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Text Color Picker (only for text stories) */}
          {storyType === "TEXT" && (
            <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
              {textColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    textColor === color
                      ? "border-white shadow-lg scale-110"
                      : "border-white/50"
                  } transition-all`}
                  style={{ backgroundColor: color }}
                  onClick={() => setTextColor(color)}
                />
              ))}
            </div>
          )}

          {/* Background Color Picker */}
          <div className="absolute bottom-20 left-0 right-0 z-10 px-4">
            <div className="flex justify-center gap-3 mb-4">
              {backgroundColors.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    backgroundColor === color
                      ? "border-white shadow-lg scale-110"
                      : "border-white/50"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBackgroundColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center justify-around py-4">
              {/* <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 text-white hover:bg-white/10 ${
                  storyType === "VIDEO" ? "text-blue-400" : ""
                }`}
                onClick={() => {
                  setStoryType("VIDEO");
                  fileInputRef.current?.click();
                }}
              >
                <Video className="w-6 h-6" />
                <span className="text-xs">Video</span>
              </Button> */}

              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 text-white hover:bg-white/10 ${
                  storyType === "IMAGE" ? "text-blue-400" : ""
                }`}
                onClick={() => {
                  setStoryType("IMAGE");
                  fileInputRef.current?.click();
                }}
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs">Photo</span>
              </Button>

              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 text-white hover:bg-white/10 ${
                  storyType === "TEXT" ? "text-blue-400" : ""
                }`}
                onClick={() => setStoryType("TEXT")}
              >
                <Type className="w-6 h-6" />
                <span className="text-xs">Text</span>
              </Button>

              {/* <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 text-white hover:bg-white/10"
                disabled
              >
                <Mic className="w-6 h-6" />
                <span className="text-xs">Voice</span>
              </Button> */}
            </div>
          </div>

          {/* Caption Input for Media */}
          {(storyType === "IMAGE" || storyType === "VIDEO") && selectedFile && (
            <div className="absolute bottom-32 left-4 right-4 z-10">
              <Input
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-black border-white/30 text-white placeholder:text-white/70 text-center rounded-full"
              />
            </div>
          )}

          {/* Share Button */}
          {((storyType === "TEXT" && content.trim()) ||
            ((storyType === "IMAGE" || storyType === "VIDEO") &&
              selectedFile)) && (
            <div className="absolute bottom-32 right-4 z-10">
              <Button
                onClick={handleCreateStory}
                disabled={isCreatingStory || isUploading}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 p-0"
              >
                {isCreatingStory ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </Button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateStoryDrawer;
