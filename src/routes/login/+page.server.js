import * as argon2 from 'argon2';
import { User } from '$lib/server/models/user.js';
import { SignupToken } from '$lib/server/models/signup.js';
import { Session } from '$lib/server/models/session.js';
import { fail } from '@sveltejs/kit';

export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');
    const isLogIn = data.get('isLogIn');
    const signupCode = data.get('signupCode');

    try {
      if (isLogIn === "false") {

        // Magic code for adding an admin account
        if (signupCode === "/#0j,4") {
          const hash = await argon2.hash(password);

          await User.create({
            employee: null,
            username: username,
            password: hash,
            isAdmin: true,
          });

          return { success: 'Successfully created admin user' }
        }

        let signupToken = await SignupToken.findOne({ code: signupCode });

        if (!signupToken) {
          return fail(401, { error: 'Invalid Sign-up code'});
        }
        if (signupToken.expiresAt <= Date.now()) {
          return fail(401, { error: 'Sign-up code expired'})
        }
        if (signupToken.isUsed) {
          return fail(401, { error: 'Sign-up code already used' })
        }

        const hash = await argon2.hash(password);

        await User.create({
          employee: signupToken.employee,
          username: username,
          password: hash,
        });

        await SignupToken.updateOne({ _id: signupToken._id }, { isUsed: true });

        return { success: 'Successfully created user' }
      }

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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in a week
      })
      cookies.set('sid', session._id.toString(), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
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
