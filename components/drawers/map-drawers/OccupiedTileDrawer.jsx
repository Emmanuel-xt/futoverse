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
import { ShopDetailsPanel } from "./ShopDetailsSidePanel";
import {
  drawLineBetweenPoints,
  generateLocationLink,
} from "@constants/functions";
import { userLocation } from "@constants/userDat";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { toast } from "sonner";
import { useLocation } from "@components/providers/LocationProvider";
// import { ShopDetailsPanel } from "./shop-details-panel"

// interface OccupiedTileDrawerProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   tileInfo: any
//   tileDetails: any
// }

export const OccupiedTileDrawer = ({
  open,
  onOpenChange,
  tileInfo,
  tileDetails,
}) => {
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const { viewer } = useCesiumViewer();
  const { currentPosition } = useLocation();

  const handleSaveToFavorites = () => {
    // Implement your bookmark/favorite logic here
    console.log("Saved to favorites:", tileDetails.name);
  };

  const [loadingDirections, setLoadingDirections] = useState(false);
  const handleGetDirections = async () => {
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
  };

  const handleShareLocation = () => {
    // console.log("Tile details", tileDetails);
    generateLocationLink(tileDetails.longitude, tileDetails.latitude);
  };

  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[100vh]">
          {/* <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Store className="h-4 w-4" />
                </div>
                <DrawerTitle className="text-lg font-semibold">
                  Store Details
                </DrawerTitle>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader> */}

          <ScrollArea className="flex-1">
            <div className="px-6 py-1 space-y-1">
              {/* Store Info */}
              <div className="space-y-3">
                <div className="flex gap-3 items-center">
                  {/* Store Image */}
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
                        <Badge variant="secondary">
                          {tileDetails.category}
                        </Badge>
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
                          {tileDetails.locationDesc} Opposite Munalux Hotel ,
                          Umuchima
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
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

                {/* Location */}

                {/* Owner Info */}
                {/* {tileDetails.user && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={tileDetails.user.picture || "/placeholder.svg"}
                        alt={tileDetails.user.username}
                      />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">Store Owner</h4>
                      <p className="text-sm text-gray-600">
                        @{tileDetails.user.username}
                      </p>
                    </div>
                  </div>
                )} */}

                {/* Full Details Button */}
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowDetailsPanel(true)}
                >
                  <span>View Full Store Details</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Separator />

                {/* Action Buttons */}
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
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      {/* Shop Details Panel */}
      <ShopDetailsPanel
        open={showDetailsPanel}
        onOpenChange={setShowDetailsPanel}
        shopDetails={tileDetails}
      />
    </>
  );
};
