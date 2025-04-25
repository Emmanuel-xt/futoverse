"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { fetchUserByUsername } from "@lib/actions/user.prisma";
import Link from "next/link";
import { CiEdit } from "react-icons/ci";
import { FaRegEnvelope } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { generateProfileLink } from "@constants/functions";
import { useOnlineUsers } from "@components/providers/OnlineUsersProvider";
import {
  areFriends,
  cancelFriendRequest,
  disconnectFriends,
  fetchUsersFriendCount,
  hasSentFriendRequest,
  sendFriendRequest,
} from "@lib/actions/connect.prisma";
import { LuMessageSquareText } from "react-icons/lu";
import { toast } from "sonner";

const Profile = ({ params }) => {
  const [user, setUser] = useState(null);
  const id = params.id.replace(/%20/g, " ");
  const [status, setStatus] = useState("");
  const onlineUsers = useOnlineUsers();
  // console.log("Online users for Profile", onlineUsers);
  const isUserActive = onlineUsers.find(
    (onlineUser) => onlineUser.username === user?.username
  );
  const { data: session } = useSession();
  const currentUserId = parseFloat(session?.user?.id);

  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const [alreadyFriends, setAlreadyFriends] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      // socket.emit("set_user_online", session.user.username);
      // console.log({ isOnline });
      if (id && currentUserId) {
        try {
          setStatus("loading");
          const fetchedUser = await fetchUserByUsername(id);
          if (!fetchedUser) {
            setStatus("not-found");
            return;
          }
          setUser(fetchedUser);
          setStatus("");

          const requestStatus = await hasSentFriendRequest(
            currentUserId,
            fetchedUser.id
          );
          setFriendRequestSent(requestStatus);

          const isFriend = await areFriends(currentUserId, fetchedUser.id);
          setAlreadyFriends(isFriend);
        } catch (error) {
        } finally {
          // if (user) {
          // }
        }
      }
    };

    fetchUserData();
  }, [id, currentUserId]);

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

  const router = useRouter();

  const [friendRequestLoad, setfriendRequestLoad] = useState(false);
  const handleSendFriendRequest = async (id) => {
    try {
      setfriendRequestLoad(true);
      const send = await sendFriendRequest(currentUserId, id);
      if (send) {
        toast("Request Sent");
        setRequestSent(true);
      }
    } catch (error) {
      toast("Request not Sent");
      // console.log("Error sending friend request", error);
    } finally {
      setfriendRequestLoad(false);
    }
  };
  const handleCancelFriendRequest = async (id) => {
    try {
      setfriendRequestLoad(true);
      const cancel = await cancelFriendRequest(currentUserId, id);
      if (cancel.success) {
        // toast("Connection Request Sent");
        setRequestSent(false);
        setFriendRequestSent(false);
        alreadyFriends(false);
      }
    } catch (error) {
      toast("Failed to Unfriend");
      // console.log("Error sending friend request", error);
    } finally {
      setfriendRequestLoad(false);
    }
  };
  const handleDisconnectFriendship = async (id) => {
    try {
      setfriendRequestLoad(true);
      const disconnect = await disconnectFriends(currentUserId, id);
      if (disconnect.success) {
        // toast("Connection Request Sent");
        setRequestSent(false);
        setAlreadyFriends(false);
        setRequestSent(false);
        toast("You are no longer Friends");
      }
    } catch (error) {
      toast("Failed to Cancel");
      // console.log("Error sending friend request", error);
    } finally {
      setfriendRequestLoad(false);
    }
  };

  if (status === "loading") {
    // Show a loading spinner or placeholder while the session is loading
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-primary-500">Loading...</p>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 flex flex-col items-center">
      <div className="flex fixed top-5 right-5 ">
        {/* <HiDotsVertical
          className="rounded-full text-3xl cursor-pointer "
          onClick={() => setMenuOpen(!menuOpen)}
        /> */}

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-5 top-3 mt-2 w-40 z-[999] bg-white shadow-md rounded-md "
          >
            {isUserActive && (
              <Link
                href="/map"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                View in Map(N/A)
              </Link>
            )}
            <button
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={() => generateProfileLink()}
            >
              Share Profile
            </button>
            <button className="block text-sm px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left">
              Report User (N/A)
            </button>
          </div>
        )}
      </div>
      <div className="w-32 h-32 mb-4 z-10  border-2  rounded-full">
        <Image
          src={user?.picture || "/images/noProfile.png"}
          alt="Profile Picture"
          width={200}
          height={200}
          className="rounded-full w-32 h-32 object-cover"
        />
        {isUserActive && (
          <div className="w-5 h-5 bg-green-500 border-2 border-white rounded-full absolute top-3 right-1"></div>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-800">{user?.name || ""}</h1>
      <h6 className="text-sm font-light text-gray-500">{user?.username}</h6>
      {/* <p className="text-gray-600 mt-2">
        {" "}
        {user?.bio || (
          <span className="text-slate-300">
            Edit your Profile to add a bio.
          </span>
        )}
      </p> */}

      <div className="mt-4 flex gap-8 text-center cursor-pointer">
        <Link href={`${user?.username}/friends`}>
          <h2 className="text-xl font-semibold text-gray-800">
            {user?._count?.friends || 0}
          </h2>
          <p className="text-sm text-gray-500">Connections</p>
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {user?._count?.shops || 0}
          </h2>
          <p className="text-sm text-gray-500">Stores</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {user?.connections || 0}
          </h2>
          <p className="text-sm text-gray-500">Products</p>
        </div>
      </div>
      <div className="flex gap-3 items-center mt-2">
        {session?.user?.id !== user?.id && (
          <>
            {alreadyFriends ? (
              <button
                type="button"
                onClick={() => {
                  // TODO: Add disconnect friend logic here
                  handleDisconnectFriendship(user.id);
                }}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Disconnect
              </button>
            ) : friendRequestSent || requestSent ? (
              <button
                type="button"
                onClick={() => handleCancelFriendRequest(user.id)}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {friendRequestLoad ? "Canceling..." : "Cancel Request"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendFriendRequest(user.id)}
                className={`bg-blue-500 ${
                  friendRequestLoad ? "bg-blue-400" : ""
                } text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={friendRequestLoad}
              >
                {friendRequestLoad ? "Sending..." : "Connect"}
              </button>
            )}
          </>
        )}

        <Link
          href={`/chat?receiverId=${user?.id}`}
          className="border-2 p-1 flex flex-col items-center rounded"
        >
          <LuMessageSquareText className="text-2xl " />
          <p className="text-[10px]">Message</p>
        </Link>
      </div>

      <div className="mt-6 w-full max-w-md bg-white p-6 shadow-lg rounded-lg">
        {user?.about && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">About </h3>
            <p className="mt-1 text-gray-600">{user?.about}</p>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800">Email Address</h3>
          <p className="mt-1 text-gray-600">{user?.email}</p>
        </div>

        {user?.gender && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Gender</h3>
            <p className="mt-1 text-gray-600">{user?.gender}</p>
          </div>
        )}

        {user?.department?.name && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Department</h3>
            <p className="mt-1 text-gray-600">{user?.department?.name}</p>
          </div>
        )}

        {user?.level?.name && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Level</h3>
            <p className="mt-1 text-gray-600">{user?.level?.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
