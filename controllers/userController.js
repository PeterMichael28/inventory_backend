const asyncHandler = require( 'express-async-handler' )
const bcrypt = require( 'bcryptjs' )
const jwt = require('jsonwebtoken')
const User = require( '../models/User' )
const Token = require( '../models/Token' )
const crypto = require("crypto");
const sendEmail = require( '../utils/sendEmail' );

const generateToken = ( id ) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1d'})
}

//Register User
const registerUser = asyncHandler( async ( req, res ) => {
    
    const { name, email, password } = req.body;
    // console.log(name, email, password)
    
    //validation
    if ( !name || !email || !password ) {
        res.status( 400 )
        throw new Error ("Please fill in all required fields")
    };
    //validating the password strength
    if ( password.length < 6 ) {
        res.status( 400 )
        throw new Error ("Password must be up to 6 characters")
    };
    
    //checking if email already exists

    const user = await User.findOne( { email } ).exec()
    
    if ( user ) {
        res.status( 400 )
        throw new Error ("Email already exists")
    };


    //create a new user
    const result = await User.create( { name, password, email } )
    
    // generate token
    const token = generateToken( result._id )
   
    //send HTTP-only cookie
    res.cookie( "token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date( Date.now() + 1000 * 86400 ), //1day
        sameSite: "none",
        secure: true
    } );
    
    // console.log( result )
    if ( result ) {
        const { _id, email, name, bio, photo, phone} = result
        
        res.status(201).json({_id, email, name, bio, photo, phone, token}) //201 - account created
        // console.log(token)
    } else {
        res.status( 400 )
        throw new Error ("Error creating user profile")
    }
    


    
} )


//login User
const loginUser = asyncHandler( async ( req, res ) => {
    const { email, password } = req.body

    //checking if there is email and password
    if ( !email || !password ) {
        res.status( 400 )
        throw new Error("email and password are required")
    }

    //checking if user exists
    const user = await User.findOne( { email } ).exec()
    
    
    if ( !user ) {
        res.status( 400 )
        throw new Error("User not found, Please create an account")
    }

     //checking the pwd
    const matchPwd = await bcrypt.compare( password, user.password )
    
    if ( !matchPwd ) {
        res.status( 400 )
        throw new Error("Incorrect password, Please try again")
    }

    const token = generateToken( user._id)
      //send HTTP-only cookie
      res.cookie( "token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date( Date.now() + 1000 * 86400 ), //1day
        sameSite: "none",
        secure: true
    } );

    if ( user && matchPwd ) {
        const { _id, email, name, bio, photo, phone } = user

            res.status(200).json({_id, email, name, bio, photo, phone, token}) //201 - account created
            // console.log(token)
        } else {
            res.status( 400 )
            throw new Error ("Invalid email or password")
        }

} )

//logout
const logoutUser = asyncHandler( async ( req, res ) => {
     //expire cookie
     res.cookie( "token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), // expires cookie
        sameSite: "none",
        secure: true
     } );
    
   return res.status(200).json({message: "User successfully logged out"})
})


//get userprofile
const getUser = asyncHandler( async ( req, res ) => {
    const user = await User.findOne( req.user._id )
    
    if ( user ) {
        const { _id, email, name, bio, photo, phone } = user

            res.status(200).json({_id, email, name, bio, photo, phone}) //201 - account created
            // console.log(token)
        } else {
            res.status( 400 )
            throw new Error ("User not found")
        }

})


//checking login status
const loginStatus = asyncHandler( async ( req, res ) => {
    const token = req.cookies.token
    if ( !token ) {
        return res.json(false)
    }

     //verify token
    const verify = jwt.verify( token, process.env.JWT_SECRET )
    
    if ( verify ) {
        return res.json(true)
    }
    return res.json(false)
})

//updating user profile
const updateProfile = asyncHandler( async ( req, res ) => {

    const user = await User.findOne( req.user._id )

    if ( user ) {
        const { _id, email, name, bio, photo, phone } = user
        user.email = email
        user.bio = req.body.bio || bio;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.photo = req.body.photo || photo;


        const updatedUser = await user.save()

        res.status(200).json( {
            _id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
            bio: updatedUser.bio,
            photo: updatedUser.photo,
            phone: updatedUser.phone
        })
    } else {
        res.status( 404 )
        throw new Error( 'User not found')
    }



})

//change password route
const changePassword = asyncHandler( async ( req, res ) => {
    const user = await User.findOne( req.user._id )

    const { oldPassword, password } = req.body
    
    if ( !oldPassword || !password ) {
        res.status( 400 )
        throw new Error( 'Old and new password are required')
    }

    if ( !user ) {
        res.status( 400 )
        throw new Error( 'User not found')
    }

         //checking the pwd
    const matchPwd = await bcrypt.compare( oldPassword, user.password )
    
    if ( !matchPwd ) {
            res.status( 400 )
            throw new Error('old password is incorrect')
    }



    if ( user && matchPwd ) {
  
        user.password = password
        await user.save()
        
        res.status( 200 ).json({message: "User Password changed successfully"})
    } else {
        res.status( 400 )
        throw new Error( 'Old password is incorrect')
    }

    
} )

//forgot password
const forgotPassword = asyncHandler( async ( req, res ) => {
    const { email } = req.body
    const user = await User.findOne( { email } )
 

    // if no user
    if ( !user ) {
        res.status( 404 )
        throw new Error('User does not exist')
    }

    //checking and deleting token if user already has a token generated already
    const oldToken = await Token.findOne({userId: user._id})

    if ( oldToken ) {
        await oldToken.deleteOne()
    }
    //create a token
    let resetToken = crypto.randomBytes( 32 ).toString( "hex" ) + user._id

    console.log(resetToken)
    //hash token before saving to db
    const hashedToken = crypto.createHash( "sha256" ).update( resetToken ).digest( 'hex' )
    
    //saving to the db
    await new Token( {
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000) //30mins
    }).save()


    //construct reset url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    //reset email
    const message = `
    <h2>Hello ${ user.name }</h2>
    <p>Please use the url below to reset your password</p>
    <p>This reset link is valid for 30minutes</p>
    <a href=${ resetUrl } clicktracking=off>${ resetUrl }</a>
    

    <p>Regards...</p>
    <p>Peter Michael</p>
    `;
    const subject = "Password Reset Request"
    const send_to = user.email
    const sent_from = process.env.EMAIL_USER

    // console.log(sub, msg, send_to, sent_from)

    try {
        await sendEmail( subject, message, send_to, sent_from )
        res.status( 200 ).json({success: true, message: "Reset Email Sent"})
    } catch (error) {
        res.status( 500 )
        // throw new Error('Email not sent, please try again later')
        throw new Error(error)
    }


} )

//reset password
const resetPassword = asyncHandler( async ( req, res ) => {
    const {resetToken} = req.params
    const { password } = req.body
   
    
    //hash token, and then compare to the token in the db
    const hashedToken = crypto.createHash( "sha256" ).update( resetToken ).digest( 'hex' );
    console.log(hashedToken)
    const userToken = await Token.findOne( {
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    } )
    
    if ( !userToken ) {
        res.status( 404 )
        throw new Error('Invalid or Expired Token')
    }

    const user = await User.findOne( { _id: userToken.userId } )
    user.password = password
    await user.save()

    res.status( 200 ).json( { success: true, message: "Password reset Successfully, Please login" })
})


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    loginStatus,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
}