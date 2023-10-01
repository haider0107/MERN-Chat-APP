import asyncHandler from "express-async-handler";
import chatModel from "../models/chatModel.js";
import userModel from "../models/userModel.js";

// Create or access one on one chat
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

// Fetching chats
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

// Create a group chat
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ error: "Please fill all the feilds" });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ error: "More than two users are required to form a group chat" });
  }

  users.push(req.user);

  try {
    const groupChat = await chatModel.create({
      chatName: req.body.name,
      users: users,
      isGruopChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await chatModel
      .findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Rename a group
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updateChat = await chatModel
    .findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updateChat) {
    res.status(404);
    throw new Error("Chat not Found");
  } else {
    res.status(200).json(updateChat);
  }
});

// Add user to group
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await chatModel
    .findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat not Found");
  } else {
    res.status(200).json(added);
  }
});

// Remove a user from a group
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const remove = await chatModel
    .findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!remove) {
    res.status(404);
    throw new Error("Chat not Found");
  } else {
    res.status(200).json(remove);
  }
});

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
