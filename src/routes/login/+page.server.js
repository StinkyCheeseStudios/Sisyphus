import * as argon2 from 'argon2';
import { User } from '$lib/server/models/user.js';
import { Session } from '$lib/server/models/session.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    try {
      // Try to find user by username in database
      const user = await User.findOne({ username });
      // If username is not found then return a fail with an error message to be displayed on the page
      if (!user) {
        return fail(401, { error: 'Invalid username or password.' });
      }

      // If the username was found, check that the password hashes match
      const valid = await argon2.verify(user.password, password);
      // If they did not match return a fail again.
      if (!valid) {
        return fail(401, { error: 'Invalid username or password.' });
      }

      // At this point we know the user entered correct login credentials.
      // So we can set a session in the DB and set the cookie.
      const session = await Session.create({
        userId: user._id,
        expiresAt: new Date(Date.now() + 30*60*1000) // 30 min in ms
      })
      cookies.set('sid', session._id.toString(), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 60 // 30 minutes in seconds
      });
      
      // This can be changed to redirect to an appropriate page later
      return { success: 'Successfully logged in!' };
    }
    catch (err) {
      console.error('Error logging in: ', err);
      return fail(500, { error: 'Server error. Please try again later.' });
    }
  }
};
