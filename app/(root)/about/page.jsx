import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">Campus Connect 3D</h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
            Your ultimate university companion featuring 3D campus mapping, social networking, marketplace, and
            real-time connectivity - all in one app.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">3D Mapping</Badge>
            <Badge variant="secondary">Social Network</Badge>
            <Badge variant="secondary">Marketplace</Badge>
            <Badge variant="secondary">Real-time</Badge>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        {/* Mission Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              Revolutionizing university life by connecting students, businesses, and campus resources through immersive
              3D mapping, social networking, and a comprehensive marketplace ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">🗺️</div>
                  3D Campus Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Experience your campus like never before with immersive 3D mapping, virtual tours, and intelligent
                  directions to any location.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">👥</div>
                  Social Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with peers based on your level, department, social clubs and faculty. Build meaningful relationships and connections within
                  the university community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-center items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">🛍️</div>
                  Campus Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Discover local businesses, shops, and services around campus with integrated shopping and real-time
                  inventory management.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              A comprehensive university platform combining 3D visualization, social networking, marketplace
              functionality, and real-time communication.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle>3D Campus Mapping</CardTitle>
                <CardDescription>Interactive 3D visualization of your entire campus</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Navigate through a detailed 3D representation of your campus with businesses, groups, and landmarks
                  displayed in immersive 3D form.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Smart Directions</CardTitle>
                <CardDescription>Intelligent routing and navigation system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get precise directions to any location on campus with our custom university places API and advanced
                  routing algorithms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Campus Marketplace</CardTitle>
                <CardDescription>Complete shop management system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                   Discover local businesses and services
                  around campus where you can shop for your favorite products.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription>Connect and communicate instantly</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Chat with connected users in real-time, receive instant notifications, and stay updated with campus
                  activities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Social Networking</CardTitle>
                <CardDescription>Find and connect with peers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover and connect with students based on your level, department, social clubs and faculty. Build your university
                  network.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Live Activity Tracking</CardTitle>
                <CardDescription>Real-time user presence and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See all active users on the map in 3D, get real-time notifications for shop creations, and stay
                  connected with live updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>Intelligent user interaction support</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get personalized assistance and recommendations based on your campus activity and preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Blockchain Integration</CardTitle>
                <CardDescription>Secure marketplace transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Experience secure, decentralized transactions in our marketplace with integrated blockchain
                  technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

    

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Transform Your Campus Experience</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Join the future of university life. Connect with peers, explore campus in 3D, discover local businesses, and
            experience real-time campus connectivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8">
              Explore Campus
            </Button>
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              Join Community
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
