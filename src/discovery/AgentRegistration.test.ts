/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Unit tests for buildRegistrationFile() — asserts the ERC-8004 v1 shape
 * (AC1.2-1.5 from plan §4.6) and config-validation refusal paths.
 */

import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { buildRegistrationFile, resetCache } from './AgentRegistration';
import { ERC8004_REGISTRATION_TYPE_URL } from './types';

function writeConfig(contents: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'agent-public-'));
  const path = join(dir, 'agent-public.yaml');
  writeFileSync(path, contents);
  return path;
}

const VALID_YAML = `
name: ibn-core
description: test description
image: https://example.com/avatar.png
services:
  - name: TMF921
    endpoint: https://ibn-core.vpnet.cloud/tmf-api/intentManagement/v5
    version: 5.0.0
  - name: web
    endpoint: https://github.com/vpnetconsult/ibn-core
x402Support: false
active: true
supportedTrust:
  - reputation
`;

describe('buildRegistrationFile — ERC-8004 v1 shape', () => {
  afterEach(() => resetCache());

  it('AC1.2 — emits a body that matches the ERC-8004 v1 type URL', () => {
    const path = writeConfig(VALID_YAML);
    const file = buildRegistrationFile(path);
    expect(file.type).toBe(ERC8004_REGISTRATION_TYPE_URL);
    rmSync(path, { force: true });
  });

  it('AC1.2 — every required field is present with the correct type', () => {
    const file = buildRegistrationFile(writeConfig(VALID_YAML));
    expect(typeof file.name).toBe('string');
    expect(typeof file.description).toBe('string');
    expect(typeof file.image).toBe('string');
    expect(Array.isArray(file.services)).toBe(true);
    expect(typeof file.x402Support).toBe('boolean');
    expect(typeof file.active).toBe('boolean');
    expect(Array.isArray(file.registrations)).toBe(true);
    expect(Array.isArray(file.supportedTrust)).toBe(true);
  });

  it('AC1.3 — services[] contains exactly TMF921 v5 + web', () => {
    const file = buildRegistrationFile(writeConfig(VALID_YAML));
    expect(file.services).toHaveLength(2);
    expect(file.services[0]).toEqual({
      name: 'TMF921',
      endpoint: 'https://ibn-core.vpnet.cloud/tmf-api/intentManagement/v5',
      version: '5.0.0',
    });
    expect(file.services[1]).toEqual({
      name: 'web',
      endpoint: 'https://github.com/vpnetconsult/ibn-core',
    });
  });

  it('AC1.4 — supportedTrust is exactly ["reputation"]', () => {
    const file = buildRegistrationFile(writeConfig(VALID_YAML));
    expect(file.supportedTrust).toEqual(['reputation']);
  });

  it('AC1.5 — registrations[] is exactly [] in Phase 1', () => {
    const file = buildRegistrationFile(writeConfig(VALID_YAML));
    expect(file.registrations).toEqual([]);
  });

  it('production config produces the same shape', () => {
    const file = buildRegistrationFile();
    expect(file.type).toBe(ERC8004_REGISTRATION_TYPE_URL);
    expect(file.name).toBe('ibn-core');
    expect(file.supportedTrust).toEqual(['reputation']);
    expect(file.registrations).toEqual([]);
    expect(file.services.length).toBeGreaterThan(0);
  });
});

describe('buildRegistrationFile — config validation refuses unsafe shapes', () => {
  afterEach(() => resetCache());

  it('rejects a config missing required string fields', () => {
    const path = writeConfig(`
description: missing name
image: https://example.com/x.png
services: [{name: a, endpoint: https://a}]
x402Support: false
active: true
supportedTrust: [reputation]
`);
    expect(() => buildRegistrationFile(path)).toThrow(/'name' must be a non-empty string/);
  });

  it('rejects an empty services[]', () => {
    const path = writeConfig(`
name: x
description: x
image: https://example.com/x.png
services: []
x402Support: false
active: true
supportedTrust: [reputation]
`);
    expect(() => buildRegistrationFile(path)).toThrow(/non-empty array/);
  });

  it('rejects an unknown supportedTrust value (plan §D3 honest gaps)', () => {
    const path = writeConfig(`
name: x
description: x
image: https://example.com/x.png
services: [{name: a, endpoint: https://a}]
x402Support: false
active: true
supportedTrust: [crypto-economic, tee-attestation, magic]
`);
    expect(() => buildRegistrationFile(path)).toThrow(/'magic' is not an ERC-8004 v1 trust model/);
  });
});
