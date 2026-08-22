import mongoose from 'mongoose'
import { ROLES, type Role } from '../config/env.js'

export interface Address {
  _id: mongoose.Types.ObjectId
  fullName: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  landmark?: string
  isDefault?: boolean
}

export interface IUser {
  name: string
  email: string
  phone?: string
  passwordHash: string
  role: Role
  avatar?: string
  addresses: Address[]
  isVerified: boolean
  isActive: boolean
  lastLogin?: Date
  resetPasswordToken?: string
  resetPasswordExpires?: number
  createdAt: Date
  updatedAt: Date
}

const addressSchema = new mongoose.Schema<Address>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    addressLine: { type: String, required: true, trim: true, maxlength: 300 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    landmark: { type: String, trim: true, maxlength: 150 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
)

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    phone: { type: String, trim: true, maxlength: 20 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER },
    avatar: { type: String },
    addresses: { type: [addressSchema], default: [] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Number, select: false },
  },
  { timestamps: true },
)

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  delete obj.__v
  return obj
}

export const User = mongoose.model<IUser>('User', userSchema)