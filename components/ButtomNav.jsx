"use client";

import { Home, Search, MapPin, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function BottomNav() {
  const pathname = usePathname();

  const snapchatLinks = [
    {
      route: "/",
      icon: Home,
      label: "Home",
    },
    {
      route: "/finds",
      icon: Search,
      label: "Find",
      // badge: true,
    },
    {
      route: "/map",
      icon: MapPin,
      label: "Map",
      isCenter: true,
    },
    {
      route: "/chat",
      icon: MessageCircle,
      label: "Chat",
      // badge: "2",
    },
    {
      route: "/profile",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <section className="fixed bottom-0 z-10 w-full bg-white border-t border-gray-100 px-4 py-2 safe-area-pb">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {snapchatLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          const Icon = link.icon;

          return (
            <Link
              href={link.route}
              key={link.label}
              className="relative flex items-center justify-center p-3"
            >
              <div className="relative">
                <Icon
                  size={link.isCenter ? 32 : 24}
                  className={`${isActive ? "text-blue-500" : "text-gray-700"} ${link.isCenter ? "stroke-[1.5]" : "stroke-[1.5]"}`}
                />

                {/* Notification Badge */}
                {link.badge && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                    {typeof link.badge === "string" ? (
                      <span className="text-white text-xs font-medium px-1">
                        {link.badge}
                      </span>
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default BottomNav;
