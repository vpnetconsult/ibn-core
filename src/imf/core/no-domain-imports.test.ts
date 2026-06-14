/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * NFR-ARCH-001 guard (Project 005): the layer-agnostic core MUST NOT import any
 * business (BSS) or resource domain module. This is the structural guarantee
 * that the abstraction is genuinely layer-agnostic (mitigates ARC-005 R-001).
 * If this test fails, a domain dependency has leaked into the core.
 */

import * as fs from 'fs';
import * as path from 'path';

/** Modules that mark a domain dependency — none may be imported by the core. */
const FORBIDDEN_IMPORTS = [
  'claude-client',
  'mcp-client',
  'pii-masking',
  'intent-processor',
  'provenance',
  'BssPhaseStrategy',
  'IntentHandlingContext', // BSS-shaped context (selectedOffer/quote/intentAnalysis)
  '@anthropic-ai/sdk',
];

/** Phase enums/step types are RFC-generic and explicitly allowed. */
const ALLOWED = ['../IntentHandlingCycle'];

const coreDir = __dirname;

function coreSourceFiles(): string[] {
  return fs
    .readdirSync(coreDir)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    .map((f) => path.join(coreDir, f));
}

function importSpecifiers(src: string): string[] {
  const out: string[] = [];
  const re = /(?:import|export)[^'"]*from\s*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.push(m[1]);
  return out;
}

describe('NFR-ARCH-001 — no domain imports in the RFC 9315 core', () => {
  const files = coreSourceFiles();

  it('finds core source files to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s imports no domain module', (file) => {
    const src = fs.readFileSync(file, 'utf8');
    const specs = importSpecifiers(src).filter((s) => !ALLOWED.includes(s));
    const violations = specs.filter((spec) =>
      FORBIDDEN_IMPORTS.some((bad) => spec.includes(bad)),
    );
    expect(violations).toEqual([]);
  });
});
