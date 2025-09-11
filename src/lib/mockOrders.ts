import type { Order, OrderStatus, OrderStatusChange, PaymentStatus } from '@/types';

// Helper to generate realistic order status histories
const generateStatusHistory = (finalStatus: OrderStatus, createdAt: Date): OrderStatusChange[] => {
  const history: OrderStatusChange[] = [];
  const baseTime = createdAt.getTime();
  
  // Always start with pending
  history.push({
    status: 'pending',
    timestamp: new Date(baseTime).toISOString(),
    note: 'Order placed successfully'
  });

  if (finalStatus === 'pending') return history;

  // Add processing if not cancelled immediately
  if (finalStatus !== 'cancelled' || Math.random() > 0.3) {
    history.push({
      status: 'processing',
      timestamp: new Date(baseTime + Math.random() * 2 * 60 * 60 * 1000).toISOString(), // 0-2 hours later
      note: 'Payment confirmed, preparing order'
    });
  }

  if (finalStatus === 'processing') return history;

  // Handle cancellation path
  if (finalStatus === 'cancelled') {
    const cancelTime = baseTime + Math.random() * 24 * 60 * 60 * 1000; // Within 24 hours
    history.push({
      status: 'cancelled',
      timestamp: new Date(cancelTime).toISOString(),
      note: Math.random() > 0.5 ? 'Cancelled by customer' : 'Out of stock - cancelled by system'
    });
    return history;
  }

  // Add shipped status
  if (finalStatus !== 'refunded') {
    history.push({
      status: 'shipped',
      timestamp: new Date(baseTime + (1 + Math.random() * 2) * 24 * 60 * 60 * 1000).toISOString(), // 1-3 days later
      note: 'Package dispatched with courier'
    });
  }

  if (finalStatus === 'shipped') return history;

  // Add delivered status
  if (finalStatus === 'delivered' || finalStatus === 'refunded') {
    history.push({
      status: 'delivered',
      timestamp: new Date(baseTime + (3 + Math.random() * 4) * 24 * 60 * 60 * 1000).toISOString(), // 3-7 days later
      note: 'Package delivered successfully'
    });
  }

  if (finalStatus === 'delivered') return history;

  // Add refunded status
  if (finalStatus === 'refunded') {
    history.push({
      status: 'refunded',
      timestamp: new Date(baseTime + (5 + Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(), // 5-15 days later
      note: 'Refund processed successfully'
    });
  }

  return history;
};

// Generate realistic mock orders with various statuses
const generateMockOrders = (): Order[] => {
  const orders: Order[] = [];
  const now = new Date();
  
  // Define status distribution for realistic data
  const statusDistribution: { status: OrderStatus; weight: number }[] = [
    { status: 'delivered', weight: 40 },    // Most orders are delivered
    { status: 'shipped', weight: 20 },      // Some are currently shipped
    { status: 'processing', weight: 15 },   // Some are being processed
    { status: 'pending', weight: 10 },      // Few are still pending
    { status: 'cancelled', weight: 10 },    // Some get cancelled
    { status: 'refunded', weight: 5 }       // Few are refunded
  ];

  // Create weighted status array
  const weightedStatuses: OrderStatus[] = [];
  statusDistribution.forEach(({ status, weight }) => {
    for (let i = 0; i < weight; i++) {
      weightedStatuses.push(status);
    }
  });

  // Real product order combinations for variety
  const commonOrderItems = [
    [{ productId: '12', variantId: '12-m-white', qty: 2 }], // Premium Cotton T-Shirt
    [{ productId: '1', variantId: '1-42-black', qty: 1 }], // Classic Oxford Dress Shoes
    [{ productId: '2', variantId: '2-42-white', qty: 1 }], // Premium Athletic Sneakers
    [{ productId: '8', variantId: '8-os-black', qty: 1 }], // Premium Leather Handbag
    [{ productId: '4', variantId: '4-37-black', qty: 1 }], // Elegant Black Heels
    [{ productId: '19', variantId: '19-s-navy', qty: 1 }], // Tailored Navy Blazer
    [{ productId: '6', variantId: '6-37-white', qty: 1 }], // Women's Athletic Sneakers
    [{ productId: '14', variantId: '14-m-white', qty: 1 }], // Crisp Dress Shirt
    [{ productId: '16', variantId: '16-32-blue', qty: 1 }], // Classic Denim Jeans
    [{ productId: '10', variantId: '10-os-black', qty: 1 }], // Versatile Travel Backpack
    [{ productId: '25', variantId: '25-m-beige', qty: 1 }], // Cozy Cashmere Sweater
    [{ productId: '24', variantId: '24-s-white', qty: 1 }], // Elegant Silk Blouse
    [
      { productId: '12', variantId: '12-m-white', qty: 1 },
      { productId: '16', variantId: '16-32-blue', qty: 1 }
    ], // T-shirt + Jeans combo
    [
      { productId: '39', variantId: '39-50ml', qty: 1 },
      { productId: '41', variantId: '41-os-red', qty: 1 }
    ], // Moisturizer + Lipstick combo
    [
      { productId: '4', variantId: '4-37-black', qty: 1 },
      { productId: '8', variantId: '8-os-black', qty: 1 }
    ], // Heels + Handbag combo
  ];

  // Generate 25 orders over the past 3 months
  for (let i = 0; i < 25; i++) {
    // Random date within last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Pick random status
    const status = weightedStatuses[Math.floor(Math.random() * weightedStatuses.length)];
    
    // Generate status history
    const statusHistory = generateStatusHistory(status, createdAt);
    const statusUpdatedAt = statusHistory[statusHistory.length - 1].timestamp;
    
    // Pick random items
    const items = commonOrderItems[Math.floor(Math.random() * commonOrderItems.length)];
    
    // Calculate total using actual product prices (Nigerian Naira)
    const itemPrices = {
      '1': 45000,  // Classic Oxford Dress Shoes
      '2': 32000,  // Premium Athletic Sneakers
      '4': 38000,  // Elegant Black Heels
      '6': 28000,  // Women's Athletic Sneakers
      '8': 65000,  // Premium Leather Handbag
      '10': 45000, // Versatile Travel Backpack
      '12': 12000, // Premium Cotton T-Shirt
      '14': 25000, // Crisp Dress Shirt
      '16': 35000, // Classic Denim Jeans
      '19': 85000, // Tailored Navy Blazer
      '24': 35000, // Elegant Silk Blouse
      '25': 55000, // Cozy Cashmere Sweater
      '39': 32000, // Hydrating Face Moisturizer
      '41': 15000  // Classic Red Lipstick
    };
    
    const total = items.reduce((sum, item) => {
      const price = itemPrices[item.productId as keyof typeof itemPrices] || 20000;
      return sum + (price * item.qty);
    }, 0);

    // Add Nigerian shipping cost
    const shippingCost = Math.random() > 0.5 ? 2500 : 4500; // Standard vs Express (Nigerian rates)
    const finalTotal = total + shippingCost;

    // Generate tracking number for shipped/delivered orders
    let trackingNumber: string | undefined;
    if (status === 'shipped' || status === 'delivered') {
      trackingNumber = `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }

    // Generate estimated delivery for shipped orders
    let estimatedDelivery: string | undefined;
    if (status === 'shipped') {
      const deliveryDate = new Date(createdAt.getTime() + (5 + Math.random() * 3) * 24 * 60 * 60 * 1000);
      estimatedDelivery = deliveryDate.toISOString();
    }

    // Generate payment status
    let paymentStatus: PaymentStatus = 'paid';
    if (status === 'pending') {
      paymentStatus = Math.random() > 0.5 ? 'pending' : 'paid';
    } else if (status === 'cancelled') {
      paymentStatus = Math.random() > 0.7 ? 'refunded' : 'pending';
    } else if (status === 'refunded') {
      paymentStatus = 'refunded';
    }

    // Generate refund info for refunded orders
    let refundInfo;
    if (status === 'refunded') {
      refundInfo = {
        amount: Math.random() > 0.7 ? finalTotal : Math.floor(finalTotal * 0.8), // Full or partial refund
        reason: Math.random() > 0.5 ? 'Customer request' : 'Defective product',
        processedAt: statusHistory[statusHistory.length - 1].timestamp,
        refundId: `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      };
    }

    // Nigerian customer names and data
    const nigerianNames = [
      'Adebayo Ogundimu', 'Chioma Okwu', 'Ibrahim Garba', 'Folake Adeyemi', 'Emeka Okafor',
      'Aisha Bello', 'Olumide Fashola', 'Kemi Adeleke', 'Yusuf Ibrahim', 'Ngozi Okonkwo',
      'Biodun Lawal', 'Halima Shehu', 'Tunde Agbaje', 'Fatima Usman', 'Segun Osho',
      'Amina Muhammed', 'Kayode Ogunseye', 'Blessing Eze', 'Abdullahi Musa', 'Funmi Ogundipe',
      'Chinedu Obi', 'Zainab Ahmad', 'Damilola Akintunde', 'Hauwa Aliyu', 'Oluwaseun Bakare'
    ];

    const nigerianCities = [
      'Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan',
      'Benin City', 'Kaduna', 'Onitsha', 'Warri', 'Calabar',
      'Ilorin', 'Enugu', 'Abeokuta', 'Jos', 'Sokoto'
    ];

    const nigerianStates = [
      'Lagos State', 'FCT Abuja', 'Kano State', 'Rivers State', 'Oyo State',
      'Edo State', 'Kaduna State', 'Anambra State', 'Delta State', 'Cross River State',
      'Kwara State', 'Enugu State', 'Ogun State', 'Plateau State', 'Sokoto State'
    ];

    const name = nigerianNames[i % nigerianNames.length];
    const city = nigerianCities[i % nigerianCities.length];
    const state = nigerianStates[i % nigerianStates.length];
    
    // Generate Nigerian mobile number (+234)
    const mobileNumber = `+234-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    
    // Generate Nigerian postal code (6 digits)
    const postalCode = Math.floor(Math.random() * 900000 + 100000).toString();
    
    orders.push({
      id: `ORD${(1000 + i).toString()}`,
      items,
      total: finalTotal,
      status,
      address: {
        name,
        line1: `${Math.floor(Math.random() * 200 + 1)} ${['Ikeja', 'Victoria Island', 'Lekki', 'Surulere', 'Yaba', 'Gbagada', 'Maryland', 'Ikoyi'][Math.floor(Math.random() * 8)]} ${['Street', 'Road', 'Avenue', 'Close'][Math.floor(Math.random() * 4)]}`,
        city: `${city}, ${state}`,
        country: 'Nigeria',
        phone: mobileNumber,
        postal: postalCode,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@${['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'][Math.floor(Math.random() * 4)]}`
      },
      shippingMethod: Math.random() > 0.7 ? 'express' : 'standard',
      createdAt: createdAt.toISOString(),
      statusUpdatedAt,
      statusHistory,
      trackingNumber,
      estimatedDelivery,
      refundInfo,
      paymentStatus
    });
  }

  // Sort by creation date (newest first)
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const mockOrders = generateMockOrders();

// Helper function to simulate status transitions
export const canTransitionTo = (currentStatus: OrderStatus, targetStatus: OrderStatus): boolean => {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: ['refunded'],
    refunded: []
  };
  
  return transitions[currentStatus]?.includes(targetStatus) || false;
};

// Helper to get next possible statuses
export const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: ['refunded'],
    refunded: []
  };
  
  return transitions[currentStatus] || [];
};