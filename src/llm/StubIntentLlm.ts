/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 *
 * Deterministic, network-free IntentLlm provider. No @anthropic-ai/sdk, no API key.
 *
 * Purpose: run the intent cycle (and therefore the TMF921 CTK + canonical O2C)
 * WITHOUT an LLM provider — for offline conformance/regression runs and CI. The
 * cutover refactor (Project 005) does not change translation behaviour, so a
 * deterministic stub is a valid refactor-regression substitute. It is NOT a
 * substitute for the real-translation conformance claim (Gate B, full evidence).
 */

import type { IntentAnalysis, SelectedOffer, CustomerProfile } from '../imf/IntentHandlingContext';
import type { IntentLlm, OfferParams } from './IntentLlm';

function pushUnique(arr: string[], v: string): void {
  if (!arr.includes(v)) arr.push(v);
}

export class StubIntentLlm implements IntentLlm {
  /** §5.1.2 — deterministic keyword analysis of the intent text. */
  async analyzeIntent(intent: string, _customerProfile: CustomerProfile | undefined): Promise<IntentAnalysis> {
    const t = (intent || '').toLowerCase();
    const tags: string[] = [];
    const product_types: string[] = [];
    const priority: string[] = [];

    if (/work\s*(ing)?\s*from\s*home|wfh|remote\s*work/.test(t)) {
      pushUnique(tags, 'work_from_home');
      pushUnique(product_types, 'broadband');
      pushUnique(priority, 'reliability');
      pushUnique(priority, 'speed');
    }
    if (/internet|broadband|wifi|wi-fi|fibre|fiber|connectivity/.test(t)) {
      pushUnique(tags, 'connectivity');
      pushUnique(product_types, 'broadband');
    }
    if (/gaming|game/.test(t)) {
      pushUnique(tags, 'gaming');
      pushUnique(product_types, 'broadband');
      pushUnique(priority, 'low_latency');
      pushUnique(priority, 'speed');
    }
    if (/stream|netflix|tv|television|video/.test(t)) {
      pushUnique(tags, 'streaming');
      pushUnique(product_types, 'tv');
      pushUnique(product_types, 'broadband');
    }
    if (/mobile|sim|phone|5g|cellular/.test(t)) {
      pushUnique(tags, 'mobile');
      pushUnique(product_types, 'mobile');
    }
    if (/cheap|budget|afford|price|cost/.test(t)) {
      pushUnique(priority, 'price');
    }

    // Sensible defaults so the cycle always has something to fulfil.
    if (product_types.length === 0) {
      pushUnique(tags, 'connectivity');
      pushUnique(product_types, 'broadband');
    }
    if (priority.length === 0) {
      pushUnique(priority, 'reliability');
    }

    return { tags, product_types, priority };
  }

  /** §5.1.3 — deterministic offer: one standard product code per required type. */
  async generateOffer(params: OfferParams): Promise<SelectedOffer> {
    const types = params.intent?.product_types ?? ['broadband'];
    const selected_products = types.map((pt) => `${String(pt).toUpperCase()}-STD`);
    const offer: SelectedOffer = {
      selected_products,
      recommended_discounts: ['WELCOME10'],
    };
    if (selected_products.length > 1) {
      offer.bundle_recommendation = 'BUNDLE-MULTI';
    }
    return offer;
  }
}
