import { z } from "zod";

// ─── User Schemas ────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  invite: z.string().nullable().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  img: z.string().optional(),
  levelName: z.string().optional(),
  about: z.string().optional(),
  bio: z.string().optional(),
  gender: z.string().optional(),
  departmentName: z.string().optional(),
  departmentInitial: z.string().optional(),
});

export const userIdSchema = z.object({
  userId: z.number().int().positive(),
});

export const usernameSchema = z.object({
  username: z.string().min(1),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1),
});

// ─── Chat / Message Schemas ──────────────────────────────────

export const sendMessageSchema = z.object({
  message: z.string().min(1),
  receiverId: z.number().int().positive(),
  senderId: z.union([z.number(), z.string()]),
});

export const getMessagesSchema = z.object({
  receiverId: z.number().int().positive(),
  senderId: z.union([z.number(), z.string()]),
});

export const markMessagesReadSchema = z.object({
  conversationId: z.number().int().positive(),
  authUserId: z.union([z.number(), z.string()]),
});

export const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  participants: z.array(z.number().int().positive()).min(1),
  creator: z.number().int().positive(),
  creatorName: z.string().min(1),
});

export const findConversationSchema = z.object({
  currentUserId: z.number().int().positive(),
  receiverId: z.number().int().positive(),
});

// ─── Post Schemas ────────────────────────────────────────────

export const createPostSchema = z.object({
  content: z.string().min(1),
  title: z.string().optional(),
  creatorId: z.number().int().positive(),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"]),
      })
    )
    .optional(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1),
  title: z.string().optional(),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"]),
      })
    )
    .optional(),
});

export const toggleLikeSchema = z.object({
  postId: z.string().min(1),
  userId: z.number().int().positive(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1),
  postId: z.string().min(1),
  creatorId: z.number().int().positive(),
  parentCommentId: z.string().optional(),
});

// ─── Product Schemas ─────────────────────────────────────────

export const updateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const addShopItemSchema = z.object({
  name: z.string().min(1),
  image: z.string().optional(),
  description: z.string().optional(),
  quantity: z.union([z.string(), z.number()]),
  price: z.union([z.string(), z.number()]),
  category: z.string().optional(),
});

// ─── Shop Schemas ────────────────────────────────────────────

export const createShopSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  longitude: z.number(),
  latitude: z.number(),
  category: z.string().optional(),
  userId: z.number().int().positive(),
});

export const createStoreSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  locationDesc: z.string().min(1),
  userId: z.number().int().positive(),
  image: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const updateShopSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  desc: z.string().optional(),
  category: z.string().optional(),
  locationDesc: z.string().optional(),
  coverImage: z.string().optional(),
});

// ─── Election Schemas ────────────────────────────────────────

export const addElectionCommentSchema = z.object({
  candidateId: z.number().int().positive(),
  content: z.string().min(1),
  userId: z.number().int().positive(),
});

export const toggleReactionSchema = z.object({
  candidateId: z.union([z.string(), z.number()]),
  type: z.string().min(1),
  userId: z.number().int().positive(),
});

export const createCandidateSchema = z.object({
  candidateData: z.object({
    name: z.string().min(1),
    position: z.string().optional(),
    manifesto: z.string().optional(),
    image: z.string().optional(),
  }),
  userId: z.number().int().positive(),
});

// ─── Story Schemas ───────────────────────────────────────────

export const createStorySchema = z.object({
  userId: z.number().int().positive(),
  content: z.string().min(1),
  type: z.enum(["IMAGE", "TEXT", "VIDEO"]).optional(),
  caption: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
});

export const markStoryViewedSchema = z.object({
  storyId: z.union([z.string(), z.number()]),
  storyOwnerId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const replyToStorySchema = z.object({
  storyId: z.union([z.string(), z.number()]),
  message: z.string().min(1),
  userId: z.number().int().positive(),
  storyOwnerId: z.number().int().positive(),
});

// ─── Event Schemas ───────────────────────────────────────────

export const createEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  endDate: z.string(),
  location: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  organizer: z.string().optional(),
  attendees: z.number().optional(),
  maxAttendees: z.number().optional(),
  price: z.number().optional(),
  isOnline: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// ─── Order Schemas ───────────────────────────────────────────

export const createOrderSchema = z.object({
  orderId: z.string().min(1),
  totalAmount: z.number().positive(),
  orderDate: z.string().or(z.date()),
  status: z.string(),
  userId: z.number().int().positive(),
  shopId: z.number(),
  items: z.object({
    create: z.array(z.object({}).passthrough()),
  }),
});

export const rejectOrderSchema = z.object({
  orderId: z.string().min(1),
  comment: z.string().optional(),
  userId: z.number().int().positive(),
});

// ─── Connect / Friend Schemas ────────────────────────────────

export const friendRequestSchema = z.object({
  currentUserId: z.number().int().positive(),
  targetUserId: z.number().int().positive(),
});

// ─── Notification Schemas ────────────────────────────────────

export const createNotificationSchema = z.object({
  userId: z.union([z.string(), z.number()]),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  senderId: z.union([z.string(), z.number()]).optional(),
  link: z.string().optional(),
});

export const saveFcmTokenSchema = z.object({
  token: z.string().min(1),
  userId: z.number().int().positive(),
});

// ─── Reel Schemas ────────────────────────────────────────────

export const createReelSchema = z.object({
  embedUrl: z.string().url(),
  originalUrl: z.string().url(),
  platform: z.enum(["TIKTOK", "INSTAGRAM", "YOUTUBE", "FACEBOOK"]),
  thumbnailUrl: z.string().optional(),
  tiktokEmbedHtml: z.string().optional(),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  postedById: z.number().int().positive(),
});

export const addReelCommentSchema = z.object({
  reelId: z.string().min(1),
  userId: z.number().int().positive(),
  content: z.string().min(1),
  parentCommentId: z.string().optional(),
});

// ─── Auth Schemas ────────────────────────────────────────────

export const passwordResetEmailSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});
