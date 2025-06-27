"use client";

import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";

export default function StoreCard({ store, onClick }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-400/50 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative">
        <Image
          src={store.image || "/images/noStore.png"}
          alt={store.name}
          width={300}
          height={200}
          className="w-full h-48 object-contain rounded-t-lg group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant={store.isOpen ? "default" : "secondary"}
            className={store.isOpen ? "bg-green-500" : ""}
          >
            {store.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-1">{store.name}</h3>
          </div>

          <div className="flex items-center gap-1">
            {renderStars(store.rating || 0)}
            <span className="text-sm text-muted-foreground ml-1">
              {store.rating || 0} ({store.reviewCount || 0})
            </span>
          </div>

          <Badge variant="outline" className="text-xs">
            {store.category}
          </Badge>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {store.description}
          </p>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{store?.locationDesc}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
