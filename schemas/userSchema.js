import Joi from "joi";
import { Schema, model } from "mongoose";
import handleMongooseError from "../helpers/handleMongooseError.js";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required:true
    },
    avatarURL: {
        type: String,
        required:true
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'posts',
        default: []
    }],
    token: {
        type: String
    }
}, { versionKey: false, timestamps: true });

userSchema.post("save", handleMongooseError);

export const registerSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required()
})

export const User = model("user", userSchema);
