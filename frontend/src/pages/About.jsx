import FAQSection from '@/components/F&Q.jsx'
import React, { useEffect } from 'react'

function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className=" min-h-screen pt-28 px-4 md:px-0 mb-7 ">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center">
          <div className='max-w-6xl mx-auto text-center flex flex-col space-y-4 items-center'>
            <h1 className='text-4xl font-bold text-center pt-10 '>About us</h1>
            <hr className=' w-15 text-center border-2 border-red-500 rounded-full' />
          </div>
          <h1 className="font-bold text-xl md:text-3xl mt-20">
            <q>From Products to Professionals - All in One Place</q>
          </h1>
        </div>

        {/* Text Section */}
        <div className="mt-8 p-4 bg-gray-100 items-center rounded-2xl">
          <div>
            <p className=" text-lg mb-4">
              Welcome to the future of local commerce and services. Our revolutionary platform bridges the gap between traditional marketplace buying and selling with professional service hiring, creating a comprehensive ecosystem where your everyday needs meet reliable solutions.
            </p>
            <h1 className="font-bold text-xl text-center mb-2  md:text-3xl mt-6">
              <q>Our Vision</q>
            </h1>
            <p className=" text-lg mb-4">
              We envision a world where finding quality products and skilled professionals is as simple as a few taps on your phone. Whether you're looking to buy a second-hand bicycle, sell your old furniture, or hire a reliable plumber for urgent repairs, our platform connects you with the right people at the right time.
            </p>
            <p className=" text-lg">
              Thank you for being a part of our growing community.
            </p>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-16 text-center">
          <blockquote className="text-2xl italic text-gray-500">
            "Words are powerful. Use them to inspire."
          </blockquote>
        </div>
      </div>
      <FAQSection />
    </div>
  )
}

export default About