
//this is to avoid typos! and it is easy reference, just need to change in one place!
//used everywhere in file,   whenever we need to specify or check SHIFT TYPES!


const SHIFT_TYPES = {
    DAY: 'day',
    EVENING: 'evening'
  };

 // let schedule = [];
 // let dayCountCount = 0;
 // let dayAssigned = 0;


//returns true, if the worker CAn be assigned to (this) shift, false if they are BLOCKED (breaks rule)
export function canAssignShift(schedule, workerId, date, shiftType){
  //Rule 1! cant work twice on the same day
  const alreadyWorking = schedule.some(s =>
    s.workerId === workerId && s.date === date //look thruy all existing shifts in the sched
  );                                            //checks if this worker already as shift on this date, returns yes if so
  if (alreadyWorking) return false;


  //Rule 2! cant do Day to Evening   and   Evenning to Day back to back thingy
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1); //get previous date
  const prevDateStr =prevDate.toISOString().split('T')[0]; //converting to string
                                                     
  //find what they worked yesterday        
  const prevShift = schedule.find(s =>
    s.workerId === workerId && s.date === prevDateStr
  );


  //this calculates yesterdays dates and checks if the worker HAD a shift
  if(prevShift){
    //day yesterday -> cant do evening today!
    if(prevShift.shiftType === SHIFT_TYPES.DAY && shiftType === SHIFT_TYPES.EVENING){
      return false; //cant assign!
    }

    //same but for evening!
    if(prevShift.shiftType === SHIFT_TYPES.EVENING && shiftType === SHIFT_TYPES.DAY){
      return false; //cant assign 
    }

  }
    return true; // IF WE GET HERE, ALL RULES PASSED

}

//Calculates the total number of hours worker has ALREADY been scheduled for in the current schedule
//this returns a number representing TOTAl hours scheduled for THIS worker, esim. 22, 40, 35 etc
/** 
* @param {Array} schedule
* @param {string|number} workerId
* @returns {number}
*/
export function getScheduledHours(schedule, workerId){
  return schedule.filter(s => s.workerId === workerId) //find all shifts for this worker
  .reduce((sum, s) => sum + s.hours, 0); //reduce, sum up all the hours!

  //takes the full schedule ARRAY and keeps only shifts where the workerID matches

  //the reduce()method combines all values into a single result

}



//Counts how many shitfs of a specific type (day or evening) a worker has been assigned
export function getShiftTypeCount(schedule, workerId, shiftType){
  return schedule.filter(s => s.workerId === workerId && s.shiftType === shiftType)
  .length; //this returns a number of how many shifts of this type the worker has
}  




//Calculates a "priority score" for a worker to determine who should be assigned to a shift
//lower scores mean higher prio!
export function calculatePriority(worker, date, shiftType, schedule, params){
  const scheduled = getScheduledHours(schedule, worker.id);
  const remaining = worker.hoursPerWeek - scheduled;

  let score = 0;
  score -= remaining * 100; //more remaining hours = lower score = higher prio!
                            //this is the most important factor! adjust if needed, maybe..
  
  //factor 2, Shift type balance
  const dayCount = getShiftTypeCount(schedule, worker.id, SHIFT_TYPES.DAY);
  const eveCount = getShiftTypeCount(schedule, worker.id, SHIFT_TYPES.EVENING);

  if(shiftType === SHIFT_TYPES.DAY && dayCount > eveCount){
    score += 50; //penalize!
  }

  if(shiftType === SHIFT_TYPES.EVENING && eveCount> dayCount){
    score += 50; //penalize!
  }
  //so this factor 2 counts how many days vs evenings shift the worker already has,
  //if we are assigning a Day shift and they already have more day shifts than evening, penalty +50
  //same for evening

  return score;

}



//finds all workers who CAN work a specific shift, then sorts them by priority to determine the
//best canditate
function findAvailableWorkers(workers, date, shiftType, schedule, params){
  //returns an array of workers with priority information!
  //sorted by priority!

  //Checks every worker to see if they are available
  //filter out workers who cant work (not enough hours or blocked by rules)
  //calc prio for each available worker
  //sort by prio! then return the sorted list


  const minHours = params.minPartialShiftHours || 2; //get minim hours a worker MUST have remaining
                                                  // to be considered, 2 is default, we dont assing workers
                                                  // with 0.5 hours, it makes no sense!

  console.log(' checking all workers for ${shiftType} shift: ');


  //Step 2 Loop through each worker
  const available = [];

  for (const w of workers) {
    const scheduled = getScheduledHours(schedule, w.id);
    const remaining = w.hoursPerWeek - scheduled;
    
    // Check hours
    if (remaining < minHours) {
      console.log(`    ✗ ${w.name}: Not enough hours (${remaining}h left, need ${minHours}h min)`);
      continue;
    }
    
    // Check rest rules
    if (!canAssignShift(schedule, w.id, date, shiftType)) {
      // Find out WHY they are blocked
      const alreadyWorking = schedule.some(s => s.workerId === w.id && s.date === date);
      if (alreadyWorking) {
        console.log(`    ✗ ${w.name}: Already working today`);
        continue;
      }
      
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      const prevShift = schedule.find(s => s.workerId === w.id && s.date === prevDateStr);
      
      if (prevShift) {
        console.log(`    ✗ ${w.name}: Blocked (worked ${prevShift.shiftType} yesterday)`);
      }
      continue;
    }
    
    // Worker is available!
    console.log(`    ✓ ${w.name}: Available (${remaining}h remaining)`);
    
    available.push({
      worker: w,
      remaining,
      priority: calculatePriority(w, date, shiftType, schedule, params)
    });
  }
  
  return available.sort((a, b) => a.priority - b.priority);
}





//"main function"
//the main entry point that generates a complete schedule for a date range
export function generateSchedule(workers, params, startDate, endDate) {
//returns an object with two properties
//array of shift assignments and array of problems encountered
  const minPartialHours = params.minPartialShiftHours || 2;
  const shiftDuration = params.shiftDurationHours || 8;
  
  const schedule = [];
  const warnings = [];
  
  // Create date array
  const dates = [];
  const start = new Date(startDate + 'T12:00:00'); //to avoid timezone issue
  const end = new Date(endDate + 'T12:00:00');
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  console.log(`\n=== GENERATING SCHEDULE ===`);
  console.log(`Workers: ${workers.length}`);
  console.log(`Date range: ${startDate} to ${endDate}`);
  console.log(`Dates generated: ${dates.length}`);
  console.log(`All dates:`, dates);
  console.log(`Day shifts needed: ${params.workersPerDayShift} per day`);
  console.log(`Evening shifts needed: ${params.workersPerEveningShift} per day`);

  //process each date !!
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dayOfWeek = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    
    console.log(`\n--- Processing ${date} (${dayOfWeek}) [${i + 1}/${dates.length}] ---`);
    
    // ===== DAY SHIFT =====
    console.log(`\nDay shift (need ${params.workersPerDayShift} workers):`);
    
    const dayAvailable = findAvailableWorkers(workers, date, SHIFT_TYPES.DAY, schedule, params);
    console.log(`  Available: ${dayAvailable.length} workers`);
    
    const dayAssigned = [];
    let dayWorkersFilled = 0;
    

    // assign available workers!
    for (let i = 0; i < params.workersPerDayShift && i < dayAvailable.length; i++) {
      const { worker, remaining } = dayAvailable[i];
      const hours = Math.min(remaining, shiftDuration);
      
      schedule.push({
        id: schedule.length + 1,
        workerId: worker.id,
        workerName: worker.name,
        date,
        shiftType: SHIFT_TYPES.DAY,
        hours,
        isPartial: hours < shiftDuration,
        isEmpty: false
      });
      
      dayAssigned.push(`${worker.name} (${hours}h)`);
      dayWorkersFilled++;
      console.log(`  ✓ Assigned: ${worker.name} - ${hours}h`);
    }

    //creating empty slots for unfilled positions!!
    for(let i = dayWorkersFilled; i < params.workersPerDayShift; i++){
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
      console.log(`  ○ Empty slot ${i + 1}`);
    }

    
    if (dayAssigned.length < params.workersPerDayShift) {
      const msg = `Only ${dayAssigned.length}/${params.workersPerDayShift} day workers assigned`;
      console.log(`  ⚠️ ${msg}`);
      warnings.push({ date, shiftType: 'day', message: msg });
    }
    
    // ===== EVENING SHIFT =====
    console.log(`\nEvening shift (need ${params.workersPerEveningShift} workers):`);
    
    const eveAvailable = findAvailableWorkers(workers, date, SHIFT_TYPES.EVENING, schedule, params);
    console.log(`  Available: ${eveAvailable.length} workers`);
    
    const eveAssigned = [];
    let eveWorkersFilled = 0;
    
    for (let i = 0; i < params.workersPerEveningShift && i < eveAvailable.length; i++) {
      const { worker, remaining } = eveAvailable[i];
      const hours = Math.min(remaining, shiftDuration);
      
      schedule.push({
        id: schedule.length + 1,
        workerId: worker.id,
        workerName: worker.name,
        date,
        shiftType: SHIFT_TYPES.EVENING,
        hours,
        isPartial: hours < shiftDuration,
        isEmpty: false
      });
      
      eveAssigned.push(`${worker.name} (${hours}h)`);
      eveWorkersFilled++;
      console.log(`  ✓ Assigned: ${worker.name} - ${hours}h`);
    }
    
     // Create empty slots for unfilled positions
     for (let i = eveWorkersFilled; i < params.workersPerEveningShift; i++) {
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
      console.log(`  ○ Empty slot ${i + 1}`);
    }
    
    if (eveWorkersFilled < params.workersPerEveningShift) {
      const msg = `Only ${eveWorkersFilled}/${params.workersPerEveningShift} evening workers assigned`;
      console.log(`  ⚠️ ${msg}`);
      warnings.push({ date, shiftType: 'evening', message: msg, severity: 'warning' });
    }
  }
  
  console.log(`\n=== SCHEDULE COMPLETE ===`);
  console.log(`Total shifts assigned: ${schedule.length}`);
  console.log(`Warnings: ${warnings.length}\n`);
  
  return { schedule, warnings };
}




//Takes completed schedule and calculates stats for each worker
export function getScheduleStats(schedule, workers){
  //this one return an array of statistic objects, one per worker

  return workers.map(worker => {
    const shifts = schedule.filter(s => s.workerId === worker.id); // filter schedule to only get this workers shifts
    const totalHours = shifts.reduce((sum,s) => sum + s.hours, 0);//calc total hours

    const dayShifts = shifts.filter(s => s.shiftType === SHIFT_TYPES.DAY);
    const eveShifts = shifts.filter(s => s.shiftType === SHIFT_TYPES.EVENING);
    const partialShifts = shifts.filter(s => s.isPartial); //partial meaning ANY type eve or day

    //construsct the return object with all the calculated values!!
    return {
      workerId: worker.id,
      workerName: worker.name,
      targetHours: worker.hoursPerWeek,
      scheduledHours: totalHours,
      remainingHours: Math.max(0, worker.hoursPerWeek - totalHours),
      dayShifts: dayShifts.length,
      dayShiftsHours: dayShifts.reduce((sum, s) => sum + s.hours, 0),
      eveningShifts: eveShifts.length,
      eveningShiftsHours: eveShifts.reduce((sum, s) => sum + s.hours, 0),
      partialShifts: partialShifts.length,
      totalShifts: shifts.length,
      utilization: worker.hoursPerWeek > 0 
        ? ((totalHours / worker.hoursPerWeek) * 100).toFixed(1) 
        : '0.0'
    };
  }) 



}
