"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  User,
  Lock,
  Bell,
  Monitor,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  UserX,
  Flag,
  ChevronRight,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card } from "@components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { softDeleteUser } from "@lib/actions/user.prisma";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteDB } from "idb";
import { clearChatDB } from "@lib/indexedDB";
import { signOut, useSession } from "next-auth/react";

export default function TikTokSettings() {
  const [currentScreen, setCurrentScreen] = useState("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [blockedUsers, setBlockedUsers] = useState(["user123", "example_user"]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const mockUsers = [
    { username: "user123", displayName: "John Doe", avatar: "👤" },
    { username: "example_user", displayName: "Jane Smith", avatar: "👩" },
    { username: "test_account", displayName: "Test User", avatar: "🧑" },
    { username: "demo_profile", displayName: "Demo Profile", avatar: "👨" },
  ];

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBlockUser = (username) => {
    if (!blockedUsers.includes(username)) {
      setBlockedUsers([...blockedUsers, username]);
    }
  };

  const handleUnblockUser = (username) => {
    setBlockedUsers(blockedUsers.filter((user) => user !== username));
  };

  const handleReportUser = (username) => {
    setSelectedUser(username);
    setShowReportDialog(true);
  };

  const submitReport = () => {
    // Handle report submission
    setShowReportDialog(false);
    setReportReason("");
    setReportDetails("");
    setSelectedUser("");
  };

  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const handleUserDelete = async () => {
    try {
      const deleteUser = await softDeleteUser(Number(user.id));
      setShowDeleteDialog(false);
      if (deleteUser.success) {
        toast.success("Account deleted successfully");
        // setIsSigningOut(true);
        await clearChatDB(); // 🧹 Clear IndexedDB
        await signOut({ redirect: false }); // Sign out silently
        router.push("/login");
      } else {
        toast.error("Failed to delete account. Please try again.");
        // setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting account. Please try again.");
    }
  };

  const renderHeader = (title) => (
    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentScreen("main")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </div>
  );

  const SettingsItem = ({
    icon: Icon,
    title,
    subtitle,
    onClick,
    rightElement,
  }) => (
    <div
      className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <Icon className="h-5 w-5 text-gray-600" />
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
      {rightElement || <ChevronRight className="h-4 w-4 text-gray-400" />}
    </div>
  );

  // if (!user) {
  //   router.push("/login");
  //   return null; // Redirecting, no need to render anything else
  // }

  if (currentScreen === "main") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h1 className="text-lg font-semibold">Settings and privacy</h1>
        </div>

        <div className="bg-white">
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              ACCOUNT
            </div>
          </div>
          <SettingsItem
            icon={User}
            title="Manage account"
            onClick={() => setCurrentScreen("account")}
          />
          <SettingsItem
            icon={Lock}
            title="Privacy"
            onClick={() => setCurrentScreen("privacy")}
          />
        </div>

        <div className="bg-white mt-2">
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              SUPPORT
            </div>
          </div>
          <SettingsItem icon={Flag} title="Report a Problem" />
          <SettingsItem icon={HelpCircle} title="Help Center" />
          <SettingsItem icon={Shield} title="Safety Center" />
        </div>

        <div className="bg-white mt-2">
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              ABOUT
            </div>
          </div>
          <SettingsItem icon={FileText} title="Community Guidelines" />
          <SettingsItem icon={FileText} title="Terms of Service" />
          <SettingsItem icon={FileText} title="Privacy Policy" />
          <SettingsItem icon={FileText} title="Intellectual Property Policy" />
        </div>

        <div className="bg-white mt-2">
          <SettingsItem
            icon={LogOut}
            title="Log out"
            rightElement={<div />}
            // disabled={isSigningOut}
            onClick={async () => {
              try {
                // setIsSigningOut(true);
                await clearChatDB(); // 🧹 Clear IndexedDB
                await signOut({ redirect: false }); // Sign out silently
                router.push("/"); // Navigate away immediately
              } catch (err) {
                console.error("Error signing out:", err);
              } finally {
                // setIsSigningOut(false);
              }
            }}
          />
        </div>

        <div className="p-4 text-center text-xs text-gray-400">
          v39.6.6 (390606)
        </div>
      </div>
    );
  }

  if (currentScreen === "account") {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader("Manage account")}

        <div className="bg-white">
          <SettingsItem icon={User} title="Switch to Pro account" />
          <SettingsItem icon={User} title="Account control" />
          <SettingsItem
            icon={User}
            title="Username"
            rightElement={<span className="text-gray-500">@yourname</span>}
          />
          <SettingsItem icon={User} title="Phone number" />
          <SettingsItem icon={User} title="Email" />
          <SettingsItem icon={User} title="Password" />
          <SettingsItem icon={User} title="Download your data" />
          <SettingsItem
            icon={Trash2}
            title="Delete account"
            onClick={() => setCurrentScreen("delete-account")}
          />
        </div>
      </div>
    );
  }

  if (currentScreen === "privacy") {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader("Privacy")}

        <div className="bg-white">
          <SettingsItem icon={Lock} title="Account privacy" />
          <SettingsItem icon={Lock} title="Safety" />
          <SettingsItem
            icon={UserX}
            title="Blocked accounts"
            onClick={() => setCurrentScreen("block-users")}
          />
          <SettingsItem
            icon={Flag}
            title="Report users and content"
            onClick={() => setCurrentScreen("report-user")}
          />
        </div>
      </div>
    );
  }

  if (currentScreen === "block-users") {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader("Blocked accounts")}

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users to block"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {searchQuery && (
          <div className="bg-white">
            <div className="px-4 py-2 border-b">
              <div className="text-sm font-medium text-gray-700">
                Search Results
              </div>
            </div>
            {filteredUsers.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-4 border-b"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-gray-500">
                      @{user.username}
                    </div>
                  </div>
                </div>
                <Button
                  variant={
                    blockedUsers.includes(user.username) ? "outline" : "default"
                  }
                  size="sm"
                  onClick={() =>
                    blockedUsers.includes(user.username)
                      ? handleUnblockUser(user.username)
                      : handleBlockUser(user.username)
                  }
                >
                  {blockedUsers.includes(user.username) ? "Unblock" : "Block"}
                </Button>
              </div>
            ))}
          </div>
        )}

        {blockedUsers.length > 0 && (
          <div className="bg-white mt-2">
            <div className="px-4 py-2 border-b">
              <div className="text-sm font-medium text-gray-700">
                Blocked Users
              </div>
            </div>
            {blockedUsers.map((username) => {
              const user = mockUsers.find((u) => u.username === username);
              return (
                <div
                  key={username}
                  className="flex items-center justify-between p-4 border-b"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {user?.avatar || "👤"}
                    </div>
                    <div>
                      <div className="font-medium">
                        {user?.displayName || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">@{username}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockUser(username)}
                  >
                    Unblock
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (currentScreen === "report-user") {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader("Report users and content")}

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users to report"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {searchQuery && (
          <div className="bg-white">
            <div className="px-4 py-2 border-b">
              <div className="text-sm font-medium text-gray-700">
                Search Results
              </div>
            </div>
            {filteredUsers.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-4 border-b"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-gray-500">
                      @{user.username}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReportUser(user.username)}
                >
                  Report
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Report User</DialogTitle>
              <DialogDescription>
                Report @{selectedUser} for violating community guidelines
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Reason for reporting
                </label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="inappropriate">
                      Inappropriate content
                    </SelectItem>
                    <SelectItem value="impersonation">Impersonation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Additional details
                </label>
                <Textarea
                  placeholder="Provide more details about the issue..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitReport} disabled={!reportReason}>
                Submit Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (currentScreen === "delete-account") {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader("Delete account")}

        <div className="p-4">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Delete your account?
              </h2>
              <p className="text-gray-600 text-sm">
                This action cannot be undone. All your videos, followers, and
                data will be permanently removed.
              </p>
            </div>

            {/* <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">
                  Before you delete:
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Download your data if you want to keep it</li>
                  <li>• Your username will become available to others</li>
                  <li>• You won't be able to recover your account</li>
                </ul>
              </div>
            </div> */}

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setCurrentScreen("main")}
              >
                Keep my account
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete account
              </Button>
            </div>
          </Card>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Confirm Account Deletion</DialogTitle>
              <DialogDescription>
                Are you absolutely sure you want to delete your account? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleUserDelete}>
                Yes, delete my account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}
