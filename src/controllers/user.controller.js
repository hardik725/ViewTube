import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken};
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access Token");
    }
}

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

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with same email and username already exists");
    }
    // check for images,check for avatar
    // multer gives access for files to us
    let avatarLocalPath = ""; 
    avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    console.log("Files: ", avatarLocalPath);
    console.log("Files: ", coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400,"AvatarLocalPath File is Required");
    }

    // upload them on cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar File is Required");
    }
    // then save the user object in db if not already there - create entry in db
    console.log("avatar: ",avatar);

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })
    
    // remove pass and refresh token field from response
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // if not then send the error message to the user trying to create the user

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the User");
    }

    // if created then send the response

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created Successfully!")
    )
    
})

const LoginUser = asyncHandler(async (req,res)=> {
    // we will need the username and password to login
    const {username,password} = req.body;

    if([username,password].some((item) => item.trim === "")){
        throw new ApiError(400,"write username and password");
    }

    const UserExist = User.findOne({
        $or: [{username,email}]
    });
    if(!UserExist){
        throw new ApiError(400,"No User Found with this Username");
    }
    const ValidUser = UserExist.isPasswordCorrect(password);

    if(!ValidUser){
        throw new ApiError(401,"User Password Incorrect");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(existedUser._id);

    // now we will send this refresh and access Token to the cookies

    const logedInUser = await User.findById(existedUser._id).select("-password -refreshToken");
    

})

export {registerUser};