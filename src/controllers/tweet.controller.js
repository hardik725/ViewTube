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

    const newTweet = Tweet.create({
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
    const {page=1, limit=10} = req.params;

    // the number of tweets to be skipped
    const skipp = parseInt(page-1)*parseInt(limit);

    const tweets = await Tweet
    // .find()
    // .skip(skipp)
    // .limit(parseInt(limit))
    .aggregate([
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
        { $unwind: "$user_details" }, // So we can access the fields directly
        {
            $project: {
                content: 1,
                createdAt: 1,
                fullname: "$user_details.fullname",
                username: "$user_details.username",
                avatar: "$user_details.avatar",
            }
        }
    ])
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

export {postTweet,getAllTweets};