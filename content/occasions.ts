import type { Occasion } from '@/lib/api/schemas/catalog';

type Text = { vi: string; en: string };

export type OccasionContent = {
  /** "Lens cho Kỷ yếu". */
  headline: Text;
  /** One line on why these lenses suit the Occasion; `{n}` is how many lenses the page lists. */
  subline: Text;
  tipsTitle: Text;
  tips: [Text, Text, Text];
  /** The look video's title. No footage exists yet, so it is shown as a still (CONTEXT.md "Makeup Look"). */
  videoTitle: Text;
  /** Copy only — no pricing rule stands behind it. */
  promo?: Text;
};

/**
 * PROVISIONAL — owner: Vivimoon. The advice each Occasion's page opens with (Figma 72:3).
 * Kỷ yếu is the wireframe's; the other five are written to match it, pending Vivimoon's
 * own copy. Replacing any of it is a data edit in this one file.
 */
export const occasionContent: Record<Occasion, OccasionContent> = {
  graduation: {
    headline: { vi: 'Lens cho Kỷ yếu', en: 'Lenses for Yearbook photos' },
    subline: {
      vi: '{n} mẫu nổi bật dưới đèn flash & nắng, vẫn tự nhiên khi chụp cận',
      en: '{n} lenses that stand out under flash and sunlight, and still look natural up close',
    },
    tipsTitle: { vi: 'Gợi ý chọn lens cho kỷ yếu', en: 'Choosing lenses for yearbook photos' },
    tips: [
      { vi: 'Chọn tông nâu hoặc xám để mắt sáng rõ trong ảnh chụp ngoài trời', en: 'Pick brown or gray tones so your eyes read clearly in outdoor shots' },
      { vi: 'GDIA 13.3–13.6mm giúp mắt to vừa đủ mà vẫn tự nhiên khi chụp cận', en: 'A 13.3–13.6mm GDIA enlarges just enough to stay natural in close-ups' },
      { vi: 'Ưu tiên dòng khoá ẩm để đeo êm suốt buổi chụp dài', en: 'Favor the moisture-lock line for comfort through a long shoot' },
    ],
    videoTitle: { vi: 'Video makeup + lens cho ngày kỷ yếu', en: 'Makeup + lens video for yearbook day' },
    promo: { vi: 'Đi chụp cả lớp? Mua 4 cặp giảm 15%', en: 'Shooting with the whole class? Buy 4 pairs, save 15%' },
  },
  wedding: {
    headline: { vi: 'Lens cho Đám cưới', en: 'Lenses for Weddings' },
    subline: {
      vi: '{n} mẫu trong trẻo, lên hình đẹp từ lễ đến tiệc',
      en: '{n} clear, soft lenses that photograph well from ceremony to reception',
    },
    tipsTitle: { vi: 'Gợi ý chọn lens cho đám cưới', en: 'Choosing lenses for a wedding' },
    tips: [
      { vi: 'Tông nâu ấm hợp với váy trắng và makeup cô dâu', en: 'Warm browns suit a white dress and bridal makeup' },
      { vi: 'Chọn viền mềm để ánh mắt dịu trong ảnh cận', en: 'A soft edge keeps your gaze gentle in close-ups' },
      { vi: 'Đeo thử trước ngày cưới ít nhất một lần', en: 'Wear them at least once before the day' },
    ],
    videoTitle: { vi: 'Video makeup + lens cho ngày cưới', en: 'Makeup + lens video for the wedding day' },
  },
  party: {
    headline: { vi: 'Lens cho Tiệc', en: 'Lenses for Parties' },
    subline: {
      vi: '{n} mẫu bắt sáng, nổi bật dưới ánh đèn tiệc',
      en: '{n} lenses that catch the light and stand out at a party',
    },
    tipsTitle: { vi: 'Gợi ý chọn lens cho tiệc', en: 'Choosing lenses for a party' },
    tips: [
      { vi: 'Vân nhũ bắt sáng tốt dưới đèn vàng và đèn màu', en: 'Glitter patterns catch warm and colored light well' },
      { vi: 'Tông xám hoặc màu nổi bật hợp makeup đậm', en: 'Gray or vivid tones suit bolder makeup' },
      { vi: 'Lens 1 ngày tiện cho một buổi tối, không cần bảo quản', en: 'A daily lens suits one evening, with nothing to store after' },
    ],
    videoTitle: { vi: 'Video makeup + lens cho buổi tiệc', en: 'Makeup + lens video for a party' },
  },
  date: {
    headline: { vi: 'Lens cho Hẹn hò', en: 'Lenses for Dates' },
    subline: {
      vi: '{n} mẫu dịu dàng, tự nhiên khi nhìn gần',
      en: '{n} gentle lenses that look natural up close',
    },
    tipsTitle: { vi: 'Gợi ý chọn lens cho buổi hẹn', en: 'Choosing lenses for a date' },
    tips: [
      { vi: 'Chọn màu gần với màu mắt thật để tự nhiên ở khoảng cách gần', en: 'Stay near your natural eye color for close range' },
      { vi: 'Viền mềm, giãn nhẹ cho ánh mắt long lanh', en: 'A soft edge and slight enlargement give a bright gaze' },
      { vi: 'Dòng khoá ẩm giúp mắt không khô khi ngồi phòng lạnh', en: 'The moisture-lock line helps in air-conditioned rooms' },
    ],
    videoTitle: { vi: 'Video makeup + lens cho buổi hẹn', en: 'Makeup + lens video for a date' },
  },
  travel: {
    headline: { vi: 'Lens cho Du lịch', en: 'Lenses for Travel' },
    subline: {
      vi: '{n} mẫu gọn nhẹ, đeo êm cả ngày dài di chuyển',
      en: '{n} easy lenses that stay comfortable through a long day out',
    },
    tipsTitle: { vi: 'Gợi ý chọn lens cho chuyến đi', en: 'Choosing lenses for a trip' },
    tips: [
      { vi: 'Lens 1 ngày gọn nhất: không cần mang nước ngâm', en: 'Daily lenses pack lightest: no solution to carry' },
      { vi: 'Dòng mắt thở hợp cho ngày đeo dài', en: 'The breathable line suits long wearing days' },
      { vi: 'Mang dư một cặp phòng khi rơi hoặc rách', en: 'Pack a spare pair in case one is lost or torn' },
    ],
    videoTitle: { vi: 'Video makeup + lens cho chuyến du lịch', en: 'Makeup + lens video for travel' },
  },
  photoshoot: {
    headline: { vi: 'Lens cho Chụp ảnh', en: 'Lenses for Photoshoots' },
    subline: {
      vi: '{n} mẫu rõ nét trước ống kính, hợp nhiều concept',
      en: '{n} lenses that read clearly on camera across many concepts',
    },
    tipsTitle: { vi: 'Gợi ý chọn lens cho buổi chụp', en: 'Choosing lenses for a photoshoot' },
    tips: [
      { vi: 'Chọn màu theo concept: nâu cho tự nhiên, xám cho cá tính', en: 'Match the concept: brown for natural, gray for bold' },
      { vi: 'Viền rõ giúp mắt nổi trong ảnh cận', en: 'A defined edge makes eyes stand out in close-ups' },
      { vi: 'Hỏi thợ ảnh về ánh sáng trước khi chọn vân nhũ', en: 'Ask your photographer about lighting before choosing glitter' },
    ],
    videoTitle: { vi: 'Video makeup + lens cho buổi chụp ảnh', en: 'Makeup + lens video for a photoshoot' },
  },
};
