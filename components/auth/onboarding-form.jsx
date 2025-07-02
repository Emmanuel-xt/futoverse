"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User,
  AtSign,
  FileText,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { cn } from "@lib/utils";

import { Alert, AlertDescription } from "@components/ui/alert";
import { completeUserProfile } from "@lib/actions/user-actions";
import { useSession } from "next-auth/react";
import { departments } from "@constants/arrays";

const onboardingSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  about: z.string().max(160, "About must be less than 160 characters"),
  department: z.object({
    name: z.string(),
    initial: z.string(),
  }),
  gender: z.enum(["male", "female", "other"]),
  level: z.string(), // if using level
});

export default function OnboardingForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [submitError, setSubmitError] = useState("");
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      about: "",
      department: undefined,
      gender: undefined,
      level: "",
    },
  });

  const onSubmit = async (data) => {
    if (!session?.user?.id) {
      setSubmitError("Session not found. Please try logging in again.");
      return;
    }

    try {
      setSubmitError("");

      const result = await completeUserProfile(session.user.id, {
        username: data.username.trim().toLowerCase(),
        about: data.about?.trim(),
        departmentName: data.department?.name,
        departmentInitial: data.department?.initial,
        level: data.level,
        gender: data.gender,
      });

      if (result.success) {
        // Update the session with new user data
        await update({
          ...session,
          user: {
            ...session.user,
            username: data.username,
            about: data.about,
            department: data.department,
            level: data.level,
            gender: data.gender,
            needsOnboarding: false,
          },
        });

        console.log("Profile updated successfully:", result.user);

        // await update();

        router.push("/profile");
      } else {
        setSubmitError(
          result.error || "Failed to complete profile. Please try again."
        );
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Welcome {session.user.name}! Let&apos;s set up your profile to get
            started.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="Choose a unique username"
                          className="pl-10"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSubmitError("");
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Textarea
                          placeholder="Tell us a bit about yourself..."
                          className="pl-10 min-h-[80px] resize-none"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSubmitError("");
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => {
                  const selectedDepartment = departments.find(
                    (dept) => dept.name === field.value?.name
                  );

                  return (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {selectedDepartment?.name || "Select department"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search department..." />
                            <CommandList>
                              <CommandEmpty>No department found.</CommandEmpty>
                              <CommandGroup>
                                {departments.map((department) => (
                                  <CommandItem
                                    key={department.initial}
                                    value={department.name}
                                    onSelect={() => {
                                      field.onChange({
                                        name: department.name,
                                        initial: department.initial,
                                      });
                                      setOpen(false);
                                    }}
                                  >
                                    {department.name}
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        field.value?.name === department.name
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
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="level" // ✅ not department
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing profile...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
