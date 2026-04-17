"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder"
import "maplibre-gl/dist/maplibre-gl.css"
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css"
import { Loader2, MapPin } from "lucide-react"

interface MapPickerProps {
  lat?: number | null
  lng?: number | null
  onChange: (lat: number, lng: number) => void
  defaultCenter?: [number, number]
}

export default function MapPicker({ lat, lng, onChange, defaultCenter = [106.816666, -6.200000] }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  // Use MapTiler's open style as default. User can provide their own key via .env
  const styleUrl = "https://demotiles.maplibre.org/style.json" // Placeholder for full vector style

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize MapLibre
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: process.env.NEXT_PUBLIC_MAPTILER_KEY
        ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
        : {
            version: 8 as const,
            sources: {
              osm: {
                type: "raster" as const,
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "&copy; OpenStreetMap Contributors",
                maxzoom: 19,
              },
            },
            layers: [
              {
                id: "osm",
                type: "raster" as const,
                source: "osm",
              },
            ],
          },
      center: lat && lng ? [lng, lat] : [defaultCenter[0], defaultCenter[1]],
      zoom: 13,
    })

    const geocoder = new MaplibreGeocoder(
      {
        forwardGeocode: async (config) => {
          const features = []
          try {
            const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`
            const response = await fetch(request)
            const geojson = await response.json()
            for (const feature of geojson.features) {
              const center = [
                feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
                feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2
              ]
              const point = {
                type: 'Feature' as const,
                geometry: {
                  type: 'Point' as const,
                  coordinates: center as [number, number]
                },
                place_name: feature.properties.display_name,
                properties: feature.properties,
                text: feature.properties.display_name,
                place_type: ['place'],
                center: center as [number, number]
              }
              features.push(point)
            }
          } catch (e) {
            console.error('Failed to forwardGeocode', e)
          }
          return {
            type: 'FeatureCollection' as const,
            features: features
          }
        }
      },
      {
        maplibregl: maplibregl,
        marker: false,
        placeholder: "Cari daerah/lokasi...",
      }
    )

    map.addControl(geocoder, "top-right")
    map.addControl(new maplibregl.NavigationControl(), "top-right")

    // Handle map click to place pin
    map.on("click", (e) => {
      const { lng: clickLng, lat: clickLat } = e.lngLat
      onChange(clickLat, clickLng)
    })

    mapRef.current = map

    return () => map.remove()
  }, [])

  // Sync marker position when lat/lng props change
  useEffect(() => {
    if (!mapRef.current) return

    if (lat && lng) {
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ color: "#0ea5e9" }) // Using SinergiLaut's primary color
          .setLngLat([lng, lat])
          .addTo(mapRef.current)
      } else {
        markerRef.current.setLngLat([lng, lat])
      }
      
      // Fly to new position if not already centered (with threshold)
      const currentCenter = mapRef.current.getCenter()
      if (Math.abs(currentCenter.lat - lat) > 0.0001 || Math.abs(currentCenter.lng - lng) > 0.0001) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 15 })
      }
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [lat, lng])

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border shadow-md">
      <div 
        ref={mapContainerRef} 
        className="h-[400px] w-full z-0" 
      />
      
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded border border-border text-[10px] text-muted-foreground z-[1000] shadow-sm">
        Gunakan kotak pencarian atau klik langsung pada peta untuk memindahkan pin
      </div>

      {!process.env.NEXT_PUBLIC_MAPTILER_KEY && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-center">
          <p className="text-[8px]">Membutuhkan MapTiler Key untuk detail peta vector</p>
        </div>
      )}
    </div>
  )
}
