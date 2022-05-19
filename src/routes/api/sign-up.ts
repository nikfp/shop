import { createSession, getUserByEmail, registerUser } from './_db';
import { serialize } from 'cookie';
import type { RequestHandler } from '@sveltejs/kit';

export const post: RequestHandler = async function ({ request }) {
	const { email, password } = await request.json();
	console.warn(
		'WARNING - Please set project up for proper password hashing and salting. DO NOT CONTINUE TO PRODUCTION WITH INITIAL SETUP!'
	);
	const user = await getUserByEmail(email);

	if (user) {
		return {
			status: 409,
			body: {
				message: 'User already exists'
			}
		};
	}

	// ⚠️ CAUTION: Do not store a plain password like this. Use proper hashing and salting.
	await registerUser({
		email,
		password
	});

	const { id } = await createSession(email);
	return {
		status: 201,
		headers: {
			'Set-Cookie': serialize('session_id', id, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: true,
				maxAge: 60 * 60 * 24 * 7 // one week
			})
		},
		body: {
			message: 'Successfully signed up'
		}
	};
};
