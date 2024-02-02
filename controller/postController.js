import postModel from "../model/postModel.js";
import userModel from "../model/userModel.js";

export const getAllPost = async (req, res) => {
    try {
        const Posts = await postModel.find().populate('user', 'username profilePhoto').sort({ createdAt: -1 })
        const newPosts = Posts.map((post) => {
            const profilePhoto = `data:${post.user.profilePhoto.contentType};base64,${post.user.profilePhoto.data.toString('base64')}`
            const image = `data:${post.image.contentType};base64,${post.image.data.toString('base64')}`
            const likes = post.likes.map(data => data.user)
            return { ...post._doc, likes, image, user: { ...post.user._doc, profilePhoto } }
        })
        res.status(200).json({ success: true, posts: newPosts });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message })
    }
}


export const addPost = async (req, res) => {
    try {
        let { title, tags, caption } = req.body
        const newPost = new postModel({
            title,
            caption,
            ...(tags.trim() !== '' && { tags: tags.split(',') }),
            createdAt: new Date(),
            image: {
                data: req.file.buffer,
                contentType: 'image/png'
            },
            user: req.user._id
        })
        const savedPost = await newPost.save()
        await userModel.findByIdAndUpdate(req.user._id, {
            $push: { posts: savedPost._id }
        })
        res.status(201).json({ success: true, post: savedPost })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, error: error.message })
    }
}

export const getSinglePost = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id)
        res.status(201).json({ success: true, post })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, error: error.message })
    }
}


export const getPostLikesData = async (req, res) => {
    try {
        const PostId = req.params.postId
        const post = await postModel.findById(PostId).populate('likes.user', 'username fullname profilePhoto')
        let likes = []
        if (post.likes.length > 0) {
            likes = post.likes.map((data) => {
                const url = `data:${data.user.profilePhoto.contentType};base64,${data.user.profilePhoto.data.toString('base64')}`
                return { timestamp: data.timestamp, ...data.user._doc, profilePhoto: url  }
            })
        }
        res.status(201).json({ success: true, likes })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message })
    }
}
export const likePost = async (req, res) => {
    try {
        const postId = req.params.postId
        const { userId } = req.body
        await postModel.findByIdAndUpdate(postId, {
            $push: {
                likes: {
                    user: userId,
                    timestamp: new Date()
                }
            },
        })
        res.status(201).json({ success: true, message: "you Liked the post" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, error: error.message })
    }
}
export const removeLike = async (req, res) => {
    try {
        const postId = req.params.postId
        const { userId } = req.body
        await postModel.findByIdAndUpdate(postId, {
            $pull: {
                likes: {
                    user: userId
                }
            },
        })
        res.status(201).json({ success: true, message: "you Un-Like the post" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, error: error.message })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params
        const { user } = await postModel.findById(postId)
        await postModel.findByIdAndDelete(postId)
        await userModel.findByIdAndUpdate(user, {
            $pull: {
                posts: postId
            }
        })
        res.status(200).json({ success: true, message: 'Successfully deleted your Post' })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message })
    }
}
