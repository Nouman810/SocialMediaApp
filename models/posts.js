const router = require('express').Router()
const Post = require('../models/Post');
const User = require('../models/User');

//create a post
router.post('/', async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost)

    } catch (err) {
        res.status(500).json(err)
    }
})

//Update a post
router.put('/update/:id', async (req, res) => {

    const post = await Post.findById(req.params.id)
    try {
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json({ message: "Your Post has been updated" })

        } else {
            res.status(403).json({ mssage: "you can only update your post  " })
        }

    } catch (err) {
        res.status(500).json(err)
    }
})

//Delete a post
router.delete('/:id', async (req, res) => {

    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId || req.body.isAdmin) {

            await Post.deleteOne();
            res.status(200).json({ message: "Your Post has been deleted" })
        } else {
            res.status(403).json({ mssage: "you can only deleted your post" })
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

// Like/dislike the post
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json({ message: "The Post has been liked" })

        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json({ message: "The Post has been disliked" })
        }

    } catch (err) {
        res.status(500).json(err)
    }
})

//Get a post by id
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post)

    } catch (err) {
        res.status(500).json(err)
    }
})

//Get a post by id
router.get('/timeline/all', async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId)
        const userPosts = await Post.find({ userId: currentUser._id })
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({userId: friendId})
            })
        )
        res.json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err)
    }
})


module.exports = router;