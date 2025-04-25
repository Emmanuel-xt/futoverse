// import { useSocketContext } from "../../context/SocketContext";
// import useConversation from "../../zustand/useConversation";

import { useOnlineUsers } from "@components/providers/OnlineUsersProvider";
import { markMessagesAsRead } from "@lib/actions/Chat.prisma";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { MdDone } from "react-icons/md";
import useConversation from "zustand/useConversation";

const Conversation = ({ conversation, emoji, isUserOnly }) => {
  const { setSelectedConversation, selectedConversation } = useConversation();
  const isSelected = selectedConversation?.id === conversation.id;
  const { data: session } = useSession();

  // const { onlineUsers } = useSocketContext();
  const onlineUsers = useOnlineUsers();
  // console.log("Online users for COnversation", onlineUsers);
  const isUserActive = onlineUsers.find(
    (onlineUser) => onlineUser.userId === conversation.id
  );
  const router = useRouter();
  const handleOpenDM = async (conversation) => {
    // console.log("CONVERSATIO", conversation);
    router.push(`/chat?receiverId=${conversation?.id}`);
    // setSelectedConversation(conversation);
    markMessagesAsRead(
      conversation.conversationId,
      parseFloat(session?.user.id)
    );
  };

  const formatMessageTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();

    // Convert both dates to their local time zones
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date >= today) {
      // Today → Format as "HH:mm"
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date >= yesterday) {
      // Yesterday → Show "Yesterday"
      return "Yesterday";
    } else {
      // Older than yesterday → Format as "DD/MM/YYYY"
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2
				 py-1 cursor-pointer ${isSelected ? "md:bg-sky-500" : ""}`}
        onClick={() => handleOpenDM(conversation)}
      >
        <div className={`avatar ${isUserActive ? "online" : ""}`}>
          <div className="w-14 h-14 md:w-12 rounded-full relative">
            <Image
              src={conversation.picture || `/images/noProfile.png`}
              alt="dp"
              width={20}
              height={20}
              className="w-14 h-14 rounded-full"
            />
            {isUserActive && (
              <div className="w-3 h-3 bg-green-500 border-2 border-white rounded-full absolute top-0 right-1"></div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 ">
          <div className="flex gap-3 justify-between">
            <p className="font-semibold text-slate-600  text-sm md:text-md">
              {conversation.name}
            </p>
            {!isUserOnly && (
              <span className="text-slate-600 text-xs">
                {formatMessageTime(conversation?.lastMessage?.createdAt)}
              </span>
            )}
          </div>
          {!isUserOnly && (
            <div className=" flex justify-between">
              <div className="flex gap-2 w-full">
                {session?.user.id == conversation?.lastMessage?.senderId && (
                  <>
                    {conversation?.lastMessage?.isRead ? (
                      <>
                        <IoCheckmarkDoneSharp className="" />
                      </>
                    ) : (
                      <>
                        <MdDone className="" />
                      </>
                    )}
                  </>
                )}

                <p className=" flex  w-full items-center justify-between text-slate-600 text-xs">
                  {" "}
                  {/* {conversation?.lastMessage?.body} */}
                  {conversation?.lastMessage?.body.length > 60
                    ? conversation?.lastMessage?.body.substring(0, 50) + "..."
                    : conversation?.lastMessage?.body}
                  {session?.user.id != conversation?.lastMessage?.senderId && (
                    <>
                      {!conversation?.lastMessage?.isRead && (
                        <span className="bg-blue-700 rounded-full p-1"></span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="divider my-0 py-0 h-1" />
    </>
  );
};
export default Conversation;
