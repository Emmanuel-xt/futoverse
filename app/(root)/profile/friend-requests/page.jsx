"use client";
import Image from "next/image";
import { useState } from "react";

const requests = [
  {
    id: "1",
    name: "Amah Christian",
    picture: "/images/ichie.jpg",
    department: "CIE",
    level: "300",
  },
  {
    id: "2",
    name: "Okeke Emmanuel",
    picture: "/images/skeleton.jpg",
    department: "MEE",
    level: "300",
  },
  {
    id: "3",
    name: "Alice Johnson",
    picture: "/images/ichie.jpg",
    department: "CSE",
    level: "200",
  },
  {
    id: "4",
    name: "James Smith",
    picture: "/images/skeleton.jpg",
    department: "EEE",
    level: "400",
  },
  {
    id: "5",
    name: "Bob Brown",
    picture: "/images/ichie.jpg",
    department: "CIE",
    level: "100",
  },
  {
    id: "6",
    name: "Rachel Green",
    picture: "/images/skeleton.jpg",
    department: "MEE",
    level: "200",
  },
  {
    id: "7",
    name: "Eve Adams",
    picture: "/images/ichie.jpg",
    department: "CSE",
    level: "300",
  },
  {
    id: "8",
    name: "John Doe",
    picture: "/images/skeleton.jpg",
    department: "EEE",
    level: "400",
  },
  {
    id: "9",
    name: "Michael Taylor",
    picture: "/images/ichie.jpg",
    department: "CSE",
    level: "100",
  },
  {
    id: "10",
    name: "Sarah Williams",
    picture: "/images/skeleton.jpg",
    department: "MEE",
    level: "200",
  },
];

const FriendRequests = () => {
  return (
    <div className="p-3">
      <h5 className="font-semibold text-2xl mb-4">
        Connection Requests {requests.length}
      </h5>

      <div className="flex flex-col gap-3">
        {requests.map((request) => (
          <div key={request.id} className="flex items- gap-2">
            <div className="w-24 h-24">
              <Image
                src={request.picture}
                alt="Profile Picture"
                width={100}
                height={100}
                className="rounded-full w-20 h-20 object-cover"
              />
            </div>
            <div className="flex flex-col  w-full">
              <h5 className="">{request.name}</h5>
              <h6 className="text-slate-500">
                {request.department} ({request.level}lvl)
              </h6>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="bg-primary text-white font-semibold w-full rounded-lg p-1"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="bg-slate-200 text-black font-semibold w-full rounded-lg p-1"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;
