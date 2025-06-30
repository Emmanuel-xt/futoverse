"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Loader2, CheckCircle, Send } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
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
import { Alert, AlertDescription } from "@components/ui/alert";
import { sendPasswordResetEmail } from "@lib/actions/auth-actions";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitError("");

      const result = await sendPasswordResetEmail(data.email);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(
          result.error || "Failed to send reset email. Please try again."
        );
      }
    } catch (error) {
      setSubmitError("Failed to send reset email. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-gray-900">
                {form.getValues("email")}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    Didn&apos;t receive the email?
                  </p>
                  <p>
                    Check your spam folder or try again with a different email
                    address.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
            >
              Try Different Email
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-pink-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
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
                    Sending reset link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
