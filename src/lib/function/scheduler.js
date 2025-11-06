
//this is to avoid typos! and it is easy reference, just need to change in one place!
//used everywhere in file,   whenever we need to specify or check SHIFT TYPES!
const SHIFT_TYPES = {
    DAY: 'day',
    EVENING: 'evening'
  };



//returns true, if the worker CAn be assigned to (this) shift, false if they are BLOCKED (breaks rule)
export function canAssignShift(schedule, workerId, date, shiftType){
  //Rule 1! cant work twice on the same day
  const alreadyWorking = schedule.some(s =>
    s.worker.Id === workerid && s.date === date //look thruy all existing shifts in the sched
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
export function getScheduledHours(schedule, workerId){
  return schedule.filters(s => s.workerId === workerId) //find all shifts for this worker
  .reduce((sum, s) => sum + s.hours, 0); //reduce, sum up all the hours!

  //takes the full schedule ARRAY and keeps only shifts where the workerID matches

  //the reduce()method combines all values into a single result

}




export function getShiftTypeCount(){} //schedule, workerId, shiftType

export function calculatePriority(){} //worker, date, shiftType, schedule, params

export function findAvailableWorkers(){} //workers, date, shiftType, schedule, params

export function generateSchedule(){} //workers, params, startDate, endDate

export function getScheduleStats(){} //schedule , workers
