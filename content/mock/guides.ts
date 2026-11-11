import type { Guide } from '@/lib/api/schemas/support';

/**
 * PROVISIONAL — owner: Vivimoon. The steps are written to be plausible and safe rather
 * than supplied: they follow the ordinary advice an optometrist gives, but nobody
 * clinical has signed them off, and a guide about handling someone's eyes is the last
 * place to let invented copy pass for authored copy. Replacing any of it is a data edit
 * in this one file.
 *
 * The illustrations are the repo's placeholder image, the same one standing in
 * elsewhere until real photography exists. The wireframe's own captions are
 * deliberately not carried over — "ảnh minh hoạ bước 1" is a note to a designer, not
 * copy for a shopper.
 *
 * `video` is omitted rather than pointed at nothing. The schema supports it so the day
 * footage arrives is a content change (ADR-0019).
 */
const STEP_IMAGE = '/images/placeholder.jpg';

export const guides: Guide[] = [
  {
    slug: 'cach-deo-va-thao-lens',
    topic: 'nguoi-moi-deo-lens',
    publishedAt: '2026-10-12',
    updatedAt: '2026-11-02',
    title: {
      vi: 'Cách đeo và tháo lens cho người mới',
      en: 'How to put in and take out lenses, for first-timers',
    },
    opening: {
      vi: [
        'Trước khi bắt đầu: rửa tay thật sạch bằng xà phòng và lau khô bằng khăn không xơ vải.',
        'Cắt ngắn móng tay nếu móng còn dài, và ngồi trước gương ở nơi đủ sáng. Luôn làm một bên mắt trước, xong hẳn rồi mới sang bên kia — như vậy bạn không bao giờ nhầm lens trái với lens phải.',
      ],
      en: [
        'Before you start: wash your hands with soap and dry them on a lint-free towel.',
        'Trim long nails, and sit in front of a mirror with good light. Always finish one eye before starting the other — that way you can never mix up the left lens and the right.',
      ],
    },
    steps: [
      {
        image: STEP_IMAGE,
        title: { vi: 'Lấy lens ra khỏi vỉ', en: 'Take the lens out of its blister' },
        body: {
          vi: 'Bóc nắp vỉ, dùng đầu ngón trỏ chạm nhẹ vào mặt lõm của lens rồi nhấc lên. Lens sẽ bám vào đầu ngón tay khô.',
          en: 'Peel the lid back, touch the inside curve of the lens with your fingertip and lift. It will cling to a dry finger.',
        },
      },
      {
        image: STEP_IMAGE,
        title: { vi: 'Kiểm tra mặt lens', en: 'Check which way round it is' },
        body: {
          vi: 'Đặt lens lên đầu ngón tay và nhìn ngang. Mép lens cong đều lên như hình chén là đúng chiều; nếu mép hơi loe ra ngoài thì lens đang bị lộn.',
          en: 'Rest it on your fingertip and look from the side. A bowl shape with even edges is the right way round; edges that flare outwards mean it is inside out.',
        },
      },
      {
        image: STEP_IMAGE,
        title: { vi: 'Giữ mi mắt', en: 'Hold your eyelids' },
        body: {
          vi: 'Dùng ngón giữa của tay đang cầm lens kéo mi dưới xuống, tay còn lại giữ mi trên. Giữ chắc để mắt không chớp giữa chừng.',
          en: 'Pull the lower lid down with the middle finger of the hand holding the lens, and hold the upper lid with the other hand. Keep both firm so you cannot blink halfway.',
        },
      },
      {
        image: STEP_IMAGE,
        title: { vi: 'Đặt lens vào mắt', en: 'Place the lens' },
        body: {
          vi: 'Nhìn thẳng vào gương và đặt lens vào giữa tròng đen. Thả mi dưới ra trước, rồi mi trên, rồi chớp mắt vài lần thật nhẹ.',
          en: 'Look straight into the mirror and set the lens on the centre of the iris. Let the lower lid go first, then the upper, then blink gently a few times.',
        },
      },
      {
        image: STEP_IMAGE,
        title: { vi: 'Tháo lens', en: 'Taking it out' },
        body: {
          vi: 'Rửa tay lại, nhìn lên trên, kéo mi dưới xuống rồi dùng ngón trỏ và ngón cái véo nhẹ mép dưới của lens để nhấc ra. Không dùng móng tay.',
          en: 'Wash your hands again, look up, pull the lower lid down, then pinch the bottom edge of the lens gently between finger and thumb to lift it out. Never use a nail.',
        },
      },
    ],
    closing: {
      vi: [
        'Nếu mắt đỏ, đau, chảy nước mắt liên tục hoặc nhìn mờ sau khi đeo, hãy tháo lens ra ngay và đừng đeo lại.',
        'Những dấu hiệu đó không phải là "đeo mãi rồi quen". Nếu sau khi tháo lens mà mắt vẫn khó chịu quá vài tiếng, hãy đi khám bác sĩ mắt thay vì chờ xem.',
      ],
      en: [
        'If your eye is red, painful, watering constantly or your vision is blurred after fitting a lens, take it out straight away and do not put it back.',
        'None of that is something you get used to. If the discomfort lasts more than a couple of hours after removing the lens, see an eye doctor rather than waiting it out.',
      ],
    },
    collection: 'beginner-friendly',
    related: [
      // An Article, not a Guide: the two differ by shape, never by subject (ADR-0019).
      { kind: 'article', slug: 've-sinh-va-bao-quan-lens' },
    ],
  },
];
