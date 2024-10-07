import { Router, Request, Response, NextFunction } from "express";
import { CustomResponse, setDictAttr } from "../config/utils";
import { paginateModel, paginateRecords } from "../config/paginator";
import { City, ICity, IUser, User } from "../models/accounts";
import { AcceptFriendRequestSchema, CitySchema, DeleteUserSchema, ProfileEditResponseSchema, ProfileEditSchema, ProfileSchema, ProfilesResponseSchema, SendFriendRequestSchema } from "../schemas/profiles";
import { ErrorCode, NotFoundError, RequestError, ValidationErr } from "../config/handlers";
import { authMiddleware, authOrGuestMiddleware } from "../middlewares/auth";
import { validationMiddleware } from "../middlewares/error";
import { File } from "../models/base";
import { checkPassword } from "../managers/users";
import FileProcessor from "../config/file_processors";
import { findFriends, findRequesteeAndFriendObj, findUsersSortedByProximity } from "../managers/profiles";
import { Friend, FRIEND_REQUEST_STATUS_CHOICES } from "../models/profiles";

const profilesRouter = Router();

/**
 * @route GET /
 * @description Get Users.
 */
profilesRouter.get('', authOrGuestMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let user = req.user_;
        const users = await findUsersSortedByProximity(user)
        let data = await paginateRecords(req, users)
        let usersData = { users: data.items, ...data }
        delete usersData.items
        return res.status(200).json(
            CustomResponse.success(
                'Users fetched', 
                usersData, 
                ProfilesResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /cities
 * @description Get Cities.
 */
profilesRouter.get('/cities', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let cityQuery = req.query.city || null
        let message = "Cities Fetched"
        let cities: ICity[] = []
        if (cityQuery) {
            cityQuery = (cityQuery as string).replace(/[^a-zA-Z0-9]/g, '')
            cities = await City.find({ name: { $regex: `^${cityQuery}`, $options: 'i' } }).limit(10).populate({path: "state_", populate: {path: "country_"}})
        }
        if (cities.length === 0) message = "No match found"
        return res.status(200).json(
            CustomResponse.success(
                message, 
                cities, 
                CitySchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /profile/:username
 * @description Get Profile of a user.
 */
profilesRouter.get('/profile/:username', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ username: req.params.username }).populate(["avatar", "city_"])
        if (!user) throw new NotFoundError("No user with that username")
        return res.status(200).json(
            CustomResponse.success(
                "User details fetched", 
                user, 
                ProfileSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route PATCH /profile
 * @description Update a user Profile.
 */
profilesRouter.patch('/profile', authMiddleware, validationMiddleware(ProfileEditSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const data: ProfileEditSchema = req.body
        // Validate City ID Entry
        const { cityId, fileType } = data;
        delete data.fileType
        delete data.cityId
        let city = null
        let file = null
        if (cityId) {
            city = await City.findOne({ _id: cityId })
            if (!city) throw new ValidationErr("cityId", "No city with that ID")
            data.city_ = cityId
        }

        if (fileType) {
            file = await File.create({ resourceType: fileType })
            data.avatar = file.id
        }
        let updatedUser = setDictAttr(data, user as IUser)
        await updatedUser.save()
        if (city) updatedUser.city_ = city
        if (file) updatedUser.fileUploadData = FileProcessor.generateFileSignature(file.id.toString(), "avatars")
        return res.status(200).json(
            CustomResponse.success(
                "Profile updated", 
                updatedUser, 
                ProfileEditResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /profile
 * @description Delete account (irreversible).
 */
profilesRouter.post('/profile', authMiddleware, validationMiddleware(DeleteUserSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { password } = req.body;
        if (!(await checkPassword(user, password))) throw new ValidationErr("password", "Incorrect password")
        await user.deleteOne()
        return res.status(200).json(CustomResponse.success("Profile deleted"))
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /friends
 * @description Get Friends.
 */
profilesRouter.get('/friends', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let user = req.user;

        const friends = await findFriends(user._id)
        let data = await paginateRecords(req, friends)
        let friendsData = { users: data.items, ...data }
        delete friendsData.items
        return res.status(200).json(
            CustomResponse.success(
                'Friends fetched', 
                friendsData, 
                ProfilesResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /friends/requests
 * @description Get Friend Requests.
 */
profilesRouter.get('/friends/requests', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let user = req.user;
        let friendIds = await Friend.find({ requestee: user._id }).select("requester")
        let friendIdList = friendIds.map(friend => friend.requester)
        let data = await paginateModel(req, User, { _id: { $in: friendIdList } }, ['city_', 'avatar'])
        let friendRequestsData = { users: data.items, ...data }
        delete friendRequestsData.items
        return res.status(200).json(
            CustomResponse.success(
                'Friends Requests fetched', 
                friendRequestsData, 
                ProfilesResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /friends/requests
 * @description Send Or Delete Friend Request.
 */
profilesRouter.post('/friends/requests', authMiddleware, validationMiddleware(SendFriendRequestSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let user = req.user;
        const { username } = req.body;
        const { otherUser, friend } = await findRequesteeAndFriendObj(user, username)
        let statusCode = 201
        let message = "Friend Request sent"
        if (friend) {
            statusCode = 200
            message = "Friend Request removed"
            if (friend.status === FRIEND_REQUEST_STATUS_CHOICES.ACCEPTED) message = "This user is already your friend"
            else if (user.id.toString() !== friend.requester.toString()) throw new RequestError("This user already sent you a friend request", 403, ErrorCode.NOT_ALLOWED)
            else await friend.deleteOne()
        } else {
            await Friend.create({ requester: user._id, requestee: otherUser._id })
        }
        return res.status(statusCode).json(
            CustomResponse.success(
                message, 
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route PUT /friends/requests
 * @description Accept Or Reject Friend Request.
 */
profilesRouter.put('/friends/requests', authMiddleware, validationMiddleware(AcceptFriendRequestSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        let user = req.user;
        const { username, accepted } = req.body;
        const { friend } = await findRequesteeAndFriendObj(user, username, FRIEND_REQUEST_STATUS_CHOICES.PENDING)
        if (!friend) throw new NotFoundError("No pending friend request exist between you and that user")
        if (friend.requester.toString() == user.id.toString()) throw new RequestError("You cannot accept or reject a friend request you sent", 403, ErrorCode.NOT_ALLOWED)
        
        // Update or delete friend request based on status
        let message = "Accepted"
        if (accepted) {
            friend.status = FRIEND_REQUEST_STATUS_CHOICES.ACCEPTED
            await friend.save()
        } else {
            message = "Rejected"
            await friend.deleteOne()
        }
        return res.status(200).json(
            CustomResponse.success(
                `Friend Request ${message}`, 
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /notifications
 * @description Get User Notifications.
 */
profilesRouter.get('/notifications', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        let user = req.user;
        let friendIds = await Friend.find({ requestee: user._id }).select("requester")
        let friendIdList = friendIds.map(friend => friend.requester)
        let data = await paginateModel(req, User, { _id: { $in: friendIdList } }, ['city_', 'avatar'])
        let friendRequestsData = { users: data.items, ...data }
        delete friendRequestsData.items
        return res.status(200).json(
            CustomResponse.success(
                'Friends Requests fetched', 
                friendRequestsData, 
                ProfilesResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});
export default profilesRouter
