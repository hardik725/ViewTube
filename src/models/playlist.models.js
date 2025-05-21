import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "videos",
            }
        ],
        isPublic: {
            type: Boolean,
            required: true,
        }

    },
    {timestamps: true}
);

export const Playlist = mongoose.model("Playlist",playlistSchema);