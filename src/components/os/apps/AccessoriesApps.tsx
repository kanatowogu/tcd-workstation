import React, { useEffect, useRef, useState } from 'react';
import { ActStage, Language } from '../../../types';
import { soundEngine } from '../../../utils/soundEngine';
import { NOTEPAD_GHOST_LINES } from '../osData';

/* ============================================================================
   1. CALC.EXE — RETRO CALCULATOR WITH ACT 2–3 SUBVERSIVE ANOMALIES
   ============================================================================ */
interface CalcAppProps {
  lang: Language;
  actStage: ActStage;
  onDiscoverAnomaly: (key: string, subtitle?: string) => void;
}

export const CalcApp: React.FC<CalcAppProps> = ({
  lang,
  actStage,
  onDiscoverAnomaly,
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [storedVal, setStoredVal] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [waitingNext, setWaitingNext] = useState<boolean>(false);
  const [anomalyBanner, setAnomalyBanner] = useState<string | null>(null);
  const calcCountRef = useRef<number>(0);

  const inputDigit = (digit: string) => {
    soundEngine.playKeyClick();
    setAnomalyBanner(null);
    if (waitingNext) {
      setDisplay(digit);
      setWaitingNext(false);
    } else {
      setDisplay(display === '0' ? digit : (display + digit).slice(0, 12));
    }
  };

  const inputDot = () => {
    soundEngine.playKeyClick();
    setAnomalyBanner(null);
    if (waitingNext) {
      setDisplay('0.');
      setWaitingNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    soundEngine.playKeyClick();
    setDisplay('0');
    setStoredVal(null);
    setPendingOp(null);
    setWaitingNext(false);
    setAnomalyBanner(null);
  };

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? 0 : a / b;
      default:
        return b;
    }
  };

  const handleOperator = (nextOp: string) => {
    soundEngine.playKeyClick();
    const currentVal = Number.parseFloat(display) || 0;
    if (storedVal === null) {
      setStoredVal(currentVal);
    } else if (pendingOp && !waitingNext) {
      const res = compute(storedVal, currentVal, pendingOp);
      setStoredVal(res);
      setDisplay(String(Number(res.toFixed(6))));
    }
    setPendingOp(nextOp);
    setWaitingNext(true);
  };

  const handleEquals = () => {
    calcCountRef.current += 1;
    const currentVal = Number.parseFloat(display) || 0;
    const rawResult =
      storedVal !== null && pendingOp
        ? compute(storedVal, currentVal, pendingOp)
        : currentVal;

    // Subversive Anomalies strictly in Act 2 (Act 3 stays 100% clean & normal)
    const shouldOverride =
      actStage === 2 && (calcCountRef.current === 1 || Math.random() < 0.45);

    if (shouldOverride) {
      soundEngine.playGlitch();
      const useRealClock = Math.random() < 0.5;
      if (useRealClock) {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const realTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
          now.getSeconds()
        )}`;
        setDisplay(realTime);
        setAnomalyBanner(
          lang === 'zh'
            ? '[同步到外部现实钟表]'
            : '[SYNCED TO EXTERNAL CLOCK]'
        );
        onDiscoverAnomaly(
          'calc_clock_anomaly',
          lang === 'zh'
            ? `计算器怎么跳出了现在的准确时间（${realTime}）……`
            : `Why did CALC.EXE just print the exact real-world time (${realTime})?`
        );
      } else {
        setDisplay('302');
        setAnomalyBanner(
          lang === 'zh' ? '[索引强制锁定：302]' : '[INDEX OVERRIDE: 302]'
        );
        onDiscoverAnomaly(
          'calc_302_anomaly',
          lang === 'zh'
            ? '不管怎么算，结果都只剩下 302。'
            : 'No matter what I enter, the answer snaps back to 302.'
        );
      }
      setStoredVal(null);
      setPendingOp(null);
      setWaitingNext(true);
      return;
    }

    soundEngine.playKeyClick();
    setDisplay(String(Number(rawResult.toFixed(6))));
    setStoredVal(null);
    setPendingOp(null);
    setWaitingNext(true);
  };

  return (
    <div className="os-calc">
      <div className={`os-calc-screen ${anomalyBanner ? 'calc-glitched' : ''}`}>
        <div className="os-calc-status">
          {anomalyBanner ?? (pendingOp ? `OP: ${pendingOp}` : 'TCD-CALC v1.8')}
        </div>
        <div className="os-calc-digits">{display}</div>
      </div>

      <div className="os-calc-grid">
        <button type="button" className="os-calc-btn fn" onClick={clearAll}>
          C
        </button>
        <button
          type="button"
          className="os-calc-btn fn"
          onClick={() => {
            soundEngine.playKeyClick();
            setDisplay('0');
          }}
        >
          CE
        </button>
        <button
          type="button"
          className="os-calc-btn fn"
          onClick={() => {
            soundEngine.playKeyClick();
            const n = Number.parseFloat(display);
            if (Number.isFinite(n)) setDisplay(String(-n));
          }}
        >
          ±
        </button>
        <button
          type="button"
          className="os-calc-btn op"
          onClick={() => handleOperator('÷')}
        >
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            className="os-calc-btn"
            onClick={() => inputDigit(d)}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="os-calc-btn op"
          onClick={() => handleOperator('×')}
        >
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            type="button"
            className="os-calc-btn"
            onClick={() => inputDigit(d)}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="os-calc-btn op"
          onClick={() => handleOperator('-')}
        >
          -
        </button>

        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            type="button"
            className="os-calc-btn"
            onClick={() => inputDigit(d)}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="os-calc-btn op"
          onClick={() => handleOperator('+')}
        >
          +
        </button>

        <button
          type="button"
          className="os-calc-btn zero"
          onClick={() => inputDigit('0')}
        >
          0
        </button>
        <button type="button" className="os-calc-btn" onClick={inputDot}>
          .
        </button>
        <button type="button" className="os-calc-btn eq" onClick={handleEquals}>
          =
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
   2. NOTEPAD.EXE — RETRO NOTEPAD WITH IDLE GHOSTLY SELF-TYPING & BACKSPACE
   ============================================================================ */
interface NotepadAppProps {
  lang: Language;
  actStage: ActStage;
  onDiscoverAnomaly: (key: string, subtitle?: string) => void;
}

export const NotepadApp: React.FC<NotepadAppProps> = ({
  lang,
  actStage,
  onDiscoverAnomaly,
}) => {
  const defaultNoteZh =
    '夜班备忘：\n- 核对 Arthur (#209) 未交班记录\n- 问一下茶水间咖啡机什么时候修好\n';
  const defaultNoteEn =
    'Night Shift Notes:\n- Check Arthur (#209) handover log\n- Ask when pantry coffee brewer is fixed\n';
  const [userText, setUserText] = useState<string>(
    lang === 'zh' ? defaultNoteZh : defaultNoteEn
  );
  const hasUserEditedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!hasUserEditedRef.current) {
      setUserText(lang === 'zh' ? defaultNoteZh : defaultNoteEn);
    }
  }, [lang]);
  const [ghostSuffix, setGhostSuffix] = useState<string>('');
  const [isGhostTyping, setIsGhostTyping] = useState<boolean>(false);
  const [lastTypedAt, setLastTypedAt] = useState<number>(() => Date.now());
  const ghostCountRef = useRef<number>(0);

  // Trigger ghostly self-typing strictly when left idle in Act 2 (Act 3 stays normal)
  useEffect(() => {
    if (actStage !== 2) {
      setGhostSuffix('');
      setIsGhostTyping(false);
      return;
    }

    let cancelled = false;
    const timeouts: number[] = [];

    const idleTimer = window.setTimeout(() => {
      if (cancelled) return;
      const lines = NOTEPAD_GHOST_LINES[lang];
      const chosen = lines[ghostCountRef.current % lines.length];
      ghostCountRef.current += 1;

      const prefix = '\n\n> ';
      const fullGhost = prefix + chosen;
      setIsGhostTyping(true);

      // Type character by character
      let delay = 0;
      for (let i = 1; i <= fullGhost.length; i++) {
        delay += 68;
        const slice = fullGhost.slice(0, i);
        timeouts.push(
          window.setTimeout(() => {
            if (cancelled) return;
            setGhostSuffix(slice);
            if (i % 2 === 0) soundEngine.playKeyClick();
          }, delay)
        );
      }

      // Notify awareness once fully visible
      timeouts.push(
        window.setTimeout(() => {
          if (cancelled) return;
          soundEngine.playGlitch();
          onDiscoverAnomaly(
            'notepad_ghost_typing',
            lang === 'zh'
              ? '我的手没碰键盘……记事本刚才自己打字又删掉了。'
              : 'My hands were off the keyboard... Notepad just typed and erased itself.'
          );
        }, delay + 180)
      );

      // Pause 1.5s then rapidly backspace everything
      let backDelay = delay + 1550;
      for (let i = fullGhost.length - 1; i >= 0; i--) {
        backDelay += 24;
        const slice = fullGhost.slice(0, i);
        timeouts.push(
          window.setTimeout(() => {
            if (cancelled) return;
            setGhostSuffix(slice);
            if (i === 0) {
              setIsGhostTyping(false);
              setLastTypedAt(Date.now() + 9000); // cool down before next haunt
            }
          }, backDelay)
        );
      }
    }, 4500);

    return () => {
      cancelled = true;
      window.clearTimeout(idleTimer);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [actStage, lang, lastTypedAt, onDiscoverAnomaly]);

  const displayedText = userText + ghostSuffix;

  return (
    <div className="os-notepad">
      <div className="os-notepad-menu">
        <span>{lang === 'zh' ? '文件(F)' : 'File'}</span>
        <span>{lang === 'zh' ? '编辑(E)' : 'Edit'}</span>
        <span className={isGhostTyping ? 'os-cell-alert' : ''}>
          {isGhostTyping
            ? lang === 'zh'
              ? '[外部键入检测...]'
              : '[UNKNOWN INPUT...]'
            : lang === 'zh'
            ? `字数: ${userText.length}`
            : `CHARS: ${userText.length}`}
        </span>
      </div>
      <textarea
        className={`os-notepad-area ${isGhostTyping ? 'ghost-active' : ''}`}
        value={displayedText}
        spellCheck={false}
        onChange={(e) => {
          if (isGhostTyping) return;
          hasUserEditedRef.current = true;
          setUserText(e.target.value);
          setLastTypedAt(Date.now());
        }}
      />
    </div>
  );
};
