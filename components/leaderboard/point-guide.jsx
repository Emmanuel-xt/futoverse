"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import {
  HelpCircle,
  UserPlus,
  Heart,
  Users,
  User,
  MessageCircle,
  Share2,
  CheckCircle,
  Star,
  Gift,
} from "lucide-react";

const pointsActions = [
  {
    action: "Complete Profile",
    points: 50,
    icon: User,
    description: "Fill out all your profile information",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    action: "Invite a Friend",
    points: 100,
    icon: UserPlus,
    description: "Send an invitation to join the platform",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    action: "Get Post Likes",
    points: 5,
    icon: Heart,
    description: "Per 5 post likes",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  {
    action: "Make New Friends",
    points: 10,
    icon: Users,
    description: "Connect with other members",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    action: "Post Comments",
    points: 10,
    icon: MessageCircle,
    description: "Engage with community posts per 10 comments",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
  //   {
  //     action: "Share Content",
  //     points: 15,
  //     icon: Share2,
  //     description: "Share posts with others",
  //     color: "text-cyan-500",
  //     bgColor: "bg-cyan-50 dark:bg-cyan-950",
  //   },
  {
    action: "Daily Login",
    points: 10,
    icon: CheckCircle,
    description: "Log in every day to earn points",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
  },
  //   {
  //     action: "Receive Reviews",
  //     points: 20,
  //     icon: Star,
  //     description: "Get positive reviews from others",
  //     color: "text-yellow-500",
  //     bgColor: "bg-yellow-50 dark:bg-yellow-950",
  //   },
  //   {
  //     action: "Special Events",
  //     points: 100,
  //     icon: Gift,
  //     description: "Participate in community events",
  //     color: "text-pink-500",
  //     bgColor: "bg-pink-50 dark:bg-pink-950",
  //   },
];

export function PointsGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <HelpCircle className="h-4 w-4" />
          How to Earn Points
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="h-6 w-6 text-yellow-500" />
            How to Earn Points
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-muted-foreground">
            Earn points by being active in our community! Here are all the ways
            you can boost your score:
          </p>

          <div className="grid gap-3">
            {pointsActions.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card
                  key={index}
                  className={`p-4 transition-all hover:shadow-md ${item.bgColor}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm`}
                    >
                      <IconComponent className={`h-5 w-5 ${item.color}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.action}</h3>
                        <Badge
                          variant="secondary"
                          className="text-xs font-bold"
                        >
                          +{item.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Pro Tip</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Stay active and engage with the community regularly to maximize
              your points! The more you participate, the higher you'll climb on
              the leaderboard.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
