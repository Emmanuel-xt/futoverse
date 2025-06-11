"use client";

import { useState, useMemo } from "react";
import { Search, X, MapPin } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";

// interface CategoryDrawerProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   category: string
//   categoryData?: any
// }

// Mock data for different categories
const MOCK_DATA = {
  shops: [
    {
      id: 1,
      name: "Campus Bookstore",
      location: "Building A",
      distance: "0.2 km",
      rating: 4.5,
    },
    {
      id: 2,
      name: "Tech Store",
      location: "Building B",
      distance: "0.3 km",
      rating: 4.2,
    },
    {
      id: 3,
      name: "Coffee Shop",
      location: "Student Center",
      distance: "0.1 km",
      rating: 4.8,
    },
    {
      id: 4,
      name: "Pharmacy",
      location: "Health Center",
      distance: "0.4 km",
      rating: 4.3,
    },
    {
      id: 5,
      name: "Stationery Store",
      location: "Library",
      distance: "0.2 km",
      rating: 4.1,
    },
  ],
  items: [
    {
      id: 1,
      name: "Textbooks",
      category: "Academic",
      availability: "In Stock",
    },
    {
      id: 2,
      name: "Laptops",
      category: "Electronics",
      availability: "Limited",
    },
    {
      id: 3,
      name: "University Merchandise",
      category: "Apparel",
      availability: "In Stock",
    },
    {
      id: 4,
      name: "Lab Equipment",
      category: "Academic",
      availability: "Available",
    },
    {
      id: 5,
      name: "Sports Equipment",
      category: "Recreation",
      availability: "In Stock",
    },
  ],
  lectures: [
    {
      id: 1,
      name: "Lecture Hall A",
      capacity: "200 seats",
      building: "Academic Block 1",
      floor: "Ground Floor",
    },
    {
      id: 2,
      name: "Lecture Hall B",
      capacity: "150 seats",
      building: "Academic Block 1",
      floor: "First Floor",
    },
    {
      id: 3,
      name: "Seminar Room 1",
      capacity: "50 seats",
      building: "Academic Block 2",
      floor: "Second Floor",
    },
    {
      id: 4,
      name: "Conference Hall",
      capacity: "300 seats",
      building: "Administration",
      floor: "Third Floor",
    },
    {
      id: 5,
      name: "Lab Theatre",
      capacity: "80 seats",
      building: "Science Block",
      floor: "Ground Floor",
    },
  ],
  events: [
    {
      id: 1,
      name: "Tech Conference 2024",
      date: "Dec 15, 2024",
      location: "Main Auditorium",
      attendees: "500+",
    },
    {
      id: 2,
      name: "Career Fair",
      date: "Dec 20, 2024",
      location: "Sports Complex",
      attendees: "1000+",
    },
    {
      id: 3,
      name: "Cultural Night",
      date: "Dec 25, 2024",
      location: "Open Ground",
      attendees: "800+",
    },
    {
      id: 4,
      name: "Research Symposium",
      date: "Jan 5, 2025",
      location: "Conference Hall",
      attendees: "200+",
    },
  ],
  user: [
    {
      id: 1,
      name: "John Doe",
      role: "Student",
      department: "Computer Science",
      year: "3rd Year",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Professor",
      department: "Mathematics",
      experience: "10 years",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Staff",
      department: "Administration",
      position: "Manager",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      role: "Student",
      department: "Physics",
      year: "2nd Year",
    },
  ],
};

export const CategoryDrawer = ({
  open,
  onOpenChange,
  category,
  categoryData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const data = MOCK_DATA[category] || [];

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data]);

  const renderItem = (item) => {
    switch (category) {
      case "shops":
        return (
          <div
            key={item.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{item.name}</h4>
              <Badge variant="secondary">{item.rating} ⭐</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
            <div className="text-sm text-gray-500">{item.distance} away</div>
          </div>
        );

      case "items":
        return (
          <div
            key={item.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{item.name}</h4>
              <Badge
                variant={
                  item.availability === "In Stock" ? "default" : "secondary"
                }
              >
                {item.availability}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Category: {item.category}
            </div>
          </div>
        );

      case "lectures":
        return (
          <div
            key={item.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-semibold text-lg mb-2">{item.name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Capacity: {item.capacity}</div>
              <div>Building: {item.building}</div>
              <div>Floor: {item.floor}</div>
            </div>
          </div>
        );

      case "events":
        return (
          <div
            key={item.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-semibold text-lg mb-2">{item.name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Date: {item.date}</div>
              <div>Location: {item.location}</div>
              <div>Expected Attendees: {item.attendees}</div>
            </div>
          </div>
        );

      case "user":
        return (
          <div
            key={item.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-semibold text-lg mb-2">{item.name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Role: {item.role}</div>
              <div>Department: {item.department}</div>
              {item.year && <div>Year: {item.year}</div>}
              {item.experience && <div>Experience: {item.experience}</div>}
              {item.position && <div>Position: {item.position}</div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!categoryData) return null;

  const IconComponent = categoryData.icon;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${categoryData.color}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <DrawerTitle className="text-xl font-semibold">
                {categoryData.label}
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6">
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${categoryData.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredData.length > 0 ? (
                filteredData.map(renderItem)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <IconComponent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {categoryData.label.toLowerCase()} found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
