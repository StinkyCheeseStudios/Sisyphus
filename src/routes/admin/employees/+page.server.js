import { 
  getAllWorkers, 
  createWorker, 
  deleteWorker, 
  updateWorker 
} from "$lib/server/workerService";

import { SignupToken } from "$lib/server/models/signup.js";
import { connectToDatabase } from "$lib/server/db.js";
import { fail } from "@sveltejs/kit";

export async function load() {
  try {
    await connectToDatabase();

    const workers = await getAllWorkers();

    const workerIds = workers.map(w => w.id);

    const tokens = await SignupToken
      .find({ employee: { $in: workerIds } })
      .select("employee code isUsed expiresAt")
      .lean();

    const tokenMap = new Map(
      tokens.map(t => [t.employee.toString(), {
        code: t.code,
        isUsed: t.isUsed,
        isExpired: t.expiresAt <= Date.now(),
      }])
    );

    const workersWithCode = workers.map(w => ({
      id: w.id,
      name: w.name,
      hoursPerWeek: w.hoursPerWeek,
      signupCode: tokenMap.get(w.id)?.code || null,
      signupUsed: tokenMap.get(w.id)?.isUsed || false,
      signupExpired: tokenMap.get(w.id)?.isExpired ?? true,
    }));

    return { workers: workersWithCode };
  } catch (err) {
    console.error('Error loading data:', err);
  }
}


export const actions = {
  createEmployee: async ({ request, locals }) => {
    if (!locals.user.isAdmin) {
      return fail(307, { error: "Unauthorized! Not on an admin user account!"});
    }

    try {
      const formData = await request.formData();

      const name = formData.get("name");
      const hours = formData.get("hours");
      const code = formData.get("code");

      const addedEmployeesName = formData.getAll("addedEmployeesName");
      const addedEmployeesHours = formData.getAll("addedEmployeesHours");
      const addedEmployeesCode = formData.getAll("addedEmployeesCode");
  
      let addedEmployees = addedEmployeesName.map((n, i) => ({
        name: n,
        hours: Number(addedEmployeesHours[i]),
        code: addedEmployeesCode[i],
      }));
      addedEmployees.push({
        name,
        hours,
        code
      })

      const newWorker = await createWorker(name, hours);

      await SignupToken.create({
        employee: newWorker.id,
        code: code,
        employeeName: newWorker.name,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      return { 
        creationSuccess: "Successfully created worker and signup token!",
        addedEmployees: addedEmployees,
      }
    }
    catch (err) {
      console.log(err);

      return fail(500, { error: "Something went wrong while saving worker"});
    }
  },

  deleteEmployee: async ({ request, locals }) => {
    if (!locals.user.isAdmin) {
      return fail(307, { error: "Unauthorized! Not on an admin user account!"});
    }

    try {
      const formData = await request.formData();
      const id = formData.get("id");

      const isSuccess = await deleteWorker(id);

      if (!isSuccess) {
        return fail(500, { error: "Unable to successfully delete worker" })
      }
      
      await SignupToken.deleteOne({ employee: id });

      return { deleteSuccess: "Worker successfully deleted" }
    }
    catch (err) {
      console.log(err);
      return fail(500, { error: "Something went wrong while deleting worker"});
    }
  },

  modifyEmployee: async ({ request, locals }) => {
    if (!locals.user.isAdmin) {
      return fail(307, { error: "Unauthorized! Not on an admin user account!"});
    }

    try {
      const formData = await request.formData();
      const id = formData.get("id");
      const name = formData.get("name");
      const hours = formData.get("hours");

      const isSuccess = await updateWorker(id, name, hours);

      if (!isSuccess) {
        return fail(500, { error: "Unable to successfully modify worker" })
      }

      await SignupToken.updateOne(
        { employee: id },
        { $set: { employeeName: name } }
      );

      return { modifySuccess: "Successfully modified employee data" }
    }
    catch (err) {
      console.log(err);
      return fail(500, { error: "Something went wrong while modifying worker"});
    }
  },

  resetSignupToken: async ({ request, locals }) => {
    if (!locals.user.isAdmin) {
      return fail(307, { error: "Unauthorized! Not on an admin user account!"});
    }

    try {
      const formData = await request.formData();
      const id = formData.get("id");

      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await SignupToken.updateOne(
        { employee: id },
        { $set: { expiresAt: newExpiry } }
      );

      return { tokenResetSuccess: "Successfully reset token expiry" }
    }
    catch (err) {
      console.log(err);
      return fail(500, { error: "Something went wrong while resetting signup token expiry"});
    }
  }
}