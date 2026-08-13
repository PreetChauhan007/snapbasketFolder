'use client'

import { useMemo, useState } from 'react'
import { IGrocery } from '@/models/grocery.model'
import CategorySlider from './CategorySlider'
import GroceryItemCard from './GroceryItemCard'

function GroceryCatalog({groceryList}:{groceryList:IGrocery[]}) {
  const [selectedCategory,setSelectedCategory]=useState<string | null>(null)

  const filteredGroceries=useMemo(
    ()=>selectedCategory
      ? groceryList.filter((item)=>item.category===selectedCategory)
      : groceryList,
    [groceryList,selectedCategory]
  )

  const handleCategorySelect=(category:string)=>{
    setSelectedCategory((current)=>current===category ? null : category)
    document.getElementById('grocery-items')?.scrollIntoView({behavior:'smooth',block:'start'})
  }

  return <>
    <CategorySlider selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect}/>
    <div id='grocery-items' className='w-[90%] md:w-[80%] mx-auto mt-10 scroll-mt-6'>
      <h2 className='text-2xl md:text-3xl font-bold text-purple-700 mb-6 text-center'>
        {selectedCategory ? `${selectedCategory} Items` : 'Grocery Items'}
      </h2>
      {selectedCategory && <button type='button' onClick={()=>setSelectedCategory(null)} className='mb-5 text-sm font-semibold text-purple-700 hover:text-purple-900'>Show all items</button>}
      {filteredGroceries.length ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
          {filteredGroceries.map((item)=><GroceryItemCard key={item._id?.toString()} item={item as any}/>) }
        </div>
      ) : (
        <div className='rounded-2xl border border-purple-100 bg-purple-50 px-6 py-10 text-center'>
          <p className='text-xl font-bold text-purple-700'>Items Not Available</p>
          <p className='mt-2 text-gray-600'>
            {selectedCategory
              ? `${selectedCategory} category mein abhi koi item available nahi hai.`
              : 'Abhi koi grocery item available nahi hai.'}
          </p>
        </div>
      )}
    </div>
  </>
}

export default GroceryCatalog
