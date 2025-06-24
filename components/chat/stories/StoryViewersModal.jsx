"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoryViewers } from "@lib/actions/status.prisma";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ScrollArea } from "@components/ui/scroll-area";
import { Eye } from "lucide-react";
import { useEffect } from "react";

const StoryViewersDrawer = ({ storyId, open, onClose }) => {
  const {
    data: viewers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["storyViewers", storyId],
    queryFn: () => getStoryViewers(storyId),
    enabled: !!storyId && open,
    staleTime: 30000,
    cacheTime: 60000,
  });
  console.log("i am mounted");

  // Cleanup delay on close
  useEffect(() => {
    console.log("i am opened or closed");
    if (!open) {
      const timer = setTimeout(() => {}, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = (openState) => {
    if (!openState) {
      setTimeout(() => {
        onClose();
      }, 0);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90%]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Story Viewers ({viewers.length})
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="px-4 pb-4 max-h-[calc(90vh-4rem)]">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Failed to load viewers</p>
            </div>
          ) : viewers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No viewers yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {viewers.map((viewer) => (
                <div key={viewer.id} className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={viewer.user?.picture || "/images/noProfile.png"}
                    />
                    <AvatarFallback>
                      {viewer.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {viewer.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(viewer.viewedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default StoryViewersDrawer;
