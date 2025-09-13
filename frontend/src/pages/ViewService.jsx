import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import moment from 'moment'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Badge } from '@/components/ui/badge'
import { IoLocationOutline } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PhoneOutgoing } from 'lucide-react';
import { MessageCircleMore } from 'lucide-react';



function ViewService() {
    const selectedService = useSelector(store => store.services.selectedService)
    const createdAt = new moment(selectedService?.createdAt)
    const timeElapsed = createdAt.fromNow()
    const navigate = useNavigate()
    

    const imageUrls = selectedService?.thumbnails;
    const [currentIndex, setCurrentIndex] = useState(0);
    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1);
    };


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
                    {imageUrls?.map((url, index) => (
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
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-gray-200 bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 hover:scale-110"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gray-200 bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 hover:scale-110"
                        aria-label="Next image"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-50 text-white px-1 py-1 rounded-full text-sm">
                        {currentIndex + 1} / {imageUrls?.length}
                    </div>
                </div>
                <div className='mt-5 min-h-40 text-center p-4  border-gray-50 border-2 rounded-2xl mb-4'>
                    {/* Service Header */}
                    <div className="flex text-left justify-between">
                        <h1 className="text-xl leading-6 md:font-bold font-semibold tracking-tight mb-4 capitalize">{selectedService?.title}</h1>
                        <div className="text-sm text-muted-foreground">Published on {timeElapsed}</div>
                    </div>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-2xl font-bold'>₹{selectedService?.price}</h2>
                        <p className='text-lg text-muted-foreground flex items-center gap-1 capitalize'><span><IoLocationOutline /></span>{selectedService?.location || "Unknown"}</p>
                        <Badge className='bg-black-300 text-black text-xl'>{selectedService?.category}</Badge>

                    </div>

                </div>
                <div className='border-x-2 border-b-2 rounded min-h-50'>
                    <h2 className="text-2xl text-center font-bold text-gray-400 mb-4 tracking-wide">Service Details</h2>
                    <p className='pl-4 font-semibold tracking-wide' dangerouslySetInnerHTML={{ __html: selectedService?.description }} />

                </div>



            </div>
            <div className='flex justify-center mb-1 items-center p-4 fixed bottom-0 left-0 w-full bg-white  border-t-2 border-gray-200 gap-4 md:gap-10 z-50'>  
                <Button>
                    <span><PhoneOutgoing/></span>
                    <Link to={`tel:${selectedService?.phone}`}>Call now</Link>
                </Button>
                <Button>
                    <span><MessageCircleMore/></span>
                    <Link to={`/message/${selectedService._id}`}> Chat with us</Link>
                </Button>
            </div>
        </div>
    )
}

export default ViewService