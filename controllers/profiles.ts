import { Router, Request, Response, NextFunction } from "express";
import { CustomResponse, setDictAttr } from "../config/utils";
import { paginateModel, paginateRecords } from "../config/paginator";
import { City, ICity, ICountry, IState, IUser, User } from "../models/accounts";
import { CitySchema, DeleteUserSchema, ProfileEditSchema, ProfileSchema, ProfilesResponseSchema } from "../schemas/profiles";
import { NotFoundError, ValidationErr } from "../config/handlers";
import { authMiddleware, authOrGuestMiddleware } from "../middlewares/auth";
import { validationMiddleware } from "../middlewares/error";
import { File } from "../models/base";
import { checkPassword, findUsersSortedByProximity } from "../managers/users";

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
        const user = await User.findOne({ username: req.params.username }).populate("city", "avatar")
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
        if (cityId) {
            let city = await City.findOne({ id: cityId })
            if (!city) throw new ValidationErr("cityId", "No city with that ID")
            data.city = cityId
            
        }

        if (fileType) {
            let file = await File.create({ resourceType: fileType })
            data.file = file.id
        }
        let updatedUser = setDictAttr(data, user as IUser)
        await updatedUser.save()
        return res.status(200).json(
            CustomResponse.success(
                "Profile updated", 
                updatedUser, 
                ProfileSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route DELETE /profile
 * @description Delete account (irreversible).
 */
profilesRouter.delete('/profile', authMiddleware, validationMiddleware(DeleteUserSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { password } = req.body;
        if (!checkPassword(user, password)) throw new ValidationErr("password", "Incorrect password")
        await user.deleteOne()
        return res.status(200).json(CustomResponse.success("Profile deleted"))
    } catch (error) {
        next(error)
    }
});

export default profilesRouter