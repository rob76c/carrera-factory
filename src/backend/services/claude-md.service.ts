import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

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
      return null;
    }

    return readFile(filePath, 'utf-8');
  }
}
