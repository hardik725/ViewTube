import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// this toggle subscription helps to subscribe and unsubscribe the channel smoothly

const toggleSubscription = asyncHandler(async (req,res) => {
    const {channelId} = req.params;
    const userId =  req.user?._id;

    if([userId,channelId].some((item) => item?.trim === "")){
        throw new ApiError(401,"Plese select a channel to subscribe");
    }

    // Prevent self-subscription
    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }    

    const userSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    });

    if(userSubscription){
        await Subscription.deleteOne({
            channel: channelId,
            subscriber: userId 
        });
        return res
        .status(200)
        .json(
        new ApiResponse(200,{},"Channel Unsubscribed Successfully!")
        )
    }
    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: userId
    });

    if(!newSubscription){
        throw new ApiError(401,"There was error while getting subscribed");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,newSubscription,"Channel Subscribed Successfully")
    )
})

// get user channel Subscribers using pipeline aggregation

const channelSubscribers = asyncHandler(async (req,res) => {
    const userId = req.user?._id;

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
            // all the subscription with current user Id is been filtered out
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "subscriber",
                as: "subscribers_detail",
            },
        },
        {
            $project: {
                "subscribers_detail.fullname": 1,
                "subscribers_detail.username": 1,
                "subscribers_detail.email": 1,
                "subscribers_detail.avatar": 1,
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribers,"All the data of the subscribers are here.")
    )
})

// now we will get the details of all the channels subscribed by us

const subChannel = asyncHandler(async (req,res) => {
    const userId = req.user?._id;

    const subsChannel = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "channel",
                as: "subscribed_channel",
            }
        },
        {
            $project: {
                _id: 0,
                "subscribed_channel.fullname": 1,
                "subscribed_channel.username": 1,
                "subscribed_channel.createdAt": 1,
                "subscribed_channel.avatar": 1,
                "subscribed_channel.coverImage": 1,
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200,subsChannel,"All the subscribed Channel are here.")
    )
    
})

export {toggleSubscription,channelSubscribers,subChannel};