import express from 'express'
import { getUsersFollower, getUsersFollowing, getSearchedUser, followUser, unSavePost, updateProfile, getUserByUsername, getUserPostByUsername, getUserSensitiveData, savePost, getSavedPost, unfollowUser } from '../controller/userController.js'
import { verifyUser } from '../middleWare/Authentication.js'
import { upload } from '../middleWare/multer.js'
import { GetImageUrl } from '../middleWare/firebaseImage.js'
const userRouter = express.Router()

userRouter.get('/:username', getUserByUsername)
userRouter.get('/search/:username', getSearchedUser)
userRouter.get('/:username/AllData', getUserSensitiveData)
userRouter.get('/Posts/:username', getUserPostByUsername)

userRouter.get('/:username/follower', getUsersFollower)
userRouter.get('/:username/following', getUsersFollowing)

userRouter.put('/:userId/savePost', verifyUser, savePost)
userRouter.put('/:userId/unSavePost', verifyUser, unSavePost)
userRouter.get('/savedPosts/:username', verifyUser, getSavedPost)

userRouter.put('/follow', verifyUser, followUser)
userRouter.put('/unfollow', verifyUser, unfollowUser)

userRouter.put('/:username/updateProfile', verifyUser, upload.single('file'), GetImageUrl, updateProfile)



export default userRouter