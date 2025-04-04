import { verify } from 'argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { login } from '$lib/schemas/login';
import { getUser } from '$lib/server/backend/user';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}

	return {
		form: await superValidate(zod(login)),
		title: 'Sign In | '
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(login));
		if (!form.valid) {
			return fail(400, {
				message: 'I dati inseriti non sono validi',
				form
			});
		}

		const results = await getUser(form.data.email);

		const existingUser = results.at(0);
		if (!existingUser || existingUser.pending) {
			return fail(400, {
				message: 'Email o password errati',
				form
			});
		}

		const validPassword = await verify(existingUser.passwordHash, form.data.password, {});

		if (!validPassword) {
			return fail(400, {
				message: 'Email o password errati',
				form
			});
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		if (existingUser.isAdmin) {
			return redirect(302, '/dashboard');
		}
		return redirect(302, '/');
	}
};
