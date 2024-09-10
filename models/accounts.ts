import { Schema, model, Types } from 'mongoose';
import { IBase, BaseSchema } from './base';
import { randomStringGenerator } from './utils';

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
  name: { type: String, required: true, maxlength: 50 },
  code: { type: String, required: true, maxlength: 50 },
})

// Merge BaseSchema
CountrySchema.add(BaseSchema.obj);

// Create the Country model
const Country = model<ICountry>('Country', CountrySchema);


// Define the interface for the State model
interface IState extends IBase {
  name: string;
  code: string;
}
// Create the State schema
const StateSchema = new Schema<IState>({
  name: { type: String, required: true, maxlength: 50 },
  code: { type: String, required: true, maxlength: 50 },
})

// Merge BaseSchema
StateSchema.add(BaseSchema.obj);

// Create the State model
const State = model<IState>('State', StateSchema);

// Define the interface for the City model
interface ICity extends IBase {
  name: string;
  code: string;
}
// Create the State schema
const CitySchema = new Schema<ICity>({
  name: { type: String, required: true, maxlength: 50 },
  code: { type: String, required: true, maxlength: 50 },
})

// Merge BaseSchema
CitySchema.add(BaseSchema.obj);

// Create the City model
const City = model<ICity>('City', CitySchema);

// Define the interface for the User model
interface IUser extends IBase {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: Types.ObjectId;
  termsAgreement: boolean;
  isEmailVerified: boolean;
  isStaff: boolean;
  isActive: boolean;
  bio?: string;
  city?: Types.ObjectId;
  dob?: Date;
  tokens: IToken[];
  otp?: number;
  otpExpiry?: Date; 
}

// Create the User schema
const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  username: { type: String, required: true, unique: true }, // For slug, you can generate it before saving
  email: { type: String, required: true, unique: true },
  avatar: { type: Schema.Types.ObjectId, ref: 'File', null: true, blank: true },
  termsAgreement: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isStaff: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  bio: { type: String, maxlength: 200, null: true, blank: true },
  city: { type: Schema.Types.ObjectId, ref: 'City', null: true, blank: true },
  dob: { type: Date, null: true, blank: true },
  tokens: [
    {
      access: { type: String, required: true },
      refresh: { type: String, required: true },
    },
  ], // Using a separate schema to handle this would have probably been better (to handle multiple logins and easier management maybe). While this method can, its advisable that you don't have a long list of active tokens though. So I have intention of setting a limit. (30 login devices).
  otp: { type: Number, null: true, blank: true },
  otpExpiry: { type: Date, null: true, blank: true },
});

// Merge BaseSchema
UserSchema.add(BaseSchema.obj);

// Create the User model
const User = model<IUser>('User', UserSchema);

// Pre-save hook to generate a unique username
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('username') || !this.username) {
    this.username = `${this.firstName}-${this.lastName}`.toLowerCase().replace(/\s+/g, '-');

    // Check for existing username and modify if necessary
    let isUnique = false;
    while (!isUnique) {
      const existingUser = await User.findOne({ username: this.username });
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

export default User;
