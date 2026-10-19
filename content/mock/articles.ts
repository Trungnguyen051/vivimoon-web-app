import type { Article } from '@/lib/api/schemas/editorial';

/**
 * PROVISIONAL — the three titles are the design's; the bodies are written to be
 * plausible rather than supplied by Vivimoon, and the imagery is shared with the
 * homepage's occasion tiles until editorial photography exists. Replacing any of
 * it is a data edit in this one file.
 */
export const articles: Article[] = [
  {
    slug: 'mau-lens-hop-tong-da-vang',
    image: '/images/moment-grad.jpg',
    publishedAt: '2026-09-28',
    title: {
      vi: '5 màu lens phù hợp nhất với tông da vàng Việt Nam 2025',
      en: 'The 5 lens colours that suit warm Vietnamese skin tones best in 2025',
    },
    excerpt: {
      vi: 'Nâu mật ong, nâu khói, xám tro — và hai màu ít ai nghĩ tới nhưng lên mắt rất hợp với da vàng.',
      en: 'Honey brown, smoky brown, ash grey — and two colours few people try that flatter warm skin.',
    },
    body: {
      vi: [
        'Tông da vàng là tông da phổ biến nhất ở Việt Nam, và nó quyết định màu lens nào trông tự nhiên trên mắt bạn.',
        'Nâu mật ong và nâu khói là lựa chọn an toàn nhất: chúng làm sáng mắt mà không tạo ra viền màu rõ rệt.',
        'Nếu muốn thử màu lạ, xám tro và tím khói vẫn giữ được vẻ tự nhiên trên nền da vàng, miễn là đường kính màu không quá lớn.',
      ],
      en: [
        'Warm skin is the most common tone in Vietnam, and it decides which lens colours read as natural on you.',
        'Honey brown and smoky brown are the safest picks: they brighten the eye without leaving an obvious coloured ring.',
        'For something less expected, ash grey and smoky violet still look natural against warm skin, as long as the graphic diameter stays moderate.',
      ],
    },
  },
  {
    slug: 'silicone-hydrogel-vs-lens-thuong',
    image: '/images/moment-wedding.jpg',
    publishedAt: '2026-09-14',
    title: {
      vi: 'Silicone Hydrogel vs lens thường: Bác sĩ nhãn khoa nói gì?',
      en: 'Silicone Hydrogel vs ordinary lenses: what eye doctors say',
    },
    excerpt: {
      vi: 'Khác biệt nằm ở lượng oxy đi qua lens — và nó quan trọng nhất với người đeo trên 8 tiếng mỗi ngày.',
      en: 'The difference is how much oxygen reaches the eye — and it matters most past eight hours of wear.',
    },
    body: {
      vi: [
        'Silicone Hydrogel cho oxy đi qua nhiều hơn đáng kể so với hydrogel thường, nên mắt ít bị đỏ và khô vào cuối ngày.',
        'Với người đeo dưới 4 tiếng, khác biệt này gần như không cảm nhận được; lens hydrogel thường vẫn thoải mái và rẻ hơn.',
        'Bác sĩ nhãn khoa thường khuyên chuyển sang Silicone Hydrogel khi bạn đeo trên 8 tiếng mỗi ngày hoặc làm việc nhiều với màn hình.',
      ],
      en: [
        'Silicone Hydrogel passes considerably more oxygen than ordinary hydrogel, so eyes are less red and dry by the end of the day.',
        'Under about four hours of wear the difference is hard to feel, and ordinary hydrogel stays comfortable and cheaper.',
        'Eye doctors generally suggest switching once you wear lenses more than eight hours a day, or spend long stretches on a screen.',
      ],
    },
  },
  {
    slug: 've-sinh-va-bao-quan-lens',
    image: '/images/moment-party.jpg',
    publishedAt: '2026-08-30',
    title: {
      vi: 'Cách vệ sinh và bảo quản lens đúng cách để dùng bền hơn',
      en: 'Cleaning and storing lenses properly so they last',
    },
    excerpt: {
      vi: 'Phần lớn lens hỏng sớm không phải vì chất lượng, mà vì khay đựng và dung dịch bị dùng sai.',
      en: 'Most lenses fail early not because of quality, but because the case and solution are used wrongly.',
    },
    body: {
      vi: [
        'Luôn rửa tay và lau khô trước khi chạm vào lens — đây là bước bị bỏ qua nhiều nhất.',
        'Không dùng lại dung dịch cũ trong khay. Đổ hết, rửa khay bằng dung dịch mới và để khô úp mỗi lần dùng xong.',
        'Thay khay đựng ít nhất ba tháng một lần, kể cả khi khay trông còn sạch.',
      ],
      en: [
        'Always wash and dry your hands before touching a lens — the step most often skipped.',
        'Never top up old solution in the case. Empty it, rinse with fresh solution, and leave it to dry face down after each use.',
        'Replace the case at least every three months, even when it still looks clean.',
      ],
    },
  },
];
