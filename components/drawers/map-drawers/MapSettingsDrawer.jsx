"use client";

import { useState } from "react";
import { Settings, X, Eye, Users, Globe, Shirt, MapPin } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Separator } from "@components/ui/separator";
import { LocationPermissionDrawer } from "./LocationPermisionDrawer";
import { OutfitChangerDrawer } from "./OutfitChangerDrawer";

// interface SettingsDrawerProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

export const SettingsDrawer = ({ open, onOpenChange }) => {
  const [locationVisibility, setLocationVisibility] = useState("friends");
  const [openLocationPermission, setOpenLocationPermission] = useState(false);
  const [openOutfitChanger, setOpenOutfitChanger] = useState(false);

  const locationOptions = [
    {
      id: "me",
      label: "Only Me",
      icon: Eye,
      description: "Your location is completely private",
    },
    {
      id: "friends",
      label: "My Friends",
      icon: Users,
      description: "Only your friends can see your location",
    },
    {
      id: "everybody",
      label: "Everybody",
      icon: Globe,
      description: "Anyone can see your location",
    },
  ];

  const handleLocationVisibilityChange = (optionId) => {
    setLocationVisibility(optionId);
  };

  const settingsItems = [
    // {
    //   id: "location-visibility",
    //   title: "Location Visibility",
    //   description: "Choose who can see your location",
    //   icon: Eye,
    //   content: (
    //     <div className="space-y-4 mt-4">
    //       {locationOptions.map((option) => {
    //         const IconComponent = option.icon;
    //         return (
    //           <div key={option.id} className="flex items-start space-x-3">
    //             <Checkbox
    //               id={option.id}
    //               checked={locationVisibility === option.id}
    //               onCheckedChange={() =>
    //                 handleLocationVisibilityChange(option.id)
    //               }
    //               className="mt-1"
    //             />
    //             <div className="flex-1">
    //               <label
    //                 htmlFor={option.id}
    //                 className="flex items-center gap-2 text-sm font-medium cursor-pointer"
    //               >
    //                 <IconComponent className="h-4 w-4" />
    //                 {option.label}
    //               </label>
    //               <p className="text-xs text-gray-500 mt-1">
    //                 {option.description}
    //               </p>
    //             </div>
    //           </div>
    //         );
    //       })}
    //     </div>
    //   ),
    // },
    {
      id: "outfit-changer",
      title: "Model",
      description: "Select your choice model",
      icon: Shirt,
      action: () => setOpenOutfitChanger(true),
    },
    {
      id: "location-permission",
      title: "Can't see your location?",
      description: "Learn how to enable location access",
      icon: MapPin,
      action: () => setOpenLocationPermission(true),
    },
  ];

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Settings className="h-6 w-6" />
                </div>
                <DrawerTitle className="text-xl font-semibold">
                  Settings
                </DrawerTitle>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-6 space-y-6">
            {settingsItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={item.id}>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                          </div>
                          {item.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={item.action}
                            >
                              Choose
                            </Button>
                          )}
                        </div>
                        {item.content && item.content}
                      </div>
                    </div>
                  </div>
                  {index < settingsItems.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              );
            })}

            {/* Save Button */}
            <div className="pt-4">
              <Button
                className="w-full bg-primary hover:bg-primary"
                onClick={() => onOpenChange(false)}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Sub-drawers */}
      <LocationPermissionDrawer
        open={openLocationPermission}
        onOpenChange={setOpenLocationPermission}
      />
      <OutfitChangerDrawer
        open={openOutfitChanger}
        onOpenChange={setOpenOutfitChanger}
      />
    </>
  );
};
