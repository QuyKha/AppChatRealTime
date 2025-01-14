const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
  try {
    const { username, phone, email, password, avatarImage } = req.body;
    const phoneCheck = await User.findOne({ phone });
    if (phoneCheck)
      return res.json({ msg: "Phone number already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      phone,
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user)
      return res.json({ msg: "Incorrect phone or password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect phone or password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports.searchUser = async (req, res, next) => {
  try {
    const searchKey = req.params.keyword;
    const users = await User.find({
      username: { $regex: ".*" + searchKey + ".*", $options: "i" },
    });
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports.addSentInvitation = async (req, res, next) => {
  try {
    const from = req.body.from;
    const to = req.body.to;
    const userData = await User.findByIdAndUpdate(from, {
      $push: { sentInvitations: to },
    });
    return res.json(userData.sentInvitations);
  } catch (error) {
    next(error);
  }
};

module.exports.acceptFriend = async (req, res, next) => {
  try {
    const currentUser = req.body.currentUser;
    const currentChat = req.body.currentChat;
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { listFriends: currentChat._id },
      $pull: { sentInvitations: currentChat._id },
    });
    await User.findByIdAndUpdate(currentChat._id, {
      $push: { listFriends: currentUser._id },
      $pull: { sentInvitations: currentUser._id },
    });
    return res.json("Add friend successfully");
  } catch (error) {
    next(error);
  }
};
module.exports.denyAddFriend = async (req, res, next) => {
  try {
    const from = req.body.from;
    const to = req.body.to;
    await User.findByIdAndUpdate(from, {
      $pull: { sentInvitations: to },
    });
    return res.json("Deny invitation successfully");
  } catch (error) {
    next(error);
  }
};
