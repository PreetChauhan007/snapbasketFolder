'use client'

import LiveMap from '@/components/LiveMap'
import { getSocket } from '@/lib/socket'
import axios from 'axios'
import { ArrowLeft, Loader, Send, Sparkle } from 'lucide-react'
import mongoose from 'mongoose'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import {AnimatePresence, motion} from "motion/react"
import { IMessage } from '@/models/message.model'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
interface IUser {
  _id?: mongoose.Types.ObjectId
  name: string
  mobile?: string
  image?: string
  location?: {
    coordinates?: [number, number]
  }
}

interface IOrder{
  _id?:mongoose.Types.ObjectId
  user:mongoose.Types.ObjectId
  items:[
    {
      grocery:mongoose.Types.ObjectId,
      name:string,
      price:string,
      unit:string,
      image:string,
      quantity:number
    }
  ]
  ,
  isPaid:boolean
  totalAmount:number,
  paymentMethod: "cod" | "online"
  address:{
    fullName:string,
    mobile:string,
    city:string,
    state:string,
    pincode:string,
    fullAddress:string,
    latitude:number,
    longitude:number
  }
  assignment?:mongoose.Types.ObjectId
  assignedDeliveryBoy?:IUser
  status:"pending"  | "out for delivery" | "delivered",
  createdAt?:Date
  updatedAt?:Date
  deliveredAt?:Date
}
interface ILocation{
  latitude:number,
  longitude:number
}
function TrackOrder() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<IOrder>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<ILocation>({ latitude: 0, longitude: 0 })
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({ latitude: 0, longitude: 0 })
  const {userData}=useSelector((state:RootState)=>state.user)
const [newMessage,setNewMessage]=useState("")
const [messages,setMessages]=useState<IMessage[]>()
const chatBoxRef=useRef<HTMLDivElement>(null)
const [suggestions,setSuggestions]=useState<string[]>([])

  useEffect(() => {
    const socket = getSocket()
    const handleStatusUpdate = ({ orderId: updatedOrderId, status, deliveredAt }: { orderId: string; status: IOrder['status']; deliveredAt?: string }) => {
      if (updatedOrderId !== orderId) return
      setOrder(current => current ? { ...current, status, ...(deliveredAt ? { deliveredAt: new Date(deliveredAt) } : {}) } : current)
    }
    socket.on('order-status-update', handleStatusUpdate)
    return () => {
      socket.off('order-status-update', handleStatusUpdate)
    }
  }, [orderId])

  // Once the OTP is verified, leave live tracking and show the delivered order
  // in the user's order list instead of keeping the map screen open.
  useEffect(() => {
    if (order?.status === 'delivered') {
      router.replace('/user/my-orders')
    }
  }, [order?.status, router])

  useEffect(() => {
    const getOrder = async () => {
      try {
        const result = await axios.get(`/api/user/get-order/${orderId}`)
        const fetchedOrder = result.data as IOrder
        const coordinates = fetchedOrder.assignedDeliveryBoy?.location?.coordinates

        setOrder(fetchedOrder)
        setUserLocation({
          latitude: fetchedOrder.address.latitude,
          longitude: fetchedOrder.address.longitude,
        })

        if (coordinates?.length === 2) {
          setDeliveryBoyLocation({ latitude: coordinates[1], longitude: coordinates[0] })
        }
      } catch (error) {
        console.log(error)
        setError('Order tracking details could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      getOrder()
    }
  },
  [orderId])

  useEffect(() => {
    const deliveryBoyId = order?.assignedDeliveryBoy?._id?.toString()
    if (!deliveryBoyId) return

    const socket = getSocket()
    const handleLocationUpdate = (data: { userId: string; location: { coordinates?: [number, number] } }) => {
      if (data.userId.toString() !== deliveryBoyId) return

      const coordinates = data.location.coordinates
      if (coordinates?.length === 2) {
        setDeliveryBoyLocation({ latitude: coordinates[1], longitude: coordinates[0] })
      }
    }

    socket.on('update-delivery-boy-location', handleLocationUpdate)
    return () => {
      socket.off('update-delivery-boy-location', handleLocationUpdate)
    }
  }, [order?.assignedDeliveryBoy?._id])


  useEffect(()=>{
      const socket=getSocket()
      const handleMessage = (message:IMessage) => {
        if(message.roomId?.toString() !== orderId) return
        setMessages(prev => {
          const current = prev ?? []
          return current.some(item => item._id?.toString() === message._id?.toString()) ? current : [...current, message]
        })
      }
      socket.emit("join-room",orderId)
      socket.on("send-message",handleMessage)
      return ()=> {
        socket.off("send-message",handleMessage)
      }
  },[orderId])
  
  const sendMsg=()=>{
  if (!newMessage.trim()) return
  const socket=getSocket()
  
  const message={
  roomId:orderId,
  text:newMessage,
  senderId:userData?._id,
  time:new Date().toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
  })
  
  }
  socket.emit("send-message",message)
  
  setNewMessage("")
  }
  useEffect(()=>{
      const getAllMessages=async()=>{
          try {
              const result=await axios.post("/api/chat/messages",{roomId:orderId})
              setMessages(result.data)
          } catch (error) {
              console.log(error)
          }
      }
      getAllMessages()
  },[orderId])
  
useEffect(()=>{
    chatBoxRef.current?.scrollTo({
        top:chatBoxRef.current.scrollHeight,
        behavior:"smooth"
    })
},[messages])

const getSuggestion=async ()=>{
    setLoading(true)
    try {
        const lastMessage=messages?.filter(m=>m.senderId!==userData?._id)?.at(-1)
        const result=await axios.post("/api/chat/ai-suggestions",{message:lastMessage?.text,role:"user"})
        setSuggestions(result.data)
        setLoading(false)
    } catch (error) {
        console.log(error)
        setLoading(false)
    }
}

  if (loading) {
    return <div className='min-h-screen grid place-items-center text-gray-600'>Loading order tracking...</div>
  }

  if (error || !order) {
    return <div className='min-h-screen grid place-items-center px-4 text-center text-red-600'>{error || 'Order not found.'}</div>
  }

  return(
<div className='w-full min-h-screen bg-linear-to-b from-purple-50 to-white'>
  <div className='max-w-2xl mx-auto pb-24'>
<div className='sticky top-0 bg-white/80 backdrop-blur-xl p-4 border-b shadow flex gap-3 items-center z-999'>
  <button className='p-2 bg-purple-100 rounded-full' onClick={()=>router.back()}><ArrowLeft className='text-purple-700' size={20}/></button>
  <div>
<h2 className='text-xl font-bold'>Track Order</h2>
<p className='text-sm text-gray-600'>order#{order._id?.toString().slice(-6)} <span className='text-purple-700 font-semibold'>{order.status}</span></p>
  </div>
</div>

<div className='px-4 mt-6 space-y-4'>
  {order.status !== 'delivered' && <div className='rounded-3xl overflow-hidden border shadow'>
<LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation}/>
  </div>}

  {order.status === 'delivered' && order.createdAt && order.deliveredAt && (
    <div className='rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800'>
      Delivered at {new Date(order.deliveredAt).toLocaleString()} • Delivered in {Math.max(1, Math.round((new Date(order.deliveredAt).getTime() - new Date(order.createdAt).getTime()) / 60000))} minutes
    </div>
  )}

  {!order.assignedDeliveryBoy && (
    <p className='mt-4 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800'>A delivery partner has not been assigned yet.</p>
  )}


 <div className='bg-white rounded-3xl shadow-lg border p-4 h-107.5 flex flex-col'>
<div className='flex justify-between item-center mb-3'>
    <span className='font-semibold text-gray-700 text-sm'>Quick Replies</span>
    <motion.button
    whileTap={{scale:0.9}}
    disabled={loading}
    className='px-3 py-1 text-xs flex items-center gap-1 bg-purple-100  text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer'
    onClick={getSuggestion}
    ><Sparkle size={14}/>{loading?<Loader className='w-5 h-5 animate-spin'/>:"AI Suggest"}</motion.button>

</div >

<div className='flex gap-2 flex-wrap mb-3'>
{suggestions.map((s,i)=>(
    <motion.div
    key={s}
whileTap={{scale:0.92}}
className='px-3 py-1 text-xs cursor-pointer  bg-purple-50 border border-purple-200 text-purple-700 rounded-full'
onClick={()=>setNewMessage(s)}
    >
        {s}
    </motion.div>
))}
</div>


<div className='flex-1 overflow-y-auto p-2 space-y-3' ref={chatBoxRef}>
<AnimatePresence>
    {messages?.map((msg,index)=>(
        <motion.div
        key={msg._id?.toString() ?? `${msg.senderId}-${msg.time}-${index}`}
        initial={{opacity:0,y:15}}
animate={{opacity:1,y:0}}
exit={{opacity:0}}
transition={{duration:0.2}}
className={`flex ${msg.senderId==userData?._id?"justify-end":"justify-start"}`}
>
    <div className={`px-4 py-2 max-w-[75%] rounded-2xl shadow
        ${
            msg.senderId===userData?._id
            ?"bg-purple-600 text-white rounded-br-none"
            :"bg-gray-100 text-gray-800 rounded-bl-none"
        }
        `}>
        <p>{msg.text}</p>
        <p className='text-[10px] opacity-70 mt-1 text-right'>{msg.time}</p>

    </div>

        </motion.div>
    ))}
</AnimatePresence>
</div>



      <div className='flex gap-2 mt-3 border-t pt-3'>
<input type="text" placeholder='Type a Message...' className='flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-purple-500' value={newMessage} onChange={(e)=>setNewMessage(e.target.value)}/>
<button className='bg-purple-600 hover:bg-purple-700 p-3 rounded-xl text-white' onClick={sendMsg}><Send size={18}/></button>
      </div>
    </div>

</div>

  </div>

</div>
  ) 
}

export default TrackOrder
