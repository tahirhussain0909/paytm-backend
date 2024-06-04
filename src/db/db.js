const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const argon2 = require('argon2')

mongoose.connect(
  'mongodb+srv://tahirhussain5112:OPsZBPX1gYkGwfqc@cluster0.ezdmp7r.mongodb.net/paytmUser',
)

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
})

const accountSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
})

userSchema.methods.createHash = async function (plaintextPassword) {
  return await argon2.hash(plaintextPassword)
}

userSchema.methods.validatePassword = async function (candidatePassword) {
  return await argon2.verify(this.password_hash, candidatePassword)
}

const User = mongoose.model('User', userSchema)
const Account = mongoose.model('Account', accountSchema)

module.exports = {
  User,
  Account,
}
