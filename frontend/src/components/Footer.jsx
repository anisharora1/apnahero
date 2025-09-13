import React from 'react'
import { FaFacebook, FaInstagram} from 'react-icons/fa6'
import { FaTwitterSquare } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { MdOutlineMail } from "react-icons/md";
import { FaPhoneVolume } from "react-icons/fa6";

function Footer() {
  return (
    <footer className='bg-gray-800 text-gray-200 py-10'>
      <div className='max-w-7xl mx-auto px-4 md:flex md:justify-between'>
        {/*  info */}
        <div className='mb-6 md:mb-0'>
            <Link to='/' className='flex gap-3 items-center'>
              <h1 className=' text-3xl font-bold'>ApnaHero<span className='text-red-500 text-sm'>.in</span></h1>
            </Link>
            <p className='mt-2'>From Products to Professionals - All in One Place</p>
            <address>
              <p className='mt-2 text-sm'>Benipatti Madhubani, Bihar IN 847102</p>
              <div className='flex flex-col space-y-1 mt-2'>
                <Link to={'mailto:anishsah57@gmail.com'} className='text-sm flex items-center gap-2'> <span><MdOutlineMail /></span>Email Us</Link>
                <Link to={'tel:+919117662441'} className='text-sm flex items-center gap-2'><span><FaPhoneVolume /></span>Call Us</Link>
              </div>
            </address>
        </div>
        {/* customer service link */}
        <div className='mb-6 md:mb-0'>
            <h3 className='text-xl font-semibold'>Quick Links</h3>
            <ul className='mt-2 text-sm space-y-2'>
                <Link to={'/'}><li>Home</li></Link>
                <Link to={'/services'}><li>Services</li></Link>
                <Link to={'/about'}><li>About Us</li></Link>
                {/* <li>Contact Us</li> */}
                <li>FAQs</li>
            </ul>
        </div>
        {/* social media links */}
        <div className='mb-6 md:mb-0'>
            <h3 className='text-xl font-semibold'>Follow Us</h3>
            <div className='flex space-x-4 mt-2'>
                <FaFacebook/>
                <FaInstagram/>
                <FaTwitterSquare/>
            </div>
        </div>
      </div>
      {/* bottom section */}
      <div className='mt-8 border-t border-gray-700 pt-6 text-center text-sm'>
        <p>&copy; {new Date().getFullYear()} <span className='text-red-500'>ApnaHero.in</span>. All rights reserved</p>
      </div>
    </footer>
  )
}

export default Footer