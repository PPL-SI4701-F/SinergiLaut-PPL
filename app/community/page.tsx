"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { 
  ArrowRight, 
  Users, 
  MapPin, 
  Globe, 
  Award, 
  Building, 
  MessageCircle,
  Search,
  CheckCircle2,
  FileText,
  Shield,
  Waves,
  Heart,
  Star,
  Activity
} from "lucide-react"

import { getRegisteredCommunities, getAdminDashboardStats } from "@/lib/actions/dashboard.actions"

// Extracted to fetch dynamically

const requirements = [
  {
    icon: Building,
    title: "Legal Organization",
    description: "Must be a registered organization, NGO, or community group with legal documentation",
  },
  {
    icon: Users,
    title: "Active Members",
    description: "Minimum 10 active members committed to marine conservation activities",
  },
  {
    icon: Activity,
    title: "Conservation Focus",
    description: "Primary focus on marine or coastal conservation, education, or sustainability",
  },
  {
    icon: Shield,
    title: "Commitment to Standards",
    description: "Agree to uphold SinergiLaut's community guidelines and ethical standards",
  },
]

const benefits = [
  {
    icon: Globe,
    title: "Dedicated Community Page",
    description: "Your own branded page to showcase activities and attract volunteers",
  },
  {
    icon: Activity,
    title: "Activity Management",
    description: "Create, publish, and manage conservation activities with volunteer registration",
  },
  {
    icon: Heart,
    title: "Donation Collection",
    description: "Receive donations directly for your activities with transparent tracking",
  },
  {
    icon: Users,
    title: "Volunteer Network",
    description: "Connect with thousands of passionate volunteers across Indonesia",
  },
  {
    icon: Star,
    title: "Visibility & Recognition",
    description: "Get featured on our platform and gain recognition for your work",
  },
  {
    icon: Award,
    title: "Verified Badge",
    description: "Earn a verified badge to build trust with volunteers and donors",
  },
]

const testimonials = [
  {
    quote: "Joining SinergiLaut transformed our small beach cleanup group into a recognized conservation community. We've grown from 20 to over 400 members!",
    name: "Sarah Chen",
    role: "Founder, Ocean Guardians Bali",
    image: "/images/testimonial-1.jpg",
  },
  {
    quote: "The platform made it easy for us to manage volunteers and collect donations. Our coral restoration project has never been more successful.",
    name: "Dr. Budi Hartanto",
    role: "Director, Coral Triangle Foundation",
    image: "/images/testimonial-2.jpg",
  },
  {
    quote: "As a traditional fishing community, we found a voice through SinergiLaut. Now we educate others about sustainable practices.",
    name: "Pak Made",
    role: "Community Leader, Fishermen United",
    image: "/images/testimonial-3.jpg",
  },
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null)
  
  const [registeredCommunities, setRegisteredCommunities] = useState<any[]>([])
  const [globalStats, setGlobalStats] = useState<any>(null)

  useEffect(() => {
    getRegisteredCommunities().then(setRegisteredCommunities)
    getAdminDashboardStats().then(setGlobalStats)
  }, [])

  const focusAreas = Array.from(
    new Set(registeredCommunities.flatMap((c) => c.focus_areas || []))
  ).sort()

  const filteredCommunities = registeredCommunities.filter((community) => {
    const matchesSearch =
      community.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFocus = !selectedFocus || (community.focus_areas && community.focus_areas.includes(selectedFocus))
    return matchesSearch && matchesFocus
  })

  const computeStatsDisplay = [
    { icon: Users, value: globalStats ? `${globalStats.totalUsers}+` : "...", label: "Active Members" },
    { icon: MapPin, value: globalStats ? `${globalStats.totalCommunities}+` : "...", label: "Coastal Communities" },
    { icon: Globe, value: "1", label: "Partner Countries" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/community-hero.jpg"
              alt="Marine conservation community"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-foreground/70" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-6 bg-accent text-accent-foreground">
              50+ Registered Communities
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-card leading-tight text-balance">
              Conservation Communities
            </h1>
            <p className="mt-6 text-lg text-card/90 max-w-2xl mx-auto leading-relaxed">
              Discover and join registered conservation communities, or apply to register your own organization and start making an impact.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/community/register">
                  Register Your Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-card/10 text-card border-card/30 hover:bg-card/20 hover:text-card" asChild>
                <Link href="#communities">Browse Communities</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-12 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {computeStatsDisplay.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4 justify-center">
                  <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-foreground">{stat.value}</p>
                    <p className="text-sm text-primary-foreground/80">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Register Your Community CTA */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Become a Partner
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance mb-6">
                  Register Your Community
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Are you leading a marine conservation group? Join SinergiLaut as a registered community to access powerful tools for managing activities, volunteers, and donations.
                </p>

                <div className="space-y-4 mb-8">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <req.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{req.title}</h4>
                        <p className="text-sm text-muted-foreground">{req.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button size="lg" asChild>
                  <Link href="/community/register">
                    Start Registration
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src="/images/mission-ocean.jpg"
                    alt="Marine conservation community"
                    fill
                    className="object-cover"
                  />
                </div>
                <Card className="absolute -bottom-6 -left-6 w-64 shadow-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Quick Approval</p>
                        <p className="text-xs text-muted-foreground">2-3 business days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Simple 5-step process</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 lg:py-28 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
                Why Register Your Community?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Unlock powerful features to grow your impact and reach more supporters.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Browse Communities */}
        <section id="communities" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
                Registered Communities
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore verified conservation communities making a difference across Indonesia.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-6 mb-10 items-center">
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search communities by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 w-full rounded-full bg-background"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedFocus === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFocus(null)}
                  className="rounded-full"
                >
                  All
                </Button>
                {focusAreas.map((focus) => (
                  <Button
                    key={focus}
                    variant={selectedFocus === focus ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFocus(focus)}
                    className="rounded-full"
                  >
                    {focus}
                  </Button>
                ))}
              </div>
            </div>

            {/* Communities Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <Card key={community.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary shrink-0">
                          <Image
                            src={community.logo_url || "https://placehold.co/100"}
                            alt={community.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{community.name}</h3>
                            {community.is_verified && (
                              <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {community.location || "Tanpa Lokasi"}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {community.description || "Tidak ada deskripsi"}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(community.focus_areas || []).map((f: string) => (
                          <Badge key={f} variant="outline" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {community.member_count || 0} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          Live activities
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/community/${community.id}`}>
                          View Community
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCommunities.length === 0 && (
              <div className="text-center py-12">
                <Waves className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No communities found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
tion>

        {/* Testimonials */}
        <section className="py-20 lg:py-28 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
                Community Success Stories
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Hear from community leaders who have grown their impact with SinergiLaut.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-background">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <p className="text-muted-foreground italic mb-6 leading-relaxed">
                      {`"${testimonial.quote}"`}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 lg:py-28 bg-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Waves className="h-8 w-8 text-primary-foreground/80" />
              <Heart className="h-8 w-8 text-accent" />
              <Users className="h-8 w-8 text-primary-foreground/80" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground text-balance mb-6">
              Ready to Grow Your Impact?
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-10">
              Join our network of conservation communities and unlock tools to reach more volunteers, collect donations, and scale your marine conservation efforts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/community/register">
                  Register Your Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20 hover:text-primary-foreground" asChild>
                <Link href="/activities">View All Activities</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
