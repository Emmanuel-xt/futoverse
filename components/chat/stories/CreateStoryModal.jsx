"use client";

import { useState, useRef } from "react";
import { X, Upload, Type } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { useStories } from "hooks/useStories";
import Image from "next/image";
import { useSession } from "next-auth/react";

const CreateStoryModal = ({ open, onClose }) => {
  const [storyType, setStoryType] = useState("IMAGE"); // IMAGE, VIDEO, TEXT
  const [content, setContent] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const fileInputRef = useRef(null);
  const { createStory, isCreatingStory } = useStories();
  const { data: session } = useSession();

  const backgroundColors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080",
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result);
      };
      reader.readAsDataURL(file);

      if (file.type.startsWith("image/")) {
        setStoryType("IMAGE");
      } else if (file.type.startsWith("video/")) {
        setStoryType("VIDEO");
      }
    }
  };

  const handleCreateStory = async () => {
    if (storyType === "TEXT" && !content.trim()) return;
    if ((storyType === "IMAGE" || storyType === "VIDEO") && !selectedFile)
      return;

    const storyData = {
      type: storyType,
      content: storyType === "TEXT" ? content : preview, // In real app, upload file and get URL
      caption: caption.trim() || null,
      backgroundColor: storyType === "TEXT" ? backgroundColor : null,
      textColor: storyType === "TEXT" ? textColor : null,
      userId: Number(session?.user?.id),
    };

    try {
      createStory(storyData);
      // handleClose();
    } catch (error) {
      console.error("Failed to create story:", error);
    }
  };

  const handleClose = () => {
    setStoryType("IMAGE");
    setContent("");
    setCaption("");
    setSelectedFile(null);
    setPreview("");
    setBackgroundColor("#000000");
    setTextColor("#ffffff");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Story type selector */}
          <div className="flex space-x-2">
            <Button
              variant={storyType === "IMAGE" ? "default" : "outline"}
              size="sm"
              onClick={() => setStoryType("IMAGE")}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              variant={storyType === "TEXT" ? "default" : "outline"}
              size="sm"
              onClick={() => setStoryType("TEXT")}
              className="flex-1"
            >
              <Type className="w-4 h-4 mr-2" />
              Text
            </Button>
          </div>

          {/* Content based on type */}
          {storyType === "TEXT" ? (
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="resize-none"
              />

              {/* Background color picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex space-x-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                      onClick={() => setBackgroundColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Text color picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Color</label>
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>

              {/* Preview */}
              <div
                className="w-full h-32 rounded-lg flex items-center justify-center p-4"
                style={{ backgroundColor, color: textColor }}
              >
                <p className="text-center font-medium">
                  {content || "Your text will appear here"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to select a file</p>
                  <p className="text-sm text-gray-500">
                    {storyType === "IMAGE"
                      ? "Images only"
                      : "Images and videos"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      storyType === "IMAGE" ? "image/*" : "image/*,video/*"
                    }
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    {storyType === "IMAGE" ? (
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt="Preview"
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={preview}
                        className="w-full h-64 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Caption */}
          <Input
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateStory}
              disabled={
                isCreatingStory ||
                (storyType === "TEXT" && !content.trim()) ||
                ((storyType === "IMAGE" || storyType === "VIDEO") &&
                  !selectedFile)
              }
              className="text-white"
              style={{ backgroundColor: "#2D75FB" }}
            >
              {isCreatingStory ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Share Story
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryModal;
