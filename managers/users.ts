import bcrypt from 'bcryptjs';
import { IUser, User } from '../models/accounts';
import ENV from '../config/config';
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

const createUser = async (userData: Record<string,any>, isStaff: boolean = false) => {
    const { password, ...otherUserData } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpiry = new Date(new Date().getTime() + ENV.EMAIL_OTP_EXPIRE_SECONDS * 1000);
    const newUser = new User({ password: hashedPassword, isStaff, otpExpiry, ...otherUserData });
    await newUser.save();
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

export { createUser, createOtp };
