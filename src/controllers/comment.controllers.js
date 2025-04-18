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

export {postComment,updateComment};