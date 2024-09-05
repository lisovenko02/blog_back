import HttpError from '../helpers/HttpError.js'
import catchAsync from '../helpers/catchAsync.js'
import { Posts } from '../schemas/postsSchema.js'
import { User } from '../schemas/userSchema.js'
import { Comment } from '../schemas/commentSchema.js'
import cloudinary from '../helpers/cloudinary.js'

export const createPost = catchAsync(async (req, res) => {
  const { name, _id: author, avatarURL: authorAvatar } = req.user

  let imgURL =
    'https://res.cloudinary.com/dazy48wet/image/upload/v1709419632/samples/landscapes/nature-mountains.jpg'

  if (req.file) {
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      allowed_formats: ['jpg', 'png'],
    })

    imgURL = uploadedImage.url
  }

  const result = await Posts.create({
    ...req.body,
    name,
    author,
    imgURL,
    authorAvatar,
  })

  await User.findByIdAndUpdate(author, {
    $push: { posts: result._id },
  })

  res.status(201).json(result)
})

export const getAllPosts = catchAsync(async (req, res) => {
  const posts = await Posts.find().sort('-createdAt')
  const popularPosts = await Posts.aggregate([
    {
      $addFields: {
        likesLength: { $size: '$likes' },
      },
    },
    {
      $sort: { likesLength: -1 },
    },
    {
      $limit: 5,
    },
  ])
  if (!posts) {
    return res.json({ message: 'Posts not found' })
  }

  res.json({ posts, popularPosts })
})

export const getOnePost = catchAsync(async (req, res) => {
  const { id } = req.params

  const result = await Posts.findById(id)

  if (!result) {
    throw HttpError(404, 'Post not found')
  }

  res.json(result)
})

export const getUserPosts = catchAsync(async (req, res) => {
  const { id } = req.params
  if (id.length !== 24) {
    throw HttpError(404, 'User not found')
  }

  const user = await User.findById(id)
  if (!user) {
    throw HttpError(404, 'User not found')
  }

  const postsList = await Promise.all(
    user.posts.map((post) => {
      return Posts.findById(post._id)
    })
  )

  res.json(postsList.reverse())
})

export const togglePostLike = catchAsync(async (req, res) => {
  const { _id: userId } = req.user
  const { id: postId } = req.params

  const findPost = await Posts.findById(postId)

  if (!findPost) {
    throw HttpError(404, 'Post not found')
  }

  if (!userId) {
    throw HttpError(404, 'User not found')
  }

  if (!findPost.likes.includes(userId)) {
    await Posts.findByIdAndUpdate(postId, {
      $push: { likes: userId },
    })
  } else {
    await Posts.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
    })
  }

  const findPosts = await Posts.findById(postId)

  res.json(findPosts.likes)
})

export const deleteOnePost = catchAsync(async (req, res) => {
  const { id: postId } = req.params
  const { _id: userId } = req.user

  const deleteOnPosts = await Posts.findByIdAndDelete(postId)

  if (!deleteOnPosts) {
    throw HttpError(404, 'Post not found')
  }
  await User.findByIdAndUpdate(userId, {
    $pull: { posts: postId },
  })

  res.json(deleteOnPosts)
})

export const updatePost = catchAsync(async (req, res) => {
  const { id } = req.params

  let imgURL

  if (req.file) {
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      allowed_formats: ['jpg', 'png'],
      folder: 'home/postImage',
    })

    imgURL = uploadedImage.url
  }

  const result = await Posts.findByIdAndUpdate(
    id,
    {
      ...req.body,
      imgURL,
    },
    { new: true }
  )

  res.json(result)
})

export const getPostComments = catchAsync(async (req, res) => {
  const { id: postId } = req.params

  const posts = await Posts.findById(postId)

  const commentList = await Promise.all(
    posts.comment.map((post) => {
      return Comment.findById(post._id)
    })
  )

  res.json(commentList)
})

export const deleteOneComment = catchAsync(async (req, res) => {
  const { postId, commentId } = req.params

  const deleteOnComment = await Comment.findByIdAndDelete(commentId)

  if (!commentId) {
    throw HttpError(404, 'Comment not found')
  }

  await Posts.findByIdAndUpdate(postId, {
    $pull: { comment: commentId },
  })

  res.json(deleteOnComment)
})
