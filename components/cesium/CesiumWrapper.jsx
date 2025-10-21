"use client";

import { useEffect, useState } from "react";
import CesiumMapB from "./Cesium";
import { Progress } from "@components/ui/progress";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ExternalLink, MapPin, Globe, Zap } from "lucide-react";
import Image from "next/image";

const FIRST_VISIT_KEY = "cesium_map_first_visit";

export default function CesiumMapBWrapper() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    const isFirstVisit = !sessionStorage.getItem(FIRST_VISIT_KEY);

    if (isFirstVisit) {
      setShowOverlay(false);
      // Mark that user has visited the maps page
      sessionStorage.setItem(FIRST_VISIT_KEY, "true");

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setLoadingComplete(true);
            return 100;
          }
          return prev + 1;
        });
      }, 100); // 50ms intervals for smooth 5-second progress

      return () => clearInterval(progressInterval);
    }
  }, []);

  const handleDismiss = () => {
    setShowOverlay(false);
  };

  const handleAdClick = () => {
    window.open("https://bit.ly/ASWN2025REGISTRATIONS", "_blank");
  };

  return (
    <div id="cesium-map-wrapper" className="relative w-full h-full">
      {<CesiumMapB />}

      {showOverlay && (
        <div className="absolute inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center transition-opacity">
          <div className="max-w-md w-full mx-4 space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Initializing 3D Map
              </h2>
              <p className="text-gray-600 text-sm">
                Loading high-resolution satellite imagery and 3D terrain data
              </p>
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Loading assets...</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Ad Section */}
            <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Image
                    src="/images/marry.jpg"
                    alt="Advertisement"
                    className="w-15 h-15 rounded-lg object-cover"
                    width={100}
                    height={100}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    After School What's Next
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Unifying life choices and career paths for students
                  </p>
                  <Button
                    onClick={handleAdClick}
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs bg-transparent"
                  >
                    Learn More <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <div className="text-center">
              {loadingComplete ? (
                <Button
                  onClick={handleDismiss}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Enter 3D Map
                </Button>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">
                    Preparing immersive experience...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer References */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-xs text-gray-400">
              <span className="font-medium">OpenStreet Map</span> |{" "}
              <span className="font-medium">Three.js</span> |{" "}
              <span className="font-medium">Mapbox</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
