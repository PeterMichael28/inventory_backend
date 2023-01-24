const express = require( 'express' );
const { createProduct, getAllProducts, getSingleProduct, deleteProduct, updateProduct } = require( '../controllers/productController' );
const protectRoutes = require( '../middleware/authMiddleware' );
const { upload } = require( '../utils/fileUpload' );
const router = express.Router();


router.post( '/', protectRoutes, upload.single("image"), createProduct );
router.get('/', protectRoutes, getAllProducts)
router.get('/:id', protectRoutes, getSingleProduct)
router.delete('/:id', protectRoutes, deleteProduct )
router.patch('/:id', protectRoutes, upload.single("image"), updateProduct )


module.exports = router;