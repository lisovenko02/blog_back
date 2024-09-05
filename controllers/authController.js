import catchAsync from '../helpers/catchAsync.js'
import { User } from '../schemas/userSchema.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import HttpError from '../helpers/HttpError.js'
import cloudinary from '../helpers/cloudinary.js'

dotenv.config()

const { REFRESH_KEY, ACCESS_KEY } = process.env

export const register = catchAsync(async (req, res) => {
  const { email, password, name } = req.body

  const user = await User.findOne({ email })
  if (user) {
    throw HttpError(409, 'Email is already in use')
  }

  const hashPassword = await bcrypt.hash(password, 10)

  const avatarURL =
    'https://banner2.cleanpng.com/20180402/ojw/kisspng-united-states-avatar-organization-information-user-avatar-5ac20804a62b58.8673620215226654766806.jpg'

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  })

  const payload = { id: newUser._id }

  const accessToken = jwt.sign(payload, ACCESS_KEY, { expiresIn: '45m' })
  const refreshToken = jwt.sign(payload, REFRESH_KEY, { expiresIn: '23h' })

  await User.findByIdAndUpdate(newUser._id, { refreshToken })

  res.status(201).json({
    email: newUser.email,
    name: newUser.name,
    avatarURL: newUser.avatarURL,
    _id: newUser._id,
    accessToken,
  })
})

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    throw HttpError(401, 'Email or password is wrong')
  }

  const comparePassword = await bcrypt.compare(password, user.password)
  if (!comparePassword) {
    throw HttpError(401, 'Email or password is wrong')
  }

  const payload = {
    id: user._id,
  }

  const accessToken = jwt.sign(payload, ACCESS_KEY, { expiresIn: '45m' })
  const refreshToken = jwt.sign(payload, REFRESH_KEY, { expiresIn: '23h' })

  await User.findByIdAndUpdate(user._id, { refreshToken })

  res.json({
    avatarURL: user.avatarURL,
    name: user.name,
    email: user.email,
    _id: user._id,
    accessToken,
  })
})

export const logout = catchAsync(async (req, res) => {
  const { id } = req.user
  await User.findByIdAndUpdate(id, { accessToken: '' })

  res.status(204).json()
})

export const getCurrent = catchAsync(async (req, res) => {
  const { _id, name, email, avatarURL, posts } = req.user

  res.json({ _id, name, email, avatarURL, posts })
})

export const getUser = catchAsync(async (req, res) => {
  const { id } = req.params
  if (id.length !== 24) {
    throw HttpError(404, 'User not found')
  }

  const user = await User.findById(id)
  if (!user) {
    throw HttpError(404, 'User not found')
  }

  res.json({
    name: user.name,
    email: user.email,
    avatarURL: user.avatarURL,
    userId: user._id,
  })
})

export const refresh = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body

  const { id } = jwt.verify(refreshToken, REFRESH_KEY)

  const isExist = await User.findOne({ refreshToken: token })
  if (!isExist) {
    throw HttpError(403, 'Token invalid')
  }

  const payload = { id }
  const accessToken = jwt.sign(payload, ACCESS_KEY, { expiresIn: '45m' })
  const refreshToken = jwt.sign(payload, REFRESH_KEY, { expiresIn: '23h' })

  await User.findByIdAndUpdate(id, { refreshToken })

  res.json({
    accessToken,
  })
})

export const editProfile = catchAsync(async (req, res) => {
  const { id } = req.user
  const { password, name, email } = req.body

  const user = await User.findOne({ _id: id })

  if (!user) {
    throw HttpError(404)
  }

  let hashPassword
  if (password) {
    hashPassword = await bcrypt.hash(password, 10)
  }

  let avatarURL

  if (req.file) {
    const uploadedImageAvatar = await cloudinary.uploader.upload(
      req.file.path,
      {
        allowed_formats: ['jpg', 'png'],
        folder: 'home/avatars',
      }
    )

    avatarURL = uploadedImageAvatar.url
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      password: hashPassword,
      avatarURL,
      name,
      email,
    },
    { new: true }
  )

  if (!updatedUser) {
    throw HttpError(404)
  }

  res.json(updatedUser)
})
