"use client";

import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import Image from "next/image";
import { fetchUserByUsername, updateUser } from "@lib/actions/user.prisma";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaCamera } from "react-icons/fa6";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { departments } from "constants/arrays";
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

const EditProfile = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState({});
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wasNewImageUploaded, setWasNewImageUploaded] = useState(false);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUserFxn = async () => {
      if (session?.user) {
        const id = session.user.username;
        const fetchedUser = await fetchUserByUsername(id);
        setUser(fetchedUser);
      }
    };
    fetchUserFxn();
  }, [session?.user?.id]);
  console.log("Image iMAGES", user);

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

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        img: user.picture || "",
        bio: user.bio || "",
        about: user.about || "",
        gender: user.gender || "male", // Ensure default value is set
        departmentName: user.departmentName || "", // Department name from user
        departmentInitial: user.departmentInitial || "", // Department initial
        level: user.level || "", // Level from user
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = parseFloat(session?.user.id);

    try {
      setLoading(true);
      let updatedImageUrl = form.img;

      if (wasNewImageUploaded) {
        const response = await fetch("/api/cloudinary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: form.img }),
        });
        const data = await response.json();
        if (!response.ok) {
          // Handle error
        }
        updatedImageUrl = data.url;
        setForm((prev) => ({
          ...prev,
          img: updatedImageUrl,
        }));
      }

      const success = await updateUser(id, {
        name: form.name,
        about: form.about,
        bio: form.bio,
        gender: form.gender,
        departmentName: form.departmentName,
        departmentInitial: form.departmentInitial,
        levelName: form.level,
        img: updatedImageUrl,
      });

      if (success) router.push("/profile");
    } catch (error) {
      console.error("Error updating user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    setWasNewImageUploaded(true);
    const file = event.target.files[0];
    if (file && file instanceof Blob) {
      try {
        const base = await convertToBase64(file);
        setForm((prev) => ({ ...prev, img: base }));
      } catch (uploadError) {
        console.error("Error while converting image to base64:", uploadError);
      }
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-6 mb-10">
      <div className="relative w-full max-w-2xl">
        <h1 className="text-center text-2xl font-bold text-gray-800">
          My Profile
        </h1>
      </div>

      <div className="mt-6">
        <div className="rounded-full w-32 h-32 border flex justify-center items-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="absolute cursor-pointer">
            <FaCamera className="text-3xl text-gray-600" />
          </label>
          {form.img && (
            <Image
              src={form.img}
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
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-gray-700 font-medium mb-2"
            >
              Gender
            </label>
            <RadioGroup
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  gender: value,
                }))
              }
              value={form.gender} // Ensuring gender value is correctly set
            >
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <label htmlFor="male">Male</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <label htmlFor="female">Female</label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="mb-4">
            <label
              htmlFor="about"
              className="block text-gray-700 font-medium mb-2"
            >
              About
            </label>
            <textarea
              id="about"
              rows="4"
              name="about"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write about yourself"
              value={form.about}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="w-full mb-4">
            <label htmlFor="department" className="text-sm text-slate-700">
              Department
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  aria-expanded={open}
                  className="w-full justify-between flex items-center border p-2 rounded-md"
                >
                  {form.departmentName || "Select department"}
                  <ChevronsUpDown className="opacity-50 ml-auto" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search department..." />
                  <CommandList>
                    <CommandEmpty>Department Not Found.</CommandEmpty>
                    <CommandGroup>
                      {departments.map((department) => (
                        <CommandItem
                          key={department.initial}
                          value={department.name}
                          onSelect={() => {
                            setForm((prev) => ({
                              ...prev,
                              departmentName: department.name,
                              departmentInitial: department.initial,
                            }));
                            setOpen(false);
                          }}
                        >
                          {department.name}
                          <Check
                            className={cn(
                              "ml-auto",
                              form.departmentName === department.name
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

          <div className="w-full mb-4">
            <label htmlFor="level" className="text-sm text-slate-700">
              Level
            </label>
            <Select
              value={form.level}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, level: value }))
              }
            >
              <SelectTrigger className="md:max-w-[50%] bg-dark-1 border-primary-500 outline-none">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="border-primary-500">
                {[
                  "100",
                  "200",
                  "300",
                  "400",
                  "500",
                  "600",
                  "Alumni",
                  "Others",
                ].map((level) => (
                  <SelectItem
                    key={level}
                    value={level}
                    className="hover:bg-dark-3"
                  >
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
