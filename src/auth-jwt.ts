/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * JWT Authentication Middleware — ODA Canvas UC007 External Authentication.
 *
 * Validates Keycloak-issued RS256 tokens against a remote JWKS. Extracts
 * role claims into req.auth for downstream authorization (UC009).
 *
 * Env contract (read via process.env, not hard-coded):
 *   OIDC_ISSUER_URL              required in JWT mode — e.g.
 *                                https://keycloak.canvas.svc/realms/canvas
 *   OIDC_AUDIENCE                required — Keycloak clientId created by
 *                                identityconfig-operator-keycloak (UC001)
 *   OIDC_JWKS_URL                optional — overrides /.well-known discovery
 *   OIDC_JWKS_CACHE_MAX_AGE_MS   optional — default 600000 (10 min)
 *   OIDC_JWKS_COOLDOWN_MS        optional — default 30000 (30 s)
 *   OIDC_CLOCK_TOLERANCE_SEC     optional — default 30
 */

import { Request, Response, NextFunction } from 'express';
import {
  createRemoteJWKSet,
  jwtVerify,
  errors as joseErrors,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import { logger } from './logger';
import { authFailureCounter, authSuccessCounter } from './metrics';

/** Strip CRLF / control chars before logging (CWE-117). */
function sanitizeLogField(value: string | undefined): string {
  return String(value ?? '')
    .replace(/[\r\n\t\x00-\x08\x0B-\x1F]/g, '_')
    .substring(0, 200);
}

/** Structural pre-check: distinguishes a JWT from an opaque API key fast. */
export function looksLikeJwt(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  // header + payload must be non-empty base64url segments
  return parts[0].length > 0 && parts[1].length > 0 && parts[2].length > 0;
}

export interface JwtAuthContext {
  customerId: string;
  roles: string[];
  method: 'jwt';
  subject: string;
  audience: string;
  issuer: string;
  tokenId?: string;
  authenticatedAt: Date;
}

interface JwtValidatorConfig {
  issuerUrl: string;
  audience: string;
  jwksUrl?: string;
  cacheMaxAgeMs: number;
  cooldownMs: number;
  clockToleranceSec: number;
}

let cachedConfig: JwtValidatorConfig | null = null;
let cachedJwks: JWTVerifyGetKey | null = null;

export function resetJwtValidatorForTests(): void {
  cachedConfig = null;
  cachedJwks = null;
}

function readConfig(): JwtValidatorConfig {
  if (cachedConfig) return cachedConfig;

  const issuerUrl = process.env.OIDC_ISSUER_URL;
  const audience = process.env.OIDC_AUDIENCE;

  if (!issuerUrl) {
    throw new Error(
      'OIDC_ISSUER_URL is required when AUTH_MODE includes jwt. ' +
      'Set it to the Keycloak realm URL, e.g. ' +
      'https://keycloak.canvas.svc/realms/canvas'
    );
  }
  if (!audience) {
    throw new Error(
      'OIDC_AUDIENCE is required when AUTH_MODE includes jwt. ' +
      'Set it to the Keycloak clientId created by ' +
      'identityconfig-operator-keycloak (UC001).'
    );
  }

  cachedConfig = {
    issuerUrl: issuerUrl.replace(/\/$/, ''),
    audience,
    jwksUrl: process.env.OIDC_JWKS_URL,
    cacheMaxAgeMs: parseInt(process.env.OIDC_JWKS_CACHE_MAX_AGE_MS ?? '600000', 10),
    cooldownMs: parseInt(process.env.OIDC_JWKS_COOLDOWN_MS ?? '30000', 10),
    clockToleranceSec: parseInt(process.env.OIDC_CLOCK_TOLERANCE_SEC ?? '30', 10),
  };
  return cachedConfig;
}

function getJwks(cfg: JwtValidatorConfig): JWTVerifyGetKey {
  if (cachedJwks) return cachedJwks;
  const url = new URL(cfg.jwksUrl ?? `${cfg.issuerUrl}/protocol/openid-connect/certs`);
  cachedJwks = createRemoteJWKSet(url, {
    cacheMaxAge: cfg.cacheMaxAgeMs,
    cooldownDuration: cfg.cooldownMs,
  });
  return cachedJwks;
}

/** Extract Keycloak realm + resource roles from a verified token payload. */
export function extractRoles(payload: JWTPayload, audience: string): string[] {
  const roles = new Set<string>();

  // Keycloak realm roles
  const realmAccess = (payload as { realm_access?: { roles?: string[] } }).realm_access;
  if (realmAccess?.roles) {
    for (const r of realmAccess.roles) roles.add(r);
  }

  // Keycloak resource (client) roles — scoped to our audience
  const resourceAccess = (payload as {
    resource_access?: Record<string, { roles?: string[] }>;
  }).resource_access;
  const ourClient = resourceAccess?.[audience];
  if (ourClient?.roles) {
    for (const r of ourClient.roles) roles.add(`${audience}:${r}`);
  }

  return Array.from(roles);
}

/** Pick the customerId from token claims. Prefer explicit, fall back to sub. */
function resolveCustomerId(payload: JWTPayload): string {
  const claim = payload as { customerId?: unknown; customer_id?: unknown };
  if (typeof claim.customerId === 'string' && claim.customerId) return claim.customerId;
  if (typeof claim.customer_id === 'string' && claim.customer_id) return claim.customer_id;
  return String(payload.sub ?? '');
}

function sendChallenge(
  res: Response,
  status: number,
  error: string,
  description: string
): void {
  const realm = 'ibn-core';
  res
    .set(
      'WWW-Authenticate',
      `Bearer realm="${realm}", error="${error}", error_description="${description}"`
    )
    .status(status)
    .json({ error: error === 'invalid_token' ? 'Unauthorized' : 'Forbidden', message: description });
}

/**
 * Express middleware — validate a Keycloak-issued JWT Bearer token.
 * Caller must have already ensured Authorization: Bearer <...> is present.
 */
export async function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const startTime = Date.now();
  const authHeader = req.headers.authorization ?? '';
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    authFailureCounter.inc({ reason: 'invalid_format' });
    sendChallenge(res, 401, 'invalid_request', 'Expected: Authorization: Bearer <jwt>');
    return;
  }

  const token = parts[1];

  let cfg: JwtValidatorConfig;
  try {
    cfg = readConfig();
  } catch (err) {
    authFailureCounter.inc({ reason: 'jwt_misconfigured' });
    logger.error({ err: (err as Error).message }, 'JWT validator is misconfigured');
    // Fail closed — the deployment is broken, not the caller.
    sendChallenge(res, 503, 'server_error', 'Authentication is temporarily unavailable');
    return;
  }

  let payload: JWTPayload;
  try {
    const jwks = getJwks(cfg);
    const result = await jwtVerify(token, jwks, {
      issuer: cfg.issuerUrl,
      audience: cfg.audience,
      clockTolerance: cfg.clockToleranceSec,
    });
    payload = result.payload;
  } catch (err) {
    let reason = 'invalid_token';
    let description = 'Token validation failed';
    if (err instanceof joseErrors.JWTExpired) {
      reason = 'token_expired';
      description = 'Token has expired';
    } else if (err instanceof joseErrors.JWTClaimValidationFailed) {
      reason = 'claim_invalid';
      description = `Claim validation failed: ${(err as joseErrors.JWTClaimValidationFailed).claim}`;
    } else if (err instanceof joseErrors.JWSSignatureVerificationFailed) {
      reason = 'signature_invalid';
      description = 'Token signature could not be verified';
    } else if (err instanceof joseErrors.JWKSNoMatchingKey) {
      reason = 'jwks_no_match';
      description = 'No matching key in JWKS';
    } else if (err instanceof joseErrors.JOSENotSupported) {
      reason = 'algorithm_unsupported';
      description = 'Token algorithm not supported';
    }
    authFailureCounter.inc({ reason });
    logger.warn(
      {
        ip: sanitizeLogField(req.ip),
        path: sanitizeLogField(req.path),
        reason,
        duration: Date.now() - startTime,
      },
      'JWT authentication failed'
    );
    sendChallenge(res, 401, 'invalid_token', description);
    return;
  }

  const customerId = resolveCustomerId(payload);
  if (!customerId) {
    authFailureCounter.inc({ reason: 'no_subject' });
    sendChallenge(res, 401, 'invalid_token', 'Token carries no subject');
    return;
  }

  const ctx: JwtAuthContext = {
    customerId,
    roles: extractRoles(payload, cfg.audience),
    method: 'jwt',
    subject: String(payload.sub ?? customerId),
    audience: cfg.audience,
    issuer: cfg.issuerUrl,
    tokenId: typeof payload.jti === 'string' ? payload.jti : undefined,
    authenticatedAt: new Date(),
  };
  (req as Request & { auth?: JwtAuthContext }).auth = ctx;

  authSuccessCounter.inc({ method: 'jwt' });
  logger.info(
    {
      customerId: sanitizeLogField(customerId),
      roles: ctx.roles.length,
      path: sanitizeLogField(req.path),
      duration: Date.now() - startTime,
    },
    'JWT authentication successful'
  );

  next();
}
