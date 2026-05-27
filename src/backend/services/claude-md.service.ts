import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createLogger } from '@/backend/services/logger.service';

const logger = createLogger('claude-md');

/**
 * Service for reading CLAUDE.md files from repository roots.
 * CLAUDE.md files contain repository-specific instructions for agents.
 */
export class ClaudeMdService {
  private static readonly CLAUDE_MD_FILENAME = 'CLAUDE.md';

  /**
   * Read CLAUDE.md from a repository or worktree path.
   * @param repoPath - Absolute path to the repository root or worktree
   * @returns File contents as a string, or null if the file doesn't exist
   */
  static async readClaudeMd(repoPath: string): Promise<string | null> {
    const filePath = join(repoPath, ClaudeMdService.CLAUDE_MD_FILENAME);

    try {
      await access(filePath);
    } catch {
      logger.debug('CLAUDE.md not found in repository', { repoPath });
      return null;
    }

    try {
      const content = await readFile(filePath, 'utf-8');
      logger.debug('Read CLAUDE.md from repository', { repoPath, length: content.length });
      return content;
    } catch (error) {
      logger.warn('Failed to read CLAUDE.md', {
        repoPath,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}
