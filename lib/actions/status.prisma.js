"use server";

import prisma from "@prisma/prisma";
import { revalidatePath } from "next/cache";

export async function getStoriesFromFriends(userId) {
  console.log("ABout to fetch stories of user with the id", userId);
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get stories from friends (both directions of the friendship)
    const stories = await prisma.story.findMany({
      where: {
        // user: {
        //   OR: [
        //     // Users who are friends with the current user
        //     {
        //       friends: {
        //         some: {
        //           id: userId,
        //         },
        //       },
        //     },
        //     // Users who the current user is friends with
        //     {
        //       friendOf: {
        //         some: {
        //           id: userId,
        //         },
        //       },
        //     },
        //   ],
        // },
        expiresAt: {
          gt: new Date(),
        },
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        views: {
          where: {
            userId: userId,
          },
        },
        _count: {
          select: {
            views: true, // 👈 this gets total number of views
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // console.log("Stories of users friends found", stories);

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user.id;

      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        };
      }

      acc[userId].stories.push({
        id: story.id,
        content: story.content,
        type: story.type,
        caption: story.caption,
        backgroundColor: story.backgroundColor,
        textColor: story.textColor,
        createdAt: story.createdAt,
        isViewed: story.views.length > 0,
        viewCount: story._count.views,
      });

      // console.log("ACc of stories", acc);

      return acc;
    }, {});

    // Convert to array and sort by latest story
    const result = Object.values(groupedStories)
      .map((userStories) => ({
        ...userStories,
        stories: userStories.stories.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        ),
      }))
      .sort((a, b) => {
        const aLatest = new Date(
          a.stories[a.stories.length - 1]?.createdAt || 0
        );
        const bLatest = new Date(
          b.stories[b.stories.length - 1]?.createdAt || 0
        );
        return bLatest - aLatest;
      });

    // console.log("Result from fetching stories", result);

    return result;
  } catch (error) {
    console.error("Error fetching stories:");
    // throw new Error("Failed to fetch stories");
  }
}

export async function markStoryAsViewed({ storyId, storyOwnerId, userId }) {
  // console.log(
  //   `about to mark story ${storyId} of user ${storyOwnerId} as viewed by user ${userId}`
  // );
  try {
    if (!storyId || !userId) {
      throw new Error("Story ID and User ID are required");
    }

    const created = await prisma.storyView.createMany({
      data: [
        {
          userId,
          storyId,
          viewedAt: new Date(),
        },
      ],
      skipDuplicates: true,
    });

    const wasFirstView = created.count === 1;
    // console.log("Operation successful , story first view =", wasFirstView);
    // created.count === 1 means it was successfully inserted (i.e. first view)
    return {
      wasFirstView,
      storyId,
      storyOwnerId,
    };
  } catch (error) {
    console.error("Error marking story as viewed:", error);
    // throw new Error("Could not mark story as viewed");
  }
}

export async function createStory(storyData) {
  try {
    console.log("Create Story Fired", storyData);
    // Set expiration time to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        userId: storyData.userId,
        content: storyData.content,
        type: storyData.type || "IMAGE",
        caption: storyData.caption,
        backgroundColor: storyData.backgroundColor,
        textColor: storyData.textColor,
        expiresAt,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
    });

    // Revalidate the stories cache
    revalidatePath("/chat");

    console.log("Story was created", story);

    return {
      success: true,
      story: {
        id: story.id,
        content: story.content,
        type: story.type,
        caption: story.caption,
        backgroundColor: story.backgroundColor,
        textColor: story.textColor,
        createdAt: story.createdAt,
        user: story.user,
      },
    };
  } catch (error) {
    console.error("Error creating story:", error);
    throw new Error("Failed to create story");
  }
}

export async function getCurrentUserStories(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const stories = await prisma.story.findMany({
      where: {
        userId: Number.parseInt(userId),
        expiresAt: {
          gt: new Date(),
        },
        isActive: true,
      },
      include: {
        views: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                picture: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return stories.map((story) => ({
      id: story.id,
      content: story.content,
      type: story.type,
      caption: story.caption,
      backgroundColor: story.backgroundColor,
      textColor: story.textColor,
      createdAt: story.createdAt,
      views: story.views.map((view) => ({
        id: view.id,
        viewedAt: view.viewedAt,
        user: view.user,
      })),
    }));
  } catch (error) {
    console.error("Error fetching current user stories:", error);
    throw new Error("Failed to fetch current user stories");
  }
}

export async function deleteStory({ storyId }) {
  try {
    // console.log("About to delete story with id", storyId);

    // Verify the story belongs to the current user
    // const story = await prisma.story.findFirst({
    //   where: {
    //     id: Number.parseInt(storyId),
    //     // userId: userId,
    //   },
    // });

    // if (!story) {
    //   throw new Error("Story not found or unauthorized");
    // }

    await prisma.story.update({
      where: {
        id: Number.parseInt(storyId),
      },
      data: {
        isActive: false,
      },
    });
    console.log("Story deleted successfully");

    // Revalidate the stories cache
    revalidatePath("/chat");

    return { success: true };
  } catch (error) {
    console.error("Error deleting story:", error);
    // throw new Error("Failed to delete story");
  }
}

export async function getStoryViewers(storyId) {
  try {
    console.log("Trying to get story viewers for story with id", storyId);
    // const session = await auth();

    // if (!session?.user?.id) {
    //   throw new Error("Authentication required");
    // }

    // const userId = Number.parseInt(session.user.id);

    // // Verify the story belongs to the current user
    // const story = await prisma.story.findFirst({
    //   where: {
    //     id: Number.parseInt(storyId),
    //     userId: userId,
    //   },
    // });

    // if (!story) {
    //   throw new Error("Story not found or unauthorized");
    // }

    const viewers = await prisma.storyView.findMany({
      where: {
        storyId: Number.parseInt(storyId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
      orderBy: {
        viewedAt: "desc",
      },
    });

    console.log("Viewers found for story", viewers);

    return viewers.map((view) => ({
      id: view.id,
      viewedAt: view.viewedAt,
      user: view.user,
    }));
  } catch (error) {
    console.error("Error fetching story viewers:", error);
    throw new Error("Failed to fetch story viewers");
  }
}

export async function replyToStory({ storyId, message, userId, storyOwnerId }) {
  console.log(
    "Replying to story with ID:",
    storyId,
    "Message:",
    message,
    "User ID:",
    userId,
    "Story Owner ID:",
    storyOwnerId
  );
  try {
    // const session = await auth();

    // if (!session?.user?.id) {
    //   throw new Error("Authentication required");
    // }

    // const userId = Number.parseInt(session.user.id);

    // Get the story and its owner

    if (userId === storyOwnerId) {
      throw new Error("Cannot reply to your own story");
    }

    // Find existing direct conversation between the two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        conversationMembers: {
          every: {
            userId: {
              in: [userId, storyOwnerId],
            },
          },
        },
      },
      include: {
        conversationMembers: true,
      },
    });

    console.log("Existing conversation found:", existingConversation);

    let conversation = existingConversation;

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          conversationMembers: {
            create: [{ userId: userId }, { userId: storyOwnerId }],
          },
        },
      });

      // console.log("New conversation created:", conversation);
    }

    // Create the reply message
    const replyMessage = await prisma.message.create({
      data: {
        body: message,
        senderId: userId,
        conversationId: conversation.id,
        type: "TEXT",
      },
    });
    // console.log("Reply message created:", replyMessage);

    // Update conversation's updated timestamp
    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    revalidatePath("/chat");

    console.log("Reply to story successful:");

    return { success: true, messageId: replyMessage.id };
  } catch (error) {
    console.error("Error replying to story:", error);
    throw new Error("Failed to reply to story");
  }
}

// Helper function to get user's friends
export async function getUserFriends(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number.parseInt(userId),
      },
      include: {
        friends: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        friendOf: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Combine both directions of friendship and remove duplicates
    const allFriends = [...user.friends, ...user.friendOf];
    const uniqueFriends = allFriends.filter(
      (friend, index, self) =>
        index === self.findIndex((f) => f.id === friend.id)
    );

    return uniqueFriends;
  } catch (error) {
    console.error("Error fetching user friends:", error);
    throw new Error("Failed to fetch user friends");
  }
}
