export interface TagDictionary {
  materials: string[];
  colors: string[];
  styles: string[];
  sizes: string[];
  occasions: string[];
  features: string[];
}

const TAG_DICTIONARY: TagDictionary = {
  materials: [
    'leather', 'cotton', 'denim', 'canvas', 'nylon', 'polyester', 'wool', 'silk',
    'suede', 'mesh', 'plastic', 'metal', 'glass', 'ceramic', 'rubber', 'latex',
    'faux leather', 'synthetic', 'organic cotton', 'bamboo', 'linen'
  ],
  colors: [
    'black', 'white', 'grey', 'gray', 'brown', 'tan', 'beige', 'navy', 'blue',
    'red', 'pink', 'green', 'yellow', 'orange', 'purple', 'gold', 'silver',
    'nude', 'khaki', 'burgundy', 'maroon', 'cream', 'ivory'
  ],
  styles: [
    'casual', 'formal', 'business', 'sporty', 'athletic', 'vintage', 'retro',
    'modern', 'classic', 'trendy', 'minimalist', 'boho', 'chic', 'elegant',
    'comfortable', 'stylish', 'fashionable', 'luxury', 'premium', 'basic'
  ],
  sizes: [
    'mini', 'small', 'medium', 'large', 'oversized', 'plus size', 'petite',
    'tall', 'regular', 'slim', 'wide', 'narrow', 'compact', 'big', 'tiny'
  ],
  occasions: [
    'work', 'office', 'party', 'wedding', 'date', 'vacation', 'travel',
    'gym', 'workout', 'running', 'everyday', 'casual wear', 'formal wear',
    'evening', 'daytime', 'summer', 'winter', 'spring', 'fall'
  ],
  features: [
    'waterproof', 'breathable', 'stretchy', 'comfortable', 'durable', 'lightweight',
    'heavy duty', 'quick dry', 'anti-wrinkle', 'easy care', 'machine washable',
    'non-slip', 'adjustable', 'removable', 'reversible', 'multi-pocket'
  ]
};

const CATEGORY_SPECIFIC_TAGS: Record<string, string[]> = {
  'bags-shoes': ['footwear', 'accessories', 'handbag', 'backpack', 'shoes'],
  'mens-fashion': ['mens', 'masculine', 'gentlemen'],
  'womens-fashion': ['womens', 'feminine', 'ladies'],
  'beauty-fragrance': ['beauty', 'cosmetics', 'fragrance', 'skincare']
};

const SUBCATEGORY_TAGS: Record<string, string[]> = {
  'mens-shoes': ['shoes', 'footwear', 'mens'],
  'womens-shoes': ['shoes', 'footwear', 'womens'],
  'bags': ['bag', 'handbag', 'accessories'],
  'travel-bags': ['travel', 'luggage', 'bag'],
  'mens-tops': ['shirt', 'top', 'mens'],
  'mens-bottoms': ['pants', 'bottoms', 'mens'],
  'mens-outerwear': ['jacket', 'coat', 'outerwear', 'mens'],
  'mens-accessories': ['accessories', 'mens'],
  'womens-tops': ['shirt', 'top', 'blouse', 'womens'],
  'womens-dresses': ['dress', 'womens'],
  'womens-bottoms': ['pants', 'bottoms', 'womens'],
  'womens-outerwear': ['jacket', 'coat', 'outerwear', 'womens'],
  'womens-accessories': ['accessories', 'womens'],
  'perfumes': ['perfume', 'fragrance', 'scent'],
  'body-sprays': ['body spray', 'fragrance'],
  'skincare': ['skincare', 'beauty', 'face care'],
  'makeup': ['makeup', 'cosmetics', 'beauty']
};

export function extractWordsFromText(text: string): string[] {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'for', 'with', 'from'].includes(word));
}

export function findMatchingTags(words: string[], dictionary: string[]): string[] {
  const matches: string[] = [];
  
  for (const word of words) {
    for (const dictWord of dictionary) {
      if (word.includes(dictWord) || dictWord.includes(word)) {
        matches.push(dictWord);
      }
    }
  }
  
  return [...new Set(matches)];
}

export function generateAutoTags(
  title: string = '',
  brand: string = '',
  primaryCategory: string = '',
  subcategory: string = ''
): string[] {
  const tags = new Set<string>();
  
  // Extract words from title and brand
  const titleWords = extractWordsFromText(title);
  const brandWords = extractWordsFromText(brand);
  const allWords = [...titleWords, ...brandWords];
  
  // Add brand as tag if present
  if (brand && brand.trim().length > 0) {
    tags.add(brand.toLowerCase().trim());
  }
  
  // Add category-specific tags
  if (primaryCategory && CATEGORY_SPECIFIC_TAGS[primaryCategory]) {
    CATEGORY_SPECIFIC_TAGS[primaryCategory].forEach(tag => tags.add(tag));
  }
  
  // Add subcategory-specific tags
  if (subcategory && SUBCATEGORY_TAGS[subcategory]) {
    SUBCATEGORY_TAGS[subcategory].forEach(tag => tags.add(tag));
  }
  
  // Find matching tags from dictionary
  Object.values(TAG_DICTIONARY).forEach(dictionary => {
    const matches = findMatchingTags(allWords, dictionary);
    matches.forEach(tag => tags.add(tag));
  });
  
  // Add direct word matches for title words (filtered)
  titleWords
    .filter(word => word.length > 3)
    .filter(word => !['product', 'item', 'piece', 'style'].includes(word))
    .forEach(word => tags.add(word));
  
  return Array.from(tags).slice(0, 10); // Limit to 10 auto-generated tags
}

export function suggestAdditionalTags(
  currentTags: string[],
  title: string = '',
  brand: string = '',
  primaryCategory: string = '',
  subcategory: string = ''
): string[] {
  const allPossibleTags = generateAutoTags(title, brand, primaryCategory, subcategory);
  
  return allPossibleTags.filter(tag => !currentTags.includes(tag));
}