/**
 * Shipped defaults for provider model / effort selection.
 *
 * Kept in `shared` so the backend seed values, the admin UI fallbacks and the
 * data-import schema cannot drift apart. These only seed a fresh install — once
 * a UserSettings row exists, the stored values win.
 */

export const DEFAULT_CLAUDE_MODEL = 'opus';
export const DEFAULT_CODEX_MODEL = 'default';

/** Claude effort levels the adapter exposes; `null` means "let the provider decide". */
export const DEFAULT_CLAUDE_REASONING_EFFORT: string | null = 'max';
export const DEFAULT_CODEX_REASONING_EFFORT: string | null = null;
