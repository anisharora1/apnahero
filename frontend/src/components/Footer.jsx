import React from 'react'
import { FaFacebook, FaInstagram } from 'react-icons/fa6'
import { FaTwitterSquare } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { MdOutlineMail } from "react-icons/md";
import { FaPhoneVolume } from "react-icons/fa6";

function Footer() {
  return (
    <footer className='bg-gray-900 text-gray-300 mt-auto'>
      <div className='max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10'>

        {/* Brand Info */}
        <div>
          <Link to='/' className='inline-block mb-3'>
            <h1 className='text-3xl font-bold text-white'>
              ApnaHero<span className='text-red-500 text-lg'>.in</span>
            </h1>
          </Link>
          <p className='text-base text-gray-400 leading-relaxed mb-4'>
            Your one-stop destination for all your product and professional needs.
          </p>
          <address className='not-italic space-y-2'>
            <p className='text-sm text-gray-500'>Benipatti Madhubani, Bihar IN 847102</p>
            <div className='flex flex-wrap gap-4 md:gap-6'>
              <Link to='mailto:anishsah57@gmail.com' className='text-sm flex items-center gap-2 hover:text-white transition-colors'>
                <MdOutlineMail className='text-lg shrink-0' /> Email Us
              </Link>
              <Link to='tel:+919117662441' className='text-sm flex items-center gap-2 hover:text-white transition-colors'>
                <FaPhoneVolume className='text-base shrink-0' /> Call Us
              </Link>
            </div>
          </address>
        </div>

        {/* Quick Links + Follow Us — side by side on mobile, transparent on desktop */}
        <div className='grid grid-cols-2 md:contents gap-10'>

          {/* Quick Links */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4'>Quick Links</h3>
            <ul className='space-y-2.5 text-base'>
              <li><Link to='/' className='hover:text-white transition-colors'>Home</Link></li>
              <li><Link to='/services' className='hover:text-white transition-colors'>Services</Link></li>
              <li><Link to='/about' className='hover:text-white transition-colors'>About Us</Link></li>
              <li>
                <Link to='/about#faq' className='hover:text-white transition-colors'>
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4'>Follow Us</h3>
            <div className='flex items-center gap-4 text-2xl'>
              <FaFacebook className='text-gray-500 cursor-not-allowed' />
              <Link
                to='https://www.instagram.com/apnahero.in?igsh=Nmx0ODZxczhxZ2E0'
                target='_blank'
                className='hover:text-pink-400 transition-colors'
              >
                <FaInstagram />
              </Link>
              <Link
                to='https://x.com/AnishArora45951?t=nUCChIs70FL_gfcroFCEcg&s=09'
                target='_blank'
                className='hover:text-sky-400 transition-colors'
              >
                <FaTwitterSquare />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className='border-t border-gray-800 py-5 text-center text-sm text-gray-500'>
        © {new Date().getFullYear()} <span className='text-red-400'>apnahero.in</span>. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
