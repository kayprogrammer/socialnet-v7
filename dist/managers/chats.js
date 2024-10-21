"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGroupUsersAddOrRemove = void 0;
const handlers_1 = require("../config/handlers");
const accounts_1 = require("../models/accounts");
const chat_1 = require("../models/chat");
const users_1 = require("./users");
const handleGroupUsersAddOrRemove = async (chat, usernamesToAdd, usernamesToRemove) => {
    let originalExistingUserIDs = chat.users.map(user => user._id);
    let expectedUserTotal = originalExistingUserIDs.length;
    let usersToAdd = [];
    if (usernamesToAdd) {
        usersToAdd = await accounts_1.User.find({ username: { $in: usernamesToAdd }, _id: { $nin: originalExistingUserIDs.concat([chat.owner]) } });
        expectedUserTotal += usernamesToAdd.length;
    }
    let usersToRemove = [];
    if (usernamesToRemove) {
        if (originalExistingUserIDs.length === 0)
            throw new handlers_1.ValidationErr("usernamesToRemove", "No users to remove");
        usersToRemove = await accounts_1.User.find({ username: { $in: usernamesToRemove }, _id: { $in: originalExistingUserIDs, $ne: chat.owner } });
        expectedUserTotal -= usersToRemove.length;
    }
    if (expectedUserTotal > 99)
        throw new handlers_1.ValidationErr("usernamesToAdd", "99 users limit reached");
    let userIDsToAdd = usersToAdd.map(user => user._id);
    let userIDsToRemove = usersToRemove.map(user => user._id);
    await chat_1.Chat.findOneAndUpdate({ _id: chat._id }, {
        $addToSet: { users: { $each: userIDsToAdd } }, // Add new userIDs without duplicates
    });
    chat = await chat_1.Chat.findOneAndUpdate({ _id: chat._id }, {
        $pull: { users: { $in: userIDsToRemove } } // Remove specified userIDs
    }, { new: true }).populate([(0, users_1.shortUserPopulation)("users"), "image"]);
    return chat;
};
exports.handleGroupUsersAddOrRemove = handleGroupUsersAddOrRemove;
//# sourceMappingURL=chats.js.map