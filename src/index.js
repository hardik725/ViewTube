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
    origin: ["http://localhost:5173", "https://view-tube-frontend.vercel.app"],
    methods: ["GET","POST"],
  },
});


io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for a user to register their userId
  socket.on("sendMessage", (message) => {
    console.log("The sent Message is: ",message);
    io.emit("recievedMessage",message);
  });

  socket.on("deleteMessage",(message) => {
    console.log("The delete Message is: ",message);
    io.emit("rdeletedMessage",message);
  });

  socket.on("updateMessage",(message) => {
    console.log("The updated Message is: ",message);
    io.emit("rupdatedMessage",message);
  })

  socket.on("disconnect", () => {
    console.log("UserId disconnect is: ",socket.id);
  });
});


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