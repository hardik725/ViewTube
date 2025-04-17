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

    const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skipp)
    .limit(parseInt(limit))
    .lean();

    if(!videos){
        throw new ApiError(401,"Videos can't be fetched due to error");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"All the searched videos are here")
    );
});

const getVideoById = asyncHandler(async (req,res) => {
    const {videoId} = req.params;

    // get the video by videoId
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(401,"The video was not found in the Db");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"The requested video has been fetched successfully")
    );
});

export {uploadVideo,togglePublication,updateVideo,deleteVideo,getAllVideos,getVideoById};