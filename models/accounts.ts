import mongoose, { Schema, model, Types } from 'mongoose';
import { IBase, IFile } from './base';
import { getFileUrl, randomStringGenerator } from './utils';

// Define the Token interface
interface IToken {
  access: string;
  refresh: string;
}

// Define the interface for the Country model
interface ICountry extends IBase {
  name: string;
  code: string;
}
// Create the Country schema
const CountrySchema = new Schema<ICountry>({
  name: { type: String, required: true },
  code: { type: String, required: true },
}, { timestamps: true })

// Create the Country model
const Country = model<ICountry>('Country', CountrySchema);


// Define the interface for the State model
interface IState extends IBase {
  name: string;
  code: string;
  country_: Types.ObjectId | ICountry;
  country: string;
}
// Create the State schema
const StateSchema = new Schema<IState>({
  name: { type: String, required: true },
  code: { type: String, required: true },
  country_: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
}, { timestamps: true })

// Create the State model
const State = model<IState>('State', StateSchema);

// Define the interface for the City model
interface ICity extends IBase {
  name: string;
  state_: Types.ObjectId | IState;
  state: string
  country: string;
}
// Create the State schema
const CitySchema = new Schema<ICity>({
  name: { type: String, required: true },
  state_: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
}, { timestamps: true })

CitySchema.virtual('state').get(function(this: ICity) {
  return (this.state_ as IState)?.name;
});

CitySchema.virtual('country').get(function(this: ICity) {
  let country = (this.state_ as IState).country_
  return (country as ICountry)?.name;
});

// Create the City model
const City = model<ICity>('City', CitySchema);

// Define the interface for the User model
interface IUser extends IBase {
  firstName: string;
  lastName: string;
  name: string; // full name
  username: string;
  email: string;
  password: string;
  avatar: Types.ObjectId | IFile | null;
  avatarUrl: string | null;
  termsAgreement: boolean;
  isEmailVerified: boolean;
  isStaff: boolean;
  isActive: boolean;
  bio: string | null;
  city_: Types.ObjectId | ICity | null;
  city: string | null;
  dob: Date | null;
  tokens: IToken[];
  otp: number | null;
  otpExpiry: Date; 

  fileUploadData: { publicId: string, signature: string, timestamp: string } | null;
}

// Create the User schema
const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  username: { type: String, unique: true, blank: true }, // For username, you can generate it before saving
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: Schema.Types.ObjectId, ref: 'File', null: true, blank: true },
  termsAgreement: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isStaff: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  bio: { type: String, maxlength: 200, default: null, blank: true },
  city_: { type: Schema.Types.ObjectId, ref: 'City', null: true, blank: true },
  dob: { type: Date, default: null, blank: true },
  tokens: [
    {
      access: { type: String, required: true },
      refresh: { type: String, required: true },
    },
  ], // Using a separate schema to handle this would have probably been better (to handle multiple logins and easier management maybe). While this method can, its advisable that you don't have a long list of active tokens though. So I have intention of setting a limit. (30 login devices).
  otp: { type: Number, null: true, blank: true },
  otpExpiry: { type: Date, null: true, blank: true },
}, { timestamps: true });

UserSchema.virtual('name').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('avatarUrl').get(function(this: IUser) {
  return getFileUrl(this.avatar, "avatars")
});

UserSchema.virtual('city').get(function(this: IUser) {
  return (this.city_ as ICity)?.name || null;
});

// Pre-save hook to generate a unique username
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('username') || !this.username) {
    this.username = `${this.firstName}-${this.lastName}`.toLowerCase().replace(/\s+/g, '-');

    // Check for existing username and modify if necessary
    let isUnique = false;
    while (!isUnique) {
      const existingUser = await User.findOne({ username: this.username, _id: { $ne: this._id } });
      if (existingUser) {
        // Add a random 5-character alphanumeric string to make the username unique
        this.username = `${this.username}-${randomStringGenerator(5)}`;
      } else {
        isUnique = true;
      }
    }
  }
  next();
});

// Create the User model
const User = model<IUser>('User', UserSchema);

export { Country, ICountry, State, IState, City, ICity, User, IUser };
