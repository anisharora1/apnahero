import Service from "../models/service.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const postService = async (req, res) => {
    try {
        const { title, description, price, location, category, phoneNumber } = req.body;
        const auth = req.auth();
        const clerkUserId = auth?.userId || 'test-user-id';
        if (!title || !description || !price || !location || !category || !phoneNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ message: "Price must be a positive number" });
        }
        let thumbnailUrls = [];
        //  console.log('Files received:', req.files);
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                try {
                    const uploadResult = await uploadOnCloudinary(file.buffer, file.originalname);
                    if (uploadResult && uploadResult.secure_url) {
                        thumbnailUrls.push(uploadResult.secure_url);
                    } else {
                        console.error("Failed to upload image:", uploadResult);
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                }
            }
        } else {
            console.log('no files received')
        }
        const service = await Service.create({
            clerkUserId:clerkUserId,
            title,
            description,
            price: numericPrice,
            location,
            category,
            phoneNumber,
            thumbnails: thumbnailUrls
        })
        if (service) {
            return res.status(200).json({ message: "Service created successfully", service });
        } else {
            return res.status(500).json({ message: "Failed to create service" });
        }
    } catch (error) {
        console.error("Error creating service:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const updateService = async (req, res) => {
    try {
        const { title, description, price, location, category } = req.body;
        const serviceId = req.params.id;
        if (!serviceId) {
            return res.status(400).json({ message: "Service ID is required" });
        }
        let service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({success:false, message: "Service not found" });
        }
        const clerkUserId = req.auth?.userId;
        if (clerkUserId !== service.clerkUserId) {
            return res.status(403).json({success:false, message: "You are not authorized to update this service" });
        }

        let thumbnailUrls = [];
        // console.log('Files received:', req.files);
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                try {
                    const uploadResult = await uploadOnCloudinary(file.buffer, file.originalname);
                    if (uploadResult && uploadResult.secure_url) {
                        thumbnailUrls.push(uploadResult.secure_url);
                    } else {
                        console.error("Failed to upload image:", uploadResult);
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                }
            }
        } else {
            console.log('no files received')
        }

        service = await Service.findByIdAndUpdate(serviceId, {
            title,
            description,
            price: Number(price),
            location,
            category,
            thumbnails: thumbnailUrls
        }, { new: true });

        if (!service) {
            return res.status(500).json({success:false, message: "Failed to update service" });
        }
        await service.save();

        return res.status(200).json({success:true, message: "Service updated successfully", service});

    } catch (error) {
        console.error("Error updating service:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const deleteService = async (req, res) => {
    try {
        const serviceId = req.params.id;
        if (!serviceId) {
            return res.status(400).json({ message: "Service ID is required" });
        }
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        const clerkUserId = req.auth?.userId || 'test-user-id';
        if (clerkUserId !== service.clerkUserId) {
            return res.status(403).json({ message: "You are not authorized to delete this service" });
        }

        await Service.findByIdAndDelete(serviceId);

        return res.status(200).json({success:true, message: "Service deleted successfully" });

    } catch (error) {
        console.error("Error deleting service:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });

    }
}

const togglePublishAndUnpublish = async (req, res) => {
    // to be implemented
    try {
        const serviceId = req.params.id;
        if (!serviceId) {
            return res.status(400).json({ message: "Service ID is required" });
        }
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        const clerkUserId = req.auth?.userId || 'test-user-id';
        if (clerkUserId !== service.clerkUserId) {
            return res.status(403).json({ message: "You are not authorized to delete this service" });
        }
        service.isPublished = !service.isPublished;
         await service.save();
        return res.status(200).json({success:true, message: "Service publish status toggled successfully"});

    } catch (error) {
        console.error("Error toggling service publish status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const allPublishedServices = async (req, res) => {
    try {
        const { q, title, category, location } = req.query;

        const filter = { isPublished: true };

        // Field-specific filters
        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }
        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        // General query across title/category/location
        if (q && q.trim().length > 0) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } }
            ];
        }

        const services = await Service.find(filter);

        return res.status(200).json({
            success: true,
            services
        });
    } catch (error) {
        console.error("Error fetching published services:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const myPublishedServices = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId || 'test-user-id';
        const services = await Service.find({ clerkUserId, isPublished: true });
        return res.status(200).json({
            success: true,
            services
        });
    } catch (error) {
        console.error("Error fetching my published services:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const myUnpublishedServices = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId || 'test-user-id';
        const services = await Service.find({ clerkUserId, isPublished: false });
        return res.status(200).json({
            success: true,
            services
        });
    } catch (error) {
        console.error("Error fetching my unpublished services:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getOwnServices = async (req, res) => {
    try {
        const clerkUserId = req.auth?.userId;
        // console.log("Authenticated user ID:", clerkUserId);
        const services = await Service.find({ clerkUserId: clerkUserId });
       
        return res.status(200).json({
            success: true,
            services
        });
    } catch (error) {
        console.error("Error fetching own services:", error);
        return res.status(500).json({ success:false, message: "Internal server error" });
    }
}

export { postService, updateService, deleteService, togglePublishAndUnpublish, allPublishedServices, myPublishedServices, myUnpublishedServices, getOwnServices }