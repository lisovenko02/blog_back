import catchAsync from "../helpers/catchAsync.js";
import { User } from "../schemas/userSchema.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";

dotenv.config();

const { SECRET_KEY } = process.env;

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
        avatarURL
    });

    res.status(201).json({
        email: newUser.email,
        name: newUser.name,
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

    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});

    await User.findByIdAndUpdate(user._id, {token});

    res.json({
        token,
        avatar: user.avatarURL,
        name: user.name,
        email: user.email
    })
});

export const logout = catchAsync(async(req, res) => {
    const {id} = req.user;
    await User.findByIdAndUpdate(id, {token: ""});

    res.status(204).json()
})
