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
            <div className='max-w-4xl mx-auto md:p-10 p-6'>
                <Breadcrumb className='mb-6'>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to="/">Home</Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <Link to="/services">Services</Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{selectedService?.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {/* Featured Image */}
                <div className="relative h-60 overflow-hidden">
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
                                className="w-full h-full object-cover rounded-2xl"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                                }}
                            />
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-gray-200 bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50"
                        disabled={!hasImages || imageUrls.length <= 1}
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gray-200 bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50"
                        disabled={!hasImages || imageUrls.length <= 1}
                        aria-label="Next image"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-50 text-white px-1 py-1 rounded-full text-sm">
                        {hasImages ? `${currentIndex + 1} / ${imageUrls.length}` : '0 / 0'}
                    </div>
                </div>
                <div className='mt-5 min-h-40 text-center p-4  border-gray-50 border-2 rounded-2xl mb-4'>
                    {/* Service Header */}
                    <div className="flex text-left justify-between">
                        <h1 className="text-xl leading-6 md:font-bold font-semibold tracking-tight mb-4 capitalize truncate" title={selectedService?.title}>{selectedService?.title}</h1>
                        <div className="text-sm text-muted-foreground">{timeElapsed ? `Published ${timeElapsed}` : ''}</div>
                    </div>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-2xl font-bold'>₹{selectedService?.price}</h2>
                        <p className='text-lg text-muted-foreground flex items-center gap-1 capitalize truncate' title={selectedService?.location || "Unknown"}>
                            <span><IoLocationOutline /></span>
                            <span className="truncate max-w-[14rem] md:max-w-[20rem]">{selectedService?.location || "Unknown"}</span>
                        </p>
                        <Badge className='bg-black-300 text-black text-xl'>{selectedService?.category}</Badge>

                    </div>

                </div>
                <div className='border-x-2 border-b-2 rounded min-h-50'>
                    <h2 className="text-2xl text-center font-bold text-gray-400 mb-4 tracking-wide">Service Details</h2>
                    <p className='pl-4 pb-8 font-semibold tracking-wide' dangerouslySetInnerHTML={{ __html: selectedService?.description }} />

                </div>



            </div>
            <div className='flex justify-center mb-1 items-center p-4 fixed bottom-0 left-0 w-full bg-white  border-t-2 border-gray-200 gap-4 md:gap-10 z-50'>  
                <Button disabled={!selectedService?.phoneNumber}>
                    <span><PhoneOutgoing/></span>
                    <Link to={`tel:${selectedService?.phoneNumber || ''}`}>Call now</Link>
                </Button>
                <Button disabled={!selectedService?._id}>
                    <span><MessageCircle/></span>
                    <Link to={selectedService?._id ? `/message/${selectedService._id}` : '#'}> Chat with us</Link>
                </Button>
            </div>
        </div>
    )
}

export default ViewService