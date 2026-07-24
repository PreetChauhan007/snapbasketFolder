'use client'
import React, { useEffect, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import type { Icon } from 'leaflet'

interface ILocation {
  latitude: number
  longitude: number
}

interface IProps {
  userLocation: ILocation
  deliveryBoyLocation: ILocation
}

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })

const isValidLocation = (loc?: ILocation) =>
  !!loc && (loc.latitude !== 0 || loc.longitude !== 0)

function LiveMap({ userLocation, deliveryBoyLocation }: IProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const [icons, setIcons] = useState<{ deliveryBoy: Icon; user: Icon } | null>(null)

  useEffect(() => {
    import('leaflet')
      .then((leafletModule) => {
        const L = leafletModule.default ?? leafletModule
        setIcons({
          deliveryBoy: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/128/1023/1023346.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          }),
          user: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/128/4821/4821951.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          }),
        })
      })
      .catch((error) => console.error('Could not load map markers:', error))
  }, [])

  if (!isClient) {
    return (
      <div className="w-full h-125 rounded-xl bg-gray-100 flex items-center justify-center">
        Loading map...
      </div>
    )
  }

  const linePositions: [number, number][] =
    isValidLocation(deliveryBoyLocation) && isValidLocation(userLocation)
      ? [
          [userLocation.latitude, userLocation.longitude],
          [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude],
        ]
      : []

  const center: [number, number] = isValidLocation(deliveryBoyLocation)
    ? [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]
    : [userLocation.latitude, userLocation.longitude]

  return (
    <div className="w-full h-125 rounded-xl overflow-hidden shadow relative z-2">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isValidLocation(userLocation) && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            {...(icons ? { icon: icons.user } : {})}
          >
            <Popup>Delivery Address</Popup>
          </Marker>
        )}

        {isValidLocation(deliveryBoyLocation) && (
          <Marker
            position={[deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]}
            {...(icons ? { icon: icons.deliveryBoy } : {})}
          >
            <Popup>Delivery partner</Popup>
          </Marker>
        )}

        {linePositions.length > 0 && (
          <Polyline positions={linePositions} pathOptions={{ color: 'purple' }} />
        )}
      </MapContainer>
    </div>
  )
}

export default LiveMap
