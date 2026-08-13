'use client'
import { Apple, Baby, Box, ChevronLeft, ChevronRight, Coffee, Cookie, Flame, Home,  Milk, Plug, Popcorn, Wheat } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import {motion} from "motion/react"
import Link from 'next/link'
function CategorySlider() {
    const categories=[
       {id:1,name:"Fruits & Veggies",icon:Apple,color:"bg-green-100"},
          {id: 2,name: "Dairy & Eggs",icon:Milk,color:"bg-yellow-100"},
           {id:3, name:"Rice, Atta, Dal & More",icon:Wheat,color:"bg-orange-100"},
            {id:4,name:"Oil, Ghee & Masala",icon:Flame,color:"bg-amber-100"},
            {id:5,name:"Biscuits & Cookies",icon:Cookie,color:"bg-yellow-100"},
            {id:6,name:"Hot & Cold Beverages",icon:Coffee,color:"bg-sky-100"},
            {id:7,name:"Instant & Frozen Food",icon:Box,color:"bg-teal-100"},
            {id:8,name:"Namkeen & Chips",icon:Popcorn,color:"bg-orange-100"},
            {id:9,name:"Baby Care",icon:Baby,color:"bg-rose-100"},
            {id:10,name:"Household Essentials",icon:Home,color:"bg-lime-100"},
            {id:11,name:"Home Appliances",icon:Plug,color:"bg-purple-100" }
    ]
 const [showLeft,setShowLeft]=useState<Boolean>()   
 const [showRight,setShowRight]=useState<Boolean>()   
const scrollRef=useRef<HTMLDivElement>(null)
const scroll=(direction:"left" | "right")=>{
    if(!scrollRef.current)return
    const scrollAmount=direction=="left"?-300:300
    scrollRef.current.scrollBy({left:scrollAmount,behavior:"smooth"})
}

const checkScroll=()=>{
if(!scrollRef.current)return
const {scrollLeft,scrollWidth,clientWidth}=scrollRef.current
setShowLeft(scrollLeft>0)
setShowRight((scrollLeft+clientWidth)<=scrollWidth-5)
}




useEffect(()=>{
    const autoScroll=setInterval(()=>{
        if(!scrollRef.current)return
        const {scrollLeft,scrollWidth,clientWidth}=scrollRef.current
        if(scrollLeft+clientWidth>=scrollWidth-5){
            scrollRef.current.scrollTo({left:0,behavior:"smooth"})
        }else{
            scrollRef.current.scrollBy({left:300,behavior:"smooth"})
        }
    },2000)
    return ()=>clearInterval(autoScroll)
},[])


useEffect(()=>{
    scrollRef.current?.addEventListener("scroll",checkScroll)
    return ()=>removeEventListener("scroll",checkScroll)
},[])

  return (
    <motion.div
    className='w-[90%] md:w-[80%] mx-auto mt-10 relative'
    initial={{opacity:0,y:50}}
    whileInView={{opacity:1,y:0}}
    transition={{duration:0.6}}
    viewport={{once:false,amount:0.5}}
    >
     <h2 className='text-2xl md:text-3xl font-bold text-purple-700 mb-6 text-center'>🛒 Shop By Category</h2> 
     {showLeft && <button className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center transition-all' onClick={()=>scroll("left")}><ChevronLeft className='w-6 h-6 text-purple-700'/></button>}
     
     <div className='flex gap-6 overflow-x-auto px-10 pb-4 scrollbar-hide scroll-smooth' ref={scrollRef}>

{categories.map((cat)=>{
const Icon=cat.icon
 return <Link
 key={cat.id}
 href={`/?category=${encodeURIComponent(cat.name)}`}
 aria-label={`Shop ${cat.name}`}
 className={`min-w-37.5 md:min-w-45  flex flex-col items-center justify-center rounded-2xl  ${cat.color} shadow:md hover:shadow-xl transition-all cursor-pointer`}
 >
<div className='flex flex-col items-center justify-center p-5'>
<Icon className='w-10 h-10 text-purple-700 mb-3'/>
<p className='text-center text-sm md:text-base font-semibold text-gray-700'>{cat.name}</p>
</div>
 </Link>
}
)}
     </div>
     {showRight && <button className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center transition-all' onClick={()=>scroll("right")}><ChevronRight className='w-6 h-6 text-purple-700'/></button>}
     
    </motion.div>
  )
}

export default CategorySlider
