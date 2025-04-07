import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is listening at port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("MongoDB Connection Failed!!");
});

// import express from "express";
// const app = express();

// this is new method to connect the data base in of the monogo db to our project



// (async () => {
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//        app.on("error", () => {
//         console.log("ERROR:", error);
//         throw error;
//        })
//        app.listen(process.env.PORT, () => {
//         console.log(`App is listening on port ${process.env.PORT}`);
//        })
//     }catch(error) {
//         console.log("ERROR:", error);
//         throw error;
//     }
// })()