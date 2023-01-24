const dotenv = require( 'dotenv' ).config();
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const bodyParser = require('body-parser')
const cors = require( 'cors' );
const userRoutes = require( './routes/userRoutes' )
const productsRoutes = require( './routes/productsRoutes' )
const contactRoutes = require( './routes/contactRoutes' )
const cookieParser = require('cookie-parser')
const connectDB = require( './config/dbConn' )
const path = require("path")


connectDB()

const errorHandler = require('./middleware/errorHandler');
const corsOptions = require( './config/corsOption' );

const app = express();



const PORT = process.env.PORT || 4000;

//middlewares
app.use( express.json() ); //to handle our json
app.use( cookieParser() ); // cookie parser
app.use( express.urlencoded( { extended: false } )); //handle data via url
app.use( bodyParser.json() ); // to parse the data sent in the body from the frontend
app.use( cors(corsOptions) ); // cors

//setting the upload routes
app.use('/uploads', express.static(path.join(__dirname, "uploads")))

//Routes middleware
app.use( '/api/users', userRoutes )

// products
app.use( '/api/products', productsRoutes )

//contact
app.use('/api/contact', contactRoutes )

//Routes
app.get( '/', ( req, res ) => {
    res.send("Homepage")
} )

//Error middleware
app.use(errorHandler);

//connecting to db and start server
mongoose.connection.once( 'open', () => {
    console.log( 'Connected to MongoDB' )
    app.listen( PORT, () => console.log('server up and running on port ' + PORT))
})