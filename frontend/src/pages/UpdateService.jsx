import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setServices, setSelectedService } from '@/redux/serviceSlice'
import axios from 'axios'
import JoditEditor from 'jodit-react'
import React, { useRef, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'

function UpdateService() {
    const [loading, setLoading] = useState(false)
    const editor = useRef(null)
    const [thumbnail, setThumbnail] = useState([])
    const [previewThumbnails, setPreviewThumbnails] = useState([])

    const { services, selectedService } = useSelector(store => store.services)
    const params = useParams()
    const serviceId = params.id
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [content, setContent] = useState({
        title: '',
        description: '',
        price: '',
        phoneNumber: '',
        category: '',
        location: '',
        thumbnails: []
    })

    // Load selected service when component mounts or serviceId changes
    useEffect(() => {
        if (serviceId && services.length > 0) {
            const service = services.find(item => item._id === serviceId)
            if (service) {
                dispatch(setSelectedService(service))
            }
        }
    }, [serviceId, services, dispatch])

    // Initialize form data when selectedService is available
    useEffect(() => {
        if (selectedService) {
            setContent({
                title: selectedService.title || '',
                description: selectedService.description || '',
                price: selectedService.price || '',
                phoneNumber: selectedService.phoneNumber || '',
                category: selectedService.category || '',
                location: selectedService.location || '',
                thumbnails: selectedService.thumbnails || []
            })
        }
    }, [selectedService])

    const handleChange = (e) => {
        const { name, value } = e.target
        setContent((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const selectCategory = (value) => {
        setContent((prev) => ({
            ...prev,
            category: value
        }))
    }

    const selectThumbnail = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            setContent((prev) => ({ ...prev, thumbnails: fileArray }));

            const previews = [];
            let loadedCount = 0;

            fileArray.forEach((file, index) => {
                if (file.type.startsWith('image/')) { // Check if file is an image
                    const fileReader = new FileReader();
                    fileReader.onload = () => {
                        previews[index] = {
                            url: fileReader.result,
                            name: file.name,
                            size: file.size
                        };
                        loadedCount++;

                        if (loadedCount === fileArray.length) {
                            setPreviewThumbnails(previews.filter(preview => preview !== null && preview !== undefined));
                        }
                    };
                    fileReader.onerror = (error) => {
                        console.error(`Error reading file: ${file.name}`, error);
                        loadedCount++;
                    };
                    fileReader.readAsDataURL(file);
                } else {
                    console.error(`File ${file.name} is not an image`);
                }
            });
        } else {
            setPreviewThumbnails([]);
        }
    };

    const updateServiceHandler = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('title', content.title)
        formData.append('description', content.description)
        formData.append('price', content.price)
        formData.append('phoneNumber', content.phoneNumber)
        formData.append('category', content.category)
        formData.append('location', content.location)
        content.thumbnails.forEach(file => formData.append('thumbnails', file))

        try {
            setLoading(true)
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/services/update-service/${serviceId}`, formData, { withCredentials: true })

            if (res.data.success) {
                const updatedService = res.data.service
                // Update both services array and selectedService
                const updatedServices = services.map(item =>
                    item._id === serviceId ? updatedService : item
                )
                dispatch(setServices(updatedServices))
                dispatch(setSelectedService(updatedService))
                setLoading(false)
                alert("Service updated successfully")
            }
        } catch (error) {
            setLoading(false)
            alert("Failed to update service")
            console.log(error)
        }
    }

    const togglePublishUnpublish = async () => {
        if (!selectedService) return

        const newPublishStatus = !selectedService.isPublished

        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/services/toggle-publish/${serviceId}`,
                { isPublished: newPublishStatus },
                { withCredentials: true }
            )

            if (res.data.success) {
                const updatedService = { ...selectedService, isPublished: newPublishStatus }
                // Update both services array and selectedService
                const updatedServices = services.map(item =>
                    item._id === serviceId ? updatedService : item
                )
                dispatch(setServices(updatedServices))
                dispatch(setSelectedService(updatedService))
                navigate('/my-services')
                alert(`Service ${newPublishStatus ? "published" : "unpublished"} successfully`)
            }
        } catch (error) {
            console.log(error)
            alert("Failed to update publish status")
        }
    }

    const deleteService = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/services/delete-service/${serviceId}`, { withCredentials: true })
            if (res.data.success) {
                // Remove the deleted service from the Redux store
                const updatedServices = services.filter(item => item._id !== serviceId)
                dispatch(setServices(updatedServices))
                dispatch(setSelectedService(null)) // Clear selected service
                navigate('/my-services')
                alert("Service deleted successfully")
            }
        } catch (error) {
            console.error("Error deleting service:", error)
            alert("Failed to delete service")
        }
    }

    const config = {
        readonly: false,
        toolbarAdaptive: false,
        buttons: ["bold", "italic", "underline"],
    }

    // Show loading or error if service not found
    if (!selectedService && services.length > 0) {
        return (
            <div className='pb-10 px-3 pt-20'>
                <div className='max-w-6xl mx-auto mt-8'>
                    <Card className="w-full bg-white dark:bg-gray-800 p-5">
                        <p>Service not found...</p>
                        <Button onClick={() => navigate('/my-services')}>Back to My Services</Button>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className='pb-10 px-3 pt-20'>
            <div className='max-w-6xl mx-auto mt-8'>
                <Card className="w-full bg-white dark:bg-gray-800 p-5 space-y-2">
                {/* <Button onClick={() => navigate('/')} className='text-2xl cursor-pointer'><FaArrowLeft /></Button> */}
                    <h1 className='text-4xl font-bold'>Basic Service Information</h1>
                    <p className=''>Make changes to your service here. Click publish when you're done.</p>
                    <div className="space-x-2">
                        <Button onClick={togglePublishUnpublish}>
                            {selectedService.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                        <Button variant="destructive" onClick={deleteService}>
                            Remove Service
                        </Button>
                    </div>
                    <div className='pt-10'>
                        <Label>Title</Label>
                        <Input
                            type="text"
                            placeholder="Enter a title"
                            name="title"
                            value={content.title}
                            onChange={handleChange}
                            className="dark:border-gray-300"
                        />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <JoditEditor
                            ref={editor}
                            value={content.description}
                            config={config}
                            tabIndex={1}
                            onBlur={(newContent) => setContent((prev) => ({ ...prev, description: newContent }))}
                            onChange={(newContent) => { }}
                        />
                    </div>
                    <div className='pt-10 flex gap-5'>
                        <div>
                            <Label>Price:</Label>
                            <Input
                                type="number"
                                placeholder="Enter a price"
                                name="price"
                                value={content.price}
                                onChange={handleChange}
                                className="dark:border-gray-300"
                            />
                        </div>
                        <div>
                            <Label>Phone:</Label>
                            <Input
                                type="tel"
                                placeholder="Enter a phone number"
                                name="phoneNumber"
                                value={content.phoneNumber}
                                onChange={handleChange}
                                className="dark:border-gray-300"
                            />
                        </div>
                    </div>
                    <div className='pt-10 flex gap-5'>
                        <div>
                            <Label>Category</Label>
                            <Select value={content.category} onValueChange={selectCategory}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        <SelectItem value="Helper">Helper</SelectItem>
                                        <SelectItem value="Mobiles">Mobiles</SelectItem>
                                        <SelectItem value="Teaching">Teaching</SelectItem>
                                        <SelectItem value="Booking Services">Booking Services</SelectItem>
                                        <SelectItem value="Properties">Properties</SelectItem>
                                        <SelectItem value="Furniture">Furniture</SelectItem>
                                        <SelectItem value="Books">Books</SelectItem>
                                        <SelectItem value="Bikes">Bikes</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Location:</Label>
                            <Input
                                type="text"
                                placeholder="Enter a location"
                                name="location"
                                value={content.location}
                                onChange={handleChange}
                                className="dark:border-gray-300"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Thumbnail</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={selectThumbnail}
                            accept="image/*"
                            className="w-fit dark:border-gray-300"
                            multiple
                        />
                        <caption>Max 4 images, 1MB each</caption>
                        {previewThumbnails.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Selected Images ({previewThumbnails.length}):</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {previewThumbnails.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview.url}
                                                className="w-full h-32 object-cover rounded-lg border"
                                                alt={`Thumbnail ${index + 1}`}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 text-white text-xs text-center p-2">
                                                    <p className="font-medium truncate">{preview.name}</p>
                                                    <p>{(preview.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='flex gap-3'>
                        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                        <Button onClick={updateServiceHandler} disabled={loading}>
                            {loading ? "Please Wait..." : "Save"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default UpdateService