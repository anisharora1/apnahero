import ServiceCard from '@/components/ServiceCard'
import { setSearchResults } from '@/redux/serviceSlice'
import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useSearchRefresh } from '@/hooks/useSearchRefresh'

function Services() {
  const [loading, setLoading] = useState(false)
  const {searchResults} = useSelector(store => store.services)
  const location = useLocation()

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const loc = searchParams.get('location') || ''

  const searchParamsObj = useMemo(() => ({
    q,
    category,
    location: loc
  }), [q, category, loc])

  const { fetchSearchResults } = useSearchRefresh(searchParamsObj)
  return (
     <div className='pt-16'>
      <div className='max-w-6xl mx-auto text-center flex flex-col space-y-4 items-center'>
        <h1 className='text-4xl font-bold text-center pt-10 '>Our Services</h1>
        <hr className=' w-24 text-center border-2 border-red-500 rounded-full' />

      </div>
      <div className='max-w-6xl mx-auto grid gap-10 grid-cols-2 md:grid-cols-4 py-10 px-4 md:px-0'>
        {
          searchResults?.map((service, index) => {
            return <ServiceCard service={service} key={index} />
          })
        }
      </div>
    </div>
  )
}

export default Services