import { Message } from "../models/message.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendMessage = asyncHandler(async (req, res) => {
  const io = req.io; // Get io instance
  const userSocketMap = req.app.get("userSocketMap"); // Get socket map

  const senderId = req.user._id;
  const { recieverID, content } = req.body;

  const newMessage = await Message.create({
    sender: senderId,
    reciever: recieverID,
    content: content,
  });

  if (!newMessage) {
    throw new ApiError(404, "Message was not sent to the User");
  }

  // Emit to specific user if online
  const recieverSocketId = userSocketMap.get(recieverID);
  if (recieverSocketId) {
    io.to(recieverSocketId).emit("newMessage", newMessage);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message was sent Successfully"));
});


export { sendMessage };
