// でんしゃドリル (駅名・路線名の 4 択) 用マスタデータ。
// 説明文は Wikipedia を参照して子ども向けに書き下したもの。実行時に外部 fetch はしない。
// src: 各路線ページ (https://ja.wikipedia.org/wiki/京急本線 ほか) と各駅ページ
// (例: https://ja.wikipedia.org/wiki/品川駅) を参照。恒常的な特徴のみを短く要約。

/**
 * @typedef {Object} TrainEntry
 * @property {string} kanji         漢字表記 (例: '品川' '東海道新幹線')
 * @property {string} hiragana      ひらがな表記 (例: 'しながわ' 'とうかいどうしんかんせん')
 * @property {'station'|'line'} kind
 * @property {string[]} lines       所属路線 ID の配列 (station は 1〜複数、line は自身 1 個)
 * @property {string} description   子ども向け 1〜3 文の説明 (60〜200 文字目安)
 */

/** 路線 ID の一覧。station エントリの `lines` と、line エントリの `lines`（自身 1 個）で使う。 */
export const LINES = Object.freeze({
  keikyu: 'keikyu',
  yokohama: 'yokohama',
  negishi: 'negishi',
  keihinTohoku: 'keihin-tohoku',
  yokosuka: 'yokosuka',
  tokaido: 'tokaido',
  shinkansenTokaido: 'shinkansen-tokaido',
  shinkansenTohoku: 'shinkansen-tohoku',
  shinkansenSanyo: 'shinkansen-sanyo',
  shinkansenHokuriku: 'shinkansen-hokuriku',
  shinkansenKyushu: 'shinkansen-kyushu',
  shinkansenHokkaido: 'shinkansen-hokkaido',
  shinkansenJoetsu: 'shinkansen-joetsu',
  shinkansenNishikyushu: 'shinkansen-nishikyushu',
});

/** @type {TrainEntry[]} */
export const TRAIN_ENTRIES = [
  // --- 複数路線に登場する共通駅 (集約) ---
  {
    kanji: '品川',
    hiragana: 'しながわ',
    kind: 'station',
    lines: ['keikyu', 'keihin-tohoku', 'yokosuka', 'tokaido', 'shinkansen-tokaido'],
    description: 'JR や 京急が のりいれる 大きな のりかえ駅。東海道新幹線の 東京がわの 入り口の ひとつ。',
  },
  {
    kanji: '横浜',
    hiragana: 'よこはま',
    kind: 'station',
    lines: ['keikyu', 'yokohama', 'negishi', 'keihin-tohoku', 'yokosuka', 'tokaido'],
    description: '神奈川県で いちばん 大きな のりかえ駅。JR や 京急、私鉄が あつまり、みなとみらいの 玄関口。',
  },
  {
    kanji: '大船',
    hiragana: 'おおふな',
    kind: 'station',
    lines: ['negishi', 'keihin-tohoku', 'yokosuka', 'tokaido'],
    description: '鎌倉市に ある 大きな のりかえ駅。根岸線の しゅうてんで、東海道線や 横須賀線も とまる。',
  },
  {
    kanji: '東京',
    hiragana: 'とうきょう',
    kind: 'station',
    lines: ['keihin-tohoku', 'yokosuka', 'tokaido', 'shinkansen-tokaido'],
    description: '日本の 中心となる 大きな駅。東海道新幹線の 起点で、たくさんの 新幹線や 在来線が あつまる。',
  },
  {
    kanji: '川崎',
    hiragana: 'かわさき',
    kind: 'station',
    lines: ['keihin-tohoku', 'tokaido'],
    description: '川崎市の 中心にある JR の駅。京急川崎駅も ちかく、大きな 商店街が ひろがる。',
  },
  {
    kanji: '桜木町',
    hiragana: 'さくらぎちょう',
    kind: 'station',
    lines: ['negishi', 'keihin-tohoku'],
    description: '横浜市の 根岸線・京浜東北線の駅。みなとみらいや 赤レンガ倉庫まで あるいて 行ける。',
  },
  {
    kanji: '新横浜',
    hiragana: 'しんよこはま',
    kind: 'station',
    lines: ['yokohama', 'shinkansen-tokaido'],
    description: '横浜市 港北区の 東海道新幹線の駅。横浜線への のりかえが でき、日産スタジアムが ちかい。',
  },
  {
    kanji: '小田原',
    hiragana: 'おだわら',
    kind: 'station',
    lines: ['tokaido', 'shinkansen-tokaido'],
    description: '神奈川県 小田原市の 大きな駅。むかしの おしろ「小田原城」が ちかく、箱根への 入り口でも ある。',
  },
  {
    kanji: '熱海',
    hiragana: 'あたみ',
    kind: 'station',
    lines: ['tokaido', 'shinkansen-tokaido'],
    description: '静岡県 熱海市の 駅。むかしから 温泉で ゆうめいな まちで、東海道新幹線も とまる。',
  },

  // --- 京急線 (独自駅) ---
  {
    kanji: '京急蒲田',
    hiragana: 'けいきゅうかまた',
    kind: 'station',
    lines: ['keikyu'],
    description: '東京都 大田区に ある 京急の のりかえ駅。ここから 空港線に のると 羽田空港へ 行ける。',
  },
  {
    kanji: '京急川崎',
    hiragana: 'けいきゅうかわさき',
    kind: 'station',
    lines: ['keikyu'],
    description: '川崎市の 中心にある 京急の駅。ここから 大師線に のりかえて 川崎大師へ 行ける。',
  },
  {
    kanji: '上大岡',
    hiragana: 'かみおおおか',
    kind: 'station',
    lines: ['keikyu'],
    description: '横浜市 港南区に ある 京急の駅。地下鉄との のりかえも でき、大きな 商業ビルが たつ。',
  },
  {
    kanji: '金沢文庫',
    hiragana: 'かなざわぶんこ',
    kind: 'station',
    lines: ['keikyu'],
    description: '横浜市 金沢区の 京急の駅。近くに 車両基地が あり、たくさんの でんしゃが とまっている。',
  },
  {
    kanji: '金沢八景',
    hiragana: 'かなざわはっけい',
    kind: 'station',
    lines: ['keikyu'],
    description: '横浜市 金沢区の 京急の駅。逗子線が わかれ、シーサイドラインへも のりかえられる。',
  },
  {
    kanji: '堀ノ内',
    hiragana: 'ほりのうち',
    kind: 'station',
    lines: ['keikyu'],
    description: '横須賀市の 京急の駅。ここで 久里浜線が わかれて、久里浜方面へ 行く でんしゃが 出る。',
  },
  {
    kanji: '浦賀',
    hiragana: 'うらが',
    kind: 'station',
    lines: ['keikyu'],
    description: '京急本線の しゅうてん。むかし、くろふねの ペリーが やってきた 場所として ゆうめい。',
  },
  {
    kanji: '三崎口',
    hiragana: 'みさきぐち',
    kind: 'station',
    lines: ['keikyu'],
    description: '京急 久里浜線の しゅうてん。三浦半島の 南のほうにあり、まぐろで ゆうめいな 三崎港が ちかい。',
  },
  {
    kanji: '羽田空港第１・第２ターミナル',
    hiragana: 'はねだくうこうだいいち・だいにたーみなる',
    kind: 'station',
    lines: ['keikyu'],
    description: '羽田空港に ある 京急の駅。JAL や ANA の 大きな ターミナルビルに 直接 つながっている。',
  },

  // --- JR 横浜線 (独自駅) ---
  {
    kanji: '東神奈川',
    hiragana: 'ひがしかながわ',
    kind: 'station',
    lines: ['yokohama'],
    description: '横浜市 神奈川区に ある 駅。横浜線の でんしゃは この駅から 出発する。',
  },
  {
    kanji: '菊名',
    hiragana: 'きくな',
    kind: 'station',
    lines: ['yokohama'],
    description: '横浜市 港北区の 横浜線の駅。東急東横線への のりかえが できる。',
  },
  {
    kanji: '小机',
    hiragana: 'こづくえ',
    kind: 'station',
    lines: ['yokohama'],
    description: '横浜市 港北区の 横浜線の駅。近くに サッカーの試合が ひらかれる 日産スタジアムが ある。',
  },
  {
    kanji: '中山',
    hiragana: 'なかやま',
    kind: 'station',
    lines: ['yokohama'],
    description: '横浜市 緑区の 横浜線の駅。地下鉄 グリーンラインの しゅうてんでもある。',
  },
  {
    kanji: '長津田',
    hiragana: 'ながつた',
    kind: 'station',
    lines: ['yokohama'],
    description: '横浜市 緑区に ある 横浜線の駅。東急田園都市線や こどもの国線への のりかえが できる。',
  },
  {
    kanji: '町田',
    hiragana: 'まちだ',
    kind: 'station',
    lines: ['yokohama'],
    description: '東京都 町田市に ある 横浜線の駅。小田急線への のりかえが でき、大きな 商店街が ある。',
  },
  {
    kanji: '相模原',
    hiragana: 'さがみはら',
    kind: 'station',
    lines: ['yokohama'],
    description: '神奈川県 相模原市に ある 横浜線の駅。市役所の ちかくで にぎやかな 場所。',
  },
  {
    kanji: '橋本',
    hiragana: 'はしもと',
    kind: 'station',
    lines: ['yokohama'],
    description: '相模原市の 横浜線の駅。京王相模原線の しゅうてんでもあり、多くの 路線が あつまる。',
  },
  {
    kanji: '八王子',
    hiragana: 'はちおうじ',
    kind: 'station',
    lines: ['yokohama'],
    description: '東京都 八王子市の 大きな駅。JR 中央線や 八高線への のりかえが できる 横浜線の しゅうてん。',
  },

  // --- 根岸線 (独自駅) ---
  {
    kanji: '関内',
    hiragana: 'かんない',
    kind: 'station',
    lines: ['negishi'],
    description: '横浜市 中区に ある 根岸線の駅。横浜市役所や スタジアム、中華街まで あるいて 行ける。',
  },
  {
    kanji: '石川町',
    hiragana: 'いしかわちょう',
    kind: 'station',
    lines: ['negishi'],
    description: '横浜市の 根岸線の駅。中華街や 元町の 商店街まで あるいて すぐの 場所。',
  },
  {
    kanji: '山手',
    hiragana: 'やまて',
    kind: 'station',
    lines: ['negishi'],
    description: '横浜市の 根岸線の駅。港の見える丘公園などの 観光地が ちかい 山手地区の 玄関口。',
  },
  {
    kanji: '根岸',
    hiragana: 'ねぎし',
    kind: 'station',
    lines: ['negishi'],
    description: '横浜市 磯子区の 根岸線の駅。路線の 名前は この駅の 地名に ちなんでいる。',
  },
  {
    kanji: '磯子',
    hiragana: 'いそご',
    kind: 'station',
    lines: ['negishi'],
    description: '横浜市 磯子区の 根岸線の駅。この駅で 発着する でんしゃが 多い。',
  },
  {
    kanji: '新杉田',
    hiragana: 'しんすぎた',
    kind: 'station',
    lines: ['negishi'],
    description: '横浜市 磯子区の 根岸線の駅。ここから シーサイドラインに のりかえて 八景島へ 行ける。',
  },
  {
    kanji: '洋光台',
    hiragana: 'ようこうだい',
    kind: 'station',
    lines: ['negishi'],
    description: '横浜市 磯子区に ある 根岸線の駅。まわりは しずかな 住宅地が ひろがる。',
  },
  {
    kanji: '港南台',
    hiragana: 'こうなんだい',
    kind: 'station',
    lines: ['negishi'],
    description: '横浜市 港南区に ある 根岸線の駅。大きな ショッピングセンターが 駅の ちかくに ある。',
  },

  // --- 京浜東北線 (独自駅) ---
  {
    kanji: '大宮',
    hiragana: 'おおみや',
    kind: 'station',
    lines: ['keihin-tohoku'],
    description: 'さいたま市に ある 大きな のりかえ駅。京浜東北線や 東北新幹線、上越新幹線などが とまる。',
  },
  {
    kanji: '赤羽',
    hiragana: 'あかばね',
    kind: 'station',
    lines: ['keihin-tohoku'],
    description: '東京都 北区の のりかえ駅。京浜東北線や 埼京線、湘南新宿ラインなど 多くの 路線が とまる。',
  },
  {
    kanji: '上野',
    hiragana: 'うえの',
    kind: 'station',
    lines: ['keihin-tohoku'],
    description: '東京の 台東区に ある 大きな駅。上野動物園や 博物館が ちかく、東北・上越・北陸新幹線も とまる。',
  },
  {
    kanji: '秋葉原',
    hiragana: 'あきはばら',
    kind: 'station',
    lines: ['keihin-tohoku'],
    description: '東京の 千代田区に ある 駅。電気街として ゆうめいで、パソコンや アニメの お店が ならぶ。',
  },
  {
    kanji: '蒲田',
    hiragana: 'かまた',
    kind: 'station',
    lines: ['keihin-tohoku'],
    description: '東京都 大田区の 京浜東北線の駅。京急蒲田駅とは べつの 駅で、すこし はなれている。',
  },

  // --- 横須賀線 (独自駅) ---
  {
    kanji: '武蔵小杉',
    hiragana: 'むさしこすぎ',
    kind: 'station',
    lines: ['yokosuka'],
    description: '川崎市 中原区に ある のりかえ駅。JR の いくつもの 路線と 東急東横線が とまる。',
  },
  {
    kanji: '北鎌倉',
    hiragana: 'きたかまくら',
    kind: 'station',
    lines: ['yokosuka'],
    description: '鎌倉市の 横須賀線の駅。円覚寺や 建長寺など、ゆうめいな お寺の ちかくに ある。',
  },
  {
    kanji: '鎌倉',
    hiragana: 'かまくら',
    kind: 'station',
    lines: ['yokosuka'],
    description: '鎌倉市の 中心にある 駅。鶴岡八幡宮や 大仏など、むかしの 歴史ある 場所が 多い。',
  },
  {
    kanji: '逗子',
    hiragana: 'ずし',
    kind: 'station',
    lines: ['yokosuka'],
    description: '神奈川県 逗子市の 横須賀線の駅。海が ちかく、夏には 海水浴の お客さんで にぎわう。',
  },
  {
    kanji: '横須賀',
    hiragana: 'よこすか',
    kind: 'station',
    lines: ['yokosuka'],
    description: '神奈川県 横須賀市の 駅。海に めんした 港町で、大きな 船が とまる 港が ある。',
  },
  {
    kanji: '久里浜',
    hiragana: 'くりはま',
    kind: 'station',
    lines: ['yokosuka'],
    description: 'JR 横須賀線の しゅうてん。ここから フェリーに のると、千葉の 房総半島まで 行ける。',
  },

  // --- 東海道線 (独自駅) ---
  {
    kanji: '藤沢',
    hiragana: 'ふじさわ',
    kind: 'station',
    lines: ['tokaido'],
    description: '神奈川県 藤沢市の 大きな駅。江ノ島や 湘南の 海に 行く ときに よく つかわれる。',
  },
  {
    kanji: '平塚',
    hiragana: 'ひらつか',
    kind: 'station',
    lines: ['tokaido'],
    description: '神奈川県 平塚市の 東海道線の駅。7月には 大きな 七夕祭りが ひらかれる ことで しられる。',
  },
  {
    kanji: '沼津',
    hiragana: 'ぬまづ',
    kind: 'station',
    lines: ['tokaido'],
    description: '静岡県 沼津市の 東海道線の駅。近くの 沼津港では 新鮮な 魚が とれる ことで しられる。',
  },

  // --- 東海道新幹線 (独自駅) ---
  {
    kanji: '三島',
    hiragana: 'みしま',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '静岡県 三島市に ある 東海道新幹線の駅。ここから 伊豆や 箱根へ 行く 人が 多い。',
  },
  {
    kanji: '新富士',
    hiragana: 'しんふじ',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '静岡県 富士市に ある 東海道新幹線の駅。ホームから 大きな 富士山が よく 見える。',
  },
  {
    kanji: '静岡',
    hiragana: 'しずおか',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '静岡県の 県庁所在地の 大きな駅。お茶の 名産地で、駿河湾も ちかい。',
  },
  {
    kanji: '掛川',
    hiragana: 'かけがわ',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '静岡県 掛川市の 東海道新幹線の駅。むかしの おしろ「掛川城」が 駅の ちかくに ある。',
  },
  {
    kanji: '浜松',
    hiragana: 'はままつ',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '静岡県 浜松市の 大きな駅。ピアノなど 楽器づくりが さかんで、うなぎでも ゆうめい。',
  },
  {
    kanji: '豊橋',
    hiragana: 'とよはし',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '愛知県 豊橋市の 東海道新幹線の駅。名鉄や JR 飯田線への のりかえが できる。',
  },
  {
    kanji: '三河安城',
    hiragana: 'みかわあんじょう',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '愛知県 安城市の 東海道新幹線の駅。こだまだけが とまる、名古屋の となりの駅。',
  },
  {
    kanji: '名古屋',
    hiragana: 'なごや',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '愛知県 名古屋市の 大きな ターミナル駅。JR や 私鉄、地下鉄が あつまる 中部地方 いちばんの のりかえ駅。',
  },
  {
    kanji: '岐阜羽島',
    hiragana: 'ぎふはしま',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '岐阜県 羽島市の 東海道新幹線の駅。岐阜県で ゆいいつの 新幹線の 駅。',
  },
  {
    kanji: '米原',
    hiragana: 'まいばら',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '滋賀県 米原市の 東海道新幹線の駅。北陸本線への のりかえが できる 交通の わかれ道。',
  },
  {
    kanji: '京都',
    hiragana: 'きょうと',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '京都府の 県庁所在地の 大きな駅。金閣寺や 清水寺など、歴史ある 観光地が ちかい。',
  },
  {
    kanji: '新大阪',
    hiragana: 'しんおおさか',
    kind: 'station',
    lines: ['shinkansen-tokaido'],
    description: '大阪市に ある 大きな駅。東海道新幹線の しゅうてんで、ここから 山陽新幹線が はじまる。',
  },

  // --- 主要新幹線路線名 (line エントリ) ---
  {
    kanji: '東海道新幹線',
    hiragana: 'とうかいどうしんかんせん',
    kind: 'line',
    lines: ['shinkansen-tokaido'],
    description: '東京と 新大阪を むすぶ 新幹線。1964年に できた いちばん さいしょの 新幹線。',
  },
  {
    kanji: '東北新幹線',
    hiragana: 'とうほくしんかんせん',
    kind: 'line',
    lines: ['shinkansen-tohoku'],
    description: '東京と 新青森を むすぶ 新幹線。仙台や 盛岡を とおって 東北地方へ 行ける。',
  },
  {
    kanji: '北陸新幹線',
    hiragana: 'ほくりくしんかんせん',
    kind: 'line',
    lines: ['shinkansen-hokuriku'],
    description: '東京と 敦賀を むすぶ 新幹線。長野や 富山、金沢を とおる 日本海がわの 新幹線。',
  },
  {
    kanji: '山陽新幹線',
    hiragana: 'さんようしんかんせん',
    kind: 'line',
    lines: ['shinkansen-sanyo'],
    description: '新大阪と 博多を むすぶ 新幹線。岡山・広島・小倉などを とおって 九州の 入り口まで 行ける。',
  },
  {
    kanji: '九州新幹線',
    hiragana: 'きゅうしゅうしんかんせん',
    kind: 'line',
    lines: ['shinkansen-kyushu'],
    description: '博多と 鹿児島中央を むすぶ 新幹線。九州を 南北に つらぬく 新幹線。',
  },
  {
    kanji: '北海道新幹線',
    hiragana: 'ほっかいどうしんかんせん',
    kind: 'line',
    lines: ['shinkansen-hokkaido'],
    description: '新青森と 新函館北斗を むすぶ 新幹線。青函トンネルを とおって 本州から 北海道へ 行ける。',
  },
  {
    kanji: '上越新幹線',
    hiragana: 'じょうえつしんかんせん',
    kind: 'line',
    lines: ['shinkansen-joetsu'],
    description: '東京と 新潟を むすぶ 新幹線。谷川岳の 下の 長い トンネルを とおる。',
  },
  {
    kanji: '西九州新幹線',
    hiragana: 'にしきゅうしゅうしんかんせん',
    kind: 'line',
    lines: ['shinkansen-nishikyushu'],
    description: '武雄温泉と 長崎を むすぶ 新幹線。2022年に できた いちばん 新しい 新幹線。',
  },
];
