"use client";

import { useState } from "react";
import { ImageIcon, Video, FileText, Mic } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";
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
      <Card className="w-full mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userPicture || undefined} />
              <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              className="flex-1 justify-start text-muted-foreground hover:bg-muted/50 h-12 rounded-full"
              onClick={() => setShowCreatePost(true)}
            >
              Add Post
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-green-600 hover:bg-green-50"
              onClick={() => setShowCreatePost(true)}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Photo</span>
            </Button>

            {/* <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50"
              onClick={() => setShowCreatePost(true)}
            >
              <Video className="h-4 w-4" />
              <span>Video</span>
            </Button> */}
            {/* 
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-orange-600 hover:bg-orange-50"
              onClick={() => setShowCreatePost(true)}
            >
              <Mic className="h-4 w-4" />
              <span>Audio</span>
            </Button> */}

            {/* <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-purple-600 hover:bg-purple-50"
              onClick={() => setShowCreatePost(true)}
            >
              <FileText className="h-4 w-4" />
              <span>Document</span>
            </Button> */}
          </div>
        </CardContent>
      </Card>

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
