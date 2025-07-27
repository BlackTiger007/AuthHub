import {
	parseClientDataJSON,
	coseAlgorithmES256,
	ClientDataType,
	coseAlgorithmRS256,
	createAssertionSignatureMessage,
	parseAuthenticatorData
} from '@oslojs/webauthn';
import {
	decodePKIXECDSASignature,
	decodeSEC1PublicKey,
	p256,
	verifyECDSASignature
} from '@oslojs/crypto/ecdsa';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { decodeBase64 } from '@oslojs/encoding';
import { verifyWebAuthnChallenge, getUserPasskeyCredential } from '$lib/server/utils/webauthn';
import {
	decodePKCS1RSAPublicKey,
	sha256ObjectIdentifier,
	verifyRSASSAPKCS1v15Signature
} from '@oslojs/crypto/rsa';
import { sha256 } from '@oslojs/crypto/sha2';
import {
	setPasswordResetSessionAs2FAVerified,
	validatePasswordResetSessionRequest
} from '$lib/server/utils/password-reset';

import type { RequestEvent } from './$types';

export async function POST(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (!session || !user) return new Response('Not authenticated', { status: 401 });
	if (!session.emailVerified || !user.registeredPasskey || session.twoFactorVerified) {
		return new Response('Forbidden', { status: 403 });
	}

	const parser = new ObjectParser(await event.request.json());
	const encoded = {
		authenticatorData: parser.getString('authenticator_data'),
		clientDataJSON: parser.getString('client_data_json'),
		credentialId: parser.getString('credential_id'),
		signature: parser.getString('signature')
	};

	let decoded;
	try {
		decoded = {
			authenticatorData: decodeBase64(encoded.authenticatorData),
			clientDataJSON: decodeBase64(encoded.clientDataJSON),
			credentialId: decodeBase64(encoded.credentialId),
			signature: decodeBase64(encoded.signature)
		};
	} catch {
		return new Response('Invalid or missing fields', { status: 400 });
	}

	let authenticatorData;
	try {
		authenticatorData = parseAuthenticatorData(decoded.authenticatorData);
	} catch {
		return new Response('Invalid data', { status: 400 });
	}

	// Dynamisch berechnete Origin & RPID
	const url = new URL(event.request.url);
	const origin = `${url.protocol}//${url.host}`;
	const relyingPartyId = url.hostname;

	if (!authenticatorData.verifyRelyingPartyIdHash(relyingPartyId)) {
		return new Response('Invalid RPID hash', { status: 400 });
	}
	if (!authenticatorData.userPresent) {
		return new Response('User not present', { status: 400 });
	}

	let clientData;
	try {
		clientData = parseClientDataJSON(decoded.clientDataJSON);
	} catch {
		return new Response('Invalid clientDataJSON', { status: 400 });
	}

	if (clientData.type !== ClientDataType.Get)
		return new Response('Invalid clientData type', { status: 400 });
	if (!verifyWebAuthnChallenge(clientData.challenge))
		return new Response('Invalid challenge', { status: 400 });
	if (clientData.origin !== origin) return new Response('Origin mismatch', { status: 400 });
	if (clientData.crossOrigin === true)
		return new Response('Cross origin not allowed', { status: 400 });

	const credential = await getUserPasskeyCredential(user.id, decoded.credentialId);
	if (!credential) return new Response('Invalid credential', { status: 400 });

	const hash = sha256(
		createAssertionSignatureMessage(decoded.authenticatorData, decoded.clientDataJSON)
	);

	let validSignature = false;
	if (credential.algorithmId === coseAlgorithmES256) {
		validSignature = verifyECDSASignature(
			decodeSEC1PublicKey(p256, credential.publicKey),
			hash,
			decodePKIXECDSASignature(decoded.signature)
		);
	} else if (credential.algorithmId === coseAlgorithmRS256) {
		validSignature = verifyRSASSAPKCS1v15Signature(
			decodePKCS1RSAPublicKey(credential.publicKey),
			sha256ObjectIdentifier,
			hash,
			decoded.signature
		);
	} else {
		return new Response('Unsupported algorithm', { status: 500 });
	}

	if (!validSignature) return new Response('Invalid signature', { status: 400 });

	await setPasswordResetSessionAs2FAVerified(session.id);
	return new Response(null, { status: 204 });
}
