import { toast } from "sonner";

export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = globalThis.Math.floor((now - postDate) / 1000); // Explicitly use global Math

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = globalThis.Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = globalThis.Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = globalThis.Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  // If more than a month ago, return the formatted date (e.g., 03 Nov)
  const options = { day: "2-digit", month: "short" };
  return new Intl.DateTimeFormat("en-US", options).format(postDate);
};

export const generateProfileLink = () => {
  const baseUrl = window.location.origin + window.location.pathname;

  navigator.clipboard
    .writeText(baseUrl)
    .then(() => toast("Link copied! Share it with others."))
    .catch((err) => console.error("Failed to copy link:", err));
};

export const generateMyProfileLink = (username) => {
  const baseUrl =
    window.location.origin + window.location.pathname + "/" + username;

  navigator.clipboard
    .writeText(baseUrl)
    .then(() => toast("Link copied! Share it with others."))
    .catch((err) => console.error("Failed to copy link:", err));
};

export const shuffleArray = (array) => {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};
