/**
 * Maps icon names (from legacy database entries) to actual emoji characters.
 * This provides a fallback for existing database entries that may contain
 * icon names instead of actual emoji characters.
 */

const iconToEmojiMap: Record<string, string> = {
  // Subject icons
  calculator: "\u{1F4D0}", // Triangular ruler
  "book-open": "\u{1F4DA}", // Books
  flask: "\u{1F52C}", // Microscope
  "pen-tool": "\u{270D}\u{FE0F}", // Writing hand
  moon: "\u{262A}\u{FE0F}", // Star and crescent
  globe: "\u{1F30D}", // Earth globe

  // Additional fallbacks for common icon names
  book: "\u{1F4DA}",
  pen: "\u{270D}\u{FE0F}",
  math: "\u{1F4D0}",
  science: "\u{1F52C}",
  star: "\u{2B50}",
};

/**
 * Converts an icon value to a displayable emoji.
 * - If the value is already an emoji (detected by character code), returns it as-is.
 * - If the value is an icon name, converts it to an emoji using the mapping.
 * - If the value is unknown, returns the provided default or a fallback emoji.
 *
 * @param icon - The icon value from the database (could be an emoji or icon name)
 * @param defaultEmoji - Optional default emoji to return if conversion fails
 * @returns The emoji character to display
 */
export function getDisplayEmoji(
  icon: string | null | undefined,
  defaultEmoji: string = "\u{1F4DA}"
): string {
  if (!icon) {
    return defaultEmoji;
  }

  // Check if it's already an emoji by looking at the first character code
  // Emojis typically have code points above 0x1000 or are in specific ranges
  const firstCodePoint = icon.codePointAt(0) || 0;

  // If the code point is high enough to be an emoji, or if the string
  // length doesn't match the actual character count (multi-byte emoji)
  if (firstCodePoint > 0x1000 || [...icon].length !== icon.length) {
    return icon;
  }

  // Check if the string starts with an emoji character sequence
  // Common emoji ranges: 0x2600-0x27BF, 0x1F300-0x1F9FF
  if (
    firstCodePoint >= 0x2600 ||
    (icon.length >= 2 && icon.charCodeAt(1) === 0xfe0f)
  ) {
    return icon;
  }

  // Try to map from icon name to emoji
  const mappedEmoji = iconToEmojiMap[icon.toLowerCase()];
  if (mappedEmoji) {
    return mappedEmoji;
  }

  // Return default if no mapping found
  return defaultEmoji;
}

/**
 * Subject-specific emoji mapping based on subject name.
 * Used as a final fallback when icon data is unavailable or invalid.
 */
export function getSubjectEmojiByName(
  subjectName: string,
  defaultEmoji: string = "\u{1F4DA}"
): string {
  const nameToEmojiMap: Record<string, string> = {
    math: "\u{1F4D0}",
    mathematics: "\u{1F4D0}",
    english: "\u{1F4DA}",
    science: "\u{1F52C}",
    urdu: "\u{270D}\u{FE0F}",
    islamiyat: "\u{262A}\u{FE0F}",
    islamic: "\u{262A}\u{FE0F}",
    "general knowledge": "\u{1F30D}",
    gk: "\u{1F30D}",
  };

  return nameToEmojiMap[subjectName.toLowerCase()] || defaultEmoji;
}
