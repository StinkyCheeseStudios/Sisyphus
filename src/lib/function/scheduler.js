//this is to avoid typos! and it is easy reference, just need to change in one place!
//used everywhere in file,   whenever we need to specify or check SHIFT TYPES!

const SHIFT_TYPES = {
  DAY: 'day',
  EVENING: 'evening'
};

//main rule, determines wheter a worker is allowed to take a specific shift on a specif. date
//1.can not work two shifts on same day
//2.cannot do day to eve or eve to day backto back
//3.cannot exceed maxConsecutiveDays, prevents burnout (default 5)
export function canAssignShift(schedule, workerId, date, shiftType, params) {
  const alreadyWorking = schedule.some(s =>
    s.workerId === workerId && s.date === date
  );
  if (alreadyWorking) return false;

  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = prevDate.toISOString().split('T')[0];

  const prevShift = schedule.find(s =>
    s.workerId === workerId && s.date === prevDateStr
  );

  if (prevShift) {
    if (prevShift.shiftType === SHIFT_TYPES.DAY && shiftType === SHIFT_TYPES.EVENING) {
      return false;
    }
    if (prevShift.shiftType === SHIFT_TYPES.EVENING && shiftType === SHIFT_TYPES.DAY) {
      return false;
    }
  }

  const streak = getConsecutiveStreak(schedule, workerId, date);
  const maxDays = params?.maxConsecutiveDays ?? 5;
  
  if (streak >= maxDays) {
    return false;
  }

  return true;
}

//utility, return total hours already assigned to a worker in the current schedule
//used for checking remaining hours, calc util%, deciding partial shifts
export function getScheduledHours(schedule, workerId) {
  return schedule
    .filter(s => s.workerId === workerId)
    .reduce((sum, s) => sum + s.hours, 0);
}


//counts how many day or evening shifts worker already has
//used in prio calc, critical for fairness
export function getShiftTypeCount(schedule, workerId, shiftType) {
  return schedule.filter(
    s => s.workerId === workerId && s.shiftType === shiftType
  ).length;
}

//helper, to add X days to YYYY-MM-DD string and return new date string
//used in lookahead logic
function addDays(dateStr, days) {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}




//tries to detect "high pressure" days, typically fridays or near weekends
//if date is 4th, 5th or 6th in a seq, it is considered potentially busy
//used in lookahead penalty, avoids assigning workers who are about to hit max streak on crit days!
function isLikelyBottleneck(dateStr, allDates) {
  const dateIndex = allDates.indexOf(dateStr);
  if (dateIndex === -1) return false;
  
  const dayNumber = dateIndex + 1;
  return dayNumber % 5 === 0 || (dayNumber - 1) % 5 === 0 || (dayNumber + 1) % 5 === 0;
}



//foresight, penalizes assignments that could cause future coverage problems
//triggers when:
//worker is close to max consecutive days
//and a bottleneck day is coming soon
//and assining now would block them from working later when really needed
function calculateLookAheadPenalty(worker, date, shiftType, schedule, params, allDates) {
  let penalty = 0;
  const maxDays = params?.maxConsecutiveDays ?? 5;
  
  const currentStreak = getConsecutiveStreak(schedule, worker.id, date);
  
  for (let i = 1; i <= 5; i++) {
    const futureDate = addDays(date, i);
    if (!allDates.includes(futureDate)) continue;
    
    if (currentStreak >= maxDays - 1) {
      if (isLikelyBottleneck(futureDate, allDates)) {
        penalty += 100; //adds penalty
      }
    }
    
    if (i <= 2) {
      const dayCount = getShiftTypeCount(schedule, worker.id, SHIFT_TYPES.DAY);
      const eveCount = getShiftTypeCount(schedule, worker.id, SHIFT_TYPES.EVENING);
      
      if (shiftType === SHIFT_TYPES.DAY && dayCount > eveCount + 2) {
        penalty += 30;
      }
      if (shiftType === SHIFT_TYPES.EVENING && eveCount > dayCount + 2) {
        penalty += 30;
      }
    }
  }
  
  return penalty;
}



//likely most important function!!!!
//decided who should get the shift when multiple people are available!
//alot of scoring factors
export function calculatePriority(worker, date, shiftType, schedule, params, workers, allDates) {
  const scheduled = getScheduledHours(schedule, worker.id);
  const remaining = worker.targetHoursForPeriod - scheduled;

  let score = 0;
  
  //FACTOR 1: Hours remaining (prioritize workers with more hours to assign)
  //This ensures we fill slots while spreading hours fairly
  score -= remaining * 300; //High weight for remaining hours
  
  //FACTOR 2: Shift type balance
  const dayCount = getShiftTypeCount(schedule, worker.id, SHIFT_TYPES.DAY);
  const eveCount = getShiftTypeCount(schedule, worker.id, SHIFT_TYPES.EVENING);
  const totalShifts = dayCount + eveCount;
  const imbalance = Math.abs(dayCount - eveCount);

  if (totalShifts > 0) {
    const ratio = Math.max(dayCount, eveCount) / totalShifts;
    
    //Exponential penalty for severe imbalance (>70%)
    if (totalShifts >= 4 && ratio > 0.7) {
      if (shiftType === SHIFT_TYPES.DAY && dayCount > eveCount) {
        score += Math.pow(imbalance, 2) * 50;
      }
      if (shiftType === SHIFT_TYPES.EVENING && eveCount > dayCount) {
        score += Math.pow(imbalance, 2) * 50;
      }
    }
    
    //standard balancing
    if (shiftType === SHIFT_TYPES.DAY && dayCount > eveCount) {
      score += imbalance * 120;
    }
    if (shiftType === SHIFT_TYPES.EVENING && eveCount > dayCount) {
      score += imbalance * 120;
    }
    
    //bonus for reducing imbalance
    if (shiftType === SHIFT_TYPES.DAY && dayCount < eveCount) {
      score -= imbalance * 100;
    }
    if (shiftType === SHIFT_TYPES.EVENING && eveCount < dayCount) {
      score -= imbalance * 100;
    }
  }

  //FACTOR 3: Weekend fairness
  if (isWeekend(date)) {
    const workerWeekends = getWeekendAssignments(schedule, worker.id, date);
    const avgWeekends = getAverageWeekendAssignments(schedule, date, workers);
    const diff = workerWeekends - avgWeekends;
    
    if (diff > 0) {
      score += diff * 150;
    } else if (diff < 0) {
      score -= Math.abs(diff) * 100;
    }
  }

  //FACTOR 4: Consecutive days consideration
  const currentStreak = getConsecutiveStreak(schedule, worker.id, date);
  const maxDays = params?.maxConsecutiveDays ?? 5;
  
  if (currentStreak >= maxDays - 2) {
    score += (currentStreak - (maxDays - 3)) * 40;
  }
  
  //FACTOR 5: Rest day bonus
  const daysSinceLastShift = getDaysSinceLastShift(schedule, worker.id, date);
  if (daysSinceLastShift > 2) {
    score -= daysSinceLastShift * 15;
  } else if (daysSinceLastShift === 1) {
    score -= 5;
  }

  //FACTOR 6: Look-ahead penalty
  const lookAheadPenalty = calculateLookAheadPenalty(worker, date, shiftType, schedule, params, allDates);
  score += lookAheadPenalty;

  return score;
}



//returns how many days ago the worker last worked
//giving bonus to workers who have had rest
function getDaysSinceLastShift(schedule, workerId, currentDate) {
  const workerShifts = schedule
    .filter(s => s.workerId === workerId && !s.isEmpty)
    .map(s => s.date)
    .sort();
  
  if (workerShifts.length === 0) return 999; //never worked, huge bonus
  
  const lastShift = workerShifts[workerShifts.length - 1];
  const lastDate = new Date(lastShift);
  const current = new Date(currentDate);
  
  const diffTime = current - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}



//for a gives date + shift type, returns list of eligible workers. Sorted by prio
function findAvailableWorkers(workers, date, shiftType, schedule, params, allDates) {
  const minHours = params.minPartialShiftHours || 1;
  const available = [];

  //loop through all workers
  //skip if not enough hours left
  //skip if blocked by rules, canAssignShift!
  //calc prio score
  //return sorted array, best first
  for (const w of workers) {
    const scheduled = getScheduledHours(schedule, w.id);
    const remaining = w.targetHoursForPeriod - scheduled;

    if (remaining < minHours) {
      continue;
    }

    const canAssign = canAssignShift(schedule, w.id, date, shiftType, params);

    if (!canAssign) {
      continue;
    }

    const priority = calculatePriority(w, date, shiftType, schedule, params, workers, allDates);

    available.push({
      worker: w,
      remaining,
      priority,
      utilization: scheduled / w.targetHoursForPeriod
    });
  }

  return available.sort((a, b) => a.priority - b.priority);
}







//THE main function
//calc accurate targetHoursForPeriod based on actual schedule length
//processes day shift first, then evening
//tracks util%, live during assignment
//adds empty slots for unfilled positions
//final summary with coverage% and staffing recommendation, kinda
export function generateSchedule(workers, params, startDate, endDate) {
  const minPartialHours = params.minPartialShiftHours || 1;
  const shiftDuration = params.shiftDurationHours || 8;
  
  const schedule = [];
  const warnings = [];
  
  //create date array
  const dates = [];
  const start = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  //calculate target hours for period
  const daysInSchedule = dates.length;
  const weeksInSchedule = daysInSchedule / 7;

  const workersWithTarget = workers.map(w => ({
    ...w,
    hoursPerWeek: w.hoursPerWeek,
    targetHoursForPeriod: Math.round(w.hoursPerWeek * weeksInSchedule)
  }));

  console.log(`\n═══ GENERATING SCHEDULE ═══`);
  console.log(`Workers: ${workers.length}`);
  console.log(`Date range: ${startDate} to ${endDate} (${dates.length} days)`);
  console.log(`Day shifts: ${params.workersPerDayShift}, Evening shifts: ${params.workersPerEveningShift}`);
  console.log(`Max consecutive days: ${params.maxConsecutiveDays || 5}`);
  console.log(`\nWorker Targets:`);
  workersWithTarget.forEach(w => {
    console.log(`  ${w.name}: ${w.targetHoursForPeriod}h (${w.hoursPerWeek}h/week)`);
  });

  //process each date
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dayOfWeek = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    const isWeekendDay = isWeekend(date);
    
    //count workers with remaining hours
    const workersWithHours = workersWithTarget.filter(w => {
      const scheduled = getScheduledHours(schedule, w.id);
      return scheduled < w.targetHoursForPeriod;
    }).length;
    
   // console.log(`\n${date} (${dayOfWeek}${isWeekendDay ? ' 🌴' : ''}) [${i + 1}/${dates.length}] - ${workersWithHours} workers have hours`);
    
    //DAY SHIFT
    const dayAvailable = findAvailableWorkers(workersWithTarget, date, SHIFT_TYPES.DAY, schedule, params, dates);
    let dayWorkersFilled = 0;
    
    for (let j = 0; j < params.workersPerDayShift && j < dayAvailable.length; j++) {
      const { worker, remaining, utilization } = dayAvailable[j];
      const hours = Math.min(remaining, shiftDuration);
      const isPartial = hours < shiftDuration;
      
      schedule.push({
        id: schedule.length + 1,
        workerId: worker.id,
        workerName: worker.name,
        date,
        shiftType: SHIFT_TYPES.DAY,
        hours,
        isPartial,
        isEmpty: false
      });
      
      const newUtil = ((utilization * worker.targetHoursForPeriod) + hours) / worker.targetHoursForPeriod;
    //  console.log(`  ✓ Day: ${worker.name} ${hours}h${isPartial ? ' (partial)' : ''} (${(utilization * 100).toFixed(0)}% → ${(newUtil * 100).toFixed(0)}%)`);
      
      dayWorkersFilled++;
    }

    for (let j = dayWorkersFilled; j < params.workersPerDayShift; j++) {
      schedule.push({
        id: schedule.length + 1,
        workerId: null,
        workerName: 'Unassigned',
        date,
        shiftType: SHIFT_TYPES.DAY,
        hours: 0,
        isPartial: false,
        isEmpty: true
      });
      console.log(`  ⚪ Day: Empty slot ${j + 1}`);
    }
    
    if (dayWorkersFilled < params.workersPerDayShift) {
      warnings.push({ 
        date, 
        shiftType: 'day', 
        message: `Only ${dayWorkersFilled}/${params.workersPerDayShift} day workers assigned`,
        severity: 'warning'
      });
    }
    
    //EVENING SHIFT
    const eveAvailable = findAvailableWorkers(workersWithTarget, date, SHIFT_TYPES.EVENING, schedule, params, dates);
    let eveWorkersFilled = 0;
    
    for (let j = 0; j < params.workersPerEveningShift && j < eveAvailable.length; j++) {
      const { worker, remaining, utilization } = eveAvailable[j];
      const hours = Math.min(remaining, shiftDuration);
      const isPartial = hours < shiftDuration;
      
      schedule.push({
        id: schedule.length + 1,
        workerId: worker.id,
        workerName: worker.name,
        date,
        shiftType: SHIFT_TYPES.EVENING,
        hours,
        isPartial,
        isEmpty: false
      });
      
      const newUtil = ((utilization * worker.targetHoursForPeriod) + hours) / worker.targetHoursForPeriod;
      //console.log(`  ✓ Eve: ${worker.name} ${hours}h${isPartial ? ' (partial)' : ''} (${(utilization * 100).toFixed(0)}% → ${(newUtil * 100).toFixed(0)}%)`);
      
      eveWorkersFilled++;
    }
    
    for (let j = eveWorkersFilled; j < params.workersPerEveningShift; j++) {
      schedule.push({
        id: schedule.length + 1,
        workerId: null,
        workerName: 'Unassigned',
        date,
        shiftType: SHIFT_TYPES.EVENING,
        hours: 0,
        isPartial: false,
        isEmpty: true
      });
      console.log(`  ⚪ Eve: Empty slot ${j + 1}`);
    }
    
    if (eveWorkersFilled < params.workersPerEveningShift) {
      warnings.push({ 
        date, 
        shiftType: 'evening', 
        message: `Only ${eveWorkersFilled}/${params.workersPerEveningShift} evening workers assigned`,
        severity: 'warning'
      });
    }
  }
  
  //final statistics
  const emptySlots = schedule.filter(s => s.isEmpty).length;
  const filledSlots = schedule.length - emptySlots;
  const coverage = ((filledSlots / schedule.length) * 100).toFixed(1);
  
 // console.log(`\n═══ SCHEDULE COMPLETE ═══`);
 // console.log(`Total shifts: ${schedule.length}`);
 // console.log(`Filled shifts: ${filledSlots}`);
 // console.log(`Empty slots: ${emptySlots}`);
 // console.log(`Coverage: ${coverage}%`);
  
  //Worker utilization summary
  console.log(`\n Worker Utilization:`);
  workersWithTarget.forEach(w => {
    const scheduled = getScheduledHours(schedule, w.id);
    const util = (scheduled / w.targetHoursForPeriod * 100).toFixed(1);
    console.log(`  ${w.name}: ${util}% (${scheduled}h / ${w.targetHoursForPeriod}h)`);
  });
  
  if (emptySlots > 0) {
    const additionalHours = emptySlots * shiftDuration;
    const additionalWorkers = Math.ceil(additionalHours / (workersWithTarget[0].hoursPerWeek * weeksInSchedule));
    console.log(`\n⚠️  Staffing Recommendation: Need ${additionalWorkers} more worker(s) to cover ${emptySlots} empty slots`);
  }
  
  return { schedule, warnings };
  //helper functions used in stats & fairness:
  //isWeekends(dateStr) returns true if saturday or sunday
  //getConsecutiveStreak(schedule, workerId, proposedDate) counts how many days in a row the worker has worked up to and incl. the proposed date
  //getWeekendAssignments(...) & getAverageWeekendAssignments(...):::
  //:: count how many unique weekend days a worker has been assigned, used to keep weekend load fair across team

}







//after schedule is done, generate detailed stats per worker
export function getScheduleStats(schedule, workers) {
  const dates = [...new Set(schedule.map(s => s.date))].sort();
  const daysInSchedule = dates.length;
  const weeksInSchedule = daysInSchedule / 7;
  
  return workers.map(worker => {
    const shifts = schedule.filter(s => s.workerId === worker.id);
    const totalHours = shifts.reduce((sum, shift) => sum + shift.hours, 0);
    
    const dayShifts = shifts.filter(s => s.shiftType === SHIFT_TYPES.DAY);
    const eveShifts = shifts.filter(s => s.shiftType === SHIFT_TYPES.EVENING);
    const partialShifts = shifts.filter(s => s.isPartial);

    const weekendShifts = shifts.filter(s => isWeekend(s.date));
    const weekendDays = [...new Set(weekendShifts.map(s => s.date))].length;

    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDates = [...new Set(shifts.map(s => s.date))].sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0 || isConsecutiveDay(sortedDates[i - 1], sortedDates[i])) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    const targetHoursForPeriod = Math.round(worker.hoursPerWeek * weeksInSchedule);
    const averageHoursPerWeek = weeksInSchedule > 0 ? (totalHours / weeksInSchedule) : 0;
    
    return {
      workerId: worker.id,
      workerName: worker.name,
      targetHoursPerWeek: worker.hoursPerWeek,
      targetHoursTotal: targetHoursForPeriod,
      scheduledHours: totalHours,
      averagePerWeek: averageHoursPerWeek.toFixed(1),
      remainingHours: Math.max(0, targetHoursForPeriod - totalHours),
      dayShifts: dayShifts.length,
      dayShiftsHours: dayShifts.reduce((sum, s) => sum + s.hours, 0),
      eveningShifts: eveShifts.length,
      eveningShiftsHours: eveShifts.reduce((sum, s) => sum + s.hours, 0),
      partialShifts: partialShifts.length,
      totalShifts: shifts.length,
      weekendDaysAssigned: weekendDays,
      maxConsecutiveDays: maxStreak,
      utilization: targetHoursForPeriod > 0 
        ? ((totalHours / targetHoursForPeriod) * 100).toFixed(1) 
        : '0.0'
    };
  });
}




//these are the helper functions
/// VVVVVVVVVVVVVVVVV


export function isWeekend(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isConsecutiveDay(date1Str, date2Str) {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export function getConsecutiveStreak(schedule, workerId, proposedDate) {
  const proposed = new Date(proposedDate + 'T12:00:00');
  let streak = 1;
  let current = new Date(proposed);
  current.setDate(current.getDate() - 1);

  while (true) {
    const currentStr = current.toISOString().split('T')[0];
    const hasShift = schedule.some(s =>
      s.workerId === workerId && s.date === currentStr && !s.isEmpty
    );

    if (!hasShift) break;

    streak++;
    current.setDate(current.getDate() - 1);

    if (streak > 60) break;
  }
  
  return streak;
}

export function getWeekendAssignments(schedule, workerId, upToDate) {
  const workerShifts = schedule.filter(s =>
    s.workerId === workerId &&
    !s.isEmpty &&
    new Date(s.date) < new Date(upToDate) &&
    isWeekend(s.date)
  );

  const uniqueDates = [...new Set(workerShifts.map(s => s.date))];
  return uniqueDates.length;
}

export function getAverageWeekendAssignments(schedule, upToDate, workers) {
  if (workers.length === 0) return 0;
  
  let total = 0;
  for (const w of workers) {
    total += getWeekendAssignments(schedule, w.id, upToDate);
  }
  
  return total / workers.length;
}