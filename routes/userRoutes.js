const express = require( 'express' );
const { registerUser, loginUser, logoutUser, getUser, loginStatus, updateProfile, changePassword, forgotPassword, resetPassword } = require( '../controllers/userController' );
const protectRoutes = require( '../middleware/authMiddleware' );
const router = express.Router();


router.post( '/register', registerUser );
router.post( '/login', loginUser );
router.get( '/logout', logoutUser );
router.get( '/getUser', protectRoutes, getUser );
router.get( '/loggedin', loginStatus );
router.patch( '/updateprofile', protectRoutes, updateProfile );
router.patch( '/updatepassword', protectRoutes, changePassword );
router.post( '/forgotpassword', forgotPassword );
router.put( '/resetpassword/:resetToken', resetPassword );



module.exports = router