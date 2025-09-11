import type { Product } from '@/types';

// Import Bags & Shoes images
import mensDressShoesBlack from '@/assets/products/mens-dress-shoes-black.webp';
import mensDressShoesBrown from '@/assets/products/mens-dress-shoes-brown.webp';
import mensSneakersWhite from '@/assets/products/mens-sneakers-white.webp';
import mensSneakersBlack from '@/assets/products/mens-sneakers-black.webp';
import mensBootsBrown from '@/assets/products/mens-boots-brown.webp';
import womensHeelsBlack from '@/assets/products/womens-heels-black.webp';
import womensFlatsNude from '@/assets/products/womens-flats-nude.webp';
import womensSneakersWhite from '@/assets/products/womens-sneakers-white.webp';
import womensBootsBlack from '@/assets/products/womens-boots-black.webp';
import handbagBlack from '@/assets/products/handbag-black.webp';
import handbagBrown from '@/assets/products/handbag-brown.webp';
import crossbodyBagBlack from '@/assets/products/crossbody-bag-black.webp';
import backpackBlack from '@/assets/products/backpack-black.webp';
import backpackNavy from '@/assets/products/backpack-navy.webp';
import duffelBagBlack from '@/assets/products/duffel-bag-black.webp';

// Import Men's Fashion images
import mensTshirtWhite from '@/assets/products/mens-tshirt-white.webp';
import mensTshirtBlack from '@/assets/products/mens-tshirt-black.webp';
import mensPoloNavy from '@/assets/products/mens-polo-navy.webp';
import mensDressShirtWhite from '@/assets/products/mens-dress-shirt-white.webp';
import mensHoodieGrey from '@/assets/products/mens-hoodie-grey.webp';
import mensJeansBlue from '@/assets/products/mens-jeans-blue.webp';
import mensChinosKhaki from '@/assets/products/mens-chinos-khaki.webp';
import mensShortsBlack from '@/assets/products/mens-shorts-black.webp';
import mensBlazerNavy from '@/assets/products/mens-blazer-navy.webp';
import mensLeatherJacketBlack from '@/assets/products/mens-leather-jacket-black.webp';
import mensBeltBlack from '@/assets/products/mens-belt-black.webp';
import mensWalletBlack from '@/assets/products/mens-wallet-black.webp';
import mensWatchSilver from '@/assets/products/mens-watch-silver.webp';

// Import Women's Fashion images
import womensBlouseWhite from '@/assets/products/womens-blouse-white.webp';
import womensBlousePink from '@/assets/products/womens-blouse-pink.webp';
import womensSweaterBeige from '@/assets/products/womens-sweater-beige.webp';
import womensMidiDressBlack from '@/assets/products/womens-midi-dress-black.webp';
import womensMaxiDressNavy from '@/assets/products/womens-maxi-dress-navy.webp';
import womensCasualDressRed from '@/assets/products/womens-casual-dress-red.webp';
import womensJeansBlue from '@/assets/products/womens-jeans-blue.webp';
import womensSkirtBlack from '@/assets/products/womens-skirt-black.webp';
import womensLeggingsBlack from '@/assets/products/womens-leggings-black.webp';
import womensCardiganBeige from '@/assets/products/womens-cardigan-beige.webp';
import womensTrenchCoatBlack from '@/assets/products/womens-trench-coat-black.webp';
import womensNecklaceGold from '@/assets/products/womens-necklace-gold.webp';
import womensEarringsSilver from '@/assets/products/womens-earrings-silver.webp';

// Import Beauty & Fragrance images
import mensCologne from '@/assets/products/mens-cologne.webp';
import womensPerfume from '@/assets/products/womens-perfume.webp';
import bodySpray from '@/assets/products/body-spray.webp';
import moisturizer from '@/assets/products/moisturizer.webp';
import faceSerum from '@/assets/products/face-serum.webp';
import lipstickRed from '@/assets/products/lipstick-red.webp';
import foundation from '@/assets/products/foundation.webp';
import eyeshadowPalette from '@/assets/products/eyeshadow-palette.webp';

export const products: Product[] = [
  // BAGS & SHOES - Men's Shoes
  {
    id: '1',
    title: 'Classic Oxford Dress Shoes',
    handle: 'classic-oxford-dress-shoes',
    description: 'Premium leather Oxford dress shoes perfect for formal occasions and business meetings.',
    primaryCategory: 'bags-shoes',
    subcategory: 'mens-shoes',
    images: [mensDressShoesBlack, mensDressShoesBrown],
    brand: 'Gentleman Style',
    tags: ['formal', 'leather', 'business', 'oxford'],
    featured: true,
    variants: [
      { id: '1-41-black', sku: 'OXF-M-41-BLK', size: '41', color: 'Black', price: 45000, stock: 12 },
      { id: '1-42-black', sku: 'OXF-M-42-BLK', size: '42', color: 'Black', price: 45000, stock: 15 },
      { id: '1-43-black', sku: 'OXF-M-43-BLK', size: '43', color: 'Black', price: 45000, stock: 10 },
      { id: '1-42-brown', sku: 'OXF-M-42-BRN', size: '42', color: 'Brown', price: 47000, stock: 8 },
      { id: '1-43-brown', sku: 'OXF-M-43-BRN', size: '43', color: 'Brown', price: 47000, stock: 6 },
    ]
  },
  {
    id: '2',
    title: 'Premium Athletic Sneakers',
    handle: 'premium-athletic-sneakers',
    description: 'High-performance athletic sneakers with superior comfort and style for daily wear.',
    primaryCategory: 'bags-shoes',
    subcategory: 'mens-shoes',
    images: [mensSneakersWhite, mensSneakersBlack],
    brand: 'SportMax',
    tags: ['athletic', 'comfort', 'casual', 'running'],
    featured: true,
    variants: [
      { id: '2-41-white', sku: 'SNK-M-41-WHT', size: '41', color: 'White', price: 32000, comparePrice: 40000, stock: 18 },
      { id: '2-42-white', sku: 'SNK-M-42-WHT', size: '42', color: 'White', price: 32000, comparePrice: 40000, stock: 22 },
      { id: '2-43-white', sku: 'SNK-M-43-WHT', size: '43', color: 'White', price: 32000, comparePrice: 40000, stock: 15 },
      { id: '2-42-black', sku: 'SNK-M-42-BLK', size: '42', color: 'Black', price: 35000, stock: 14 },
      { id: '2-43-black', sku: 'SNK-M-43-BLK', size: '43', color: 'Black', price: 35000, stock: 12 },
    ]
  },
  {
    id: '3',
    title: 'Rugged Leather Boots',
    handle: 'rugged-leather-boots',
    description: 'Durable leather boots built for adventure and everyday toughness.',
    primaryCategory: 'bags-shoes',
    subcategory: 'mens-shoes',
    images: [mensBootsBrown],
    brand: 'Wilderness Co',
    tags: ['boots', 'leather', 'durable', 'adventure'],
    featured: false,
    variants: [
      { id: '3-41-brown', sku: 'BTS-M-41-BRN', size: '41', color: 'Brown', price: 55000, stock: 8 },
      { id: '3-42-brown', sku: 'BTS-M-42-BRN', size: '42', color: 'Brown', price: 55000, stock: 10 },
      { id: '3-43-brown', sku: 'BTS-M-43-BRN', size: '43', color: 'Brown', price: 55000, stock: 6 },
    ]
  },

  // BAGS & SHOES - Women's Shoes
  {
    id: '4',
    title: 'Elegant Black Heels',
    handle: 'elegant-black-heels',
    description: 'Sophisticated black heels perfect for formal events and professional settings.',
    primaryCategory: 'bags-shoes',
    subcategory: 'womens-shoes',
    images: [womensHeelsBlack],
    brand: 'Elegance',
    tags: ['heels', 'formal', 'elegant', 'professional'],
    featured: true,
    variants: [
      { id: '4-36-black', sku: 'HLS-W-36-BLK', size: '36', color: 'Black', price: 38000, stock: 12 },
      { id: '4-37-black', sku: 'HLS-W-37-BLK', size: '37', color: 'Black', price: 38000, stock: 15 },
      { id: '4-38-black', sku: 'HLS-W-38-BLK', size: '38', color: 'Black', price: 38000, stock: 18 },
      { id: '4-39-black', sku: 'HLS-W-39-BLK', size: '39', color: 'Black', price: 38000, stock: 10 },
    ]
  },
  {
    id: '5',
    title: 'Comfortable Nude Flats',
    handle: 'comfortable-nude-flats',
    description: 'Ultra-comfortable nude flats for all-day wear and versatile styling.',
    primaryCategory: 'bags-shoes',
    subcategory: 'womens-shoes',
    images: [womensFlatsNude],
    brand: 'Comfort Plus',
    tags: ['flats', 'comfortable', 'versatile', 'nude'],
    featured: false,
    variants: [
      { id: '5-36-nude', sku: 'FLT-W-36-NUD', size: '36', color: 'Nude', price: 25000, comparePrice: 30000, stock: 20 },
      { id: '5-37-nude', sku: 'FLT-W-37-NUD', size: '37', color: 'Nude', price: 25000, comparePrice: 30000, stock: 25 },
      { id: '5-38-nude', sku: 'FLT-W-38-NUD', size: '38', color: 'Nude', price: 25000, comparePrice: 30000, stock: 22 },
    ]
  },
  {
    id: '6',
    title: "Women's Athletic Sneakers",
    handle: 'womens-athletic-sneakers',
    description: 'Lightweight and breathable sneakers designed for active women.',
    primaryCategory: 'bags-shoes',
    subcategory: 'womens-shoes',
    images: [womensSneakersWhite],
    brand: 'ActiveFit',
    tags: ['sneakers', 'athletic', 'lightweight', 'breathable'],
    featured: true,
    variants: [
      { id: '6-36-white', sku: 'SNK-W-36-WHT', size: '36', color: 'White', price: 28000, stock: 16 },
      { id: '6-37-white', sku: 'SNK-W-37-WHT', size: '37', color: 'White', price: 28000, stock: 18 },
      { id: '6-38-white', sku: 'SNK-W-38-WHT', size: '38', color: 'White', price: 28000, stock: 14 },
    ]
  },
  {
    id: '7',
    title: 'Stylish Ankle Boots',
    handle: 'stylish-ankle-boots',
    description: 'Trendy ankle boots that combine style and comfort for everyday wear.',
    primaryCategory: 'bags-shoes',
    subcategory: 'womens-shoes',
    images: [womensBootsBlack],
    brand: 'Urban Style',
    tags: ['boots', 'ankle', 'trendy', 'comfortable'],
    featured: false,
    variants: [
      { id: '7-36-black', sku: 'ABT-W-36-BLK', size: '36', color: 'Black', price: 42000, stock: 10 },
      { id: '7-37-black', sku: 'ABT-W-37-BLK', size: '37', color: 'Black', price: 42000, stock: 12 },
      { id: '7-38-black', sku: 'ABT-W-38-BLK', size: '38', color: 'Black', price: 42000, stock: 8 },
    ]
  },

  // BAGS & SHOES - Bags
  {
    id: '8',
    title: 'Premium Leather Handbag',
    handle: 'premium-leather-handbag',
    description: 'Luxurious leather handbag with spacious compartments and elegant design.',
    primaryCategory: 'bags-shoes',
    subcategory: 'bags',
    images: [handbagBlack, handbagBrown],
    brand: 'LuxeLeather',
    tags: ['handbag', 'leather', 'luxury', 'spacious'],
    featured: true,
    variants: [
      { id: '8-os-black', sku: 'HBG-OS-BLK', size: 'One Size', color: 'Black', price: 65000, stock: 8 },
      { id: '8-os-brown', sku: 'HBG-OS-BRN', size: 'One Size', color: 'Brown', price: 68000, stock: 6 },
    ]
  },
  {
    id: '9',
    title: 'Compact Crossbody Bag',
    handle: 'compact-crossbody-bag',
    description: 'Convenient crossbody bag perfect for hands-free daily activities.',
    primaryCategory: 'bags-shoes',
    subcategory: 'bags',
    images: [crossbodyBagBlack],
    brand: 'Urban Carry',
    tags: ['crossbody', 'compact', 'convenient', 'daily'],
    featured: false,
    variants: [
      { id: '9-os-black', sku: 'CRB-OS-BLK', size: 'One Size', color: 'Black', price: 35000, comparePrice: 42000, stock: 15 },
    ]
  },

  // BAGS & SHOES - Travel Bags
  {
    id: '10',
    title: 'Versatile Travel Backpack',
    handle: 'versatile-travel-backpack',
    description: 'Multi-compartment backpack designed for travel and daily commuting.',
    primaryCategory: 'bags-shoes',
    subcategory: 'travel-bags',
    images: [backpackBlack, backpackNavy],
    brand: 'TravelPro',
    tags: ['backpack', 'travel', 'commuting', 'multi-compartment'],
    featured: true,
    variants: [
      { id: '10-os-black', sku: 'BPK-OS-BLK', size: 'One Size', color: 'Black', price: 45000, stock: 12 },
      { id: '10-os-navy', sku: 'BPK-OS-NVY', size: 'One Size', color: 'Navy', price: 45000, stock: 10 },
    ]
  },
  {
    id: '11',
    title: 'Heavy-Duty Duffel Bag',
    handle: 'heavy-duty-duffel-bag',
    description: 'Durable duffel bag perfect for gym sessions and weekend getaways.',
    primaryCategory: 'bags-shoes',
    subcategory: 'travel-bags',
    images: [duffelBagBlack],
    brand: 'StrongBag',
    tags: ['duffel', 'gym', 'weekend', 'durable'],
    featured: false,
    variants: [
      { id: '11-os-black', sku: 'DFL-OS-BLK', size: 'One Size', color: 'Black', price: 38000, stock: 18 },
    ]
  },

  // MEN'S FASHION - Tops
  {
    id: '12',
    title: 'Premium Cotton T-Shirt',
    handle: 'premium-cotton-tshirt',
    description: 'Soft, breathable cotton t-shirt perfect for casual everyday wear.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-tops',
    images: [mensTshirtWhite, mensTshirtBlack],
    brand: 'Essential Wear',
    tags: ['cotton', 'casual', 'comfortable', 'breathable'],
    featured: true,
    variants: [
      { id: '12-s-white', sku: 'TSH-M-S-WHT', size: 'S', color: 'White', price: 12000, stock: 25 },
      { id: '12-m-white', sku: 'TSH-M-M-WHT', size: 'M', color: 'White', price: 12000, stock: 30 },
      { id: '12-l-white', sku: 'TSH-M-L-WHT', size: 'L', color: 'White', price: 12000, stock: 28 },
      { id: '12-m-black', sku: 'TSH-M-M-BLK', size: 'M', color: 'Black', price: 12000, stock: 20 },
      { id: '12-l-black', sku: 'TSH-M-L-BLK', size: 'L', color: 'Black', price: 12000, stock: 22 },
    ]
  },
  {
    id: '13',
    title: 'Classic Polo Shirt',
    handle: 'classic-polo-shirt',
    description: 'Timeless polo shirt that bridges casual and semi-formal occasions.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-tops',
    images: [mensPoloNavy],
    brand: 'Classic Fit',
    tags: ['polo', 'classic', 'semi-formal', 'versatile'],
    featured: false,
    variants: [
      { id: '13-s-navy', sku: 'PLO-M-S-NVY', size: 'S', color: 'Navy', price: 18000, comparePrice: 22000, stock: 15 },
      { id: '13-m-navy', sku: 'PLO-M-M-NVY', size: 'M', color: 'Navy', price: 18000, comparePrice: 22000, stock: 18 },
      { id: '13-l-navy', sku: 'PLO-M-L-NVY', size: 'L', color: 'Navy', price: 18000, comparePrice: 22000, stock: 12 },
    ]
  },
  {
    id: '14',
    title: 'Crisp Dress Shirt',
    handle: 'crisp-dress-shirt',
    description: 'Professional dress shirt with perfect fit for business and formal events.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-tops',
    images: [mensDressShirtWhite],
    brand: 'Professional',
    tags: ['dress shirt', 'formal', 'business', 'professional'],
    featured: true,
    variants: [
      { id: '14-s-white', sku: 'DSH-M-S-WHT', size: 'S', color: 'White', price: 25000, stock: 14 },
      { id: '14-m-white', sku: 'DSH-M-M-WHT', size: 'M', color: 'White', price: 25000, stock: 16 },
      { id: '14-l-white', sku: 'DSH-M-L-WHT', size: 'L', color: 'White', price: 25000, stock: 12 },
    ]
  },
  {
    id: '15',
    title: 'Cozy Pullover Hoodie',
    handle: 'cozy-pullover-hoodie',
    description: 'Warm and comfortable hoodie perfect for casual outings and lounging.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-tops',
    images: [mensHoodieGrey],
    brand: 'Comfort Zone',
    tags: ['hoodie', 'cozy', 'casual', 'warm'],
    featured: false,
    variants: [
      { id: '15-s-grey', sku: 'HOD-M-S-GRY', size: 'S', color: 'Grey', price: 22000, stock: 18 },
      { id: '15-m-grey', sku: 'HOD-M-M-GRY', size: 'M', color: 'Grey', price: 22000, stock: 20 },
      { id: '15-l-grey', sku: 'HOD-M-L-GRY', size: 'L', color: 'Grey', price: 22000, stock: 15 },
    ]
  },

  // MEN'S FASHION - Bottoms
  {
    id: '16',
    title: 'Classic Denim Jeans',
    handle: 'classic-denim-jeans',
    description: 'Premium denim jeans with perfect fit and lasting durability.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-bottoms',
    images: [mensJeansBlue],
    brand: 'DenimCraft',
    tags: ['jeans', 'denim', 'classic', 'durable'],
    featured: true,
    variants: [
      { id: '16-30-blue', sku: 'JNS-M-30-BLU', size: '30', color: 'Blue', price: 35000, stock: 14 },
      { id: '16-32-blue', sku: 'JNS-M-32-BLU', size: '32', color: 'Blue', price: 35000, stock: 18 },
      { id: '16-34-blue', sku: 'JNS-M-34-BLU', size: '34', color: 'Blue', price: 35000, stock: 16 },
    ]
  },
  {
    id: '17',
    title: 'Smart Chino Pants',
    handle: 'smart-chino-pants',
    description: 'Versatile chino pants suitable for both casual and smart-casual occasions.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-bottoms',
    images: [mensChinosKhaki],
    brand: 'Smart Casual',
    tags: ['chinos', 'smart-casual', 'versatile', 'comfortable'],
    featured: false,
    variants: [
      { id: '17-30-khaki', sku: 'CHN-M-30-KHK', size: '30', color: 'Khaki', price: 28000, comparePrice: 35000, stock: 12 },
      { id: '17-32-khaki', sku: 'CHN-M-32-KHK', size: '32', color: 'Khaki', price: 28000, comparePrice: 35000, stock: 15 },
      { id: '17-34-khaki', sku: 'CHN-M-34-KHK', size: '34', color: 'Khaki', price: 28000, comparePrice: 35000, stock: 10 },
    ]
  },
  {
    id: '18',
    title: 'Performance Athletic Shorts',
    handle: 'performance-athletic-shorts',
    description: 'Moisture-wicking athletic shorts designed for peak performance.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-bottoms',
    images: [mensShortsBlack],
    brand: 'SportTech',
    tags: ['athletic', 'moisture-wicking', 'performance', 'gym'],
    featured: false,
    variants: [
      { id: '18-s-black', sku: 'SHT-M-S-BLK', size: 'S', color: 'Black', price: 15000, stock: 20 },
      { id: '18-m-black', sku: 'SHT-M-M-BLK', size: 'M', color: 'Black', price: 15000, stock: 25 },
      { id: '18-l-black', sku: 'SHT-M-L-BLK', size: 'L', color: 'Black', price: 15000, stock: 18 },
    ]
  },

  // MEN'S FASHION - Outerwear
  {
    id: '19',
    title: 'Tailored Navy Blazer',
    handle: 'tailored-navy-blazer',
    description: 'Sophisticated navy blazer perfect for business meetings and formal events.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-outerwear',
    images: [mensBlazerNavy],
    brand: 'Formal Wear Co',
    tags: ['blazer', 'formal', 'business', 'sophisticated'],
    featured: true,
    variants: [
      { id: '19-s-navy', sku: 'BLZ-M-S-NVY', size: 'S', color: 'Navy', price: 85000, stock: 6 },
      { id: '19-m-navy', sku: 'BLZ-M-M-NVY', size: 'M', color: 'Navy', price: 85000, stock: 8 },
      { id: '19-l-navy', sku: 'BLZ-M-L-NVY', size: 'L', color: 'Navy', price: 85000, stock: 5 },
    ]
  },
  {
    id: '20',
    title: 'Classic Leather Jacket',
    handle: 'classic-leather-jacket',
    description: 'Timeless leather jacket that adds edge to any casual outfit.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-outerwear',
    images: [mensLeatherJacketBlack],
    brand: 'Rebel Style',
    tags: ['leather jacket', 'classic', 'edgy', 'casual'],
    featured: true,
    variants: [
      { id: '20-s-black', sku: 'LJK-M-S-BLK', size: 'S', color: 'Black', price: 120000, stock: 4 },
      { id: '20-m-black', sku: 'LJK-M-M-BLK', size: 'M', color: 'Black', price: 120000, stock: 6 },
      { id: '20-l-black', sku: 'LJK-M-L-BLK', size: 'L', color: 'Black', price: 120000, stock: 3 },
    ]
  },

  // MEN'S FASHION - Accessories
  {
    id: '21',
    title: 'Premium Leather Belt',
    handle: 'premium-leather-belt',
    description: 'High-quality leather belt that complements both casual and formal attire.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-accessories',
    images: [mensBeltBlack],
    brand: 'Belt Master',
    tags: ['belt', 'leather', 'versatile', 'quality'],
    featured: false,
    variants: [
      { id: '21-32-black', sku: 'BLT-M-32-BLK', size: '32', color: 'Black', price: 18000, stock: 15 },
      { id: '21-34-black', sku: 'BLT-M-34-BLK', size: '34', color: 'Black', price: 18000, stock: 18 },
      { id: '21-36-black', sku: 'BLT-M-36-BLK', size: '36', color: 'Black', price: 18000, stock: 12 },
    ]
  },
  {
    id: '22',
    title: 'Executive Leather Wallet',
    handle: 'executive-leather-wallet',
    description: 'Sleek leather wallet with multiple compartments for cards and cash.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-accessories',
    images: [mensWalletBlack],
    brand: 'Executive Style',
    tags: ['wallet', 'leather', 'executive', 'compartments'],
    featured: false,
    variants: [
      { id: '22-os-black', sku: 'WLT-M-OS-BLK', size: 'One Size', color: 'Black', price: 25000, comparePrice: 32000, stock: 20 },
    ]
  },
  {
    id: '23',
    title: 'Classic Silver Watch',
    handle: 'classic-silver-watch',
    description: 'Elegant silver watch with timeless design for the modern gentleman.',
    primaryCategory: 'mens-fashion',
    subcategory: 'mens-accessories',
    images: [mensWatchSilver],
    brand: 'TimeClassic',
    tags: ['watch', 'silver', 'elegant', 'timeless'],
    featured: true,
    variants: [
      { id: '23-os-silver', sku: 'WTC-M-OS-SLV', size: 'One Size', color: 'Silver', price: 75000, stock: 8 },
    ]
  },

  // WOMEN'S FASHION - Tops
  {
    id: '24',
    title: 'Elegant Silk Blouse',
    handle: 'elegant-silk-blouse',
    description: 'Luxurious silk blouse perfect for professional and special occasions.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-tops',
    images: [womensBlouseWhite, womensBlousePink],
    brand: 'Silk Elegance',
    tags: ['silk', 'blouse', 'elegant', 'professional'],
    featured: true,
    variants: [
      { id: '24-s-white', sku: 'BLS-W-S-WHT', size: 'S', color: 'White', price: 35000, stock: 12 },
      { id: '24-m-white', sku: 'BLS-W-M-WHT', size: 'M', color: 'White', price: 35000, stock: 15 },
      { id: '24-l-white', sku: 'BLS-W-L-WHT', size: 'L', color: 'White', price: 35000, stock: 10 },
      { id: '24-s-pink', sku: 'BLS-W-S-PNK', size: 'S', color: 'Pink', price: 38000, stock: 8 },
      { id: '24-m-pink', sku: 'BLS-W-M-PNK', size: 'M', color: 'Pink', price: 38000, stock: 12 },
    ]
  },
  {
    id: '25',
    title: 'Cozy Cashmere Sweater',
    handle: 'cozy-cashmere-sweater',
    description: 'Soft cashmere sweater that provides warmth and luxury in equal measure.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-tops',
    images: [womensSweaterBeige],
    brand: 'Luxury Knits',
    tags: ['cashmere', 'sweater', 'luxury', 'warm'],
    featured: true,
    variants: [
      { id: '25-s-beige', sku: 'SWT-W-S-BEG', size: 'S', color: 'Beige', price: 55000, comparePrice: 68000, stock: 8 },
      { id: '25-m-beige', sku: 'SWT-W-M-BEG', size: 'M', color: 'Beige', price: 55000, comparePrice: 68000, stock: 10 },
      { id: '25-l-beige', sku: 'SWT-W-L-BEG', size: 'L', color: 'Beige', price: 55000, comparePrice: 68000, stock: 6 },
    ]
  },

  // WOMEN'S FASHION - Dresses
  {
    id: '26',
    title: 'Sophisticated Midi Dress',
    handle: 'sophisticated-midi-dress',
    description: 'Versatile midi dress perfect for office wear and evening events.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-dresses',
    images: [womensMidiDressBlack],
    brand: 'Sophisticated Style',
    tags: ['midi dress', 'versatile', 'office', 'evening'],
    featured: true,
    variants: [
      { id: '26-s-black', sku: 'MID-W-S-BLK', size: 'S', color: 'Black', price: 45000, stock: 14 },
      { id: '26-m-black', sku: 'MID-W-M-BLK', size: 'M', color: 'Black', price: 45000, stock: 18 },
      { id: '26-l-black', sku: 'MID-W-L-BLK', size: 'L', color: 'Black', price: 45000, stock: 12 },
    ]
  },
  {
    id: '27',
    title: 'Flowing Maxi Dress',
    handle: 'flowing-maxi-dress',
    description: 'Beautiful flowing maxi dress ideal for summer events and beach vacations.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-dresses',
    images: [womensMaxiDressNavy],
    brand: 'Summer Breeze',
    tags: ['maxi dress', 'flowing', 'summer', 'beach'],
    featured: false,
    variants: [
      { id: '27-s-navy', sku: 'MXD-W-S-NVY', size: 'S', color: 'Navy', price: 38000, stock: 10 },
      { id: '27-m-navy', sku: 'MXD-W-M-NVY', size: 'M', color: 'Navy', price: 38000, stock: 14 },
      { id: '27-l-navy', sku: 'MXD-W-L-NVY', size: 'L', color: 'Navy', price: 38000, stock: 8 },
    ]
  },
  {
    id: '28',
    title: 'Vibrant Casual Dress',
    handle: 'vibrant-casual-dress',
    description: 'Eye-catching casual dress perfect for weekend outings and social gatherings.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-dresses',
    images: [womensCasualDressRed],
    brand: 'Weekend Style',
    tags: ['casual dress', 'vibrant', 'weekend', 'social'],
    featured: false,
    variants: [
      { id: '28-s-red', sku: 'CSD-W-S-RED', size: 'S', color: 'Red', price: 32000, comparePrice: 40000, stock: 12 },
      { id: '28-m-red', sku: 'CSD-W-M-RED', size: 'M', color: 'Red', price: 32000, comparePrice: 40000, stock: 15 },
      { id: '28-l-red', sku: 'CSD-W-L-RED', size: 'L', color: 'Red', price: 32000, comparePrice: 40000, stock: 10 },
    ]
  },

  // WOMEN'S FASHION - Bottoms
  {
    id: '29',
    title: "Women's Skinny Jeans",
    handle: 'womens-skinny-jeans',
    description: 'Perfectly fitted skinny jeans that flatter every body type.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-bottoms',
    images: [womensJeansBlue],
    brand: 'Perfect Fit',
    tags: ['skinny jeans', 'fitted', 'flattering', 'denim'],
    featured: true,
    variants: [
      { id: '29-26-blue', sku: 'SKJ-W-26-BLU', size: '26', color: 'Blue', price: 32000, stock: 16 },
      { id: '29-28-blue', sku: 'SKJ-W-28-BLU', size: '28', color: 'Blue', price: 32000, stock: 20 },
      { id: '29-30-blue', sku: 'SKJ-W-30-BLU', size: '30', color: 'Blue', price: 32000, stock: 18 },
    ]
  },
  {
    id: '30',
    title: 'Classic A-Line Skirt',
    handle: 'classic-a-line-skirt',
    description: 'Timeless A-line skirt suitable for both professional and casual wear.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-bottoms',
    images: [womensSkirtBlack],
    brand: 'Timeless Fashion',
    tags: ['A-line skirt', 'classic', 'professional', 'versatile'],
    featured: false,
    variants: [
      { id: '30-s-black', sku: 'ASK-W-S-BLK', size: 'S', color: 'Black', price: 25000, stock: 14 },
      { id: '30-m-black', sku: 'ASK-W-M-BLK', size: 'M', color: 'Black', price: 25000, stock: 18 },
      { id: '30-l-black', sku: 'ASK-W-L-BLK', size: 'L', color: 'Black', price: 25000, stock: 12 },
    ]
  },
  {
    id: '31',
    title: 'Premium Athletic Leggings',
    handle: 'premium-athletic-leggings',
    description: 'High-performance leggings designed for yoga, gym, and active lifestyle.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-bottoms',
    images: [womensLeggingsBlack],
    brand: 'ActiveFlex',
    tags: ['leggings', 'athletic', 'yoga', 'performance'],
    featured: false,
    variants: [
      { id: '31-s-black', sku: 'LEG-W-S-BLK', size: 'S', color: 'Black', price: 20000, stock: 22 },
      { id: '31-m-black', sku: 'LEG-W-M-BLK', size: 'M', color: 'Black', price: 20000, stock: 25 },
      { id: '31-l-black', sku: 'LEG-W-L-BLK', size: 'L', color: 'Black', price: 20000, stock: 20 },
    ]
  },

  // WOMEN'S FASHION - Outerwear
  {
    id: '32',
    title: 'Soft Knit Cardigan',
    handle: 'soft-knit-cardigan',
    description: 'Comfortable knit cardigan perfect for layering in any season.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-outerwear',
    images: [womensCardiganBeige],
    brand: 'Cozy Layers',
    tags: ['cardigan', 'knit', 'layering', 'comfortable'],
    featured: false,
    variants: [
      { id: '32-s-beige', sku: 'CDG-W-S-BEG', size: 'S', color: 'Beige', price: 30000, comparePrice: 38000, stock: 12 },
      { id: '32-m-beige', sku: 'CDG-W-M-BEG', size: 'M', color: 'Beige', price: 30000, comparePrice: 38000, stock: 15 },
      { id: '32-l-beige', sku: 'CDG-W-L-BEG', size: 'L', color: 'Beige', price: 30000, comparePrice: 38000, stock: 10 },
    ]
  },
  {
    id: '33',
    title: 'Classic Trench Coat',
    handle: 'classic-trench-coat',
    description: 'Iconic trench coat that combines style and functionality for any weather.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-outerwear',
    images: [womensTrenchCoatBlack],
    brand: 'Classic Outerwear',
    tags: ['trench coat', 'classic', 'weather', 'iconic'],
    featured: true,
    variants: [
      { id: '33-s-black', sku: 'TRC-W-S-BLK', size: 'S', color: 'Black', price: 95000, stock: 6 },
      { id: '33-m-black', sku: 'TRC-W-M-BLK', size: 'M', color: 'Black', price: 95000, stock: 8 },
      { id: '33-l-black', sku: 'TRC-W-L-BLK', size: 'L', color: 'Black', price: 95000, stock: 4 },
    ]
  },

  // WOMEN'S FASHION - Accessories
  {
    id: '34',
    title: 'Delicate Gold Necklace',
    handle: 'delicate-gold-necklace',
    description: 'Elegant gold necklace that adds sophistication to any outfit.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-accessories',
    images: [womensNecklaceGold],
    brand: 'Fine Jewelry',
    tags: ['necklace', 'gold', 'elegant', 'sophisticated'],
    featured: true,
    variants: [
      { id: '34-os-gold', sku: 'NCK-W-OS-GLD', size: 'One Size', color: 'Gold', price: 85000, stock: 10 },
    ]
  },
  {
    id: '35',
    title: 'Silver Drop Earrings',
    handle: 'silver-drop-earrings',
    description: 'Stunning silver earrings that complement both casual and formal looks.',
    primaryCategory: 'womens-fashion',
    subcategory: 'womens-accessories',
    images: [womensEarringsSilver],
    brand: 'Silver Style',
    tags: ['earrings', 'silver', 'drop', 'versatile'],
    featured: false,
    variants: [
      { id: '35-os-silver', sku: 'ERG-W-OS-SLV', size: 'One Size', color: 'Silver', price: 35000, comparePrice: 45000, stock: 15 },
    ]
  },

  // BEAUTY & FRAGRANCE - Perfumes
  {
    id: '36',
    title: 'Sophisticated Mens Cologne',
    handle: 'sophisticated-mens-cologne',
    description: 'Premium mens cologne with woody and citrus notes for the modern gentleman.',
    primaryCategory: 'beauty-fragrance',
    subcategory: 'perfumes',
    images: [mensCologne],
    brand: 'Gentleman Scent',
    tags: ['cologne', 'woody', 'citrus', 'sophisticated'],
    featured: true,
    variants: [
      { id: '36-50ml', sku: 'COL-M-50ML', size: '50ml', color: 'Clear', price: 45000, stock: 12 },
      { id: '36-100ml', sku: 'COL-M-100ML', size: '100ml', color: 'Clear', price: 75000, stock: 8 },
    ]
  },
  {
    id: '37',
    title: 'Elegant Womens Perfume',
    handle: 'elegant-womens-perfume',
    description: 'Luxurious womens perfume with floral and vanilla notes for timeless elegance.',
    primaryCategory: 'beauty-fragrance',
    subcategory: 'perfumes',
    images: [womensPerfume],
    brand: 'Elegant Scent',
    tags: ['perfume', 'floral', 'vanilla', 'elegant'],
    featured: true,
    variants: [
      { id: '37-50ml', sku: 'PRF-W-50ML', size: '50ml', color: 'Clear', price: 52000, comparePrice: 65000, stock: 10 },
      { id: '37-100ml', sku: 'PRF-W-100ML', size: '100ml', color: 'Clear', price: 85000, stock: 6 },
    ]
  },

  // BEAUTY & FRAGRANCE - Body Sprays
  {
    id: '38',
    title: 'Fresh Daily Body Spray',
    handle: 'fresh-daily-body-spray',
    description: 'Light and refreshing body spray perfect for everyday use.',
    primaryCategory: 'beauty-fragrance',
    subcategory: 'body-sprays',
    images: [bodySpray],
    brand: 'Fresh Daily',
    tags: ['body spray', 'fresh', 'daily', 'light'],
    featured: false,
    variants: [
      { id: '38-150ml', sku: 'BSP-150ML', size: '150ml', color: 'Clear', price: 18000, stock: 25 },
      { id: '38-250ml', sku: 'BSP-250ML', size: '250ml', color: 'Clear', price: 28000, stock: 18 },
    ]
  },

  // BEAUTY & FRAGRANCE - Skincare
  {
    id: '39',
    title: 'Hydrating Face Moisturizer',
    handle: 'hydrating-face-moisturizer',
    description: 'Rich moisturizer that provides 24-hour hydration for all skin types.',
    primaryCategory: 'beauty-fragrance',
    subcategory: 'skincare',
    images: [moisturizer],
    brand: 'HydraCare',
    tags: ['moisturizer', 'hydrating', '24-hour', 'skincare'],
    featured: true,
    variants: [
      { id: '39-50ml', sku: 'MST-50ML', size: '50ml', color: 'White', price: 32000, stock: 20 },
      { id: '39-100ml', sku: 'MST-100ML', size: '100ml', color: 'White', price: 55000, stock: 15 },
    ]
  },
  {
    id: '40',
    title: 'Vitamin C Face Serum',
    handle: 'vitamin-c-face-serum',
    description: 'Powerful vitamin C serum that brightens and rejuvenates your skin.',
    primaryCategory: 'beauty-fragrance',
    subcategory: 'skincare',
    images: [faceSerum],
    brand: 'VitaGlow',
    tags: ['serum', 'vitamin c', 'brightening', 'rejuvenating'],
    featured: true,
    variants: [
      { id: '40-30ml', sku: 'SRM-30ML', size: '30ml', color: 'Clear', price: 42000, comparePrice: 55000, stock: 14 },
    ]
  },

  // BEAUTY & FRAGRANCE - Makeup
  {
    id: '41',
    title: 'Classic Red Lipstick',
    handle: 'classic-red-lipstick',
    description: 'Bold red lipstick that makes a statement with long-lasting color.',
    primaryCategory: 'beauty-fragrance',
    subcategory: 'makeup',
    images: [lipstickRed],
    brand: 'Bold Beauty',
    tags: ['lipstick', 'red', 'bold', 'long-lasting'],
    featured: false,
    variants: [
      { id: '41-os-red', sku: 'LPS-OS-RED', size: 'One Size', color: 'Red', price: 15000, stock: 30 },
    ]
  },
  {
    id: '42',
    title: 'Flawless Coverage Foundation',
    handle: 'flawless-coverage-foundation',
    description: 'Full coverage foundation that provides a natural, flawless finish.',
    primaryCategory: 'beauty-fragrance',
    subcategory: 'makeup',
    images: [foundation],
    brand: 'Flawless Face',
    tags: ['foundation', 'full coverage', 'natural', 'flawless'],
    featured: true,
    variants: [
      { id: '42-light', sku: 'FND-LGT', size: '30ml', color: 'Light', price: 25000, stock: 18 },
      { id: '42-medium', sku: 'FND-MED', size: '30ml', color: 'Medium', price: 25000, stock: 22 },
      { id: '42-dark', sku: 'FND-DRK', size: '30ml', color: 'Dark', price: 25000, stock: 15 },
    ]
  },
  {
    id: '43',
    title: 'Professional Eyeshadow Palette',
    handle: 'professional-eyeshadow-palette',
    description: 'Versatile eyeshadow palette with 12 highly pigmented shades for every look.',
    primaryCategory: 'beauty-fragrance',
    subcategory: 'makeup',
    images: [eyeshadowPalette],
    brand: 'Pro Makeup',
    tags: ['eyeshadow', 'palette', 'professional', 'pigmented'],
    featured: true,
    variants: [
      { id: '43-os-mixed', sku: 'ESP-OS-MXD', size: 'One Size', color: 'Mixed', price: 38000, comparePrice: 48000, stock: 12 },
    ]
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductByHandle = (handle: string): Product | undefined => {
  return products.find(product => product.handle === handle);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getProductsByCategory = (primaryCategory: string): Product[] => {
  return products.filter(product => product.primaryCategory === primaryCategory);
};

export const getProductsBySubcategory = (subcategory: string): Product[] => {
  return products.filter(product => product.subcategory === subcategory);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.title.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.brand?.toLowerCase().includes(lowercaseQuery) ||
    product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};