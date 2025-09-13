import Category from '@/components/Category'
import ServiceCard from '@/components/ServiceCard'
import { setServices } from '@/redux/serviceSlice'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

function Home() {
    const dispatch=useDispatch()
    const {services} = useSelector(store=>store.services)
    useEffect(()=>{
        const getAllServices= async()=>{
            try {
                const res= await axios.get(`${import.meta.env.VITE_API_URL}/api/services/all-published-services`,{withCredentials:true})
                if(res.data.success){
                    dispatch(setServices(res.data.services))

                }
                
            } catch (error) {
                console.log(error)
            }
        }
        getAllServices()

    },[])
    useEffect(()=>{
      window.scrollTo(0,0)
    },[])
  return (
    <div className='pt-15'>
        <Category/>
         <div className='max-w-6xl mx-auto grid gap-10 grid-cols-2 md:grid-cols-4 py-10 px-4 md:px-0'>
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