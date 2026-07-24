'use client'
import {getSocket} from '@/lib/socket'
import React, { useEffect } from 'react'

function GeoUpdater({userId}:{userId:string}){
    useEffect(()=>{
    if(!userId)return
       const socket=getSocket()
       const identify=()=>socket.emit("identity",userId)

       if(socket.connected){
        identify()
       }
       socket.on("connect",identify)

       if(!navigator.geolocation){
        return ()=>{
          socket.off("connect",identify)
        }
       }
       const watcher=  navigator.geolocation.watchPosition((pos)=>{
          const lat=pos.coords.latitude
          const lon=pos.coords.longitude
          socket.emit("update-location",{
            userId,
            latitude:lat,
            longitude:lon
          })
        },(err)=>{
         console.log(err)
        },{enableHighAccuracy:true})

        return ()=>{
          socket.off("connect",identify)
          navigator.geolocation.clearWatch(watcher)
        }
    },[userId])
    return null
}

export default GeoUpdater
