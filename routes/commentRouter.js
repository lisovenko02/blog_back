import {
  createComment,
  updateComment,
} from '../controllers/commentsController.js'
import isValidId from '../helpers/isValidId.js'
import authenticate from '../middlewares/authenticate.js'
import express from 'express'

const commentRouter = express.Router()

commentRouter.post('/:id', authenticate, isValidId, createComment)

commentRouter.patch('/:id', authenticate, isValidId, updateComment)

export default commentRouter
