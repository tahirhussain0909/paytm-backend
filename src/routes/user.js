const express = require('express')
const zod = require('zod')
const jwt = require('jsonwebtoken')

const { User, Account } = require('../db/db')
const { JWT_SECRET } = require('../secrets/config')
const { authMiddleware } = require('../middlewares/authMiddleware')

const signupBody = zod.object({
  firstName: zod.string(),
  lastName: zod.string(),
  username: zod.string().email(),
  password: zod.string(),
})

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
})

const updateBody = zod.object({
  firstName: zod.string().optional(),
  lastNane: zod.string().optional(),
  password: zod.string().optional(),
})

const router = express.Router()

// signup route
router.post('/signup', async (req, res) => {
  const { success } = signupBody.safeParse(req.body)
  if (!success) {
    return res.status(411).json({
      message: 'Incorrect inputs',
    })
  }

  const existingUser = await User.findOne({
    username: req.body.username,
  })
  if (existingUser) {
    return res.status(411).json({
      message: 'Email already taken',
    })
  }

  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password,
  })
  const userId = user._id

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  })

  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
  )

  res.json({
    message: 'User created successfully',
    token: `Bearer ${token}`,
  })
})

// sign in route
router.post('/signin', async (req, res) => {
  const { success } = signinBody.safeParse(req.body)
  if (!success) {
    return res.status(411).json({
      message: 'Error while logging in',
    })
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  })
  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
    )

    res.json({
      token: `Bearer ${token}`,
    })
  }

  res.status(411).json({
    message: 'Error while logging in',
  })
})

// update route
router.put('/', authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body)
  if (!success) {
    res.status(411).json({
      message: 'Error while updating information',
    })
  }

  await User.updateOne(
    {
      _id: req.userId,
    },
    req.body,
  )

  res.status(200).json({
    message: 'Updated successfully',
  })
})

router.get('/bulk', async (req, res) => {
  const filter = req.query.filter || ''
  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  })

  res.status(200).json({
    users: users.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      _id: user._id,
    })),
  })
})

module.exports = router
