import { getStorage, getDownloadURL, ref, uploadBytesResumable, deleteObject } from 'firebase/storage'
import firebaseConfig from '../config/firebase.config.js'
import { initializeApp } from 'firebase/app'

initializeApp(firebaseConfig)
const storage = getStorage()

export const GetImageUrl = async (req, res, next) => {
    try {
        if (req.file) {
            const path = req.path.split('/')[req.path.split('/').length - 1]
            const storageRef = ref(storage, `${path === 'AddPost' ? 'UsersPost' : 'UsersProfile'}/${Date.now() + req.file.originalname}`)
            const metaData = {
                contentType: req.file.mimetype
            }
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metaData)
            const downloadUrl = await getDownloadURL(snapshot.ref)
            req.ImageURL = downloadUrl
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

export const DeleteImage = async (imageUrl) => {
    try {
        // Parse the image URL to extract the path of the image in storage
        let imagePath = imageUrl.split('?')[0].split('/')
        imagePath = imagePath[imagePath.length - 1];
        imagePath = decodeURIComponent(imagePath)

        // Decode the URL-encoded path
        const decodedPath = decodeURIComponent(imagePath);

        console.log(decodedPath);

        // Create a reference to the image in storage   
        const imageRef = ref(storage, decodedPath)

        // Delete the image from storage
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Error deleting image:', error.message);
        throw error
    }
};
