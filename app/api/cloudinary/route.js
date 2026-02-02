import cloudinary from "@lib/cloudinary";
import { auth } from "@/auth";

// Allowed MIME types for images
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Max file size: 5MB (base64 adds ~33% overhead, so check for ~6.7MB string)
const MAX_BASE64_LENGTH = 7 * 1024 * 1024;

export const POST = async (req) => {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { image } = await req.json();

    // Validate image exists
    if (!image || typeof image !== "string") {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check file size (base64 string length)
    if (image.length > MAX_BASE64_LENGTH) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate MIME type from base64 header
    const mimeMatch = image.match(/^data:([^;]+);base64,/);
    if (!mimeMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid image format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const mimeType = mimeMatch[1];
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "futoverse",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      max_bytes: 5 * 1024 * 1024, // 5MB limit on Cloudinary side too
    });

    return new Response(
      JSON.stringify({ url: uploadResponse.secure_url }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Image upload failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload image" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
