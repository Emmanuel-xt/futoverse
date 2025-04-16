"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { fetchUserByUsername } from "@lib/actions/user.prisma";
import Link from "next/link";
import { CiEdit } from "react-icons/ci";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
import { departments } from "@constants/arrays";
import Modal from "@components/modals/Modal";
import { useRouter } from "next/navigation";
import { deleteDB } from "idb";
import { fetchUsersFriendCount } from "@lib/actions/connect.prisma";
import { FiMenu } from "react-icons/fi";
import { FaUserFriends } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";

const Profile = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [openLogOutModal, setOpenLogOutModal] = useState(false);
  // const [posts, setPosts] = useState([]);
  // const { viewer, viewerReady, setMapVisible } = useCesiumViewer();
  // const onlineUsers = useOnlineUsers();
  // const isOnline = Object.values(onlineUsers).some(
  //   (user) => user.username === session?.user?.username
  // );

  useEffect(() => {
    const fetchUserData = async () => {
      // socket.emit("set_user_online", session.user.username);
      // console.log({ isOnline });
      if (session?.user) {
        const fetchedUser = await fetchUserByUsername(session.user.username);
        setUser(fetchedUser);
      }
    };

    fetchUserData();
  }, [session?.user]);

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

  const [userFriendListCount, setUserFriendListCount] = useState(0);

  useEffect(() => {
    const fetchFriendListCount = async () => {
      if (session) {
        try {
          const count = await fetchUsersFriendCount(session.user.username);
          setUserFriendListCount(count);
        } catch (error) {
          console.log("Error fetching count", error);
          return 0;
        } finally {
        }
      }
    };

    // fetchFriendListCount();
  }, [session]);

  const router = useRouter();
  const handleSignOut = async () => {
    try {
      // Clear IndexedDB
      await deleteDB("chatDB");
      console.log("IndexedDB cleared successfully.");

      // Sign out and redirect
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error during sign out:", error);
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

  if (!session) {
    // Handle unauthenticated state
    return (
      <div className="">
        <div className="flex justify-between items-center p-3">
          <div className="flex gap-2 items-center">
            <Image src={"/icons/logo.png"} width={20} height={20} alt="logo" />
            <h6 className="text-primary text-lg font-bold">FUTO-VERSE</h6>
          </div>
          <div className="flex gap-4">
            <Link
              href={"/sign-up"}
              className="bg-transperent border border-black text-black  px-3 py-1 font-semibold rounded-3xl w-fit"
            >
              Create Account
            </Link>
            <Link
              href={"/login"}
              className="bg-primary text-white  px-3 py-1 font-semibold rounded-3xl w-fit"
            >
              Login
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center h-[90vh]">
          <p className="text-xl">Login to View Your Profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 mb-10 flex flex-col items-center">
      <div className="flex gap-4 absolute top-5 right-5 ">
        <Link href="/profile/friend-requests">
          <FaUserPlus className="rounded-full text-3xl cursor-pointer" />
        </Link>
        <FiMenu
          className="rounded-full text-3xl cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        />

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-5 top-3 mt-2 w-44 text-sm bg-white shadow-md rounded-md "
          >
            <Link
              href="/profile/edit"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Edit Profile
            </Link>
            {/* <Link
              href="/profile/friend-requests"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Connection Requests
            </Link> */}
            <Link
              href="/profile/settings"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Settings
            </Link>
            <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
              Share Profile
            </button>
            <button className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left">
              Report User
            </button>
            <button
              className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
              onClick={() => setOpenLogOutModal(true)}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="w-32 h-32 mb-4 mt-5">
        <Image
          src={session?.user?.image || "/assets/logo.svg"}
          alt="Profile Picture"
          width={200}
          height={200}
          className="rounded-full w-32 h-32 object-cover"
        />
      </div>

      <h1 className="text-2xl font-bold text-gray-800">
        {session?.user?.name || ""}
      </h1>
      <h6 className="text-sm font-light text-gray-500">
        {session?.user?.username}
      </h6>
      {/* <p className="text-gray-600 mt-2 text-center">
        {" "}
        {user?.bio || (
          <p className="text-slate-300">Edit your Profile to add a bio.</p>
        )}
      </p> */}

      <div className="mt-4 flex gap-8 text-center">
        <Link href={`profile/${session?.user?.username}/friends`}>
          <h2 className="text-xl font-semibold text-gray-800">
            {userFriendListCount || 0}
          </h2>
          <p className="text-sm text-gray-500">Connections</p>
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {user?._count.shops || 0}
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

      {user && !user?.department ? (
        <Link
          href="/profile/edit"
          className="flex gap-2 bg-blue-500 text-white p-1 rounded-3xl mt-5"
        >
          Complete Setting Up Your Profile <CiEdit className="text-2xl" />
        </Link>
      ) : (
        <div className="mt-6 w-full max-w-md bg-white p-6 shadow-lg rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">About </h3>
            <p className="mt-1 text-gray-600">{session?.user?.about}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Email Address</h3>
            <p className="mt-1 text-gray-600">{session?.user?.email}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Gender</h3>
            <p className="mt-1 text-gray-600">{session?.user?.gender}</p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Department</h3>
            <p className="mt-1 text-gray-600">{user?.department?.name}</p>
          </div>
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-800">Level</h3>
            <p className="mt-1 text-gray-600">{user?.level?.name}</p>
          </div>
        </div>
      )}

      {openLogOutModal && (
        <Modal
          open={openLogOutModal}
          onClose={() => setOpenLogOutModal(false)}
          width="300px"
          height="fit"
          className="border"
        >
          <div className=""></div>
          <h6 className="text-lg font-semibold text-center">Log Out</h6>
          <div className="flex flex-col gap-4 items-center justify-center">
            <p className="text-sm text-slate-700 text-center">
              Are you sure you want to complete this action?
            </p>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => handleSignOut()}
                className="bg-blue-600 p-1 rounded-lg px-4"
              >
                Confirm
              </button>
              <button
                className="bg-transparent border border-primary text-black p-1 rounded-lg px-4"
                onClick={() => setOpenLogOutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Profile;
