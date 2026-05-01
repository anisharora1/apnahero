import FAQSection from '@/components/F&Q.jsx'
import React, { useEffect } from 'react'

function About() {
  useEffect(() => {
    if (window.location.hash === '#faq') {
      // Wait for page to render then scroll FAQ to center
      setTimeout(() => {
        const el = document.getElementById('faq')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">

        {/* Hero Card */}
        <div className="bg-gray-800 rounded-3xl px-8 md:px-16 py-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">About Us</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5">
            From Products to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">
              Professionals
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            All in one place — a comprehensive ecosystem where your everyday needs meet reliable, local solutions.
          </p>
        </div>

        {/* Who We Are Card */}
        <div className="bg-gray-800 rounded-3xl p-8 md:p-12">
          <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Who We Are</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-3 mb-5">
            The future of local commerce
          </h2>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            Welcome to the future of local commerce and services. Our revolutionary platform bridges the gap between traditional marketplace buying and selling with professional service hiring, creating a comprehensive ecosystem where your everyday needs meet reliable solutions.
          </p>
        </div>

        {/* Our Vision Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm">
          <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Our Vision</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-5">
            Quality at your fingertips
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
            We envision a world where finding quality products and skilled professionals is as simple as a few taps on your phone. Whether you're looking to buy a second-hand bicycle, sell your old furniture, or hire a reliable plumber for urgent repairs — our platform connects you with the right people at the right time.
          </p>
          <p className="text-gray-500 text-base leading-relaxed">
            Thank you for being a part of our growing community. ✨
          </p>
        </div>

        {/* Quote Card */}
        <div className="rounded-3xl border border-gray-200 bg-white px-8 md:px-16 py-12 text-center shadow-sm">
          <blockquote className="text-2xl md:text-3xl italic font-light text-gray-500">
            "Words are powerful. Use them to inspire."
          </blockquote>
        </div>

        {/* FAQ */}
        <div id="faq">
          <FAQSection />
        </div>

      </div>
    </div>
  )
}

export default About

