import { getSettings } from '../services/storeService';
import { Language } from '../i18n/translations';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatDigits(val: number | string, forceFormat?: 'english' | 'bengali'): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  const settings = getSettings();
  const format = forceFormat || settings.numberFormat || 'english';

  if (format === 'english') {
    return str.replace(/[০-৯]/g, (d) => {
      const idx = BENGALI_DIGITS.indexOf(d);
      return idx >= 0 ? ENGLISH_DIGITS[idx] : d;
    });
  } else {
    return str.replace(/[0-9]/g, (d) => {
      const idx = ENGLISH_DIGITS.indexOf(d);
      return idx >= 0 ? BENGALI_DIGITS[idx] : d;
    });
  }
}

export function formatPrice(amount: number | string, lang: Language = 'bn'): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
  const rounded = Math.round(num);

  const settings = getSettings();
  if (lang === 'en') {
    // English mode: always clear english digits with comma formatting, e.g. ৳1,250
    return `৳${rounded.toLocaleString('en-US')}`;
  } else {
    // Bengali mode: depending on admin settings
    if (settings.numberFormat === 'bengali') {
      const formatted = rounded.toLocaleString('bn-BD');
      return `৳${formatted}`;
    } else {
      return `৳${rounded.toLocaleString('en-US')}`;
    }
  }
}

export function formatNumber(val: number | string, lang: Language = 'bn'): string {
  if (val === undefined || val === null) return '';
  const settings = getSettings();
  if (lang === 'en') {
    return formatDigits(val, 'english');
  } else {
    return formatDigits(val, settings.numberFormat || 'english');
  }
}

export function formatDate(dateString: string | undefined | null, lang: Language = 'bn'): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = d.getDate();
    const monthIdx = d.getMonth();
    const year = d.getFullYear();

    if (lang === 'en') {
      return `${day} ${MONTHS_EN[monthIdx]} ${year}`;
    } else {
      const dayBn = formatDigits(day, 'bengali');
      const yearBn = formatDigits(year, 'bengali');
      return `${dayBn} ${MONTHS_BN[monthIdx]} ${yearBn}`;
    }
  } catch {
    return dateString;
  }
}

export function formatSize(sizeLabel: string | undefined | null, lang: Language = 'bn'): string {
  if (!sizeLabel) return '';
  let str = sizeLabel;

  if (lang === 'en') {
    // Map common Bengali weight/volume terms to English if present
    str = str
      .replace(/লিটার/g, 'Litre')
      .replace(/গ্রাম/g, 'g')
      .replace(/কেজি/g, 'kg')
      .replace(/মিলি/g, 'ml')
      .replace(/পিস/g, 'Pcs');

    return formatDigits(str, 'english');
  } else {
    return formatDigits(str, 'bengali');
  }
}
