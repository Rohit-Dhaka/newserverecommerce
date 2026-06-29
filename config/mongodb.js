import mongoose from "mongoose";


async function connectDB(){
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("App connect to database")
}

export default connectDB;