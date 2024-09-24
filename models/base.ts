import { Schema, model, Document, Types } from 'mongoose';

// Define the base interface
interface IBase extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Create the base schema
const BaseSchema = new Schema<IBase>(
  {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

// Define the interface for the File model
interface IFile extends IBase {
  resourceType: string;
}

// Create the File schema
const FileSchema = new Schema<IFile>({
  resourceType: { type: String, required: true, maxlength: 200 },
});

// Merge BaseSchema to include common fields
FileSchema.add(BaseSchema.obj);

// Add a method to return the ID as a string 
FileSchema.methods.toString = function () {
  return this._id.toString();
};

// Create the File model
const File = model<IFile>('File', FileSchema);

export { IBase, BaseSchema, File, IFile };
