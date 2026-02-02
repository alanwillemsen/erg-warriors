/**
 * Gender filter types for leaderboard filtering
 */
export type GenderFilter = 'all' | 'male' | 'female';

/**
 * Normalized gender values
 */
export type NormalizedGender = 'male' | 'female' | 'unknown';

/**
 * Normalizes gender values from Concept2 API to consistent format
 *
 * Handles variations:
 * - M, m, Male, male → 'male'
 * - F, f, Female, female → 'female'
 * - Missing/unknown → 'unknown'
 *
 * @param gender - Raw gender value from API
 * @returns Normalized gender value
 */
export function normalizeGender(gender?: string): NormalizedGender {
  if (!gender) {
    return 'unknown';
  }

  const normalized = gender.toLowerCase();

  if (normalized === 'm' || normalized === 'male') {
    return 'male';
  }

  if (normalized === 'f' || normalized === 'female') {
    return 'female';
  }

  return 'unknown';
}
