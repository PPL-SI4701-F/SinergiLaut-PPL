"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Filter,
  ChevronDown,
  Leaf,
  Heart,
  GraduationCap,
  Anchor,
  Banknote,
  Package
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { formatDate, formatCurrency } from "@/lib/utils/helpers"

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedType, setSelectedType] = useState("All Types")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabaseActivities, setSupabaseActivities] = useState<any[]>([])
  const [availableLocations, setAvailableLocations] = useState<string[]>(["All Locations"])
  const [availableTypes, setAvailableTypes] = useState<string[]>(["All Types"])

  useEffect(() => {
    async function fetchActivities() {
      const supabase = createClient()
      const { data } = await supabase
        .from("activities")
        .select(`*, community:communities(name)`)
        .eq("status", "published")
        .order("created_at", { ascending: false })

      if (data) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          image: d.cover_image_url || "/images/placeholder.jpg",
          date: formatDate(d.start_date || new Date().toISOString()),
          location: d.location || "Online",
          type: d.category || "other",
          volunteers: d.volunteer_count || 0,
          slots: d.volunteer_quota || 0,
          icon: Leaf,
          fundingGoal: d.funding_goal || 0,
          fundingRaised: d.funding_raised || 0,
          itemsNeeded: [] 
        }))
        setSupabaseActivities(mapped)

        // Derive unique locations
        const locs = Array.from(new Set(data.map((d: any) => d.location || "Online"))) as string[]
        setAvailableLocations(["All Locations", ...locs.sort()])

        // Derive unique categories
        const types = Array.from(new Set(data.map((d: any) => d.category || "other"))) as string[]
        const capitalizedTypes = types.map(t => t.charAt(0).toUpperCase() + t.slice(1))
        setAvailableTypes(["All Types", ...capitalizedTypes.sort()])
      }
    }
    fetchActivities()
  }, [])

  const allActivities = supabaseActivities

  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation = selectedLocation === "All Locations" || 
                          activity.location.toLowerCase().includes(selectedLocation.toLowerCase())
    const matchesType = selectedType === "All Types" || 
                       activity.type === selectedType.toLowerCase()
    return matchesSearch && matchesLocation && matchesType
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-16">
        {/* Header */}
        <section className="bg-secondary py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance">
                Conservation Activities
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Find volunteer opportunities or support activities with donations and items they need to succeed.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mt-10 flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background"
                />
              </div>
              
              <div className="flex gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 min-w-[160px] justify-between bg-background">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedLocation}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    {availableLocations.map((location) => (
                      <DropdownMenuItem 
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                      >
                        {location}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 min-w-[140px] justify-between bg-background">
                      <span className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        {selectedType}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[140px]">
                    {availableTypes.map((type) => (
                      <DropdownMenuItem 
                        key={type}
                        onClick={() => setSelectedType(type)}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </section>

        {/* Activities Grid */}
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              {selectedLocation !== "All Locations" && (
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredActivities.length}</span> kegiatan ditemukan
                </p>
              )}
            </div>

            {filteredActivities.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredActivities.map((activity) => (
                  <Card key={activity.id} className="overflow-hidden group hover:shadow-lg transition-shadow relative">
                    <Link href={`/activities/${activity.id}`} className="absolute inset-0 z-10">
                      <span className="sr-only">View activity details</span>
                    </Link>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={activity.image}
                        alt={activity.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium capitalize">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <activity.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground leading-tight">{activity.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{activity.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>{activity.volunteers} / {activity.slots} volunteers</span>
                        </div>
                      </div>
                      
                      {/* Funding Progress */}
                      <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Banknote className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-foreground">Funding Progress</span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden mb-1">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${activity.fundingGoal > 0 ? Math.min((activity.fundingRaised / activity.fundingGoal) * 100, 100) : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{formatCurrency(activity.fundingRaised)}</span>
                          <span className="font-medium text-foreground">{activity.fundingGoal > 0 ? Math.round((activity.fundingRaised / activity.fundingGoal) * 100) : 0}%</span>
                        </div>
                      </div>

                      {/* Items Needed Preview — only if there are items */}
                      {activity.itemsNeeded.length > 0 && (
                        <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-accent" />
                            <span className="text-xs font-medium text-foreground">Items Needed</span>
                          </div>
                          <ul className="space-y-1">
                            {activity.itemsNeeded.slice(0, 2).map((item: any) => (
                              <li key={item.name} className="text-xs text-muted-foreground flex justify-between">
                                <span className="truncate">{item.name}</span>
                                <span className="font-medium">{item.donated}/{item.quantity}</span>
                              </li>
                            ))}
                            {activity.itemsNeeded.length > 2 && (
                              <li className="text-xs text-primary">+{activity.itemsNeeded.length - 2} more items</li>
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button className="flex-1" asChild>
                          <Link href={`/activities/${activity.id}`}>Volunteer</Link>
                        </Button>
                        <Button variant="outline" className="flex-1" asChild>
                          <Link href={`/activities/${activity.id}`}>Donate</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No activities found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters to find what you are looking for.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
              Want to organize your own conservation activity?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Register your community and propose activities that need funding and volunteer support.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/community/register">Register Your Community</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="/community">View Communities</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
