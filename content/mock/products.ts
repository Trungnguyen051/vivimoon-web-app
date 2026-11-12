import type { Product } from '@/lib/types';

export const products: Product[] = [
  {
    id: 'p-aqua-daily',
    slug: 'aqua-daily-clear',
    name: 'Aqua Daily Clear',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'trongSuot',
    replacement: 'daily',
    description:
      'Ultra-breathable daily disposable lenses with high moisture retention for all-day comfort.',
    images: ['/images/products/aqua-daily-1.jpg', '/images/products/aqua-daily-2.jpg'],
    badges: ['bestseller'],
    specs: {
      material: 'Silicone Hydrogel',
      waterContent: '55%',
      baseCurve: '8.6mm',
      diameter: '14.2mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-aqua-daily-30',
        sku: 'AQD-30',
        price: 25,
        currency: 'USD',
        stock: 120,
      },
    ],
    rating: 4.6,
    reviewCount: 2,
    subtitle: 'Lens trong suốt 1 ngày · Silicone Hydrogel ngậm nước 55%',
    soldCount: 3200,
    comfort: { wearHours: 12, sensitiveEyes: true },
    videos: [
      {
        id: 'aqua-tv-1',
        title: { vi: 'Look tự nhiên đi học', en: 'A natural look for class' },
        poster: '/images/tv-thumb-1.jpg',
        url: 'https://www.tiktok.com/@vivimoon.official',
        views: 128000,
      },
      {
        id: 'aqua-tv-2',
        title: { vi: 'Makeup tone hồng hẹn hò', en: 'Pink-toned makeup for a date' },
        poster: '/images/tv-thumb-2.jpg',
        url: 'https://www.tiktok.com/@vivimoon.official',
        views: 96000,
      },
      {
        id: 'aqua-tv-3',
        title: { vi: 'Đeo 10h đi làm có khô?', en: 'Ten hours at work: does it dry out?' },
        poster: '/images/tv-thumb-3.jpg',
        url: 'https://www.tiktok.com/@vivimoon.official',
        views: 74000,
      },
      {
        id: 'aqua-tv-4',
        title: { vi: 'Kỷ yếu cùng Aqua', en: 'Yearbook day with Aqua' },
        poster: '/images/tv-thumb-4.jpg',
        url: 'https://www.tiktok.com/@vivimoon.official',
        views: 51000,
      },
    ],
    faq: [
      {
        question: { vi: 'Đeo có cộm, khô mắt không?', en: 'Will it feel gritty or dry?' },
        answer: {
          vi: 'Chất liệu ngậm nước cao giữ ẩm suốt ngày, viền lens mỏng nên gần như không cảm giác cộm. Nếu khô, nhỏ 1–2 giọt nước nhỏ mắt dành cho lens.',
          en: 'The high-moisture material stays hydrated all day and the thin edge is barely felt. If your eyes feel dry, add one or two drops of lens-safe eye drops.',
        },
      },
      {
        question: { vi: 'Đeo được bao lâu mỗi ngày?', en: 'How many hours a day can I wear it?' },
        answer: {
          vi: 'Khuyến nghị tối đa 12 giờ mỗi ngày. Tháo lens trước khi ngủ và cho mắt nghỉ ít nhất 6 tiếng.',
          en: 'Up to 12 hours a day. Take the lenses out before sleeping and give your eyes at least six hours off.',
        },
      },
      {
        question: { vi: 'Mắt nhạy cảm có dùng được không?', en: 'Can I wear it with sensitive eyes?' },
        answer: {
          vi: 'Được. Bắt đầu với 4–6 tiếng trong vài ngày đầu rồi tăng dần. Nếu đỏ hoặc rát, tháo lens ngay và nghỉ đeo.',
          en: 'Yes. Start with four to six hours for the first few days and build up. If your eyes turn red or sting, take the lenses out and rest.',
        },
      },
      {
        question: { vi: 'Người mới có khó đeo không?', en: 'Is it hard for a first-timer?' },
        answer: {
          vi: 'Không khó. Lần đầu thường mất 5–10 phút; sau vài ngày bạn sẽ đeo được trong chưa đầy một phút.',
          en: 'Not at all. The first time usually takes five to ten minutes; after a few days it takes under a minute.',
        },
      },
      {
        question: { vi: 'Mặt trong/mặt ngoài phân biệt thế nào?', en: 'How do I tell the inside from the outside?' },
        answer: {
          vi: 'Đặt lens lên đầu ngón tay: mặt đúng có dạng hình chén với viền cong lên đều; mặt ngược có viền loe ra ngoài.',
          en: 'Rest the lens on a fingertip: the right way round it is a bowl with an even upturned rim; inside out, the rim flares outward.',
        },
      },
    ],
  },
  {
    id: 'p-breeze-daily',
    slug: 'breeze-daily-clear',
    name: 'Breeze Daily Clear',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'trongSuot',
    replacement: 'daily',
    description:
      'Lightweight daily lenses engineered for sensitive eyes, with a smooth, low-profile edge design.',
    images: ['/images/products/breeze-daily-1.jpg', '/images/products/breeze-daily-2.jpg'],
    badges: ['new'],
    specs: {
      material: 'Hydrogel',
      waterContent: '58%',
      baseCurve: '8.7mm',
      diameter: '14.0mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-breeze-daily-30',
        sku: 'BRZ-30',
        price: 22,
        currency: 'USD',
        stock: 90,
      },
    ],
    rating: 4.4,
    reviewCount: 0,
  },
  {
    id: 'p-ocean-biweekly',
    slug: 'ocean-3month-clear',
    name: 'Ocean 3-Month Clear',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'trongSuot',
    replacement: 'threeMonth',
    description:
      'Reusable 3-month lenses offering consistent clarity and reliable hydration between replacements.',
    images: ['/images/products/ocean-biweekly-1.jpg', '/images/products/ocean-biweekly-2.jpg'],
    badges: [],
    specs: {
      material: 'Silicone Hydrogel',
      waterContent: '52%',
      baseCurve: '8.6mm',
      diameter: '14.2mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-ocean-biweekly-6',
        sku: 'OCB-6',
        price: 28,
        currency: 'USD',
        stock: 70,
      },
    ],
    rating: 4.3,
    reviewCount: 0,
  },
  {
    id: 'p-hazel-monthly',
    slug: 'hazel-monthly-colored',
    name: 'Hazel Monthly Colored',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'coMau',
    replacement: 'monthly',
    description:
      'Monthly colored lenses with a natural gradient pattern for a subtle, everyday enhancement.',
    images: ['/images/products/hazel-monthly-1.jpg', '/images/products/hazel-monthly-2.jpg'],
    badges: [],
    specs: {
      material: 'Hydrogel',
      waterContent: '48%',
      baseCurve: '8.6mm',
      diameter: '14.5mm',
      graphicDiameter: '13.6mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-hazel-monthly-brown-30',
        sku: 'HZM-BR-30',
        color: 'brown',
        colorLabel: 'Hazel Brown',
        // Collapsed from two pack-size variants (M6.4, #27) — this keeps the
        // smaller 10-pack's price ($20), not the 30-pack's ($48).
        price: 20,
        currency: 'USD',
        stock: 30,
      },
      {
        id: 'p-hazel-monthly-gray-30',
        sku: 'HZM-GR-30',
        color: 'gray',
        colorLabel: 'Storm Gray',
        price: 20,
        currency: 'USD',
        stock: 25,
      },
    ],
    rating: 4.7,
    reviewCount: 0,
    subtitle: 'Lens màu 1 tháng · Nâu mật ong, viền mềm tự nhiên',
    soldCount: 2100,
    comfort: { wearHours: 10, sensitiveEyes: true },
    makeupTones: [
      { tone: 'peach', image: '/images/makeup-pink.jpg' },
      { tone: 'terracotta', image: '/images/makeup-orange.jpg' },
      { tone: 'warmNude', image: '/images/makeup-natural.jpg' },
      { tone: 'sunlight', image: '/images/moment-grad.jpg' },
      { tone: 'indoor', image: '/images/makeup-smoky.jpg' },
    ],
    faq: [
      {
        question: { vi: 'Đeo có cộm, khô mắt không?', en: 'Will it feel gritty or dry?' },
        answer: {
          vi: 'Chất liệu ngậm nước cao giữ ẩm suốt ngày, viền lens mỏng nên gần như không cảm giác cộm. Nếu khô, nhỏ 1–2 giọt nước nhỏ mắt dành cho lens.',
          en: 'The high-moisture material stays hydrated all day and the thin edge is barely felt. If your eyes feel dry, add one or two drops of lens-safe eye drops.',
        },
      },
      {
        question: { vi: 'Đeo được bao lâu mỗi ngày?', en: 'How many hours a day can I wear it?' },
        answer: {
          vi: 'Khuyến nghị tối đa 10 giờ mỗi ngày. Tháo lens trước khi ngủ và cho mắt nghỉ ít nhất 6 tiếng.',
          en: 'Up to 10 hours a day. Take the lenses out before sleeping and give your eyes at least six hours off.',
        },
      },
      {
        question: { vi: 'Mắt nhạy cảm có dùng được không?', en: 'Can I wear it with sensitive eyes?' },
        answer: {
          vi: 'Được. Bắt đầu với 4–6 tiếng trong vài ngày đầu rồi tăng dần. Nếu đỏ hoặc rát, tháo lens ngay và nghỉ đeo.',
          en: 'Yes. Start with four to six hours for the first few days and build up. If your eyes turn red or sting, take the lenses out and rest.',
        },
      },
      {
        question: { vi: 'Người mới có khó đeo không?', en: 'Is it hard for a first-timer?' },
        answer: {
          vi: 'Không khó. Lần đầu thường mất 5–10 phút; sau vài ngày bạn sẽ đeo được trong chưa đầy một phút.',
          en: 'Not at all. The first time usually takes five to ten minutes; after a few days it takes under a minute.',
        },
      },
      {
        question: { vi: 'Mặt trong/mặt ngoài phân biệt thế nào?', en: 'How do I tell the inside from the outside?' },
        answer: {
          vi: 'Đặt lens lên đầu ngón tay: mặt đúng có dạng hình chén với viền cong lên đều; mặt ngược có viền loe ra ngoài.',
          en: 'Rest the lens on a fingertip: the right way round it is a bowl with an even upturned rim; inside out, the rim flares outward.',
        },
      },
    ],
  },
  {
    id: 'p-onyx-monthly',
    slug: 'onyx-monthly-colored',
    name: 'Onyx Monthly Colored',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'coMau',
    replacement: 'monthly',
    description:
      'Monthly colored lenses with a soft black limbal ring, for definition without an obvious circle-lens look.',
    // Shares Hazel Monthly's photography until black-lens imagery exists (#55), so
    // this product shows brown lenses on its card and PDP. The colour is carried by
    // colorLabel, not the photo, but it reads as a bug until the real images land.
    images: ['/images/products/hazel-monthly-1.jpg', '/images/products/hazel-monthly-2.jpg'],
    badges: [],
    specs: {
      material: 'Silicone Hydrogel',
      waterContent: '45%',
      baseCurve: '8.6mm',
      diameter: '14.2mm',
      graphicDiameter: '13.8mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    // One black variant, not two shades: productSchema rejects a product whose
    // variants repeat a color, since color is the only thing VariantSelector picks on.
    variants: [
      {
        id: 'p-onyx-monthly-black-30',
        sku: 'ONX-BK-30',
        color: 'black',
        colorLabel: 'Natural Black',
        price: 21,
        currency: 'USD',
        stock: 26,
      },
    ],
    rating: 4.6,
    reviewCount: 0,
  },
  {
    id: 'p-mystic-daily',
    slug: 'mystic-daily-colored',
    name: 'Mystic Daily Colored',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    // The one vân nhũ fixture — a glitter-textured colored lens, the third
    // real Vivimoon line alongside trong suốt and có màu.
    productLine: 'vanNhu',
    replacement: 'daily',
    description:
      'Daily colored lenses with vivid pigmentation, currently on sale for a limited time.',
    images: ['/images/products/mystic-daily-1.jpg', '/images/products/mystic-daily-2.jpg'],
    badges: ['sale'],
    specs: {
      material: 'Hydrogel',
      waterContent: '50%',
      baseCurve: '8.6mm',
      diameter: '14.2mm',
      graphicDiameter: '13.3mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-mystic-daily-violet-30',
        sku: 'MYS-VI-30',
        color: 'violet',
        colorLabel: 'Mystic Violet',
        // Collapsed from two pack-size variants (M6.4, #27) — this keeps the
        // smaller 10-pack's price ($18 / compareAt $24), not the 30-pack's.
        price: 18,
        compareAtPrice: 24,
        currency: 'USD',
        stock: 20,
      },
    ],
    rating: 4.5,
    reviewCount: 0,
    subtitle: 'Lens vân nhũ 1 ngày · Tím khói ánh nhũ',
    soldCount: 1500,
    comfort: { wearHours: 8, sensitiveEyes: false },
    videos: [
      {
        id: 'mystic-tv-1',
        title: { vi: 'Look tự nhiên đi học', en: 'A natural look for class' },
        poster: '/images/tv-thumb-1.jpg',
        url: 'https://www.tiktok.com/@vivimoon.official',
        views: 128000,
      },
      {
        id: 'mystic-tv-2',
        title: { vi: 'Makeup tone hồng hẹn hò', en: 'Pink-toned makeup for a date' },
        poster: '/images/tv-thumb-2.jpg',
        url: 'https://www.tiktok.com/@vivimoon.official',
        views: 96000,
      },
      {
        id: 'mystic-tv-3',
        title: { vi: 'Đeo 10h đi làm có khô?', en: 'Ten hours at work: does it dry out?' },
        poster: '/images/tv-thumb-3.jpg',
        url: 'https://www.tiktok.com/@vivimoon.official',
        views: 74000,
      },
      {
        id: 'mystic-tv-4',
        title: { vi: 'Kỷ yếu cùng Mystic', en: 'Yearbook day with Mystic' },
        poster: '/images/tv-thumb-4.jpg',
        url: 'https://www.tiktok.com/@vivimoon.official',
        views: 51000,
      },
    ],
    makeupTones: [
      { tone: 'peach', image: '/images/makeup-pink.jpg' },
      { tone: 'terracotta', image: '/images/makeup-orange.jpg' },
      { tone: 'warmNude', image: '/images/makeup-natural.jpg' },
      { tone: 'sunlight', image: '/images/moment-grad.jpg' },
      { tone: 'indoor', image: '/images/makeup-smoky.jpg' },
    ],
    faq: [
      {
        question: { vi: 'Đeo có cộm, khô mắt không?', en: 'Will it feel gritty or dry?' },
        answer: {
          vi: 'Chất liệu ngậm nước cao giữ ẩm suốt ngày, viền lens mỏng nên gần như không cảm giác cộm. Nếu khô, nhỏ 1–2 giọt nước nhỏ mắt dành cho lens.',
          en: 'The high-moisture material stays hydrated all day and the thin edge is barely felt. If your eyes feel dry, add one or two drops of lens-safe eye drops.',
        },
      },
      {
        question: { vi: 'Đeo được bao lâu mỗi ngày?', en: 'How many hours a day can I wear it?' },
        answer: {
          vi: 'Khuyến nghị tối đa 8 giờ mỗi ngày. Tháo lens trước khi ngủ và cho mắt nghỉ ít nhất 6 tiếng.',
          en: 'Up to 8 hours a day. Take the lenses out before sleeping and give your eyes at least six hours off.',
        },
      },
      {
        question: { vi: 'Mắt nhạy cảm có dùng được không?', en: 'Can I wear it with sensitive eyes?' },
        answer: {
          vi: 'Được. Bắt đầu với 4–6 tiếng trong vài ngày đầu rồi tăng dần. Nếu đỏ hoặc rát, tháo lens ngay và nghỉ đeo.',
          en: 'Yes. Start with four to six hours for the first few days and build up. If your eyes turn red or sting, take the lenses out and rest.',
        },
      },
      {
        question: { vi: 'Người mới có khó đeo không?', en: 'Is it hard for a first-timer?' },
        answer: {
          vi: 'Không khó. Lần đầu thường mất 5–10 phút; sau vài ngày bạn sẽ đeo được trong chưa đầy một phút.',
          en: 'Not at all. The first time usually takes five to ten minutes; after a few days it takes under a minute.',
        },
      },
      {
        question: { vi: 'Mặt trong/mặt ngoài phân biệt thế nào?', en: 'How do I tell the inside from the outside?' },
        answer: {
          vi: 'Đặt lens lên đầu ngón tay: mặt đúng có dạng hình chén với viền cong lên đều; mặt ngược có viền loe ra ngoài.',
          en: 'Rest the lens on a fingertip: the right way round it is a bowl with an even upturned rim; inside out, the rim flares outward.',
        },
      },
    ],
  },
  {
    id: 'p-torica-monthly',
    slug: 'torica-monthly-clear',
    name: 'Torica Monthly Clear',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'trongSuot',
    replacement: 'monthly',
    description:
      'Monthly clear lenses with a stabilized fit that holds its position for sharp vision all day.',
    images: ['/images/products/torica-monthly-1.jpg', '/images/products/torica-monthly-2.jpg'],
    badges: [],
    specs: {
      material: 'Silicone Hydrogel',
      waterContent: '46%',
      baseCurve: '8.7mm',
      diameter: '14.5mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-torica-monthly-6',
        sku: 'TRM-6',
        price: 38,
        currency: 'USD',
        stock: 35,
      },
    ],
    rating: 4.2,
    reviewCount: 0,
  },
  {
    id: 'p-torica-biweekly',
    slug: 'torica-6month-clear',
    name: 'Torica 6-Month Clear',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'trongSuot',
    replacement: 'sixMonth',
    description:
      '6-month clear lenses offering precise vision and consistent all-day comfort.',
    images: [
      '/images/products/torica-biweekly-1.jpg',
      '/images/products/torica-biweekly-2.jpg',
    ],
    badges: [],
    specs: {
      material: 'Silicone Hydrogel',
      waterContent: '47%',
      baseCurve: '8.6mm',
      diameter: '14.3mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-torica-biweekly-6',
        sku: 'TRB-6',
        price: 32,
        currency: 'USD',
        stock: 40,
      },
    ],
    rating: 4.1,
    reviewCount: 0,
  },
  {
    id: 'p-focalpro-monthly',
    slug: 'focalpro-monthly-clear',
    name: 'Focalpro Monthly Clear',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'trongSuot',
    replacement: 'monthly',
    description:
      'Monthly clear lenses providing seamless, stable vision correction from morning to night.',
    images: [
      '/images/products/focalpro-monthly-1.jpg',
      '/images/products/focalpro-monthly-2.jpg',
    ],
    badges: [],
    specs: {
      material: 'Silicone Hydrogel',
      waterContent: '45%',
      baseCurve: '8.7mm',
      diameter: '14.4mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-focalpro-monthly-6',
        sku: 'FPM-6',
        price: 42,
        currency: 'USD',
        stock: 30,
      },
    ],
    rating: 4.4,
    reviewCount: 0,
  },
  {
    id: 'p-focalpro-daily',
    slug: 'focalpro-daily-clear',
    name: 'Focalpro Daily Clear',
    brandId: 'vivimoon',
    brandName: 'Vivimoon',
    productLine: 'trongSuot',
    replacement: 'daily',
    description:
      'Daily disposable clear lenses for effortless vision correction without the upkeep.',
    images: ['/images/products/focalpro-daily-1.jpg', '/images/products/focalpro-daily-2.jpg'],
    badges: [],
    specs: {
      material: 'Hydrogel',
      waterContent: '54%',
      baseCurve: '8.6mm',
      diameter: '14.2mm',
      origin: 'South Korea',
    },
    requiresRx: true,
    variants: [
      {
        id: 'p-focalpro-daily-30',
        sku: 'FPD-30',
        price: 36,
        currency: 'USD',
        stock: 50,
      },
    ],
    rating: 4.3,
    reviewCount: 0,
  },
];
