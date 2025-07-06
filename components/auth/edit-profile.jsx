"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { FaCamera } from "react-icons/fa6";
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react";

import { fetchUserByUsername, updateUser } from "@lib/actions/user.prisma";
import { departments } from "@constants/arrays";
import { cn } from "@lib/utils";

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

const EditProfile = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  const [wasNewImageUploaded, setWasNewImageUploaded] = useState(false);
  const [open, setOpen] = useState(false);

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
    const fetchUserFxn = async () => {
      if (session?.user) {
        const id = session.user.username;
        const fetchedUser = await fetchUserByUsername(id);
        setUser(fetchedUser);
      }
    };
    fetchUserFxn();
  }, [session?.user?.id]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        img: user.picture || "",
        bio: user.bio || "",
        about: user.about || "",
        gender: user.gender || "male",
        departmentName: user.departmentName || "",
        departmentInitial: user.departmentInitial || "",
        level: user.level || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (event) => {
    setWasNewImageUploaded(true);
    const file = event.target.files[0];
    if (file && file instanceof Blob) {
      try {
        const base = await convertToBase64(file);
        setForm((prev) => ({ ...prev, img: base }));
      } catch (err) {
        console.error("Image convert error", err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = {
      Name: form.name,
      About: form.about,
      Department: form.departmentName,
      Level: form.level,
    };

    for (const [label, value] of Object.entries(required)) {
      if (!value || value.trim() === "") {
        toast(`${label} is required`);
        return;
      }
    }

    try {
      setLoading(true);
      let updatedImageUrl = form.img;

      if (wasNewImageUploaded) {
        const res = await fetch("/api/cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: form.img }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error("Image upload failed");
        updatedImageUrl = data.url;
      }

      const success = await updateUser(parseInt(session?.user.id), {
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
        router.push("/profile");
      }
    } catch (err) {
      toast("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 mb-14">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Edit Your Profile
          </CardTitle>
          <CardDescription>Update your details below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <label htmlFor="file-input" className="relative w-24 h-24">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer">
                  {form.img ? (
                    <Image
                      src={form.img}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FaCamera className="text-gray-500 text-2xl" />
                  )}
                </div>
              </label>
            </div>

            <Input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />

            <Textarea
              name="about"
              placeholder="Tell us about yourself..."
              value={form.about}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm mb-1">Department</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
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
            </div>

            <div>
              <label className="block text-sm mb-1">Level</label>
              <Select
                value={form.level}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, level: val }))
                }
              >
                <SelectTrigger>
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
            </div>

            <div>
              <label className="block text-sm mb-1">Gender</label>
              <RadioGroup
                value={form.gender}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, gender: val }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <label htmlFor="male">Male</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <label htmlFor="female">Female</label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover::bg-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
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
