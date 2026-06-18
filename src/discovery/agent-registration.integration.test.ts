/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * End-to-end test for GET /.well-known/agent-registration.json.
 *
 * Mounts only the well-known route on a throwaway express app, mirroring
 * the production wiring in src/index.ts (limiter + cache headers + JSON
 * content-type + structured 5xx logging). Covers AC1.1, AC1.3, AC1.5, plus
 * the C2 (dedicated limiter) and C5 (structured 5xx log) ARB conditions.
 */

import express, { Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';
import { buildRegistrationFile, resetCache } from './AgentRegistration';
import { ERC8004_REGISTRATION_TYPE_URL } from './types';

jest.mock('../logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { logger } from '../logger';

function makeApp(opts: { limiterMax?: number; brokenBuilder?: boolean } = {}): Application {
  const app: Application = express();
  const limiter = rateLimit({
    windowMs: 60000,
    max: opts.limiterMax ?? 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests to /.well-known/agent-registration.json',
  });
  app.get('/.well-known/agent-registration.json', limiter, (_req: Request, res: Response) => {
    try {
      if (opts.brokenBuilder) throw new Error('synthetic failure');
      const file = buildRegistrationFile();
      res.set('Cache-Control', 'public, max-age=300');
      res.type('application/json; charset=utf-8');
      res.status(200).json(file);
    } catch (err) {
      logger.error(
        { err, route: '/.well-known/agent-registration.json' },
        'agent-registration build failed',
      );
      res.status(500).json({ error: 'agent-registration unavailable' });
    }
  });
  return app;
}

describe('GET /.well-known/agent-registration.json', () => {
  afterEach(() => {
    resetCache();
    jest.clearAllMocks();
  });

  it('AC1.1 — returns 200 with application/json', async () => {
    const res = await request(makeApp()).get('/.well-known/agent-registration.json');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^application\/json/);
  });

  it('AC1.1 — sets Cache-Control: public, max-age=300', async () => {
    const res = await request(makeApp()).get('/.well-known/agent-registration.json');
    expect(res.headers['cache-control']).toBe('public, max-age=300');
  });

  it('body validates the ERC-8004 v1 shape', async () => {
    const res = await request(makeApp()).get('/.well-known/agent-registration.json');
    expect(res.body.type).toBe(ERC8004_REGISTRATION_TYPE_URL);
    expect(res.body.name).toBe('ibn-core');
    expect(typeof res.body.description).toBe('string');
    expect(typeof res.body.image).toBe('string');
    expect(res.body.x402Support).toBe(false);
    expect(res.body.active).toBe(true);
    expect(res.body.supportedTrust).toEqual(['reputation']);
    expect(res.body.registrations).toEqual([]);
  });

  it('AC1.3 — services[] matches the YAML source of truth', async () => {
    const res = await request(makeApp()).get('/.well-known/agent-registration.json');
    expect(res.body.services).toHaveLength(2);
    expect(res.body.services[0].name).toBe('TMF921');
    expect(res.body.services[0].endpoint).toBe(
      'https://ibn-core.vpnet.cloud/tmf-api/intentManagement/v5',
    );
    expect(res.body.services[0].version).toBe('5.0.0');
    expect(res.body.services[1].name).toBe('web');
  });

  it('C2 — dedicated rate limiter rejects after configured max', async () => {
    const app = makeApp({ limiterMax: 2 });
    const r1 = await request(app).get('/.well-known/agent-registration.json');
    const r2 = await request(app).get('/.well-known/agent-registration.json');
    const r3 = await request(app).get('/.well-known/agent-registration.json');
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
  });

  it('C5 — structured error log emitted on 5xx', async () => {
    const res = await request(makeApp({ brokenBuilder: true })).get(
      '/.well-known/agent-registration.json',
    );
    expect(res.status).toBe(500);
    expect(logger.error).toHaveBeenCalledTimes(1);
    const [meta] = (logger.error as jest.Mock).mock.calls[0];
    expect(meta.route).toBe('/.well-known/agent-registration.json');
    expect(meta.err).toBeDefined();
  });
});
