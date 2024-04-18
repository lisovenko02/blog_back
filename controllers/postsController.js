import { Mongoose } from "mongoose";
import HttpError from "../helpers/HttpError.js";
import catchAsync from "../helpers/catchAsync.js";
import { Posts } from "../schemas/postsSchema.js";
import { User } from "../schemas/userSchema.js";
import { Comment } from "../schemas/commentSchema.js";

export const createPost = catchAsync(async(req,res) => {
    const {name,_id: author} = req.user;

    let imgURL = 'https://res.cloudinary.com/dazy48wet/image/upload/v1709419632/samples/landscapes/nature-mountains.jpg';

    if(req.file) {
        imgURL = req.file.path
    }

    const result = await Posts.create({...req.body, name, author, imgURL});

    await User.findByIdAndUpdate(author, {
        $push: {posts: result._id}
    })

    res.status(201).json(result);
});

export const getAllPosts = catchAsync(async(req,res) => {
    const posts = await Posts.find().sort('-createdAt')
    const popularPosts = await Posts.find().limit(5).sort('-views')

    if(!posts) {
        return res.json({message: "Posts not found"})
    }

    res.json({posts, popularPosts})
});

export const getOnePost = catchAsync(async(req,res) => {
    const {id} = req.params;

    const result = await Posts.findById(id);

    if(!result) {
        throw HttpError(404, "Post not found");
    }

    res.json(result)
});

export const getMyPosts = catchAsync(async(req,res) => {
    const {_id} = req.user;
    
    const user = await User.findById(_id);

    const postsList = await Promise.all(
        user.posts.map(post => {
            return Posts.findById(post._id)
        })
    )
    res.json(postsList)
});

export const deleteOnePost = catchAsync(async(req,res) => {
    const {id} = req.params;
    const {_id: userId} = req.user;

    // 

    const deleteOnPosts = await Posts.findByIdAndDelete(id);
    
    if(!deleteOnPosts) {
        throw HttpError(404, "Post not found");
    }
    await User.findByIdAndUpdate(userId, {
        $pull: {posts: id}
    })
    res.json(deleteOnPosts)
});

export const updatePost = catchAsync(async(req,res) => {
    const {id} = req.params;
    
    let imgURL;

    if(req.file) {
        imgURL = req.file.path
    }

    const result = await Posts.findByIdAndUpdate(id, {
        ...req.body,
        imgURL
    },{ new: true });

    res.json(result)

});

export const getPostComments = catchAsync(async(req,res) => {
    const {id: postId} = req.params;

    const posts = await Posts.findById(postId);

    const commentList = await Promise.all(
        posts.comment.map(post => {
            return Comment.findById(post._id)
        })
    )
    
    res.json(commentList)
});

export const deleteOneComment = catchAsync(async(req,res) => {
    const {postId, commentId} = req.params;

    const deleteOnComment = await Comment.findByIdAndDelete(commentId);

    if(!commentId) {
        throw HttpError(404, "Comment not found");
    };

    await Posts.findByIdAndUpdate(postId, {
        $pull: {comment: commentId}
    })

    res.json(deleteOnComment)

});
