import { getStorage, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import firebaseConfig from '../config/firebase.config.js'
import { initializeApp } from 'firebase/app'

initializeApp(firebaseConfig)
const storage = getStorage()

const GetImageUrl = async (req, res, next) => {
    try {
        if (req.file) {
            const storageRef = ref(storage, `socialize/${Date.now() + req.file.originalname}`)
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

export default GetImageUrl