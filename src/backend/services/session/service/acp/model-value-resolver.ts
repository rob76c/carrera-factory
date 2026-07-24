function normalizeModelKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Drops a trailing bracketed qualifier so variants collapse onto their family:
 * "opus[1m]" -> "opus". Lets a stored alias match whichever variant the agent
 * currently advertises, instead of pinning a specific one.
 */
function modelFamilyKey(value: string): string {
  return normalizeModelKey(value.replace(/\[[^\]]*\]\s*$/, ''));
}

/**
 * Maps a requested model onto one of the values an agent actually offers.
 *
 * Agents advertise their own value set, which drifts as models ship (Claude
 * currently offers "opus[1m]" rather than a bare "opus"). Matching by family
 * means a stored "opus" keeps selecting the newest Opus the agent exposes
 * without this codebase tracking version suffixes.
 *
 * Returns null when nothing in the family is offered, so callers can leave the
 * agent on its own default.
 */
export function resolveModelValueFromAvailable(
  requestedModel: string,
  availableValues: string[]
): string | null {
  const requested = requestedModel.trim();
  if (!requested || availableValues.length === 0) {
    return null;
  }

  const exact = availableValues.find((value) => value === requested);
  if (exact) {
    return exact;
  }

  const requestedKey = normalizeModelKey(requested);
  const caseInsensitive = availableValues.find(
    (value) => normalizeModelKey(value) === requestedKey
  );
  if (caseInsensitive) {
    return caseInsensitive;
  }

  const requestedFamily = modelFamilyKey(requested);
  if (!requestedFamily) {
    return null;
  }

  const familyMatches = availableValues.filter(
    (value) => modelFamilyKey(value) === requestedFamily
  );
  return (
    familyMatches.find((value) => normalizeModelKey(value) === requestedFamily) ??
    familyMatches[0] ??
    null
  );
}
