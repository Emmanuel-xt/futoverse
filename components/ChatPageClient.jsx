"use client";

import { useSession } from "next-auth/react";
import useGlobalMessageListener from "hooks/useGlobalMessageListener";
import Sidebar from "@components/components/sidebar/Sidebar";
import MessageContainer from "@components/components/messages/MessageContainer";
import Image from "next/image";
import Link from "next/link";

const ChatPageClient = () => {
  const { data: session, status } = useSession();
  useGlobalMessageListener();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-primary-500">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <div className="flex justify-between items-center p-3">
          <div className="flex flex- text-xl gap-2 items-center">
            <Image src={"/icons/logo.png"} width={20} height={20} alt="logo" />
            <h6 className="text-primary text-sm  font-bold">FUTO-VERSE</h6>
          </div>
          <div className="flex gap-2">
            <Link
              href={"/sign-up"}
              className="bg-transparent border border-black text-black px-3 py-1 text-sm font-semibold rounded-3xl w-fit"
            >
              Create Account
            </Link>
            <Link
              href={"/login"}
              className="bg-primary text-white px-3 py-1 font-semibold rounded-3xl text-sm w-fit"
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
    <div className="flex h-[100dvh] w-full rounded-lg overflow-hidden bg-gray-400 bg-clip-padding bg-opacity-0 z-30">
      <Sidebar />
      <MessageContainer />
    </div>
  );
};

export default ChatPageClient;
