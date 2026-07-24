'use client'
import React from 'react'
import {motion} from "motion/react"
import { ArrowRight, Check, CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'
function page() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 text-center bg-linear-to-b from-purple-50 to-white overflow-hidden'>
        <motion.div
         initial={{scale:0,rotate:-180}}
animate={{scale:1,rotate:0}}
transition={{type:"spring",
    damping:10,
    stiffness:100
}}
    className='relative'
    >
            <CheckCircle className='text-purple-600 w-24 h-24 md:w-28 md:h-28'/>
            <motion.div
            className='absolute inset-0'
            initial={{opacity:0,scale:0.6}}
            animate={{opacity:[0.3,0,0.3],scale:[1,0.6,1]}}
            transition={{
                repeat:Infinity,
                duration:2,
                ease:"easeInOut"
            }}
            >
                <div className='w-full h-full rounded-full bg-purple-700 blur-2xl'/>
        </motion.div>
        </motion.div>
      <motion.h1
      initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.4,delay:0.3}}
className='text-3xl md:text-4xl font-bold text-purple-700 mt-6'
>
Order Placed Successfully
        </motion.h1>
        <motion.p
        initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.4,delay:0.6}}
className='text-gray-600 mt-3 text-sm md:text-base max-w-md mx-auto text-center'
        >
                               Thank you for shopping with us! We're now preparing your order.
             You can track its status anytime from<span className='font-semibold text-purple-700'> My Orders </span>section.
        </motion.p>
        <motion.div
        initial={{opacity:0,y:40}}
            animate={{opacity:1,y:[0,-10,0]}}
            transition={{
                delay:1,
                repeat:Infinity,
                duration:2,
                ease:"easeInOut"
            }}
            className='mt-10'
        >
            <Package className='w-16 h-16 md:w-20 md:h-20 text-purple-500 '/>
        </motion.div>
        <motion.div
        initial={{opacity:0,scale:0.9}}
        animate={{opacity:1,scale:1}}
        transition={{delay:1.2,duration:0.4}}
        className='mt-12'
        >
            <Link href={"/user/my-orders"}>
            <motion.div
            whileHover={{scale:1.04}}
            whileTap={{scale:0.93}}
            className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold px-8 py-3 rounded-full shadow-lg transition-all'
            >
                Go to My Orders <ArrowRight/>
            </motion.div>
            </Link>
        </motion.div>

        <motion.div
        initial={{opacity:0}}
        animate={{opacity:[0.2,0.6,0.2]}}
        transition={{
            duration:3,
            repeat:Infinity,
            ease:"easeInOut"
        }}
        className='absolute top-0 left-0 w-full h-full pointer-events-none'
        >
            <div className='absolute top-20 left-[10%] w-2 h-2 bg-purple-400 rounded-full animate-bounce'/>
            <div className='absolute top-32 left-[30%] w-2 h-2 bg-purple-400 rounded-full animate-pulse'/>
            <div className='absolute top-24 left-[50%] w-2 h-2 bg-purple-400 rounded-full animate-bounce'/>
            <div className='absolute top-16 left-[70%] w-2 h-2 bg-purple-400 rounded-full animate-pulse'/>
           
        </motion.div>
    </div>
    
  )
}

export default page
