const asyncHandler = require( 'express-async-handler' )
const User = require( '../models/User' )
const Product = require( '../models/Product' );
const { fileSizeFormatter } = require( '../utils/fileUpload' )
const cloudinary = require("cloudinary").v2


const createProduct = asyncHandler( async ( req, res ) => {

    const { name, price, quantity, description, category, sku } = req.body


    //validation
    if ( !name || !price || !quantity || !description || !category || !sku ) {
        res.status( 400 )
        throw new Error( 'Please fill in all fields')
    }

        //handle file upload
    let fileData = {}
    if ( req.file ) {

        //saving img to cloudinary
        let uploadFile;
        try {
            uploadFile = await cloudinary.uploader.upload( req.file.path, {
                folder: "inventory",
                resource_type: "image"
            })
        } catch (error) {
            res.status(500)
            throw new Error('image could not be uploaded, please try again later')
        }


        fileData = {
            fileName: req.file.originalname,
            filePath: uploadFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter( req.file.size, 2)
        }
    }

    //create product
    const product = await Product.create( {
        user: req.user.id,
        name,
        price,
        quantity,
        description,
        category,
        sku,
        image: fileData
    } )
    
    if ( product ) {
        
        res.status( 201 ).json(product)
    } else {
        res.status( 400 )
        throw new Error( 'Error creating product, Please try again later')
    }


} );

const getAllProducts = asyncHandler( async ( req, res ) => {
    //get all products for a specific user and sort from the last to the first
    const products = await Product.find( { user: req.user.id } ).sort( "-createdAt" ) 
    
    if ( !products || products === [] ) {
        res.status( 404 )
        throw new Error("No products found, Please add a products")
    }

    res.status( 200).json(products)
} )

const getSingleProduct = asyncHandler( async( req, res ) => {
    const { id } = req.params
    //if no id
    if ( !id) {
        res.status( 400 )
        throw new Error("Product ID is required")
    }

    //getting a single product by id
    const product = await Product.findById( id )

    //if no product
    if ( !product ) {
        res.status( 400 )
        throw new Error("Product not found")
    }

    //if the id of the product doesnt match the user id
    if ( product.user.toString() !== req.user.id ) {
        res.status( 401 )
        throw new Error("User not authorized")
    }

    res.status( 200 ).json(product)



} )

const deleteProduct = asyncHandler( async ( req, res ) => {
    const { id } = req.params
    //if no id
    if ( !id) {
        res.status( 400 )
        throw new Error("Product ID is required")
    }

   
     //getting a single product by id
    const product = await Product.findById( id )
    
    //if no product
    if ( !product ) {
        res.status( 400 )
        throw new Error("Product not found")
    }

     //if the id of the product doesnt match the user id .. Matching product to the user
     if ( product.user.toString() !== req.user.id ) {
        res.status( 401 )
        throw new Error("User not authorized")
    }

    const result = await product.remove()

    //sending back all the employees as a response
    res.status(200).json( {message: "Product deleted Successfully"} )
} )

const updateProduct = asyncHandler( async ( req, res ) => {

    const { name, price, quantity, description, category, sku } = req.body


    const product = await Product.findById( req.params.id )

      //if no product
      if ( !product ) {
        res.status( 400 )
        throw new Error("Product not found")
    }

      //if the id of the product doesnt match the user id .. Matching product to the user
      if ( product.user.toString() !== req.user.id ) {
        res.status( 401 )
        throw new Error("User not authorized")
    }


        //handle file upload
        let fileData = {}
        if ( req.file ) {
    
            //saving img to cloudinary
            let uploadFile;
            try {
                uploadFile = await cloudinary.uploader.upload( req.file.path, {
                    folder: "inventory",
                    resource_type: "image"
                })
            } catch (error) {
                res.status(500)
                throw new Error('image could not be uploaded, please try again later')
            }
    
    
            fileData = {
                fileName: req.file.originalname,
                filePath: uploadFile.secure_url,
                fileType: req.file.mimetype,
                fileSize: fileSizeFormatter( req.file.size, 2)
            }
        }

    
    //update products
    const updatedProduct = await Product.findByIdAndUpdate(
        { _id: req.params.id },
        {
            name: name || product.name,
            category: category || product.category,
            quantity: quantity || product.quantity,
            price: price || product.price,
            description: description || product.description,
            image: Object.keys(fileData).length !== 0? fileData : product?.image
        },
        {
            new: true,
            runValidators: true
        }
    )
  
    // const { name, price, quantity, description, category, sku } = req.body
         res.status(200).json(updatedProduct)


} );


module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    deleteProduct,
    updateProduct 
}