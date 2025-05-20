import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// this is a combined function of adding and removing the like for video,comment,tweet

const toggleLike = asyncHandler(async (req,res)=> {
    // here we will get the type like video,tweet,comment to be liked by the user
    const {type} = req.query;
    // now we will get the id of what we have liked
    const {id} = req.params;
    const userId = req.user?._id;
    
    // find the like with owner and type id in this
    const findLike = await Like.findOne({
        [type]: id,
        owner: userId,
    });

    if(findLike){
        await Like.findOneAndDelete({
            [type]: id,
            owner: userId,
        });
        const checkLike = await Like.findById(findLike._id);
        if(checkLike){
            throw new ApiError(401,"Like is not removed");
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Like has been removed successfully.")
        );
    }else{
        const newLike = await Like.create({
            [type]: id,
            owner: userId,            
        });
        if(!newLike){
            throw new ApiError(401,"New like is not added.");
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,newLike,"New like has been added successfully.")
        );
    }
});

// function to add a like
const likeVideo = asyncHandler(async (req,res)=> {
    // here we will get the type like video,tweet,comment to be liked by the user
    const {type} = req.query;
    // now we will get the id of what we have liked
    const {id} = req.params;
    const userId = req.user?._id;

    const newLike = await Like.create({
        [type]: id,
        owner: userId,
    });
    if(!newLike){
        throw new ApiError(401,"Like is not updated successfully");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,newLike,"Like is successfully added")
    );
});

// function to remove a like
const removeLike = asyncHandler(async (req,res) => {
    // id of the liked to be removed
    const {likeId} = req.params;

    await Like.findByIdAndDelete(likeId);

    const checkLike = await Like.findById(likeId);
    if(checkLike){
        throw new ApiError(401,"Like has not been removed");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Like has been removed successfully")
    );

});

// get all the videos that you have liked

const getVideos = asyncHandler(async(req,res)=> {
    const userId = req.user?._id;

    const allVideo = await Like.aggregate([
        {
            $match: {
             owner: new mongoose.Types.ObjectId(userId),
             video: {$ne: null} // make sure that all objects having video field only filters in
            }
        },
        {
            $lookup:{
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "all_videos",
                pipeline: [{
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "owner",
                        as: "owner",
                    }
                },
            {
            $unwind: "$owner",
            }]
            }
        },
        {
            $unwind: "$all_videos",
        },
        {
            $project:{
                _id: 1,
                thumbnail: "$all_videos.thumbnail",
                title: "$all_videos.title",
                description: "$all_videos.description",
                duration: "$all_videos.duration",
                views: "$all_videos.views",
                owner: "$all_videos.owner.username",
                avatar: "$all_videos.owner.avatar",
                user_id: "$all_videos.owner._id",
            }
        }
    ]
    )

    if(!allVideo){
        throw new ApiError(401,"All liked videos are not fetched");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,allVideo,"All videos has been successfully fetched")
    );
});

export {likeVideo,removeLike,toggleLike,getVideos};