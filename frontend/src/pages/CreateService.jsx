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
        <div className='pb-10 px-3 md:pt-20'>
            
            <div className='max-w-6xl mx-auto mt-8'>
               
                <Card className="w-full bg-white p-5 space-y-2">
                    <h1 className=' text-4xl font-bold '>Basic Service Information</h1>
                    <p className=''>Make changes to your services here. Click publish when you're done.</p>
                    <div className='pt-10'>
                        <Label>Title</Label>
                        <Input type="text" placeholder="Enter a title" name="title" value={content.title} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <JoditEditor
                            ref={editor}
                            value={content.description}
                            config={config}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={(newContent) => setContent((prev) => ({ ...prev, description: newContent }))}// save on blur
                            onChange={(newContent) => { }}
                        />
                    </div>
                    <div className='pt-10 flex gap-5'>
                        <div>
                            <Label>Price:</Label>
                            <Input type="number" placeholder="Enter a price" name="price" value={content.price} onChange={handleChange} />

                        </div>
                        <div>
                            <Label>Phone:</Label>
                            <Input type="tel" placeholder="Enter a phone number" name="phoneNumber" value={content.phoneNumber} onChange={handleChange} />

                        </div>
                    </div>
                    <div className='pt-10 flex gap-5'>
                        <div>
                            <Label>Category</Label>
                            <Select onValueChange={selectCategory}>
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
                            <Input type="text" placeholder="Enter a location" name="location" value={content.location} onChange={handleChange} />
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
                        <Button variant="outline" onClick={() => navigate('/')}>Back</Button>
                        <Button onClick={createServiceHandler}>
                            {
                                loading ? "Please Wait" : "Save"
                            }
                        </Button>
                    </div>

                </Card>
            </div>
        </div>
    )
}

export default CreateService