import mongoose from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const postTweet = asyncHandler(async (req,res) => {
    // content is taken in the body
    const {content} = req.body;

    const userId = req.user?._id;

    if(!content){
        throw new ApiError(401,"Please enter some content for the tweet");
    }

    // now create a new Tweet with the data for the field

    const newTweet = await Tweet.create({
        owner: userId,
        content: content,
    });

    if(!newTweet){
        throw new ApiError(401,"Tweet was not able to create.");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,newTweet,"Tweet has been uploaded successfully.")
    );
});

const getAllTweets = asyncHandler(async (req,res) => {
    // here we will get parameter of how many tweets we will get
    const {page=1, limit=10, userId} = req.query;

    // the number of tweets to be skipped
    const skipp = parseInt(page-1)*parseInt(limit);

    const pipeline = [];

    // if user is mentioned then match the user with this
    if(userId){
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    // this is the default pipeline configuration
    pipeline.push(
        {
            $skip: parseInt(skipp)
        },
        // here i have used aggregate methods to fix the amout of tweets that we get 
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "user_details",
            }
        },
        {
            $lookup: {
                from: "likes",
                foreignField: "tweet",
                localField: "_id",
                as: "user_liked",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            owner: 1,
                        }
                    }
                ]
            },
        },
        { $unwind: "$user_details" }, // So we can access the fields directly
        {
            $project: {
                content: 1,
                createdAt: 1,
                fullname: "$user_details.fullname",
                username: "$user_details.username",
                avatar: "$user_details.avatar",
                likes: "$user_liked"
            }
        }
    );

    const tweets = await Tweet
    // .find()
    // .skip(skipp)
    // .limit(parseInt(limit))
    .aggregate(
        pipeline
    );
    // now we are getting all the user data here

    if(!tweets){
        throw new ApiError(401,"Tweets can't be fetched right now");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"Tweets has beem fetched successfully")
    );

});


// now we will write the code to update the already posted tweet

const updateTweet = asyncHandler(async (req,res) => {
    const {tweetId} = req.params;
    const {content} = req.body;

    if(!content){
        throw new ApiError(401,"Please give some content to update the tweet");
    }

    // now we will find and update the tweet

    const newtweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set: {
                content: content
            }
        },
        {new: true}
    )

    if(!newtweet){
        throw new ApiError(401,"Can't able to find the tweet");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,newtweet,"Tweet has been updated Successfully")
    );
});

const deleteTweet = asyncHandler(async (req,res) => {
    const {tweetId} = req.params;

    await Tweet.findByIdAndDelete(tweetId);

    const check = await Tweet.findById(tweetId);
    if(check){
        throw new ApiError(401,"Tweet was not deleted successfully");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Tweet has been deleted Successfully")
    );
});

const tweetByUserId = asyncHandler(async (req,res) => {
    const userId = req.user?._id;

    // now we will find the tweets of a particular user

    const userTweets = await Tweet.aggregate([{
        $match: {
            owner: new mongoose.Types.ObjectId(userId)
        }
    }]);

    if(!userTweets){
        throw new ApiError(401,"Was not able to fetch the tweets of the users");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,userTweets,"User Tweets successfully fetched")
    );
});

export {postTweet,getAllTweets,updateTweet,deleteTweet,tweetByUserId};