"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Button } from "@components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Category is required"),
  locationDesc: z
    .string()
    .min(1, "Location description is required")
    .max(200, "Location description must be less than 200 characters"),
  image: z.string().optional(),
});

export default function CreateStoreDrawer({
  open,
  onOpenChange,
  onCreateStore,
  categories,
  isLoading,
  userId,
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      locationDesc: "",
      image: "",
    },
  });

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      form.setError("image", { message: "Please select a valid image file" });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      form.setError("image", { message: "Image size must be less than 5MB" });
      return;
    }

    setIsUploadingImage(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", file);

      // You'll need to implement your image upload endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await response.json();

      form.setValue("image", url);
      setImagePreview(url);
      form.clearErrors("image");
    } catch (error) {
      console.error("Image upload failed:", error);
      form.setError("image", {
        message: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    form.setValue("image", "");
    setImagePreview(null);
    form.clearErrors("image");
  };

  const onSubmit = (data) => {
    const randomLocation = getRandomLocationAroundCampus(); // 🌍 Add location to payload

    onCreateStore({
      ...data,
      userId: userId, // Use userId from session
      latitude: randomLocation.latitude,
      longitude: randomLocation.longitude,
    });
  };

  const handleOpenChange = (newOpen) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
        setImagePreview(null);
      }
    }
  };

  const polygon = [
    [6.954118808695114, 5.406675096979285],
    [6.954118808695114, 5.363564913592128],
    [6.977664233225198, 5.363564913592128],
    [6.977664233225198, 5.406675096979285],
  ];

  const lngs = polygon.map((p) => p[0]);
  const lats = polygon.map((p) => p[1]);

  const lngMin = Math.min(...lngs);
  const lngMax = Math.max(...lngs);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);

  function getRandomLocationAroundCampus() {
    const latitude = Math.random() * (latMax - latMin) + latMin;
    const longitude = Math.random() * (lngMax - lngMin) + lngMin;
    return { latitude, longitude };
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Create New Store</DrawerTitle>
          <DrawerDescription>
            Fill in the details below to create your new store. You can add more
            details later.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Store Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your store name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter((cat) => cat !== "All categories")
                          .map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your store and what you offer..."
                        className="min-h-[100px]"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Description */}
              <FormField
                control={form.control}
                name="locationDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Description *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Downtown Main Street, Near Central Park"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              {/* <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {imagePreview ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                            <Image
                              src={imagePreview || "/placeholder.svg"}
                              alt="Store preview"
                              fill
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Upload a store image (optional)
                              </p>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isLoading || isUploadingImage}
                                className="max-w-xs mx-auto"
                              />
                            </div>
                          </div>
                        )}
                        {isUploadingImage && (
                          <p className="text-sm text-muted-foreground text-center">
                            Uploading image...
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </form>
          </Form>
        </div>

        <DrawerFooter>
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading || isUploadingImage}
              className="flex-1 bg-primary hover:bg-primary"
            >
              {isLoading ? "Creating..." : "Create Store"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
