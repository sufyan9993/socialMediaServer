import mongoose from "mongoose";

export const ConnectDB = (URL) => {
    mongoose.connect(URL).then((res)=>{
        console.log('successfully connected database')
    })
    .catch((err)=>{
        console.error("MongoDB Error: ", err);
    })
}

