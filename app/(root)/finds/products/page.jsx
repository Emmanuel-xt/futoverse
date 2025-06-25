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
import { Slider } from "@components/ui/slider";
import { Search, Filter, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollPosition } from "hooks/use-scroll-position";
import Image from "next/image";

// Mock products data based on your ShopItem schema
const mockProducts = [
  {
    id: 1,
    name: "MacBook Pro 13-inch",
    price: 1299.99,
    image: "/placeholder.svg?height=200&width=200",
    description:
      "Latest MacBook Pro with M2 chip, perfect for students and professionals",
    category: "Electronics",
    tag: "laptop",
    quantity: 5,
    shop: { name: "Tech Hub Electronics", id: 3 },
    user: { name: "John Doe", username: "john_doe" },
  },
  {
    id: 2,
    name: "Calculus Textbook",
    price: 89.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Essential calculus textbook for mathematics students",
    category: "Books",
    tag: "textbook",
    quantity: 12,
    shop: { name: "Campus Bookstore", id: 1 },
    user: { name: "Jane Smith", username: "jane_smith" },
  },
  {
    id: 3,
    name: "Wireless Headphones",
    price: 199.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "High-quality wireless headphones with noise cancellation",
    category: "Electronics",
    tag: "audio",
    quantity: 8,
    shop: { name: "Tech Hub Electronics", id: 3 },
    user: { name: "Mike Wilson", username: "mike_wilson" },
  },
  {
    id: 4,
    name: "University Hoodie",
    price: 45.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Official university hoodie, comfortable and stylish",
    category: "Clothing",
    tag: "apparel",
    quantity: 20,
    shop: { name: "Fashion Forward", id: 4 },
    user: { name: "Sarah Johnson", username: "sarah_johnson" },
  },
  {
    id: 5,
    name: "Scientific Calculator",
    price: 29.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Advanced scientific calculator for engineering students",
    category: "Supplies",
    tag: "calculator",
    quantity: 15,
    shop: { name: "Study Essentials", id: 5 },
    user: { name: "Alex Brown", username: "alex_brown" },
  },
  {
    id: 6,
    name: "Smartphone Case",
    price: 24.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Protective case for iPhone and Android devices",
    category: "Electronics",
    tag: "accessory",
    quantity: 30,
    shop: { name: "Tech Hub Electronics", id: 3 },
    user: { name: "John Doe", username: "john_doe" },
  },
];

const categories = [
  "Electronics",
  "Books",
  "Clothing",
  "Supplies",
  "Food",
  "Health & Beauty",
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition, restoreScrollPosition } =
    useScrollPosition("products-list");

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All categories"
  );
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory !== "All categories")
      params.set("category", selectedCategory);
    if (priceRange[0] > 0 || priceRange[1] < 2000) {
      params.set("minPrice", priceRange[0].toString());
      params.set("maxPrice", priceRange[1].toString());
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/finds/products${newUrl}`, { scroll: false });
  }, [searchQuery, selectedCategory, priceRange, router]);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tag?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All categories" ||
        product.category === selectedCategory;

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, priceRange]);

  const handleProductClick = (productId) => {
    saveScrollPosition();
    router.push(`/finds/products/${productId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All categories");
    setPriceRange([0, 2000]);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 space-y-2">
        <Link href="/finds">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Find Products</h1>
          <p className="text-muted-foreground">Browse items and marketplace</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products by name, description, or tag..."
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
          {(selectedCategory !== "All categories" ||
            priceRange[0] > 0 ||
            priceRange[1] < 2000) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All categories">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={2000}
                min={0}
                step={10}
                className="mt-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.quantity} left
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ${product.price}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      by {product.shop.name}
                    </span>
                    <Button size="sm" variant="outline" className="h-8">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No products found matching your criteria.
            </p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Clear filters to see all products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
