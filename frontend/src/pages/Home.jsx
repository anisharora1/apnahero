import Category from '@/components/Category'
import ServiceCard from '@/components/ServiceCard'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearSearchResults } from '@/redux/serviceSlice'

function Home() {
  const { services } = useSelector(store => store.services)
  const { fetchServices } = useDataRefresh()
  const dispatch = useDispatch()
  
  useEffect(() => {
    window.scrollTo(0, 0)
    // Clear search results when returning to home page
    dispatch(clearSearchResults())
  }, [dispatch])
  return (
    <div className='pt-8'>
      <Category />
      <div className='max-w-6xl mx-auto grid gap-5 grid-cols-2 md:grid-cols-4 pb-10 px-4 md:px-0'>
        {
          services?.map((service, index) => {
            return <ServiceCard service={service} key={index} />
          })
        }
      </div>
    </div>
  )
}

export default Home