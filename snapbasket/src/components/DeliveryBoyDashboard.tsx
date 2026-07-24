'use client'

import axios from 'axios'
import { getSocket } from '@/lib/socket'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import LiveMap from './LiveMap'
import DeliveryChat from './DeliveryChat'
import { div } from 'motion/react-client'
import { Loader } from 'lucide-react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ILocation {
  latitude: number
  longitude: number
}

function DeliveryBoyDashboard({earning}:{earning:number}) {
  const [assignments, setAssignments] = useState<any[]>([])
  const { userData } = useSelector((state: RootState) => state.user)

  const [activeOrder, setActiveOrder] = useState<any>(null)
  const [showOtpBox,setShowOtpBox]=useState(false)
  const [otpError,setOtpError]=useState("")
  const [sendOtpLoading,setSendOtpLoading]=useState(false)
  const [verifyOtpLoading,setVerifyOtpLoading]=useState(false)
  const [otp,setOtp]=useState("")
  const [completedOrderId,setCompletedOrderId]=useState<string | null>(null)
  const completedNoticeTimer=useRef<ReturnType<typeof setTimeout> | null>(null)
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0
  })

  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0
  })

  const fetchAssignments = useCallback(async () => {
    try {
      const result = await axios.get("/api/delivery/get-assignments")
      setAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }, [])

  const fetchCurrentOrder = useCallback(async () => {
    try {
      const result = await axios.get("/api/delivery/current-order")
      console.log("CURRENT ORDER RESULT:", result.data)

      if (result.data.active) {
        setActiveOrder(result.data.assignment)

        const address = result.data.assignment?.order?.address
        if (address?.latitude && address?.longitude) {
          setUserLocation({
            latitude: address.latitude,
            longitude: address.longitude,
          })
        } else {
          console.log("Address missing latitude/longitude:", address)
        }
      } else {
        setActiveOrder(null)
        setUserLocation({ latitude: 0, longitude: 0 })
      }
    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    const socket = getSocket()

    const handleNewOrder = (order: any) => {
      console.log("New order received", order)
      fetchAssignments()
    }

    socket.on("new-order", handleNewOrder)

    return () => {
      socket.off("new-order", handleNewOrder)
    }
  }, [fetchAssignments])

  useEffect(() => {
    if (!userData?._id) return
    const socket = getSocket()
    const identify = () => socket.emit("identity", userData._id)

    if (socket.connected) {
      identify()
    }
    socket.on("connect", identify)

    if (!navigator.geolocation) {
      return () => {
        socket.off("connect", identify)
      }
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setDeliveryBoyLocation({
          latitude: lat,
          longitude: lon
        })
        socket.emit("update-location", {
          userId: userData?._id,
          latitude: lat,
          longitude: lon
        })
      },
      (err) => {
        console.log("Geolocation error:", err)
      },
      { enableHighAccuracy: true }
    )

    return () => {
      socket.off("connect", identify)
      navigator.geolocation.clearWatch(watcher)
    }
  }, [userData?._id])

  useEffect(() => {
    const socket = getSocket()

    const handleNewAssignment = () => {
      fetchAssignments()
    }

    socket.on("new-assignment", handleNewAssignment)

    return () => {
      socket.off("new-assignment", handleNewAssignment)
    }
  }, [fetchAssignments])

  useEffect(() => {
    fetchAssignments()
    fetchCurrentOrder()
  }, [fetchAssignments, fetchCurrentOrder, userData])

  const sendOtp=async()=>{
    setSendOtpLoading(true)
    try {
        const result=await axios.post("/api/delivery/otp/send",{orderId:activeOrder.order._id})
        console.log(result.data)
        setShowOtpBox(true)
        setSendOtpLoading(false)
    } catch (error) {
        console.log(error)
        setSendOtpLoading(false)
    }
  }
  const verifyOtp=async()=>{
    setVerifyOtpLoading(true)
    try {
        const result=await axios.post("/api/delivery/otp/verify",{orderId:activeOrder.order._id,otp})
        console.log(result.data)
        setCompletedOrderId(activeOrder.order._id.toString())
        if (completedNoticeTimer.current) clearTimeout(completedNoticeTimer.current)
        completedNoticeTimer.current=setTimeout(()=>setCompletedOrderId(null),5000)
        setActiveOrder(null)
        setShowOtpBox(false)
        setOtp("")
        setVerifyOtpLoading(false)
        await fetchCurrentOrder()
        window.location.reload()
    } catch (error) {
        setOtpError("Otp Verification Error")
        setVerifyOtpLoading(false)
    }
  }

  useEffect(()=>()=>{
    if (completedNoticeTimer.current) clearTimeout(completedNoticeTimer.current)
  },[])

  const handleAccept = async (id: string) => {
    try {
      const result = await axios.get(
        `/api/delivery/assignment/${id}/accept-assignment`
      )
      console.log(result)
      fetchAssignments()
      fetchCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  const hasValidUserLocation =
    userLocation.latitude !== 0 || userLocation.longitude !== 0


    if(!activeOrder && assignments.length===0){
        const todayEarning=[
            {name:"Today",
                earning,
                deliveries:earning/40
            }
        ]
        return(
            <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-white to-purple-50 p-6'>
<div className='max-w-md w-full text-center '>
<h2 className='text-2xl font-bold text-gray-800'>No Ongoing Deliveries 🏍️ </h2>
<p className='text-gray-500 mb-5'>Stay Online to receive incoming orders</p>

<div className='bg-white border rounded-xl shadow-xl p-6'>
    <h2 className='font-medium text-purple-700 mb-2'>Today's Performance</h2>
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={todayEarning}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Tooltip/>
            <Legend/>
    <Bar dataKey="earnings" name="Earnings (₹)"/>
    <Bar dataKey="deliveries" name="Deliveries"/>

    
    
        </BarChart>
    </ResponsiveContainer>
<p className='mt-4 text-lg font-bold text-purple-700 '>You earned ₹{earning || 0} today</p>
<button className='mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg' onClick={()=>window.location.reload()}>Refresh Earnings</button>
</div>
</div>
            </div>
        )
    }

  if (activeOrder && hasValidUserLocation) {
    return (
      <div className="p-4 pt-25 min-h-screen bg-gray-50">
        <div className='max-w-3xl mx-auto'>
          <h1 className="text-2xl font-bold text-purple-700 mb-2">
            Active Delivery
          </h1>
          <p className='text-gray-600 text-sm mb-4'>order#{activeOrder.order._id.slice(-6)}</p>

          <div className='rounded-xl border border-lg overflow-hidden'>
            <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
          </div>
          <DeliveryChat orderId={activeOrder.order._id} deliveryBoyId={userData?._id!}/>
          <div className='mt-6 bg-white rounded-xl border shadow p-6'>
            {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
<button 
onClick={sendOtp}
className='w-full py-4 bg-purple-600 text-center text-white rounded-lg'>{sendOtpLoading?<Loader size={16} className='animate-spin text-white text-center'/>:"Mark as Delivered"}</button>
          
            )}

{
    showOtpBox && 
    <div className='mt-4'>
<input type="text" className='w-full py-3 border rounded-lg text-center' placeholder='Enter Otp' maxLength={4} onChange={(e)=>setOtp(e.target.value)} value={otp}/>
<button className='w-full mt-4 bg-purple-600 text-center text-white py-3 rounded-lg' onClick={verifyOtp}>{verifyOtpLoading?<Loader size={16} className='animate-spin text-white text-center'/>:"Verify OTP"}</button>
{otpError && <div className='text-red-600 mt-2'>{otpError}</div>}


    </div>
}
{activeOrder.order.deliveryOtpVerification && <div className='text-purple-700 text-center font-bold'>Delivery completed!</div>}


</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mt-20 mb-8">
          Delivery Assignments
        </h2>

        {completedOrderId && (
          <div className='mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center font-semibold text-green-700'>
            Order #{completedOrderId.slice(-6)} delivered successfully.
          </div>
        )}

        {assignments.length === 0 ? (
          <p className="text-center text-gray-500">
            No delivery assignments available.
          </p>
        ) : (
          assignments.map((a,index) => (
            <div
              key={index}
              className="p-5 bg-white rounded-xl shadow mb-4 border"
            >
              <p>
                <b>Order Id:</b> #{a.order?._id?.slice(-6)}
              </p>

              <p className="text-gray-600 mt-2">
                {a.order?.address?.fullAddress}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleAccept(a._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  Accept
                </button>

                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DeliveryBoyDashboard
