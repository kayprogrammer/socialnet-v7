"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../config/utils");
const paginator_1 = require("../config/paginator");
const accounts_1 = require("../models/accounts");
const profiles_1 = require("../schemas/profiles");
const handlers_1 = require("../config/handlers");
const auth_1 = require("../middlewares/auth");
const error_1 = require("../middlewares/error");
const base_1 = require("../models/base");
const users_1 = require("../managers/users");
const file_processors_1 = __importDefault(require("../config/file_processors"));
const profiles_2 = require("../managers/profiles");
const profiles_3 = require("../models/profiles");
const profilesRouter = (0, express_1.Router)();
/**
 * @route GET /
 * @description Get Users.
 */
profilesRouter.get('', auth_1.authOrGuestMiddleware, async (req, res, next) => {
    try {
        let user = req.user_;
        const users = await (0, profiles_2.findUsersSortedByProximity)(user);
        let data = await (0, paginator_1.paginateRecords)(req, users);
        let usersData = { users: data.items, ...data };
        delete usersData.items;
        return res.status(200).json(utils_1.CustomResponse.success('Users fetched', usersData, profiles_1.ProfilesResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /cities
 * @description Get Cities.
 */
profilesRouter.get('/cities', async (req, res, next) => {
    try {
        let cityQuery = req.query.city || null;
        let message = "Cities Fetched";
        let cities = [];
        if (cityQuery) {
            cityQuery = cityQuery.replace(/[^a-zA-Z0-9]/g, '');
            cities = await accounts_1.City.find({ name: { $regex: `^${cityQuery}`, $options: 'i' } }).limit(10).populate({ path: "state_", populate: { path: "country_" } });
        }
        if (cities.length === 0)
            message = "No match found";
        return res.status(200).json(utils_1.CustomResponse.success(message, cities, profiles_1.CitySchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /profile/:username
 * @description Get Profile of a user.
 */
profilesRouter.get('/profile/:username', async (req, res, next) => {
    try {
        const user = await accounts_1.User.findOne({ username: req.params.username }).populate(["avatar", "city_"]);
        if (!user)
            throw new handlers_1.NotFoundError("No user with that username");
        return res.status(200).json(utils_1.CustomResponse.success("User details fetched", user, profiles_1.ProfileSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PATCH /profile
 * @description Update a user Profile.
 */
profilesRouter.patch('/profile', auth_1.authMiddleware, (0, error_1.validationMiddleware)(profiles_1.ProfileEditSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const data = req.body;
        // Validate City ID Entry
        const { cityId, fileType } = data;
        delete data.fileType;
        delete data.cityId;
        let city = null;
        let file = null;
        if (cityId) {
            city = await accounts_1.City.findOne({ _id: cityId });
            if (!city)
                throw new handlers_1.ValidationErr("cityId", "No city with that ID");
            data.city_ = cityId;
        }
        if (fileType) {
            file = await base_1.File.create({ resourceType: fileType });
            data.avatar = file.id;
        }
        let updatedUser = (0, utils_1.setDictAttr)(data, user);
        await updatedUser.save();
        if (city)
            updatedUser.city_ = city;
        if (file)
            updatedUser.fileUploadData = file_processors_1.default.generateFileSignature(file.id.toString(), "avatars");
        return res.status(200).json(utils_1.CustomResponse.success("Profile updated", updatedUser, profiles_1.ProfileEditResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /profile
 * @description Delete account (irreversible).
 */
profilesRouter.post('/profile', auth_1.authMiddleware, (0, error_1.validationMiddleware)(profiles_1.DeleteUserSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { password } = req.body;
        if (!(await (0, users_1.checkPassword)(user, password)))
            throw new handlers_1.ValidationErr("password", "Incorrect password");
        await user.deleteOne();
        return res.status(200).json(utils_1.CustomResponse.success("Profile deleted"));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /friends
 * @description Get Friends.
 */
profilesRouter.get('/friends', auth_1.authMiddleware, async (req, res, next) => {
    try {
        let user = req.user;
        const friends = await (0, profiles_2.findFriends)(user._id);
        let data = await (0, paginator_1.paginateRecords)(req, friends);
        let friendsData = { users: data.items, ...data };
        delete friendsData.items;
        return res.status(200).json(utils_1.CustomResponse.success('Friends fetched', friendsData, profiles_1.ProfilesResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /friends/requests
 * @description Get Friend Requests.
 */
profilesRouter.get('/friends/requests', auth_1.authMiddleware, async (req, res, next) => {
    try {
        let user = req.user;
        let friendIds = await profiles_3.Friend.find({ requestee: user._id, status: profiles_3.FRIEND_REQUEST_STATUS_CHOICES.PENDING }).select("requester");
        let friendIdList = friendIds.map(friend => friend.requester);
        let data = await (0, paginator_1.paginateModel)(req, accounts_1.User, { _id: { $in: friendIdList } }, ['city_', 'avatar']);
        let friendRequestsData = { users: data.items, ...data };
        delete friendRequestsData.items;
        return res.status(200).json(utils_1.CustomResponse.success('Friends Requests fetched', friendRequestsData, profiles_1.ProfilesResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /friends/requests
 * @description Send Or Delete Friend Request.
 */
profilesRouter.post('/friends/requests', auth_1.authMiddleware, (0, error_1.validationMiddleware)(profiles_1.SendFriendRequestSchema), async (req, res, next) => {
    try {
        let user = req.user;
        const { username } = req.body;
        const { otherUser, friend } = await (0, profiles_2.findRequesteeAndFriendObj)(user, username);
        let statusCode = 201;
        let message = "Friend Request sent";
        if (friend) {
            statusCode = 200;
            message = "Friend Request removed";
            if (friend.status === profiles_3.FRIEND_REQUEST_STATUS_CHOICES.ACCEPTED)
                message = "This user is already your friend";
            else if (user.id.toString() !== friend.requester.toString())
                throw new handlers_1.RequestError("This user already sent you a friend request", 403, handlers_1.ErrorCode.NOT_ALLOWED);
            else
                await friend.deleteOne();
        }
        else {
            await profiles_3.Friend.create({ requester: user._id, requestee: otherUser._id });
        }
        return res.status(statusCode).json(utils_1.CustomResponse.success(message));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PUT /friends/requests
 * @description Accept Or Reject Friend Request.
 */
profilesRouter.put('/friends/requests', auth_1.authMiddleware, (0, error_1.validationMiddleware)(profiles_1.AcceptFriendRequestSchema), async (req, res, next) => {
    try {
        let user = req.user;
        const { username, accepted } = req.body;
        const { friend } = await (0, profiles_2.findRequesteeAndFriendObj)(user, username, profiles_3.FRIEND_REQUEST_STATUS_CHOICES.PENDING);
        if (!friend)
            throw new handlers_1.NotFoundError("No pending friend request exist between you and that user");
        if (friend.requester.toString() == user.toString())
            throw new handlers_1.RequestError("You cannot accept or reject a friend request you sent", 403, handlers_1.ErrorCode.NOT_ALLOWED);
        // Update or delete friend request based on status
        let message = "Accepted";
        if (accepted) {
            friend.status = profiles_3.FRIEND_REQUEST_STATUS_CHOICES.ACCEPTED;
            await friend.save();
        }
        else {
            message = "Rejected";
            await friend.deleteOne();
        }
        return res.status(200).json(utils_1.CustomResponse.success(`Friend Request ${message}`));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /notifications
 * @description Get User Notifications.
 */
profilesRouter.get('/notifications', auth_1.authMiddleware, async (req, res, next) => {
    try {
        let user = req.user;
        let data = await (0, paginator_1.paginateModel)(req, profiles_3.Notification, { $or: [{ receiver: user._id }, { nType: profiles_3.NOTIFICATION_TYPE_CHOICES.ADMIN }] }, profiles_2.notificationPopulationData);
        const enhancedNotifications = data.items.map(notification => {
            // Example: Set 'isRead' dynamically based on current user
            notification.isRead = notification.readBy.includes(user._id);
            return notification;
        });
        let notificationsData = { notifications: enhancedNotifications, ...data };
        delete notificationsData.items;
        return res.status(200).json(utils_1.CustomResponse.success('Notifications fetched', notificationsData, profiles_1.NotificationsResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /notifications
 * @description Read notifications.
 */
profilesRouter.post('/notifications', auth_1.authMiddleware, (0, error_1.validationMiddleware)(profiles_1.ReadNotificationSchema), async (req, res, next) => {
    try {
        let user = req.user;
        const { id, markAllAsRead } = req.body;
        let message = "Notifications read";
        if (markAllAsRead) {
            // Mark all notifications as read
            await profiles_3.Notification.updateMany({ $or: [{ receiver: user._id }, { nType: profiles_3.NOTIFICATION_TYPE_CHOICES.ADMIN }] }, { $addToSet: { readBy: user._id } } // Add the userId to `readBy` if it doesn't already exist
            );
        }
        else if (id) {
            const updatedNotification = await profiles_3.Notification.findOneAndUpdate({ _id: id, $or: [{ receiver: user._id }, { nType: profiles_3.NOTIFICATION_TYPE_CHOICES.ADMIN }] }, { $addToSet: { readBy: user._id } }, // Prevent duplicates
            { new: true } // Return the updated document
            );
            if (!updatedNotification)
                throw new handlers_1.NotFoundError("User has no notification with that ID");
            message = "Notification read";
        }
        else {
            throw new handlers_1.ValidationErr("id", "You must enter an ID or mark all as read");
        }
        return res.status(200).json(utils_1.CustomResponse.success(message));
    }
    catch (error) {
        next(error);
    }
});
exports.default = profilesRouter;
//# sourceMappingURL=profiles.js.map