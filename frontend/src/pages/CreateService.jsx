import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setServices } from '@/redux/serviceSlice';
import { Label } from '@radix-ui/react-dropdown-menu';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa6";

function CreateService() {
    const editor = useRef(null)
    const [loading, setLoading] = useState(false)
    const [previewThumbnails, setPreviewThumbnails] = useState([]);
    const { service } = useSelector(state => state.services)
    const [content, setContent] = useState({
        title: "",
        description: "",
        category: "",
        thumbnails: [null],
        price: 0,
        location: "",
        phoneNumber: "",
    })
    const dispatch = useDispatch()
    const navigate = useNavigate()

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
        const MAX_FILES = 4;
        const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
        const files = e.target.files;
        if (!files || files.length === 0) {
            setPreviewThumbnails([]);
            setContent((prev) => ({ ...prev, thumbnails: [] }));
            return;
        }

        const newUploads = Array.from(files).filter((file) => file && file.type && file.type.startsWith('image/'));

        const tooLarge = newUploads.filter((f) => f.size > MAX_SIZE_BYTES).map((f) => f.name);
        if (tooLarge.length > 0) {
            alert(`These files exceed 1MB and were skipped:\n- ${tooLarge.join('\n- ')}`);
        }
        const validNew = newUploads.filter((f) => f.size <= MAX_SIZE_BYTES);

        const existing = Array.isArray(content.thumbnails) ? content.thumbnails.filter(Boolean) : [];
        let merged = [...existing, ...validNew];
        if (merged.length > MAX_FILES) {
            alert(`You can only select up to ${MAX_FILES} images. Extra files were ignored.`);
            merged = merged.slice(0, MAX_FILES);
        }

        setContent((prev) => ({ ...prev, thumbnails: merged }));

        // Build previews from merged list
        const previews = [];
        let loadedCount = 0;
        merged.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = () => {
                previews[index] = {
                    url: reader.result,
                    name: file.name,
                    size: file.size
                };
                loadedCount++;
                if (loadedCount === merged.length) {
                    setPreviewThumbnails(previews.filter(Boolean));
                }
            };
            reader.onerror = () => {
                loadedCount++;
            };
            reader.readAsDataURL(file);
        });
    };
    const createServiceHandler = async (e) => {
        e.preventDefault();
        // Validation
        if (!content.title || !content.description || !content.price ||
            !content.location || !content.category || !content.phoneNumber) {
            alert("All fields are required");
            return;
        }
        const files = Array.isArray(content.thumbnails) ? content.thumbnails.filter(Boolean) : [];
        if (files.length === 0) {
            alert("Please select at least 1 image (max 4, < 1MB each)");
            return;
        }
        if (files.length > 4) {
            alert("You can upload a maximum of 4 images");
            return;
        }
        const oversize = files.find((f) => f.size > 1024 * 1024);
        if (oversize) {
            alert(`Image ${oversize.name} exceeds 1MB`);
            return;
        }
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('title', content.title)
            formData.append('description', content.description)
            formData.append('category', content.category)
            formData.append('price', content.price)
            formData.append('location', content.location)
            formData.append('phoneNumber', content.phoneNumber)

            // Handle multiple files properly
            if (content.thumbnails && content.thumbnails.length > 0 && content.thumbnails[0] !== null) {
                if (Array.isArray(content.thumbnails)) {
                    // Multiple files
                    content.thumbnails.forEach((file) => {
                        formData.append('thumbnails', file);
                    });
                } else {
                    // Single file
                    formData.append('thumbnails', content.thumbnails);
                }
            }

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/services/create-service`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            })
            console.log(res)
            if (res) {
                setLoading(false)
                dispatch(setServices(service))
                navigate('/')
                console.log(res.data.message)
            }

        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }
    const config = {
        readonly: false,
        toolbarAdaptive: false,
        buttons: ["bold", "italic", "underline"], // only these buttons will show
    };
    return (
        <div className='min-h-screen bg-gray-50 pt-20 pb-16 px-4 md:px-8'>
            <div className='max-w-4xl mx-auto'>

                {/* Page Header */}
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Post a Service</h1>
                        <p className='text-sm text-gray-500 mt-1'>Fill in the details to publish your service</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className='flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm'
                        aria-label='Go back'
                        title='Go back'
                    >
                        <FaArrowLeft size={16} />
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-10 space-y-8">

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Service Title</Label>
                        <Input
                            type="text"
                            placeholder="e.g., Professional Plumbing Services"
                            name="title"
                            value={content.title}
                            onChange={handleChange}
                            className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Description</Label>
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                            <JoditEditor
                                ref={editor}
                                value={content.description}
                                config={config}
                                tabIndex={1}
                                onBlur={(newContent) => setContent((prev) => ({ ...prev, description: newContent }))}
                                onChange={() => { }}
                            />
                        </div>
                    </div>

                    {/* Price & Phone Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Price (₹)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                name="price"
                                value={content.price}
                                onChange={handleChange}
                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Phone Number</Label>
                            <Input
                                type="tel"
                                placeholder="+91"
                                name="phoneNumber"
                                value={content.phoneNumber}
                                onChange={handleChange}
                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Category & Location Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Category</Label>
                            <Select onValueChange={selectCategory}>
                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Categories</SelectLabel>
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
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Location</Label>
                            <Input
                                type="text"
                                placeholder="City, Neighborhood"
                                name="location"
                                value={content.location}
                                onChange={handleChange}
                                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Images</Label>
                        <div className="flex flex-col gap-2">
                            <Input
                                id="file"
                                type="file"
                                onChange={selectThumbnail}
                                accept="image/*"
                                className="w-full md:w-fit h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 bg-white"
                                multiple
                            />
                            <span className='text-xs text-gray-500'>* Max 4 images, 1MB each</span>
                        </div>

                        {previewThumbnails.length > 0 && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-sm font-medium text-gray-700 mb-3">Selected Images ({previewThumbnails.length})</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previewThumbnails.map((preview, index) => (
                                        <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                                            <img
                                                src={preview.url}
                                                className="w-full h-full object-cover"
                                                alt={`Thumbnail ${index + 1}`}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                                                <div className="text-white text-xs w-full">
                                                    <p className="font-medium truncate">{preview.name}</p>
                                                    <p className="text-gray-300">{(preview.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className='flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100'>
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="w-full md:w-auto h-11 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={createServiceHandler}
                            disabled={loading}
                            className="w-full md:w-auto h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-8 transition-colors"
                        >
                            {loading ? "Publishing..." : "Publish Service"}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default CreateService