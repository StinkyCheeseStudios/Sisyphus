import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.user.isAdmin) {
    throw redirect(307, '/login?unauthorized=1');
  }
}