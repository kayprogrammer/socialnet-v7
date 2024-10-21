"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMessage = exports.testGroupChat = exports.testDMChat = exports.testNotification = exports.testFriend = exports.testCity = exports.testReply = exports.testComment = exports.testReaction = exports.testPost = exports.testTokens = exports.testAnotherVerifiedUser = exports.testVerifiedUser = exports.testUser = exports.paginatedTestData = exports.BASE_URL = void 0;
const users_1 = require("../managers/users");
const accounts_1 = require("../models/accounts");
const chat_1 = require("../models/chat");
const feed_1 = require("../models/feed");
const profiles_1 = require("../models/profiles");
// GENERAL UTIL------------------------------------
const BASE_URL = "/api/v7";
exports.BASE_URL = BASE_URL;
const paginatedTestData = (dataKey, data) => {
    return {
        itemsCount: expect.any(Number),
        itemsPerPage: 100,
        page: 1,
        [dataKey]: data,
        totalPages: 1
    };
};
exports.paginatedTestData = paginatedTestData;
// ---------------------------------------------------
// USERS AND AUTH------------
const testUser = async () => {
    let userData = { firstName: "Test", lastName: "User", email: "testuser@example.com", password: "testuser" };
    let user = await accounts_1.User.findOne({ email: userData.email });
    if (!user)
        user = await (0, users_1.createUser)(userData);
    return user;
};
exports.testUser = testUser;
const testVerifiedUser = async () => {
    let userData = { firstName: "Test", lastName: "UserVerified", email: "testuserverified@example.com", password: "testuserverified" };
    let user = await accounts_1.User.findOne({ email: userData.email });
    if (!user)
        user = await (0, users_1.createUser)(userData, true);
    return user;
};
exports.testVerifiedUser = testVerifiedUser;
const testAnotherVerifiedUser = async () => {
    let userData = { firstName: "TestAnother", lastName: "UserVerified", email: "testanotheruserverified@example.com", password: "testanotheruserverified" };
    let user = await accounts_1.User.findOne({ email: userData.email });
    if (!user)
        user = await (0, users_1.createUser)(userData, true);
    return user;
};
exports.testAnotherVerifiedUser = testAnotherVerifiedUser;
const testTokens = async (user) => {
    const access = (0, users_1.createAccessToken)(user.id);
    const refresh = (0, users_1.createRefreshToken)();
    const tokens = { access, refresh };
    await accounts_1.User.updateOne({ _id: user._id }, { $set: { "tokens": tokens } });
    return tokens;
};
exports.testTokens = testTokens;
// -----------------------------------
// FEED UTILS------------------------
const testPost = async () => {
    const author = await testVerifiedUser();
    const post = await feed_1.Post.create({ text: "This is a new post", author: author._id });
    post.author = author;
    return post;
};
exports.testPost = testPost;
const testReaction = async (post) => {
    const reactions = [{ rType: feed_1.REACTION_CHOICES_ENUM.LIKE, user: post.author._id }];
    post = await feed_1.Post.findOneAndUpdate({ _id: post._id }, { reactions }, { new: true }).populate((0, users_1.shortUserPopulation)("reactions.user"));
    return post.reactions[0];
};
exports.testReaction = testReaction;
const testComment = async (post) => {
    const author = await testVerifiedUser();
    const comment = await feed_1.Comment.create({ text: "This is a new comment", post: post._id, author: author._id });
    comment.author = author;
    return comment;
};
exports.testComment = testComment;
const testReply = async (comment) => {
    const author = await testVerifiedUser();
    const reply = await feed_1.Comment.create({ text: "This is a new comment", parent: comment._id, post: comment.post, author: author._id });
    reply.author = author;
    return reply;
};
exports.testReply = testReply;
// --------------------------------------------------------
// PROFILES UTIL-------------------------------------------
const testCity = async () => {
    const countryDataToCreate = { name: "Nigeria", code: "NG" };
    let country = await accounts_1.Country.findOne(countryDataToCreate);
    if (!country)
        country = await accounts_1.Country.create(countryDataToCreate);
    const stateDataToCreate = { name: "Lagos", code: "LA", country_: country._id };
    let state = await accounts_1.State.findOne(stateDataToCreate);
    if (!state)
        state = await accounts_1.State.create(stateDataToCreate);
    state.country_ = country;
    const cityDataToCreate = { name: "Lekki", state_: state._id };
    let city = await accounts_1.City.findOne(cityDataToCreate);
    if (!city)
        city = await accounts_1.City.create(cityDataToCreate);
    city.state_ = state;
    return city;
};
exports.testCity = testCity;
const testFriend = async (requester, requestee, status = profiles_1.FRIEND_REQUEST_STATUS_CHOICES.ACCEPTED) => {
    let friendData = { requester: requester.id, requestee: requestee.id };
    let friend = await profiles_1.Friend.findOneAndUpdate(friendData, { status }, { new: true });
    if (!friend)
        friend = await profiles_1.Friend.create({ status, ...friendData });
    return friend;
};
exports.testFriend = testFriend;
const testNotification = async (sender, receiver) => {
    const post = await testPost();
    const notificationData = { sender: sender.id, receiver: receiver.id, nType: profiles_1.NOTIFICATION_TYPE_CHOICES.REACTION, post: post.id, readBy: [] };
    const notification = await profiles_1.Notification.create(notificationData);
    notification.sender = sender;
    notification.post = post;
    notification.isRead = false;
    return notification;
};
exports.testNotification = testNotification;
// -------------------------------------------------------
// CHATS UTIL-------------------------------------
const testDMChat = async (owner, member) => {
    const chat = await chat_1.Chat.create({ owner: owner.id, cType: chat_1.CHAT_TYPE_CHOICES.DM, users: [member.id] });
    chat.owner = owner;
    chat.latestMessage = null;
    return chat;
};
exports.testDMChat = testDMChat;
const testGroupChat = async (owner, member) => {
    const chat = await chat_1.Chat.create({ name: "My chat", owner: owner.id, cType: chat_1.CHAT_TYPE_CHOICES.GROUP, users: [member.id], description: "This is my chat description" });
    chat.owner = owner;
    chat.latestMessage = null;
    chat.users = [member];
    return chat;
};
exports.testGroupChat = testGroupChat;
const testMessage = async (sender, chat) => {
    await chat_1.Message.deleteMany({ chat: chat.id }); // Delete existing messages for a chat
    const message = await chat_1.Message.create({ chat: chat.id, sender: sender.id, text: "Here is my message" });
    message.sender = sender;
    return message;
};
exports.testMessage = testMessage;
//# sourceMappingURL=utils.js.map