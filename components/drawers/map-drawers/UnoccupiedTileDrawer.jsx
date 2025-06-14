"use client";

import { useState } from "react";
import {
  MapPin,
  X,
  Building,
  Bookmark,
  Move,
  AlertCircle,
  CheckCircle,
  Navigation,
  Share2,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";
import { Alert, AlertDescription } from "@components/ui/alert";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { shopCategories } from "@constants/arrays";
import {
  createShop,
  fetchUserShopByUserId,
  shopCouter,
  updateShopTileId,
} from "@lib/actions/shops.prisma";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import {
  drawLineBetweenPoints,
  generateLocationLink,
  load3DModel,
} from "@constants/functions";
import socket from "@components/socket/Socket";
import Link from "next/link";
import { Cartesian3 } from "cesium";
import { useLocation } from "@components/providers/LocationProvider";
import { toast } from "sonner";

// interface UnoccupiedTileDrawerProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   tileInfo: any
// }

// interface BusinessForm {
//   name: string
//   description: string
//   category: string
// }

// const initialForm: BusinessForm = {
//   name: "",
//   description: "",
//   category: "",
// }

export const UnoccupiedTileDrawer = ({ open, onOpenChange, tileInfo }) => {
  const { data: session } = useSession();
  const { viewer } = useCesiumViewer();
  const { currentPosition } = useLocation();

  const [currentStep, setCurrentStep] = useState("main");
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [selectedStoreForRelocation, setSelectedStoreForRelocation] =
    useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDirections, setLoadingDirections] = useState(false);

  // Fetch user's shop count
  const { data: shopCount = 0 } = useQuery({
    queryKey: ["shop-count", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      return await shopCouter(Number.parseFloat(session.user.id));
    },
    enabled: open && !!session?.user?.id,
  });

  // Fetch user's shops for relocation
  const { data: userShops = [] } = useQuery({
    queryKey: ["user-shops", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      return await fetchUserShopByUserId(Number.parseFloat(session.user.id));
    },
    enabled: currentStep === "relocate" && !!session?.user?.id,
  });

  const validateForm = () => {
    const errors = {};

    // Name validation
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      errors.name = "Business name is required";
    } else if (trimmedName.length < 3) {
      errors.name = "Business name must be at least 3 characters";
    } else if (trimmedName.length > 50) {
      errors.name = "Business name must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9\s&'-]+$/.test(trimmedName)) {
      errors.name = "Business name contains invalid characters";
    }

    // Description validation
    const trimmedDesc = form.description.trim();
    if (!trimmedDesc) {
      errors.description = "Description is required";
    } else if (trimmedDesc.length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (trimmedDesc.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    // Category validation
    if (!form.category) {
      errors.category = "Please select a category";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePitchSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (session) {
        const created = await createShop({
          id: parseFloat(tileInfo.id),
          name: form.name.trim(),
          description: form.description.trim(),
          longitude: tileInfo.longitude,
          latitude: tileInfo.latitude,
          kingdom: "default", // Replace with actual kingdom if needed
          category: form.category,
          userId: parseFloat(session?.user.id),
        });

        if (created) {
          load3DModel(
            viewer,
            form.name.trim(),
            tileInfo.longitude,
            tileInfo.latitude,
            tileInfo.id
          );
          socket.emit("shop_creation", {
            name: form.name.trim(),
            longitude: tileInfo.longitude,
            latitude: tileInfo.latitude,
            id: tileInfo.id,
          });
        }

        // Reset form and close drawer
        setForm("");
        setCurrentStep("main");
        onOpenChange(false);
      }
    } catch (error) {
      toast("Store Creation Failed");
      console.error("Error creating shop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelocationConfirm = async () => {
    if (!selectedStoreForRelocation) return;

    setIsSubmitting(true);
    try {
      const entityToRelocate = viewer.entities.getById(
        `tile-${selectedStoreForRelocation.id}`
      );
      if (entityToRelocate) {
        entityToRelocate.position = Cartesian3.fromDegrees(
          tileInfo.longitude,
          tileInfo.latitude
        );
        socket.emit("tile_relocate", {
          id: `tile-${selectedStoreForRelocation.id}`,
          longitude: tileInfo.longitude,
          latitude: tileInfo.latitude,
        });
      }

      const success = await updateShopTileId({
        storeName: selectedStoreForRelocation.name,
        newTileId: tileInfo.id,
        longitude: tileInfo.longitude,
        latitude: tileInfo.latitude,
        storeId: selectedStoreForRelocation.id,
      });

      if (success) {
        setCurrentStep("main");
        setSelectedStoreForRelocation(null);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error relocating shop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetDirections = async () => {
    const endLocation = {
      longitude: tileInfo.longitude,
      latitude: tileInfo.latitude,
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
    generateLocationLink(tileInfo.longitude, tileInfo.latitude);
  };

  const handleSaveToFavorites = () => {
    // Implement your bookmark/favorite logic here
    console.log("Saved to favorites:", tileDetails.name);
  };

  const renderMainContent = () => (
    <div className="p-6 space-y-6">
      {/* Action Buttons */}
      <div className="space-y-3">
        {session ? (
          <>
            <Button
              onClick={() => setCurrentStep("pitch")}
              className="w-full h-12"
            >
              <Building className="h-5 w-5 mr-2" />
              Pitch Your Business
            </Button>

            {shopCount >= 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep("relocate")}
                className="w-full h-12"
              >
                <Move className="h-5 w-5 mr-2" />
                Relocate Existing Store
                <Badge variant="secondary" className="ml-2">
                  {shopCount}
                </Badge>
              </Button>
            )}
          </>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to pitch a business or relocate stores.
              <div className="flex gap-2 mt-2">
                <Button asChild size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
  );

  const renderPitchForm = () => (
    <div className="px-6 py-3 space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Pitch Your Business</h2>
      </div>

      <div className="space-y-2">
        <div>
          <Label htmlFor="name">Business Name *</Label>
          <Input
            id="name"
            placeholder="Enter your business name"
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={formErrors.name ? "border-red-500" : ""}
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe what your business does..."
            value={form.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={formErrors.description ? "border-red-500" : ""}
            rows={4}
          />
          <div className="flex justify-between items-center mt-1">
            {formErrors.description && (
              <p className="text-red-500 text-sm">{formErrors.description}</p>
            )}
            <p className="text-gray-500 text-sm ml-auto">
              {form.description.length}/500
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={form.category}
            onValueChange={(value) => handleInputChange("category", value)}
          >
            <SelectTrigger
              className={formErrors.category ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {shopCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.category && (
            <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep("main")}
          className="flex-1"
        >
          Back
        </Button>
        <Button onClick={() => setCurrentStep("confirm")} className="flex-1">
          Review & Confirm
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="px-6 py-1 space-y-6">
      <div className="text-center">
        <div className="p-3 bg-green-50 rounded-lg inline-block mb-1">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold">Confirm Your Business</h2>
        <p className="text-gray-600 text-sm">
          Review your details before submitting
        </p>
      </div>

      <div className="space-y-3 bg-blue-50 px-4 py-2 rounded-lg">
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Business Name
          </Label>
          <p className="text-gray-900">{form.name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Category</Label>
          <p className="text-gray-900">{form.category}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <p className="text-gray-900 text-sm">{form.description}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep("pitch")}
          className="flex-1"
        >
          Edit Details
        </Button>
        <Button
          onClick={handlePitchSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Creating..." : "Confirm & Create"}
        </Button>
      </div>
    </div>
  );

  const renderRelocationList = () => (
    <div className="p-6 space-y-6">
      <div className="text-center ">
        <h2 className="text-lg font-semibold">Relocate Store</h2>
        <p className="text-gray-600 text-xs">
          Select which store you want to move to this location
        </p>
      </div>

      <ScrollArea className="h-60">
        <div className="space-y-3">
          {userShops.map((shop) => (
            <div
              key={shop.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedStoreForRelocation(shop);

                setCurrentStep("relocate-confirm");
              }}
            >
              <div>
                <h4 className="font-medium">{shop.name}</h4>
                <p className="text-sm text-gray-600">{shop.category}</p>
              </div>
              <Button size="sm">Select</Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Button
        variant="outline"
        onClick={() => setCurrentStep("main")}
        className="w-full"
      >
        Back
      </Button>
    </div>
  );

  const renderRelocationConfirm = () => (
    <div className="p-6 space-y-2">
      <div className="text-center">
        <div className="p-3 bg-orange-50 rounded-lg inline-block">
          <Move className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-lg font-semibold">Confirm Relocation</h2>
        <p className="text-gray-600 text-xs">
          Are you sure you want to move this store?
        </p>
      </div>

      {selectedStoreForRelocation && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Store to Relocate
            </Label>
            <p className="text-gray-900">{selectedStoreForRelocation.name}</p>
          </div>
        </div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This action will move your store from its current location to the
          selected tile. This cannot be undone.
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep("relocate")}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleRelocationConfirm}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Relocating..." : "Confirm Relocation"}
        </Button>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case "pitch":
        return renderPitchForm();
      case "confirm":
        return renderConfirmation();
      case "relocate":
        return renderRelocationList();
      case "relocate-confirm":
        return renderRelocationConfirm();
      default:
        return renderMainContent();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          {/* <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">
              Available Location
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div> */}

          <div className="flex items-cente justify-centerr">
            <div className="bg-blue-50 rounded-lg inline-block">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Tile {tileInfo.id}</h2>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1">{getStepContent()}</ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
