import React, { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useClerk, useUser, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react'
import { FaPlus } from "react-icons/fa6";
import { Search } from 'lucide-react'
import { FaHome } from "react-icons/fa";
import { IoIosChatboxes } from "react-icons/io";
import { FaRegWindowRestore } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { MdInstallMobile } from "react-icons/md";
import axios from 'axios'

function Navbar() {
    const navigate = useNavigate()
    const { openSignIn } = useClerk()
    const { user, isLoaded, isSignedIn } = useUser()
    const [conversations, setConversations] = useState([])
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [canInstall, setCanInstall] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Only fetch conversations when user is properly authenticated
    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            fetchConversations();
        } else {
            setConversations([]); // Clear conversations when not authenticated
        }
    }, [isLoaded, isSignedIn, user]);

    // Live refresh unread badge when new messages or reads happen
    useEffect(() => {
        const refresh = () => {
            if (isLoaded && isSignedIn && user) fetchConversations();
        }
        window.addEventListener('newMessageNotification', refresh);
        window.addEventListener('messagesMarkedRead', refresh);
        return () => {
            window.removeEventListener('newMessageNotification', refresh);
            window.removeEventListener('messagesMarkedRead', refresh);
        }
    }, [isLoaded, isSignedIn, user]);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setCanInstall(true)
        }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setCanInstall(false)
        }
        setDeferredPrompt(null)
    }

    const fetchConversations = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/conversations`,
                { withCredentials: true }
            );

            if (res.data.success) {
                setConversations(res.data.conversations || []);
            }
        } catch (error) {
            setConversations([]);
        }
    };

    const handleSearch = () => {
        const query = searchTerm.trim()
        if (query.length === 0) return
        navigate(`/services?q=${encodeURIComponent(query)}`)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
            setSearchTerm('')
        }
    }

    return (
        <>
            <div className='py-2 fixed w-full border-b-gray-300 border-2 bg-white z-50'>
                <div className='max-w-7xl mx-auto flex justify-between items-center px-4 md:px-0'>
                    {/* logo section */}
                    <div className='flex gap-7 items-center'>
                        <Link to={'/'}>
                            <div className='items-center'>
                                <h1 className='font-bold text-2xl md:text-4xl'>Apna</h1>
                                <h1 className='float-right text-red-500 font-bold leading-0.5 md:leading-none'>Hero</h1>
                            </div>
                        </Link>
                        <div className='relative'>
                            <Input type="text"
                                placeholder="Search"
                                className="border border-gray-700 bg-gray-300 w-[220px] md:w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Button className='absolute right-0 top-0' onClick={handleSearch}><Search /></Button>
                        </div>

                        <SignedIn>
                            <Link to={'/chats'}>
                                <div className='relative'>
                                    <IoIosNotifications size={40} />
                                    {conversations.length > 0 && conversations.reduce((acc, conversation) => acc + conversation.unreadCount, 0) > 0 && (
                                        <div className="bg-red-800 absolute top-0 right-0 text-white text-xs rounded-full px-2 py-1">
                                            {conversations.reduce((acc, conversation) => acc + conversation.unreadCount, 0)}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </SignedIn>
                        {canInstall && (
                            <Button className="md:hidden" variant="secondary" onClick={handleInstallClick}><MdInstallMobile/></Button>
                        )}
                    </div>

                    {/* nav section */}
                    <nav className='hidden md:flex md:gap-7 gap-4 items-center'>
                        <ul className='md:flex gap-7 items-center text-xl font-semibold'>
                            <NavLink to={'/'} className="cursor-pointer"><li>Home</li></NavLink>
                            <NavLink to={'/services'} className={`cursor-pointer`}><li>Services</li></NavLink>
                            <NavLink to={'/about'} className={`cursor-pointer`}><li>About</li></NavLink>
                        </ul>
                        {canInstall && (
                            <Button variant="secondary" onClick={handleInstallClick}>Install App</Button>
                        )}

                        <SignedOut>
                            <Button onClick={() => openSignIn({
                                fallbackRedirectUrl: window.location.href,
                                forceRedirectUrl: window.location.href
                            })}>Login</Button>
                        </SignedOut>
                        <SignedIn>
                            <div className='flex gap-3 items-center'>
                                <Link to={'/my-services'}>My Services</Link>
                                <Link to={'/create-service'} className='flex items-center font-bold gap-2 border-6 rounded-2xl p-2 border-yellow-200'>
                                    <span><FaPlus /></span> Sell
                                </Link>
                                <p>|</p>
                                <h1>Hey, {user?.firstName}</h1>
                                <UserButton afterSignInUrl={window.location.href} afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                    </nav>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className='md:hidden fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 rounded-full bottom-2 left-1/2 bg-gray-700 border-gray-600'>
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
        </>
    )
}

export default Navbar