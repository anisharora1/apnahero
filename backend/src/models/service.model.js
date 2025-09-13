import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
    clerkUserId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    thumbnails: [{
        type: String,
        required: true
    }],
    phoneNumber:{
        type: Number,
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
},{timestamps:true})

const Service = mongoose.model('Service', serviceSchema)

export default Service