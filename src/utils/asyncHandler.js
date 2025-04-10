const asyncHandler = (requestHandler) => {
 return (req,res,next) => {
    Promise.resolve(requestHandler(req,res,next)).
    catch((err) => next(err))
 }
}


export {asyncHandler};

// this is a higher order function that accepts function as parameters
// this is a try catch version of the asyn handler
// const asyncHandler = (fn) => async (req,res,next) => {
//     try{
//         await fn(req,res,next);
//     }catch(error){
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         });
//     }
// }