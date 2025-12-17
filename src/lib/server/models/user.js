import { mongoose } from "mongoose";

const UserSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 16
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  }
})

export const User = mongoose.models.User || mongoose.model('User', UserSchema);