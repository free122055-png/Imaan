/**
 * Clean, consistent, high-fidelity SVG illustration generator for Aiman Brand products.
 * Generates calm, elegant bottle graphics with authentic Bengali labeling and cream backgrounds.
 * Guarantees zero broken external image links or irrelevant stock photos.
 */

export function getProductPlaceholderSvg(nameBn: string, type: 'mustard' | 'ghee' | 'coconut' | 'blackseed' | 'sesame' | 'general'): string {
  let liquidColor = '#D98200'; // Amber mustard
  let liquidHighlight = '#F5B041';
  let capColor = '#1B4D2B';
  let badgeColor = '#C99A2E';

  if (type === 'ghee') {
    liquidColor = '#E5A910';
    liquidHighlight = '#FAD02C';
    capColor = '#8D5B18';
  } else if (type === 'coconut') {
    liquidColor = '#E8EFE9';
    liquidHighlight = '#F7FAF7';
    capColor = '#2D6A4F';
  } else if (type === 'blackseed') {
    liquidColor = '#2B1810';
    liquidHighlight = '#4A2810';
    capColor = '#1B4D2B';
  } else if (type === 'sesame') {
    liquidColor = '#C67D22';
    liquidHighlight = '#E09938';
    capColor = '#523412';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FCFAF5" />
        <stop offset="100%" stop-color="#F4EEE1" />
      </linearGradient>
      <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${liquidColor}" stop-opacity="0.95" />
        <stop offset="40%" stop-color="${liquidHighlight}" stop-opacity="1" />
        <stop offset="100%" stop-color="${liquidColor}" stop-opacity="0.9" />
      </linearGradient>
      <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#1B4D2B" flood-opacity="0.08"/>
      </filter>
    </defs>

    <!-- Warm serene background -->
    <rect width="100%" height="100%" fill="url(#bgGrad)"/>
    <circle cx="200" cy="200" r="140" fill="#FFFFFF" fill-opacity="0.5"/>

    <!-- Bottle Shadow -->
    <ellipse cx="200" cy="350" rx="65" ry="12" fill="#000000" fill-opacity="0.06"/>

    <!-- Main Bottle Body -->
    <g filter="url(#softShadow)">
      <!-- Neck -->
      <path d="M185 85 L215 85 L215 130 L185 130 Z" fill="${liquidColor}" />
      <!-- Cap -->
      <rect x="180" y="65" width="40" height="22" rx="4" fill="${capColor}" />
      <line x1="180" y1="72" x2="220" y2="72" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- Shoulder and Body -->
      <path d="M185 130 C155 145 140 170 140 200 L140 330 C140 342 150 348 162 348 L238 348 C250 348 260 342 260 330 L260 200 C260 170 245 145 215 130 Z" fill="url(#bottleGrad)" />

      <!-- Glass reflection highlight -->
      <path d="M148 200 L148 330 C148 338 152 342 160 342 L168 342 L168 190 C155 194 148 196 148 200 Z" fill="url(#glassShine)" />

      <!-- Minimalist Label -->
      <rect x="152" y="215" width="96" height="95" rx="5" fill="#FFFFFF" />
      <rect x="156" y="219" width="88" height="87" rx="3" fill="none" stroke="#ECE8DF" stroke-width="1" />
      
      <!-- Brand Seal -->
      <circle cx="200" cy="238" r="10" fill="#FAF7F0" stroke="${capColor}" stroke-width="1.2" />
      <text x="200" y="242" font-family="'Hind Siliguri', sans-serif" font-size="9" font-weight="bold" fill="${capColor}" text-anchor="middle">আ</text>

      <!-- Label Typography -->
      <text x="200" y="262" font-family="'Hind Siliguri', sans-serif" font-size="10.5" font-weight="bold" fill="#111827" text-anchor="middle">আইমান ব্রান্ড</text>
      <text x="200" y="276" font-family="'Hind Siliguri', sans-serif" font-size="8" font-weight="500" fill="#6B7280" text-anchor="middle">১০০% প্রাকৃতিক</text>
      
      <!-- Gold Quality Badge -->
      <rect x="174" y="285" width="52" height="13" rx="2.5" fill="${capColor}" />
      <text x="200" y="294" font-family="'Hind Siliguri', sans-serif" font-size="7" font-weight="bold" fill="#FAF7F0" text-anchor="middle">ঘানিভাঙা খাঁটি</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getCategoryPlaceholderSvg(type: string): string {
  let iconPath = '';
  // Clean line icons inside a tranquil cream circle
  if (type === 'mustard') {
    // Oil drops / plant silhouette
    iconPath = `<path d="M50 25 C50 25 32 50 32 63 C32 73 40 81 50 81 C60 81 68 73 68 63 C68 50 50 25 50 25 Z" fill="#1B4D2B" opacity="0.9"/>
                <path d="M42 64 C42 69 45 74 50 74" stroke="#FAF7F0" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  } else if (type === 'coconut') {
    iconPath = `<circle cx="50" cy="50" r="24" fill="#1B4D2B" opacity="0.15"/>
                <circle cx="50" cy="50" r="18" fill="none" stroke="#1B4D2B" stroke-width="3"/>
                <circle cx="45" cy="45" r="3" fill="#1B4D2B"/>
                <circle cx="55" cy="45" r="3" fill="#1B4D2B"/>
                <circle cx="50" cy="55" r="3" fill="#1B4D2B"/>`;
  } else if (type === 'ghee') {
    iconPath = `<path d="M34 40 L66 40 L62 76 C62 78 60 80 58 80 L42 80 C40 80 38 78 38 76 Z" fill="#1B4D2B" opacity="0.85"/>
                <rect x="32" y="32" width="36" height="8" rx="2" fill="#1B4D2B"/>
                <path d="M50 22 C47 26 47 30 50 32" stroke="#C99A2E" stroke-width="3" stroke-linecap="round"/>`;
  } else if (type === 'blackseed') {
    iconPath = `<ellipse cx="44" cy="50" rx="6" ry="12" transform="rotate(-20 44 50)" fill="#1B4D2B"/>
                <ellipse cx="56" cy="50" rx="6" ry="12" transform="rotate(20 56 50)" fill="#1B4D2B"/>
                <ellipse cx="50" cy="62" rx="6" ry="10" fill="#1B4D2B"/>`;
  } else if (type === 'sesame') {
    iconPath = `<path d="M50 30 C50 30 38 48 38 58 C38 65 43 70 50 70 C57 70 62 65 62 58 C62 48 50 30 50 30 Z" fill="#1B4D2B" opacity="0.8"/>
                <path d="M50 42 L50 62" stroke="#FAF7F0" stroke-width="2" stroke-linecap="round"/>`;
  } else {
    iconPath = `<path d="M50 26 L56 40 L72 40 L60 50 L64 66 L50 56 L36 66 L40 50 L28 40 L44 40 Z" fill="#1B4D2B" opacity="0.85"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#ECE8DF" stroke-width="1.5"/>
    <circle cx="50" cy="50" r="40" fill="#FAF7F0"/>
    ${iconPath}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getBannerPlaceholderSvg(badge: string, title: string, subtitle: string, type: 'mustard' | 'ghee' | 'family'): string {
  let accentColor = '#1B4D2B';
  let bottleSvgType: 'mustard' | 'ghee' | 'general' = 'mustard';
  if (type === 'ghee') {
    accentColor = '#C99A2E';
    bottleSvgType = 'ghee';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="1200" height="500">
    <defs>
      <linearGradient id="bgBanner" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF7F0" />
        <stop offset="60%" stop-color="#F4EEE1" />
        <stop offset="100%" stop-color="#EBE3D3" />
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#1B4D2B" flood-opacity="0.1"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bgBanner)"/>
    <circle cx="950" cy="250" r="220" fill="#FFFFFF" fill-opacity="0.6"/>
    <circle cx="950" cy="250" r="160" fill="#FAF7F0" fill-opacity="0.9"/>
    
    <!-- Graphic Bottle on right -->
    <g transform="translate(800, 50) scale(0.95)" filter="url(#cardShadow)">
      <!-- Amber Bottle -->
      <rect x="130" y="30" width="40" height="24" rx="4" fill="#1B4D2B" />
      <path d="M135 54 L165 54 L165 100 L135 100 Z" fill="#D98200" />
      <path d="M135 100 C105 115 90 140 90 170 L90 350 C90 365 102 372 118 372 L182 372 C198 372 210 365 210 350 L210 170 C210 140 195 115 165 100 Z" fill="#D98200" />
      <!-- Label -->
      <rect x="105" y="190" width="90" height="110" rx="6" fill="#FFFFFF" />
      <circle cx="150" cy="220" r="14" fill="#FAF7F0" stroke="#1B4D2B" stroke-width="1.5" />
      <text x="150" y="225" font-family="'Hind Siliguri', sans-serif" font-size="11" font-weight="bold" fill="#1B4D2B" text-anchor="middle">আইমান</text>
      <text x="150" y="252" font-family="'Hind Siliguri', sans-serif" font-size="11" font-weight="bold" fill="#111827" text-anchor="middle">খাঁটি সরিষার তেল</text>
      <text x="150" y="270" font-family="'Hind Siliguri', sans-serif" font-size="9" fill="#6B7280" text-anchor="middle">১০০% প্রাকৃতিক ঘানিভাঙা</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

