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
   <div className='pb-10 pt-20 h-screen'>
            <div className='max-w-6xl mx-auto mt-8 '>
                <Button onClick={() => navigate('/')} className="flex items-center text-sm text-gray-100 bg-gray-900">
                        <FaArrowLeft className="mr-2" size={20} />
                    </Button>
                <Card className="w-full p-5 space-y-2">

                    <Table>
                        <TableCaption>A list of your recent services.</TableCaption>
                        <TableHeader className="overflow-x-auto" >
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Publish/Unpublish</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="overflow-x-auto ">
                            {myServices?.map((item, index) => (
                                // console.log(item),
                                <TableRow key={index}>
                                    <TableCell className="flex gap-4 items-center">
                                        <img src={item.thumbnails?.[0]} alt="" className='w-20 rounded-md hidden md:block' />
                                        <h1 className='hover:underline cursor-pointer' onClick={() => navigate(`/service/${item._id}`)}>{item.title}</h1>
                                    </TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger disabled={loading[`publish-${item._id}`]}>
                                                {loading[`publish-${item._id}`] ? "Updating..." : (item.isPublished ? "Published" : "Unpublished")}
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[180px]">
                                                <DropdownMenuItem 
                                                    onClick={() => togglePublishUnpublish(item._id, item.isPublished)}
                                                    disabled={loading[`publish-${item._id}`]}
                                                >
                                                    {item.isPublished ? "Unpublish" : "Publish"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="">{formatDate(index)}</TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger disabled={loading[item._id]}>
                                                <BsThreeDotsVertical/>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[180px]">
                                                <DropdownMenuItem 
                                                    onClick={() => navigate(`/services/update-service/${item._id}`)}
                                                    disabled={loading[item._id]}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-red-500" 
                                                    onClick={() => deleteService(item._id)}
                                                    disabled={loading[item._id]}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {loading[item._id] ? "Deleting..." : "Delete"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </Card>
            </div>
        </div>
  )
}

export default MyServices