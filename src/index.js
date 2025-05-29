import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({
    path: './.env'
})

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true,
    }
});

app.set("io",io);

connectDB()
.then(() => {
    server.listen(process.env.PORT || 8000,() => {
        console.log(`Server and Socket Io is listening at port ${process.env.PORT}`);

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