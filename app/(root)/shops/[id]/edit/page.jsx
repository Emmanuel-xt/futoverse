"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import {
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

const EditProfile = ({ params }) => {
  const router = useRouter();
  const shopId = params.id.replace(/%20/g, " ");
  const [shop, setShop] = useState(null);
  const [wasNewImageUploaded, setWasNewImageUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true); // Initial loading state set to true
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUserShop = async () => {
      try {
        const fetchedShop = await fetchUserShopById(shopId);
        setShop(fetchedShop);
        setForm((prevForm) => ({
          ...prevForm,
          name: fetchedShop?.name || "",
          desc: fetchedShop?.description || "",
          image: fetchedShop?.image || "",
          category: fetchedShop?.category || "",
        }));
      } catch (error) {
        console.error("Error fetching shop:", error);
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
    category: "",
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let updatedImageUrl = form.image; // Default to existing form image

      if (wasNewImageUploaded) {
        // Cloudinary upload
        const response = await fetch("/api/cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: form.image }),
        });
        const data = await response.json();

        if (!response.ok) {
          console.error("Image upload error:", data.error);
          return; // Exit if upload fails
        }

        // Update form with the Cloudinary URL
        updatedImageUrl = data.url;
        setForm((prev) => ({
          ...prev,
          image: updatedImageUrl,
        }));
      }

      // Save to the database with the Cloudinary URL
      const wasShopUpdated = await updateShopDetails(shopId, {
        name: form.name,
        image: updatedImageUrl, // Use updated Cloudinary URL here
        desc: form.desc,
        category: form.category,
      });
      setLoading(false);
      router.back();

      //   console.log("Shop updated:", wasShopUpdated);
    } catch (error) {
      console.error("Error updating shop:", error);
    }
  };

  const [error, setError] = useState(null);

  // Only preview image on selection; actual upload happens on submit
  const handleFileChange = async (event) => {
    setWasNewImageUploaded(true);
    console.log("wasNewImageUploaded", wasNewImageUploaded);
    console.error("file change triggerd");
    const file = event.target.files[0];
    console.log("Selected file:", file);

    // Check if the file is valid
    if (file && file instanceof Blob) {
      try {
        // Convert the file to base64 for preview
        const base64 = await convertToBase64(file);
        console.error("about to convert");

        setForm((prev) => ({ ...prev, image: base64 })); // Preview image immediately
        console.error("converted");
      } catch (uploadError) {
        console.error("Error while converting image to base64:", uploadError);
      }
    } else {
      setError("Please select a valid image file");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-6 mb-10">
      <div className="relative w-full max-w-2xl">
        <h1 className="text-center text-2xl font-bold text-gray-800">
          Customize Your Store
        </h1>
      </div>

      <div className="mt-6">
        <div className="rounded-full w-32 h-32 border a flex justify-center items-center cursor-pointer">
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />

          {/* Camera icon button to trigger file input */}
          <label htmlFor="file-input" className="absolute cursor-pointer">
            <FaCamera className="text-3xl text-gray-600" />
          </label>

          {/* Display the selected image */}
          {form.image && (
            <Image
              src={form.image}
              alt="Profile_image"
              width={100}
              height={100}
              className="rounded-full w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="mt-8 w-full max-w-md bg-white p-6 shadow-lg rounded-lg">
        <form>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Store Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              name="description"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief Description of what you do"
              value={form.desc}
              onChange={(e) => handleChange("desc", e.target.value)}
            ></textarea>
          </div>

          <div className="w-full">
            <label htmlFor="category" className="text-sm text-slate-700">
              Category
            </label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  aria-expanded={open}
                  className="w-full justify-between flex items-center border p-2 rounded-md"
                >
                  {form.category || "Select Business Category"}
                  <ChevronsUpDown className="opacity-50 ml-auto" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search department..." />
                  <CommandList>
                    <CommandEmpty>Department Not Found.</CommandEmpty>
                    <CommandGroup>
                      {shopCategories.map((category) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={() => {
                            setForm((prev) => ({
                              ...prev,
                              category: category,
                            }));
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
            onClick={handleSubmit}
            type="submit"
            className={`w-full mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading && "cursor-wait"
            }`}
          >
            {loading ? "Saving ..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
