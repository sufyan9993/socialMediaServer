import { DeleteImage } from "../middleWare/firebaseImage.js";
import postModel from "../model/postModel.js";
import userModel from "../model/userModel.js";
import bcrypt from 'bcrypt'


const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.log(error.message);
    }
};
const comparePassword = async (password, hashedPassword) => {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};
export const registerUser = async (req, res) => {
    try {
        const hashedPassword = await hashPassword(req.body.password);
        const newUser = new userModel({
            username: req.body.username,
            fullname: req.body.fullname,
            email: req.body.email,
            password: hashedPassword,
            profilePhoto: req.ImageURL
        })

        const user = await newUser.save()
        const { password, tokens, posts, createdAt, email, ...rest } = user._doc
        const jwtToken = user.generateToken()
        res.status(200).json({ success: true, message: 'Successfully Registered', token: jwtToken, userData: { ...rest } })

    } catch (error) {
        console.log(error.message);
        res.status(502).json({ success: false, message: 'Failed to register the user, try again' })
    }
}


export const loginUser = async (req, res) => {
    try {
        const { username } = req.body
        const userPass = req.body.password
        const user = await userModel.findOne({ username })
        if (!user) {
            throw new Error('Invalid credentials')
        }
        const isValidated = await comparePassword(userPass, user?.password)
        if (!isValidated) {
            throw new Error('Invalid credentials')
        } else {
            const { password, tokens, posts, createdAt, email, ...rest } = user._doc
            const jwtToken = user.generateToken()
            res.status(200).json({ success: true, message: 'successfully login', token: jwtToken, userData: { ...rest } })
        }

    } catch (error) {
        console.log(error.message);
        res.status(404).json({ success: false, message: error.message })
    }
}




export const getUserByUsername = async (req, res) => {
    try {
        const username = req.params.username
        const user = await userModel.findOne({ username: username })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        const { password, tokens, email, createdAt, ...rest } = user._doc
        res.status(200).json({ success: true, userData: { ...rest, posts: user.posts.length } });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message })
    }
}

export const getUserSensitiveData = async (req, res) => {
    try {
        const username = req.params.username
        const user = await userModel.findOne({ username: username })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        const { password, tokens, posts, createdAt, ...rest } = user._doc
        res.status(200).json({ success: true, userData: { ...rest } });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message })
    }
}

export const getUserPostByUsername = async (req, res) => {
    try {
        const username = req.params.username
        const user = await userModel.findOne({ username: username }).populate({
            path: 'posts',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'user',
                select: 'username profilePhoto'

            },

        })

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const newPosts = user.posts.map((post) => {
            const likes = post.likes.map(data => data.user)
            return { ...post._doc, likes }
        })
        res.status(200).json({ success: true, posts: newPosts });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message })
    }
}


export const updateProfile = async (req, res) => {
    try {

        const user = req.params.username
        const data = {
            ...req.body,
        }
        const userDB = await userModel.findOne({ username: user })
        if (req.body.password) {
            const isValidated = await comparePassword(req.body.password, userDB.password)
            if (!isValidated) {
                throw new Error("Invalid password")
            } else {
                data.password = await hashPassword(req.body.new_password)
            }
        }
        if (req.ImageURL) {
            data.profilePhoto = req.ImageURL
            DeleteImage(userDB.profilePhoto)
        }
        await userModel.findOneAndUpdate({ username: user }, data)
        const result = await userModel.findOne({ username: data.username || user })
        const { password, tokens, email, createdAt, ...rest } = result._doc
        res.status(200).json({ success: true, updatedUser: { ...rest, posts: result.posts.length } });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false, error: err.message })
    }
}


export const savePost = async (req, res) => {
    try {
        const { userId } = req.params
        const { postId } = req.body
        await userModel.findByIdAndUpdate(userId, {
            $push: {
                savedPosts: postId
            },
        })
        await postModel.findByIdAndUpdate(postId, {
            $push: {
                saved: userId
            }
        })
        res.status(201).json({ success: true, message: "you Saved the post" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, error: error.message })


    }

}

export const unSavePost = async (req, res) => {
    try {
        const { userId } = req.params
        const { postId } = req.body
        await userModel.findByIdAndUpdate(userId, {
            $pull: {
                savedPosts: postId
            },
        })
        await postModel.findByIdAndUpdate(postId, {
            $pull: {
                saved: userId
            }
        })
        res.status(201).json({ success: true, message: "you Saved the post" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, error: error.message })


    }

}

export const getSavedPost = async (req, res) => {
    try {
        const { username } = req.params

        let { savedPosts } = await userModel.findOne({ username }).populate({
            path: 'savedPosts',
            populate: {
                path: 'user',
                select: 'username profilePhoto'

            }
        })
        savedPosts = savedPosts.map(post => {
            const likes = post.likes.map(data => data.user)
            return { ...post._doc, likes }
        })

        res.status(201).json({ success: true, savedPosts: savedPosts })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, error: error.message })


    }

}


export const followUser = async (req, res) => {
    try {
        const { followingUserId } = req.body;
        const follower = req.user._id
        const user = await userModel.findByIdAndUpdate(followingUserId, {
            $push: {
                follower: follower
            }
        })
        await userModel.findByIdAndUpdate(follower, {
            $push: {
                following: followingUserId
            }
        })
        res.status(200).json({ success: true, message: `Now your are following ${user.username}` })
    } catch (error) {
        console.log(error.message);
        res.status(404).json({ success: false, message: error.message })
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const { followingUserId } = req.body;
        const follower = req.user._id
        const user = await userModel.findByIdAndUpdate(followingUserId, {
            $pull: {
                follower: follower
            }
        })
        await userModel.findByIdAndUpdate(follower, {
            $pull: {
                following: followingUserId
            }
        })
        res.status(200).json({ success: true, message: `you just ufollow ${user.username}` })
    } catch (error) {
        console.log(error.message);
        res.status(404).json({ success: false, message: error.message })
    }
}

export const getSearchedUser = async (req, res) => {
    try {
        const { username } = req.params
        let users = await userModel.find({
            username: {
                $regex: `${username}`,
                $options: 'i' // for case insensitive search
            }
        })
        users = users.map((user) => {
            const { username, _id, fullname, profilePhoto } = user._doc
            return { username, _id, fullname, profilePhoto }
        })
        res.status(200).json({ success: true, users })
    } catch (error) {
        console.log(error.message);
        res.status(404).json({ success: false, message: error.message })
    }
}

export const getUsersFollower = async (req, res) => {
    try {
        const { username } = req.params
        let { follower } = await userModel.findOne({ username }).populate('follower', 'username fullname profilePhoto')
        res.status(200).json({ success: true, users: follower })
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ success: false, message: error.message })
    }
}
export const getUsersFollowing = async (req, res) => {
    try {
        const { username } = req.params
        let { following } = await userModel.findOne({ username }).populate('following', 'username fullname profilePhoto')
        res.status(200).json({ success: true, users: following })
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ success: false, message: error.message })
    }
}
