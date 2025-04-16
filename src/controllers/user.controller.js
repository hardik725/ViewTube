import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


// function to generate Access and Refresh Token

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

// Function to register the User

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

// controller function for user login

const LoginUser = asyncHandler(async (req,res)=> {
    // we will need the username and password to login
    const {username,password} = req.body;

    if([username,password].some((item) => item?.trim == "")){
        throw new ApiError(400,"write username and password");
    }

    const UserExist = await User.findOne({username});
    if(!UserExist){
        throw new ApiError(400,"No User Found with this Username");
    }
    const ValidUser = await UserExist.isPasswordCorrect(password);

    if(!ValidUser){
        throw new ApiError(401,"User Password Incorrect");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(UserExist._id);

    // now we will send this refresh and access Token to the cookies

    const loggedInUser = await User.findById(UserExist._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.
    status(200).cookie("accessToken",accessToken, options).
    cookie("refreshToken",refreshToken,options).
    json(
        new ApiResponse(200,{
            user: loggedInUser,accessToken,
            refreshToken
        },
        "User Logged In Succesfully"
    )
    )
})

// controller function for user logout

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(req.user._id, // here first we have to give a parameter to find the user
        {
            // then here we have to give the method we want to do with the user
            $set:{
                refreshToken: undefined
            } 
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.
    status(200).clearCookie("accessToken").
    clearCookie("refreshToken").
    json(
        new ApiResponse(200,{},"User logged Out successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=> 
    {
    const incommingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if(!incommingRefreshToken){
        throw ApiError(401,"Unauthorized Request");
    }

try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token");
        }
    
        if (incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or Used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken: newRefreshToken},
            "Access Token is refreshed")
        )
} catch (error) {
    throw new ApiError(401,"There was a problem while refreshing the refresh Token");
}
}
)

const changeCurrentUserPassword = asyncHandler(async (req,res) => {
    // first we take the paramter to change find the user
    const id = req.user?._id;
    const {oldPassword,newPassword} = req.body;

    // check if all the fields are filled or not

    if([id,oldPassword,newPassword].some((item) => item?.trim === "")){
        throw new ApiError(401,"Pleas enter both oldPassword and newPassword");
    }

    // find the user of the following username

    const user = await User.findById(id);

    if(!user){
        throw new ApiError(401,"User with given username dosent exist");
    }

    // if user exist then check for correct password
    const ValidPassword = await user.isPasswordCorrect(oldPassword);

    if(!ValidPassword){
        throw new ApiError(401,"Enter a valid Password");
    }

    // if password is correct then change the password and save the user
    user.password = newPassword;
    // when the password is modified then dusring the change the new passwod would be encrypted before being 
    // saved and then user is updated
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,"User Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async (req,res) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    return res.status(200)
    .json(
        200,user,"Current User fetched Successfully"
    )
});

const updateAccountDetails = asyncHandler(async (req,res) => {
    const {fullname,email} = req.body;

    if([fullname,email].some((item) => item?.trim === "")){
        throw new ApiError(401,"All fields need to be filled");
    }
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId,
        { // HERE WE WILL WRITE THE UPDATES THAT NEEDS TO BE DONE
            $set: {fullname: fullname,
                email: email
            }
        },
        {new: true} // it  will return the updated field to us
    ).select("-password") // here the password is not returned after doing this;

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Account details updated successfully")
    );
})

const updateUserAvatar = asyncHandler(async (req,res) => {
    const userId = req.user?._id;

    const avatarLocalStorage = req.file?.avatar[0]?.path; // if we are taking multiple images then files if single then file
    if(!avatarLocalStorage){
        throw new ApiError(401,"Please enter a file for User Avatar");
    } 

    const avatar = await uploadOnCloudinary(avatarLocalStorage);

    if(!avatar.url){
        throw new ApiError(401,"File is not uploaded on cloundinary");
    }
    // now the url that we recieve from the cloudinary is replaced with the avatar url in the database
    const user = User.findByIdAndUpdate(userId,
        { $set: 
            {avatar: avatar.url}
        },
        {new : true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"User Avatar has been updated")
    )
});

const updateUserCoverImage = asyncHandler(async (req,res) => {
    const userId = req.user?._id;

    const coverImageLocalStorage = req.file?.coverImage[0]?.path; // if we are taking multiple images then files if single then file
    if(!coverImageLocalStorage){
        throw new ApiError(401,"Please enter a file for User Cover Image");
    } 

    const coverImage = await uploadOnCloudinary(coverImageLocalStorage);

    if(!coverImage.url){
        throw new ApiError(401,"File is not uploaded on cloundinary");
    }
    // now the url that we recieve from the cloudinary is replaced with the avatar url in the database
    const user = User.findByIdAndUpdate(userId,
        { $set: 
            {coverImage: coverImage.url}
        },
        {new : true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"User CoverImage has been updated")
    )
});


const getUserChannelProfile = asyncHandler(async (req,res) => {
    // we will get the username of the channel that we want to follow
    const {username} = req.params;

    // check if the username is empty or not
    if(!username?.trim()){
        throw new ApiError(400,"Please give a valid username");
    }

    // now we will check if the user is present or not
    const channel = await User.aggregate([
        {
        $match: {
            username: username?.toLowerCase()
        }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            },
        },
        {
            $project: {
                fullname: 1,
                email: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
            }
        }
    ]);
    

    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist");
    }
    console.log(channel);
    return res.status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel data fetched successfully")
    )
});

const getWatchHistory = asyncHandler(async (req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id) // here the mongoose dont work in aggregation pipeline so we have 
                // use this approach to get the _id from the string that we get
                // we get the user with matching _id here
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                // here the array of watch history contains video file _id's which get replaced with object of the video files here

                pipeline: [
                    // now the further pipleine is applied to get the data of owner of the video file from users by sending user _id to users and getting the matching objects with the _id in user field
                    {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                // we dont want all the data of user object so we use project to use some selected required data from the user
                                $project: {
                                    fullname: 1,
                                    username: 1,
                                    avatar: 1,
                                }
                            },
                            {
                                $addFields: {
                                    owner: {
                                        $first: "$owner"
                                        // get the first object of the owner field that gets the owner data that we have projected

                                    }
                                }
                            }
                        ]
                    }
                }
            ]
            }
        },
    ])
    /*
    [
  {
    _id: ..., // the matched user
    ... // other user fields
    watchHistory: [
      {
        _id: ..., // video ID
        title: ..., // other video fields
        owner:
          {
            _id: ..., // uploader's ID
            fullname: ...,
            username: ...,
            avatar: ...,
            email: ...
          }
      },
      ...
    ]
  }
] */
return res.status(200)
.json(
    new ApiResponse(200,user,"User watch history has been fetched successfully.")
)
}) 

export {registerUser,
    LoginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};