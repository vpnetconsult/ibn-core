/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Unit tests for auth-jwt — structural helpers. The end-to-end JWT
 * verification path is exercised by the UC007 Canvas CTK run against a
 * live Keycloak realm, not in this file. Here we guard the small pure
 * functions that must never regress because they gate the dual-mode
 * dispatcher (auth-router.ts) and the Keycloak role surface (UC009).
 */

import { looksLikeJwt, extractRoles, resetJwtValidatorForTests } from './auth-jwt';

describe('looksLikeJwt', () => {
  it('returns true for a three-segment base64url string', () => {
    expect(looksLikeJwt('aaa.bbb.ccc')).toBe(true);
  });

  it('returns true for a realistic JWT shape', () => {
    const token =
      'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYyJ9' +
      '.eyJpc3MiOiJodHRwczovL2tleWNsb2FrIiwiYXVkIjoiaWJuLWNvcmUifQ' +
      '.signaturebytes';
    expect(looksLikeJwt(token)).toBe(true);
  });

  it('returns false for an API key', () => {
    expect(looksLikeJwt('dev-api-key-12345')).toBe(false);
    expect(looksLikeJwt('sk_1234567890abcdef')).toBe(false);
  });

  it('returns false for two- or four-segment strings', () => {
    expect(looksLikeJwt('aa.bb')).toBe(false);
    expect(looksLikeJwt('a.b.c.d')).toBe(false);
  });

  it('returns false when any segment is empty', () => {
    expect(looksLikeJwt('.bb.cc')).toBe(false);
    expect(looksLikeJwt('aa..cc')).toBe(false);
    expect(looksLikeJwt('aa.bb.')).toBe(false);
  });

  it('returns false for empty / non-string input', () => {
    expect(looksLikeJwt('')).toBe(false);
    // Force a non-string through the any-cast that the caller might do.
    expect(looksLikeJwt(undefined as unknown as string)).toBe(false);
    expect(looksLikeJwt(null as unknown as string)).toBe(false);
  });
});

describe('extractRoles', () => {
  const audience = 'ibn-core';

  it('extracts Keycloak realm roles unprefixed', () => {
    const payload = { realm_access: { roles: ['operator', 'viewer'] } };
    expect(extractRoles(payload, audience).sort()).toEqual(['operator', 'viewer']);
  });

  it('prefixes client roles with the audience (our client)', () => {
    const payload = {
      resource_access: { 'ibn-core': { roles: ['admin'] } },
    };
    expect(extractRoles(payload, audience)).toEqual(['ibn-core:admin']);
  });

  it('merges realm + our-client roles and de-duplicates', () => {
    const payload = {
      realm_access: { roles: ['viewer', 'viewer'] },
      resource_access: { 'ibn-core': { roles: ['admin', 'operator'] } },
    };
    const roles = extractRoles(payload, audience);
    expect(roles).toContain('viewer');
    expect(roles).toContain('ibn-core:admin');
    expect(roles).toContain('ibn-core:operator');
    // viewer appears exactly once despite the duplicate in realm_access.roles
    expect(roles.filter(r => r === 'viewer').length).toBe(1);
  });

  it('ignores roles scoped to a different client', () => {
    const payload = {
      resource_access: { 'other-component': { roles: ['root'] } },
    };
    expect(extractRoles(payload, audience)).toEqual([]);
  });

  it('returns an empty array when no role claims are present', () => {
    expect(extractRoles({}, audience)).toEqual([]);
    expect(extractRoles({ sub: 'user-1' }, audience)).toEqual([]);
  });

  it('tolerates malformed role structures without throwing', () => {
    // realm_access.roles missing, resource_access.<aud> missing .roles — both
    // should be silently skipped, never thrown, because the verifier must
    // never fail a valid token because of a shape surprise in a claim.
    const payload = {
      realm_access: {},
      resource_access: { 'ibn-core': {} },
    };
    expect(extractRoles(payload, audience)).toEqual([]);
  });
});

describe('resetJwtValidatorForTests', () => {
  it('is callable and idempotent', () => {
    // Not much to assert beyond "does not throw". Its value is that tests
    // downstream can force a fresh config read after mutating process.env.
    expect(() => {
      resetJwtValidatorForTests();
      resetJwtValidatorForTests();
    }).not.toThrow();
  });
});
