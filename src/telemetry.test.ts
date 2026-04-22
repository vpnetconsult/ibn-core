/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Unit tests for telemetry.ts — UC006 Custom Observability.
 *
 * Scope: the pure, deterministic parts only.
 *   - header parser (the OTLP_HEADERS env contract)
 *   - enabled-gate behaviour (default off; explicit boot on OTEL_ENABLED)
 *
 * We deliberately do NOT exercise the real OTel SDK here — spinning up
 * NodeSDK inside Jest would install global instrumentation hooks that
 * leak into every other test suite. Integration coverage belongs in the
 * acceptance tests called out in the UC006 plan §6.
 */

describe('telemetry — header parser', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.OTEL_ENABLED;
  });
  afterAll(() => {
    process.env = originalEnv;
  });

  function loadParser() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./telemetry') as {
      __parseHeadersForTests: (raw: string | undefined) => Record<string, string>;
    };
    return mod.__parseHeadersForTests;
  }

  it('returns empty map for undefined / empty input', () => {
    const parse = loadParser();
    expect(parse(undefined)).toEqual({});
    expect(parse('')).toEqual({});
    expect(parse('   ')).toEqual({});
  });

  it('parses a single k=v pair', () => {
    const parse = loadParser();
    expect(parse('x-api-key=abc123')).toEqual({ 'x-api-key': 'abc123' });
  });

  it('parses multiple comma-separated pairs', () => {
    const parse = loadParser();
    expect(
      parse('x-api-key=abc123,Langsmith-Project=ibn-core')
    ).toEqual({
      'x-api-key': 'abc123',
      'Langsmith-Project': 'ibn-core',
    });
  });

  it('URL-decodes header values', () => {
    const parse = loadParser();
    // LangSmith project names can contain spaces / plus signs; OTel spec
    // says values are percent-encoded.
    expect(parse('Langsmith-Project=my%20project')).toEqual({
      'Langsmith-Project': 'my project',
    });
  });

  it('trims whitespace around pairs and keys', () => {
    const parse = loadParser();
    expect(parse(' x-api-key = abc123 , Langsmith-Project = ibn-core ')).toEqual({
      'x-api-key': 'abc123',
      'Langsmith-Project': 'ibn-core',
    });
  });

  it('skips malformed pairs without throwing', () => {
    const parse = loadParser();
    // No '=' → skipped; empty key → skipped; empty value → allowed as ''
    expect(parse('bogus,=missingkey,ok=value,empty=')).toEqual({
      ok: 'value',
      empty: '',
    });
  });

  it('allows values containing "=" (splits on first only)', () => {
    const parse = loadParser();
    // Base64 values commonly contain '=' padding.
    expect(parse('Authorization=Bearer abc==')).toEqual({
      Authorization: 'Bearer abc==',
    });
  });
});

describe('telemetry — enabled gate', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.OTEL_ENABLED;
    delete process.env.LANGSMITH_API_KEY;
  });
  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not start the SDK when OTEL_ENABLED is unset', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./telemetry') as {
      __telemetryIsRunningForTests: () => boolean;
    };
    expect(mod.__telemetryIsRunningForTests()).toBe(false);
  });

  it('does not start the SDK when OTEL_ENABLED is "false"', () => {
    process.env.OTEL_ENABLED = 'false';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./telemetry') as {
      __telemetryIsRunningForTests: () => boolean;
    };
    expect(mod.__telemetryIsRunningForTests()).toBe(false);
  });

  // NB: we deliberately do not assert the happy-path "OTEL_ENABLED=true
  // starts the SDK" here — the SDK registers a global instrumentation
  // provider and would pollute every subsequent test suite. That path is
  // covered by the UC006 acceptance test plan §6 in the integration
  // environment, not by Jest unit tests.
});
