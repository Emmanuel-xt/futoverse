"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { FaCamera } from "react-icons/fa6";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  User,
  CheckCircle,
} from "lucide-react";

import { fetchUserByUsername, updateUser } from "@lib/actions/user.prisma";
import { departments } from "@constants/arrays";
import { cn } from "@lib/utils";
// import { ProfileFormSkeleton } from "@/components/profile-form-skeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { ProfileFormSkeleton } from "./profile-form-skeleton";

const EditProfile = () => {
  const { data: session, update } = useSession();
  const router = useRouter();

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Data states
  const [user, setUser] = useState(null);
  const [wasNewImageUploaded, setWasNewImageUploaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    img: "",
    bio: "",
    about: "",
    gender: "male",
    departmentName: "",
    departmentInitial: "",
    level: "",
  });

  // Fetch user data with proper loading state
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.username) return;

      try {
        setIsInitialLoading(true);
        const fetchedUser = await fetchUserByUsername(session.user.username);
        setUser(fetchedUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchUserData();
  }, [session?.user?.username]);

  console.log("user", user);

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        img: user.picture || "",
        bio: user.bio || "",
        about: user.about || "",
        gender: user.gender || "male",
        departmentName: user.department?.name || "",
        // departmentInitial: user.department?.initial || "",
        level: user.level?.name || "",
      });
    }
  }, [user]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    const required = {
      name: "Name",
      about: "About",
      departmentName: "Department",
      level: "Level",
    };

    for (const [field, label] of Object.entries(required)) {
      if (!form[field] || form[field].trim() === "") {
        newErrors[field] = `${label} is required`;
      }
    }

    // Additional validations
    if (form.name && form.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (form.about && form.about.length > 500) {
      newErrors.about = "About section must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    try {
      setWasNewImageUploaded(true);
      const base64 = await convertToBase64(file);
      setForm((prev) => ({ ...prev, img: base64 }));
      toast.success("Image selected successfully");
    } catch (error) {
      console.error("Image conversion error:", error);
      toast.error("Failed to process image");
    }
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

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (isSubmitting || isSubmitted) return;

    try {
      setIsSubmitting(true);
      let updatedImageUrl = form.img;

      // Upload image if new one was selected
      if (wasNewImageUploaded && form.img) {
        const res = await fetch("/api/cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: form.img }),
        });

        if (!res.ok) {
          throw new Error("Image upload failed");
        }

        const data = await res.json();
        updatedImageUrl = data.url;
      }

      // Update user profile
      const success = await updateUser(Number.parseInt(session?.user.id), {
        name: form.name,
        about: form.about,
        bio: form.bio,
        gender: form.gender,
        departmentName: form.departmentName,
        departmentInitial: form.departmentInitial,
        levelName: form.level,
        img: updatedImageUrl,
      });

      if (success) {
        // Update session
        await update({
          ...session,
          user: {
            ...session.user,
            name: form.name,
            about: form.about,
            department: form.departmentName,
            level: form.level,
            gender: form.gender,
          },
        });

        setIsSubmitted(true);
        toast.success("Profile updated successfully!");

        // Navigate after a short delay to show success state
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Show loading skeleton while fetching initial data
  if (isInitialLoading || !session?.user) {
    return <ProfileFormSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 mb-14">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Edit Your Profile
          </CardTitle>
          <CardDescription className="text-gray-600">
            Update your details below
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex justify-center">
              <label
                htmlFor="file-input"
                className="relative group cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                  disabled={isSubmitting || isSubmitted}
                />
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:shadow-lg transition-all duration-200 border-4 border-white shadow-md">
                  {form.img ? (
                    <Image
                      src={form.img || "/placeholder.svg"}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FaCamera className="text-gray-400 text-2xl group-hover:text-gray-600 transition-colors" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <FaCamera className="text-white text-xs" />
                </div>
              </label>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                disabled={isSubmitting || isSubmitted}
                className={cn(
                  "transition-all duration-200 focus:ring-2 focus:ring-purple-500",
                  errors.name && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* About Field */}
            <div className="space-y-2">
              <Textarea
                name="about"
                placeholder="Tell us about yourself..."
                value={form.about}
                onChange={handleChange}
                disabled={isSubmitting || isSubmitted}
                className={cn(
                  "min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-purple-500 resize-none",
                  errors.about && "border-red-500 focus:ring-red-500"
                )}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                {errors.about && (
                  <p className="text-sm text-red-500">{errors.about}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {form.about.length}/500
                </p>
              </div>
            </div>

            {/* Department Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between transition-all duration-200 hover:border-purple-300",
                      errors.departmentName && "border-red-500",
                      isSubmitting || isSubmitted
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    )}
                    disabled={isSubmitting || isSubmitted}
                  >
                    {form.departmentName || "Select department"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search department..." />
                    <CommandList>
                      <CommandEmpty>No department found.</CommandEmpty>
                      <CommandGroup>
                        {departments.map((dept) => (
                          <CommandItem
                            key={dept.initial}
                            value={dept.name}
                            onSelect={() => {
                              setForm((prev) => ({
                                ...prev,
                                departmentName: dept.name,
                                departmentInitial: dept.initial,
                              }));
                              setOpen(false);
                              if (errors.departmentName) {
                                setErrors((prev) => ({
                                  ...prev,
                                  departmentName: "",
                                }));
                              }
                            }}
                          >
                            {dept.name}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                form.departmentName === dept.name
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
              {errors.departmentName && (
                <p className="text-sm text-red-500">{errors.departmentName}</p>
              )}
            </div>

            {/* Level Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Level *
              </label>
              <Select
                value={form.level}
                onValueChange={(val) => {
                  setForm((prev) => ({ ...prev, level: val }));
                  if (errors.level) {
                    setErrors((prev) => ({ ...prev, level: "" }));
                  }
                }}
                disabled={isSubmitting || isSubmitted}
              >
                <SelectTrigger
                  className={cn(
                    "transition-all duration-200 hover:border-purple-300",
                    errors.level && "border-red-500"
                  )}
                >
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "100",
                    "200",
                    "300",
                    "400",
                    "500",
                    "600",
                    "Alumni",
                    "Others",
                  ].map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level}</p>
              )}
            </div>

            {/* Gender Field */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <RadioGroup
                value={form.gender}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, gender: val }))
                }
                className="flex gap-6"
                disabled={isSubmitting || isSubmitted}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <label htmlFor="male" className="text-sm font-medium">
                    Male
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <label htmlFor="female" className="text-sm font-medium">
                    Female
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={cn(
                "w-full transition-all duration-300 font-medium py-2.5",
                isSubmitted
                  ? "bg-green-600 hover:bg-green-600"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              )}
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Profile Updated!
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
