"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import {
  Search,
  Filter,
  ArrowLeft,
  MapPin,
  Users,
  Wifi,
  Projector,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollPosition } from "hooks/use-scroll-position";
import Image from "next/image";

// Mock lecture halls data based on your Place schema
const mockLectureHalls = [
  {
    id: 1,
    placeName: "Main Auditorium",
    email: "facilities@university.edu",
    userName: "Facilities Management",
    longitude: 3.3792,
    latitude: 6.5244,
    capacity: 500,
    building: "Main Campus Building",
    floor: "Ground Floor",
    features: ["Projector", "Sound System", "Air Conditioning", "WiFi"],
    availability: "Available",
    image: "/placeholder.svg?height=200&width=300",
    description: "Large auditorium perfect for conferences and major lectures",
    type: "Auditorium",
    bookingRequired: true,
  },
  {
    id: 2,
    placeName: "Computer Lab A",
    email: "cs.dept@university.edu",
    userName: "CS Department",
    longitude: 3.3793,
    latitude: 6.5245,
    capacity: 40,
    building: "Computer Science Building",
    floor: "2nd Floor",
    features: ["Computers", "Projector", "WiFi", "Air Conditioning"],
    availability: "Occupied",
    image: "/placeholder.svg?height=200&width=300",
    description: "Modern computer lab with latest hardware and software",
    type: "Computer Lab",
    bookingRequired: true,
  },
  {
    id: 3,
    placeName: "Lecture Hall B1",
    email: "facilities@university.edu",
    userName: "Facilities Management",
    longitude: 3.3794,
    latitude: 6.5246,
    capacity: 120,
    building: "Academic Block B",
    floor: "1st Floor",
    features: ["Projector", "Whiteboard", "WiFi"],
    availability: "Available",
    image: "/placeholder.svg?height=200&width=300",
    description: "Standard lecture hall for medium-sized classes",
    type: "Lecture Hall",
    bookingRequired: false,
  },
  {
    id: 4,
    placeName: "Science Laboratory 1",
    email: "science.dept@university.edu",
    userName: "Science Department",
    longitude: 3.3795,
    latitude: 6.5247,
    capacity: 30,
    building: "Science Building",
    floor: "Ground Floor",
    features: ["Lab Equipment", "Safety Features", "Ventilation"],
    availability: "Available",
    image: "/placeholder.svg?height=200&width=300",
    description: "Fully equipped science laboratory for practical sessions",
    type: "Laboratory",
    bookingRequired: true,
  },
  {
    id: 5,
    placeName: "Seminar Room C",
    email: "facilities@university.edu",
    userName: "Facilities Management",
    longitude: 3.3796,
    latitude: 6.5248,
    capacity: 25,
    building: "Academic Block C",
    floor: "3rd Floor",
    features: ["Projector", "Round Table", "WiFi", "Air Conditioning"],
    availability: "Available",
    image: "/placeholder.svg?height=200&width=300",
    description: "Intimate seminar room perfect for small group discussions",
    type: "Seminar Room",
    bookingRequired: true,
  },
  {
    id: 6,
    placeName: "Engineering Workshop",
    email: "eng.dept@university.edu",
    userName: "Engineering Department",
    longitude: 3.3797,
    latitude: 6.5249,
    capacity: 50,
    building: "Engineering Block",
    floor: "Ground Floor",
    features: ["Workshop Tools", "Safety Equipment", "Ventilation"],
    availability: "Maintenance",
    image: "/placeholder.svg?height=200&width=300",
    description: "Hands-on workshop space for engineering practical work",
    type: "Workshop",
    bookingRequired: true,
  },
];

const hallTypes = [
  "Auditorium",
  "Lecture Hall",
  "Computer Lab",
  "Laboratory",
  "Seminar Room",
  "Workshop",
];

const buildings = [
  "Main Campus Building",
  "Computer Science Building",
  "Academic Block B",
  "Academic Block C",
  "Science Building",
  "Engineering Block",
];

const availabilityOptions = ["Available", "Occupied", "Maintenance"];

export default function LectureHallsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition, restoreScrollPosition } =
    useScrollPosition("halls-list");

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || "Auditorium"
  );
  const [selectedBuilding, setSelectedBuilding] = useState(
    searchParams.get("building") || "Main Campus Building"
  );
  const [selectedAvailability, setSelectedAvailability] = useState(
    searchParams.get("availability") || "Available"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedType) params.set("type", selectedType);
    if (selectedBuilding) params.set("building", selectedBuilding);
    if (selectedAvailability) params.set("availability", selectedAvailability);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/finds/lecture-halls${newUrl}`, { scroll: false });
  }, [
    searchQuery,
    selectedType,
    selectedBuilding,
    selectedAvailability,
    router,
  ]);

  const filteredHalls = useMemo(() => {
    return mockLectureHalls.filter((hall) => {
      const matchesSearch =
        !searchQuery ||
        hall.placeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.features.some((feature) =>
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesType = !selectedType || hall.type === selectedType;
      const matchesBuilding =
        !selectedBuilding || hall.building === selectedBuilding;
      const matchesAvailability =
        !selectedAvailability || hall.availability === selectedAvailability;

      return (
        matchesSearch && matchesType && matchesBuilding && matchesAvailability
      );
    });
  }, [searchQuery, selectedType, selectedBuilding, selectedAvailability]);

  const handleHallClick = (hallId) => {
    saveScrollPosition();
    router.push(`/finds/lecture-halls/${hallId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedBuilding("");
    setSelectedAvailability("");
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case "Available":
        return "bg-green-500";
      case "Occupied":
        return "bg-red-500";
      case "Maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getFeatureIcon = (feature) => {
    switch (feature.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-3 h-3" />;
      case "projector":
        return <Projector className="w-3 h-3" />;
      case "sound system":
        return <Volume2 className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/finds">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Find Lecture Halls</h1>
          <p className="text-muted-foreground">Locate classrooms and venues</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search halls by name, building, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          {(selectedType || selectedBuilding || selectedAvailability) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auditorium">All types</SelectItem>
                  {hallTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Building</label>
              <Select
                value={selectedBuilding}
                onValueChange={setSelectedBuilding}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All buildings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Campus Building">
                    All buildings
                  </SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building} value={building}>
                      {building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Availability
              </label>
              <Select
                value={selectedAvailability}
                onValueChange={setSelectedAvailability}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">All statuses</SelectItem>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredHalls.length} hall{filteredHalls.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHalls.map((hall) => (
            <Card
              key={hall.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleHallClick(hall.id)}
            >
              <div className="relative">
                <Image
                  src={hall.image || "/placeholder.svg"}
                  alt={hall.placeName}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="default"
                    className={getAvailabilityColor(hall.availability)}
                  >
                    {hall.availability}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {hall.placeName}
                    </h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {hall.type}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {hall.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="line-clamp-1">
                        {hall.building}, {hall.floor}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Capacity: {hall.capacity}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {hall.features.slice(0, 3).map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="text-xs flex items-center gap-1"
                      >
                        {getFeatureIcon(feature)}
                        {feature}
                      </Badge>
                    ))}
                    {hall.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{hall.features.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Managed by {hall.userName}</span>
                    {hall.bookingRequired && (
                      <Badge variant="outline" className="text-xs">
                        Booking Required
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHalls.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No lecture halls found matching your criteria.
            </p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Clear filters to see all halls
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
