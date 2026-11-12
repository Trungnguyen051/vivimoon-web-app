import type { FaqEntry } from '@/lib/api/schemas/support';

/**
 * PROVISIONAL — every question, answer and link target below is written to be
 * plausible, not supplied by Vivimoon. The questions themselves come from the
 * design; the answers are ours, and the ones that state a policy ("trong 7 ngày",
 * "2–4 ngày làm việc") state a number nobody has confirmed. Vivimoon's real
 * wording and real windows replace all of it, and doing so is a data edit in this
 * one file — the same arrangement `home.trust` already has.
 *
 * Deliberately NOT marked up: an answer is paragraphs, and anything a reader
 * should be able to click is a `links` entry beside the prose (`CONTEXT.md` → FAQ
 * Entry; ADR-0019 is the separate question of a Guide's shape).
 *
 * Ticket #119 sized these at 3–5 per Topic and `nguoi-moi-deo-lens` carries six. That
 * range was guidance for writing fixtures, not an invariant — Vivimoon's own answers
 * will overrun it the moment they arrive, and six of twenty-six unbalances nothing
 * (#161). No guard holds it, deliberately.
 */
export const faqEntries: FaqEntry[] = [
  // ── Người mới đeo lens ──────────────────────────────────────────────────────
  {
    slug: 'deo-lens-co-dau-khong',
    topic: 'nguoi-moi-deo-lens',
    featured: true,
    question: { vi: 'Đeo lens có đau mắt không?', en: 'Does wearing lenses hurt?' },
    shortAnswer: {
      vi: 'Không đau. Lần đầu có thể hơi lạ trong vài phút, nhưng đau là dấu hiệu cần tháo ra.',
      en: 'No. The first few minutes can feel odd, but pain is a sign to take them out.',
    },
    answer: {
      vi: [
        'Lens mềm nằm trên lớp nước mắt chứ không chạm trực tiếp vào giác mạc, nên cảm giác bình thường là hơi mát và hơi lạ trong vài phút đầu, rồi quên hẳn.',
        'Nếu thấy đau, rát hoặc chảy nước mắt liên tục, đó không phải chuyện quen dần: hãy tháo lens ra và kiểm tra xem lens có bị lộn mặt, dính bụi hay rách không.',
      ],
      en: [
        'A soft lens floats on your tear film rather than pressing on the cornea, so the normal sensation is a little cool and a little strange for a few minutes, then nothing at all.',
        'Pain, stinging or constant watering is not something to get used to. Take the lens out and check whether it is inside out, has caught dust, or is torn.',
      ],
    },
    links: [
      {
        href: '/support/guides/cach-deo-va-thao-lens',
        label: { vi: 'Cách đeo và tháo lens cho người mới', en: 'How to put in and take out lenses' },
      },
    ],
  },
  {
    slug: 'lens-co-bi-com-khong',
    topic: 'nguoi-moi-deo-lens',
    featured: true,
    question: { vi: 'Đeo lens có bị cộm không?', en: 'Will lenses feel gritty?' },
    shortAnswer: {
      vi: 'Cộm thường do lens lộn mặt, khô mắt hoặc có bụi — cả ba đều xử lý được.',
      en: 'Grittiness usually means the lens is inside out, your eyes are dry, or dust got in.',
    },
    answer: {
      vi: [
        'Cảm giác cộm gần như luôn có nguyên nhân cụ thể. Phổ biến nhất là lens bị lộn mặt: lens đúng mặt có hình bát úp, còn lens lộn sẽ hơi loe ra ở vành.',
        'Nếu lens đúng mặt mà vẫn cộm, thử nhỏ nước nhỏ mắt dành cho người đeo lens. Phòng máy lạnh và nhiều giờ nhìn màn hình làm mắt khô nhanh hơn bạn nghĩ.',
      ],
      en: [
        'Grittiness almost always has a specific cause. The most common is a lens worn inside out: the right way round it sits like a bowl, inside out the rim flares slightly.',
        'If it is the right way round and still feels gritty, try drops made for lens wearers. Air conditioning and long screen sessions dry your eyes faster than you would expect.',
      ],
    },
    links: [],
  },
  {
    slug: 'deo-lens-lan-dau-co-kho-khong',
    topic: 'nguoi-moi-deo-lens',
    featured: true,
    question: { vi: 'Đeo lens lần đầu có khó không?', en: 'Is it hard to put a lens in the first time?' },
    shortAnswer: {
      vi: 'Khó nhất là quen với việc đưa tay lại gần mắt. Hầu hết mọi người làm được sau 2–3 lần thử.',
      en: 'The hard part is getting used to bringing a finger near your eye. Most people manage by the third try.',
    },
    answer: {
      vi: [
        'Phản xạ chớp mắt là trở ngại thật, không phải do bạn vụng. Cách dễ nhất là kéo nhẹ mi dưới bằng tay không thuận, nhìn lên trần nhà, rồi đặt lens vào phần lòng trắng phía dưới thay vì nhắm thẳng vào tròng đen.',
        'Đừng vội. Nếu thử ba lần không được, nghỉ một lát rồi làm lại — mắt mỏi sẽ chớp nhiều hơn.',
      ],
      en: [
        'The blink reflex is a real obstacle, not clumsiness. The easiest approach is to hold your lower lid down with your other hand, look up at the ceiling, and place the lens on the white below your iris rather than aiming straight at the centre.',
        'Do not rush it. If three attempts fail, stop for a minute and come back — a tired eye blinks more.',
      ],
    },
    links: [
      {
        href: '/support/guides/cach-deo-va-thao-lens',
        label: { vi: 'Cách đeo và tháo lens cho người mới', en: 'How to put in and take out lenses' },
      },
    ],
  },
  {
    slug: 'mat-nhay-cam-dung-duoc-khong',
    topic: 'nguoi-moi-deo-lens',
    featured: true,
    question: { vi: 'Mắt nhạy cảm có dùng lens được không?', en: 'Can I wear lenses with sensitive eyes?' },
    shortAnswer: {
      vi: 'Phần lớn là được, nhưng nên bắt đầu bằng lens 1 ngày và thời gian đeo ngắn.',
      en: 'Usually yes, but start with daily lenses and short wearing sessions.',
    },
    answer: {
      vi: [
        'Mắt nhạy cảm thường hợp với lens dùng một lần: mỗi lần đeo là một chiếc lens mới, không tích tụ cặn protein như lens dùng lại nhiều lần.',
        'Nếu bạn có tiền sử khô mắt, dị ứng hoặc viêm kết mạc, hãy hỏi bác sĩ mắt trước. Đây là lời khuyên chung, không thay thế được khám mắt.',
      ],
      en: [
        'Sensitive eyes usually do best with single-use lenses: every wear starts with a fresh lens, with none of the protein build-up that reusable lenses accumulate.',
        'If you have a history of dry eye, allergies or conjunctivitis, ask an eye doctor first. This is general advice and does not replace an eye exam.',
      ],
    },
    links: [
      { href: '/collection/daily-lenses', label: { vi: 'Xem lens 1 ngày', en: 'Browse daily lenses' } },
    ],
  },
  {
    slug: 'deo-duoc-bao-lau-moi-ngay',
    topic: 'nguoi-moi-deo-lens',
    featured: true,
    question: { vi: 'Đeo lens được bao lâu mỗi ngày?', en: 'How long can I wear lenses each day?' },
    shortAnswer: {
      vi: 'Người mới nên bắt đầu 4–6 tiếng, tối đa 8 tiếng một ngày, và không đeo khi ngủ.',
      en: 'Start at 4–6 hours, cap it at 8, and never sleep in them.',
    },
    answer: {
      vi: [
        'Giác mạc lấy oxy trực tiếp từ không khí, nên thời gian đeo càng dài thì mắt càng thiếu oxy. Người mới nên bắt đầu khoảng 4–6 tiếng rồi tăng dần khi đã quen.',
        'Không đeo lens khi ngủ, kể cả ngủ trưa — đây là nguyên nhân hàng đầu của viêm giác mạc ở người đeo lens.',
      ],
      en: [
        'Your cornea takes oxygen straight from the air, so the longer a lens stays in, the less it gets. Start around 4–6 hours and build up as you get used to them.',
        'Never sleep in lenses, naps included — it is the leading cause of corneal infection among lens wearers.',
      ],
    },
    links: [],
  },
  {
    slug: 'lam-sao-biet-deo-dung-mat',
    topic: 'nguoi-moi-deo-lens',
    featured: false,
    question: { vi: 'Làm sao biết đang đeo đúng mặt lens?', en: 'How do I tell which way round a lens goes?' },
    shortAnswer: {
      vi: 'Đặt lens lên đầu ngón tay: đúng mặt trông như cái bát, sai mặt thì vành hơi loe ra.',
      en: 'Rest it on a fingertip: the right way round it looks like a bowl, the wrong way the rim flares.',
    },
    answer: {
      vi: [
        'Đặt lens lên đầu ngón trỏ và nhìn ngang. Lens đúng mặt có đường cong đều như hình bát úp; lens lộn mặt có vành hơi bè ra ngoài như cái đĩa.',
        'Đeo nhầm mặt không gây hại, chỉ cộm và dễ trôi lệch. Tháo ra, lật lại và đeo lần nữa.',
      ],
      en: [
        'Balance the lens on your fingertip and look at it side on. The right way round it curves evenly like a bowl; inside out, the rim splays outward like a saucer.',
        'Wearing one inside out does no harm — it just feels gritty and slides out of place. Take it out, flip it, and try again.',
      ],
    },
    links: [],
  },

  // ── Chọn lens & độ cận ──────────────────────────────────────────────────────
  {
    slug: 'chon-do-can-the-nao',
    topic: 'chon-lens-va-do-can',
    featured: false,
    question: { vi: 'Chọn độ cận cho lens thế nào?', en: 'How do I pick the right power?' },
    shortAnswer: {
      vi: 'Độ lens thường thấp hơn độ kính một chút, vì lens nằm sát mắt hơn.',
      en: 'Lens power is usually slightly lower than your glasses, because a lens sits closer to the eye.',
    },
    answer: {
      vi: [
        'Lens nằm trực tiếp trên mắt, còn kính cách mắt khoảng 12mm, nên từ khoảng -4.00 trở lên độ lens thường thấp hơn độ kính một bậc.',
        'Nếu bạn chưa từng đo độ cho lens, hãy lấy số đo từ tiệm kính hoặc bác sĩ thay vì tự suy ra từ đơn kính.',
      ],
      en: [
        'A lens sits directly on the eye while glasses sit about 12mm away, so from roughly -4.00 upward the lens power is typically one step lower than the spectacle power.',
        'If you have never been measured for lenses, get the number from an optician rather than deriving it from your glasses prescription.',
      ],
    },
    links: [],
  },
  {
    slug: 'dia-gdia-la-gi',
    topic: 'chon-lens-va-do-can',
    featured: false,
    question: { vi: 'DIA và GDIA là gì?', en: 'What are DIA and GDIA?' },
    shortAnswer: {
      vi: 'DIA là đường kính cả chiếc lens; GDIA là đường kính phần có màu — GDIA mới quyết định mắt to bao nhiêu.',
      en: 'DIA is the whole lens; GDIA is the coloured part — GDIA is what decides how big your eyes look.',
    },
    answer: {
      vi: [
        'DIA (diameter) là đường kính toàn bộ chiếc lens, thường 14.0–14.5mm, và ảnh hưởng đến độ ôm chứ không đến vẻ ngoài.',
        'GDIA (graphic diameter) là đường kính vùng có màu. Đây mới là con số quyết định mắt trông tự nhiên hay to rõ rệt: khoảng 13.0mm là tự nhiên, trên 14.0mm là nổi bật.',
      ],
      en: [
        'DIA is the diameter of the whole lens, usually 14.0–14.5mm. It affects fit rather than appearance.',
        'GDIA is the diameter of the coloured zone, and it is the number that decides whether your eyes read as natural or noticeably larger: around 13.0mm is natural, above 14.0mm is dramatic.',
      ],
    },
    links: [
      { href: '/collection/colored-lenses', label: { vi: 'Xem lens có màu', en: 'Browse coloured lenses' } },
    ],
  },
  {
    slug: 'chon-mau-lens-hop-da',
    topic: 'chon-lens-va-do-can',
    featured: false,
    question: { vi: 'Chọn màu lens hợp với da thế nào?', en: 'Which lens colour suits my skin tone?' },
    shortAnswer: {
      vi: 'Da vàng hợp nhất với nâu mật ong, nâu khói và xám tro.',
      en: 'Warm skin suits honey brown, smoky brown and ash grey best.',
    },
    answer: {
      vi: [
        'Tông da vàng — phổ biến nhất ở Việt Nam — hợp với các màu ấm và trung tính. Nâu mật ong làm sáng mắt mà không để lại viền màu rõ.',
        'Màu lạ như xám tro hay tím khói vẫn tự nhiên trên da vàng, miễn là GDIA không quá lớn.',
      ],
      en: [
        'Warm skin, the most common tone in Vietnam, suits warm and neutral colours. Honey brown brightens the eye without leaving an obvious ring.',
        'Less usual colours like ash grey and smoky violet still read as natural on warm skin, as long as the GDIA stays moderate.',
      ],
    },
    links: [
      { href: '/articles/mau-lens-hop-tong-da-vang', label: { vi: 'Đọc bài về màu lens và tông da', en: 'Read the article on colour and skin tone' } },
    ],
  },
  {
    slug: 'lens-1-ngay-hay-dai-ngay',
    topic: 'chon-lens-va-do-can',
    featured: false,
    question: { vi: 'Nên chọn lens 1 ngày hay lens dài ngày?', en: 'Should I choose daily or longer-wear lenses?' },
    shortAnswer: {
      vi: 'Đeo thỉnh thoảng thì lens 1 ngày tiện và sạch hơn; đeo hằng ngày thì lens dài ngày rẻ hơn.',
      en: 'Occasional wear suits daily lenses; everyday wear is cheaper with longer-wear lenses.',
    },
    answer: {
      vi: [
        'Lens 1 ngày không cần ngâm rửa và không tích cặn, nên hợp với người đeo thỉnh thoảng hoặc mắt nhạy cảm.',
        'Lens 1 tháng trở lên rẻ hơn tính theo ngày, nhưng bắt buộc phải vệ sinh và thay nước ngâm đúng cách.',
      ],
      en: [
        'Daily lenses need no soaking and accumulate no deposits, which suits occasional wearers and sensitive eyes.',
        'Monthly and longer lenses cost less per day, but only if you clean them and change the solution properly.',
      ],
    },
    links: [
      { href: '/collection/daily-lenses', label: { vi: 'Xem lens 1 ngày', en: 'Browse daily lenses' } },
    ],
  },

  // ── Đơn hàng & thanh toán ───────────────────────────────────────────────────
  {
    slug: 'cac-hinh-thuc-thanh-toan',
    topic: 'don-hang-va-thanh-toan',
    featured: false,
    question: { vi: 'Vivimoon nhận những hình thức thanh toán nào?', en: 'Which payment methods do you accept?' },
    shortAnswer: {
      vi: 'Chuyển khoản, ví điện tử, thẻ nội địa và quốc tế, hoặc thanh toán khi nhận hàng.',
      en: 'Bank transfer, e-wallets, domestic and international cards, or cash on delivery.',
    },
    answer: {
      vi: [
        'Bạn có thể chọn hình thức thanh toán ở bước cuối của trang thanh toán. Đơn thanh toán trước thường được đóng gói sớm hơn đơn COD.',
        'Với thẻ quốc tế, giao dịch được xử lý qua cổng thanh toán và Vivimoon không lưu số thẻ của bạn.',
      ],
      en: [
        'You pick a method at the last step of checkout. Prepaid orders are usually packed sooner than cash-on-delivery ones.',
        'International cards are processed through a payment gateway; Vivimoon never stores your card number.',
      ],
    },
    links: [],
  },
  {
    slug: 'sua-hoac-huy-don',
    topic: 'don-hang-va-thanh-toan',
    featured: false,
    question: { vi: 'Tôi có thể sửa hoặc huỷ đơn đã đặt không?', en: 'Can I change or cancel an order?' },
    shortAnswer: {
      vi: 'Được, nếu đơn chưa được đóng gói. Nhắn Vivimoon kèm mã đơn càng sớm càng tốt.',
      en: 'Yes, as long as it has not been packed. Message us with your order code as soon as you can.',
    },
    answer: {
      vi: [
        'Đơn chưa chuyển sang trạng thái đang đóng gói thì vẫn sửa được địa chỉ, số lượng hoặc độ cận.',
        'Khi đơn đã bàn giao cho đơn vị vận chuyển thì không sửa được nữa — lúc đó hãy xử lý theo chính sách đổi trả.',
      ],
      en: [
        'While an order has not moved into packing, the address, quantity and prescription can all still be changed.',
        'Once it is with the courier it is fixed, and the returns policy is the route from there.',
      ],
    },
    links: [
      { href: '/orders/track', label: { vi: 'Tra cứu trạng thái đơn', en: 'Check your order status' } },
    ],
  },
  {
    slug: 'xuat-hoa-don',
    topic: 'don-hang-va-thanh-toan',
    featured: false,
    question: { vi: 'Vivimoon có xuất hoá đơn không?', en: 'Can I get an invoice?' },
    shortAnswer: {
      vi: 'Có. Ghi thông tin xuất hoá đơn vào phần ghi chú khi đặt hàng.',
      en: 'Yes. Add your invoicing details in the order notes at checkout.',
    },
    answer: {
      vi: [
        'Hoá đơn được xuất theo thông tin bạn ghi ở phần ghi chú của đơn hàng, nên hãy kiểm tra kỹ mã số thuế và tên đơn vị trước khi đặt.',
        'Nếu quên, hãy nhắn cho Vivimoon trong vòng vài ngày kể từ khi đặt đơn.',
      ],
      en: [
        'Invoices are issued from what you put in the order notes, so check the tax code and company name before you place the order.',
        'If you forget, message us within a few days of ordering.',
      ],
    },
    links: [],
  },
  {
    slug: 'ma-giam-gia-khong-ap-dung',
    topic: 'don-hang-va-thanh-toan',
    featured: false,
    question: { vi: 'Mã giảm giá của tôi không áp dụng được?', en: 'My discount code will not apply — why?' },
    shortAnswer: {
      vi: 'Thường do mã đã hết hạn, chưa đạt giá trị đơn tối thiểu, hoặc không dùng chung với khuyến mãi đang chạy.',
      en: 'Usually it has expired, the order is below the minimum, or it cannot stack with a running promotion.',
    },
    answer: {
      vi: [
        'Mỗi mã có điều kiện riêng về thời hạn, giá trị đơn tối thiểu và nhóm sản phẩm áp dụng.',
        'Nếu mã vẫn còn hạn và đơn đã đủ điều kiện mà vẫn báo lỗi, hãy nhắn cho Vivimoon kèm ảnh chụp màn hình.',
      ],
      en: [
        'Each code carries its own expiry, minimum order value and eligible product range.',
        'If the code is in date and the order qualifies but it still fails, send us a screenshot.',
      ],
    },
    links: [
      { href: '/account/vouchers', label: { vi: 'Xem ưu đãi đang có', en: 'See your available vouchers' } },
    ],
  },

  // ── Giao hàng ───────────────────────────────────────────────────────────────
  {
    slug: 'thoi-gian-giao-hang',
    topic: 'giao-hang',
    featured: false,
    question: { vi: 'Bao lâu thì tôi nhận được hàng?', en: 'How long will delivery take?' },
    shortAnswer: {
      vi: 'Nội thành 1–2 ngày làm việc, tỉnh thành khác 2–4 ngày làm việc.',
      en: 'One to two working days in the city, two to four elsewhere.',
    },
    answer: {
      vi: [
        'Đơn đặt trước giờ cắt trong ngày thường được đóng gói và bàn giao cho đơn vị vận chuyển ngay hôm đó.',
        'Thời gian trên tính từ lúc đơn vị vận chuyển nhận hàng, chưa tính các ngày lễ.',
      ],
      en: [
        'Orders placed before the daily cut-off are usually packed and handed to the courier the same day.',
        'The windows above start from courier pickup and do not count public holidays.',
      ],
    },
    links: [
      { href: '/orders/track', label: { vi: 'Tra cứu đơn hàng', en: 'Track your order' } },
    ],
  },
  {
    slug: 'phi-van-chuyen',
    topic: 'giao-hang',
    featured: false,
    question: { vi: 'Phí vận chuyển tính thế nào?', en: 'How is shipping calculated?' },
    shortAnswer: {
      vi: 'Miễn phí cho đơn từ 300.000₫; dưới mức đó phí hiển thị ở bước thanh toán.',
      en: 'Free from 300,000₫; below that the fee shows at checkout.',
    },
    answer: {
      vi: [
        'Phí vận chuyển phụ thuộc vào khu vực giao và được tính lại ở bước nhập địa chỉ, trước khi bạn xác nhận đơn.',
        'Đơn từ 300.000₫ được miễn phí vận chuyển toàn quốc.',
      ],
      en: [
        'Shipping depends on the delivery area and is recalculated at the address step, before you confirm.',
        'Orders from 300,000₫ ship free nationwide.',
      ],
    },
    links: [],
  },
  {
    slug: 'theo-doi-don-hang',
    topic: 'giao-hang',
    featured: false,
    question: { vi: 'Làm sao theo dõi đơn hàng của tôi?', en: 'How do I track my order?' },
    shortAnswer: {
      vi: 'Nhập mã đơn và số điện thoại ở trang tra cứu — không cần đăng nhập.',
      en: 'Enter your order code and phone number on the tracking page — no account needed.',
    },
    answer: {
      vi: [
        'Bạn không cần tài khoản để tra cứu: mã đơn và số điện thoại đã đặt hàng là đủ.',
        'Nếu có tài khoản, toàn bộ lịch sử đơn nằm trong mục đơn hàng của bạn.',
      ],
      en: [
        'You do not need an account to look up an order: the order code and the phone number you ordered with are enough.',
        'If you do have an account, your full order history is in your orders page.',
      ],
    },
    links: [
      { href: '/orders/track', label: { vi: 'Tra cứu đơn hàng', en: 'Track an order' } },
      { href: '/account/orders', label: { vi: 'Đơn hàng của tôi', en: 'My orders' } },
    ],
  },
  {
    slug: 'giao-hang-tinh-xa',
    topic: 'giao-hang',
    featured: false,
    question: { vi: 'Vivimoon có giao hàng đi tỉnh xa không?', en: 'Do you deliver to remote provinces?' },
    shortAnswer: {
      vi: 'Có, Vivimoon giao toàn quốc. Một số khu vực xa có thể lâu hơn vài ngày.',
      en: 'Yes, nationwide. Some remote areas take a few days longer.',
    },
    answer: {
      vi: [
        'Vivimoon giao đến tất cả tỉnh thành. Với huyện đảo và khu vực miền núi, thời gian có thể dài hơn khung thông thường.',
        'Phí và thời gian dự kiến luôn hiển thị trước khi bạn xác nhận đơn.',
      ],
      en: [
        'We deliver to every province. Island districts and mountainous areas can take longer than the usual window.',
        'The fee and the estimate always show before you confirm the order.',
      ],
    },
    links: [],
  },

  // ── Đổi trả & bảo hành ──────────────────────────────────────────────────────
  {
    slug: 'dieu-kien-doi-tra',
    topic: 'doi-tra-va-bao-hanh',
    featured: false,
    question: { vi: 'Điều kiện đổi trả là gì?', en: 'What are the conditions for a return?' },
    shortAnswer: {
      vi: 'Trong 7 ngày kể từ khi nhận, lens còn nguyên tem và chưa mở vỉ.',
      en: 'Within 7 days of delivery, sealed and unopened.',
    },
    answer: {
      vi: [
        'Vì lý do vệ sinh, lens đã mở vỉ không thể đổi trả — đây là quy định chung với sản phẩm tiếp xúc trực tiếp với mắt.',
        'Lens còn nguyên vỉ, nguyên tem và trong thời hạn đổi trả thì được đổi sang độ khác hoặc màu khác.',
      ],
      en: [
        'For hygiene reasons an opened blister cannot be returned — standard for anything that touches the eye directly.',
        'Sealed, unopened lenses within the window can be exchanged for a different power or colour.',
      ],
    },
    links: [],
  },
  {
    slug: 'lens-bi-loi-thi-sao',
    topic: 'doi-tra-va-bao-hanh',
    featured: false,
    question: { vi: 'Lens bị rách hoặc lỗi thì xử lý thế nào?', en: 'What if a lens is torn or faulty?' },
    shortAnswer: {
      vi: 'Chụp ảnh vỉ và lens rồi nhắn Vivimoon — hàng lỗi được đổi mới, không tính thời hạn thường.',
      en: 'Photograph the blister and the lens and message us — faulty items are replaced outside the usual window.',
    },
    answer: {
      vi: [
        'Lỗi sản xuất không nằm trong thời hạn đổi trả thông thường. Hãy giữ lại vỉ và chụp ảnh rõ phần lỗi.',
        'Sau khi xác nhận, Vivimoon gửi lens mới và chịu phí vận chuyển hai chiều.',
      ],
      en: [
        'Manufacturing faults are not bound by the normal returns window. Keep the blister and photograph the fault clearly.',
        'Once confirmed, we send a replacement and cover shipping both ways.',
      ],
    },
    links: [],
  },
  {
    slug: 'cach-gui-tra-hang',
    topic: 'doi-tra-va-bao-hanh',
    featured: false,
    question: { vi: 'Gửi trả hàng bằng cách nào?', en: 'How do I send something back?' },
    shortAnswer: {
      vi: 'Nhắn Vivimoon để lấy hướng dẫn, rồi gửi qua đơn vị vận chuyển bất kỳ.',
      en: 'Message us for instructions, then send it with any courier.',
    },
    answer: {
      vi: [
        'Hãy nhắn cho Vivimoon kèm mã đơn trước khi gửi, để đơn đổi trả được ghi nhận và xử lý nhanh hơn.',
        'Đóng gói kèm vỉ lens nguyên vẹn và ghi mã đơn bên ngoài kiện hàng.',
      ],
      en: [
        'Message us with your order code before sending, so the return is logged and handled faster.',
        'Pack the sealed blister with it and write the order code on the outside of the parcel.',
      ],
    },
    links: [],
  },
  {
    slug: 'khi-nao-duoc-hoan-tien',
    topic: 'doi-tra-va-bao-hanh',
    featured: false,
    question: { vi: 'Khi nào tôi được hoàn tiền?', en: 'When do I get my money back?' },
    shortAnswer: {
      vi: 'Sau khi Vivimoon nhận và kiểm tra hàng trả, tiền được hoàn trong 3–5 ngày làm việc.',
      en: 'Three to five working days after we receive and check the returned item.',
    },
    answer: {
      vi: [
        'Tiền được hoàn về đúng phương thức bạn đã thanh toán. Với chuyển khoản, thời gian phụ thuộc vào ngân hàng của bạn.',
        'Với đơn COD, Vivimoon sẽ hỏi số tài khoản để hoàn tiền.',
      ],
      en: [
        'Refunds go back to the method you paid with. For bank transfers the timing depends on your bank.',
        'For cash-on-delivery orders we will ask for an account number to refund to.',
      ],
    },
    links: [],
  },

  // ── Tài khoản & ưu đãi ──────────────────────────────────────────────────────
  {
    slug: 'tao-tai-khoan-de-lam-gi',
    topic: 'tai-khoan-va-uu-dai',
    featured: false,
    question: { vi: 'Tạo tài khoản để làm gì?', en: 'Why create an account?' },
    shortAnswer: {
      vi: 'Để lưu địa chỉ, độ cận, danh sách yêu thích và xem lại đơn cũ.',
      en: 'To save addresses, prescriptions, favourites, and see past orders.',
    },
    answer: {
      vi: [
        'Tài khoản giúp bạn không phải nhập lại địa chỉ và độ cận mỗi lần mua, và giữ lại danh sách lens yêu thích.',
        'Bạn vẫn có thể mua hàng và tra cứu đơn mà không cần tài khoản.',
      ],
      en: [
        'An account saves you retyping your address and prescription every time, and keeps your favourites.',
        'You can still order and track without one.',
      ],
    },
    links: [
      { href: '/account/favorites', label: { vi: 'Danh sách yêu thích', en: 'Your favourites' } },
    ],
  },
  {
    slug: 'quen-mat-khau',
    topic: 'tai-khoan-va-uu-dai',
    featured: false,
    question: { vi: 'Tôi quên mật khẩu thì làm sao?', en: 'I forgot my password — what now?' },
    shortAnswer: {
      vi: 'Dùng mục quên mật khẩu ở trang đăng nhập, Vivimoon gửi liên kết đặt lại qua email.',
      en: 'Use the forgotten-password link on the sign-in page; we email you a reset link.',
    },
    answer: {
      vi: [
        'Liên kết đặt lại mật khẩu được gửi tới email bạn đã đăng ký và có hiệu lực trong thời gian ngắn.',
        'Nếu không thấy email, hãy kiểm tra hộp thư rác trước khi yêu cầu lại.',
      ],
      en: [
        'The reset link goes to your registered email address and is valid for a short window.',
        'If it does not arrive, check your spam folder before requesting another.',
      ],
    },
    links: [
      { href: '/forgot-password', label: { vi: 'Đặt lại mật khẩu', en: 'Reset your password' } },
    ],
  },
  {
    slug: 'diem-thuong-tinh-the-nao',
    topic: 'tai-khoan-va-uu-dai',
    featured: false,
    question: { vi: 'Điểm thưởng được tính thế nào?', en: 'How do loyalty points work?' },
    shortAnswer: {
      vi: 'Mỗi đơn hoàn tất được cộng điểm, và điểm có thể đổi thành ưu đãi ở lần mua sau.',
      en: 'Every completed order earns points, which become discounts on a later order.',
    },
    answer: {
      vi: [
        'Điểm được cộng khi đơn hàng hoàn tất, không phải khi đặt, nên đơn bị huỷ sẽ không tính điểm.',
        'Số điểm và lịch sử tích điểm nằm trong mục khách hàng thân thiết của tài khoản.',
      ],
      en: [
        'Points are credited when an order completes rather than when it is placed, so a cancelled order earns none.',
        'Your balance and history are in the loyalty section of your account.',
      ],
    },
    links: [
      { href: '/account/loyalty', label: { vi: 'Xem điểm của tôi', en: 'See your points' } },
    ],
  },
  {
    slug: 'voucher-o-dau',
    topic: 'tai-khoan-va-uu-dai',
    featured: false,
    question: { vi: 'Tôi xem ưu đãi đang có ở đâu?', en: 'Where do I find my available offers?' },
    shortAnswer: {
      vi: 'Trong mục ưu đãi của tài khoản — ở đó liệt kê mọi ưu đãi còn hiệu lực.',
      en: 'In the vouchers section of your account, which lists everything currently valid.',
    },
    answer: {
      vi: [
        'Mục ưu đãi hiển thị những ưu đãi đang còn hiệu lực cho tài khoản của bạn, kèm hạn sử dụng.',
        'Ưu đãi được áp dụng ở bước thanh toán, không phải khi thêm vào giỏ.',
      ],
      en: [
        'The vouchers section shows what is currently valid for your account, with expiry dates.',
        'Offers apply at checkout rather than when you add to the cart.',
      ],
    },
    links: [
      { href: '/account/vouchers', label: { vi: 'Ưu đãi của tôi', en: 'Your vouchers' } },
    ],
  },
];
