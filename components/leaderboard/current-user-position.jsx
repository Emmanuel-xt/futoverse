import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { TrendingUp, User } from "lucide-react";

export function CurrentUserPosition({ user, totalUsers }) {
  const getPercentile = (rank, total) => {
    return Math.round(((total - rank + 1) / total) * 100);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Your Position</h2>
        </div>
        <Badge variant="secondary" className="ml-auto">
          <TrendingUp className="h-3 w-3 mr-1" />
          Top {getPercentile(user.rank, totalUsers)}%
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user.user.picture || "/placeholder.svg"}
            alt={user.user.name}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xl">
            {user.user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="text font-bold">{user.user.name}</h3>
          {/* <p className="text-muted-foreground">{user.user.email}</p> */}
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground">Rank</div>
          <div className="text-sm font-bold text-blue-600">#{user.rank}</div>
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground">Points</div>
          <div className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user.totalPoints.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
