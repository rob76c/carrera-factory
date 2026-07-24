import { describe, expect, it } from 'vitest';
import { resolveModelValueFromAvailable } from './model-value-resolver';

describe('resolveModelValueFromAvailable', () => {
  // What claude-agent-acp currently advertises: no bare "opus" value
  const claudeValues = ['default', 'opus[1m]', 'haiku'];

  it('prefers an exact match', () => {
    expect(resolveModelValueFromAvailable('haiku', claudeValues)).toBe('haiku');
    expect(resolveModelValueFromAvailable('opus[1m]', claudeValues)).toBe('opus[1m]');
  });

  it('matches an alias to the variant the agent offers', () => {
    expect(resolveModelValueFromAvailable('opus', claudeValues)).toBe('opus[1m]');
  });

  it('matches case-insensitively', () => {
    expect(resolveModelValueFromAvailable('Opus', claudeValues)).toBe('opus[1m]');
    expect(resolveModelValueFromAvailable('HAIKU', claudeValues)).toBe('haiku');
  });

  it('prefers the bare value when both it and a variant are offered', () => {
    expect(resolveModelValueFromAvailable('opus', ['opus[1m]', 'opus'])).toBe('opus');
  });

  it('returns null when the family is not offered', () => {
    expect(resolveModelValueFromAvailable('sonnet', claudeValues)).toBeNull();
    expect(resolveModelValueFromAvailable('gpt-5', claudeValues)).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(resolveModelValueFromAvailable('  ', claudeValues)).toBeNull();
    expect(resolveModelValueFromAvailable('opus', [])).toBeNull();
  });
});
