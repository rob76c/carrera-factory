import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ClaudeMdService } from '@/backend/services/claude-md.service';

describe('ClaudeMdService', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `claude-md-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('readClaudeMd', () => {
    it('returns null when CLAUDE.md does not exist', async () => {
      const result = await ClaudeMdService.readClaudeMd(testDir);
      expect(result).toBeNull();
    });

    it('returns file contents when CLAUDE.md exists', async () => {
      const content = '# Project Guidelines\n\nFollow these rules.';
      await writeFile(join(testDir, 'CLAUDE.md'), content, 'utf-8');

      const result = await ClaudeMdService.readClaudeMd(testDir);
      expect(result).toBe(content);
    });

    it('returns empty string when CLAUDE.md exists but is empty', async () => {
      await writeFile(join(testDir, 'CLAUDE.md'), '', 'utf-8');

      const result = await ClaudeMdService.readClaudeMd(testDir);
      expect(result).toBe('');
    });

    it('returns null for non-existent directory', async () => {
      const result = await ClaudeMdService.readClaudeMd(join(testDir, 'nonexistent'));
      expect(result).toBeNull();
    });
  });
});
