import type { Article } from '@/lib/api/schemas/editorial';

/**
 * PROVISIONAL — the titles are the design's; the bodies are written to be plausible
 * rather than supplied by Vivimoon, and the imagery is shared with the homepage's
 * occasion tiles until editorial photography exists. Replacing any of it is a data
 * edit in this one file.
 *
 * Eight entries, because the Knowledge index is built out of them: the newest fills the
 * Lead Article band and the rest the grid, which pages six at a time — so a shorter set
 * would leave both the second page and the "more articles" control unexercised. The
 * Reading Themes are spread deliberately, including one `care` article, which is the
 * theme with no Collection behind it (ADR-0018).
 *
 * Reading Time is not a field here on purpose: it is counted off the body
 * (`lib/editorial/reading-time.ts`) so it cannot drift from the text it describes.
 */
export const articles: Article[] = [
  {
    slug: 'mau-lens-hop-tong-da-vang',
    image: '/images/moment-grad.jpg',
    publishedAt: '2026-09-28',
    readingTheme: 'natural',
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
    slug: 'cach-deo-lens-lan-dau',
    image: '/images/makeup-natural.jpg',
    publishedAt: '2026-09-20',
    readingTheme: 'beginner',
    title: {
      vi: 'Cách đeo lens lần đầu không bị cộm',
      en: 'Putting a lens in for the first time without the gritty feeling',
    },
    excerpt: {
      vi: 'Cảm giác cộm lần đầu gần như luôn đến từ ba thứ: lens lật ngược, tay chưa khô, hoặc mắt chưa đủ ẩm.',
      en: 'That gritty first-time feeling almost always comes from three things: an inside-out lens, damp hands, or a dry eye.',
    },
    body: {
      vi: [
        'Trước khi đặt lens lên mắt, hãy kiểm tra xem lens có bị lật ngược không: đặt lens lên đầu ngón tay, mép lens phải cong đều thành hình chữ U, không loe ra ngoài.',
        'Tay phải khô hoàn toàn. Một giọt nước còn lại trên đầu ngón tay sẽ giữ lens dính vào tay thay vì vào mắt, và càng thử lại nhiều lần thì mắt càng khô.',
        'Nếu vẫn thấy cộm sau khi đeo, nhỏ một giọt nước mắt nhân tạo và chớp vài lần thay vì dụi — phần lớn cảm giác cộm biến mất trong vòng một phút.',
      ],
      en: [
        'Before the lens goes anywhere near your eye, check it is not inside out: sitting on a fingertip, the rim should curve into an even U rather than flaring outward.',
        'Your hands must be fully dry. A drop of water left on a fingertip keeps the lens stuck to you instead of to your eye, and every retry dries the eye further.',
        'If it still feels gritty once it is in, add a drop of artificial tears and blink a few times rather than rubbing — most of that feeling clears within a minute.',
      ],
    },
  },
  {
    slug: 'silicone-hydrogel-vs-lens-thuong',
    image: '/images/moment-wedding.jpg',
    publishedAt: '2026-09-14',
    readingTheme: 'comfort',
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
    slug: 'dia-va-gdia-la-gi',
    image: '/images/cat-colored.jpg',
    publishedAt: '2026-09-06',
    readingTheme: 'natural',
    title: {
      vi: 'DIA và GDIA là gì? Chọn sao cho mắt tự nhiên',
      en: 'What DIA and GDIA mean, and how to pick for a natural look',
    },
    excerpt: {
      vi: 'DIA là đường kính cả chiếc lens, GDIA là đường kính phần có màu — và chỉ một trong hai quyết định mắt bạn trông to tới đâu.',
      en: 'DIA is the whole lens; GDIA is only the coloured part — and just one of the two decides how large your eyes look.',
    },
    body: {
      vi: [
        'DIA là đường kính toàn bộ chiếc lens, thường 14.0–14.5mm, và chủ yếu ảnh hưởng tới độ vừa vặn chứ không phải thẩm mỹ.',
        'GDIA là đường kính của vòng màu in trên lens. Đây mới là con số quyết định mắt trông to thêm bao nhiêu.',
        'Với look tự nhiên, GDIA khoảng 13.0–13.6mm là vừa: lớn hơn mống mắt thật một chút, đủ để mắt sáng lên mà không lộ viền tròn rõ rệt khi nhìn gần.',
      ],
      en: [
        'DIA is the diameter of the whole lens, usually 14.0–14.5mm, and it mostly governs fit rather than how the lens looks.',
        'GDIA is the diameter of the printed coloured ring. That is the number that decides how much larger your eyes appear.',
        'For a natural look, a GDIA around 13.0–13.6mm sits right: a little wider than your own iris, enough to brighten the eye without an obvious ring up close.',
      ],
    },
  },
  {
    slug: 've-sinh-va-bao-quan-lens',
    image: '/images/moment-party.jpg',
    publishedAt: '2026-08-30',
    readingTheme: 'care',
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
  {
    slug: 'lens-cho-ngay-ky-yeu',
    image: '/images/makeup-pink.jpg',
    publishedAt: '2026-08-18',
    readingTheme: 'occasion',
    title: {
      vi: 'Lens cho ngày kỷ yếu: màu nào lên hình đẹp?',
      en: 'Lenses for yearbook day: which colours photograph well',
    },
    excerpt: {
      vi: 'Máy ảnh và đèn flash làm màu lens nhạt đi khoảng một tông, nên màu lên hình đẹp thường đậm hơn màu bạn chọn khi soi gương.',
      en: 'Cameras and flash wash a lens out by roughly a tone, so the colour that photographs well is darker than the one you pick in the mirror.',
    },
    body: {
      vi: [
        'Dưới ánh đèn studio, lens nâu nhạt thường chụp ra gần như màu mắt thật. Nếu muốn thấy rõ màu trong ảnh, chọn đậm hơn một tông so với lúc thử trước gương.',
        'Viền lens đậm lên hình rất rõ và dễ bị lộ ở ảnh cận. Với ảnh kỷ yếu chụp nhóm thì không sao, nhưng ảnh chân dung nên chọn viền mảnh.',
        'Đeo thử trước ngày chụp ít nhất một lần, cả buổi, để chắc rằng mắt chịu được nhiều giờ dưới đèn nóng mà không đỏ.',
      ],
      en: [
        'Under studio lighting a pale brown often photographs as your own eye colour. To see the colour in the picture, go a tone darker than what looked right in the mirror.',
        'A dark limbal ring reads strongly on camera and can look heavy in close-ups. Fine for group yearbook shots, worth going thinner for portraits.',
        'Wear them for a full day at least once before the shoot, so you know your eyes stay comfortable through hours under hot lights.',
      ],
    },
  },
  {
    slug: 'makeup-look-han-quoc',
    image: '/images/makeup-smoky.jpg',
    publishedAt: '2026-08-08',
    readingTheme: 'makeup',
    title: {
      vi: 'Makeup look Hàn Quốc: chọn lens đi cùng lớp trang điểm',
      en: 'Korean makeup looks: choosing the lens that goes with the face',
    },
    excerpt: {
      vi: 'Lớp makeup càng trong trẻo thì lens càng nên nhạt — và ngược lại, mắt khói cần một màu đủ đậm để không bị lớp eyeliner nuốt mất.',
      en: 'The softer the makeup, the paler the lens should be — and a smoky eye needs enough depth not to be swallowed by the liner.',
    },
    body: {
      vi: [
        'Với look trong trẻo kiểu Hàn — má hồng nhẹ, môi tint, mắt gần như không kẻ — lens nâu sáng hoặc xám nhạt giữ được vẻ tự nhiên mà vẫn làm mắt long lanh.',
        'Mắt khói và eyeliner đậm kéo toàn bộ sự chú ý về đường viền mi. Lens màu nhạt sẽ biến mất trong lớp makeup đó; nâu đậm hoặc đen tự nhiên giữ được chiều sâu.',
        'Nguyên tắc chung: đừng để lens và lớp makeup cùng tranh phần nổi bật. Chọn một thứ làm trung tâm, thứ còn lại lùi lại một bước.',
      ],
      en: [
        'For the clean Korean look — soft blush, tinted lips, barely any liner — a light brown or pale grey keeps things natural while still catching the light.',
        'A smoky eye with heavy liner pulls all the attention to the lash line. A pale lens simply disappears into it; a deep brown or natural black keeps its depth.',
        'The general rule: do not let the lens and the makeup compete. Pick one to lead and let the other step back.',
      ],
    },
  },
  {
    slug: 'deo-lens-bao-lau-la-du',
    image: '/images/cat-daily.jpg',
    publishedAt: '2026-07-26',
    readingTheme: 'comfort',
    title: {
      vi: 'Đeo lens bao lâu là đủ?',
      en: 'How many hours of lens wear is enough?',
    },
    excerpt: {
      vi: 'Không có một con số đúng cho tất cả, nhưng có vài dấu hiệu rất rõ cho biết hôm nay bạn đã đeo quá lâu.',
      en: 'There is no single right number, but there are clear signs that today you have worn them too long.',
    },
    body: {
      vi: [
        'Phần lớn người đeo thoải mái trong 6–8 tiếng. Con số này phụ thuộc vào độ ẩm của lens, môi trường máy lạnh và thời gian nhìn màn hình nhiều hơn là vào thương hiệu.',
        'Dấu hiệu nên tháo ra: mắt bắt đầu cay, nhìn hơi mờ rồi rõ lại sau khi chớp, hoặc bạn thấy mình chớp mắt nhiều hơn bình thường.',
        'Đeo lens khi ngủ — kể cả một giấc ngắn — là thói quen rủi ro nhất trong danh sách này, vì giác mạc gần như không nhận được oxy khi mắt nhắm.',
      ],
      en: [
        'Most people are comfortable for six to eight hours. That number follows how moist the lens is, how dry the air runs and how long you stare at a screen, far more than it follows the brand.',
        'Signs to take them out: a stinging feeling, vision that blurs and clears again when you blink, or noticing that you are blinking more than usual.',
        'Sleeping in lenses — even a short nap — is the riskiest habit on this list, because a closed eye delivers almost no oxygen to the cornea.',
      ],
    },
  },
];
