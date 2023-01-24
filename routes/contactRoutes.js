const express = require( 'express' );
const ContactUs = require( '../controllers/contactController' );
const protectRoutes = require( '../middleware/authMiddleware' );
const router = express.Router();


router.post( '/', protectRoutes, ContactUs );



module.exports = router