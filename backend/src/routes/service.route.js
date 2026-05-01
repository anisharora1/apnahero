import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { allPublishedServices, deleteService, getOwnServices, postService, togglePublishAndUnpublish, updateService } from "../controllers/service.controller.js";
import { validateUser } from "../middleware/clerk.middleware.js";

const router = Router()

router.route('/create-service').post(
    validateUser,
    upload.array('thumbnails', 4),
    postService
)

router.route('/update-service/:id').put(
    validateUser,
    upload.array('thumbnails', 4),
    updateService
)
router.route('/delete-service/:id').delete(
    validateUser,
    deleteService
)
router.route('/my-services').get(
    validateUser,
    getOwnServices
)

router.route('/toggle-publish/:id').patch(
    validateUser,
    togglePublishAndUnpublish
)
router.route('/all-published-services').get(
    allPublishedServices
)

export default router