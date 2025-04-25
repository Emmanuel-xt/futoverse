"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IoIosSend } from "react-icons/io";
import { createStoreStatus } from "@lib/actions/status.prisma";
import { AiFillPicture } from "react-icons/ai";
import { Drawer, DrawerContent } from "@components/ui/drawer";

const AddMediaStatusDrawer = ({ open, openChange, shopId }) => {
  const [media, setMedia] = useState(null); // Track media input
  const [text, setText] = useState(""); // Track text input
  const [error, setError] = useState(""); // Track file validation errors
  const maxLength = 400; // Maximum characters allowed
  const [openMediaStatusModal, setOpenMediaStatusModal] = useState(false);

  // Handle text input change
  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
    }
  };

  // Handle file input change
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    // Validate file
    if (file && file.type.startsWith("image/")) {
      try {
        const base = await convertToBase64(file);

        setMedia(base);
        setOpenMediaStatusModal(true); // Open the drawer only after a valid file is selected
      } catch (error) {
        // console.error("Error converting file to base64:", error);
      }
    } else {
      setError("Please select a valid image file");
    }
  };

  // Utility function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle status submission
  const handleSubmit = async () => {
    if (!text.trim() && !media) {
      alert("Status must include text or media!");
      return;
    }

    try {
      const response = await fetch("/api/cloudinary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: media }),
      });
      const data = await response.json();
      // console.log(" cloud data = ", data);
      if (data) {
        // console.log('data from cloud' , data)
        const form = { text, media: data.url };
        const postedStatus = await createStoreStatus(shopId, form);
        // console.log("Status posted successfully:", postedStatus);

        // Clear inputs and close the drawer
        setText("");
        setMedia(null);
        setOpenMediaStatusModal(false);
      }
    } catch (error) {
      // console.error("Error posting status:", error);
    }
  };

  return (
    <>
      {/* File Input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="status-media"
      />
      <Drawer
        open={openMediaStatusModal}
        onOpenChange={setOpenMediaStatusModal}
      >
        <DrawerContent className="h-screen overflow-hidden p-1 bg-black text-slate-300">
          {/* Media Preview */}
          {media && (
            <div className="relative w-full h-[60%] my-3 border">
              <Image
                src={media}
                alt="status-media"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Caption Input */}
          <div className="absolute bottom-0 my-1 w-full">
            <div className="flex items-center bg-dark-1 rounded-full text-light-1 border px-2 py-1">
              <label
                htmlFor="status-media"
                className="text-3xl text-center text-primary-500 cursor-pointer my-3 mx-2"
              >
                {media ? <AiFillPicture /> : "Add Image"}
              </label>
              <textarea
                value={text}
                onChange={handleTextChange}
                className="resize-none border-none w-full bg-transparent mx-1 outline-none"
                placeholder="Add a caption..."
                maxLength={maxLength}
              ></textarea>
              <button onClick={handleSubmit} className="text-primary-500">
                <IoIosSend className="text-3xl" />
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddMediaStatusDrawer;
