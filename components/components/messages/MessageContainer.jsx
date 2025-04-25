// import { useAuthContext } from "../../context/AuthContext";
// import useConversation from "../../zustand/useConversation";
import useConversation from "zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";

import { MessageCircle } from "lucide-react";
import { BsBack } from "react-icons/bs";
import { IoMdArrowBack } from "react-icons/io";
import Image from "next/image";
import { useOnlineUsers } from "@components/providers/OnlineUsersProvider";
import { useEffect, useRef, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MessageContainer = () => {
  const { setSelectedConversation, selectedConversation } = useConversation();
  // console.log(
  //   "SELECTED CONVERSATION AT MESSAGE CONTAINER",
  //   selectedConversation
  // );
  const router = useRouter();
  const onlineUsers = useOnlineUsers();
  // console.log("Online users for COnversation", selectedConversation);
  const isUserActive = onlineUsers.find(
    (onlineUser) => onlineUser.userId === selectedConversation?.id
  );

  const handleBack = () => {
    setSelectedConversation(null);
    router.back();
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div
      className={`w-full flex flex-col bg-white z-20 ${
        !selectedConversation && "hidden md:flex"
      }`}
    >
      {!selectedConversation ? (
        <>
          <NoChatSelected />
        </>
      ) : (
        <>
          {/* Header */}
          <div className="border-b px-4 py-2 mb-2 flex gap-3 items-center z-40">
            <IoMdArrowBack className="text-xl" onClick={() => handleBack()} />
            <div className="w-10 h-10 border rounded-full relative">
              <Image
                alt="profile"
                src={selectedConversation.picture || `/images/noProfile.png`}
                width={20}
                height={20}
                className="w-10 h-10  rounded-full"
              />
              {isUserActive && (
                <div className="w-3 h-3 bg-green-500 border-2 border-white rounded-full absolute top-0 right-0"></div>
              )}
            </div>
            <span className="text-gray-900 font-bold">
              {selectedConversation.name}
            </span>
          </div>

          <div className="flex fixed top-5 right-5 z-50 ">
            <HiDotsVertical
              className="rounded-full text-3xl cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            />

            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-5 top-3 mt-2 w-40 bg-white shadow-md rounded-md z-50 "
              >
                <button className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
                  Search (N/A)
                </button>
                <Link
                  href={`/profile/${selectedConversation?.username}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  View Profile
                </Link>

                {isUserActive && (
                  <Link
                    href="/map"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    View in Map(N/A)
                  </Link>
                )}
                {/* <button
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => generateProfileLink()}
                >
                  Share Profile
                </button> */}
                <button className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left">
                  Block User (N/A)
                </button>
              </div>
            )}
          </div>

          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};
export default MessageContainer;

const NoChatSelected = () => {
  // const { authUser } = useAuthContext();
  const authUser = {
    id: "12345",
    fullName: "okeke emmanuel ",
    email: "eokeke320@gamil.com",
    profilePic:
      "https://res.cloudinary.com/daueleyul/image/upload/v1740496632/your_folder_name/se6k3cjuvmmfjsqysvwt.jpg",
    gender: "male",
  };
  return (
    <div className="md:flex items-center justify-center w-full h-full hidden">
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2">
        <p>Welcome 👋 {authUser?.fullName} ❄</p>
        <p>Select a chat to start messaging</p>
        <MessageCircle className="text-3xl md:text-6xl text-center" />
      </div>
    </div>
  );
};
