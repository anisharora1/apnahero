import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Badge } from './ui/badge'
import { IoLocationOutline } from "react-icons/io5";
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { setSelectedService } from '@/redux/serviceSlice';


function ServiceCard({ service }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const createdAt = new moment(service.createdAt)
    const timeElapsed = createdAt.fromNow()

    const imageUrls = service.thumbnails;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);

    useEffect(() => {
        if (!isAutoplay) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [currentIndex, isAutoplay, imageUrls.length]);
    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1);
    };
    const viewMore = () => {
         //console.log('Dispatching setSelectedService action:', service);
        dispatch(setSelectedService(service))
        navigate(`/services/${service._id}`);
    }

    return (
        <div onClick={viewMore} className="bg-white dark:bg-gray-800 dark:border-gray-600 p-2 rounded-2xl shadow-lg border hover:scale-105 transition-all">
            {/* Image Container */}
            <div className="relative h-40 overflow-hidden">
                {imageUrls.map((url, index) => (
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
                    className="absolute left-1 top-1/2 transform -translate-y-1/2  bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 hover:scale-110"
                    aria-label="Previous image"
                >
                    {/* <ChevronLeft size={20} /> */}
                </button>

                <button
                    onClick={goToNext}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2  bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 hover:scale-110"
                    aria-label="Next image"
                >
                    {/* <ChevronRight size={20} /> */}
                </button>

                {/* Image Counter */}
                <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-50 text-white px-1 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {imageUrls.length}
                </div>
            </div>
            <h2 className="text-xl font-semibold  mt-1 capitalize">{service.title}</h2>
            <div className='flex justify-between items-center'>
                <h2 className='text-lg font-bold'>₹{service.price}</h2>
                <Badge variant='secondary' className='bg-amber-300'>{service.category}</Badge>
            </div>
            <div className='flex gap-4'>
                <h3 className='flex items-center gap-0.5 capitalize'><span><IoLocationOutline /></span>{service.location}</h3>
                <p className="text-sm  mt-2">
                    {timeElapsed}
                </p>

            </div>
        </div>
    )
}

export default ServiceCard