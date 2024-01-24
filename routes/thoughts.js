const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Thought = require('../models/Thought')

// @desc    Show add page
// @route   GET /thoughts/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('thoughts/add')
})

// @desc    Process add form
// @route   POST /thoughts
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Thought.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all thoughts
// @route   GET /thoughts
router.get('/', ensureAuth, async (req, res) => {
  try {
    const thoughts = await Thought.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('thoughts/index', {
      thoughts,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single thought
// @route   GET /thoughts/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let thought = await Thought.findById(req.params.id).populate('user').lean()

    if (!thought) {
      return res.render('error/404')
    }

    if (thought.user._id != req.user.id && thought.status == 'private') {
      res.render('error/404')
    } else {
      res.render('thoughts/show', {
        thought,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /thoughts/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const thought = await Thought.findOne({
      _id: req.params.id,
    }).lean()

    if (!thought) {
      return res.render('error/404')
    }

    if (thought.user != req.user.id) {
      res.redirect('/thoughts')
    } else {
      res.render('thoughts/edit', {
        thought,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update thought
// @route   PUT /thoughts/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let thought = await Thought.findById(req.params.id).lean()

    if (!thought) {
      return res.render('error/404')
    }

    if (thought.user != req.user.id) {
      res.redirect('/thoughts')
    } else {
      thought = await Thought.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete thought
// @route   DELETE /thoughts/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let thought = await Thought.findById(req.params.id).lean()

    if (!thought) {
      return res.render('error/404')
    }

    if (thought.user != req.user.id) {
      res.redirect('/thoughts')
    } else {
      await Thought.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User thoughts
// @route   GET /thoughts/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const thoughts = await Thought.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('thoughts/index', {
      thoughts,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
