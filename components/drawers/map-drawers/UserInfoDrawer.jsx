"use client";

import { useMemo, useState } from "react";
import {
  User,
  X,
  MessageCircle,
  ExternalLink,
  Navigation,
  MapPin,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchOnlyUserInfo } from "@lib/actions/user-queries";
import { drawLineBetweenPoints } from "@constants/functions";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { useLocation } from "@components/providers/LocationProvider";
import { Cartographic, Math } from "cesium";
import Link from "next/link";

export const UserInfoDrawer = ({ open, onOpenChange, userInfo }) => {
  const { viewer } = useCesiumViewer();
  const { stableLocation, currentPosition } = useLocation();
  const [loadingDirections, setLoadingDirections] = useState(false);

  // Optimized user data fetching with React Query
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-info", userInfo?.username],
    queryFn: async () => {
      if (!userInfo?.username) throw new Error("No username provided");
      return await fetchOnlyUserInfo(userInfo.username);
    },
    enabled: open && !!userInfo?.username,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Calculate user location from position
  const destinationUserLocation = useMemo(() => {
    if (!userInfo?.position) return null;

    const cartographic = Cartographic.fromCartesian(userInfo.position);
    return {
      longitude: Math.toDegrees(cartographic.longitude),
      latitude: Math.toDegrees(cartographic.latitude),
    };
  }, [userInfo?.position]);

  // const handleGetDirections = () => {
  //   if (viewer && stableLocation && destinationUserLocation) {
  //     drawLineBetweenPoints(viewer, stableLocation, destinationUserLocation);
  //   }
  // };

  const handleGetDirections = async () => {
    if (viewer) {
      const result = await drawLineBetweenPoints(
        viewer,
        () => currentPosition,
        destinationUserLocation,
        setLoadingDirections
      );

      console.log("Result", result);

      if (!result?.success) {
        switch (result.reason) {
          case "no-location":
            toast("Could not get your current location.");
            break;
          case "network":
            toast("Network error while fetching directions.");
            break;
          case "no-route":
            toast("Could not retrieve a valid route.");
            break;
          default:
            toast("An unexpected error occurred.");
        }
      }
      // onOpenChange(false);
    }
  };

  const renderUserInfo = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center space-y-4 p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      );
    }

    if (error || !user) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <User className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            User Not Found
          </h3>
          <p className="text-gray-600">
            This user doesn't exist or couldn't be loaded.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-3 p-3">
        <div className="flex gap-2">
          {/* Profile Picture */}
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage
              src={user.picture || "/images/noPicture.png"}
              alt={`${user.name}'s profile`}
            />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          {/* User Details */}
          <div className="">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">@{user.username}</p>

            <div className="flex flex-col">
              {user.department?.name && (
                <Badge variant="secondary" className="">
                  {user.department.name}
                </Badge>
              )}
              {user.level?.name && (
                <Badge variant="outline" className="">
                  {user.level.name} Level
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Location Info */}
        {/* {userLocation && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <MapPin className="h-4 w-4" />
            <span>
              {userLocation.latitude.toFixed(4)},{" "}
              {userLocation.longitude.toFixed(4)}
            </span>
          </div>
        )} */}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {user.username && (
            <Button asChild className="w-full">
              <Link href={`/profile/${user.username}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3">
            {user.id && (
              <Button asChild variant="outline">
                <Link href={`/chat?receiverId=${user.id}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleGetDirections}
              disabled={!destinationUserLocation}
            >
              {loadingDirections ? (
                <div className="text-xs flex items-center gap-2">
                  {/* <Spinner className="animate-spin h-4 w-4" /> */}
                  Getting directions...
                </div>
              ) : (
                <>
                  <Navigation className="h-5 w-5 mb-1" />
                  <span className="text-xs">Directions</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        {/* <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">
              User Information
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader> */}

        {renderUserInfo()}
      </DrawerContent>
    </Drawer>
  );
};
