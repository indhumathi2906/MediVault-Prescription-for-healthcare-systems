/**
 * Normalizes a doctor's name for display in headings and clinical interfaces.
 * 
 * Rules:
 * - Detects and removes any leading "Dr." or "Dr" or "Doctor" prefix
 * - Detects and removes professional degree suffixes (e.g., ", MD", ", MBBS", ", DO", ", PhD", etc.) for welcome headings
 * - Prepends "Dr." exactly once
 * - Never returns "Dr. Dr. ..."
 * - Example: "Dr. Sarah Jenkins, MD" -> "Dr. Sarah Jenkins"
 * - Example: "Sarah Jenkins" -> "Dr. Sarah Jenkins"
 * - Example: "Dr. Marcus Vance, MD" -> "Dr. Marcus Vance"
 */
export function formatDoctorWelcomeName(rawName?: string | null): string {
  if (!rawName || typeof rawName !== 'string') {
    return 'Dr. Sarah Jenkins';
  }

  let cleaned = rawName.trim();

  // 1. Remove degree/credential suffixes (e.g., ", MD", ", MBBS", ", DO", ", Ph.D.", etc.)
  // Handles commas or trailing suffixes
  cleaned = cleaned.replace(/,\s*(MD|MBBS|DO|PhD|Ph\.D\.|MS|FACC|FACP|FRCS|MRCP|MD\/PhD).*$/i, '');
  
  // Also handle without comma if at the very end e.g. "Sarah Jenkins MD"
  cleaned = cleaned.replace(/\s+(MD|MBBS|DO|PhD|Ph\.D\.|FACC)$/i, '');

  // Clean trailing punctuation
  cleaned = cleaned.replace(/[,.\s]+$/, '').trim();

  // 2. Remove any leading "Dr.", "Dr", or "Doctor" prefix (case-insensitive)
  cleaned = cleaned.replace(/^(doctor|dr\.|dr)\s+/i, '').trim();

  // Clean any repetitive "dr" leftovers just in case
  while (/^(doctor|dr\.|dr)\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^(doctor|dr\.|dr)\s+/i, '').trim();
  }

  // 3. Prepend "Dr." exactly once
  return `Dr. ${cleaned}`;
}

/**
 * Returns the doctor's credential suffix if present in the raw name
 * e.g., "Dr. Sarah Jenkins, MD" -> "MD"
 */
export function extractDoctorCredentials(rawName?: string | null): string {
  if (!rawName) return '';
  const match = rawName.match(/,\s*([A-Za-z.,\s/]+)$/);
  return match ? match[1].trim() : '';
}
