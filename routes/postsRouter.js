import express from "express";
import { createPost, deleteOneComment, deleteOnePost, getAllPosts, getMyPosts, getOnePost, getPostComments, updatePost } from "../controllers/postsController.js";
import authenticate from "../middlewares/authenticate.js";
import isValidId from "../helpers/isValidId.js";
import upload from "../middlewares/upload.js";

const postsRouter = express.Router();

postsRouter.post('/', authenticate, upload.single("postIMG"), createPost)

postsRouter.get('/', authenticate, getAllPosts)

postsRouter.get('/:id', authenticate, isValidId , getOnePost)

postsRouter.get('/comment/:id', authenticate, isValidId, getPostComments)

postsRouter.get('/user/me', authenticate, getMyPosts);

postsRouter.patch('/:id', authenticate, isValidId, upload.single("postIMG") , updatePost)

postsRouter.delete('/:id', authenticate, isValidId ,deleteOnePost);

postsRouter.delete('/:postId/comment/:commentId', authenticate, deleteOneComment)

export default postsRouter