import React from 'react'
import HeroSection from './HeroSection'
import { IGrocery } from '@/models/grocery.model'
import GroceryCatalog from './GroceryCatalog'

async function UserDashboard({groceryList}:{groceryList:IGrocery[]}) {
const plainGrocery=JSON.parse(JSON.stringify(groceryList))
  return (
    <>
      <HeroSection/>
      <GroceryCatalog groceryList={plainGrocery}/>
    </>
  )
}

export default UserDashboard
