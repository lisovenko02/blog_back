import handleMongooseError from "../helpers/handleMongooseError.js";
import { Schema, model } from "mongoose";

const postsSchema = new Schema ({
    title: {
        type: String,
    },
    text: {
        type: String,
    },
    imgURL: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    authorAvatar : {
        type: String,
        required: true     
    },
    name: {
        type: String,
        required: true
    },
    likes: {
        type: Array,
    },
    views: {
        type: Number,
        default: 0
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }],
}, {versionKey: false, timestamps: true});

postsSchema.post("save", handleMongooseError);

export const Posts = model("post", postsSchema)