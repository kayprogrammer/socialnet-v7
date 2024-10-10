import { Types } from "mongoose";
import { ValidationErr } from "../config/handlers";
import { IUser, User } from "../models/accounts";
import { Chat, IChat } from "../models/chat";
import { shortUserPopulation } from "./users";

const handleGroupUsersAddOrRemove = async (chat: IChat, usernamesToAdd: string[] | null, usernamesToRemove: string[] | null): Promise<IChat> => {
    let originalExistingUserIDs = chat.users.map(user => user._id)
    let expectedUserTotal = originalExistingUserIDs.length
    let usersToAdd: IUser[] = []
    if (usernamesToAdd){
        usersToAdd = await User.find({ username: { $in: usernamesToAdd }, _id: { $nin: originalExistingUserIDs.concat([chat.owner as Types.ObjectId]) } })
        expectedUserTotal += usernamesToAdd.length
    }
    let usersToRemove: IUser[] = []
    if (usernamesToRemove) {
        if (originalExistingUserIDs.length === 0) throw new ValidationErr("usernamesToRemove", "No users to remove")
        usersToRemove = await User.find({ username: { $in: usernamesToRemove }, _id: { $in: originalExistingUserIDs, $ne: chat.owner } })
        expectedUserTotal -= usersToRemove.length
    }
    if (expectedUserTotal > 99) throw new ValidationErr("usernamesToAdd", "99 users limit reached")
    let userIDsToAdd = usersToAdd.map(user => user._id)
    let userIDsToRemove = usersToRemove.map(user => user._id)
    await Chat.findOneAndUpdate(
        { _id: chat._id },
        {
            $addToSet: { users: { $each: userIDsToAdd } }, // Add new userIDs without duplicates
        },
    )
    chat = await Chat.findOneAndUpdate(
        { _id: chat._id },
        {
            $pull: { users: { $in: userIDsToRemove } }     // Remove specified userIDs
        },
        { new: true }
    ).populate([shortUserPopulation("users"), "image"]) as IChat
    return chat
}

export { handleGroupUsersAddOrRemove }