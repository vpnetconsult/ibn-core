/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import {
  AgentClassifier,
  AgentTaxonomyLevel,
  AgentCapability,
  TaxonomyPolicy,
} from './taxonomy';

// ── AgentClassifier.classify() ────────────────────────────────────────────────

describe('AgentClassifier.classify() — NON_AI', () => {
  it('should classify an empty capability list as NON_AI', () => {
    const d = AgentClassifier.classify([]);
    expect(d.level).toBe(AgentTaxonomyLevel.NON_AI);
    expect(d.isAI).toBe(false);
    expect(d.isGenAI).toBe(false);
    expect(d.isLLMBased).toBe(false);
    expect(d.isRestricted).toBe(true);
    expect(d.isCopilot).toBe(false);
  });

  it('should classify an unknown capability list as NON_AI', () => {
    const d = AgentClassifier.classify(['ping', 'metrics', 'scheduler']);
    expect(d.level).toBe(AgentTaxonomyLevel.NON_AI);
    expect(d.isAI).toBe(false);
  });

  it('should have info-level observability for NON_AI', () => {
    expect(AgentClassifier.classify([]).minimumObservabilityLevel).toBe('info');
  });
});

// ── AgentClassifier.classify() — restricted non-GenAI ────────────────────────

describe('AgentClassifier.classify() — RESTRICTED_NON_GENAI', () => {
  it('should classify [ml] as RESTRICTED_NON_GENAI', () => {
    const d = AgentClassifier.classify([AgentCapability.ML]);
    expect(d.level).toBe(AgentTaxonomyLevel.RESTRICTED_NON_GENAI);
    expect(d.isAI).toBe(true);
    expect(d.isGenAI).toBe(false);
    expect(d.isRestricted).toBe(true);
    expect(d.canModifyInternalLogic).toBe(false);
    expect(d.canModifyGoals).toBe(false);
  });

  it('should have info-level observability for RESTRICTED_NON_GENAI', () => {
    expect(AgentClassifier.classify([AgentCapability.ML]).minimumObservabilityLevel).toBe('info');
  });
});

// ── AgentClassifier.classify() — restricted GenAI (non-LLM) ──────────────────

describe('AgentClassifier.classify() — RESTRICTED_GENAI_NON_LLM', () => {
  it('should classify [genai] as RESTRICTED_GENAI_NON_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.GENAI]);
    expect(d.level).toBe(AgentTaxonomyLevel.RESTRICTED_GENAI_NON_LLM);
    expect(d.isGenAI).toBe(true);
    expect(d.isLLMBased).toBe(false);
    expect(d.isRestricted).toBe(true);
  });

  it('should not flag genai-only agent as copilot even when interactive', () => {
    // Copilot requires LLM + interactive; genai + interactive is not copilot
    const d = AgentClassifier.classify([AgentCapability.GENAI, AgentCapability.INTERACTIVE]);
    expect(d.level).toBe(AgentTaxonomyLevel.RESTRICTED_GENAI_NON_LLM);
    expect(d.isCopilot).toBe(false);
  });
});

// ── AgentClassifier.classify() — RESTRICTED_LLM ──────────────────────────────

describe('AgentClassifier.classify() — RESTRICTED_LLM', () => {
  it('should classify [llm] as RESTRICTED_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM]);
    expect(d.level).toBe(AgentTaxonomyLevel.RESTRICTED_LLM);
    expect(d.isAI).toBe(true);
    expect(d.isGenAI).toBe(true);
    expect(d.isLLMBased).toBe(true);
    expect(d.isRestricted).toBe(true);
    expect(d.isCopilot).toBe(false);
  });

  it('should require debug-level observability', () => {
    expect(AgentClassifier.classify([AgentCapability.LLM]).minimumObservabilityLevel).toBe('debug');
  });

  it('should NOT require human confirmation for a plain RESTRICTED_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM]);
    expect(TaxonomyPolicy.requiresHumanConfirmation(d)).toBe(false);
  });
});

// ── AgentClassifier.classify() — RESTRICTED_LLM_COPILOT ──────────────────────

describe('AgentClassifier.classify() — RESTRICTED_LLM_COPILOT', () => {
  it('should classify [llm, interactive] as RESTRICTED_LLM_COPILOT', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.INTERACTIVE]);
    expect(d.level).toBe(AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT);
    expect(d.isCopilot).toBe(true);
    expect(d.isLLMBased).toBe(true);
    expect(d.isRestricted).toBe(true);
    expect(d.canModifyInternalLogic).toBe(false);
    expect(d.canModifyGoals).toBe(false);
  });

  it('should require elevated governance for copilot', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.INTERACTIVE]);
    expect(d.requiresElevatedGovernance).toBe(true);
  });

  it('should require human confirmation for copilot', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.INTERACTIVE]);
    expect(TaxonomyPolicy.requiresHumanConfirmation(d)).toBe(true);
  });

  it('should require debug-level observability for copilot', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.INTERACTIVE]);
    expect(d.minimumObservabilityLevel).toBe('debug');
  });

  it('should classify case-insensitively', () => {
    const d = AgentClassifier.classify(['LLM', 'INTERACTIVE']);
    expect(d.level).toBe(AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT);
  });
});

// ── AgentClassifier.classify() — unrestricted tiers ──────────────────────────

describe('AgentClassifier.classify() — UNRESTRICTED_NON_GENAI', () => {
  it('should classify [ml, self-modify] as UNRESTRICTED_NON_GENAI', () => {
    const d = AgentClassifier.classify([AgentCapability.ML, AgentCapability.SELF_MODIFY]);
    expect(d.level).toBe(AgentTaxonomyLevel.UNRESTRICTED_NON_GENAI);
    expect(d.canModifyInternalLogic).toBe(true);
    expect(d.canModifyGoals).toBe(false); // SELF_MODIFY alone does not grant goal-modify
  });

  it('should classify [ml, goal-modify] as UNRESTRICTED_NON_GENAI', () => {
    const d = AgentClassifier.classify([AgentCapability.ML, AgentCapability.GOAL_MODIFY]);
    expect(d.level).toBe(AgentTaxonomyLevel.UNRESTRICTED_NON_GENAI);
    expect(d.canModifyGoals).toBe(true);
  });
});

describe('AgentClassifier.classify() — UNRESTRICTED_GENAI_NON_LLM', () => {
  it('should classify [genai, self-modify] as UNRESTRICTED_GENAI_NON_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.GENAI, AgentCapability.SELF_MODIFY]);
    expect(d.level).toBe(AgentTaxonomyLevel.UNRESTRICTED_GENAI_NON_LLM);
    expect(d.isGenAI).toBe(true);
    expect(d.isLLMBased).toBe(false);
    expect(d.canModifyInternalLogic).toBe(true);
  });
});

describe('AgentClassifier.classify() — UNRESTRICTED_LLM', () => {
  it('should classify [llm, self-modify] as UNRESTRICTED_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.SELF_MODIFY]);
    expect(d.level).toBe(AgentTaxonomyLevel.UNRESTRICTED_LLM);
    expect(d.isLLMBased).toBe(true);
    expect(d.canModifyInternalLogic).toBe(true);
    expect(d.requiresElevatedGovernance).toBe(true);
  });

  it('should classify [llm, goal-modify] as UNRESTRICTED_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.GOAL_MODIFY]);
    expect(d.level).toBe(AgentTaxonomyLevel.UNRESTRICTED_LLM);
    expect(d.canModifyGoals).toBe(true);
  });

  it('should require trace-level observability for UNRESTRICTED_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.SELF_MODIFY]);
    expect(d.minimumObservabilityLevel).toBe('trace');
  });

  it('should require chain-of-thought for UNRESTRICTED_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.SELF_MODIFY]);
    expect(TaxonomyPolicy.requiresChainOfThought(d)).toBe(true);
  });

  it('should require sandbox for UNRESTRICTED_LLM', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.SELF_MODIFY]);
    expect(TaxonomyPolicy.requiresSandbox(d)).toBe(true);
  });
});

// ── AgentClassifier.fromLevel() ───────────────────────────────────────────────

describe('AgentClassifier.fromLevel()', () => {
  it('should produce a descriptor with matching level and classification flags for each level', () => {
    // fromLevel() cannot know which modify capability was used, so it assumes
    // max permissions (both true) for unrestricted levels. The round-trip test
    // compares only level-independent classification flags (not canModify*).
    const pairs: Array<[string[], AgentTaxonomyLevel]> = [
      [[], AgentTaxonomyLevel.NON_AI],
      [[AgentCapability.ML], AgentTaxonomyLevel.RESTRICTED_NON_GENAI],
      [[AgentCapability.GENAI], AgentTaxonomyLevel.RESTRICTED_GENAI_NON_LLM],
      [[AgentCapability.LLM], AgentTaxonomyLevel.RESTRICTED_LLM],
      [[AgentCapability.LLM, AgentCapability.INTERACTIVE], AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT],
      [[AgentCapability.ML, AgentCapability.SELF_MODIFY, AgentCapability.GOAL_MODIFY], AgentTaxonomyLevel.UNRESTRICTED_NON_GENAI],
      [[AgentCapability.GENAI, AgentCapability.SELF_MODIFY, AgentCapability.GOAL_MODIFY], AgentTaxonomyLevel.UNRESTRICTED_GENAI_NON_LLM],
      [[AgentCapability.LLM, AgentCapability.SELF_MODIFY, AgentCapability.GOAL_MODIFY], AgentTaxonomyLevel.UNRESTRICTED_LLM],
    ];

    for (const [caps, expectedLevel] of pairs) {
      const fromClassify = AgentClassifier.classify(caps);
      const fromLevel = AgentClassifier.fromLevel(expectedLevel);
      expect(fromLevel.level).toBe(fromClassify.level);
      expect(fromLevel.isAI).toBe(fromClassify.isAI);
      expect(fromLevel.isGenAI).toBe(fromClassify.isGenAI);
      expect(fromLevel.isLLMBased).toBe(fromClassify.isLLMBased);
      expect(fromLevel.isRestricted).toBe(fromClassify.isRestricted);
      expect(fromLevel.isCopilot).toBe(fromClassify.isCopilot);
      // canModify* flags are equal when both SELF_MODIFY and GOAL_MODIFY are declared
      expect(fromLevel.canModifyInternalLogic).toBe(fromClassify.canModifyInternalLogic);
      expect(fromLevel.canModifyGoals).toBe(fromClassify.canModifyGoals);
    }
  });
});

// ── TaxonomyPolicy ────────────────────────────────────────────────────────────

describe('TaxonomyPolicy — chain-of-thought requirement', () => {
  it('should NOT require CoT for restricted agents', () => {
    expect(TaxonomyPolicy.requiresChainOfThought(AgentClassifier.classify([AgentCapability.LLM]))).toBe(false);
    expect(TaxonomyPolicy.requiresChainOfThought(AgentClassifier.classify([AgentCapability.ML]))).toBe(false);
    expect(TaxonomyPolicy.requiresChainOfThought(AgentClassifier.classify([]))).toBe(false);
  });

  it('should require CoT for all unrestricted tiers', () => {
    for (const caps of [
      [AgentCapability.ML, AgentCapability.SELF_MODIFY],
      [AgentCapability.GENAI, AgentCapability.GOAL_MODIFY],
      [AgentCapability.LLM, AgentCapability.SELF_MODIFY],
    ]) {
      expect(TaxonomyPolicy.requiresChainOfThought(AgentClassifier.classify(caps))).toBe(true);
    }
  });
});

describe('TaxonomyPolicy — sandbox requirement', () => {
  it('should require sandbox only for agents with self-modify', () => {
    expect(TaxonomyPolicy.requiresSandbox(AgentClassifier.classify([AgentCapability.LLM, AgentCapability.SELF_MODIFY]))).toBe(true);
    expect(TaxonomyPolicy.requiresSandbox(AgentClassifier.classify([AgentCapability.LLM]))).toBe(false);
    // goal-modify alone does NOT grant canModifyInternalLogic, so no sandbox
    expect(TaxonomyPolicy.requiresSandbox(AgentClassifier.classify([AgentCapability.LLM, AgentCapability.GOAL_MODIFY]))).toBe(false);
  });
});

describe('TaxonomyPolicy — goal-change audit requirement', () => {
  it('should require goal-change audit only for goal-modify agents', () => {
    expect(TaxonomyPolicy.requiresGoalChangeAudit(AgentClassifier.classify([AgentCapability.LLM, AgentCapability.GOAL_MODIFY]))).toBe(true);
    expect(TaxonomyPolicy.requiresGoalChangeAudit(AgentClassifier.classify([AgentCapability.LLM]))).toBe(false);
    expect(TaxonomyPolicy.requiresGoalChangeAudit(AgentClassifier.classify([AgentCapability.LLM, AgentCapability.SELF_MODIFY]))).toBe(false);
  });
});

describe('TaxonomyPolicy.summarise()', () => {
  it('should return a flat record with all policy flags', () => {
    const d = AgentClassifier.classify([AgentCapability.LLM, AgentCapability.INTERACTIVE]);
    const summary = TaxonomyPolicy.summarise(d);
    expect(summary.level).toBe(AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT);
    expect(typeof summary.requiresChainOfThought).toBe('boolean');
    expect(typeof summary.requiresHumanConfirmation).toBe('boolean');
    expect(typeof summary.requiresSandbox).toBe('boolean');
    expect(typeof summary.requiresGoalChangeAudit).toBe('boolean');
    expect(typeof summary.minimumObservabilityLevel).toBe('string');
  });

  it('should summarise NON_AI agent with all false constraints', () => {
    const d = AgentClassifier.classify([]);
    const summary = TaxonomyPolicy.summarise(d);
    expect(summary.requiresChainOfThought).toBe(false);
    expect(summary.requiresHumanConfirmation).toBe(false);
    expect(summary.requiresSandbox).toBe(false);
    expect(summary.requiresGoalChangeAudit).toBe(false);
  });
});

// ── LLM implies GenAI (paper taxonomy — LLM is a subtype of GenAI) ────────────

describe('Taxonomy invariants — LLM is a subtype of GenAI', () => {
  it('any LLM-based agent must also be isGenAI=true', () => {
    const llmLevels: AgentTaxonomyLevel[] = [
      AgentTaxonomyLevel.RESTRICTED_LLM,
      AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT,
      AgentTaxonomyLevel.UNRESTRICTED_LLM,
    ];
    for (const level of llmLevels) {
      const d = AgentClassifier.fromLevel(level);
      expect(d.isLLMBased).toBe(true);
      expect(d.isGenAI).toBe(true);
    }
  });

  it('non-AI agent must have isAI=false and isRestricted=true', () => {
    const d = AgentClassifier.fromLevel(AgentTaxonomyLevel.NON_AI);
    expect(d.isAI).toBe(false);
    expect(d.isRestricted).toBe(true);
    expect(d.canModifyInternalLogic).toBe(false);
    expect(d.canModifyGoals).toBe(false);
  });
});
