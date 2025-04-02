"use client";
import { useState } from "react";

const dummyRequests = [
  {
    id: 1,
    name: "Arinze Okeke",
    mutualFriends: 63,
    time: "12w",
    image: "/assets/logo.svg",
    mutualImages: ["/assets/logo.svg", "/assets/logo.svg"],
  },
  {
    id: 2,
    name: "Kim Liberate",
    mutualFriends: 81,
    time: "36w",
    image: "/assets/IceHomeImage1.jpg",
    mutualImages: ["/assets/logo.svg", "/assets/logo.svg"],
  },
  {
    id: 3,
    name: "Ice Chammy Ice",
    mutualFriends: 2,
    time: "32w",
    image: "/assets/logo.svg",
    mutualImages: ["/assets/logo.svg", "/assets/logo.svg"],
  },
  {
    id: 4,
    name: "Emma Arinze",
    mutualFriends: 9,
    time: "41w",
    image: "/assets/IceHomeImage1.jpg",
    mutualImages: ["/assets/logo.svg", "/assets/logo.svg"],
  },
  {
    id: 5,
    name: "Val Ruzz",
    mutualFriends: 38,
    time: "33w",
    image: "/assets/logo.svg",
  },
  {
    id: 6,
    name: "Futo D-Verse Johnpaul",
    mutualFriends: 1,
    time: "44w",
    image: "/assets/IceHomeImage1.jpg",
    mutualImages: ["/assets/logo.svg", "/assets/logo.svg"],
  },
];

const FriendRequests = () => {
  const [requests, setRequests] = useState(dummyRequests);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-4">
          Friend requests ({requests.length})
        </h2>
        <div>
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 border-b"
            >
              <div className="flex items-center">
                <img
                  src={request.image}
                  alt={request.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-semibold">{request.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">
                      {request.mutualFriends} mutual friends
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                  Confirm
                </button>
                <button className="bg-gray-300 text-black px-3 py-1 rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;
