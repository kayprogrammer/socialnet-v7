import bcrypt from 'bcryptjs';
import { IUser, User } from '../models/accounts';
import ENV from '../config/config';
import { Types } from 'mongoose';
import * as jwt from "jsonwebtoken";
import { randomStr } from '../config/utils';

// import { UserProfile } from './models/UserProfile';

// const findUsersInSameCity = async (userId: string) => {
//   const user = await UserProfile.findById(userId).populate({
//     path: 'city',
//     populate: {
//       path: 'state',
//       populate: {
//         path: 'country',
//       },
//     },
//   });

//   if (!user) return null;

//   // Find users in the same city
//   const usersInCity = await UserProfile.find({ city: user.city._id });

//   // If no users in the same city, find users in the same state
//   if (usersInCity.length === 0) {
//     const usersInState = await UserProfile.find({
//       city: { $in: await City.find({ state: user.city.state._id }).select('_id') },
//     });

//     if (usersInState.length === 0) {
//       // If no users in the same state, find users in the same country
//       const usersInCountry = await UserProfile.find({
//         city: { $in: await City.find({ state: { $in: await State.find({ country: user.city.state.country._id }).select('_id') } }).select('_id') },
//       });

//       return usersInCountry;
//     }

//     return usersInState;
//   }

//   return usersInCity;
// };

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
  
      const user = await User.findOne({ _id: userId, "tokens.access": token });
      return user;
    } catch (error) {
      return null;
    }
}

const shortUserPopulation = (field: string): any => {
    return {path: field, select: "firstName lastName username avatar", populate: {path: 'avatar'}}
}

export { createUser, createOtp, hashPassword, checkPassword, createAccessToken, createRefreshToken, verifyRefreshToken, decodeAuth, shortUserPopulation };
