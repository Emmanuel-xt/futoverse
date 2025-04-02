"use client";
import { useState } from "react";
import { FiSearch, FiMoreVertical } from "react-icons/fi";

const dummyUsers = [
  {
    id: 1,
    name: "Okonkwo okeke",
    mutualFriends: 402,
    time: "1h",
    image: "/assets/logo.svg",
  },
  {
    id: 2,
    name: "Emma Stallion",
    mutualFriends: 350,
    time: "3h",
    image: "/assets/IceHomeImage1.jpg",
  },
  {
    id: 3,
    name: "Fortune Shitcoins",
    mutualFriends: 171,
    time: "",
    image: "/assets/logo.svg",
  },
  {
    id: 4,
    name: "Meka Kennedy",
    mutualFriends: 318,
    time: "",
    image: "/assets/IceHomeImage1.jpg",
  },
  {
    id: 5,
    name: "Favour Nwa",
    mutualFriends: 217,
    time: "",
    image: "/assets/logo.svg",
  },
  {
    id: 6,
    name: "Aza Man",
    mutualFriends: 494,
    time: "1h",
    image: "/assets/IceHomeImage1.jpg",
  },
  {
    id: 7,
    name: "Arinze Okeke",
    mutualFriends: 168,
    time: "",
    image: "/assets/logo.svg",
  },
  {
    id: 8,
    name: "Emmanuel Javascript",
    mutualFriends: 152,
    time: "",
    image: "/assets/IceHomeImage1.jpg",
  },
  {
    id: 9,
    name: "wizard code",
    mutualFriends: 58,
    time: "32m",
    image: "/assets/logo.svg",
  },
];

const FriendsList = () => {
  const [users, setUsers] = useState(dummyUsers);
  const [menuOpen, setMenuOpen] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <button className="bg-blue-500 text-white px-3 py-1 rounded-full">
            All
          </button>
          <div className="relative w-full mx-3">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-8 pr-4 py-2 rounded-full bg-gray-200 text-gray-700 focus:outline-none"
            />
            <FiSearch className="absolute left-2 top-3 text-gray-500" />
          </div>
        </div>
        <h2 className="text-lg font-bold mb-4">735 Friends</h2>
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border-b relative"
            >
              <div className="flex items-center">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">
                    {user.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpen(menuOpen === user.id ? null : user.id)
                  }
                >
                  <FiMoreVertical className="text-gray-600" />
                </button>
                {menuOpen === user.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-10">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Block User
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendsList;
