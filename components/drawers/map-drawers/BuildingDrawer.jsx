"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@components/ui/drawer";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import { Navigation, Share2, MapPin } from "lucide-react";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { useLocation } from "@components/providers/LocationProvider";
import { toast } from "sonner";
import {
  drawLineBetweenPoints,
  generateLocationLink,
} from "@constants/functions";

/**
 * Drawer for displaying building info (triggered when a label/marker is clicked)
 * @param {boolean} open - Whether the drawer is open
 * @param {function} onOpenChange - Function to toggle drawer open state
 * @param {object} building - Contains { placeName, longitude, latitude, category, locationDesc }
 */
export const BuildingDrawer = ({ open, onOpenChange, building }) => {
  const { viewer } = useCesiumViewer();
  const { currentPosition } = useLocation();
  const [loadingDirections, setLoadingDirections] = useState(false);

  if (!building) return null;
  console.log(building);

  const handleGetDirections = async () => {
    if (!building) return;
    const endLocation = {
      longitude: building.longitude,
      latitude: building.latitude,
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

  const handleCopyLink = () => {
    if (!building) return;
    const link = generateLocationLink(building.longitude, building.latitude);
    navigator.clipboard.writeText(link);
    toast.success("Building link copied to clipboard!");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] px-6 py-4">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-xl font-semibold">
            {building.placeName}
          </DrawerTitle>
          {building.category && (
            <Badge variant="secondary" className="mt-2">
              {building.category}
            </Badge>
          )}
        </DrawerHeader>

        <div className="flex flex-col items-center text-center mt-2 space-y-2">
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <p>{building.locationDesc || "Campus Building"}</p>
          </div>

          <Separator className="my-3 w-full" />

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Copy Link</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleGetDirections}
              className="flex items-center justify-center gap-2"
              disabled={loadingDirections}
            >
              {loadingDirections ? (
                <span className="text-xs">Loading...</span>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  <span className="text-xs">Get Directions</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
