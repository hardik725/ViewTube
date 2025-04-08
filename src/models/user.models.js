import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// jwt is a bearer token that is if we have it then we directly get the data 

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },        
        avatar: {
            type: String, // cloudinary url service gen for media hosting is used here
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
        password: { // here the password should be encrypted so that in case of data leak it is protected
            type: String,
            required: [true,'Password is required to be entered'],
        },
        refreshToken: {
            type: String,
        },
    },
    {timestamps: true},
);

UserSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10) // as bcrpt.hash() is a asynchronous function
    next()
});

UserSchema.methods.isPasswordCorrect = async function (password) { // here method added to check the password
    return await bcrypt.compare(password, this.password); // here the password is the password entered by user and the this.password is the encrypted password
};

UserSchema.methods.generateAccessToken = function(){}
UserSchema.methods.generateRefreshToken = function(){}

export const User = mongoose.model("User",UserSchema);