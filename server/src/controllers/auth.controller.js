import { cookieOptions } from "../constant.js";
import User from "../models/user.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import { uploadFile } from "../utils/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    // generate Access and Refresh Token,
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update refresh Token into db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // return Access and Refresh Token
    return { accessToken, refreshToken };
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while generating tokens",
    });
  }
};

const registerUser = AsyncHandler(async (req, res) => {
  const { name, email, password, bio } = req.body;
  const file = req.file;

  if ([name, email, password].some((field) => !(field && field.trim()))) {
    return res.status(400).json({
      success: false,
      message: "All fields are required...",
    });
  }

  const isUserExist = await User.find({ email });
  if (isUserExist.length > 0) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email",
    });
  }

  let imageUrl = null;
  if (file) {
    const filePath = path.join(
      __dirname,
      "../public/uploads/",
      file.filename
    );
    try {
      const uploadedFileInfo = await uploadFile(
        filePath,
        file.filename
      );
      imageUrl = uploadedFileInfo.url;
      // console.log(imageUrl)
    } catch (error) {
      console.log(error);
    } finally {
      await fs.unlink(filePath);
    }
  }

  const user = await User.create({
    name: name,
    email: email,
    password: password,
    profilePic: imageUrl ?? "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    bio: bio ?? "I am using NextTalk only",
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User creation failed ",
    });
  }

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating user",
    });
  }

  return res.status(200).json({
    success: true,
    messagge: "User registered successfully",
    user: createdUser,
  });
});

const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => !(field && field.trim()))) {
    return res.status(400).json({
      success: false,
      message: "All fields are required...",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  const checkPassword = await user.isPasswordCorrect(password);

  if (!checkPassword) {
    return res.status(400).json({
      success: false,
      message: "Incorrect password",
      user: null,
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select("-password").lean();

  res.setHeader("Authorization", `Bearer ${accessToken}`);

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      success: true,
      message: "User logged in successfully",
      user: loggedInUser,
    });
});

export { registerUser, loginUser };
