import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  hoursPerWeek: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//prevent model recompilation during hot reload
export const Worker = mongoose.models.Worker || mongoose.model('Worker', workerSchema);