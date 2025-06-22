"use client";

import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { useLocation } from "@components/providers/LocationProvider";
import { flytoDestination } from "@constants/functions";
import { places } from "@constants/places";
import { Cartesian3 } from "cesium";
import { useSession } from "next-auth/react";
import { useState, useCallback, useMemo } from "react";
import {
  Home,
  Search,
  Settings,
  Navigation,
  User,
  Store,
  Shirt,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { cn } from "@lib/utils";
import { SearchDrawer } from "@components/drawers/map-drawers/SearchInMapDrawer";
import { CategoryDrawer } from "@components/drawers/map-drawers/MapFilterCategoryDrawer";
import { SettingsDrawer } from "@components/drawers/map-drawers/MapSettingsDrawer";

// interface MapFlyersProps {
//   labelsVisible: boolean
//   setShowLabels: (visible: boolean) => void
//   labelEntities: any[]
//   findEntityModal: boolean
//   setFindEntityModal: (open: boolean) => void
// }

const FILTER_CATEGORIES = [
  {
    id: "user",
    label: "Users",
    icon: User,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  {
    id: "shops",
    label: "Shops",
    icon: Store,
    color: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  {
    id: "items",
    label: "Items",
    icon: Shirt,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
  {
    id: "lectures",
    label: "Lecture Halls",
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  },
];

export const MapFlyers = ({}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [openSearchDrawer, setOpenSearchDrawer] = useState(false);
  const [openCategoryDrawer, setOpenCategoryDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openSettingsDrawer, setOpenSettingsDrawer] = useState(false);

  const { viewer, viewerReady } = useCesiumViewer();
  const { stableLocation, error } = useLocation();
  const { data: session } = useSession();

  // Memoized filtered places to avoid unnecessary recalculations
  // const memoizedFilteredPlaces = useMemo(() => {
  //   if (!searchTerm.trim()) return [];

  //   return places.filter((place) =>
  //     place.placeName.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [searchTerm]);

  // Debounced search handler
  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredPlaces([]);
      return;
    }

    // Simple debounce with setTimeout
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(async () => {
      const onlineResults = [];
      const localResults = places.filter((place) =>
        place.placeName.toLowerCase().includes(term.toLowerCase())
      );

      const combinedResults = [...onlineResults, ...localResults];
      setFilteredPlaces(combinedResults);
    }, 50);

    setDebounceTimer(newTimer);
  };

  const handleFlyToLocation = useCallback(
    async (placename, longitude, latitude) => {
      if (!viewerReady || !viewer) return;

      try {
        flytoDestination(viewer, longitude, latitude);
        setSearchTerm(placename);
        setFilteredPlaces([]);
      } catch (error) {
        console.error("Error flying to location:", error);
      }
    },
    [viewer, viewerReady]
  );

  const handleFlyHome = useCallback(() => {
    if (!viewerReady || !viewer || !stableLocation) return;

    flytoDestination(viewer, stableLocation.longitude, stableLocation.latitude);
  }, [viewer, viewerReady, stableLocation]);

  const handleFlyToDefault = useCallback(() => {
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        6.996121931660761,
        5.383035004589935,
        600
      ),
      orientation: { heading: 0, pitch: -Math.PI / 3, roll: 0 },
    });
  }, [viewer]);

  const handleCategoryClick = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setOpenCategoryDrawer(true);
  }, []);

  return (
    <>
      <div className="absolute inset-x-0 top-0 z-20 p-4">
        {/* Top Header */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
            <AvatarImage
              src={session?.user?.image || `/images/noPicture.png`}
              alt="Profile"
            />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search places..."
              value={searchTerm}
              onChange={handleInputChange}
              className="bg-white/95 backdrop-blur-sm border-0 shadow-lg text-gray-900 placeholder:text-gray-500"
            />

            {filteredPlaces.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border max-h-48 overflow-y-auto z-50">
                {filteredPlaces.map((place, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-1 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={() =>
                      handleFlyToLocation(
                        place.placeName,
                        place.longitude,
                        place.latitude
                      )
                    }
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {place.placeName}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white"
            onClick={() => setOpenSettingsDrawer(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-40 right-4 z-20 flex flex-col gap-3">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-white text-gray-900 shadow-lg hover:bg-gray-50"
          onClick={handleFlyHome}
        >
          <Navigation className="h-6 w-6" />
        </Button>

        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-white text-gray-900 shadow-lg hover:bg-gray-50"
          onClick={handleFlyToDefault}
        >
          <Home className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Panel */}
      <div className="fixed bottom-14 left-0 right-0 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-2xl border-t px-2 py-1">
          <div className="flex items-center gap-4 mb-4">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200"
              onClick={() => setOpenSearchDrawer(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <div className="text-sm font-medium text-gray-700">
              Quick Filters
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTER_CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer transition-all hover:scale-105 whitespace-nowrap",
                    category.color
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{category.label}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drawers */}
      <SearchDrawer
        open={openSearchDrawer}
        onOpenChange={setOpenSearchDrawer}
        categories={FILTER_CATEGORIES}
        onCategorySelect={handleCategoryClick}
      />

      <CategoryDrawer
        open={openCategoryDrawer}
        onOpenChange={setOpenCategoryDrawer}
        category={selectedCategory}
        categoryData={FILTER_CATEGORIES.find(
          (cat) => cat.id === selectedCategory
        )}
      />

      <SettingsDrawer
        open={openSettingsDrawer}
        onOpenChange={setOpenSettingsDrawer}
      />
    </>
  );
};

export default MapFlyers;
