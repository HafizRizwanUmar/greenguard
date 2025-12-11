const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');

// @route   GET api/community
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const posts = await CommunityPost.find().sort({ date: -1 }).populate('authorId', 'name');
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const auth = require('../middleware/auth');

// @route   POST api/community
// @desc    Create a post
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const newPost = new CommunityPost({
            authorId: req.user.id,
            title: req.body.title,
            content: req.body.content
        });
        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
