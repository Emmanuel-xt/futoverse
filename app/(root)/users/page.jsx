"use client";
import { departments } from "@constants/arrays";
import {
  cancelFriendRequest,
  sendFriendRequest,
} from "@lib/actions/connect.prisma";
import { fetchAllUsersForListing } from "@lib/actions/user-queries";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast } from "sonner";

const levels = ["100", "200", "300", "400", "500"];

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [users, setUsers] = useState([]);
  const [errorMessage, seterrorMessage] = useState("");

  const { data: session } = useSession();

  const currentUserId = parseFloat(session?.user?.id);

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearchTerm =
      (user.name &&
        user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment =
      !selectedDepartment || user.department?.name === selectedDepartment;

    const matchesLevel = !selectedLevel || user.level?.name === selectedLevel;

    return matchesSearchTerm && matchesDepartment && matchesLevel;
  });

  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const [friendRequestLoad, setfriendRequestLoad] = useState(null);
  const handleSendFriendRequest = async (id) => {
    try {
      setfriendRequestLoad(id);
      const send = await sendFriendRequest(currentUserId, id);
      if (send.success) {
        toast("Request Sent");
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        setRequestSent(true);
      }
    } catch (error) {
      toast("Request not Sent");
      // console.log("Error sending friend request", error);
    } finally {
      setfriendRequestLoad(null);
    }
  };
  const handleCancelFriendRequest = async (id) => {
    try {
      setfriendRequestLoad(id);
      const cancel = await cancelFriendRequest(currentUserId, id);
      if (cancel.success) {
        // toast("Connection Request Sent");
        setRequestSent(false);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        // setFriendRequestSent(false);
        // alreadyFriends(false);
      }
    } catch (error) {
      toast("Failed to Unfriend");
      // console.log("Error sending friend request", error);
    } finally {
      setfriendRequestLoad(null);
    }
  };

  useEffect(() => {
    const fetchALlUsers = async () => {
      // if (session) {
      try {
        const users = await fetchAllUsersForListing(currentUserId);
        // console.log("Userssss", users);
        setUsers(users);
      } catch (error) {
        seterrorMessage("Error fetching Users");
        // console.log("Error");
      }
    };
    // };

    fetchALlUsers();
    // console.log("Users ---->", users);
  }, [session]);

  return (
    <div className="p-3 mb-14">
      <div className="flex gap-2 mb-3">
        <div className="flex gap-1 items-center border">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-1 text-sm w-48"
          >
            <option value="">Department</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept.name} className="text-sm">
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1 items-center border">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-1 text-sm"
          >
            <option value="">Level</option>
            {levels.map((level, index) => (
              <option key={index} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center bg-slate-200 rounded-2xl w-full p-1 px-3 mb-4">
        <input
          type="text"
          placeholder="Search Users"
          className="outline-none w-full bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FiSearch className="font-bold text-xl" />
      </div>

      <h5 className="font-semibold text-2xl mb-4">Users </h5>

      <div className="flex flex-col gap-3">
        {filteredUsers.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 hover:bg-slate-100 focus:bg-slate-50 cursor-pointer p-2 rounded-md"
              >
                {/* Clickable Avatar or Name */}
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2 flex-grow"
                >
                  <div className="w-16 h-16">
                    <Image
                      src={user.picture || `/images/noProfile.png`}
                      alt="Profile Picture"
                      width={64}
                      height={64}
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h5 className="font-medium">{user.name}</h5>
                    <h5 className="text-slate-400 text-sm">@{user.username}</h5>
                    <h6 className="text-slate-500 text-sm">
                      {user.department?.initial}{" "}
                      {user.level && `${user.level.name}lvl`}
                    </h6>
                  </div>
                </Link>

                {/* Independent Connect Button */}
                {user.isFriend ? (
                  <></>
                ) : user.requestSent ? (
                  <button
                    type="button"
                    onClick={() => handleCancelFriendRequest(user.id)}
                    className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {friendRequestLoad === user.id ? "Canceling..." : "Cancel "}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendFriendRequest(user.id)}
                    className={`bg-blue-500 ${
                      friendRequestLoad === user.id ? "bg-blue-400" : ""
                    } text-white py-1 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={friendRequestLoad === user.id}
                  >
                    {friendRequestLoad === user.id ? "Sending..." : "Connect"}
                  </button>
                )}

                {/* <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent bubbling just in case
                    handleSendFriendRequest(user.id);
                  }}
                  className={`bg-blue-500 ${
                    friendRequestLoad === user.id ? "bg-blue-400" : ""
                  } text-white py-1 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={friendRequestLoad === user.id}
                >
                  {friendRequestLoad === user.id ? "Sending..." : "Connect"}
                </button> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-12 text-center text-slate-500">
            <Image
              src="/assets/search.svg" // Replace with your own image or illustration path
              alt="No users found"
              width={180}
              height={180}
              className="mb-4"
            />
            <h4 className="font-semibold text-lg">No user found</h4>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your filters or search again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
