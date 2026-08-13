'use client'
import React from 'react'
import {motion} from "motion/react"
import Link from 'next/link'
import { Mail, MapPin, Phone, } from 'lucide-react'
import { FaFacebookF, FaTwitter } from 'react-icons/fa'
import { FaInstagram } from 'react-icons/fa6'
function Footer() {
  return (
    <motion.div
    initial={{opacity:0,y:40}}
    whileInView={{opacity:1,y:0}}
    viewport={{once:true,amount:0.3}}
    transition={{duration:0.6,ease:"easeOut"}}
    className='bg-linear-to-r from-purple-600 to-purple-700 text-white mt-20'
    >
      <div className='w-[90%] md:w-[80%] mx-auto py-10 grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-purple-500/40'>
<div>
    <h2 className='text-2xl font-bold mb-3'>SnapBasket</h2>
    <p className='text-sm text-purple-100 leading-relaxed'>Fresh Groceries and daily essentials delivered to your doorstep.
                    Shop Smarter,save more,and enjoy hassle-free delivery with Snapbasket
    </p>
</div>

<div>
    <h2 className='text-xl font-semibold mb-3'>Quick Links</h2>
    <ul className='space-y-2 text-purple-100 text-sm'>
        <li><Link href={"/"} className='hover:text-white transition'>Home</Link></li>
        <li><Link href={"/cart"} className='hover:text-white transition' >Cart</Link></li>
        <li><Link href={"/my-orders"} className='hover:text-white transition'>My Orders</Link></li>
    </ul>
</div>
<div>
    <h3 className='text-xl font-semibold mb-3'>Contact Us</h3>
    <ul className='space-y-2 text-purple-100 text-sm'>
        <li className='flex items-center gap-2'>
            <MapPin size={16}/>Noida,Uttar Pradesh,India
        </li>
        <li className='flex items-center gap-2'>
            <Phone size={16}/> +91 9876543210
        </li>
         <li className='flex items-center gap-2'>
            <Mail size={16}/> support@snapbasket.com
         </li>
    </ul>
<div className='flex gap-4 mt-4'>
    <Link href="https://facebook.com" target="_blank">
    <FaFacebookF className='w-5 h-5 hover:text-white transition'/>
    </Link>
    <Link href="https://instagram.com" target="_blank">
    <FaInstagram className='w-5 h-5 hover:text-white transition'/>
    </Link>
    <Link href="https://twitter.com" target="_blank">
    <FaTwitter className='w-5 h-5 hover:text-white transition'/>
    </Link>

</div>
</div>
      </div>
<div className='text-center text-sm py-4 text-purple-100 bg-purple-800/40'>
© {new Date().getFullYear()} <span className='font-semibold'>SnapBasket</span>. All Rights Reserved.

</div>

    </motion.div>
  )
}

export default Footer
