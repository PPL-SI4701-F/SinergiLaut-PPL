"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

interface MapViewProps {
  lat: number
  lng: number
  label?: string
}

export default function MapView({ lat, lng, label }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY || 'get_your_own_free_key_at_maptiler'}`,
      center: [lng, lat],
      zoom: 15,
      scrollWheelZoom: false, // Optional: disable scroll zoom on detail view
    })

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), "top-right")

    // Add marker
    const marker = new maplibregl.Marker({ color: "#0ea5e9" })
      .setLngLat([lng, lat])
      .addTo(map)

    if (label) {
      const popup = new maplibregl.Popup({ offset: 25 })
        .setText(label)
      marker.setPopup(popup)
    }

    mapRef.current = map

    return () => map.remove()
  }, [lat, lng, label])

  return (
    <div className="h-[350px] w-full rounded-xl overflow-hidden border border-border shadow-md z-0">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  )
}
