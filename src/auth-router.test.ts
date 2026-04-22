/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Unit tests for auth-router — dispatch between JWT and API-key paths.
 *
 * The router's job is narrow: pick the correct middleware given AUTH_MODE
 * and (in "both" mode) the structural shape of the Bearer token. We assert
 * that each AUTH_MODE setting leads to the expected downstream call, using
 * jest.mock so we do not need a live Keycloak or a real API-key store.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';

jest.mock('./auth', () => ({
  authenticateApiKey: jest.fn((_req: Request, _res: Response, next: NextFunction) => next()),
}));
jest.mock('./auth-jwt', () => {
  const actual = jest.requireActual('./auth-jwt');
  return {
    ...actual,
    authenticateJwt: jest.fn(
      (_req: Request, _res: Response, next: NextFunction) => next()
    ),
  };
});

import { authenticateApiKey } from './auth';
import { authenticateJwt } from './auth-jwt';
import { __rebuildAuthenticateForTests } from './auth-router';

const mockedApiKey = authenticateApiKey as jest.Mock;
const mockedJwt = authenticateJwt as jest.Mock;

function makeReq(authHeader?: string): Request {
  return { headers: { authorization: authHeader ?? '' } } as unknown as Request;
}
function makeRes(): Response {
  return {} as unknown as Response;
}

/**
 * Rebuild the router's dispatch middleware after mutating AUTH_MODE.
 *
 * We use __rebuildAuthenticateForTests() rather than jest.isolateModules +
 * require() because isolated requires create a fresh mock registry — the
 * re-required auth-jwt's authenticateJwt would be a different jest.fn()
 * than the mockedJwt captured at the top of this file, and assertions
 * against it would never see the call.
 */
function loadRouterWithMode(mode: string): RequestHandler {
  process.env.AUTH_MODE = mode;
  return __rebuildAuthenticateForTests();
}

beforeEach(() => {
  mockedApiKey.mockClear();
  mockedJwt.mockClear();
});

describe('auth-router AUTH_MODE dispatch', () => {
  it('apiKey (default) routes to the API-key middleware', () => {
    const authenticate = loadRouterWithMode('apiKey');
    const next = jest.fn();
    authenticate(makeReq('Bearer opaque-key-xyz'), makeRes(), next);
    expect(mockedApiKey).toHaveBeenCalledTimes(1);
    expect(mockedJwt).not.toHaveBeenCalled();
  });

  it('jwt routes to the JWT middleware', () => {
    const authenticate = loadRouterWithMode('jwt');
    const next = jest.fn();
    authenticate(makeReq('Bearer aaa.bbb.ccc'), makeRes(), next);
    expect(mockedJwt).toHaveBeenCalledTimes(1);
    expect(mockedApiKey).not.toHaveBeenCalled();
  });

  it('unknown mode falls back to apiKey (defensive default)', () => {
    const authenticate = loadRouterWithMode('weird');
    const next = jest.fn();
    authenticate(makeReq('Bearer opaque-key'), makeRes(), next);
    expect(mockedApiKey).toHaveBeenCalledTimes(1);
    expect(mockedJwt).not.toHaveBeenCalled();
  });
});

describe('auth-router "both" mode dispatch by token shape', () => {
  it('picks JWT when the Bearer token is three dot-separated segments', () => {
    const authenticate = loadRouterWithMode('both');
    authenticate(makeReq('Bearer aaa.bbb.ccc'), makeRes(), jest.fn());
    expect(mockedJwt).toHaveBeenCalledTimes(1);
    expect(mockedApiKey).not.toHaveBeenCalled();
  });

  it('picks API key for an opaque (non-JWT-shaped) token', () => {
    const authenticate = loadRouterWithMode('both');
    authenticate(makeReq('Bearer dev-api-key-12345'), makeRes(), jest.fn());
    expect(mockedApiKey).toHaveBeenCalledTimes(1);
    expect(mockedJwt).not.toHaveBeenCalled();
  });

  it('picks API key when the Authorization header is missing', () => {
    const authenticate = loadRouterWithMode('both');
    // API-key middleware owns the "missing header → 401" response — the
    // router must hand it the request, not short-circuit with its own.
    authenticate(makeReq(undefined), makeRes(), jest.fn());
    expect(mockedApiKey).toHaveBeenCalledTimes(1);
    expect(mockedJwt).not.toHaveBeenCalled();
  });

  it('picks API key when the scheme is not Bearer', () => {
    const authenticate = loadRouterWithMode('both');
    authenticate(makeReq('Basic dXNlcjpwYXNz'), makeRes(), jest.fn());
    expect(mockedApiKey).toHaveBeenCalledTimes(1);
    expect(mockedJwt).not.toHaveBeenCalled();
  });
});
