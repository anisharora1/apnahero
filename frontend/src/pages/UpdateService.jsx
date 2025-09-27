import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setServices, setMyServices, setSelectedService } from '@/redux/serviceSlice'
import axios from 'axios'
import JoditEditor from 'jodit-react'
import React, { useRef, useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDataRefresh } from '@/hooks/useDataRefresh'

function UpdateService() {
    const [loading, setLoading] = useState(false)
    const editor = useRef(null)
    const [thumbnailFiles, setThumbnailFiles] = useState([])
    const [previewThumbnails, setPreviewThumbnails] = useState([])

    const { services, myServices, selectedService } = useSelector(store => store.services)
    const params = useParams()
    const serviceId = params.id
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { getToken } = useAuth()
    const { markAsStale } = useDataRefresh()

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
        if (serviceId) {
            // Always fetch the latest service data from the backend to ensure we have the current state
            const fetchLatestService = async () => {
                try {
                    const token = await getToken()
                    const res = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/services/my-services`,
                        {
                            withCredentials: true,
                            headers: {
                                Authorization: token ? `Bearer ${token}` : undefined,
                            }
                        }
                    )
                    
                    if (res.data.success) {
                        const latestService = res.data.services.find(item => item._id === serviceId)
                        if (latestService) {
                            console.log('🔍 FRONTEND DEBUG: Fetched latest service from backend:', latestService)
                            dispatch(setSelectedService(latestService))
                            // Also update the myServices array with the latest data
                            dispatch(setMyServices(res.data.services))
                        }
                    }
                } catch (error) {
                    console.error('Error fetching latest service:', error)
                    // Fallback to cached data if fetch fails
                    let service = myServices.find(item => item._id === serviceId)
                    if (!service && services.length > 0) {
                        service = services.find(item => item._id === serviceId)
                    }
                    if (service) {
                        dispatch(setSelectedService(service))
                    }
                }
            }
            
            fetchLatestService()
        }
    }, [serviceId, dispatch, getToken])

    // Initialize form data when selectedService is available
    useEffect(() => {
        if (selectedService) {
            setContent({
                title: selectedService.title || '',
                description: selectedService.description || '',
                price: selectedService.price || '',
                phoneNumber: String(selectedService.phoneNumber || ''),
                category: selectedService.category || '',
                location: selectedService.location || '',
                thumbnails: selectedService.thumbnails || []
            })
            // Reset any local file selections when service changes
            setThumbnailFiles([])
            setPreviewThumbnails([])
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
            
            // Validate file count
            if (fileArray.length > 4) {
                alert("Maximum 4 images allowed");
                return;
            }
            
            // Validate file sizes and types
            const validFiles = [];
            const errors = [];
            
            fileArray.forEach((file) => {
                if (!file.type.startsWith('image/')) {
                    errors.push(`${file.name} is not an image file`);
                } else if (file.size > 1024 * 1024) { // 1MB limit
                    errors.push(`${file.name} is too large (max 1MB)`);
                } else {
                    validFiles.push(file);
                }
            });
            
            if (errors.length > 0) {
                alert(errors.join('\n'));
                if (validFiles.length === 0) {
                    setThumbnailFiles([]);
                    setPreviewThumbnails([]);
                    return;
                }
            }
            
            // Keep files separate from existing thumbnail URLs
            setThumbnailFiles(validFiles);

            const previews = [];
            let loadedCount = 0;

            validFiles.forEach((file, index) => {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    previews[index] = {
                        url: fileReader.result,
                        name: file.name,
                        size: file.size
                    };
                    loadedCount++;

                    if (loadedCount === validFiles.length) {
                        setPreviewThumbnails(previews.filter(preview => preview !== null && preview !== undefined));
                    }
                };
                fileReader.onerror = (error) => {
                    console.error(`Error reading file: ${file.name}`, error);
                    loadedCount++;
                };
                fileReader.readAsDataURL(file);
            });
        } else {
            setThumbnailFiles([]);
            setPreviewThumbnails([]);
        }
    };

    const updateServiceHandler = async (e) => {
        e.preventDefault()
        console.log("UpdateServiceHandler called", { content, serviceId, services })
        
        // Form validation
        if (!content.title.trim()) {
            alert("Title is required");
            return;
        }
        if (!content.description.trim()) {
            alert("Description is required");
            return;
        }
        if (!content.price || Number(content.price) <= 0) {
            alert("Please enter a valid price");
            return;
        }
        if (!content.phoneNumber || String(content.phoneNumber).trim() === '') {
            alert("Phone number is required");
            return;
        }
        if (!content.category) {
            alert("Please select a category");
            return;
        }
        if (!content.location.trim()) {
            alert("Location is required");
            return;
        }
        
        try {
            const formData = new FormData()
            formData.append('title', content.title?.trim() || '')
            formData.append('description', content.description?.trim() || '')
            formData.append('price', String(content.price || 0))
            formData.append('phoneNumber', String(content.phoneNumber || '').trim())
            formData.append('category', content.category || '')
            formData.append('location', content.location?.trim() || '')
            // Only send new thumbnails if user selected any. Otherwise keep existing on server
            if (thumbnailFiles && Array.isArray(thumbnailFiles) && thumbnailFiles.length > 0) {
                thumbnailFiles.forEach(file => formData.append('thumbnails', file))
            }
            
            
            setLoading(true)
            const token = await getToken()
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/services/update-service/${serviceId}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (res.data.success) {
                const updatedService = res.data.service
                
                // Update all services array (for home page) - only if service is published
                if (services && Array.isArray(services)) {
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
                }
                
                // Update my services array (for MyServices page)
                if (myServices && Array.isArray(myServices)) {
                    const updatedMyServices = myServices.map(item =>
                        item._id === serviceId ? updatedService : item
                    )
                    dispatch(setMyServices(updatedMyServices))
                }
                
                dispatch(setSelectedService(updatedService))
                
                // Reflect updates locally without refresh
                setContent((prev) => ({
                    ...prev,
                    title: updatedService.title || '',
                    description: updatedService.description || '',
                    price: updatedService.price || '',
                    phoneNumber: updatedService.phoneNumber || '',
                    category: updatedService.category || '',
                    location: updatedService.location || '',
                    thumbnails: updatedService.thumbnails || []
                }))
                
                // Clear local selections after successful save
                setThumbnailFiles([])
                setPreviewThumbnails([])
                markAsStale(); // Mark data as stale to trigger refresh
                setLoading(false)
                navigate('/my-services')
                alert("Service updated successfully")
            }
        } catch (error) {
            setLoading(false)
            console.error("Error updating service:", error)
            
            // Show more specific error messages
            if (error.response?.data?.message) {
                alert(`Failed to update service: ${error.response.data.message}`)
            } else if (error.response?.data?.errors) {
                alert(`Failed to update service: ${error.response.data.errors.join(', ')}`)
            } else {
                alert("Failed to update service. Please try again.")
            }
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
                    <Card className="w-full bg-white p-5">
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
                <Card className="w-full bg-white p-5 space-y-2">
                {/* <Button onClick={() => navigate('/')} className='text-2xl cursor-pointer'><FaArrowLeft /></Button> */}
                    <h1 className='text-4xl font-bold'>Basic Service Information</h1>
                    <p className=''>Make changes to your service here. Click save button when you're done.</p>
                    <div className='pt-10'>
                        <Label>Title</Label>
                        <Input
                            type="text"
                            placeholder="Enter a title"
                            name="title"
                            value={content.title}
                            onChange={handleChange}
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
                            className="w-fit"
                            multiple
                        />
                        <span className='text-sm text-red-500'>* Max 4 images, 1MB each</span>
                        
                        {/* Show existing thumbnails */}
                        {selectedService?.thumbnails && selectedService.thumbnails.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Current Images ({selectedService.thumbnails.length}):</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {selectedService.thumbnails.map((thumbnail, index) => (
                                        <div key={`existing-${index}`} className="relative group">
                                            <img
                                                src={thumbnail}
                                                className="w-full h-32 object-cover rounded-lg border"
                                                alt={`Current thumbnail ${index + 1}`}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 text-white text-xs text-center p-2">
                                                    <p className="font-medium">Current Image</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Show new selected thumbnails */}
                        {previewThumbnails.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">New Selected Images ({previewThumbnails.length}):</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {previewThumbnails.map((preview, index) => (
                                        <div key={`new-${index}`} className="relative group">
                                            <img
                                                src={preview.url}
                                                className="w-full h-32 object-cover rounded-lg border"
                                                alt={`New thumbnail ${index + 1}`}
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