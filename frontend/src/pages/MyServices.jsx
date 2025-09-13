import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { setServices } from '@/redux/serviceSlice'
import axios from 'axios'
import { Edit, Trash2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from 'react-router-dom'

function MyServices() {
    const {services} = useSelector(store => store.services)
    const dispatch = useDispatch()
    const navigate=useNavigate()
    const formatDate = (index) => {
        const date = new Date(services[index].createdAt)
        const formattedDate = date.toLocaleDateString("en-GB");
        return formattedDate
    }

    const getOwnServices=async()=>{
        try {
            const res=await axios.get(`${import.meta.env.VITE_API_URL}/api/services/my-services`,{withCredentials:true});
            //console.log(res.data)
            if(res.data.success){
                // Dispatch the services to the Redux store
                dispatch(setServices(res.data.services));
            }else{
                alert(res.data.message)
            }
        } catch (error) {
            console.error("Error fetching own services:", error);
        }
    }
    useEffect(()=>{
        getOwnServices()
    },[])
const deleteBlog=async(id)=>{
    try {
        const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/services/delete-service/${id}`, { withCredentials: true });
        if (res.data.success) {
            // Dispatch an action to remove the deleted service from the Redux store
            const updatedServices = services.filter(item => item._id !== id);
            dispatch(setServices(updatedServices));
            navigate('/my-services')
        }
    } catch (error) {
        console.error("Error deleting service:", error);
    }
}

  return (
   <div className='pb-10 pt-20 h-screen'>
            <div className='max-w-6xl mx-auto mt-8 '>
                <Card className="w-full p-5 space-y-2 dark:bg-gray-800">

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
                            {services?.map((item, index) => (
                                // console.log(item),
                                <TableRow key={index}>
                                    <TableCell className="flex gap-4 items-center">
                                        <img src={item.thumbnails?.[0]} alt="" className='w-20 rounded-md hidden md:block' />
                                        <h1 className='hover:underline cursor-pointer' onClick={() => navigate(`/blog/${item._id}`)}>{item.title}</h1>
                                    </TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.isPublished ? "Published" : "Unpublished"}</TableCell>
                                    <TableCell className="">{formatDate(index)}</TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger><BsThreeDotsVertical/></DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[180px]">
                                                <DropdownMenuItem onClick={() => navigate(`/services/update-service/${item._id}`)}><Edit />Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => deleteBlog(item._id)}><Trash2 />Delete</DropdownMenuItem>
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