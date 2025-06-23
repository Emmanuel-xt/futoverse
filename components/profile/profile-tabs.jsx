"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { FriendsTab } from "./tabs/friends-tab";
import { FriendRequestsTab } from "./tabs/friend-requests-tab";
import { SuggestedTab } from "./tabs/suggested-tab";

// interface ProfileTabsProps {
//   userId: number
//   isOwnProfile: boolean
// }

export function ProfileTabs({ userId, username, isOwnProfile }) {
  const [activeTab, setActiveTab] = useState("suggested");

  return (
    <div className="bg-white  ">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-none border-b sticky top-[64px] z-20">
          <TabsTrigger
            value="friends"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 "
          >
            Friends
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              Requests
            </TabsTrigger>
          )}
          <TabsTrigger
            value="suggested"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            Suggested
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-0">
          <FriendsTab userId={userId} username={username} />
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="requests" className="mt-0">
            <FriendRequestsTab userId={userId} />
          </TabsContent>
        )}

        <TabsContent value="suggested" className="mt-0">
          <SuggestedTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
