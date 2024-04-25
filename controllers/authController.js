import catchAsync from "../helpers/catchAsync.js";
import { User } from "../schemas/userSchema.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";

dotenv.config();

const { REFRESH_KEY, ACCESS_KEY } = process.env;

export const register = catchAsync(async(req,res) => {
    const { email, password } = req.body;

    const user = await User.findOne({email});
    if(user) {
        throw HttpError(409, "Email is already in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const avatarURL = 'https://w7.pngwing.com/pngs/867/134/png-transparent-giant-panda-dog-cat-avatar-fox-animal-tag-mammal-animals-carnivoran-thumbnail.png';
    
    const newUser = await User.create({
        ...req.body,
        password: hashPassword,
        avatarURL,
    });

    const payload = { id: newUser._id };

    const accessToken = jwt.sign(payload, ACCESS_KEY, { expiresIn: '45m' });
    const refreshToken = jwt.sign(payload, REFRESH_KEY, {expiresIn: "23h"});

    await User.findByIdAndUpdate(newUser._id, {refreshToken});
    

    res.status(201).json({
        email: newUser.email,
        name: newUser.name,
        accessToken,
        refreshToken
    })
});

export const login = catchAsync(async(req,res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password is wrong");
    };

    const comparePassword = await bcrypt.compare(password, user.password);
    if(!comparePassword) {
        throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
        id: user._id
    };

    const accessToken = jwt.sign(payload, ACCESS_KEY, { expiresIn: '45m' });
    const refreshToken = jwt.sign(payload, REFRESH_KEY, {expiresIn: "23h"});

    await User.findByIdAndUpdate(user._id, {refreshToken});

    res.json({
        avatar: user.avatarURL,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken
    })
});

export const logout = catchAsync(async(req, res) => {
    const {id} = req.user;
    await User.findByIdAndUpdate(id, {refreshToken: ""});

    res.status(204).json()
});

export const getCurrent = catchAsync(async(req,res) => {
    console.log(req.user)
})

export const refresh = catchAsync(async(req,res) => {
    const { refreshToken: token } = req.body;

    const { id } = jwt.verify(refreshToken, REFRESH_KEY);

    const isExist = await User.findOne({refreshToken: token})
    if (!isExist) {
        throw HttpError(403, "Token invalid");
    }
    
    const payload = { id };
    const accessToken = jwt.sign(payload, ACCESS_KEY, { expiresIn: "45m" });
    const refreshToken = jwt.sign(payload, REFRESH_KEY, { expiresIn: "23h" });

    await User.findByIdAndUpdate(id, { refreshToken });

    res.json({
        accessToken,
        refreshToken,
      })
});
