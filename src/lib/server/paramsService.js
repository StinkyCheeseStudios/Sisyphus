import { connectToDatabase } from '$lib/server/db';
import { ScheduleParams } from '$lib/models/scheduleParams';

/**
 * Get schedule parameters
 * Creates default params if none exist (singleton pattern)
 * @returns {Promise<Object>} Params object
 */
export async function getScheduleParams() {
  await connectToDatabase();
  
  let params = await ScheduleParams.findOne({}).lean();
  
  // If no params exist, create default
  if (!params) {
    params = await ScheduleParams.create({
      workersPerDayShift: 2,
      workersPerEveningShift: 2,
      shiftDurationHours: 8,
      minPartialShiftHours: 2,
      maxWorkersPerShift: 4
    });
  }
  
  return {
    id: params._id.toString(),
    workersPerDayShift: params.workersPerDayShift,
    workersPerEveningShift: params.workersPerEveningShift,
    shiftDurationHours: params.shiftDurationHours,
    minPartialShiftHours: params.minPartialShiftHours,
    maxWorkersPerShift: params.maxWorkersPerShift
  };
}

/**
 * Update schedule parameters
 * Updates the singleton params document
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<Object>} Updated params object
 */
export async function updateScheduleParams(updates) {
  await connectToDatabase();
  
  // Get existing params (or create if doesnt exist)
  let params = await ScheduleParams.findOne({});
  
  if (!params) {
    // Create with defaults, then apply updates
    params = await ScheduleParams.create({
      workersPerDayShift: 2,
      workersPerEveningShift: 2,
      shiftDurationHours: 8,
      minPartialShiftHours: 2,
      maxWorkersPerShift: 4,
      ...updates
    });
  } else {
    // Update existing
    Object.assign(params, updates);
    params.updatedAt = Date.now();
    await params.save();
  }
  
  return {
    id: params._id.toString(),
    workersPerDayShift: params.workersPerDayShift,
    workersPerEveningShift: params.workersPerEveningShift,
    shiftDurationHours: params.shiftDurationHours,
    minPartialShiftHours: params.minPartialShiftHours,
    maxWorkersPerShift: params.maxWorkersPerShift
  };
}