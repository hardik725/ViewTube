import mongoose from "mongoose";
import { Notification } from "../models/notification.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getNotification = asyncHandler(async (req,res) => {
    const userId = req.user?._id;

    const notification = await Notification.aggregate([
        {
            $match: {
                reciever: new mongoose.Types.ObjectId(userId) 
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "not_sender"
            }
        },
        {
            $unwind: "$not_sender",
        },
        {
            $project: {
                purpose: 1,
                senderName: "$not_sender.fullname",
                senderUsername: "$not_sender.username",
                senderId: "$not_sender._id",
                senderAvatar: "$not_sender.avatar",
                createdAt: 1,
                read: 1,
            }
        }
    ])

    if(!notification){
        throw new ApiError(404,"Notification has not been fetched");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,notification,"Notification successfully Fetched")
    )
});

const addNotification = asyncHandler(async (req,res) => {
    const senderId = req.user?._id;
    const {recieverId} = req.params;
    const {purpose} = req.query;

    const notification = await Notification.create({
        purpose: purpose,
        sender: senderId,
        reciever: recieverId,
        read: false
    });

    if(!notification){
        throw new ApiError(404,"Notification was not sent.");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,notification,"Notification was sent Successfully.")
    );
});

const markRead = asyncHandler(async (req,res) => {
    const {notificationId} = req.params;
    
    const notification = await Notification.findByIdAndUpdate(notificationId,{
        $set: {
            read: true,
        }
    },
{
    new: true,
});

if(!notification){
    throw new ApiError(404,"Not able to mark the notification");
}

return res
.status(200)
.json(
    new ApiResponse(201, notification, "Notifacation successfully marked")
);
});

export {getNotification,addNotification,markRead};