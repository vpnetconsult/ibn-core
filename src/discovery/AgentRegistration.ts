/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * ERC-8004 v1 off-chain registration file builder.
 *
 * Consumes src/config/agent-public.yaml — a curated allow-list — to produce
 * the JSON served at GET /.well-known/agent-registration.json. By plan §D5
 * this is NOT derived from McpAdapter.getCapabilities(): different layer
 * (agent communication endpoints) than that interface (network service
 * capabilities). See plan §2.3.
 *
 * RFC 9315 §4 Principle 5 (Capability Exposure) — agent-communication-
 * endpoint surface.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { load as parseYaml } from 'js-yaml';
import {
  ERC8004RegistrationFile,
  ERC8004Service,
  ERC8004TrustModel,
  ERC8004_REGISTRATION_TYPE_URL,
} from './types';

interface AgentPublicConfig {
  name: string;
  description: string;
  image: string;
  services: ERC8004Service[];
  x402Support: boolean;
  active: boolean;
  supportedTrust: ERC8004TrustModel[];
}

const CONFIG_PATH = join(__dirname, '..', 'config', 'agent-public.yaml');

let cached: ERC8004RegistrationFile | null = null;

export function buildRegistrationFile(configPath: string = CONFIG_PATH): ERC8004RegistrationFile {
  if (cached && configPath === CONFIG_PATH) {
    return cached;
  }

  const raw = readFileSync(configPath, 'utf8');
  const config = parseYaml(raw) as AgentPublicConfig;
  validateConfig(config);

  const file: ERC8004RegistrationFile = {
    type: ERC8004_REGISTRATION_TYPE_URL,
    name: config.name,
    description: config.description,
    image: config.image,
    services: config.services,
    x402Support: config.x402Support,
    active: config.active,
    // Phase 1 ships with no on-chain registrations. Phase 2 (v2.2.0)
    // populates this after the Base Sepolia mint.
    registrations: [],
    supportedTrust: config.supportedTrust,
  };

  if (configPath === CONFIG_PATH) {
    cached = file;
  }
  return file;
}

export function resetCache(): void {
  cached = null;
}

function validateConfig(config: unknown): asserts config is AgentPublicConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('agent-public.yaml: must parse to an object');
  }
  const c = config as Record<string, unknown>;
  const requireString = (key: string): void => {
    if (typeof c[key] !== 'string' || (c[key] as string).length === 0) {
      throw new Error(`agent-public.yaml: '${key}' must be a non-empty string`);
    }
  };
  const requireBoolean = (key: string): void => {
    if (typeof c[key] !== 'boolean') {
      throw new Error(`agent-public.yaml: '${key}' must be a boolean`);
    }
  };
  requireString('name');
  requireString('description');
  requireString('image');
  requireBoolean('x402Support');
  requireBoolean('active');

  if (!Array.isArray(c.services) || c.services.length === 0) {
    throw new Error("agent-public.yaml: 'services' must be a non-empty array");
  }
  for (const [i, s] of (c.services as ERC8004Service[]).entries()) {
    if (!s || typeof s.name !== 'string' || typeof s.endpoint !== 'string') {
      throw new Error(`agent-public.yaml: services[${i}] requires 'name' and 'endpoint' strings`);
    }
  }

  const allowedTrust: ERC8004TrustModel[] = ['reputation', 'crypto-economic', 'tee-attestation'];
  if (!Array.isArray(c.supportedTrust) || c.supportedTrust.length === 0) {
    throw new Error("agent-public.yaml: 'supportedTrust' must be a non-empty array");
  }
  for (const t of c.supportedTrust as string[]) {
    if (!allowedTrust.includes(t as ERC8004TrustModel)) {
      throw new Error(`agent-public.yaml: supportedTrust value '${t}' is not an ERC-8004 v1 trust model`);
    }
  }
}
