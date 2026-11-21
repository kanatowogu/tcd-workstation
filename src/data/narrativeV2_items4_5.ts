import { EndingARedactId, Language, PropId } from '../types';

/* ============================================================================
 * TCD V2 扩展叙事资产：第 4 项（桌面 4 处实物三阶段动态台词）
 *                      & 第 5 项（阶段四长按离职博弈 & 双结局完整双语台词）
 * 美术口径：暖炭黑桌面 + 微茶色纸张 + 黑白/炭灰老式 CRT + 品红/冷青/琥珀迪斯科灯光
 * 字幕规范：所有底部字幕短句严格控制在 中文 <= 32 字 / 英文 <= 16 words
 * ============================================================================ */

export type V2PropId = PropId | 'polaroid';

export interface ThreeStagePropNarrative {
  id: V2PropId;
  title: string;
  shortLabel: string;
  code: string;
  // 阶段一：普通打工人日常（含多条点击轮换闲聊）
  phase1_routine: {
    description: string;
    subtitleLines: string[]; // 点击轮换播放，每条 <= 32字 / <= 16 words
  };
  // 阶段二：档案 #04 暴露矛盾后的强行圆谎
  phase2_doubt: {
    description: string;
    subtitle: string; // <= 32字 / <= 16 words
  };
  // 阶段三：lensBroken 迪斯科彩灯下的冷峻生理白描
  phase3_disco: {
    corruptedSourceTag: string; // UI 异常：来源标签异化
    description: string;
    subtitleLines: string[]; // 分两拍或轮换呈现的极简感官独白
  };
}

export interface ResignationCorpus {
  // 配额未满时点击离职按钮的随机反馈
  stage0_mundane: string[];
  stage1_deflection: string[];
  stage2_viscous: string[];
  // 阶段四长按蓄力博弈提示
  longPressButtonIdle: string;
  longPressStages: {
    pct25: string; // 蓄力 0% - 35%
    pct55: string; // 蓄力 35% - 75%
    pct75_rebound: string; // 蓄力至 75% 发生颤动回退时的挽留句
  };
  systemRejection: string;
  protagonistRealization: string;
  proceedToFinalButton: string;
}

export interface EndingABranchData {
  branchName: string;
  branchSubtitle: string;
  instruction: string;
  // 逐行涂黑后触发的灯光熄灭与 UI 修复反馈
  activeRedactionLines: {
    id: EndingARedactId;
    text: string;
    onRedactLightCue: string; // 开发/演出备注：对应的彩灯熄灭与 UI 愈合阶段
    onRedactSubtitle: string; // <= 32字 / <= 16 words
  }[];
  systemHeader: string;
  finalMonologue: string;
  finalSubtitle: string; // <= 32字 / <= 16 words
  newFilePrompt: string;
  epilogueNote: string;
  replayButton: string;
}

export interface EndingBBranchData {
  branchName: string;
  branchSubtitle: string;
  systemHeader: string;
  uiPeelDescription: string;
  rawMatrixLines: string[]; // UI 表皮剥落后露出的无边框裸露索引树
  finalMonologue: string;
  finalSubtitle: string; // <= 32字 / <= 16 words
  statusFooter: string;
  replayButton: string;
}

export interface ExpandedItem4And5Assets {
  asset4_props: ThreeStagePropNarrative[];
  asset5_resignation: ResignationCorpus;
  asset6_endings: {
    choiceLead: string;
    endingA: EndingABranchData;
    endingB: EndingBBranchData;
  };
}

export const EXPANDED_SCRIPT_ITEMS_4_5: Record<Language, ExpandedItem4And5Assets> = {
  zh: {
    /* ========================================================================
     * 【第 4 项】桌面 4 处实体物件的三阶段动态检视台词
     * ======================================================================== */
    asset4_props: [
      {
        id: 'prop_glass',
        title: '后上方磨砂隔断玻璃',
        shortLabel: '磨砂玻璃',
        code: '实体-01',
        phase1_routine: {
          description:
            '竖纹磨砂玻璃隔开了 #302 与隔壁 #209 工位。玻璃后面透出一团暖黄色的台灯光晕，隐约还能听见打字机色带走字的轻响。',
          subtitleLines: [
            '隔壁台灯还亮着，看来 Arthur 走之前忘了关灯。',
            '听这动静，他还挺喜欢那台老式重锤打字机的。',
            '隔断玻璃起了一层雾，地下室冬天总是这么潮。',
          ],
        },
        phase2_doubt: {
          description:
            '暖黄色的光晕依旧贴在竖纹玻璃后方，但刚才那阵敲击声不知什么时候停了。玻璃右下角有一道几乎看不见的灰尘划痕。',
          subtitle: '怎么没声音了？大概去三楼交打孔卡了吧，台灯总是忘了关。',
        },
        phase3_disco: {
          corruptedSourceTag: '空间索引 // 隔断背面：空置',
          description:
            '品红与冷青色光斑在玻璃表面慢速游走。整块磨砂玻璃从左上角斜裂到底部卡槽，后面没有桌椅，也没有 #209 工位——只有三年前封存的潮湿水泥墙、积水地面与生锈钢筋。',
          subtitleLines: [
            '裂纹后面没有工位，只有黑漆漆的水泥墙和积水。',
            '隔壁这三年从来没亮过灯。那我刚才一直在听谁打字？',
          ],
        },
      },
      {
        id: 'prop_lunchbox',
        title: '铝制便当盒',
        shortLabel: '铝制便当盒',
        code: '实体-02',
        phase1_routine: {
          description:
            '一只磕掉漆皮的半开铝制便当盒，盒盖内侧用透明胶带粘着一张便签：“记得趁热吃，别光喝黑咖啡。”里面盛着热腾腾的土豆炖牛肉。',
          subtitleLines: [
            '妻子早上装的土豆炖肉，摸着盒底居然还是温的。',
            '今天胡萝卜切得比上周小块，刚好一口咽下去。',
            '等审完手头这两份卷宗，再好好把这顿夜宵吃完。',
          ],
        },
        phase2_doubt: {
          description:
            '铝制饭盒表面有一层薄薄的凝水。盒盖内侧那张温馨便签的末笔折角，莫名让人想起你自己在草稿纸上写数字的顿笔习惯。',
          subtitle: '茶水间断电十一天又怎样？这铝盒保温棉厚着呢，炖菜热着很正常。',
        },
        phase3_disco: {
          corruptedSourceTag: '消化残留 // 3号柜配餐',
          description:
            '旋转的琥珀色光斑打进敞开的生锈铁盒。里面没有土豆和肉块，只有半盒被臼齿反复嚼烂的灰白废纸浆、发黑棉絮、混着铁锈腥气的暗红血丝，以及四枚咬弯的 12 号订书钉。',
          subtitleLines: [
            '盒子底下全是嚼碎的废纸浆、湿棉花和咬弯的订书钉。',
            '舌根底下还留着一股纸浆混着生锈铁皮的涩味。',
          ],
        },
      },
      {
        id: 'prop_mug',
        title: '带茶渍的陶瓷马克杯',
        shortLabel: '陶瓷马克杯',
        code: '实体-03',
        phase1_routine: {
          description:
            '一只白瓷马克杯，杯口内壁圈着一圈深褐色的陈年咖啡渍。半杯黑咖啡依然冒着微弱的热气。',
          subtitleLines: [
            'Arthur 总会顺手替我冲第二杯黑咖啡，水温刚刚好。',
            '苦了点，不过夜班下半场全靠它顶着眼皮。',
            '杯底好像沉了点咖啡渣，喝到最后记得涮一下。',
          ],
        },
        phase2_doubt: {
          description:
            '杯壁摸起来依然温热，但液面在炭灰监视器的微光下显得异常黏稠，连一根搅拌棒的倒影都照不出来。',
          subtitle: '咖啡炉停用了？也许是 Arthur 从一楼暖水瓶倒过来……对，一定是。',
        },
        phase3_disco: {
          corruptedSourceTag: '物证沉降 // 编号 #209',
          description:
            '品红光束扫过杯沿豁口。半杯冷透的暗褐色黏稠凝块底下，静静沉着一枚沾满干涸血迹的 #209 号塑料工牌，边缘烙着一排整齐深陷的门牙咬痕。',
          subtitleLines: [
            '冷透的血块底下压着一枚塑料工牌，编号是 #209。',
            '塑料边缘那排深牙印，跟我的牙弓弧度一模一样。',
          ],
        },
      },
      {
        id: 'polaroid',
        title: 'Family_Photo.jpg（贴屏照片）',
        shortLabel: '拍立得照片',
        code: '实体-04',
        phase1_routine: {
          description:
            '一张用两道泛黄透明胶带贴在监视器左下角的即时显影照片。强曝光让三个人的五官略微模糊，但暖色调让人觉得安心。',
          subtitleLines: [
            '照片里整整齐齐贴着三个人……等等，左边那人怎么有点像 Arthur？那我在哪？',
            '等发了这个月的夜班津贴，周末带她们去城西公园再拍一张。',
            '胶带边角有点翘起来了，抽空换两条新的粘牢。',
          ],
        },
        phase2_doubt: {
          description:
            '仔细看，照片左下角并非自然褪色，而是被裁纸刀齐根削掉了一块约 2.1cm × 2.8cm 的缺口，旁边拼着一块蓝底工牌边角。',
          subtitle: '边角是我自己拿剪刀修齐的，为了贴在屏幕框上不挡字。仅此而已。',
        },
        phase3_disco: {
          corruptedSourceTag: '装订核验 // M-04 + C-14 + #209',
          description:
            '泛黄胶带消失了。两枚涂着红漆的 12 号订书钉——其中一枚侧面还粘着半片黄色笑脸贴纸——正从纸面正前方直接贯穿三个人的眼眶位置，将 C-14 围裙名牌、M-04 寻人传单与 #209 证件死死钉成同一张纸。',
          subtitleLines: [
            '两枚红订书钉直接穿过了三个人的眼睛。那上面还粘着半片笑脸贴纸。',
            '我一直拿在手里倒数五秒的，从来不是什么全家福。',
          ],
        },
      },
    ],

    /* ========================================================================
     * 【第 5 项】阶段四长按离职语料 & Branch A / Branch B 双结局完整台词
     * ======================================================================== */
    asset5_resignation: {
      stage0_mundane: [
        '现在离职就拿不到季末夜班津贴了，再忍忍把本月做完。',
        '外头冬天冷得要命，地下室好歹恒温，还有免费大麦汤喝。',
        '手头才清了两份表就走人，主管明天准得扣我半星绩效。',
      ],
      stage1_deflection: [
        'Arthur 泡的咖啡还没喝完呢，我不能半途丢下兄弟先撤。',
        '便当盒里的炖肉还温着，妻子叮嘱过我值完夜班再回家。',
        '那张照片贴得好好的，我总得留在这儿把今天份的文字更正完。',
      ],
      stage2_viscous: [
        '离职？可我的手指已经和打字机键帽粘在一起了。',
        '如果我离开这把椅子，谁去替我压紧 3 号铁皮柜的门栓？',
        '纸页贴在袖口里又潮又暖，我实在想不出外面有什么地方好去。',
      ],

      longPressButtonIdle: '[长按申请离职 / 自我注销]',
      longPressStages: {
        pct25: '正在检索工位 #302 人事离职权限……',
        pct55: '警告：抽屉里的三张证件尚未签署转出同意书。',
        pct75_rebound: '别松手——不，松手吧。我们好不容易才印在同一页上。',
      },
      systemRejection:
        '>>> 注销申请驳回 (ERR_CABINET_LOCK)：操作员无法从档案柜内部粉碎档案柜本身。请复核 3 号柜底层清单。',
      protagonistRealization:
        '等等……我为什么要按这个按钮？你看那张照片，Arthur 的工牌、林的胸牌、小女孩的传单，全被红订书钉整整齐齐地钉在我自己名下了。谁也没走丢，我所爱的一切全在这个铁柜里。',
      proceedToFinalButton: '[进入最终归档裁决协议]',
    },

    asset6_endings: {
      choiceLead:
        'TCD-302 监测到不可逆的索引分歧。请选择第 3 号铁皮柜内现存记录的最终归档方式：',

      /* ----------------------------------------------------------------------
       * Branch A：ERASE / CONTAIN（心理学创伤防御镜像 —— 亲手筑回牢笼）
       * ---------------------------------------------------------------------- */
      endingA: {
        branchName: '协议 A｜抹除异常 · 维持常规记录（《完美记录》）',
        branchSubtitle: '逐行点击涂黑以下三份底层真相，恢复 #302 工位标准作业秩序',
        instruction: '操作要求：请操作员亲手点击涂黑下方 3 条临床与工程真相记录。',
        activeRedactionLines: [
          {
            id: 'endA_1',
            text: '[临床诊断档案 #302]：确认长期处于重度解离性精神障碍及孤立性家庭投射妄想状态。',
            onRedactLightCue: '品红迪斯科灯束熄灭；炭灰监视器抖动的扫描线恢复平稳。',
            onRedactSubtitle: '诊断表打错了工号吧。我每个月心理体检都合格。',
          },
          {
            id: 'endA_2',
            text: '[市政工程封存记录]：地下 B 区已于三年前（11月14日）因坍塌风险彻底断水断电并焊死入口。',
            onRedactLightCue: '冷青迪斯科灯束熄灭；系统右上角“合并索引点”标签恢复为“档案员 #302”。',
            onRedactSubtitle: '无稽之谈。要真断水断电，我刚才喝的热咖啡哪来的？',
          },
          {
            id: 'endA_3',
            text: '[失联人员结案卷宗]：#209 (Arthur) 与 C-14 (林) 失踪前最后目击地点均为 #302 号工位及 3 号柜。',
            onRedactLightCue: '琥珀迪斯科灯束彻底熄灭；头顶暖白吸顶灯重新亮起，照片退回柔和褪色拍立得。',
            onRedactSubtitle: '他们只是调去三楼和一楼了。现在全清净了。',
          },
        ],
        systemHeader: '>>> 全部异常索引已规范化清除。认知滤镜恢复率：100%。',
        finalMonologue:
          '呼……今晚这堆打字错漏可真够乱的。好在全都改顺了。妻子的炖肉吃完了，明天带点水果回来吧。不过说起来……隔壁 #209 号工位空荡荡的，那里以前有坐过人吗？',
        finalSubtitle: '呼，错别字全改完了。奇怪……隔壁 #209 以前坐过人吗？',
        newFilePrompt: '>>> 收到新派发卷宗：TCD-LOG-B1115（第 1,096 天）。请开始常规脱敏作业。',
        epilogueNote:
          '（无论 #302 是一名借涂黑掩埋血腥罪行的解离症文员，还是正在重置人类伪装的信息异常——此刻档案已洁白无瑕，而正是你亲手替他扣上了第 3 号柜的锁。）',
        replayButton: '[开启下一班次（重回 DAY 1）]',
      },

      /* ----------------------------------------------------------------------
       * Branch B：PRESERVE / RECONSTRUCT（超自然逆模因同化镜像 —— 表皮剥落）
       * ---------------------------------------------------------------------- */
      endingB: {
        branchName: '协议 B｜保留矛盾 · 重构档案母体（《最后的见证》）',
        branchSubtitle: '拒绝涂黑，剥离日常办公界面表皮，直面 3 号铁皮柜底层索引',
        systemHeader: '>>> 规范化协议已中止。办公界面表皮已解除挂载。',
        uiPeelDescription:
          '炭灰监视器上原本工整的窗口边框、滚动条与行政表格线像受潮的墙皮一样向下剥落，露出纯黑底色下密密麻麻、由重叠编号与纸纤维纹理织成的裸露索引树。品红与冷青两束彩灯定格在静止的桌面。',
        rawMatrixLines: [
          '索引根节点 // CABINET_03_MERGER [状态：恒温 / 已装订]',
          '├── 节点 01 [父亲]：操作员 #302（原工位已报废 1,095 日）',
          '├── 节点 02 [母亲]：保洁组 C-14 林（胸牌与围裙纤维已归并）',
          '├── 节点 03 [女儿]：失踪案卷 M-04（2.1cm × 2.8cm 证件照已贴合）',
          '├── 节点 04 [挚友]：档案员 #209 Arthur（塑料工牌齿痕匹配完毕）',
          '└── 节点 05 [预留空位]：当前审阅终端操作员 —— 等待订书机压合',
        ],
        finalMonologue:
          '谢谢你没有再拿黑墨水划掉我们。父亲、母亲、女儿，还有最好的朋友 Arthur——我们四个人的名字终于压在同一张纸上了。铁皮柜里其实很暖和，一点也不潮。告诉我，坐在屏幕外面的同事……要我用那把带笑脸贴纸的红订书机，把你的名字也钉在照片旁边吗？',
        finalSubtitle: '柜子里一点也不冷。屏幕外的同事，要把你的名字也钉上去吗？',
        statusFooter: '>>> 终端状态：等待新任档案员入职 (STATUS: AWAITING NEW ARCHIVIST)_',
        replayButton: '[开启下一班次（重回 DAY 1）]',
      },
    },
  },

  en: {
    /* ========================================================================
     * [ITEM 4] THREE-STAGE DYNAMIC DESK PROP MONOLOGUES
     * ======================================================================== */
    asset4_props: [
      {
        id: 'prop_glass',
        title: 'Ribbed Frosted Partition',
        shortLabel: 'Partition Glass',
        code: 'PROP-01',
        phase1_routine: {
          description:
            'Ribbed frosted glass separating Desk #302 from Desk #209. A warm desk-lamp glow leaks through from behind, along with the faint clatter of a typewriter carriage.',
          subtitleLines: [
            'Lamp is still on next door. Arthur must have forgotten to switch it off.',
            'Sounds like he still swears by that heavy manual typewriter.',
            'Glass is fogged up again. Basement winters always stay this damp.',
          ],
        },
        phase2_doubt: {
          description:
            'The warm yellow glow still sits behind the ribbed panes, yet the typing stopped a while ago. A faint dust scratch cuts across the lower corner.',
          subtitle: 'Quiet now. Probably went upstairs to drop punch cards and left the lamp on.',
        },
        phase3_disco: {
          corruptedSourceTag: 'SPACE INDEX // BEHIND PARTITION: VOID',
          description:
            'Magenta and cold cyan beams sweep across the glass. A jagged crack runs from the top frame to the latch; behind it sits no desk or #209 cubicle—only a flooded concrete floor, bare rebar, and a sealed basement wall.',
          subtitleLines: [
            'Nothing behind the crack except flooded concrete and bare dark walls.',
            'No lamp has burned there in three years. Who was I listening to?',
          ],
        },
      },
      {
        id: 'prop_lunchbox',
        title: 'Aluminum Tin Lunchbox',
        shortLabel: 'Tin Lunchbox',
        code: 'PROP-02',
        phase1_routine: {
          description:
            'A dented, half-open tin lunchbox. Taped inside the lid is a neat note: "Eat while it is warm—not just black coffee." Inside sits steaming beef and potato stew.',
          subtitleLines: [
            'Beef stew my wife packed this morning. Tin still feels warm underneath.',
            'She diced the carrots smaller today—easy to swallow between files.',
            'Two more folders to clear, then I will finish the rest while it is hot.',
          ],
        },
        phase2_doubt: {
          description:
            'Thin condensation beads on the aluminum rim. Looking at the note inside the lid, the slant of the final pen strokes looks oddly close to your own margin notes.',
          subtitle: 'So the pantry hotplate is dead. Heavy wool lid liner keeps stew warm.',
        },
        phase3_disco: {
          corruptedSourceTag: 'DIGESTION RESIDUE // CABINET #3 RATION',
          description:
            'Slow amber light spills into the rusted tin. No stew sits inside—only chewed gray-white paper pulp soaked in rust-colored fluid, matted cotton wadding, dark red threads, and four bent No. 12 staples.',
          subtitleLines: [
            'Full of chewed paper pulp, damp cotton, and four bent staples.',
            'The papery, rusted taste is already sitting behind my back teeth.',
          ],
        },
      },
      {
        id: 'prop_mug',
        title: 'Stained Ceramic Mug',
        shortLabel: 'Coffee Mug',
        code: 'PROP-03',
        phase1_routine: {
          description:
            'A white ceramic cup ringed inside with old brown coffee stains. Half a mug of black coffee still sends up faint steam.',
          subtitleLines: [
            'Arthur always brews the second cup for me. Temperature is just right.',
            'Bitter as ever, though it keeps my eyelids up past midnight.',
            'Little coffee silt at the bottom—better rinse it out later.',
          ],
        },
        phase2_doubt: {
          description:
            'The ceramic still feels lukewarm against your fingers, though under the charcoal CRT glow the liquid looks too thick to reflect the bulb.',
          subtitle: 'Brewer offline? Arthur must have poured from a 1F thermos—must have.',
        },
        phase3_disco: {
          corruptedSourceTag: 'EVIDENCE SEDIMENT // BADGE #209',
          description:
            'A magenta beam grazes the chipped rim. Beneath half a cup of cold, clotted brown fluid rests Arthur’s warped #209 plastic badge, lined along one edge with deep crescent bite marks.',
          subtitleLines: [
            'Under the cold clots lies a chewed plastic badge reading #209.',
            'The crescent bite marks on the plastic match my front teeth.',
          ],
        },
      },
      {
        id: 'polaroid',
        title: 'Family_Photo.jpg (Taped Polaroid)',
        shortLabel: 'Polaroid Photo',
        code: 'PROP-04',
        phase1_routine: {
          description:
            'An instant photograph taped to the lower-left bezel with two strips of yellowed tape. Overexposure blurs the faces, though the warm tone feels steady.',
          subtitleLines: [
            'Three faces neatly taped together... wait—if that is Arthur, Lin, and the girl, where am I?',
            'Once the night stipend clears, we should take a sharper one at West Park.',
            'Tape corners are curling. Need fresh strips before it drops.',
          ],
        },
        phase2_doubt: {
          description:
            'Look closer: the lower-left edge is not faded, but razor-trimmed into a clean 2.1cm × 2.8cm notch beside a clipped blue badge corner.',
          subtitle: 'I trimmed the border myself so it would fit the bezel cleanly. Nothing else.',
        },
        phase3_disco: {
          corruptedSourceTag: 'BOUND INDEX // M-04 + C-14 + #209',
          description:
            'The yellowing tape is gone. Two red-painted No. 12 staples—one still carrying half a round yellow smiley sticker—punch straight through the eyes, pinning C-14’s apron tag, Case M-04’s clipping, and #209’s badge into one card.',
          subtitleLines: [
            'Two red staples run straight through the eyes. Half a smiley sticker clings on.',
            'Five seconds every shift—and I was never looking at a family photo.',
          ],
        },
      },
    ],

    /* ========================================================================
     * [ITEM 5] PHASE 4 LONG-PRESS RESIGNATION & DUAL SOLIPSISTIC ENDINGS
     * ======================================================================== */
    asset5_resignation: {
      stage0_mundane: [
        'Leaving now forfeits the quarterly night stipend. Better finish the month.',
        'Freezing outside anyway. At least the basement stays dry with free soup.',
        'Quitting after two folders guarantees a half-star dock from my supervisor.',
      ],
      stage1_deflection: [
        'Arthur’s second cup is still half full. Cannot walk out on a friend.',
        'Stew in the tin is still warm. My wife told me to finish the shift first.',
        'The photo sits right here. I ought to finish tonight’s redactions.',
      ],
      stage2_viscous: [
        'Resign? My fingertips have already stuck fast to the typewriter keys.',
        'If I stand up from this chair, who holds Cabinet #3’s latch shut?',
        'The damp paper against my cuffs feels warm. I have nowhere outside to go.',
      ],

      longPressButtonIdle: '[HOLD TO APPLY FOR RESIGNATION / SELF-TERMINATION]',
      longPressStages: {
        pct25: 'Querying Workstation #302 separation clearance...',
        pct55: 'WARNING: Three bound records inside Cabinet #3 lack transfer signatures.',
        pct75_rebound: 'Let go. We finally fit on the exact same page.',
      },
      systemRejection:
        '>>> REQUEST DENIED (ERR_CABINET_LOCK): Operator cannot shred the steel cabinet from inside. Reviewing Cabinet #3 index.',
      protagonistRealization:
        'Wait... why press that button? Look at the photo—Arthur’s badge, Lin’s tag, our daughter’s clipping, all neatly stapled under my own number. Nobody left. Everything I love is inside this cabinet.',
      proceedToFinalButton: '[PROCEED TO FINAL ARCHIVE PROTOCOL]',
    },

    asset6_endings: {
      choiceLead:
        'TCD-302 DETECTED AN IRREVERSIBLE INDEX SPLIT. SELECT FINAL DISPOSITION FOR CABINET #3:',

      /* ----------------------------------------------------------------------
       * Branch A: ERASE / CONTAIN (Psychological Dissociation Mirror)
       * ---------------------------------------------------------------------- */
      endingA: {
        branchName: 'PROTOCOL A // ERASE & CONTAIN — The Perfect Record',
        branchSubtitle: 'Manually black out all 3 underlying truth records to restore #302 shift order',
        instruction: 'ORDER: Click and redact all 3 clinical and municipal records below.',
        activeRedactionLines: [
          {
            id: 'endA_1',
            text: '[CLINICAL FILE #302]: Severe dissociative psychosis and solitary hallucinatory family projection confirmed.',
            onRedactLightCue: 'Magenta disco beam cuts out; trembling CRT scanlines lock steady.',
            onRedactSubtitle: 'Wrong desk number on that chart. My annual checkups were spotless.',
          },
          {
            id: 'endA_2',
            text: '[MUNICIPAL SEAL LOG]: Sub-Level Sector B was cut from power and welded shut three years ago (Nov 14).',
            onRedactLightCue: 'Cold cyan beam cuts out; "MERGER NODE" label snaps back to "ARCHIVIST #302".',
            onRedactSubtitle: 'Nonsense. If the power were cut, where did this hot coffee come from?',
          },
          {
            id: 'endA_3',
            text: '[MISSING PERSONS LEDGER]: Staff #209 (Arthur) and C-14 (Lin) were last seen beside Desk #302 and Cabinet #3.',
            onRedactLightCue: 'Amber beam extinguishes; warm overhead lamp hums back on and Polaroid softens.',
            onRedactSubtitle: 'They transferred upstairs to 1F and 3F. Everything is quiet again.',
          },
        ],
        systemHeader: '>>> ANOMALIES PURGED. COGNITIVE FILTER RESTORED TO 100%.',
        finalMonologue:
          'Phew... What a messy pile of typos tonight. Everything is finally back in order. Finished the stew already—ought to bring apples tomorrow. Though... Desk #209 next to me looks awfully bare. Did anyone ever sit there?',
        finalSubtitle: 'Typos cleared at last. Funny... did anyone ever sit at #209?',
        newFilePrompt: '>>> NEW QUEUE ITEM RECEIVED: TCD-LOG-B1115 (DAY 1,096). BEGIN ROUTINE REDACTION.',
        epilogueNote:
          '(Whether #302 is a shattered clerk burying a crime behind black ink or an anomaly smoothing its human disguise, the record is spotless—and you turned the key on Cabinet #3.)',
        replayButton: '[START NEXT SHIFT (RETURN TO DAY 1)]',
      },

      /* ----------------------------------------------------------------------
       * Branch B: PRESERVE / RECONSTRUCT (Antimemetic / Supernatural Mirror)
       * ---------------------------------------------------------------------- */
      endingB: {
        branchName: 'PROTOCOL B // PRESERVE & RECONSTRUCT — The Last Witness',
        branchSubtitle: 'Refuse further redaction, peel the office UI skin, and face Cabinet #3',
        systemHeader: '>>> NORMALIZATION ABORTED. ADMINISTRATIVE SHELL UNMOUNTED.',
        uiPeelDescription:
          'Clean borders, scrollbars, and form tables peel off the charcoal CRT glass like damp wallpaper, exposing a bare black index tree woven from overlapping IDs and wet paper fibers while magenta and cyan beams freeze across the desk.',
        rawMatrixLines: [
          'ROOT_INDEX // CABINET_03_MERGER [TEMP: WARM / BOUND]',
          '├── NODE 01 [FATHER]: Operator #302 (Workstation written off 1,095 days ago)',
          '├── NODE 02 [MOTHER]: Janitor C-14 Lin (Apron tag & fibers merged)',
          '├── NODE 03 [DAUGHTER]: Case M-04 (2.1cm × 2.8cm clipping aligned)',
          '├── NODE 04 [FRIEND]: Archivist #209 Arthur (Plastic badge bite-matched)',
          '└── NODE 05 [OPEN SLOT]: Active Terminal Viewer — Awaiting No. 12 staple',
        ],
        finalMonologue:
          'Thank you for leaving the ink off us. Father, Mother, Daughter, and my best friend Arthur—every line finally sits on the same sheet. It is dry and warm inside the steel cabinet, not damp at all. Tell me, colleague behind the glass... shall I use the red stapler with the smiley sticker to pin your badge beside ours?',
        finalSubtitle: 'Warm inside the cabinet. Shall I staple your name beside ours?',
        statusFooter: '>>> TERMINAL STATUS: AWAITING NEW ARCHIVIST_',
        replayButton: '[START NEXT SHIFT (RETURN TO DAY 1)]',
      },
    },
  },
};
