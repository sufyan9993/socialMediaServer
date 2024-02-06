import express from 'express'
import { addPost, deletePost, getAllPost, getPostLikesData, getSinglePost, likePost, removeLike } from '../controller/postController.js'
import { verifyUser } from '../middleWare/Authentication.js'
import { upload } from '../middleWare/multer.js'
import GetImageUrl from '../middleWare/firebaseImage.js'



const postRouter = express.Router()

postRouter.get('/GetSinglePost/:id', getSinglePost)
postRouter.get('/GetAllPost', getAllPost)
postRouter.post('/AddPost', verifyUser, upload.single('file'), GetImageUrl, addPost)
postRouter.put('/:postId/like', verifyUser, likePost)
postRouter.get('/:postId/getLikeData', getPostLikesData)
postRouter.delete('/:postId/deletePost', verifyUser, deletePost)
postRouter.put('/:postId/removeLike', verifyUser, removeLike)



export default postRouter