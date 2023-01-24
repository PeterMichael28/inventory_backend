const expressAsyncHandler = require( "express-async-handler" );
const User = require( "../models/User" );
const sendEmail = require( "../utils/sendEmail" );


const ContactUs = expressAsyncHandler( async ( req, res ) => {
    const { subject, message } = req.body

    if ( !subject || !message ) {
        res.status( 400 )
        throw new Error( "subject and message required")
    }
    const user = await User.findOne( req.user._id )

    if ( !user ) {
        res.status( 400 )
        throw new Error( "Unauthorized, please login to continue")
    }


    const send_to = process.env.EMAIL_USER
    const sent_from = process.env.EMAIL_USER
    const reply_to = user.email

    try {
        await sendEmail( subject, message, send_to, sent_from, reply_to )
        res.status( 200 ).json({success: true, message: "Message sent"})
    } catch (error) {
        res.status( 500 )
        // throw new Error('Email not sent, please try again later')
        throw new Error(error)
    }
} );


module.exports = ContactUs