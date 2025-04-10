import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res) => {
    // get user details from frontend
    const {fullname,username,email,password} = req.body;
    console.log("email: ", email);


    // validation that if all the data are taken correctly or not?
    if(
        [fullname,email,username,password].some((field) => field?.trim() == "") // here some checks if any of the element in the array beign passed on satisfy the condition then the output is send as mentioned
    ){
        throw new ApiError(400,"All fields are required");
    }
    const hasDomain = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(email);
    if(!hasDomain){
        throw new ApiError(400,"Give a valid email address");
    }


    // check if user already exist with email or username

    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with same email and username already exists");
    }
    // check for images,check for avatar
    // multer gives access for files to us
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is Required");
    }

    // upload them on cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar File is Required");
    }
    // then save the user object in db if not already there - create entry in db

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the User");
    }
    

    // remove pass and refresh token field from response

    // check for user creation

    // if created then send the response

    // if not then send the error message to the user trying to create the user
})

export {registerUser};