/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * OpenTelemetry SDK bootstrap for UC006 — Custom Observability.
 *
 * Signal surface: spans only in Phase 1. Metrics continue to flow through
 * prom-client until a Canvas-side OTel metric backend is available; we do
 * not want to fork the metric path until there is a second consumer.
 *
 * Exporter: vendor-neutral OTLP/HTTP (protobuf). The default endpoint and
 * headers point at LangSmith because no Canvas-managed collector is yet
 * reachable in our dev/demo environments (see
 * docs/roadmap/canvas-uc/UC006-custom-observability.md §9). An operator
 * running a Canvas OTel collector overrides OTEL_EXPORTER_OTLP_ENDPOINT
 * and OTEL_EXPORTER_OTLP_HEADERS via Helm — no code change required.
 *
 * Env contract (read once at module load):
 *   OTEL_ENABLED                    — "true" to start the SDK (default: false)
 *   OTEL_SERVICE_NAME               — resource attr (default: "ibn-core")
 *   OTEL_SERVICE_VERSION            — resource attr (default: "2.3.0")
 *   OTEL_EXPORTER_OTLP_ENDPOINT     — OTLP/HTTP base URL
 *                                     (default: LangSmith /otel)
 *   OTEL_EXPORTER_OTLP_HEADERS      — comma-separated k=v headers
 *                                     (LangSmith: x-api-key=...,Langsmith-Project=...)
 *   OTEL_RESOURCE_ATTRIBUTES        — extra resource attrs, comma-separated
 *
 * LangSmith convenience envs (only used when OTEL_EXPORTER_OTLP_HEADERS is
 * unset — lets Helm inject the API key from a Secret without trying to
 * string-concatenate a header value at manifest-render time):
 *   LANGSMITH_API_KEY               — secret value from Secret ref
 *   LANGSMITH_PROJECT               — routing hint (default: "ibn-core")
 *
 * NB: import this file FIRST in src/index.ts. Auto-instrumentation hooks
 * require() at load time; importing telemetry after express/http has been
 * required means those modules are already bound and will not be traced.
 */

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const DEFAULT_LANGSMITH_OTLP = 'https://api.smith.langchain.com/otel';

function isTruthy(v: string | undefined): boolean {
  return v === '1' || v?.toLowerCase() === 'true';
}

/**
 * Parse an OTEL_EXPORTER_OTLP_HEADERS string into a header map.
 *
 * The OTel spec accepts comma-separated `k=v` pairs with URL-encoded
 * values. We keep this deliberately small: split on commas not inside a
 * quoted value (we don't use quoting today), then split each on the
 * first `=`. Anything malformed is skipped with a warning rather than
 * crashing the boot.
 */
function parseHeaders(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const pair of raw.split(',')) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      // No '=' or empty key — skip rather than fail boot.
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const kl = k.toLowerCase();
    if (kl.includes('key') || kl.includes('auth') || kl === 'authorization') {
      redacted[k] = v ? `${v.slice(0, 4)}…(${v.length})` : '';
    } else {
      redacted[k] = v;
    }
  }
  return redacted;
}

let sdk: NodeSDK | undefined;

export function startTelemetry(): void {
  if (!isTruthy(process.env.OTEL_ENABLED)) {
    return;
  }
  if (sdk) return;

  if (isTruthy(process.env.OTEL_DIAG_VERBOSE)) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const serviceName = process.env.OTEL_SERVICE_NAME ?? 'ibn-core';
  const serviceVersion = process.env.OTEL_SERVICE_VERSION ?? '2.3.0';
  const endpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim() || DEFAULT_LANGSMITH_OTLP;

  // Two input modes for headers:
  //   1. Caller sets OTEL_EXPORTER_OTLP_HEADERS directly (standard path).
  //   2. Caller sets LANGSMITH_API_KEY (+ optional LANGSMITH_PROJECT); we
  //      synthesise the LangSmith header pair. This path exists because
  //      Kubernetes Secrets are injected as discrete env vars — composing
  //      a comma-separated header string at manifest-render time would
  //      expose the key in the rendered ConfigMap/Deployment.
  let headers = parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS);
  if (Object.keys(headers).length === 0 && process.env.LANGSMITH_API_KEY) {
    const project = process.env.LANGSMITH_PROJECT ?? 'ibn-core';
    headers = {
      'x-api-key': process.env.LANGSMITH_API_KEY,
      'Langsmith-Project': project,
    };
  }

  const tracesUrl = endpoint.endsWith('/v1/traces')
    ? endpoint
    : `${endpoint.replace(/\/$/, '')}/v1/traces`;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    'oda.component.name': serviceName,
    'oda.component.version': serviceVersion,
  });

  const traceExporter = new OTLPTraceExporter({
    url: tracesUrl,
    headers,
  });

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // File-system spans are pure noise inside a request path.
        '@opentelemetry/instrumentation-fs': { enabled: false },
        // pino logs carry their own trace context; the instrumentation
        // double-wraps and degrades throughput without adding signal.
        '@opentelemetry/instrumentation-pino': { enabled: false },
      }),
    ],
  });

  try {
    sdk.start();
    // Plain console log — the pino logger has not been constructed yet at
    // this point in boot, and pulling it in would create an import cycle.
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        msg: 'OpenTelemetry SDK started',
        service: serviceName,
        version: serviceVersion,
        endpoint: tracesUrl,
        headers: redactHeaders(headers),
        backend: tracesUrl.includes('smith.langchain.com') ? 'langsmith' : 'otlp-http',
      })
    );
  } catch (err) {
    // Never let telemetry boot failure take the service down.
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        level: 'error',
        msg: 'OpenTelemetry SDK failed to start; continuing without traces',
        error: err instanceof Error ? err.message : String(err),
      })
    );
    sdk = undefined;
  }
}

export async function shutdownTelemetry(): Promise<void> {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        level: 'error',
        msg: 'OpenTelemetry SDK shutdown error',
        error: err instanceof Error ? err.message : String(err),
      })
    );
  } finally {
    sdk = undefined;
  }
}

/** Test helper — do NOT import from production code. */
export function __telemetryIsRunningForTests(): boolean {
  return sdk !== undefined;
}

// Start the SDK at import time when enabled. Importing before any other
// module in src/index.ts is what makes auto-instrumentation work; we do
// that work here rather than making callers remember the ordering.
startTelemetry();

// Graceful shutdown so in-flight spans flush to the collector on SIGTERM.
process.on('SIGTERM', () => {
  void shutdownTelemetry();
});
process.on('SIGINT', () => {
  void shutdownTelemetry();
});

export { parseHeaders as __parseHeadersForTests };
