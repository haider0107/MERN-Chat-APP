import asyncHandler from "express-async-handler";
import chatModel from "../models/chatModel.js";
import userModel from "../models/userModel.js";

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId params not send with request");
    return res.sendStatus(400);
  }

  let isChat = await chatModel
    .find({
      isGruopChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users", "-password -_id")
    .populate("latestMessage");

  isChat = await userModel.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGruopChat: false,
      users: [req.user._id, userId],
    };
  }

  try {
    const createdChat = await chatModel.create(chatData);

    const fullChat = await chatModel
      .findOne({ _id: createdChat._id })
      .populate("users", "-password");

    res.status(200).send(fullChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    let results = await chatModel
      .find({
        users: { $elemMatch: { $eq: req.user._id } },
      })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await userModel.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
export { accessChat, fetchChats };
