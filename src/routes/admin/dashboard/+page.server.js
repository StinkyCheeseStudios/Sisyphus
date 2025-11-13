import { fail } from '@sveltejs/kit';
import { getAllWorkers, createWorker, updateWorker, deleteWorker } from '$lib/server/workerService.js';
import { getScheduleParams, updateScheduleParams } from '$lib/server/paramsService.js';
import { getCurrentSchedule, saveSchedule } from '$lib/server/scheduleService.js';
import { generateSchedule, getScheduleStats } from '$lib/function/scheduler';

 //Load function runs on page load
 //Fetches initial data from database
export async function load() {
  try {
    console.log('📞 Calling getAllWorkers...');
    const workers = await getAllWorkers();
    console.log('✅ Workers fetched:', workers);
    
    console.log('📞 Calling getScheduleParams...');
    const params = await getScheduleParams();
    console.log('✅ Params fetched:', params);
    
    console.log('📞 Calling getCurrentSchedule...');
    const savedSchedule = await getCurrentSchedule();
  //const savedSchedule = await Schedule.findOne().lean().exec();

    console.log('✅ Schedule fetched:', savedSchedule);
   // console.log('Loaded data:', { workers, params, savedSchedule });
    

    return {
      workers,
      params,
      savedSchedule
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      workers: [],
      params: {
        workersPerDayShift: 2,
        workersPerEveningShift: 2,
        shiftDurationHours: 8,
        minPartialShiftHours: 2,
        maxWorkersPerShift: 4
      },
      savedSchedule: null
    };
  }
}


//Form actions - handle form submissions
export const actions = {

   // Add a new worker
   //this is going to be else where in the project, we can get rid of it later!
  addWorker: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const hoursPerWeek = formData.get('hoursPerWeek');
    
    // Validation
    if (!name || name.trim().length === 0) {
      return fail(400, { error: 'Worker name is required', field: 'name' });
    }
    
    if (!hoursPerWeek || isNaN(hoursPerWeek) || parseFloat(hoursPerWeek) <= 0) {
      return fail(400, { error: 'Valid hours per week is required', field: 'hoursPerWeek' });
    }
    
    try {
      const worker = await createWorker(name, hoursPerWeek);
      return { success: true, worker };
    } catch (error) {
      console.error('Error creating worker:', error);
      return fail(500, { error: 'Failed to create worker' });
    }
  },
  
    //Update a worker
  updateWorker: async ({ request }) => {
    const formData = await request.formData();
    const workerId = formData.get('workerId');
    const name = formData.get('name');
    const hoursPerWeek = formData.get('hoursPerWeek');
    
    // Validation
    if (!workerId) {
      return fail(400, { error: 'Worker ID is required' });
    }
    
    if (!name || name.trim().length === 0) {
      return fail(400, { error: 'Worker name is required', field: 'name' });
    }
    
    if (!hoursPerWeek || isNaN(hoursPerWeek) || parseFloat(hoursPerWeek) <= 0) {
      return fail(400, { error: 'Valid hours per week is required', field: 'hoursPerWeek' });
    }
    
    try {
      const worker = await updateWorker(workerId, name, hoursPerWeek);
      
      if (!worker) {
        return fail(404, { error: 'Worker not found' });
      }
      
      return { success: true, worker };
    } catch (error) {
      console.error('Error updating worker:', error);
      return fail(500, { error: 'Failed to update worker' });
    }
  },
  

   //Delete a worker
  deleteWorker: async ({ request }) => {
    const formData = await request.formData();
    const workerId = formData.get('workerId');
    
    if (!workerId) {
      return fail(400, { error: 'Worker ID is required' });
    }
    
    try {
      const deleted = await deleteWorker(workerId);
      
      if (!deleted) {
        return fail(404, { error: 'Worker not found' });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting worker:', error);
      return fail(500, { error: 'Failed to delete worker' });
    }
  },
  
   //Update schedule parameters
  updateParams: async ({ request }) => {
    const formData = await request.formData();
    
    const updates = {
      workersPerDayShift: parseInt(formData.get('workersPerDayShift')),
      workersPerEveningShift: parseInt(formData.get('workersPerEveningShift')),
      shiftDurationHours: parseFloat(formData.get('shiftDurationHours')),
      minPartialShiftHours: parseFloat(formData.get('minPartialShiftHours')),
      maxWorkersPerShift: parseInt(formData.get('maxWorkersPerShift'))
    };
    
    // Validation
    for (const [key, value] of Object.entries(updates)) {
      if (isNaN(value) || value <= 0) {
        return fail(400, { error: `Invalid value for ${key}` });
      }
    }
    
    try {
      const params = await updateScheduleParams(updates);
      return { success: true, params };
    } catch (error) {
      console.error('Error updating params:', error);
      return fail(500, { error: 'Failed to update parameters' });
    }
  },
  

   //Generate schedule (does NOT save to DB)
  generateSchedule: async ({ request }) => {
    const formData = await request.formData();
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
 //   console.log("called");
    // Validation
    if (!startDate || !endDate) {
      return fail(400, { error: 'Start and end dates are required' });
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      return fail(400, { error: 'Start date must be before end date' });
    }
    
    try {
      //fetch data from DB
      const workers = await getAllWorkers();
      const params = await getScheduleParams();
      
      if (workers.length === 0) {
        return fail(400, { error: 'No workers available. Please add workers first.' });
      }
      
      //generate schedule using the algorithm
      const { schedule, warnings } = generateSchedule(workers, params, startDate, endDate);
      
      //calculate statistics
      const stats = getScheduleStats(schedule, workers);
      
      return {
        success: true,
        generated: {
          startDate,
          endDate,
          schedule,
          warnings,
          stats
        }
      };
    } catch (error) {
      console.error('Error generating schedule:', error);
      return fail(500, { error: 'Failed to generate schedule', details: error.message });
    }
  },
  

   //Save generated schedule to database
  saveSchedule: async ({ request }) => {
    const formData = await request.formData();
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const shiftsJSON = formData.get('shifts');
    const warningsJSON = formData.get('warnings');
    
    if (!startDate || !endDate || !shiftsJSON) {
      return fail(400, { error: 'Missing required data' });
    }
    
    try {
      const shifts = JSON.parse(shiftsJSON);
      const warnings = warningsJSON ? JSON.parse(warningsJSON) : [];
      
      const saved = await saveSchedule(startDate, endDate, shifts, warnings);
      
      // Return the saved schedule in the same format as generateSchedule
      // so the UI doesn't break
      const workers = await getAllWorkers();
      const stats = getScheduleStats(shifts, workers);
      
      return { 
        success: true, 
        saved: true,
        generated: {  // Keep this structure so UI doesn't break
          startDate,
          endDate,
          schedule: shifts,
          warnings,
          stats
        }
      };
    } catch (error) {
      console.error('Error saving schedule:', error);
      return fail(500, { error: 'Failed to save schedule' });
    }
  },

  updateShift: async ({ request }) => {
    const formData = await request.formData();
    const shiftId = formData.get('shiftId');
    const newWorkerId = formData.get('workerId');
    const date = formData.get('date');
    const shiftType = formData.get('shiftType');
    
    // Validation:
    // 1. Check if worker already has a shift that day
    // 2. Check rest rules (Day→Evening, Evening→Day)
    // 3. Check if worker has hours remaining
    
    // If valid:
    // - Update the shift in database
    // - Return success
    
    // If invalid:
    // - Return error with reason
  }



};