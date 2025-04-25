import React, { useState, useEffect, useRef } from "react";
// import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { IoIosSend } from "react-icons/io";
import { createStoreStatus } from "@lib/actions/status.prisma";
import { Drawer, DrawerContent } from "@components/ui/drawer";

const AddTextStatusDrawer = ({ open, openChange, shopId }) => {
  const [text, setText] = useState(""); // Track text input
  const textareaRef = useRef(null); // Reference to the textarea element
  const maxLength = 400; // Maximum characters allowed
  const maxLines = 10; // Maximum number of lines before it stops growing
  const lineHeight = 32; // Approximate line height in px (adjust as needed)

  // Handle text input change
  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
    }
  };

  // Resize the textarea based on the content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to auto before recalculating
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = maxLines * lineHeight; // Calculate max height
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight
      )}px`; // Set height
    }
  }, [text]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      // console.log("Status cannot be empty!");
      return;
    }

    try {
      const form = { text, media: null }; // Adjust `media` if you need file input
      const postedStatus = await createStoreStatus(shopId, form);
      // console.log("Status posted successfully:", postedStatus);
      setText(""); // Clear the input after successful submission
      openChange(false); // Close the drawer
    } catch (error) {
      // console.error("Error posting status:", error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={openChange}>
      <DrawerContent className="flex flex-col items-center justify-center h-screen overflow-hidden p-1 bg-black text-slate-300">
        {/* Text Input */}
        <div className="h-[50%] w-full text-light-1">
          <textarea
            ref={textareaRef} // Reference the textarea
            value={text}
            onChange={handleTextChange} // Handle input changes
            className="w-full bg-transparent text-2xl resize-none overflow-hidden border-none outline-none"
            placeholder="What's on your mind?"
            maxLength={maxLength} // Maximum characters
          ></textarea>
          {/* Character count */}
          <div className="text-right text-sm text-light-2">
            {text.length}/{maxLength}
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex text-4xl absolute bottom-0 justify-end bg-[rgba(9,9,11,0.5)]">
          <button
            className="flex items-center justify-center rounded-full p-3 bg-primary-500 text-white"
            onClick={handleSubmit}
          >
            <IoIosSend />
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AddTextStatusDrawer;
