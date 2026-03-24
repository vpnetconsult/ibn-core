/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * Implements RFC 9315 Intent-Based Networking
 * https://www.rfc-editor.org/rfc/rfc9315
 */

/**
 * AI Agent Taxonomy for Telecommunication Networks.
 *
 * Implements the agent taxonomy from:
 *   Ericsson White Paper BCSS-25:024439, "AI agents in the telecommunication
 *   network architecture", October 2025, Figure 1 and §"AI agents: Definition
 *   and taxonomy".
 *
 * Taxonomy (Figure 1):
 *
 *   Agent
 *   ├── Non-AI agent                 (deterministic rule-based, no ML)
 *   └── AI agent                     (uses ML to update internal knowledge)
 *       ├── Restricted AI agent      (human-defined constraints enforced)
 *       │   ├── Non-GenAI-based      (classical ML, not generative)
 *       │   └── GenAI-based
 *       │       └── LLM-based        (LLM + restricted = Copilot when interactive)
 *       └── Unrestricted AI agent    (can modify internal logic / goals)
 *           ├── Non-GenAI-based
 *           └── GenAI-based
 *               └── LLM-based
 *
 * Boundary rule (paper §"Definition and taxonomy"):
 *   A restricted agent becomes unrestricted when it can:
 *   (a) Modify internal logic — override human-programmed restrictions, or
 *   (b) Modify goals      — lift the boundaries of human-assigned goals.
 *
 * Copilot (paper §"Definition and taxonomy"):
 *   A restricted, LLM-based agent designed to work interactively with humans
 *   as a human-to-machine interface. It assists and enhances human performance
 *   by leveraging advanced NL understanding.
 *
 * Operational constraints (paper §"Robustness and trustworthiness"):
 *   Agents must reside within domains with clear interfaces and authorizations.
 *   The taxonomy level determines what additional observability and governance
 *   controls are required at runtime.
 */

// ── Taxonomy levels ───────────────────────────────────────────────────────────

/**
 * All possible positions in the Figure 1 taxonomy tree.
 *
 * These are ordered from most constrained (NON_AI) to least constrained
 * (UNRESTRICTED_LLM) to support range comparisons.
 */
export const AgentTaxonomyLevel = {
  /** Rule-based agent with no ML; deterministic, fully auditable. */
  NON_AI: 'non-ai',

  /** AI agent using classical ML (e.g. regression, classification) with
   *  strict human-defined operational boundaries. */
  RESTRICTED_NON_GENAI: 'restricted-non-genai',

  /** AI agent using generative models (e.g. diffusion, VAE) that are NOT
   *  LLM-based; operates within human-defined constraints. */
  RESTRICTED_GENAI_NON_LLM: 'restricted-genai-non-llm',

  /** Restricted LLM-based agent. When also marked as interactive with humans
   *  this corresponds to a Copilot in paper terminology. */
  RESTRICTED_LLM: 'restricted-llm',

  /** Copilot: restricted + LLM-based + interactive with a human operator.
   *  Explicit subtype to allow distinct policy treatment. */
  RESTRICTED_LLM_COPILOT: 'restricted-llm-copilot',

  /** Unrestricted AI agent using classical ML; can modify its internal
   *  logic or goals at runtime. */
  UNRESTRICTED_NON_GENAI: 'unrestricted-non-genai',

  /** Unrestricted generative AI agent (non-LLM-based). */
  UNRESTRICTED_GENAI_NON_LLM: 'unrestricted-genai-non-llm',

  /** Unrestricted LLM-based agent. Highest autonomy; requires maximum
   *  observability, sandboxing, and governance controls. */
  UNRESTRICTED_LLM: 'unrestricted-llm',
} as const;

export type AgentTaxonomyLevel = (typeof AgentTaxonomyLevel)[keyof typeof AgentTaxonomyLevel];

// ── Descriptor ────────────────────────────────────────────────────────────────

/**
 * Fully-resolved descriptor for an agent's taxonomy position.
 *
 * Derived from the agent's declared {@link AgentTaxonomyLevel}.  All
 * boolean flags are computed — callers should not set them directly.
 */
export interface AgentTaxonomyDescriptor {
  /** Raw taxonomy level. */
  level: AgentTaxonomyLevel;

  // ── Derived classification flags ──────────────────────────────────────────

  /** True for all AI variants (uses ML to update internal knowledge). */
  isAI: boolean;

  /** True for GenAI and LLM-based variants. */
  isGenAI: boolean;

  /** True when the underlying model is LLM-based. */
  isLLMBased: boolean;

  /** True when the agent operates within human-defined constraints. */
  isRestricted: boolean;

  /**
   * True for RESTRICTED_LLM_COPILOT — the agent is interactive and works
   * alongside a human operator as a co-pilot.
   */
  isCopilot: boolean;

  // ── Operational constraints (paper §"Robustness and trustworthiness") ─────

  /**
   * False for all restricted agents; true for unrestricted ones.
   * When true the agent may modify its own internal logic at runtime.
   */
  canModifyInternalLogic: boolean;

  /**
   * False for all restricted agents; true for unrestricted ones.
   * When true the agent may extend or change its assigned goals.
   */
  canModifyGoals: boolean;

  /**
   * True when the taxonomy level mandates human-in-the-loop approval
   * before executing high-risk actions (unrestricted agents always require
   * heightened governance; copilots require human confirmation).
   */
  requiresElevatedGovernance: boolean;

  /**
   * Minimum logging level required for this taxonomy tier.
   * Unrestricted agents must emit full chain-of-thought traces;
   * restricted agents may log at INFO.
   */
  minimumObservabilityLevel: 'info' | 'debug' | 'trace';
}

// ── Capabilities vocabulary ───────────────────────────────────────────────────

/**
 * Well-known capability strings that the classifier inspects to determine
 * the agent's taxonomy level.
 *
 * These are additive — an agent declares the capabilities it possesses and
 * the classifier maps them to the appropriate taxonomy level.
 */
export const AgentCapability = {
  /** Agent uses an LLM as its primary reasoning engine. */
  LLM: 'llm',

  /** Agent uses a generative AI model that is not LLM-based. */
  GENAI: 'genai',

  /** Agent uses classical (non-generative) ML. */
  ML: 'ml',

  /** Agent operates interactively alongside a human operator. */
  INTERACTIVE: 'interactive',

  /**
   * Agent may override its own operational constraints at runtime.
   * Presence of this capability promotes the agent to the unrestricted tier.
   */
  SELF_MODIFY: 'self-modify',

  /**
   * Agent may extend or replace its assigned goals at runtime.
   * Presence of this capability promotes the agent to the unrestricted tier.
   */
  GOAL_MODIFY: 'goal-modify',
} as const;

export type AgentCapability = (typeof AgentCapability)[keyof typeof AgentCapability];

// ── Classifier ────────────────────────────────────────────────────────────────

/**
 * Classifies an agent into the Ericsson paper Figure 1 taxonomy.
 *
 * Usage:
 * ```typescript
 * const descriptor = AgentClassifier.classify(['llm', 'interactive']);
 * // → { level: 'restricted-llm-copilot', isLLMBased: true, isCopilot: true, … }
 * ```
 *
 * Classification rules (in priority order):
 * 1. Presence of 'self-modify' OR 'goal-modify' → unrestricted tier
 * 2. Presence of 'llm' + 'interactive' (unrestricted) → UNRESTRICTED_LLM
 * 3. Presence of 'llm' → restricted or unrestricted LLM
 * 4. Presence of 'genai' → restricted or unrestricted GenAI (non-LLM)
 * 5. Presence of 'ml' → restricted or unrestricted non-GenAI
 * 6. No AI capability declared → NON_AI
 */
export class AgentClassifier {
  /**
   * Classify an agent from its declared capability strings.
   *
   * @param capabilities - Array of capability strings (see {@link AgentCapability}).
   * @returns            - Fully resolved {@link AgentTaxonomyDescriptor}.
   */
  static classify(capabilities: string[]): AgentTaxonomyDescriptor {
    const caps = new Set(capabilities.map((c) => c.toLowerCase()));

    // Track the two unrestricted conditions independently (paper §"Definition"):
    //   SELF_MODIFY  → agent may override its own programmed restrictions
    //   GOAL_MODIFY  → agent may lift the boundaries of its assigned goals
    // Either condition is sufficient to promote to the unrestricted tier, but
    // each grants a distinct operational sub-capability.
    const hasSelfModify = caps.has(AgentCapability.SELF_MODIFY);
    const hasGoalModify = caps.has(AgentCapability.GOAL_MODIFY);
    const isUnrestricted = hasSelfModify || hasGoalModify;

    const isLLM = caps.has(AgentCapability.LLM);
    const isGenAI = caps.has(AgentCapability.GENAI) || isLLM;
    const isML = caps.has(AgentCapability.ML);
    const isInteractive = caps.has(AgentCapability.INTERACTIVE);
    const isAI = isLLM || isGenAI || isML;

    const level = AgentClassifier.resolveLevel({
      isUnrestricted,
      isLLM,
      isGenAI,
      isML,
      isInteractive,
      isAI,
    });

    return AgentClassifier.buildDescriptor(level, { hasSelfModify, hasGoalModify });
  }

  /**
   * Build a descriptor for a known taxonomy level without inferring from
   * capabilities (useful when the taxonomy level is already persisted).
   *
   * When the original capabilities are unavailable, unrestricted levels are
   * assumed to hold both sub-capabilities (maximum governance posture).
   */
  static fromLevel(level: AgentTaxonomyLevel): AgentTaxonomyDescriptor {
    const isUnrestricted = level.startsWith('unrestricted');
    return AgentClassifier.buildDescriptor(level, {
      hasSelfModify: isUnrestricted,
      hasGoalModify: isUnrestricted,
    });
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private static resolveLevel(flags: {
    isUnrestricted: boolean;
    isLLM: boolean;
    isGenAI: boolean;
    isML: boolean;
    isInteractive: boolean;
    isAI: boolean;
  }): AgentTaxonomyLevel {
    const { isUnrestricted, isLLM, isGenAI, isInteractive, isAI } = flags;

    if (!isAI) return AgentTaxonomyLevel.NON_AI;

    if (isUnrestricted) {
      if (isLLM) return AgentTaxonomyLevel.UNRESTRICTED_LLM;
      if (isGenAI) return AgentTaxonomyLevel.UNRESTRICTED_GENAI_NON_LLM;
      return AgentTaxonomyLevel.UNRESTRICTED_NON_GENAI;
    }

    // Restricted tier
    if (isLLM) {
      if (isInteractive) return AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT;
      return AgentTaxonomyLevel.RESTRICTED_LLM;
    }
    if (isGenAI) return AgentTaxonomyLevel.RESTRICTED_GENAI_NON_LLM;
    return AgentTaxonomyLevel.RESTRICTED_NON_GENAI;
  }

  private static buildDescriptor(
    level: AgentTaxonomyLevel,
    modify: { hasSelfModify: boolean; hasGoalModify: boolean }
  ): AgentTaxonomyDescriptor {
    const isRestricted = level.startsWith('restricted') || level === AgentTaxonomyLevel.NON_AI;
    const isUnrestricted = level.startsWith('unrestricted');
    const isLLMBased =
      level === AgentTaxonomyLevel.RESTRICTED_LLM ||
      level === AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT ||
      level === AgentTaxonomyLevel.UNRESTRICTED_LLM;
    const isGenAI =
      isLLMBased ||
      level === AgentTaxonomyLevel.RESTRICTED_GENAI_NON_LLM ||
      level === AgentTaxonomyLevel.UNRESTRICTED_GENAI_NON_LLM;
    const isAI = level !== AgentTaxonomyLevel.NON_AI;

    // Sub-capabilities are tracked independently to support fine-grained policy:
    // SELF_MODIFY grants canModifyInternalLogic; GOAL_MODIFY grants canModifyGoals.
    const canModifyInternalLogic = isUnrestricted && modify.hasSelfModify;
    const canModifyGoals = isUnrestricted && modify.hasGoalModify;

    return {
      level,
      isAI,
      isGenAI,
      isLLMBased,
      isRestricted,
      isCopilot: level === AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT,
      canModifyInternalLogic,
      canModifyGoals,
      requiresElevatedGovernance:
        isUnrestricted || level === AgentTaxonomyLevel.RESTRICTED_LLM_COPILOT,
      minimumObservabilityLevel: isUnrestricted ? 'trace' : isLLMBased ? 'debug' : 'info',
    };
  }
}

// ── Taxonomy policy ───────────────────────────────────────────────────────────

/**
 * Runtime policy checks derived from an agent's taxonomy descriptor.
 *
 * Paper §"Robustness and trustworthiness":
 *   "Agents must reside within domains with clear interfaces and authorizations,
 *   while still leveraging their reasoning ability to make decisions."
 *
 * Policy rules:
 *   - Unrestricted agents require chain-of-thought (CoT) traces on every action.
 *   - Copilots require human confirmation before submitting orders.
 *   - Non-AI agents are exempt from LLM-specific guardrails.
 *   - Any agent that can modify goals must have its goal changes logged.
 */
export class TaxonomyPolicy {
  /**
   * True when the taxonomy requires a full chain-of-thought trace to be
   * recorded before any tool invocation.
   */
  static requiresChainOfThought(descriptor: AgentTaxonomyDescriptor): boolean {
    // Unrestricted LLM agents must expose their full reasoning chain.
    return descriptor.canModifyInternalLogic || descriptor.canModifyGoals;
  }

  /**
   * True when the taxonomy mandates human confirmation before mutating
   * external state (e.g. submitting an order).
   */
  static requiresHumanConfirmation(descriptor: AgentTaxonomyDescriptor): boolean {
    return descriptor.isCopilot || descriptor.canModifyGoals;
  }

  /**
   * True when the agent must operate within a sandboxed execution context
   * (tool constraints, code sandbox per the paper's guardrail list).
   */
  static requiresSandbox(descriptor: AgentTaxonomyDescriptor): boolean {
    return descriptor.canModifyInternalLogic;
  }

  /**
   * True when goal-change events must be logged to the provenance audit trail.
   */
  static requiresGoalChangeAudit(descriptor: AgentTaxonomyDescriptor): boolean {
    return descriptor.canModifyGoals;
  }

  /**
   * Return all applicable policy constraints as a plain record for logging.
   */
  static summarise(descriptor: AgentTaxonomyDescriptor): Record<string, boolean | string> {
    return {
      level: descriptor.level,
      requiresChainOfThought: TaxonomyPolicy.requiresChainOfThought(descriptor),
      requiresHumanConfirmation: TaxonomyPolicy.requiresHumanConfirmation(descriptor),
      requiresSandbox: TaxonomyPolicy.requiresSandbox(descriptor),
      requiresGoalChangeAudit: TaxonomyPolicy.requiresGoalChangeAudit(descriptor),
      minimumObservabilityLevel: descriptor.minimumObservabilityLevel,
    };
  }
}
