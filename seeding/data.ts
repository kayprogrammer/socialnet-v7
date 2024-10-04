import mongoose from "mongoose"
import ENV from "../config/config"
import { createUser } from "../managers/users"
import { User } from "../models/accounts"
import SiteDetail from "../models/general"
import seedGeoData from "./geo"
import connectDB from "../config/db"

const createSuperuser = async () => {
    let userDoc = { email: ENV.FIRST_SUPERUSER_EMAIL, password: ENV.FIRST_SUPERUSER_PASSWORD, firstName: "Test", lastName: "Admin"}
    const existingUser = await User.findOne({ email: userDoc.email })
    if (!existingUser) await createUser(userDoc, true, true)
}

const createClientUser = async () => {
    let userDoc = { email: ENV.FIRST_CLIENT_EMAIL, password: ENV.FIRST_CLIENT_PASSWORD, firstName: "Test", lastName: "Client"}
    const existingUser = await User.findOne({ email: userDoc.email })
    if (!existingUser) await createUser(userDoc, true)
}

const createData = async () => {
    console.log("GENERATING INITIAL DATA....")
    await connectDB()
    await createSuperuser()
    await createClientUser()
    await SiteDetail.getOrCreate({})
    await seedGeoData()
    mongoose.disconnect()
    console.log("INITIAL DATA GENERATED....")
}

createData()