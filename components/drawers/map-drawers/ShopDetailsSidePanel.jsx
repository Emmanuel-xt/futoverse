"use client";

import { X, Package, Star, Clock, Phone, Globe } from "lucide-react";
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
import { Separator } from "@components/ui/separator";

// interface ShopDetailsPanelProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   shopDetails: any
// }

// Mock items data - replace with real data later
const MOCK_ITEMS = [
  {
    id: 1,
    name: "Premium Coffee Beans",
    price: 25.99,
    image: "/placeholder.svg",
    inStock: true,
  },
  {
    id: 2,
    name: "Artisan Pastries",
    price: 8.5,
    image: "/placeholder.svg",
    inStock: true,
  },
  {
    id: 3,
    name: "Specialty Tea Collection",
    price: 18.75,
    image: "/placeholder.svg",
    inStock: false,
  },
  {
    id: 4,
    name: "Fresh Sandwiches",
    price: 12.0,
    image: "/placeholder.svg",
    inStock: true,
  },
  {
    id: 5,
    name: "Organic Smoothies",
    price: 9.25,
    image: "/placeholder.svg",
    inStock: true,
  },
];

export const ShopDetailsPanel = ({ open, onOpenChange, shopDetails }) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] w-full sm:max-w-md sm:ml-auto">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">
              {shopDetails?.name}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Full Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Full Description
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {shopDetails?.description}
              </p>
            </div>

            <Separator />

            {/* Store Hours */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Store Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">www.example-store.com</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Available Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Items
              </h3>
              <div className="space-y-3">
                {MOCK_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target;
                          target.src = "/placeholder.svg?height=48&width=48";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-green-600">
                          ${item.price}
                        </span>
                        <Badge
                          variant={item.inStock ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Customer Reviews
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">John D.</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Great service and quality products! Highly recommended.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                    <span className="text-sm font-medium">Sarah M.</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Good selection, friendly staff. Will visit again!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
