/**
 * Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
 * Licensed under the Apache License, Version 2.0
 * See LICENSE in the project root for license information.
 *
 * IntentStore — RFC 9315 §4 P1 SSoT/SVoT Implementation
 * Persistent intent storage via Redis.
 * Replaces volatile in-memory Map from v1.4.3.
 *
 * Redis key patterns:
 *   intent:{intentId}       → JSON-serialized TMF921 Intent
 *   intentSpec:{specId}     → JSON-serialized TMF921 IntentSpecification
 * TTL: 90 days default (configurable via INTENT_TTL_SECONDS env)
 *
 * https://www.rfc-editor.org/rfc/rfc9315
 */

import { createClient, RedisClientType } from 'redis';
import {
  Intent,
  IntentLifecycleStatus,
  IntentType,
  IntentSpecification,
} from '../tmf921/types';

// ---------------------------------------------------------------------------
// Singleton Redis client
// ---------------------------------------------------------------------------

let redisClient: RedisClientType | null = null;

async function getClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = createClient({ url: redisUrl }) as RedisClientType;

    redisClient.on('error', (err: Error) => {
      console.error('[IntentStore] Redis error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[IntentStore] Redis connected — RFC 9315 §4 P1 SSoT active');
    });

    redisClient.on('disconnect', () => {
      console.warn('[IntentStore] Redis disconnected — SSoT unavailable');
    });
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}

const getTTL = (): number =>
  parseInt(process.env.INTENT_TTL_SECONDS || '7776000', 10);

// ---------------------------------------------------------------------------
// RedisIntentStore — drop-in replacement for the in-memory IntentStore
// ---------------------------------------------------------------------------

export class RedisIntentStore {
  private readonly keyPrefix = 'intent:';

  async save(intent: Intent): Promise<Intent> {
    const client = await getClient();
    await client.setEx(
      this.keyPrefix + intent.id,
      getTTL(),
      JSON.stringify(intent),
    );
    return intent;
  }

  async findById(id: string): Promise<Intent | undefined> {
    const client = await getClient();
    const raw = await client.get(this.keyPrefix + id);
    return raw ? (JSON.parse(raw) as Intent) : undefined;
  }

  async findAll(filters?: {
    lifecycleStatus?: IntentLifecycleStatus | string;
    intentType?: IntentType;
    relatedPartyId?: string;
    name?: string;
    priority?: number | string;
    version?: string;
    creationDate?: string;
    lastUpdate?: string;
  }): Promise<Intent[]> {
    const client = await getClient();
    const keys = await client.keys(this.keyPrefix + '*');
    if (keys.length === 0) return [];

    const values = await client.mGet(keys);
    let results: Intent[] = values
      .filter((v): v is string => v !== null)
      .map(v => JSON.parse(v) as Intent);

    if (filters?.lifecycleStatus) {
      results = results.filter(i => i.lifecycleStatus === filters.lifecycleStatus);
    }
    if (filters?.intentType) {
      results = results.filter(i => i.intentType === filters.intentType);
    }
    if (filters?.relatedPartyId) {
      results = results.filter(i =>
        i.relatedParty?.some(p => p.id === filters.relatedPartyId),
      );
    }
    if (filters?.name) {
      results = results.filter(i => i.name === filters.name);
    }
    if (filters?.priority !== undefined) {
      results = results.filter(
        i => String(i.priority) === String(filters.priority),
      );
    }
    if (filters?.version) {
      results = results.filter(i => i.version === filters.version);
    }
    if (filters?.creationDate) {
      results = results.filter(i => i.creationDate === filters.creationDate);
    }
    if (filters?.lastUpdate) {
      results = results.filter(i => i.lastUpdate === filters.lastUpdate);
    }

    return results;
  }

  async delete(id: string): Promise<boolean> {
    const client = await getClient();
    const result = await client.del(this.keyPrefix + id);
    return result > 0;
  }

  async update(
    id: string,
    updates: Partial<Intent>,
  ): Promise<Intent | undefined> {
    const intent = await this.findById(id);
    if (!intent) return undefined;

    const now = new Date().toISOString();
    const statusChanged =
      updates.lifecycleStatus !== undefined &&
      updates.lifecycleStatus !== intent.lifecycleStatus;

    const updated: Intent = {
      ...intent,
      ...updates,
      lastUpdate: now,
      statusChangeDate: statusChanged ? now : intent.statusChangeDate,
    };

    await this.save(updated);
    return updated;
  }
}

// ---------------------------------------------------------------------------
// RedisSpecificationStore — drop-in replacement for IntentSpecificationStore
// ---------------------------------------------------------------------------

export class RedisSpecificationStore {
  private readonly keyPrefix = 'intentSpec:';

  async save(spec: IntentSpecification): Promise<IntentSpecification> {
    const client = await getClient();
    await client.setEx(
      this.keyPrefix + spec.id,
      getTTL(),
      JSON.stringify(spec),
    );
    return spec;
  }

  async findById(id: string): Promise<IntentSpecification | undefined> {
    const client = await getClient();
    const raw = await client.get(this.keyPrefix + id);
    return raw ? (JSON.parse(raw) as IntentSpecification) : undefined;
  }

  async findAll(filters?: {
    name?: string;
    lifecycleStatus?: string;
    version?: string;
    lastUpdate?: string;
  }): Promise<IntentSpecification[]> {
    const client = await getClient();
    const keys = await client.keys(this.keyPrefix + '*');
    if (keys.length === 0) return [];

    const values = await client.mGet(keys);
    let results: IntentSpecification[] = values
      .filter((v): v is string => v !== null)
      .map(v => JSON.parse(v) as IntentSpecification);

    if (filters?.name) {
      results = results.filter(s => s.name === filters.name);
    }
    if (filters?.lifecycleStatus) {
      results = results.filter(s => s.lifecycleStatus === filters.lifecycleStatus);
    }
    if (filters?.version) {
      results = results.filter(s => s.version === filters.version);
    }
    if (filters?.lastUpdate) {
      results = results.filter(s => s.lastUpdate === filters.lastUpdate);
    }

    return results;
  }

  async delete(id: string): Promise<boolean> {
    const client = await getClient();
    const result = await client.del(this.keyPrefix + id);
    return result > 0;
  }

  async update(
    id: string,
    updates: Partial<IntentSpecification>,
  ): Promise<IntentSpecification | undefined> {
    const spec = await this.findById(id);
    if (!spec) return undefined;

    const updated: IntentSpecification = {
      ...spec,
      ...updates,
      lastUpdate: new Date().toISOString(),
    };

    await this.save(updated);
    return updated;
  }
}

// ---------------------------------------------------------------------------
// Health check — used by /health endpoint
// ---------------------------------------------------------------------------

/**
 * Returns true if Redis responds to PING.
 * RFC 9315 §4 P1 — SSoT availability indicator.
 */
export async function isRedisHealthy(): Promise<boolean> {
  try {
    const client = await getClient();
    await client.ping();
    return true;
  } catch {
    return false;
  }
}
