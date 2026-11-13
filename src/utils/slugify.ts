/**
 * Generates SEO-friendly URL slugs from English or transliterated Bengali text.
 */
export function generateSlug(text: string, existingSlugs?: string[]): string {
  if (!text) return `item-${Date.now().toString(36)}`;

  // Mapping common Bengali names to standard clean english slugs
  const bnToEnMap: Record<string, string> = {
    'সরিষার তেল': 'mustard-oil',
    'সরিষা তেল': 'mustard-oil',
    'ঘানিভাঙা সরিষার তেল': 'wood-pressed-mustard-oil',
    'নারকেল তেল': 'coconut-oil',
    'খাঁটি গাওয়া ঘি': 'pure-cow-ghee',
    'গাওয়া ঘি': 'cow-ghee',
    'ঘি': 'ghee',
    'কালোজিরা তেল': 'black-seed-oil',
    'তিলের তেল': 'sesame-oil',
    'সূর্যমুখী তেল': 'sunflower-oil',
    'আমন্ড অয়েল': 'almond-oil',
    'বাদাম তেল': 'almond-oil',
    'তিসির তেল': 'flaxseed-oil',
  };

  const trimmed = text.trim();
  let baseSlug = '';
  for (const key of Object.keys(bnToEnMap)) {
    if (trimmed.includes(key)) {
      baseSlug = bnToEnMap[key];
      break;
    }
  }

  if (!baseSlug) {
    baseSlug = trimmed
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[-\s]+/g, '-');
  }

  let finalSlug = baseSlug || `item-${Math.floor(1000 + Math.random() * 9000)}`;
  if (existingSlugs && existingSlugs.includes(finalSlug)) {
    finalSlug = `${finalSlug}-${Math.floor(100 + Math.random() * 900)}`;
  }

  return finalSlug;
}
