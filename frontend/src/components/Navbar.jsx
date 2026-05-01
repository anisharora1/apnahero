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

        </>
    )
}

export default Navbar