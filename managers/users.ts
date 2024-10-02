import bcrypt from 'bcryptjs';
import { ICity, ICountry, IState, IUser, User } from '../models/accounts';
import ENV from '../config/config';
import { PipelineStage, Types } from 'mongoose';
import * as jwt from "jsonwebtoken";
import { randomStr } from '../config/utils';
import { getFileUrl } from '../models/utils';

const findUsersSortedByProximity = async (user: IUser | null ) => {
    if (!user || !user.city_) return await User.find().populate(["avatar", "city_"]);

    let city = user.city_ as ICity;
    let state = city.state_ as IState;
    let country = state.country_ as ICountry;

    // Aggregation pipeline to find users by city, state, and country
   
    const pipeline: PipelineStage[] = [
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
            as: 'cityDetails',
          },
        },
        {
          $unwind: {
            path: '$cityDetails',
            preserveNullAndEmptyArrays: true, // Include users without city details
          },
        },
        {
          $lookup: {
            from: 'states',
            localField: 'cityDetails.state_',
            foreignField: '_id',
            as: 'stateDetails',
          },
        },
        {
          $unwind: {
            path: '$stateDetails',
            preserveNullAndEmptyArrays: true, // Include users without state details
          },
        },
        {
          $lookup: {
            from: 'countries',
            localField: 'stateDetails.country_',
            foreignField: '_id',
            as: 'countryDetails',
          },
        },
        {
          $unwind: {
            path: '$countryDetails',
            preserveNullAndEmptyArrays: true, // Include users without country details
          },
        },
        {
            // Populate avatar
            $lookup: {
              from: 'files', // Assuming avatar is stored in the 'files' collection
              localField: 'avatar',
              foreignField: '_id',
              as: 'avatarDetails',
            },
        },
        // { $unwind: { path: '$avatarDetails', preserveNullAndEmptyArrays: true } }, // Preserve users without avatars
        {
          // Set proximity values
          $addFields: {
            _tmp: {
              cityMatch: { $cond: [{ $eq: ['$cityDetails._id', city._id] }, 0, 1] }, // 0 if same city, 1 otherwise
              stateMatch: { $cond: [{ $eq: ['$stateDetails._id', state._id] }, 0, 1] }, // 0 if same state
              countryMatch: { $cond: [{ $eq: ['$countryDetails._id', country._id] }, 0, 1] }, // 0 if same country
            },
          },
        },
        {
          // Sort by proximity order
          $sort: {
            '_tmp.cityMatch': 1,  // Closest city first
            '_tmp.stateMatch': 1, // Then closest state
            '_tmp.countryMatch': 1, // Then closest country
          },
        },
        {
          // Remove temporary fields
          $unset: '_tmp',
        },
    ];
    
    const sortedUsers = await User.aggregate(pipeline);
    console.log(sortedUsers)
    // Process results to include generated URLs
    // const processedUsers = sortedUsers.map(user => {
    //     return {
    //         ...user,
    //         avatarUrl: getFileUrl(user.avatar, "avatars"), // Call your function here
    //         // city: user.cityDetails.name, // Assuming you still want city name
    //     };
    // });
    return sortedUsers;
};
  


const hashPassword = async (password: string) => {
    const hashedPassword: string = await bcrypt.hash(password, 10) 
    return hashedPassword
}

const checkPassword = async (user: IUser, password: string) => {
    return await bcrypt.compare(password, user.password)
}

const createUser = async (userData: Record<string,any>, isStaff: boolean = false) => {
    const { password, ...otherUserData } = userData;

    const hashedPassword = await hashPassword(password);
    const otpExpiry = new Date(new Date().getTime() + ENV.EMAIL_OTP_EXPIRE_SECONDS * 1000);
    const newUser = await User.create({ password: hashedPassword, isStaff, otpExpiry, ...otherUserData });
    return newUser; 
};

const createOtp = async (user: IUser): Promise<number> => {
    const otp: number = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + ENV.EMAIL_OTP_EXPIRE_SECONDS * 1000); // OTP expiry in 15 minutes

    try {
        await User.updateOne(
            { _id: user._id },
            { $set: { otp, otpExpiry } }
        );
    } catch (error) {
        console.error('Error updating OTP and expiry:', error);
        throw error;
    }
    return otp
};

// Authentication Tokens
const ALGORITHM = "HS256"
const createAccessToken = (userId: Types.ObjectId) => {
    let payload = { userId, exp: Math.floor(Date.now() / 1000) + (ENV.ACCESS_TOKEN_EXPIRY * 60)}
    return jwt.sign(payload, ENV.SECRET_KEY, { algorithm: ALGORITHM });
}

const createRefreshToken = () => {
    const payload: Record<string, string|number> = { data: randomStr(10), exp: Math.floor(Date.now() / 1000) + (ENV.REFRESH_TOKEN_EXPIRY * 60) }
    return jwt.sign(payload, ENV.SECRET_KEY, { algorithm: ALGORITHM });
}

const verifyAsync = (token: string, secret: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, payload) => {
            if (err) {
                reject(err);
            } else {
                resolve(payload);
            }
        });
    });
}

const verifyRefreshToken = async (token: string) => {
    try {
      const decoded = await verifyAsync(token, ENV.SECRET_KEY) as any;
      return true
    } catch (error) {
        return false;
    }
}

const decodeAuth = async (token: string): Promise<IUser | null> => {
    try {
      const decoded = await verifyAsync(token, ENV.SECRET_KEY) as { userId?: string };
      const userId = decoded?.userId;
        
      if (!userId) {
        return null;
      }
  
      const user = await User.findOne({ _id: userId, "tokens.access": token }).populate([{path: "city_", populate: {path: "state_", populate: {path: "country_"}}}, "avatar"]);
      return user;
    } catch (error) {
      return null;
    }
}

const shortUserPopulation = (field: string): any => {
    return {path: field, select: "firstName lastName username avatar", populate: {path: 'avatar'}}
}

export { createUser, createOtp, hashPassword, checkPassword, createAccessToken, createRefreshToken, verifyRefreshToken, decodeAuth, shortUserPopulation, findUsersSortedByProximity };
