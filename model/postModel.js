import mongoose from "mongoose";

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    title: { type: String, required: true },
    image: { type: String, required: true } ,
    caption: String,
    tags: Array,
    createdAt: { type: Date, default: Date.now() },
    saved: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    likes: [{
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        timestamp: { type: Date, default: Date.now() }

    }]
})

const postModel = mongoose.model('Post', schema)

export default postModel