import { mongoose } from "mongoose";

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '0ms' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
}, {
  timestamps: true
});

SessionSchema.methods.isValid = () => {
  return this.expiresAt > new Date();
};

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);