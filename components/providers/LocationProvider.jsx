"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

const LocationContext = createContext(null);

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [stableLocation, setStableLocation] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [error, setError] = useState(null); // Track errors
  const watchIdRef = useRef(null);

  // Function to fetch stable location every 10 seconds
  const fetchStableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStableLocation({ latitude, longitude });
          setError(null); // Clear any previous errors
        },
        (err) => {
          // console.error("Error fetching stable location:", err);
          setError(err.message); // Store error message
        },
        { enableHighAccuracy: true }
      );
    } else {
      // console.error("Geolocation is not supported by this browser.");
      // setError("Geolocation is not supported by this browser.");
    }
  };

  // Function to start watching the current position
  const startWatchingPosition = () => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ latitude, longitude });
          setError(null); // Clear any previous errors
        },
        (err) => {
          // console.error("Error watching position:", err);
          setError(err.message); // Store error message
        },
        { enableHighAccuracy: true }
      );
    } else {
      // console.error("Geolocation is not supported by this browser.");
      setError("Geolocation is not supported by this browser.");
    }
  };

  // Stop watching position when component unmounts
  const stopWatchingPosition = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    // Initial fetch for stable location
    fetchStableLocation();

    // Start watching current position
    startWatchingPosition();

    // Set up interval to update stable location every 10 seconds
    const intervalId = setInterval(fetchStableLocation, 10000);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      stopWatchingPosition();
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{ stableLocation, currentPosition, error }}
    >
      {children}
    </LocationContext.Provider>
  );
};
