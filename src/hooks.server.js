import { connectToDatabase } from "$lib/server/db";
import { Session } from "$lib/server/models/session";
import { User } from "$lib/server/models/user";

await connectToDatabase();

export const handle = async ({ event, resolve }) => {
  const sid = event.cookies.get('sid');

  // Clear event locals on each request to make sure an old user object does not remain
  //   if session is invalid
  event.locals.user = null;

  // --- If no session cookie, just continue straight to the page.
  if (!sid) {
    return resolve(event);
  } 

  try {
    const session = await Session.findById(sid).lean();

    // --- If session is not valid, delete cookie and continue to page.
    if (!session || !session.expiresAt > new Date()) {
      event.cookies.delete('sid', { path: '/' });
      return resolve(event);
    }

    // --- At this point we know the session is valid so we can set user on locals
    const user = await User.findById(session.userId);

    event.locals.user = {
      id: session.userId.toString(),
      isAdmin: user.isAdmin
    };
  }
  catch (err) {
    console.error('Session error:', err);
    event.cookies.delete('sid', { path: '/' });
  }
  
  // Continue to page.
  return resolve(event);
}