"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationPopulationData = exports.setFeedObjForNotification = exports.findOrCreateNotification = exports.findRequesteeAndFriendObj = exports.findFriends = exports.findUsersSortedByProximity = void 0;
const accounts_1 = require("../models/accounts");
const profiles_1 = require("../models/profiles");
const utils_1 = require("../models/utils");
const handlers_1 = require("../config/handlers");
const users_1 = require("./users");
const findUsersSortedByProximity = async (user) => {
    if (!user || !user.city_)
        return await accounts_1.User.find().populate(["avatar", "city_"]);
    let city = user.city_;
    let state = city.state_;
    let country = state.country_;
    // Aggregation pipeline to sort users by city, state, and country
    const pipeline = [
        {
            $match: {
                _id: { $ne: user._id }, // Exclude current user
            },
        },
        {
            $lookup: {
                from: 'cities',
                localField: 'city_',
                foreignField: '_id',
                as: 'city',
            },
        },
        {
            $unwind: {
                path: '$city',
                preserveNullAndEmptyArrays: true, // Include users without city details
            },
        },
        {
            $lookup: {
                from: 'states',
                localField: 'city.state_',
                foreignField: '_id',
                as: 'state',
            },
        },
        {
            $unwind: {
                path: '$state',
                preserveNullAndEmptyArrays: true, // Include users without state details
            },
        },
        {
            $lookup: {
                from: 'countries',
                localField: 'state.country_',
                foreignField: '_id',
                as: 'country',
            },
        },
        {
            $unwind: {
                path: '$country',
                preserveNullAndEmptyArrays: true, // Include users without country details
            },
        },
        {
            // Populate avatar
            $lookup: {
                from: 'files',
                localField: 'avatar',
                foreignField: '_id',
                as: 'avatar',
            },
        },
        { $unwind: { path: '$avatar', preserveNullAndEmptyArrays: true } }, // Preserve users without avatars
        {
            // Set proximity values
            $addFields: {
                _tmp: {
                    cityMatch: { $cond: [{ $eq: ['$city._id', city._id] }, 0, 1] }, // 0 if same city, 1 otherwise
                    stateMatch: { $cond: [{ $eq: ['$state._id', state._id] }, 0, 1] }, // 0 if same state
                    countryMatch: { $cond: [{ $eq: ['$country._id', country._id] }, 0, 1] }, // 0 if same country
                },
            },
        },
        {
            // Sort by proximity order
            $sort: {
                '_tmp.cityMatch': 1, // Closest city first
                '_tmp.stateMatch': 1, // Then closest state
                '_tmp.countryMatch': 1, // Then closest country
            },
        },
        {
            // Remove temporary fields
            $unset: '_tmp',
        },
    ];
    const sortedUsers = await accounts_1.User.aggregate(pipeline);
    // Process results to include generated URLs
    const processedUsers = sortedUsers.map(user => {
        return {
            ...user,
            avatarUrl: (0, utils_1.getFileUrl)(user.avatar, "avatars"), // Call your function here
            city: user.city.name, // Assuming you still want city name
        };
    });
    return processedUsers;
};
exports.findUsersSortedByProximity = findUsersSortedByProximity;
const findFriends = async (userId) => {
    // Find all accepted friends (where user is either requester or requestee)
    const friendsPipeline = [
        {
            $match: {
                status: profiles_1.FRIEND_REQUEST_STATUS_CHOICES.ACCEPTED,
                $or: [
                    { requester: userId },
                    { requestee: userId }
                ]
            }
        },
        // Add a field `friend_id` that contains the other user in the relationship
        {
            $addFields: {
                friend_id: {
                    $cond: {
                        if: { $eq: ['$requester', userId] }, // If user is the requester, pick requestee as friend
                        then: '$requestee',
                        else: '$requester' // Else pick requester as friend
                    }
                }
            }
        },
        // Project only the `friend_id` field
        {
            $project: { friend_id: 1 }
        }
    ];
    let friendIds = await profiles_1.Friend.aggregate(friendsPipeline);
    const friendIdList = friendIds.map(friend => friend.friend_id);
    // Query the `User` collection with the friend IDs and populate fields
    const users = await accounts_1.User.find({ _id: { $in: friendIdList } }).populate(['city_', 'avatar']);
    return users;
};
exports.findFriends = findFriends;
const findRequesteeAndFriendObj = async (user, username, status = null) => {
    const otherUser = await accounts_1.User.findOne({ username });
    if (!otherUser)
        throw new handlers_1.NotFoundError("User does not exist");
    const friendFilter = {
        $or: [
            { requester: user._id, requestee: otherUser._id },
            { requester: otherUser._id, requestee: user._id }
        ]
    };
    if (status)
        friendFilter.status = status;
    const friend = await profiles_1.Friend.findOne(friendFilter);
    return { otherUser, friend };
};
exports.findRequesteeAndFriendObj = findRequesteeAndFriendObj;
const setFeedObjForNotification = (data, obj) => {
    if ("commentsCount" in obj)
        data.post = obj._id; // For post
    else if (obj.parent)
        data.reply = obj._id; // For reply
    else
        data.comment = obj._id; // For comment
    return data;
};
exports.setFeedObjForNotification = setFeedObjForNotification;
const notificationPopulationData = [
    (0, users_1.shortUserPopulation)("sender"),
    { path: "post", select: "slug" },
    { path: "comment", select: "post slug", populate: { path: "post", select: "slug" } },
    { path: "reply", select: "post parent slug", populate: { path: "parent post", select: "slug" } },
];
exports.notificationPopulationData = notificationPopulationData;
const findOrCreateNotification = async (sender, nType, obj, receiverId) => {
    const dataToCreate = setFeedObjForNotification({ sender: sender._id, nType, receiver: receiverId }, obj);
    let notification = await profiles_1.Notification.findOneAndUpdate(dataToCreate, dataToCreate, { new: true }).populate(notificationPopulationData);
    let created = false;
    if (!notification) {
        notification = await profiles_1.Notification.create(dataToCreate);
        notification = await notification.populate(notificationPopulationData);
        created = true;
    }
    return [notification, created];
};
exports.findOrCreateNotification = findOrCreateNotification;
//# sourceMappingURL=profiles.js.map