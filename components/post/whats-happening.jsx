"use client";

import { useState } from "react";
import { ImageIcon, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { CreatePostDialog } from "./create-post-dialog";

export function WhatsHappening({ userId, userCanPost, userName, userPicture }) {
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (!userCanPost || !userId) {
    return null;
  }

  return (
    <>
      {/* <div className="w-full mb-6 bg-white rounded-lg border p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userPicture || undefined} />
            <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            className="flex-1 justify-start text-muted-foreground hover:bg-gray-100 h-10 rounded-full bg-gray-50"
            onClick={() => setShowCreatePost(true)}
          >
            Add Post
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center text-green-600 hover:bg-green-50 px-1"
            onClick={() => setShowCreatePost(true)}
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-xs">Photo</span>
          </Button>
        </div>
      </div> */}
      {/* <div className=""> */}
      <Button
        onClick={() => setShowCreatePost(true)}
        size=""
        className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 fixed bottom-24 right-7 p-1"
      >
        <Plus className="h-10 w-10" />
      </Button>
      {/* </div> */}

      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        userId={userId}
        userName={userName}
        userPicture={userPicture}
      />
    </>
  );
}
