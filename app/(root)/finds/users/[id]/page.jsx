"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import {
  ArrowLeft,
  MessageCircle,
  UserPlus,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Mock user data - in real app, this would be fetched based on ID
const mockUserDetails = {
  1: {
    id: 1,
    username: "john_doe",
    name: "John Doe",
    displayName: "Johnny",
    picture: "/placeholder.svg?height=120&width=120",
    bio: "Computer Science student passionate about AI and machine learning. Love building innovative solutions and collaborating on exciting projects.",
    about:
      "I'm a dedicated Computer Science student with a keen interest in artificial intelligence and machine learning. When I'm not coding, you can find me exploring new technologies, participating in hackathons, or helping fellow students with their programming challenges.",
    department: { name: "Computer Science", initial: "CS" },
    level: { name: "300 Level" },
    isOnline: true,
    lastSeen: "2024-01-20T10:30:00Z",
    createdAt: "2024-01-15T08:00:00Z",
    email: "john.doe@university.edu",
    gender: "male",
    friends: 45,
    posts: 23,
    conversationsIds: ["conv1", "conv2", "conv3"],
  },
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number.parseInt(params.id);
  const [user, setUser] = useState(mockUserDetails[userId]);

  useEffect(() => {
    // In a real app, fetch user data here
    if (!user) {
      // Handle user not found
      console.log("User not found");
    }
  }, [userId, user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
          <Link href="/finds/users">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getLastSeenText = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/finds/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={user.picture || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">
                      {user.displayName || user.name}
                    </h1>
                    <Badge variant="secondary">@{user.username}</Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <Badge variant="outline">{user.department.name}</Badge>
                    <Badge variant="outline">{user.level.name}</Badge>
                    {user.isOnline ? (
                      <Badge variant="default" className="bg-green-500">
                        Online
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Last seen {getLastSeenText(user.lastSeen)}
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground mb-4">{user.bio}</p>

                  <div className="flex gap-2">
                    <Button>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            {user.about && (
              <CardContent>
                <Separator className="mb-4" />
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {user.about}
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Friends</span>
                </div>
                <span className="font-semibold">{user.friends}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Posts</span>
                </div>
                <span className="font-semibold">{user.posts}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Joined</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Department
                </label>
                <p className="text-sm">{user.department.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Level
                </label>
                <p className="text-sm">{user.level.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
