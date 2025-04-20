"use client";
import {
  acceptFrientRequest,
  fetchPendingFriendRequests,
  rejectFriendRequest,
} from "@lib/actions/connect.prisma";
import { createSystemUser } from "@lib/actions/user.prisma";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// const requests = [
//   {
//     id: "1",
//     name: "Amah Christian",
//     picture: "/images/ichie.jpg",
//     department: "CIE",
//     level: "300",
//   },
//   {
//     id: "2",
//     name: "Okeke Emmanuel",
//     picture: "/images/skeleton.jpg",
//     department: "MEE",
//     level: "300",
//   },
//   {
//     id: "3",
//     name: "Alice Johnson",
//     picture: "/images/ichie.jpg",
//     department: "CSE",
//     level: "200",
//   },
//   {
//     id: "4",
//     name: "James Smith",
//     picture: "/images/skeleton.jpg",
//     department: "EEE",
//     level: "400",
//   },
//   {
//     id: "5",
//     name: "Bob Brown",
//     picture: "/images/ichie.jpg",
//     department: "CIE",
//     level: "100",
//   },
//   {
//     id: "6",
//     name: "Rachel Green",
//     picture: "/images/skeleton.jpg",
//     department: "MEE",
//     level: "200",
//   },
//   {
//     id: "7",
//     name: "Eve Adams",
//     picture: "/images/ichie.jpg",
//     department: "CSE",
//     level: "300",
//   },
//   {
//     id: "8",
//     name: "John Doe",
//     picture: "/images/skeleton.jpg",
//     department: "EEE",
//     level: "400",
//   },
//   {
//     id: "9",
//     name: "Michael Taylor",
//     picture: "/images/ichie.jpg",
//     department: "CSE",
//     level: "100",
//   },
//   {
//     id: "10",
//     name: "Sarah Williams",
//     picture: "/images/skeleton.jpg",
//     department: "MEE",
//     level: "200",
//   },
// ];

const FriendRequests = () => {
  const { data: session } = useSession();
  const currentUserId = parseFloat(session?.user?.id);
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    const fetchFriendRequest = async () => {
      try {
        if (currentUserId) {
          const fetchedRequests = await fetchPendingFriendRequests(
            currentUserId
          );
          setRequests(fetchedRequests);
        }
      } catch (error) {
        console.log("Error fetching friend requests:", error);
      }
    };

    fetchFriendRequest();
  }, []);

  const [acceptFriendRequestLoad, setAcceptFriendRequestLoad] = useState(false);

  const handleAcceptFrientRequest = async (id, name) => {
    try {
      setAcceptFriendRequestLoad(true);
      const send = await acceptFrientRequest(currentUserId, id);
      if (send) {
        toast(`You are now Friends with ${name} `);
      }
    } catch (error) {
      toast("Failed to Accept Request");
      console.log("Error sending friend request", error);
    } finally {
      setAcceptFriendRequestLoad(false);
    }
  };
  const handleDeclineFrientRequest = async (id, name) => {
    try {
      setAcceptFriendRequestLoad(true);
      const send = await rejectFriendRequest(currentUserId, id);
      if (send) {
        toast(`Friend Reqquest Rejected`);
      }
    } catch (error) {
      toast("Failed to Update Request");
      console.log("Error sending friend request", error);
    } finally {
      setAcceptFriendRequestLoad(false);
    }
  };

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
                src={
                  request.sender.picture ||
                  "https://randomuser.me/api/portraits/men/1.jpg"
                }
                alt="Profile Picture"
                width={100}
                height={100}
                className="rounded-full w-20 h-20 object-cover"
              />
            </div>
            <div className="flex flex-col  w-full">
              <h5 className="">{request.sender.name}</h5>
              <h6 className="text-slate-500">
                {request.sender?.department?.initial} (
                {request?.sender.level?.name}
                lvl)
              </h6>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleAcceptFrientRequest(
                      request.sender.id,
                      request.sender.name
                    )
                  }
                  className="bg-primary text-white font-semibold w-full rounded-lg p-1"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDeclineFrientRequest(
                      request.sender.id,
                      request.sender.name
                    )
                  }
                  className="bg-slate-200 text-black font-semibold w-full rounded-lg p-1"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center text-lg font-semibold  h-40 flex justify-center items-center">
            No Pending Connection Request
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
