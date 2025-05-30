import { Message } from "../models/message.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendMessage = asyncHandler(async (req, res) => {

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

  return res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message was sent Successfully"));
});

const getMessage = asyncHandler(async (req,res) => {
    const userId = req.user?.id;
    const {channelId} = req.params;

    const messages = await Message.find({
        $or:
        [
            {sender: userId , reciever: channelId},
            {sender: channelId, reciever: userId}
        ]
    }).sort({createdAt: 1});
    return res.
    status(200)
    .json(
        new ApiResponse(201,messages,"Messages has been fetched successfully")
    )
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findByIdAndDelete(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found or already deleted.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { messageId: messageId }, "Message deleted successfully.")
    );
});

const updateMessage = asyncHandler(async (req,res) => {
    const {messageId} = req.params;
    const {content} = req.body;

    const message = await Message.findByIdAndUpdate(messageId,{
        $set:{
            content: content,
        }
    },
    {new: true});

    if(!message){
        throw new ApiError(404,"Not able to search the Message");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,message,"The message has been updated Successfully.")
    )
});


export { sendMessage, getMessage, deleteMessage, updateMessage };
