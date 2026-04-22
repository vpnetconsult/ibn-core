/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * auth-router — single entry point for request authentication.
 *
 * UC007 External Authentication delivers Keycloak-issued JWT validation
 * (see auth-jwt.ts). This router decides, per request, whether to run the
 * JWT path, the legacy API-key path (auth.ts), or try JWT first and fall
 * back to API-key ("both" — intended as a migration mode only).
 *
 * Mode is controlled by AUTH_MODE env:
 *   - apiKey   (default)   → legacy API-key middleware only (pre-UC007)
 *   - jwt                  → Keycloak JWT only (UC007)
 *   - both                 → try JWT first, fall back to API key
 *                            (transition mode — deprecate post-v3.0.0)
 *
 * Downstream code reads req.auth.{customerId, roles?, method}. The
 * AuthContext shape is compatible across both paths so existing route
 * handlers do not need to change.
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticateApiKey } from './auth';
import { authenticateJwt, looksLikeJwt } from './auth-jwt';
import { logger } from './logger';

export type AuthMode = 'apiKey' | 'jwt' | 'both';

export interface AuthContext {
  customerId: string;
  method: 'api_key' | 'jwt';
  roles?: string[];
  authenticatedAt: Date;
}

function readMode(): AuthMode {
  const raw = (process.env.AUTH_MODE ?? 'apiKey').trim();
  if (raw === 'jwt' || raw === 'both' || raw === 'apiKey') return raw;
  logger.warn({ raw }, 'Unknown AUTH_MODE; falling back to apiKey');
  return 'apiKey';
}

/**
 * "both" mode — try JWT if the Bearer token structurally looks like a JWT,
 * otherwise try API key. If the JWT path writes a response (401), honour
 * it — do not silently fall through, as that would let a forged
 * almost-JWT bypass audit logs.
 */
function bothMode(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const parts = header.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : '';

  if (token && looksLikeJwt(token)) {
    void authenticateJwt(req, res, next);
    return;
  }
  // Opaque token → API-key path (in-memory map, timing-safe lookup)
  authenticateApiKey(req, res, next);
}

/** Construct the per-mode middleware at boot, once. */
function buildAuthenticate(): RequestHandler {
  const mode = readMode();
  logger.info({ mode }, 'auth-router: selected authentication mode');

  if (mode === 'apiKey') {
    return authenticateApiKey;
  }
  if (mode === 'jwt') {
    return (req, res, next) => void authenticateJwt(req, res, next);
  }
  return bothMode;
}

/**
 * The single middleware route files should import. Behaviour is locked at
 * module-load time from process.env.AUTH_MODE; changing it requires a
 * process restart (same contract as every other env-driven config).
 */
export const authenticate: RequestHandler = buildAuthenticate();

/**
 * Test helper — rebuild the middleware after mutating process.env.
 * Not exported from index; import directly from './auth-router' in tests.
 */
export function __rebuildAuthenticateForTests(): RequestHandler {
  return buildAuthenticate();
}
