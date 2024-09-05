import HttpError from '../helpers/HttpError.js'
import catchAsync from '../helpers/catchAsync.js'
import { Comment } from '../schemas/commentSchema.js'
import { Posts } from '../schemas/postsSchema.js'

export const createComment = catchAsync(async (req, res) => {
  const { comment } = req.body
  const { id: postId } = req.params
  const { name, _id: author, avatarURL: authorAvatar } = req.user

  if (!comment) {
    throw HttpError(400, 'Comment cannot be empty')
  }

  const result = await Comment.create({
    comment,
    name,
    author,
    authorAvatar,
    postId,
  })

  await Posts.findByIdAndUpdate(postId, {
    $push: { comment: result._id },
  })

  res.status(201).json(result)
})

export const updateComment = catchAsync(async (req, res) => {
  const { id } = req.params
  const { comment } = req.body
  const result = await Comment.findByIdAndUpdate(
    id,
    {
      comment,
    },
    { new: true }
  )

  res.json(result)
})
