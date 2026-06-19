/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * LLM-agnostic translation seam (RFC 9315 §5.1.2 TRANSLATING / §5.1.3 ORCHESTRATING).
 *
 * The BSS phase strategy depends on this narrow interface, NOT on any concrete
 * provider, so the LLM can be switched (Anthropic, a stub, or a future provider)
 * without touching the intent-handling cycle. The default provider is Anthropic
 * (ClaudeClient); `LLM_PROVIDER=stub` selects a deterministic, network-free
 * implementation (StubIntentLlm) — useful for offline conformance/regression runs
 * (e.g. TMF921 CTK without API credits) and CI. The stub is a deterministic
 * substitute; it is NOT a substitute for the real-translation conformance claim.
 */

import type { IntentAnalysis, SelectedOffer, CustomerProfile } from '../imf/IntentHandlingContext';
import { StubIntentLlm } from './StubIntentLlm';

/** Parameters for offer generation (RFC 9315 §5.1.3). */
export interface OfferParams {
  intent: IntentAnalysis;
  customer: CustomerProfile;
  products: unknown;
  bundles: unknown;
}

/**
 * Provider-agnostic contract for the LLM-backed steps of the intent cycle.
 * Any provider (Anthropic, OpenAI, a local model, or the stub) implements this.
 */
export interface IntentLlm {
  /** §5.1.2 — translate a natural-language intent into structured analysis. */
  analyzeIntent(intent: string, customerProfile: CustomerProfile | undefined): Promise<IntentAnalysis>;
  /** §5.1.3 — select a fulfilment offer from the analysis + catalogue/bundles. */
  generateOffer(params: OfferParams): Promise<SelectedOffer>;
}

export type LlmProviderName = 'anthropic' | 'stub';

/**
 * Select the LLM provider. `anthropic` is invoked lazily so that `stub` mode
 * never constructs the Anthropic client (and therefore needs no API key).
 *
 * To add a provider: implement `IntentLlm`, add a branch here, and select it
 * via `LLM_PROVIDER`.
 */
export function createIntentLlm(opts: {
  provider?: string;
  anthropic: () => IntentLlm;
}): { provider: LlmProviderName; llm: IntentLlm } {
  const name = (opts.provider || 'anthropic').toLowerCase();
  if (name === 'stub') {
    return { provider: 'stub', llm: new StubIntentLlm() };
  }
  return { provider: 'anthropic', llm: opts.anthropic() };
}
