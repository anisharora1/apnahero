import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Badge } from '@/components/ui/badge'
import { IoLocationOutline } from 'react-icons/io5'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PhoneOutgoing } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import axios from 'axios'
import { setSelectedService } from '@/redux/serviceSlice'



function ViewService() {
    const dispatch = useDispatch()
    const { services, selectedService } = useSelector(store => store.services)
    const params = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const serviceId = params?.id

    // Derive a safe createdAt string
    const timeElapsed = useMemo(() => {
        if (!selectedService?.createdAt) return ''
        const createdAt = new moment(selectedService.createdAt)
        return createdAt.fromNow()
    }, [selectedService?.createdAt])

    // Ensure selectedService is populated on hard refresh
    useEffect(() => {
        let isActive = true
        const ensureServiceLoaded = async () => {
            try {
                if (selectedService && selectedService._id === serviceId) return
                // Try from Redux services list first
                const fromList = services?.find?.(s => s?._id === serviceId)
                if (fromList) {
                    dispatch(setSelectedService(fromList))
                    return
                }
                // Fallback: fetch all published and pick the one
                setLoading(true)
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/all-published-services`, { withCredentials: true })
                const found = res?.data?.services?.find?.(s => s?._id === serviceId)
                if (isActive) {
                    if (found) {
                        dispatch(setSelectedService(found))
                    } else {
                        // Not found; navigate back to listing
                        navigate('/services')
                    }
                }
            } catch (err) {
                // On error, navigate to listing to avoid error boundary
                navigate('/services')
            } finally {
                if (isActive) setLoading(false)
            }
        }
        if (serviceId) {
            ensureServiceLoaded()
        }
        return () => { isActive = false }
    }, [serviceId, services, selectedService, dispatch, navigate])

    const imageUrls = selectedService?.thumbnails || []
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasImages = imageUrls.length > 0
    const goToPrevious = () => {
        if (!hasImages) return
        setCurrentIndex(currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        if (!hasImages) return
        setCurrentIndex(currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1);
    };

    if (loading) {
        return (
            <div className='pt-14'>
                <div className='max-w-4xl mx-auto md:p-10 p-6'>Loading...</div>
            </div>
        )
    }

    if (!selectedService) {
        return (
            <div className='pt-14'>
                <div className='max-w-4xl mx-auto md:p-10 p-6'>
                    <Button onClick={() => navigate('/services')}>Back to Services</Button>
                </div>
            </div>
        )
    }

    return (
        <div className='pt-14'>
            <div className='max-w-4xl mx-auto md:px-10 px-4 py-6 pb-28'>
                <Breadcrumb className='mb-5'>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <Link to="/services" className="hover:text-gray-900 transition-colors">Services</Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="max-w-[200px] truncate">{selectedService?.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Image Carousel */}
                <div className="relative h-72 md:h-96 overflow-hidden rounded-2xl shadow-md bg-gray-100">
                    {hasImages && imageUrls.map((url, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentIndex
                                ? 'translate-x-0'
                                : index < currentIndex
                                    ? '-translate-x-full'
                                    : 'translate-x-full'
                                }`}
                        >
                            <img
                                src={url}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                                }}
                            />
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110 disabled:opacity-30"
                        disabled={!hasImages || imageUrls.length <= 1}
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110 disabled:opacity-30"
                        disabled={!hasImages || imageUrls.length <= 1}
                        aria-label="Next image"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Dot Indicators */}
                    {hasImages && imageUrls.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {imageUrls.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Counter Badge */}
                    <div className="absolute top-3 right-3 bg-black/50 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                        {hasImages ? `${currentIndex + 1} / ${imageUrls.length}` : '—'}
                    </div>
                </div>

                {/* Info Card */}
                <div className='mt-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm'>
                    {/* Title + Time */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <h1 className="text-2xl font-bold tracking-tight capitalize leading-tight" title={selectedService?.title}>
                            {selectedService?.title}
                        </h1>
                        <span className="text-xs text-gray-400 whitespace-nowrap mt-1 shrink-0">
                            {timeElapsed ? `Published ${timeElapsed}` : ''}
                        </span>
                    </div>

                    <hr className="border-gray-100 mb-4" />

                    {/* Price · Location · Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className='text-3xl font-extrabold text-gray-900'>₹{selectedService?.price}</h2>
                        <p className='text-sm text-gray-500 flex items-center gap-1 capitalize' title={selectedService?.location || "Unknown"}>
                            <IoLocationOutline className="text-base shrink-0" />
                            <span className="truncate max-w-[14rem] md:max-w-[20rem]">{selectedService?.location || "Unknown"}</span>
                        </p>
                        <Badge className='bg-gray-900 text-white text-sm px-3 py-1 rounded-full'>{selectedService?.category}</Badge>
                    </div>
                </div>

                {/* Description Card */}
                <div className='mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Service Details</h2>
                    </div>
                    <div
                        className='px-5 py-5 text-gray-700 leading-relaxed prose prose-sm max-w-none'
                        dangerouslySetInnerHTML={{ __html: selectedService?.description }}
                    />
                </div>
            </div>

            {/* Sticky CTA Bar */}
            <div className='flex justify-center items-center px-4 py-3 fixed bottom-0 md:bottom-0 left-0 w-full bg-white/95 backdrop-blur border-t border-gray-200 gap-4 z-40'>
                <div className="flex gap-4 w-full max-w-sm">
                    <Button
                        onClick={() => {
                            if (selectedService?.phoneNumber) {
                                window.location.href = `tel:${selectedService.phoneNumber}`
                            }
                        }}
                        disabled={!selectedService?.phoneNumber}
                        className="flex-1 gap-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl h-11 transition-colors"
                    >
                        <PhoneOutgoing size={17} />
                        Call Now
                    </Button>
                    <Button
                        onClick={() => {
                            if (selectedService?._id) {
                                navigate(`/chat/${selectedService._id}`)
                            }
                        }}
                        disabled={!selectedService?._id}
                        variant="outline"
                        className="flex-1 gap-2 border-gray-800 text-gray-800 hover:bg-gray-900 hover:text-white transition-colors rounded-xl h-11"
                    >
                        <MessageCircle size={17} />
                        Chat
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ViewService