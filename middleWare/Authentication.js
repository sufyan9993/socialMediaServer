import JWT from "jsonwebtoken"
import userModel from "../model/userModel.js"
export const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        const verify = JWT.verify(token, process.env.SECRET_KEY)
        const user = await userModel.findById(verify._id)
        if (user) {
            req.user = user
            return next()

        }
        else throw new Error('Authentication Failed')
    } catch (err) {
        return res.status(404).json({ success: false, message: err.message })
    }

}
