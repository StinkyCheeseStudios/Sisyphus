import mongoose from "mongoose";

const SignupTokenSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },

  code: {
    type: String,
    match: /^[a-zA-Z0-9]{6,16}$/, // <-- 6-16 digits long. No weird characters.
    required: true,
    unique: true
  },

  employeeName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 32,
  },

  expiresAt: {
    type: Date,
    default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    index: true,
  },

  isUsed: {
    type: Boolean,
    required: true,
    default: false,
  }
});

export const SignupToken = mongoose.models.SignupToken || mongoose.model("SignupToken", SignupTokenSchema);