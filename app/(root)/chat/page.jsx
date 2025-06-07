"use client";

import MessageContainer from "@components/components/messages/MessageContainer";
import Sidebar from "@components/components/sidebar/Sidebar";
import { getUserForConversation } from "@lib/actions/Chat.prisma";
import useGlobalMessageListener from "hooks/useGlobalMessageListener";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import useConversation from "zustand/useConversation";

const ChatPage = ({ params }) => {
  // console.log("PRAMAMAM", params);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const receiverId = searchParams.get("receiverId");
  const { selectedConversation, setSelectedConversation } = useConversation();

  useGlobalMessageListener();

  useEffect(() => {
    if (!receiverId || !session) {
      setSelectedConversation(null); // Reset when no receiverId
      return;
    }

    const fetchConversation = async () => {
      try {
        const reciever = parseFloat(receiverId);
        const data = await getUserForConversation(reciever);

        if (data) {
          setSelectedConversation(data);
        } else {
          // toast.("These two users haven't chatted before.");
          setSelectedConversation(null);
        }
      } catch (error) {
        // console.error("Error fetching conversation:", error);
      }
    };

    fetchConversation();
  }, [receiverId, session]); // ✅ Dependency array listens for `receiverId` changes

  if (status === "loading") {
    // Show a loading spinner or placeholder while the session is loading
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-primary-500">Loading...</p>
      </div>
    );
  }

  if (!session) {
    // Handle unauthenticated state
    return (
      <div className="">
        <div className="flex justify-between items-center p-3">
          <div className="flex flex- text-xl gap-2 items-center">
            <Image src={"/icons/logo.png"} width={20} height={20} alt="logo" />
            <h6 className="text-primary text-sm  font-bold">FUTO-VERSE</h6>
          </div>
          <div className="flex gap-2">
            <Link
              href={"/sign-up"}
              className="bg-transperent border border-black text-black  px-3 py-1 text-sm font-semibold rounded-3xl w-fit"
            >
              Create Account
            </Link>
            <Link
              href={"/login"}
              className="bg-primary text-white  px-3 py-1 font-semibold rounded-3xl text-sm w-fit"
            >
              Login
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center h-[90vh]">
          <p className="text-xl">Login to Start Conversations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full rounded-lg overflow-hidden bg-gray-400 bg-clip-padding bg-opacity-0 z-30">
      <Sidebar />
      <MessageContainer />
    </div>
  );
};

export default ChatPage;
