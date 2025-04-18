import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const postComment = asyncHandler(async (req,res) => {
    const userId = req.user?._id;
    // now we will get the content and video on which comment is made

    const {videoId} = req.params;
    const {content} = req.body;

    // now we will find the video
    const video = await Video.findById(videoId);
    // if video not fetched then
    if(!video){
        throw new ApiError(401,"There was an error fetching the video");
    }

    const newComment = await Comment.create({
        owner: userId,
        content: content,
        video: videoId
    });

    if(!newComment){
        throw new ApiError(401,"There was error while commenting on the video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,newComment,"Comment was added on the video successfully")
    );
});

const updateComment = asyncHandler(async (req,res) => {
    const {commentId} = req.params;
    const {content} = req.body;
    
    // now we will find the comment to update
    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set:{
                content: content
            }
        },
        {new: true},
    );

    if(!comment){
        throw new ApiError(401,"The comment could't be found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"The comment has been successfully updated")
    );
});

// here we will get all the comments for a particular video
const getAllCommentVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    // now we will use pipleine to get all the comment for the video with owner name,username and avatar
    const videoComment = await Comment.aggregate([
        {
           $match:{
            video: new mongoose.Types.ObjectId(videoId)
           } 
        },
        {
            $lookup:{
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "comment_users",
            }
        },
        {
            $unwind: "$comment_users",
        },
        {
            $project: {
                _id: 1,
                fullname: "$comment_users.fullname",
                username: "$comment_users.username",
                avatar: "$comment_users.avatar",
                content: 1,
                createdAt: 1,
            }
        }
    ]);

    if(!videoComment){
        throw new ApiError(401,"No comment was fetched for this video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videoComment,"All comment for the video has been successfully fetched")
    );
});

const deleteComment = asyncHandler(async (req,res) => {
    const {commentId} = req.params;

    // here we will search by id and delete
    await Comment.findByIdAndDelete(commentId);

    const check_comment = await Comment.findById(commentId);
    if(check_comment){
        throw new ApiError(401,"The Comment was not deleted");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"The comment was deleted Successfully")
    );
});

export {postComment,updateComment,getAllCommentVideo,deleteComment};