import { toIntlLocale } from '@/lib/utils/format';
import type { QuizDefinition } from '@/lib/api/schemas/discovery';

/**
 * PROVISIONAL — real question set and tag weights pending Vivimoon (spec
 * §11). Owner: Vivimoon. Six placeholder questions, tag weights drawn from
 * real product fields (`productLine`/`replacement`/`badges` — see
 * `lib/products/quiz-scoring.ts`) so scoring against the real catalog is
 * meaningful even with placeholder copy. Replacing the questions or
 * re-tuning weights later is a data edit in this one file.
 */
export const quiz: QuizDefinition = {
  questions: [
    {
      id: 'lifestyle',
      prompt: { vi: 'Một ngày của bạn bận rộn đến mức nào?', en: 'How active is your day-to-day?' },
      options: [
        { id: 'lifestyle-onthego', label: { vi: 'Luôn di chuyển — mỗi ngày một cặp lens mới', en: 'Always on the go — fresh lenses every day' }, tags: { 'replacement:daily': 2 } },
        { id: 'lifestyle-routine', label: { vi: 'Nếp sinh hoạt đều đặn — 3 tháng thay một lần là ổn', en: 'Steady routine — every 3 months works fine' }, tags: { 'replacement:threeMonth': 2 } },
        { id: 'lifestyle-lowkey', label: { vi: 'Ít chăm chút — thay hằng tháng là tiện nhất', en: 'Low maintenance — monthly is easiest' }, tags: { 'replacement:monthly': 2 } },
      ],
    },
    {
      id: 'look',
      prompt: { vi: 'Bạn muốn vẻ ngoài như thế nào?', en: 'What look are you going for?' },
      options: [
        { id: 'look-natural', label: { vi: 'Tự nhiên, trong trẻo như không đeo', en: 'Natural, barely-there clarity' }, tags: { 'productLine:trongSuot': 2 } },
        { id: 'look-color', label: { vi: 'Đổi màu mắt rõ rệt', en: 'A noticeable color change' }, tags: { 'productLine:coMau': 2, 'productLine:vanNhu': 2 } },
      ],
    },
    {
      id: 'discovery',
      prompt: { vi: 'Bạn thích mua sắm theo kiểu nào?', en: 'How do you like to shop?' },
      options: [
        { id: 'discovery-new', label: { vi: 'Mình thích thử những mẫu mới nhất', en: 'I love trying the newest releases' }, tags: { 'badge:new': 2 } },
        { id: 'discovery-proven', label: { vi: 'Mình chọn những mẫu bán chạy đã được kiểm chứng', en: 'I stick to proven bestsellers' }, tags: { 'badge:bestseller': 2 } },
      ],
    },
    {
      id: 'budget',
      prompt: { vi: 'Về giá, điều gì quan trọng nhất với bạn?', en: 'What matters most on price?' },
      options: [
        { id: 'budget-deal', label: { vi: 'Có được ưu đãi tốt nhất', en: 'Getting the best deal' }, tags: { 'badge:sale': 2 } },
        { id: 'budget-noPref', label: { vi: 'Giá không phải mối bận tâm chính', en: "Price isn't my main concern" }, tags: {} },
      ],
    },
    {
      id: 'wear',
      prompt: { vi: 'Mỗi ngày bạn thường đeo lens bao lâu?', en: 'How long do you usually wear lenses per day?' },
      options: [
        { id: 'wear-short', label: { vi: 'Vài tiếng, lúc có lúc không', en: 'A few hours here and there' }, tags: { 'replacement:daily': 1 } },
        { id: 'wear-allday', label: { vi: 'Cả ngày, ngày nào cũng đeo', en: 'All day, every day' }, tags: { 'replacement:monthly': 1, 'productLine:trongSuot': 1 } },
      ],
    },
    {
      id: 'occasion',
      prompt: { vi: 'Bạn đeo lens cho dịp nào?', en: "What's the occasion?" },
      options: [
        { id: 'occasion-everyday', label: { vi: 'Đeo hằng ngày', en: 'Everyday wear' }, tags: { 'productLine:trongSuot': 1, 'replacement:daily': 1 } },
        { id: 'occasion-special', label: { vi: 'Một vẻ ngoài đặc biệt để chụp ảnh hoặc dự sự kiện', en: 'A special look for photos or events' }, tags: { 'productLine:coMau': 1, 'productLine:vanNhu': 1, 'badge:new': 1 } },
      ],
    },
  ],
};

/**
 * How many shoppers the Quiz has matched — mock, pending a real source (#67).
 *
 * It sits beside the question set rather than in a page because two surfaces now show
 * the banner: the homepage and the Knowledge index (#129). It stays out of the
 * dictionary sentence so each locale keeps its own word order around `{count}` and
 * groups the digits its own way.
 */
export const QUIZ_MATCHES = 12_400;

/**
 * The social-proof sentence, assembled. The words and their order come from the
 * dictionary, the count from here, and the grouping from the locale.
 *
 * Shared for the same reason `QUIZ_MATCHES` is: both the homepage and the Knowledge
 * index render this line, and the two spelling out the same `replace` was a second copy
 * free to drift — the dictionary key being shared does not make the expression shared.
 */
export function quizSocialProof(template: string, locale: 'en' | 'vi'): string {
  return template.replace('{count}', new Intl.NumberFormat(toIntlLocale(locale)).format(QUIZ_MATCHES));
}
