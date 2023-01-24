const errorHandler = ( err, req, res, next ) => {
    
   
    const statusCode = res.statusCode ? res.statusCode : 500

    res.status( statusCode ).json({
     message: err.message,
     statusCode: statusCode,
     stack: process.env.NODE_ENV === 'development' ? err.stack : null
    } );
    
    // console.log('stack',  stack)
};


module.exports = errorHandler