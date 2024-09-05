import HttpError from '../helpers/HttpError.js'
import jwt from 'jsonwebtoken'
import { User } from '../schemas/userSchema.js'

const { ACCESS_KEY } = process.env

const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers
  const [bearer, token] = authorization.split(' ')

  if (bearer !== 'Bearer') {
    next(HttpError(401))
  }

  try {
    const { id } = jwt.verify(token, ACCESS_KEY)
    const user = await User.findById(id)

    if (!user || !user.refreshToken) {
      next(HttpError(401))
    }

    req.user = user

    next()
  } catch {
    next(HttpError(401))
  }
}

export default authenticate
