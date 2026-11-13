// 1. ゲームデータ
const player = {
    level: 1, exp: 0, nextExp: 100, statPoints: 0, // PLV関連
    job: "冒険者",
    jobLevels: {
        "冒険者": { level: 1, exp: 0, nextExp: 100, isMaster: false }
    }, // 各ジョブのレベル管理
    stats: { str: 10, int: 10, vit: 10, dex: 10, agi: 10, luc: 10 }, // 基礎ステータス
    hp: 0, maxHp: 0, // calcStatusで初期化される
    mp: 0, maxMp: 0,
    atk: 0, matk: 0, def: 0, mdef: 0,
    hitRate: 0, evasionRate: 0, dropRateBonus: 0,
    equipment: { 
        weapon: null, subWeapon: null, head: null, 
        body: null, arm: null, leg: null, 
        acc1: null, acc2: null, acc3: null 
    }, // 9スロット装備情報
    skills: {
        unarmed: { level: 1, exp: 0, next: 10 },
        sword: { level: 1, exp: 0, next: 10 },
        katana: { level: 1, exp: 0, next: 10 }, // ⚔️ 刀術熟練度
        magic: { level: 1, exp: 0, next: 10 },
        sewing: { level: 1, exp: 0, next: 10 },
        blacksmith: { level: 1, exp: 0, next: 10 },
        handicraft: { level: 1, exp: 0, next: 10 },
        refining: { level: 1, exp: 0, next: 10 }, // ⚒️ 鍛錬熟練度
        cooking: { level: 1, exp: 0, next: 10 },
        trading: { level: 1, exp: 0, next: 10 },  // ⚖️ 交易熟練度
        spear: { level: 1, exp: 0, next: 10 },
        axe: { level: 1, exp: 0, next: 10 },
        bow: { level: 1, exp: 0, next: 10 },
        gun: { level: 1, exp: 0, next: 10 },
        shield: { level: 1, exp: 0, next: 10 },
        evasion: { level: 1, exp: 0, next: 10 },
        survival: { level: 1, exp: 0, next: 10 }, // ❤️‍🩹 生存熟練度
        fireRes: { level: 1, exp: 0, next: 10 },
        waterRes: { level: 1, exp: 0, next: 10 },
        windRes: { level: 1, exp: 0, next: 10 },  // 🛡️🌪️ 風耐性熟練度
        earthRes: { level: 1, exp: 0, next: 10 }, // 🛡️🪨 地耐性熟練度
        fireMagic: { level: 1, exp: 0, next: 10 },
        waterMagic: { level: 1, exp: 0, next: 10 },
        windMagic: { level: 1, exp: 0, next: 10 },
        earthMagic: { level: 1, exp: 0, next: 10 },
        // 探索・行動熟練度（手動3種＋採取＋行軍）
        careful: { level: 1, exp: 0, next: 10 },
        rush: { level: 1, exp: 0, next: 10 },
        search: { level: 1, exp: 0, next: 10 },
        gathering: { level: 1, exp: 0, next: 10 },
        autoWalk: { level: 1, exp: 0, next: 10 }
    },
    unlockedSkills: [],
    activeSkills: [], // セット中のスキル
    passiveSkills: [], // セット中のパッシブスキル
    unlockedPassives: [], // 解放済みパッシブスキル
    exchangePoints: 0, // ⚖️ ギルド素材交換屋の所持交換Pt
    compendium: {
        monsters: {},  // { [monsterName]: killCount }
        materials: {}, // { [baseMaterialName]: count }
        equipment: {}, // { [baseEquipName]: count }
        prefixes: {}   // { [prefixName]: true }
    },
    guild: {
        gp: 0,
        rank: "F",
        quests: [],
        completedCount: 0
    },
    statsTrack: {
        totalSteps: 0,
        totalKills: 0,
        bossKills: 0,
        totalCrafts: 0,
        totalCrits: 0,
        maxDamage: 0
    },
    unlockedTitles: ["駆け出し冒険者"],
    equippedTitle: "駆け出し冒険者",
    battleChain: 0, // 連戦チェイン数（敵撃破で+1、敗北で0）
    trainingBuff: { name: null, steps: 0, jlvExpMult: 1.0, skillExpMult: 1.0 }, // 修練料理・霊薬のバフ状態
    inventory: {} // 獲得した素材を保存するオブジェクト
};

// 状態管理
let enemy = null;
let isExploring = false; // オート探索中かどうか
let exploreInterval = null; // ループ処理のタイマー
let currentAreaId = "area1"; // 現在探索中のエリア
let exploreSteps = 0; // ダンジョン進行度（歩数）
let exploreSpeed = 1500; // 探索スピード（ミリ秒）
let expMultiplier = 1; // 経験値倍率（テスト用）
let statAllocateAmount = 1; // ステータスの振り分け単位（1, 5, 10...）
let activeManualEvent = null; // 現在発生中の選択肢イベント
let autoChance = null; // オート探索中のクリックチャンス状態 { type, label, stepsLeft }

// 行き先を変更する処理
function changeArea() {
    if (isExploring) {
        toggleExplore(); // 探索中なら一旦止める
    }
    enemy = null;
    closeManualEvent();
    clearAutoChance();
    const select = document.getElementById('area-select');
    currentAreaId = select.value;
    exploreSteps = 0; // 行き先変更で進行度をリセット
    const area = areas[currentAreaId];
    document.getElementById('dungeon-name').innerHTML = `🌲 ダンジョン：${area.name} <span id="explore-progress" style="font-size: 14px; font-weight: normal; color: #aaa;">(進行度: 0 / 100)</span>`;
    addLog(`🚶 <b>${area.town}</b> から <b>${area.name}</b> へ移動しました。`);
    updateDungeonStatusUI();
}

// スライダーで探索スピードを変更する処理
function updateExploreSpeed() {
    const slider = document.getElementById('speed-slider');
    exploreSpeed = parseInt(slider.value, 10);
    document.getElementById('speed-display').innerText = (exploreSpeed / 1000).toFixed(1) + "秒";
    
    // 探索中であれば、一度タイマーをクリアして新しい速度で再開する
    if (isExploring) {
        clearInterval(exploreInterval);
        exploreInterval = setInterval(() => nextStep('auto'), exploreSpeed);
    }
}

// スライダーで経験値倍率を変更する処理
function updateExpMultiplier() {
    const slider = document.getElementById('exp-mult-slider');
    expMultiplier = parseInt(slider.value, 10);
    document.getElementById('exp-mult-display').innerText = expMultiplier + "倍";
}

// アイテム名から装備部位を判定
function getItemSlot(itemName) {
    if (!itemName) return null;
    const { baseName } = typeof parseItemName === "function" ? parseItemName(itemName) : { baseName: itemName };
    // マスターデータ (EQUIPMENT) から検索
    for (const key in EQUIPMENT) {
        if (EQUIPMENT[key].name === baseName || itemName.includes(EQUIPMENT[key].name)) {
            let slot = EQUIPMENT[key].slot;
            if (slot === "sub_weapon") return "subWeapon";
            if (slot === "accessory") return "acc";
            return slot;
        }
    }
    // フォールバック（既存ロジック）
    if (baseName.includes("剣") || baseName.includes("太刀") || baseName.includes("レイピア") || baseName.includes("槍") || baseName.includes("スピア") || baseName.includes("ランス") || baseName.includes("ハルバード") || baseName.includes("斧") || baseName.includes("弓") || baseName.includes("銃") || baseName.includes("砲") || baseName.includes("杖") || baseName.includes("魔術書") || baseName.includes("本")) return "weapon";
    if (baseName.includes("盾") || baseName.includes("バックラー") || baseName.includes("イージス") || baseName.includes("魔導灯")) return "subWeapon";
    if (baseName.includes("鎧") || baseName.includes("ローブ") || baseName.includes("服") || baseName.includes("外套") || baseName.includes("王衣") || baseName.includes("プレート") || baseName.includes("翼衣")) return "body";
    if (baseName.includes("籠手") || baseName.includes("手袋") || baseName.includes("ガントレット") || baseName.includes("アーム") || baseName.includes("魔手")) return "arm";
    if (baseName.includes("ブーツ") || baseName.includes("靴") || baseName.includes("グリーヴ") || baseName.includes("神脚")) return "leg";
    if (baseName.includes("リング") || baseName.includes("指輪") || baseName.includes("アミュレット") || baseName.includes("お守り") || baseName.includes("ピアス") || baseName.includes("ペンダント") || baseName.includes("宝珠") || baseName.includes("タリスマン") || baseName.includes("金貨輪") || baseName.includes("ドライブ") || baseName.includes("ヘイロー") || baseName.includes("紋章") || baseName.includes("神冠")) return "acc";
    return null; // 装備不可（素材など）
}

// アイテム名（称号含む）からステータス補正を計算（＋値鍛錬・PREFIX_DATAの倍率＆固定値に対応）
function getItemStats(itemName) {
    let stats = { hp: 0, mp: 0, atk: 0, matk: 0, def: 0, mdef: 0, hit: 0, eva: 0, drop: 0, str: 0, int: 0, vit: 0, dex: 0, agi: 0, luc: 0, fire_res: 0, crit: 0 };
    if (!itemName) return stats;

    const { baseName, plus } = typeof parseItemName === "function" ? parseItemName(itemName) : { baseName: itemName, plus: 0 };

    // マスターデータから基礎ステータスを取得
    for (const key in EQUIPMENT) {
        if (EQUIPMENT[key].name === baseName || itemName.includes(EQUIPMENT[key].name)) {
            const eq = EQUIPMENT[key];
            stats.hp += eq.hp || 0;
            stats.mp += eq.mp || 0;
            stats.atk += eq.atk || 0;
            stats.matk += eq.matk || 0;
            stats.def += eq.def || 0;
            stats.mdef += eq.mdef || 0;
            stats.hit += eq.hit || 0;
            stats.eva += eq.eva || 0;
            stats.drop += eq.drop || eq.drop_rate || 0; // drop_rate 対応
            stats.str += eq.str || 0;
            stats.int += eq.int || 0;
            stats.vit += eq.vit || 0;
            stats.dex += eq.dex || 0;
            stats.agi += eq.agi || 0;
            stats.luc += eq.luc || 0;
            stats.fire_res += eq.fire_res || 0;

            // 🌿 成長型武具（熟練度スケーリング）
            if (eq.scalingSkill && player && player.skills) {
                const sLv = (player.skills[eq.scalingSkill]?.level || 1);
                if (eq.scaleAtk) stats.atk += Math.floor(sLv * eq.scaleAtk);
                if (eq.scaleMatk) stats.matk += Math.floor(sLv * eq.scaleMatk);
                if (eq.scaleDef) stats.def += Math.floor(sLv * eq.scaleDef);
                if (eq.scaleMdef) stats.mdef += Math.floor(sLv * eq.scaleMdef);
                if (eq.scaleHp) stats.hp += Math.floor(sLv * eq.scaleHp);
                if (eq.scaleCrit) stats.crit = (stats.crit || 0) + Math.floor(sLv * eq.scaleCrit);
            }
            if (eq.scalingTotalSkills && typeof getSkillTotalLevel === 'function') {
                const tLv = getSkillTotalLevel();
                const bonusAll = Math.floor(tLv / (eq.scalingDivisor || 50));
                stats.str += bonusAll; stats.int += bonusAll; stats.vit += bonusAll;
                stats.dex += bonusAll; stats.agi += bonusAll; stats.luc += bonusAll;
            }
            break;
        }
    }

    // ⚒️ ＋値鍛錬補正（1強化ごとに基礎性能+5%！さらに+5/+10/+15/+20でマイルストーン固定値ボーナス）
    if (plus > 0) {
        const plusMult = 1 + (plus * 0.05);
        stats.hp = Math.round(stats.hp * plusMult);
        stats.mp = Math.round(stats.mp * plusMult);
        stats.atk = Math.round(stats.atk * plusMult);
        stats.matk = Math.round(stats.matk * plusMult);
        stats.def = Math.round(stats.def * plusMult);
        stats.mdef = Math.round(stats.mdef * plusMult);

        if (plus >= 5) {
            stats.hp += 20; stats.atk += 5; stats.matk += 5; stats.def += 3; stats.mdef += 3;
            stats.str += 2; stats.int += 2; stats.vit += 2; stats.dex += 2; stats.agi += 2; stats.luc += 2;
        }
        if (plus >= 10) {
            stats.hp += 30; stats.atk += 7; stats.matk += 7; stats.def += 5; stats.mdef += 5;
            stats.str += 3; stats.int += 3; stats.vit += 3; stats.dex += 3; stats.agi += 3; stats.luc += 3;
            stats.hit += 3; stats.eva += 3;
        }
        if (plus >= 15) {
            stats.hp += 50; stats.atk += 13; stats.matk += 13; stats.def += 8; stats.mdef += 8;
            stats.str += 5; stats.int += 5; stats.vit += 5; stats.dex += 5; stats.agi += 5; stats.luc += 5;
            stats.hit += 3; stats.eva += 3; stats.drop += 10;
        }
        if (plus >= 20) {
            stats.hp += 100; stats.atk += 25; stats.matk += 25; stats.def += 14; stats.mdef += 14;
            stats.str += 10; stats.int += 10; stats.vit += 10; stats.dex += 10; stats.agi += 10; stats.luc += 10;
            stats.crit = (stats.crit || 0) + 10; stats.drop += 10;
        }
    }

    // 修飾子（プレフィックス）による倍率補正＋控えめな固定値ボーナスを適用
    const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(itemName) : null;
    if (pInfo) {
        const mult = pInfo.mult ?? 1.0;
        if (mult !== 1.0) {
            stats.hp = Math.round(stats.hp * mult);
            stats.mp = Math.round(stats.mp * mult);
            stats.atk = Math.round(stats.atk * mult);
            stats.matk = Math.round(stats.matk * mult);
            stats.def = Math.round(stats.def * mult);
            stats.mdef = Math.round(stats.mdef * mult);
        }
        if (pInfo.flat) {
            for (const [k, v] of Object.entries(pInfo.flat)) {
                if (stats[k] !== undefined) stats[k] += v;
            }
        }
    }
    return stats;
}

// 装備している武器の種類を判定するヘルパー関数
function getEquippedWeaponType(weaponNameOverride = null) {
    const wName = weaponNameOverride || player.equipment.weapon;
    if (!wName) return 'unarmed';
    if (wName.includes('ナックル') || wName.includes('拳') || wName.includes('クロー') || wName.includes('爪') || wName.includes('フィスト')) return 'unarmed';
    if (wName.includes('刀') || wName.includes('カタナ') || wName.includes('太刀') || wName.includes('野太刀') || wName.includes('小太刀') || wName.includes('銘刀') || wName.includes('村正') || wName.includes('布都御魂') || wName.includes('斬鉄') || wName.includes('居合') || wName.includes('国綱') || wName.includes('正宗') || wName.includes('虎徹')) return 'katana';
    if (wName.includes('槍') || wName.includes('ランス') || wName.includes('スピア') || wName.includes('ロンギヌス') || wName.includes('ハルバード') || wName.includes('ヴァルキュリア') || wName.includes('グングニル')) return 'spear';
    if (wName.includes('斧') || wName.includes('アクス') || wName.includes('トマホーク')) return 'axe';
    if (wName.includes('弓') || wName.includes('ボウ')) return 'bow';
    if (wName.includes('銃') || wName.includes('ライフル') || wName.includes('砲') || wName.includes('キャノン') || wName.includes('ブラスター')) return 'gun';
    if (wName.includes('杖') || wName.includes('魔術書') || wName.includes('魔導書') || wName.includes('グリモワール') || wName.includes('本') || wName.includes('ロッド')) return 'magic';
    return 'sword';
}

// 装備中のアクセサリー等の特殊効果(specialId)を判定するヘルパー関数
function hasEquippedSpecial(specialId) {
    if (!player || !player.equipment) return false;
    for (const slot in player.equipment) {
        const itemName = player.equipment[slot];
        if (!itemName) continue;
        const { baseName } = typeof parseItemName === "function" ? parseItemName(itemName) : { baseName: itemName };
        for (const key in EQUIPMENT) {
            if (EQUIPMENT[key].specialId === specialId && (EQUIPMENT[key].name === baseName || itemName.includes(EQUIPMENT[key].name))) {
                return true;
            }
        }
    }
    return false;
}

// --- 📖 図鑑登録＆コレクションボーナス計算ヘルパー ---
function ensureCompendiumStructure() {
    if (!player.compendium) {
        player.compendium = { monsters: {}, materials: {}, equipment: {}, prefixes: {} };
    }
    if (!player.compendium.monsters) player.compendium.monsters = {};
    if (!player.compendium.materials) player.compendium.materials = {};
    if (!player.compendium.equipment) player.compendium.equipment = {};
    if (!player.compendium.prefixes) player.compendium.prefixes = {};
}

// アイテム名（称号つき・＋値つき含む）を図鑑に自動記録する
function recordItemToCompendium(fullItemName, amount = 1) {
    if (!fullItemName) return;
    ensureCompendiumStructure();
    const { prefix, baseName } = typeof parseItemName === "function" ? parseItemName(fullItemName) : { prefix: "", baseName: fullItemName };
    if (prefix) {
        player.compendium.prefixes[prefix] = true;
    }
    // 装備品・秘薬かチェック
    for (const key in EQUIPMENT) {
        if (EQUIPMENT[key].name === baseName) {
            player.compendium.equipment[baseName] = Math.max(player.compendium.equipment[baseName] || 0, amount);
            return;
        }
    }
    // 素材として記録
    player.compendium.materials[baseName] = Math.max(player.compendium.materials[baseName] || 0, amount);
}

// モンスター討伐を図鑑に記録する
function recordMonsterKill(monsterName) {
    if (!monsterName) return;
    ensureCompendiumStructure();
    const cleanName = monsterName.replace(/^★希少種・/, '').replace(/^★精鋭・/, '');
    player.compendium.monsters[cleanName] = (player.compendium.monsters[cleanName] || 0) + 1;
}

// インベントリおよび装備中アイテムを図鑑に同期する（取りこぼし防止）
function syncInventoryToCompendium() {
    ensureCompendiumStructure();
    for (const [itemKey, count] of Object.entries(player.inventory || {})) {
        if (count > 0) recordItemToCompendium(itemKey, count);
    }
    for (const slot in (player.equipment || {})) {
        if (player.equipment[slot]) recordItemToCompendium(player.equipment[slot], 1);
    }
}

// 図鑑の全マスター項目リストと現在の登録数・コレクションボーナスを計算する
function getCompendiumBonuses() {
    ensureCompendiumStructure();

    // 1. 全モンスター＆ボス一覧の抽出
    const allMonsters = [];
    const allMaterialsMap = new Map();
    for (const [areaId, aData] of Object.entries(areas)) {
        (aData.monsters || []).forEach(m => {
            if (!allMonsters.some(x => x.name === m.name)) {
                allMonsters.push({ name: m.name, area: aData.name, isBoss: false, isRareMon: (m.weight !== undefined && m.weight <= 2) });
            }
            (m.drops || []).forEach(d => {
                if (EQUIPMENT && Object.values(EQUIPMENT).some(eq => eq.name === d.item)) return;
                if (!allMaterialsMap.has(d.item)) {
                    const kind = d.isUltraRare ? 'ultrarare' : ((d.isRare || d.rate <= 0.05) ? 'rare' : 'normal');
                    allMaterialsMap.set(d.item, { name: d.item, area: aData.name, kind, source: m.name });
                }
            });
        });
        if (aData.boss) {
            allMonsters.push({ name: aData.boss.name, area: aData.name, isBoss: true, isRareMon: false });
            (aData.boss.drops || []).forEach(d => {
                if (EQUIPMENT && Object.values(EQUIPMENT).some(eq => eq.name === d.item)) return;
                if (!allMaterialsMap.has(d.item)) {
                    const kind = d.isUltraRare ? 'ultrarare' : ((d.isRare || d.rate <= 0.05) ? 'rare' : 'boss');
                    allMaterialsMap.set(d.item, { name: d.item, area: aData.name, kind, source: `BOSS: ${aData.boss.name}` });
                }
            });
        }
        (aData.gather || []).forEach(g => {
            if (!allMaterialsMap.has(g.item)) {
                allMaterialsMap.set(g.item, { name: g.item, area: aData.name, kind: 'gather', source: '通常採取' });
            }
        });
        (aData.manualGather || []).forEach(mg => {
            if (!allMaterialsMap.has(mg.item)) {
                allMaterialsMap.set(mg.item, { name: mg.item, area: aData.name, kind: 'manual', source: '🔍手動採取' });
            }
        });
    }
    const allMaterials = Array.from(allMaterialsMap.values());
    const allEquipment = Object.values(EQUIPMENT || {}).map(eq => ({ name: eq.name, slot: eq.slot, desc: eq.description }));
    const allPrefixes = Object.entries(PREFIX_DATA || {}).map(([k, v]) => ({ name: k, ...v }));

    const monCount = allMonsters.filter(m => (player.compendium.monsters[m.name] || 0) > 0).length;
    const matCount = allMaterials.filter(m => (player.compendium.materials[m.name] || 0) > 0).length;
    const ultraMatCount = allMaterials.filter(m => m.kind === 'ultrarare' && (player.compendium.materials[m.name] || 0) > 0).length;
    const eqCount = allEquipment.filter(e => (player.compendium.equipment[e.name] || 0) > 0).length;
    const pfxCount = allPrefixes.filter(p => !!player.compendium.prefixes[p.name]).length;

    const totalEntries = allMonsters.length + allMaterials.length + allEquipment.length + allPrefixes.length;
    const unlockedEntries = monCount + matCount + eqCount + pfxCount;
    const compRate = totalEntries > 0 ? Math.min(100, (unlockedEntries / totalEntries) * 100) : 0;

    // コレクションボーナスの算出
    // ・モンスター1種につき：全基礎ステ+1, HP+8
    // ・素材1種につき：LUC+1, MP+3, 泥率+1.5%（さらに激レア素材は1種につき全基礎ステ+2！）
    // ・装備1種につき：ATK+2, MATK+2, DEF+1, MDEF+1, 2種ごとに全基礎ステ+1
    // ・称号1種につき：全基礎ステ+1, 命中+0.3%, 回避+0.3%
    // ・総合コンプ率ボーナス：コンプ率に応じて全基礎ステータスが最大+20%乗算UP！（25%/50%/75%/100%でマイルストーン加算）
    const flatAllStats = monCount * 1 + ultraMatCount * 2 + Math.floor(eqCount / 2) + pfxCount * 1;
    const flatLucExtra = matCount * 1;
    const flatHp = monCount * 8;
    const flatMp = matCount * 3;
    const flatAtk = eqCount * 2;
    const flatMatk = eqCount * 2;
    const flatDef = eqCount * 1;
    const flatMdef = eqCount * 1;
    const flatDrop = Math.floor(matCount * 1.5);
    const flatHit = Math.round(pfxCount * 0.3 * 10) / 10;
    const flatEva = Math.round(pfxCount * 0.3 * 10) / 10;

    let milestonePct = 0;
    if (compRate >= 25) milestonePct += 2;
    if (compRate >= 50) milestonePct += 3;
    if (compRate >= 75) milestonePct += 4;
    if (compRate >= 100) milestonePct += 6;
    const allStatPctBonus = Math.round((compRate * 0.05 + milestonePct) * 10) / 10; // 最大+20%

    return {
        allMonsters, allMaterials, allEquipment, allPrefixes,
        monCount, matCount, ultraMatCount, eqCount, pfxCount,
        totalEntries, unlockedEntries, compRate,
        flatAllStats, flatLucExtra, flatHp, flatMp, flatAtk, flatMatk, flatDef, flatMdef, flatDrop, flatHit, flatEva,
        allStatPctBonus,
        allStatMult: 1 + (allStatPctBonus / 100)
    };
}

// --- 📜 ギルドランク＆スキル枠ヘルパー関数 ---
function getCurrentGuildRank() {
    if (!player.guild) player.guild = { gp: 0, rank: "F", quests: [], completedCount: 0 };
    const rId = player.guild.rank || "F";
    const found = (typeof GUILD_RANKS !== "undefined") ? GUILD_RANKS.find(r => r.rank === rId) : null;
    return found || {
        rank: "F",
        reqGp: 0,
        name: "ランクF: 見習いギルド員",
        title: "見習いギルド員",
        activeSlots: 3,
        maxActiveSlots: 3,
        passiveSlots: 3,
        maxPassiveSlots: 3,
        allStats: 0,
        dropBonus: 0,
        exPtBonus: 0,
        exchangeBonus: 1.0,
        desc: "初期ランク（アクティブ3枠 / パッシブ3枠）"
    };
}

function getMaxActiveSkillSlots() {
    const gr = getCurrentGuildRank();
    return gr.activeSlots || gr.maxActiveSlots || 3;
}

function getMaxPassiveSkillSlots() {
    const gr = getCurrentGuildRank();
    return gr.passiveSlots || gr.maxPassiveSlots || 3;
}

// 👑 プレイヤー称号（二つ名）マスター取得ヘルパー
function getPlayerTitle(titleId) {
    if (!titleId || typeof PLAYER_TITLES === "undefined") return null;
    return PLAYER_TITLES.find(t => t.id === titleId) || null;
}

// --- 🌟 全30種スキル熟練度 ＆ マイルストーン奥義 ＆ 総合共鳴システム ---
const DEFAULT_SKILL_KEYS = [
    'unarmed', 'sword', 'katana', 'magic', 'sewing', 'blacksmith', 'handicraft', 'refining', 'cooking', 'trading',
    'spear', 'axe', 'bow', 'gun', 'shield', 'evasion', 'survival', 'fireRes', 'waterRes', 'windRes', 'earthRes',
    'fireMagic', 'waterMagic', 'windMagic', 'earthMagic', 'careful', 'rush', 'search', 'gathering', 'autoWalk'
];

// スキル熟練度の次のレベルに必要な経験値を算出（指数爆発を防ぎ、着実にLv.25, 50, 100を目指せる多項式カーブ）
function getSkillNextExp(level) {
    // Lv.1 ➔ 15, Lv.10 ➔ 120, Lv.25 ➔ 450, Lv.50 ➔ 1450, Lv.100 ➔ 5500
    return Math.floor(15 + level * 8 + Math.pow(level, 1.35) * 5);
}

function ensureSkillsStructure() {
    if (!player.skills) player.skills = {};
    for (const key of DEFAULT_SKILL_KEYS) {
        if (!player.skills[key]) {
            player.skills[key] = { level: 1, exp: 0, next: getSkillNextExp(1) };
        } else {
            if (typeof player.skills[key].level !== 'number' || player.skills[key].level < 1) player.skills[key].level = 1;
            if (typeof player.skills[key].exp !== 'number' || player.skills[key].exp < 0) player.skills[key].exp = 0;
            // 既存セーブデータの極端な指数爆発要求値を正常な多項式カーブに自動補正・正規化
            player.skills[key].next = getSkillNextExp(player.skills[key].level);
        }
    }
}

// 全スキルの合計熟練度レベルを計算
function getSkillTotalLevel() {
    ensureSkillsStructure();
    let total = 0;
    for (const key of DEFAULT_SKILL_KEYS) {
        total += (player.skills[key]?.level || 1);
    }
    return total;
}

// 総合熟練度共鳴情報の算出
function getSkillResonanceInfo() {
    const totalLevel = getSkillTotalLevel();
    const defaultBonus = {
        allStats: 0, hp: 0, mp: 0, expPct: 0, drop: 0,
        skillExpPct: 0, critPct: 0, critDmg: 0, skillRate: 0,
        allRes: 0, dmgCutPct: 0, dmgDealtPct: 0,
        atk: 0, matk: 0, def: 0, mdef: 0, hit: 0, eva: 0
    };
    if (typeof SKILL_RESONANCE_TIERS === 'undefined') {
        return { totalLevel, currentTier: null, nextTier: null, bonus: defaultBonus };
    }

    let currentTier = null;
    let nextTier = null;

    for (let i = 0; i < SKILL_RESONANCE_TIERS.length; i++) {
        const tier = SKILL_RESONANCE_TIERS[i];
        if (totalLevel >= tier.reqTotal) {
            currentTier = tier;
        } else {
            nextTier = tier;
            break;
        }
    }

    const bonus = Object.assign({}, defaultBonus, currentTier?.bonus || {});

    // 2000超えのボーナス（50Lvごとに全ステ+10, HP+100, MP+50が無制限加算）
    if (totalLevel > 2000) {
        const extraRanks = Math.floor((totalLevel - 2000) / 50);
        bonus.allStats = (bonus.allStats || 0) + extraRanks * 10;
        bonus.hp = (bonus.hp || 0) + extraRanks * 100;
        bonus.mp = (bonus.mp || 0) + extraRanks * 50;
    }

    return { totalLevel, currentTier, nextTier, bonus };
}

// 到達している全マイルストーン奥義アビリティの累積効果を集計
function getSkillMilestoneEffects() {
    ensureSkillsStructure();
    const eff = {
        atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0,
        flatAtk: 0, flatMatk: 0, flatDef: 0, flatMdef: 0,
        flatHp: 0, flatMp: 0,
        critRate: 0, critDmg: 0, hitRate: 0, evaRate: 0,
        dropRate: 0, skillRate: 0, mpCostCut: 0,
        defPierce: 0, hpRegenPct: 0, mpRegenPct: 0,
        dmgCutPct: 0,
        unlockedCount: 0,
        abilities: [] // 解放済みアビリティ一覧
    };

    if (typeof SKILL_MASTER_DATA === 'undefined') return eff;

    for (const [skillKey, sData] of Object.entries(SKILL_MASTER_DATA)) {
        const pSkill = player.skills[skillKey];
        if (!pSkill) continue;
        const curLv = pSkill.level || 1;

        for (const m of sData.milestones) {
            if (curLv >= m.level) {
                eff.unlockedCount++;
                eff.abilities.push({ skillKey, skillName: sData.name, ...m });

                // 各マイルストーンのステータス補正を蓄積
                // 剣術
                if (m.name === "鋭刃の呼吸") eff.flatAtk += 12;
                if (m.name === "剣閃の構え") { eff.critRate += 4; eff.atkPct += 6; }
                if (m.name === "剛剣の極致") { eff.critRate += 6; eff.critDmg += 0.25; }
                // 刀術
                if (m.name === "刃筋の調律") eff.critRate += 3;
                if (m.name === "居合の構え") eff.critDmg += 0.25;
                // 槍術
                if (m.name === "長柄の間合い") { eff.flatAtk += 10; eff.hitRate += 3; }
                if (m.name === "竜穿の切っ先") { eff.defPierce += 12; eff.atkPct += 6; }
                if (m.name === "穿孔螺旋撃") { eff.defPierce += 25; eff.hitRate += 8; }
                // 斧術
                if (m.name === "重撃の破壊力") eff.flatAtk += 15;
                if (m.name === "剛力粉砕") eff.atkPct += 10;
                // 弓術
                if (m.name === "射手の集中") eff.hitRate += 5;
                if (m.name === "鷹の眼") eff.hitRate += 8;
                // 銃術
                if (m.name === "高精度バレル") { eff.critDmg += 0.35; eff.hitRate += 8; }
                // 素手
                if (m.name === "拳気の目覚め") { eff.flatAtk += 15; eff.flatDef += 5; }
                if (m.name === "剛体練成") { eff.flatHp += 80; eff.flatDef += 15; }
                // 魔法
                if (m.name === "魔導の脈動") { eff.flatMatk += 15; eff.flatMp += 30; }
                if (m.name === "詠唱加速") eff.skillRate += 6;
                if (m.name === "マインドフロー") eff.mpCostCut += 25;
                // 盾術
                if (m.name === "重盾の構え") { eff.flatDef += 15; eff.flatHp += 60; }
                if (m.name === "シールドブロック") eff.defPct += 10;
                // 回避
                if (m.name === "身軽な足捌き") eff.evaRate += 3;
                // 生存
                if (m.name === "タフガイ") eff.flatHp += 80;
                if (m.name === "応急手当の心得") eff.hpRegenPct += 3;
                if (m.name === "不死鳥の魂") { eff.hpRegenPct += 5; eff.mpRegenPct += 3; }
                // 探索・行動
                if (m.name === "観察眼") eff.dropRate += 8;
                if (m.name === "神の千里眼") eff.dropRate += 40;
                if (m.name === "豪商の交渉術") eff.dropRate += 8;
                if (m.name === "黄金の嗅覚") eff.dropRate += 15;
                // クラフト
                if (m.name === "極上の一皿") eff.flatHp += 50;
                // 🌟 Lv.150 / Lv.200 極限マイルストーンボーナス
                if (m.extremeBonus) {
                    for (const k in m.extremeBonus) {
                        if (eff[k] !== undefined) eff[k] += m.extremeBonus[k];
                    }
                }
            }
        }
    }

    return eff;
}

// 🔗 複合シナジー奥義の効果集計
function getSkillSynergyEffects() {
    ensureSkillsStructure();
    const res = {
        allStats: 0, hpPct: 0, atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0,
        critRate: 0, critDmg: 0, hitRate: 0, evaRate: 0, dropRate: 0,
        skillRate: 0, defPierce: 0, dmgCutPct: 0, hpRegenPct: 0, mpRegenPct: 0, expPct: 0,
        unlockedList: []
    };
    if (typeof SKILL_SYNERGY_ARTS === "undefined") return res;
    for (const art of SKILL_SYNERGY_ARTS) {
        if (art.check(player.skills)) {
            res.unlockedList.push(art);
            for (const k in art.bonus) {
                if (res[k] !== undefined) res[k] += art.bonus[k];
            }
        }
    }
    return res;
}

let _synergyPanelExpanded = false;
function toggleSkillSynergyPanel() {
    _synergyPanelExpanded = !_synergyPanelExpanded;
    updateSkillSynergyUI();
}

function updateSkillSynergyUI() {
    const panel = document.getElementById('skill-synergy-panel');
    if (!panel || typeof SKILL_SYNERGY_ARTS === "undefined") return;
    ensureSkillsStructure();
    const syn = getSkillSynergyEffects();
    const total = SKILL_SYNERGY_ARTS.length;
    const unlockedCount = syn.unlockedList.length;

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleSkillSynergyPanel()">
            <b style="color: #79c0ff;">🔗 複合シナジー奥義 <span style="color: #ffd700;">(${unlockedCount} / ${total} 解放)</span></b>
            <span style="font-size: 11px; color: #aaa;">${_synergyPanelExpanded ? '▲ 閉じる' : '▼ 一覧・条件を見る'}</span>
        </div>
    `;

    if (unlockedCount > 0 && !_synergyPanelExpanded) {
        html += `<div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 4px;">` +
            syn.unlockedList.map(a => `<span title="${a.desc}" style="background:#1c3045; border:1px solid #4a90e2; color:#a5d6ff; padding:1px 6px; border-radius:10px; font-size:11px;">${a.icon} ${a.name}</span>`).join('') +
            `</div>`;
    }

    if (_synergyPanelExpanded) {
        html += `<div style="margin-top: 8px; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 6px;">`;
        for (const art of SKILL_SYNERGY_ARTS) {
            const isUnlocked = art.check(player.skills);
            html += `
                <div style="background: ${isUnlocked ? '#1a2d3a' : '#14181e'}; border: 1px solid ${isUnlocked ? '#4a90e2' : '#333'}; border-radius: 5px; padding: 6px 8px;">
                    <div style="font-weight: bold; color: ${isUnlocked ? '#ffd700' : '#777'}; margin-bottom: 2px;">
                        ${isUnlocked ? '✅' : '🔒'} ${art.icon} ${art.name}
                    </div>
                    <div style="font-size: 11px; color: #aaa; margin-bottom: 2px;">条件: ${art.condDesc}</div>
                    <div style="font-size: 11px; color: ${isUnlocked ? '#88ff88' : '#666'};">${art.desc}</div>
                </div>
            `;
        }
        html += `</div>`;
    }

    panel.innerHTML = html;
}

// 🌌 総合熟練度共鳴インジケーターUIの更新
function updateSkillResonanceUI() {
    const barEl = document.getElementById('skill-resonance-bar');
    if (!barEl) return;
    const res = getSkillResonanceInfo();
    const cur = res.currentTier;
    const next = res.nextTier;
    const totalLv = res.totalLevel;

    let progressPct = 100;
    let nextText = "";
    if (next) {
        const prevReq = cur.reqLevel;
        const span = next.reqLevel - prevReq;
        const progress = Math.max(0, totalLv - prevReq);
        progressPct = Math.min(100, Math.floor((progress / span) * 100));
        nextText = `次の共鳴【<b>${next.name}</b>】まで あと <b style="color:#00ffcc;">${next.reqLevel - totalLv}</b> レベル (Lv.${next.reqLevel})`;
    } else {
        nextText = `<span style="color:#ffd700; font-weight:bold;">👑 全共鳴ランクの頂点に到達！ 極限の境地！</span>`;
    }

    const b = cur.bonus;
    const bonusSummary = [];
    if (b.allStats) bonusSummary.push(`全ステ+${b.allStats}`);
    if (b.hp) bonusSummary.push(`HP+${b.hp}`);
    if (b.mp) bonusSummary.push(`MP+${b.mp}`);
    if (b.atk) bonusSummary.push(`攻防+${b.atk}`);
    if (b.hit) bonusSummary.push(`命中+${b.hit}%`);
    if (b.eva) bonusSummary.push(`回避+${b.eva}%`);
    if (b.crit) bonusSummary.push(`会心+${b.crit}%`);
    if (b.drop) bonusSummary.push(`泥率+${b.drop}%`);

    barEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 4px;">
            <div>
                <span style="color: #aaa;">全30種 合計熟練度:</span> 
                <b style="font-size: 14px; color: #fff;">Lv.${totalLv}</b>
                <span style="color: #667788; font-size: 11px;">/ 3000</span>
            </div>
            <div>
                <span style="color: #aaa;">共鳴ランク:</span> 
                <b style="color: #ffd700; font-size: 13px;">🌌 ${cur.name}</b>
            </div>
        </div>
        <div style="background: #0d131a; border-radius: 4px; height: 10px; width: 100%; overflow: hidden; margin-bottom: 6px; border: 1px solid #334455;">
            <div style="background: linear-gradient(90deg, #00b4d8, #00ffcc, #ffd700); height: 100%; width: ${progressPct}%; transition: width 0.3s ease;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px; font-size: 11px; color: #88ff88;">
            <span>✨ 恒久共鳴ボーナス: <b>${bonusSummary.join(' / ')}</b></span>
            <span style="color: #aaa;">${nextText}</span>
        </div>
    `;
}

// ✨ 熟練度マイルストーン＆奥義モーダルの表示・非表示切替
function toggleMilestonesModal() {
    const modal = document.getElementById('milestones-modal');
    if (!modal) return;
    if (modal.style.display === "none" || modal.style.display === "") {
        modal.style.display = "flex";
        renderMilestonesModalList();
    } else {
        modal.style.display = "none";
    }
}

// マイルストーン＆奥義カードリストの動的描画
function renderMilestonesModalList() {
    const listEl = document.getElementById('milestones-modal-list');
    if (!listEl) return;
    ensureSkillsStructure();

    let html = "";
    for (const skillKey of DEFAULT_SKILL_KEYS) {
        const sData = player.skills[skillKey] || { level: 1 };
        const master = (typeof SKILL_MASTER_DATA !== "undefined") ? SKILL_MASTER_DATA[skillKey] : null;
        if (!master) continue;

        const milestones = master.milestones || [];
        const isMaxed = sData.level >= 100;
        const skillName = master.name;
        const icon = master.icon || '⚔️';

        html += `
            <div style="background: #1c2331; border: 1px solid ${isMaxed ? '#ffd700' : '#3d485d'}; border-radius: 6px; padding: 8px 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div>
                        <span style="font-size: 14px;">${icon}</span> 
                        <b style="color: #fff; font-size: 13px;">${skillName}</b> 
                        <span style="font-size: 11px; color: #aaa;">(${master.category})</span>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: ${isMaxed ? '#ffd700' : '#00ffcc'}; font-weight: bold;">Lv.${sData.level}</span>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 6px;">
        `;

        for (const m of milestones) {
            const isUnlocked = sData.level >= m.level;
            const borderColor = isUnlocked ? (m.level === 100 ? '#ffd700' : '#28a745') : '#444';
            const bgColor = isUnlocked ? (m.level === 100 ? '#2a2408' : '#142918') : '#15181e';
            const titleColor = isUnlocked ? (m.level === 100 ? '#ffd700' : '#88ff88') : '#777';
            const descColor = isUnlocked ? '#eee' : '#666';
            const badge = isUnlocked ? `<span style="color:#88ff88; font-weight:bold;">[解放済]</span>` : `<span style="color:#888;">[未達: Lv.${m.level}]</span>`;

            html += `
                <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 4px; padding: 5px 8px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <b style="color: ${titleColor};">Lv.${m.level} 『${m.name}』</b>
                        ${badge}
                    </div>
                    <div style="color: ${descColor}; line-height: 1.3;">
                        ${m.desc}
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    listEl.innerHTML = html;
}

// プレイヤーレベル(PLV)の次レベル必要経験値を算出（指数爆発を防ぐ多項式カーブ）
function getPlayerNextExp(level) {
    // Lv.1 ➔ 100, Lv.10 ➔ 450, Lv.30 ➔ 2600, Lv.50 ➔ 8200, Lv.100 ➔ 62000
    return Math.floor(80 + level * 20 + Math.pow(level, 2.05) * 3.8);
}

// ジョブレベル(JLV)の次レベル必要経験値を算出（上級職・隠し職でも指数爆発せず着実に成長する多項式カーブ）
function getJobNextExp(jobName, level) {
    const jobInfo = (typeof JOBS !== "undefined") ? JOBS[jobName] : null;
    // ジョブの格に応じた基礎倍率 (初級1.0〜最上級1.35倍程度)
    const factor = jobInfo?.expFactor ? Math.min(1.35, Math.max(1.0, 1.0 + (jobInfo.expFactor - 1.0) * 0.45)) : 1.0;
    
    if (level <= 100) {
        // Lv.1 ➔ 100, Lv.10 ➔ 450, Lv.30 ➔ 2500, Lv.50 ➔ 7800, Lv.70 ➔ 18000, Lv.100 ➔ 58000
        const base = Math.floor(75 + level * 25 + Math.pow(level, 2.05) * 3.5);
        return Math.floor(base * factor);
    } else {
        // Lv.101以降の超越レベル（無限育成：1レベルあたり穏やかに加算）
        const star = level - 100;
        const baseAt100 = Math.floor((75 + 100 * 25 + Math.pow(100, 2.05) * 3.5) * factor);
        return Math.floor(baseAt100 + star * 1200 + Math.pow(star, 1.2) * 150);
    }
}

// --- 👑 ジョブ超越マスタリー＆特化育成ヘルパー関数 ---
function ensureJobMasteryStructure(jobId) {
    if (!player.jobLevels[jobId]) {
        player.jobLevels[jobId] = { level: 1, exp: 0, nextExp: getJobNextExp(jobId, 1), isMaster: false, masteryPoints: 0, masteryAlloc: { spec1: 0, spec2: 0, spec3: 0 } };
    }
    const jd = player.jobLevels[jobId];
    if (typeof jd.masteryPoints !== "number") jd.masteryPoints = 0;
    if (!jd.masteryAlloc) jd.masteryAlloc = { spec1: 0, spec2: 0, spec3: 0 };
    // 既存セーブデータの極端な指数爆発要求値を正常な多項式カーブに自動補正・正規化
    jd.nextExp = getJobNextExp(jobId, jd.level);
    return jd;
}

// 全ジョブの超越★数による共鳴ボーナスの算出（案C）
function getJobMasteryResonanceBonus() {
    let totalStars = 0;
    for (const jId in player.jobLevels) {
        const jd = player.jobLevels[jId];
        if (jd && jd.level > 100) {
            totalStars += (jd.level - 100);
        }
    }
    return {
        totalStars,
        allStats: Math.floor(totalStars * 0.5),
        hp: totalStars * 5,
        mp: totalStars * 3,
        drop: Math.floor(totalStars / 5),
        hit: Math.min(10, Math.floor(totalStars / 10)),
        eva: Math.min(10, Math.floor(totalStars / 10))
    };
}

// 現在のメインジョブの特化アビリティ効果集計（案A）
function getCurrentJobMasteryEffects() {
    const effects = {
        allStats: 0, strPct: 0, intPct: 0, vitPct: 0, dexPct: 0, agiPct: 0, lucPct: 0,
        hpPct: 0, mpPct: 0, flatHp: 0, flatMp: 0,
        atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0,
        flatAtk: 0, flatMatk: 0, flatDef: 0, flatMdef: 0,
        hit: 0, eva: 0, drop: 0, critRate: 0, critDmg: 0,
        dmgCut: 0, dmgBonus: 0, expBonus: 0, exchangeBonus: 0, craftPrefixRate: 0,
        magicTrigger: 0, skillTrigger: 0, defPierce: 0
    };

    const jobId = player.job;
    const jd = ensureJobMasteryStructure(jobId);
    const specs = (typeof JOB_MASTERY_SPECS !== "undefined") ? JOB_MASTERY_SPECS[jobId] : null;
    if (!specs) return effects;

    for (const key of ["spec1", "spec2", "spec3"]) {
        const pts = jd.masteryAlloc[key] || 0;
        if (pts <= 0) continue;
        const s = specs[key];
        if (!s) continue;

        switch (s.type) {
            case "allStats": effects.allStats += s.value * pts; break;
            case "hpMp": effects.flatHp += s.hp * pts; effects.flatMp += s.mp * pts; break;
            case "expBonus": effects.expBonus += s.value * pts; break;
            case "strPct": effects.strPct += s.value * pts; break;
            case "matkPct": effects.matkPct += s.value * pts; break;
            case "atkPct": effects.atkPct += s.value * pts; break;
            case "defPct": effects.defPct += s.value * pts; break;
            case "critDmg": effects.critDmg += s.value * pts; break;
            case "physCut": case "dmgCut": effects.dmgCut = Math.min(s.max || 30, effects.dmgCut + s.value * pts); break;
            case "magicTrigger": effects.magicTrigger += s.value * pts; break;
            case "skillTrigger": effects.skillTrigger += s.value * pts; break;
            case "manaLoop": effects.flatMp += s.mp * pts; break;
            case "hitCrit": effects.hit += s.hit * pts; effects.critRate += s.crit * pts; break;
            case "agiEva": effects.agiPct += s.agiPct * pts; effects.eva += s.eva * pts; break;
            case "bowGunAtk": effects.atkPct += s.value * pts; break;
            case "dropRate": effects.drop += s.value * pts; break;
            case "evaRate": effects.eva += s.value * pts; break;
            case "critRate": effects.critRate += s.value * pts; break;
            case "exchangeBonus": effects.exchangeBonus += s.value * pts; break;
            case "craftPrefixRate": effects.craftPrefixRate += s.value * pts; break;
            case "spellBladeDmg": effects.dmgBonus += s.value * pts; break;
            case "hybridAtk": effects.atkPct += s.value * pts; effects.matkPct += s.value * pts; break;
            case "hybridDef": effects.defPct += s.value * pts; effects.mdefPct += s.value * pts; break;
            case "gunFlatDmg": effects.flatAtk += s.value * pts; break;
            case "allRes": break; // 耐性熟練度側で反映
            case "elementalDmg": effects.matkPct += s.value * pts; break;
            case "maxMp": effects.flatMp += s.value * pts; break;
            case "evaHit": effects.eva += s.eva * pts; effects.hit += s.hit * pts; break;
            case "axeSwordAtk": effects.atkPct += s.value * pts; break;
            case "lucPct": effects.lucPct += s.value * pts; break;
            case "dragonHpAtk": effects.hpPct += s.value * pts; effects.atkPct += s.value * pts; break;
            case "defPierce": effects.defPierce += s.value * pts; break;
            case "mechSkill": effects.skillTrigger += s.trigger * pts; break;
            case "mechCrit": effects.critRate += s.rate * pts; effects.critDmg += s.mult * pts; break;
            case "mechDrop": effects.drop += s.drop * pts; effects.dexPct += s.dex * pts; break;
            case "holyDomain": effects.dmgCut = Math.min(30, effects.dmgCut + s.cut * pts); break;
            case "divineMatk": effects.matkPct += s.matkPct * pts; effects.flatMp += s.mp * pts; break;
            case "allMagicDmg": effects.matkPct += s.value * pts; break;
            case "dmgBonus": effects.dmgBonus += s.value * pts; break;
            case "fistAtk": effects.atkPct += s.value * pts; break;
            case "chakraHpCrit": effects.hpPct += s.hpPct * pts; effects.critRate += s.crit * pts; break;
            case "dropPrefix": effects.drop += s.drop * pts; break;
            case "defCut": effects.defPct += s.defPct * pts; effects.dmgCut = Math.min(30, effects.dmgCut + s.cut * pts); break;
            case "defMdefPct": effects.defPct += s.value * pts; effects.mdefPct += s.value * pts; break;
            case "hpPercent": effects.hpPct += s.value * pts; break;
            case "drainBonus": break; // 戦闘吸収時適用
            case "bladeAtk": effects.atkPct += s.value * pts; break;
            case "critPierce": effects.critRate += s.crit * pts; effects.defPierce += s.pierce * pts; break;
            case "dropLuc": effects.drop += s.drop * pts; effects.lucPct += s.luc * pts; break;
            case "strHp": effects.strPct += s.str * pts; effects.hpPct += s.hpPct * pts; break;
            case "dropCut": effects.drop += s.drop * pts; effects.dmgCut = Math.min(30, effects.dmgCut + s.cut * pts); break;
            case "strPierce": effects.strPct += s.str * pts; effects.defPierce = Math.min(s.max || 50, effects.defPierce + s.pierce * pts); break;
        }
    }
    return effects;
}

// 装備中の育成系称号ボーナス集計（求道者の、修羅の、探究の）
function getEquippedPrefixExpBonuses() {
    let jlvBonus = 0;
    let weaponBonus = 0;
    let actionBonus = 0;
    if (!player.equipment) return { jlvBonus, weaponBonus, actionBonus };
    for (const slot in player.equipment) {
        const item = player.equipment[slot];
        if (item) {
            const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(item) : null;
            if (pInfo) {
                if (pInfo.jlvExpBonus) jlvBonus += pInfo.jlvExpBonus;
                if (pInfo.weaponExpBonus) weaponBonus += pInfo.weaponExpBonus;
                if (pInfo.actionExpBonus) actionBonus += pInfo.actionExpBonus;
            }
        }
    }
    return { jlvBonus, weaponBonus, actionBonus };
}

// 連戦チェイン倍率の取得（1チェインにつき+2%、最大50チェインで+100% = 2倍）
function getBattleChainMultiplier() {
    const chain = player.battleChain || 0;
    return 1.0 + Math.min(1.0, chain * 0.02);
}

// 特化アビリティ効果値の整形ヘルパー
function formatMasteryEffectText(spec, pts) {
    if (!spec || pts <= 0) return "未強化";
    switch (spec.type) {
        case "allStats": return `全基本ステ +${spec.value * pts}`;
        case "hpMp": return `最大HP +${spec.hp * pts}, 最大MP +${spec.mp * pts}`;
        case "expBonus": return `獲得EXP＆全熟練度 +${(spec.value * pts).toFixed(1)}%`;
        case "strPct": return `STR +${(spec.value * pts).toFixed(1)}%`;
        case "matkPct": return `MATK +${(spec.value * pts).toFixed(1)}%`;
        case "atkPct": return `ATK +${(spec.value * pts).toFixed(1)}%`;
        case "defPct": return `DEF +${(spec.value * pts).toFixed(1)}%`;
        case "critDmg": return `会心倍率 +${(spec.value * pts).toFixed(1)}%`;
        case "physCut": case "dmgCut": return `被ダメージ軽減 +${Math.min(spec.max || 30, (spec.value * pts)).toFixed(1)}%`;
        case "magicTrigger": return `魔法発動率 +${(spec.value * pts).toFixed(1)}%`;
        case "skillTrigger": return `スキル発動率 +${(spec.value * pts).toFixed(1)}%`;
        case "manaLoop": return `最大MP +${spec.mp * pts} (MP消費効率UP)`;
        case "hitCrit": return `命中 +${spec.hit * pts}, 会心率 +${(spec.crit * pts).toFixed(1)}%`;
        case "agiEva": return `AGI +${(spec.agiPct * pts).toFixed(1)}%, 回避 +${spec.eva * pts}`;
        case "bowGunAtk": return `弓・銃ATK +${(spec.value * pts).toFixed(1)}%`;
        case "dropRate": return `ドロップ率 +${(spec.value * pts).toFixed(1)}%`;
        case "evaRate": return `回避率 +${(spec.value * pts).toFixed(1)}%`;
        case "critRate": return `会心率 +${(spec.value * pts).toFixed(1)}%`;
        case "exchangeBonus": return `素材交換Pt +${(spec.value * pts).toFixed(1)}%`;
        case "craftPrefixRate": return `クラフト良称号率 +${(spec.value * pts).toFixed(1)}%`;
        case "spellBladeDmg": return `属性刃威力 +${(spec.value * pts).toFixed(1)}%`;
        case "hybridAtk": return `ATK・MATK +${(spec.value * pts).toFixed(1)}%`;
        case "hybridDef": return `DEF・MDEF +${(spec.value * pts).toFixed(1)}%`;
        case "gunFlatDmg": return `銃固定追加ダメージ +${spec.value * pts}`;
        case "allRes": return `全属性耐性 +${(spec.value * pts).toFixed(1)}%`;
        case "elementalDmg": return `4属性魔法威力 +${(spec.value * pts).toFixed(1)}%`;
        case "maxMp": return `最大MP +${spec.value * pts}`;
        case "evaHit": return `回避 +${spec.eva * pts}, 命中 +${spec.hit * pts}`;
        case "axeSwordAtk": return `斧・大剣ATK +${(spec.value * pts).toFixed(1)}%`;
        case "lucPct": return `LUC +${(spec.value * pts).toFixed(1)}%`;
        case "dragonHpAtk": return `HP・ATK +${(spec.value * pts).toFixed(1)}%`;
        case "defPierce": return `敵防御無視 +${(spec.value * pts).toFixed(1)}%`;
        case "mechSkill": return `スキル発動 +${(spec.trigger * pts).toFixed(1)}%, レーザー追撃 +${spec.chase * pts}%`;
        case "mechCrit": return `会心率 +${(spec.rate * pts).toFixed(1)}%, 会心倍率 +${(spec.mult * pts).toFixed(1)}%`;
        case "mechDrop": return `ドロップ率 +${(spec.drop * pts).toFixed(1)}%, DEX +${(spec.dex * pts).toFixed(1)}`;
        case "holyDomain": return `全体被ダメ軽減 +${Math.min(30, (spec.cut * pts)).toFixed(1)}%`;
        case "divineMatk": return `MATK +${(spec.matkPct * pts).toFixed(1)}%, MP +${spec.mp * pts}`;
        case "allMagicDmg": return `全魔法威力 +${(spec.value * pts).toFixed(1)}%`;
        case "dmgBonus": return `与ダメージ +${(spec.value * pts).toFixed(1)}%`;
        case "fistAtk": return `格闘ATK +${(spec.value * pts).toFixed(1)}%`;
        case "chakraHpCrit": return `HP +${(spec.hpPct * pts).toFixed(1)}%, 会心率 +${(spec.crit * pts).toFixed(1)}%`;
        case "dropPrefix": return `ドロップ率 +${(spec.drop * pts).toFixed(1)}%`;
        case "defCut": return `DEF +${(spec.defPct * pts).toFixed(1)}%, 被ダメ軽減 +${Math.min(30, (spec.cut * pts)).toFixed(1)}%`;
        case "defMdefPct": return `DEF・MDEF +${(spec.value * pts).toFixed(1)}%`;
        case "hpPercent": return `最大HP +${(spec.value * pts).toFixed(1)}%`;
        case "drainBonus": return `ドレイン吸収量 +${(spec.value * pts).toFixed(1)}%`;
        case "bladeAtk": return `刀剣ATK +${(spec.value * pts).toFixed(1)}%`;
        case "critPierce": return `会心率 +${(spec.crit * pts).toFixed(1)}%, 防御無視 +${(spec.pierce * pts).toFixed(1)}%`;
        case "dropLuc": return `泥率 +${(spec.drop * pts).toFixed(1)}%, LUC +${(spec.luc * pts).toFixed(1)}%`;
        case "strHp": return `STR +${(spec.str * pts).toFixed(1)}%, HP +${(spec.hpPct * pts).toFixed(1)}%`;
        case "dropCut": return `泥率 +${(spec.drop * pts).toFixed(1)}%, 被ダメ軽減 +${Math.min(30, (spec.cut * pts)).toFixed(1)}%`;
        case "strPierce": return `STR +${(spec.str * pts).toFixed(1)}%, 防御無視 +${Math.min(spec.max || 50, (spec.pierce * pts)).toFixed(1)}%`;
        default: return `+${pts}`;
    }
}

// 👑 ジョブ特化ポイントの割り振り
function allocateJobMastery(jobId, specKey, amount = 1) {
    const jd = ensureJobMasteryStructure(jobId);
    if (!jd || (jd.masteryPoints || 0) < amount) {
        addLog(`<span style="color: #ffaa00;">⚠️ 職能ポイント(JMP)が不足しています。</span>`);
        return;
    }
    jd.masteryPoints -= amount;
    jd.masteryAlloc[specKey] = (jd.masteryAlloc[specKey] || 0) + amount;
    
    const spec = (typeof JOB_MASTERY_SPECS !== "undefined") ? JOB_MASTERY_SPECS[jobId]?.[specKey] : null;
    const specName = spec ? spec.name : specKey;
    addLog(`✨ <span style="color: #00ffcc; font-weight: bold;">【職能特化】</span> ${jobId} の『${specName}』を強化しました！(+${amount}Pt / 現在Lv.${jd.masteryAlloc[specKey]})`);
    
    calcStatus();
    updateJobMasterySpecUI();
    if (typeof saveGame === "function") saveGame(false);
}

// 🔄 ジョブ特化ポイントの振り直し（交換所ポイント100Pt消費で全額返還）
function resetJobMastery(jobId) {
    const jd = ensureJobMasteryStructure(jobId);
    const totalAlloc = (jd.masteryAlloc.spec1 || 0) + (jd.masteryAlloc.spec2 || 0) + (jd.masteryAlloc.spec3 || 0);
    if (totalAlloc <= 0) {
        addLog(`<span style="color: #ffaa00;">⚠️ 割り振られた職能ポイントがありません。</span>`);
        return;
    }
    const RESET_COST = 100;
    if ((player.exchangePoints || 0) < RESET_COST) {
        addLog(`<span style="color: #ff6666;">⚠️ 職能ポイントの振り直しには素材交換ポイントが <b>${RESET_COST} Pt</b> 必要です。（現在: ${player.exchangePoints || 0} Pt）</span>`);
        return;
    }
    player.exchangePoints -= RESET_COST;
    jd.masteryPoints = (jd.masteryPoints || 0) + totalAlloc;
    jd.masteryAlloc = { spec1: 0, spec2: 0, spec3: 0 };
    
    addLog(`🔄 <span style="color: #00e5ff; font-weight: bold;">【職能振り直し】</span> 交換ポイント 100Pt を消費し、${jobId} の職能ポイント <b>${totalAlloc} JMP</b> を全額返還・リセットしました！`);
    
    calcStatus();
    updateJobMasterySpecUI();
    updateInventoryDisplay();
    if (typeof saveGame === "function") saveGame(false);
}

// 👑 ジョブ超越特化ツリーUIの描画（差分チェック＆非表示時スキップによる最適化）
let _lastMasterySpecCache = "";

function updateJobMasterySpecUI(force = false) {
    const box = document.getElementById('job-mastery-spec-box');
    if (!box) return;

    // ステータスタブ内のジョブサブタブが開いていない場合は無駄な再描画をスキップ
    const jobTab = document.getElementById('status-jobs');
    const statusTab = document.getElementById('tab-status');
    const isVisible = (statusTab && statusTab.classList.contains('active')) && (jobTab && jobTab.classList.contains('active'));
    if (!isVisible && !force) return;

    const currentJobId = player.job;
    const jd = ensureJobMasteryStructure(currentJobId);
    const starCount = jd.level > 100 ? jd.level - 100 : 0;
    const jmp = jd.masteryPoints || 0;
    const specs = (typeof JOB_MASTERY_SPECS !== "undefined") ? JOB_MASTERY_SPECS[currentJobId] : null;
    const resonance = getJobMasteryResonanceBonus();
    const totalAlloc = (jd.masteryAlloc.spec1 || 0) + (jd.masteryAlloc.spec2 || 0) + (jd.masteryAlloc.spec3 || 0);

    // 差分キャッシュ：内容が変わっていなければDOM再構築を行わない（チラツキ防止）
    const cacheKey = `${currentJobId}_${jd.level}_${jmp}_${jd.masteryAlloc.spec1}_${jd.masteryAlloc.spec2}_${jd.masteryAlloc.spec3}_${resonance.totalStars}_${player.exchangePoints}`;
    if (!force && _lastMasterySpecCache === cacheKey) {
        return;
    }
    _lastMasterySpecCache = cacheKey;

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #9c27b0; padding-bottom: 8px; margin-bottom: 10px;">
            <div>
                <span style="font-size: 15px; font-weight: bold; color: #e1bee7;">👑 【${currentJobId}】超越マスタリー特化ツリー</span>
                <span style="margin-left: 8px; font-size: 13px; color: #ffd700;">超越: <b>★${starCount}</b> (Lv.${jd.level})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px; background: #2e1534; border: 1px solid #ba68c8; border-radius: 4px; padding: 3px 8px;">
                    💎 職能ポイント: <b style="color: #00ffff; font-size: 14px;">${jmp} JMP</b>
                </span>
                <button onclick="resetJobMastery('${currentJobId}')" ${totalAlloc > 0 ? '' : 'disabled'} style="background: ${totalAlloc > 0 ? '#6a1b9a' : '#444'}; border: 1px solid #ce93d8; font-size: 11px; padding: 4px 8px; margin-bottom: 0;" title="交換所ポイント100Ptを消費し、割り振った職能ポイントをすべて回収します">
                    🔄 振り直し (交換Pt: 100)
                </button>
            </div>
        </div>
    `;

    if (jd.level < 100) {
        html += `
            <div style="background: #23192d; border-radius: 4px; padding: 8px 12px; margin-bottom: 10px; font-size: 12px; color: #ce93d8;">
                ℹ️ <b>【ジョブ超越ガイド】</b><br>
                ジョブレベルが <b>Lv.100 (MASTER)</b> に到達するとジョブ超越が解禁されます！<br>
                Lv.101以降はレベルアップごとに <b>職能ポイント(JMP)</b> を1獲得し、下記の3大特化アビリティへ自由に割り振って長所を特化できます。
            </div>
        `;
    }

    if (specs) {
        html += `<div class="job-spec-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-bottom: 12px;">`;
        const specKeys = ["spec1", "spec2", "spec3"];
        for (const k of specKeys) {
            const sp = specs[k];
            if (!sp) continue;
            const pts = jd.masteryAlloc[k] || 0;
            const currentBonusText = formatMasteryEffectText(sp, pts);
            const canAdd1 = jmp >= 1;
            const canAdd5 = jmp >= 5;

            html += `
                <div style="background: #1e162a; border: 1px solid #7b1fa2; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                            <span style="font-weight: bold; color: #ffeb3b; font-size: 13px;">${sp.name}</span>
                            <span style="font-size: 12px; color: #00e5ff; font-weight: bold;">Lv.${pts}</span>
                        </div>
                        <div style="font-size: 11px; color: #bbb; margin-bottom: 6px; line-height: 1.4;">
                            ${sp.desc}
                        </div>
                        <div style="font-size: 11px; color: #81c784; background: #132415; border-radius: 3px; padding: 2px 6px; margin-bottom: 8px;">
                            現在値: <b>${currentBonusText}</b>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                        <button onclick="allocateJobMastery('${currentJobId}', '${k}', 1)" ${canAdd1 ? '' : 'disabled'} style="flex: 1; padding: 3px 6px; font-size: 11px; background: ${canAdd1 ? '#4a148c' : '#444'}; margin-bottom: 0;">
                            +1 Pt
                        </button>
                        <button onclick="allocateJobMastery('${currentJobId}', '${k}', 5)" ${canAdd5 ? '' : 'disabled'} style="flex: 1; padding: 3px 6px; font-size: 11px; background: ${canAdd5 ? '#6a1b9a' : '#444'}; margin-bottom: 0;">
                            +5 Pt
                        </button>
                    </div>
                </div>
            `;
        }
        html += `</div>`;
    }

    // 全ジョブ超越共鳴ボーナス枠（案C）
    html += `
        <div style="background: #141926; border: 1px solid #2196f3; border-radius: 6px; padding: 8px 12px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="color: #64b5f6; font-weight: bold;">🌌 全ジョブMASTER超越共鳴ボーナス（案C）</span>
                <span style="color: #ffd700; font-weight: bold;">全ジョブ超越★合計: ${resonance.totalStars} ★</span>
            </div>
            <div style="color: #ccc; line-height: 1.5; font-size: 11px;">
                全基礎ステータス: <b style="color: #ffff88;">+${resonance.allStats}</b> ｜ 
                HP: <b style="color: #ff8888;">+${resonance.hp}</b> ｜ 
                MP: <b style="color: #88c0ff;">+${resonance.mp}</b> ｜ 
                ドロップ率: <b style="color: #88ff88;">+${resonance.drop}%</b>
            </div>
            <div style="color: #78909c; font-size: 10px; margin-top: 2px;">
                ※全27ジョブのLv.101以降の★数が合算され、現在の就役ジョブに関わらず常時主人公に還元されます！
            </div>
        </div>
    `;

    box.innerHTML = html;
}

// 🔥 連戦チェイン ＆ 🧪 修練バフインジケーターUIの更新（差分更新によるチラツキ防止）
let _lastChainVal = -1;
let _lastBuffText = "";

function updateChainAndBuffUI() {
    const chainEl = document.getElementById('display-battle-chain');
    const bonusEl = document.getElementById('display-chain-bonus');
    const buffEl = document.getElementById('display-training-buff');
    
    const chain = player.battleChain || 0;
    if (_lastChainVal !== chain) {
        _lastChainVal = chain;
        const chainBonusPct = Math.min(100, chain * 2);
        if (chainEl) {
            chainEl.innerText = `${chain} Chain`;
            chainEl.style.color = chain >= 30 ? "#ff5500" : (chain >= 10 ? "#ffaa00" : "#ffff00");
        }
        if (bonusEl) {
            bonusEl.innerText = `(+${chainBonusPct}% JLV・熟練度EXP)`;
            bonusEl.style.color = chainBonusPct >= 60 ? "#ff77ff" : "#88ff88";
        }
    }

    if (buffEl) {
        let currentBuffHtml = "";
        if (player.trainingBuff && player.trainingBuff.steps > 0) {
            let buffDesc = [];
            if (player.trainingBuff.jlvExpMult > 1.0) buffDesc.push(`JLV+${Math.round((player.trainingBuff.jlvExpMult - 1) * 100)}%`);
            if (player.trainingBuff.skillExpMult > 1.0) buffDesc.push(`熟練度+${Math.round((player.trainingBuff.skillExpMult - 1) * 100)}%`);
            const descStr = buffDesc.length > 0 ? ` [${buffDesc.join('・')}]` : '';
            currentBuffHtml = `🧪 <b style="color: #00ffcc;">${player.trainingBuff.name}</b>${descStr} (残り <b style="color: #fff;">${player.trainingBuff.steps}</b> 歩)`;
        } else {
            currentBuffHtml = `<span style="color: #667788;">🧪 修練バフ: 未発動</span>`;
        }
        if (_lastBuffText !== currentBuffHtml) {
            _lastBuffText = currentBuffHtml;
            buffEl.innerHTML = currentBuffHtml;
        }
    }
}

// 2. ステータス計算
function calcStatus() {
    ensureSkillsStructure();
    const sk = player.skills;
    // 全30種のスキル熟練度からの固定ステータスボーナス集計（すべての行動がキャラ強化に直結！）
    const bonusHp = (sk.magic.level - 1) * 5
        + (sk.shield.level - 1) * 10
        + ((sk.fireRes.level - 1) + (sk.waterRes.level - 1) + (sk.windRes.level - 1) + (sk.earthRes.level - 1)) * 5
        + (sk.careful.level - 1) * 8
        + (sk.autoWalk.level - 1) * 5
        + (sk.cooking.level - 1) * 10
        + (sk.survival.level - 1) * 12;

    const bonusMp = (sk.magic.level - 1) * 5
        + ((sk.fireMagic.level - 1) + (sk.waterMagic.level - 1) + (sk.windMagic.level - 1) + (sk.earthMagic.level - 1)) * 3
        + (sk.gathering.level - 1) * 5
        + (sk.cooking.level - 1) * 5;

    const bonusAtk = ((sk.unarmed.level - 1) + (sk.sword.level - 1) + (sk.spear.level - 1) + (sk.bow.level - 1) + (sk.gun.level - 1)) * 2
        + (sk.katana.level - 1) * 3
        + (sk.axe.level - 1) * 3
        + (sk.rush.level - 1) * 3
        + (sk.blacksmith.level - 1) * 2
        + (sk.refining.level - 1) * 2;

    const bonusMatk = (sk.magic.level - 1) * 2
        + ((sk.fireMagic.level - 1) + (sk.waterMagic.level - 1) + (sk.windMagic.level - 1) + (sk.earthMagic.level - 1)) * 2
        + (sk.rush.level - 1) * 3;

    const bonusDef = (sk.shield.level - 1) * 2
        + (sk.unarmed.level - 1) * 1
        + (sk.careful.level - 1) * 2
        + (sk.blacksmith.level - 1) * 2
        + (sk.refining.level - 1) * 2
        + (sk.earthRes.level - 1) * 2
        + (sk.survival.level - 1) * 1;

    const bonusMdef = ((sk.fireRes.level - 1) + (sk.waterRes.level - 1) + (sk.windRes.level - 1) + (sk.earthRes.level - 1) + (sk.magic.level - 1)) * 1
        + (sk.careful.level - 1) * 2
        + (sk.sewing.level - 1) * 2;

    const bonusHit = (sk.bow.level - 1) * 0.5 + (sk.gun.level - 1) * 0.5 + (sk.search.level - 1) * 0.5;
    const bonusEva = (sk.evasion.level - 1) * 0.5 + (sk.autoWalk.level - 1) * 0.3 + (sk.windRes.level - 1) * 0.2;
    const bonusDrop = (sk.search.level - 1) * 2 + (sk.handicraft.level - 1) * 2 + (sk.trading.level - 1) * 2;
    const bonusLuc = (sk.trading.level - 1) * 1;
    const bonusAllStatFromRefining = Math.floor((sk.refining.level - 1) * 0.5);
    
    let eq = { hp: 0, mp: 0, atk: 0, matk: 0, def: 0, mdef: 0, hit: 0, eva: 0, drop: 0, str: 0, int: 0, vit: 0, dex: 0, agi: 0, luc: 0, fire_res: 0, crit: 0 };
    
    for (const slot in player.equipment) {
        if (player.equipment[slot]) {
            const stats = getItemStats(player.equipment[slot]);
            for (let key in eq) eq[key] += stats[key] || 0;
        }
    }

    // 🛡️ 発動中シリーズセット効果のステータス加算
    if (typeof getActiveSetBonuses === "function") {
        const activeSets = getActiveSetBonuses();
        for (const act of activeSets) {
            for (const th of act.thresholds) {
                if (th.stats) {
                    for (const k in th.stats) {
                        if (eq[k] !== undefined) {
                            eq[k] += th.stats[k];
                        }
                    }
                }
            }
        }
    }

    const st = player.stats;
    
     // --- ジョブマスターの永久パッシブ集計 ---
    let stMult = { str: 1, int: 1, vit: 1, dex: 1, agi: 1, luc: 1, hp: 1, mp: 1, atk: 1, matk: 1 };
    let stFlat = { hit: 0, eva: 0, drop: 0 };
    
    for (const jobId in player.jobLevels) {
        if (player.jobLevels[jobId].isMaster && JOBS[jobId]?.masterPassive) {
            const p = JOBS[jobId].masterPassive;
            switch (p.effectType) {
                case "strPercent": stMult.str *= p.value; break;
                case "intPercent": stMult.int *= p.value; break;
                case "vitPercent": stMult.vit *= p.value; break;
                case "dexPercent": stMult.dex *= p.value; break;
                case "agiPercent": stMult.agi *= p.value; break;
                case "lucPercent": stMult.luc *= p.value; break;
                case "allStatsPercent":
                    stMult.str *= p.value; stMult.int *= p.value; stMult.vit *= p.value;
                    stMult.dex *= p.value; stMult.agi *= p.value; stMult.luc *= p.value;
                    break;
                case "hpPercent": stMult.hp *= p.value; break;
                case "mpPercent": stMult.mp *= p.value; break;
                case "atkPercent": stMult.atk *= p.value; break;
                case "matkPercent": stMult.matk *= p.value; break;
                case "hitBonus": stFlat.hit += p.value; break;
                case "evaBonus": stFlat.eva += p.value; break;
                case "dropBonus": stFlat.drop += p.value; break;
            }
        }
    }

    // 装備中の武器種に対応する熟練度による乗算ブースト（Lvごとに+2%）
    const weaponType = getEquippedWeaponType();
    const weaponSkillLv = sk[weaponType] ? sk[weaponType].level : 1;
    if (weaponType === 'magic') {
        stMult.matk *= (1 + (weaponSkillLv - 1) * 0.02);
    } else {
        stMult.atk *= (1 + (weaponSkillLv - 1) * 0.02);
    }

    // 📖 図鑑コレクションボーナスの集計と適用
    const compBonus = getCompendiumBonuses();
    stMult.str *= compBonus.allStatMult;
    stMult.int *= compBonus.allStatMult;
    stMult.vit *= compBonus.allStatMult;
    stMult.dex *= compBonus.allStatMult;
    stMult.agi *= compBonus.allStatMult;
    stMult.luc *= compBonus.allStatMult;

    // 👑 全ジョブ超越共鳴ボーナス（案C）
    const resonance = getJobMasteryResonanceBonus();

    // 👑 現在ジョブの超越特化アビリティ効果（案A）
    const mastery = getCurrentJobMasteryEffects();

    // 🌌 総合熟練度共鳴ボーナス
    const skillResInfo = getSkillResonanceInfo();
    const skillResBonus = skillResInfo.bonus;

    // ✨ 熟練度マイルストーン奥義の累積効果
    const skMilestone = getSkillMilestoneEffects();

    // 🔗 複合シナジー奥義の累積効果
    const skSynergy = typeof getSkillSynergyEffects === "function" ? getSkillSynergyEffects() : {};

    // 🔀 サブジョブ（副職継承）効果
    const subJob = typeof getSubJobBonus === "function" ? getSubJobBonus() : {};

    // ジョブ特化ステータス倍率の乗算
    stMult.str *= (1 + (mastery.strPct || 0) / 100);
    stMult.int *= (1 + (mastery.intPct || 0) / 100);
    stMult.vit *= (1 + (mastery.vitPct || 0) / 100);
    stMult.dex *= (1 + (mastery.dexPct || 0) / 100);
    stMult.agi *= (1 + (mastery.agiPct || 0) / 100) * (1 + (subJob.agiMult || 0));
    stMult.luc *= (1 + (mastery.lucPct || 0) / 100);

    // マイルストーン奥義・シナジー奥義による乗算補正
    if (skMilestone.atkPct) stMult.atk *= (1 + skMilestone.atkPct / 100);
    if (skMilestone.matkPct) stMult.matk *= (1 + skMilestone.matkPct / 100);
    if (skSynergy.atkPct) stMult.atk *= (1 + skSynergy.atkPct / 100);
    if (skSynergy.matkPct) stMult.matk *= (1 + skSynergy.matkPct / 100);

    // 📜 ギルドランク恒久ボーナス
    const guildRank = getCurrentGuildRank();
    const rankAllStats = guildRank.allStats || 0;

    // 👑 装着中のプレイヤー称号（二つ名）ボーナス
    const currentTitleId = player.equippedTitle || "駆け出し冒険者";
    const titleObj = (typeof PLAYER_TITLES !== "undefined") ? PLAYER_TITLES.find(t => t.id === currentTitleId) : null;
    const tBonus = titleObj?.bonus || {};
    const titleAllStats = tBonus.allStats || 0;

    // 基礎ステータスに装備＋図鑑コレクション＋ギルドランク＋二つ名＋共鳴＋ジョブ特化＋熟練度共鳴＋鍛錬固定値＋シナジー＋サブジョブを加算
    const totalAllStatBonus = (compBonus.flatAllStats || 0) + (rankAllStats || 0) + (titleAllStats || 0) + (resonance.allStats || 0) + (mastery.allStats || 0) + (skillResBonus.allStats || 0) + (bonusAllStatFromRefining || 0) + (skSynergy.allStats || 0) + (subJob.allStats || 0);
    const totalStrBonus = totalAllStatBonus + (tBonus.str || 0);
    const totalIntBonus = totalAllStatBonus + (tBonus.int || 0);
    const totalVitBonus = totalAllStatBonus + (tBonus.vit || 0);
    const totalDexBonus = totalAllStatBonus + (tBonus.dex || 0);
    const totalAgiBonus = totalAllStatBonus + (tBonus.agi || 0);
    const totalLucBonus = totalAllStatBonus + (compBonus.flatLucExtra || 0) + (bonusLuc || 0) + (tBonus.luc || 0);

    const rawStr = Math.floor(((st.str || 10) + (eq.str || 0) + totalStrBonus) * (stMult.str || 1));
    const rawInt = Math.floor(((st.int || 10) + (eq.int || 0) + totalIntBonus) * (stMult.int || 1));
    const rawVit = Math.floor(((st.vit || 10) + (eq.vit || 0) + totalVitBonus) * (stMult.vit || 1));
    const rawDex = Math.floor(((st.dex || 10) + (eq.dex || 0) + totalDexBonus) * (stMult.dex || 1));
    const rawAgi = Math.floor(((st.agi || 10) + (eq.agi || 0) + totalAgiBonus) * (stMult.agi || 1));
    const rawLuc = Math.floor(((st.luc || 10) + (eq.luc || 0) + totalLucBonus) * (stMult.luc || 1));

    const totalStr = Math.max(1, isNaN(rawStr) ? 10 : rawStr);
    const totalInt = Math.max(1, isNaN(rawInt) ? 10 : rawInt);
    const totalVit = Math.max(1, isNaN(rawVit) ? 10 : rawVit);
    const totalDex = Math.max(1, isNaN(rawDex) ? 10 : rawDex);
    const totalAgi = Math.max(1, isNaN(rawAgi) ? 10 : rawAgi);
    const totalLuc = Math.max(1, isNaN(rawLuc) ? 10 : rawLuc);
    
    const prevMaxHp = player.maxHp;
    const prevMaxMp = player.maxMp;

    // 仕様書⑥に基づく計算 ＋ 熟練度補正 ＋ 図鑑補正 ＋ ギルドランク ＋ 二つ名 ＋ マスターパッシブ ＋ 超越共鳴 ＋ 特化効果 ＋ 熟練度共鳴・マイルストーン・シナジー
    let baseMaxHp = Math.floor((100 + (totalVit * 10) + (bonusHp || 0) + (eq.hp || 0) + (compBonus.flatHp || 0) + (resonance.hp || 0) + (mastery.flatHp || 0) + (skillResBonus.hp || 0) + (skMilestone.flatHp || 0) + (tBonus.hp || 0)) * (stMult.hp || 1));
    if (mastery.hpPct) baseMaxHp = Math.floor(baseMaxHp * (1 + mastery.hpPct / 100));
    if (skSynergy.hpPct) baseMaxHp = Math.floor(baseMaxHp * (1 + skSynergy.hpPct / 100));
    player.maxHp = Math.max(1, isNaN(baseMaxHp) ? 100 : baseMaxHp);

    let baseMaxMp = Math.floor((20 + (totalInt * 5) + (bonusMp || 0) + (eq.mp || 0) + (compBonus.flatMp || 0) + (resonance.mp || 0) + (mastery.flatMp || 0) + (skillResBonus.mp || 0) + (skMilestone.flatMp || 0) + (tBonus.mp || 0)) * (stMult.mp || 1));
    if (mastery.mpPct) baseMaxMp = Math.floor(baseMaxMp * (1 + mastery.mpPct / 100));
    player.maxMp = Math.max(1, isNaN(baseMaxMp) ? 20 : baseMaxMp);

    let baseAtk = Math.floor((10 + (totalStr * 2) + (bonusAtk || 0) + (eq.atk || 0) + (compBonus.flatAtk || 0) + (mastery.flatAtk || 0) + (skillResBonus.atk || 0) + (skMilestone.flatAtk || 0) + (tBonus.atk || 0)) * (stMult.atk || 1));
    if (mastery.atkPct) baseAtk = Math.floor(baseAtk * (1 + mastery.atkPct / 100));
    player.atk = Math.max(0, isNaN(baseAtk) ? 10 : baseAtk);

    let baseMatk = Math.floor((5 + (totalInt * 2) + (bonusMatk || 0) + (eq.matk || 0) + (compBonus.flatMatk || 0) + (mastery.flatMatk || 0) + (skillResBonus.matk || 0) + (skMilestone.flatMatk || 0) + (tBonus.matk || 0)) * (stMult.matk || 1));
    if (mastery.matkPct) baseMatk = Math.floor(baseMatk * (1 + mastery.matkPct / 100));
    player.matk = Math.max(0, isNaN(baseMatk) ? 5 : baseMatk);

    let baseDef = (totalVit * 1) + (bonusDef || 0) + (eq.def || 0) + (compBonus.flatDef || 0) + (mastery.flatDef || 0) + (skillResBonus.def || 0) + (skMilestone.flatDef || 0) + (tBonus.def || 0);
    if (mastery.defPct) baseDef = Math.floor(baseDef * (1 + mastery.defPct / 100));
    if (skMilestone.defPct) baseDef = Math.floor(baseDef * (1 + skMilestone.defPct / 100));
    if (skSynergy.defPct) baseDef = Math.floor(baseDef * (1 + skSynergy.defPct / 100));
    player.def = Math.max(0, isNaN(baseDef) ? 5 : baseDef);

    let baseMdef = (totalInt * 1) + (bonusMdef || 0) + (eq.mdef || 0) + (compBonus.flatMdef || 0) + (mastery.flatMdef || 0) + (skillResBonus.mdef || 0) + (skMilestone.flatMdef || 0) + (tBonus.mdef || 0);
    if (mastery.mdefPct) baseMdef = Math.floor(baseMdef * (1 + mastery.mdefPct / 100));
    if (skMilestone.mdefPct) baseMdef = Math.floor(baseMdef * (1 + skMilestone.mdefPct / 100));
    if (skSynergy.mdefPct) baseMdef = Math.floor(baseMdef * (1 + skSynergy.mdefPct / 100));
    player.mdef = Math.max(0, isNaN(baseMdef) ? 5 : baseMdef);
    
    let calcHit = Math.floor((90 + (totalDex * 0.5) + (bonusHit || 0) + (eq.hit || 0) + (stFlat.hit || 0) + (compBonus.flatHit || 0) + (resonance.hit || 0) + (mastery.hit || 0) + (skillResBonus.hit || 0) + (skMilestone.hitRate || 0) + (skSynergy.hitRate || 0) + (subJob.hitRate || 0) + (tBonus.hit || 0)) * 10) / 10;
    player.hitRate = isNaN(calcHit) ? 95 : Math.min(100, Math.max(10, calcHit));
    
    let calcEva = Math.floor(((totalAgi * 0.5) + (bonusEva || 0) + (eq.eva || 0) + (stFlat.eva || 0) + (compBonus.flatEva || 0) + (resonance.eva || 0) + (mastery.eva || 0) + (skillResBonus.eva || 0) + (skMilestone.evaRate || 0) + (skSynergy.evaRate || 0) + (subJob.evaRate || 0) + (tBonus.eva || 0)) * 10) / 10;
    player.evasionRate = isNaN(calcEva) ? 10 : Math.min(50, Math.max(0, calcEva));
    
    let calcDrop = 100 + (totalLuc * 1) + (bonusDrop || 0) + (eq.drop || 0) + (stFlat.drop || 0) + (compBonus.flatDrop || 0) + (resonance.drop || 0) + (mastery.drop || 0) + (skillResBonus.drop || 0) + (skMilestone.dropRate || 0) + (skSynergy.dropRate || 0) + (subJob.dropBonus || 0) + (guildRank.dropBonus || 0) + (tBonus.drop || 0);
    player.dropRateBonus = isNaN(calcDrop) ? 100 : Math.max(100, calcDrop);

    // --- ジョブ特性の適用（最上級職・隠しジョブ全10種含む） ---
    if (player.job === "竜騎士" && player.equipment.weapon && (player.equipment.weapon.includes("ランス") || player.equipment.weapon.includes("槍"))) {
        player.maxHp = Math.floor(player.maxHp * 1.5);
        player.atk = Math.floor(player.atk * 1.5);
    }
    if (player.job === "魔導機工師") {
        player.dropRateBonus += 50;
    }
    if (player.job === "トレジャーシーカー") {
        player.dropRateBonus += 25;
    }
    if (player.job === "ベルセルク") {
        player.atk = Math.floor(player.atk * 1.2);
    }
    if (player.job === "神聖至高職") {
        player.maxMp = Math.floor(player.maxMp * 2);
    }
    if (player.job === "深淵の踏破者") {
        player.maxHp = Math.floor(player.maxHp * 1.25);
        player.atk = Math.floor(player.atk * 1.25);
        player.matk = Math.floor(player.matk * 1.25);
        player.dropRateBonus += 30;
    }
    if (player.job === "拳聖") {
        const isFist = !player.equipment.weapon || player.equipment.weapon.includes("ナックル") || player.equipment.weapon.includes("拳") || player.equipment.weapon.includes("クロー") || player.equipment.weapon.includes("爪") || player.equipment.weapon.includes("フィスト");
        player.atk = Math.floor(player.atk * (isFist ? 2.2 : 1.4));
        player.evasionRate = Math.min(60, player.evasionRate + 15);
    }
    if (player.job === "アルケミスト") {
        player.dropRateBonus += 30;
        player.maxMp = Math.floor(player.maxMp * 1.3);
    }
    if (player.job === "ヴァルキリー") {
        player.atk = Math.floor(player.atk * 1.3);
        player.matk = Math.floor(player.matk * 1.3);
        player.def = Math.floor(player.def * 1.3);
        player.evasionRate = Math.min(60, player.evasionRate + 10);
    }
    if (player.job === "アサシン") {
        player.evasionRate = Math.min(60, player.evasionRate + 12);
        player.dropRateBonus += 35;
    }
    if (player.job === "パラディン") {
        player.def = Math.floor(player.def * 1.4);
        player.mdef = Math.floor(player.mdef * 1.4);
        player.maxHp = Math.floor(player.maxHp * 1.3);
    }
    if (player.job === "ネクロマンサー") {
        player.matk = Math.floor(player.matk * 1.35);
        player.maxMp = Math.floor(player.maxMp * 1.25);
    }
    if (player.job === "刀神") {
        const wType = getEquippedWeaponType();
        const isKatana = wType === 'katana';
        const isSword = wType === 'sword';
        player.atk = Math.floor(player.atk * (isKatana ? 1.7 : (isSword ? 1.5 : 1.3)));
        player.hitRate = Math.min(100, player.hitRate + 12);
    }
    if (player.job === "星詠みの賢者") {
        player.matk = Math.floor(player.matk * 1.4);
        player.dropRateBonus += 40;
    }
    if (player.job === "ゴッドハンド") {
        const isFist = !player.equipment.weapon || player.equipment.weapon.includes("ナックル") || player.equipment.weapon.includes("拳") || player.equipment.weapon.includes("クロー") || player.equipment.weapon.includes("爪") || player.equipment.weapon.includes("フィスト");
        player.atk = Math.floor(player.atk * (isFist ? 2.5 : 1.5));
        player.def = Math.floor(player.def * 1.4);
        player.mdef = Math.floor(player.mdef * 1.4);
        player.maxHp = Math.floor(player.maxHp * 1.35);
    }
    if (player.job === "万象の覇王") {
        player.maxHp = Math.floor(player.maxHp * 1.35);
        player.maxMp = Math.floor(player.maxMp * 1.35);
        player.atk = Math.floor(player.atk * 1.35);
        player.matk = Math.floor(player.matk * 1.35);
        player.def = Math.floor(player.def * 1.35);
        player.mdef = Math.floor(player.mdef * 1.35);
        player.dropRateBonus += 60;
    }
    if (player.job === "破壊神") {
        const wType = getEquippedWeaponType();
        player.atk = Math.floor(player.atk * (wType === 'axe' ? 1.8 : 1.3));
    }
    if (player.job === "神弓・ホークアイ") {
        const wType = getEquippedWeaponType();
        player.atk = Math.floor(player.atk * (wType === 'bow' ? 1.7 : 1.25));
        player.hitRate = Math.min(100, player.hitRate + 20);
        player.evasionRate = Math.min(60, player.evasionRate + 10);
    }
    if (player.job === "大匠神") {
        player.def = Math.floor(player.def * 1.35);
        player.mdef = Math.floor(player.mdef * 1.35);
    }
    if (player.job === "大豪商") {
        player.dropRateBonus += 60;
    }

    // --- 🔀 サブジョブ（副職継承）による乗算倍率の適用 ---
    if (subJob) {
        if (subJob.hpMult) player.maxHp = Math.floor(player.maxHp * (1 + subJob.hpMult));
        if (subJob.mpMult) player.maxMp = Math.floor(player.maxMp * (1 + subJob.mpMult));
        if (subJob.atkMult) player.atk = Math.floor(player.atk * (1 + subJob.atkMult));
        if (subJob.matkMult) player.matk = Math.floor(player.matk * (1 + subJob.matkMult));
        if (subJob.defMult) player.def = Math.floor(player.def * (1 + subJob.defMult));
        if (subJob.mdefMult) player.mdef = Math.floor(player.mdef * (1 + subJob.mdefMult));

        const wType = getEquippedWeaponType();
        const isFist = !player.equipment.weapon || wType === 'unarmed';
        if (subJob.spearHpMult && wType === 'spear') player.maxHp = Math.floor(player.maxHp * (1 + subJob.spearHpMult));
        if (subJob.spearAtkMult && wType === 'spear') player.atk = Math.floor(player.atk * (1 + subJob.spearAtkMult));
        if (subJob.fistAtkMult && isFist) player.atk = Math.floor(player.atk * (1 + subJob.fistAtkMult));
        if (subJob.katanaAtkMult && wType === 'katana') player.atk = Math.floor(player.atk * (1 + subJob.katanaAtkMult));
        if (subJob.swordAtkMult && wType === 'sword') player.atk = Math.floor(player.atk * (1 + subJob.swordAtkMult));
        if (subJob.axeAtkMult && wType === 'axe') player.atk = Math.floor(player.atk * (1 + subJob.axeAtkMult));
        if (subJob.bowAtkMult && wType === 'bow') player.atk = Math.floor(player.atk * (1 + subJob.bowAtkMult));
        if (subJob.gunAtkMult && wType === 'gun') player.atk = Math.floor(player.atk * (1 + subJob.gunAtkMult));
    }
    
    // --- セット中のパッシブスキルの効果適用（隠しパッシブ全11種含む） ---
    if (player.passiveSkills.includes("見切り")) {
        player.evasionRate = Math.min(60, player.evasionRate + 10);
    }
    if (player.passiveSkills.includes("トレジャーハンター")) {
        player.dropRateBonus += 30;
    }
    if (player.passiveSkills.includes("心眼")) {
        player.hitRate = Math.min(100, player.hitRate + 12);
        player.evasionRate = Math.min(60, player.evasionRate + 8);
    }
    if (player.passiveSkills.includes("剛毅なる肉体")) {
        player.maxHp = Math.floor(player.maxHp * 1.15);
        player.def = Math.floor(player.def * 1.15);
    }
    if (player.passiveSkills.includes("魔力暴走")) {
        player.matk = Math.floor(player.matk * 1.20);
    }
    if (player.passiveSkills.includes("幸運の星")) {
        player.dropRateBonus += 40;
    }
    if (player.passiveSkills.includes("疾風怒濤")) {
        player.atk = Math.floor(player.atk * 1.12);
        player.matk = Math.floor(player.matk * 1.12);
        player.evasionRate = Math.min(60, player.evasionRate + 10);
    }
    if (player.passiveSkills.includes("大地の恵み")) {
        player.maxHp = Math.floor(player.maxHp * 1.15);
    }
    if (player.passiveSkills.includes("魔道回路")) {
        const prevAtk = player.atk;
        const prevMatk = player.matk;
        player.atk = Math.floor(prevAtk + prevMatk * 0.25);
        player.matk = Math.floor(prevMatk + prevAtk * 0.25);
        player.hitRate = Math.min(100, player.hitRate + 10);
    }
    if (player.passiveSkills.includes("黄金律")) {
        player.dropRateBonus += 50;
    }
    if (player.passiveSkills.includes("神域のオーラ")) {
        player.maxHp = Math.floor(player.maxHp * 1.12);
        player.maxMp = Math.floor(player.maxMp * 1.12);
        player.atk = Math.floor(player.atk * 1.12);
        player.matk = Math.floor(player.matk * 1.12);
        player.def = Math.floor(player.def * 1.12);
        player.mdef = Math.floor(player.mdef * 1.12);
    }

    // 現在HP/MPの調整とNaN・不正値救済
    if (isNaN(player.hp) || player.hp === undefined || player.hp === null || (player.hp <= 0 && !prevMaxHp)) {
        player.hp = player.maxHp;
    } else {
        if (player.maxHp > prevMaxHp && prevMaxHp > 0) player.hp += (player.maxHp - prevMaxHp);
        if (player.hp > player.maxHp) player.hp = player.maxHp;
    }

    if (isNaN(player.mp) || player.mp === undefined || player.mp === null || (player.mp <= 0 && !prevMaxMp)) {
        player.mp = player.maxMp;
    } else {
        if (player.maxMp > prevMaxMp && prevMaxMp > 0) player.mp += (player.maxMp - prevMaxMp);
        if (player.mp > player.maxMp) player.mp = player.maxMp;
    } 

    // UI更新
    document.getElementById('stat-str').innerText = st.str;
    document.getElementById('stat-int').innerText = st.int;
    document.getElementById('stat-vit').innerText = st.vit;
    document.getElementById('stat-dex').innerText = st.dex;
    document.getElementById('stat-agi').innerText = st.agi;
    document.getElementById('stat-luc').innerText = st.luc;
    document.getElementById('display-stat-points').innerText = player.statPoints;

    // PLV / JLV UI更新
    document.getElementById('display-plv').innerText = player.level;
    document.getElementById('display-plv-exp').innerText = player.exp;
    document.getElementById('display-plv-next').innerText = player.nextExp;
    document.getElementById('player-job').innerText = player.job;
    const currentJob = ensureJobMasteryStructure(player.job);
    const starCount = currentJob.level > 100 ? currentJob.level - 100 : 0;
    const jlvText = starCount > 0 ? `Lv.${currentJob.level} (★${starCount} MASTER)` : `${currentJob.level}${currentJob.isMaster ? " ★MASTER" : ""}`;
    document.getElementById('display-jlv').innerText = jlvText;
    document.getElementById('display-jlv-exp').innerText = currentJob.exp;
    document.getElementById('display-jlv-next').innerText = currentJob.nextExp;

    // ステータス振り分けボタンの表示制御
    document.querySelectorAll('.stat-btn').forEach(btn => {
        btn.style.display = player.statPoints > 0 ? 'inline-block' : 'none';
        const addVal = Math.min(player.statPoints, statAllocateAmount);
        btn.innerText = `+${addVal}`; // 一括振りの数値をボタンに表示
    });

    document.getElementById('display-hp').innerText = player.hp;
    document.getElementById('display-max-hp').innerText = player.maxHp;
    document.getElementById('display-mp').innerText = player.mp;
    document.getElementById('display-max-mp').innerText = player.maxMp;
    document.getElementById('display-atk').innerText = player.atk;
    document.getElementById('display-matk').innerText = player.matk;
    document.getElementById('display-def').innerText = player.def;
    document.getElementById('display-mdef').innerText = player.mdef;
    document.getElementById('display-hit').innerText = player.hitRate;
    document.getElementById('display-eva').innerText = player.evasionRate;
    document.getElementById('display-drop').innerText = player.dropRateBonus;

    document.getElementById('bonus-hp').innerText = bonusHp;
    if (document.getElementById('bonus-mp')) document.getElementById('bonus-mp').innerText = bonusMp;
    document.getElementById('bonus-atk').innerText = bonusAtk;
    if (document.getElementById('bonus-matk')) document.getElementById('bonus-matk').innerText = bonusMatk;
    if (document.getElementById('bonus-def')) document.getElementById('bonus-def').innerText = bonusDef;
    document.getElementById('player-job').innerText = player.job;

    // 📖 ステータスタブ内の図鑑収集ボーナス表示更新
    const compRateEl = document.getElementById('status-comp-rate');
    const compBonusEl = document.getElementById('status-comp-bonus');
    if (compRateEl) compRateEl.innerText = compBonus.compRate.toFixed(1);
    if (compBonusEl) {
        compBonusEl.innerText = `全基礎ステ+${compBonus.flatAllStats} (+${compBonus.allStatPctBonus}%), HP+${compBonus.flatHp}, MP+${compBonus.flatMp}, ATK/MATK+${compBonus.flatAtk}, 泥率+${compBonus.flatDrop}%`;
    }

    // 24種のスキル熟練度UIを一括更新（level, exp, next）
    for (const skillKey in player.skills) {
        const sData = player.skills[skillKey];
        const lvEl = document.getElementById(`level-${skillKey}`);
        const expEl = document.getElementById(`exp-${skillKey}`);
        const nextEl = document.getElementById(`next-${skillKey}`);
        if (lvEl) lvEl.innerText = sData.level;
        if (expEl) expEl.innerText = sData.exp;
        if (nextEl) nextEl.innerText = sData.next;
    }
    
    const exPtEl = document.getElementById('display-exchange-points');
    if (exPtEl) exPtEl.innerText = player.exchangePoints || 0;

    // 📜 ギルドランク＆👑 装着称号UIの更新
    const gRankEl = document.getElementById('display-guild-rank');
    const gTitleEl = document.getElementById('display-guild-rank-title');
    const gGpEl = document.getElementById('display-guild-gp');
    if (gRankEl) gRankEl.innerText = guildRank.rank || "F";
    if (gTitleEl) gTitleEl.innerText = guildRank.title || guildRank.name || "見習いギルド員";
    if (gGpEl) gGpEl.innerText = player.guild?.gp || 0;

    const eqTitleEl = document.getElementById('display-equipped-title');
    if (eqTitleEl) {
        const curTitle = getPlayerTitle(player.equippedTitle);
        eqTitleEl.innerText = curTitle ? curTitle.name : (player.equippedTitle || "なし");
    }

    const maxActEl = document.getElementById('max-active-slots');
    const maxPasEl = document.getElementById('max-passive-slots');
    if (maxActEl) maxActEl.innerText = getMaxActiveSkillSlots();
    if (maxPasEl) maxPasEl.innerText = getMaxPassiveSkillSlots();

    updateEquipmentDisplay();
    updateSkillsDisplay();
    updateJobMenuDisplay(); // ステータス更新時にメニューを開いていれば描画更新
    updateJobMasteryDisplay(); // ジョブ習得状況UIの更新
    if (typeof updateSubJobDisplay === "function") updateSubJobDisplay(); // 🔀 サブジョブUIの更新
    if (typeof updateJobMasterySpecUI === "function") updateJobMasterySpecUI(); // 👑 ジョブ超越特化ツリーUI
    if (typeof updateChainAndBuffUI === "function") updateChainAndBuffUI(); // 🔥 連戦チェイン＆修練バフUI
    updateSecretDiscoveryDisplay(); // 🕵️ 隠し要素図鑑の更新
    if (typeof updateCompendiumUI === "function") updateCompendiumUI(); // 📖 冒険者図鑑の更新
    if (typeof updateSkillResonanceUI === "function") updateSkillResonanceUI(); // 🌌 総合熟練度共鳴UIの更新
    if (typeof updateSkillSynergyUI === "function") updateSkillSynergyUI(); // 🔗 複合シナジー奥義UIの更新
    updateDungeonStatusUI(); // 冒険タブの簡易ステータス・ボタン表示更新
}

// ダンジョン進行度のUI表示を更新する
function updateExploreProgress() {
    const progress = document.getElementById('explore-progress');
    if (progress) progress.innerText = `(進行度: ${exploreSteps} / 100)`;
}

// 冒険タブ内の簡易ステータス・敵HP・手動ボタン表示を更新する（差分更新によるボタン点滅防止）
let _lastCombatState = null;
let _lastEnemyHpText = "";

function updateDungeonStatusUI() {
    const dHp = document.getElementById('dungeon-hp');
    const dMaxHp = document.getElementById('dungeon-max-hp');
    const dMp = document.getElementById('dungeon-mp');
    const dMaxMp = document.getElementById('dungeon-max-mp');
    if (dHp) dHp.innerText = player.hp;
    if (dMaxHp) dMaxHp.innerText = player.maxHp;
    if (dMp) dMp.innerText = player.mp;
    if (dMaxMp) dMaxMp.innerText = player.maxMp;

    const enemyStatus = document.getElementById('dungeon-enemy-status');
    const battleIndicator = document.getElementById('dungeon-battle-indicator');
    const hpBarWrap = document.getElementById('dungeon-enemy-hpbar-wrap');
    const hpBar = document.getElementById('dungeon-enemy-hpbar');
    const btnCareful = document.getElementById('btn-manual-careful');
    const btnRush = document.getElementById('btn-manual-rush');
    const btnFocus = document.getElementById('btn-manual-focus');

    const isCombat = !!enemy;
    if (isCombat) {
        if (battleIndicator) {
            battleIndicator.innerHTML = enemy.isBoss ? `<span style="color:#ff4444;">🚨 BOSS交戦中</span>` : `<span style="color:#ffaa00;">⚔️ 交戦中</span>`;
        }
        if (enemyStatus) {
            const bossBadge = enemy.isBoss ? '<b style="color:#ff4444;">[BOSS]</b> ' : '';
            const hpText = `${bossBadge}<b style="color:#ffcc00;">${enemy.name}</b> (HP: <b>${Math.max(0, enemy.hp)}</b>/${enemy.maxHp})`;
            if (_lastEnemyHpText !== hpText) {
                _lastEnemyHpText = hpText;
                enemyStatus.innerHTML = hpText;
            }
        }
        if (hpBarWrap) hpBarWrap.style.display = "block";
        if (hpBar) {
            const pct = Math.max(0, Math.min(100, Math.floor((enemy.hp / enemy.maxHp) * 100)));
            hpBar.style.width = pct + "%";
            hpBar.style.background = pct > 50 ? "#2ea043" : (pct > 20 ? "#ffaa00" : "#e55353");
        }
        if (_lastCombatState !== true) {
            _lastCombatState = true;
            if (btnCareful) btnCareful.innerHTML = `🛡️ 堅実攻撃 (MP:0)<br><span style="font-size: 11px; color: #ddd;">(微回復＋攻撃)</span>`;
            if (btnRush) btnRush.innerHTML = `💥 強襲攻撃 (MP:3)<br><span style="font-size: 11px; color: #ffd;">(威力1.3倍・熟練1.5倍)</span>`;
            if (btnFocus) btnFocus.innerHTML = `🎯 急所狙い (MP:3)<br><span style="font-size: 11px; color: #dfd;">(会心UP・泥率+50%)</span>`;
        }
    } else {
        if (battleIndicator) {
            battleIndicator.innerHTML = `<span style="color:#88ff88;">🌲 探索中</span>`;
        }
        if (enemyStatus && _lastEnemyHpText !== "safe") {
            _lastEnemyHpText = "safe";
            enemyStatus.innerHTML = `<span style="color: #aaa;">🌲 周囲は安全（接敵なし）</span>`;
        }
        if (hpBarWrap) hpBarWrap.style.display = "none";
        if (_lastCombatState !== false) {
            _lastCombatState = false;
            if (btnCareful) btnCareful.innerHTML = `👣 慎重に進む<br><span style="font-size: 11px; color: #ddd;">(+1歩 / 回復)</span>`;
            if (btnRush) btnRush.innerHTML = `⚔️ 強行突破 (MP:3)<br><span style="font-size: 11px; color: #ffd;">(+2〜3歩 / 熟練1.5倍)</span>`;
            if (btnFocus) btnFocus.innerHTML = `🔍 集中探索 (MP:3)<br><span style="font-size: 11px; color: #dfd;">(+1歩 / イベント)</span>`;
        }
    }
}

function addLog(message) {
    const logBox = document.getElementById('log');
    const span = document.createElement('span');
    span.innerHTML = message + "<br>";
    logBox.appendChild(span);
    
    // 50行を超えたら一番古いログを削除
    while (logBox.children.length > 50) {
        logBox.removeChild(logBox.firstChild);
    }
    logBox.scrollTop = logBox.scrollHeight;
}

function updateInventoryDisplay(force = false) {
    // インベントリ＆装備品を図鑑へ自動同期
    syncInventoryToCompendium();

    // インベントリタブが開いていない場合は無駄なDOM再構築をスキップ
    const invTab = document.getElementById('tab-inventory');
    const isVisible = invTab && invTab.classList.contains('active');
    if (!isVisible && !force) return;

    const invListMat = document.getElementById('inventory-list-materials');
    const invListEq = document.getElementById('inventory-list-equipment');
    const invListUsable = document.getElementById('inventory-list-usable');
    
    if (invListMat) invListMat.innerHTML = "";
    if (invListEq) invListEq.innerHTML = "";
    if (invListUsable) invListUsable.innerHTML = "";

    const items = Object.keys(player.inventory);
    if (items.length === 0) {
        if (invListMat) invListMat.innerHTML = "<li>(空っぽ)</li>";
        if (invListEq) invListEq.innerHTML = "<li>(空っぽ)</li>";
        if (invListUsable) invListUsable.innerHTML = "<li>(空っぽ)</li>";
        updateCraftMenu();
        if (typeof updateExchangeUI === "function") updateExchangeUI();
        return;
    }
    
    // ベース名でグループ化（parseItemNameで+値や称号を安全に正規化）
    const groupedItems = { materials: {}, equipment: {}, usable: {} };

    items.forEach(item => {
        const parsed = parseItemName(item);
        const baseName = parsed.baseName;
        let slot = getItemSlot(item);
        let category = "materials";
        if (slot === "usable") category = "usable";
        else if (slot !== null) category = "equipment";

        if (!groupedItems[category][baseName]) groupedItems[category][baseName] = [];
        groupedItems[category][baseName].push({ originalName: item, count: player.inventory[item], slot: slot, plus: parsed.plus });
    });

    const renderGroup = (groupData, targetElement) => {
        if (!targetElement) return;
        let count = 0;
        for (const baseName in groupData) {
            count++;
            const li = document.createElement('li');
            li.style.marginBottom = "5px";
            li.style.listStyle = "none";
            
            const totalCount = groupData[baseName].reduce((sum, i) => sum + i.count, 0);
            const header = document.createElement('div');
            header.style.cursor = "pointer"; header.style.background = "#444"; header.style.padding = "5px 10px";
            header.style.borderRadius = "4px"; header.style.userSelect = "none";
            header.innerHTML = `▶ <b>${baseName}</b> (計: ${totalCount})`;
            
            const detailList = document.createElement('ul');
            detailList.style.display = "none"; detailList.style.paddingLeft = "20px"; detailList.style.marginTop = "5px";
            
            header.onclick = () => {
                const isClosed = detailList.style.display === "none";
                detailList.style.display = isClosed ? "block" : "none";
                header.innerHTML = `${isClosed ? '▼' : '▶'} <b>${baseName}</b> (計: ${totalCount})`;
            };
            
            // ＋値が高い順、次いでレアリティ順にソートして見やすく表示
            groupData[baseName].sort((a, b) => {
                if ((b.plus || 0) !== (a.plus || 0)) return (b.plus || 0) - (a.plus || 0);
                return getPrefixRarity(b.originalName) - getPrefixRarity(a.originalName);
            });
            groupData[baseName].forEach(detail => {
                const detailLi = document.createElement('li');
                detailLi.style.marginBottom = "4px";
                const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(detail.originalName) : null;
                const nameColor = pInfo ? pInfo.color : (detail.slot && detail.slot !== 'usable' ? '#00ffcc' : '#ccc');
                const descTag = pInfo ? ` <span style="font-size: 11px; color: #888;">(${pInfo.desc})</span>` : "";
                
                // 装備品の場合の＋値バッジと簡易ステータス
                let equipTag = "";
                if (detail.slot && detail.slot !== "usable") {
                    const stats = getItemStats(detail.originalName);
                    const stParts = [];
                    if (stats.atk) stParts.push(`攻+${stats.atk}`);
                    if (stats.matk) stParts.push(`魔+${stats.matk}`);
                    if (stats.def) stParts.push(`防+${stats.def}`);
                    if (stats.hp) stParts.push(`HP+${stats.hp}`);
                    const stSummary = stParts.length > 0 ? ` <span style="font-size: 11px; color: #aaa;">[${stParts.slice(0, 3).join('/')}]</span>` : '';
                    const plusBadge = detail.plus > 0 ? ` <b style="color: #ffd700; background: #3d3300; padding: 1px 4px; border-radius: 3px; font-size: 11px;">+${detail.plus}</b>` : '';
                    equipTag = `${plusBadge}${stSummary}`;
                }

                detailLi.innerHTML = `<span style="color:${nameColor}; font-weight:${pInfo && pInfo.tier >= 3 || detail.plus > 0 ? 'bold' : 'normal'};">${detail.originalName}</span> <b>x${detail.count}</b>${equipTag}${descTag}`;
                // 装備品の場合のみ「装備」ボタン、消費アイテムには「使う」ボタンをつける
                if (detail.slot && detail.slot !== "usable") {
                    const btn = document.createElement('button');
                    btn.innerText = "装備"; btn.style.width = "auto"; btn.style.padding = "2px 8px";
                    btn.style.marginLeft = "10px"; btn.style.fontSize = "12px"; btn.style.marginBottom = "0";
                    btn.onclick = () => equipItem(detail.originalName);
                    detailLi.appendChild(btn);
                } else if (detail.slot === "usable") {
                    const btn = document.createElement('button');
                    btn.innerText = "使う"; btn.style.width = "auto"; btn.style.padding = "2px 8px";
                    btn.style.marginLeft = "10px"; btn.style.fontSize = "12px"; btn.style.marginBottom = "0";
                    btn.style.background = "#28a745";
                    btn.onclick = () => useItem(detail.originalName);
                    detailLi.appendChild(btn);
                }
                detailList.appendChild(detailLi);
            });
            li.appendChild(header); li.appendChild(detailList); targetElement.appendChild(li);
        }
        if (count === 0) {
            targetElement.innerHTML = "<li>(空っぽ)</li>";
        }
    };

    renderGroup(groupedItems.materials, invListMat);
    renderGroup(groupedItems.equipment, invListEq);
    renderGroup(groupedItems.usable, invListUsable);
    
    updateCraftMenu(); // 素材が変動したらボタンの点灯状態をチェック
    if (typeof updateExchangeUI === "function") updateExchangeUI();
    if (typeof updateForgeUI === "function") updateForgeUI();
}

// 消費アイテム（スープ・ポーション・秘薬・アムブロシア等）を使用する処理
function useItem(itemName, isAuto = false) {
    if (!player.inventory[itemName] || player.inventory[itemName] <= 0) return false;
    player.inventory[itemName]--;
    if (player.inventory[itemName] <= 0) delete player.inventory[itemName];

    // 調理熟練度・アルケミスト特性・称号による回復効果ボーナス
    const alchemistBonus = player.job === "アルケミスト" ? 0.4 : 0;
    const cookMult = 1 + (player.skills.cooking.level - 1) * 0.05 + alchemistBonus + (itemName.includes("伝説の") ? 0.5 : (itemName.includes("光る") ? 0.25 : 0));
    const autoPrefix = isAuto ? `<span style="color:#ffcc00;">[自動回復]</span> ` : `🧪 `;

    if (itemName.includes("特製薬草スープ")) {
        const hpHeal = Math.floor(player.maxHp * 0.5 * cookMult);
        const mpHeal = Math.floor(player.maxMp * 0.3 * cookMult);
        player.hp = Math.min(player.maxHp, player.hp + hpHeal);
        player.mp = Math.min(player.maxMp, player.mp + mpHeal);
        addLog(`${autoPrefix}<span style="color:#88ff88;">[${itemName}]</span> を飲み、HPが <b>${hpHeal}</b>、MPが <b>${mpHeal}</b> 回復した！`);
        gainSkillExp('cooking', 2);
    } else if (itemName.includes("妖精の蜜酒")) {
        const hpHeal = Math.floor(player.maxHp * 0.8 * cookMult);
        const mpHeal = Math.floor(player.maxMp * 0.8 * cookMult);
        const expBonus = Math.floor(300 * cookMult);
        player.hp = Math.min(player.maxHp, player.hp + hpHeal);
        player.mp = Math.min(player.maxMp, player.mp + mpHeal);
        addLog(`${autoPrefix}🍯 <span style="color:#88ff88;">[${itemName}]</span> を飲み、HP+<b>${hpHeal}</b>・MP+<b>${mpHeal}</b> 回復！(Exp+${expBonus})`);
        gainSkillExp('cooking', 3);
        gainExp(expBonus);
    } else if (itemName.includes("沼地キノコの魔力シチュー")) {
        const hpHeal = Math.floor(player.maxHp * 0.6 * cookMult);
        player.hp = Math.min(player.maxHp, player.hp + hpHeal);
        player.mp = player.maxMp;
        addLog(`${autoPrefix}🍲 <span style="color:#88ff88;">[${itemName}]</span> を食べ、MPが <b>全回復</b> し、HPが <b>${hpHeal}</b> 回復した！`);
        gainSkillExp('cooking', 3);
    } else if (itemName.includes("マンドラゴラ絶叫薬")) {
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        const expBonus = Math.floor(600 * cookMult);
        addLog(`${autoPrefix}🌱 <b style="color:#88ff88;">[${itemName}]</b> を使用！ HP・MPが <b>全回復</b> し、活力が湧き上がる！(Exp+${expBonus})`);
        gainSkillExp('cooking', 4);
        gainExp(expBonus);
    } else if (itemName.includes("上級薬草ポーション")) {
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        addLog(`${autoPrefix}<span style="color:#88ff88;">[${itemName}]</span> を使用し、HPとMPが <b>全回復</b> した！`);
        gainSkillExp('cooking', 3);
    } else if (itemName.includes("至高の秘薬エリクサー")) {
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        const expBonus = Math.floor(1500 * cookMult);
        addLog(`${autoPrefix}✨ <b style="color:#ffaa00;">[${itemName}]</b> を飲み干した！ HP・MPが全回復し、全身に奇跡の力が漲る！(Exp+${expBonus})`);
        gainSkillExp('cooking', 5);
        gainExp(expBonus);
    } else if (itemName.includes("神樹の黄金アムブロシア")) {
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        const statAdd = itemName.includes("伝説の") ? 2 : 1;
        player.stats.str += statAdd;
        player.stats.int += statAdd;
        player.stats.vit += statAdd;
        player.stats.dex += statAdd;
        player.stats.agi += statAdd;
        player.stats.luc += statAdd;
        const expBonus = Math.floor(3000 * cookMult);
        addLog(`${autoPrefix}🍎✨ <b style="color:#ffd700;">[${itemName}]</b> を食した！ HP・MP全快に加え、<b>全基礎ステータスが永続で +${statAdd} 上昇</b>した！(Exp+${expBonus})`);
        gainSkillExp('cooking', 8);
        gainExp(expBonus);
    } else if (itemName.includes("修練の特製オムレツ")) {
        const hpHeal = Math.floor(player.maxHp * 0.4 * cookMult);
        player.hp = Math.min(player.maxHp, player.hp + hpHeal);
        player.trainingBuff = { name: "🍳 修練オムレツ", steps: 100, jlvExpMult: 1.5, skillExpMult: 1.0 };
        addLog(`${autoPrefix}🍳 <b style="color:#ffd700;">[${itemName}]</b> を平らげた！ HPが <b>${hpHeal}</b> 回復し、<b>100歩の間、獲得JLV経験値が +50% (1.5倍)</b> に上昇した！`);
        gainSkillExp('cooking', 4);
    } else if (itemName.includes("達人の極光秘薬")) {
        const mpHeal = Math.floor(player.maxMp * 0.5 * cookMult);
        player.mp = Math.min(player.maxMp, player.mp + mpHeal);
        player.trainingBuff = { name: "🧪 達人極光", steps: 100, jlvExpMult: 1.0, skillExpMult: 1.5 };
        addLog(`${autoPrefix}🧪 <b style="color:#00ffcc;">[${itemName}]</b> を飲み干した！ MPが <b>${mpHeal}</b> 回復し、<b>100歩の間、全熟練度獲得量が +50% (1.5倍)</b> に上昇した！`);
        gainSkillExp('cooking', 5);
    } else if (itemName.includes("覚醒の神酒アムブロシア")) {
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        player.trainingBuff = { name: "🍷✨ 覚醒アムブロシア", steps: 150, jlvExpMult: 2.0, skillExpMult: 2.0 };
        addLog(`${autoPrefix}🍷✨ <b style="color:#ff66ff; font-size:14px;">[${itemName}]</b> を神聖に飲み干した！！ HP・MP全快！ さらに <b>150歩の間、JLV経験値＆全熟練度獲得量が +100% (2倍)</b> に覚醒上昇した！！`);
        gainSkillExp('cooking', 10);
    } else if (itemName.includes("神々の万能祝宴薬")) {
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        const statAdd = 1;
        player.stats.str += statAdd;
        player.stats.int += statAdd;
        player.stats.vit += statAdd;
        player.stats.dex += statAdd;
        player.stats.agi += statAdd;
        player.stats.luc += statAdd;
        player.trainingBuff = { name: "🎉 神々の万能祝宴", steps: 300, jlvExpMult: 1.75, skillExpMult: 1.75 };
        addLog(`${autoPrefix}🎉✨ <b style="color:#ffd700; font-size:14px;">[${itemName}]</b> を堪能した！！ HP・MP全快！ 全基礎ステータスが永続+1！ さらに <b>300歩の間、JLV経験値＆全熟練度獲得量が +75% (1.75倍)</b> に上昇！`);
        gainSkillExp('cooking', 8);
    }
    calcStatus();
    updateInventoryDisplay();
    if (typeof updateChainAndBuffUI === "function") updateChainAndBuffUI();
    return true;
}

// ====== 🛡️ シリーズ装備・セット効果マスターデータ ======
const EQUIPMENT_SERIES_DEFS = [
    {
        id: "racco",
        name: "ラッコ",
        icon: "🦦",
        color: "#d2a8ff",
        items: ["ラッコのフード", "ラッコの手袋", "森主の剛毛鎧", "黄金ラッコの王衣", "野獣の獣爪ナックル"],
        thresholds: [
            { count: 2, desc: "AGI+5, 採取・交易熟練度+20%", stats: { agi: 5 }, bonuses: { gatherSkillExp: 0.20, tradeSkillExp: 0.20 } },
            { count: 3, desc: "AGI+10, LUC+10, 泥率+15%, 回避+5%", stats: { agi: 10, luc: 10, drop: 15, eva: 5 } }
        ]
    },
    {
        id: "iron_golem",
        name: "重鉄ゴーレム",
        icon: "🗿",
        color: "#79c0ff",
        items: ["ロックヘルム", "アイアン籠手", "ゴーレムプレート", "ストーンシールド", "アイアンソード", "アイアンスピア", "重鉄のアイアンナックル", "重鉄のトマホーク"],
        thresholds: [
            { count: 2, desc: "DEF+15, VIT+8", stats: { def: 15, vit: 8 } },
            { count: 4, desc: "DEF+40, VIT+15, 被ダメ10%カット", stats: { def: 40, vit: 15 }, bonuses: { dmgCutPct: 10 } }
        ]
    },
    {
        id: "abyss_witch",
        name: "深淵魔術",
        icon: "🔮",
        color: "#bf80ff",
        items: ["深淵魔女の三角帽", "魔導師のローブ", "幻霧のエーテルマント", "深淵クラゲの魔導灯", "深淵魔女のグリモワール", "毒蛇咬のポイズンクロー"],
        thresholds: [
            { count: 2, desc: "MATK+25, INT+8", stats: { matk: 25, int: 8 } },
            { count: 3, desc: "MATK+60, INT+16, 全魔法スキル威力+20%", stats: { matk: 60, int: 16 }, bonuses: { magicDmgPct: 20 } }
        ]
    },
    {
        id: "steam_cyber",
        name: "スチーム機巧",
        icon: "⚙️",
        color: "#ffaa44",
        items: ["超演算タクティカルバイザー", "魔導探知ゴーグル", "ハイパー合金アーマー", "パワードアーム", "スチームグリーヴ", "機巧ピストンナックル", "スチームライフル"],
        thresholds: [
            { count: 2, desc: "DEX+12, スキル発動+5%", stats: { dex: 12 }, bonuses: { skillTrigger: 5 } },
            { count: 4, desc: "DEX+25, クリティカル倍率+0.3, スキル発動+10%", stats: { dex: 25 }, bonuses: { skillTrigger: 10, critDmg: 30 } }
        ]
    },
    {
        id: "seraph",
        name: "天界セラフィム",
        icon: "👼",
        color: "#ffd700",
        items: ["エンジェルヘイロー", "大天使のローブ", "熾天使の羽靴", "セラフィムメタルの聖冠", "熾天使の黄金翼衣", "天照の神刀・布都御魂", "ホーリーランス"],
        thresholds: [
            { count: 2, desc: "最大HP+120, 最大MP+80, 全耐性+10%", stats: { hp: 120, mp: 80 }, bonuses: { allRes: 10 } },
            { count: 4, desc: "全基礎ステ+15, 毎ターンHP/MP5%自動回復", stats: { str: 15, int: 15, vit: 15, dex: 15, agi: 15, luc: 15 }, bonuses: { autoRegenPct: 5 } }
        ]
    },
    {
        id: "training_master",
        name: "求道修練",
        icon: "🧪",
        color: "#88ff88",
        items: ["研鑽の鉢金", "求道工匠の手袋", "修羅の戦脚", "苦行僧のペンダント"],
        thresholds: [
            { count: 2, desc: "全スキルの熟練度獲得量 +20%", bonuses: { allSkillExp: 0.20 } },
            { count: 4, desc: "全熟練度+50%, JLV経験値+50%, 獲得EXP+25%", bonuses: { allSkillExp: 0.50, jlvExp: 0.50, exp: 0.25 } }
        ]
    }
];

// 発動中のシリーズセット効果を集計
function getActiveSetBonuses() {
    const active = [];
    if (!player || !player.equipment) return active;

    const equippedBaseNames = [];
    for (const slot in player.equipment) {
        const item = player.equipment[slot];
        if (!item) continue;
        const { baseName } = typeof parseItemName === "function" ? parseItemName(item) : { baseName: item };
        equippedBaseNames.push(baseName);
    }

    for (const series of EQUIPMENT_SERIES_DEFS) {
        let count = 0;
        for (const targetName of series.items) {
            if (equippedBaseNames.some(n => n === targetName || n.includes(targetName))) {
                count++;
            }
        }
        if (count >= 2) {
            const passed = series.thresholds.filter(t => count >= t.count);
            if (passed.length > 0) {
                active.push({
                    series,
                    count,
                    thresholds: passed
                });
            }
        }
    }
    return active;
}

// 発動中のシリーズセット効果から特定のボーナス数値を集計
function getEquipmentSetBonusValue(bonusKey) {
    if (typeof getActiveSetBonuses !== "function") return 0;
    const activeSets = getActiveSetBonuses();
    let val = 0;
    for (const act of activeSets) {
        for (const th of act.thresholds) {
            if (th.bonuses && th.bonuses[bonusKey]) {
                val += th.bonuses[bonusKey];
            }
        }
    }
    return val;
}

// ====== 📁 装備マイセット（プリセット保存＆ワンタップ着替え） ======
function ensureEquipmentPresetsStructure() {
    if (!player.equipmentPresets || !Array.isArray(player.equipmentPresets) || player.equipmentPresets.length !== 5) {
        const defaultNames = ["セット1 (汎用)", "セット2 (育成)", "セット3 (泥率)", "セット4 (火力)", "セット5 (耐久)"];
        const existing = Array.isArray(player.equipmentPresets) ? player.equipmentPresets : [];
        player.equipmentPresets = [0, 1, 2, 3, 4].map(i => {
            return {
                id: i + 1,
                name: (existing[i] && existing[i].name) ? existing[i].name : defaultNames[i],
                equipment: (existing[i] && existing[i].equipment) ? Object.assign({}, existing[i].equipment) : null
            };
        });
    }
}

function saveEquipmentPreset(index) {
    ensureEquipmentPresetsStructure();
    if (index < 0 || index >= player.equipmentPresets.length) return;
    const p = player.equipmentPresets[index];
    p.equipment = Object.assign({}, player.equipment);
    addLog(`📁💾 <b style="color:#00ffcc;">【装備セット保存】</b> 【${p.name}】に現在の装備構成を登録・保存しました！`);
    renderEquipmentPresetsUI();
    saveGame(false);
}

function renameEquipmentPreset(index) {
    ensureEquipmentPresetsStructure();
    if (index < 0 || index >= player.equipmentPresets.length) return;
    const p = player.equipmentPresets[index];
    const newName = prompt("装備セットの名前を変更してください:", p.name);
    if (newName && newName.trim()) {
        p.name = newName.trim();
        renderEquipmentPresetsUI();
        saveGame(false);
    }
}

function clearEquipmentPreset(index) {
    ensureEquipmentPresetsStructure();
    if (index < 0 || index >= player.equipmentPresets.length) return;
    const p = player.equipmentPresets[index];
    p.equipment = null;
    addLog(`📁🗑️ 【${p.name}】の登録データをクリアしました。`);
    renderEquipmentPresetsUI();
    saveGame(false);
}

function applyEquipmentPreset(index) {
    ensureEquipmentPresetsStructure();
    if (index < 0 || index >= player.equipmentPresets.length) return;
    const p = player.equipmentPresets[index];
    if (!p.equipment) {
        addLog(`<span style="color:#ffaa00;">⚠️ 【${p.name}】にはまだ装備が登録されていません。「保存」ボタンで登録してください。</span>`);
        return;
    }

    const slots = ['weapon', 'subWeapon', 'head', 'body', 'arm', 'leg', 'acc1', 'acc2', 'acc3'];
    let changedCount = 0;
    let missingItems = [];

    // 各スロットごとに着替え処理
    for (const slot of slots) {
        const targetItem = p.equipment[slot] || null;
        const currentItem = player.equipment[slot] || null;

        if (targetItem === currentItem) continue; // すでに装備中

        if (!targetItem) {
            if (currentItem) {
                unequipItem(slot);
                changedCount++;
            }
            continue;
        }

        // targetItem をインベントリから探す
        let foundInvKey = null;
        if (player.inventory[targetItem] && player.inventory[targetItem] > 0) {
            foundInvKey = targetItem;
        } else {
            const { baseName: targetBase } = typeof parseItemName === "function" ? parseItemName(targetItem) : { baseName: targetItem };
            for (const invKey in player.inventory) {
                if (player.inventory[invKey] > 0) {
                    const { baseName: invBase } = typeof parseItemName === "function" ? parseItemName(invKey) : { baseName: invKey };
                    if (invBase === targetBase) {
                        foundInvKey = invKey;
                        break;
                    }
                }
            }
        }

        if (foundInvKey) {
            if (currentItem) {
                if (!player.inventory[currentItem]) player.inventory[currentItem] = 0;
                player.inventory[currentItem]++;
            }
            player.inventory[foundInvKey]--;
            if (player.inventory[foundInvKey] <= 0) delete player.inventory[foundInvKey];
            player.equipment[slot] = foundInvKey;
            changedCount++;
        } else {
            missingItems.push(targetItem);
        }
    }

    calcStatus();
    updateEquipmentDisplay(true);
    updateInventoryDisplay(true);
    renderEquipmentPresetsUI();

    if (missingItems.length > 0) {
        addLog(`📁⚠️ <b style="color:#ffaa44;">【一部未装備】</b> 手持ちにないため装着できませんでした: ${missingItems.join(', ')}`);
    }
    addLog(`📁⚡ <b style="color:#ffd700;">【一括着替え完了】</b> 装備セット<b>【${p.name}】</b>に着替えました！（${changedCount}箇所変更）`);
    saveGame(false);
}

function renderEquipmentPresetsUI() {
    const container = document.getElementById('equipment-presets-list');
    if (!container) return;
    ensureEquipmentPresetsStructure();

    container.innerHTML = "";
    player.equipmentPresets.forEach((p, idx) => {
        const isRegistered = !!p.equipment;
        let count = 0;
        if (isRegistered) {
            for (const s in p.equipment) {
                if (p.equipment[s]) count++;
            }
        }

        const box = document.createElement('div');
        box.style.cssText = `background: ${isRegistered ? '#1a2736' : '#181e24'}; border: 1px solid ${isRegistered ? '#355c88' : '#333'}; border-radius: 6px; padding: 6px 8px; font-size: 12px; display: flex; flex-direction: column; justify-content: space-between;`;

        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <b style="color: ${isRegistered ? '#79c0ff' : '#aaa'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 95px;" title="${p.name}">${p.name}</b>
                <button onclick="renameEquipmentPreset(${idx})" title="名前を変更" style="width: auto; padding: 1px 4px; font-size: 10px; margin: 0; background: transparent; border: none; color: #888; cursor: pointer;">✏️</button>
            </div>
            <div style="font-size: 11px; color: ${isRegistered ? '#88ff88' : '#666'}; margin-bottom: 6px;">
                ${isRegistered ? `✅ ${count}部位登録` : `未登録`}
            </div>
            <div style="display: flex; gap: 4px;">
                <button onclick="applyEquipmentPreset(${idx})" ${isRegistered ? '' : 'disabled'} style="flex: 2; padding: 4px 6px; font-size: 11px; font-weight: bold; margin: 0; border-radius: 4px; cursor: ${isRegistered ? 'pointer' : 'not-allowed'}; background: ${isRegistered ? '#238636' : '#2a2a2a'}; color: ${isRegistered ? '#fff' : '#666'}; border: 1px solid ${isRegistered ? '#2ea043' : '#444'};">
                    ⚡ 装着
                </button>
                <button onclick="saveEquipmentPreset(${idx})" title="現在の装備構成をこのセットに上書き保存" style="flex: 1; padding: 4px 6px; font-size: 11px; margin: 0; border-radius: 4px; background: #2c4a6f; color: #fff; border: 1px solid #4a90e2; cursor: pointer;">
                    💾 保存
                </button>
            </div>
        `;
        container.appendChild(box);
    });
}

let _lastEquipmentCache = "";

function updateEquipmentDisplay(force = false) {
    renderEquipmentPresetsUI(); // マイセットUIの描画

    const eqList = document.getElementById('equipment-list');
    if (!eqList) return;

    // 基本・装備サブタブが開いていない場合は無駄なDOM再構築をスキップ
    const basicTab = document.getElementById('status-basic');
    const statusTab = document.getElementById('tab-status');
    const isVisible = (statusTab && statusTab.classList.contains('active')) && (basicTab && basicTab.classList.contains('active'));
    if (!isVisible && !force) return;

    // 発動中のシリーズセット効果バッジを更新
    const setBox = document.getElementById('equipment-set-bonuses-box');
    if (setBox) {
        const activeSets = getActiveSetBonuses();
        if (activeSets.length === 0) {
            setBox.innerHTML = '';
        } else {
            setBox.innerHTML = activeSets.map(act => {
                const maxTh = act.thresholds[act.thresholds.length - 1];
                return `<span title="${act.thresholds.map(t => `${t.count}部位: ${t.desc}`).join(' / ')}" style="background: #1f2d3d; border: 1px solid ${act.series.color}; color: ${act.series.color}; padding: 2px 7px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: help;">
                    ${act.series.icon} ${act.series.name} [${act.count}部位] (${maxTh.desc})
                </span>`;
            }).join('');
        }
    }

    const cacheKey = Object.entries(player.equipment || {}).map(([k, v]) => `${k}:${v}`).join('|');
    if (!force && _lastEquipmentCache === cacheKey) return;
    _lastEquipmentCache = cacheKey;

    const slotNames = {
        weapon: "剣/銃 (武器)", subWeapon: "盾 (サブ)", head: "兜/帽子 (頭)", 
        body: "鎧/服 (体)", arm: "籠手 (腕)", leg: "靴 (足)", 
        acc1: "装飾1", acc2: "装飾2", acc3: "装飾3"
    };
    eqList.innerHTML = "";
    for (const slot in player.equipment) {
        const item = player.equipment[slot];
        const div = document.createElement('div');
        div.style.marginBottom = "5px"; div.style.padding = "5px";
        div.style.background = "#222"; div.style.borderRadius = "4px";
        if (item) {
            const stats = getItemStats(item);
            let statText = [];
            if (stats.hp) statText.push(`HP${stats.hp > 0 ? '+':''}${stats.hp}`);
            if (stats.mp) statText.push(`MP${stats.mp > 0 ? '+':''}${stats.mp}`);
            if (stats.atk) statText.push(`ATK${stats.atk > 0 ? '+':''}${stats.atk}`);
            if (stats.matk) statText.push(`MATK${stats.matk > 0 ? '+':''}${stats.matk}`);
            if (stats.def) statText.push(`DEF${stats.def > 0 ? '+':''}${stats.def}`);
            if (stats.mdef) statText.push(`MDEF${stats.mdef > 0 ? '+':''}${stats.mdef}`);
            if (stats.hit) statText.push(`命中${stats.hit > 0 ? '+':''}${stats.hit}`);
            if (stats.eva) statText.push(`回避${stats.eva > 0 ? '+':''}${stats.eva}`);
            if (stats.drop) statText.push(`泥率${stats.drop > 0 ? '+':''}${stats.drop}`);
            if (stats.str) statText.push(`STR${stats.str > 0 ? '+':''}${stats.str}`);
            if (stats.int) statText.push(`INT${stats.int > 0 ? '+':''}${stats.int}`);
            if (stats.vit) statText.push(`VIT${stats.vit > 0 ? '+':''}${stats.vit}`);
            if (stats.dex) statText.push(`DEX${stats.dex > 0 ? '+':''}${stats.dex}`);
            if (stats.agi) statText.push(`AGI${stats.agi > 0 ? '+':''}${stats.agi}`);
            if (stats.luc) statText.push(`LUC${stats.luc > 0 ? '+':''}${stats.luc}`);
            if (stats.fire_res) statText.push(`火耐${stats.fire_res > 0 ? '+':''}${stats.fire_res}%`);
            
            const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(item) : null;
            const itemColor = pInfo ? pInfo.color : "#00ffcc";
            div.innerHTML = `<b>${slotNames[slot]}</b>: <span style="color: ${itemColor}; font-weight: bold;">${item}</span> <span style="font-size: 12px; color: #aaa;">(${statText.join(' ')})</span>`;
            const btn = document.createElement('button');
            btn.innerText = "外す"; btn.style.width = "auto"; btn.style.padding = "2px 8px";
            btn.style.marginLeft = "10px"; btn.style.fontSize = "12px"; btn.style.marginBottom = "0"; btn.style.background = "#555";
            btn.onclick = () => unequipItem(slot);
            div.appendChild(btn);
        } else { div.innerHTML = `<b>${slotNames[slot]}</b>: なし`; }
        eqList.appendChild(div);
    }
}

let _lastSkillsCache = "";

function updateSkillsDisplay(force = false) {
    const skillsList = document.getElementById('active-skills-list');
    if (!skillsList) return;

    // スキルサブタブが開いていない場合は無駄なDOM再構築をスキップ
    const skillsTab = document.getElementById('status-skills');
    const statusTab = document.getElementById('tab-status');
    const isVisible = (statusTab && statusTab.classList.contains('active')) && (skillsTab && skillsTab.classList.contains('active'));
    if (!isVisible && !force) return;

    const cacheKey = (player.activeSkills || []).join('|') + '::' + (player.passiveSkills || []).join('|');
    if (!force && _lastSkillsCache === cacheKey) return;
    _lastSkillsCache = cacheKey;

    if (skillsList) {
        if (player.activeSkills.length === 0) {
            skillsList.innerHTML = '<p style="color: #aaa; margin: 0;">(なし)</p>';
        } else {
            skillsList.innerHTML = player.activeSkills.map(s => {
                const info = ACTIVE_SKILLS[s];
                const title = info ? `発動率: ${Math.round(info.triggerRate * 100)}% / 威力: ${info.damageMultiplier}倍 (${info.useMatk ? 'MATK' : 'ATK'})` : '';
                return `<span title="${title}" style="background: #007acc; padding: 4px 8px; border-radius: 4px; margin-right: 5px; display: inline-block; font-weight: bold;">${s}</span>`;
            }).join('');
        }
        const activeCountEl = document.getElementById('active-count');
        if (activeCountEl) activeCountEl.innerText = player.activeSkills.length;
    }

    const passiveList = document.getElementById('passive-skills-list');
    if (passiveList) {
        if (player.passiveSkills.length === 0) {
            passiveList.innerHTML = '<p style="color: #aaa; margin: 0;">(なし)</p>';
        } else {
            passiveList.innerHTML = player.passiveSkills.map(s => {
                const info = PASSIVE_SKILLS[s];
                const title = info ? info.description : '';
                return `<span title="${title}" style="background: #28a745; padding: 4px 8px; border-radius: 4px; margin-right: 5px; display: inline-block; font-weight: bold;">${s}</span>`;
            }).join('');
        }
        document.getElementById('passive-count').innerText = player.passiveSkills.length;
    }
}

function toggleActiveMenu() {
    const menu = document.getElementById('active-menu');
    if (!menu) return;
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
        updateActiveMenuDisplay();
    } else {
        menu.style.display = "none";
    }
}

function updateActiveMenuDisplay() {
    const list = document.getElementById('active-menu-list');
    if (!list) return;
    list.innerHTML = "";
    
    // unlockedSkills にはジョブ名も入っている場合があるため ACTIVE_SKILLS に存在するものだけ抽出
    const unlockedActives = player.unlockedSkills.filter(s => ACTIVE_SKILLS[s]);
    if (unlockedActives.length === 0) {
        list.innerHTML = '<p style="font-size: 12px; color: #aaa;">解放済みのアクティブスキルがありません。</p>';
        return;
    }

    unlockedActives.forEach(skill => {
        const info = ACTIVE_SKILLS[skill];
        const btn = document.createElement('button');
        btn.style.width = "auto"; btn.style.padding = "4px 8px"; btn.style.fontSize = "12px"; btn.style.marginBottom = "0";
        const isEquipped = player.activeSkills.includes(skill);
        const statType = info.useMatk ? 'MATK' : 'ATK';
        btn.title = `発動率: ${Math.round(info.triggerRate * 100)}% / 威力: ${statType}×${info.damageMultiplier}`;
        btn.innerText = `${skill} (${Math.round(info.triggerRate * 100)}%/${info.damageMultiplier}倍)` + (isEquipped ? " [外す]" : " [セット]");
        btn.style.background = isEquipped ? "#d9534f" : "#007acc";
        btn.onclick = () => {
            if (isEquipped) {
                player.activeSkills = player.activeSkills.filter(s => s !== skill);
            } else {
                const maxSlots = getMaxActiveSkillSlots();
                if (player.activeSkills.length >= maxSlots) {
                    addLog(`<span style='color: #ffaa00;'>⚠️ アクティブスキルは最大${maxSlots}つまでしかセットできません。（ギルドランク昇格で最大6枠まで拡張可能）</span>`);
                    return;
                }
                player.activeSkills.push(skill);
            }
            updateSkillsDisplay();
            updateActiveMenuDisplay();
        };
        list.appendChild(btn);
    });
}

function togglePassiveMenu() {
    const menu = document.getElementById('passive-menu');
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
        updatePassiveMenuDisplay();
    } else {
        menu.style.display = "none";
    }
}

function updatePassiveMenuDisplay() {
    const list = document.getElementById('passive-menu-list');
    if (!list) return;
    list.innerHTML = "";
    
    if (player.unlockedPassives.length === 0) {
        list.innerHTML = '<p style="font-size: 12px; color: #aaa;">解放済みのパッシブスキルがありません。</p>';
        return;
    }

    player.unlockedPassives.forEach(skill => {
        const info = PASSIVE_SKILLS[skill];
        const btn = document.createElement('button');
        btn.style.width = "auto"; btn.style.padding = "4px 8px"; btn.style.fontSize = "12px"; btn.style.marginBottom = "0";
        const isEquipped = player.passiveSkills.includes(skill);
        if (info) btn.title = info.description;
        btn.innerText = skill + (isEquipped ? " [外す]" : " [セット]");
        btn.style.background = isEquipped ? "#d9534f" : "#007acc";
        btn.onclick = () => {
            if (isEquipped) {
                player.passiveSkills = player.passiveSkills.filter(s => s !== skill);
            } else {
                const maxSlots = getMaxPassiveSkillSlots();
                if (player.passiveSkills.length >= maxSlots) {
                    addLog(`<span style='color: #ffaa00;'>⚠️ パッシブスキルは最大${maxSlots}つまでしかセットできません。（ギルドランク昇格で最大6枠まで拡張可能）</span>`);
                    return;
                }
                player.passiveSkills.push(skill);
            }
            updateSkillsDisplay();
            updatePassiveMenuDisplay();
            calcStatus();
        };
        list.appendChild(btn);
    });
}

function equipItem(itemName) {
    if (!player.inventory[itemName] || player.inventory[itemName] <= 0) return;
    let slot = getItemSlot(itemName);
    if (!slot) return;
    if (slot === "acc") {
        // 交換所限定の特殊効果アクセサリは同種の重複装備を不可とし、既に同種を装備中ならそのスロットと入れ替える
        const parsed = parseItemName(itemName);
        const eqEntry = Object.values(EQUIPMENT).find(e => e.name === parsed.baseName);
        let existingSameSpecialSlot = null;
        if (eqEntry && eqEntry.specialId) {
            for (const s of ["acc1", "acc2", "acc3"]) {
                if (player.equipment[s]) {
                    const eqParsed = parseItemName(player.equipment[s]);
                    if (eqParsed.baseName === parsed.baseName) {
                        existingSameSpecialSlot = s;
                        break;
                    }
                }
            }
        }
        if (existingSameSpecialSlot) {
            slot = existingSameSpecialSlot;
        } else {
            slot = !player.equipment.acc1 ? "acc1" : (!player.equipment.acc2 ? "acc2" : "acc3");
        }
    }
    const currentItem = player.equipment[slot];
    if (currentItem) {
        if (!player.inventory[currentItem]) player.inventory[currentItem] = 0;
        player.inventory[currentItem]++;
    }
    player.inventory[itemName]--;
    if (player.inventory[itemName] <= 0) delete player.inventory[itemName];
    player.equipment[slot] = itemName;
    addLog(`🛡️ <span style="color: #00ffcc;">[${itemName}]</span> を装備した！`);
    calcStatus(); updateInventoryDisplay();
}

function unequipItem(slot) {
    const item = player.equipment[slot];
    if (!item) return;
    if (!player.inventory[item]) player.inventory[item] = 0;
    player.inventory[item]++;
    player.equipment[slot] = null;
    addLog(`🛡️ 装備 <span style="color: #aaa;">[${item}]</span> を外した。`);
    calcStatus(); updateInventoryDisplay();
}

// 3. スキル・クラフト
function gainSkillExp(type, amount) {
    ensureSkillsStructure();
    const jobBonus = player.job === "深淵の踏破者" ? 1.5 : 1.0;
    const haloBonus = hasEquippedSpecial("seraph_halo") ? 1.20 : 1.0;
    
    // 連戦チェイン倍率（最大+100% = 2.0倍）
    const chainMult = getBattleChainMultiplier();
    
    // 修練バフ倍率（特製オムレツ等）
    const trainingMult = (player.trainingBuff && player.trainingBuff.steps > 0) ? (player.trainingBuff.skillExpMult || 1.0) : 1.0;
    
    // 装備称号（修羅の、探究の 等）の熟練度ボーナス
    const eqPfx = getEquippedPrefixExpBonuses();
    let prefixSkillBonus = 1.0;
    const weaponSkills = ['sword', 'katana', 'spear', 'axe', 'bow', 'gun', 'unarmed'];
    const actionSkills = ['careful', 'rush', 'search', 'gathering', 'autoWalk'];
    if (weaponSkills.includes(type)) {
        prefixSkillBonus += (eqPfx.weaponBonus || 0);
    } else if (actionSkills.includes(type)) {
        prefixSkillBonus += (eqPfx.actionBonus || 0);
    }
    
    // ジョブ特化（マスタリー）ボーナス（探求者の魂等）
    const jmEff = getCurrentJobMasteryEffects();
    const masteryBonus = 1.0 + (jmEff.expBonus || 0) / 100;

    // 🧪 装備アイテム自体の熟練度獲得量ブースト（研鑽の鉢金、求道工匠の手袋、修羅の戦脚、苦行僧のペンダント）
    let equipSkillExpBonus = 0;
    const allWeaponSkills = ['sword', 'katana', 'spear', 'axe', 'bow', 'gun', 'unarmed', 'magic'];
    const allCraftSkills = ['blacksmith', 'handicraft', 'sewing', 'cooking', 'refining'];
    for (const slot in player.equipment) {
        const item = player.equipment[slot];
        if (!item) continue;
        const { baseName } = typeof parseItemName === "function" ? parseItemName(item) : { baseName: item };
        for (const eqKey in EQUIPMENT) {
            const eq = EQUIPMENT[eqKey];
            if (eq.name === baseName || item.includes(eq.name)) {
                if (eq.allSkillExpBonus) equipSkillExpBonus += eq.allSkillExpBonus;
                if (eq.weaponSkillExpBonus && allWeaponSkills.includes(type)) equipSkillExpBonus += eq.weaponSkillExpBonus;
                if (eq.craftSkillExpBonus && allCraftSkills.includes(type)) equipSkillExpBonus += eq.craftSkillExpBonus;
                break;
            }
        }
    }

    // 🛡️ シリーズセット効果による熟練度ボーナス（求道修練、ラッコ等）
    let setSkillExpBonus = 0;
    if (typeof getEquipmentSetBonusValue === "function") {
        setSkillExpBonus += getEquipmentSetBonusValue("allSkillExp");
        if (type === "gathering") setSkillExpBonus += getEquipmentSetBonusValue("gatherSkillExp");
        if (type === "trading") setSkillExpBonus += getEquipmentSetBonusValue("tradeSkillExp");
    }

    // 🔀 ジョブ・サブジョブによる熟練度獲得ボーナス
    let extraJobSkillBonus = 0;
    if (player.job === "大匠神" && allCraftSkills.includes(type)) extraJobSkillBonus += 0.50;
    if (player.job === "大豪商" && (type === "gathering" || type === "trading")) extraJobSkillBonus += 0.50;
    const subJob = typeof getSubJobBonus === "function" ? getSubJobBonus() : {};
    if (subJob.allSkillExp) extraJobSkillBonus += subJob.allSkillExp;
    if (subJob.craftSkillExp && allCraftSkills.includes(type)) extraJobSkillBonus += subJob.craftSkillExp;
    if (subJob.gatherSkillExp && type === "gathering") extraJobSkillBonus += subJob.gatherSkillExp;

    const equipSkillMult = 1.0 + equipSkillExpBonus + setSkillExpBonus + extraJobSkillBonus;

    const safeExpMult = (typeof expMultiplier === 'number' && !isNaN(expMultiplier) && expMultiplier > 0) ? expMultiplier : 1.0;
    amount = Math.round(amount * safeExpMult * jobBonus * haloBonus * chainMult * trainingMult * prefixSkillBonus * masteryBonus * equipSkillMult * 10) / 10;
    const skill = player.skills[type];
    if (!skill) return;

    const prevResInfo = getSkillResonanceInfo();
    const prevSynergyIds = (typeof getSkillSynergyEffects === "function") ? getSkillSynergyEffects().unlockedList.map(a => a.id) : [];
    let leveledUp = false;

    skill.exp = Math.round((skill.exp + amount) * 10) / 10;
    while (skill.exp >= skill.next) {
        leveledUp = true;
        skill.level++;
        skill.exp = Math.max(0, Math.round((skill.exp - skill.next) * 10) / 10);
        skill.next = getSkillNextExp(skill.level);
        const skillNameMap = {
            unarmed: '素手',
            sword: '剣術', katana: '刀術', magic: '魔法', sewing: '裁縫',
            blacksmith: '鍛冶', handicraft: '工作', refining: '鍛錬', cooking: '調理', trading: '交易',
            spear: '槍術', axe: '斧術', bow: '弓術', gun: '銃術',
            shield: '盾術', evasion: '回避', survival: '生存', fireRes: '火耐性', waterRes: '水耐性', windRes: '風耐性', earthRes: '地耐性',
            fireMagic: '火魔法', waterMagic: '水魔法', windMagic: '風魔法', earthMagic: '地魔法',
            careful: '警戒', rush: '強行', search: '探索', gathering: '採取', autoWalk: '行軍'
        };
        const skillName = skillNameMap[type] || type;
        addLog(`<span style="color: #ffff00; font-weight: bold;">🆙 【${skillName}熟練度】が Lv.${skill.level} に上がった！</span>`);

        // ✨ マイルストーン奥義解放チェック
        if (typeof SKILL_MASTER_DATA !== "undefined" && SKILL_MASTER_DATA[type]) {
            const msList = SKILL_MASTER_DATA[type].milestones || [];
            for (const m of msList) {
                if (m.level === skill.level) {
                    addLog(`✨ <b style="color: #ffd700; background: #2a1e35; padding: 2px 8px; border-radius: 4px; border: 1px solid #9c27b0;">【マイルストーン奥義解放！】</b> 【${skillName}】が Lv.${skill.level} に到達！ 秘技<b>『${m.name}』</b>(${m.desc})を習得した！`);
                }
            }
        }

        checkSecretSkills();
    }

    if (leveledUp) {
        // 🌌 総合共鳴ランク昇格チェック
        const newResInfo = getSkillResonanceInfo();
        if (newResInfo.currentTier.name !== prevResInfo.currentTier.name) {
            const b = newResInfo.currentTier.bonus;
            const bStr = [];
            if (b.allStats) bStr.push(`全ステ+${b.allStats}`);
            if (b.hp) bStr.push(`HP+${b.hp}`);
            if (b.mp) bStr.push(`MP+${b.mp}`);
            if (b.atk) bStr.push(`攻防+${b.atk}`);
            if (b.crit) bStr.push(`会心+${b.crit}%`);
            if (b.drop) bStr.push(`泥率+${b.drop}%`);
            addLog(`🌌🎉 <b style="color: #00ffcc; background: #002b3d; padding: 2px 8px; border-radius: 4px; border: 1px solid #00ffcc;">【総合熟練度共鳴 昇格！】</b> 全30種熟練度の合計が <b>Lv.${newResInfo.totalLevel}</b> に到達！ 共鳴ランク【<b style="color:#ffd700;">${newResInfo.currentTier.name}</b>】に覚醒した！（恒久補正: ${bStr.join(' / ')}）`);
        }

        // 🔗 複合シナジー奥義の新規解放チェック
        if (typeof getSkillSynergyEffects === "function") {
            const newSynergy = getSkillSynergyEffects();
            for (const art of newSynergy.unlockedList) {
                if (!prevSynergyIds.includes(art.id)) {
                    addLog(`🔗✨ <b style="color: #79c0ff; background: #142233; padding: 2px 8px; border-radius: 4px; border: 1px solid #4a90e2;">【複合シナジー奥義覚醒！】</b> ${art.icon} <b>『${art.name}』</b>が解放された！（${art.desc}）`);
                }
            }
        }
    }

    calcStatus();
}

// プレイヤー＆ジョブ経験値獲得とレベルアップ処理
function gainExp(amount) {
    amount = amount * expMultiplier; // デバッグ倍率の適用
    
    // 永久パッシブ（獲得経験値UPなど）＋ 熾天魔王の双翼ヘイロー効果適用
    let expMult = 1.0;
    for (const jobId in player.jobLevels) {
        if (player.jobLevels[jobId].isMaster && JOBS[jobId]?.masterPassive?.effectType === "expBonus") {
            expMult *= JOBS[jobId].masterPassive.value;
        }
    }
    if (player.passiveSkills.includes("獲得経験値UP")) expMult *= 1.2;
    if (hasEquippedSpecial("seraph_halo")) expMult *= 1.20;

    // ジョブ特化（マスタリー）ボーナス（探求者の魂等）
    const jmEff = getCurrentJobMasteryEffects();
    if (jmEff.expBonus) expMult *= (1 + jmEff.expBonus / 100);

    // 🛡️ シリーズセット効果による経験値ボーナス（求道修練等）
    if (typeof getEquipmentSetBonusValue === "function") {
        const setExpBonus = getEquipmentSetBonusValue("exp");
        if (setExpBonus) expMult *= (1 + setExpBonus);
    }

    // 🔀 ジョブ・サブジョブ・複合シナジーによる経験値ボーナス
    if (player.job === "大豪商") expMult *= 1.25;
    const subJobExp = (typeof getSubJobBonus === "function" ? getSubJobBonus().expMult : 0) || 0;
    if (subJobExp) expMult *= (1 + subJobExp);
    const synExpPct = (typeof getSkillSynergyEffects === "function" ? getSkillSynergyEffects().expPct : 0) || 0;
    if (synExpPct) expMult *= (1 + synExpPct / 100);

    const baseExp = Math.floor(amount * expMult);

    // PLV経験値
    let leveledUp = false;
    player.exp += baseExp;
    while (player.exp >= player.nextExp) {
        player.level++;
        player.exp -= player.nextExp;
        player.nextExp = getPlayerNextExp(player.level);
        player.statPoints += 5; // レベルアップで5ポイント獲得
        leveledUp = true;
        addLog(`<span style="color: #ffff00; font-weight: bold;">🆙 レベルアップ！ PLVが ${player.level} になった！(ステータスPt+5)</span>`);
    }

    // JLV経験値（連戦チェイン・修練料理・求道者の称号ボーナス・セット効果を乗算！）
    const chainMult = getBattleChainMultiplier();
    const trainingMult = (player.trainingBuff && player.trainingBuff.steps > 0) ? (player.trainingBuff.jlvExpMult || 1.0) : 1.0;
    const eqPfx = getEquippedPrefixExpBonuses();
    const prefixJlvBonus = 1.0 + (eqPfx.jlvBonus || 0);
    const setJlvBonus = (typeof getEquipmentSetBonusValue === "function") ? getEquipmentSetBonusValue("jlvExp") : 0;

    const jlvExpGained = Math.floor(baseExp * chainMult * trainingMult * prefixJlvBonus * (1.0 + setJlvBonus));

    const jobData = ensureJobMasteryStructure(player.job);
    jobData.exp += jlvExpGained;

    // ジョブレベル上限（Lv.100）を撤廃し、Lv.101以降は超越レベル（★1, ★2...）として無限育成！
    while (jobData.exp >= jobData.nextExp) {
        jobData.level++;
        jobData.exp -= jobData.nextExp;
        jobData.nextExp = getJobNextExp(player.job, jobData.level);
        
        // Lv.100到達時の初回MASTER判定
        if (jobData.level === 100 && !jobData.isMaster) {
            jobData.isMaster = true;
            leveledUp = true;
            const passive = JOBS[player.job]?.masterPassive;
            if (passive && passive.name) {
                addLog(`<span style="color: #ffaa00; font-weight: bold;">👑 ジョブ【${player.job}】を MASTER した！ 永久パッシブ『${passive.name}』を獲得！</span>`);
            } else {
                addLog(`<span style="color: #ffaa00; font-weight: bold;">👑 ジョブ【${player.job}】を MASTER した！</span>`);
            }
        } 
        // Lv.101以降のジョブ超越レベルアップ！
        else if (jobData.level > 100) {
            jobData.masteryPoints = (jobData.masteryPoints || 0) + 1;
            const star = jobData.level - 100;
            leveledUp = true;
            addLog(`<span style="color: #ffd700; font-weight: bold;">🌟 【ジョブ超越】ジョブ【${player.job}】が Lv.${jobData.level} (★${star} MASTER) に到達！ 職能ポイント(JMP) +1 獲得！</span>`);
        } 
        // Lv.100未満の10区切り通知
        else if (jobData.level % 10 === 0) { 
            addLog(`<span style="color: #00ffff;">🆙 ジョブ【${player.job}】のレベルが ${jobData.level} に上がった！</span>`);
        }
        checkSecretSkills();
    }

    calcStatus();
    if (typeof updateJobMasterySpecUI === "function") updateJobMasterySpecUI();
    if (typeof updateJobMasteryDisplay === "function") updateJobMasteryDisplay();
    if (leveledUp && typeof saveGame === "function") saveGame(false);
}

// ステータス振り分け処理
function allocateStat(stat) {
    if (player.statPoints > 0) {
        const addVal = Math.min(player.statPoints, statAllocateAmount);
        player.stats[stat] += addVal;
        player.statPoints -= addVal;
        checkSecretSkills();
        calcStatus();
        if (typeof saveGame === "function") saveGame(false);
    }
}

function checkSecretSkills() {
    const unlockActive = (skillName, isSecret = false) => {
        if (player.unlockedSkills.includes(skillName)) return;
        player.unlockedSkills.push(skillName);
        let autoMsg = "メニューからセット可能です。";
        if (player.activeSkills.length < 3) {
            player.activeSkills.push(skillName);
            autoMsg = "(自動セットされました)";
        }
        const color = isSecret ? "#ff00ff" : "#ffff00";
        const icon = isSecret ? "✨ 隠しアクティブスキル" : "💡 アクティブスキル";
        addLog(`<span style='color: ${color}; font-weight: bold;'>${icon}『${skillName}』を閃いた！ ${autoMsg}</span>`);
        updateSkillsDisplay();
        updateActiveMenuDisplay();
    };

    const st = player.stats;
    const sk = player.skills;
    const jlv = (jobName) => player.jobLevels[jobName]?.level || 0;

    // 通常アクティブスキルの解放判定
    if (sk.sword.level >= 2) unlockActive("強撃");
    if (sk.sword.level >= 3 && sk.magic.level >= 3) unlockActive("魔法剣", true);
    if (sk.sword.level >= 5 || sk.unarmed.level >= 5) unlockActive("連撃");
    if (sk.bow.level >= 5 || sk.gun.level >= 5) unlockActive("狙撃");
    if (sk.magic.level >= 3) unlockActive("ウォーターボール");
    if (sk.magic.level >= 5) {
        unlockActive("ファイアボール");
        unlockActive("ウィンドカッター");
    }
    if (sk.magic.level >= 8) unlockActive("アーススパイク");

    // 🕵️ ステータス・熟練度・ジョブLv複合の隠しアクティブスキル判定 (全12種)
    if (st.agi >= 35 && sk.sword.level >= 15 && (jlv("狩人") >= 20 || jlv("盗賊") >= 20)) unlockActive("閃光斬", true);
    if (st.str >= 45 && (sk.axe.level >= 15 || sk.unarmed.level >= 15) && jlv("戦士") >= 25) unlockActive("乾坤一擲", true);
    if (st.dex >= 40 && (sk.bow.level >= 15 || sk.gun.level >= 15) && jlv("狩人") >= 25) unlockActive("乱れ撃ち", true);
    if (st.str >= 50 && st.vit >= 50 && sk.axe.level >= 20 && sk.shield.level >= 20) unlockActive("破城槌", true);
    if (st.dex >= 65 && st.luc >= 50 && sk.bow.level >= 25 && sk.search.level >= 20) unlockActive("百歩穿楊", true);
    if (st.int >= 55 && sk.fireMagic.level >= 20 && sk.earthMagic.level >= 20 && jlv("魔術師") >= 30) unlockActive("メテオストライク", true);
    if (st.int >= 55 && sk.waterMagic.level >= 20 && sk.windMagic.level >= 20 && jlv("精霊使い") >= 20) unlockActive("コキュートス", true);
    if (st.int >= 70 && sk.fireMagic.level >= 20 && sk.waterMagic.level >= 20 && sk.windMagic.level >= 20 && sk.earthMagic.level >= 20 && jlv("精霊使い") >= 30) unlockActive("エレメンタルバースト", true);
    if (st.agi >= 70 && st.dex >= 60 && sk.evasion.level >= 25 && sk.rush.level >= 20) unlockActive("神速乱舞", true);
    if (st.str >= 75 && st.agi >= 70 && sk.unarmed.level >= 35 && jlv("拳聖") >= 30) unlockActive("阿修羅閃空", true);
    if (st.str >= 90 && st.int >= 70 && sk.sword.level >= 40 && jlv("魔法剣士") >= 50) unlockActive("次元斬", true);
    if (st.str >= 100 && st.int >= 100 && sk.spear.level >= 40 && jlv("竜騎士") >= 40) unlockActive("ラグナロク", true);

    // --- パッシブスキルの解放 ---
    const unlockPassive = (skillName, isSecret = false) => {
        if (player.unlockedPassives.includes(skillName)) return;
        player.unlockedPassives.push(skillName);
        let autoMsg = "メニューからセット可能です。";
        if (player.passiveSkills.length < 3) {
            player.passiveSkills.push(skillName);
            autoMsg = "(自動セットされました)";
        }
        const label = isSecret ? "🕵️✨ 隠しパッシブスキル" : "🌟 パッシブスキル";
        const color = isSecret ? "#ffd700" : "#00ffcc";
        addLog(`<span style='color: ${color}; font-weight: bold;'>${label}『${skillName}』を習得した！ ${autoMsg}</span>`);
        updateSkillsDisplay();
        updatePassiveMenuDisplay();
    };

    if (sk.evasion.level >= 5) unlockPassive("見切り");
    if (sk.handicraft.level >= 5) unlockPassive("トレジャーハンター");
    if (sk.magic.level >= 10 && sk.sword.level >= 10) unlockPassive("吸血");

    // 🕵️ ステータス・熟練度・ジョブLv複合の隠しパッシブスキル判定 (全11種)
    if (st.dex >= 35 && st.agi >= 35 && sk.careful.level >= 15 && sk.evasion.level >= 15) unlockPassive("心眼", true);
    if (st.vit >= 50 && sk.shield.level >= 15 && jlv("戦士") >= 30) unlockPassive("剛毅なる肉体", true);
    if (st.int >= 50 && sk.magic.level >= 20 && jlv("魔術師") >= 30) unlockPassive("魔力暴走", true);
    if (st.luc >= 45 && sk.search.level >= 20 && jlv("盗賊") >= 30) unlockPassive("幸運の星", true);
    if (st.dex >= 40 && sk.blacksmith.level >= 20 && sk.handicraft.level >= 20 && sk.sewing.level >= 20 && sk.cooking.level >= 15) unlockPassive("職人の極意", true);
    if (st.vit >= 45 && st.luc >= 45 && sk.gathering.level >= 25 && jlv("レンジャー") >= 25) unlockPassive("大地の恵み", true);
    if (st.agi >= 50 && sk.autoWalk.level >= 25 && sk.rush.level >= 25) unlockPassive("疾風怒濤", true);
    if (st.int >= 65 && st.dex >= 50 && sk.gun.level >= 25 && sk.handicraft.level >= 25) unlockPassive("魔道回路", true);
    if (st.luc >= 70 && jlv("トレジャーシーカー") >= 40 && jlv("アルケミスト") >= 30) unlockPassive("黄金律", true);
    if (st.vit >= 80 && st.str >= 80 && sk.fireRes.level >= 25 && sk.waterRes.level >= 25) unlockPassive("不撓不屈", true);
    if (st.str >= 80 && st.int >= 80 && st.vit >= 80 && st.dex >= 80 && st.agi >= 80 && st.luc >= 80 && (jlv("神聖至高職") >= 40 || jlv("大賢者") >= 40)) unlockPassive("神域のオーラ", true);
    
    // 中級複合職の解放チェック
    const midJobs = ["魔法剣士", "ガンスリンガー", "魔導鍛冶師", "精霊使い", "レンジャー", "ベルセルク", "トレジャーシーカー"];
    midJobs.forEach(jobId => {
        const jobInfo = JOBS[jobId];
        if (jobInfo && jobInfo.req() && !player.unlockedSkills.includes(jobId)) {
            player.unlockedSkills.push(jobId);
            addLog(`<span style='color: #00ffff; font-weight: bold;'>⚔️ 条件達成！ 上位職『${jobId}』への転職が解放された！</span>`);
            updateJobMenuDisplay();
        }
    });

    // 最上級職の解放チェック
    const advancedJobs = ["竜騎士", "魔導機工師", "神聖至高職", "大賢者", "深淵の踏破者"];
    advancedJobs.forEach(jobId => {
        const jobInfo = JOBS[jobId];
        if (jobInfo && jobInfo.req() && !player.unlockedSkills.includes(jobId)) { 
            player.unlockedSkills.push(jobId);
            addLog(`<span style='color: #ffaa00; font-weight: bold;'>🌟 超越の時！ 最上級職『${jobId}』への転職が解放された！</span>`);
            updateJobMenuDisplay();
        }
    });

    // 🕵️ 隠しジョブの解放チェック (全14種)
    const secretJobs = ["拳聖", "アルケミスト", "ヴァルキリー", "アサシン", "パラディン", "ネクロマンサー", "刀神", "星詠みの賢者", "ゴッドハンド", "破壊神", "神弓・ホークアイ", "大匠神", "大豪商", "万象の覇王"];
    secretJobs.forEach(jobId => {
        const jobInfo = JOBS[jobId];
        if (jobInfo && jobInfo.req() && !player.unlockedSkills.includes(jobId)) {
            player.unlockedSkills.push(jobId);
            addLog(`<span style='color: #ff66ff; background: #2d1233; border: 1px solid #ff66ff; padding: 1px 6px; border-radius: 4px; font-weight: bold;'>🕵️👑 【SECRET JOB DISCOVERED!!】 隠しジョブ『${jobId}』を発見・解放した！！</span>`);
            updateJobMenuDisplay();
        }
    });

    updateSecretDiscoveryDisplay();
}

// 🕵️ 隠しスキル・隠しジョブ発見図鑑の描画
let _lastSecretDiscoveryCache = "";

function updateSecretDiscoveryDisplay(force = false) {
    const container = document.getElementById('secret-discovery-list');
    if (!container || typeof SECRET_DISCOVERY_HINTS === 'undefined') return;

    // 隠し要素図鑑サブタブが開いていない場合は無駄なDOM再構築をスキップ
    const secretsTab = document.getElementById('status-secrets');
    const statusTab = document.getElementById('tab-status');
    const isVisible = (statusTab && statusTab.classList.contains('active')) && (secretsTab && secretsTab.classList.contains('active'));
    if (!isVisible && !force) return;

    const cacheKey = `${player.unlockedSkills.length}_${player.unlockedPassives.length}_${Object.keys(player.jobLevels).length}`;
    if (!force && _lastSecretDiscoveryCache === cacheKey) return;
    _lastSecretDiscoveryCache = cacheKey;

    const kindBadgeMap = {
        active:  { label: '⚡ 隠しアクティブ', color: '#ff88ff', bg: '#331833' },
        passive: { label: '🌟 隠しパッシブ', color: '#ffd700', bg: '#332b14' },
        job:     { label: '👑 隠しジョブ', color: '#00ffcc', bg: '#123030' }
    };

    let html = '';
    SECRET_DISCOVERY_HINTS.forEach(entry => {
        let isUnlocked = false;
        let effectDesc = '';
        if (entry.kind === 'active') {
            isUnlocked = player.unlockedSkills.includes(entry.id);
            const s = ACTIVE_SKILLS[entry.id];
            if (s) effectDesc = `発動率: ${Math.round(s.triggerRate * 100)}% / 威力: ${s.useMatk ? 'MATK' : 'ATK'}×${s.damageMultiplier}倍`;
        } else if (entry.kind === 'passive') {
            isUnlocked = player.unlockedPassives.includes(entry.id);
            const p = PASSIVE_SKILLS[entry.id];
            if (p) effectDesc = p.description;
        } else if (entry.kind === 'job') {
            isUnlocked = player.unlockedSkills.includes(entry.id) || (player.jobLevels[entry.id] !== undefined) || (JOBS[entry.id]?.req && JOBS[entry.id].req());
            const j = JOBS[entry.id];
            if (j && j.masterPassive) effectDesc = `MASTER効果: ${j.masterPassive.description}`;
        }

        const kInfo = kindBadgeMap[entry.kind] || kindBadgeMap.active;
        const borderCol = isUnlocked ? '#2ea043' : '#444';
        const statusBadge = isUnlocked
            ? `<span style="background:#163320; border:1px solid #2ea043; color:#7ee787; padding:1px 6px; border-radius:4px; font-size:11px; font-weight:bold;">✅ 発見済み</span>`
            : `<span style="background:#2a2a2a; border:1px solid #555; color:#aaa; padding:1px 6px; border-radius:4px; font-size:11px;">🔒 未発見</span>`;

        html += `<div style="background:#222; border:1px solid ${borderCol}; border-radius:5px; padding:8px 10px; font-size:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
                <div>
                    <span style="background:${kInfo.bg}; color:${kInfo.color}; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold; margin-right:6px;">${kInfo.label}</span>
                    <b style="font-size:14px; color:${isUnlocked ? '#fff' : '#888'};">${isUnlocked ? entry.name : '？？？ (' + entry.name + ')'}</b>
                </div>
                ${statusBadge}
            </div>
            <div style="color:#ccc; margin-bottom:2px;">🔍 <b>解放条件ヒント:</b> <span style="color:#ffd700;">${entry.hint}</span></div>
            ${effectDesc ? `<div style="color:${isUnlocked ? '#88ff88' : '#777'}; font-size:11px;">💡 ${effectDesc}</div>` : ''}
        </div>`;
    });

    container.innerHTML = html;
}

// ジョブチェンジ処理
function changeJob(newJob) {
    player.job = newJob;
    if (player.subJob === newJob) {
        player.subJob = null;
        addLog(`🔀 メインジョブ変更に伴い、重複していたサブジョブ【${newJob}】を解除しました。`);
    }
    ensureJobMasteryStructure(newJob);
    calcStatus();
    if (typeof updateJobMasterySpecUI === "function") updateJobMasterySpecUI();
    if (typeof updateJobMasteryDisplay === "function") updateJobMasteryDisplay();
    if (typeof updateSubJobDisplay === "function") updateSubJobDisplay();
    if (typeof updateSubJobMenuDisplay === "function") updateSubJobMenuDisplay();
}

// 🔀 サブジョブ（副職継承）効果の取得
function getSubJobBonus() {
    if (!player || !player.subJob || player.subJob === player.job) return {};
    const jData = player.jobLevels && player.jobLevels[player.subJob];
    if (!jData || !jData.isMaster) return {};
    if (typeof SUB_JOB_EFFECTS === "undefined") return {};
    return SUB_JOB_EFFECTS[player.subJob] || {};
}

function setSubJob(jobId) {
    if (!jobId) {
        player.subJob = null;
        addLog(`🔀 サブジョブ(副職)を解除しました。`);
    } else {
        const jData = player.jobLevels && player.jobLevels[jobId];
        if (!jData || !jData.isMaster) {
            addLog(`<span style="color:#ffaa00;">⚠️ MASTER (Lv.100) に到達したジョブのみサブジョブに設定できます。</span>`);
            return;
        }
        if (jobId === player.job) {
            addLog(`<span style="color:#ffaa00;">⚠️ 現在メインに就いているジョブはサブジョブに設定できません。</span>`);
            return;
        }
        player.subJob = jobId;
        const eff = (typeof SUB_JOB_EFFECTS !== "undefined" && SUB_JOB_EFFECTS[jobId]) ? SUB_JOB_EFFECTS[jobId].desc : "";
        addLog(`🔀✨ <b style="color:#d2a8ff;">【サブジョブ設定】</b> 副職に【${jobId}】をセットした！（継承効果: ${eff}）`);
    }
    calcStatus();
    updateSubJobDisplay();
    updateSubJobMenuDisplay();
    saveGame(false);
}

function toggleSubJobMenu() {
    const menu = document.getElementById('subjob-menu');
    if (!menu) return;
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
        updateSubJobMenuDisplay(true);
    } else {
        menu.style.display = "none";
    }
}

function updateSubJobDisplay() {
    const nameEl = document.getElementById('player-subjob');
    const descEl = document.getElementById('player-subjob-desc');
    if (!nameEl) return;
    if (player.subJob && player.jobLevels?.[player.subJob]?.isMaster && player.subJob !== player.job) {
        nameEl.innerText = player.subJob;
        nameEl.style.color = "#d2a8ff";
        nameEl.style.fontWeight = "bold";
        const eff = (typeof SUB_JOB_EFFECTS !== "undefined" && SUB_JOB_EFFECTS[player.subJob]) ? SUB_JOB_EFFECTS[player.subJob].desc : "";
        if (descEl) descEl.innerText = eff ? `継承効果: ${eff}` : "";
    } else {
        nameEl.innerText = "未設定";
        nameEl.style.color = "#888";
        nameEl.style.fontWeight = "normal";
        if (descEl) descEl.innerText = "※任意のジョブをMASTER(Lv.100)にすると副職をセットできます";
    }
}

function updateSubJobMenuDisplay(force = false) {
    const menu = document.getElementById('subjob-menu');
    const list = document.getElementById('subjob-list');
    if (!menu || !list || (!force && menu.style.display === "none")) return;
    list.innerHTML = "";

    const clearBtn = document.createElement('button');
    clearBtn.style.cssText = "width: auto; padding: 4px 8px; font-size: 12px; margin-bottom: 5px; background: #3a2222; border: 1px solid #884444; color: #ffaaaa;";
    clearBtn.innerText = "解除 (なし)";
    clearBtn.onclick = () => { setSubJob(null); toggleSubJobMenu(); };
    list.appendChild(clearBtn);

    let masteredCount = 0;
    for (const jobId in JOBS) {
        const jData = player.jobLevels?.[jobId];
        if (!jData || !jData.isMaster) continue;
        masteredCount++;
        const btn = document.createElement('button');
        const eff = (typeof SUB_JOB_EFFECTS !== "undefined" && SUB_JOB_EFFECTS[jobId]) ? SUB_JOB_EFFECTS[jobId].desc : "";
        btn.title = eff;
        btn.style.cssText = "width: auto; padding: 4px 8px; font-size: 12px; margin-bottom: 5px;";
        if (jobId === player.job) {
            btn.style.background = "#333"; btn.disabled = true; btn.innerText = `${jobId} (メイン中)`;
        } else if (jobId === player.subJob) {
            btn.style.background = "#4c3575"; btn.style.border = "1px solid #d2a8ff"; btn.disabled = true; btn.innerText = `✅ ${jobId}`;
        } else {
            btn.innerText = `★ ${jobId}`;
            btn.onclick = () => { setSubJob(jobId); toggleSubJobMenu(); };
        }
        list.appendChild(btn);
    }

    if (masteredCount === 0) {
        const p = document.createElement('p');
        p.style.cssText = "font-size: 12px; color: #aaa; margin: 4px 0;";
        p.innerText = "まだMASTER (Lv.100) に到達したジョブがありません。";
        list.appendChild(p);
    }
}

// 転職メニューの表示切替
function toggleJobMenu() {
    const menu = document.getElementById('job-menu');
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
        updateJobMenuDisplay(true); // 開いた瞬間に強制描画
    } else {
        menu.style.display = "none";
    }
}

// 転職メニューのリスト描画
function updateJobMenuDisplay(force = false) {
    const menu = document.getElementById('job-menu');
    const jobList = document.getElementById('job-list');
    // メニューが閉じているときは無駄な描画をしない
    if (!menu || !jobList || (!force && menu.style.display === "none")) return;

    jobList.innerHTML = "";
    for (const jobId in JOBS) {
        const jobInfo = JOBS[jobId];
        // 条件を満たすか、一度でも就いたことがあれば表示
        const hasExperienced = player.jobLevels[jobId] !== undefined;
        if (jobInfo.req() || hasExperienced) {
            const btn = document.createElement('button');
            btn.style.width = "auto"; btn.style.padding = "4px 8px"; btn.style.fontSize = "12px"; btn.style.marginBottom = "5px";
            const jobData = player.jobLevels[jobId];
            let levelText = '未経験';
            if (jobData) {
                const starCount = jobData.level > 100 ? jobData.level - 100 : 0;
                levelText = starCount > 0 ? `Lv.${jobData.level} (★${starCount})` : `Lv.${jobData.level}${jobData.isMaster ? ' ★' : ''}`;
            }
            btn.innerText = `${jobInfo.name} (${levelText})`;
            if (jobId === player.job) {
                btn.style.background = "#555"; btn.disabled = true; btn.innerText = "現在のジョブ";
            } else { btn.onclick = () => { changeJob(jobId); toggleJobMenu(); }; }
            jobList.appendChild(btn);
        }
    }
}

// ジョブ習得状況の一覧UIを更新（差分キャッシュ＆非表示時スキップによる最適化）
let _lastJobMasteryCache = "";

function updateJobMasteryDisplay(force = false) {
    const list = document.getElementById('job-mastery-list');
    if (!list) return;

    // ジョブサブタブが開いていない場合は無駄なDOM再構築をスキップ
    const jobTab = document.getElementById('status-jobs');
    const statusTab = document.getElementById('tab-status');
    const isVisible = (statusTab && statusTab.classList.contains('active')) && (jobTab && jobTab.classList.contains('active'));
    if (!isVisible && !force) return;

    const cacheKey = Object.entries(player.jobLevels).map(([k, v]) => `${k}:${v.level}:${v.isMaster}`).join('|');
    if (!force && _lastJobMasteryCache === cacheKey) return;
    _lastJobMasteryCache = cacheKey;

    list.innerHTML = "";
    
    for (const jobId in JOBS) {
        const jobInfo = JOBS[jobId];
        const jData = player.jobLevels[jobId];
        const level = jData ? jData.level : 0;
        const isMaster = jData ? jData.isMaster : false;
        const starCount = level > 100 ? level - 100 : 0;
        
        const div = document.createElement('div');
        div.style.fontSize = "13px";
        div.style.background = "#222";
        div.style.padding = "5px";
        div.style.borderRadius = "4px";
        
        let text = `<b>${jobInfo.name}</b>: Lv.${level}`;
        if (isMaster) {
            if (starCount > 0) {
                text += ` <span style="color: #ffd700; font-weight: bold;">★MASTER (+${starCount})</span>`;
            } else {
                text += ` <span style="color: #ffaa00; font-weight: bold;">★MASTER</span>`;
            }
            if (jobInfo.masterPassive) {
                const desc = jobInfo.masterPassive.description || "詳細なし";
                text += `<br><span style="font-size: 11px; color: #88ff88; cursor: pointer; user-select: none;" title="${desc}" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';">(永) ${jobInfo.masterPassive.name} ℹ️</span>`;
                text += `<div style="display: none; font-size: 11px; color: #ddd; background: #333; padding: 4px; border-radius: 4px; margin-top: 2px;">${desc}</div>`;
            }
        } else if (level === 0) {
            text = `<span style="color: #666;"><b>${jobInfo.name}</b>: 未就任</span>`;
        } else {
            text = `<span style="color: #ccc;"><b>${jobInfo.name}</b>: Lv.${level}</span>`;
        }
        div.innerHTML = text;
        list.appendChild(div);
    }
}



// --- クラフトメニュー（新UI：カード形式・フィルタ・エリア別ドロップガイド） ---
let currentCraftCategory = 'all';

function setCraftCategory(event, category) {
    currentCraftCategory = category;
    if (event && event.currentTarget) {
        const parent = event.currentTarget.parentElement;
        if (parent) {
            parent.querySelectorAll('.sub-tab').forEach(el => el.classList.remove('active'));
        }
        event.currentTarget.classList.add('active');
    }
    updateCraftMenu();
}

function toggleCraftDropGuide() {
    const box = document.getElementById('craft-drop-guide');
    if (!box) return;
    if (box.style.display === 'none' || box.style.display === '') {
        renderCraftDropGuide();
        box.style.display = 'block';
    } else {
        box.style.display = 'none';
    }
}

function renderCraftDropGuide() {
    const box = document.getElementById('craft-drop-guide');
    if (!box) return;
    let html = `<div style="font-weight:bold; color:#00ffcc; margin-bottom:6px;">📖 各エリアの🌈激レア(レアモン/BOSS別)・🌟レア(1%〜5%)・🔍手動採取・💍交換屋限定アクセ一覧</div>`;
    html += `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:8px;">`;
    for (const [areaId, aData] of Object.entries(areas)) {
        let rareDrops = [];
        let ultraDrops = [];
        aData.monsters.forEach(m => {
            (m.drops || []).forEach(d => {
                if (d.isUltraRare) {
                    ultraDrops.push(`<span style="color:#ff66ff; font-weight:bold;">🌈[レアモン]${d.item}</span> <span style="color:#aaa;">(${m.name}: ${(d.rate * 100).toFixed(1)}%)</span>`);
                } else if (d.isRare || d.rate <= 0.05) {
                    rareDrops.push(`<span style="color:#ffd700;">${d.item}</span> <span style="color:#aaa;">(${m.name}: ${Math.round(d.rate * 100)}%)</span>`);
                }
            });
        });
        if (aData.boss && aData.boss.drops) {
            aData.boss.drops.forEach(d => {
                if (d.isUltraRare) {
                    ultraDrops.push(`<span style="color:#ff66ff; font-weight:bold;">🌈[BOSS]${d.item}</span> <span style="color:#aaa;">(${aData.boss.name}: ${(d.rate * 100).toFixed(1)}%)</span>`);
                } else if (d.isRare || d.rate <= 0.05) {
                    rareDrops.push(`<span style="color:#ff88ff;">${d.item}</span> <span style="color:#aaa;">(BOSS ${aData.boss.name}: ${Math.round(d.rate * 100)}%)</span>`);
                }
            });
        }
        const manualItems = (aData.manualGather || []).map(g => `<span style="color:#00ffcc;">${g.item}</span>`).join('、') || 'なし';
        const exItems = (typeof EXCHANGE_SHOP_ITEMS !== 'undefined' ? EXCHANGE_SHOP_ITEMS.filter(x => x.area === areaId && x.category === 'accessory').map(x => `<span style="color:#ffaa44;">💍${x.item}(${x.ptCost}Pt)</span>`).join('、') : '') || 'なし';
        html += `<div style="background:#111820; border:1px solid #2d4258; border-radius:4px; padding:6px 8px;">
            <div style="font-weight:bold; color:#fff; border-bottom:1px solid #2d4258; padding-bottom:3px; margin-bottom:4px;">📍 ${aData.name}</div>
            <div style="margin-bottom:3px;">🌈 <b>激レア:</b> ${ultraDrops.join(' / ') || 'なし'}</div>
            <div style="margin-bottom:3px;">🌟 <b>レア泥:</b> ${rareDrops.join(' / ')}</div>
            <div style="margin-bottom:3px;">🔍 <b>手動採取限定:</b> ${manualItems}</div>
            <div>⚖️ <b>交換屋限定アクセ:</b> ${exItems}</div>
        </div>`;
    }
    html += `</div>`;
    box.innerHTML = html;
}

// 素材名から入手元ヒントを逆引きするヘルパー
function getMaterialSourceHint(matName) {
    if (typeof EXCHANGE_SHOP_ITEMS !== 'undefined') {
        const ex = EXCHANGE_SHOP_ITEMS.find(x => x.item === matName && x.category === 'exclusive');
        if (ex) return `⚖️素材交換屋限定 (${ex.ptCost}Pt)`;
    }
    for (const [areaId, aData] of Object.entries(areas)) {
        for (const m of aData.monsters) {
            for (const d of (m.drops || [])) {
                if (d.item === matName) {
                    const tag = d.isUltraRare ? `🌈激レア(${(d.rate * 100).toFixed(1)}%)` : ((d.isRare || d.rate <= 0.05) ? `🌟レア(${Math.round(d.rate * 100)}%)` : `通常(${Math.round(d.rate * 100)}%)`);
                    return `${aData.name} - ${m.name} [${tag}]`;
                }
            }
        }
        if (aData.boss) {
            for (const d of (aData.boss.drops || [])) {
                if (d.item === matName) {
                    const tag = d.isUltraRare ? `🌈BOSS激レア(${(d.rate * 100).toFixed(1)}%)` : ((d.isRare || d.rate <= 0.05) ? `🌟BOSSレア(${Math.round(d.rate * 100)}%)` : `BOSS(${Math.round(d.rate * 100)}%)`);
                    return `${aData.name} - BOSS:${aData.boss.name} [${tag}]`;
                }
            }
        }
        for (const g of (aData.gather || [])) {
            if (g.item === matName) return `${aData.name} - 通常採取`;
        }
        for (const g of (aData.manualGather || [])) {
            if (g.item === matName) return `${aData.name} - 🔍手動探索/鉱脈イベント限定採取`;
        }
    }
    return "ダンジョン探索 / 素材交換屋";
}

// レシピが作成済み（または図鑑登録・所持・装備中）か判定するヘルパー
function isRecipeCrafted(recipe) {
    if (!recipe) return false;
    const eq = EQUIPMENT[recipe.result];
    const targetName = eq ? eq.name : (recipe.name || recipe.result);
    // 1. 図鑑の装備品登録チェック
    if (player.compendium?.equipment && (player.compendium.equipment[targetName] || 0) > 0) return true;
    // 2. 図鑑の素材・消費アイテム登録チェック
    if (player.compendium?.materials && (player.compendium.materials[targetName] || 0) > 0) return true;
    // 3. 装備中チェック
    if (player.equipment) {
        for (const slot in player.equipment) {
            const item = player.equipment[slot];
            if (item && item.includes(targetName)) return true;
        }
    }
    // 4. 所持品インベントリチェック
    if (player.inventory) {
        for (const itemKey in player.inventory) {
            if (itemKey.includes(targetName) && player.inventory[itemKey] > 0) return true;
        }
    }
    return false;
}

function updateCraftMenu() {
    const listContainer = document.getElementById('craft-recipe-list');
    if (!listContainer) return;

    const areaFilter = document.getElementById('craft-filter-area')?.value || 'all';
    const originFilter = document.getElementById('craft-filter-origin')?.value || 'all';
    const onlyCraftable = document.getElementById('craft-filter-craftable')?.checked || false;
    const onlyUncreated = document.getElementById('craft-filter-uncreated')?.checked || false;

    const skillLabelMap = {
        blacksmith: '🔨 鍛冶',
        handicraft: '⚙️ 工作',
        sewing: '🧵 裁縫',
        cooking: '🍳 調理'
    };
    const slotLabelMap = {
        weapon: { label: '⚔️ 武器', tab: 'weapon', color: '#ff7b72' },
        sub_weapon: { label: '🛡️ 盾/サブ', tab: 'armor', color: '#79c0ff' },
        head: { label: '🪖 頭防具', tab: 'armor', color: '#79c0ff' },
        body: { label: '🧥 体防具', tab: 'armor', color: '#79c0ff' },
        arm: { label: '🧤 腕防具', tab: 'armor', color: '#79c0ff' },
        leg: { label: '🥾 足防具', tab: 'armor', color: '#79c0ff' },
        accessory: { label: '💍 装飾品', tab: 'accessory', color: '#d2a8ff' },
        usable: { label: '🧪 料理・秘薬', tab: 'item', color: '#7ee787' }
    };

    listContainer.innerHTML = '';
    let renderedCount = 0;

    for (const [recipeId, recipe] of Object.entries(RECIPES)) {
        const eq = EQUIPMENT[recipe.result] || { name: recipe.name, slot: 'usable', description: '' };
        const slotInfo = slotLabelMap[eq.slot] || slotLabelMap.usable;

        // カテゴリフィルタ
        if (currentCraftCategory !== 'all' && slotInfo.tab !== currentCraftCategory) continue;
        // エリアフィルタ
        if (areaFilter !== 'all' && recipe.area && recipe.area !== areaFilter) continue;
        // 入手区分フィルタ
        const origin = recipe.origin || 'normal';
        if (originFilter !== 'all' && origin !== originFilter) continue;

        // 作成済み判定
        const isCrafted = isRecipeCrafted(recipe);
        if (onlyUncreated && isCrafted) continue;

        // 所持素材数の集計と最大作成可能数の計算
        let maxCraft = 9999;
        let matPillsHtml = [];
        for (const [materialName, requiredAmount] of Object.entries(recipe.cost)) {
            let available = 0;
            for (const invKey of Object.keys(player.inventory)) {
                if (invKey.includes(materialName)) {
                    available += player.inventory[invKey];
                }
            }
            const canMake = Math.floor(available / requiredAmount);
            if (canMake < maxCraft) maxCraft = canMake;

            const isEnough = available >= requiredAmount;
            const hint = getMaterialSourceHint(materialName);
            const pillBg = isEnough ? '#163320' : '#331818';
            const pillBorder = isEnough ? '#2ea043' : '#8b2c2c';
            const pillColor = isEnough ? '#7ee787' : '#ff9492';
            const icon = isEnough ? '✅' : '❌';
            matPillsHtml.push(
                `<span title="入手先: ${hint}" style="display:inline-block; background:${pillBg}; border:1px solid ${pillBorder}; color:${pillColor}; padding:2px 7px; border-radius:12px; font-size:12px; margin-right:5px; margin-bottom:4px; cursor:help;">${icon} ${materialName} <b>${available}</b>/${requiredAmount}</span>`
            );
        }

        if (onlyCraftable && maxCraft === 0) continue;
        renderedCount++;

        // 作成状況バッジ（未作成 / 作成済）
        const craftedBadge = isCrafted
            ? `<span style="background:#163320; border:1px solid #2ea043; color:#7ee787; padding:1px 5px; border-radius:3px; font-size:10px; font-weight:bold;">✅ 作成済</span>`
            : `<span style="background:#3d2408; border:1px solid #ffaa44; color:#ffaa44; padding:1px 5px; border-radius:3px; font-size:10px; font-weight:bold;">🆕 未作成</span>`;

        // 起源バッジ（通常 / 🌟レア泥限定 / 🔍手動採取限定 / ⚖️交換屋限定 / 🌈激レア限定）
        let originBadge = `<span style="background:#333; color:#ccc; padding:2px 6px; border-radius:4px; font-size:11px;">📦 通常</span>`;
        let cardBorder = '#3a3a3a';
        if (origin === 'rare') {
            originBadge = `<span style="background:#4d3800; border:1px solid #ffd700; color:#ffd700; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">🌟 レアドロップ限定</span>`;
            cardBorder = '#7a5c00';
        } else if (origin === 'manual') {
            originBadge = `<span style="background:#003d3d; border:1px solid #00ffcc; color:#00ffcc; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">🔍 手動採取限定</span>`;
            cardBorder = '#006666';
        } else if (origin === 'exchange') {
            originBadge = `<span style="background:#3d2408; border:1px solid #ffaa44; color:#ffaa44; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">⚖️ 交換屋限定素材</span>`;
            cardBorder = '#7a4b12';
        } else if (origin === 'ultrarare') {
            originBadge = `<span style="background:linear-gradient(90deg, #4a124a, #12384a); border:1px solid #ff66ff; color:#ff88ff; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">🌈💎 激レアドロップ (0.2%〜0.5%)</span>`;
            cardBorder = '#993399';
        }
        if (maxCraft > 0) {
            cardBorder = '#2ea043';
        }

        const areaName = (recipe.area && areas[recipe.area]) ? areas[recipe.area].name : '';
        const skillLabel = skillLabelMap[recipe.category] || recipe.category;

        // ステータス補正バッジ生成
        let statBadges = [];
        const addStatBadge = (label, val, suffix = '', color = '#ffd700') => {
            if (val) statBadges.push(`<span style="background:#262626; border:1px solid #444; color:${color}; padding:1px 5px; border-radius:3px; font-size:11px;">${label}${val > 0 ? '+' : ''}${val}${suffix}</span>`);
        };
        addStatBadge('HP', eq.hp, '', '#88ff88');
        addStatBadge('MP', eq.mp, '', '#88ccff');
        addStatBadge('ATK', eq.atk, '', '#ff8888');
        addStatBadge('MATK', eq.matk, '', '#d2a8ff');
        addStatBadge('DEF', eq.def, '', '#79c0ff');
        addStatBadge('MDEF', eq.mdef, '', '#a5d6ff');
        addStatBadge('STR', eq.str, '', '#ffaa66');
        addStatBadge('INT', eq.int, '', '#cc99ff');
        addStatBadge('VIT', eq.vit, '', '#99ff99');
        addStatBadge('DEX', eq.dex, '', '#ffff88');
        addStatBadge('AGI', eq.agi, '', '#66ffcc');
        addStatBadge('LUC', eq.luc, '', '#ffcc00');
        addStatBadge('命中', eq.hit, '%', '#ffff88');
        addStatBadge('回避', eq.eva, '%', '#66ffcc');
        addStatBadge('泥率', eq.drop_rate || eq.drop, '%', '#ffd700');
        addStatBadge('火耐性', eq.fire_res, '%', '#ff6666');

        // 熟練度解放ロック判定（案B: 名匠クラフト）
        let isSkillLocked = false;
        let lockReasonText = "";
        let masteryBadge = "";
        if (recipe.reqSkill) {
            const curLv = (player.skills[recipe.reqSkill.skill]?.level || 1);
            if (curLv < recipe.reqSkill.level) {
                isSkillLocked = true;
                lockReasonText = `🔒 ${recipe.reqSkill.name}Lv.${recipe.reqSkill.level}で解放 (現在: Lv.${curLv})`;
                masteryBadge = `<span style="background:#4a1e1e; border:1px solid #ff6666; color:#ff9999; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">${lockReasonText}</span>`;
            } else {
                masteryBadge = `<span style="background:#1e3a2a; border:1px solid #2ea043; color:#7ee787; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">✨【${recipe.reqSkill.name}名匠】解放済</span>`;
            }
        }

        // 成長型武具・修練装備バッジ（案C & 案D）
        if (eq.scalingSkill) {
            const skillNameMap = { unarmed: '素手', katana: '刀術', sword: '剣術', spear: '槍術', axe: '斧術', bow: '弓術', gun: '銃術', magic: '魔法' };
            const sName = skillNameMap[eq.scalingSkill] || eq.scalingSkill;
            const curSkillLv = (player.skills[eq.scalingSkill]?.level || 1);
            statBadges.push(`<span style="background:#112f2f; border:1px solid #00ffcc; color:#00ffcc; padding:1px 5px; border-radius:3px; font-size:11px; font-weight:bold;">🌿成長型: ${sName}Lv.${curSkillLv}連動</span>`);
        }
        if (eq.scalingTotalSkills) {
            const totLv = typeof getSkillTotalLevel === 'function' ? getSkillTotalLevel() : 0;
            statBadges.push(`<span style="background:#112f2f; border:1px solid #00ffcc; color:#00ffcc; padding:1px 5px; border-radius:3px; font-size:11px; font-weight:bold;">🌿成長型: 全熟練度合計(${totLv})連動</span>`);
        }
        if (eq.allSkillExpBonus) {
            statBadges.push(`<span style="background:#3a2e10; border:1px solid #ffd700; color:#ffd700; padding:1px 5px; border-radius:3px; font-size:11px; font-weight:bold;">🧪全熟練度+${Math.round(eq.allSkillExpBonus * 100)}%</span>`);
        }
        if (eq.weaponSkillExpBonus) {
            statBadges.push(`<span style="background:#3a2e10; border:1px solid #ffd700; color:#ffd700; padding:1px 5px; border-radius:3px; font-size:11px; font-weight:bold;">⚔️武器熟練度+${Math.round(eq.weaponSkillExpBonus * 100)}%</span>`);
        }
        if (eq.craftSkillExpBonus) {
            statBadges.push(`<span style="background:#3a2e10; border:1px solid #ffd700; color:#ffd700; padding:1px 5px; border-radius:3px; font-size:11px; font-weight:bold;">🔨製作熟練度+${Math.round(eq.craftSkillExpBonus * 100)}%</span>`);
        }

        const card = document.createElement('div');
        card.style.cssText = `display:flex; justify-content:space-between; align-items:center; gap:10px; background:#1e1e1e; border:1px solid ${isSkillLocked ? '#552222' : cardBorder}; border-radius:6px; padding:10px 12px; transition:0.15s;`;

        const leftDiv = document.createElement('div');
        leftDiv.style.cssText = 'flex:1; min-width:0;';
        leftDiv.innerHTML = `
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-bottom:4px;">
                <span style="font-size:15px; font-weight:bold; color:#fff;">${recipe.name}</span>
                ${craftedBadge}
                ${masteryBadge}
                <span style="background:#283038; color:${slotInfo.color}; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">${slotInfo.label}</span>
                ${originBadge}
                <span style="background:#2b2b2b; color:#aaa; padding:2px 6px; border-radius:4px; font-size:11px;">${skillLabel}</span>
                ${areaName ? `<span style="background:#252525; color:#888; padding:2px 6px; border-radius:4px; font-size:11px;">📍 ${areaName}</span>` : ''}
            </div>
            ${statBadges.length > 0 ? `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:4px;">${statBadges.join('')}</div>` : ''}
            <div style="font-size:12px; color:#aaa; margin-bottom:6px;">${eq.description || ''}</div>
            <div style="display:flex; flex-wrap:wrap; align-items:center;">
                <span style="font-size:11px; color:#888; margin-right:6px;">必要素材:</span>
                ${matPillsHtml.join('')}
            </div>
        `;

        const rightDiv = document.createElement('div');
        rightDiv.style.cssText = 'display:flex; flex-direction:column; align-items:flex-end; justify-content:center; min-width:130px;';
        const btn = document.createElement('button');
        if (isSkillLocked) {
            btn.style.cssText = `width:100%; padding:8px 10px; font-size:11px; font-weight:bold; margin-bottom:0; border-radius:5px; cursor:not-allowed; background:#2d1b1b; color:#ff9999; border:1px solid #8b2c2c; line-height:1.3;`;
            btn.disabled = true;
            btn.innerHTML = `${lockReasonText}`;
        } else {
            btn.style.cssText = `width:100%; padding:8px 10px; font-size:13px; font-weight:bold; margin-bottom:0; border-radius:5px; cursor:${maxCraft > 0 ? 'pointer' : 'not-allowed'}; background:${maxCraft > 0 ? '#238636' : '#333'}; color:${maxCraft > 0 ? '#fff' : '#777'}; border:1px solid ${maxCraft > 0 ? '#2ea043' : '#444'};`;
            btn.disabled = (maxCraft === 0);
            btn.innerHTML = maxCraft > 0
                ? `🔨 製作する<br><span style="font-size:11px; font-weight:normal; color:#d2fedb;">(最大: ${maxCraft}個)</span>`
                : `素材不足`;
            btn.onclick = () => craftItem(recipeId);
        }
        rightDiv.appendChild(btn);

        card.appendChild(leftDiv);
        card.appendChild(rightDiv);
        listContainer.appendChild(card);
    }

    if (renderedCount === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding:24px; color:#888; background:#1a1a1a; border-radius:6px;">条件に一致するクラフトレシピがありません。フィルタ条件を変更してみてください。</div>`;
    }
}

// クラフト1回分の消費処理（優先度に応じたソート込み）
function checkAndConsumeMaterialsForOneCraft(recipe) {
    const prioritySelect = document.getElementById('craft-priority');
    const priority = prioritySelect ? prioritySelect.value : 'high';

    
    let consumePlan = []; // どのアイテムをいくつ減らすかのリスト
    let hasAllMaterials = true;
    let firstPrefix = ""; // 最初に消費した素材のプレフィックスを引き継ぐ

    // 必要素材がインベントリにあるかチェック
    for (const [materialName, requiredAmount] of Object.entries(recipe.cost)) {
        let amountToConsume = requiredAmount;
        
        let availableItems = [];
        for (const invKey of Object.keys(player.inventory)) {
             if (invKey.includes(materialName) && player.inventory[invKey] > 0) {
                availableItems.push({ key: invKey, count: player.inventory[invKey], rarity: getPrefixRarity(invKey) });
            }
        }

        // レアリティでソート
        availableItems.sort((a, b) => {
            if (priority === 'high') {
                return b.rarity - a.rarity; // 上位優先
            } else if (priority === 'low') {
                return a.rarity - b.rarity; // 下位優先
            } else {
                const aIsNone = a.rarity === -1 ? 1 : 0;
                const bIsNone = b.rarity === -1 ? 1 : 0;
                if (aIsNone !== bIsNone) return bIsNone - aIsNone; // プレフィックスなし優先
                return a.rarity - b.rarity;
            }
        });

        for (const item of availableItems) {
            const take = Math.min(item.count, amountToConsume);
            consumePlan.push({ key: item.key, amount: take });
            amountToConsume -= take;

            for (const p of prefixes) {
                if (item.key.startsWith(p)) {
                    if (!firstPrefix) {
                        firstPrefix = p;
                    } else if (priority === 'high' && getPrefixRarity(p) > getPrefixRarity(firstPrefix)) {
                        firstPrefix = p;
                    } else if (priority === 'low' && getPrefixRarity(p) < getPrefixRarity(firstPrefix)) {
                        firstPrefix = p;
                    }
                    break;
                }
            }
            if (amountToConsume <= 0) break;
            
        }
        if (amountToConsume > 0) {
            hasAllMaterials = false;
            break;
        }
    }

    if (!hasAllMaterials) return false;

    // 素材の消費
    consumePlan.forEach(plan => {
        player.inventory[plan.key] -= plan.amount;
        if (player.inventory[plan.key] <= 0) delete player.inventory[plan.key];
    });

     return { firstPrefix: firstPrefix };
}

// 汎用クラフト処理（まとめて作成対応）
function craftItem(recipeId) {
    const amountInput = document.getElementById('craft-amount');
    let craftCount = amountInput ? parseInt(amountInput.value, 10) : 1;
    if (isNaN(craftCount) || craftCount < 1) craftCount = 1;

    const recipe = RECIPES[recipeId];
    if (!recipe) return;

    if (recipe.reqSkill) {
        const curLv = (player.skills[recipe.reqSkill.skill]?.level || 1);
        if (curLv < recipe.reqSkill.level) {
            addLog(`<span style='color: #ff6666;'>⚠️ 【${recipe.reqSkill.name}熟練度】が Lv.${recipe.reqSkill.level} に達していないため製作できません。（現在: Lv.${curLv}）</span>`);
            return;
        }
    }

    let successCount = 0;
    let craftedItems = {};
    let expGained = 0;

    for (let i = 0; i < craftCount; i++) {
        let craftResult = checkAndConsumeMaterialsForOneCraft(recipe);
        if (!craftResult) {
            if (i === 0) {
                addLog(`<span style='color: #ffaa00;'>⚠️ 素材が足りません（${recipe.name}）</span>`);
            } else {
                addLog(`<span style='color: #ffaa00;'>⚠️ 素材が尽きました。${successCount}個作成しました。</span>`);
            }
            break;
        }

        successCount++;
        let finalPrefix = craftResult.firstPrefix;
        // 生産熟練度（および魔導鍛冶師ジョブ特性・隠しパッシブ『職人の極意』・職能マスタリー特化）による良称号付与・昇格ボーナス！
        const craftSkillLv = player.skills[recipe.category]?.level || 1;
        const artisanBonus = player.passiveSkills.includes("職人の極意") ? 0.25 : 0;
        const jmEff = getCurrentJobMasteryEffects();
        const masteryPrefixBonus = (jmEff.craftPrefixRate || 0) / 100;
        const jobPrefixBonus = player.job === "大匠神" ? 0.40 : (player.job === "魔導鍛冶師" ? 0.25 : 0);
        const subJobPrefixBonus = (player.subJob === "大匠神" || player.subJob === "魔導鍛冶師") ? 0.15 : 0;
        const upgradeChance = Math.min(0.95, (craftSkillLv - 1) * 0.03 + jobPrefixBonus + subJobPrefixBonus + artisanBonus + masteryPrefixBonus);
        if (Math.random() < upgradeChance) {
            const candidate = rollGoodPrefix();
            if (getPrefixRarity(candidate) > getPrefixRarity(finalPrefix)) {
                finalPrefix = candidate;
            }
        }
        const equipData = EQUIPMENT[recipe.result] || { name: recipe.result };
        const craftedItem = `${finalPrefix}${equipData.name || recipe.name}`;
        
        if (!craftedItems[craftedItem]) craftedItems[craftedItem] = 0;
        craftedItems[craftedItem]++;
        
        if (!player.inventory[craftedItem]) player.inventory[craftedItem] = 0;
        player.inventory[craftedItem]++;
        
        expGained += 5;
    }

    if (successCount > 0) {
        let msgParts = [];
        for(const [itemName, count] of Object.entries(craftedItems)) {
            msgParts.push(`<span style='color: #00ffcc;'>[${itemName}]</span>x${count}`);
        }
        addLog(`🔨 素材を消費して ${msgParts.join(", ")} を製作した！`);
        gainSkillExp(recipe.category, expGained);
        if (recipe.category === 'blacksmith' || recipe.category === 'handicraft' || recipe.category === 'sewing') {
            gainSkillExp('refining', Math.max(1, Math.floor(expGained * 0.5)));
        }
        
        // 1個作成で、かつ消費アイテム(usable)でない装備品なら自動装備
        const firstItem = Object.keys(craftedItems)[0];
        if (successCount === 1 && getItemSlot(firstItem) && getItemSlot(firstItem) !== "usable") {
            equipItem(firstItem);
        }

        // 実績・依頼進捗の加算
        if (!player.statsTrack) player.statsTrack = { totalSteps: 0, totalKills: 0, bossKills: 0, craftCount: 0, totalCrits: 0 };
        player.statsTrack.craftCount = (player.statsTrack.craftCount || 0) + successCount;
        checkQuestProgress('craft', null, successCount);
        checkAchievements();

        updateInventoryDisplay();
    }
}

// --- ⚒️ 3.4 鍛錬(+強化) ＆ 称号継承工房システム ---

// 装備のベース名から鍛錬に必要な素材アイテム名を取得
function getEquipmentEnhanceMaterial(baseName) {
    if (!baseName) return "鉄鉱石";
    for (const rId in RECIPES) {
        const r = RECIPES[rId];
        const eq = EQUIPMENT[r.result];
        if ((eq && eq.name === baseName) || r.name === baseName) {
            const costKeys = Object.keys(r.cost || {});
            if (costKeys.length > 0) return costKeys[0];
        }
    }
    // レシピが見つからないアクセサリー等のデフォルト
    return "鉄鉱石";
}

// 鍛錬・称号継承UIの更新
function updateForgeUI() {
    const targetSelect = document.getElementById('forge-target-select');
    const previewBox = document.getElementById('forge-preview-box');
    const enhanceBtn = document.getElementById('forge-enhance-btn');

    const reforgeTargetSelect = document.getElementById('reforge-target-select');
    const reforgeSourceSelect = document.getElementById('reforge-source-select');
    const reforgePreviewBox = document.getElementById('reforge-preview-box');
    const reforgeBtn = document.getElementById('reforge-execute-btn');

    if (!targetSelect && !reforgeTargetSelect) return;

    // プレイヤーが現在所持または装備している武具アイテムのリストを作成
    const equipItems = [];

    // 装備中のアイテム
    for (const slot in player.equipment) {
        const it = player.equipment[slot];
        if (it) {
            equipItems.push({ item: it, isEquipped: true, slot: slot });
        }
    }

    // インベントリの武具アイテム
    for (const it in player.inventory) {
        if (player.inventory[it] <= 0) continue;
        const slot = getItemSlot(it);
        if (slot !== null && slot !== 'usable') {
            equipItems.push({ item: it, isEquipped: false, slot: slot, count: player.inventory[it] });
        }
    }

    // 1. 鍛錬対象セレクトボックスの構築
    if (targetSelect) {
        const prevTargetVal = targetSelect.value;
        targetSelect.innerHTML = "";
        if (equipItems.length === 0) {
            targetSelect.innerHTML = "<option value=''>鍛錬可能な装備品がありません</option>";
            if (previewBox) previewBox.innerHTML = "<div style='color:#888;'>所持中または装備中の武具がありません。</div>";
            if (enhanceBtn) enhanceBtn.disabled = true;
        } else {
            equipItems.forEach((eq, idx) => {
                const opt = document.createElement('option');
                const p = parseItemName(eq.item);
                const plusTag = p.plus > 0 ? ` (+${p.plus})` : "";
                const eqTag = eq.isEquipped ? `[装備中:${eq.slot}] ` : `[所持 x${eq.count}] `;
                opt.value = eq.item + (eq.isEquipped ? `__eq__${eq.slot}` : `__inv__${idx}`);
                opt.text = `${eqTag}${eq.item}${plusTag}`;
                targetSelect.appendChild(opt);
            });

            if (prevTargetVal && Array.from(targetSelect.options).some(o => o.value === prevTargetVal)) {
                targetSelect.value = prevTargetVal;
            }

            // プレビューの描画
            const selectedVal = targetSelect.value;
            if (selectedVal && previewBox) {
                const isEq = selectedVal.includes('__eq__');
                const rawItemName = selectedVal.split('__')[0];
                const p = parseItemName(rawItemName);
                const curPlus = p.plus;
                const maxPlus = 20;

                if (curPlus >= maxPlus) {
                    previewBox.innerHTML = `
                        <div style="color: #ffd700; font-weight: bold; font-size: 14px;">👑 最大強化 (+${maxPlus} MAX) に到達しています！</div>
                        <div style="color: #88ff88; font-size: 12px; margin-top: 4px;">
                            基礎性能2倍 (+100%) ＆ 節目ボーナス全解放済 (全ステ+25, 命中+10%, 回避+6%, 会心+5%, 泥率+15%)
                        </div>
                    `;
                    if (enhanceBtn) enhanceBtn.disabled = true;
                } else {
                    const nextPlus = curPlus + 1;
                    const reqPt = nextPlus * 40;
                    const matName = getEquipmentEnhanceMaterial(p.baseName);
                    
                    // インベントリから該当素材（称号有無問わずベース名一致）の合計数を計算
                    let ownedMatCount = 0;
                    for (const invKey in player.inventory) {
                        const parsedInv = parseItemName(invKey);
                        if (parsedInv.baseName === matName) {
                            ownedMatCount += player.inventory[invKey];
                        }
                    }

                    const hasPt = (player.exchangePoints || 0) >= reqPt;
                    const hasMat = ownedMatCount >= 1;
                    const canEnhance = hasPt && hasMat;

                    const curPct = curPlus * 5;
                    const nextPct = nextPlus * 5;

                    // マイルストーン表示
                    let milestoneTag = "";
                    if (nextPlus === 5) milestoneTag = `<span style="color:#ffd700;">★+5マイルストーン特典: <b>全基礎ステ+5, 命中+2%</b> が発動！</span><br>`;
                    else if (nextPlus === 10) milestoneTag = `<span style="color:#ffd700;">★+10マイルストーン特典: <b>全基礎ステ+10, 命中+4%, 回避+2%</b> が発動！</span><br>`;
                    else if (nextPlus === 15) milestoneTag = `<span style="color:#ffd700;">★+15マイルストーン特典: <b>全基礎ステ+15, 命中+6%, 回避+4%, 会心率+3%</b> が発動！</span><br>`;
                    else if (nextPlus === 20) milestoneTag = `<span style="color:#ff66ff; font-weight:bold;">👑+20極限マイルストーン特典: 全基礎ステ+25, 命中+10%, 回避+6%, 会心率+5%, 泥率+15% が発動！</span><br>`;

                    previewBox.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
                            <div>
                                <b style="font-size:14px; color:#fff;">${rawItemName}</b> 
                                <span style="color:#ffd700; font-size:15px; font-weight:bold;">+${curPlus} ➔ +${nextPlus}</span>
                            </div>
                            <span style="font-size:12px; color:#aaa;">(上限: +${maxPlus})</span>
                        </div>
                        <div style="color:#88ff88; font-size:12px; margin-bottom:6px;">
                            ・装備基礎性能補正: <b>+${curPct}% ➔ +${nextPct}%</b> (+1ごとに全装備ステが+5%強化)<br>
                            ${milestoneTag}
                        </div>
                        <div style="background:#111; padding:8px; border-radius:4px; font-size:12px;">
                            <div style="color:#ffd700; font-weight:bold; margin-bottom:2px;">⚒️ 必要コスト:</div>
                            ・交換Pt: <b style="color:${hasPt ? '#88ff88' : '#ff4444'};">${reqPt} Pt</b> (所持: ${player.exchangePoints || 0} Pt)<br>
                            ・強化素材: <b style="color:${hasMat ? '#88ff88' : '#ff4444'};">${matName} x1</b> (所持: ${ownedMatCount}個)
                        </div>
                    `;
                    if (enhanceBtn) enhanceBtn.disabled = !canEnhance;
                }
            }
        }
    }

    // 2. 称号継承工房セレクトボックスの構築
    if (reforgeTargetSelect && reforgeSourceSelect) {
        const prevTargetVal = reforgeTargetSelect.value;
        const prevSourceVal = reforgeSourceSelect.value;
        reforgeTargetSelect.innerHTML = "";
        reforgeSourceSelect.innerHTML = "";

        // ベース武具
        equipItems.forEach((eq, idx) => {
            const opt = document.createElement('option');
            const eqTag = eq.isEquipped ? `[装備中:${eq.slot}] ` : `[所持 x${eq.count}] `;
            opt.value = eq.item + (eq.isEquipped ? `__eq__${eq.slot}` : `__inv__${idx}`);
            opt.text = `${eqTag}${eq.item}`;
            reforgeTargetSelect.appendChild(opt);
        });
        if (prevTargetVal && Array.from(reforgeTargetSelect.options).some(o => o.value === prevTargetVal)) {
            reforgeTargetSelect.value = prevTargetVal;
        }

        // 称号提供アイテム（インベントリ内の称号持ちアイテム、素材含む）
        const donorItems = [];
        for (const it in player.inventory) {
            if (player.inventory[it] <= 0) continue;
            const p = parseItemName(it);
            if (p.prefix) {
                const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(it) : null;
                donorItems.push({ item: it, prefix: p.prefix, tier: pInfo ? pInfo.tier : 1, pInfo: pInfo, count: player.inventory[it] });
            }
        }

        if (donorItems.length === 0) {
            reforgeSourceSelect.innerHTML = "<option value=''>称号つきの素材・武具がありません</option>";
            if (reforgePreviewBox) reforgePreviewBox.innerHTML = "<div style='color:#888;'>称号（修飾子）がついた素材または未装備武具を所持していません。</div>";
            if (reforgeBtn) reforgeBtn.disabled = true;
        } else {
            // Tierが高い順にソート
            donorItems.sort((a, b) => b.tier - a.tier);
            donorItems.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.item;
                opt.text = `[Tier${d.tier}] ${d.item} (所持:${d.count})`;
                reforgeSourceSelect.appendChild(opt);
            });

            if (prevSourceVal && Array.from(reforgeSourceSelect.options).some(o => o.value === prevSourceVal)) {
                reforgeSourceSelect.value = prevSourceVal;
            }

            // プレビュー描画
            const selTarget = reforgeTargetSelect.value;
            const selSource = reforgeSourceSelect.value;
            if (selTarget && selSource && reforgePreviewBox) {
                const rawTarget = selTarget.split('__')[0];
                const pTarget = parseItemName(rawTarget);
                const pSource = parseItemName(selSource);
                const sInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(selSource) : null;
                const tier = sInfo ? sInfo.tier : 1;

                const tierCostMap = { 0: 30, 1: 60, 2: 150, 3: 350, 4: 750, 5: 1500 };
                const reqPt = tierCostMap[tier] || 100;
                const hasPt = (player.exchangePoints || 0) >= reqPt;

                // 継承後の名称プレビュー: ＋値はそのまま保持！
                const plusTag = pTarget.plus > 0 ? `+${pTarget.plus}` : "";
                const resultItemName = `${pSource.prefix}${pTarget.baseName}${plusTag}`;

                reforgePreviewBox.innerHTML = `
                    <div style="font-size:13px; margin-bottom:6px;">
                        <span style="color:#aaa;">ベース装備:</span> <b style="color:#fff;">${rawTarget}</b><br>
                        <span style="color:#aaa;">移植する称号:</span> <b style="color:${sInfo ? sInfo.color : '#ff66ff'};">【${pSource.prefix}】(Tier${tier})</b> <span style="font-size:11px; color:#aaa;">(${sInfo ? sInfo.desc : ''})</span>
                    </div>
                    <div style="background:#111; padding:8px; border-radius:4px; font-size:13px; margin-bottom:6px;">
                        <div style="color:#00ffcc; font-weight:bold;">✨ 継承後の完成品プレビュー:</div>
                        <div style="font-size:15px; font-weight:bold; color:${sInfo ? sInfo.color : '#00ffcc'}; margin-top:2px;">
                            ${resultItemName}
                        </div>
                        <div style="font-size:11px; color:#88ff88; margin-top:2px;">
                            ※ 鍛錬した＋値 (+${pTarget.plus}) は完全に維持されます！
                        </div>
                    </div>
                    <div style="font-size:12px; color:#ccc;">
                        ・必要交換Pt: <b style="color:${hasPt ? '#88ff88' : '#ff4444'};">${reqPt} Pt</b> (所持: ${player.exchangePoints || 0} Pt)<br>
                        ・消費アイテム: <b style="color:#ffd700;">[${selSource}] x1</b> を消費して称号を抽出します
                    </div>
                `;
                if (reforgeBtn) reforgeBtn.disabled = !hasPt;
            }
        }
    }
}

// ＋値鍛錬の実行
function executeEnhance() {
    const targetSelect = document.getElementById('forge-target-select');
    if (!targetSelect || !targetSelect.value) return;

    const val = targetSelect.value;
    const isEquipped = val.includes('__eq__');
    const slot = isEquipped ? val.split('__eq__')[1] : null;
    const rawItemName = val.split('__')[0];

    const p = parseItemName(rawItemName);
    if (p.plus >= 20) {
        addLog("<span style='color:#ffaa00;'>⚠️ この装備はすでに最大強化(+20)に達しています。</span>");
        return;
    }

    const nextPlus = p.plus + 1;
    const reqPt = nextPlus * 40;
    if ((player.exchangePoints || 0) < reqPt) {
        addLog(`<span style='color:#ffaa00;'>⚠️ 交換Ptが足りません（必要: ${reqPt} Pt / 所持: ${player.exchangePoints || 0} Pt）</span>`);
        return;
    }

    const matName = getEquipmentEnhanceMaterial(p.baseName);
    let matKeyToConsume = null;
    for (const invKey in player.inventory) {
        if (player.inventory[invKey] > 0 && parseItemName(invKey).baseName === matName) {
            matKeyToConsume = invKey;
            break;
        }
    }

    if (!matKeyToConsume) {
        addLog(`<span style='color:#ffaa00;'>⚠️ 強化素材【${matName}】を所持していません。</span>`);
        return;
    }

    // コスト消費
    player.exchangePoints -= reqPt;
    player.inventory[matKeyToConsume]--;
    if (player.inventory[matKeyToConsume] <= 0) delete player.inventory[matKeyToConsume];

    // 新アイテム名の構築
    const newItemName = `${p.cleanName}+${nextPlus}`;

    if (isEquipped && slot && player.equipment[slot] === rawItemName) {
        player.equipment[slot] = newItemName;
    } else {
        if (player.inventory[rawItemName] && player.inventory[rawItemName] > 0) {
            player.inventory[rawItemName]--;
            if (player.inventory[rawItemName] <= 0) delete player.inventory[rawItemName];
        }
        player.inventory[newItemName] = (player.inventory[newItemName] || 0) + 1;
    }

    addLog(`⚒️✨ <b style="color:#ffd700;">【鍛錬成功！】</b> <span style="color:#fff;">[${rawItemName}]</span> を <span style="color:#00ffcc; font-weight:bold;">[${newItemName}]</span> に強化した！（基礎ステ+5%UP＆マイルストーン強化！）`);
    gainSkillExp('blacksmith', 10);
    gainSkillExp('refining', 15);
    recordItemToCompendium(newItemName);

    calcStatus();
    updateInventoryDisplay();
    updateForgeUI();
    checkAchievements();
}

// 称号継承の実行
function executeReforge() {
    const targetSelect = document.getElementById('reforge-target-select');
    const sourceSelect = document.getElementById('reforge-source-select');
    if (!targetSelect || !sourceSelect || !targetSelect.value || !sourceSelect.value) return;

    const targetVal = targetSelect.value;
    const sourceItem = sourceSelect.value;

    const isEquipped = targetVal.includes('__eq__');
    const slot = isEquipped ? targetVal.split('__eq__')[1] : null;
    const rawTarget = targetVal.split('__')[0];

    const pTarget = parseItemName(rawTarget);
    const pSource = parseItemName(sourceItem);

    if (!pSource.prefix) {
        addLog("<span style='color:#ffaa00;'>⚠️ 選択した素材に称号がついていません。</span>");
        return;
    }

    if (!player.inventory[sourceItem] || player.inventory[sourceItem] <= 0) {
        addLog("<span style='color:#ffaa00;'>⚠️ 提供元の素材がインベントリにありません。</span>");
        return;
    }

    const sInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(sourceItem) : null;
    const tier = sInfo ? sInfo.tier : 1;
    const tierCostMap = { 0: 30, 1: 60, 2: 150, 3: 350, 4: 750, 5: 1500 };
    const reqPt = tierCostMap[tier] || 100;

    if ((player.exchangePoints || 0) < reqPt) {
        addLog(`<span style='color:#ffaa00;'>⚠️ 交換Ptが足りません（必要: ${reqPt} Pt / 所持: ${player.exchangePoints || 0} Pt）</span>`);
        return;
    }

    // コスト消費
    player.exchangePoints -= reqPt;
    player.inventory[sourceItem]--;
    if (player.inventory[sourceItem] <= 0) delete player.inventory[sourceItem];

    // 新アイテム名の構築（＋値は完全に引き継ぐ）
    const plusTag = pTarget.plus > 0 ? `+${pTarget.plus}` : "";
    const newItemName = `${pSource.prefix}${pTarget.baseName}${plusTag}`;

    if (isEquipped && slot && player.equipment[slot] === rawTarget) {
        player.equipment[slot] = newItemName;
    } else {
        if (player.inventory[rawTarget] && player.inventory[rawTarget] > 0) {
            player.inventory[rawTarget]--;
            if (player.inventory[rawTarget] <= 0) delete player.inventory[rawTarget];
        }
        player.inventory[newItemName] = (player.inventory[newItemName] || 0) + 1;
    }

    addLog(`✨🔮 <b style="color:#ff66ff;">【称号継承完了！】</b> [${sourceItem}] から称号を移植し、<span style="color:#00ffcc; font-weight:bold;">[${newItemName}]</span> を再刻印した！`);
    gainSkillExp('handicraft', 10);
    gainSkillExp('refining', 20);
    recordItemToCompendium(newItemName);

    calcStatus();
    updateInventoryDisplay();
    updateForgeUI();
    checkAchievements();
}

// --- ⚖️ 3.5 ギルド素材・武具交換屋（修飾子ティア別レート査定・限定アクセ＆レア素材交換・不要クラフト品納品） ---
// 素材または装備品1個あたりの納品交換Ptを算出
function getMaterialExchangeValue(fullItemName) {
    if (!fullItemName) return 1;
    let baseName = fullItemName;
    const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(fullItemName) : null;
    if (pInfo) {
        baseName = fullItemName.substring(pInfo.prefix.length);
    }

    const areaBasePts = { area1: 2, area2: 4, area3: 8, area4: 15, area5: 28, area6: 50, area7: 90, area8: 160 };
    let basePt = 2;

    // 装備品（クラフト品・ドロップ武具）かどうかを判定
    const itemSlot = getItemSlot(fullItemName);
    if (itemSlot !== null && itemSlot !== 'usable') {
        // 該当装備のレシピまたはエリアから基準Ptを算出
        let eqFound = false;
        for (const [rId, recipe] of Object.entries(RECIPES || {})) {
            const eqData = EQUIPMENT[recipe.result];
            if ((eqData && eqData.name === baseName) || recipe.name === baseName) {
                const aPt = areaBasePts[recipe.area || 'area1'] || 2;
                if (recipe.origin === 'ultrarare') basePt = aPt * 35;
                else if (recipe.origin === 'rare') basePt = aPt * 12;
                else if (recipe.origin === 'manual') basePt = aPt * 8;
                else basePt = aPt * 4;
                eqFound = true;
                break;
            }
        }
        if (!eqFound && typeof EXCHANGE_SHOP_ITEMS !== 'undefined') {
            const shopEntry = EXCHANGE_SHOP_ITEMS.find(x => x.item === baseName);
            if (shopEntry) {
                basePt = Math.max(10, Math.floor(shopEntry.ptCost * 0.35));
                eqFound = true;
            }
        }
        if (!eqFound) {
            basePt = 12; // モンスター直接ドロップ武具などのデフォルト基準値
        }
    } else {
        // どのエリア・どの希少度の素材か逆引きしてベースPtを決定
        let found = false;
        for (const [areaId, aData] of Object.entries(areas)) {
            const aPt = areaBasePts[areaId] || 2;
            for (const g of (aData.gather || [])) {
                if (g.item === baseName) { basePt = aPt; found = true; break; }
            }
            if (found) break;
            for (const mg of (aData.manualGather || [])) {
                if (mg.item === baseName) { basePt = Math.ceil(aPt * 2.5); found = true; break; }
            }
            if (found) break;
            for (const m of aData.monsters) {
                for (const d of (m.drops || [])) {
                    if (d.item === baseName) {
                        if (d.isUltraRare) basePt = aPt * 25;
                        else if (d.isRare || d.rate <= 0.05) basePt = aPt * 6;
                        else basePt = Math.ceil(aPt * 1.2);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (found) break;
            if (aData.boss) {
                for (const d of (aData.boss.drops || [])) {
                    if (d.item === baseName) {
                        if (d.isUltraRare) basePt = aPt * 30;
                        else if (d.isRare || d.rate <= 0.05) basePt = aPt * 8;
                        else basePt = aPt * 3;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }
    }

    // 修飾子ティア倍率の適用
    const tierKey = pInfo ? pInfo.tier : 'none';
    const tierMult = (typeof EXCHANGE_TIER_MULTIPLIER !== 'undefined' && EXCHANGE_TIER_MULTIPLIER[tierKey] !== undefined)
        ? EXCHANGE_TIER_MULTIPLIER[tierKey]
        : 1.0;

    // アルケミスト(+30%)・大豪商(+50%)・サブジョブ・職人の極意(+20%)・黄金律(+25%)ボーナス ＆ ギルドランク納品ボーナス
    let bonusMult = 1.0;
    if (player.job === "アルケミスト") bonusMult += 0.30;
    if (player.job === "大豪商") bonusMult += 0.50;
    const subJobEx = (typeof getSubJobBonus === "function" ? getSubJobBonus().exchangeBonus : 0) || 0;
    if (subJobEx) bonusMult += subJobEx;
    if (player.passiveSkills && player.passiveSkills.includes("職人の極意")) bonusMult += 0.20;
    if (player.passiveSkills && player.passiveSkills.includes("黄金律")) bonusMult += 0.25;

    const gRank = getCurrentGuildRank();
    if (gRank && gRank.exchangeBonus) bonusMult *= gRank.exchangeBonus;

    return Math.max(1, Math.round(basePt * tierMult * bonusMult));
}

// 素材または不要なクラフト品（未装備）を指定個数納品して交換Ptに変換する
function donateMaterial(itemKey, amount) {
    const owned = player.inventory[itemKey] || 0;
    if (owned <= 0) return;
    const sellCount = Math.min(owned, amount);
    const unitPt = getMaterialExchangeValue(itemKey);
    const jmEff = getCurrentJobMasteryEffects();
    const exMult = 1.0 + (jmEff.exchangeBonus || 0) / 100;
    const earnedPt = Math.floor(unitPt * sellCount * exMult);

    player.inventory[itemKey] -= sellCount;
    if (player.inventory[itemKey] <= 0) delete player.inventory[itemKey];
    player.exchangePoints = (player.exchangePoints || 0) + earnedPt;

    const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(itemKey) : null;
    const col = pInfo ? pInfo.color : "#ccc";
    const isEquip = getItemSlot(itemKey) !== null && getItemSlot(itemKey) !== 'usable';
    const typeTag = isEquip ? "🛡️クラフト武具" : "🌿素材";
    const bonusTag = exMult > 1.0 ? ` (特化+${Math.round((exMult - 1) * 100)}%)` : "";
    addLog(`⚖️ ${typeTag} <span style="color:${col};">[${itemKey}]</span>×<b>${sellCount}</b> を交換屋に納品し、<b style="color:#ffd700;">+${earnedPt} Pt</b> (単価:${unitPt}Pt${bonusTag}) を獲得した！`);
    gainSkillExp('trading', Math.max(1, Math.floor(earnedPt / 4)));
    calcStatus();
    updateInventoryDisplay();
    if (typeof saveGame === "function") saveGame(false);
}

// 一括納品処理（クラフト武具・余剰素材の項目拡充版）
function bulkDonateMaterials(mode) {
    let totalEarned = 0;
    let totalCount = 0;
    const jmEff = getCurrentJobMasteryEffects();
    const gRank = getCurrentGuildRank();
    const rankBonusMult = gRank.exchangeBonus || (1.0 + (gRank.exPtBonus || 0) / 100);
    const exMult = (1.0 + (jmEff.exchangeBonus || 0) / 100) * rankBonusMult;

    // 現在装備中のアイテム名の集合を作成（装備中アイテムは絶対に保護）
    const equippedItemNames = new Set();
    if (player.equipment) {
        for (const slot in player.equipment) {
            const eqItem = player.equipment[slot];
            if (eqItem) equippedItemNames.add(eqItem);
        }
    }

    const targets = [];

    for (const [itemKey, count] of Object.entries({ ...player.inventory })) {
        if (count <= 0) continue;
        const slot = getItemSlot(itemKey);
        if (slot === 'usable') continue; // 料理・ポーション等の消費アイテムは保護

        const isEquip = slot !== null;
        const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(itemKey) : null;
        const parsed = typeof parseItemName === "function" ? parseItemName(itemKey) : { prefix: "", baseName: itemKey, plus: 0 };
        const baseName = parsed.baseName;
        const plus = parsed.plus || 0;
        const tier = pInfo ? pInfo.tier : 1;

        // 激レア装備(0.2%〜0.5%)・交換限定アクセサリーかどうかの判定
        const isUltraOrSpecial = (typeof EXCHANGE_SHOP_ITEMS !== 'undefined' && EXCHANGE_SHOP_ITEMS.some(x => x.item === baseName))
            || Object.values(RECIPES || {}).some(r => {
                const eq = EQUIPMENT[r.result];
                return ((eq && eq.name === baseName) || r.name === baseName) && (r.origin === 'ultrarare');
            });

        // レアドロップ装備かどうかの判定
        const isRareEquip = Object.values(RECIPES || {}).some(r => {
            const eq = EQUIPMENT[r.result];
            return ((eq && eq.name === baseName) || r.name === baseName) && (r.origin === 'rare');
        });

        let sellAmount = 0;

        // 🛡️ クラフト装備品の一括納品モード
        if (mode === 'equip_tier1') {
            // Tier1以下（ボロボロ〜普通）の未装備武具
            if (!isEquip) continue;
            if (isUltraOrSpecial && tier > 0) continue;
            if (plus > 0) continue; // +1以上の鍛錬品は保護
            if (tier <= 1) sellAmount = count;
        } else if (mode === 'equip_tier2') {
            // Tier2以下（良質まで）の未装備武具
            if (!isEquip) continue;
            if (isUltraOrSpecial) continue; // 激レア・交換アクセは保護
            if (plus > 0) continue; // +1以上の鍛錬品は保護
            if (tier <= 2) sellAmount = count;
        } else if (mode === 'equip_normal_unenhanced') {
            // 通常レシピ品で、強化値+0の未装備武具（レア泥・激レア・鍛錬強化品は自動保護）
            if (!isEquip) continue;
            if (isUltraOrSpecial || isRareEquip) continue;
            if (plus > 0) continue;
            sellAmount = count;
        } else if (mode === 'equip_all_safe') {
            // 未装備のクラフト武具を全納品（激レア・交換アクセ・鍛錬+1以上は保護）
            if (!isEquip) continue;
            if (isUltraOrSpecial) continue;
            if (plus > 0) continue;
            sellAmount = count;
        }

        // 🌿 余剰素材の一括納品モード
        else if (mode === 'tier0') {
            // Tier0(粗悪)素材
            if (isEquip) continue;
            if (pInfo && pInfo.tier === 0) sellAmount = count;
        } else if (mode === 'surplus10') {
            // Tier1以下の素材で、10個を超えて所持している余剰分
            if (isEquip) continue;
            if (tier <= 1 && count > 10) {
                sellAmount = count - 10;
            }
        } else if (mode === 'surplus20_all') {
            // 通常素材で20個を超えて所持している余剰分（レア泥・激レア泥・手動採取限定素材は保護）
            if (isEquip) continue;
            const isProtectedRareMat = (typeof EXCHANGE_SHOP_ITEMS !== 'undefined' && EXCHANGE_SHOP_ITEMS.some(x => x.item === baseName))
                || Object.values(areas).some(a => a.monsters.some(m => m.drops.some(d => d.item === baseName && (d.isRare || d.isUltraRare))) || (a.boss && a.boss.drops.some(d => d.item === baseName && (d.isRare || d.isUltraRare))) || (a.manualGather && a.manualGather.some(g => g.item === baseName)));
            if (!isProtectedRareMat && count > 20) {
                sellAmount = count - 20;
            }
        }

        if (sellAmount > 0) {
            const unitPt = getMaterialExchangeValue(itemKey);
            const earned = Math.floor(unitPt * sellAmount * exMult);
            targets.push({ itemKey, sellAmount, earned });
            totalEarned += earned;
            totalCount += sellAmount;
        }
    }

    if (totalCount === 0) {
        addLog(`<span style="color:#aaa;">⚖️ 一括納品の条件に該当するアイテムがありませんでした。</span>`);
        return;
    }

    // 全納品などの大きな操作時は確認ダイアログ
    if (mode === 'equip_all_safe') {
        const ok = confirm(`未装備のクラフト武具 計 ${totalCount} 個を一括納品して、+${totalEarned} Pt を獲得しますか？\n（※現在装備中の武具、鍛錬+1以上の強化品、激レア限定品は保護されます）`);
        if (!ok) return;
    }

    // 実際の納品処理
    for (const { itemKey, sellAmount } of targets) {
        player.inventory[itemKey] -= sellAmount;
        if (player.inventory[itemKey] <= 0) {
            delete player.inventory[itemKey];
        }
    }

    player.exchangePoints = (player.exchangePoints || 0) + totalEarned;
    const isEquipMode = mode.startsWith('equip_');
    const label = isEquipMode ? '未装備クラフト武具' : '余剰素材';
    const bonusTag = exMult > 1.0 ? ` <span style="color:#00ffcc;">(ギルド・職能特化ボーナス +${Math.round((exMult - 1) * 100)}%)</span>` : "";
    addLog(`⚖️🧹 <b style="color:#ffd700;">【一括納品完了！】</b> ${label} 計 <b>${totalCount}個</b> を納品し、<b style="color:#00ffcc;">+${totalEarned} Pt</b> を獲得した！${bonusTag}`);
    gainSkillExp('trading', Math.max(2, Math.floor(totalEarned / 4)));

    calcStatus();
    updateInventoryDisplay();
    if (typeof updateExchangeUI === "function") updateExchangeUI();
    if (typeof saveGame === "function") saveGame(false);
}

// 交換屋で景品（エリア限定特殊アクセサリー・ステージ別レア泥）を交換する
function exchangeShopBuy(shopId) {
    if (typeof EXCHANGE_SHOP_ITEMS === 'undefined') return;
    const entry = EXCHANGE_SHOP_ITEMS.find(x => x.id === shopId);
    if (!entry) return;

    // 前エリアのボス討伐条件チェック
    if (entry.reqBoss && (!player.compendium?.monsters?.[entry.reqBoss] || player.compendium.monsters[entry.reqBoss] <= 0)) {
        addLog(`<span style="color:#ff6666;">🔒 この景品を交換するには、先に前エリアのボス【<b>${entry.reqBoss}</b>】を討伐する必要があります！</span>`);
        return;
    }

    if ((player.exchangePoints || 0) < entry.ptCost) {
        addLog(`<span style="color:#ffaa00;">⚠️ 交換Ptが足りません！（必要: ${entry.ptCost}Pt / 所持: ${player.exchangePoints || 0}Pt）</span>`);
        return;
    }

    player.exchangePoints -= entry.ptCost;
    // 交換時にも35%（アルケミスト・幸運の星なら60%以上）の確率で良称号（交換品のエリアに応じたTier 2〜5）が付与される！
    const goodChance = 0.35 + (player.job === "アルケミスト" ? 0.15 : 0) + (player.passiveSkills.includes("幸運の星") ? 0.15 : 0);
    const prefix = Math.random() < goodChance ? rollGoodPrefix(entry.area) : "";
    const finalItemName = `${prefix}${entry.item}`;

    player.inventory[finalItemName] = (player.inventory[finalItemName] || 0) + 1;
    recordItemToCompendium(finalItemName, 1);
    const badge = entry.isEquipment ? "💍限定装飾品" : "🌟希少素材";
    addLog(`⚖️🎁 交換Ptを <b>${entry.ptCost}Pt</b> 消費し、${badge} <span style="color:#00ffcc; font-weight:bold;">[${finalItemName}]</span> を交換した！`);
    gainSkillExp('trading', Math.max(5, Math.floor(entry.ptCost / 8)));

    // アクセサリーで空き枠があれば自動装備
    if (entry.isEquipment && (!player.equipment.acc1 || !player.equipment.acc2 || !player.equipment.acc3)) {
        equipItem(finalItemName);
    }

    checkSecretSkills(); // 最上級職の解放条件素材チェック
    calcStatus();
    updateInventoryDisplay();
    if (typeof saveGame === "function") saveGame(false);
}

// 交換屋タブのUI描画更新
function updateExchangeUI() {
    const ptEl = document.getElementById('display-exchange-points');
    if (ptEl) ptEl.innerText = player.exchangePoints || 0;

    // 1. 景品交換リストの描画
    const shopList = document.getElementById('exchange-shop-list');
    if (shopList && typeof EXCHANGE_SHOP_ITEMS !== 'undefined') {
        const areaFilter = document.getElementById('exchange-filter-area')?.value || 'all';
        const catFilter = document.getElementById('exchange-filter-cat')?.value || 'all';
        shopList.innerHTML = '';

        EXCHANGE_SHOP_ITEMS.forEach(entry => {
            if (areaFilter !== 'all' && entry.area !== areaFilter) return;
            if (catFilter !== 'all' && entry.category !== catFilter) return;

            const isUnlocked = !entry.reqBoss || ((player.compendium?.monsters?.[entry.reqBoss] || 0) > 0);
            const hasEnoughPt = (player.exchangePoints || 0) >= entry.ptCost;
            const canBuy = isUnlocked && hasEnoughPt;
            // インベントリおよび装備中の所持数（称号つき含む）
            let ownedCount = 0;
            for (const [k, c] of Object.entries(player.inventory)) {
                if (k.includes(entry.item)) ownedCount += c;
            }
            for (const slot in player.equipment) {
                if (player.equipment[slot] && player.equipment[slot].includes(entry.item)) ownedCount++;
            }

            const catBadge = entry.category === 'accessory'
                ? `<span style="background:#3a183a; border:1px solid #ff66ff; color:#ff88ff; padding:1px 6px; border-radius:4px; font-size:11px; font-weight:bold;">💍 エリア限定・特殊効果アクセ</span>`
                : `<span style="background:#4d3800; border:1px solid #ffd700; color:#ffd700; padding:1px 6px; border-radius:4px; font-size:11px; font-weight:bold;">🌟 レアドロップ</span>`;
            const areaLabel = areas[entry.area] ? areas[entry.area].name.split(' ')[0] : entry.area;
            const lockBadge = !isUnlocked
                ? `<span style="background:#3a1818; border:1px solid #aa4444; color:#ff8888; padding:1px 6px; border-radius:4px; font-size:11px;">🔒 前エリアBOSS【${entry.reqBoss}】討伐で解禁</span>`
                : '';

            const card = document.createElement('div');
            card.style.cssText = `display:flex; justify-content:space-between; align-items:center; gap:10px; background:#1e1e1e; border:1px solid ${canBuy ? '#2ea043' : (entry.category === 'accessory' ? '#663366' : '#3a3a3a')}; border-radius:6px; padding:8px 12px; opacity:${isUnlocked ? '1' : '0.68'};`;
            card.innerHTML = `
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-bottom:3px;">
                        <b style="font-size:14px; color:#fff;">${entry.item}</b>
                        ${catBadge}
                        <span style="background:#252525; color:#aaa; padding:1px 6px; border-radius:4px; font-size:11px;">📍 ${areaLabel}</span>
                        <span style="font-size:11px; color:#88ff88;">(所持/装備: ${ownedCount}個)</span>
                        ${lockBadge}
                    </div>
                    <div style="font-size:12px; color:#ccc;">${entry.desc}</div>
                </div>
                <div style="min-width:115px; text-align:right;">
                    <button ${canBuy ? '' : 'disabled'} style="width:100%; padding:6px 8px; font-size:12px; font-weight:bold; margin-bottom:0; background:${canBuy ? '#238636' : '#333'}; border:1px solid ${canBuy ? '#2ea043' : '#444'};">
                        🪙 ${entry.ptCost} Pt<br><span style="font-size:11px; font-weight:normal;">${isUnlocked ? '交換する' : '🔒 未解禁'}</span>
                    </button>
                </div>
            `;
            const btn = card.querySelector('button');
            if (btn) btn.onclick = () => exchangeShopBuy(entry.id);
            shopList.appendChild(card);
        });
    }

    // 2. 手持ち素材＆不要なクラフト品（未装備）の納品リスト描画（高レート順に表示）
    const sellList = document.getElementById('exchange-sell-list');
    if (sellList) {
        const sellTypeFilter = document.getElementById('exchange-sell-type')?.value || 'all';
        sellList.innerHTML = '';
        const matEntries = [];
        for (const [itemKey, count] of Object.entries(player.inventory)) {
            if (count <= 0) continue;
            const slot = getItemSlot(itemKey);
            if (slot === 'usable') continue; // 消費アイテムは除外
            const isEquip = slot !== null;
            if (sellTypeFilter === 'materials' && isEquip) continue;
            if (sellTypeFilter === 'equipment' && !isEquip) continue;

            const unitPt = getMaterialExchangeValue(itemKey);
            const pInfo = typeof getPrefixInfo === "function" ? getPrefixInfo(itemKey) : null;
            matEntries.push({ itemKey, count, unitPt, pInfo, isEquip });
        }

        if (matEntries.length === 0) {
            sellList.innerHTML = `<div style="text-align:center; padding:20px; color:#888; background:#1a1a1a; border-radius:6px;">条件に一致する納品可能な素材・未装備クラフト品がありません。</div>`;
            return;
        }

        // 単価Ptが高い順（高ティア修飾子順）にソート
        matEntries.sort((a, b) => b.unitPt - a.unitPt);

        matEntries.forEach(({ itemKey, count, unitPt, pInfo, isEquip }) => {
            const nameColor = pInfo ? pInfo.color : (isEquip ? '#00ffcc' : '#ccc');
            const tierBadge = pInfo
                ? `<span style="background:#262626; border:1px solid ${pInfo.color}; color:${pInfo.color}; padding:1px 5px; border-radius:3px; font-size:10px;">Tier${pInfo.tier} (×${EXCHANGE_TIER_MULTIPLIER[pInfo.tier]})</span>`
                : `<span style="background:#262626; color:#888; padding:1px 5px; border-radius:3px; font-size:10px;">称号なし (×1.0)</span>`;
            const kindBadge = isEquip
                ? `<span style="background:#1f2d3d; border:1px solid #58a6ff; color:#79c0ff; padding:1px 5px; border-radius:3px; font-size:10px;">🛡️武具</span>`
                : `<span style="background:#1c2d1f; border:1px solid #3fb950; color:#7ee787; padding:1px 5px; border-radius:3px; font-size:10px;">🌿素材</span>`;

            const row = document.createElement('div');
            row.style.cssText = `display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; background:#222; border:1px solid #383838; border-radius:5px; padding:6px 10px; font-size:13px;`;
            row.innerHTML = `
                <div style="flex:1; min-width:180px;">
                    ${kindBadge}
                    <span style="color:${nameColor}; font-weight:${pInfo && pInfo.tier >= 3 ? 'bold' : 'normal'};">${itemKey}</span>
                    <b>x${count}</b> ${tierBadge}
                    <span style="color:#ffd700; font-size:12px; margin-left:6px;">(単価: <b>${unitPt} Pt</b>)</span>
                </div>
                <div style="display:flex; gap:4px;">
                    <button class="sell-1" style="width:auto; padding:3px 8px; font-size:11px; margin-bottom:0; background:#007acc;">1個 (+${unitPt}Pt)</button>
                    ${count >= 5 ? `<button class="sell-5" style="width:auto; padding:3px 8px; font-size:11px; margin-bottom:0; background:#286090;">5個 (+${unitPt * 5}Pt)</button>` : ''}
                    <button class="sell-all" style="width:auto; padding:3px 8px; font-size:11px; margin-bottom:0; background:#a94442;">全て (+${unitPt * count}Pt)</button>
                </div>
            `;
            row.querySelector('.sell-1').onclick = () => donateMaterial(itemKey, 1);
            if (row.querySelector('.sell-5')) row.querySelector('.sell-5').onclick = () => donateMaterial(itemKey, 5);
            row.querySelector('.sell-all').onclick = () => donateMaterial(itemKey, count);
            sellList.appendChild(row);
        });
    }
}

// --- 📜 3.6 ギルド依頼 ＆ ギルドランク昇格システム ---

// ギルド依頼の単体生成ヘルパー
function generateSingleGuildQuest() {
    const curAreaNum = parseInt((currentAreaId || 'area1').replace('area', ''), 10) || 1;
    const targetAreaNum = Math.floor(Math.random() * curAreaNum) + 1;
    const targetAreaId = `area${targetAreaNum}`;
    const aData = areas[targetAreaId] || areas['area1'];

    const questTypes = ['defeat', 'gather', 'craft', 'walk'];
    const chosenType = questTypes[Math.floor(Math.random() * questTypes.length)];

    let title = "";
    let desc = "";
    let target = null;
    let req = 1;

    if (chosenType === 'defeat') {
        const nonBossMonsters = aData.monsters.filter(m => !m.isBoss);
        const mon = nonBossMonsters[Math.floor(Math.random() * nonBossMonsters.length)] || aData.monsters[0];
        target = mon.name;
        req = Math.floor(Math.random() * 4) + 3; // 3〜6体
        title = `討伐: ${target} ×${req}`;
        desc = `${aData.name}に出現する「${target}」を${req}体討伐せよ。`;
    } else if (chosenType === 'gather') {
        const gatherList = aData.gather || [{ item: "薬草" }];
        const mat = gatherList[Math.floor(Math.random() * gatherList.length)];
        target = mat.item;
        req = Math.floor(Math.random() * 3) + 2; // 2〜4個
        title = `採取: ${target} ×${req}`;
        desc = `${aData.name}にて「${target}」を${req}個採集せよ。`;
    } else if (chosenType === 'craft') {
        req = Math.floor(Math.random() * 2) + 1; // 1〜2回
        title = `生産: 装備クラフト ×${req}回`;
        desc = `クラフト工房にて任意の武具・道具を${req}回製作せよ。`;
    } else {
        req = (Math.floor(Math.random() * 3) + 2) * 5; // 10〜20歩
        title = `探索: 手動探索で${req}歩踏破`;
        desc = `いずれかのエリアを手動アクション（慎重/強襲/集中）で${req}歩探索せよ。`;
    }

    const gpReward = 15 + targetAreaNum * 12;
    const ptReward = 25 + targetAreaNum * 20;
    const expReward = 60 + targetAreaNum * 50;
    const statPtReward = targetAreaNum >= 5 ? 2 : 1;

    return {
        id: "quest_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
        title,
        desc,
        type: chosenType,
        target,
        current: 0,
        req,
        area: aData.name.split(' ')[0],
        reward: {
            gp: gpReward,
            exchangePt: ptReward,
            exp: expReward,
            statPt: statPtReward
        }
    };
}

// ギルド依頼リストの保証・初期化（常時3件）
function ensureGuildQuests() {
    if (!player.guild) player.guild = { rank: "F", gp: 0, quests: [] };
    if (!Array.isArray(player.guild.quests)) player.guild.quests = [];
    while (player.guild.quests.length < 3) {
        player.guild.quests.push(generateSingleGuildQuest());
    }
}

// 依頼進捗チェック
function checkQuestProgress(type, targetName, amount = 1) {
    if (!player.guild || !Array.isArray(player.guild.quests)) return;
    let updated = false;
    player.guild.quests.forEach(q => {
        if (q.current >= q.req) return;
        if (q.type === type) {
            if (type === 'defeat') {
                if (q.target === targetName) {
                    q.current = Math.min(q.req, q.current + amount);
                    updated = true;
                }
            } else if (type === 'gather') {
                if (targetName && targetName.includes(q.target)) {
                    q.current = Math.min(q.req, q.current + amount);
                    updated = true;
                }
            } else if (type === 'craft' || type === 'walk') {
                q.current = Math.min(q.req, q.current + amount);
                updated = true;
            }
        }
    });
    if (updated) {
        updateGuildQuestUI();
    }
}

// 依頼達成報告
function claimGuildQuest(questIndex) {
    ensureGuildQuests();
    const q = player.guild.quests[questIndex];
    if (!q || q.current < q.req) return;

    player.guild.gp += q.reward.gp;
    player.guild.completedCount = (player.guild.completedCount || 0) + 1;
    player.exchangePoints = (player.exchangePoints || 0) + q.reward.exchangePt;
    player.statPoints += q.reward.statPt;
    gainExp(q.reward.exp);
    gainSkillExp('trading', 10);

    addLog(`📜🎉 <b style="color:#ffd700;">【ギルド依頼達成！】</b> 『${q.title}』を達成！ 獲得: <b style="color:#00ffcc;">+${q.reward.gp} GP</b> / <b style="color:#ffd700;">+${q.reward.exchangePt} Pt</b> / <b style="color:#88ff88;">+${q.reward.exp} EXP</b> / <b>ステPt +${q.reward.statPt}</b>！`);

    player.guild.quests[questIndex] = generateSingleGuildQuest();

    calcStatus();
    updateGuildQuestUI();
    checkAchievements();
}

// 依頼再抽選（50Pt消費）
function rerollGuildQuests() {
    ensureGuildQuests();
    const cost = 50;
    if ((player.exchangePoints || 0) < cost) {
        addLog(`<span style='color:#ffaa00;'>⚠️ 依頼の再抽選には ${cost} Pt 必要です（所持: ${player.exchangePoints || 0} Pt）。</span>`);
        return;
    }
    player.exchangePoints -= cost;
    player.guild.quests = [
        generateSingleGuildQuest(),
        generateSingleGuildQuest(),
        generateSingleGuildQuest()
    ];
    addLog(`🔄 <span style="color:#ffd700;">交換Pt 50Pt を支払い、ギルド依頼掲示板の依頼を全て更新しました！</span>`);
    calcStatus();
    updateGuildQuestUI();
}

// ギルドランク昇格
function checkGuildRankUpgrade() {
    if (!player.guild) player.guild = { rank: "F", gp: 0, quests: [], completedCount: 0 };
    const curRankIdx = GUILD_RANKS.findIndex(r => r.rank === player.guild.rank);
    if (curRankIdx === -1 || curRankIdx >= GUILD_RANKS.length - 1) {
        addLog("<span style='color:#ffd700;'>👑 既に最高ギルドランクに到達しています！</span>");
        return;
    }
    const nextRank = GUILD_RANKS[curRankIdx + 1];
    if (player.guild.gp < nextRank.reqGp) {
        addLog(`<span style='color:#ffaa00;'>⚠️ GPが足りません（必要: ${nextRank.reqGp} GP / 所持: ${player.guild.gp} GP）</span>`);
        return;
    }

    player.guild.rank = nextRank.rank;
    player.statPoints += 5; // 昇格ボーナスとしてステPt+5！

    const rankDisplayName = nextRank.name || `ランク${nextRank.rank}: ${nextRank.title}`;
    const actSlots = nextRank.activeSlots || nextRank.maxActiveSlots || 3;
    const pasSlots = nextRank.passiveSlots || nextRank.maxPassiveSlots || 3;
    const exPtBonus = nextRank.exPtBonus || 0;

    addLog(`📜👑✨ <b style="color:#ff66ff; font-size:14px;">【ギルドランク昇格！！】</b> 冒険者ギルドで認められ、<b style="color:#00ffcc;">『${rankDisplayName}』</b> に昇格した！！（全基礎ステ+${nextRank.allStats}, 泥率+${nextRank.dropBonus}%, 納品Pt+${exPtBonus}%, アクティブ最大${actSlots}枠/パッシブ最大${pasSlots}枠に拡張！ 昇格ボーナス: ステPt+5）`);

    calcStatus();
    updateGuildQuestUI();
    checkAchievements();
}

// ギルド依頼＆ランクUIの描画
function updateGuildQuestUI() {
    ensureGuildQuests();
    const statusBox = document.getElementById('guild-rank-status-box');
    const questList = document.getElementById('guild-quest-list');
    if (!statusBox && !questList) return;

    const curRank = getCurrentGuildRank();
    const curRankIdx = GUILD_RANKS.findIndex(r => r.rank === curRank.rank);
    const nextRank = curRankIdx < GUILD_RANKS.length - 1 ? GUILD_RANKS[curRankIdx + 1] : null;

    if (statusBox) {
        let progressPct = 100;
        let reqText = "MAX (最高位到達)";
        let canUpgrade = false;
        if (nextRank) {
            const prevGp = curRank.reqGp || 0;
            const span = nextRank.reqGp - prevGp;
            const curGpInTier = Math.max(0, player.guild.gp - prevGp);
            progressPct = Math.min(100, Math.floor((curGpInTier / span) * 100));
            reqText = `次の昇格まで: ${player.guild.gp} / ${nextRank.reqGp} GP`;
            canUpgrade = player.guild.gp >= nextRank.reqGp;
        }

        const curDisplayName = curRank.name || `ランク${curRank.rank}: ${curRank.title || "見習いギルド員"}`;
        const nextDisplayName = nextRank ? (nextRank.name || `ランク${nextRank.rank}: ${nextRank.title}`) : "";
        const curActSlots = curRank.activeSlots || curRank.maxActiveSlots || 3;
        const curPasSlots = curRank.passiveSlots || curRank.maxPassiveSlots || 3;
        const curExPtBonus = curRank.exPtBonus || 0;

        statusBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                <div>
                    <span style="font-size:12px; color:#aaa;">📜 現在の冒険者ギルドランク:</span><br>
                    <b style="font-size:18px; color:#00ffcc;">${curDisplayName}</b>
                    <span style="margin-left:10px; color:#ffd700; font-size:14px; font-weight:bold;">🪙 所持GP: ${player.guild.gp} GP</span>
                </div>
                <div>
                    ${nextRank ? `
                        <button onclick="checkGuildRankUpgrade()" ${canUpgrade ? '' : 'disabled'} style="padding:6px 14px; font-size:13px; font-weight:bold; background:${canUpgrade ? '#238636' : '#333'}; border:1px solid ${canUpgrade ? '#2ea043' : '#444'}; margin-bottom:0;">
                            🆙 『${nextDisplayName}』へ昇格する！
                        </button>
                    ` : '<span style="color:#ffd700; font-weight:bold;">👑 最高栄誉ランク達成</span>'}
                </div>
            </div>
            <div style="background:#111; height:8px; border-radius:4px; overflow:hidden; margin-bottom:6px; border:1px solid #333;">
                <div style="background:linear-gradient(90deg, #007acc, #00ffcc); width:${progressPct}%; height:100%; transition:width 0.3s;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#aaa; margin-bottom:8px;">
                <span>進捗: ${progressPct}%</span>
                <span style="color:#ffd700;">${reqText}</span>
            </div>
            <div style="background:#111822; border:1px solid #283a4f; border-radius:4px; padding:6px 10px; font-size:12px; color:#ccc;">
                <span style="color:#88ff88; font-weight:bold;">✨ 発動中のギルド特典:</span> 
                全基礎ステ+<b>${curRank.allStats || 0}</b> ｜ ドロップ補正+<b>${curRank.dropBonus || 0}%</b> ｜ 納品交換Pt <b>+${curExPtBonus}%</b> ｜ 
                アクティブスキル枠: <b style="color:#00ffcc;">${curActSlots}枠</b> ｜ パッシブスキル枠: <b style="color:#00ffcc;">${curPasSlots}枠</b>
            </div>
        `;
    }

    if (questList) {
        questList.innerHTML = "";
        player.guild.quests.forEach((q, idx) => {
            const isCompleted = q.current >= q.req;
            const pct = Math.min(100, Math.floor((q.current / q.req) * 100));

            const card = document.createElement('div');
            card.style.cssText = `background:#202020; border:1px solid ${isCompleted ? '#2ea043' : '#3a3a3a'}; border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;`;
            card.innerHTML = `
                <div style="flex:1; min-width:220px;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px;">
                        <span style="background:#2a2a2a; color:#00ffcc; padding:1px 6px; border-radius:3px; font-size:11px;">📍 ${q.area}</span>
                        <b style="font-size:14px; color:${isCompleted ? '#88ff88' : '#fff'};">${q.title}</b>
                        ${isCompleted ? '<span style="background:#1c3322; color:#88ff88; padding:1px 6px; border-radius:3px; font-size:10px; font-weight:bold;">達成！</span>' : ''}
                    </div>
                    <div style="font-size:12px; color:#bbb; margin-bottom:6px;">${q.desc}</div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="flex:1; max-width:200px; background:#111; height:6px; border-radius:3px; overflow:hidden; border:1px solid #333;">
                            <div style="background:${isCompleted ? '#2ea043' : '#007acc'}; width:${pct}%; height:100%;"></div>
                        </div>
                        <span style="font-size:11px; color:#ffd700;">進行度: <b>${q.current}</b> / ${q.req}</span>
                    </div>
                </div>
                <div style="text-align:right; min-width:140px;">
                    <div style="font-size:11px; color:#aaa; margin-bottom:4px;">
                        報酬: <b>+${q.reward.gp} GP</b> / <b>+${q.reward.exchangePt} Pt</b><br>
                        EXP+${q.reward.exp} / ステPt+${q.reward.statPt}
                    </div>
                    <button class="claim-btn" ${isCompleted ? '' : 'disabled'} style="width:100%; padding:6px 12px; font-size:12px; font-weight:bold; background:${isCompleted ? '#238636' : '#333'}; border:1px solid ${isCompleted ? '#2ea043' : '#444'}; margin-bottom:0;">
                        ${isCompleted ? '📜 報酬を受け取る' : '進行中...'}
                    </button>
                </div>
            `;
            const btn = card.querySelector('.claim-btn');
            if (btn && isCompleted) btn.onclick = () => claimGuildQuest(idx);
            questList.appendChild(card);
        });
    }
}

// --- 🏆 3.7 実績 ＆ プレイヤー称号（二つ名）システム ---

// 実績の達成判定と称号解放
function checkAchievements() {
    if (!player.unlockedTitles) player.unlockedTitles = [];
    if (!player.statsTrack) player.statsTrack = { totalSteps: 0, totalKills: 0, bossKills: 0, craftCount: 0, totalCrits: 0 };
    if (typeof PLAYER_TITLES === "undefined") return;

    let newlyUnlocked = false;
    PLAYER_TITLES.forEach(t => {
        const id = t.id;
        if (!player.unlockedTitles.includes(id)) {
            let passed = false;
            if (typeof t.check === "function") {
                passed = t.check(player);
            } else if (id === "駆け出し冒険者") {
                passed = true;
            }
            if (passed) {
                player.unlockedTitles.push(id);
                newlyUnlocked = true;
                const rPt = t.rewardStatPt || 0;
                player.statPoints += rPt;
                addLog(`🏆✨👑 <b style="color:#ffd700; font-size:14px;">【実績解除＆二つ名獲得！】</b> 冒険の偉業を成し遂げ、二つ名<b style="color:#ff66ff;">『${t.name}』</b>を獲得した！（恒久ステPt +${rPt}）`);
                if (!player.equippedTitle) {
                    player.equippedTitle = id;
                }
            }
        }
    });

    if (newlyUnlocked) {
        calcStatus();
        updateAchievementsUI();
    }
}

// 二つ名の着脱
function equipPlayerTitle(titleId) {
    if (!player.unlockedTitles || !player.unlockedTitles.includes(titleId)) return;
    const t = getPlayerTitle(titleId);
    if (!t) return;
    player.equippedTitle = titleId;
    addLog(`👑 <b style="color:#ffd700;">二つ名を『${t.name}』に付け替えた！</b> (${t.buffDesc || t.desc || ""})`);
    calcStatus();
    updateAchievementsUI();
}

// 実績・二つ名一覧UIの描画
function updateAchievementsUI() {
    const list = document.getElementById('comp-achievements-list');
    if (!list) return;

    if (!player.unlockedTitles) player.unlockedTitles = [];
    if (!player.statsTrack) player.statsTrack = { totalSteps: 0, totalKills: 0, bossKills: 0, craftCount: 0, totalCrits: 0 };
    if (typeof PLAYER_TITLES === "undefined") return;

    list.innerHTML = "";
    PLAYER_TITLES.forEach(t => {
        const id = t.id;
        const isUnlocked = player.unlockedTitles.includes(id);
        const isEquipped = player.equippedTitle === id;

        const card = document.createElement('div');
        card.style.cssText = `background:#222; border:1px solid ${isEquipped ? '#ffd700' : (isUnlocked ? '#2ea043' : '#3a3a3a')}; border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;`;
        card.innerHTML = `
            <div style="flex:1; min-width:240px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:3px;">
                    <b style="font-size:14px; color:${isEquipped ? '#ffd700' : (isUnlocked ? '#fff' : '#777')};">${isUnlocked ? t.name : '？？？ (' + t.name + ')'}</b>
                    ${isEquipped ? '<span style="background:#4d3800; border:1px solid #ffd700; color:#ffd700; padding:1px 6px; border-radius:3px; font-size:10px; font-weight:bold;">👑 装着中</span>' : (isUnlocked ? '<span style="background:#163320; color:#7ee787; padding:1px 6px; border-radius:3px; font-size:10px;">解除済</span>' : '<span style="background:#2a2a2a; color:#888; padding:1px 6px; border-radius:3px; font-size:10px;">未解除</span>')}
                </div>
                <div style="font-size:12px; color:#bbb; margin-bottom:3px;">🔍 <b>条件:</b> <span style="color:${isUnlocked ? '#88ff88' : '#ccc'};">${t.condDesc || t.condition || ""}</span></div>
                <div style="font-size:11px; color:#ffd700;">✨ <b>固有バフ:</b> ${t.buffDesc || t.desc || ""} <span style="color:#aaa;">(実績解除ボーナス: ステPt+${t.rewardStatPt || 0})</span></div>
            </div>
            <div style="text-align:right; min-width:110px;">
                ${isUnlocked ? `
                    <button class="title-equip-btn" ${isEquipped ? 'disabled' : ''} style="width:100%; padding:6px 12px; font-size:12px; font-weight:bold; background:${isEquipped ? '#555' : '#6f42c1'}; border:1px solid ${isEquipped ? '#666' : '#8a63d2'}; margin-bottom:0;">
                        ${isEquipped ? '👑 装着中' : '称号を装着'}
                    </button>
                ` : `<span style="font-size:11px; color:#666;">🔒 未達成</span>`}
            </div>
        `;
        const btn = card.querySelector('.title-equip-btn');
        if (btn && isUnlocked && !isEquipped) {
            btn.onclick = () => equipPlayerTitle(id);
        }
        list.appendChild(card);
    });
}

// --- 📖 3.8 冒険者図鑑UIの描画処理 ---
let _lastCompendiumCache = "";

function updateCompendiumUI(force = false) {
    const summaryBox = document.getElementById('compendium-summary-box');
    if (!summaryBox) return;

    // 図鑑タブが開いていない場合は無駄なDOM再構築をスキップ
    const compTab = document.getElementById('tab-compendium');
    const isVisible = compTab && compTab.classList.contains('active');
    if (!isVisible && !force) return;

    const cb = getCompendiumBonuses();
    const cacheKey = `${cb.unlockedEntries}_${cb.compRate.toFixed(1)}`;
    if (!force && _lastCompendiumCache === cacheKey) return;
    _lastCompendiumCache = cacheKey;
    summaryBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
            <div>
                <span style="font-size:15px; font-weight:bold; color:#00ffcc;">🏆 総合図鑑コンプリート率: ${cb.compRate.toFixed(1)}%</span>
                <span style="color:#ccc; margin-left:8px;">(登録総数: <b>${cb.unlockedEntries}</b> / ${cb.totalEntries})</span>
            </div>
            <div style="font-size:11px; color:#ffd700;">
                👾モンスター:${cb.monCount}/${cb.allMonsters.length} ｜ 🌿素材:${cb.matCount}/${cb.allMaterials.length} (🌈激レア:${cb.ultraMatCount}) ｜ ⚔️装備:${cb.eqCount}/${cb.allEquipment.length} ｜ ✨称号:${cb.pfxCount}/${cb.allPrefixes.length}
            </div>
        </div>
        <div style="background:#111; height:10px; border-radius:5px; overflow:hidden; margin-bottom:8px; border:1px solid #333;">
            <div style="background:linear-gradient(90deg, #00ffcc, #ffd700, #ff66ff); width:${cb.compRate}%; height:100%; transition:width 0.3s;"></div>
        </div>
        <div style="background:#121820; border:1px solid #2a3b4c; border-radius:4px; padding:6px 10px;">
            <div style="color:#ffd700; font-weight:bold; margin-bottom:3px;">✨ 現在発動中の図鑑コレクション永久ボーナス:</div>
            <div style="color:#88ff88; font-size:12px;">
                ・全基礎ステータス(STR/INT/VIT/DEX/AGI/LUC): <b>+${cb.flatAllStats}</b> ＆ 乗算ボーナス <b>+${cb.allStatPctBonus}%</b> (さらにLUC追加 <b>+${cb.flatLucExtra}</b>)<br>
                ・戦闘能力加算: <b>最大HP+${cb.flatHp}</b> / <b>最大MP+${cb.flatMp}</b> / <b>ATK+${cb.flatAtk}</b> / <b>MATK+${cb.flatMatk}</b> / <b>DEF+${cb.flatDef}</b> / <b>MDEF+${cb.flatMdef}</b> / <b>命中+${cb.flatHit}%</b> / <b>回避+${cb.flatEva}%</b> / <b>ドロップ率+${cb.flatDrop}%</b>
            </div>
        </div>
    `;

    // 1. モンスター図鑑
    const monList = document.getElementById('comp-monsters-list');
    if (monList) {
        monList.innerHTML = cb.allMonsters.map(m => {
            const kills = player.compendium.monsters[m.name] || 0;
            const unlocked = kills > 0;
            const badge = m.isBoss
                ? `<span style="background:#4a1212; color:#ff6666; padding:1px 5px; border-radius:3px; font-size:10px;">🚨BOSS</span>`
                : (m.isRareMon ? `<span style="background:#4d3800; color:#ffd700; padding:1px 5px; border-radius:3px; font-size:10px;">★レア敵</span>` : `<span style="background:#2a2a2a; color:#aaa; padding:1px 5px; border-radius:3px; font-size:10px;">通常</span>`);
            return `<div style="background:#222; border:1px solid ${unlocked ? '#2ea043' : '#444'}; border-radius:5px; padding:6px 8px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="color:${unlocked ? '#fff' : '#666'};">${unlocked ? m.name : '？？？'}</b>
                    ${badge}
                </div>
                <div style="font-size:11px; color:#888; margin-top:2px;">📍 ${m.area.split(' ')[0]} ｜ 討伐数: <b style="color:${unlocked ? '#88ff88' : '#666'};">${kills}体</b></div>
            </div>`;
        }).join('');
    }

    // 2. 素材・秘宝図鑑
    const matList = document.getElementById('comp-materials-list');
    if (matList) {
        const kindBadge = {
            ultrarare: `<span style="background:#3a183a; border:1px solid #ff66ff; color:#ff88ff; padding:1px 5px; border-radius:3px; font-size:10px;">🌈激レア</span>`,
            rare: `<span style="background:#4d3800; color:#ffd700; padding:1px 5px; border-radius:3px; font-size:10px;">🌟レア泥</span>`,
            manual: `<span style="background:#003d3d; color:#00ffcc; padding:1px 5px; border-radius:3px; font-size:10px;">🔍手動採取</span>`,
            boss: `<span style="background:#4a1212; color:#ff8888; padding:1px 5px; border-radius:3px; font-size:10px;">BOSS素材</span>`,
            gather: `<span style="background:#1c3322; color:#88ff88; padding:1px 5px; border-radius:3px; font-size:10px;">🌿採取</span>`,
            normal: `<span style="background:#2a2a2a; color:#aaa; padding:1px 5px; border-radius:3px; font-size:10px;">通常泥</span>`
        };
        matList.innerHTML = cb.allMaterials.map(m => {
            const unlocked = (player.compendium.materials[m.name] || 0) > 0;
            return `<div style="background:#222; border:1px solid ${unlocked ? (m.kind === 'ultrarare' ? '#ff66ff' : '#2ea043') : '#444'}; border-radius:5px; padding:6px 8px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="color:${unlocked ? '#fff' : '#666'};">${unlocked ? m.name : '？？？'}</b>
                    ${kindBadge[m.kind] || kindBadge.normal}
                </div>
                <div style="font-size:11px; color:#888; margin-top:2px;">📍 ${m.area.split(' ')[0]} (${m.source})</div>
            </div>`;
        }).join('');
    }

    // 3. 装備・秘薬図鑑
    const eqList = document.getElementById('comp-equipment-list');
    if (eqList) {
        eqList.innerHTML = cb.allEquipment.map(e => {
            const unlocked = (player.compendium.equipment[e.name] || 0) > 0;
            return `<div style="background:#222; border:1px solid ${unlocked ? '#2ea043' : '#444'}; border-radius:5px; padding:6px 8px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="color:${unlocked ? '#00ffcc' : '#666'};">${unlocked ? e.name : '？？？'}</b>
                    <span style="font-size:10px; color:${unlocked ? '#88ff88' : '#666'};">${unlocked ? '✅登録済' : '未入手'}</span>
                </div>
                <div style="font-size:11px; color:#999; margin-top:2px;">${unlocked ? (e.desc || '') : '入手またはクラフトすると詳細が解放されます'}</div>
            </div>`;
        }).join('');
    }

    // 4. 修飾子(称号)図鑑
    const pfxList = document.getElementById('comp-prefixes-list');
    if (pfxList) {
        pfxList.innerHTML = cb.allPrefixes.map(p => {
            const unlocked = !!player.compendium.prefixes[p.name];
            return `<div style="background:#222; border:1px solid ${unlocked ? p.color : '#444'}; border-radius:5px; padding:6px 8px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="color:${unlocked ? p.color : '#666'};">${unlocked ? `【${p.name}】` : '？？？'}</b>
                    <span style="background:#2a2a2a; color:#ccc; padding:1px 5px; border-radius:3px; font-size:10px;">Tier ${p.tier}</span>
                </div>
                <div style="font-size:11px; color:#999; margin-top:2px;">${unlocked ? p.desc : `Tier ${p.tier} の修飾子つきアイテムを入手すると解放`}</div>
            </div>`;
        }).join('');
    }

    // 5. 実績・二つ名一覧
    if (typeof updateAchievementsUI === "function") updateAchievementsUI();
}

// --- 💾 3.9 セーブ＆ロード・バックアップ機能 (localStorage) ---
const SAVE_STORAGE_KEY = "TGS2_REBUILD_SAVE_V1";
let isResettingSave = false;
let resetConfirmPending = false;
let resetConfirmTimer = null;

function buildSavePayload() {
    return {
        version: 2,
        savedAt: new Date().toISOString(),
        currentAreaId,
        exploreSteps,
        exploreSpeed,
        expMultiplier,
        statAllocateAmount,
        player
    };
}

function saveGame(isManual = false) {
    if (isResettingSave) return false;
    try {
        syncInventoryToCompendium();
        const payload = buildSavePayload();
        localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
        const timeStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const statusEl = document.getElementById('autosave-status');
        if (statusEl) statusEl.innerText = `💾 最終セーブ: ${timeStr}`;
        if (isManual) {
            addLog(`💾 <span style="color:#88ff88; font-weight:bold;">進行状況をブラウザにセーブしました！ (${timeStr})</span>`);
        }
        return true;
    } catch (e) {
        console.error("Save failed:", e);
        if (isManual) addLog(`<span style="color:#ff6666;">⚠️ セーブに失敗しました。</span>`);
        return false;
    }
}

function applySavePayload(data, isManual = false) {
    if (!data || !data.player) return false;
    const sp = data.player;

    player.level = sp.level ?? 1;
    player.exp = sp.exp ?? 0;
    player.nextExp = getPlayerNextExp(player.level);
    player.statPoints = sp.statPoints ?? 0;
    player.job = sp.job && JOBS[sp.job] ? sp.job : "冒険者";
    player.jobLevels = sp.jobLevels || { "冒険者": { level: 1, exp: 0, nextExp: 100, isMaster: false } };
    if (!player.jobLevels[player.job]) {
        player.jobLevels[player.job] = { level: 1, exp: 0, nextExp: 100, isMaster: false };
    }
    if (sp.stats) {
        for (const k of ['str', 'int', 'vit', 'dex', 'agi', 'luc']) {
            if (typeof sp.stats[k] === 'number') player.stats[k] = sp.stats[k];
        }
    }
    if (sp.equipment) {
        for (const slot in player.equipment) {
            player.equipment[slot] = sp.equipment[slot] || null;
        }
    }
    if (sp.skills) {
        for (const sKey in player.skills) {
            if (sp.skills[sKey]) {
                player.skills[sKey] = {
                    level: sp.skills[sKey].level ?? 1,
                    exp: sp.skills[sKey].exp ?? 0,
                    next: sp.skills[sKey].next ?? 10
                };
            }
        }
    }
    ensureSkillsStructure();
    player.unlockedSkills = Array.isArray(sp.unlockedSkills) ? sp.unlockedSkills : [];
    player.activeSkills = Array.isArray(sp.activeSkills) ? sp.activeSkills.filter(s => ACTIVE_SKILLS[s]) : [];
    player.passiveSkills = Array.isArray(sp.passiveSkills) ? sp.passiveSkills.filter(s => PASSIVE_SKILLS[s]) : [];
    player.unlockedPassives = Array.isArray(sp.unlockedPassives) ? sp.unlockedPassives : [];
    player.exchangePoints = sp.exchangePoints ?? 0;
    player.guild = sp.guild ? { rank: sp.guild.rank || "F", gp: sp.guild.gp || 0, quests: sp.guild.quests || [] } : { rank: "F", gp: 0, quests: [] };
    player.statsTrack = sp.statsTrack ? {
        totalSteps: sp.statsTrack.totalSteps || 0,
        totalKills: sp.statsTrack.totalKills || 0,
        bossKills: sp.statsTrack.bossKills || 0,
        craftCount: sp.statsTrack.craftCount || 0,
        totalCrits: sp.statsTrack.totalCrits || 0
    } : { totalSteps: 0, totalKills: 0, bossKills: 0, craftCount: 0, totalCrits: 0 };
    player.unlockedTitles = Array.isArray(sp.unlockedTitles) ? sp.unlockedTitles : [];
    player.equippedTitle = sp.equippedTitle || null;
    player.battleChain = sp.battleChain || 0;
    player.trainingBuff = sp.trainingBuff || { name: null, steps: 0, jlvExpMult: 1.0, skillExpMult: 1.0 };
    player.subJob = (sp.subJob && JOBS[sp.subJob] && sp.subJob !== player.job) ? sp.subJob : null;
    player.equipmentPresets = Array.isArray(sp.equipmentPresets) ? sp.equipmentPresets : null;
    ensureEquipmentPresetsStructure();
    for (const jobId in player.jobLevels) {
        ensureJobMasteryStructure(jobId);
    }

    player.inventory = sp.inventory || {};
    player.compendium = sp.compendium || { monsters: {}, materials: {}, equipment: {}, prefixes: {} };
    ensureCompendiumStructure();
    syncInventoryToCompendium();
    ensureGuildQuests();

    if (data.currentAreaId && areas[data.currentAreaId]) {
        currentAreaId = data.currentAreaId;
        const areaSelect = document.getElementById('area-select');
        if (areaSelect) areaSelect.value = currentAreaId;
    }
    exploreSteps = data.exploreSteps ?? 0;
    const area = areas[currentAreaId];
    const dNameEl = document.getElementById('dungeon-name');
    if (dNameEl && area) {
        dNameEl.innerHTML = `🌲 ダンジョン：${area.name} <span id="explore-progress" style="font-size: 14px; font-weight: normal; color: #aaa;">(進行度: ${exploreSteps} / 100)</span>`;
    }

    if (typeof data.exploreSpeed === 'number') {
        exploreSpeed = data.exploreSpeed;
        const speedSlider = document.getElementById('speed-slider');
        const speedDisp = document.getElementById('speed-display');
        if (speedSlider) speedSlider.value = exploreSpeed;
        if (speedDisp) speedDisp.innerText = (exploreSpeed / 1000).toFixed(1) + "秒";
    }

    checkSecretSkills();
    checkAchievements();
    calcStatus();
    player.hp = (typeof sp.hp === 'number' && !isNaN(sp.hp) && sp.hp > 0) ? Math.min(player.maxHp, sp.hp) : player.maxHp;
    player.mp = (typeof sp.mp === 'number' && !isNaN(sp.mp) && sp.mp > 0) ? Math.min(player.maxMp, sp.mp) : player.maxMp;
    calcStatus();
    updateInventoryDisplay();
    updateGuildQuestUI();
    updateAchievementsUI();
    updateForgeUI();
    if (typeof updateChainAndBuffUI === "function") updateChainAndBuffUI();
    if (typeof updateJobMasterySpecUI === "function") updateJobMasterySpecUI();
    if (typeof renderEquipmentPresetsUI === "function") renderEquipmentPresetsUI();

    if (isManual) {
        addLog(`📂 <span style="color:#00ffcc; font-weight:bold;">セーブデータを読み込みました！ (PLV.${player.level} / ${player.job})</span>`);
    }
    return true;
}

function loadGame(isManual = false) {
    try {
        const raw = localStorage.getItem(SAVE_STORAGE_KEY);
        if (!raw) {
            if (isManual) addLog(`<span style="color:#ffaa00;">⚠️ 保存されたセーブデータが見つかりません。</span>`);
            return false;
        }
        const data = JSON.parse(raw);
        return applySavePayload(data, isManual);
    } catch (e) {
        console.error("Load failed:", e);
        if (isManual) addLog(`<span style="color:#ff6666;">⚠️ セーブデータの読み込みに失敗しました。</span>`);
        return false;
    }
}

function exportSaveData() {
    try {
        syncInventoryToCompendium();
        const json = JSON.stringify(buildSavePayload());
        const code = btoa(unescape(encodeURIComponent(json)));
        const ta = document.getElementById('save-code-textarea');
        if (ta) {
            ta.value = code;
            ta.select();
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).catch(() => {});
        }
        addLog(`📤 <span style="color:#00ffcc; font-weight:bold;">バックアップ用セーブコードを出力しました！</span>`);
    } catch (e) {
        addLog(`<span style="color:#ff6666;">⚠️ セーブコードの出力に失敗しました。</span>`);
    }
}

function importSaveData() {
    const ta = document.getElementById('save-code-textarea');
    const code = ta ? ta.value.trim() : '';
    if (!code) {
        addLog(`<span style="color:#ffaa00;">⚠️ テキスト欄にセーブコードを貼り付けてください。</span>`);
        return;
    }
    try {
        const json = decodeURIComponent(escape(atob(code)));
        const data = JSON.parse(json);
        if (applySavePayload(data, true)) {
            saveGame(false);
            addLog(`📥 <span style="color:#88ff88; font-weight:bold;">セーブコードからデータを復元し、保存しました！</span>`);
        }
    } catch (e) {
        addLog(`<span style="color:#ff6666;">⚠️ セーブコードの形式が正しくありません。</span>`);
    }
}

function resetSaveData() {
    const btn = document.getElementById('reset-save-btn');
    // VS Code Simple Browser 等でも確実に動作するよう、ボタン2回クリック式の確認を採用
    if (!resetConfirmPending) {
        resetConfirmPending = true;
        if (btn) {
            btn.innerText = "⚠️ もう一度押すと完全に初期化";
            btn.style.background = "#ff2222";
        }
        addLog(`<span style="color:#ffaa00;">⚠️ 本当にデータを初期化しますか？ 5秒以内にもう一度「⚠️ もう一度押すと完全に初期化」ボタンを押すと最初からリセットされます。</span>`);
        if (resetConfirmTimer) clearTimeout(resetConfirmTimer);
        resetConfirmTimer = setTimeout(() => {
            resetConfirmPending = false;
            if (btn) {
                btn.innerText = "🗑️ データ初期化(最初から)";
                btn.style.background = "#a94442";
            }
        }, 5000);
        return;
    }

    if (resetConfirmTimer) clearTimeout(resetConfirmTimer);
    resetConfirmPending = false;
    isResettingSave = true;

    // オート探索中なら停止
    if (isExploring) {
        isExploring = false;
        clearInterval(exploreInterval);
        const exBtn = document.getElementById('explore-btn');
        if (exBtn) {
            exBtn.innerText = `🌲 ダンジョン探索を開始する（オート）`;
            exBtn.classList.remove('active');
        }
    }
    closeManualEvent();
    clearAutoChance();

    // localStorage から削除
    try {
        localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch (e) {}

    // メモリ上のプレイヤー・ダンジョンデータも完全初期化（リロードが効かない環境でも即座に初期状態へ戻す）
    player.level = 1;
    player.exp = 0;
    player.nextExp = getPlayerNextExp(1);
    player.statPoints = 0;
    player.job = "冒険者";
    player.jobLevels = { "冒険者": { level: 1, exp: 0, nextExp: getJobNextExp("冒険者", 1), isMaster: false } };
    player.stats = { str: 10, int: 10, vit: 10, dex: 10, agi: 10, luc: 10 };
    for (const slot in player.equipment) player.equipment[slot] = null;
    ensureSkillsStructure();
    player.unlockedSkills = [];
    player.activeSkills = [];
    player.passiveSkills = [];
    player.unlockedPassives = [];
    player.exchangePoints = 0;
    player.guild = { rank: "F", gp: 0, quests: [] };
    player.statsTrack = { totalSteps: 0, totalKills: 0, bossKills: 0, craftCount: 0, totalCrits: 0 };
    player.unlockedTitles = [];
    player.equippedTitle = null;
    player.battleChain = 0;
    player.trainingBuff = { name: null, steps: 0, jlvExpMult: 1.0, skillExpMult: 1.0 };
    player.inventory = {};
    player.compendium = { monsters: {}, materials: {}, equipment: {}, prefixes: {} };
    ensureGuildQuests();

    enemy = null;
    currentAreaId = "area1";
    exploreSteps = 0;
    const areaSelect = document.getElementById('area-select');
    if (areaSelect) areaSelect.value = "area1";
    const area = areas["area1"];
    const dNameEl = document.getElementById('dungeon-name');
    if (dNameEl && area) {
        dNameEl.innerHTML = `🌲 ダンジョン：${area.name} <span id="explore-progress" style="font-size: 14px; font-weight: normal; color: #aaa;">(進行度: 0 / 100)</span>`;
    }

    calcStatus();
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    calcStatus();
    updateInventoryDisplay();
    updateGuildQuestUI();
    updateAchievementsUI();
    updateForgeUI();
    if (typeof updateChainAndBuffUI === "function") updateChainAndBuffUI();
    if (typeof updateJobMasterySpecUI === "function") updateJobMasterySpecUI();
    if (typeof renderEquipmentPresetsUI === "function") renderEquipmentPresetsUI();
    if (typeof updateCompendiumUI === "function") updateCompendiumUI();

    if (btn) {
        btn.innerText = "🗑️ データ初期化(最初から)";
        btn.style.background = "#a94442";
    }
    const statusEl = document.getElementById('autosave-status');
    if (statusEl) statusEl.innerText = `💾 データ初期化完了`;
    const logEl = document.getElementById('log');
    if (logEl) logEl.innerHTML = "";
    addLog(`🗑️ <b style="color:#00ffcc;">セーブデータを完全に初期化し、Lv.1「始まりの森」から再スタートしました！</b>`);

    // 0.3秒後に通常セーブ許可を再開
    setTimeout(() => {
        isResettingSave = false;
    }, 300);
}

// 4. 探索・戦闘ロジック（オート探索 ＋ 手動3スタンス ＋ 選択肢イベント ＋ クリックチャンス）
function toggleExplore() {
    const btn = document.getElementById('explore-btn');
    const area = areas[currentAreaId];
    if (isExploring) {
        isExploring = false; clearInterval(exploreInterval);
        clearAutoChance();
        btn.innerText = `🌲 ダンジョン探索を開始する（オート）`; btn.classList.remove('active');
        addLog(`探索を中断して <b>${area.town}</b> に戻りました。`);
    } else {
        closeManualEvent(); // 選択肢イベントが開いていれば閉じる
        isExploring = true; btn.innerText = "🛑 探索を中止して戻る"; btn.classList.add('active');
        addLog(`<b style='color: #00ffff;'>🚀 ${area.name} のオート探索を開始しました...</b>`);
        exploreInterval = setInterval(() => nextStep('auto'), exploreSpeed);
    }
}

// 通常ドロップ・通常採取時の修飾子抽選（エリアが深いほど高Tierが出やすくなる段階的な重み付け）
function rollRandomPrefix(areaOverride = null) {
    const areaNum = parseInt((areaOverride || currentAreaId || 'area1').replace('area', ''), 10) || 1;
    const r = Math.random();
    const tier5Chance = 0.0005 * areaNum; // エリア1: 0.05% 〜 エリア6: 0.3%
    const tier4Chance = 0.004 * areaNum;  // エリア1: 0.4%  〜 エリア6: 2.4%
    const tier3Chance = 0.03 + areaNum * 0.012; // エリア1: 4.2% 〜 エリア6: 10.2%
    let targetTier = 1;
    if (r < 0.18) targetTier = 0;      // 18%: 粗悪 (ボロボロの・錆びついた・湿った)
    else if (r < 0.64) targetTier = 1; // 46%: 一般 (普通の・軽い・硬い・尖った・温かい)
    else if (r < 1.0 - (tier3Chance + tier4Chance + tier5Chance)) targetTier = 2; // 良質
    else if (r < 1.0 - (tier4Chance + tier5Chance)) targetTier = 3; // 希少
    else if (r < 1.0 - tier5Chance) targetTier = 4; // 特級
    else targetTier = 5; // 伝説・神話

    const pool = Object.keys(PREFIX_DATA).filter(k => PREFIX_DATA[k].tier === targetTier);
    return pool[Math.floor(Math.random() * pool.length)];
}

// 良称号（Tier 2以上の良質〜神話級）を優先抽選するヘルパー（序盤エリアではTier4・5を抑え、深層ほど出やすくする）
function rollGoodPrefix(areaOverride = null) {
    const areaNum = parseInt((areaOverride || currentAreaId || 'area1').replace('area', ''), 10) || 1;
    const r = Math.random();
    const tier5Chance = 0.003 * areaNum; // エリア1: 0.3% 〜 エリア6: 1.8%
    const tier4Chance = 0.015 * areaNum; // エリア1: 1.5% 〜 エリア6: 9.0%
    const tier3Chance = 0.15 + areaNum * 0.03; // エリア1: 18% 〜 エリア6: 33%
    let targetTier = 2;
    if (r < 1.0 - (tier3Chance + tier4Chance + tier5Chance)) targetTier = 2; // 良質
    else if (r < 1.0 - (tier4Chance + tier5Chance)) targetTier = 3; // 希少
    else if (r < 1.0 - tier5Chance) targetTier = 4; // 特級
    else targetTier = 5; // 伝説・神話

    const pool = Object.keys(PREFIX_DATA).filter(k => PREFIX_DATA[k].tier === targetTier);
    return pool[Math.floor(Math.random() * pool.length)];
}

// --- 案④：オート探索中のリアルタイム・クリックチャンス制御 ---
function clearAutoChance() {
    autoChance = null;
    const box = document.getElementById('auto-chance-box');
    if (box) box.style.display = 'none';
}

function updateAutoChanceUI() {
    const box = document.getElementById('auto-chance-box');
    const btn = document.getElementById('auto-chance-btn');
    if (!box || !btn) return;
    if (!autoChance || autoChance.stepsLeft <= 0) {
        clearAutoChance();
        return;
    }
    box.style.display = 'block';
    btn.innerHTML = `${autoChance.label} <span style="font-size:12px;">(残り ${autoChance.stepsLeft} 歩)</span>`;
}

function stepAutoChance() {
    if (autoChance) {
        autoChance.stepsLeft--;
        if (autoChance.stepsLeft <= 0) {
            clearAutoChance();
        } else {
            updateAutoChanceUI();
        }
        return;
    }
    // 戦闘中や選択肢イベント中は新規発生させない（基本15%＋行軍熟練度に応じて最大35%まで上昇）
    const chanceRate = 0.15 + Math.min(0.20, (player.skills.autoWalk.level - 1) * 0.005);
    if (!enemy && !activeManualEvent && Math.random() < chanceRate) {
        const types = [
            { type: 'event', label: '✨ 【発見】謎の遺構を発見！クリックで選択肢イベントへ！' },
            { type: 'rare_enemy', label: '⚠️ 【気配】レアモンスターの気配！クリックで誘い出す！' },
            { type: 'rich_gather', label: '💎 【大鉱脈】高純度スポット発見！クリックで良称号素材を大量採取！' }
        ];
        const chosen = types[Math.floor(Math.random() * types.length)];
        autoChance = { type: chosen.type, label: chosen.label, stepsLeft: 5 };
        updateAutoChanceUI();
    }
}

function triggerAutoChance() {
    if (!autoChance) return;
    const chanceType = autoChance.type;
    clearAutoChance();
    const area = areas[currentAreaId];
    gainSkillExp('search', 3);

    if (chanceType === 'event') {
        if (isExploring) {
            // 選択肢をじっくり選べるようオート探索を一時停止
            isExploring = false; clearInterval(exploreInterval);
            const btn = document.getElementById('explore-btn');
            if (btn) { btn.innerText = `🌲 ダンジョン探索を開始する（オート）`; btn.classList.remove('active'); }
            addLog(`⏸️ <span style="color:#00ffcc;">遺構を調査するため、オート探索を一時停止しました。</span>`);
        }
        startManualEvent();
    } else if (chanceType === 'rare_enemy') {
        // 現エリアで最もweightが低い（レアな）モンスターを選出、または強化個体を出撃
        let sorted = [...area.monsters].sort((a, b) => (a.weight ?? 10) - (b.weight ?? 10));
        let m = sorted[0];
        const isRare = (m.weight !== undefined && m.weight <= 2);
        enemy = {
            name: isRare ? m.name : `★希少種・${m.name}`,
            hp: isRare ? m.hp : Math.floor(m.hp * 1.5),
            maxHp: isRare ? m.hp : Math.floor(m.hp * 1.5),
            atk: m.atk,
            def: m.def || 0,
            drops: m.drops,
            exp: (m.exp || Math.floor(m.hp / 2) + 10) * (isRare ? 1 : 3),
            eva: m.eva || 0,
            isBoss: false
        };
        addLog(`⚡ <b style="color:#ffcc00;">クリックチャンス成功！【${enemy.name}】を誘い出した！</b>`);
        updateDungeonStatusUI();
    } else if (chanceType === 'rich_gather') {
        const gatherList = area.gather || area.monsters[0].drops;
        let obtained = [];
        const gatherCount = 3 + (player.job === "レンジャー" ? 1 : 0);
        for (let i = 0; i < gatherCount; i++) {
            const g = gatherList[Math.floor(Math.random() * gatherList.length)];
            const prefix = rollGoodPrefix();
            const itemName = `${prefix}${g.item}`;
            player.inventory[itemName] = (player.inventory[itemName] || 0) + 1;
            obtained.push(`<span style="color:#00ffcc;">[${itemName}]</span>`);
        }
        // 大鉱脈クリック時は手動採取限定素材(manualGather)も1個確定獲得！
        if (area.manualGather && area.manualGather.length > 0) {
            const mg = area.manualGather[Math.floor(Math.random() * area.manualGather.length)];
            const mgName = `${rollGoodPrefix()}${mg.item}`;
            player.inventory[mgName] = (player.inventory[mgName] || 0) + 1;
            obtained.push(`<span style="color:#ffd700; font-weight:bold;">🔍[${mgName}]</span>`);
        }
        addLog(`💎 <b style="color:#ffcc00;">クリックチャンス成功！</b> 大鉱脈から ${obtained.join(' ')} を一気に採掘した！`);
        gainSkillExp('gathering', 4);
        gainSkillExp('blacksmith', 3);
        gainSkillExp('handicraft', 3);
        updateInventoryDisplay();
    }
}

// --- 案②：選択肢イベント（TRPG風ステータス・熟練度判定） ---
function closeManualEvent() {
    activeManualEvent = null;
    const box = document.getElementById('manual-event-box');
    if (box) box.style.display = 'none';
}

function startManualEvent() {
    const box = document.getElementById('manual-event-box');
    const titleEl = document.getElementById('manual-event-title');
    const descEl = document.getElementById('manual-event-desc');
    const choicesEl = document.getElementById('manual-event-choices');
    if (!box || !titleEl || !descEl || !choicesEl) return;

    const area = areas[currentAreaId];
    const areaNum = parseInt(currentAreaId.replace('area', ''), 10) || 1;
    const difficulty = areaNum * 12; // エリアが進むほど目標値が上昇
    // 探索熟練度ボーナス＆トレジャーシーカーのジョブ特性（+20%）
    const searchBonus = (player.skills.search.level - 1) * 2 + (player.job === "トレジャーシーカー" ? 20 : 0);
    const trapReduction = player.job === "レンジャー" ? 0.5 : 1.0;

    const eventTypes = ['chest', 'altar', 'vein', 'lair'];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    activeManualEvent = type;
    choicesEl.innerHTML = '';

    const addChoiceBtn = (label, bg, onClick) => {
        const b = document.createElement('button');
        b.style.background = bg;
        b.style.padding = '8px 10px';
        b.style.fontSize = '13px';
        b.style.marginBottom = '0';
        b.style.textAlign = 'left';
        b.innerHTML = label;
        b.onclick = () => {
            closeManualEvent();
            gainSkillExp('search', 3);
            onClick();
            calcStatus();
            updateInventoryDisplay();
        };
        choicesEl.appendChild(b);
    };

    if (type === 'chest') {
        const pickRate = Math.min(100, Math.max(20, Math.floor(55 + (player.stats.dex + player.skills.handicraft.level * 3 + searchBonus) - difficulty)));
        const bashRate = Math.min(100, Math.max(25, Math.floor(60 + (player.stats.str + player.skills.axe.level * 2 + player.skills.sword.level * 2 + searchBonus) - difficulty)));
        titleEl.innerHTML = `📦 いにしえの鍵付き宝箱を発見！`;
        descEl.innerHTML = `精巧な罠が仕掛けられた宝箱が眠っている。どう対処する？`;
        addLog(`📦 <b style="color:#00ffcc;">【分岐イベント】いにしえの鍵付き宝箱を発見した！</b>`);

        addChoiceBtn(`🔓 <b>精密ピッキングで開錠する</b> <span style="color:#ffd700;">[DEX・工作・探索Lv判定 / 成功率: ${pickRate}%]</span><br><span style="font-size:11px; color:#ddd;">成功：高品質称号素材×2 ＆ 経験値ボーナス ／ 失敗：罠ダメージ</span>`, '#007acc', () => {
            gainSkillExp('handicraft', 4);
            if (Math.random() * 100 <= pickRate) {
                const matPool = area.monsters.flatMap(m => m.drops.map(d => d.item));
                let gained = [];
                for (let i = 0; i < 2; i++) {
                    const baseMat = matPool[Math.floor(Math.random() * matPool.length)];
                    const item = `${rollGoodPrefix()}${baseMat}`;
                    player.inventory[item] = (player.inventory[item] || 0) + 1;
                    gained.push(`<span style="color:#ffaa00;">[${item}]</span>`);
                }
                const bonusExp = areaNum * 80;
                addLog(`🔓 <b style="color:#00ffcc;">開錠大成功！</b> 宝箱から ${gained.join(' ')} を獲得！(Exp+${bonusExp})`);
                gainExp(bonusExp);
            } else {
                const dmg = Math.max(1, Math.floor(player.maxHp * 0.15 * trapReduction));
                player.hp = Math.max(1, player.hp - dmg);
                gainSkillExp('evasion', 3);
                gainSkillExp('careful', 3);
                addLog(`💥 <span style="color:#ff6666;">開錠失敗！ 毒針の罠が作動し <b>${dmg}</b> ダメージを受けた… (回避・警戒・工作熟練度UP)</span>`);
            }
        });

        addChoiceBtn(`🗡️ <b>力ずくで叩き割る</b> <span style="color:#ffd700;">[STR・武器・探索Lv判定 / 成功率: ${bashRate}%]</span><br><span style="font-size:11px; color:#ddd;">成功：良称号素材×3 ＆ 武器・強行熟練度UP ／ 失敗：普通の素材×1のみ</span>`, '#a94442', () => {
            gainSkillExp(getEquippedWeaponType(), 4);
            gainSkillExp('rush', 3);
            const matPool = area.monsters.flatMap(m => m.drops.map(d => d.item));
            if (Math.random() * 100 <= bashRate) {
                let gained = [];
                for (let i = 0; i < 3; i++) {
                    const baseMat = matPool[Math.floor(Math.random() * matPool.length)];
                    const item = `${rollGoodPrefix()}${baseMat}`;
                    player.inventory[item] = (player.inventory[item] || 0) + 1;
                    gained.push(`<span style="color:#00ffcc;">[${item}]</span>`);
                }
                addLog(`🗡️ <b style="color:#00ffcc;">破壊成功！</b> 罠ごと粉砕し、中から ${gained.join(' ')} を回収した！`);
            } else {
                const baseMat = matPool[Math.floor(Math.random() * matPool.length)];
                player.inventory[baseMat] = (player.inventory[baseMat] || 0) + 1;
                addLog(`💦 力加減を誤り中身が少し砕けたが、<span style="color:#00ffcc;">[${baseMat}]</span>×1 を回収した。`);
            }
        });

        addChoiceBtn(`🚶 <b>罠を警戒して立ち去る</b> <span style="color:#88ff88;">[安全: 100%]</span><br><span style="font-size:11px; color:#ddd;">HP・MPを15%回復し、警戒・回避熟練度を獲得</span>`, '#444', () => {
            player.hp = Math.min(player.maxHp, player.hp + Math.max(1, Math.floor(player.maxHp * 0.15)));
            player.mp = Math.min(player.maxMp, player.mp + Math.max(1, Math.floor(player.maxMp * 0.15)));
            gainSkillExp('evasion', 3);
            gainSkillExp('careful', 4);
            addLog(`🚶 危険を察知して慎重に離れた。HP・MPが少し回復し、警戒・回避熟練度が上がった！`);
        });
    } else if (type === 'altar') {
        const readRate = Math.min(100, Math.max(25, Math.floor(55 + (player.stats.int + player.skills.magic.level * 3 + searchBonus) - difficulty)));
        titleEl.innerHTML = `⛩️ 神秘の魔力祭壇を発見！`;
        descEl.innerHTML = `淡い光を放つ古代の祭壇がある。魔力の文字が刻まれているようだ。`;
        addLog(`⛩️ <b style="color:#00ffcc;">【分岐イベント】神秘の魔力祭壇を発見した！</b>`);

        addChoiceBtn(`🔮 <b>古代文字を解読して魔力を吸収する</b> <span style="color:#ffd700;">[INT・魔法・探索Lv判定 / 成功率: ${readRate}%]</span><br><span style="font-size:11px; color:#ddd;">成功：MP全快 ＆ 魔法・4属性熟練度大幅UP ＆ 経験値 ／ 失敗：魔力逆流ダメージ</span>`, '#007acc', () => {
            if (Math.random() * 100 <= readRate) {
                player.mp = player.maxMp;
                gainSkillExp('magic', 6);
                gainSkillExp('fireMagic', 4);
                gainSkillExp('waterMagic', 4);
                gainSkillExp('windMagic', 4);
                gainSkillExp('earthMagic', 4);
                const bonusExp = areaNum * 100;
                gainExp(bonusExp);
                addLog(`🔮 <b style="color:#00ffcc;">解読大成功！</b> 古代の知識が流れ込み、MP全快＆全魔法熟練度が大幅上昇した！(Exp+${bonusExp})`);
            } else {
                const dmg = Math.max(1, Math.floor(player.maxHp * 0.1 * trapReduction));
                player.hp = Math.max(1, player.hp - dmg);
                gainSkillExp('magic', 3);
                addLog(`⚡ <span style="color:#ff6666;">魔力が暴走して <b>${dmg}</b> ダメージを受けたが、魔法熟練度が少し上がった！</span>`);
            }
        });

        addChoiceBtn(`🙏 <b>静かに祈りを捧げる</b> <span style="color:#88ff88;">[安全: 100%]</span><br><span style="font-size:11px; color:#ddd;">HPとMPを50%回復し、警戒熟練度を獲得</span>`, '#3c763d', () => {
            player.hp = Math.min(player.maxHp, player.hp + Math.floor(player.maxHp * 0.5));
            player.mp = Math.min(player.maxMp, player.mp + Math.floor(player.maxMp * 0.5));
            gainSkillExp('careful', 3);
            addLog(`🙏 祭壇の加護により、HPとMPが50%回復した！(警戒熟練度UP)`);
        });
    } else if (type === 'vein') {
        const craftLvSum = player.skills.blacksmith.level + player.skills.handicraft.level + player.skills.sewing.level + player.skills.gathering.level;
        const mineRate = Math.min(100, Math.max(30, Math.floor(55 + (player.stats.dex + craftLvSum * 2 + searchBonus) - difficulty)));
        titleEl.innerHTML = `💎 輝く希少鉱脈・群生地を発見！`;
        descEl.innerHTML = `手つかずの高品質な素材や【🔍手動採取限定素材】が集まっているスポットを見つけた！`;
        addLog(`💎 <b style="color:#00ffcc;">【分岐イベント】輝く希少鉱脈・群生地を発見した！</b>`);

        addChoiceBtn(`⛏️ <b>職人の技で深部まで掘り出す</b> <span style="color:#ffd700;">[DEX・採取・生産熟練度判定 / 成功率: ${mineRate}%]</span><br><span style="font-size:11px; color:#ddd;">成功：🔍手動採取限定素材×2個 ＋ 良称号素材×3個 ／ 失敗：🔍手動採取限定×1個 ＋ 通常素材×2個</span>`, '#007acc', () => {
            gainSkillExp('gathering', 5);
            gainSkillExp('blacksmith', 4);
            gainSkillExp('handicraft', 4);
            gainSkillExp('sewing', 4);
            const gatherList = area.gather || area.monsters[0].drops;
            const manualList = area.manualGather || gatherList;
            if (Math.random() * 100 <= mineRate) {
                let gained = [];
                // 手動採取限定素材を2個確定獲得！
                for (let i = 0; i < 2; i++) {
                    const mg = manualList[Math.floor(Math.random() * manualList.length)];
                    const mItem = `${rollGoodPrefix()}${mg.item}`;
                    player.inventory[mItem] = (player.inventory[mItem] || 0) + 1;
                    gained.push(`<span style="color:#ffd700; font-weight:bold;">🔍[${mItem}]</span>`);
                }
                const count = 3 + (player.job === "レンジャー" ? 1 : 0);
                for (let i = 0; i < count; i++) {
                    const g = gatherList[Math.floor(Math.random() * gatherList.length)];
                    const item = `${rollGoodPrefix()}${g.item}`;
                    player.inventory[item] = (player.inventory[item] || 0) + 1;
                    gained.push(`<span style="color:#00ffcc;">[${item}]</span>`);
                }
                addLog(`⛏️ <b style="color:#00ffcc;">採掘大成功！</b> 鮮やかな手つきで ${gained.join(' ')} を掘り当てた！`);
            } else {
                let gained = [];
                const mg = manualList[Math.floor(Math.random() * manualList.length)];
                player.inventory[mg.item] = (player.inventory[mg.item] || 0) + 1;
                gained.push(`<span style="color:#ffd700; font-weight:bold;">🔍[${mg.item}]</span>`);
                for (let i = 0; i < 2; i++) {
                    const g = gatherList[Math.floor(Math.random() * gatherList.length)];
                    player.inventory[g.item] = (player.inventory[g.item] || 0) + 1;
                    gained.push(`<span style="color:#00ffcc;">[${g.item}]</span>`);
                }
                addLog(`⛏️ 深部は崩れてしまったが、${gained.join(' ')} を確保した！(採取・生産熟練度UP)`);
            }
        });

        addChoiceBtn(`🌿 <b>表面の希少素材を丁寧に採取して調理する</b> <span style="color:#88ff88;">[安全: 100%]</span><br><span style="font-size:11px; color:#ddd;">🔍手動採取限定素材×1個 ＋ 良称号素材×2個を獲得 ＆ 採取・調理熟練度UP・HP回復</span>`, '#3c763d', () => {
            const gatherList = area.gather || area.monsters[0].drops;
            const manualList = area.manualGather || gatherList;
            let gained = [];
            const mg = manualList[Math.floor(Math.random() * manualList.length)];
            const mItem = `${rollGoodPrefix()}${mg.item}`;
            player.inventory[mItem] = (player.inventory[mItem] || 0) + 1;
            gained.push(`<span style="color:#ffd700; font-weight:bold;">🔍[${mItem}]</span>`);

            const count = 2 + (player.job === "レンジャー" ? 1 : 0);
            for (let i = 0; i < count; i++) {
                const g = gatherList[Math.floor(Math.random() * gatherList.length)];
                const item = `${rollGoodPrefix()}${g.item}`;
                player.inventory[item] = (player.inventory[item] || 0) + 1;
                gained.push(`<span style="color:#00ffcc;">[${item}]</span>`);
            }
            gainSkillExp('gathering', 4);
            gainSkillExp('cooking', 5);
            player.hp = Math.min(player.maxHp, player.hp + Math.floor(player.maxHp * 0.2));
            addLog(`🌿 ${gained.join(' ')} を採取し、野営食を作って一息ついた！(HP20%回復・採取＆調理熟練度UP)`);
        });
    } else {
        const ambushRate = Math.min(100, Math.max(30, Math.floor(60 + (player.stats.agi + player.stats.dex + player.skills.evasion.level * 2 + player.skills.rush.level * 2 + searchBonus) - difficulty)));
        titleEl.innerHTML = `⚠️ 強敵の縄張りに遭遇！`;
        descEl.innerHTML = `奥から並外れた魔力を持つモンスターの気配がする…！`;
        addLog(`⚠️ <b style="color:#ffcc00;">【分岐イベント】強敵の縄張りを発見した！</b>`);

        addChoiceBtn(`⚡ <b>先制奇襲をかける</b> <span style="color:#ffd700;">[AGI・DEX・強行Lv判定 / 成功率: ${ambushRate}%]</span><br><span style="font-size:11px; color:#ddd;">レア敵またはエリート個体と交戦！成功時は敵HPを35%削った状態で開始！</span>`, '#a94442', () => {
            gainSkillExp('rush', 4);
            let sorted = [...area.monsters].sort((a, b) => (a.weight ?? 10) - (b.weight ?? 10));
            let m = sorted[0];
            const isRare = (m.weight !== undefined && m.weight <= 2);
            const maxHp = isRare ? m.hp : Math.floor(m.hp * 1.5);
            enemy = {
                name: isRare ? m.name : `★精鋭・${m.name}`,
                hp: maxHp,
                maxHp: maxHp,
                atk: m.atk,
                def: m.def || 0,
                drops: m.drops,
                exp: (m.exp || Math.floor(m.hp / 2) + 10) * (isRare ? 1 : 3),
                eva: m.eva || 0,
                isBoss: false
            };
            if (Math.random() * 100 <= ambushRate) {
                const ambushDmg = Math.max(1, Math.floor(enemy.maxHp * 0.35));
                enemy.hp = Math.max(1, enemy.hp - ambushDmg);
                gainSkillExp(getEquippedWeaponType(), 4);
                addLog(`⚡ <b style="color:#00ffcc;">奇襲大成功！</b> 【${enemy.name}】に先制で <b>${ambushDmg}</b> ダメージを与えて戦闘開始！`);
            } else {
                addLog(`⚔️ 奇襲は気づかれた！【${enemy.name}】との戦闘に突入！`);
            }
            updateDungeonStatusUI();
        });

        addChoiceBtn(`🍃 <b>抜け道を使って一気に進む</b> <span style="color:#88ff88;">[安全: 100%]</span><br><span style="font-size:11px; color:#ddd;">戦闘を避け、ダンジョン進行度を +5歩 進める（警戒・回避熟練度UP）</span>`, '#444', () => {
            exploreSteps = Math.min(99, exploreSteps + 5);
            updateExploreProgress();
            gainSkillExp('evasion', 3);
            gainSkillExp('careful', 4);
            addLog(`🍃 抜け道を通って強敵をやり過ごし、進行度が一気に <b>+5歩</b> 進んだ！(警戒・回避熟練度UP)`);
        });
    }

    box.style.display = 'block';
}

// --- 案①：3つの手動探索アクション（慎重・強行・集中） ---
function manualExplore(mode) {
    if (activeManualEvent) {
        addLog(`<span style="color:#ffaa00;">⚠️ 先に発生中のイベントの選択肢を選んでください！</span>`);
        return;
    }

    // MP消費チェック（深淵の踏破者・万象の覇王は0、ベルセルクの強行突破は1、熟練度Lv25以上は2、通常は3）
    let mpCost = 0;
    if (mode === 'rush' || mode === 'focus') {
        if (player.job === "深淵の踏破者" || player.job === "万象の覇王") {
            mpCost = 0;
        } else if (mode === 'rush' && player.job === "ベルセルク") {
            mpCost = 1;
        } else if ((mode === 'rush' && player.skills.rush.level >= 25) || (mode === 'focus' && player.skills.search.level >= 25)) {
            mpCost = 2;
        } else {
            mpCost = 3;
        }
    }
    if (mpCost > 0 && player.mp < mpCost) {
        addLog(`<span style="color:#ffaa00;">⚠️ MPが足りません！（必要MP: ${mpCost} / 現在MP: ${player.mp}。「👣 慎重に進む」等でMPを回復できます）</span>`);
        return;
    }
    if (mpCost > 0) {
        player.mp -= mpCost;
    }

    // 手動アクションごとの専用熟練度を獲得！
    if (mode === 'careful') gainSkillExp('careful', 2);
    if (mode === 'rush') gainSkillExp('rush', 2);
    if (mode === 'focus') gainSkillExp('search', 2);

    nextStep(mode);
}

function nextStep(mode = 'auto') {
    if (player.hp <= 0) {
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        exploreSteps = 0;
        player.battleChain = 0;
        if (typeof updateChainAndBuffUI === "function") updateChainAndBuffUI();
        updateExploreProgress();
        addLog("<span style='color: #ff4444;'>💀 力尽きて町に運ばれました。連戦チェインが途切れた...。全回復して再開します。</span>");
        calcStatus();
        return;
    }

    // 🧪 修練料理・霊薬バフの歩数消化
    if (player.trainingBuff && player.trainingBuff.steps > 0) {
        player.trainingBuff.steps--;
        if (player.trainingBuff.steps <= 0) {
            addLog(`🧪 <span style="color: #ffaa00;">【修練効果終了】<b>${player.trainingBuff.name}</b> の効果が切れました。</span>`);
            player.trainingBuff = { name: null, steps: 0, jlvExpMult: 1.0, skillExpMult: 1.0 };
        }
        if (typeof updateChainAndBuffUI === "function") updateChainAndBuffUI();
    }

    // ピンチ時（HP35%以下）にインベントリの回復アイテムを自動使用
    if (player.hp <= player.maxHp * 0.35) {
        const autoHealTargets = ["特製薬草スープ", "妖精の蜜酒", "沼地キノコの魔力シチュー", "マンドラゴラ絶叫薬", "上級薬草ポーション", "神々の万能祝宴薬"];
        for (const itemName of Object.keys(player.inventory)) {
            if (player.inventory[itemName] > 0 && autoHealTargets.some(t => itemName.includes(t))) {
                useItem(itemName, true);
                break;
            }
        }
    }

    // パッシブスキル＆隠しジョブ＆交換所秘宝アクセサリの効果：毎ターン自動回復
    if (player.passiveSkills.includes("聖なる祈り") && player.hp < player.maxHp) {
        const healAmount = Math.max(1, Math.floor(player.maxHp * 0.05));
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
    }
    if (player.passiveSkills.includes("不撓不屈") || player.job === "パラディン") {
        player.hp = Math.min(player.maxHp, player.hp + Math.max(1, Math.floor(player.maxHp * 0.03)));
        player.mp = Math.min(player.maxMp, player.mp + Math.max(1, Math.floor(player.maxMp * 0.03)));
    }
    if (player.job === "ゴッドハンド" && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + Math.max(1, Math.floor(player.maxHp * 0.05)));
    }
    if (hasEquippedSpecial("racco_bounty")) {
        player.hp = Math.min(player.maxHp, player.hp + Math.max(1, Math.floor(player.maxHp * 0.02)));
        player.mp = Math.min(player.maxMp, player.mp + Math.max(1, Math.floor(player.maxMp * 0.02)));
    }
    if (hasEquippedSpecial("hydra_venom") && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + Math.max(1, Math.floor(player.maxHp * 0.04)));
    }

    // 手動「慎重に進む / 堅実攻撃」はHP5%・MP10%回復＋警戒熟練度に応じた追加回復ボーナス
    if (mode === 'careful') {
        const carefulBonusHp = Math.floor((player.skills.careful.level - 1) * 0.5);
        const carefulBonusMp = Math.floor((player.skills.careful.level - 1) * 0.3);
        player.hp = Math.min(player.maxHp, player.hp + Math.max(1, Math.floor(player.maxHp * 0.05)) + carefulBonusHp);
        player.mp = Math.min(player.maxMp, player.mp + Math.max(2, Math.floor(player.maxMp * 0.10)) + carefulBonusMp);
    } else if (mode === 'auto') {
        // オート探索時は毎ステップ「行軍(放置)熟練度」を獲得し、行軍Lvに応じてHP/MP自然回復＆クリックチャンス更新
        gainSkillExp('autoWalk', 1);
        const autoMpRegen = 1 + Math.floor(player.skills.autoWalk.level / 15);
        const autoHpRegen = Math.floor(player.skills.autoWalk.level / 10);
        player.mp = Math.min(player.maxMp, player.mp + autoMpRegen);
        if (autoHpRegen > 0 && player.hp < player.maxHp) {
            player.hp = Math.min(player.maxHp, player.hp + autoHpRegen);
        }
        stepAutoChance();
    }

    if (!enemy) {
        // 強行突破時は2〜3歩進む（強行Lv30以上で3〜4歩に強化！獄炎竜の逆鱗アミュレット装備時はさらに+1歩！）
        let stepAdd = 1;
        if (mode === 'rush') {
            const minStep = (player.skills.rush.level >= 30 ? 3 : 2) + (hasEquippedSpecial("inferno_counter") ? 1 : 0);
            stepAdd = Math.random() < 0.5 ? minStep : minStep + 1;
            const nextBossStep = Math.ceil((exploreSteps + 1) / 100) * 100;
            if (exploreSteps < nextBossStep && exploreSteps + stepAdd > nextBossStep) {
                stepAdd = nextBossStep - exploreSteps;
            }
        }
        exploreSteps += stepAdd;
        updateExploreProgress();
        const area = areas[currentAreaId];
        
        // 100ステップごとにボスに遭遇
        if (exploreSteps % 100 === 0 && area.boss) {
            const b = area.boss;
            enemy = { name: b.name, hp: b.hp, maxHp: b.hp, atk: b.atk, def: b.def || 0, drops: b.drops, exp: b.exp, eva: b.eva, isBoss: true };
            addLog(`🚨 <b style="color: #ff0000;">警告！ ダンジョンの奥地でボス【${enemy.name}】に遭遇した！</b>`);
            calcStatus();
            return;
        }

        // 手動探索限定：選択肢イベント（案②）の発生判定（探索熟練度Lvごとにさらに発生率UP！）
        if (mode !== 'auto') {
            const searchEventBonus = Math.min(0.15, (player.skills.search.level - 1) * 0.005);
            const eventChance = (mode === 'focus' ? 0.35 : (mode === 'careful' ? 0.25 : 0.15)) + searchEventBonus;
            if (Math.random() < eventChance) {
                startManualEvent();
                calcStatus();
                return;
            }
        }

        // モンスター遭遇率（強行:80%, オート/慎重:60%, 集中:30%）
        const encounterRate = mode === 'rush' ? 0.80 : (mode === 'focus' ? 0.30 : 0.60);
        if (Math.random() < encounterRate) {
            // 強行突破時はレアモンスター（weightが低い敵）の出現ウェイトを3倍に引き上げる！
            const getEffectiveWeight = (m) => {
                const baseW = m.weight !== undefined ? m.weight : 10;
                return (mode === 'rush' && baseW <= 2) ? baseW * 3 : baseW;
            };
            const totalWeight = area.monsters.reduce((sum, m) => sum + getEffectiveWeight(m), 0);
            let rand = Math.random() * totalWeight;
            let m = area.monsters[0];
            for (const mon of area.monsters) {
                const w = getEffectiveWeight(mon);
                if (rand < w) { m = mon; break; }
                rand -= w;
            }
            enemy = { name: m.name, hp: m.hp, maxHp: m.hp, atk: m.atk, def: m.def || 0, drops: m.drops, exp: m.exp, eva: m.eva, isBoss: false };
            const rushTag = mode === 'rush' ? ` <span style="color:#ffaa00;">(強行突破: +${stepAdd}歩)</span>` : '';
            addLog(`⚔️ <b>${enemy.name}</b> が現れた！${rushTag}`);
        } 
        // 敵が出なかった場合、採取イベント（集中探索時は85%の確率で発生＆採取熟練度に応じて複数個採集・良称号率UP！）
        else if (area.gather && Math.random() < (mode === 'focus' ? 0.85 : 0.50)) {
            gainSkillExp('gathering', mode === 'focus' ? 3 : 2);
            let rand = Math.random();
            let gatheredItem = area.gather[0].item;
            for (const g of area.gather) {
                if (rand < g.rate) { gatheredItem = g.item; break; }
                rand -= g.rate;
            }
            
            const goodPrefixBonus = Math.min(0.30, (player.skills.gathering.level - 1) * 0.01);
            let prefix = "";
            if (mode === 'focus') {
                // 集中探索：60%＋採取熟練度ボーナスの高確率で良称号を付与
                if (Math.random() < (0.60 + goodPrefixBonus)) prefix = rollGoodPrefix();
            } else if (Math.random() < (0.20 + goodPrefixBonus)) {
                prefix = rollGoodPrefix();
            } else if (Math.random() < 0.35) {
                prefix = rollRandomPrefix();
            }
            
            // 採取熟練度・レンジャー特性・大地の恵み・森精ラッコの豊穣お守りによる複数個獲得判定
            let count = 1
                + (player.job === "レンジャー" ? 1 : 0)
                + (player.passiveSkills.includes("大地の恵み") ? 1 : 0)
                + (hasEquippedSpecial("racco_bounty") ? 1 : 0);
            if (Math.random() < Math.min(0.80, (player.skills.gathering.level - 1) * 0.03)) {
                count++;
            }

            const itemName = `${prefix}${gatheredItem}`;
            player.inventory[itemName] = (player.inventory[itemName] || 0) + count;
            
            const focusTag = mode === 'focus' ? '🔍 <b>[集中探索]</b> ' : '🌿 探索中... ';
            const countText = count > 1 ? ` ×<b>${count}</b>` : '';
            let manualBonusLog = '';

            // 手動探索時限定：追加で【🔍手動採取限定素材 (area.manualGather)】を発見するチャンス！
            if (mode !== 'auto' && area.manualGather && area.manualGather.length > 0) {
                const manualChance = (mode === 'focus' ? 0.50 : 0.25) + Math.min(0.30, (player.skills.gathering.level - 1) * 0.015);
                if (Math.random() < manualChance) {
                    let mRand = Math.random();
                    let mGathered = area.manualGather[0].item;
                    for (const mg of area.manualGather) {
                        if (mRand < mg.rate) { mGathered = mg.item; break; }
                        mRand -= mg.rate;
                    }
                    const mPrefix = Math.random() < (0.40 + goodPrefixBonus) ? rollGoodPrefix() : '';
                    const mFull = `${mPrefix}${mGathered}`;
                    const mCount = 1
                        + (player.job === "レンジャー" ? 1 : 0)
                        + (player.passiveSkills.includes("大地の恵み") ? 1 : 0)
                        + (hasEquippedSpecial("racco_bounty") ? 1 : 0);
                    player.inventory[mFull] = (player.inventory[mFull] || 0) + mCount;
                    manualBonusLog = `<br>✨ <b style="color:#ffd700;">【手動採取限定発見！】</b> さらに希少素材 <span style="color:#00ffcc; font-weight:bold;">[${mFull}]</span>${mCount > 1 ? ` ×<b>${mCount}</b>` : ''} を見つけた！`;
                }
            }

            // ドワーフ王の黄金歯車：採取時にも交換Ptを採掘！
            if (hasEquippedSpecial("dwarven_gear")) {
                const areaNum = parseInt(currentAreaId.replace('area', ''), 10) || 1;
                const gearPt = areaNum * 2;
                player.exchangePoints = (player.exchangePoints || 0) + gearPt;
                manualBonusLog += ` <span style="color:#ffd700;">(⚙️黄金歯車: +${gearPt}Pt)</span>`;
            }

            addLog(`${focusTag}素材 <span style="color: #00ffcc;">[${itemName}]</span>${countText} を採集した！(採取熟練度UP)${manualBonusLog}`);
            checkQuestProgress('gather', itemName, count);
            checkAchievements();
            updateInventoryDisplay();
        } 
        // 何も起きない
        else {
            if (!player.statsTrack) player.statsTrack = { totalSteps: 0, totalKills: 0, bossKills: 0, craftCount: 0, totalCrits: 0 };
            player.statsTrack.totalSteps = (player.statsTrack.totalSteps || 0) + stepAdd;
            if (mode !== 'auto') {
                checkQuestProgress('walk', null, stepAdd);
            }
            checkAchievements();

            if (mode === 'careful') {
                addLog("👣 慎重に周囲を警戒しながら1歩進んだ。(HP・MP微回復 / 警戒熟練度UP)");
            } else if (mode === 'rush') {
                addLog(`⚔️ 強行突破で一気に <b>+${stepAdd}歩</b> 駆け抜けた！(強行熟練度UP)`);
            } else if (mode === 'focus') {
                addLog("🔍 周囲をくまなく調査しながら進んだ。(探索熟練度UP)");
            } else {
                addLog("🌲 探索中... 周囲は静かだ。(行軍熟練度UP)");
            }
        }
        calcStatus();
    } else {
        // 敵撃破時の報酬・図鑑登録・ドロップ処理を共通化
        const handleEnemyVictory = () => {
            recordMonsterKill(enemy.name);
            if (!player.statsTrack) player.statsTrack = { totalSteps: 0, totalKills: 0, bossKills: 0, craftCount: 0, totalCrits: 0 };
            player.statsTrack.totalKills = (player.statsTrack.totalKills || 0) + 1;
            if (enemy.isBoss) player.statsTrack.bossKills = (player.statsTrack.bossKills || 0) + 1;
            checkQuestProgress('defeat', enemy.name, 1);
            checkAchievements();

            let dropMsg = "";
            let rareDropLogs = [];
            // 集中・急所狙い時はドロップ率ボーナス+50%＆良称号率アップ！
            const effectiveDropBonus = player.dropRateBonus + (mode === 'focus' ? 50 : 0);
            const luckyStarBonus = player.passiveSkills.includes("幸運の星") ? 0.20 : 0;
            if (enemy.drops) {
                enemy.drops.forEach(drop => {
                    if (Math.random() < drop.rate * (effectiveDropBonus / 100)) {
                        const isUltraRare = !!drop.isUltraRare;
                        const isRareDrop = !isUltraRare && (drop.isRare || drop.rate <= 0.05);
                        let prefix = "";
                        if (isUltraRare) {
                            const highPool = Object.keys(PREFIX_DATA).filter(k => PREFIX_DATA[k].tier >= 3);
                            prefix = highPool[Math.floor(Math.random() * highPool.length)];
                        } else if (isRareDrop && Math.random() < (0.60 + luckyStarBonus)) {
                            prefix = rollGoodPrefix();
                        } else if (mode === 'focus' && Math.random() < (0.45 + luckyStarBonus)) {
                            prefix = rollGoodPrefix();
                        } else if (Math.random() < (0.30 + luckyStarBonus)) {
                            prefix = rollRandomPrefix();
                        }
                        const itemName = `${prefix}${drop.item}`;
                        if (!player.inventory[itemName]) player.inventory[itemName] = 0;
                        player.inventory[itemName]++;
                        if (isUltraRare) {
                            dropMsg += ` <span style="color: #ff66ff; font-weight: bold;">🌈💎[${itemName}]</span>`;
                            rareDropLogs.push(`🌈💎✨ <b style="color:#fff; background:linear-gradient(90deg, #990099, #cc6600, #008888); border:1px solid #ffd700; padding:2px 8px; border-radius:4px;">【ULTRA RARE DROP!! (基礎確率${(drop.rate * 100).toFixed(1)}%)】</b> <b>${enemy.name}</b> から幻の激レア秘宝 <span style="color:#ff88ff; font-weight:bold;">[${itemName}]</span> を奇跡的に引き当てた！！！`);
                        } else if (isRareDrop) {
                            dropMsg += ` <span style="color: #ffd700; font-weight: bold;">🌟[${itemName}]</span>`;
                            rareDropLogs.push(`🌟✨ <b style="color:#ffd700; background:#4d3800; border:1px solid #ffd700; padding:1px 6px; border-radius:4px;">【RARE DROP!! (基礎確率${Math.round(drop.rate * 100)}%)】</b> <b>${enemy.name}</b> から希少素材 <span style="color:#00ffcc; font-weight:bold;">[${itemName}]</span> を引き当てた！！`);
                        } else {
                            dropMsg += ` <span style="color: #ffaa00;">[${itemName}]</span>`;
                        }
                    }
                });
            }
            // ドワーフ王の黄金歯車：敵撃破時にエリアに応じた交換Ptを獲得！
            let gearVictoryTag = "";
            if (hasEquippedSpecial("dwarven_gear")) {
                const areaNum = parseInt(currentAreaId.replace('area', ''), 10) || 1;
                const gearPt = (enemy.isBoss ? areaNum * 15 : areaNum * 2);
                player.exchangePoints = (player.exchangePoints || 0) + gearPt;
                gearVictoryTag = ` <span style="color:#ffd700;">(⚙️黄金歯車: +${gearPt}Pt)</span>`;
            }
            const wasBoss = !!enemy.isBoss;
            if (wasBoss) {
                addLog(`🎉 <b style="color: #ff00ff;">ボス【${enemy.name}】を討伐した！</b> 素材${dropMsg} を手に入れた！${gearVictoryTag}`);
                exploreSteps = 0; updateExploreProgress(); // ボス撃破で進行度リセット（次の層へ）
            } else {
                if (dropMsg !== "") addLog(`🎉 <b>${enemy.name}</b> を倒した！ 素材${dropMsg} を手に入れた！${gearVictoryTag}`);
                else addLog(`🎉 <b>${enemy.name}</b> を倒した！ しかし何も落とさなかった。${gearVictoryTag}`);
            }
            // 連戦チェイン加算＆UI更新
            player.battleChain = (player.battleChain || 0) + 1;
            const chainBonusPct = Math.min(100, player.battleChain * 2);
            if (player.battleChain % 10 === 0 || player.battleChain === 5 || player.battleChain === 50) {
                addLog(`🔥 <b style="color: #ffaa00;">【連戦チェイン ${player.battleChain} CHAIN!!】</b> JLV＆熟練度獲得倍率 <b style="color: #88ff88;">+${chainBonusPct}%</b> 継続中！`);
            }
            if (typeof updateChainAndBuffUI === "function") updateChainAndBuffUI();

            rareDropLogs.forEach(rLog => addLog(rLog));
            
            const expGained = enemy.exp !== undefined ? enemy.exp : Math.floor(enemy.maxHp / 2) + 10;
            enemy = null;
            updateInventoryDisplay();
            checkSecretSkills(); // レア素材ドロップやステータス条件による解放判定
            gainExp(expGained);
            if (wasBoss) saveGame(false); // ボス撃破時に自動セーブ
        };

        let dmgToEnemy = Math.max(1, isNaN(player.atk) ? 10 : player.atk);
        let triggeredSkill = null;
        // 強行突破（強襲攻撃）時は獲得熟練度1.5倍
        const skillExpMult = mode === 'rush' ? 1.5 : 1.0;
        
        // 装備している武器の種類を判定
        const weaponType = getEquippedWeaponType();
        const jmEff = getCurrentJobMasteryEffects();
        
        const subJobCombat = typeof getSubJobBonus === "function" ? getSubJobBonus() : {};
        const skSynergyCombat = typeof getSkillSynergyEffects === "function" ? getSkillSynergyEffects() : {};
        const skEffCombatPre = getSkillMilestoneEffects();

        // アクティブスキルの事前抽選（集中時は2倍、星詠みの賢者は1.3倍、刀神は1.25倍、オメガ・オーバークロッカーは1.2倍、自律機巧の歯車輪は1.15倍、セット効果、シナジー、サブジョブ、職能特化補正！）
        const triggerBoost = (mode === 'focus' ? 2.0 : 1.0)
            * (player.job === "星詠みの賢者" ? 1.3 : 1.0)
            * (player.job === "刀神" ? 1.25 : 1.0)
            * (hasEquippedSpecial("omega_overclock") ? 1.20 : 1.0)
            * (hasEquippedSpecial("automaton_core") ? 1.15 : 1.0)
            * (1.0 + ((typeof getEquipmentSetBonusValue === "function" ? getEquipmentSetBonusValue("skillTrigger") : 0) / 100))
            * (1.0 + (subJobCombat.skillTriggerMult || 0))
            * (1.0 + ((skSynergyCombat.skillRate || 0) / 100))
            * (1.0 + ((skEffCombatPre.skillRate || 0) / 100))
            * (1.0 + (jmEff.skillTrigger || 0) / 100);
        for (const skillId of player.activeSkills) {
            const skillData = ACTIVE_SKILLS[skillId];
            if (skillData && Math.random() < skillData.triggerRate * triggerBoost) {
                triggeredSkill = skillData;
                break; // 1ターンに1つだけ発動
            }
        }

        // 命中判定 (集中・急所狙い時は命中+15%＋探索Lvボーナス、百歩穿楊発動時はさらに命中+50%)
        const focusHitBonus = mode === 'focus' ? (15 + Math.floor((player.skills?.search?.level || 1) / 2)) : 0;
        const snipeHitBonus = (triggeredSkill && triggeredSkill.name === "百歩穿楊") ? 50 : 0;
        const baseHit = isNaN(player.hitRate) ? 95 : player.hitRate;
        const rawHitChance = baseHit + focusHitBonus + snipeHitBonus - (enemy.eva || 0);
        const hitChance = Math.max(5, Math.min(100, isNaN(rawHitChance) ? 95 : rawHitChance));
        if (Math.random() * 100 <= hitChance) {
            const isMagicAttack = (triggeredSkill && triggeredSkill.useMatk) || (!triggeredSkill && weaponType === 'magic');

            if (triggeredSkill) {
                // 破城槌は ATK + DEF×1.5 を基礎威力として計算！
                let baseStat = triggeredSkill.useMatk ? player.matk : player.atk;
                if (triggeredSkill.name === "破城槌") {
                    baseStat = player.atk + Math.floor(player.def * 1.5);
                }
                dmgToEnemy = Math.floor(baseStat * triggeredSkill.damageMultiplier);
                // パッシブスキルの効果適用
                if ((triggeredSkill.name === "魔法剣" || triggeredSkill.name === "次元斬") && player.passiveSkills.includes("魔法剣強化")) {
                    dmgToEnemy = Math.floor(dmgToEnemy * 1.3); // 魔法剣・次元斬の威力をさらに1.3倍に
                }
                // 4属性魔法および複合奥義の熟練度倍率
                if (triggeredSkill.name === "ファイアボール") dmgToEnemy = Math.floor(dmgToEnemy * (1 + (player.skills.fireMagic.level - 1) * 0.03));
                if (triggeredSkill.name === "ウォーターボール") dmgToEnemy = Math.floor(dmgToEnemy * (1 + (player.skills.waterMagic.level - 1) * 0.03));
                if (triggeredSkill.name === "ウィンドカッター") dmgToEnemy = Math.floor(dmgToEnemy * (1 + (player.skills.windMagic.level - 1) * 0.03));
                if (triggeredSkill.name === "アーススパイク") dmgToEnemy = Math.floor(dmgToEnemy * (1 + (player.skills.earthMagic.level - 1) * 0.03));
                if (triggeredSkill.name === "メテオストライク") dmgToEnemy = Math.floor(dmgToEnemy * (1 + ((player.skills.fireMagic.level - 1) + (player.skills.earthMagic.level - 1)) * 0.02));
                if (triggeredSkill.name === "コキュートス") dmgToEnemy = Math.floor(dmgToEnemy * (1 + ((player.skills.waterMagic.level - 1) + (player.skills.windMagic.level - 1)) * 0.02));
                if (triggeredSkill.name === "エレメンタルバースト") {
                    const totalElemLv = (player.skills.fireMagic.level - 1) + (player.skills.waterMagic.level - 1) + (player.skills.windMagic.level - 1) + (player.skills.earthMagic.level - 1);
                    dmgToEnemy = Math.floor(dmgToEnemy * (1 + totalElemLv * 0.015));
                }
                if (triggeredSkill.name === "ラグナロク") {
                    const ragnarokLv = (player.skills.spear.level - 1) + (player.skills.fireMagic.level - 1);
                    dmgToEnemy = Math.floor(dmgToEnemy * (1 + ragnarokLv * 0.02));
                }
            } else if (weaponType === 'magic') {
                // 杖や魔術書による通常攻撃は MATK 依存になる！
                dmgToEnemy = player.matk;
            }

            // 🔮 深淵魔術セット効果：全魔法スキル威力UP
            if (isMagicAttack) {
                const setMagicDmg = (typeof getEquipmentSetBonusValue === "function") ? getEquipmentSetBonusValue("magicDmgPct") : 0;
                if (setMagicDmg > 0) {
                    dmgToEnemy = Math.floor(dmgToEnemy * (1 + setMagicDmg / 100));
                }
            }

            // 手動「強襲攻撃 (rush)」はダメージ1.3倍＋強行熟練度ボーナス！
            if (mode === 'rush') {
                const rushDmgMult = 1.3 + (player.skills.rush.level - 1) * 0.01;
                dmgToEnemy = Math.floor(dmgToEnemy * rushDmgMult);
            }

            // 敵の防御力(def)による軽減（物理は100%・槍は50%・魔法攻撃は敵defの60%で軽減、黄金歯車は物理15%貫通、特化の防御無視を適用）
            if (enemy.def > 0) {
                let effectiveEnemyDef = enemy.def;
                if (isMagicAttack) {
                    effectiveEnemyDef = Math.floor(enemy.def * 0.6);
                } else if (weaponType === 'spear') {
                    effectiveEnemyDef = Math.floor(enemy.def * 0.5);
                }
                if (!isMagicAttack && hasEquippedSpecial("dwarven_gear")) {
                    effectiveEnemyDef = Math.floor(effectiveEnemyDef * 0.85);
                }
                if (jmEff.defPierce > 0) {
                    const pierceRatio = Math.max(0, 1 - (jmEff.defPierce / 100));
                    effectiveEnemyDef = Math.floor(effectiveEnemyDef * pierceRatio);
                }
                if (player.job === "破壊神") {
                    effectiveEnemyDef = Math.floor(effectiveEnemyDef * 0.65); // 敵DEF35%貫通
                }
                if (subJobCombat.defPierce > 0) {
                    effectiveEnemyDef = Math.floor(effectiveEnemyDef * Math.max(0, 1 - subJobCombat.defPierce));
                }
                if (skSynergyCombat.defPierce > 0) {
                    effectiveEnemyDef = Math.floor(effectiveEnemyDef * Math.max(0, 1 - skSynergyCombat.defPierce / 100));
                }
                dmgToEnemy = Math.max(1, dmgToEnemy - effectiveEnemyDef);
            }

            // 銃装備時は銃術熟練度に応じた固定ダメージ追加
            if (weaponType === 'gun') {
                dmgToEnemy += (player.skills.gun.level - 1) * 2;
            }

            // パッシブ・隠しジョブ・秘技・職能特化・熟練度奥義の効果：クリティカル発生判定
            const skEffCombat = skEffCombatPre;
            let isCritical = false;
            let critRate = (player.passiveSkills.includes("オーバークロック") ? 0.25 : 0.05)
                + (player.passiveSkills.includes("心眼") ? 0.10 : 0)
                + (player.job === "アサシン" ? 0.25 : 0)
                + (player.job === "刀神" ? 0.30 : 0)
                + (player.job === "神弓・ホークアイ" ? 0.25 : 0)
                + (player.job === "万象の覇王" ? 0.20 : 0)
                + (triggeredSkill && triggeredSkill.name === "百歩穿楊" ? 0.30 : 0)
                + (weaponType === 'sword' ? (player.skills.sword.level - 1) * 0.005 : 0)
                + (weaponType === 'katana' ? (player.skills.katana.level - 1) * 0.003 : 0)
                + (mode === 'focus' ? 0.15 : 0)
                + ((jmEff.critRate || 0) / 100)
                + ((skEffCombat.critRate || 0) / 100)
                + ((skSynergyCombat.critRate || 0) / 100)
                + (subJobCombat.critRate || 0);
            if (hasEquippedSpecial("cosmic_ring")) critRate += 0.15; // 星竜のコズミックリング

            let katanaOugiTriggered = false;
            if (Math.random() < critRate) {
                isCritical = true;
                if (!player.statsTrack) player.statsTrack = { totalSteps: 0, totalKills: 0, bossKills: 0, craftCount: 0, totalCrits: 0 };
                player.statsTrack.totalCrits = (player.statsTrack.totalCrits || 0) + 1;
                checkAchievements();

                let critMult = (weaponType === 'gun' && player.job === "魔導機工師") ? 2.0 : (weaponType === 'gun' ? 1.7 : 1.5);
                if (player.job === "アサシン") critMult += 0.4;
                if (player.job === "刀神") critMult += 0.3;
                if (player.job === "破壊神") critMult += 0.4;
                if (hasEquippedSpecial("cosmic_ring")) critMult += 0.5; // 星竜のコズミックリング: 会心倍率+0.5
                critMult += ((jmEff.critDmg || 0) / 100);
                critMult += ((skEffCombat.critDmg || 0) / 100);
                critMult += ((skSynergyCombat.critDmg || 0) / 100);
                critMult += (subJobCombat.critDmg || 0);
                const setCritDmg = (typeof getEquipmentSetBonusValue === "function") ? getEquipmentSetBonusValue("critDmg") : 0;
                if (setCritDmg > 0) critMult += (setCritDmg / 100);

                // 刀術Lv.100奥義『神速抜刀 一刀両断』: 刀装備クリティカル時に倍率+0.60
                if (weaponType === 'katana' && player.skills.katana.level >= 100) {
                    critMult += 0.60;
                    katanaOugiTriggered = true;
                }
                dmgToEnemy = Math.floor(dmgToEnemy * critMult);
            }

            // 大神の全知ルーン紋章: 与ダメージ1.20倍 ＆ 職能特化の与ダメージ増加
            if (hasEquippedSpecial("odin_rune")) {
                dmgToEnemy = Math.floor(dmgToEnemy * 1.20);
            }
            if (jmEff.dmgBonus > 0) {
                dmgToEnemy = Math.floor(dmgToEnemy * (1 + jmEff.dmgBonus / 100));
            }
            if (isNaN(dmgToEnemy) || dmgToEnemy < 1) dmgToEnemy = 1;

            const modeBadge = mode === 'rush' ? `<span style="color:#ff6666; font-weight:bold;">[💥強襲]</span> ` : (mode === 'focus' ? `<span style="color:#88ff88; font-weight:bold;">[🎯急所]</span> ` : '');
            const katanaBadge = katanaOugiTriggered ? `<span style="color:#ffd700; font-weight:bold;">[🗡️一刀両断]</span> ` : '';
            if (triggeredSkill) {
                let msg = modeBadge + katanaBadge + triggeredSkill.logMessage.replace("{damage}", dmgToEnemy);
                if (isCritical) msg = `<span style="color: #ffaa00; font-weight: bold;">⚡ CRITICAL!!</span> ` + msg;
                addLog(msg);
                for (const type in triggeredSkill.expBonus) { gainSkillExp(type, Math.ceil(triggeredSkill.expBonus[type] * skillExpMult)); }
            } else {
                let msg = `${modeBadge}${katanaBadge}⚔️ あなたの攻撃！ 敵に <b>${dmgToEnemy}</b> のダメージ！`;
                if (isCritical) msg = `<span style="color: #ffaa00; font-weight: bold;">⚡ CRITICAL!!</span> ` + msg;
                addLog(msg);
                gainSkillExp(weaponType, Math.ceil(2 * skillExpMult));
            }

            enemy.hp -= dmgToEnemy;
            
            // パッシブスキルの効果：吸血（与ダメージの10%回復）
            if (player.passiveSkills.includes("吸血") && dmgToEnemy > 0) {
                const heal = Math.max(1, Math.floor(dmgToEnemy * 0.1));
                player.hp = Math.min(player.maxHp, player.hp + heal);
                addLog(`🩸 <span style="color: #ff6666;">吸血効果！ HPが <b>${heal}</b> 回復した！</span>`);
            }
            // ネクロマンサー特性：死霊魔術ドレイン（攻撃時HP8%・MP4%吸収）＋サブジョブ継承
            if (player.job === "ネクロマンサー" && dmgToEnemy > 0) {
                const drainHp = Math.max(1, Math.floor(dmgToEnemy * 0.08));
                const drainMp = Math.max(1, Math.floor(dmgToEnemy * 0.04));
                player.hp = Math.min(player.maxHp, player.hp + drainHp);
                player.mp = Math.min(player.maxMp, player.mp + drainMp);
                addLog(`💀 <span style="color: #cc88ff;">死霊吸収！ HPが <b>${drainHp}</b>、MPが <b>${drainMp}</b> 回復した！</span>`);
            } else if ((subJobCombat.drainHp || subJobCombat.drainMp) && dmgToEnemy > 0) {
                const drainHp = subJobCombat.drainHp ? Math.max(1, Math.floor(dmgToEnemy * subJobCombat.drainHp)) : 0;
                const drainMp = subJobCombat.drainMp ? Math.max(1, Math.floor(dmgToEnemy * subJobCombat.drainMp)) : 0;
                player.hp = Math.min(player.maxHp, player.hp + drainHp);
                player.mp = Math.min(player.maxMp, player.mp + drainMp);
                addLog(`💀 <span style="color: #cc88ff;">副職・死霊吸収！ HP+${drainHp} / MP+${drainMp}</span>`);
            }
            // ハイドラの再生毒腺リング：攻撃命中時に猛毒追撃（自身の攻撃力・魔攻の1.2倍を上限として格上への割合削りすぎを防止）
            if (hasEquippedSpecial("hydra_venom") && enemy.hp > 0) {
                const poisonCap = Math.max(1, Math.floor(Math.max(player.atk, player.matk) * 1.2));
                const poisonRaw = Math.max(1, Math.floor(enemy.maxHp * (enemy.isBoss ? 0.01 : 0.04)));
                const poisonDmg = Math.min(poisonCap, poisonRaw);
                enemy.hp -= poisonDmg;
                addLog(`🐍 <span style="color: #66ff99;">【ハイドラの猛毒追撃】 敵の生命力を蝕み <b>${poisonDmg}</b> の追加毒ダメージ！</span>`);
            }
            // オメガ・オーバークロッカー：25%の確率で威力40%の超演算二連撃！
            if (hasEquippedSpecial("omega_overclock") && enemy.hp > 0 && Math.random() < 0.25) {
                const extraDmg = Math.max(1, Math.floor(dmgToEnemy * 0.4));
                enemy.hp -= extraDmg;
                addLog(`⚡ <span style="color: #00e5ff;">【オメガ・超演算二連撃】 並列演算された追撃レーザーが炸裂し <b>${extraDmg}</b> の追加ダメージ！</span>`);
            }
            // 星竜のコズミックリング：35%の確率でスターダスト流星群が追撃！(MATKの0.8倍星属性固定追撃)
            if (hasEquippedSpecial("cosmic_ring") && enemy.hp > 0 && Math.random() < 0.35) {
                const meteorDmg = Math.max(1, Math.floor(player.matk * 0.8 + 25));
                enemy.hp -= meteorDmg;
                addLog(`🌠 <span style="color: #66e5ff;">【スターダスト流星群】 天空から無数の星屑が降り注ぎ <b>${enemy.name}</b> に <b>${meteorDmg}</b> の追撃ダメージ！</span>`);
            }
            // 大神の全知ルーン紋章：毎行動時のルーン活性（HP・MP 3%リジェネ）
            if (hasEquippedSpecial("odin_rune") && player.hp > 0) {
                const runeHp = Math.max(1, Math.floor(player.maxHp * 0.03));
                const runeMp = Math.max(1, Math.floor(player.maxMp * 0.03));
                player.hp = Math.min(player.maxHp, player.hp + runeHp);
                player.mp = Math.min(player.maxMp, player.mp + runeMp);
                addLog(`✨ <span style="color: #ffd700;">【全知ルーンの恩寵】 HPが <b>${runeHp}</b>、MPが <b>${runeMp}</b> 活性回復した！</span>`);
            }
            // 👼 天界セラフィムセット効果：毎行動時HP/MP 5%聖光自動回復
            const setRegenPct = (typeof getEquipmentSetBonusValue === "function") ? getEquipmentSetBonusValue("autoRegenPct") : 0;
            if (setRegenPct > 0 && player.hp > 0) {
                const regenHp = Math.max(1, Math.floor(player.maxHp * (setRegenPct / 100)));
                const regenMp = Math.max(1, Math.floor(player.maxMp * (setRegenPct / 100)));
                player.hp = Math.min(player.maxHp, player.hp + regenHp);
                player.mp = Math.min(player.maxMp, player.mp + regenMp);
                addLog(`👼✨ <span style="color: #ffd700;">【天界セラフィムの祝福】 HPが <b>${regenHp}</b>、MPが <b>${regenMp}</b> 聖光回復した！</span>`);
            }
            // 🔗 シナジー奥義・極限マイルストーンによる自動リジェネ
            const totalSkillRegenHp = (skSynergyCombat.hpRegenPct || 0) + (skEffCombat.hpRegenPct || 0);
            const totalSkillRegenMp = (skSynergyCombat.mpRegenPct || 0) + (skEffCombat.mpRegenPct || 0);
            if ((totalSkillRegenHp > 0 || totalSkillRegenMp > 0) && player.hp > 0) {
                const rHp = totalSkillRegenHp > 0 ? Math.max(1, Math.floor(player.maxHp * (totalSkillRegenHp / 100))) : 0;
                const rMp = totalSkillRegenMp > 0 ? Math.max(1, Math.floor(player.maxMp * (totalSkillRegenMp / 100))) : 0;
                player.hp = Math.min(player.maxHp, player.hp + rHp);
                player.mp = Math.min(player.maxMp, player.mp + rMp);
            }
        } else {
            addLog(`💨 あなたの攻撃は外れた！(ミス)`);
        }
        
        if (enemy.hp <= 0) {
            handleEnemyVictory();
            return;
        }
        
        // 回避判定
        const baseEva = isNaN(player.evasionRate) ? 10 : player.evasionRate;
        const evaChance = Math.max(0, Math.min(80, baseEva));
        let evaded = Math.random() * 100 <= evaChance;
        if (evaded) {
            addLog(`🍃 ${enemy.name} の反撃！ しかし華麗に回避した！`);
            gainSkillExp('evasion', Math.ceil(1 * skillExpMult));
        } else if (player.skills?.evasion?.level >= 100 && enemy && !enemy.utsusemiUsed) {
            // 回避Lv.100奥義『空蝉の術』: 1戦闘1回だけ回避失敗時にも身代わり木片で完全無効化！
            enemy.utsusemiUsed = true;
            addLog(`🍃🪵 <b style="color:#00ffcc;">【回避奥義・空蝉の術（1戦闘1回）】</b> 身代わりの木片を残し、敵の反撃を完全に無効化した！`);
            gainSkillExp('evasion', Math.ceil(2 * skillExpMult));
        } else {
            // 盾装備時の判定
            const hasShield = player.equipment.subWeapon && (player.equipment.subWeapon.includes('盾') || player.equipment.subWeapon.includes('シールド'));

            // 盾術Lv.50奥義『パリィ反撃』: 盾装備時、15%の確率で被ダメ0＆敵にDEF×1.5のパリィ反撃ダメージ！
            if (hasShield && player.skills?.shield?.level >= 50 && Math.random() < 0.15) {
                const safeDef = Math.max(0, isNaN(player.def) ? 10 : player.def);
                const parryDmg = Math.max(1, Math.floor(safeDef * 1.5));
                enemy.hp -= parryDmg;
                addLog(`🛡️💥 <b style="color:#ffd700;">【盾術奥義・パリィ反撃！】</b> 完璧なタイミングで反撃を弾き返し、被ダメージを無効化！ <b>${enemy.name}</b> に <b>${parryDmg}</b> の反撃ダメージ！`);
                gainSkillExp('shield', Math.ceil(3 * skillExpMult));
                if (enemy.hp <= 0) {
                    handleEnemyVictory();
                    return;
                }
                calcStatus();
                return;
            }

            // 防御力(DEF)とMDEFによる被ダメージ軽減（割合＋固定値のハイブリッド軽減）
            const safeDef = Math.max(0, isNaN(player.def) ? 5 : player.def);
            const safeMdef = Math.max(0, isNaN(player.mdef) ? 5 : player.mdef);
            const enemyAtk = Math.max(1, isNaN(enemy.atk) ? 10 : enemy.atk);
            const defReductionRatio = 100 / (100 + safeDef + Math.floor(safeMdef * 0.5));
            let dmgToPlayer = Math.max(1, Math.floor((enemyAtk - Math.floor(safeDef * 0.2)) * defReductionRatio));
            
            // 盾装備時は盾術熟練度に応じてさらに割合カット
            if (hasShield) {
                const shieldCut = Math.min(0.5, ((player.skills?.shield?.level || 1) - 1) * 0.01);
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * (1 - shieldCut)));
            }

            // エリア属性や装備の耐性・耐性熟練度・セット効果による軽減
            const resMultiplier = player.job === "神聖至高職" ? 1.3 : 1.0;
            const setAllRes = (typeof getEquipmentSetBonusValue === "function") ? getEquipmentSetBonusValue("allRes") : 0;
            if (currentAreaId === "area4") {
                const eqStats = player.equipment.body ? getItemStats(player.equipment.body) : { fire_res: 0 };
                const subStats = player.equipment.subWeapon ? getItemStats(player.equipment.subWeapon) : { fire_res: 0 };
                const fireResPct = Math.min(80, (((player.skills?.fireRes?.level || 1) - 1) * 1 + (eqStats.fire_res || 0) + (subStats.fire_res || 0) + setAllRes) * resMultiplier);
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * (1 - fireResPct / 100)));
            } else if (currentAreaId === "area3" || currentAreaId === "area6") {
                const waterResPct = Math.min(80, (((player.skills?.waterRes?.level || 1) - 1) * 1 + setAllRes) * resMultiplier);
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * (1 - waterResPct / 100)));
            } else if (currentAreaId === "area5" || currentAreaId === "area7") {
                const windResPct = Math.min(80, (((player.skills?.windRes?.level || 1) - 1) * 1 + setAllRes) * resMultiplier);
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * (1 - windResPct / 100)));
            } else if (currentAreaId === "area2" || currentAreaId === "area8") {
                const earthResPct = Math.min(80, (((player.skills?.earthRes?.level || 1) - 1) * 1 + setAllRes) * resMultiplier);
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * (1 - earthResPct / 100)));
            }
            
            // パッシブスキルの効果：竜の加護 / 不撓不屈 / パラディン特性 / 神域のオーラ / 大神の全知ルーン紋章 / 職能特化軽減 / セット効果
            if (player.passiveSkills.includes("竜の加護")) {
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * 0.7)); // 30%軽減
            }
            if (player.passiveSkills.includes("不撓不屈") || player.job === "パラディン") {
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * 0.8)); // 20%軽減
            }
            if (player.passiveSkills.includes("神域のオーラ")) {
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * 0.85)); // 15%軽減
            }
            if (hasEquippedSpecial("odin_rune")) {
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * 0.85)); // 15%軽減
            }
            // 🛡️ 重鉄ゴーレムセット効果・サブジョブ・シナジー・極限マイルストーンによる被ダメ軽減
            const setDmgCut = (typeof getEquipmentSetBonusValue === "function") ? getEquipmentSetBonusValue("dmgCutPct") : 0;
            if (setDmgCut > 0) {
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * (1 - setDmgCut / 100)));
            }
            if (subJobCombat.dmgCut > 0) {
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * (1 - subJobCombat.dmgCut)));
            }
            const extraSkillDmgCut = (skSynergyCombat.dmgCutPct || 0) + (skEffCombatPre.dmgCutPct || 0);
            if (extraSkillDmgCut > 0) {
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * Math.max(0.2, 1 - extraSkillDmgCut / 100)));
            }
            const jmCutEff = getCurrentJobMasteryEffects();
            if (jmCutEff.dmgCut > 0) {
                const cutRatio = Math.min(0.50, jmCutEff.dmgCut / 100);
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * (1 - cutRatio)));
            }

            // 生存Lv.50『背水の陣』: HP30%以下のピンチ時に被ダメ20%軽減
            if (player.hp <= player.maxHp * 0.30 && (player.skills?.survival?.level || 1) >= 50) {
                dmgToPlayer = Math.max(1, Math.floor(dmgToPlayer * 0.80));
            }
            
            if (isNaN(dmgToPlayer) || dmgToPlayer < 1) dmgToPlayer = 1;
            player.hp = Math.max(0, (isNaN(player.hp) ? player.maxHp : player.hp) - dmgToPlayer);
            addLog(`💥 ${enemy.name} の反撃！ <b>${dmgToPlayer}</b> のダメージを受けた！`);
            
            // 被弾時の熟練度獲得（回避、盾術、耐性、生存熟練度）
            gainSkillExp('evasion', 0.5 * skillExpMult);
            gainSkillExp('survival', Math.ceil(1 * skillExpMult));
            if (hasShield) gainSkillExp('shield', Math.ceil(1 * skillExpMult));
            if (currentAreaId === "area4") gainSkillExp('fireRes', Math.ceil(1 * skillExpMult));
            if (currentAreaId === "area3" || currentAreaId === "area6") gainSkillExp('waterRes', Math.ceil(1 * skillExpMult));
            if (currentAreaId === "area5" || currentAreaId === "area7") gainSkillExp('windRes', Math.ceil(1 * skillExpMult));
            if (currentAreaId === "area2" || currentAreaId === "area8") gainSkillExp('earthRes', Math.ceil(1 * skillExpMult));

            // 熾天魔王の双翼ヘイロー：1回の戦闘につき1度だけ、致死ダメージ時にMP50%消費でHP35%蘇生！
            if (player.hp <= 0 && enemy && !enemy.reviveUsed && hasEquippedSpecial("seraph_halo")) {
                const reviveMpCost = Math.floor(player.maxMp * 0.50);
                if (player.mp >= reviveMpCost) {
                    enemy.reviveUsed = true;
                    player.mp -= reviveMpCost;
                    player.hp = Math.max(1, Math.floor(player.maxHp * 0.35));
                    addLog(`👼✨ <b style="color: #ffd700; background: #3a2e00; padding: 1px 6px; border-radius: 3px;">【創世の双翼・奇跡の蘇生（1戦闘1回）】</b> 熾天魔王の双翼ヘイローが輝き、MPを消費してHP <b>${player.hp}</b> で不死鳥の如く蘇った！！`);
                }
            }

            // 生存Lv.100奥義『不死鳥の魂』: 1戦闘1度だけ、致死ダメージを受けた際にHP25%で復活！
            if (player.hp <= 0 && enemy && !enemy.survivalReviveUsed && player.skills.survival.level >= 100) {
                enemy.survivalReviveUsed = true;
                player.hp = Math.max(1, Math.floor(player.maxHp * 0.25));
                addLog(`🔥🐦 <b style="color: #ffaa00; background: #331500; padding: 1px 6px; border-radius: 3px;">【生存奥義・不死鳥の魂（1戦闘1回）】</b> 限界を超えた不屈の生命力により、HP <b>${player.hp}</b> で甦った！`);
            }

            // 盾術Lv.100奥義『不落の城壁』: 盾装備時、致死ダメージを受けても1戦闘1度だけHP1で踏みとどまる！
            if (player.hp <= 0 && enemy && !enemy.shieldFortressUsed && hasShield && player.skills.shield.level >= 100) {
                enemy.shieldFortressUsed = true;
                player.hp = 1;
                addLog(`🛡️🏰 <b style="color: #00e5ff; background: #002233; padding: 1px 6px; border-radius: 3px;">【盾術奥義・不落の城壁（1戦闘1回）】</b> 鉄壁の防壁を展開し、HP <b>1</b> で耐え切った！`);
            }

            // 獄炎竜の逆鱗アミュレット：被弾時に自身のATK・DEFに応じた紅蓮の炎で自動反撃！
            if (player.hp > 0 && enemy && hasEquippedSpecial("inferno_counter")) {
                const counterDmg = Math.max(1, Math.floor(player.atk * 0.6 + player.def * 0.6));
                enemy.hp -= counterDmg;
                addLog(`🔥 <span style="color: #ff6644;">【紅蓮の逆鱗カウンター】 被弾に反応して獄炎が噴き上がり、<b>${enemy.name}</b> に <b>${counterDmg}</b> の反撃ダメージ！</span>`);
                if (enemy.hp <= 0) {
                    handleEnemyVictory();
                    return;
                }
            }

            if (player.hp <= 0) {
                player.hp = 0;
                exploreSteps = 0;
                player.battleChain = 0;
                updateExploreProgress();
                if (typeof updateChainAndBuffUI === "function") updateChainAndBuffUI();
                addLog("<span style='color: #ff4444;'>❌ 目の前が真っ暗になった！ 連戦チェインが途切れてしまった...。</span>");
            }
            calcStatus();
        }
    }
}

// --- HTMLのエリア選択セレクトボックスおよび自動セーブ・ロード初期化処理 ---
window.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('area-select');
    if (select) {
        // data.js の設定から選択肢を自動生成する（HTMLを編集しなくても新エリアが追加されます）
        select.innerHTML = "";
        for (const key in areas) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.innerText = areas[key].name;
            select.appendChild(opt);
        }
    }
    
    // ステータス振り分け倍率切り替えボタンの自動追加
    const statPointsDisplay = document.getElementById('display-stat-points');
    if (statPointsDisplay && statPointsDisplay.parentNode) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'stat-amount-toggle';
        toggleBtn.innerText = `振り分け数切替 (x${statAllocateAmount})`;
        toggleBtn.style.marginLeft = "10px";
        toggleBtn.style.padding = "2px 6px";
        toggleBtn.style.fontSize = "12px";
        toggleBtn.onclick = () => {
            if (statAllocateAmount === 1) statAllocateAmount = 5;
            else if (statAllocateAmount === 5) statAllocateAmount = 10;
            else statAllocateAmount = 1;
            toggleBtn.innerText = `振り分け数切替 (x${statAllocateAmount})`;
            calcStatus(); // ボタンの「+1」表示などを更新するため
        };
        statPointsDisplay.parentNode.appendChild(toggleBtn);
    }

    // セーブデータの自動ロード＆定期オートセーブ（15秒ごと＋ページ離脱時）
    if (!loadGame(false)) {
        ensureGuildQuests();
        checkAchievements();
        calcStatus();
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        calcStatus();
        updateInventoryDisplay();
        updateGuildQuestUI();
        updateAchievementsUI();
        updateForgeUI();
        if (typeof updateCompendiumUI === "function") updateCompendiumUI();
        if (typeof renderEquipmentPresetsUI === "function") renderEquipmentPresetsUI();
    } else {
        if (typeof renderEquipmentPresetsUI === "function") renderEquipmentPresetsUI();
    }
    setInterval(() => {
        saveGame(false);
    }, 15000);
    window.addEventListener('beforeunload', () => {
        saveGame(false);
    });
});