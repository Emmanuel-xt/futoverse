import { extractTime } from "@constants/functions";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { MdDone } from "react-icons/md";
import useConversation from "zustand/useConversation";

const SYSTEM_USER_ID = 141618;

const Message = ({ message }) => {
  const { data: session } = useSession();
  const { selectedConversation } = useConversation();

  const isSystemMessage = message?.senderId === SYSTEM_USER_ID;
  const fromMe = message?.senderId == session?.user?.id;
  const img = fromMe ? session?.user.image : selectedConversation?.picture;
  const bubbleBg = fromMe ? "bg-primary" : "bg-slate-200 ";
  const shakeClass = "shake";

  if (isSystemMessage) {
    return (
      <div className="w-full flex justify-center mb-2">
        <div className="bg-yellow-100 text-yellow-800 text-sm px-4 py-2 rounded-md shadow-sm text-center max-w-[80%]">
          {message.body}
          <div className="text-[10px] text-gray-500 mt-1">
            {extractTime(message.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full gap-2 ${fromMe && "flex-row-reverse"}`}>
      <div className="hidden md:block chat-image avatar">
        <div className="w-6 md:w-10 rounded-full">
          <Image
            alt="profile"
            src={img || "https://randomuser.me/api/portraits/men/1.jpg"}
            width={20}
            height={20}
          />
        </div>
      </div>
      <div
        className={`flex flex-col max-w-[70%] md:max-w-[50%] ${
          fromMe ? "items-end" : "items-start"
        }`}
      >
        <p
          className={`rounded-xl px-3 py-2 ${bubbleBg} ${shakeClass} ${
            fromMe ? "text-white" : "text-black"
          } text-sm md:text-md w-fit leading-tight break-words whitespace-pre-wrap`}
        >
          {message.body}
        </p>

        <span
          className={`opacity-50 text-xs flex gap-1 items-center ${
            fromMe ? "justify-end" : "justify-start"
          } text-black`}
        >
          {message.isRead ? (
            <IoCheckmarkDoneSharp className="ml-1" />
          ) : (
            <MdDone className="ml-1" />
          )}
          {extractTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default Message;
