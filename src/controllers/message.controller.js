import { Message } from "../models/message.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendMessage = asyncHandler(async (req, res) => {
  const io = req.io;  // get io from request
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

  // Emit socket event to notify users of new message
  // You can emit to everyone or to a specific user/room
  io.emit("newMessage", {
    sender: senderId,
    reciever: recieverID,
    content: content,
    messageId: newMessage._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message was sent Successfully"));
});

export { sendMessage };
