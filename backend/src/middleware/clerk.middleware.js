import {clerkMiddleware, requireAuth} from '@clerk/express'

export const clerkAuth = clerkMiddleware()
export const requireClerkAuth = requireAuth()

export const validateUser=async(req, res, next)=>{
    try {
        if(!req.auth?.userId){
            return res.status(401).json({success: false, message: 'Unauthorized' })
        }
        next()
    } catch (error) {
        return res.status(500).json({success: false, message: 'Internal Server Error' })
    }
}