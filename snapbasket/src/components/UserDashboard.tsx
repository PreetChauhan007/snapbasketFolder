import React from 'react'
import HeroSection from './HeroSection'
import { IGrocery } from '@/models/grocery.model'
import GroceryCatalog from './GroceryCatalog'

async function UserDashboard({groceryList,allGroceryList}:{groceryList:IGrocery[],allGroceryList:IGrocery[]}) {
const plainGrocery=JSON.parse(JSON.stringify(groceryList))
const plainAllGrocery=JSON.parse(JSON.stringify(allGroceryList))
  return (
    <>
      <HeroSection/>
      <GroceryCatalog groceryList={plainGrocery} allGroceryList={plainAllGrocery}/>
    </>
  )
}

export default UserDashboard
