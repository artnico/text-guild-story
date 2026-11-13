// 1. トレハン用の修飾子（プレフィックス・称号）マスターデータ（全25種）
// mult: 装備の基礎ステータス(HP/MP/ATK/MATK/DEF/MDEF)にかかる倍率
// flat: 追加で加算される固定値ボーナス（控えめな数値でビルドの個性を出す）
const PREFIX_DATA = {
    // --- Tier 5: 神話・伝説級 (Mythic / Legendary) ---
    "神話の":   { rarity: 60, tier: 5, color: "#ff66ff", mult: 1.25, flat: { hp: 12, mp: 8, atk: 3, matk: 3, def: 2, mdef: 2, str: 2, int: 2, vit: 2, dex: 2, agi: 2, luc: 2, hit: 3, eva: 3, drop: 5 }, desc: "基礎性能+25%, 全能力+2, 泥率+5%" },
    "伝説の":   { rarity: 55, tier: 5, color: "#ffd700", mult: 1.18, flat: { hp: 8, mp: 5, atk: 2, matk: 2, def: 2, mdef: 2, str: 1, int: 1, vit: 1, dex: 1, agi: 1, luc: 2, drop: 3 }, desc: "基礎性能+18%, 全ステ+1, 泥率+3%" },

    // --- Tier 4: 特級・異端級 (Epic) ---
    "覇王の":   { rarity: 48, tier: 4, color: "#ff8844", mult: 1.14, flat: { atk: 3, str: 2, vit: 2 }, desc: "基礎性能+14%, ATK+3, STR+2, VIT+2" },
    "修羅の":   { rarity: 47, tier: 4, color: "#ff8844", mult: 1.10, flat: { atk: 4, skillExpBonus: 35, jlvExpBonus: 15 }, desc: "基礎性能+10%, 武器熟練度+35%, ATK+4, JLV経験値+15%" },
    "竜脈の":   { rarity: 46, tier: 4, color: "#ff8844", mult: 1.14, flat: { hp: 12, mp: 6, vit: 2, int: 2 }, desc: "基礎性能+14%, HP+12, MP+6, VIT/INT+2" },
    "強欲な":   { rarity: 44, tier: 4, color: "#ff8844", mult: 1.08, flat: { luc: 4, drop: 8 }, desc: "基礎性能+8%, LUC+4, 泥率+8%" },
    "名工の":   { rarity: 42, tier: 4, color: "#ff8844", mult: 1.14, flat: { atk: 2, matk: 2, def: 2, mdef: 2, hit: 3 }, desc: "基礎性能+14%, 攻防+2, 命中+3%" },
    "呪われた": { rarity: 40, tier: 4, color: "#cc66ff", mult: 1.22, flat: { hp: -15, atk: 4, matk: 4, def: -3 }, desc: "基礎性能+22%, ATK/MATK+4, HP-15, DEF-3" },

    // --- Tier 3: 希少級 (Rare) ---
    "求道者の": { rarity: 38, tier: 3, color: "#88ccff", mult: 1.05, flat: { jlvExpBonus: 25, skillExpBonus: 15 }, desc: "基礎性能+5%, JLV経験値+25%, 熟練度獲得量+15%" },
    "疾風の":   { rarity: 37, tier: 3, color: "#00ffcc", mult: 1.10, flat: { agi: 2, dex: 2, hit: 3, eva: 3 }, desc: "基礎性能+10%, AGI/DEX+2, 命中/回避+3%" },
    "叡智の":   { rarity: 36, tier: 3, color: "#00ffcc", mult: 1.10, flat: { mp: 6, matk: 2, int: 2 }, desc: "基礎性能+10%, MATK+2, INT+2, MP+6" },
    "鉄壁の":   { rarity: 35, tier: 3, color: "#00ffcc", mult: 1.10, flat: { hp: 8, def: 2, mdef: 2, vit: 2 }, desc: "基礎性能+10%, DEF/MDEF+2, VIT+2, HP+8" },
    "猛々しい": { rarity: 34, tier: 3, color: "#00ffcc", mult: 1.10, flat: { atk: 2, str: 2 }, desc: "基礎性能+10%, ATK+2, STR+2" },
    "探究の":   { rarity: 33, tier: 3, color: "#ffff88", mult: 1.05, flat: { drop: 5, skillExpBonus: 30 }, desc: "基礎性能+5%, 行動・採取熟練度+30%, 泥率+5%" },
    "光る":     { rarity: 32, tier: 3, color: "#00ffcc", mult: 1.08, flat: { luc: 3, drop: 4 }, desc: "基礎性能+8%, LUC+3, 泥率+4%" },
    "熟練の":   { rarity: 30, tier: 3, color: "#00ffcc", mult: 1.08, flat: { dex: 2, hit: 2 }, desc: "基礎性能+8%, DEX+2, 命中+2%" },

    // --- Tier 2: 良質級 (Uncommon) ---
    "幸運の":       { rarity: 26, tier: 2, color: "#88ff88", mult: 1.04, flat: { luc: 2, drop: 2 }, desc: "基礎性能+4%, LUC+2, 泥率+2%" },
    "しなやかな":   { rarity: 25, tier: 2, color: "#88ff88", mult: 1.05, flat: { dex: 1, agi: 1, eva: 2 }, desc: "基礎性能+5%, DEX/AGI+1, 回避+2%" },
    "魔力を帯びた": { rarity: 24, tier: 2, color: "#88ff88", mult: 1.06, flat: { mp: 4, matk: 1 }, desc: "基礎性能+6%, MATK+1, MP+4" },
    "頑丈な":       { rarity: 23, tier: 2, color: "#88ff88", mult: 1.06, flat: { hp: 5, def: 1 }, desc: "基礎性能+6%, HP+5, DEF+1" },
    "鋭い":         { rarity: 22, tier: 2, color: "#88ff88", mult: 1.06, flat: { atk: 1, hit: 1 }, desc: "基礎性能+6%, ATK+1, 命中+1%" },
    "上質な":       { rarity: 20, tier: 2, color: "#88ff88", mult: 1.05, flat: { hp: 4, atk: 1, def: 1 }, desc: "基礎性能+5%, HP+4, ATK/DEF+1" },

    // --- Tier 1: 一般級 (Common) ---
    "温かい": { rarity: 15, tier: 1, color: "#ddd", mult: 1.00, flat: { hp: 5, mp: 2 }, desc: "HP+5, MP+2" },
    "尖った": { rarity: 14, tier: 1, color: "#ddd", mult: 1.00, flat: { atk: 1, hit: 1 }, desc: "ATK+1, 命中+1%" },
    "硬い":   { rarity: 13, tier: 1, color: "#ddd", mult: 1.00, flat: { hp: 3, def: 1 }, desc: "DEF+1, HP+3" },
    "軽い":   { rarity: 12, tier: 1, color: "#ddd", mult: 1.00, flat: { agi: 1, eva: 1 }, desc: "AGI+1, 回避+1%" },
    "普通の": { rarity: 10, tier: 1, color: "#ccc", mult: 1.00, flat: {}, desc: "標準品質（補正なし）" },

    // --- Tier 0: 粗悪級 (Penalty) ---
    "湿った":     { rarity: 2, tier: 0, color: "#888", mult: 0.90, flat: { matk: -1, eva: -1 }, desc: "基礎性能-10%, MATK-1" },
    "錆びついた": { rarity: 1, tier: 0, color: "#888", mult: 0.90, flat: { atk: -1, def: -1 }, desc: "基礎性能-10%, ATK/DEF-1" },
    "ボロボロの": { rarity: 0, tier: 0, color: "#777", mult: 0.85, flat: { hp: -5, atk: -1 }, desc: "基礎性能-15%, HP-5" }
};

// トレハン用の称号（プレフィックス）リスト（文字数順で前方一致判定を安全に行う）
const prefixes = Object.keys(PREFIX_DATA).sort((a, b) => b.length - a.length);

// レアリティ（優先度）の定義
const prefixRarity = { "": -1 };
for (const [k, v] of Object.entries(PREFIX_DATA)) {
    prefixRarity[k] = v.rarity;
}

// アイテム名（例: "伝説のアイアンソード+5"）を { prefix, baseName, plus, cleanName } に分解するヘルパー
function parseItemName(itemName) {
    if (!itemName) return { prefix: "", baseName: "", plus: 0, cleanName: "" };
    let cleanName = String(itemName);
    let plus = 0;
    const plusMatch = cleanName.match(/\+(\d+)$/);
    if (plusMatch) {
        plus = parseInt(plusMatch[1], 10) || 0;
        cleanName = cleanName.slice(0, -plusMatch[0].length);
    }
    let prefix = "";
    let baseName = cleanName;
    for (const p of prefixes) {
        if (cleanName.startsWith(p)) {
            prefix = p;
            baseName = cleanName.substring(p.length);
            break;
        }
    }
    return { prefix, baseName, plus, cleanName };
}

function getPrefixInfo(itemName) {
    if (!itemName) return null;
    const { prefix } = parseItemName(itemName);
    if (prefix && PREFIX_DATA[prefix]) {
        return { prefix, ...PREFIX_DATA[prefix] };
    }
    return null;
}

function getPrefixRarity(itemName) {
    const info = getPrefixInfo(itemName);
    return info ? info.rarity : prefixRarity[""];
}

// 2. エリア・モンスター・ドロップテーブルのマスターデータ
// ※ 序盤ステージから順に熟練度・ジョブLv・基礎ステータスを鍛えて段階的に突破するバランスに再設計！
// ※ 各モンスターに 1%〜5% (0.01〜0.05) のレアドロップ(isRare: true)を設定
// ※ 各エリアに手動探索（集中探索・鉱脈イベント等）限定の採取素材(manualGather)を設定
const areas = {
    "area1": {
        name: "始まりの森 (推奨PLV:1〜)",
        town: "始まりの町",
        monsters: [
            { name: "野生のラッコ", hp: 35, atk: 8, def: 1, exp: 12, weight: 10, drops: [
                { item: "ラッコの毛皮", rate: 0.7 },
                { item: "黄金のラッコ毛", rate: 0.04, isRare: true }
            ] },
            { name: "スライム", hp: 25, atk: 6, def: 0, exp: 10, weight: 10, drops: [
                { item: "スライムゼリー", rate: 0.45 },
                { item: "スライムの核", rate: 0.15 },
                { item: "ロイヤルゼリー", rate: 0.05, isRare: true }
            ] },
            { name: "はぐれメタスライム", hp: 12, atk: 5, def: 30, exp: 180, eva: 65, weight: 1, drops: [
                { item: "スライムの核", rate: 1.0 },
                { item: "綺麗な石", rate: 0.5 },
                { item: "メタルスライムの雫", rate: 0.05, isRare: true }
            ] },
            { name: "キングスライム", hp: 180, atk: 18, def: 5, exp: 220, weight: 0.5, drops: [
                { item: "スライムゼリー", rate: 1.0 },
                { item: "王者の冠", rate: 0.25 },
                { item: "スライムエンペラーの核", rate: 0.03, isRare: true },
                { item: "虹色のスライム王冠核", rate: 0.004, isUltraRare: true }
            ] }
        ],
        boss: { name: "森の主ベア", hp: 320, atk: 26, def: 8, exp: 250, drops: [
            { item: "主の剛毛", rate: 1.0 },
            { item: "ラッコの毛皮", rate: 0.8 },
            { item: "森王の覇爪", rate: 0.05, isRare: true },
            { item: "始原のラッコ神像", rate: 0.005, isUltraRare: true }
        ] },
        gather: [{ item: "雑草", rate: 0.6 }, { item: "薬草", rate: 0.3 }, { item: "丈夫な枝", rate: 0.1 }],
        manualGather: [{ item: "世界樹の若葉", rate: 0.6 }, { item: "妖精の蜜", rate: 0.4 }]
    },
    "area2": {
        name: "忘れられた廃鉱 (推奨PLV:15〜)",
        town: "鉱山の町",
        monsters: [
            { name: "ゴブリン", hp: 220, atk: 42, def: 16, exp: 55, weight: 10, drops: [
                { item: "泥だらけの鉄鉱石", rate: 0.7 },
                { item: "ゴブリンの秘宝貨", rate: 0.04, isRare: true }
            ] },
            { name: "岩石スライム", hp: 290, atk: 36, def: 28, exp: 65, weight: 10, drops: [
                { item: "硬い石材", rate: 0.6 },
                { item: "星鉄の原石", rate: 0.03, isRare: true }
            ] },
            { name: "ゴールドゴーレム", hp: 520, atk: 58, def: 46, exp: 550, weight: 1, drops: [
                { item: "綺麗な石", rate: 1.0 },
                { item: "星の砂", rate: 0.15 },
                { item: "純金の歯車", rate: 0.05, isRare: true },
                { item: "黄金郷のエルドラドコア", rate: 0.004, isUltraRare: true }
            ] }
        ],
        boss: { name: "ロックゴーレム", hp: 1600, atk: 88, def: 45, exp: 950, drops: [
            { item: "ゴーレムの核", rate: 1.0 },
            { item: "泥だらけの鉄鉱石", rate: 0.8 },
            { item: "大地母神の心臓石", rate: 0.04, isRare: true },
            { item: "創世のオリハルコン原石", rate: 0.004, isUltraRare: true }
        ] },
        gather: [{ item: "小石", rate: 0.5 }, { item: "鉄くず", rate: 0.3 }, { item: "綺麗な石", rate: 0.2 }],
        manualGather: [{ item: "ミスリル銀鉱", rate: 0.6 }, { item: "古代の地底水晶", rate: 0.4 }]
    },
    "area3": {
        name: "霧深い沼地 (推奨PLV:35〜)",
        town: "魔導の町",
        monsters: [
            { name: "ウィッチベア", hp: 820, atk: 105, def: 48, exp: 210, weight: 10, drops: [
                { item: "魔力が宿る原木", rate: 0.55 },
                { item: "魔女の呪詛布", rate: 0.04, isRare: true }
            ] },
            { name: "毒沼クラゲ", hp: 680, atk: 115, def: 38, eva: 15, exp: 195, weight: 10, drops: [
                { item: "怪しい液体", rate: 0.6 },
                { item: "深淵クラゲの発光核", rate: 0.04, isRare: true }
            ] },
            { name: "ファントムウィッチ", hp: 1550, atk: 145, def: 68, eva: 24, exp: 1250, weight: 1, drops: [
                { item: "魔力が宿る原木", rate: 1.0 },
                { item: "魔女の呪詛布", rate: 0.12, isRare: true },
                { item: "深淵魔女の禁書ページ", rate: 0.004, isUltraRare: true }
            ] }
        ],
        boss: { name: "マッドハイドラ", hp: 5400, atk: 215, def: 95, eva: 14, exp: 2800, drops: [
            { item: "猛毒の触手", rate: 1.0 },
            { item: "魔力が宿る原木", rate: 0.8 },
            { item: "ハイドラの再生宝珠", rate: 0.03, isRare: true },
            { item: "九頭竜の心臓宝珠", rate: 0.004, isUltraRare: true }
        ] },
        gather: [{ item: "沼の泥", rate: 0.5 }, { item: "光るキノコ", rate: 0.3 }, { item: "魔力草", rate: 0.2 }],
        manualGather: [{ item: "月光蓮の花", rate: 0.6 }, { item: "マンドラゴラの根", rate: 0.4 }]
    },
    "area4": {
        name: "灼熱の溶岩洞 (推奨PLV:60〜)",
        town: "職人の開拓地",
        monsters: [
            { name: "ファイアサラマンダー", hp: 2500, atk: 245, def: 115, eva: 18, exp: 620, weight: 10, drops: [
                { item: "燃える皮膚", rate: 0.6 },
                { item: "紅蓮のトカゲ逆鱗", rate: 0.03, isRare: true }
            ] },
            { name: "マグマタートル", hp: 3400, atk: 220, def: 165, exp: 680, weight: 10, drops: [
                { item: "溶岩の甲羅", rate: 0.55 },
                { item: "万年溶岩の炉心", rate: 0.03, isRare: true }
            ] },
            { name: "エンシェントサラマンダー", hp: 6400, atk: 330, def: 195, eva: 22, exp: 3600, weight: 1, drops: [
                { item: "溶岩の甲羅", rate: 1.0 },
                { item: "万年溶岩の炉心", rate: 0.10, isRare: true },
                { item: "太陽神のフレアシェル", rate: 0.003, isUltraRare: true }
            ] }
        ],
        boss: { name: "インフェルノドレイク", hp: 18500, atk: 480, def: 220, eva: 20, exp: 8500, drops: [
            { item: "火竜の血", rate: 1.0 },
            { item: "究極の竜鱗", rate: 0.05, isRare: true },
            { item: "獄炎竜の逆鱗", rate: 0.02, isRare: true },
            { item: "原初竜のプロミネンスハート", rate: 0.003, isUltraRare: true }
        ] },
        gather: [{ item: "黒曜石", rate: 0.5 }, { item: "硫黄華", rate: 0.4 }, { item: "火の結晶", rate: 0.1 }],
        manualGather: [{ item: "緋色金", rate: 0.6 }, { item: "不死鳥の残り火", rate: 0.4 }]
    },
    "area5": {
        name: "古代の機械遺跡 (推奨PLV:90〜)",
        town: "スチームシティ",
        monsters: [
            { name: "スカウトドローン", hp: 7500, atk: 520, def: 250, eva: 26, exp: 1800, weight: 10, drops: [
                { item: "錆びた歯車", rate: 0.7 },
                { item: "電子基板", rate: 0.25 },
                { item: "超演算AIチップ", rate: 0.03, isRare: true }
            ] },
            { name: "プロトガード", hp: 10500, atk: 580, def: 330, exp: 2100, weight: 10, drops: [
                { item: "強化合金プレート", rate: 0.55 },
                { item: "永久機関のコイル", rate: 0.03, isRare: true }
            ] },
            { name: "メタルガーディアン", hp: 19500, atk: 740, def: 480, eva: 20, exp: 9500, weight: 1, drops: [
                { item: "強化合金プレート", rate: 1.0 },
                { item: "超合金シールド", rate: 0.15 },
                { item: "オリハルコン装甲板", rate: 0.04, isRare: true },
                { item: "次元機関のシンギュラリティ核", rate: 0.003, isUltraRare: true }
            ] }
        ],
        boss: { name: "大廃墟の管理者・オメガ", hp: 65000, atk: 1050, def: 480, eva: 28, exp: 28000, drops: [
            { item: "未知の動力源", rate: 1.0 },
            { item: "古代の魔導コア", rate: 0.03, isRare: true },
            { item: "オメガ・ドライブ", rate: 0.01, isRare: true },
            { item: "アカシック・レコード断片", rate: 0.003, isUltraRare: true }
        ] },
        gather: [{ item: "ネジくず", rate: 0.5 }, { item: "絶縁ワイヤー", rate: 0.3 }, { item: "魔導石の破片", rate: 0.2 }],
        manualGather: [{ item: "量子エーテル結晶", rate: 0.6 }, { item: "古代文明の設計図", rate: 0.4 }]
    },
    "area6": {
        name: "果てしなき天界塔 (推奨PLV:130〜)",
        town: "天空の聖域",
        monsters: [
            { name: "ガーゴイルウォリアー", hp: 24000, atk: 1120, def: 560, eva: 22, exp: 5500, weight: 10, drops: [
                { item: "聖なる石像の欠片", rate: 0.6 },
                { item: "神殿騎士の紋章石", rate: 0.03, isRare: true }
            ] },
            { name: "ホーリーエンジェル", hp: 20500, atk: 1260, def: 490, eva: 32, exp: 6000, weight: 10, drops: [
                { item: "光の羽", rate: 0.55 },
                { item: "天使の涙", rate: 0.15 },
                { item: "熾天使の黄金羽", rate: 0.02, isRare: true }
            ] },
            { name: "カオスセラフィム", hp: 48000, atk: 1620, def: 720, eva: 38, exp: 25000, weight: 1, drops: [
                { item: "至高の聖結晶", rate: 1.0 },
                { item: "カオスリング", rate: 0.15 },
                { item: "虚無の混沌核", rate: 0.02, isRare: true },
                { item: "虚空神のネビュラコード", rate: 0.002, isUltraRare: true }
            ] }
        ],
        boss: { name: "堕天王ルシファー", hp: 200000, atk: 2350, def: 980, eva: 38, exp: 95000, drops: [
            { item: "神光のオーラ", rate: 1.0 },
            { item: "魔王の絶剣", rate: 0.02, isRare: true },
            { item: "聖人の遺骨", rate: 0.01, isRare: true },
            { item: "創世の明け星", rate: 0.01, isRare: true },
            { item: "熾天魔王の創世翼", rate: 0.003, isUltraRare: true }
        ] },
        gather: [{ item: "天界のきよらかな水", rate: 0.4 }, { item: "星の砂", rate: 0.4 }, { item: "至高の聖結晶", rate: 0.2 }],
        manualGather: [{ item: "神樹の黄金果実", rate: 0.6 }, { item: "星界のアストラル鉱", rate: 0.4 }]
    },
    "area7": {
        name: "星屑の霊峰 (推奨PLV:175〜)",
        town: "星見の隠れ里",
        monsters: [
            { name: "スターウルフ", hp: 58000, atk: 2450, def: 1080, eva: 34, exp: 16500, weight: 10, drops: [
                { item: "星屑の銀毛皮", rate: 0.6 },
                { item: "天狼の蒼牙", rate: 0.03, isRare: true }
            ] },
            { name: "コズミックゴーレム", hp: 76000, atk: 2700, def: 1380, eva: 20, exp: 19000, weight: 10, drops: [
                { item: "隕星石の塊", rate: 0.55 },
                { item: "超重力コア", rate: 0.03, isRare: true }
            ] },
            { name: "アストラルフェニックス", hp: 135000, atk: 3400, def: 1550, eva: 42, exp: 78000, weight: 1, drops: [
                { item: "星屑の銀毛皮", rate: 1.0 },
                { item: "星鳥の煌めく尾羽", rate: 0.03, isRare: true },
                { item: "超新星のフェニックスハート", rate: 0.002, isUltraRare: true }
            ] }
        ],
        boss: { name: "星竜コスモバハムート", hp: 520000, atk: 4600, def: 1950, eva: 42, exp: 260000, drops: [
            { item: "星竜の煌鱗", rate: 1.0 },
            { item: "銀河の竜玉", rate: 0.02, isRare: true },
            { item: "星雲の逆鱗", rate: 0.015, isRare: true },
            { item: "創星竜のコスモジェネシス", rate: 0.002, isUltraRare: true }
        ] },
        gather: [{ item: "星屑の結晶", rate: 0.45 }, { item: "月光の雫", rate: 0.35 }, { item: "流星の欠片", rate: 0.2 }],
        manualGather: [{ item: "銀河のオリハルコン", rate: 0.6 }, { item: "星霊の秘薬草", rate: 0.4 }]
    },
    "area8": {
        name: "神々の黄昏・ヴァルハラ (推奨PLV:230〜)",
        town: "英霊の城塞",
        monsters: [
            { name: "エインヘリャル神兵", hp: 145000, atk: 4850, def: 2200, eva: 38, exp: 48000, weight: 10, drops: [
                { item: "英霊の神鉄片", rate: 0.6 },
                { item: "戦乙女の聖刻印", rate: 0.03, isRare: true }
            ] },
            { name: "フェンリル・ファング", hp: 128000, atk: 5300, def: 1980, eva: 46, exp: 52000, weight: 10, drops: [
                { item: "魔狼の凍牙", rate: 0.55 },
                { item: "神喰らいの呪鎖", rate: 0.03, isRare: true }
            ] },
            { name: "ニーズヘッグ・シャドウ", hp: 290000, atk: 6500, def: 2800, eva: 45, exp: 220000, weight: 1, drops: [
                { item: "英霊の神鉄片", rate: 1.0 },
                { item: "黒竜の絶望鱗", rate: 0.03, isRare: true },
                { item: "世界樹を蝕む終焉核", rate: 0.002, isUltraRare: true }
            ] }
        ],
        boss: { name: "最高神オーディン・オルタ", hp: 1350000, atk: 8800, def: 3800, eva: 48, exp: 750000, drops: [
            { item: "黄昏の神気", rate: 1.0 },
            { item: "大神の黄金ルーン", rate: 0.02, isRare: true },
            { item: "神槍グングニルの穂先", rate: 0.012, isRare: true },
            { item: "万象支配のヴァルハラ王冠", rate: 0.002, isUltraRare: true }
        ] },
        gather: [{ item: "ユグドラシルの樹皮", rate: 0.45 }, { item: "黄金の蜜露", rate: 0.35 }, { item: "神域の霊石", rate: 0.2 }],
        manualGather: [{ item: "神界のアダマンタイト", rate: 0.6 }, { item: "原初のルーン文字盤", rate: 0.4 }]
    }
};

// ====== 2.5 素材交換屋（ギルド交易カウンター）マスターデータ ======
// 修飾子ティアに応じた納品レート倍率（序盤のインフレを防ぎつつ高ティアの価値を実感できる段階倍率）
const EXCHANGE_TIER_MULTIPLIER = {
    0: 0.5,   // Tier 0 (粗悪: ボロボロの 等) -> 0.5倍（最低1Pt保証）
    none: 1.0,// 称号なし -> 1.0倍
    1: 1.2,   // Tier 1 (一般: 普通の・硬い 等) -> 1.2倍
    2: 2.0,   // Tier 2 (良質: 上質な・鋭い・幸運の 等) -> 2.0倍
    3: 4.0,   // Tier 3 (希少: 熟練の・光る・疾風の 等) -> 4.0倍
    4: 8.0,   // Tier 4 (特級: 呪われた・名工の・強欲な・竜脈の・覇王の) -> 8.0倍
    5: 15.0   // Tier 5 (伝説・神話: 伝説の・神話の) -> 15.0倍！
};

// 交換屋のラインナップ（前エリアのボス討伐による段階解放 ＆ 適正化された必要Ptレート）
const EXCHANGE_SHOP_ITEMS = [
    // --- 💍 エリア別・特殊効果つき交換屋限定アクセサリー ---
    { id: "ex_acc_area1", item: "森精ラッコの豊穣お守り", category: "accessory", isEquipment: true, area: "area1", ptCost: 250, desc: "【エリア1限定装飾品】HP+18/MP+12/DEF+2/MDEF+2/LUC+4/泥率+8%。固有効果【森精の豊穣：探索1歩ごとにHP・MP2%回復＆採取獲得数+1個】！" },
    { id: "ex_acc_area2", item: "ドワーフ王の黄金歯車", category: "accessory", isEquipment: true, area: "area2", reqBoss: "森の主ベア", ptCost: 750, desc: "【エリア2限定装飾品】HP+32/ATK+6/DEF+7/STR+3/VIT+3/DEX+3。固有効果【黄金採掘機関：戦闘勝利・採取時に交換Pt(+2〜16Pt)を自動発掘＆物理攻撃時敵DEF15%無視】！" },
    { id: "ex_acc_area3", item: "ハイドラの再生毒腺リング", category: "accessory", isEquipment: true, area: "area3", reqBoss: "ロックゴーレム", ptCost: 2000, desc: "【エリア3限定装飾品】HP+50/MP+20/ATK+8/MATK+10/DEF+6/MDEF+8/INT+4/VIT+4。固有効果【猛毒と再生：攻撃命中時に猛毒追撃(上限:自身ATK/MATKの1.2倍)＆毎ターンHP4%再生】！" },
    { id: "ex_acc_area4", item: "獄炎竜の逆鱗アミュレット", category: "accessory", isEquipment: true, area: "area4", reqBoss: "マッドハイドラ", ptCost: 5000, desc: "【エリア4限定装飾品】HP+75/ATK+15/MATK+12/DEF+12/STR+6/VIT+5/火耐性+25%。固有効果【紅蓮の逆鱗：被弾時に(ATK60%+DEF60%)の炎反撃＆強行突破の移動歩数+1歩】！" },
    { id: "ex_acc_area5", item: "オメガ・オーバークロッカー", category: "accessory", isEquipment: true, area: "area5", reqBoss: "インフェルノドレイク", ptCost: 12000, desc: "【エリア5限定装飾品】HP+85/MP+45/ATK+18/MATK+18/DEX+7/AGI+8/命中+8%/回避+6%。固有効果【超演算二連装：スキル発動率1.2倍＆攻撃時25%で威力40%の電撃追撃】！" },
    { id: "ex_acc_area6", item: "熾天魔王の双翼ヘイロー", category: "accessory", isEquipment: true, area: "area6", reqBoss: "大廃墟の管理者・オメガ", ptCost: 30000, desc: "【エリア6限定装飾品】HP+130/MP+70/ATK+24/MATK+24/DEF+20/MDEF+20/STR+7/INT+7/LUC+8/泥率+15%。固有効果【創世の双翼：獲得EXP＆全熟練度+20%・1戦闘につき1回だけ致死時にMP50%消費でHP35%蘇生】！" },
    { id: "ex_acc_area7", item: "星竜のコズミックリング", category: "accessory", isEquipment: true, area: "area7", reqBoss: "堕天王ルシファー", ptCost: 70000, desc: "【エリア7限定装飾品】HP+200/MP+110/ATK+38/MATK+38/DEF+30/MDEF+30/DEX+12/AGI+12/LUC+12/泥率+20%。固有効果【星辰の導き：会心率+15%・会心ダメージ+25%・攻撃時30%で(ATK+MATK)50%の流星追撃】！" },
    { id: "ex_acc_area8", item: "大神の全知ルーン紋章", category: "accessory", isEquipment: true, area: "area8", reqBoss: "星竜コスモバハムート", ptCost: 160000, desc: "【エリア8限定装飾品】HP+320/MP+180/ATK+60/MATK+60/DEF+48/MDEF+48/全ステ+15/泥率+30%。固有効果【万象ルーン：全与ダメージ1.2倍・被ダメージ15%軽減・毎ターンHP/MP5%回復】！" },

    // --- 🌟 各ステージのレアドロップ交換（周回の救済・狙い撃ち交換） ---
    // エリア1
    { id: "ex_rare_a1_1", item: "黄金のラッコ毛", category: "rare", area: "area1", ptCost: 80, desc: "【エリア1・レア泥】野生のラッコの希少ドロップ(4%)。" },
    { id: "ex_rare_a1_2", item: "ロイヤルゼリー", category: "rare", area: "area1", ptCost: 70, desc: "【エリア1・レア泥】スライムの希少ドロップ(5%)。" },
    { id: "ex_rare_a1_3", item: "メタルスライムの雫", category: "rare", area: "area1", ptCost: 100, desc: "【エリア1・レア泥】はぐれメタスライムの希少ドロップ(5%)。" },
    { id: "ex_rare_a1_4", item: "スライムエンペラーの核", category: "rare", area: "area1", ptCost: 120, desc: "【エリア1・レア泥】キングスライムの希少ドロップ(3%)。" },
    { id: "ex_rare_a1_5", item: "森王の覇爪", category: "rare", area: "area1", ptCost: 110, desc: "【エリア1・BOSSレア】森の主ベアの希少ドロップ(5%)。" },
    // エリア2
    { id: "ex_rare_a2_1", item: "ゴブリンの秘宝貨", category: "rare", area: "area2", reqBoss: "森の主ベア", ptCost: 220, desc: "【エリア2・レア泥】ゴブリンの希少ドロップ(4%)。" },
    { id: "ex_rare_a2_2", item: "星鉄の原石", category: "rare", area: "area2", reqBoss: "森の主ベア", ptCost: 240, desc: "【エリア2・レア泥】岩石スライムの希少ドロップ(3%)。" },
    { id: "ex_rare_a2_3", item: "純金の歯車", category: "rare", area: "area2", reqBoss: "森の主ベア", ptCost: 300, desc: "【エリア2・レア泥】ゴールドゴーレムの希少ドロップ(5%)。" },
    { id: "ex_rare_a2_4", item: "大地母神の心臓石", category: "rare", area: "area2", reqBoss: "森の主ベア", ptCost: 350, desc: "【エリア2・BOSSレア】ロックゴーレムの希少ドロップ(4%)。" },
    // エリア3
    { id: "ex_rare_a3_1", item: "魔女の呪詛布", category: "rare", area: "area3", reqBoss: "ロックゴーレム", ptCost: 600, desc: "【エリア3・レア泥】ウィッチベアの希少ドロップ(4%)。" },
    { id: "ex_rare_a3_2", item: "深淵クラゲの発光核", category: "rare", area: "area3", reqBoss: "ロックゴーレム", ptCost: 600, desc: "【エリア3・レア泥】毒沼クラゲの希少ドロップ(4%)。" },
    { id: "ex_rare_a3_3", item: "ハイドラの再生宝珠", category: "rare", area: "area3", reqBoss: "ロックゴーレム", ptCost: 850, desc: "【エリア3・BOSSレア】マッドハイドラの希少ドロップ(3%)。" },
    // エリア4
    { id: "ex_rare_a4_1", item: "紅蓮のトカゲ逆鱗", category: "rare", area: "area4", reqBoss: "マッドハイドラ", ptCost: 1500, desc: "【エリア4・レア泥】ファイアサラマンダーの希少ドロップ(3%)。" },
    { id: "ex_rare_a4_2", item: "万年溶岩の炉心", category: "rare", area: "area4", reqBoss: "マッドハイドラ", ptCost: 1600, desc: "【エリア4・レア泥】マグマタートルの希少ドロップ(3%)。" },
    { id: "ex_rare_a4_3", item: "究極の竜鱗", category: "rare", area: "area4", reqBoss: "マッドハイドラ", ptCost: 2000, desc: "【エリア4・BOSSレア】インフェルノドレイクの希少ドロップ(5%)。最上級職『竜騎士』解放条件！" },
    { id: "ex_rare_a4_4", item: "獄炎竜の逆鱗", category: "rare", area: "area4", reqBoss: "マッドハイドラ", ptCost: 2300, desc: "【エリア4・BOSSレア】インフェルノドレイクの希少ドロップ(2%)。" },
    // エリア5
    { id: "ex_rare_a5_1", item: "超演算AIチップ", category: "rare", area: "area5", reqBoss: "インフェルノドレイク", ptCost: 3800, desc: "【エリア5・レア泥】スカウトドローンの希少ドロップ(3%)。" },
    { id: "ex_rare_a5_2", item: "永久機関のコイル", category: "rare", area: "area5", reqBoss: "インフェルノドレイク", ptCost: 4000, desc: "【エリア5・レア泥】プロトガードの希少ドロップ(3%)。" },
    { id: "ex_rare_a5_3", item: "オリハルコン装甲板", category: "rare", area: "area5", reqBoss: "インフェルノドレイク", ptCost: 4600, desc: "【エリア5・レア泥】メタルガーディアンの希少ドロップ(4%)。" },
    { id: "ex_rare_a5_4", item: "古代の魔導コア", category: "rare", area: "area5", reqBoss: "インフェルノドレイク", ptCost: 5400, desc: "【エリア5・BOSSレア】オメガの希少ドロップ(3%)。最上級職『魔導機工師』解放条件！" },
    { id: "ex_rare_a5_5", item: "オメガ・ドライブ", category: "rare", area: "area5", reqBoss: "インフェルノドレイク", ptCost: 6200, desc: "【エリア5・BOSSレア】オメガの希少ドロップ(1%)。" },
    // エリア6
    { id: "ex_rare_a6_1", item: "神殿騎士の紋章石", category: "rare", area: "area6", reqBoss: "大廃墟の管理者・オメガ", ptCost: 9500, desc: "【エリア6・レア泥】ガーゴイルウォリアーの希少ドロップ(3%)。" },
    { id: "ex_rare_a6_2", item: "熾天使の黄金羽", category: "rare", area: "area6", reqBoss: "大廃墟の管理者・オメガ", ptCost: 11000, desc: "【エリア6・レア泥】ホーリーエンジェルの希少ドロップ(2%)。" },
    { id: "ex_rare_a6_3", item: "虚無の混沌核", category: "rare", area: "area6", reqBoss: "大廃墟の管理者・オメガ", ptCost: 13000, desc: "【エリア6・レア泥】カオスセラフィムの希少ドロップ(2%)。" },
    { id: "ex_rare_a6_4", item: "聖人の遺骨", category: "rare", area: "area6", reqBoss: "大廃墟の管理者・オメガ", ptCost: 15000, desc: "【エリア6・BOSSレア】ルシファーの希少ドロップ(1%)。最上級職『神聖至高職』解放条件！" },
    { id: "ex_rare_a6_5", item: "創世の明け星", category: "rare", area: "area6", reqBoss: "大廃墟の管理者・オメガ", ptCost: 16500, desc: "【エリア6・BOSSレア】ルシファーの希少ドロップ(1%)。" },
    // エリア7
    { id: "ex_rare_a7_1", item: "天狼の蒼牙", category: "rare", area: "area7", reqBoss: "堕天王ルシファー", ptCost: 22000, desc: "【エリア7・レア泥】スターウルフの希少ドロップ(3%)。" },
    { id: "ex_rare_a7_2", item: "超重力コア", category: "rare", area: "area7", reqBoss: "堕天王ルシファー", ptCost: 24000, desc: "【エリア7・レア泥】コズミックゴーレムの希少ドロップ(3%)。" },
    { id: "ex_rare_a7_3", item: "星鳥の煌めく尾羽", category: "rare", area: "area7", reqBoss: "堕天王ルシファー", ptCost: 28000, desc: "【エリア7・レア泥】アストラルフェニックスの希少ドロップ(3%)。" },
    { id: "ex_rare_a7_4", item: "銀河の竜玉", category: "rare", area: "area7", reqBoss: "堕天王ルシファー", ptCost: 34000, desc: "【エリア7・BOSSレア】星竜コスモバハムートの希少ドロップ(2%)。" },
    { id: "ex_rare_a7_5", item: "星雲の逆鱗", category: "rare", area: "area7", reqBoss: "堕天王ルシファー", ptCost: 38000, desc: "【エリア7・BOSSレア】星竜コスモバハムートの希少ドロップ(1.5%)。" },
    // エリア8
    { id: "ex_rare_a8_1", item: "戦乙女の聖刻印", category: "rare", area: "area8", reqBoss: "星竜コスモバハムート", ptCost: 52000, desc: "【エリア8・レア泥】エインヘリャル神兵の希少ドロップ(3%)。" },
    { id: "ex_rare_a8_2", item: "神喰らいの呪鎖", category: "rare", area: "area8", reqBoss: "星竜コスモバハムート", ptCost: 55000, desc: "【エリア8・レア泥】フェンリル・ファングの希少ドロップ(3%)。" },
    { id: "ex_rare_a8_3", item: "黒竜の絶望鱗", category: "rare", area: "area8", reqBoss: "星竜コスモバハムート", ptCost: 65000, desc: "【エリア8・レア泥】ニーズヘッグ・シャドウの希少ドロップ(3%)。" },
    { id: "ex_rare_a8_4", item: "大神の黄金ルーン", category: "rare", area: "area8", reqBoss: "星竜コスモバハムート", ptCost: 80000, desc: "【エリア8・BOSSレア】最高神オーディン・オルタの希少ドロップ(2%)。" },
    { id: "ex_rare_a8_5", item: "神槍グングニルの穂先", category: "rare", area: "area8", reqBoss: "星竜コスモバハムート", ptCost: 90000, desc: "【エリア8・BOSSレア】最高神オーディン・オルタの希少ドロップ(1.2%)。" }
];

// ====== ここからクラフト＆装備データ ======

// 3. クラフトレシピのデータ
// ※ 上位ステージの装備を作るには「前ステージのレアドロップ（1%〜5%）や手動採取素材」が要求される段階的ツリー構造！
// origin: "normal" (通常＋前段レア素材), "rare" (当エリアレアドロップ限定), "manual" (手動採取限定)
const RECIPES = {
    // ==========================================
    // ■ エリア1：始まりの森
    // ==========================================
    racco_hood: {
        name: "ラッコのフード",
        category: "sewing", area: "area1", origin: "normal",
        cost: { "ラッコの毛皮": 4, "スライムの核": 1 },
        result: "racco_hood"
    },
    leather_gloves: {
        name: "ラッコの手袋",
        category: "sewing", area: "area1", origin: "normal",
        cost: { "ラッコの毛皮": 3, "丈夫な枝": 2 },
        result: "leather_gloves"
    },
    wooden_staff: {
        name: "木の杖",
        category: "handicraft", area: "area1", origin: "normal",
        cost: { "丈夫な枝": 5, "スライムの核": 1 },
        result: "wooden_staff"
    },
    slime_shield: {
        name: "スライムバックラー",
        category: "handicraft", area: "area1", origin: "normal",
        cost: { "スライムゼリー": 5, "丈夫な枝": 2 },
        result: "slime_shield"
    },
    bear_armor: {
        name: "森主の剛毛鎧",
        category: "sewing", area: "area1", origin: "normal",
        cost: { "主の剛毛": 2, "ラッコの毛皮": 5, "ロイヤルゼリー": 1 },
        result: "bear_armor"
    },
    slime_core_ring: {
        name: "スライム核の指輪",
        category: "handicraft", area: "area1", origin: "normal",
        cost: { "スライムの核": 3, "ロイヤルゼリー": 1 },
        result: "slime_core_ring"
    },
    herb_soup: {
        name: "特製薬草スープ",
        category: "cooking", area: "area1", origin: "normal",
        cost: { "雑草": 3, "薬草": 2 },
        result: "herb_soup"
    },
    training_omelet: {
        name: "修練の特製オムレツ",
        category: "cooking", area: "area1", origin: "normal",
        cost: { "雑草": 3, "薬草": 2, "ラッコの毛皮": 2 },
        result: "training_omelet"
    },
    master_aurora_elixir: {
        name: "達人の極光秘薬",
        category: "cooking", area: "area3", origin: "normal",
        cost: { "怪しい液体": 4, "魔力が宿る原木": 3, "清らかな湧水": 2 },
        result: "master_aurora_elixir"
    },
    awakening_ambrosia: {
        name: "覚醒の神酒アムブロシア",
        category: "cooking", area: "area5", origin: "normal",
        cost: { "古代の魔導コア": 1, "怪しい液体": 5, "世界樹の若葉": 3 },
        result: "awakening_ambrosia"
    },
    // --- エリア1：レアドロップ＆手動採取限定 ---
    golden_racco_coat: {
        name: "黄金ラッコの王衣",
        category: "sewing", area: "area1", origin: "rare",
        cost: { "黄金のラッコ毛": 1, "主の剛毛": 2, "ラッコの毛皮": 6 },
        result: "golden_racco_coat"
    },
    forest_king_axe: {
        name: "森王の覇断斧",
        category: "blacksmith", area: "area1", origin: "rare",
        cost: { "森王の覇爪": 1, "主の剛毛": 3, "丈夫な枝": 4 },
        result: "forest_king_axe"
    },
    emperor_slime_ring: {
        name: "スライムエンペラーの指輪",
        category: "handicraft", area: "area1", origin: "rare",
        cost: { "スライムエンペラーの核": 1, "メタルスライムの雫": 1, "スライムの核": 3 },
        result: "emperor_slime_ring"
    },
    world_tree_staff: {
        name: "世界樹の若枝杖",
        category: "handicraft", area: "area1", origin: "manual",
        cost: { "世界樹の若葉": 2, "ロイヤルゼリー": 1, "丈夫な枝": 4 },
        result: "world_tree_staff"
    },
    leaf_amulet: {
        name: "若葉の風お守り",
        category: "handicraft", area: "area1", origin: "manual",
        cost: { "世界樹の若葉": 2, "妖精の蜜": 1, "黄金のラッコ毛": 1 },
        result: "leaf_amulet"
    },
    fairy_nectar: {
        name: "妖精の蜜酒",
        category: "cooking", area: "area1", origin: "manual",
        cost: { "妖精の蜜": 1, "ロイヤルゼリー": 1, "薬草": 2 },
        result: "fairy_nectar"
    },

    // ==========================================
    // ■ エリア2：忘れられた廃鉱（※エリア1のレア泥が必要！）
    // ==========================================
    iron_sword: {
        name: "アイアンソード",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "泥だらけの鉄鉱石": 5, "森王の覇爪": 1 },
        result: "iron_sword"
    },
    iron_spear: {
        name: "アイアンスピア",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "泥だらけの鉄鉱石": 5, "小石": 5, "ロイヤルゼリー": 1 },
        result: "iron_spear"
    },
    stone_shield: {
        name: "ストーンシールド",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "硬い石材": 5, "黄金のラッコ毛": 1 },
        result: "stone_shield"
    },
    stone_helm: {
        name: "ロックヘルム",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "硬い石材": 4, "鉄くず": 4, "ロイヤルゼリー": 1 },
        result: "stone_helm"
    },
    iron_gauntlet: {
        name: "アイアン籠手",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "泥だらけの鉄鉱石": 4, "硬い石材": 3, "黄金のラッコ毛": 1 },
        result: "iron_gauntlet"
    },
    golem_mail: {
        name: "ゴーレムプレート",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "ゴーレムの核": 2, "硬い石材": 6, "メタルスライムの雫": 1 },
        result: "golem_mail"
    },
    // --- エリア2：レアドロップ＆手動採取限定 ---
    star_iron_blade: {
        name: "星鉄の閃光剣",
        category: "blacksmith", area: "area2", origin: "rare",
        cost: { "星鉄の原石": 1, "森王の覇爪": 1, "泥だらけの鉄鉱石": 6 },
        result: "star_iron_blade"
    },
    gaia_shield: {
        name: "大地母神の重盾",
        category: "blacksmith", area: "area2", origin: "rare",
        cost: { "大地母神の心臓石": 1, "スライムエンペラーの核": 1, "ゴーレムの核": 3 },
        result: "gaia_shield"
    },
    goblin_crown_ring: {
        name: "強欲ゴブリンの金貨輪",
        category: "handicraft", area: "area2", origin: "rare",
        cost: { "ゴブリンの秘宝貨": 1, "純金の歯車": 1, "黄金のラッコ毛": 1 },
        result: "goblin_crown_ring"
    },
    mithril_rapier: {
        name: "ミスリルレイピア",
        category: "blacksmith", area: "area2", origin: "manual",
        cost: { "ミスリル銀鉱": 2, "世界樹の若葉": 1, "綺麗な石": 4 },
        result: "mithril_rapier"
    },
    mithril_gloves: {
        name: "ミスリルガントレット",
        category: "blacksmith", area: "area2", origin: "manual",
        cost: { "ミスリル銀鉱": 2, "ゴブリンの秘宝貨": 1, "鉄くず": 4 },
        result: "mithril_gloves"
    },
    crystal_pendant: {
        name: "地底水晶のペンダント",
        category: "handicraft", area: "area2", origin: "manual",
        cost: { "古代の地底水晶": 2, "妖精の蜜": 1, "綺麗な石": 3 },
        result: "crystal_pendant"
    },

    // ==========================================
    // ■ エリア3：霧深い沼地（※エリア2のレア泥が必要！）
    // ==========================================
    swamp_bow: {
        name: "スワンプボウ",
        category: "handicraft", area: "area3", origin: "normal",
        cost: { "魔力が宿る原木": 5, "怪しい液体": 3, "ゴブリンの秘宝貨": 1 },
        result: "swamp_bow"
    },
    hydra_lance: {
        name: "ハイドラヴェノムランス",
        category: "blacksmith", area: "area3", origin: "normal",
        cost: { "猛毒の触手": 2, "魔力が宿る原木": 5, "星鉄の原石": 1 },
        result: "hydra_lance"
    },
    mud_armor: {
        name: "マッドチェインメイル",
        category: "blacksmith", area: "area3", origin: "normal",
        cost: { "泥だらけの鉄鉱石": 5, "沼の泥": 6, "大地母神の心臓石": 1 },
        result: "mud_armor"
    },
    magic_robe: {
        name: "魔導師のローブ",
        category: "sewing", area: "area3", origin: "normal",
        cost: { "魔力が宿る原木": 4, "魔力草": 5, "古代の地底水晶": 1 },
        result: "magic_robe"
    },
    hunter_boots: {
        name: "ハンターブーツ",
        category: "sewing", area: "area3", origin: "normal",
        cost: { "ラッコの毛皮": 4, "沼の泥": 4, "ゴブリンの秘宝貨": 1 },
        result: "hunter_boots"
    },
    shroom_powder: {
        name: "怪しい幻覚粉",
        category: "cooking", area: "area3", origin: "normal",
        cost: { "光るキノコ": 4, "怪しい液体": 3, "純金の歯車": 1 },
        result: "shroom_powder"
    },
    swamp_stew: {
        name: "沼地キノコの魔力シチュー",
        category: "cooking", area: "area3", origin: "normal",
        cost: { "光るキノコ": 3, "魔力草": 2 },
        result: "swamp_stew"
    },
    // --- エリア3：レアドロップ＆手動採取限定 ---
    witch_curse_hat: {
        name: "深淵魔女の三角帽",
        category: "sewing", area: "area3", origin: "rare",
        cost: { "魔女の呪詛布": 1, "古代の地底水晶": 1, "魔力草": 5 },
        result: "witch_curse_hat"
    },
    jelly_lantern: {
        name: "深淵クラゲの魔導灯",
        category: "handicraft", area: "area3", origin: "rare",
        cost: { "深淵クラゲの発光核": 1, "純金の歯車": 1, "怪しい液体": 5 },
        result: "jelly_lantern"
    },
    hydra_orb_ring: {
        name: "ハイドラの不死宝珠",
        category: "handicraft", area: "area3", origin: "rare",
        cost: { "ハイドラの再生宝珠": 1, "大地母神の心臓石": 1, "猛毒の触手": 3 },
        result: "hydra_orb_ring"
    },
    moonlight_bow: {
        name: "月光蓮の霊弓",
        category: "handicraft", area: "area3", origin: "manual",
        cost: { "月光蓮の花": 2, "ミスリル銀鉱": 1, "魔力が宿る原木": 5 },
        result: "moonlight_bow"
    },
    mandragora_elixir: {
        name: "マンドラゴラ絶叫薬",
        category: "cooking", area: "area3", origin: "manual",
        cost: { "マンドラゴラの根": 2, "怪しい液体": 3 },
        result: "mandragora_elixir"
    },

    // ==========================================
    // ■ エリア4：灼熱の溶岩洞（※エリア3のレア泥が必要！）
    // ==========================================
    obsidian_axe: {
        name: "黒曜石のバトルアクス",
        category: "blacksmith", area: "area4", origin: "normal",
        cost: { "黒曜石": 6, "魔力が宿る原木": 4, "深淵クラゲの発光核": 1 },
        result: "obsidian_axe"
    },
    dragon_blood_sword: {
        name: "竜血の大剣",
        category: "blacksmith", area: "area4", origin: "normal",
        cost: { "火竜の血": 2, "黒曜石": 6, "ハイドラの再生宝珠": 1 },
        result: "dragon_blood_sword"
    },
    fire_grimoire: {
        name: "炎の魔術書",
        category: "sewing", area: "area4", origin: "normal",
        cost: { "燃える皮膚": 4, "魔力が宿る原木": 3, "魔女の呪詛布": 1 },
        result: "fire_grimoire"
    },
    magma_shield: {
        name: "マグマシールド",
        category: "blacksmith", area: "area4", origin: "normal",
        cost: { "溶岩の甲羅": 4, "火の結晶": 2, "ハイドラの再生宝珠": 1 },
        result: "magma_shield"
    },
    fireproof_cloak: {
        name: "耐火の外套",
        category: "sewing", area: "area4", origin: "normal",
        cost: { "燃える皮膚": 5, "硫黄華": 3, "魔女の呪詛布": 1 },
        result: "fireproof_cloak"
    },
    lava_greaves: {
        name: "マグマグリーヴ",
        category: "blacksmith", area: "area4", origin: "normal",
        cost: { "溶岩の甲羅": 4, "黒曜石": 4, "深淵クラゲの発光核": 1 },
        result: "lava_greaves"
    },
    fire_ring: {
        name: "炎のルビーリング",
        category: "handicraft", area: "area4", origin: "normal",
        cost: { "綺麗な石": 3, "火の結晶": 2, "月光蓮の花": 1 },
        result: "fire_ring"
    },
    // --- エリア4：レアドロップ＆手動採取限定 ---
    salamander_gloves: {
        name: "紅蓮逆鱗の籠手",
        category: "blacksmith", area: "area4", origin: "rare",
        cost: { "紅蓮のトカゲ逆鱗": 1, "魔女の呪詛布": 1, "燃える皮膚": 5 },
        result: "salamander_gloves"
    },
    magma_core_armor: {
        name: "万年炉心の重装鎧",
        category: "blacksmith", area: "area4", origin: "rare",
        cost: { "万年溶岩の炉心": 1, "ハイドラの再生宝珠": 1, "溶岩の甲羅": 5 },
        result: "magma_core_armor"
    },
    inferno_halberd: {
        name: "獄炎竜のハルバード",
        category: "blacksmith", area: "area4", origin: "rare",
        cost: { "獄炎竜の逆鱗": 1, "究極の竜鱗": 1, "ハイドラの再生宝珠": 1, "火竜の血": 3 },
        result: "inferno_halberd"
    },
    hihiirokane_katana: {
        name: "緋色金の太刀",
        category: "blacksmith", area: "area4", origin: "manual",
        cost: { "緋色金": 2, "紅蓮のトカゲ逆鱗": 1, "火の結晶": 3 },
        result: "hihiirokane_katana"
    },
    phoenix_mantle: {
        name: "不死鳥の焔外套",
        category: "sewing", area: "area4", origin: "manual",
        cost: { "不死鳥の残り火": 2, "万年溶岩の炉心": 1, "燃える皮膚": 4 },
        result: "phoenix_mantle"
    },

    // ==========================================
    // ■ エリア5：古代の機械遺跡（※エリア4のレア泥が必要！）
    // ==========================================
    steam_rifle: {
        name: "スチームライフル",
        category: "handicraft", area: "area5", origin: "normal",
        cost: { "錆びた歯車": 8, "電子基板": 3, "紅蓮のトカゲ逆鱗": 1 },
        result: "steam_rifle"
    },
    omega_cannon: {
        name: "オメガ・バスター砲",
        category: "handicraft", area: "area5", origin: "normal",
        cost: { "未知の動力源": 2, "強化合金プレート": 6, "究極の竜鱗": 1 },
        result: "omega_cannon"
    },
    alloy_armor: {
        name: "ハイパー合金アーマー",
        category: "blacksmith", area: "area5", origin: "normal",
        cost: { "強化合金プレート": 5, "ネジくず": 8, "万年溶岩の炉心": 1 },
        result: "alloy_armor"
    },
    cyber_arm: {
        name: "パワードアーム",
        category: "blacksmith", area: "area5", origin: "normal",
        cost: { "強化合金プレート": 4, "絶縁ワイヤー": 4, "紅蓮のトカゲ逆鱗": 1 },
        result: "cyber_arm"
    },
    steam_boots: {
        name: "スチームグリーヴ",
        category: "blacksmith", area: "area5", origin: "normal",
        cost: { "錆びた歯車": 5, "強化合金プレート": 3, "不死鳥の残り火": 1 },
        result: "steam_boots"
    },
    magitech_goggles: {
        name: "魔導探知ゴーグル",
        category: "handicraft", area: "area5", origin: "normal",
        cost: { "電子基板": 3, "絶縁ワイヤー": 5, "緋色金": 1 },
        result: "magitech_goggles"
    },
    // --- エリア5：レアドロップ＆手動採取限定 ---
    ai_visor: {
        name: "超演算タクティカルバイザー",
        category: "handicraft", area: "area5", origin: "rare",
        cost: { "超演算AIチップ": 1, "紅蓮のトカゲ逆鱗": 1, "電子基板": 4 },
        result: "ai_visor"
    },
    orichalcum_aegis: {
        name: "オリハルコン・イージス",
        category: "blacksmith", area: "area5", origin: "rare",
        cost: { "オリハルコン装甲板": 1, "永久機関のコイル": 1, "万年溶岩の炉心": 1 },
        result: "orichalcum_aegis"
    },
    omega_drive_core: {
        name: "機神のオメガドライブ",
        category: "handicraft", area: "area5", origin: "rare",
        cost: { "オメガ・ドライブ": 1, "古代の魔導コア": 1, "獄炎竜の逆鱗": 1 },
        result: "omega_drive_core"
    },
    quantum_rifle: {
        name: "量子エーテル狙撃銃",
        category: "handicraft", area: "area5", origin: "manual",
        cost: { "量子エーテル結晶": 2, "古代文明の設計図": 1, "超演算AIチップ": 1 },
        result: "quantum_rifle"
    },
    ether_boots: {
        name: "量子ホバーブーツ",
        category: "blacksmith", area: "area5", origin: "manual",
        cost: { "量子エーテル結晶": 2, "永久機関のコイル": 1, "強化合金プレート": 3 },
        result: "ether_boots"
    },

    // ==========================================
    // ■ エリア6：果てしなき天界塔（※エリア5のレア泥が必要！）
    // ==========================================
    holy_lance: {
        name: "ホーリーランス",
        category: "blacksmith", area: "area6", origin: "normal",
        cost: { "聖なる石像の欠片": 5, "至高の聖結晶": 1, "オリハルコン装甲板": 1 },
        result: "holy_lance"
    },
    aura_blade: {
        name: "神光の聖剣",
        category: "blacksmith", area: "area6", origin: "normal",
        cost: { "神光のオーラ": 2, "聖なる石像の欠片": 6, "古代の魔導コア": 1 },
        result: "aura_blade"
    },
    angel_halo: {
        name: "エンジェルヘイロー",
        category: "handicraft", area: "area6", origin: "normal",
        cost: { "光の羽": 5, "天使の涙": 2, "超演算AIチップ": 1 },
        result: "angel_halo"
    },
    archangel_robe: {
        name: "大天使のローブ",
        category: "sewing", area: "area6", origin: "normal",
        cost: { "光の羽": 6, "天使の涙": 2, "永久機関のコイル": 1 },
        result: "archangel_robe"
    },
    seraph_wings: {
        name: "熾天使の羽靴",
        category: "sewing", area: "area6", origin: "normal",
        cost: { "光の羽": 4, "星の砂": 5, "量子エーテル結晶": 1 },
        result: "seraph_wings"
    },
    celestial_talisman: {
        name: "天界の至宝タリスマン",
        category: "handicraft", area: "area6", origin: "normal",
        cost: { "星の砂": 8, "至高の聖結晶": 2, "古代の魔導コア": 1 },
        result: "celestial_talisman"
    },
    herbal_potion: {
        name: "上級薬草ポーション",
        category: "cooking", area: "area6", origin: "normal",
        cost: { "薬草": 5, "天界のきよらかな水": 1 },
        result: "herbal_potion"
    },
    elixir: {
        name: "至高の秘薬エリクサー",
        category: "cooking", area: "area6", origin: "normal",
        cost: { "天界のきよらかな水": 3, "天使の涙": 2, "魔力草": 5 },
        result: "elixir"
    },
    // --- エリア6：レアドロップ＆手動採取限定 ---
    seraphim_gold_wings: {
        name: "熾天使の黄金翼衣",
        category: "sewing", area: "area6", origin: "rare",
        cost: { "熾天使の黄金羽": 1, "神殿騎士の紋章石": 1, "オリハルコン装甲板": 1, "光の羽": 6 },
        result: "seraphim_gold_wings"
    },
    void_chaos_gauntlet: {
        name: "虚無と混沌の魔手",
        category: "blacksmith", area: "area6", origin: "rare",
        cost: { "虚無の混沌核": 1, "オメガ・ドライブ": 1, "至高の聖結晶": 3 },
        result: "void_chaos_gauntlet"
    },
    genesis_morning_star: {
        name: "創世の明星杖・ルシフェル",
        category: "handicraft", area: "area6", origin: "rare",
        cost: { "創世の明け星": 1, "聖人の遺骨": 1, "オメガ・ドライブ": 1, "神光のオーラ": 3 },
        result: "genesis_morning_star"
    },
    astral_spear: {
        name: "星界槍アストラルロンギヌス",
        category: "blacksmith", area: "area6", origin: "manual",
        cost: { "星界のアストラル鉱": 2, "神殿騎士の紋章石": 1, "至高の聖結晶": 2 },
        result: "astral_spear"
    },
    god_tree_ambrosia: {
        name: "神樹の黄金アムブロシア",
        category: "cooking", area: "area6", origin: "manual",
        cost: { "神樹の黄金果実": 2, "熾天使の黄金羽": 1, "天界のきよらかな水": 3 },
        result: "god_tree_ambrosia"
    },

    // ==========================================
    // ■ エリア7：星屑の霊峰（前段エリア6レア＆手動素材を要求）
    // ==========================================
    starlight_fang_blade: {
        name: "星狼牙の流星剣",
        category: "blacksmith", area: "area7", origin: "normal",
        cost: { "星屑の銀毛皮": 6, "流星の欠片": 4, "神殿騎士の紋章石": 1 },
        result: "starlight_fang_blade"
    },
    cosmic_gravity_axe: {
        name: "星砕きの重装斧",
        category: "blacksmith", area: "area7", origin: "normal",
        cost: { "隕星石の塊": 6, "星屑の結晶": 4, "熾天使の黄金羽": 1 },
        result: "cosmic_gravity_axe"
    },
    stardust_silver_armor: {
        name: "星屑銀の輝装鎧",
        category: "sewing", area: "area7", origin: "normal",
        cost: { "星屑の銀毛皮": 7, "月光の雫": 4, "星界のアストラル鉱": 1 },
        result: "stardust_silver_armor"
    },
    meteor_aegis_shield: {
        name: "メテオライト・シールド",
        category: "blacksmith", area: "area7", origin: "normal",
        cost: { "隕星石の塊": 6, "星竜の煌鱗": 2, "虚無の混沌核": 1 },
        result: "meteor_aegis_shield"
    },
    cosmic_dragon_staff: {
        name: "星竜のギャラクシーロッド",
        category: "handicraft", area: "area7", origin: "rare",
        cost: { "銀河の竜玉": 1, "天狼の蒼牙": 1, "創世の明け星": 1, "星竜の煌鱗": 3 },
        result: "cosmic_dragon_staff"
    },
    nebula_scale_plate: {
        name: "星雲竜の逆鱗神鎧",
        category: "blacksmith", area: "area7", origin: "rare",
        cost: { "星雲の逆鱗": 1, "超重力コア": 1, "聖人の遺骨": 1, "星竜の煌鱗": 3 },
        result: "nebula_scale_plate"
    },
    galactic_orichalcum_bow: {
        name: "銀河オリハルコンの星弓",
        category: "handicraft", area: "area7", origin: "manual",
        cost: { "銀河のオリハルコン": 2, "星鳥の煌めく尾羽": 1, "流星の欠片": 4 },
        result: "galactic_orichalcum_bow"
    },
    astral_spirit_nectar: {
        name: "星霊の銀河神酒",
        category: "cooking", area: "area7", origin: "manual",
        cost: { "星霊の秘薬草": 2, "月光の雫": 4, "天狼の蒼牙": 1 },
        result: "astral_spirit_nectar"
    },

    // ==========================================
    // ■ エリア8：神々の黄昏・ヴァルハラ（前段エリア7レア＆手動素材を要求）
    // ==========================================
    einherjar_valkyrie_spear: {
        name: "英霊槍ヴァルキュリア",
        category: "blacksmith", area: "area8", origin: "normal",
        cost: { "英霊の神鉄片": 7, "神域の霊石": 4, "天狼の蒼牙": 1 },
        result: "einherjar_valkyrie_spear"
    },
    fenrir_frost_gauntlet: {
        name: "魔狼フェンリルの凍牙篭手",
        category: "blacksmith", area: "area8", origin: "normal",
        cost: { "魔狼の凍牙": 7, "ユグドラシルの樹皮": 4, "超重力コア": 1 },
        result: "fenrir_frost_gauntlet"
    },
    valhalla_einherjar_mail: {
        name: "ヴァルハラ神鉄の煌鎧",
        category: "blacksmith", area: "area8", origin: "normal",
        cost: { "英霊の神鉄片": 8, "黄昏の神気": 2, "銀河のオリハルコン": 1 },
        result: "valhalla_einherjar_mail"
    },
    gungnir_divine_lance: {
        name: "大神槍グングニル",
        category: "blacksmith", area: "area8", origin: "rare",
        cost: { "神槍グングニルの穂先": 1, "大神の黄金ルーン": 1, "星雲の逆鱗": 1, "黄昏の神気": 3 },
        result: "gungnir_divine_lance"
    },
    nidhogg_despair_robe: {
        name: "黒竜ニーズヘッグの絶望外套",
        category: "sewing", area: "area8", origin: "rare",
        cost: { "黒竜の絶望鱗": 1, "神喰らいの呪鎖": 1, "銀河の竜玉": 1, "黄昏の神気": 3 },
        result: "nidhogg_despair_robe"
    },
    adamantite_god_sword: {
        name: "神界アダマンタイトの覇剣",
        category: "blacksmith", area: "area8", origin: "manual",
        cost: { "神界のアダマンタイト": 2, "戦乙女の聖刻印": 1, "英霊の神鉄片": 5 },
        result: "adamantite_god_sword"
    },
    yggdrasil_golden_mead: {
        name: "ヴァルハラ黄金蜜酒・改",
        category: "cooking", area: "area8", origin: "manual",
        cost: { "原初のルーン文字盤": 2, "黄金の蜜露": 4, "大神の黄金ルーン": 1 },
        result: "yggdrasil_golden_mead"
    },

    // ==========================================
    // ■ 🌟🔍 エリア複合・秘伝レシピ (手動採取 ＋ レアドロップ)
    // ==========================================
    amber_spirit_bow: {
        name: "琥珀精霊のショートボウ",
        category: "handicraft", area: "area1", origin: "manual",
        cost: { "世界樹の若葉": 2, "丈夫な枝": 4, "ロイヤルゼリー": 1 },
        result: "amber_spirit_bow"
    },
    dwarven_buckler: {
        name: "ドワーフ秘伝の重鉄盾",
        category: "blacksmith", area: "area2", origin: "manual",
        cost: { "ミスリル銀鉱": 2, "硬い石材": 5, "ゴブリンの秘宝貨": 1 },
        result: "dwarven_buckler"
    },
    ether_mist_cloak: {
        name: "幻霧のエーテルマント",
        category: "sewing", area: "area3", origin: "manual",
        cost: { "月光蓮の花": 2, "魔力草": 5, "深淵クラゲの発光核": 1 },
        result: "ether_mist_cloak"
    },
    crimson_dragon_fist: {
        name: "紅蓮竜核のナックル",
        category: "blacksmith", area: "area4", origin: "manual",
        cost: { "緋色金": 2, "火竜の血": 2, "紅蓮のトカゲ逆鱗": 1 },
        result: "crimson_dragon_fist"
    },
    chrono_gear_ring: {
        name: "クロノギアの時空輪",
        category: "handicraft", area: "area5", origin: "manual",
        cost: { "古代文明の設計図": 2, "電子基板": 4, "永久機関のコイル": 1 },
        result: "chrono_gear_ring"
    },
    seraphim_metal_helm: {
        name: "セラフィムメタルの聖冠",
        category: "blacksmith", area: "area6", origin: "manual",
        cost: { "星界のアストラル鉱": 2, "至高の聖結晶": 3, "神殿騎士の紋章石": 1 },
        result: "seraphim_metal_helm"
    },

    // ==========================================
    // ■ 🌈💎 激レアドロップ (0.2%〜0.5%) レシピ (レアモン激レア6種 ＋ BOSS激レア6種)
    // ==========================================
    // --- レアモンスター激レアドロップ装備 ---
    rainbow_slime_crown: {
        name: "虹輝王のクラウンリング",
        category: "handicraft", area: "area1", origin: "ultrarare",
        cost: { "虹色のスライム王冠核": 1, "スライムエンペラーの核": 1, "世界樹の若葉": 1 },
        result: "rainbow_slime_crown"
    },
    eldorado_aegis: {
        name: "黄金郷のエルドラドシールド",
        category: "blacksmith", area: "area2", origin: "ultrarare",
        cost: { "黄金郷のエルドラドコア": 1, "純金の歯車": 1, "ミスリル銀鉱": 1 },
        result: "eldorado_aegis"
    },
    abyss_witch_grimoire: {
        name: "深淵魔女のグリモワール",
        category: "handicraft", area: "area3", origin: "ultrarare",
        cost: { "深淵魔女の禁書ページ": 1, "魔女の呪詛布": 1, "月光蓮の花": 1 },
        result: "abyss_witch_grimoire"
    },
    sun_god_gauntlet: {
        name: "太陽神のフレアガントレット",
        category: "blacksmith", area: "area4", origin: "ultrarare",
        cost: { "太陽神のフレアシェル": 1, "万年溶岩の炉心": 1, "緋色金": 1 },
        result: "sun_god_gauntlet"
    },
    singularity_rail_cannon: {
        name: "シンギュラリティ・レールキャノン",
        category: "handicraft", area: "area5", origin: "ultrarare",
        cost: { "次元機関のシンギュラリティ核": 1, "オリハルコン装甲板": 1, "古代文明の設計図": 1 },
        result: "singularity_rail_cannon"
    },
    nebula_god_greaves: {
        name: "虚空神の星雲神脚",
        category: "sewing", area: "area6", origin: "ultrarare",
        cost: { "虚空神のネビュラコード": 1, "虚無の混沌核": 1, "星界のアストラル鉱": 1 },
        result: "nebula_god_greaves"
    },
    supernova_phoenix_mantle: {
        name: "超新星フェニックスの煌外套",
        category: "sewing", area: "area7", origin: "ultrarare",
        cost: { "超新星のフェニックスハート": 1, "星鳥の煌めく尾羽": 1, "銀河のオリハルコン": 1 },
        result: "supernova_phoenix_mantle"
    },
    world_tree_end_blade: {
        name: "終焉黒竜のラグナロクブレード",
        category: "blacksmith", area: "area8", origin: "ultrarare",
        cost: { "世界樹を蝕む終焉核": 1, "黒竜の絶望鱗": 1, "神界のアダマンタイト": 1 },
        result: "world_tree_end_blade"
    },
    // --- BOSSモンスター激レアドロップ装備 ---
    primal_racco_talisman: {
        name: "始原ラッコ神の守護像",
        category: "handicraft", area: "area1", origin: "ultrarare",
        cost: { "始原のラッコ神像": 1, "森王の覇爪": 1, "黄金のラッコ毛": 1 },
        result: "primal_racco_talisman"
    },
    genesis_orichalcum_sword: {
        name: "創世オリハルコンの輝剣",
        category: "blacksmith", area: "area2", origin: "ultrarare",
        cost: { "創世のオリハルコン原石": 1, "大地母神の心臓石": 1, "星鉄の原石": 1 },
        result: "genesis_orichalcum_sword"
    },
    nine_headed_hydra_armor: {
        name: "九頭竜の厄災鱗鎧",
        category: "sewing", area: "area3", origin: "ultrarare",
        cost: { "九頭竜の心臓宝珠": 1, "ハイドラの再生宝珠": 1, "マンドラゴラの根": 1 },
        result: "nine_headed_hydra_armor"
    },
    prominence_heart_spear: {
        name: "原初竜のフレアランス",
        category: "blacksmith", area: "area4", origin: "ultrarare",
        cost: { "原初竜のプロミネンスハート": 1, "獄炎竜の逆鱗": 1, "不死鳥の残り火": 1 },
        result: "prominence_heart_spear"
    },
    akashic_magic_tome: {
        name: "全知魔導書アカシックレコード",
        category: "handicraft", area: "area5", origin: "ultrarare",
        cost: { "アカシック・レコード断片": 1, "オメガ・ドライブ": 1, "量子エーテル結晶": 1 },
        result: "akashic_magic_tome"
    },
    genesis_seraph_wings: {
        name: "熾天魔王の創世神翼",
        category: "sewing", area: "area6", origin: "ultrarare",
        cost: { "熾天魔王の創世翼": 1, "創世の明け星": 1, "神樹の黄金果実": 2 },
        result: "genesis_seraph_wings"
    },
    cosmo_genesis_halberd: {
        name: "創星竜のギャラクシーハルバード",
        category: "blacksmith", area: "area7", origin: "ultrarare",
        cost: { "創星竜のコスモジェネシス": 1, "星雲の逆鱗": 1, "銀河のオリハルコン": 2 },
        result: "cosmo_genesis_halberd"
    },
    valhalla_sovereign_crown: {
        name: "万象支配のヴァルハラ神冠",
        category: "handicraft", area: "area8", origin: "ultrarare",
        cost: { "万象支配のヴァルハラ王冠": 1, "神槍グングニルの穂先": 1, "原初のルーン文字盤": 2 },
        result: "valhalla_sovereign_crown"
    },

    // ==========================================
    // ■ 🥋 ナックル・格闘爪・拳甲（素手熟練度・拳聖・ゴッドハンド向け）
    // ==========================================
    beast_claw: {
        name: "野獣の獣爪ナックル",
        category: "handicraft", area: "area1", origin: "normal",
        cost: { "ラッコの毛皮": 4, "丈夫な枝": 2 },
        result: "beast_claw"
    },
    iron_knuckle: {
        name: "重鉄のアイアンナックル",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "鉄鉱石": 5, "ロックゴーレムの破片": 2 },
        result: "iron_knuckle"
    },
    hydra_fang_claw: {
        name: "毒蛇咬のポイズンクロー",
        category: "handicraft", area: "area3", origin: "normal",
        cost: { "猛毒の触手": 3, "丈夫な枝": 4 },
        result: "hydra_fang_claw"
    },
    cyber_piston_knuckle: {
        name: "機巧ピストンナックル",
        category: "handicraft", area: "area5", origin: "normal",
        cost: { "蒸気機関パーツ": 3, "精密機械ギア": 2, "オメガ合金フレーム": 1 },
        result: "cyber_piston_knuckle"
    },
    cosmic_fist: {
        name: "銀河星砕きの拳甲",
        category: "blacksmith", area: "area7", origin: "normal",
        cost: { "星屑銀のインゴット": 4, "ギャラクシーコア": 2, "星霊のオーラ結晶": 1 },
        result: "cosmic_fist"
    },
    vajra_god_knuckle: {
        name: "金剛神覇のゴッドナックル",
        category: "blacksmith", area: "area8", origin: "normal",
        cost: { "神鉄ヴァルハラインゴット": 5, "世界樹の神枝": 2, "終焉黒竜の逆鱗": 1 },
        result: "vajra_god_knuckle"
    },

    // ==========================================
    // ■ 🗡️ 刀（刀術熟練度・刀神向け）
    // ==========================================
    bamboo_katana: {
        name: "竹光の小太刀",
        category: "handicraft", area: "area1", origin: "normal",
        cost: { "丈夫な枝": 5, "ラッコの毛皮": 2 },
        result: "bamboo_katana"
    },
    iron_katana: {
        name: "打刀・鉄影",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "鉄鉱石": 5, "綺麗な石": 3 },
        result: "iron_katana"
    },
    venom_nodachi: {
        name: "沼蛇の野太刀",
        category: "blacksmith", area: "area3", origin: "normal",
        cost: { "猛毒の触手": 3, "鉄鉱石": 4 },
        result: "venom_nodachi"
    },
    divine_katana: {
        name: "天照の神刀・布都御魂",
        category: "blacksmith", area: "area6", origin: "normal",
        cost: { "セラフィムメタル": 4, "天使の光羽": 3, "神聖エッセンス": 2 },
        result: "divine_katana"
    },
    muramasa_katana: {
        name: "妖刀・村正",
        category: "blacksmith", area: "area8", origin: "normal",
        cost: { "神鉄ヴァルハラインゴット": 4, "冥界の呪縛鎖": 2, "世界樹の神枝": 2 },
        result: "muramasa_katana"
    },

    // ==========================================
    // ■ 🪓 斧・弓・銃の補完
    // ==========================================
    iron_battle_axe: {
        name: "重鉄のトマホーク",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "鉄鉱石": 6, "ロックゴーレムの破片": 2 },
        result: "iron_battle_axe"
    },
    flame_heavy_bow: {
        name: "紅蓮の火竜弓",
        category: "handicraft", area: "area4", origin: "normal",
        cost: { "燃える皮膚": 4, "溶岩の甲羅": 2, "猛毒の触手": 2 },
        result: "flame_heavy_bow"
    },
    supernova_plasma_gun: {
        name: "超新星プラズマブラスター",
        category: "handicraft", area: "area7", origin: "normal",
        cost: { "星屑銀のインゴット": 4, "精密機械ギア": 3, "ギャラクシーコア": 2 },
        result: "supernova_plasma_gun"
    },

    // ==========================================
    // ■ 🌟【案B】熟練度レベル到達で解放される名匠クラフト武具
    // ==========================================
    masterwork_blade: {
        name: "百錬の名匠鋼剣",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "鉄鉱石": 8, "綺麗な石": 4 },
        reqSkill: { skill: "blacksmith", level: 20, name: "鍛冶" },
        result: "masterwork_blade"
    },
    wind_spirit_garb: {
        name: "風精霊の軽装羽織",
        category: "sewing", area: "area3", origin: "normal",
        cost: { "魔女の呪詛布": 3, "ラッコの毛皮": 5 },
        reqSkill: { skill: "sewing", level: 25, name: "裁縫" },
        result: "wind_spirit_garb"
    },
    automaton_core_ring: {
        name: "自律機巧の歯車輪",
        category: "handicraft", area: "area5", origin: "normal",
        cost: { "精密機械ギア": 4, "蒸気機関パーツ": 2 },
        reqSkill: { skill: "handicraft", level: 30, name: "工作" },
        result: "automaton_core_ring"
    },
    zenith_aegis_shield: {
        name: "金剛不壊の鍛錬大盾",
        category: "blacksmith", area: "area4", origin: "normal",
        cost: { "万年炉心の燃え殻": 2, "溶岩の甲羅": 4, "鉄鉱石": 6 },
        reqSkill: { skill: "refining", level: 30, name: "鍛錬" },
        result: "zenith_aegis_shield"
    },
    ambrosia_feast: {
        name: "神々の万能祝宴薬",
        category: "cooking", area: "area6", origin: "normal",
        cost: { "神聖エッセンス": 2, "妖精の蜜酒": 1, "雑草": 5 },
        reqSkill: { skill: "cooking", level: 35, name: "調理" },
        result: "ambrosia_feast"
    },

    // ==========================================
    // ■ 🌿【案C】熟練度に応じて強くなる成長型・熟練武具
    // ==========================================
    asura_fist: {
        name: "修羅の闘気拳甲",
        category: "blacksmith", area: "area3", origin: "normal",
        cost: { "猛毒の触手": 3, "鉄鉱石": 6, "スライムの核": 3 },
        reqSkill: { skill: "unarmed", level: 25, name: "素手" },
        result: "asura_fist"
    },
    unnamed_odachi: {
        name: "無銘の古太刀",
        category: "blacksmith", area: "area2", origin: "normal",
        cost: { "鉄鉱石": 6, "星鉄の欠片": 2, "綺麗な石": 3 },
        reqSkill: { skill: "katana", level: 25, name: "刀術" },
        result: "unnamed_odachi"
    },
    grandmaster_ring: {
        name: "百錬の求道指輪",
        category: "handicraft", area: "area1", origin: "normal",
        cost: { "スライムの核": 5, "綺麗な石": 3, "ロイヤルゼリー": 1 },
        reqSkill: { skill: "refining", level: 15, name: "鍛錬" },
        result: "grandmaster_ring"
    },

    // ==========================================
    // ■ 🧪【案D】熟練度育成を加速させる修練・研鑽シリーズ装備
    // ==========================================
    training_headband: {
        name: "研鑽の鉢金",
        category: "handicraft", area: "area1", origin: "normal",
        cost: { "ラッコの毛皮": 3, "丈夫な枝": 3 },
        result: "training_headband"
    },
    artisan_gloves: {
        name: "求道工匠の手袋",
        category: "sewing", area: "area2", origin: "normal",
        cost: { "ラッコの毛皮": 4, "鉄鉱石": 2 },
        result: "artisan_gloves"
    },
    warrior_treads: {
        name: "修羅の戦脚",
        category: "sewing", area: "area3", origin: "normal",
        cost: { "魔女の呪詛布": 2, "ラッコの毛皮": 4 },
        result: "warrior_treads"
    },
    ascetic_pendant: {
        name: "苦行僧のペンダント",
        category: "handicraft", area: "area4", origin: "normal",
        cost: { "万年炉心の燃え殻": 1, "炎のルビーリング": 1 },
        result: "ascetic_pendant"
    }
};

// 4. 装備品のステータスデータ（控えめで段階的な成長バランスに調整）
// ※ 基礎ステータス（PLV）、ジョブLv、熟練度育成を主軸にし、装備はそれを支える堅実な数値に調整
const EQUIPMENT = {
    // ===== 【エリア1：始まりの森】 =====
    racco_hood: {
        name: "ラッコのフード", slot: "head",
        hp: 10, def: 2,
        description: "もふもふして温かい。最大HP+10、DEF+2。"
    },
    leather_gloves: {
        name: "ラッコの手袋", slot: "arm",
        hp: 5, atk: 2, dex: 1, hit: 2,
        description: "手に馴染む毛皮の手袋。DEX+1、ATK+2、命中率+2%。"
    },
    wooden_staff: {
        name: "木の杖", slot: "weapon",
        hp: 0, atk: 2, matk: 6, int: 1,
        description: "魔力を帯びた木の杖。MATK+6、INT+1。"
    },
    slime_shield: {
        name: "スライムバックラー", slot: "sub_weapon",
        hp: 12, def: 3, mdef: 2,
        description: "弾力のあるゼリーで衝撃を吸収する軽盾。HP+12、DEF+3、MDEF+2。"
    },
    bear_armor: {
        name: "森主の剛毛鎧", slot: "body",
        hp: 20, def: 5, str: 2, vit: 1,
        description: "森の主の剛毛で仕立てた毛皮鎧。HP+20、DEF+5、STR+2。"
    },
    slime_core_ring: {
        name: "スライム核の指輪", slot: "accessory",
        hp: 10, mp: 8, mdef: 2, luc: 2,
        description: "スライムの核を磨いた指輪。HP+10、MP+8、LUC+2。"
    },
    herb_soup: {
        name: "特製薬草スープ", slot: "usable",
        hp: 0,
        description: "温かい薬草スープ。HP50%・MP30%回復（ピンチ時に自動使用）。"
    },
    training_omelet: {
        name: "修練の特製オムレツ", slot: "usable",
        hp: 0,
        description: "【育成料理】食べると力がみなぎる特製オムレツ。100歩の間、獲得JLV経験値が+50%増加する！"
    },
    master_aurora_elixir: {
        name: "達人の極光秘薬", slot: "usable",
        hp: 0,
        description: "【育成霊薬】神秘の光を放つ霊薬。100歩の間、全スキルの熟練度獲得量が+50%増加する！"
    },
    awakening_ambrosia: {
        name: "覚醒の神酒アムブロシア", slot: "usable",
        hp: 0,
        description: "【至高の神酒】神々の秘酒。150歩の間、獲得JLV経験値と全熟練度獲得量が+100%（2倍）になる！"
    },
    golden_racco_coat: {
        name: "黄金ラッコの王衣", slot: "body",
        hp: 30, def: 7, mdef: 5, luc: 4, drop_rate: 8,
        description: "【レア素材】黄金に輝くラッコ毛のコート。HP+30、DEF+7、LUC+4、泥率+8%。"
    },
    forest_king_axe: {
        name: "森王の覇断斧", slot: "weapon",
        hp: 15, atk: 12, str: 3, vit: 1,
        description: "【レア素材】森の主の覇爪を鍛え上げた戦斧。ATK+12、STR+3、HP+15。"
    },
    emperor_slime_ring: {
        name: "スライムエンペラーの指輪", slot: "accessory",
        hp: 25, mp: 12, def: 4, mdef: 4, eva: 4,
        description: "【レア素材】王とメタルの核を融合した指輪。HP+25、DEF/MDEF+4、回避+4%。"
    },
    world_tree_staff: {
        name: "世界樹の若枝杖", slot: "weapon",
        hp: 10, mp: 15, atk: 3, matk: 11, int: 3,
        description: "【手動採取】世界樹の若葉が芽吹く魔杖。MATK+11、MP+15、INT+3。"
    },
    leaf_amulet: {
        name: "若葉の風お守り", slot: "accessory",
        hp: 10, dex: 2, agi: 2, hit: 3, eva: 3,
        description: "【手動採取】妖精の祝福が宿る護符。DEX+2、AGI+2、命中・回避+3%。"
    },
    fairy_nectar: {
        name: "妖精の蜜酒", slot: "usable",
        hp: 0,
        description: "【手動採取】芳醇な蜜酒。HP・MPを80%回復し、経験値+300を獲得（ピンチ時自動使用）。"
    },

    // ===== 【エリア2：忘れられた廃鉱】 =====
    iron_sword: {
        name: "アイアンソード", slot: "weapon",
        hp: 0, atk: 15, str: 2,
        description: "ずっしりと重い鉄の剣。物理ATK+15、STR+2。"
    },
    iron_spear: {
        name: "アイアンスピア", slot: "weapon",
        hp: 10, atk: 16, dex: 2, hit: 3,
        description: "敵の装甲を貫く鉄槍。物理ATK+16、DEX+2、命中+3%。"
    },
    stone_shield: {
        name: "ストーンシールド", slot: "sub_weapon",
        hp: 25, def: 6, vit: 2,
        description: "頑丈な岩石の盾。最大HP+25、DEF+6、VIT+2。"
    },
    stone_helm: {
        name: "ロックヘルム", slot: "head",
        hp: 20, def: 5, vit: 2,
        description: "硬い石材を削り出した兜。最大HP+20、DEF+5、VIT+2。"
    },
    iron_gauntlet: {
        name: "アイアン籠手", slot: "arm",
        hp: 15, atk: 4, def: 4, str: 2,
        description: "鉄製の頑丈な籠手。STR+2、ATK+4、DEF+4。"
    },
    golem_mail: {
        name: "ゴーレムプレート", slot: "body",
        hp: 45, def: 10, vit: 3, agi: -2,
        description: "ゴーレムの核を動力にした重装甲。HP+45、DEF+10、VIT+3。"
    },
    star_iron_blade: {
        name: "星鉄の閃光剣", slot: "weapon",
        hp: 15, atk: 22, dex: 4, agi: 3, hit: 5,
        description: "【レア素材】隕鉄から鍛えた白銀の魔剣。ATK+22、DEX+4、命中+5%。"
    },
    gaia_shield: {
        name: "大地母神の重盾", slot: "sub_weapon",
        hp: 55, def: 12, mdef: 8, vit: 4,
        description: "【レア素材】大地の鼓動を宿す守護の盾。HP+55、DEF+12、VIT+4。"
    },
    goblin_crown_ring: {
        name: "強欲ゴブリンの金貨輪", slot: "accessory",
        hp: 15, atk: 3, luc: 6, drop_rate: 12,
        description: "【レア素材】黄金の歯車と秘宝貨を繋いだ指輪。LUC+6、ドロップ率+12%。"
    },
    mithril_rapier: {
        name: "ミスリルレイピア", slot: "weapon",
        hp: 10, atk: 19, matk: 14, int: 3, agi: 4, hit: 4,
        description: "【手動採取】魔力を良く通すミスリル銀の細剣。ATK+19、MATK+14、AGI+4。"
    },
    mithril_gloves: {
        name: "ミスリルガントレット", slot: "arm",
        hp: 20, atk: 6, def: 6, dex: 3, hit: 4,
        description: "【手動採取】軽くて強靭な銀の籠手。DEF+6、ATK+6、DEX+3、命中+4%。"
    },
    crystal_pendant: {
        name: "地底水晶のペンダント", slot: "accessory",
        hp: 15, mp: 20, matk: 7, mdef: 5, int: 3,
        description: "【手動採取】澄んだ魔力を放つ古代水晶の首飾り。MP+20、MATK+7、INT+3。"
    },

    // ===== 【エリア3：霧深い沼地】 =====
    swamp_bow: {
        name: "スワンプボウ", slot: "weapon",
        hp: 0, atk: 24, dex: 3, hit: 4,
        description: "沼地の魔力を吸った弓。物理ATK+24、DEX+3、命中+4%。"
    },
    hydra_lance: {
        name: "ハイドラヴェノムランス", slot: "weapon",
        hp: 25, atk: 29, str: 4, vit: 3,
        description: "猛毒の触手を穂先に組み込んだ長槍。ATK+29、STR+4、HP+25。"
    },
    mud_armor: {
        name: "マッドチェインメイル", slot: "body",
        hp: 48, def: 12, mdef: 7, vit: 3,
        description: "沼の泥で固めた鎖帷子。VIT+3、DEF+12、MDEF+7、最大HP+48。"
    },
    magic_robe: {
        name: "魔導師のローブ", slot: "body",
        hp: 35, mp: 20, matk: 10, def: 8, mdef: 12, int: 4,
        description: "魔力草の繊維で織られた法衣。MATK+10、MDEF+12、INT+4、MP+20。"
    },
    hunter_boots: {
        name: "ハンターブーツ", slot: "leg",
        hp: 20, def: 5, agi: 3, eva: 4,
        description: "泥濘でも軽快に動ける革靴。AGI+3、DEF+5、回避率+4%。"
    },
    shroom_powder: {
        name: "怪しい幻覚粉", slot: "accessory",
        hp: 0, matk: 5, luc: 4, drop_rate: 6,
        description: "怪しく光る粉袋。魔法攻撃力+5、LUC+4、ドロップ率+6%。"
    },
    swamp_stew: {
        name: "沼地キノコの魔力シチュー", slot: "usable",
        hp: 0,
        description: "魔力草と光るキノコのシチュー。MPを100%全快し、HPも60%回復する。"
    },
    witch_curse_hat: {
        name: "深淵魔女の三角帽", slot: "head",
        hp: 25, mp: 30, matk: 15, mdef: 10, int: 5,
        description: "【レア素材】魔女の呪詛布で仕立てた帽子。MATK+15、INT+5、MP+30。"
    },
    jelly_lantern: {
        name: "深淵クラゲの魔導灯", slot: "sub_weapon",
        hp: 30, mp: 20, matk: 12, def: 7, mdef: 14, hit: 5,
        description: "【レア素材】幻想的な光で敵を照らす魔導ランタン。MATK+12、MDEF+14、命中+5%。"
    },
    hydra_orb_ring: {
        name: "ハイドラの不死宝珠", slot: "accessory",
        hp: 65, def: 7, mdef: 7, vit: 5,
        description: "【レア素材】驚異の生命力を宿す宝珠。最大HP+65、VIT+5、DEF/MDEF+7。"
    },
    moonlight_bow: {
        name: "月光蓮の霊弓", slot: "weapon",
        hp: 20, mp: 15, atk: 32, matk: 12, dex: 5, hit: 7,
        description: "【手動採取】月光蓮の魔力を矢に乗せる霊弓。ATK+32、MATK+12、命中+7%。"
    },
    mandragora_elixir: {
        name: "マンドラゴラ絶叫薬", slot: "usable",
        hp: 0,
        description: "【手動採取】HP・MPを全回復し、経験値+600を獲得する秘薬（ピンチ時自動使用）。"
    },

    // ===== 【エリア4：灼熱の溶岩洞】 =====
    obsidian_axe: {
        name: "黒曜石のバトルアクス", slot: "weapon",
        hp: 0, atk: 38, str: 5, hit: -4,
        description: "鋭い黒曜石の刃を持つ大斧。STR+5、物理ATK+38、命中率-4%。"
    },
    dragon_blood_sword: {
        name: "竜血の大剣", slot: "weapon",
        hp: 40, atk: 42, str: 6, vit: 3, fire_res: 10,
        description: "火竜の血で焼き入れた大剣。ATK+42、STR+6、HP+40、火耐性+10%。"
    },
    fire_grimoire: {
        name: "炎の魔術書", slot: "weapon",
        hp: 0, mp: 25, atk: 0, matk: 36, int: 6,
        description: "炎の魔法が記された魔術書。INT+6、MATK+36、MP+25。"
    },
    magma_shield: {
        name: "マグマシールド", slot: "sub_weapon",
        hp: 60, def: 15, fire_res: 15,
        description: "熱を帯びた溶岩の盾。最大HP+60、DEF+15、火耐性+15%。"
    },
    fireproof_cloak: {
        name: "耐火の外套", slot: "body",
        hp: 60, def: 15, mdef: 13, fire_res: 20,
        description: "溶岩の熱すら防ぐ外套。DEF+15、MDEF+13、最大HP+60、火耐性+20%。"
    },
    lava_greaves: {
        name: "マグマグリーヴ", slot: "leg",
        hp: 35, def: 9, str: 3, vit: 3, fire_res: 10,
        description: "溶岩の甲羅を加工した重靴。HP+35、DEF+9、STR+3、火耐性+10%。"
    },
    fire_ring: {
        name: "炎のルビーリング", slot: "accessory",
        hp: 15, matk: 8, int: 3, fire_res: 10,
        description: "炎の魔力が宿る指輪。INT+3、魔法攻撃力+8、火耐性+10%。"
    },
    salamander_gloves: {
        name: "紅蓮逆鱗の籠手", slot: "arm",
        hp: 35, atk: 11, def: 11, str: 5, fire_res: 15,
        description: "【レア素材】サラマンダーの逆鱗を埋め込んだ籠手。ATK+11、DEF+11、STR+5。"
    },
    magma_core_armor: {
        name: "万年炉心の重装鎧", slot: "body",
        hp: 90, def: 22, mdef: 14, vit: 6, fire_res: 25,
        description: "【レア素材】万年溶岩の炉心を核とする重鎧。HP+90、DEF+22、火耐性+25%。"
    },
    inferno_halberd: {
        name: "獄炎竜のハルバード", slot: "weapon",
        hp: 65, atk: 52, str: 8, vit: 5, fire_res: 20,
        description: "【レア素材】獄炎竜の逆鱗と竜鱗を束ねた神槍斧。ATK+52、STR+8、HP+65。"
    },
    hihiirokane_katana: {
        name: "緋色金の太刀", slot: "weapon",
        hp: 35, atk: 46, matk: 20, str: 6, agi: 5, hit: 7,
        description: "【手動採取】伝説の緋色金で鍛えた名刀。ATK+46、MATK+20、命中+7%。"
    },
    phoenix_mantle: {
        name: "不死鳥の焔外套", slot: "body",
        hp: 75, mp: 35, def: 18, mdef: 18, agi: 5, fire_res: 30,
        description: "【手動採取】不死鳥の残り火を織り込んだ外套。HP+75、DEF/MDEF+18、火耐性+30%。"
    },

    // ===== 【エリア5：古代の機械遺跡】 =====
    steam_rifle: {
        name: "スチームライフル", slot: "weapon",
        hp: 0, atk: 56, dex: 6, hit: 7,
        description: "蒸気機関で弾丸を放つ銃。DEX+6、物理ATK+56、命中率+7%。"
    },
    omega_cannon: {
        name: "オメガ・バスター砲", slot: "weapon",
        hp: 40, atk: 64, str: 5, dex: 8, hit: 8,
        description: "未知の動力源で荷電粒子を撃ち出す重砲。ATK+64、DEX+8、命中+8%。"
    },
    alloy_armor: {
        name: "ハイパー合金アーマー", slot: "body",
        hp: 105, def: 26, vit: 6, agi: -3,
        description: "未知の金属で作られた重鎧。VIT+6、DEF+26、最大HP+105、AGI-3。"
    },
    cyber_arm: {
        name: "パワードアーム", slot: "arm",
        hp: 35, atk: 13, def: 12, str: 5, dex: 4,
        description: "人工筋肉と油圧で筋力を強化する機械腕。ATK+13、DEF+12、STR+5、DEX+4。"
    },
    steam_boots: {
        name: "スチームグリーヴ", slot: "leg",
        hp: 40, def: 12, agi: 5, eva: 5,
        description: "蒸気噴射でステップを補助する機械靴。AGI+5、DEF+12、回避率+5%。"
    },
    magitech_goggles: {
        name: "魔導探知ゴーグル", slot: "head",
        hp: 30, def: 8, dex: 4, luc: 5, drop_rate: 8,
        description: "エネルギーの流れを感知するゴーグル。DEX+4、LUC+5、ドロップ率+8%。"
    },
    ai_visor: {
        name: "超演算タクティカルバイザー", slot: "head",
        hp: 50, mp: 30, atk: 9, matk: 9, def: 13, dex: 7, int: 6, hit: 10, drop_rate: 12,
        description: "【レア素材】超演算AIが弱点と財宝を解析するバイザー。命中+10%、泥率+12%。"
    },
    orichalcum_aegis: {
        name: "オリハルコン・イージス", slot: "sub_weapon",
        hp: 125, def: 30, mdef: 20, vit: 8,
        description: "【レア素材】永久機関の力場を展開するオリハルコン盾。HP+125、DEF+30、MDEF+20。"
    },
    omega_drive_core: {
        name: "機神のオメガドライブ", slot: "accessory",
        hp: 60, atk: 16, matk: 16, dex: 7, agi: 7, hit: 8, eva: 5,
        description: "【レア素材】機神オメガの中枢ドライブ。ATK/MATK+16、DEX/AGI+7、命中+8%。"
    },
    quantum_rifle: {
        name: "量子エーテル狙撃銃", slot: "weapon",
        hp: 35, atk: 74, matk: 28, dex: 9, hit: 12,
        description: "【手動採取】古代設計図から復元した量子銃。ATK+74、DEX+9、命中+12%。"
    },
    ether_boots: {
        name: "量子ホバーブーツ", slot: "leg",
        hp: 60, def: 18, mdef: 14, agi: 8, eva: 8,
        description: "【手動採取】重力制御で宙を滑るブーツ。DEF+18、AGI+8、回避+8%。"
    },

    // ===== 【エリア6：果てしなき天界塔】 =====
    holy_lance: {
        name: "ホーリーランス", slot: "weapon",
        hp: 80, atk: 84, str: 8, vit: 4,
        description: "聖なる光を纏う伝説の槍。STR+8、VIT+4、物理ATK+84、最大HP+80。"
    },
    aura_blade: {
        name: "神光の聖剣", slot: "weapon",
        hp: 90, mp: 40, atk: 92, matk: 52, str: 9, int: 8, hit: 8,
        description: "神光のオーラを宿す聖剣。ATK+92、MATK+52、HP+90。"
    },
    angel_halo: {
        name: "エンジェルヘイロー", slot: "head",
        hp: 55, mp: 40, matk: 16, def: 14, mdef: 18, int: 7, luc: 6,
        description: "天使の輪を模した聖冠。MATK+16、MDEF+18、INT+7、MP+40。"
    },
    archangel_robe: {
        name: "大天使のローブ", slot: "body",
        hp: 95, mp: 50, def: 27, mdef: 30, matk: 22, int: 9,
        description: "最高位の天使の加護を受けた法衣。INT+9、MATK+22、DEF+27、MDEF+30。"
    },
    seraph_wings: {
        name: "熾天使の羽靴", slot: "leg",
        hp: 50, mp: 30, def: 16, agi: 9, int: 6, eva: 8,
        description: "光の翼を宿した神聖な靴。AGI+9、INT+6、回避率+8%、DEF+16。"
    },
    celestial_talisman: {
        name: "天界の至宝タリスマン", slot: "accessory",
        hp: 45, mp: 25, atk: 12, matk: 12, luc: 9, drop_rate: 12,
        description: "神々の祝福が刻まれた護符。全攻撃力+12、LUC+9、ドロップ率+12%。"
    },
    herbal_potion: {
        name: "上級薬草ポーション", slot: "usable",
        hp: 0,
        description: "天界の聖水で精製した回復薬。HPとMPを100%全回復する（ピンチ時自動使用）。"
    },
    elixir: {
        name: "至高の秘薬エリクサー", slot: "usable",
        hp: 0,
        description: "HP・MPを全回復し、大量の経験値を獲得する奇跡の霊薬。"
    },
    seraphim_gold_wings: {
        name: "熾天使の黄金翼衣", slot: "body",
        hp: 150, mp: 80, def: 38, mdef: 38, matk: 30, int: 12, agi: 9, eva: 6,
        description: "【レア素材】熾天使の黄金羽で織られた神衣。HP+150、DEF/MDEF+38、MATK+30。"
    },
    void_chaos_gauntlet: {
        name: "虚無と混沌の魔手", slot: "arm",
        hp: 70, atk: 26, matk: 26, def: 20, str: 9, int: 9, hit: 8,
        description: "【レア素材】混沌核の力を解放する魔手。ATK/MATK+26、STR/INT+9、DEF+20。"
    },
    genesis_morning_star: {
        name: "創世の明星杖・ルシフェル", slot: "weapon",
        hp: 135, mp: 110, atk: 55, matk: 118, int: 16, luc: 10, hit: 10,
        description: "【レア素材】創世の明け星を冠する至高の魔杖。MATK+118、INT+16、HP+135。"
    },
    astral_spear: {
        name: "星界槍アストラルロンギヌス", slot: "weapon",
        hp: 115, atk: 108, str: 12, dex: 9, hit: 10,
        description: "【手動採取】星界のアストラル鉱を鍛えた神槍。ATK+108、STR+12、HP+115。"
    },
    god_tree_ambrosia: {
        name: "神樹の黄金アムブロシア", slot: "usable",
        hp: 0,
        description: "【手動採取】神々の食物。HP・MP全快に加え、全基礎ステータスが永続で+1上昇する！"
    },

    // ===== 【レアモンスター＆ボス固有の直ドロップ装備】 =====
    kings_crown: {
        name: "王者の冠", slot: "head",
        hp: 25, def: 4, str: 2, int: 2, luc: 5, drop_rate: 6,
        description: "森の王の証である冠。全能力が少し上がり、幸運とドロップ率+6%をもたらす。"
    },
    metal_shield: {
        name: "超合金シールド", slot: "sub_weapon",
        hp: 110, def: 28, vit: 8, agi: -5,
        description: "古代の超合金で作られた重盾。高い防御力を誇るが動きが少し鈍くなる。"
    },
    chaos_ring: {
        name: "カオスリング", slot: "accessory",
        atk: 15, matk: 15, hit: 6, drop_rate: 10,
        description: "混沌の力が渦巻く指輪。攻撃性能+15とドロップ率+10%が付与される。"
    },
    demon_sword: {
        name: "魔王の絶剣", slot: "weapon",
        hp: 165, atk: 124, matk: 88, str: 15, int: 15, hit: 12,
        description: "深淵の魔王が振るったとされる絶望の剣。最強クラスの物理と魔法の力を宿す。"
    },

    // ===== 【🌟🔍 エリア複合・秘伝クラフト装備】 =====
    amber_spirit_bow: {
        name: "琥珀精霊のショートボウ", slot: "weapon",
        hp: 15, mp: 10, atk: 11, matk: 6, dex: 3, agi: 2, hit: 5,
        description: "世界樹の若葉とロイヤルゼリーで強化した精霊弓。ATK+11、MATK+6、DEX+3、命中+5%。"
    },
    dwarven_buckler: {
        name: "ドワーフ秘伝の重鉄盾", slot: "sub_weapon",
        hp: 40, atk: 4, def: 10, mdef: 6, str: 2, vit: 3,
        description: "ミスリル銀鉱を鍛えた攻防一体の重鉄盾。DEF+10、HP+40、ATK+4。"
    },
    ether_mist_cloak: {
        name: "幻霧のエーテルマント", slot: "body",
        hp: 42, mp: 25, matk: 12, def: 10, mdef: 14, int: 4, agi: 4, eva: 5,
        description: "月光蓮と発光核から織られた幻霧の魔導衣。MATK+12、MDEF+14、回避+5%。"
    },
    crimson_dragon_fist: {
        name: "紅蓮竜核のナックル", slot: "arm",
        hp: 38, atk: 14, matk: 8, def: 10, str: 5, agi: 3, fire_res: 15,
        description: "緋色金と逆鱗を拳に宿す闘神の籠手。ATK+14、STR+5、DEF+10。"
    },
    chrono_gear_ring: {
        name: "クロノギアの時空輪", slot: "accessory",
        hp: 50, mp: 25, atk: 12, matk: 12, dex: 6, agi: 7, hit: 6, eva: 6,
        description: "古代文明の設計図から復元した時空輪。ATK/MATK+12、AGI+7、命中/回避+6%。"
    },
    seraphim_metal_helm: {
        name: "セラフィムメタルの聖冠", slot: "head",
        hp: 85, mp: 45, atk: 14, matk: 20, def: 20, mdef: 22, str: 6, int: 9,
        description: "星界のアストラル鉱で鋳造された聖冠。攻防とHP/MPを引き上げる。"
    },

    // ===== 【⚖️💍 交換屋限定・エリア固有特殊効果アクセサリー】 =====
    racco_bounty_charm: {
        name: "森精ラッコの豊穣お守り", slot: "accessory", specialId: "racco_bounty",
        hp: 18, mp: 12, def: 2, mdef: 2, luc: 4, drop_rate: 8,
        description: "【⚖️交換屋限定・エリア1】固有効果【森精の豊穣】：探索1歩ごとにHP・MPが2%回復し、採取獲得数が+1個される。"
    },
    dwarven_gold_gear: {
        name: "ドワーフ王の黄金歯車", slot: "accessory", specialId: "dwarven_gear",
        hp: 32, atk: 6, def: 7, str: 3, vit: 3, dex: 3,
        description: "【⚖️交換屋限定・エリア2】固有効果【黄金採掘機関】：戦闘勝利・採取時に交換Pt(+2〜12Pt)を自動発掘し、物理攻撃時に敵DEFを15%無視。"
    },
    hydra_venom_ring: {
        name: "ハイドラの再生毒腺リング", slot: "accessory", specialId: "hydra_venom",
        hp: 50, mp: 20, atk: 8, matk: 10, def: 6, mdef: 8, int: 4, vit: 4,
        description: "【⚖️交換屋限定・エリア3】固有効果【猛毒と再生】：攻撃命中時に猛毒追撃(敵HP4%/ボス1%・上限:自身ATK/MATKの1.2倍)＆毎ターンHP4%再生。"
    },
    inferno_scale_amulet: {
        name: "獄炎竜の逆鱗アミュレット", slot: "accessory", specialId: "inferno_counter",
        hp: 75, atk: 15, matk: 12, def: 12, str: 6, vit: 5, fire_res: 25,
        description: "【⚖️交換屋限定・エリア4】固有効果【紅蓮の逆鱗】：被弾時に(自身ATK60%+DEF60%)の紅蓮炎反撃を発動し、強行突破の移動歩数+1歩。"
    },
    omega_overclocker: {
        name: "オメガ・オーバークロッカー", slot: "accessory", specialId: "omega_overclock",
        hp: 85, mp: 45, atk: 18, matk: 18, dex: 7, agi: 8, hit: 8, eva: 6,
        description: "【⚖️交換屋限定・エリア5】固有効果【超演算二連装】：アクティブスキル発動率1.2倍＆攻撃時25%の確率で威力40%の電撃追撃が発生。"
    },
    seraph_twilight_halo: {
        name: "熾天魔王の双翼ヘイロー", slot: "accessory", specialId: "seraph_halo",
        hp: 130, mp: 70, atk: 24, matk: 24, def: 20, mdef: 20, str: 7, int: 7, luc: 8, drop_rate: 15,
        description: "【⚖️交換屋限定・エリア6】固有効果【創世の双翼】：獲得EXP＆全スキル熟練度+20%。さらに1戦闘につき1回、致死ダメージ時にMP50%消費でHP35%蘇生。"
    },
    cosmic_dragon_ring: {
        name: "星竜のコズミックリング", slot: "accessory", specialId: "cosmic_ring",
        hp: 200, mp: 110, atk: 38, matk: 38, def: 30, mdef: 30, dex: 12, agi: 12, luc: 12, hit: 10, eva: 10, drop_rate: 20,
        description: "【⚖️交換屋限定・エリア7】固有効果【星辰の導き】：クリティカル率+15%・会心威力+25%。さらに攻撃時30%の確率で(ATK+MATK)50%の流星追撃が発生。"
    },
    odin_allfather_rune: {
        name: "大神の全知ルーン紋章", slot: "accessory", specialId: "odin_rune",
        hp: 320, mp: 180, atk: 60, matk: 60, def: 48, mdef: 48, str: 15, int: 15, vit: 15, dex: 15, agi: 15, luc: 15, hit: 15, eva: 12, drop_rate: 30,
        description: "【⚖️交換屋限定・エリア8】固有効果【万象ルーン】：全与ダメージ1.2倍・被ダメージ15%軽減・毎ターンHP/MPが5%自動回復する至高の神紋。"
    },

    // ===== 【エリア7：星屑の霊峰 ＆ エリア8：神々の黄昏・ヴァルハラ】 =====
    starlight_fang_blade: {
        name: "星狼牙の流星剣", slot: "weapon",
        hp: 90, atk: 125, matk: 60, str: 12, agi: 14, hit: 12, eva: 6,
        description: "星狼の牙を鍛えた流星剣。ATK+125、MATK+60、STR+12、AGI+14。"
    },
    cosmic_gravity_axe: {
        name: "星砕きの重装斧", slot: "weapon",
        hp: 150, atk: 150, def: 28, str: 18, vit: 12, hit: 6,
        description: "隕星石の重力を宿す巨斧。ATK+150、DEF+28、STR+18、HP+150。"
    },
    stardust_silver_armor: {
        name: "星屑銀の輝装鎧", slot: "body",
        hp: 210, mp: 85, def: 46, mdef: 46, vit: 12, agi: 10, eva: 8,
        description: "星屑の銀毛皮で仕立てた軽装神衣。HP+210、DEF/MDEF+46、回避+8%。"
    },
    meteor_aegis_shield: {
        name: "メテオライト・シールド", slot: "sub_weapon",
        hp: 190, def: 48, mdef: 42, vit: 14, fire_res: 25,
        description: "星竜の煌鱗と隕星石の盾。HP+190、DEF+48、MDEF+42、火耐性+25%。"
    },
    cosmic_dragon_staff: {
        name: "星竜のギャラクシーロッド", slot: "weapon",
        hp: 120, mp: 140, atk: 65, matk: 165, int: 20, luc: 12, hit: 12,
        description: "【レア素材】銀河の竜玉を核とする星竜杖。MATK+165、INT+20、MP+140。"
    },
    nebula_scale_plate: {
        name: "星雲竜の逆鱗神鎧", slot: "body",
        hp: 260, mp: 110, atk: 28, matk: 28, def: 58, mdef: 58, str: 14, vit: 16, fire_res: 30,
        description: "【レア素材】星雲の逆鱗と超重力コアを融合した神竜鎧。HP+260、DEF/MDEF+58。"
    },
    galactic_orichalcum_bow: {
        name: "銀河オリハルコンの星弓", slot: "weapon",
        hp: 110, mp: 70, atk: 145, matk: 85, dex: 18, agi: 16, hit: 18, eva: 10,
        description: "【手動採取】銀河のオリハルコンと星鳥の尾羽で作られた星弓。ATK+145、DEX+18、命中+18%。"
    },
    astral_spirit_nectar: {
        name: "星霊の銀河神酒", slot: "usable",
        hp: 0,
        description: "【手動採取】星霊の秘薬草から醸造した神酒。HP・MP全快に加え、全基礎ステータスが永続+2上昇＆EXP+15000！"
    },
    einherjar_valkyrie_spear: {
        name: "英霊槍ヴァルキュリア", slot: "weapon",
        hp: 180, mp: 90, atk: 210, matk: 110, str: 20, dex: 18, agi: 16, hit: 15,
        description: "英霊の神鉄で鍛えた戦乙女の神槍。ATK+210、MATK+110、STR+20。"
    },
    fenrir_frost_gauntlet: {
        name: "魔狼フェンリルの凍牙篭手", slot: "arm",
        hp: 160, atk: 55, matk: 40, def: 48, mdef: 42, str: 18, agi: 18, hit: 12, eva: 10,
        description: "魔狼の凍牙を埋め込んだ剛腕篭手。ATK+55、DEF+48、STR/AGI+18。"
    },
    valhalla_einherjar_mail: {
        name: "ヴァルハラ神鉄の煌鎧", slot: "body",
        hp: 340, mp: 140, atk: 35, matk: 35, def: 78, mdef: 72, str: 16, vit: 22,
        description: "黄昏の神気を纏うヴァルハラ神兵の鎧。HP+340、DEF+78、MDEF+72。"
    },
    gungnir_divine_lance: {
        name: "大神槍グングニル", slot: "weapon",
        hp: 240, mp: 140, atk: 280, matk: 180, str: 28, int: 22, dex: 25, hit: 30,
        description: "【レア素材】必中の神槍グングニル。ATK+280、MATK+180、STR+28、命中+30%。"
    },
    nidhogg_despair_robe: {
        name: "黒竜ニーズヘッグの絶望外套", slot: "body",
        hp: 380, mp: 200, atk: 50, matk: 65, def: 85, mdef: 92, int: 26, vit: 22, eva: 12, drop_rate: 20,
        description: "【レア素材】黒竜の絶望鱗で織られた外套。MATK+65、DEF+85、MDEF+92、泥率+20%。"
    },
    adamantite_god_sword: {
        name: "神界アダマンタイトの覇剣", slot: "weapon",
        hp: 210, atk: 255, matk: 130, str: 25, vit: 18, dex: 18, hit: 16,
        description: "【手動採取】神界のアダマンタイトを鍛え抜いた覇王剣。ATK+255、STR+25。"
    },
    yggdrasil_golden_mead: {
        name: "ヴァルハラ黄金蜜酒・改", slot: "usable",
        hp: 0,
        description: "【手動採取】神々の黄金蜜酒。HP・MP全快に加え、全基礎ステータスが永続+3上昇＆EXP+50000！"
    },

    // ===== 【🌈💎 激レアドロップ (0.2%〜0.5%) クラフト装備（レアモン8種＋BOSS8種）】 =====
    rainbow_slime_crown: {
        name: "虹輝王のクラウンリング", slot: "accessory",
        hp: 25, mp: 20, atk: 4, matk: 4, def: 3, mdef: 3, str: 2, int: 2, luc: 8, drop_rate: 10,
        description: "【🌈レアモン激レア】キングスライムの虹色王冠核から作られた王の指輪。全能力とLUC+8、泥率+10%。"
    },
    eldorado_aegis: {
        name: "黄金郷のエルドラドシールド", slot: "sub_weapon",
        hp: 60, atk: 5, def: 15, mdef: 12, vit: 5, luc: 6, drop_rate: 10,
        description: "【🌈レアモン激レア】黄金郷のコアを埋め込んだ不滅の黄金盾。HP+60、DEF+15、MDEF+12、泥率+10%。"
    },
    abyss_witch_grimoire: {
        name: "深淵魔女のグリモワール", slot: "weapon",
        hp: 35, mp: 45, atk: 10, matk: 38, int: 8, dex: 5, hit: 7,
        description: "【🌈レアモン激レア】深淵魔女の禁書ページを束ねた禁忌の魔導書。MATK+38、INT+8、MP+45。"
    },
    sun_god_gauntlet: {
        name: "太陽神のフレアガントレット", slot: "arm",
        hp: 65, atk: 18, matk: 14, def: 17, mdef: 13, str: 7, vit: 5, fire_res: 20,
        description: "【🌈レアモン激レア】太陽神のフレアシェルから鍛えた神炎の籠手。ATK+18、DEF+17、STR+7、火耐性+20%。"
    },
    singularity_rail_cannon: {
        name: "シンギュラリティ・レールキャノン", slot: "weapon",
        hp: 55, atk: 88, matk: 35, dex: 12, agi: 9, hit: 14,
        description: "【🌈レアモン激レア】次元機関のシンギュラリティ核を搭載した超電磁砲。ATK+88、DEX+12、命中+14%。"
    },
    nebula_god_greaves: {
        name: "虚空神の星雲神脚", slot: "leg",
        hp: 115, mp: 60, atk: 20, matk: 20, def: 26, mdef: 26, agi: 15, luc: 9, eva: 12,
        description: "【🌈レアモン激レア】虚空神のネビュラコードを織り込んだ神速の具足。AGI+15、回避+12%、攻防大幅UP。"
    },
    primal_racco_talisman: {
        name: "始原ラッコ神の守護像", slot: "accessory",
        hp: 28, mp: 15, atk: 5, matk: 5, def: 4, mdef: 4, luc: 7, drop_rate: 12,
        description: "【🌈BOSS激レア】始原のラッコ神像を祀った至宝。全能力が上昇し、ドロップ率+12%！"
    },
    genesis_orichalcum_sword: {
        name: "創世オリハルコンの輝剣", slot: "weapon",
        hp: 30, atk: 24, matk: 14, str: 4, dex: 4, hit: 5,
        description: "【🌈BOSS激レア】創世のオリハルコン原石から鍛えた神輝の剣。ATK+24、MATK+14、STR/DEX+4。"
    },
    nine_headed_hydra_armor: {
        name: "九頭竜の厄災鱗鎧", slot: "body",
        hp: 75, mp: 25, atk: 6, matk: 6, def: 16, mdef: 15, str: 4, vit: 6,
        description: "【🌈BOSS激レア】九頭竜の心臓宝珠を埋め込んだ不死身の鱗鎧。HP+75、DEF+16、MDEF+15。"
    },
    prominence_heart_spear: {
        name: "原初竜のフレアランス", slot: "weapon",
        hp: 75, atk: 58, matk: 28, str: 9, vit: 6, hit: 7, fire_res: 20,
        description: "【🌈BOSS激レア】原初竜の心臓を宿す神槍。ATK+58、MATK+28、STR+9、火耐性+20%。"
    },
    akashic_magic_tome: {
        name: "全知魔導書アカシックレコード", slot: "weapon",
        hp: 65, mp: 75, atk: 35, matk: 85, int: 12, dex: 8, luc: 8, hit: 10,
        description: "【🌈BOSS激レア】森羅万象の記録を記した全知の魔導書。MATK+85、INT+12、MP+75。"
    },
    genesis_seraph_wings: {
        name: "熾天魔王の創世神翼", slot: "body",
        hp: 195, mp: 110, atk: 32, matk: 36, def: 44, mdef: 44, str: 12, int: 14, agi: 12, eva: 10, drop_rate: 15,
        description: "【🌈BOSS激レア】光と闇の創世翼を織り上げた最終神衣。全ステータスを超越させる。"
    },
    supernova_phoenix_mantle: {
        name: "超新星フェニックスの煌外套", slot: "body",
        hp: 310, mp: 160, atk: 45, matk: 55, def: 68, mdef: 72, int: 20, agi: 22, eva: 14, fire_res: 35, drop_rate: 18,
        description: "【🌈レアモン激レア・エリア7】超新星のフェニックスハートを宿す不滅の煌外套。攻防・回避・火耐性が飛躍的に上昇。"
    },
    cosmo_genesis_halberd: {
        name: "創星竜のギャラクシーハルバード", slot: "weapon",
        hp: 220, mp: 120, atk: 245, matk: 160, str: 24, int: 18, dex: 20, hit: 18,
        description: "【🌈BOSS激レア・エリア7】創星竜のコスモジェネシスを核とする銀河の神槍斧。ATK+245、MATK+160、STR+24。"
    },
    world_tree_end_blade: {
        name: "終焉黒竜のラグナロクブレード", slot: "weapon",
        hp: 260, mp: 130, atk: 340, matk: 210, str: 32, dex: 24, agi: 24, hit: 20,
        description: "【🌈レアモン激レア・エリア8】世界樹を蝕む終焉核から鍛造された終焉の魔剣。ATK+340、MATK+210、STR+32。"
    },
    valhalla_sovereign_crown: {
        name: "万象支配のヴァルハラ神冠", slot: "head",
        hp: 350, mp: 220, atk: 65, matk: 65, def: 75, mdef: 75, str: 22, int: 22, vit: 22, dex: 22, agi: 22, luc: 25, hit: 15, eva: 15, drop_rate: 25,
        description: "【🌈BOSS激レア・エリア8】最高神オーディンの王冠を昇華させた支配者の神冠。全能力を極限まで高める。"
    },

    // ==========================================
    // ■ 🥋【案A】ナックル・格闘爪・拳甲（素手熟練度・拳聖・ゴッドハンド向け）
    // ==========================================
    beast_claw: {
        name: "野獣の獣爪ナックル", slot: "weapon",
        hp: 5, atk: 6, agi: 2, crit: 2,
        description: "野獣の鋭い爪を仕込んだ格闘爪。素手熟練度で威力が上昇する。ATK+6、AGI+2、会心率+2%。"
    },
    iron_knuckle: {
        name: "重鉄のアイアンナックル", slot: "weapon",
        hp: 10, atk: 15, def: 4, vit: 2,
        description: "ズシリと重い鉄製のナックル。拳で装甲を叩き割る。ATK+15、DEF+4、VIT+2。"
    },
    hydra_fang_claw: {
        name: "毒蛇咬のポイズンクロー", slot: "weapon",
        hp: 15, atk: 30, agi: 4, hit: 3,
        description: "ハイドラの猛毒牙を加工した鉤爪。ATK+30、AGI+4、命中率+3%。"
    },
    cyber_piston_knuckle: {
        name: "機巧ピストンナックル", slot: "weapon",
        hp: 35, atk: 80, matk: 32, dex: 8,
        description: "蒸気機関のピストン駆動で打撃を撃ち込む機械拳甲。ATK+80、MATK+32、DEX+8。"
    },
    cosmic_fist: {
        name: "銀河星砕きの拳甲", slot: "weapon",
        hp: 80, atk: 170, str: 16, vit: 14, crit: 5,
        description: "隕石の如き質量で星をも穿つ剛拳甲。ATK+170、STR+16、VIT+14、会心率+5%。"
    },
    vajra_god_knuckle: {
        name: "金剛神覇のゴッドナックル", slot: "weapon",
        hp: 150, atk: 265, def: 32, str: 26, vit: 26,
        description: "神話の武神が振るった至高の神拳。一撃が大地を割る。ATK+265、DEF+32、STR+26、VIT+26。"
    },

    // ==========================================
    // ■ 🗡️【案A】刀（刀術熟練度・刀神向け）
    // ==========================================
    bamboo_katana: {
        name: "竹光の小太刀", slot: "weapon",
        hp: 4, atk: 7, dex: 2, crit: 3,
        description: "堅い若竹を削り出した小太刀。扱いやすく急所を突きやすい。ATK+7、DEX+2、会心率+3%。"
    },
    iron_katana: {
        name: "打刀・鉄影", slot: "weapon",
        hp: 8, atk: 18, dex: 3, agi: 2, crit: 4,
        description: "丹念に鍛え上げられた打刀。鋭い刃筋が敵を断つ。ATK+18、DEX+3、AGI+2、会心率+4%。"
    },
    venom_nodachi: {
        name: "沼蛇の野太刀", slot: "weapon",
        hp: 12, atk: 36, dex: 4, crit: 5,
        description: "長大な刃渡りを持つ野太刀。一振りで敵を薙ぎ払う。ATK+36、DEX+4、会心率+5%。"
    },
    divine_katana: {
        name: "天照の神刀・布都御魂", slot: "weapon",
        hp: 60, atk: 135, matk: 55, dex: 14, crit: 8,
        description: "神聖なる光を放つ伝説の霊刀。邪悪を光刃の如く切り裂く。ATK+135、MATK+55、DEX+14、会心率+8%。"
    },
    muramasa_katana: {
        name: "妖刀・村正", slot: "weapon",
        hp: 100, atk: 280, dex: 28, crit: 15,
        description: "血を求める呪われた至高の銘刀。斬れ味は神域に達する。ATK+280、DEX+28、会心率+15%。"
    },

    // ==========================================
    // ■ 🪓【案A】斧・弓・銃の補完
    // ==========================================
    iron_battle_axe: {
        name: "重鉄のトマホーク", slot: "weapon",
        hp: 15, atk: 24, str: 5, vit: 2,
        description: "重厚な鉄塊を打ち伸ばした戦闘斧。一撃が極めて重い。ATK+24、STR+5、VIT+2。"
    },
    flame_heavy_bow: {
        name: "紅蓮の火竜弓", slot: "weapon",
        hp: 25, atk: 60, dex: 9, hit: 8, fire_res: 5,
        description: "火竜の腱を張り上げた大弓。放たれた矢は炎を纏って飛ぶ。ATK+60、DEX+9、命中+8%、火耐性+5%。"
    },
    supernova_plasma_gun: {
        name: "超新星プラズマブラスター", slot: "weapon",
        hp: 70, atk: 165, matk: 75, dex: 16, hit: 10,
        description: "星の核エネルギーを収束発射する超重兵器。ATK+165、MATK+75、DEX+16、命中+10%。"
    },

    // ==========================================
    // ■ 🌟【案B】熟練度レベル到達で解放される名匠クラフト武具
    // ==========================================
    masterwork_blade: {
        name: "百錬の名匠鋼剣", slot: "weapon",
        hp: 20, atk: 26, str: 4, dex: 4, hit: 5,
        description: "【鍛冶Lv.20名匠】職人が百回以上打ち鍛えた不純物のない鋼剣。ATK+26、STR+4、DEX+4、命中+5%。"
    },
    wind_spirit_garb: {
        name: "風精霊の軽装羽織", slot: "body",
        hp: 45, def: 14, mdef: 18, agi: 8, eva: 5,
        description: "【裁縫Lv.25名匠】風精霊の加護が織り込まれた羽織。HP+45、DEF+14、MDEF+18、AGI+8、回避+5%。"
    },
    automaton_core_ring: {
        name: "自律機巧の歯車輪", slot: "accessory",
        hp: 20, mp: 35, int: 8, dex: 8,
        specialId: "automaton_core",
        description: "【工作Lv.30名匠】超小型ゼンマイ機構内蔵の指輪。スキル発動率+5%、HP+20、MP+35、INT/DEX+8。"
    },
    zenith_aegis_shield: {
        name: "金剛不壊の鍛錬大盾", slot: "sub_weapon",
        hp: 120, def: 50, mdef: 28, vit: 12,
        description: "【鍛錬Lv.30名匠】幾度もの鍛錬を経て極限まで密度を高めた大盾。HP+120、DEF+50、MDEF+28、VIT+12。"
    },
    ambrosia_feast: {
        name: "神々の万能祝宴薬", slot: "usable",
        hp: 0,
        description: "【調理Lv.35名匠】HP・MP全回復＆全基礎能力+1(永久)！さらに300歩の間ジョブEXP＆全熟練度獲得量+75%！"
    },

    // ==========================================
    // ■ 🌿【案C】熟練度に応じて強くなる成長型・熟練武具
    // ==========================================
    asura_fist: {
        name: "修羅の闘気拳甲", slot: "weapon",
        hp: 15, atk: 22, crit: 5,
        scalingSkill: "unarmed", scaleAtk: 1.2, scaleDef: 0.4,
        description: "【成長型武具】素手熟練度に応じてATK(+1.2/Lv)とDEF(+0.4/Lv)がリアルタイム成長！基礎ATK+22、会心率+5%。"
    },
    unnamed_odachi: {
        name: "無銘の古太刀", slot: "weapon",
        hp: 10, atk: 20, dex: 3,
        scalingSkill: "katana", scaleAtk: 1.2, scaleCrit: 0.1,
        description: "【成長型武具】刀術熟練度に応じてATK(+1.2/Lv)と会心率(+0.1%/Lv)がリアルタイム成長！基礎ATK+20、DEX+3。"
    },
    grandmaster_ring: {
        name: "百錬の求道指輪", slot: "accessory",
        hp: 30, mp: 20,
        scalingTotalSkills: true, scalingDivisor: 50,
        description: "【成長型武具】全30スキルの合計熟練度50ごとに全基礎能力(STR/INT/VIT/DEX/AGI/LUC)が+1永続上昇！HP+30、MP+20。"
    },

    // ==========================================
    // ■ 🧪【案D】熟練度育成を加速させる修練・研鑽シリーズ装備
    // ==========================================
    training_headband: {
        name: "研鑽の鉢金", slot: "head",
        hp: 15, def: 4,
        allSkillExpBonus: 0.20,
        description: "【修練装備】日々の鍛錬を効率化する鉢金。全スキルの熟練度獲得量 +20%、HP+15、DEF+4。"
    },
    artisan_gloves: {
        name: "求道工匠の手袋", slot: "arm",
        def: 8, dex: 5,
        craftSkillExpBonus: 0.35,
        description: "【修練装備】職人の手仕事を支える手袋。クラフト熟練度（鍛冶・裁縫・工作・鍛錬・調理）獲得量 +35%、DEF+8、DEX+5。"
    },
    warrior_treads: {
        name: "修羅の戦脚", slot: "leg",
        hp: 30, def: 12, agi: 6,
        weaponSkillExpBonus: 0.30,
        description: "【修練装備】実戦での武芸修得を加速させる脚具。全武器熟練度獲得量 +30%、HP+30、DEF+12、AGI+6。"
    },
    ascetic_pendant: {
        name: "苦行僧のペンダント", slot: "accessory",
        hp: 50, mp: 30,
        allSkillExpBonus: 0.25,
        description: "【修練装備】己を厳しく律する首飾り。全スキルの熟練度獲得量 +25%、HP+50、MP+30。"
    }
}; // 最後をしっかり閉じる

// インベントリ内に指定素材（修飾子つき含む）が存在するか判定するヘルパー
function hasMaterialInInventory(matName) {
    if (!player || !player.inventory) return false;
    for (const [k, count] of Object.entries(player.inventory)) {
        if (count > 0 && k.includes(matName)) return true;
    }
    return false;
}

// 5. アクティブスキルのデータ（通常習得 ＋ ステータス・熟練度・ジョブLv複合の隠しスキル！）
const ACTIVE_SKILLS = {
    "魔法剣": {
        name: "魔法剣",
        triggerRate: 0.3,
        damageMultiplier: 1.5,
        expBonus: { sword: 1, magic: 1 },
        logMessage: "✨ 魔法剣を発動！ 敵に <b>{damage}</b> のダメージ！"
    },
    "強撃": {
        name: "強撃",
        triggerRate: 0.2,
        damageMultiplier: 2.0,
        expBonus: { sword: 2 },
        logMessage: "💥 渾身の強撃！ 敵に <b>{damage}</b> のダメージ！"
    },
    "連撃": {
        name: "連撃",
        triggerRate: 0.4,
        damageMultiplier: 1.4,
        expBonus: { sword: 1, unarmed: 1 },
        logMessage: "⚔️ 怒涛の連続攻撃！ 敵に <b>{damage}</b> のダメージ！"
    },
    "狙撃": {
        name: "狙撃",
        triggerRate: 0.15,
        damageMultiplier: 3.0,
        expBonus: { bow: 2, gun: 2 },
        logMessage: "🎯 急所を撃ち抜く狙撃！ 敵に <b>{damage}</b> のダメージ！"
    },
    "ファイアボール": {
        name: "ファイアボール",
        triggerRate: 0.3,
        useMatk: true,
        damageMultiplier: 1.8,
        expBonus: { magic: 2, fireMagic: 2 },
        logMessage: "🔥 燃え盛る火球を放つ！ 敵に <b>{damage}</b> のダメージ！"
    },
    "ウォーターボール": {
        name: "ウォーターボール",
        triggerRate: 0.3,
        useMatk: true,
        damageMultiplier: 1.8,
        expBonus: { magic: 2, waterMagic: 2 },
        logMessage: "💧 高圧の水球を放つ！ 敵に <b>{damage}</b> のダメージ！"
    },
    "ウィンドカッター": {
        name: "ウィンドカッター",
        triggerRate: 0.3,
        useMatk: true,
        damageMultiplier: 1.8,
        expBonus: { magic: 2, windMagic: 2 },
        logMessage: "🌪️ 鋭い風の刃で切り裂く！ 敵に <b>{damage}</b> のダメージ！"
    },
    "アーススパイク": {
        name: "アーススパイク",
        triggerRate: 0.3,
        useMatk: true,
        damageMultiplier: 1.8,
        expBonus: { magic: 2, earthMagic: 2 },
        logMessage: "🪨 地面から岩の槍を突き出す！ 敵に <b>{damage}</b> のダメージ！"
    },
    // --- 🕵️ ステータス・熟練度・ジョブレベル複合の隠しアクティブスキル (全12種) ---
    "閃光斬": {
        name: "閃光斬",
        triggerRate: 0.35,
        damageMultiplier: 2.2,
        expBonus: { sword: 2, evasion: 1 },
        logMessage: "⚡ 【秘剣・閃光斬】目にも留まらぬ神速の一閃！ 敵に <b>{damage}</b> のダメージ！"
    },
    "乾坤一擲": {
        name: "乾坤一擲",
        triggerRate: 0.22,
        damageMultiplier: 2.8,
        expBonus: { axe: 2, unarmed: 2, rush: 1 },
        logMessage: "🌋 【奥義・乾坤一擲】大地を砕く全身全霊の一撃！ 敵に <b>{damage}</b> のダメージ！"
    },
    "乱れ撃ち": {
        name: "乱れ撃ち",
        triggerRate: 0.38,
        damageMultiplier: 2.0,
        expBonus: { bow: 2, gun: 2 },
        logMessage: "🏹 【秘技・乱れ撃ち】死角なき弾幕が敵を貫く！ 敵に <b>{damage}</b> のダメージ！"
    },
    "破城槌": {
        name: "破城槌",
        triggerRate: 0.28,
        damageMultiplier: 2.5,
        expBonus: { axe: 2, shield: 2 },
        logMessage: "🛡️🔨 【重装奥義・破城槌】鉄壁の盾と剛力で敵陣を粉砕！ 敵に <b>{damage}</b> のダメージ！"
    },
    "百歩穿楊": {
        name: "百歩穿楊",
        triggerRate: 0.25,
        damageMultiplier: 3.2,
        expBonus: { bow: 3, search: 2 },
        logMessage: "🎯✨ 【神弓・百歩穿楊】遥か彼方から一点の狂いなく急所を射抜く！ 敵に <b>{damage}</b> のダメージ！"
    },
    "メテオストライク": {
        name: "メテオストライク",
        triggerRate: 0.22,
        useMatk: true,
        damageMultiplier: 3.1,
        expBonus: { magic: 3, fireMagic: 2, earthMagic: 2 },
        logMessage: "☄️ 【禁呪・メテオストライク】天より隕石群を召喚！ 敵に <b>{damage}</b> の大ダメージ！"
    },
    "コキュートス": {
        name: "コキュートス",
        triggerRate: 0.26,
        useMatk: true,
        damageMultiplier: 2.8,
        expBonus: { magic: 3, waterMagic: 2, windMagic: 2 },
        logMessage: "❄️ 【禁呪・コキュートス】絶対零度の吹雪が全てを凍てつかせる！ 敵に <b>{damage}</b> のダメージ！"
    },
    "エレメンタルバースト": {
        name: "エレメンタルバースト",
        triggerRate: 0.28,
        useMatk: true,
        damageMultiplier: 3.4,
        expBonus: { fireMagic: 2, waterMagic: 2, windMagic: 2, earthMagic: 2 },
        logMessage: "🌈💥 【四元禁呪・エレメンタルバースト】火・水・風・地の四大精霊力が大爆発！ 敵に <b>{damage}</b> の大ダメージ！"
    },
    "神速乱舞": {
        name: "神速乱舞",
        triggerRate: 0.35,
        damageMultiplier: 2.6,
        expBonus: { sword: 2, unarmed: 2, rush: 2 },
        logMessage: "🌪️✨ 【極意・神速乱舞】分身すら生む超高速の連撃！ 敵に <b>{damage}</b> のダメージ！"
    },
    "阿修羅閃空": {
        name: "阿修羅閃空",
        triggerRate: 0.30,
        damageMultiplier: 3.3,
        expBonus: { unarmed: 4, rush: 2 },
        logMessage: "👊🔥 【闘神奥義・阿修羅閃空】六臂の幻影と共に放つ神拳の嵐！ 敵に <b>{damage}</b> の絶大ダメージ！"
    },
    "次元斬": {
        name: "次元斬",
        triggerRate: 0.25,
        damageMultiplier: 3.5,
        expBonus: { sword: 3, magic: 3 },
        logMessage: "🌌⚔️ 【神技・次元斬】空間ごと敵を断ち斬る究極の一太刀！ 敵に <b>{damage}</b> の絶大ダメージ！"
    },
    "ラグナロク": {
        name: "ラグナロク",
        triggerRate: 0.24,
        damageMultiplier: 4.0,
        expBonus: { spear: 4, fireMagic: 2, magic: 2 },
        logMessage: "⚡🐉 【終焉神槍・ラグナロク】天界を貫く紅蓮の雷槍が万物を滅ぼす！ 敵に <b>{damage}</b> の超絶ダメージ！"
    }
};

// 6. パッシブスキルのデータ（隠しパッシブスキル大幅追加・全11種）
const PASSIVE_SKILLS = {
    "獲得経験値UP": {
        name: "獲得経験値UP",
        description: "取得するPLV・JLV経験値が1.2倍になる"
    },
    "魔法剣強化": {
        name: "魔法剣強化",
        description: "魔法剣の威力がさらに1.3倍になる"
    },
    "竜の加護": {
        name: "竜の加護",
        description: "被ダメージを30%軽減する"
    },
    "オーバークロック": {
        name: "オーバークロック",
        description: "攻撃時のクリティカル率が大幅に上がる（+20%）"
    },
    "聖なる祈り": {
        name: "聖なる祈り",
        description: "毎ターン、自動でHPが5%回復する"
    },
    "見切り": {
        name: "見切り",
        description: "敵の攻撃を確率で回避しやすくなる（回避率+10%）"
    },
    "トレジャーハンター": {
        name: "トレジャーハンター",
        description: "アイテムドロップ率がさらに上昇する（ドロップ率+30%）"
    },
    "吸血": {
        name: "吸血",
        description: "攻撃時、与えたダメージの10%だけHPが回復する"
    },
    // --- 🕵️ ステータス・熟練度・ジョブレベル複合の隠しパッシブスキル ---
    "心眼": {
        name: "心眼",
        description: "【隠し】命中率+12%、回避率+8%、クリティカル率+10%上昇する"
    },
    "剛毅なる肉体": {
        name: "剛毅なる肉体",
        description: "【隠し】最大HP+15%、物理防御力(DEF)+15%上昇する"
    },
    "魔力暴走": {
        name: "魔力暴走",
        description: "【隠し】魔法攻撃力(MATK)が 20% 上昇する"
    },
    "幸運の星": {
        name: "幸運の星",
        description: "【隠し】ドロップ率+40%、さらに戦闘・採取での良称号付与率が上昇する"
    },
    "職人の極意": {
        name: "職人の極意",
        description: "【隠し】クラフト時の良称号昇格率+25%、交換屋の納品Pt+20%"
    },
    "不撓不屈": {
        name: "不撓不屈",
        description: "【隠し】被ダメージを20%軽減し、毎ターンHPとMPが3%回復する"
    },
    "疾風怒濤": {
        name: "疾風怒濤",
        description: "【隠し】物理攻撃力(ATK)+12%、魔法攻撃力(MATK)+12%、回避率+10%上昇する"
    },
    "大地の恵み": {
        name: "大地の恵み",
        description: "【隠し】最大HP+15%、さらに通常採取・手動採取の獲得個数が +1個 される"
    },
    "魔道回路": {
        name: "魔道回路",
        description: "【隠し】ATKとMATKがそれぞれ互いの25%分加算され、命中率+10%上昇する"
    },
    "黄金律": {
        name: "黄金律",
        description: "【隠し】ドロップ率+50%、交換屋の納品Ptさらに+25%上昇する"
    },
    "神域のオーラ": {
        name: "神域のオーラ",
        description: "【隠し】全戦闘能力(HP/MP/ATK/MATK/DEF/MDEF)が12%上昇し、被ダメージを15%軽減する"
    }
};

// 7. ジョブデータ（基本職・中級複合職・最上級職・🕵️隠しジョブ）
const JOBS = {
    // ==========================================
    // ■ 基本職（最初から転職可能・サクサク上がる）
    // ==========================================
    "冒険者": {
        name: "冒険者",
        req: () => true,
        masterPassive: { name: "旅の心得", effectType: "expBonus", value: 1.10, description: "獲得するPLV・JLV経験値が 10% 増加する" },
        expFactor: 1.00
    },
    "戦士": {
        name: "戦士",
        req: () => true,
        masterPassive: { name: "力への渇望", effectType: "strPercent", value: 1.05, description: "基礎ステータスおよび装備の STR が 5% 増加する" },
        expFactor: 1.05
    },
    "魔術師": {
        name: "魔術師",
        req: () => true,
        masterPassive: { name: "魔力の胎動", effectType: "intPercent", value: 1.05, description: "基礎ステータスおよび装備の INT が 5% 増加する" },
        expFactor: 1.05
    },
    "狩人": {
        name: "狩人",
        req: () => true,
        masterPassive: { name: "精密射撃", effectType: "hitBonus", value: 5, description: "最終的な 命中率 が 5% 増加する" },
        expFactor: 1.05
    },
    "盗賊": {
        name: "盗賊",
        req: () => true,
        masterPassive: { name: "幸運の導き", effectType: "lucPercent", value: 1.10, description: "基礎ステータスおよび装備の LUC が 10% 増加する" },
        expFactor: 1.05
    },

    // ==========================================
    // ■ 中級・複合職（基本熟練度が必要・少し上がりにくい）
    // ==========================================
    "魔法剣士": {
        name: "魔法剣士",
        req: () => (player.skills.sword?.level >= 20) && (player.skills.magic?.level >= 20),
        masterPassive: { name: "魔力纏いし刃", effectType: "matkPercent", value: 1.10, description: "最終的な 魔法攻撃力(MATK) が 10% 増加する" },
        expFactor: 1.15
    },
    "ガンスリンガー": {
        name: "ガンスリンガー",
        req: () => (player.skills.gun?.level >= 30) && (player.skills.evasion?.level >= 20),
        masterPassive: { name: "バレットダンス", effectType: "agiPercent", value: 1.10, description: "基礎ステータスおよび装備の AGI が 10% 増加する" },
        expFactor: 1.15
    },
    "魔導鍛冶師": {
        name: "魔導鍛冶師",
        req: () => (player.skills.blacksmith?.level >= 25) && (player.skills.magic?.level >= 15),
        masterPassive: { name: "刻印魔術", effectType: "vitPercent", value: 1.10, description: "基礎ステータスおよび装備の VIT が 10% 増加する" },
        expFactor: 1.15
    },
    "精霊使い": {
        name: "精霊使い",
        req: () => (player.skills.fireMagic?.level >= 15) && (player.skills.waterMagic?.level >= 15) && (player.skills.windMagic?.level >= 15) && (player.skills.earthMagic?.level >= 15),
        masterPassive: { name: "精霊の親和", effectType: "intPercent", value: 1.10, description: "基礎ステータスおよび装備の INT が 10% 増加する" },
        expFactor: 1.15
    },
    "レンジャー": {
        name: "レンジャー",
        req: () => (player.skills.careful?.level >= 15) && (player.skills.gathering?.level >= 15),
        masterPassive: { name: "サバイバル術", effectType: "dexPercent", value: 1.10, description: "基礎ステータスおよび装備の DEX が 10% 増加する" },
        expFactor: 1.15
    },
    "ベルセルク": {
        name: "ベルセルク",
        req: () => (player.skills.rush?.level >= 15) && ((player.skills.axe?.level >= 15) || (player.skills.sword?.level >= 15)),
        masterPassive: { name: "闘争本能", effectType: "atkPercent", value: 1.10, description: "最終的な 物理攻撃力(ATK) が 10% 増加する" },
        expFactor: 1.15
    },
    "トレジャーシーカー": {
        name: "トレジャーシーカー",
        req: () => (player.skills.search?.level >= 15) && (player.skills.handicraft?.level >= 15),
        masterPassive: { name: "黄金の嗅覚", effectType: "dropBonus", value: 15, description: "最終的な アイテムドロップ率 が 15% 増加する" },
        expFactor: 1.15
    },

    // ==========================================
    // ■ 最上級職（高レベル熟練度 ＋ ボスのレア素材が必要・大器晩成）
    // ==========================================
    "竜騎士": {
        name: "竜騎士",
        req: () => (player.skills.spear?.level >= 80) && (player.skills.fireRes?.level >= 50) && hasMaterialInInventory("究極の竜鱗"),
        masterPassive: { name: "竜の加護", effectType: "hpPercent", value: 1.20, description: "最終的な 最大HP が 20% 増加する" },
        expFactor: 1.30
    },
    "魔導機工師": {
        name: "魔導機工師",
        req: () => (player.skills.gun?.level >= 80) && (player.skills.handicraft?.level >= 60) && hasMaterialInInventory("古代の魔導コア"),
        masterPassive: { name: "オーバークロック", effectType: "dropBonus", value: 20, description: "最終的な アイテムドロップ率 が 20% 増加する" },
        expFactor: 1.30
    },
    "神聖至高職": {
        name: "神聖至高職",
        req: () => (player.skills.magic?.level >= 80) && (player.skills.waterRes?.level >= 50) && hasMaterialInInventory("聖人の遺骨"),
        masterPassive: { name: "聖なる祈り", effectType: "mpPercent", value: 1.20, description: "最終的な 最大MP が 20% 増加する" },
        expFactor: 1.30
    },
    "大賢者": {
        name: "大賢者",
        req: () => (player.skills.magic?.level >= 80) && (player.skills.fireMagic?.level >= 50) && (player.skills.waterMagic?.level >= 50) && (player.skills.windMagic?.level >= 50) && (player.skills.earthMagic?.level >= 50) && hasMaterialInInventory("神光のオーラ"),
        masterPassive: { name: "真理の探究", effectType: "matkPercent", value: 1.20, description: "最終的な 魔法攻撃力(MATK) が 20% 増加する" },
        expFactor: 1.30
    },
    "深淵の踏破者": {
        name: "深淵の踏破者",
        req: () => (player.skills.careful?.level >= 40) && (player.skills.rush?.level >= 40) && (player.skills.search?.level >= 40) && (player.skills.gathering?.level >= 40) && (player.skills.autoWalk?.level >= 40),
        masterPassive: { name: "世界を歩む者", effectType: "allStatsPercent", value: 1.15, description: "全基礎ステータス(STR/INT/VIT/DEX/AGI/LUC)が 15% 増加する" },
        expFactor: 1.30
    },

    // ==========================================
    // ■ 🕵️ 隠しジョブ（ステータス ＋ 熟練度 ＋ ジョブレベルの複合条件で発見！全10種）
    // ==========================================
    "拳聖": {
        name: "拳聖",
        isSecretJob: true,
        req: () => (player.stats.str >= 45) && (player.stats.agi >= 45) && (player.skills.unarmed?.level >= 30) && ((player.jobLevels["戦士"]?.level || 0) >= 30),
        masterPassive: { name: "無手勝流", effectType: "atkPercent", value: 1.15, description: "最終的な 物理攻撃力(ATK) が 15% 増加する（就役中は素手時ATK2.2倍・回避+15%）" },
        expFactor: 1.20
    },
    "アルケミスト": {
        name: "アルケミスト",
        isSecretJob: true,
        req: () => (player.stats.int >= 40) && (player.stats.luc >= 40) && (player.skills.cooking?.level >= 20) && (player.skills.handicraft?.level >= 20) && (player.skills.gathering?.level >= 20),
        masterPassive: { name: "賢者の石の知識", effectType: "hpPercent", value: 1.15, description: "最終的な 最大HP が 15% 増加する（就役中は交換屋納品Pt+30%・回復薬効果1.4倍・泥率+30%）" },
        expFactor: 1.20
    },
    "ヴァルキリー": {
        name: "ヴァルキリー",
        isSecretJob: true,
        req: () => (player.stats.str >= 55) && (player.stats.agi >= 55) && (player.stats.int >= 45) && (player.skills.spear?.level >= 30) && (player.skills.shield?.level >= 25) && ((player.jobLevels["狩人"]?.level || 0) >= 30),
        masterPassive: { name: "戦乙女の凱歌", effectType: "strPercent", value: 1.15, description: "基礎および装備の STR が 15% 増加する（就役中はATK/MATK/DEF 1.3倍・回避+10%）" },
        expFactor: 1.25
    },
    "アサシン": {
        name: "アサシン",
        isSecretJob: true,
        req: () => (player.stats.agi >= 60) && (player.stats.dex >= 50) && (player.stats.luc >= 45) && (player.skills.evasion?.level >= 30) && ((player.jobLevels["盗賊"]?.level || 0) >= 50),
        masterPassive: { name: "暗殺者の極意", effectType: "evaBonus", value: 8, description: "最終的な 回避率 が 8% 増加する（就役中は会心率+25%・会心威力強化・レア泥率UP）" },
        expFactor: 1.25
    },
    "パラディン": {
        name: "パラディン",
        isSecretJob: true,
        req: () => (player.stats.vit >= 60) && (player.stats.int >= 40) && (player.skills.shield?.level >= 30) && (player.skills.careful?.level >= 25) && ((player.jobLevels["戦士"]?.level || 0) >= 40),
        masterPassive: { name: "聖騎士の守護", effectType: "vitPercent", value: 1.15, description: "基礎および装備の VIT が 15% 増加する（就役中はDEF/MDEF 1.4倍・被ダメ20%軽減）" },
        expFactor: 1.25
    },
    "ネクロマンサー": {
        name: "ネクロマンサー",
        isSecretJob: true,
        req: () => (player.stats.int >= 70) && (player.stats.vit >= 50) && (player.skills.magic?.level >= 35) && (player.skills.waterMagic?.level >= 25) && (player.skills.earthMagic?.level >= 25) && ((player.jobLevels["魔術師"]?.level || 0) >= 45),
        masterPassive: { name: "不死の契約", effectType: "matkPercent", value: 1.15, description: "最終的な 魔法攻撃力(MATK) が 15% 増加する（就役中はMATK1.35倍・与ダメの8%HP＆4%MP吸収）" },
        expFactor: 1.25
    },
    "刀神": {
        name: "刀神",
        isSecretJob: true,
        req: () => (player.stats.str >= 85) && (player.stats.dex >= 75) && (player.stats.agi >= 70) && ((player.skills.katana?.level >= 50) || (player.skills.sword?.level >= 50)) && ((player.jobLevels["戦士"]?.level || 0) >= 50) && ((player.jobLevels["魔法剣士"]?.level || 0) >= 40),
        masterPassive: { name: "明鏡止水", effectType: "dexPercent", value: 1.18, description: "基礎および装備の DEX が 18% 増加する（就役中は刀装備時ATK1.7倍・剣1.5倍・会心率+30%・スキル発動率1.25倍）" },
        expFactor: 1.30
    },
    "星詠みの賢者": {
        name: "星詠みの賢者",
        isSecretJob: true,
        req: () => (player.stats.int >= 85) && (player.stats.luc >= 75) && (player.skills.search?.level >= 35) && ((player.jobLevels["魔術師"]?.level || 0) >= 60) && ((player.jobLevels["精霊使い"]?.level || 0) >= 40),
        masterPassive: { name: "星々の導き", effectType: "allStatsPercent", value: 1.12, description: "全基礎ステータスが 12% 増加する（就役中はMATK1.4倍・スキル発動率1.3倍・泥率+40%）" },
        expFactor: 1.30
    },
    "ゴッドハンド": {
        name: "ゴッドハンド",
        isSecretJob: true,
        req: () => (player.stats.str >= 90) && (player.stats.vit >= 80) && (player.stats.agi >= 75) && (player.skills.unarmed?.level >= 50) && ((player.jobLevels["拳聖"]?.level || 0) >= 50) && ((player.jobLevels["パラディン"]?.level || 0) >= 40),
        masterPassive: { name: "神の拳", effectType: "atkPercent", value: 1.20, description: "最終的な 物理攻撃力(ATK) が 20% 増加する（就役中は素手/ナックル時ATK2.5倍・DEF/MDEF1.4倍・毎ターンHP5%回復）" },
        expFactor: 1.32
    },
    "破壊神": {
        name: "破壊神",
        isSecretJob: true,
        req: () => (player.stats.str >= 80) && (player.stats.vit >= 65) && (player.skills.axe?.level >= 50) && (player.skills.rush?.level >= 35) && ((player.jobLevels["ベルセルク"]?.level || 0) >= 40),
        masterPassive: { name: "壊滅の剛力", effectType: "atkPercent", value: 1.20, description: "最終的な 物理攻撃力(ATK) が 20% 増加する（就役中は斧装備時ATK1.8倍・敵DEF35%貫通・会心威力+0.4）" },
        expFactor: 1.30
    },
    "神弓・ホークアイ": {
        name: "神弓・ホークアイ",
        isSecretJob: true,
        req: () => (player.stats.dex >= 80) && (player.stats.agi >= 70) && (player.skills.bow?.level >= 50) && (player.skills.search?.level >= 35) && ((player.jobLevels["狩人"]?.level || 0) >= 50),
        masterPassive: { name: "神域の射手", effectType: "dexPercent", value: 1.18, description: "基礎および装備の DEX が 18% 増加する（就役中は弓装備時ATK1.7倍・命中+20%・会心率+25%・回避+10%）" },
        expFactor: 1.30
    },
    "大匠神": {
        name: "大匠神",
        isSecretJob: true,
        req: () => (player.skills.blacksmith?.level >= 30) && (player.skills.sewing?.level >= 30) && (player.skills.handicraft?.level >= 30) && (player.skills.refining?.level >= 30) && ((player.jobLevels["魔導鍛冶師"]?.level || 0) >= 40),
        masterPassive: { name: "神工鬼斧", effectType: "allStatsPercent", value: 1.12, description: "全基礎ステータスが 12% 増加する（就役中はDEF/MDEF1.35倍・クラフト良称号率＆+値大幅UP・クラフト熟練度+50%）" },
        expFactor: 1.28
    },
    "大豪商": {
        name: "大豪商",
        isSecretJob: true,
        req: () => (player.stats.luc >= 75) && (player.skills.trading?.level >= 40) && (player.skills.gathering?.level >= 35) && (player.skills.cooking?.level >= 35) && ((player.jobLevels["トレジャーシーカー"]?.level || 0) >= 40),
        masterPassive: { name: "黄金律・極", effectType: "dropBonus", value: 30, description: "最終的な アイテムドロップ率 が 30% 増加する（就役中は泥率+60%・納品Pt1.5倍・採取/交易熟練度+50%・獲得EXP+25%）" },
        expFactor: 1.28
    },
    "万象の覇王": {
        name: "万象の覇王",
        isSecretJob: true,
        req: () => {
            const st = player.stats;
            const allStat100 = st.str >= 100 && st.int >= 100 && st.vit >= 100 && st.dex >= 100 && st.agi >= 100 && st.luc >= 100;
            const masterCount = Object.values(player.jobLevels || {}).filter(j => j.isMaster).length;
            return allStat100 && masterCount >= 3;
        },
        masterPassive: { name: "覇王の威光", effectType: "atkPercent", value: 1.25, description: "最終的な 物理攻撃力(ATK) が 25% 増加する（就役中は全能力1.35倍・手動探索MP0・泥率+60%）" },
        expFactor: 1.35
    }
};

// ====== 7.5 ジョブ超越・職能特化アビリティマスターデータ (JOB_MASTERY_SPECS) ======
// 各ジョブが Lv.100 (MASTER) に到達した後の超越レベル（★1〜）ごとにJMP(職能ポイント)を獲得！
// 3つの特化アビリティにポイントを割り振ることで、自分だけの特化ビルドを構築できる！
const JOB_MASTERY_SPECS = {
    // ■ 基本職
    "冒険者": {
        spec1: { name: "万能の心得", desc: "全基礎ステータス +1 / Pt", type: "allStats", value: 1 },
        spec2: { name: "歴戦の頑健", desc: "最大HP +15, 最大MP +8 / Pt", type: "hpMp", hp: 15, mp: 8 },
        spec3: { name: "探求者の魂", desc: "獲得EXP ＆ 全熟練度 +1.5% / Pt", type: "expBonus", value: 1.5 }
    },
    "戦士": {
        spec1: { name: "剛力無双", desc: "STR補正 +1.5% / Pt", type: "strPct", value: 1.5 },
        spec2: { name: "会心粉砕", desc: "会心ダメージ倍率 +2.5% / Pt", type: "critDmg", value: 2.5 },
        spec3: { name: "金剛の構え", desc: "物理被ダメージ軽減 +0.6% / Pt (最大30%)", type: "physCut", value: 0.6, max: 30 }
    },
    "魔術師": {
        spec1: { name: "魔力収束", desc: "MATK補正 +1.5% / Pt", type: "matkPct", value: 1.5 },
        spec2: { name: "高速詠唱", desc: "魔法アクティブ発動率 +0.6% / Pt", type: "magicTrigger", value: 0.6 },
        spec3: { name: "魔力循環", desc: "最大MP +18 / Pt ＆ 攻撃時MP回復+1 / Pt", type: "manaLoop", mp: 18, mpHeal: 1 }
    },
    "狩人": {
        spec1: { name: "弱点看破", desc: "命中率 +0.8%, 会心率 +0.4% / Pt", type: "hitCrit", hit: 0.8, crit: 0.4 },
        spec2: { name: "韋駄天の風", desc: "AGI補正 +1.2%, 回避率 +0.4% / Pt", type: "agiEva", agiPct: 1.2, eva: 0.4 },
        spec3: { name: "急所射撃", desc: "弓・銃装備時ATK +2.0% / Pt", type: "bowGunAtk", value: 2.0 }
    },
    "盗賊": {
        spec1: { name: "財宝感知", desc: "ドロップ率 +2.0% / Pt", type: "dropRate", value: 2.0 },
        spec2: { name: "疾風迅雷", desc: "回避率 +0.5% / Pt", type: "evaRate", value: 0.5 },
        spec3: { name: "強奪の極意", desc: "交換屋の素材納品Pt +1.5% / Pt", type: "exchangeBonus", value: 1.5 }
    },
    // ■ 中級・複合職
    "魔法剣士": {
        spec1: { name: "魔剣共鳴", desc: "魔法剣・次元斬ダメージ +2.5% / Pt", type: "spellBladeDmg", value: 2.5 },
        spec2: { name: "属性調和", desc: "ATK +1.2%, MATK +1.2% / Pt", type: "hybridAtk", value: 1.2 },
        spec3: { name: "魔導障壁", desc: "DEF +1.2%, MDEF +1.2% / Pt", type: "hybridDef", value: 1.2 }
    },
    "ガンスリンガー": {
        spec1: { name: "乱射演舞", desc: "銃追撃固定ダメージ +4 / Pt", type: "gunFlatDmg", value: 4 },
        spec2: { name: "跳弾跳躍", desc: "回避率 +0.5% / Pt", type: "evaRate", value: 0.5 },
        spec3: { name: "早撃ちの極み", desc: "会心率 +0.5% / Pt", type: "critRate", value: 0.5 }
    },
    "魔導鍛冶師": {
        spec1: { name: "名工の魂", desc: "クラフト良称号昇格率 +1.5% / Pt", type: "craftPrefixRate", value: 1.5 },
        spec2: { name: "剛体鍛錬", desc: "DEF +1.8% / Pt", type: "defPct", value: 1.8 },
        spec3: { name: "属性付与", desc: "全属性耐性 +0.8% / Pt", type: "allRes", value: 0.8 }
    },
    "精霊使い": {
        spec1: { name: "四元共鳴", desc: "火/水/風/地属性魔法威力 +2.0% / Pt", type: "elementalDmg", value: 2.0 },
        spec2: { name: "精霊の加護", desc: "被ダメージ軽減 +0.6% / Pt (最大25%)", type: "dmgCut", value: 0.6, max: 25 },
        spec3: { name: "マナ奔流", desc: "最大MP +25 / Pt", type: "maxMp", value: 25 }
    },
    "レンジャー": {
        spec1: { name: "大自然の恵み", desc: "採取獲得個数UP確率 +1.5% / Pt", type: "gatherBonus", value: 1.5 },
        spec2: { name: "迷彩擬態", desc: "回避率 +0.4%, 命中率 +0.4% / Pt", type: "evaHit", eva: 0.4, hit: 0.4 },
        spec3: { name: "罠感知", desc: "イベント成功率 +1.5% / Pt", type: "eventSuccess", value: 1.5 }
    },
    "ベルセルク": {
        spec1: { name: "狂乱激昂", desc: "ATK補正 +2.0% / Pt", type: "atkPct", value: 2.0 },
        spec2: { name: "死線奮迅", desc: "会心ダメージ倍率 +3.0% / Pt", type: "critDmg", value: 3.0 },
        spec3: { name: "肉体粉砕", desc: "斧・剣装備時ATK +2.0% / Pt", type: "axeSwordAtk", value: 2.0 }
    },
    "トレジャーシーカー": {
        spec1: { name: "黄金探索", desc: "ドロップ率 +2.5% / Pt", type: "dropRate", value: 2.5 },
        spec2: { name: "大富豪の星", desc: "LUC補正 +2.0% / Pt", type: "lucPct", value: 2.0 },
        spec3: { name: "秘宝換金", desc: "交換屋の素材納品Pt +2.0% / Pt", type: "exchangeBonus", value: 2.0 }
    },
    // ■ 最上級職
    "竜騎士": {
        spec1: { name: "竜鱗の剛躯", desc: "最大HP +2.0%, 槍装備時ATK +2.0% / Pt", type: "dragonHpAtk", value: 2.0 },
        spec2: { name: "竜撃貫通", desc: "敵DEF防御貫通率 +1.2% / Pt", type: "defPierce", value: 1.2 },
        spec3: { name: "竜炎反撃", desc: "火耐性 +1.2%, 反撃ダメージ +3% / Pt", type: "fireCounter", res: 1.2, counter: 3 }
    },
    "魔導機工師": {
        spec1: { name: "並列超演算", desc: "スキル発動率 +0.6%, レーザー追撃威力 +2% / Pt", type: "mechSkill", trigger: 0.6, chase: 2 },
        spec2: { name: "臨界駆動", desc: "会心率 +0.5%, 会心倍率 +2.0% / Pt", type: "mechCrit", rate: 0.5, mult: 2.0 },
        spec3: { name: "機構精密分析", desc: "ドロップ率 +2.0%, DEX +1.5 / Pt", type: "mechDrop", drop: 2.0, dex: 1.5 }
    },
    "神聖至高職": {
        spec1: { name: "神聖領域", desc: "全属性耐性 +1.0%, 被ダメ軽減 +0.6% / Pt", type: "holyDomain", res: 1.0, cut: 0.6 },
        spec2: { name: "奇跡の祈り", desc: "毎ターンHP・MP自然回復 +0.6% / Pt", type: "miracleRegen", value: 0.6 },
        spec3: { name: "神罰裁定", desc: "MATK +2.0%, 最大MP +20 / Pt", type: "divineMatk", matkPct: 2.0, mp: 20 }
    },
    "大賢者": {
        spec1: { name: "深淵の叡智", desc: "MATK補正 +2.5% / Pt", type: "matkPct", value: 2.5 },
        spec2: { name: "属性支配", desc: "全魔法ダメージ +2.5% / Pt", type: "allMagicDmg", value: 2.5 },
        spec3: { name: "無尽蔵のマナ", desc: "最大MP +35 / Pt", type: "maxMp", value: 35 }
    },
    "深淵の踏破者": {
        spec1: { name: "踏破者の誇り", desc: "全基礎ステータス +2.0 / Pt", type: "allStats", value: 2.0 },
        spec2: { name: "領域適応", desc: "全属性耐性 +1.2% / Pt", type: "allRes", value: 1.2 },
        spec3: { name: "超克の意志", desc: "与ダメージ +1.5% / Pt", type: "dmgBonus", value: 1.5 }
    },
    // ■ 隠しジョブ
    "拳聖": {
        spec1: { name: "極意・神拳", desc: "素手・ナックル時ATK +2.5% / Pt", type: "fistAtk", value: 2.5 },
        spec2: { name: "無想転生", desc: "回避率 +0.5% / Pt", type: "evaRate", value: 0.5 },
        spec3: { name: "気功波", desc: "最大HP +2.0%, 会心率 +0.4% / Pt", type: "chakraHpCrit", hpPct: 2.0, crit: 0.4 }
    },
    "アルケミスト": {
        spec1: { name: "黄金錬成", desc: "交換屋の納品Pt +2.0% / Pt", type: "exchangeBonus", value: 2.0 },
        spec2: { name: "万能霊薬調合", desc: "ポーション・料理回復効果 +3% / Pt", type: "potionHeal", value: 3.0 },
        spec3: { name: "万物溶解", desc: "ドロップ率 +2.0%, 良称号率 +1.5% / Pt", type: "dropPrefix", drop: 2.0, prefix: 1.5 }
    },
    "ヴァルキリー": {
        spec1: { name: "戦乙女の凱旋", desc: "ATK +1.5%, MATK +1.5% / Pt", type: "hybridAtk", value: 1.5 },
        spec2: { name: "英霊の守護", desc: "DEF +2.0%, 被ダメ軽減 +0.6% / Pt", type: "defCut", defPct: 2.0, cut: 0.6 },
        spec3: { name: "天馬の飛翔", desc: "回避率 +0.5% / Pt", type: "evaRate", value: 0.5 }
    },
    "アサシン": {
        spec1: { name: "暗殺の刃", desc: "会心率 +0.6% / Pt", type: "critRate", value: 0.6 },
        spec2: { name: "影渡り", desc: "回避率 +0.6% / Pt", type: "evaRate", value: 0.6 },
        spec3: { name: "急所即殺", desc: "会心ダメージ倍率 +3.5% / Pt", type: "critDmg", value: 3.5 }
    },
    "パラディン": {
        spec1: { name: "聖塞の防壁", desc: "DEF +2.0%, MDEF +2.0% / Pt", type: "defMdefPct", value: 2.0 },
        spec2: { name: "金剛聖体", desc: "最大HP +2.5% / Pt", type: "hpPercent", value: 2.5 },
        spec3: { name: "不落の誓い", desc: "被ダメージ軽減 +0.8% / Pt (最大35%)", type: "dmgCut", value: 0.8, max: 35 }
    },
    "ネクロマンサー": {
        spec1: { name: "魂魄吸収", desc: "攻撃時HP・MP吸収率 +0.5% / Pt", type: "drainBonus", value: 0.5 },
        spec2: { name: "冥府の魔力", desc: "MATK補正 +2.2% / Pt", type: "matkPct", value: 2.2 },
        spec3: { name: "死の帳", desc: "MDEF +2.0%, 最大MP +25 / Pt", type: "mdefMp", mdefPct: 2.0, mp: 25 }
    },
    "刀神": {
        spec1: { name: "神速一閃", desc: "刀・剣装備時ATK +2.5% / Pt", type: "bladeAtk", value: 2.5 },
        spec2: { name: "絶対見切り", desc: "回避率 +0.5% / Pt", type: "evaRate", value: 0.5 },
        spec3: { name: "天衣無縫", desc: "会心率 +0.5%, 敵DEF貫通率 +1.5% / Pt", type: "critPierce", crit: 0.5, pierce: 1.5 }
    },
    "星詠みの賢者": {
        spec1: { name: "星彩魔光", desc: "MATK補正 +2.2% / Pt", type: "matkPct", value: 2.2 },
        spec2: { name: "星辰の運命", desc: "ドロップ率 +2.5%, LUC +2.0 / Pt", type: "dropLuc", drop: 2.5, luc: 2.0 },
        spec3: { name: "超新星爆発", desc: "アクティブスキル発動率 +0.8% / Pt", type: "skillTrigger", value: 0.8 }
    },
    "ゴッドハンド": {
        spec1: { name: "神速百裂拳", desc: "素手・ナックル時ATK +3.0% / Pt", type: "fistAtk", value: 3.0 },
        spec2: { name: "神性の剛力", desc: "STR +2.5, 最大HP +2.0% / Pt", type: "strHp", str: 2.5, hpPct: 2.0 },
        spec3: { name: "金剛不壊", desc: "DEF +2.0%, MDEF +2.0% / Pt", type: "defMdefPct", value: 2.0 }
    },
    "破壊神": {
        spec1: { name: "破城の斧撃", desc: "斧・剣装備時ATK +2.8% / Pt", type: "axeSwordAtk", value: 2.8 },
        spec2: { name: "タイタンの肉体", desc: "STR +2.5, 敵防御無視 +1.0% / Pt (最大50%)", type: "strPierce", str: 2.5, pierce: 1.0, max: 50 },
        spec3: { name: "一撃必殺の構え", desc: "会心ダメージ倍率 +3.5% / Pt", type: "critDmg", value: 3.5 }
    },
    "神弓・ホークアイ": {
        spec1: { name: "流星矢の連射", desc: "弓・銃装備時ATK +2.8% / Pt", type: "bowGunAtk", value: 2.8 },
        spec2: { name: "鷹の極眼", desc: "命中率 +1.0%, 会心率 +0.6% / Pt", type: "hitCrit", hit: 1.0, crit: 0.6 },
        spec3: { name: "風を纏う足捌き", desc: "AGI補正 +1.8%, 回避率 +0.5% / Pt", type: "agiEva", agiPct: 1.8, eva: 0.5 }
    },
    "大匠神": {
        spec1: { name: "名匠の魂EX", desc: "クラフト良称号昇格率 +2.5% / Pt", type: "craftPrefixRate", value: 2.5 },
        spec2: { name: "不壊の鎧纏い", desc: "DEF +2.0%, MDEF +2.0% / Pt", type: "defMdefPct", value: 2.0 },
        spec3: { name: "神域の魔力刻印", desc: "全基礎ステータス +2.0, 全耐性 +0.8% / Pt", type: "allStats", value: 2.0 }
    },
    "大豪商": {
        spec1: { name: "黄金の嗅覚EX", desc: "ドロップ率 +3.5% / Pt", type: "dropRate", value: 3.5 },
        spec2: { name: "豊穣の商才", desc: "交換屋の素材納品Pt +2.5% / Pt", type: "exchangeBonus", value: 2.5 },
        spec3: { name: "グルメの活力", desc: "獲得EXP ＆ 全熟練度 +2.0% / Pt", type: "expBonus", value: 2.0 }
    },
    "万象の覇王": {
        spec1: { name: "森羅万象", desc: "全基礎ステータス +2.5 / Pt", type: "allStats", value: 2.5 },
        spec2: { name: "覇道の力", desc: "全与ダメージ +1.8% / Pt", type: "dmgBonus", value: 1.8 },
        spec3: { name: "覇王の威光", desc: "ドロップ率 +3.0%, 被ダメ軽減 +0.6% / Pt", type: "dropCut", drop: 3.0, cut: 0.6 }
    }
};

// 8. 隠しスキル＆隠しジョブの発見ヒント一覧（UIの「隠し要素ヒント」で進捗を確認可能）
const SECRET_DISCOVERY_HINTS = [
    // アクティブスキル (13種)
    { id: "魔法剣", kind: "active", name: "魔法剣", hint: "剣術Lv3 ＋ 魔法Lv3" },
    { id: "閃光斬", kind: "active", name: "閃光斬", hint: "基礎AGI 35以上 ＋ 剣術Lv15 ＋ (狩人 または 盗賊 JLV20以上)" },
    { id: "乾坤一擲", kind: "active", name: "乾坤一擲", hint: "基礎STR 45以上 ＋ (斧術Lv15 または 素手Lv15) ＋ 戦士JLV25以上" },
    { id: "乱れ撃ち", kind: "active", name: "乱れ撃ち", hint: "基礎DEX 40以上 ＋ (弓術Lv15 または 銃術Lv15) ＋ 狩人JLV25以上" },
    { id: "破城槌", kind: "active", name: "破城槌", hint: "基礎STR 50以上 ＋ 基礎VIT 50以上 ＋ 斧術Lv20 ＋ 盾術Lv20" },
    { id: "百歩穿楊", kind: "active", name: "百歩穿楊", hint: "基礎DEX 65以上 ＋ 基礎LUC 50以上 ＋ 弓術Lv25 ＋ 探索Lv20" },
    { id: "メテオストライク", kind: "active", name: "メテオストライク", hint: "基礎INT 55以上 ＋ 火魔法Lv20 ＋ 地魔法Lv20 ＋ 魔術師JLV30以上" },
    { id: "コキュートス", kind: "active", name: "コキュートス", hint: "基礎INT 55以上 ＋ 水魔法Lv20 ＋ 風魔法Lv20 ＋ 精霊使いJLV20以上" },
    { id: "エレメンタルバースト", kind: "active", name: "エレメンタルバースト", hint: "基礎INT 70以上 ＋ 4属性魔法すべてLv20以上 ＋ 精霊使いJLV30以上" },
    { id: "神速乱舞", kind: "active", name: "神速乱舞", hint: "基礎AGI 70以上 ＋ 基礎DEX 60以上 ＋ 回避Lv25 ＋ 強行Lv20" },
    { id: "阿修羅閃空", kind: "active", name: "阿修羅閃空", hint: "基礎STR 75以上 ＋ 基礎AGI 70以上 ＋ 素手Lv35 ＋ 拳聖JLV30以上" },
    { id: "次元斬", kind: "active", name: "次元斬", hint: "基礎STR 90以上 ＋ 基礎INT 70以上 ＋ 剣術Lv40 ＋ 魔法剣士JLV50以上" },
    { id: "ラグナロク", kind: "active", name: "ラグナロク", hint: "基礎STR 100以上 ＋ 基礎INT 100以上 ＋ 槍術Lv40 ＋ 竜騎士JLV40以上" },
    // パッシブスキル (11種)
    { id: "心眼", kind: "passive", name: "心眼", hint: "基礎DEX 35以上 ＋ 基礎AGI 35以上 ＋ 警戒Lv15 ＋ 回避Lv15" },
    { id: "剛毅なる肉体", kind: "passive", name: "剛毅なる肉体", hint: "基礎VIT 50以上 ＋ 盾術Lv15 ＋ 戦士JLV30以上" },
    { id: "魔力暴走", kind: "passive", name: "魔力暴走", hint: "基礎INT 50以上 ＋ 魔法Lv20 ＋ 魔術師JLV30以上" },
    { id: "幸運の星", kind: "passive", name: "幸運の星", hint: "基礎LUC 45以上 ＋ 探索Lv20 ＋ 盗賊JLV30以上" },
    { id: "職人の極意", kind: "passive", name: "職人の極意", hint: "基礎DEX 40以上 ＋ 鍛冶・工作・裁縫すべてLv20 ＋ 調理Lv15" },
    { id: "大地の恵み", kind: "passive", name: "大地の恵み", hint: "基礎VIT 45以上 ＋ 基礎LUC 45以上 ＋ 採取Lv25 ＋ レンジャーJLV25以上" },
    { id: "疾風怒濤", kind: "passive", name: "疾風怒濤", hint: "基礎AGI 50以上 ＋ 行軍Lv25 ＋ 強行Lv25" },
    { id: "魔道回路", kind: "passive", name: "魔道回路", hint: "基礎INT 65以上 ＋ 基礎DEX 50以上 ＋ 銃術Lv25 ＋ 工作Lv25" },
    { id: "黄金律", kind: "passive", name: "黄金律", hint: "基礎LUC 70以上 ＋ トレジャーシーカーJLV40以上 ＋ アルケミストJLV30以上" },
    { id: "不撓不屈", kind: "passive", name: "不撓不屈", hint: "基礎VIT 80以上 ＋ 基礎STR 80以上 ＋ 火耐性Lv25 ＋ 水耐性Lv25" },
    { id: "神域のオーラ", kind: "passive", name: "神域のオーラ", hint: "全基礎ステータス80以上 ＋ (神聖至高職 または 大賢者 JLV40以上)" },
    // 隠しジョブ (10種)
    { id: "拳聖", kind: "job", name: "拳聖", hint: "基礎STR 45 ＋ 基礎AGI 45 ＋ 素手Lv30 ＋ 戦士JLV30" },
    { id: "アルケミスト", kind: "job", name: "アルケミスト", hint: "基礎INT 40 ＋ 基礎LUC 40 ＋ 調理Lv20 ＋ 工作Lv20 ＋ 採取Lv20" },
    { id: "ヴァルキリー", kind: "job", name: "ヴァルキリー", hint: "基礎STR 55 ＋ 基礎AGI 55 ＋ 基礎INT 45 ＋ 槍術Lv30 ＋ 盾術Lv25 ＋ 狩人JLV30" },
    { id: "アサシン", kind: "job", name: "アサシン", hint: "基礎AGI 60 ＋ 基礎DEX 50 ＋ 基礎LUC 45 ＋ 回避Lv30 ＋ 盗賊JLV50" },
    { id: "パラディン", kind: "job", name: "パラディン", hint: "基礎VIT 60 ＋ 基礎INT 40 ＋ 盾術Lv30 ＋ 警戒Lv25 ＋ 戦士JLV40" },
    { id: "ネクロマンサー", kind: "job", name: "ネクロマンサー", hint: "基礎INT 70 ＋ 基礎VIT 50 ＋ 魔法Lv35 ＋ 水魔法Lv25 ＋ 地魔法Lv25 ＋ 魔術師JLV45" },
    { id: "刀神", kind: "job", name: "刀神", hint: "基礎STR 85 ＋ 基礎DEX 75 ＋ 基礎AGI 70 ＋ (刀術Lv50 または 剣術Lv50) ＋ 戦士JLV50 ＋ 魔法剣士JLV40" },
    { id: "星詠みの賢者", kind: "job", name: "星詠みの賢者", hint: "基礎INT 85 ＋ 基礎LUC 75 ＋ 探索Lv35 ＋ 魔術師JLV60 ＋ 精霊使いJLV40" },
    { id: "ゴッドハンド", kind: "job", name: "ゴッドハンド", hint: "基礎STR 90 ＋ 基礎VIT 80 ＋ 基礎AGI 75 ＋ 素手Lv50 ＋ 拳聖JLV50 ＋ パラディンJLV40" },
    { id: "破壊神", kind: "job", name: "破壊神", hint: "基礎STR 80 ＋ 基礎VIT 65 ＋ 斧術Lv50 ＋ 強行Lv35 ＋ ベルセルクJLV40" },
    { id: "神弓・ホークアイ", kind: "job", name: "神弓・ホークアイ", hint: "基礎DEX 80 ＋ 基礎AGI 70 ＋ 弓術Lv50 ＋ 探索Lv35 ＋ 狩人JLV50" },
    { id: "大匠神", kind: "job", name: "大匠神", hint: "鍛冶・裁縫・工作・鍛錬すべてLv30 ＋ 魔導鍛冶師JLV40" },
    { id: "大豪商", kind: "job", name: "大豪商", hint: "基礎LUC 75 ＋ 交易Lv40 ＋ 採取Lv35 ＋ 調理Lv35 ＋ トレジャーシーカーJLV40" },
    { id: "万象の覇王", kind: "job", name: "万象の覇王", hint: "全基礎ステータス100以上 ＋ 任意の3ジョブをMASTER(Lv100)" }
];

// 9. 📜 ギルドランク昇格マスターデータ（ギルド依頼達成でGPを貯めて昇格！スキルセット枠が最大6枠まで拡張！）
const GUILD_RANKS = [
    { rank: "F",   reqGp: 0,    name: "ランクF: 見習いギルド員",           title: "見習いギルド員",     activeSlots: 3, maxActiveSlots: 3, passiveSlots: 3, maxPassiveSlots: 3, allStats: 0,  dropBonus: 0,  exPtBonus: 0,  exchangeBonus: 1.0,  desc: "初期ランク（アクティブ3枠 / パッシブ3枠）" },
    { rank: "E",   reqGp: 100,  name: "ランクE: 新米ギルド冒険者",         title: "新米ギルド冒険者",   activeSlots: 3, maxActiveSlots: 3, passiveSlots: 3, maxPassiveSlots: 3, allStats: 2,  dropBonus: 5,  exPtBonus: 5,  exchangeBonus: 1.05, desc: "全基礎ステ+2 / ドロップ率+5% / 納品Pt+5%" },
    { rank: "D",   reqGp: 300,  name: "ランクD: 一人前の冒険者",           title: "一人前の冒険者",     activeSlots: 4, maxActiveSlots: 4, passiveSlots: 3, maxPassiveSlots: 3, allStats: 5,  dropBonus: 10, exPtBonus: 10, exchangeBonus: 1.10, desc: "⚡アクティブスキル枠+1 (計4枠) / 全基礎ステ+5 / 泥率+10%" },
    { rank: "C",   reqGp: 700,  name: "ランクC: 熟練の依頼請負人",         title: "熟練の依頼請負人",   activeSlots: 4, maxActiveSlots: 4, passiveSlots: 4, maxPassiveSlots: 4, allStats: 9,  dropBonus: 15, exPtBonus: 15, exchangeBonus: 1.15, desc: "🌟パッシブスキル枠+1 (計4枠) / 全基礎ステ+9 / 泥率+15%" },
    { rank: "B",   reqGp: 1500, name: "ランクB: ベテランハンター",         title: "ベテランハンター",   activeSlots: 5, maxActiveSlots: 5, passiveSlots: 4, maxPassiveSlots: 4, allStats: 15, dropBonus: 22, exPtBonus: 20, exchangeBonus: 1.20, desc: "⚡アクティブスキル枠+1 (計5枠) / 全基礎ステ+15 / 泥率+22%" },
    { rank: "A",   reqGp: 2800, name: "ランクA: 特級ギルドエース",         title: "特級ギルドエース",   activeSlots: 5, maxActiveSlots: 5, passiveSlots: 5, maxPassiveSlots: 5, allStats: 22, dropBonus: 30, exPtBonus: 30, exchangeBonus: 1.30, desc: "🌟パッシブスキル枠+1 (計5枠) / 全基礎ステ+22 / 泥率+30%" },
    { rank: "S",   reqGp: 5000, name: "ランクS: 王国の英雄",               title: "王国の英雄",         activeSlots: 6, maxActiveSlots: 6, passiveSlots: 5, maxPassiveSlots: 5, allStats: 32, dropBonus: 40, exPtBonus: 40, exchangeBonus: 1.40, desc: "⚡アクティブスキル枠+1 (最大6枠!) / 全基礎ステ+32 / 泥率+40%" },
    { rank: "SS",  reqGp: 8500, name: "ランクSS: 大陸屈指のグランドマスター", title: "大陸屈指のグランドマスター", activeSlots: 6, maxActiveSlots: 6, passiveSlots: 6, maxPassiveSlots: 6, allStats: 45, dropBonus: 55, exPtBonus: 50, exchangeBonus: 1.50, desc: "🌟パッシブスキル枠+1 (最大6枠!) / 全基礎ステ+45 / 泥率+55%" },
    { rank: "SSS", reqGp: 14000,name: "ランクSSS: 神話に謳われしギルドの覇者", title: "神話に謳われしギルドの覇者", activeSlots: 6, maxActiveSlots: 6, passiveSlots: 6, maxPassiveSlots: 6, allStats: 65, dropBonus: 80, exPtBonus: 75, exchangeBonus: 1.75, desc: "👑全スキル最大6枠 / 全基礎ステ+65 / 泥率+80% / 納品Pt+75%" }
];

// 10. 🏆 実績＆プレイヤー称号（二つ名）マスターデータ
// 達成した実績に応じて「永久ステータスPt報酬」がもらえるほか、解放された『二つ名』を1つ装着して固有バフを得られる！
const PLAYER_TITLES = [
    {
        id: "駆け出し冒険者",
        name: "駆け出し冒険者",
        condDesc: "初期から所持",
        condition: "初期から所持",
        rewardStatPt: 0,
        buffDesc: "HP+15, MP+5, 獲得EXP+5%",
        desc: "HP+15, MP+5, 獲得EXP+5%",
        bonus: { hp: 15, mp: 5, expPct: 5 },
        check: () => true
    },
    {
        id: "森の開拓者",
        name: "森の開拓者",
        condDesc: "エリア1 BOSS「森の主ベア」を討伐する",
        condition: "エリア1 BOSS「森の主ベア」を討伐する",
        rewardStatPt: 5,
        buffDesc: "HP+40, ATK+6, DEF+5, 採取獲得数+10%確率UP",
        desc: "HP+40, ATK+6, DEF+5, 採取獲得数+10%確率UP",
        bonus: { hp: 40, atk: 6, def: 5 },
        check: (p) => (p.compendium?.monsters?.["森の主ベア"] || p.compendium?.monsters?.["森の主ベア"]?.defeatCount || 0) > 0 || (p.statsTrack?.bossKills || 0) >= 1
    },
    {
        id: "岩漿を砕く剛腕",
        name: "岩漿を砕く剛腕",
        condDesc: "エリア2 BOSS「ロックゴーレム」を討伐する",
        condition: "エリア2 BOSS「ロックゴーレム」を討伐する",
        rewardStatPt: 6,
        buffDesc: "HP+60, DEF+12, VIT+6, 物理防御貫通+5%",
        desc: "HP+60, DEF+12, VIT+6, 物理防御貫通+5%",
        bonus: { hp: 60, def: 12, vit: 6 },
        check: (p) => (p.compendium?.monsters?.["ロックゴーレム"] || p.compendium?.monsters?.["ロックゴーレム"]?.defeatCount || 0) > 0
    },
    {
        id: "深沼の巨蛇を屠る者",
        name: "深沼の巨蛇を屠る者",
        condDesc: "エリア3 BOSS「マッドハイドラ」を討伐する",
        condition: "エリア3 BOSS「マッドハイドラ」を討伐する",
        rewardStatPt: 8,
        buffDesc: "HP+80, MP+40, MATK+15, INT+6, 水耐性+10%",
        desc: "HP+80, MP+40, MATK+15, INT+6, 水耐性+10%",
        bonus: { hp: 80, mp: 40, matk: 15, int: 6 },
        check: (p) => (p.compendium?.monsters?.["マッドハイドラ"] || p.compendium?.monsters?.["マッドハイドラ"]?.defeatCount || 0) > 0
    },
    {
        id: "百戦錬磨の狩人",
        name: "百戦錬磨の狩人",
        condDesc: "モンスター累計討伐数 200体 達成",
        condition: "モンスター累計討伐数 200体 達成",
        rewardStatPt: 5,
        buffDesc: "ATK+12, DEX+5, 命中率+5%, ドロップ率+10%",
        desc: "ATK+12, DEX+5, 命中率+5%, ドロップ率+10%",
        bonus: { atk: 12, dex: 5, hit: 5, drop: 10 },
        check: (p) => (p.statsTrack?.totalKills || 0) >= 200
    },
    {
        id: "千人斬りの猛者",
        name: "千人斬りの猛者",
        condDesc: "モンスター累計討伐数 1,000体 達成",
        condition: "モンスター累計討伐数 1,000体 達成",
        rewardStatPt: 10,
        buffDesc: "ATK+28, MATK+28, STR+8, AGI+8, 会心率+8%",
        desc: "ATK+28, MATK+28, STR+8, AGI+8, 会心率+8%",
        bonus: { atk: 28, matk: 28, str: 8, agi: 8, critPct: 8 },
        check: (p) => (p.statsTrack?.totalKills || 0) >= 1000
    },
    {
        id: "不屈の万里行者",
        name: "不屈の万里行者",
        condDesc: "累計探索歩数 1,500歩 達成",
        condition: "累計探索歩数 1,500歩 達成",
        rewardStatPt: 5,
        buffDesc: "HP+80, VIT+8, AGI+8, 回避率+6%",
        desc: "HP+80, VIT+8, AGI+8, 回避率+6%",
        bonus: { hp: 80, vit: 8, agi: 8, eva: 6 },
        check: (p) => (p.statsTrack?.totalSteps || 0) >= 1500
    },
    {
        id: "名匠の弟子",
        name: "名匠の弟子",
        condDesc: "累計クラフト回数 50回 達成",
        condition: "累計クラフト回数 50回 達成",
        rewardStatPt: 5,
        buffDesc: "DEX+6, LUC+6, 交換屋納品Pt+15%, ドロップ率+12%",
        desc: "DEX+6, LUC+6, 交換屋納品Pt+15%, ドロップ率+12%",
        bonus: { dex: 6, luc: 6, exPtPct: 15, drop: 12 },
        check: (p) => (p.statsTrack?.craftCount || 0) >= 50
    },
    {
        id: "神匠の継承者",
        name: "神匠の継承者",
        condDesc: "装備を +10 以上に鍛錬する（または累計クラフト300回）",
        condition: "装備を +10 以上に鍛錬する（または累計クラフト300回）",
        rewardStatPt: 10,
        buffDesc: "全基礎ステ+10, ATK+30, DEF+25, 交換屋納品Pt+25%",
        desc: "全基礎ステ+10, ATK+30, DEF+25, 交換屋納品Pt+25%",
        bonus: { allStats: 10, atk: 30, def: 25, exPtPct: 25 },
        check: (p) => {
            if ((p.statsTrack?.craftCount || 0) >= 300) return true;
            if (p.equipment) {
                for (const slot in p.equipment) {
                    const eq = p.equipment[slot];
                    if (eq && typeof eq === "string") {
                        const parsed = typeof parseItemName === "function" ? parseItemName(eq) : null;
                        if (parsed && (parsed.plus || 0) >= 10) return true;
                    }
                }
            }
            if (p.inventory) {
                for (const name in p.inventory) {
                    const parsed = typeof parseItemName === "function" ? parseItemName(name) : null;
                    if (parsed && (parsed.plus || 0) >= 10) return true;
                }
            }
            return false;
        }
    },
    {
        id: "閃光のクリティカルマスター",
        name: "閃光のクリティカルマスター",
        condDesc: "累計クリティカル発動 150回 達成",
        condition: "累計クリティカル発動 150回 達成",
        rewardStatPt: 8,
        buffDesc: "DEX+10, AGI+10, 会心率+12%, ATK+20",
        desc: "DEX+10, AGI+10, 会心率+12%, ATK+20",
        bonus: { dex: 10, agi: 10, critPct: 12, atk: 20 },
        check: (p) => (p.statsTrack?.totalCrits || 0) >= 150
    },
    {
        id: "紅蓮を征す竜殺し",
        name: "紅蓮を征す竜殺し",
        condDesc: "エリア4 BOSS「インフェルノドレイク」を討伐する",
        condition: "エリア4 BOSS「インフェルノドレイク」を討伐する",
        rewardStatPt: 10,
        buffDesc: "HP+120, ATK+25, MATK+25, STR+10, 火耐性+20%",
        desc: "HP+120, ATK+25, MATK+25, STR+10, 火耐性+20%",
        bonus: { hp: 120, atk: 25, matk: 25, str: 10, fire_res: 20 },
        check: (p) => (p.compendium?.monsters?.["インフェルノドレイク"] || p.compendium?.monsters?.["インフェルノドレイク"]?.defeatCount || 0) > 0
    },
    {
        id: "機神を超えし者",
        name: "機神を超えし者",
        condDesc: "エリア5 BOSS「大廃墟の管理者・オメガ」を討伐する",
        condition: "エリア5 BOSS「大廃墟の管理者・オメガ」を討伐する",
        rewardStatPt: 12,
        buffDesc: "HP+160, MP+80, ATK+35, MATK+35, DEX+12, 命中+8%",
        desc: "HP+160, MP+80, ATK+35, MATK+35, DEX+12, 命中+8%",
        bonus: { hp: 160, mp: 80, atk: 35, matk: 35, dex: 12, hit: 8 },
        check: (p) => (p.compendium?.monsters?.["大廃墟の管理者・オメガ"] || p.compendium?.monsters?.["大廃墟の管理者・オメガ"]?.defeatCount || 0) > 0
    },
    {
        id: "天界の覇者",
        name: "天界の覇者",
        condDesc: "エリア6 BOSS「堕天王ルシファー」を討伐する",
        condition: "エリア6 BOSS「堕天王ルシファー」を討伐する",
        rewardStatPt: 15,
        buffDesc: "全基礎ステ+15, HP+220, MP+120, ATK/MATK+45, 獲得EXP+15%",
        desc: "全基礎ステ+15, HP+220, MP+120, ATK/MATK+45, 獲得EXP+15%",
        bonus: { allStats: 15, hp: 220, mp: 120, atk: 45, matk: 45, expPct: 15 },
        check: (p) => (p.compendium?.monsters?.["堕天王ルシファー"] || p.compendium?.monsters?.["堕天王ルシファー"]?.defeatCount || 0) > 0
    },
    {
        id: "星辰を翔ける竜王",
        name: "星辰を翔ける竜王",
        condDesc: "エリア7 BOSS「星竜コスモバハムート」を討伐する",
        condition: "エリア7 BOSS「星竜コスモバハムート」を討伐する",
        rewardStatPt: 20,
        buffDesc: "全基礎ステ+22, HP+350, ATK/MATK+70, 会心率+10%, 泥率+25%",
        desc: "全基礎ステ+22, HP+350, ATK/MATK+70, 会心率+10%, 泥率+25%",
        bonus: { allStats: 22, hp: 350, atk: 70, matk: 70, critPct: 10, drop: 25 },
        check: (p) => (p.compendium?.monsters?.["星竜コスモバハムート"] || p.compendium?.monsters?.["星竜コスモバハムート"]?.defeatCount || 0) > 0
    },
    {
        id: "黄昏を超越せし神殺し",
        name: "黄昏を超越せし神殺し",
        condDesc: "エリア8 BOSS「最高神オーディン・オルタ」を討伐する",
        condition: "エリア8 BOSS「最高神オーディン・オルタ」を討伐する",
        rewardStatPt: 30,
        buffDesc: "全基礎ステ+35, HP+550, MP+250, ATK/MATK+120, DEF/MDEF+80, 泥率+40%",
        desc: "全基礎ステ+35, HP+550, MP+250, ATK/MATK+120, DEF/MDEF+80, 泥率+40%",
        bonus: { allStats: 35, hp: 550, mp: 250, atk: 120, matk: 120, def: 80, mdef: 80, drop: 40 },
        check: (p) => (p.compendium?.monsters?.["最高神オーディン・オルタ"] || p.compendium?.monsters?.["最高神オーディン・オルタ"]?.defeatCount || 0) > 0
    },
    {
        id: "ギルドの頼れる英雄",
        name: "ギルドの頼れる英雄",
        condDesc: "ギルド依頼を累計 15回 達成する",
        condition: "ギルド依頼を累計 15回 達成する",
        rewardStatPt: 10,
        buffDesc: "全基礎ステ+12, 獲得EXP+15%, 交換屋納品Pt+20%, 泥率+20%",
        desc: "全基礎ステ+12, 獲得EXP+15%, 交換屋納品Pt+20%, 泥率+20%",
        bonus: { allStats: 12, expPct: 15, exPtPct: 20, drop: 20 },
        check: (p) => (p.guild?.completedCount || 0) >= 15
    },
    {
        id: "博識なる大蒐集家",
        name: "博識なる大蒐集家",
        condDesc: "冒険者図鑑の総合コンプリート率 50% 以上を達成",
        condition: "冒険者図鑑の総合コンプリート率 50% 以上を達成",
        rewardStatPt: 15,
        buffDesc: "全基礎ステ+18, LUC+20, ドロップ率+35%, 獲得EXP+15%",
        desc: "全基礎ステ+18, LUC+20, ドロップ率+35%, 獲得EXP+15%",
        bonus: { allStats: 18, luc: 20, drop: 35, expPct: 15 },
        check: () => (typeof calcCompendiumRate === "function" ? calcCompendiumRate() : 0) >= 50
    },
    {
        id: "森羅万象の生き字引",
        name: "森羅万象の生き字引",
        condDesc: "冒険者図鑑の総合コンプリート率 85% 以上を達成",
        condition: "冒険者図鑑の総合コンプリート率 85% 以上を達成",
        rewardStatPt: 25,
        buffDesc: "全基礎ステ+30, LUC+35, ATK/MATK+80, ドロップ率+60%, 獲得EXP+25%",
        desc: "全基礎ステ+30, LUC+35, ATK/MATK+80, ドロップ率+60%, 獲得EXP+25%",
        bonus: { allStats: 30, luc: 35, atk: 80, matk: 80, drop: 60, expPct: 25 },
        check: () => (typeof calcCompendiumRate === "function" ? calcCompendiumRate() : 0) >= 85
    }
];

// 11. 🌟 全30種スキル熟練度マスターデータ ＆ マイルストーン奥義アビリティ
// 各熟練度を特定レベル（Lv.10/25/50/100）まで鍛え上げることで、強力な永続パッシブや奥義が自動解放される！
const SKILL_MASTER_DATA = {
    // ⚔️ 武器・戦闘熟練度
    unarmed: {
        name: "素手熟練度", icon: "👊", category: "weapon",
        statDesc: "ATK+2, DEF+1",
        milestones: [
            { level: 10, name: "拳気の目覚め", desc: "素手装備時ATK+15, DEF+5" },
            { level: 25, name: "剛体練成", desc: "最大HP+80, DEF+15" },
            { level: 50, name: "氣功波", desc: "攻撃時、自身のMATKの40%を無属性ダメージとして追加上乗せ" },
            { level: 100, name: "【奥義】天地覇王拳", desc: "素手時、常時2回攻撃（2連打）が確定発動" }
        ]
    },
    sword: {
        name: "剣術熟練度", icon: "🗡️", category: "weapon",
        statDesc: "ATK+2, 会心率UP",
        milestones: [
            { level: 10, name: "鋭刃の呼吸", desc: "剣装備時ATK+12" },
            { level: 25, name: "剣閃の構え", desc: "会心率+4%, 剣装備時ATK+6%" },
            { level: 50, name: "剛剣の極致", desc: "会心率+6%, 会心ダメージ倍率+0.25倍" },
            { level: 100, name: "【奥義】一刀両断", desc: "攻撃時20%で敵DEF完全無視＋威力1.6倍の超会心一撃" }
        ]
    },
    katana: {
        name: "刀術熟練度", icon: "⚔️", category: "weapon",
        statDesc: "ATK+3, 会心率+0.3%, 会心ダメ+1%",
        milestones: [
            { level: 10, name: "刃筋の調律", desc: "会心率+3%, AGI+6" },
            { level: 25, name: "居合の構え", desc: "刀装備時、会心ダメージ+25%" },
            { level: 50, name: "抜刀術・疾風", desc: "戦闘開始時の初撃が必ずクリティカルヒット" },
            { level: 100, name: "【奥義】無念無想・桜花閃", desc: "会心発生時、敵の反撃を封じつつ追加で3連続の斬撃追撃" }
        ]
    },
    spear: {
        name: "槍術熟練度", icon: "🔱", category: "weapon",
        statDesc: "ATK+2, 防御貫通",
        milestones: [
            { level: 10, name: "長柄の間合い", desc: "槍装備時ATK+10, 命中+3%" },
            { level: 25, name: "竜穿の切っ先", desc: "敵DEF12%貫通, 槍装備時ATK+6%" },
            { level: 50, name: "穿孔螺旋撃", desc: "敵DEF25%貫通, 命中率+8%" },
            { level: 100, name: "【奥義】天翔龍閃槍", desc: "攻撃時25%で敵をスタン（行動不能）にし、威力1.8倍の貫通突撃" }
        ]
    },
    axe: {
        name: "斧術熟練度", icon: "🪓", category: "weapon",
        statDesc: "ATK+3",
        milestones: [
            { level: 10, name: "重撃の破壊力", desc: "ATK+15, STR+6" },
            { level: 25, name: "剛力粉砕", desc: "斧装備時ATK+10%, STR+12" },
            { level: 50, name: "兜割り", desc: "攻撃時、敵のDEFを戦闘中永続で15%粉砕低下させる" },
            { level: 100, name: "【奥義】大旋風・滅殺壊", desc: "攻撃時25%で威力2.2倍の壊滅的一撃を叩き込む" }
        ]
    },
    bow: {
        name: "弓術熟練度", icon: "🏹", category: "weapon",
        statDesc: "ATK+2, 命中+0.5%",
        milestones: [
            { level: 10, name: "射手の集中", desc: "命中率+5%, DEX+6" },
            { level: 25, name: "鷹の眼", desc: "弓装備時先制攻撃率+15%, 命中率+8%" },
            { level: 50, name: "百発百中", desc: "攻撃が絶対に外れなくなる（命中下限95%保証）" },
            { level: 100, name: "【奥義】神弓・天矢乱れ降し", desc: "通常攻撃時35%で矢の雨（2〜3回追撃）が自動炸裂" }
        ]
    },
    gun: {
        name: "銃術熟練度", icon: "🔫", category: "weapon",
        statDesc: "ATK+2, 固定追撃+2, 命中+0.5%",
        milestones: [
            { level: 10, name: "早撃ちの心得", desc: "固定追撃ダメージ+20" },
            { level: 25, name: "高精度バレル", desc: "銃装備時会心倍率+0.35倍, 命中+8%" },
            { level: 50, name: "バースト機構", desc: "固定追撃ダメージが常時2.5倍に強化" },
            { level: 100, name: "【奥義】ジェノサイド・トリガー", desc: "会心攻撃時、敵の最大HPの3%（ボス上限あり）を固定消滅させる" }
        ]
    },
    magic: {
        name: "魔法熟練度", icon: "✨", category: "weapon",
        statDesc: "HP+5, MP+5, MATK+2, MDEF+1",
        milestones: [
            { level: 10, name: "魔導の脈動", desc: "MATK+15, 最大MP+30" },
            { level: 25, name: "詠唱加速", desc: "アクティブスキル発動率+6%" },
            { level: 50, name: "マインドフロー", desc: "全スキル・魔法の消費MPを25%カット" },
            { level: 100, name: "【奥義】アルテマ・ディザスター", desc: "魔法攻撃時25%で無属性極大追撃（MATKの150%）が炸裂" }
        ]
    },

    // 🔥 4大属性魔法熟練度
    fireMagic: {
        name: "火魔法熟練度", icon: "🔥", category: "magic",
        statDesc: "MP+3, MATK+2, 火威力+3%",
        milestones: [
            { level: 25, name: "劫火の印", desc: "火属性威力+15%, MATK+15" },
            { level: 50, name: "インフェルノ・フレア", desc: "火属性攻撃命中時、敵に火傷（毎ターン大ダメージ）付与" },
            { level: 100, name: "【奥義】獄炎の支配者", desc: "火属性威力+40%, 火魔法攻撃時50%で2回連続詠唱" }
        ]
    },
    waterMagic: {
        name: "水魔法熟練度", icon: "💧", category: "magic",
        statDesc: "MP+3, MATK+2, 水威力+3%",
        milestones: [
            { level: 25, name: "清流の印", desc: "水属性威力+15%, 最大MP+40" },
            { level: 50, name: "コキュートス・フロスト", desc: "水属性攻撃命中時、敵を凍結（行動確率低下）" },
            { level: 100, name: "【奥義】蒼海の支配者", desc: "水属性威力+40%, 毎ターンMP5%自動回復" }
        ]
    },
    windMagic: {
        name: "風魔法熟練度", icon: "🌪️", category: "magic",
        statDesc: "MP+3, MATK+2, 風威力+3%",
        milestones: [
            { level: 25, name: "疾風の印", desc: "風属性威力+15%, 回避率+4%" },
            { level: 50, name: "エアロ・テンペスト", desc: "風属性攻撃時、自身の回避率と行動速度がさらに上昇" },
            { level: 100, name: "【奥義】嵐神の支配者", desc: "風属性威力+40%, 回避成功時に自動で風刃反撃" }
        ]
    },
    earthMagic: {
        name: "地魔法熟練度", icon: "🪨", category: "magic",
        statDesc: "MP+3, MATK+2, 地威力+3%",
        milestones: [
            { level: 25, name: "金剛の印", desc: "地属性威力+15%, DEF+20" },
            { level: 50, name: "ガイア・クエイク", desc: "地属性攻撃命中時、敵の攻撃力を15%低下" },
            { level: 100, name: "【奥義】大地母神の支配者", desc: "地属性威力+40%, 毎ターン最大HPの4%を障壁として再生" }
        ]
    },

    // 🛡️ 防御・耐性熟練度
    shield: {
        name: "盾術熟練度", icon: "🛡️", category: "defense",
        statDesc: "HP+10, DEF+2, 盾軽減+1%",
        milestones: [
            { level: 10, name: "重盾の構え", desc: "DEF+15, HP+60" },
            { level: 25, name: "シールドブロック", desc: "盾装備時被ダメージ軽減率+10%" },
            { level: 50, name: "パリィカウンター", desc: "被弾時12%の確率で被ダメージを0にして即時反撃" },
            { level: 100, name: "【奥義】イージスの絶対城壁", desc: "致死ダメージを受けた際、戦闘中1度だけHP1で必ず耐え抜く" }
        ]
    },
    evasion: {
        name: "回避熟練度", icon: "💨", category: "defense",
        statDesc: "回避+0.5%, AGI+1",
        milestones: [
            { level: 10, name: "身軽な足捌き", desc: "回避率+3%, AGI+8" },
            { level: 25, name: "シャドウステップ", desc: "回避成功時に自身のMPが5回復" },
            { level: 50, name: "幻惑の見切り", desc: "回避率の上限が50% ➔ 60%に突破開放" },
            { level: 100, name: "【奥義】明鏡止水・空蝉", desc: "被弾時20%で分身が身代わりとなり完全無効化" }
        ]
    },
    survival: {
        name: "生存熟練度", icon: "❤️‍🩹", category: "defense",
        statDesc: "HP+10, DEF+1, MDEF+1, 逆境被ダメカット",
        milestones: [
            { level: 10, name: "タフガイ", desc: "最大HP+80, VIT+6" },
            { level: 25, name: "応急手当の心得", desc: "毎ターン終了時にHPが3%自然再生" },
            { level: 50, name: "不屈の闘志", desc: "HP30%以下のピンチ時、受ける全ダメージを30%カット" },
            { level: 100, name: "【奥義】不死鳥の魂", desc: "毎ターンHP5%＆MP3%再生、さらに戦闘不能時に即時HP30%蘇生（1戦闘1回）" }
        ]
    },
    fireRes: {
        name: "火耐性熟練度", icon: "🛡️🔥", category: "defense",
        statDesc: "HP+5, MDEF+1, 火軽減+1%",
        milestones: [
            { level: 25, name: "耐火皮膜", desc: "火耐性+15%, MDEF+15" },
            { level: 50, name: "サラマンダーの加護", desc: "火耐性の上限が80% ➔ 90%に突破開放" },
            { level: 100, name: "【奥義】火神結界", desc: "火属性攻撃を受けた際、ダメージの25%を吸収してHP回復" }
        ]
    },
    waterRes: {
        name: "水耐性熟練度", icon: "🛡️💧", category: "defense",
        statDesc: "HP+5, MDEF+1, 水軽減+1%",
        milestones: [
            { level: 25, name: "耐水皮膜", desc: "水耐性+15%, MDEF+15" },
            { level: 50, name: "ウンディーネの加護", desc: "水耐性の上限が80% ➔ 90%に突破開放" },
            { level: 100, name: "【奥義】水神結界", desc: "水属性攻撃を受けた際、ダメージの25%を吸収してHP回復" }
        ]
    },
    windRes: {
        name: "風耐性熟練度", icon: "🛡️🌪️", category: "defense",
        statDesc: "AGI+1, 回避+0.3%, 風軽減+1%",
        milestones: [
            { level: 25, name: "防風のベール", desc: "風耐性+15%, 回避率+4%" },
            { level: 50, name: "シルフの加護", desc: "風耐性の上限が80% ➔ 90%に突破開放" },
            { level: 100, name: "【奥義】風神結界", desc: "風属性攻撃を受けた際、ダメージの25%を吸収してHP回復" }
        ]
    },
    earthRes: {
        name: "地耐性熟練度", icon: "🛡️🪨", category: "defense",
        statDesc: "VIT+1, DEF+1, 地軽減+1%",
        milestones: [
            { level: 25, name: "金剛外殻", desc: "地耐性+15%, DEF+20" },
            { level: 50, name: "ノームの加護", desc: "地耐性の上限が80% ➔ 90%に突破開放" },
            { level: 100, name: "【奥義】地神結界", desc: "地属性攻撃を受けた際、ダメージの25%を吸収してHP回復" }
        ]
    },

    // 🔨 クラフト・生産・交易熟練度
    blacksmith: {
        name: "鍛冶熟練度", icon: "🔨", category: "craft",
        statDesc: "STR+1, DEF+1, 鍛冶良称号率UP",
        milestones: [
            { level: 25, name: "名工の鎚音", desc: "鍛冶クラフト時、良称号昇格率+8%" },
            { level: 50, name: "魂の鍛造", desc: "製作した武器の基本ATKが常時+10%上乗せ" },
            { level: 100, name: "【奥義】神授の鍛冶神", desc: "クラフト時、20%の確率で素材を一切消費せず製作" }
        ]
    },
    handicraft: {
        name: "工作熟練度", icon: "⚙️", category: "craft",
        statDesc: "DEX+1, 命中+0.3%, 工作良称号率UP",
        milestones: [
            { level: 25, name: "精密加工", desc: "工作クラフト時、良称号昇格率+8%" },
            { level: 50, name: "精緻なる細工", desc: "製作した弓・銃・装飾品のクリティカル率+4%" },
            { level: 100, name: "【奥義】カラクリ神業", desc: "装飾品スロットの全ステータス反映率が1.25倍に強化" }
        ]
    },
    sewing: {
        name: "裁縫熟練度", icon: "🧵", category: "craft",
        statDesc: "INT+1, MDEF+1, 裁縫良称号率UP",
        milestones: [
            { level: 25, name: "神糸の紡ぎ手", desc: "裁縫クラフト時、良称号昇格率+8%" },
            { level: 50, name: "魔導織布", desc: "製作した防具の属性耐性が常時+5%上乗せ" },
            { level: 100, name: "【奥義】天衣無縫", desc: "防具スロット（頭・体・腕・足）のDEF/MDEF反映率が1.25倍に強化" }
        ]
    },
    cooking: {
        name: "調理熟練度", icon: "🍳", category: "craft",
        statDesc: "HP+10, MP+5, 料理回復量・持続UP",
        milestones: [
            { level: 25, name: "極上の一皿", desc: "料理・秘薬の回復量および獲得EXPバフ+20%" },
            { level: 50, name: "美食家の知恵", desc: "修練料理・秘薬のバフ持続歩数が+150歩延長" },
            { level: 100, name: "【奥義】神々の晩餐", desc: "料理・秘薬バフ持続歩数が2倍（最大1,000歩持続）" }
        ]
    },
    refining: {
        name: "鍛錬熟練度", icon: "⚒️", category: "craft",
        statDesc: "全基礎ステ+0.5, 鍛錬成功率・補正UP",
        milestones: [
            { level: 10, name: "金槌の慣れ", desc: "鍛錬成功率+3%" },
            { level: 25, name: "名工の研磨", desc: "鍛錬（+値）による全ステータス上昇値が+15%強化" },
            { level: 50, name: "神匠の研鑽", desc: "鍛錬成功率+8%, 称号継承の成功率が100%確定" },
            { level: 100, name: "【奥義】神話級限界突破", desc: "鍛錬（+値）のステータス上昇値が+35%強化、さらに鍛錬失敗時の破損リスク完全消滅" }
        ]
    },
    trading: {
        name: "交易熟練度", icon: "⚖️", category: "craft",
        statDesc: "LUC+2, 泥率+0.5%, 納品Ptボーナス",
        milestones: [
            { level: 10, name: "商人の目利き", desc: "交換屋の納品獲得Pt+6%" },
            { level: 25, name: "豪商の交渉術", desc: "交換屋の納品獲得Pt+15%, ドロップ率+8%" },
            { level: 50, name: "黄金の嗅覚", desc: "交換屋の納品獲得Pt+25%, LUC+20" },
            { level: 100, name: "【奥義】ミダスタッチ", desc: "納品獲得Pt+40%, さらに敵撃破時に交換Ptが追加ドロップ" }
        ]
    },

    // 🧭 探索・行動熟練度
    careful: {
        name: "警戒熟練度", icon: "👣", category: "action",
        statDesc: "HP+8, DEF+2, MDEF+2, 慎重回復量UP",
        milestones: [
            { level: 10, name: "危機察知", desc: "不意打ち・奇襲を受ける確率が半減" },
            { level: 25, name: "周到な足運び", desc: "慎重探索時のHP・MP回復量が2倍" },
            { level: 50, name: "鉄壁の警戒網", desc: "慎重探索中、遭遇した敵の初撃ダメージを50%カット" },
            { level: 100, name: "【奥義】心眼無想", desc: "慎重探索中、毎歩状態異常が全回復し、選択肢イベント成功率+30%" }
        ]
    },
    rush: {
        name: "強行熟練度", icon: "⚔️", category: "action",
        statDesc: "ATK+3, MATK+3, 強襲威力UP",
        milestones: [
            { level: 10, name: "突進力", desc: "強行突破時の獲得熟練度倍率が1.6倍に強化" },
            { level: 25, name: "猛牛の進撃", desc: "強襲攻撃時の与ダメージが1.5倍に強化" },
            { level: 50, name: "電光石火", desc: "強行突破時に確率で4歩一気に進む" },
            { level: 100, name: "【奥義】破竹の覇道", desc: "強襲攻撃が常に全体攻撃化し、レア敵出現率が5倍に跳ね上がる" }
        ]
    },
    search: {
        name: "探索熟練度", icon: "🔍", category: "action",
        statDesc: "泥率+2%, 命中+0.5%, イベント成功率+2%",
        milestones: [
            { level: 10, name: "観察眼", desc: "ドロップ率+8%, LUC+6" },
            { level: 25, name: "宝探しの勘", desc: "集中探索時の良称号・レアドロップ率が2倍" },
            { level: 50, name: "トレジャーマスター", desc: "ダンジョン内での隠し宝箱・鉱脈発見率が大幅UP" },
            { level: 100, name: "【奥義】神の千里眼", desc: "ドロップ補正+40%, 全選択肢イベントの成否を事前に看破" }
        ]
    },
    gathering: {
        name: "採取熟練度", icon: "🌿", category: "action",
        statDesc: "MP+5, 採取数UP, 良称号率UP",
        milestones: [
            { level: 10, name: "薬草摘み", desc: "採取獲得数+1個の確率が30%" },
            { level: 25, name: "大地の恵み", desc: "採取獲得数が常時+1個確定" },
            { level: 50, name: "秘境の群生地", desc: "手動採取時、採取獲得数が常時+2個確定 ＆ 良称号率2倍" },
            { level: 100, name: "【奥義】神仙の豊穣", desc: "採取時、低確率で全エリアの神話級・激レア素材が混ざり込む" }
        ]
    },
    autoWalk: {
        name: "行軍熟練度", icon: "🚶", category: "action",
        statDesc: "HP+5, 回避+0.3%, オートチャンス率UP",
        milestones: [
            { level: 10, name: "健脚の旅人", desc: "オート探索中、毎歩HP/MPが微回復" },
            { level: 25, name: "万里行軍", desc: "オート中の⚡クリックチャンス発生率が1.5倍" },
            { level: 50, name: "神速の歩調", desc: "オートチャンス発生率2倍 ＆ 獲得ボーナス2倍" },
            { level: 100, name: "【奥義】縮地の境地", desc: "オート探索の基礎進行スピードが15%恒久加速" }
        ]
    }
};

// 12. 🌌 トータル総合熟練度共鳴マスターデータ (全30種の合計レベルに応じて主人公が永久強化！)
const SKILL_RESONANCE_TIERS = [
    { reqTotal: 50,   name: "熟練の萌芽",       bonus: { allStats: 3,  hp: 30,   mp: 15,  expPct: 3,  drop: 3 },  desc: "全基礎ステ+3, HP+30, MP+15, EXP+3%" },
    { reqTotal: 100,  name: "開花せし技芸",     bonus: { allStats: 6,  hp: 60,   mp: 30,  expPct: 6,  drop: 6 },  desc: "全基礎ステ+6, HP+60, MP+30, EXP+6%, 泥率+6%" },
    { reqTotal: 200,  name: "百戦の風格",       bonus: { allStats: 12, hp: 120,  mp: 60,  expPct: 10, drop: 10, skillExpPct: 10 }, desc: "全基礎ステ+12, HP+120, MP+60, 泥率+10%, 熟練度EXP+10%" },
    { reqTotal: 300,  name: "極致への道標",     bonus: { allStats: 20, hp: 200,  mp: 100, critPct: 3, drop: 12, skillExpPct: 15 }, desc: "全基礎ステ+20, HP+200, MP+100, 会心率+3%, 熟練度EXP+15%" },
    { reqTotal: 500,  name: "万象に通ずる達人", bonus: { allStats: 35, hp: 350,  mp: 180, critPct: 5, critDmg: 0.15, expPct: 15, skillExpPct: 20, drop: 15 }, desc: "全基礎ステ+35, HP+350, MP+180, 会心率+5%, 会心倍率+0.15, EXP+15%" },
    { reqTotal: 750,  name: "千古不磨の武神",   bonus: { allStats: 55, hp: 550,  mp: 280, skillRate: 5, critPct: 6, skillExpPct: 25, drop: 20 }, desc: "全基礎ステ+55, HP+550, MP+280, スキル発動+5%, 泥率+20%, 熟練度EXP+25%" },
    { reqTotal: 1000, name: "神域に届きし技",   bonus: { allStats: 80, hp: 800,  mp: 400, allRes: 10, critPct: 8, critDmg: 0.25, skillExpPct: 30, drop: 25 }, desc: "全基礎ステ+80, HP+800, MP+400, 会心率+8%, 全耐性+10%, 泥率+25%" },
    { reqTotal: 1500, name: "森羅万象の超越者", bonus: { allStats: 130, hp: 1400, mp: 700, allRes: 20, critPct: 12, critDmg: 0.40, skillExpPct: 40, drop: 35 }, desc: "全基礎ステ+130, HP+1400, MP+700, 全耐性+20%, 会心倍率+0.4, 泥率+35%" },
    { reqTotal: 2000, name: "👑 神技の覇王",     bonus: { allStats: 200, hp: 2200, mp: 1100, allRes: 30, critPct: 15, critDmg: 0.60, dmgCutPct: 15, dmgDealtPct: 20, drop: 50, skillExpPct: 50 }, desc: "全基礎ステ+200, HP+2200, MP+1100, 被ダメ15%カット, 与ダメ+20%, 全耐性+30%, 泥率+50%" }
];

// 12.5 🌟 全熟練度Lv.150 / Lv.200 極限マイルストーン自動拡張
(function appendExtremeSkillMilestones() {
    if (typeof SKILL_MASTER_DATA === "undefined") return;
    const catBonus150 = {
        weapon:  { desc: "ATK+8%, MATK+8%, 会心率+3%", bonus: { atkPct: 8, matkPct: 8, critRate: 3 } },
        magic:   { desc: "MATK+10%, 最大MP+100", bonus: { matkPct: 10, flatMp: 100 } },
        defense: { desc: "最大HP+200, DEF+10%, MDEF+10%", bonus: { flatHp: 200, defPct: 10, mdefPct: 10 } },
        craft:   { desc: "全基礎能力強化（HP+150, ATK+30, DEF+30）", bonus: { flatHp: 150, flatAtk: 30, flatDef: 30 } },
        action:  { desc: "ドロップ率+15%, 命中+4%, 回避+3%", bonus: { dropRate: 15, hitRate: 4, evaRate: 3 } }
    };
    const catBonus200 = {
        weapon:  { desc: "ATK+15%, MATK+15%, 会心ダメ+30%", bonus: { atkPct: 15, matkPct: 15, critDmg: 30 } },
        magic:   { desc: "MATK+18%, スキル発動率+4%", bonus: { matkPct: 18, skillRate: 4 } },
        defense: { desc: "最大HP+400, 被ダメ3%軽減, 毎ターンHP2%回復", bonus: { flatHp: 400, dmgCutPct: 3, hpRegenPct: 2 } },
        craft:   { desc: "ATK+60, MATK+60, DEF+60, MDEF+60", bonus: { flatAtk: 60, flatMatk: 60, flatDef: 60, flatMdef: 60 } },
        action:  { desc: "ドロップ率+30%, スキル発動率+4%, 回避+4%", bonus: { dropRate: 30, skillRate: 4, evaRate: 4 } }
    };
    for (const key in SKILL_MASTER_DATA) {
        const s = SKILL_MASTER_DATA[key];
        const b150 = catBonus150[s.category] || catBonus150.action;
        const b200 = catBonus200[s.category] || catBonus200.action;
        const baseTitle = s.name.replace("熟練度", "");
        s.milestones.push(
            { level: 150, name: `【極限】${baseTitle}の極致`, desc: b150.desc, extremeBonus: b150.bonus },
            { level: 200, name: `【神域】${baseTitle}神髄`, desc: b200.desc, extremeBonus: b200.bonus }
        );
    }
})();

// 13. 🔗 複合シナジー奥義 (複数熟練度の組み合わせで自動解放される秘技)
const SKILL_SYNERGY_ARTS = [
    {
        id: "iaigiri_mind",
        name: "心眼・居合斬り",
        icon: "⚔️🍃",
        condDesc: "刀術Lv.50 ＋ 回避Lv.50",
        desc: "会心率+10%, 会心ダメージ倍率+25%, 回避率+5%",
        check: (sk) => (sk.katana?.level || 1) >= 50 && (sk.evasion?.level || 1) >= 50,
        bonus: { critRate: 10, critDmg: 25, evaRate: 5 }
    },
    {
        id: "fortress_tank",
        name: "不動の重戦車",
        icon: "🛡️🪨",
        condDesc: "盾術Lv.50 ＋ 生存Lv.50",
        desc: "最大HP+15%, DEF+15%, 被ダメージ5%軽減",
        check: (sk) => (sk.shield?.level || 1) >= 50 && (sk.survival?.level || 1) >= 50,
        bonus: { hpPct: 15, defPct: 15, dmgCutPct: 5 }
    },
    {
        id: "double_chant",
        name: "二重詠唱・極",
        icon: "🔮✨",
        condDesc: "魔法Lv.50 ＋ 火魔法Lv.30 ＋ 水魔法Lv.30",
        desc: "MATK+12%, スキル発動率+8%",
        check: (sk) => (sk.magic?.level || 1) >= 50 && (sk.fireMagic?.level || 1) >= 30 && (sk.waterMagic?.level || 1) >= 30,
        bonus: { matkPct: 12, skillRate: 8 }
    },
    {
        id: "storm_combo",
        name: "嵐の連撃",
        icon: "👊🔥",
        condDesc: "素手Lv.50 ＋ 強行Lv.40",
        desc: "物理ATK+12%, 毎行動時HP2%自動回復",
        check: (sk) => (sk.unarmed?.level || 1) >= 50 && (sk.rush?.level || 1) >= 40,
        bonus: { atkPct: 12, hpRegenPct: 2 }
    },
    {
        id: "precision_snipe",
        name: "精密狙撃システム",
        icon: "🏹🔫",
        condDesc: "弓術Lv.40 ＋ 銃術Lv.40 ＋ 探索Lv.40",
        desc: "命中率+10%, 敵防御15%貫通, 会心率+8%",
        check: (sk) => (sk.bow?.level || 1) >= 40 && (sk.gun?.level || 1) >= 40 && (sk.search?.level || 1) >= 40,
        bonus: { hitRate: 10, defPierce: 15, critRate: 8 }
    },
    {
        id: "divine_forging",
        name: "神域鍛造の秘儀",
        icon: "⚒️🧵",
        condDesc: "鍛冶Lv.40 ＋ 鍛錬Lv.40 ＋ 裁縫Lv.40",
        desc: "全基礎ステータス+15, DEF/MDEF+10%",
        check: (sk) => (sk.blacksmith?.level || 1) >= 40 && (sk.refining?.level || 1) >= 40 && (sk.sewing?.level || 1) >= 40,
        bonus: { allStats: 15, defPct: 10, mdefPct: 10 }
    },
    {
        id: "golden_route",
        name: "黄金の探索ルート",
        icon: "🌿⚖️",
        condDesc: "採取Lv.40 ＋ 交易Lv.40 ＋ 行軍Lv.40",
        desc: "ドロップ率+35%, 獲得EXP+15%",
        check: (sk) => (sk.gathering?.level || 1) >= 40 && (sk.trading?.level || 1) >= 40 && (sk.autoWalk?.level || 1) >= 40,
        bonus: { dropRate: 35, expPct: 15 }
    },
    {
        id: "elemental_harmony",
        name: "森羅万象の調和",
        icon: "🌈✨",
        condDesc: "火/水/風/地耐性 すべてLv.40以上",
        desc: "全基礎ステータス+20, 毎行動時HP/MP 2%自動回復",
        check: (sk) => (sk.fireRes?.level || 1) >= 40 && (sk.waterRes?.level || 1) >= 40 && (sk.windRes?.level || 1) >= 40 && (sk.earthRes?.level || 1) >= 40,
        bonus: { allStats: 20, hpRegenPct: 2, mpRegenPct: 2 }
    }
];

// 14. 🔀 サブジョブ（副職継承）効果マスターデータ（MASTER済みジョブを副職にセットすると継承効果を発揮！）
const SUB_JOB_EFFECTS = {
    "冒険者":             { desc: "獲得EXP/JLV+8%, 全基礎ステ+5", expMult: 0.08, allStats: 5 },
    "戦士":               { desc: "ATK+8%, HP+8%", atkMult: 0.08, hpMult: 0.08 },
    "魔術師":             { desc: "MATK+8%, MP+8%", matkMult: 0.08, mpMult: 0.08 },
    "狩人":               { desc: "命中+6%, 会心率+5%, AGI+5%", hitRate: 6, critRate: 0.05, agiMult: 0.05 },
    "盗賊":               { desc: "ドロップ率+12%, 回避+5%", dropBonus: 12, evaRate: 5 },
    "魔法剣士":           { desc: "ATK+8%, MATK+8%", atkMult: 0.08, matkMult: 0.08 },
    "ガンスリンガー":     { desc: "銃時ATK+15%, 会心率+6%, 回避+4%", gunAtkMult: 0.15, critRate: 0.06, evaRate: 4 },
    "魔導鍛冶師":         { desc: "DEF+10%, MDEF+10%, クラフト熟練度+15%", defMult: 0.10, mdefMult: 0.10, craftSkillExp: 0.15 },
    "精霊使い":           { desc: "MATK+12%, MP+12%", matkMult: 0.12, mpMult: 0.12 },
    "レンジャー":         { desc: "命中+5%, 回避+5%, 採取熟練度+20%", hitRate: 5, evaRate: 5, gatherSkillExp: 0.20 },
    "ベルセルク":         { desc: "ATK+12%, 会心ダメ+15%", atkMult: 0.12, critDmg: 0.15 },
    "トレジャーシーカー": { desc: "ドロップ率+20%", dropBonus: 20 },
    "竜騎士":             { desc: "槍時HP+25%, 槍時ATK+25%", spearHpMult: 0.25, spearAtkMult: 0.25 },
    "魔導機工師":         { desc: "ドロップ率+25%, スキル発動率+10%", dropBonus: 25, skillTriggerMult: 0.10 },
    "神聖至高職":         { desc: "最大MP+40%, 全属性耐性強化(+15%)", mpMult: 0.40, allResMult: 0.15 },
    "大賢者":             { desc: "MATK+20%, スキル発動率+10%", matkMult: 0.20, skillTriggerMult: 0.10 },
    "深淵の踏破者":       { desc: "HP/ATK/MATK+12%, 熟練度獲得+25%", hpMult: 0.12, atkMult: 0.12, matkMult: 0.12, allSkillExp: 0.25 },
    "拳聖":               { desc: "素手/拳時ATK+50%, 回避+8%", fistAtkMult: 0.50, evaRate: 8 },
    "アルケミスト":       { desc: "ドロップ率+15%, MP+15%, 納品Pt+15%", dropBonus: 15, mpMult: 0.15, exchangeBonus: 0.15 },
    "ヴァルキリー":       { desc: "ATK/MATK/DEF+15%, 回避+5%", atkMult: 0.15, matkMult: 0.15, defMult: 0.15, evaRate: 5 },
    "アサシン":           { desc: "回避+6%, 会心率+12%, 泥率+18%", evaRate: 6, critRate: 0.12, dropBonus: 18 },
    "パラディン":         { desc: "DEF/MDEF+20%, 被ダメ10%軽減", defMult: 0.20, mdefMult: 0.20, dmgCut: 0.10 },
    "ネクロマンサー":     { desc: "MATK+18%, MP+12%, 攻撃時HP4%・MP2%吸収", matkMult: 0.18, mpMult: 0.12, drainHp: 0.04, drainMp: 0.02 },
    "刀神":               { desc: "刀時ATK+35%(剣+25%), 会心率+15%, 命中+6%, スキル発動+12%", katanaAtkMult: 0.35, swordAtkMult: 0.25, critRate: 0.15, hitRate: 6, skillTriggerMult: 0.12 },
    "星詠みの賢者":       { desc: "MATK+20%, スキル発動+15%, 泥率+20%", matkMult: 0.20, skillTriggerMult: 0.15, dropBonus: 20 },
    "ゴッドハンド":       { desc: "素手/拳時ATK+60%, DEF/MDEF+20%, HP+15%", fistAtkMult: 0.60, defMult: 0.20, mdefMult: 0.20, hpMult: 0.15 },
    "破壊神":             { desc: "斧時ATK+40%, 敵DEF15%貫通, 会心ダメ+20%", axeAtkMult: 0.40, defPierce: 0.15, critDmg: 0.20 },
    "神弓・ホークアイ":   { desc: "弓時ATK+35%, 命中+10%, 会心率+12%, 回避+5%", bowAtkMult: 0.35, hitRate: 10, critRate: 0.12, evaRate: 5 },
    "大匠神":             { desc: "DEF/MDEF+18%, クラフト熟練度+25%, 全ステ+10", defMult: 0.18, mdefMult: 0.18, craftSkillExp: 0.25, allStats: 10 },
    "大豪商":             { desc: "ドロップ率+30%, 納品Pt+25%, 獲得EXP+12%", dropBonus: 30, exchangeBonus: 0.25, expMult: 0.12 },
    "万象の覇王":         { desc: "全能力(HP/MP/ATK/MATK/DEF/MDEF)+18%, 泥率+30%", hpMult: 0.18, mpMult: 0.18, atkMult: 0.18, matkMult: 0.18, defMult: 0.18, mdefMult: 0.18, dropBonus: 30 }
};
