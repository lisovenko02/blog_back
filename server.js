import mongoose from 'mongoose'
import app from './app.js'

const { DB_HOST } = process.env

mongoose.set('strictQuery', true)

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(4000)
    console.log('Database connection successful')
  })
  .catch((error) => {
    process.exit(1)
  })
