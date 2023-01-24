const mongoose = require( 'mongoose' );
const bcrypt = require('bcryptjs')


const userSchema = mongoose.Schema( {
    name: {
        type: String,
        required: [true, "name is required"]
    },
    email: {
        type: String,
        required: [ true, "email is required" ],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Enter a valid email"
        ]
    },
    password: {
        type: String,
        required: [ true, "password is required"],
        minLength: [6, "password must be up to 6 characters"],
     
    },
    photo: {
        type: String,
        required: [ true, "Please add a photo" ],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },
    phone:{
        type: String,
        default: "+234"
    },
    bio: {
        type: String,
        maxLength: [ 250, "bio must not be more than 250 characters" ],
        default: "bio"
    }

}, {
    timestamps: true
} );

userSchema.pre( "save", async function ( next ) {
    
    //if password was not modified
    if ( !this.isModified( "password" ) ) {
        return next()
    }
   
    //hashing the password
    const hashedPwd = await bcrypt.hash( this.password, 10 )
    this.password = hashedPwd
    next()
})

const User = mongoose.model( 'user', userSchema );

module.exports = User;