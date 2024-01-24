const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

const Thought = require('../models/Thought')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const thoughts = await Thought.find({ user: req.user.id }).lean()
    res.render('dashboard', {
      name: req.user.firstName,
      thoughts,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})
router.get('/about', (req, res) => {
  res.render('about')
}
)


module.exports = router
