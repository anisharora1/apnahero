import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { useClerk, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { FaPlus } from "react-icons/fa6"
import { FaHome, FaRegWindowRestore } from "react-icons/fa"
import { IoIosChatboxes } from "react-icons/io"

function MobileBottomNav() {
    const { openSignIn } = useClerk()
    const location = useLocation()

    // Check if we are on MessageRoom (/chat/:id) or ViewService (/services/:id)
    const isHiddenRoute =
        /^\/chat\/[a-zA-Z0-9_-]+/.test(location.pathname) ||
        /^\/services\/[a-zA-Z0-9_-]+/.test(location.pathname)

    if (isHiddenRoute) {
        return null
    }

    return (
        <div className='md:hidden fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 rounded-full bottom-0 left-1/2 bg-gray-700 border-gray-600'>
            <div className='grid h-full max-w-lg grid-cols-5 mx-auto'>
                <button type='button' className='inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-800 group'>
                    <Link to={'/'}> <FaHome size={30} color='white' /></Link>
                    <p className='text-sm text-white'>Home</p>
                </button>
                <button type='button' className='inline-flex flex-col items-center justify-center px-5 rounded-full hover:bg-gray-800 group'>
                    <Link to={'/chats'}> <IoIosChatboxes size={35} color='white' /></Link>
                    <p className='text-sm text-white'>Chats</p>
                </button>
                <div className='flex items-center justify-center'>
                    <button type='button' className='inline-flex items-center justify-center w-20 h-15 bg-white rounded-full border-amber-300 border-4 group focus:ring-4 focus:outline-none focus:ring-blue-800 font-bold'>
                        <Link to={'/create-service'} className='flex'><span><FaPlus size={30} /></span>SELL</Link>
                    </button>
                </div>
                <button type='button' className='inline-flex flex-col items-center justify-center px-5 rounded-full hover:bg-gray-800 group'>
                    <Link to={'/my-services'}><FaRegWindowRestore size={25} color='white' /></Link>
                    <p className='text-sm text-white'>Ads</p>
                </button>
                <button type='button' className='inline-flex flex-col items-center justify-center px-5 rounded-full hover:bg-gray-800 group'>
                    <SignedOut>
                        <Button size="sm" onClick={() => openSignIn({
                            fallbackRedirectUrl: window.location.href,
                            afterSignInUrl: window.location.href
                        })}>Login</Button>
                    </SignedOut>
                    <SignedIn>
                        <UserButton fallbackRedirectUrl={window.location.href} signOutFallbackRedirectUrl="/" />
                    </SignedIn>
                </button>
            </div>
        </div>
    )
}

export default MobileBottomNav
