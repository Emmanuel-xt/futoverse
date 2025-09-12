"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [visibleCards, setVisibleCards] = useState(new Set())
  const cardRefs = useRef([])

  useEffect(() => {
    setIsVisible(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = Number.parseInt(entry.target.dataset.cardIndex)
            setVisibleCards((prev) => new Set([...prev, cardIndex]))
          }
        })
      },
      { threshold: 0.2, rootMargin: "50px" },
    )

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center  text-white bg-blue-600">
        <div
          className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h1
            className={`text-4xl animate-pulse md:text-6xl font-bold text-balance mb-6 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            Campus Connect 3D
          </h1>
          <p
            className={`text-xl text-muted-foreground text-pretty max-w-2xl mx-auto mb-8 transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            Your ultimate university companion featuring 3D campus mapping, social networking, and marketplace - all in one App
          </p>
          <div
            className={`flex flex-wrap justify-center gap-2 transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge variant="secondary" className="animate-pulse">
              3D Mapping
            </Badge>
            <Badge variant="secondary" className="animate-bounce">
              Social Network
            </Badge>
            <Badge variant="secondary" className="animate-pulse">
              Marketplace
            </Badge>
            <Badge variant="secondary" className="animate-bounce">
              Real-time
            </Badge>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        {/* Core Features */}
        <section>
          <div className="text-center mb-12">
            <h2
              className={`text-3xl font-bold mb-4 transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
              Core Features
            </h2>
            <p
              className={`text-lg text-muted-foreground max-w-2xl mx-auto text-pretty transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            >
              Experience university life like never before with our innovative 3D platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
            {[
              {
                title: "3D Campus Navigation",
                description: "Immersive campus exploration",
                content:
                  "Navigate through detailed 3D campus with businesses and landmarks displayed in immersive form.",
                image: "/assets/3D.jfif",
                alt: "3D Campus Mapping",
                bg: "bg-white",
                slideFrom: "left",
              },
              
              {
                title: "Campus Marketplace",
                description: "Shop and discover local businesses",
                content: " Discover local businesses and services around campus. You can also pitch your own stores.",
                image: "/assets/commerce2.jfif",
                alt: "Campus Marketplace",
                bg: "bg-white",
                slideFrom: "left",
              },
              {
                title: "Real-time Chat",
                description: "Instant communication system",
                content:
                  "Chat with connected users instantly, receive notifications, and stay updated with campus activities. Find and connect with students by level, department, and faculty. Build meaningful relationships",
                image: "/assets/chat.jfif",
                alt: "Real-time Chat",
                bg: "bg-blue-50",
                slideFrom: "right",
              },
              {
                title: "Live Activity Tracking",
                description: "Real-time user presence",
                content:
                  "See active users on the 3D map, get real-time notifications, and stay connected with live updates.",
                image: "/assets/track.webp",
                alt: "Live Activity",
                bg: "bg-white",
                slideFrom: "left",
              },
              {
                title: "AI Assistant",
                description: "Intelligent campus support",
                content:
                  "Get personalized assistance and recommendations based on your campus activity and preferences.",
                image: "/assets/AI.jfif",
                alt: "AI Assistant",
                bg: "bg-blue-50",
                slideFrom: "right",
              },
            ].map((card, index) => (
              <Card
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                data-card-index={index}
                className={`${card.bg} w-96 mx-auto flex flex-col rounded-lg justify-center items-center hover:shadow-xl transition-all duration-700 hover:-translate-y-2 hover:scale-105 transform ${
                  visibleCards.has(index)
                    ? "opacity-100 translate-x-0"
                    : `opacity-0 ${card.slideFrom === "left" ? "-translate-x-20" : "translate-x-20"}`
                }`}
              >
                <CardHeader>
                  <Image
                    src={card.image || "/placeholder.svg"}
                    width={300}
                    height={300}
                    alt={card.alt}
                    className="w-96 object-cover rounded-lg mb-4 hover:scale-1.25 transition-transform duration-300"
                  />
                  <CardTitle className="hover:text-blue-600 transition-colors">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>      

        {/* Call to Action */}
        <section
          className={`text-center py-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <h2 className="text-3xl font-bold mb-4 animate-pulse">Join Campus Connect 3D</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-pretty opacity-90">
            Transform your university experience with 3D navigation, social connections, and real-time campus life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="px-8 bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300"
            >
              Explore Campus
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent hover:scale-105 transition-all duration-300"
            >
              Join Community
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
