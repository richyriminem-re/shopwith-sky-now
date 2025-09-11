import type { 
  PrimaryCategory, 
  Subcategory, 
  BagsShoesSubcategory, 
  MensFashionSubcategory, 
  WomensFashionSubcategory, 
  BeautyFragranceSubcategory 
} from '@/types';

export const PRIMARY_CATEGORIES: { value: PrimaryCategory; label: string }[] = [
  { value: 'bags-shoes', label: 'Bags & Shoes' },
  { value: 'mens-fashion', label: "Men's Fashion" },
  { value: 'womens-fashion', label: "Women's Fashion" },
  { value: 'beauty-fragrance', label: 'Beauty & Fragrance' },
];

export const SUBCATEGORIES_BY_PRIMARY: Record<PrimaryCategory, { value: Subcategory; label: string }[]> = {
  'bags-shoes': [
    { value: 'mens-shoes', label: "Men's Shoes" },
    { value: 'womens-shoes', label: "Women's Shoes" },
    { value: 'bags', label: 'Bags' },
    { value: 'travel-bags', label: 'Travel Bags' },
  ],
  'mens-fashion': [
    { value: 'mens-tops', label: 'Tops' },
    { value: 'mens-bottoms', label: 'Bottoms' },
    { value: 'mens-outerwear', label: 'Outerwear' },
    { value: 'mens-accessories', label: 'Accessories' },
  ],
  'womens-fashion': [
    { value: 'womens-tops', label: 'Tops' },
    { value: 'womens-dresses', label: 'Dresses' },
    { value: 'womens-bottoms', label: 'Bottoms' },
    { value: 'womens-outerwear', label: 'Outerwear' },
    { value: 'womens-accessories', label: 'Accessories' },
  ],
  'beauty-fragrance': [
    { value: 'perfumes', label: 'Perfumes' },
    { value: 'body-sprays', label: 'Body Sprays' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'makeup', label: 'Makeup' },
  ],
};

// All valid subcategories for schema validation
export const ALL_SUBCATEGORIES: Subcategory[] = [
  'mens-shoes', 'womens-shoes', 'bags', 'travel-bags',
  'mens-tops', 'mens-bottoms', 'mens-outerwear', 'mens-accessories',
  'womens-tops', 'womens-dresses', 'womens-bottoms', 'womens-outerwear', 'womens-accessories',
  'perfumes', 'body-sprays', 'skincare', 'makeup'
];

/**
 * Get valid subcategories for a given primary category
 */
export function getSubcategoriesFor(primaryCategory?: PrimaryCategory): { value: Subcategory; label: string }[] {
  if (!primaryCategory) return [];
  return SUBCATEGORIES_BY_PRIMARY[primaryCategory] || [];
}

/**
 * Check if a subcategory is valid for a given primary category
 */
export function isValidSubcategoryForPrimary(subcategory: Subcategory, primaryCategory: PrimaryCategory): boolean {
  const validSubcategories = getSubcategoriesFor(primaryCategory);
  return validSubcategories.some(sub => sub.value === subcategory);
}

/**
 * Get the label for a primary category
 */
export function getPrimaryCategoryLabel(primaryCategory: PrimaryCategory): string {
  const category = PRIMARY_CATEGORIES.find(cat => cat.value === primaryCategory);
  return category?.label || primaryCategory;
}

/**
 * Get the label for a subcategory
 */
export function getSubcategoryLabel(subcategory: Subcategory): string {
  for (const [primaryCategory, subcategories] of Object.entries(SUBCATEGORIES_BY_PRIMARY)) {
    const sub = subcategories.find(sub => sub.value === subcategory);
    if (sub) return sub.label;
  }
  return subcategory;
}