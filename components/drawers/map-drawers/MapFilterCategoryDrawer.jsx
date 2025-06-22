"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Search, X, MapPin, User } from "lucide-react";
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
import { useOnlineUsers } from "@components/providers/OnlineUsersProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Skeleton } from "@components/ui/skeleton";
import { fetchOnlyUserInfo } from "@lib/actions/user.prisma";
import { fetchAllShops } from "@lib/actions/shops.prisma";
import { fetchAllProductS } from "@lib/actions/product.prisma";
import Image from "next/image";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { flytoDestination } from "@constants/functions";
import { toast } from "sonner";

// Cache for storing fetched data to avoid refetching
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache utility functions
const getCacheKey = (type, id) => `${type}_${id || "all"}`;

const getCachedData = (key) => {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  dataCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const CategoryDrawer = ({
  open,
  onOpenChange,
  category,
  categoryData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [shopsData, setShopsData] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { viewer } = useCesiumViewer();
  const onlineUsers = useOnlineUsers();
  const fetchedUsersRef = useRef(new Set());
  const abortControllerRef = useRef(null);

  // Memoized online user IDs to detect changes
  const onlineUserIds = useMemo(() => {
    return new Set(onlineUsers?.map((user) => user.username) || []);
  }, [onlineUsers]);

  // Optimized user data fetching with incremental updates
  const fetchUserData = useCallback(async (usersToFetch) => {
    if (!usersToFetch || usersToFetch.length === 0) return;

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      setError(null);

      // Fetch only new users that haven't been fetched yet
      const newUsers = usersToFetch.filter(
        (user) => !fetchedUsersRef.current.has(user.username)
      );

      if (newUsers.length === 0) return;

      const userPromises = newUsers.map(async (user) => {
        const cacheKey = getCacheKey("user", user.username);
        const cachedUser = getCachedData(cacheKey);

        if (cachedUser) {
          return cachedUser;
        }

        try {
          if (signal.aborted) throw new Error("Request aborted");

          const response = await fetchOnlyUserInfo(user.username);
          // console.log("Response", response);
          const userData = {
            id: response.id,
            username: user.username,
            name: response.name,
            role: response.role || "User",
            department: response.department?.name || "Unknown",
            level: response.level?.name || "Unknown",
            picture: response.picture,
          };

          setCachedData(cacheKey, userData);
          fetchedUsersRef.current.add(user.username);
          return userData;
        } catch (error) {
          if (error.name === "AbortError") throw error;
          console.error(`Failed to fetch data for ${user.username}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(userPromises);
      const validUsers = results
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);

      if (!signal.aborted && validUsers.length > 0) {
        setUserData((prevUsers) => {
          // Merge new users with existing ones, avoiding duplicates
          const existingUsernames = new Set(prevUsers.map((u) => u.username));
          const newValidUsers = validUsers.filter(
            (u) => !existingUsernames.has(u.username)
          );
          return [...prevUsers, ...newValidUsers];
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Remove users that are no longer online
  const removeOfflineUsers = useCallback(() => {
    setUserData((prevUsers) => {
      const filteredUsers = prevUsers.filter((user) =>
        onlineUserIds.has(user.username)
      );

      // Update the fetched users ref to remove offline users
      const stillOnlineUsernames = new Set(
        filteredUsers.map((u) => u.username)
      );
      fetchedUsersRef.current = new Set(
        [...fetchedUsersRef.current].filter((username) =>
          stillOnlineUsernames.has(username)
        )
      );

      return filteredUsers;
    });
  }, [onlineUserIds]);

  // Optimized shops data fetching
  const fetchShopsData = useCallback(async () => {
    const cacheKey = getCacheKey("shops");
    const cachedShops = getCachedData(cacheKey);

    if (cachedShops) {
      setShopsData(cachedShops);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const shops = await fetchAllShops();

      const formattedShops = shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        image: shop.image,
        description: shop.description,
        category: shop.category,
        longitude: shop.longitude,
        latitude: shop.latitude,
        distance: "Calculating...", // You can calculate actual distance here
        rating: 4.0 + Math.random() * 1, // Mock rating, replace with real data
      }));

      setCachedData(cacheKey, formattedShops);
      setShopsData(formattedShops);
    } catch (error) {
      console.error("Error fetching shops data:", error);
      setError("Failed to load shops data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized items data fetching
  const fetchItemsData = useCallback(async () => {
    const cacheKey = getCacheKey("items");
    const cachedItems = getCachedData(cacheKey);

    if (cachedItems) {
      setItemsData(cachedItems);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const products = await fetchAllProductS();

      const formattedItems = products.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        shopLongitude: product.shop?.longitude,
        shopLatitude: product.shop?.latitude,
        availability: "In Stock", // Mock availability, replace with real data
        category: "General", // Add category to your product model if needed
      }));

      setCachedData(cacheKey, formattedItems);
      setItemsData(formattedItems);
    } catch (error) {
      console.error("Error fetching items data:", error);
      setError("Failed to load items data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for handling online users changes
  useEffect(() => {
    if (category !== "user" || !open) return;

    // Remove offline users first
    removeOfflineUsers();

    // Fetch new users
    if (onlineUsers && onlineUsers.length > 0) {
      fetchUserData(onlineUsers);
    }
  }, [category, open, onlineUsers, fetchUserData, removeOfflineUsers]);

  // Effect for fetching shops data
  useEffect(() => {
    if (category === "shops" && open && shopsData.length === 0) {
      fetchShopsData();
    }
  }, [category, open, fetchShopsData, shopsData.length]);

  // Effect for fetching items data
  useEffect(() => {
    if (category === "items" && open && itemsData.length === 0) {
      fetchItemsData();
    }
  }, [category, open, fetchItemsData, itemsData.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Get current data based on category
  const getCurrentData = () => {
    switch (category) {
      case "user":
        return userData;
      case "shops":
        return shopsData;
      case "items":
        return itemsData;
      default:
        return [];
    }
  };

  const data = getCurrentData();

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowerSearch = searchTerm.toLowerCase();

    return data.filter((item) => {
      switch (category) {
        case "user":
          // Check name OR username
          return (
            (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
            (item.username && item.username.toLowerCase().includes(lowerSearch))
          );

        case "items":
          // Check name OR description
          return (
            (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
            (item.description &&
              item.description.toLowerCase().includes(lowerSearch))
          );

        case "shops":
          // Check name OR description
          return (
            (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
            (item.description &&
              item.description.toLowerCase().includes(lowerSearch))
          );

        default:
          // Fallback to just name if category unknown
          return item.name && item.name.toLowerCase().includes(lowerSearch);
      }
    });
  }, [searchTerm, data, category]);

  const findUser = (username) => {
    if (!viewer) return;
    const searchName = `User: ${username.trim()}`;

    // Search for the entity
    const entity = viewer.entities.values.find(
      (entity) => entity.name === searchName
    );

    if (entity) {
      // Center camera on found entity
      viewer.flyTo(entity);
      onOpenChange(false);
      // toast("User Found !");
    } else {
      toast("Cant View User's Location !");
    }
  };

  const handleFlyOver = (lon, lat) => {
    flytoDestination(viewer, lon, lat);
    onOpenChange(false);
  };

  const renderItem = (item) => {
    switch (category) {
      case "shops":
        return (
          <div
            key={item.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 relative w-12 h-12">
                <Avatar className="h-14 w-14 ">
                  <AvatarImage
                    src={item.image || "/images/noPicture.png"}
                    alt={`${item.name}'s profile`}
                  />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 flex justify-between items-center ">
                <div className="">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    {/* <Badge variant="secondary">{item.rating.toFixed(1)} ⭐</Badge> */}
                  </div>
                  {/* <p className="text-sm text-gray-600 mb-2">{item.description}</p> */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    {/* <MapPin className="h-4 w-4" /> */}
                    <span>{item.category}</span>
                  </div>
                </div>
                {/* <div className="text-sm text-gray-500">{item.distance}</div> */}

                <MapPin
                  className="text-primary text-lg flex-shrink-0"
                  onClick={() => handleFlyOver(item.longitude, item.latitude)}
                />
              </div>
            </div>
          </div>
        );

      case "items":
        return (
          <div
            key={item.id}
            className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex gap-4 items-center">
              <div className="flex-shrink-0 w-14 h-14 ">
                <Image
                  src={item.image || "/images/noProfile.png"}
                  alt={item.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div className="">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    {/* <Badge
                    variant={
                      item.availability === "In Stock" ? "default" : "secondary"
                    }
                    >
                    {item.availability}
                  </Badge> */}
                  </div>
                  <div className="text-sm font-bold text-green-600 mb-1">
                    #{item.price}
                  </div>
                  <div className="text-sm text-gray-600">
                    Category: {item.category}
                  </div>
                </div>
                <MapPin
                  className="text-primary text-lg flex-shrink-0"
                  onClick={() =>
                    handleFlyOver(item.shopLongitude, item.shopLatitude)
                  }
                />
              </div>
            </div>
          </div>
        );

      case "user":
        return (
          <div
            key={item.id || item.username}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex gap-4 items-center"
          >
            <div className="flex-shrink-0 relative w-12 h-12">
              <Avatar className="h-12 w-12 shadow-lg">
                <AvatarImage
                  src={item.picture || "/images/noPicture.png"}
                  alt={`${item.username}'s profile`}
                />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 flex justify-between items-center">
              <div className="">
                <h4 className="font-semibold text-lg ">{item?.name}</h4>
                <p className="text-sm text-gray-600 font-semibold mb-1">
                  {item?.username}
                </p>
              </div>
              <MapPin
                className="text-primary text-lg flex-shrink-0"
                onClick={() => findUser(item.username)}
              />
              {/* <div className="space-y-1 text-sm text-gray-600">
                {item.department && <div>Department: {item.department}</div>}
                {item.level && <div>Level: {item.level}</div>}
              </div> */}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderLoadingSkeleton = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="p-4 border rounded-lg">
        <div className="flex gap-4">
          <Skeleton className="w-15 h-15 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    ));
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
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${categoryData.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-slate-600 text-right ">View in Map</p>

          {/* Error State */}
          {error && (
            <div className="text-center py-4 text-red-500">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setError(null);
                  if (category === "shops") fetchShopsData();
                  else if (category === "items") fetchItemsData();
                  else if (category === "user") fetchUserData(onlineUsers);
                }}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Results */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {loading && filteredData.length === 0 ? (
                renderLoadingSkeleton()
              ) : filteredData.length > 0 ? (
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
