import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import {
  Search,
  Users,
  Store,
  Package,
  Calendar,
  GraduationCap,
  BookOpen,
  Trophy,
  Vote,
} from "lucide-react";
import Link from "next/link";

// Static data
const categories = [
  {
    id: "users",
    name: "Users",
    description: "Find students and connect with peers",
    icon: Users,
    color: "bg-blue-500",
    href: "/finds/users",
  },
  {
    id: "stores",
    name: "Stores",
    description: "Discover campus shops and vendors",
    icon: Store,
    color: "bg-green-500",
    href: "/finds/stores",
  },
  {
    id: "leaderboard",
    name: "Ponits Leaderboard",
    description: "Rule the Space with your points",
    icon: Trophy,
    color: "bg-orange-500",
    href: "/leaderboard",
  },
  {
    id: "products",
    name: "Products",
    description: "Browse items and marketplace",
    icon: Package,
    color: "bg-purple-500",
    href: "/finds/products",
  },
  {
    id: "events",
    name: "Events",
    description: "Find upcoming campus events",
    icon: Calendar,
    color: "bg-orange-500",
    href: "/finds/events",
  },
  {
    id: "elections",
    name: "SUG Election",
    description: "Discover SUG Election candidates",
    icon: Vote,
    color: "bg-green-800",
    href: "/elections",
  },
  // {
  //   id: "lecture-halls",
  //   name: "Lecture Halls",
  //   description: "Locate classrooms and venues",
  //   icon: GraduationCap,
  //   color: "bg-red-500",
  //   href: "/finds/lecture-halls",
  // },
  // {
  //   id: "study-tools",
  //   name: "Study Tools",
  //   description: "Access learning resources",
  //   icon: BookOpen,
  //   color: "bg-indigo-500",
  //   href: "/finds/study-tools",
  // },
];

// Server-side component
export default async function FindsPage({ searchParams }) {
  const query = searchParams?.search?.toLowerCase?.() || "";

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
  );

  return (
    <div className="container mx-auto px-4 py-8 m pb-20 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-lg font-bold mb-4">Find Anything on Campus</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Search for users, stores, products, events, and more
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Link key={category.id} href={category.href}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`${category.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No categories found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
