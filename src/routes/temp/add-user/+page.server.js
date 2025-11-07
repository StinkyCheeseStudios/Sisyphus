import * as argon2 from 'argon2';
import { User } from '$lib/server/models/user.js';
import { fail, redirect } from '@sveltejs/kit';

export function load({ locals }) {
  if (!locals.user) {
    throw redirect(307, '/login');
  }
  if (locals.user.isAdmin === true) {
    console.log("User is an admin!")
  } else {
    console.log("User is NOT NOT NOT an admin!")
  }
}

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized!' });
    }

    const data = await request.formData();

    const username = data.get("username");
    const password = data.get("password");
    const isAdmin = data.get("admin") === "true";

    const hash = await argon2.hash(password);

    try {
      await User.create({
        username,
        password: hash,
        isAdmin
      });
    }
    catch (err) {
      console.error('Error saving user: ', err);
      return fail(422, {
        error: err.message || 'Unknown error'
      })
    }
    
    return { success: "Successfully created user!" }
  }
}
