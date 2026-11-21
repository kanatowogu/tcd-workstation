import { ActStage, AuditOptionId, Language } from '../../types';

export interface DocFileContent {
  id: string;
  filenameZh: string;
  filenameEn: string;
  size: string;
  dateZh: string;
  dateEn: string;
  getBody: (actStage: ActStage, lang: Language) => string[];
}

export interface RecycleFragment {
  id: string;
  filename: string;
  origin: string;
  size: string;
  deletedAt: string;
  bodyZh: string;
  bodyEn: string;
}

export interface AuditOptionItem {
  id: AuditOptionId;
  labelZh: string;
  labelEn: string;
}

export const MY_DOCS_FILES: DocFileContent[] = [
  {
    id: 'coffee_notice',
    filenameZh: '茶水间咖啡机维护通知.TXT',
    filenameEn: 'PANTRY_COFFEE_NOTICE.TXT',
    size: '1.4 KB',
    dateZh: '11-11 09:15',
    dateEn: 'NOV-11 09:15',
    getBody: (actStage, lang) => {
      if (lang === 'zh') {
        if (actStage === 1) {
          return [
            '市政更正部 后勤事务科 // 内部通告 #B-104',
            '--------------------------------------------------',
            '主题：地下 B 区茶水间滴滤咖啡机除垢维护通知',
            '',
            '各工位值班文员：',
            '本周四 14:00–16:00 将对地下 B 区茶水间滴滤咖啡机及热水锅炉',
            '进行例行除垢保养。期间请前往一楼大厅自助机取水。',
            '',
            '温馨提示：',
            '1. 夜班结束后请及时涮洗个人陶瓷马克杯，避免咖啡渍沉积。',
            '2. 邻位同事如代泡黑咖啡，请勿将杯具放置在磁带机散热口上方。',
            '',
            '落款：后勤保障组（抄送：保洁班组 C-14）',
          ];
        }
        if (actStage === 2) {
          return [
            '市政更正部 后勤事务科 // 内部通告 #B-104 [修订稿]',
            '--------------------------------------------------',
            '主题：关于地下 B 区茶水间持续断电的补充说明',
            '',
            '核对能源台账发现，地下 B 区茶水间配电箱已于 11 日前切断供电，',
            '咖啡机与加热炉均处于停机状态。',
            '',
            '异常备注：',
            '值班巡检记录显示，#302 工位桌面每日深夜仍出现半杯冒热气的深色液体。',
            '请工位 #302 操作员自查热源去向。不要饮用来源不明的沉积物。',
            '',
            '落款：后勤保障组（注：C-14 号保洁员本月未签出打卡）',
          ];
        }
        return [
          '市政更正部 后勤事务科 // 阳光茶水间福利通知 [★ 优秀科室]',
          '--------------------------------------------------',
          '主题：本周茶水间免费提供现磨热咖啡与黄油曲奇！',
          '',
          '亲爱的模范操作员 #302：',
          '感谢你一直以来的温暖微笑与辛勤付出！茶水间已全天恢复',
          '恒温热水供应，并新增香草奶油黑咖啡与手工小饼干。',
          '',
          '温馨贴士：',
          '1. 每天也要记得按时吃饭、多喝热饮，保持心情愉快！',
          '2. 邻居 #209 Arthur 已在休假前为你留好了新鲜烘焙咖啡豆。',
          '',
          '落款：市政模范后勤处 · 祝你工作顺心 ☺',
        ];
      }

      // English
      if (actStage === 1) {
        return [
          'TCD FACILITIES OFFICE // INTERNAL MEMO #B-104',
          '--------------------------------------------------',
          'SUBJECT: Sub-Level Sector B Coffee Brewer Descaling',
          '',
          'To All Night-Shift Archivists:',
          'Routine descaling of the Sector B pantry drip brewer and boiler',
          'is scheduled for Thursday, 14:00–16:00. Please use the 1F thermos.',
          '',
          'Reminders:',
          '1. Rinse ceramic mugs before leaving so coffee silt does not harden.',
          '2. If a colleague pours your second cup, keep mugs off tape vents.',
          '',
          'Signed: Facilities Division (CC: Night Janitorial Unit C-14)',
        ];
      }
      if (actStage === 2) {
        return [
          'TCD FACILITIES OFFICE // INTERNAL MEMO #B-104 [AMENDED]',
          '--------------------------------------------------',
          'SUBJECT: Sector B Pantry Breaker Disconnection Notice',
          '',
          'Utility ledgers confirm the Sector B pantry breaker was pulled',
          '11 days ago. Neither the coffee brewer nor the hotplate has power.',
          '',
          'Audit Note:',
          'Night patrols still log a lukewarm ceramic mug on Desk #302.',
          'Operator #302 is advised not to ingest unverified dark residue.',
          '',
          'Signed: Facilities (Note: Janitor C-14 has not clocked out this month)',
        ];
      }
      return [
        'TCD FACILITIES OFFICE // SUNSHINE PANTRY BULLETIN ★',
        '--------------------------------------------------',
        'SUBJECT: Freshly Brewed Coffee & Free Biscuits All Week!',
        '',
        'Dear Model Operator #302,',
        'Thank you for brightening Sector B with your wonderful work ethic!',
        'The pantry brewer is warmed up and stocked with vanilla roast',
        'coffee and complimentary butter cookies.',
        '',
        'Friendly Reminders:',
        '1. Enjoy a warm cup whenever you like—you earned it!',
        '2. Arthur (#209) left a fresh tin of roast beans before his break.',
        '',
        'Signed: Municipal Hospitality Office · Have a Sunny Shift! ☺',
      ];
    },
  },
  {
    id: 'supplies_req',
    filenameZh: '11月办公耗材申领单.DOC',
    filenameEn: 'NOV_SUPPLIES_REQ.DOC',
    size: '2.1 KB',
    dateZh: '11-12 18:40',
    dateEn: 'NOV-12 18:40',
    getBody: (actStage, lang) => {
      if (lang === 'zh') {
        if (actStage === 1) {
          return [
            '市政更正部 办公耗材月度申领表（FORM-SUP-84）',
            '==================================================',
            '申领科室：地下 B 区档案更正组     工位编号：#302',
            '--------------------------------------------------',
            '物料名称                   规格            申领数量',
            '--------------------------------------------------',
            '1. 广口碳黑涂黑马克笔      12支/盒          2 盒',
            '2. 12号标准镀锌订书钉      1000枚/盒        3 盒',
            '3. 牛皮纸档案卷宗夹        A4加厚           10 个',
            '4. 透明封口胶带            18mm             2 卷',
            '5. 复写纸（蓝黑双面）      50张/包          1 包',
            '--------------------------------------------------',
            '领用人签字：#302               审核状态：已批复',
          ];
        }
        if (actStage === 2) {
          return [
            '市政更正部 办公耗材月度申领表（FORM-SUP-84）',
            '==================================================',
            '申领科室：地下 B 区档案更正组     工位编号：#302',
            '--------------------------------------------------',
            '物料名称                   规格            申领数量',
            '--------------------------------------------------',
            '1. 广口碳黑涂黑马克笔      12支/盒          30 盒',
            '2. 12号红漆重型订书钉      1000枚/盒        12 盒',
            '3. 黄色圆形笑脸贴纸        100枚/版         1 版',
            '4. 透明封口胶带（泛黄）    18mm             0 卷（已停用）',
            '5. 3号铁皮柜加固插销       工业级           2 套',
            '--------------------------------------------------',
            '审核批注：为何频繁申领红漆订书钉？工位 #209 无人签收。',
          ];
        }
        return [
          '市政更正部 模范科室办公耗材补给单（FORM-SUN-302）',
          '==================================================',
          '申领科室：地下 B 区模范示范组     工位编号：#302 ★',
          '--------------------------------------------------',
          '物料名称                   规格            申领数量',
          '--------------------------------------------------',
          '1. 金色五角星奖励贴纸      100枚/版         5 版',
          '2. 12号标准镀锌订书钉      1000枚/盒        2 盒',
          '3. 牛皮纸档案卷宗夹        A4加厚           10 个',
          '4. 微笑便签纸（柠檬黄）    100张/本         3 本',
          '5. 花草果茶冲饮礼盒        20包/盒          2 盒',
          '--------------------------------------------------',
          '领用人签字：#302               审核状态：全额批复 ★',
          '部门寄语：感谢您让每一份文件都整洁完美！',
        ];
      }

      // English
      if (actStage === 1) {
        return [
          'TCD MONTHLY OFFICE SUPPLIES REQUISITION (FORM-SUP-84)',
          '==================================================',
          'SECTION: Sub-Level Sector B        DESK NO.: #302',
          '--------------------------------------------------',
          'ITEM DESCRIPTION           UNIT             QTY',
          '--------------------------------------------------',
          '1. Black Redaction Markers 12/box           2 boxes',
          '2. No. 12 Steel Staples    1000/box         3 boxes',
          '3. Kraft Archival Folders  Legal            10 pcs',
          '4. Clear Scotch Tape       18mm             2 rolls',
          '5. Blue-Black Carbon Paper 50/pack          1 pack',
          '--------------------------------------------------',
          'REQUESTED BY: #302                 STATUS: APPROVED',
        ];
      }
      if (actStage === 2) {
        return [
          'TCD MONTHLY OFFICE SUPPLIES REQUISITION (FORM-SUP-84)',
          '==================================================',
          'SECTION: Sub-Level Sector B        DESK NO.: #302',
          '--------------------------------------------------',
          'ITEM DESCRIPTION           UNIT             QTY',
          '--------------------------------------------------',
          '1. Black Redaction Markers 12/box           30 boxes',
          '2. Red-Painted No.12 Stapl 1000/box         12 boxes',
          '3. Round Smiley Stickers   100/sheet        1 sheet',
          '4. Clear Scotch Tape       18mm             0 (VOID)',
          '5. Heavy Cabinet #3 Latch  Steel            2 sets',
          '--------------------------------------------------',
          'AUDIT NOTE: Why red-painted staples? Desk #209 never signed.',
        ];
      }
      return [
        'TCD MODEL OFFICE SUPPLIES REQUISITION (FORM-SUN-302)',
        '==================================================',
        'SECTION: MODEL HONOR DESK          DESK NO.: #302 ★',
        '--------------------------------------------------',
        'ITEM DESCRIPTION           UNIT             QTY',
        '--------------------------------------------------',
        '1. Gold Star Award Stickers 100/sheet       5 sheets',
        '2. No. 12 Standard Staples  1000/box        2 boxes',
        '3. Kraft Archival Folders   Legal           10 pcs',
        '4. Lemon Sticky Notes       100/pad         3 pads',
        '5. Chamomile Tea Sampler    20/box          2 boxes',
        '--------------------------------------------------',
        'REQUESTED BY: #302                 STATUS: APPROVED ★',
        'NOTE: Thank you for keeping our records neat and cheerful!',
      ];
    },
  },
  {
    id: 'handover_209',
    filenameZh: '值班交接备忘录_209.TXT',
    filenameEn: 'SHIFT_MEMO_209.TXT',
    size: '0.9 KB',
    dateZh: '11-13 23:18',
    dateEn: 'NOV-13 23:18',
    getBody: (actStage, lang) => {
      if (lang === 'zh') {
        if (actStage === 1) {
          return [
            '发件工位：#209 (Arthur) -> 收件工位：#302',
            '时间：11月13日 23:18',
            '--------------------------------------------------',
            '老兄，今晚前半班的常规脱敏我都整理好了。',
            '打字机右侧的回车杆有点发涩，敲的时候记得稍微使点劲。',
            '我先去走廊尽头核对一下 3 号档案柜的旧编号，马上回来。',
            '要是回来晚了，你先帮我盯一下电脑上的内网通告。',
            '',
            '—— Arthur (#209)',
          ];
        }
        if (actStage === 2) {
          return [
            '发件工位：#209 (Arthur) -> 收件工位：#302',
            '时间：11月13日 23:41 [系统时间戳冲突：11月17日]',
            '--------------------------------------------------',
            '你刚才盯着贴在屏幕框上的那张照片数了五秒，但我凑近看了——',
            '那根本不是一家三口，边角明显是拿裁纸刀硬拼上去的。',
            '还有，你铝饭盒里散发出来的不是炖肉味，是受潮的旧纸味。',
            '如果明天一早我没出现在隔壁隔断后面，别去拉 3 号柜最底层。',
            '',
            '—— Arthur',
          ];
        }
        return [
          '发件工位：#209 (Arthur) -> 收件工位：#302',
          '日期：阳光模范周 · 周五',
          '--------------------------------------------------',
          '老兄，祝贺你获评本月市政“微笑模范档案员”！',
          '我休假这段时间有你顶班真是太安心了。茶水间给你留了现磨咖啡，',
          '祝你今晚值班轻松愉快，明天见！',
          '',
          '—— 你的好朋友 Arthur (#209) ☺',
        ];
      }

      if (actStage === 1) {
        return [
          'FROM: DESK #209 (Arthur) -> TO: DESK #302',
          'TIMESTAMP: NOV 13 23:18',
          '--------------------------------------------------',
          'Hey partner—cleared the early batch for tonight.',
          'The typewriter carriage return sticks a little; hit it firmly.',
          'Stepping down the hall to double-check Cabinet #3 labels.',
          'If I run late, keep an eye on the intranet notice for me.',
          '',
          '— Arthur (#209)',
        ];
      }
      if (actStage === 2) {
        return [
          'FROM: DESK #209 (Arthur) -> TO: DESK #302',
          'TIMESTAMP: NOV 13 23:41 [CONFLICT: NOV 17]',
          '--------------------------------------------------',
          'You just stared at that taped Polaroid for five seconds again,',
          'but I looked close—it is three cut-up scraps taped together.',
          'And that tin lunchbox does not smell like stew. It smells like wet paper.',
          'If I am not behind the frosted glass tomorrow, do NOT open Drawer 3.',
          '',
          '— Arthur',
        ];
      }
      return [
        'FROM: DESK #209 (Arthur) -> TO: DESK #302',
        'DATE: SUNSHINE MODEL WEEK · FRIDAY',
        '--------------------------------------------------',
        'Hey buddy—congratulations on Model Archivist of the Month!',
        'Sector B runs so smoothly with you on desk duty while I am on leave.',
        'Enjoy the fresh coffee and have a wonderful, stress-free shift!',
        '',
        '— Your friend, Arthur (#209) ☺',
      ];
    },
  },
  {
    id: 'wellness_excerpt',
    filenameZh: '员工心理锚定指南_节选.TXT',
    filenameEn: 'WELLNESS_ANCHOR_EXCERPT.TXT',
    size: '1.1 KB',
    dateZh: '08-01 08:00',
    dateEn: 'AUG-01 08:00',
    getBody: (actStage, lang) => {
      if (lang === 'zh') {
        if (actStage === 1) {
          return [
            '《更正部员工心理健康手册》第 4 节节选',
            '--------------------------------------------------',
            '地下 B 区长期缺乏自然采光，为保证档案员认知稳定：',
            '1. 每日上岗前，请注视贴在显示器边框上的个人家庭合影 5 秒。',
            '2. 默念家庭成员称谓，确认个人归属感与班次边界。',
            '3. 若感到疲倦，请饮用热黑咖啡并专注于眼前屏幕，勿频繁离岗。',
          ];
        }
        if (actStage === 3) {
          return [
            '《更正部幸福员工每日感恩清单》★',
            '--------------------------------------------------',
            '美好的一天从这里开始！',
            '1. 今天也为能够服务市政模范科室而心怀感激。',
            '2. 喝一杯暖胃咖啡，和同事们保持融洽友爱。',
            '3. 工作完成后记得给自己一个大大的微笑！',
          ];
        }
        return [
          '《更正部员工心理健康手册》第 4 节 [底层临床批注显影]',
          '--------------------------------------------------',
          '1. 每日上岗前注视合影 5 秒。',
          '   [批注：主体 #302 无已登记配偶或子女。照片系剪报拼贴物。]',
          '2. 默念家庭成员称谓。',
          '   [批注：C-14（林）= 投射“妻子”；M-04 寻人启事 = 投射“女儿”。]',
          '3. 勿频繁离岗。',
          '   [批注：禁止向 #302 告知地下 B 区已废弃 1,095 日的事实。]',
        ];
      }

      if (actStage === 1) {
        return [
          'TCD EMPLOYEE WELLNESS PAMPHLET — SECTION 4 EXCERPT',
          '--------------------------------------------------',
          'Due to lack of natural light in Sub-Level Sector B:',
          '1. Before every shift, gaze at your taped family photo for 5 seconds.',
          '2. Silently confirm your family bonds and duty boundaries.',
          '3. When fatigued, drink black coffee and stay focused on your screen.',
        ];
      }
      if (actStage === 3) {
        return [
          'TCD DAILY GRATITUDE & WELLNESS BULLETIN ★',
          '--------------------------------------------------',
          'A bright and productive shift starts with a smile!',
          '1. Take pride in supporting our Municipal Model Department.',
          '2. Enjoy a warm cup of coffee and stay connected with your team.',
          '3. Remember: every day at Desk #302 is a gift!',
        ];
      }
      return [
        'TCD EMPLOYEE WELLNESS PAMPHLET — SEC. 4 [CLINICAL FOOTNOTES]',
        '--------------------------------------------------',
        '1. Gaze at taped family photo for 5 seconds.',
        '   [NOTE: Subject #302 has no registered spouse or child. Composite collage.]',
        '2. Confirm family bonds.',
        '   [NOTE: C-14 Lin = projected "Wife"; Case M-04 flyer = projected "Daughter".]',
        '3. Stay focused on your screen.',
        '   [NOTE: Do NOT inform #302 that Sector B closed 1,095 days ago.]',
      ];
    },
  },
];

export const RECYCLE_FRAGMENTS: RecycleFragment[] = [
  {
    id: 'frag_arthur_log',
    filename: 'ARTHUR_209_LOG.FRG',
    origin: 'C:\\USERS\\209\\LOGS\\',
    size: '4.2 KB',
    deletedAt: '11-14 02:14',
    bodyZh:
      '[碎片损坏 64%]\n……02:11 听见 3 号柜锁芯自己转了半圈。\n我喊了 #302 的名字，他头也没回，手里握着那把贴了半张笑脸贴纸的红订书机。\n他说：“Arthur，别去三楼交卡了，把工牌放杯子里就行，我们四个正好凑齐。”\n[EOF_CORRUPTED // HANDLE STILL OPEN]',
    bodyEn:
      '[FRAGMENT CORRUPTED 64%]\n...02:11 heard Cabinet #3 latch click on its own.\nI called out to #302. He didn’t turn—just gripped the red stapler with half a smiley sticker.\nHe said: "Arthur, skip 3F. Drop your badge in the mug—four of us make a full page."\n[EOF_CORRUPTED // HANDLE STILL OPEN]',
  },
  {
    id: 'frag_drawer_audio',
    filename: 'DRAWER_03_AUDIO.WAV.ERR',
    origin: 'C:\\TCD\\AUDIO_CACHE\\',
    size: '128 KB',
    deletedAt: '11-14 02:19',
    bodyZh:
      '[音频转写残片 // 采样率 8000Hz]\n00:00:02 [金属抽屉推合声]\n00:00:05 [闷响：指节从铁皮柜内侧连续敲击三下]\n00:00:09 未知男声（疑似 #209）："……别关……灯……"\n00:00:13 [订书机重压声 × 2]\n00:00:15 [平稳的呼吸声 —— 持续至今]',
    bodyEn:
      '[AUDIO TRANSCRIPT FRAGMENT // 8000Hz MONO]\n00:00:02 [Heavy steel drawer sliding shut]\n00:00:05 [Muffled knuckles knocking three times from inside]\n00:00:09 Male voice (est. #209): "...don’t cut... the lamp..."\n00:00:13 [Heavy stapler press x2]\n00:00:15 [Steady breathing — STILL RECORDING]',
  },
  {
    id: 'frag_badge_hash',
    filename: 'ID_209_MERGER.TMP',
    origin: 'C:\\302\\INDEX\\',
    size: '0.6 KB',
    deletedAt: 'ERR_DATE',
    bodyZh:
      'INDEX_NODE: #209 (ARTHUR)\nBINDING_METHOD: NO.12_STAPLE_RED\nSTATUS: ATTACHED_TO_302\nWARNING: 不可删除。删除该节点将导致 #302 视觉锚定坍塌。',
    bodyEn:
      'INDEX_NODE: #209 (ARTHUR)\nBINDING_METHOD: NO.12_STAPLE_RED\nSTATUS: ATTACHED_TO_302\nWARNING: CANNOT PURGE. DELETION COLLAPSES #302 VISUAL ANCHOR.',
  },
];

export const AUDIT_OPTIONS: AuditOptionItem[] = [
  {
    id: 'A',
    labelZh: 'Arthur（#209 号前任调查员）',
    labelEn: 'Arthur (Former Archivist #209)',
  },
  {
    id: 'B',
    labelZh: '#302 号标准档案文员',
    labelEn: 'Standard Clerk #302',
  },
  {
    id: 'C',
    labelZh: '尽职的丈夫与父亲',
    labelEn: 'Devoted Husband & Father',
  },
  {
    id: 'D',
    labelZh: '林氏（C-14）/ 走失女童（M-04）',
    labelEn: 'Lin (C-14) & Missing Girl (M-04)',
  },
  {
    id: 'E',
    labelZh: '一份尚未归档的异常记录',
    labelEn: 'An Unfiled Anomalous Record',
  },
  {
    id: 'F',
    labelZh: '以上均不是',
    labelEn: 'None of the Above',
  },
];

export const NOTEPAD_GHOST_LINES: Record<Language, string[]> = {
  zh: [
    '别盯着屏幕太久，你身后没人。',
    '屏幕外面的光太亮了，把光标移开。',
    '3号柜里还有空位。你听见敲门声了吗？',
  ],
  en: [
    'Stop staring at the screen. Nobody is behind you.',
    'The glare outside the glass is too bright. Move your cursor.',
    'Cabinet #3 still has an open slot. Did you hear that knock?',
  ],
};
