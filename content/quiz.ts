import { toIntlLocale } from '@/lib/utils/format';
import type { QuizDefinition } from '@/lib/api/schemas/discovery';

/**
 * PROVISIONAL — owner: Vivimoon. The three questions and their options are the
 * wireframe's (Figma 71:3 / 71:75 / 71:148); the tag weights are ours, pending
 * Vivimoon's real ones. So are the sub-labels and helper lines of the first two
 * questions; the third's are the wireframe's (Figma 64:764). Weights are drawn from real product fields (see
 * `lib/products/quiz-scoring.ts` for the tag vocabulary) so scoring against the real
 * catalog is meaningful. Replacing the questions or re-tuning weights later is a data
 * edit in this one file.
 */
export const quiz: QuizDefinition = {
  questions: [
    {
      id: 'experience',
      prompt: { vi: 'Bạn đã từng đeo lens chưa?', en: 'Have you worn contact lenses before?' },
      helper: { vi: 'Vivimoon sẽ gợi ý lens dễ đeo theo kinh nghiệm của bạn', en: "Vivimoon will suggest lenses that fit your experience" },
      options: [
        { id: 'experience-never', label: { vi: 'Chưa bao giờ', en: 'Never' }, sublabel: { vi: 'Mình cần lens dễ đeo, dễ làm quen', en: 'I need something easy to start with' }, tags: { 'material:moisture': 2, 'replacement:daily': 1, 'makeupStyle:natural': 1 } },
        { id: 'experience-few', label: { vi: 'Đã đeo vài lần', en: 'A few times' }, sublabel: { vi: 'Đã biết đeo, chưa thành thói quen', en: 'I can wear them, but not out of habit' }, tags: { 'material:moisture': 1 } },
        { id: 'experience-often', label: { vi: 'Đeo thường xuyên', en: 'Regularly' }, sublabel: { vi: 'Đeo gần như mỗi ngày', en: 'Almost every day' }, tags: { 'material:breathable': 2 } },
      ],
    },
    {
      id: 'look',
      prompt: { vi: 'Bạn muốn look như thế nào?', en: 'What look are you going for?' },
      helper: { vi: 'Vivimoon sẽ gợi ý màu và đường kính hợp với look bạn muốn', en: "Vivimoon will suggest colors and diameters for the look you want" },
      options: [
        { id: 'look-natural', label: { vi: 'Tự nhiên', en: 'Natural' }, sublabel: { vi: 'Như không đeo, mắt sáng hơn một chút', en: 'Barely there, just a little brighter' }, tags: { 'makeupStyle:natural': 2, 'productLine:trongSuot': 1 } },
        { id: 'look-bigEyes', label: { vi: 'Mắt to long lanh', en: 'Big, sparkling eyes' }, sublabel: { vi: 'Giãn tròng rõ, ánh nhũ bắt sáng', en: 'Clear enlargement with a light-catching shimmer' }, tags: { 'productLine:vanNhu': 2, 'makeupStyle:pink': 1 } },
        { id: 'look-sharp', label: { vi: 'Sắc sảo', en: 'Sharp' }, sublabel: { vi: 'Viền rõ, ánh nhìn có nét', en: 'A defined edge and a sharper gaze' }, tags: { 'makeupStyle:orange': 2, 'productLine:coMau': 1 } },
        { id: 'look-western', label: { vi: 'Tây', en: 'Western' }, sublabel: { vi: 'Tông xám, khói, hợp makeup đậm', en: 'Gray, smoky tones for bolder makeup' }, tags: { 'makeupStyle:smoky': 2, 'productLine:coMau': 1 } },
      ],
    },
    {
      id: 'duration',
      prompt: { vi: 'Bạn muốn đeo lens trong bao lâu mỗi lần?', en: 'How long do you wear lenses each time?' },
      helper: { vi: 'Vivimoon sẽ gợi ý lens có độ ẩm & hạn dùng phù hợp', en: "Vivimoon will suggest lenses with the right moisture and replacement schedule" },
      options: [
        { id: 'duration-allDay', label: { vi: 'Cả ngày (8h+)', en: 'All day (8h+)' }, sublabel: { vi: 'Đi học, đi làm', en: 'School or work' }, tags: { 'material:moisture': 2 } },
        { id: 'duration-hours', label: { vi: '4–6 tiếng', en: '4–6 hours' }, sublabel: { vi: 'Đi chơi, chụp ảnh', en: 'Going out, taking photos' }, tags: { 'replacement:monthly': 1 } },
        { id: 'duration-special', label: { vi: 'Dịp đặc biệt', en: 'Special occasions' }, sublabel: { vi: 'Kỷ yếu, cưới, tiệc', en: 'Yearbook, weddings, parties' }, tags: { 'replacement:daily': 2, 'occasion:party': 1, 'occasion:photoshoot': 1 } },
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
