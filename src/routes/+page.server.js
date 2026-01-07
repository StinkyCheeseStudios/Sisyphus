import { redirect } from '@sveltejs/kit';
import mongoose from 'mongoose';
import { Schedule } from '$lib/models/schedule.js';

export async function load({ locals }) {
  if (!locals.user) {
    throw redirect(307, '/login');
  }

  const workerId = new mongoose.Types.ObjectId(locals.user.workerId);

  try {
    // Find all schedules that contain shifts for this user
    const schedules = await Schedule.find({
      'shifts.workerId': workerId
    }).lean();

    if (!schedules) {
      return {
        shifts: []
      }
    }

    // Extract only the shifts that belong to this user
    const userShifts = schedules.flatMap(schedule =>
      schedule.shifts
        .filter(shift => shift.workerId?.toString() === workerId.toString())
        .map(shift => ({
          ...shift,
          workerId: shift.workerId.toString(),
          scheduleStart: schedule.startDate,
          scheduleEnd: schedule.endDate
        }))
    );

    return {
      shifts: userShifts
    };
  } catch (err) {
    console.error(`Error fetching user shifts: ${err}`)
  }
}
