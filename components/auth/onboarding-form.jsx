"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, User, AtSign, FileText } from "lucide-react";
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
import { Alert, AlertDescription } from "@components/ui/alert";
import { completeUserProfile } from "@lib/actions/user-actions";

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
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  department: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export default function OnboardingForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [submitError, setSubmitError] = useState("");

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      bio: "",
      department: "",
      gender: undefined,
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
        bio: data.bio?.trim(),
        department: data.department,
        gender: data.gender,
      });

      if (result.success) {
        // Update the session with new user data
        await update({
          ...session,
          user: {
            ...session.user,
            username: data.username,
            bio: data.bio,
            department: data.department,
            gender: data.gender,
          },
        });

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
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
