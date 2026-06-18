/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * ERC-8004 v1 off-chain registration file types.
 * Spec: https://eips.ethereum.org/EIPS/eip-8004 (#registration-v1).
 *
 * Types are isolated here so a spec revision is a localised edit
 * (plan §R1) — the `type` field carries a versioned URL so divergence
 * is detectable by readers.
 */

export type ERC8004TrustModel = 'reputation' | 'crypto-economic' | 'tee-attestation';

export interface ERC8004Service {
  name: string;
  endpoint: string;
  version?: string;
}

export interface ERC8004Registration {
  agentId: string;
  agentAddress: string;
  chainId: number;
  signature?: string;
}

export interface ERC8004RegistrationFile {
  type: string;
  name: string;
  description: string;
  image: string;
  services: ERC8004Service[];
  x402Support: boolean;
  active: boolean;
  registrations: ERC8004Registration[];
  supportedTrust: ERC8004TrustModel[];
}

export const ERC8004_REGISTRATION_TYPE_URL =
  'https://eips.ethereum.org/EIPS/eip-8004#registration-v1';
