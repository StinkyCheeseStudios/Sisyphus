import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    default: null
  },
  workerName: {
    type: String,
    default: 'Unassigned'
  },
  date: {
    type: String,
    required: true
  },
  shiftType: {
    type: String,
    enum: ['day', 'evening'],
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0
  },
  isPartial: {
    type: Boolean,
    default: false
  },
  isEmpty: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  shifts: [shiftSchema],
  warnings: [{
    date: String,
    shiftType: String,
    message: String,
    severity: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

scheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);