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


export { sendMessage, getMessage };
