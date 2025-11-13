import { connectToDatabase } from '$lib/server/db';
import { Worker } from '$lib/models/workers.js';

/**
 * Get all workers from database
 * @returns {Promise<Array>} Array of worker objects
 */
export async function getAllWorkers() {
  await connectToDatabase();
  //console.log("called");
  const workers = await Worker.find({}).sort({ createdAt: 1 }).lean();
  
  // Convert MongoDB _id to plain id for easier use
  return workers.map(w => ({
    id: w._id.toString(),
    name: w.name,
    hoursPerWeek: w.hoursPerWeek
  }));
}

/**
 * Get a single worker by ID
 * @param {string} workerId - Worker ID
 * @returns {Promise<Object|null>} Worker object or null
 */
export async function getWorkerById(workerId) {
  await connectToDatabase();
  
  const worker = await Worker.findById(workerId).lean();
  
  if (!worker) return null;
  
  return {
    id: worker._id.toString(),
    name: worker.name,
    hoursPerWeek: worker.hoursPerWeek
  };
}

/**
 * Create a new worker
 * @param {string} name - Worker name
 * @param {number} hoursPerWeek - Target hours per week
 * @returns {Promise<Object>} Created worker object
 */
export async function createWorker(name, hoursPerWeek) {
  await connectToDatabase();
  
  const worker = await Worker.create({
    name: name.trim(),
    hoursPerWeek: parseFloat(hoursPerWeek)
  });
  
  return {
    id: worker._id.toString(),
    name: worker.name,
    hoursPerWeek: worker.hoursPerWeek
  };
}

/**
 * Update a worker
 * @param {string} workerId - Worker ID
 * @param {string} name - New name
 * @param {number} hoursPerWeek - New hours per week
 * @returns {Promise<Object|null>} Updated worker or null
 */
export async function updateWorker(workerId, name, hoursPerWeek) {
  await connectToDatabase();
  
  const worker = await Worker.findByIdAndUpdate(
    workerId,
    {
      name: name.trim(),
      hoursPerWeek: parseFloat(hoursPerWeek)
    },
    { new: true }  // Return updated document
  ).lean();
  
  if (!worker) return null;
  
  return {
    id: worker._id.toString(),
    name: worker.name,
    hoursPerWeek: worker.hoursPerWeek
  };
}

/**
 * Delete a worker (hard delete)
 * @param {string} workerId - Worker ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteWorker(workerId) {
  await connectToDatabase();
  
  const result = await Worker.findByIdAndDelete(workerId);
  
  return result !== null;
}