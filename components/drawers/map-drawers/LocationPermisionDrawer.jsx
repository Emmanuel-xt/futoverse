"use client";

import { MapPin, X, Smartphone, Settings, Chrome, Shield } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";

// interface LocationPermissionDrawerProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

const PERMISSION_STEPS = [
  {
    id: 1,
    title: "Browser Settings",
    icon: Chrome,
    steps: [
      "Click on the lock icon 🔒 in your browser's address bar",
      "Select 'Site Settings' or 'Permissions'",
      "Find 'Location' in the permissions list",
      "Change it from 'Block' to 'Allow'",
      "Refresh the page to apply changes",
    ],
  },
  {
    id: 2,
    title: "Mobile Device Settings",
    icon: Smartphone,
    steps: [
      "Open your device's Settings app",
      "Navigate to 'Privacy & Security' or 'Apps'",
      "Find your browser app (Chrome, Safari, etc.)",
      "Tap on 'Permissions' or 'App Permissions'",
      "Enable 'Location' permission",
      "Return to the app and refresh",
    ],
  },
  {
    id: 3,
    title: "System Settings (Desktop)",
    icon: Settings,
    steps: [
      "Open System Preferences/Settings",
      "Go to 'Security & Privacy' or 'Privacy'",
      "Click on 'Location Services'",
      "Enable location for your browser",
      "Restart your browser if needed",
    ],
  },
];

export const LocationPermissionDrawer = ({ open, onOpenChange }) => {
  const handleTestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert(`Location access granted! 
Latitude: ${position.coords.latitude.toFixed(4)}
Longitude: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          alert(`Location access denied: ${error.message}`);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-semibold">
                  Enable Location Access
                </DrawerTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Follow these steps to allow location permissions
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Privacy Notice</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    We only use your location to show you relevant nearby places
                    and improve your map experience. Your location data is never
                    shared without your permission.
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-step Instructions */}
            {PERMISSION_STEPS.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{section.title}</h3>
                      <Badge variant="outline" className="mt-1">
                        Method {index + 1}
                      </Badge>
                    </div>
                  </div>

                  <ol className="space-y-2 ml-4">
                    {section.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}

            {/* Test Location Button */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                Test Your Location Access
              </h4>
              <p className="text-sm text-green-700 mb-4">
                Click the button below to test if location permissions are
                working correctly.
              </p>
              <Button
                onClick={handleTestLocation}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Test Location Access
              </Button>
            </div>

            {/* Common Issues */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">
                Still Having Issues?
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Make sure you're using HTTPS (secure connection)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Try clearing your browser cache and cookies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Disable any VPN or proxy services temporarily</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>
                    Check if location services are enabled on your device
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Got It, Thanks!
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
