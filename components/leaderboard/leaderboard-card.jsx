import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Trophy, Medal, Award, Crown } from "lucide-react";

export function LeaderboardCard({ user, isCurrentUser = false }) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-gradient-to-r from-blue-500 to-purple-600";
    }
  };

  return (
    <Card
      className={`p-4 transition-all duration-200 hover:shadow-lg ${
        isCurrentUser
          ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
          : ""
      } ${user.rank <= 3 ? "border-2 border-yellow-200 dark:border-yellow-800" : ""}`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-5 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRankColor(user.rank)}`}
          >
            {user.rank}
          </div>
          <div className="mt-1">{getRankIcon(user.rank)}</div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user.user.picture || "/placeholder.svg"}
                alt={user.user.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">
                  {user.user.name}
                </h3>
                {isCurrentUser && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
                {user.rank <= 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200"
                  >
                    Top {user.rank}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {user.user.department.initial || ""} (
                {user.user.level.name || ""})
              </p>
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user.totalPoints.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">points</div>
        </div>
      </div>
    </Card>
  );
}
