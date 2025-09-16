import React, { useState } from 'react'
import { Car, Home, Smartphone, Shirt, Sofa, Briefcase, Baby, BookOpen, Heart, Wrench, Gamepad2, Music, Camera, Bike, Dog, MoreHorizontal } from 'lucide-react';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Category() {
  const navigate=useNavigate()
  const categories = [   
    { id: 1, name: 'Helper', icon: Heart, color: 'bg-teal-500' },
    { id: 2, name: 'Mobiles', icon: Smartphone, color: 'bg-purple-500' }, 
    { id: 3, name: 'Teaching', icon: FaChalkboardTeacher, color: 'bg-green-500' },
    { id: 4, name: 'Books', icon: BookOpen, color: 'bg-red-500' },
    { id: 5, name: 'Bikes', icon: Bike, color: 'bg-lime-500' },
    { id: 6, name: 'Properties', icon: Home, color: 'bg-gray-500' },
    { id: 7, name: 'Booking', icon: Briefcase, color: 'bg-pink-500' },
    { id: 8, name: 'Furniture', icon: Sofa, color: 'bg-orange-500' },
    
  ];
  const [searchTerm, setSearchTerm]=useState('');
  const handleSearch=(category)=>{
    //console.log(category)
    setSearchTerm(category)
    const query = category.trim()
    if (query.length === 0) return
    navigate(`/services?q=${encodeURIComponent(query)}`)
  }


  return (

    <div className='mt-16 mb-5'>
      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap -space-y-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (

              <div key={category.id} className="p-5 flex flex-col items-center justify-center text-center">
                <div onClick={()=>handleSearch(category.name)} className={`${category.color} p-3 rounded-full mb-2 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  {category.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default Category