"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { useSession } from "next-auth/react";
import {
  fetchShopForEditing,
  fetchUserShopById,
  updateShopDetails,
} from "@lib/actions/shops.prisma";
import Image from "next/image";
import { shopCategories } from "@constants/arrays";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { cn } from "@lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { IoCameraReverseOutline } from "react-icons/io5";

const EditStoreProfile = ({ params }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const shopId = params.id.replace(/%20/g, " ");
  const [shop, setShop] = useState(null);
  const [wasNewImageUploaded, setWasNewImageUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true); // Initial loading state set to true
  const [open, setOpen] = useState(false);
  const [wasNewUpload, setWasNewUpload] = useState({
    image: false,
    coverImage: false,
  });

  useEffect(() => {
    const fetchUserShop = async () => {
      try {
        const fetchedShop = await fetchShopForEditing(shopId);
        setShop(fetchedShop);
        setForm((prevForm) => ({
          ...prevForm,
          name: fetchedShop?.name || "",
          desc: fetchedShop?.description || "",
          image: fetchedShop?.image || "",
          category: fetchedShop?.category || "",
          locationDesc: fetchedShop?.locationDesc || "",
          coverImage: fetchedShop?.coverImage || "",
          model: fetchedShop?.model || "",
        }));
      } catch (error) {
        // console.error("Error fetching shop:", error);
      } finally {
        setLoadingShop(false); // Set loading to false after fetching is complete
      }
    };
    fetchUserShop();
  }, [shopId]);

  const [form, setForm] = useState({
    name: shop?.name || "",
    image: shop?.image || "",
    desc: shop?.description || "",
    category: shop?.description || "",
    locationDesc: shop?.locationDesc || "",
    coverImage: shop?.coverImage || "",
    model: shop?.model || "",
  });

  const handleChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const uploadedFields = {};

      // Upload images only if changed
      for (const key of ["image", "coverImage"]) {
        if (wasNewUpload[key]) {
          const response = await fetch("/api/cloudinary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: form[key] }), // Sending the base64 for upload
          });
          const data = await response.json();
          if (!response.ok) {
            // console.error(`${key} upload failed:`, data.error);
            setLoading(false);
            return;
          }
          uploadedFields[key] = data.url; // Get Cloudinary URL
        } else {
          uploadedFields[key] = form[key]; // Use existing value (URL)
        }
      }

      // Update shop details with Cloudinary URL
      const userId = parseInt(session?.user?.id);
      const result = await updateShopDetails(shopId, {
        name: form.name,
        image: uploadedFields.image,
        coverImage: uploadedFields.coverImage,
        desc: form.desc,
        category: form.category,
        locationDesc: form.locationDesc,
      }, userId);

      if (!result.success) {
        setError(result.error || "Failed to update shop");
        setLoading(false);
        return;
      }

      setLoading(false);
      router.back();
    } catch (error) {
      // console.error("Error updating shop:", error);
      setLoading(false);
    }
  };

  const [error, setError] = useState(null);

  // Only preview image on selection; actual upload happens on submit
  const handleFileChange = async (event, field) => {
    const file = event.target.files[0];
    if (file && file instanceof Blob) {
      try {
        const base64 = await convertToBase64(file);
        setForm((prev) => ({ ...prev, [field]: base64 }));
        setWasNewUpload((prev) => ({ ...prev, [field]: true }));
      } catch (uploadError) {
        // console.error("Error converting to base64:", uploadError);
        setError("Failed to preview image.");
      }
    } else {
      setError("Please select a valid image file");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 w-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="cover-upload"
            onChange={(e) => handleFileChange(e, "coverImage")}
          />
          <label
            htmlFor="cover-upload"
            className="absolute z-10 bottom-2 right-2 cursor-pointer"
          >
            <div className="bg-white p-2 rounded-full">
              <IoCameraReverseOutline className="text-2xl text-black" />
            </div>
          </label>
          {form?.coverImage ? (
            <Image
              src={form.coverImage}
              alt="Cover"
              layout="fill"
              className="object-cover"
            />
          ) : (
            <p className="text-white font-semibold text-xl">No Cover Image</p>
          )}
        </div>

        {/* Profile Image */}
        <div className="relative w-32 h-32  -mt-16 mx-auto border-4 border-white rounded-full bg-white overflow-">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="profile-upload"
            onChange={(e) => handleFileChange(e, "image")}
          />
          <label
            htmlFor="profile-upload"
            className="absolute  -right-3 bottom-2 inset- cursor-pointer z-20 flex items-center justify-center "
          >
            <div className="bg-white p-2 rounded-full border">
              <IoCameraReverseOutline className="text-2xl text-black" />
            </div>
          </label>
          {form.image ? (
            <Image
              src={form.image}
              alt="Profile"
              fill
              className="object-cover rounded-full"
            />
          ) : (
            <Image
              src="/images/noProfile.png"
              alt="No profile"
              fill
              className="object-cover rounded-full border border-"
            />
          )}
        </div>

        {/* Form */}
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-gray-700">
              Store Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full mt-1 border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={form.desc}
              onChange={(e) => handleChange("desc", e.target.value)}
              rows={3}
              className="w-full mt-1 border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
              placeholder="Brief description of what you do"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">
              Location Description
            </label>
            <textarea
              value={form.locationDesc}
              onChange={(e) => handleChange("locationDesc", e.target.value)}
              rows={2}
              className="w-full mt-1 border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., Beside Student Center, Opposite Library"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Category</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full justify-between flex items-center border px-4 py-2 rounded-md"
                >
                  {form.category || "Select Business Category"}
                  <ChevronsUpDown className="opacity-50 ml-auto" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search category..." />
                  <CommandList>
                    <CommandEmpty>No Category Found</CommandEmpty>
                    <CommandGroup>
                      {shopCategories.map((category) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={() => {
                            handleChange("category", category);
                            setOpen(false);
                          }}
                        >
                          {category}
                          <Check
                            className={cn(
                              "ml-auto",
                              form.category === category
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <button
            disabled={loading}
            type="submit"
            className={`w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 ${
              loading && "cursor-wait opacity-70"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditStoreProfile;
