const User = require('../models/User')
const router = require('express').Router()
const bcrypt = require('bcrypt')

//update a user
router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (err) {
                res.status(500).json(err)
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json('user has been updated')
        } catch (err) {
            res.status(500).json(err)
        }

    } else {
        res.status(403).json({ message: 'You can update only your account' })
    }
})

//delete a user
router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json('User has been deleted successfully')
        } catch (err) {
            res.status(500).json(err)
        }

    } else {
        res.status(403).json({ message: 'You can delete only your account' })
    }
})

//get a user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const { password, updatedAt, ...other } = user._doc
        res.status(200).json(other)

    } catch (err) {
        res.status(500).json({ message: 'Internal server error' })
    }
})

//follow a user
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            //user that send follow request
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {

                // Retrieve the username of the user being followed
                const followedUser = user.username
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                return res.status(200).json({ message: `You have successfully followed ${followedUser}` });
            } else {
                return res.status(403).json({ message: 'You already follow this user' });
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json({ message: 'You cannot follow yourself' });
    }
});

//unfollow a user
router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);

            //user that send unfollow request
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {

                // Retrieve the username of the user being followed
                const unfollowedUser = user.username
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                return res.status(200).json({ message: `You unfollowed ${unfollowedUser}` });
            } else {
                return res.status(403).json({ message: 'You already not following this user' });
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json({ message: 'You cannot unfollow yourself' });
    }
});

module.exports = router