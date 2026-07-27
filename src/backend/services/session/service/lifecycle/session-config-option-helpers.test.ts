import type { SessionConfigOption } from '@agentclientprotocol/sdk';
import { describe, expect, it } from 'vitest';
import { unsafeCoerce } from '@/test-utils/unsafe-coerce';
import { resolveModelOptionValue } from './session-config-option-helpers';

function modelOption(options: Array<{ value: string; name?: string }>): SessionConfigOption {
  return unsafeCoerce<SessionConfigOption>({
    id: 'model',
    name: 'Model',
    type: 'select',
    category: 'model',
    currentValue: options[0]?.value ?? '',
    options,
  });
}

describe('resolveModelOptionValue', () => {
  it('returns null for blank requests', () => {
    expect(resolveModelOptionValue(modelOption([{ value: 'opus' }]), '   ')).toBeNull();
  });

  it('prefers an exact value match', () => {
    const option = modelOption([{ value: 'opus' }, { value: 'sonnet' }]);
    expect(resolveModelOptionValue(option, 'sonnet')).toBe('sonnet');
  });

  it('matches values case-insensitively', () => {
    const option = modelOption([{ value: 'opus' }, { value: 'sonnet' }]);
    expect(resolveModelOptionValue(option, 'Opus')).toBe('opus');
  });

  it('matches on display name when the value is opaque', () => {
    const option = modelOption([
      { value: 'model_a', name: 'Sonnet 4.5' },
      { value: 'model_b', name: 'Opus' },
    ]);
    expect(resolveModelOptionValue(option, 'opus')).toBe('model_b');
  });

  it('resolves an alias onto a dated provider model id', () => {
    const option = modelOption([
      { value: 'claude-sonnet-4-5', name: 'Sonnet 4.5' },
      { value: 'claude-opus-4-6', name: 'Opus 4.6' },
    ]);
    expect(resolveModelOptionValue(option, 'opus')).toBe('claude-opus-4-6');
  });

  it('resolves a dated model id onto an alias the provider offers', () => {
    const option = modelOption([{ value: 'sonnet' }, { value: 'opus' }]);
    expect(resolveModelOptionValue(option, 'claude-opus-4-5-20251101')).toBe('opus');
  });

  it('never fuzzy-matches onto the provider default sentinel', () => {
    const option = modelOption([
      { value: 'default', name: 'Default (recommended)' },
      { value: 'sonnet', name: 'Sonnet 4.5' },
    ]);
    expect(resolveModelOptionValue(option, 'opus')).toBeNull();
    expect(resolveModelOptionValue(option, 'default')).toBe('default');
  });

  it('returns null when no option is related to the request', () => {
    const option = modelOption([
      { value: 'gpt-5.3-codex', name: 'GPT-5.3 Codex' },
      { value: 'gpt-5.2-codex', name: 'GPT-5.2 Codex' },
    ]);
    expect(resolveModelOptionValue(option, 'opus')).toBeNull();
  });

  it('passes the request through when the provider enumerates no values', () => {
    const option = unsafeCoerce<SessionConfigOption>({
      id: 'model',
      name: 'Model',
      type: 'select',
      category: 'model',
      currentValue: 'opus',
      options: [],
    });
    expect(resolveModelOptionValue(option, 'opus')).toBe('opus');
  });
});
