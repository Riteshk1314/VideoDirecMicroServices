const asyncHandler = (reqHandler)=>{
    return (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next)).catch(next);
    };
}



// const asyncHandler = (fn)=>async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(err.core || 500).json({
//             message: error.message
//         })
//     }
// }
module.exports = asyncHandler;