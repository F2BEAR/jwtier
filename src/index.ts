#! /usr/bin/env node

import { SignJWT } from 'jose';
import clipboard from 'clipboardy';
import logSymbols from 'log-symbols';
import { input, confirm } from '@inquirer/prompts';

const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '1234567890';
const symbols = '!#$%&=+-_^@';
const chars = alpha + numbers + symbols;

const gen = async () => {
	try {
		const alg = 'HS256';
		const typ = 'JWT';

		const askForSecret = await confirm({
			message: 'Do you have a secret to use?',
		});

		let baseSecret = '';

		if (askForSecret) {
			baseSecret = await input({
				message: 'Give me the secret to be used for the JWT',
			});
		} else {
			for (let i = 0; i < 64; i++) {
				baseSecret += chars.charAt(Math.floor(Math.random() * chars.length));
			}
		}

		const secret = new TextEncoder().encode(baseSecret);

		const basicAnswer = {
			issuer: await input({ message: 'What is the issuer name?' }),
			audience: await input({ message: 'What is the audience name?' }),
			subject: await input({ message: 'What is the subject name?' }),
		};

		const checkExtraPayload = await confirm({
			message: 'Do you want to add any extra payload?',
		});

		let payload = {};

		if (checkExtraPayload) {
			const extraPayload = await input({
				message: 'What is the extra payload?',
			});
			payload = JSON.parse(extraPayload);
		}

		const needsExpiration = await confirm({
			message: 'Does the JWT need an expiration date?',
		});

		let jwt = '';

		if (needsExpiration) {
			let expiration: string | number = await input({
				message: 'When is the expiration date?',
			});
			if (/^\d+$/.test(expiration) === true) {
				expiration = parseInt(expiration);
			}
			jwt = await new SignJWT({
				iss: basicAnswer.issuer,
				aud: basicAnswer.audience,
				sub: basicAnswer.subject,
				...payload,
			})
				.setExpirationTime(expiration)
				.setProtectedHeader({ alg, typ })
				.setIssuedAt()
				.sign(secret);
		} else {
			jwt = await new SignJWT({
				iss: basicAnswer.issuer,
				aud: basicAnswer.audience,
				sub: basicAnswer.subject,
				...payload,
			})
				.setProtectedHeader({ alg, typ })
				.setIssuedAt()
				.sign(secret);
		}

		clipboard.writeSync(jwt);
		console.log({ jwt, baseSecret });
		return console.log(logSymbols.success, 'JWT copied to clipboard!');
	} catch (err) {
		console.error(logSymbols.error, err);
	}
};

gen();
