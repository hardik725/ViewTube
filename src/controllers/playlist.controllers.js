import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// controller functions for playlist model
// function to create a playlist
const createPlaylist = asyncHandler(async(req,res)=> {
    const userId = req.user?._id;
    // here we will take the title and description for the playlist
    const {name,description,isPublic} = req.body;

    const newPlaylist = await Playlist.create({
        owner: userId,
        name: name,
        description: description,
        isPublic: isPublic,
    });

    // check if playlist is created or not
    if(!newPlaylist){
        throw new ApiError(401,"Playlist was not able to be created.");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,newPlaylist,"Playlist was created Successfully")
    );
});

// function to get all the users Playlist

const userPlaylist = asyncHandler(async(req,res)=> {
    const {userId} = req.params;

    const reqPlaylist = await Playlist.find({
        owner: userId
    });

    if(!reqPlaylist){
        throw new ApiError(401,"Failed to fetch the Users Playlist");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,reqPlaylist,"User Playlists has been successfully fetched")
    );
});

// function to add video to the playlist

const addToPlaylist = asyncHandler(async(req,res)=> {
    const {playlistId} = req.params;
    const {videoId} = req.body;

    // now we will search for the playlist in which this video has to be added
    const reqPlaylist = await Playlist.findById(playlistId);
    if(!reqPlaylist){
        throw new ApiError(401,"Can't able to find the Playlist.");
    }

    reqPlaylist.videos.push(videoId);
    await reqPlaylist.save();
    return res
    .status(200)
    .json(
        new ApiResponse(200,reqPlaylist,"The Video has been added to Playlist.")
    );
});

// function to remove the video from the playlist

const removeVideo = asyncHandler(async(req,res)=> {
    const {playlistId} = req.params;
    const {videoId} = req.body;
    // take the playlistId And Video to be deleted
    const reqPlaylist = await Playlist.findById(playlistId);

    if(!reqPlaylist){
        throw new ApiError(401,"Not able to find the Playlist.");
    }

    reqPlaylist.videos = reqPlaylist.videos.filter(video => video.toString()!== videoId);
    await reqPlaylist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Video has been removed from the playlist.")
    );
});

// function to remove the playlist
const removePlaylist = asyncHandler(async(req,res)=> {
    const {playlistId} = req.params;
    // we have to find the playlist and delete it 

    await Playlist.findByIdAndDelete(playlistId);

    const checker = await Playlist.findById(playlistId);
    if(checker){
        throw new ApiError(401,"Playist was not able to be removed.");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Playlist has been removed successfully.")
    );
});

// function to update the playlist

const updatePlaylist = asyncHandler(async(req,res)=> {
    const {playlistId} = req.params;
    const {name,description} = req.body;
    // here we get the name and description for our playlist

    const reqPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name: name,
            description: description
        },
    },
    {new: true}
);

    if(!reqPlaylist){
        throw new ApiError(404,"Not able to find the Required Playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,reqPlaylist,"The Playlist has been updated.")
    );
});

export {createPlaylist,addToPlaylist,userPlaylist,removeVideo,removePlaylist,updatePlaylist};