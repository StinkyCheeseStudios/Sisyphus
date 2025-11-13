import { connectToDatabase } from '$lib/server/db';
import { Schedule } from '$lib/models/schedule.js';


 //Helper: convert ObjectId → string in shifts

function serializeShifts(shifts) {
  return shifts.map(shift => ({
    ...shift,
    workerId: shift.workerId ? shift.workerId.toString() : null
  }));
}


 //Get the most recent saved schedule
export async function getCurrentSchedule() {
  await connectToDatabase();
  
  const schedule = await Schedule.findOne({})
    .sort({ updatedAt: -1 })
    .lean();
  
  if (!schedule) return null;
 // return JSON.parse(JSON.stringify(schedule));

    // Convert ObjectIds and Dates to strings
    return {
      id: schedule._id.toString(),
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      shifts: schedule.shifts.map(s => ({
        workerId: s.workerId ? s.workerId.toString() : null,
        workerName: s.workerName,
        date: s.date,
        shiftType: s.shiftType,
        hours: s.hours,
        isPartial: s.isPartial,
        isEmpty: s.isEmpty
      })),
      warnings: (schedule.warnings || []).map(w => ({
        date: w.date,
        shiftType: w.shiftType,
        message: w.message,
        severity: w.severity
        // do not include _id!!!!
      })),
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString()
    };

  return {
    id: schedule._id.toString(),
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    shifts: serializeShifts(schedule.shifts),
    warnings: schedule.warnings || [],
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt
  };
}

//Save a schedule

export async function saveSchedule(startDate, endDate, shifts, warnings = []) {
  await connectToDatabase();
  
  await Schedule.deleteMany({});
  
  const schedule = await Schedule.create({
    startDate,
    endDate,
    shifts,
    warnings
  });

 // const plain = schedule.toObject({versionKey: false});

  return JSON.parse(JSON.stringify(schedule));

  return {
    id: schedule._id.toString(),
    startDate:   schedule.startDate,
    endDate:      schedule.endDate,
    shifts:   serializeShifts(schedule.shifts),
    warnings:   schedule.warnings,
    createdAt:     schedule.createdAt,
    updatedAt:     pschedule.updatedAt
  };
}


//Update a schedule
export async function updateSchedule(scheduleId, shifts) {
  await connectToDatabase();
  
  const schedule = await Schedule.findByIdAndUpdate(
    scheduleId,
    { 
      shifts,
      updatedAt: Date.now()
    },
    { new: true }
  ).lean();
  
  if (!schedule) return null;

  return {
    id: schedule._id.toString(),
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    shifts: serializeShifts(schedule.shifts),
    warnings: schedule.warnings,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt
  };
}


 //Delete the current schedule

export async function deleteSchedule() {
  await connectToDatabase();
  await Schedule.deleteMany({});
  return true;
}

