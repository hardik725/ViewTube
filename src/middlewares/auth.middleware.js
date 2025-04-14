// this method will verify if the user is there or not

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req,res,next) => {
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }
    
        const decoded_Token = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decoded_Token?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Invalid Acesss Token");
        }
    
        req.user = user;
        next();
} catch (error) {
    throw new ApiError(401,"Invalid Access Token");
}
})