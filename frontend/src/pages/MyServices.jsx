import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { setMyServices, setServices, markMyServicesAsStale } from '@/redux/serviceSlice'
import axios from 'axios'
import { Edit, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FaArrowLeft } from 'react-icons/fa'
import { useAuth } from '@clerk/clerk-react'
import { useMyServicesRefresh } from '@/hooks/useMyServicesRefresh'

function MyServices() {
    const {myServices, services} = useSelector(store => store.services)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState({})
    const { markAsStale } = useMyServicesRefresh()
    const formatDate = (index) => {
        const date = new Date(myServices[index].createdAt)
        const formattedDate = date.toLocaleDateString("en-GB");
        return formattedDate
    }
const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
        return;
    }
    
    try {
        setLoading(prev => ({ ...prev, [id]: true }))
        const token = await getToken()
        const res = await axios.delete(
            `${import.meta.env.VITE_API_URL}/api/services/delete-service/${id}`, 
            {
                withCredentials: true,
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined
                }
            }
        );
        
        if (res.data.success) {
            // Dispatch an action to remove the deleted service from the Redux store
            const updatedServices = myServices.filter(item => item._id !== id);
            dispatch(setMyServices(updatedServices));
            markAsStale(); // Mark data as stale to trigger refresh
            alert("Service deleted successfully");
        } else {
            alert(res.data.message || "Failed to delete service");
        }
    } catch (error) {
        alert("Failed to delete service. Please try again.");
    } finally {
        setLoading(prev => ({ ...prev, [id]: false }))
    }
}
const togglePublishUnpublish = async (serviceId, currentStatus) => {
    if (!serviceId) return

    const newPublishStatus = !currentStatus

    try {
        setLoading(prev => ({ ...prev, [`publish-${serviceId}`]: true }))
        const token = await getToken()
        const res = await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/services/toggle-publish/${serviceId}`,
            { isPublished: newPublishStatus },
            {
                withCredentials: true,
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined
                }
            }
        )

        if (res.data.success) {
            const updatedService = res.data.service
            
            // Update myServices array with the updated service
            const updatedMyServices = myServices.map(item =>
                item._id === serviceId ? updatedService : item
            )
            dispatch(setMyServices(updatedMyServices))
            
            // Update all services array based on publish status
            if (updatedService.isPublished) {
                // If service is published, add or update it in all services
                const existingIndex = services.findIndex(item => item._id === serviceId)
                if (existingIndex >= 0) {
                    const updatedAllServices = services.map(item =>
                        item._id === serviceId ? updatedService : item
                    )
                    dispatch(setServices(updatedAllServices))
                } else {
                    // Add new published service to all services
                    dispatch(setServices([...services, updatedService]))
                }
            } else {
                // If service is unpublished, remove it from all services
                const updatedAllServices = services.filter(item => item._id !== serviceId)
                dispatch(setServices(updatedAllServices))
            }
            
            markAsStale(); // Mark data as stale to trigger refresh
            alert(`Service ${newPublishStatus ? "published" : "unpublished"} successfully`)
        } else {
            alert(res.data.message || "Failed to update publish status")
        }
    } catch (error) {
        console.error("Error updating publish status:", error)
        alert("Failed to update publish status. Please try again.")
    } finally {
        setLoading(prev => ({ ...prev, [`publish-${serviceId}`]: false }))
    }
}

  return (
    <div className='min-h-screen bg-gray-50 pt-20 pb-12'>
      <div className='max-w-5xl mx-auto px-4 md:px-8'>

        {/* Page Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/')}
              className='p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600'
              aria-label='Go back'
            >
              <FaArrowLeft size={16} />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>My Services</h1>
              <p className='text-sm text-gray-400'>Manage and track your posted services</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/create-service')}
            className='bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-5 h-10 text-sm font-medium shadow-sm transition-colors'
          >
            + Post a Service
          </Button>
        </div>

        {/* Empty State */}
        {(!myServices || myServices.length === 0) ? (
          <div className='flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl shadow-sm py-20 px-8 text-center'>
            <div className='w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5 text-4xl'>
              📋
            </div>
            <h2 className='text-xl font-semibold text-gray-800 mb-2'>No services yet</h2>
            <p className='text-sm text-gray-400 max-w-xs mb-6'>
              You haven't posted any services yet. Start by creating your first listing and reach thousands of people.
            </p>
            <Button
              onClick={() => navigate('/create-service')}
              className='bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-6 h-10 text-sm font-medium transition-colors'
            >
              Post Your First Service
            </Button>
          </div>
        ) : (
          <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-50 border-b border-gray-100'>
                  <TableHead className='font-semibold text-gray-600 py-4 pl-5'>Service</TableHead>
                  <TableHead className='font-semibold text-gray-600'>Category</TableHead>
                  <TableHead className='font-semibold text-gray-600'>Status</TableHead>
                  <TableHead className='font-semibold text-gray-600'>Date</TableHead>
                  <TableHead className='font-semibold text-gray-600 text-center pr-5'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myServices.map((item, index) => (
                  <TableRow key={index} className='border-b border-gray-50 hover:bg-gray-50 transition-colors'>

                    {/* Title + thumbnail */}
                    <TableCell className='py-4 pl-5'>
                      <div className='flex items-center gap-3'>
                        {item.thumbnails?.[0] ? (
                          <img
                            src={item.thumbnails[0]}
                            alt={item.title}
                            className='w-12 h-12 rounded-lg object-cover shrink-0 hidden md:block'
                          />
                        ) : (
                          <div className='w-12 h-12 rounded-lg bg-gray-100 hidden md:flex items-center justify-center text-gray-400 text-lg shrink-0'>
                            🖼️
                          </div>
                        )}
                        <span
                          className='font-medium text-gray-800 hover:text-blue-600 cursor-pointer transition-colors line-clamp-1 max-w-[180px] md:max-w-[260px]'
                          onClick={() => navigate(`/service/${item._id}`)}
                          title={item.title}
                        >
                          {item.title}
                        </span>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className='text-sm text-gray-600 capitalize'>{item.category}</span>
                    </TableCell>

                    {/* Publish status */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={loading[`publish-${item._id}`]}
                          className='focus:outline-none'
                        >
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            loading[`publish-${item._id}`]
                              ? 'bg-gray-100 text-gray-400'
                              : item.isPublished
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {loading[`publish-${item._id}`] ? 'Updating...' : (item.isPublished ? 'Published' : 'Draft')}
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-[160px]'>
                          <DropdownMenuItem
                            onClick={() => togglePublishUnpublish(item._id, item.isPublished)}
                            disabled={loading[`publish-${item._id}`]}
                          >
                            {item.isPublished ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Date */}
                    <TableCell className='text-sm text-gray-500 whitespace-nowrap'>
                      {formatDate(index)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className='text-center pr-5'>
                      <DropdownMenu>
                        <DropdownMenuTrigger disabled={loading[item._id]} className='focus:outline-none'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors cursor-pointer'>
                            <BsThreeDotsVertical className='text-gray-500' />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-[160px]'>
                          <DropdownMenuItem
                            onClick={() => navigate(`/services/update-service/${item._id}`)}
                            disabled={loading[item._id]}
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-500 focus:text-red-500'
                            onClick={() => deleteService(item._id)}
                            disabled={loading[item._id]}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            {loading[item._id] ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyServices