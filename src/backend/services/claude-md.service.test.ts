import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/backend/services/logger.service', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

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

    it('returns null when read fails after access check', async () => {
      // Write file, then make it unreadable by replacing with a directory of the same name
      const claudeMdPath = join(testDir, 'CLAUDE.md');
      await writeFile(claudeMdPath, 'content', 'utf-8');
      await rm(claudeMdPath);
      await mkdir(claudeMdPath); // directory with same name causes readFile to fail

      const result = await ClaudeMdService.readClaudeMd(testDir);
      expect(result).toBeNull();
    });
  });
});
