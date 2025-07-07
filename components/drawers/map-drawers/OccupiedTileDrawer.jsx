"use client";

import { useState } from "react";
import {
  Store,
  X,
  Heart,
  Navigation,
  Share2,
  ChevronRight,
  MapPin,
  User,
  Star,
  Bookmark,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import { Skeleton } from "@components/ui/skeleton";
import { ShopDetailsPanel } from "./ShopDetailsSidePanel";
import {
  drawLineBetweenPoints,
  generateLocationLink,
} from "@constants/functions";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { toast } from "sonner";
import { useLocation } from "@components/providers/LocationProvider";
import { useQuery } from "@tanstack/react-query";
import { fetchOnlyShop } from "@lib/actions/shops.prisma";
import { useRouter } from "next/navigation";

export const OccupiedTileDrawer = ({ open, onOpenChange, tileInfo }) => {
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const { viewer } = useCesiumViewer();
  const { currentPosition } = useLocation();
  const [loadingDirections, setLoadingDirections] = useState(false);

  const router = useRouter();

  const {
    data: tileDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tile-info", tileInfo?.id],
    queryFn: async () => {
      if (!tileInfo?.id) throw new Error("invalid Tile/Store");
      console.log("TileInfo", tileInfo.id);
      const fetched = await fetchOnlyShop(tileInfo.id);
      console.log("fetched", fetched);
      return fetched.shop;
    },
    enabled: open && !!tileInfo?.id,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleSaveToFavorites = () => {
    console.log("Saved to favorites:", tileDetails?.name);
  };

  const handleGetDirections = async () => {
    if (!tileDetails) return;

    const endLocation = {
      longitude: tileDetails.longitude,
      latitude: tileDetails.latitude,
    };

    const result = await drawLineBetweenPoints(
      viewer,
      () => currentPosition,
      endLocation,
      setLoadingDirections
    );

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
  };

  const handleShareLocation = () => {
    if (!tileDetails) return;
    generateLocationLink(tileDetails.longitude, tileDetails.latitude);
  };

  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-3 items-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      );
    }

    if (error || !tileDetails) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Store className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Store Not Found
          </h3>
          <p className="text-gray-600">
            This store doesn't exist or couldn't be loaded.
          </p>
        </div>
      );
    }

    return (
      <div className="px-6 py-1 space-y-1">
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            {tileDetails.image && (
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage
                  src={tileDetails.image || "/images/noPicture.png"}
                  alt={`${tileDetails.name}'s profile`}
                />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {tileDetails.name}
                </h2>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{tileDetails.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
              </div>
              {!tileDetails.locationDesc && (
                <div className="flex items-center gap-1 rounded-lg">
                  <MapPin className="h-3 w-3 text-gray-600 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    {tileDetails.locationDesc} Opposite Munalux Hotel, Umuchima
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {truncateDescription(tileDetails.description)}
            </p>
            {tileDetails.description &&
              tileDetails.description.length > 120 && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 text-sm"
                  onClick={() => setShowDetailsPanel(true)}
                >
                  Read more
                </Button>
              )}
          </div>

          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => router.push(`/shops/${tileDetails.name}`)}
          >
            <span>Enter Store</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleSaveToFavorites}
              className="flex"
            >
              <Bookmark className="h-5 w-5 mb-1" />
              <span className="text-xs">Save</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleGetDirections}
              className="flex"
            >
              {loadingDirections ? (
                <div className="text-xs flex items-center gap-2">
                  Getting directions...
                </div>
              ) : (
                <>
                  <Navigation className="h-5 w-5 mb-1" />
                  <span className="text-xs">Directions</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleShareLocation}
              className="flex"
            >
              <Share2 className="h-5 w-5 mb-1" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[100vh]">
          <ScrollArea className="flex-1">{renderContent()}</ScrollArea>
        </DrawerContent>
      </Drawer>

      <ShopDetailsPanel
        open={showDetailsPanel}
        onOpenChange={setShowDetailsPanel}
        shopDetails={tileDetails}
      />
    </>
  );
};
