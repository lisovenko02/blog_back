import { Schema, model } from "mongoose";
import handleMongooseError from "../helpers/handleMongooseError.js";

const commentSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    comment: {
        type: String,
        required: true
    },
}, {versionKey: false, timestamps: true});

commentSchema.post("save", handleMongooseError);

export const Comment = model('comment', commentSchema)