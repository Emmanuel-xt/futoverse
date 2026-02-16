"use client";

import { useTransition } from "react";
import {
  Home,
  Search,
  MapPin,
  MessageCircle,
  User,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (e, route) => {
    e.preventDefault();
    if (pathname === route) return; // Already on this route

    startTransition(() => {
      router.push(route);
    });
  };

  const handlePrefetch = (route) => {
    if (pathname !== route) {
      router.prefetch(route);
    }
  };

  const snapchatLinks = [
    {
      route: "/",
      icon: Home,
      label: "Home",
    },
    {
      route: "/finds/products",
      icon: ShoppingBag,
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
    <>
      {/* Page Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="text-blue-500 animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Loading...</span>
          </div>
        </div>
      )}

      <section className="fixed bottom-0 z-10 w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-2 pb-[env(safe-area-inset-bottom,0.5rem)]">
      <div className="flex items-center justify-between max-w-screen-sm mx-auto">
        {snapchatLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          const Icon = link.icon;

          return (
            <Link
              href={link.route}
              key={link.label}
              onClick={(e) => handleNavigation(e, link.route)}
              onMouseEnter={() => handlePrefetch(link.route)}
              onTouchStart={() => handlePrefetch(link.route)}
              className="relative flex items-center justify-center p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              aria-label={link.label}
            >
              <div className="relative">
                <Icon
                  size={link.isCenter ? 32 : 24}
                  className={`${isActive ? "text-blue-500" : "text-gray-700 dark:text-gray-300"} ${link.isCenter ? "stroke-[1.5]" : "stroke-[1.5]"} transition-colors`}
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
    </>
  );
}

export default BottomNav;
