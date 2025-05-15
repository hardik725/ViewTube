import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";

const uploadVideo = asyncHandler(async (req,res) => {
    // we will get the user id from the cookies in which user is saved
    const userId = req.user?._id;

    // we will get the other assets from the user frontend
    const {title,description} = req.body;

    // get the file local path stored by multer here 
    const videoFilePath = req.files?.videoFile[0]?.path;

    if(!videoFilePath){
        throw new ApiError(401,"Video File not Found in Local Disk");
    }

    // get the thumbnail also for the video
    const thumbnailFilePath = req.files?.thumbnail[0]?.path;

    if(!thumbnailFilePath){
        throw new ApiError(401,"Thumbnail File not Found in Local Disk");
    }


    // here we have uploaded the video file to the cloudinary data base 
    const video = await uploadOnCloudinary(videoFilePath);

    const thumbnail = await uploadOnCloudinary(thumbnailFilePath);

    if(!video || !thumbnail){
        throw new ApiError(401,"Video File or Thumbnail File is not uploaded on the cloudinary");
    }


    const uploadedVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title: title,
        description: description,
        duration: video.duration,
        owner: userId
    });

    if(!uploadedVideo){
        throw new ApiError(401,"Video File is not uploaded here.");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,uploadedVideo,"Video File Successfully upload on ViewTube")
    )

});

const togglePublication = asyncHandler(async (req,res) => {
    const {videoId} = req.params;

    // now we will check if the video is present in the DB or not

    if(!videoId){
        throw new ApiError(401,"Please enter a valid Video Id");
    }

    const video = await Video.findById(videoId);
    
    if(!video){
        throw new ApiError(401,"The video was not found in the database");
    }
    video.isPublished = !video.isPublished;
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,`The video isPublished state has been changed to ${video.isPublished ? "Published" : "not Published" }`)
    );

    // now we will update the isPublished status of the video
    
});

const updateVideo = asyncHandler(async (req,res) => {
    // take the videoId as params
    const {videoId} = req.params;
    // take the title and description in the body
    const {title,description} = req.body;

    const thumbnailFilePath = req.file?.path;

    if(!title && !description && !thumbnailFilePath.trim()){
        throw new ApiError(401,"Any one of the mentioned field must be filled");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(401,"The video trying to update is not found");
    }

    // now if thumbnail File path is there then we have to update it
    let thumbnail;
    if(thumbnailFilePath){
        thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    }
    // if we recieved thumbnail but was not uploaded on cloudinary
    if(thumbnailFilePath && !thumbnail){
        throw new ApiError(401,"Thumbnail is not uploaded to cloudinary");
    }

    if(title){
        video.title = title.trim();
    }
    if(description){
        video.description = description.trim();
    }
    if(thumbnail){
        video.thumbnail = thumbnail.url;
    }

    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"The video has been successfully updated")
    );
});

const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params;
    // now we fill find the video and delete it 

    await Video.findByIdAndDelete(videoId);

    // check if the video is deleted or not
    const video = await Video.findById(videoId);
    if(video){
        throw new ApiError(401,"The video was not successfully deleted");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"The video was deleted successfully")
    )
});


// we will see how to get all the videos on the basis of some query

const getAllVideos = asyncHandler(async (req,res) => {
    // here we will get all the query to how to get all the videos in order 
    // here we have passed some default value to this also for seaech query
    const{page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId} = req.query;

    // now we will create a filter that will pass down to Video.find()
    const filter = {};

    // now we will search for the objects having the query in there title or description
    if(query){
        filter.$or = [
            {title: {$regex: query , $options: 'i'}},
            {description: {$regex: query, $options: 'i'}}
        ]
    }

    // now if we have a userId then
    if(userId){
        filter.owner = userId; 
    }

    // now the sortBy method
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
    // here if we pass views and desc then 
    // it becomes sortOptions['views'] = -1 
    // that is .sort({views: -1})
    
    const skipp = parseInt(page-1)*parseInt(limit);

    const videos = await Video.aggregate([
        {
            $match: filter,
        },
        {
            $sort: sortOptions,
        },
        {
            $skip: skipp,
        },
        {
            $limit: parseInt(limit),
        },
        {
            $lookup: {
                from: 'users',
                foreignField: "_id",
                localField: "owner",
                as: "owner_details",
            }
        },
        {
            $unwind: "$owner_details",
        },
        {
            $project: {
                _id: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                owner: "$owner_details.username",
                avatar: "$owner_details.avatar",
                user_id: "$owner_details._id",
            }
        }
    ])

    if(!videos){
        throw new ApiError(401,"Videos can't be fetched due to error");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"All the searched videos are here")
    );
});

const increaseViewCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Unable to update the views count");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Views Updated Successfully"));
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "comments",
                let: { videoId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "comment_owner"
                        }
                    },
                    { $unwind: "$comment_owner" },
                    {
                        $project: {
                            _id: 1,
                            content: 1,
                            commentcreated: "$createdAt",
                            ownerId: "$comment_owner._id",
                            owner: "$comment_owner.username",
                            ownerAvatar: "$comment_owner.avatar"
                        }
                    }
                ],
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "owner_data",
            }
        },
        {
            $unwind: "$owner_data",
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                comments: 1,
                likes: 1,
                owner_id: "$owner_data._id",
                owner: "$owner_data.username",
                owner_fullname: "$owner_data.fullname",
                owner_avatar: "$owner_data.avatar",
            }
        }
    ]);

    if (!video || video.length === 0) {
        throw new ApiError(404, "The video was not found in the database");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "The requested video has been fetched successfully"));
});

const getChannelsVideo = asyncHandler(async (req, res) => {
    const { channels } = req.body;

    if (!Array.isArray(channels) || channels.length === 0) {
        return res.status(400).json({ message: "Channels list is empty or invalid." });
    }

    const results = await Promise.all(
        channels.map(async (channelId) => {
            const vids = await Video.aggregate([
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(channelId)
                    },
                },
        {
            $limit: 3,
        },
        {
            $lookup: {
                from: 'users',
                foreignField: "_id",
                localField: "owner",
                as: "owner_details",
            }
        },
        {
            $unwind: "$owner_details",
        },
        {
            $project: {
                _id: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                owner: "$owner_details.username",
                avatar: "$owner_details.avatar",
                user_id: "$owner_details._id",
            }
        }
            ]);
            return { channelId, videos: vids };
        })
    );

    res.status(200).json({ data: results });
});



export {uploadVideo,togglePublication,updateVideo,deleteVideo,getAllVideos,getVideoById,increaseViewCount,getChannelsVideo};