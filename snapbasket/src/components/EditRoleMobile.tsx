'use client'
import React, { useEffect, useState } from 'react'
import {motion} from "motion/react"
import { ArrowRight, Bike, User, UserCog } from 'lucide-react'
import axios from 'axios'
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'
function EditRoleMobile() {
    const [roles,setRoles]=useState([
        {id:"user",label:"User",icon:User},
        {id:"deliveryBoy",label:"Delivery Boy",icon:Bike}
    ])
    const [isAdminCheckComplete,setIsAdminCheckComplete]=useState(false)
    const [selectedRole,setSelectedRole]=useState("")
    const [mobile,setMobile]=useState("")
    const {update}=useSession()
    const router=useRouter()
const handleEdit=async()=>{
    try {
        const result=await axios.post("/api/user/edit-role-mobile",{
            role:selectedRole,
            mobile
        })
       await update({role:selectedRole})
       router.replace("/")
    } catch (error) {
        console.log(error)
    }
}

useEffect(()=>{
const checkForAdmin=async()=>{
    try {
       const result=await axios.get("/api/check-for-admin") 
       if(!result.data.adminExist){
        setRoles(prev=>[
          {id:"admin",label:"Admin",icon:UserCog},
          ...prev
        ])
       }
    } catch (error) {
        console.log(error)
    } finally {
        setIsAdminCheckComplete(true)
    }
}
checkForAdmin()
},[])
  return (
    <div  className='flex flex-col min-h-screen items-center p-6 w-full'>
      <motion.h1
      initial={{
opacity:0,
y:-10
      }}
      animate={{
opacity:1,
y:0
      }}
      transition={{
duration:0.6
      }}
      className='text-3xl md:text-4xl font-extrabold text-purple-700 text-center mt-8'
      >Select Your Role</motion.h1>
<div className='flex flex-col md:flex-row justify-center items-center gap-6 mt-10'>
{
    isAdminCheckComplete && roles.map((role)=>{
        const Icon=role.icon
        const isSelected=selectedRole==role.id
        return (
            <motion.div
            key={role.id}
            whileTap={{scale:0.95}}
            onClick={()=>setSelectedRole(role.id)}
            className={`flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 transition-all ${
                isSelected
                ?"border-purple-600 bg-purple-100 shadow-lg"
                :"border-gray-300 bg-white hover:border-purple-400"
            }`}

            >
<Icon/>
<span>{role.label}</span>
            </motion.div>
        )
    })
}
</div>
<motion.div
 initial={{
opacity:0,
      }}
      animate={{
opacity:1,
      }}
      transition={{
        delay:0.5,
duration:0.6
      }}
      className='flex flex-col items-center mt-10'
>
    <label htmlFor="mobile" className='text-gray-700 font-medium mb-2'>Enter Your Mobile No.</label>
<input
 type="tel" 
 id='mobile' 
 className='w-64 md:w-80 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-800' placeholder="e.g. 9876543210"
  maxLength={10} 
  onChange={(e)=>setMobile(e.target.value)}
  />
</motion.div>
<motion.button 
initial={{
opacity:0,
y:20
      }}
      animate={{
opacity:1,
y:0
      }}
      transition={{
        delay:0.7,
      }}
      disabled={mobile.length!==10 || !selectedRole}
      className={`inline-flex items-cnter gap-2 font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200 w-{200px} mt-15 ${
        selectedRole && mobile.length===10
        ?"bg-purple-600 hover:bg-purple-700 text-white"
        :"bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
      onClick={handleEdit}
>
Go To Home
<ArrowRight/>
</motion.button>
    </div>
  )
}

export default EditRoleMobile
