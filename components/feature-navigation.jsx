import Link from "next/link";

const FEATURES = [
  {
    name: "Shops",
    href: "/finds/stores",
    icon: "🛍️",
    description: "Browse shops",
    gradient: "from-amber-400 to-orange-600",
    textColor: "text-white",
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: "🏆",
    description: "View rankings",
    gradient: "from-emerald-400 to-teal-600",
    textColor: "text-white",
  },
  {
    name: "Events",
    href: "/finds/events",
    icon: "📅",
    description: "Discover events",
    gradient: "from-blue-400 to-blue-600",
    textColor: "text-white",
  },
  {
    name: "Users",
    href: "/finds/users",
    icon: "👥",
    description: "Connect with peers",
    gradient: "from-pink-400 to-rose-600",
    textColor: "text-white",
  },
  {
    name: "Calendar",
    href: "/",
    icon: "🗓️",
    description: "View schedule",
    gradient: "from-purple-400 to-purple-600",
    textColor: "text-white",
  },
];

// Server component - no 'use client' needed, renders instantly on server side
export function FeatureNavigation() {
  return (
    <div className=" px-1 overflow-hidden">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2">
        {FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="flex-shrink-0 snap-center"
          >
            <div
              className={`bg-gradient-to-br ${feature.gradient} ${feature.textColor}  w-28 h-24 flex flex-col items-center justify-center text-center rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20 backdrop-blur-sm`}
            >
              <div className="text-3xl mb-2 transform hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xs mb-0.5">{feature.name}</h3>
              <p className="text-[10px] opacity-90">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
