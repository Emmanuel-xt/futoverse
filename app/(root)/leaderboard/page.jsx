import { getLeaderboardData } from "@lib/actions/leaderboard-actions";
import { LeaderboardCard } from "@components/leaderboard/leaderboard-card";
import { CurrentUserPosition } from "@components/leaderboard/current-user-position";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Trophy, Users, TrendingUp } from "lucide-react";
import { auth } from "auth";
import { PointsGuide } from "@components/leaderboard/point-guide";

// Mock current user ID - replace with actual auth

export default async function LeaderboardPage() {
  const session = await auth();
  // console.log("session:", (await session).user);
  const CURRENT_USER_ID = session?.user?.id || null;
  // console.log("Current User ID:", CURRENT_USER_ID);
  const leaderboardData = await getLeaderboardData(CURRENT_USER_ID);
  // console.log("Leaderboard Data:", leaderboardData);
  const { topUsers, currentUser, totalUsers } = leaderboardData;

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Futoverse Leaderboard
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          See how you rank among all {totalUsers.toLocaleString()} members
        </p>
        <PointsGuide />
      </div>

      {/* Stats Cards */}

      {/* Current User Position (if not in top 20) */}
      {currentUser && currentUser.rank > 20 && (
        <div className="mb-8">
          <CurrentUserPosition user={currentUser} totalUsers={totalUsers} />
        </div>
      )}

      {/* Top 20 Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-lg font-bold">Top 100 Members</h2>
          <Badge variant="outline" className="ml-auto text-xs">
            Updated in real-time
          </Badge>
        </div>

        {topUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
            <p className="text-muted-foreground">
              Start earning points to appear on the leaderboard!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {topUsers.map((user) => (
              <LeaderboardCard
                key={user.userId}
                user={user}
                isCurrentUser={currentUser?.userId === user.userId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Current User Position (if in top 20) */}
      {currentUser && (
        <div className="mt-8">
          <CurrentUserPosition user={currentUser} totalUsers={totalUsers} />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-8 justify-center">
        <Card className="flex-1 min-w-[120px] max-w-[200px] p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">
            {totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Members</div>
        </Card>

        <Card className="flex-1 min-w-[120px] max-w-[200px] p-4 text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">
            {topUsers[0]?.totalPoints.toLocaleString() || 0}
          </div>
          <div className="text-sm text-muted-foreground">Highest Score</div>
        </Card>

        <Card className="flex-1 min-w-[120px] max-w-[200px] p-4 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold">{currentUser?.rank || "N/A"}</div>
          <div className="text-sm text-muted-foreground">Your Rank</div>
        </Card>
      </div>
    </div>
  );
}
