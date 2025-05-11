import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async(req,res) => {
    // here we will get the user data that we need to find
    const userId = req.user?._id;
    // here we will find the total Likes and Views on the Video along with 
    // total videos and total Subscribers
    const Likes = await Video.aggregate(
        [
            {
                $match:{
                    owner: new mongoose.Types.ObjectId(userId)
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "total_Likes",
                },
            },
            {
                $project: {
                    _id: 1,
                    views: 1, 
                    likeCount: { $size: "$total_Likes"}
                }
            }
            // till here we get the like Count of each video after this we want to sum
            ,
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: "$likeCount"},
                    totalViews: { $sum: "$views"},
                    videoCount: { $sum: 1},
                    // this will add one each time summation is happining while grouping
                }
            },
            {
                $project:{
                    _id: 0,
                    totalLikes: 1,
                    totalViews: 1,
                    videoCount: 1,
                }
            }
        ]
    );
    // here this will add the total number of subscriber of the channel
    const SubscriberCount = await Subscription.find({"channel": userId});

    if(!Likes || !SubscriberCount){
        throw new ApiError(401,"There was an error while fetching the Stats of The channel");
    }
    Likes[0].totalSubsribers = SubscriberCount.length;
    return res
    .status(200)
    .json(
        new ApiResponse(200,Likes,"Likes for each video has been fetched.")
    );

});

const getChannelVideos = asyncHandler(async(req,res) => {
    const userId = req.user?._id;

    const ChannelVideo = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from: "likes",
                    foreignField: "video",
                    localField: "_id",
                    as: "total_Likes"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    foreignField: "video",
                    localField: "_id",
                    as: "all_comments"
                }
            },
            {
                $project:{
                    _id: 1,
                    thumbnail: 1,
                    title: 1,
                    duration: 1,
                    views: 1,
                    owner: 1,
                    likes: { $size: "$total_Likes"},
                    comments: { $size: "$all_comments"}
                }
            }
        ]
    );

    if(!ChannelVideo){
        throw new ApiError(404,"Not able to find Channel Videos");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,ChannelVideo,"All channel video Data fetched")
    );
});

export {getChannelStats,getChannelVideos};