import JWT from "jsonwebtoken";
import mongoose from "mongoose";

const schema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profilePhoto: {
        data: Buffer,
        contentType: String
    },
    bio: { type: String },
    follower: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'  //referencing to the User model
        }
    ],
    following: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'  //referencing to the User model
        }
    ],
    posts: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Post'  //referencing to the Post model
        }
    ],
    savedPosts: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Post'  //referencing to the Post model
        }
    ],
    createdAt: { type: Date, default: Date.now() },
    tokens: [
        { token: { type: String, require: true } }
    ]
})


schema.method('generateToken', function () {
    const token = JWT.sign({ _id: this._id }, process.env.SECRET_KEY)
    this.tokens = this.tokens.concat({ token: token })
    this.save()
    return token
})


const userModel = mongoose.model('User', schema)

export default userModel