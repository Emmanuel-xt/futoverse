"use client";

import { useState, useRef } from "react";
import { X, Upload, Type } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { useStories } from "hooks/useStories";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const CreateStoryDrawer = ({ open, onClose }) => {
  const [storyType, setStoryType] = useState("IMAGE");
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
    )
      return;

    const storyData = {
      type: storyType,
      content: storyType === "TEXT" ? content : preview,
      caption: caption.trim() || null,
      backgroundColor: storyType === "TEXT" ? backgroundColor : null,
      textColor: storyType === "TEXT" ? textColor : null,
      userId: Number(session?.user?.id),
    };

    try {
      await createStory(storyData);
      toast.success("Story shared!");
      handleClose();
    } catch (err) {
      toast.error("Failed to create story");
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
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-w-lg mx-auto p-4 space-y-6">
        <DrawerHeader className="flex items-center justify-between mb-2">
          <DrawerTitle className="text-lg font-semibold">
            Create Story
          </DrawerTitle>
          <DrawerClose asChild>
            <Button size="icon" variant="ghost">
              <X className="w-5 h-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex space-x-2">
          <Button
            variant={storyType === "IMAGE" ? "default" : "outline"}
            onClick={() => setStoryType("IMAGE")}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Photo
          </Button>
          <Button
            variant={storyType === "TEXT" ? "default" : "outline"}
            onClick={() => setStoryType("TEXT")}
            className="flex-1"
          >
            <Type className="w-4 h-4 mr-2" />
            Text
          </Button>
        </div>

        {storyType === "TEXT" ? (
          <>
            <Textarea
              rows={4}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none"
            />
            <div>
              <label className="text-sm mb-1 block">Background Color</label>
              <div className="flex flex-wrap gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-full border-2 ${
                      backgroundColor === color
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackgroundColor(color)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm mb-1 block">Text Color</label>
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div
              className="w-full h-32 rounded-md flex items-center justify-center text-center font-semibold text-lg"
              style={{ backgroundColor, color: textColor }}
            >
              {content || "Your text will appear here"}
            </div>
          </>
        ) : (
          <>
            {!selectedFile ? (
              <div
                className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to select image or video
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                {storyType === "IMAGE" ? (
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    width={500}
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
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-black/50 text-white"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        <Input
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div className="flex justify-end gap-2">
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
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isCreatingStory && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            )}
            Share Story
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateStoryDrawer;
