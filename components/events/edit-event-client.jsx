"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { Badge } from "@components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Tag,
  X,
  ArrowLeft,
} from "lucide-react";
import { updateEvent } from "@lib/actions/events.prisma";
import { toast } from "sonner";
// import { updateEvent } from "@/lib/actions";

export default function EditEventClient({ event }) {
  console.log("Event", event);
  const router = useRouter();
  const [tags, setTags] = useState(event.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isOnline, setIsOnline] = useState(event.isOnline);
  const [category, setCategory] = useState(event.category || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date for datetime-local input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
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
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const file = formData.get("image");

      let imageUrl = event.image; // fallback to old image

      if (file && file.size > 0) {
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
        imageUrl = data.url;
      }

      const eventData = {
        id: event.id,
        title: formData.get("title"),
        description: formData.get("description"),
        date: formData.get("date"),
        endDate: formData.get("endDate"),
        location: formData.get("location"),
        image: imageUrl,
        category: category,
        organizer: formData.get("organizer"),
        maxAttendees: Number.parseInt(formData.get("maxAttendees")),
        price: Number.parseFloat(formData.get("price")),
        isOnline: isOnline,
        tags: tags,
      };

      console.log("Event Data to Update:", eventData);

      const isUpdated = await updateEvent(eventData);

      if (!isUpdated) {
        toast("Failed to update event");
        return;
      }

      // Redirect to event details page on success
      router.push(`/finds/events/${event.id}`);
    } catch (error) {
      console.error("Error updating event:", error);
      // You can add error handling here (toast, alert, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Event</h1>
        <p className="text-gray-600">Update your event details</p>
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Edit Event Details</CardTitle>
              <CardDescription className="text-blue-100">
                Update your event information
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label
                  htmlFor="title"
                  className="text-lg font-semibold flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Event Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={event.title}
                  placeholder="Enter event title"
                  className="mt-2 h-12 text-lg"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-lg font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={event.description}
                  placeholder="Describe your event in detail..."
                  className="mt-2 min-h-[120px] text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-lg font-semibold">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Health">Health & Wellness</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="organizer" className="text-lg font-semibold">
                  Organizer
                </Label>
                <Input
                  id="organizer"
                  name="organizer"
                  defaultValue={event.organizer}
                  placeholder="Organization or person name"
                  className="mt-2 h-12"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date" className="text-lg font-semibold">
                  Start Date & Time
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  defaultValue={formatDateForInput(event.date)}
                  className="mt-2 h-12"
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-lg font-semibold">
                  End Date & Time
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  defaultValue={formatDateForInput(event.endDate)}
                  className="mt-2 h-12"
                  required
                />
              </div>
            </div>

            {/* Location and Online */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOnline"
                  checked={isOnline}
                  onCheckedChange={(checked) => setIsOnline(checked)}
                />
                <Label htmlFor="isOnline" className="text-lg font-semibold">
                  This is an online event
                </Label>
              </div>

              <div>
                <Label
                  htmlFor="location"
                  className="text-lg font-semibold flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  {isOnline ? "Online Platform/Link" : "Venue Location"}
                </Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={event.location}
                  placeholder={
                    isOnline
                      ? "Zoom, Teams, or platform link"
                      : "Enter venue address"
                  }
                  className="mt-2 h-12"
                  required
                />
              </div>
            </div>

            {/* Capacity and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="maxAttendees"
                  className="text-lg font-semibold flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Maximum Attendees
                </Label>
                <Input
                  id="maxAttendees"
                  name="maxAttendees"
                  type="number"
                  min="1"
                  defaultValue={event.maxAttendees}
                  placeholder="100"
                  className="mt-2 h-12"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current attendees: {event.attendees}
                </p>
              </div>

              <div>
                <Label
                  htmlFor="price"
                  className="text-lg font-semibold flex items-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Ticket Price (₦)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={event.price}
                  placeholder="0.00"
                  className="mt-2 h-12"
                  required
                />
              </div>
            </div>

            {/* Current Image Display */}
            {event.image && (
              <div>
                <Label className="text-lg font-semibold">
                  Current Event Image
                </Label>
                <div className="mt-2 relative">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt="Current event image"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <Label htmlFor="image" className="text-lg font-semibold">
                Update Event Image (Optional)
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="mt-2 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to keep current image
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </Label>
              <div className="mt-2 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags (press Enter)"
                    className="h-12"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="h-12 px-6 bg-transparent"
                  >
                    Add
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm py-1 px-3"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Updating Event..." : "Update Event"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-8 h-14 text-lg font-semibold bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
