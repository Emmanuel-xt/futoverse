"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { createCandidate } from "@lib/actions/election";
import { CheckCircle, X } from "lucide-react";

const positions = [
  "President",
  "Vice President",
  "Secretary General",
  "Assistant Secretary General",
  "Financial Secretary",
  "Tresurer",
  "Public Relations Officer",
  "Social Director",
  "Sports Director",
  "Welfare Director",
  "Transport Director",
  "Information Director",
  "Health Director",
];

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export function CandidateRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    slogan: "",
    bio: "",
    manifesto: "",
    picture: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, picture: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let uploadedImageUrl = null;

      if (imageFile) {
        setIsUploading(true);
        const base64 = await convertToBase64(imageFile);
        const response = await fetch("/api/cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await response.json();
        if (!response.ok || !data.url) {
          throw new Error("Media upload failed");
        }
        uploadedImageUrl = data.url;
        setIsUploading(false);
      }

      const candidateData = {
        ...formData,
        picture: uploadedImageUrl || formData.picture,
      };

      const result = await createCandidate(candidateData, userId);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        console.error("Failed to register candidate:", result.error);
        alert("Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Error registering candidate:", error);
      alert("An error occurred. Please try again.");
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Registration Submitted!</h2>
            <p className="text-muted-foreground">
              Your candidacy has been submitted for review. You'll be notified
              once it's approved and published.
            </p>
            <Button onClick={() => router.push("/elections")} className="mt-4">
              Back to Elections
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Select
              value={formData.position}
              onValueChange={(value) => handleInputChange("position", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the position you're running for" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="picture">Profile Picture</Label>
            {!imagePreview ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <span className="text-sm text-muted-foreground">or</span>
                </div>
                <Input
                  type="url"
                  value={formData.picture}
                  onChange={(e) => handleInputChange("picture", e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Upload an image file or paste a direct image URL
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Click the X to remove and select a different image
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">Campaign Slogan</Label>
            <Input
              id="slogan"
              value={formData.slogan}
              onChange={(e) => handleInputChange("slogan", e.target.value)}
              placeholder="Your inspiring campaign slogan"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Why are you contesting? *</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell students why you're running and what motivates you..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manifesto">Your Manifesto *</Label>
            <Textarea
              id="manifesto"
              value={formData.manifesto}
              onChange={(e) => handleInputChange("manifesto", e.target.value)}
              placeholder="Outline your plans, policies, and what you'll do if elected..."
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Review Process</h3>
            <p className="text-sm text-muted-foreground">
              Your registration will be reviewed by the election committee. Only
              approved candidates will appear on the elections page. This
              process typically takes 1-2 business days.
            </p>
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isUploading ||
              !formData.name ||
              !formData.position ||
              !formData.bio ||
              !formData.manifesto
            }
            className="w-full"
          >
            {isUploading
              ? "Uploading Image..."
              : isSubmitting
                ? "Submitting..."
                : "Submit Registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
