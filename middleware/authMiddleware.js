const asyncHandler = require( 'express-async-handler' )
const jwt = require('jsonwebtoken')
const User = require( '../models/User' );

const protectRoutes = asyncHandler( async ( req, res, next ) => {
    try {
        //checking for token
        const token = req.cookies.token;
        

        //if no token
        if ( !token || token === ''  ) {
            res.status( 401 )
            throw new Error( 'Access Denied, please login')
        }

        //verify token
        const verify = jwt.verify( token, process.env.JWT_SECRET )
        
        //get user id from token
        const user = await User.findById( verify.id ).select( "-password" )
        // console.log(user)
        if ( !user ) {
            res.status( 401 )
            throw new Error( 'User not found!')
        }

        req.user = user

        next()
    } catch (error) {
        res.status( 401 )
        throw new Error( 'Unauthorized, please login and try again' )
       
    }
} );


module.exports = protectRoutes