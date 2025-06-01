import mongoose, { Mongoose } from "mongoose";

const notificationSchema = new mongoose.Schema({
    purpose: {
        type: String,
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    read: {
        type: Boolean,
        default: false,
    },
},{
    timestamps: true
})

export const Notification = mongoose.model("Notification",notificationSchema);