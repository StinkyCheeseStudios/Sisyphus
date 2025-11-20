import mongoose from 'mongoose';

const scheduleParamsSchema = new mongoose.Schema({
  workersPerDayShift: {
    type: Number,
    required: true,
    min: 1,
    default: 2
  },
  workersPerEveningShift: {
    type: Number,
    required: true,
    min: 1,
    default: 2
  },
  shiftDurationHours: {
    type: Number,
    required: true,
    min: 1,
    default: 8
  },
  minPartialShiftHours: {
    type: Number,
    required: true,
    min: 1,
    default: 2
  },
  maxWorkersPerShift: {
    type: Number,
    required: true,
    min: 1,
    default: 4
  },
  maxConsecutiveDays: {
    type: Number,
    required: true,
    min: 3, //this is the minimum so...
    default: 5
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


export const ScheduleParams = mongoose.models.ScheduleParams || mongoose.model('ScheduleParams', scheduleParamsSchema);