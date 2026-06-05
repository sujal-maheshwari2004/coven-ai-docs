import {useRef, useState, useEffect, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

// ─── Hooks ─────────────────────────────────────────────────────────────────

function useTypewriter(words: string[], typingMs = 65, deleteMs = 32, pauseMs = 2400) {
  const [text, setText] = useState('');
  const state = useRef({wi: 0, ci: 0, del: false});

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const {wi, ci, del} = state.current;
      const word = words[wi];
      if (!del && ci < word.length) {
        state.current.ci++;
        setText(word.slice(0, state.current.ci));
        t = setTimeout(tick, typingMs);
      } else if (!del && ci === word.length) {
        t = setTimeout(() => { state.current.del = true; tick(); }, pauseMs);
      } else if (del && ci > 0) {
        state.current.ci--;
        setText(word.slice(0, state.current.ci));
        t = setTimeout(tick, deleteMs);
      } else {
        state.current.del = false;
        state.current.wi = (wi + 1) % words.length;
        t = setTimeout(tick, 320);
      }
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [words, typingMs, deleteMs, pauseMs]);

  return text;
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      {threshold},
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

// ─── Particle Canvas ───────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type P = {x:number;y:number;vx:number;vy:number;r:number;life:number;max:number;col:string};
    const COLORS = ['rgba(199,125,255,','rgba(157,78,221,','rgba(255,107,53,','rgba(255,179,80,'];
    const make = (): P => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.6 + 0.2),
      r: Math.random() * 2.2 + 0.5,
      life: 0,
      max: Math.random() * 220 + 140,
      col: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
    const particles: P[] = Array.from({length: 65}, () => {
      const p = make(); p.y = Math.random() * canvas.height; p.life = Math.random() * p.max; return p;
    });

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.life++;
        if (p.life >= p.max) { Object.assign(p, make()); return; }
        p.x += p.vx; p.y += p.vy;
        const t = p.life / p.max;
        const op = t < 0.2 ? t/0.2 : t > 0.8 ? (1-t)/0.2 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `${p.col}${(op*0.75).toFixed(2)})`;
        ctx.shadowBlur  = p.r * 8;
        ctx.shadowColor = `${p.col}0.4)`;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} className={styles.particleCanvas} />;
}

// ─── Sigil ─────────────────────────────────────────────────────────────────

function Sigil() {
  const cx = 200, cy = 200, r = 145;
  const pts = Array.from({length: 6}, (_, i) => {
    const a = (i * 60 - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });
  const tri1 = `${pts[0].join(',')} ${pts[2].join(',')} ${pts[4].join(',')}`;
  const tri2 = `${pts[1].join(',')} ${pts[3].join(',')} ${pts[5].join(',')}`;

  return (
    <svg className={styles.sigil} viewBox="0 0 400 400" aria-hidden fill="none">
      {/* Outer rings */}
      <g className={styles.sigilOuter}>
        <circle cx={cx} cy={cy} r={192} stroke="rgba(199,125,255,0.08)" strokeWidth="1" strokeDasharray="3 9"/>
        <circle cx={cx} cy={cy} r={183} stroke="rgba(199,125,255,0.05)" strokeWidth="0.5"/>
        {/* Tick marks every 30° */}
        {Array.from({length: 12}, (_, i) => {
          const a = (i * 30) * Math.PI/180;
          const x1 = cx + 183 * Math.cos(a), y1 = cy + 183 * Math.sin(a);
          const x2 = cx + 175 * Math.cos(a), y2 = cy + 175 * Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(199,125,255,0.15)" strokeWidth="1"/>;
        })}
      </g>
      {/* Inner geometry */}
      <g className={styles.sigilInner}>
        <circle cx={cx} cy={cy} r={160} stroke="rgba(199,125,255,0.06)" strokeWidth="0.5"/>
        <circle cx={cx} cy={cy} r={65}  stroke="rgba(199,125,255,0.1)"  strokeWidth="0.5" strokeDasharray="2 5"/>
        <circle cx={cx} cy={cy} r={30}  stroke="rgba(224,64,251,0.12)"  strokeWidth="0.5"/>
        {/* Hexagram */}
        <polygon points={tri1} stroke="rgba(199,125,255,0.18)" strokeWidth="0.8"/>
        <polygon points={tri2} stroke="rgba(224,64,251,0.12)"  strokeWidth="0.8"/>
        {/* Six point nodes */}
        {pts.map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5}
            fill="rgba(199,125,255,0.5)"
            style={{filter:'blur(0.5px)'}}
          />
        ))}
        {/* Radial spokes */}
        {pts.map(([x,y], i) => (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y}
            stroke="rgba(199,125,255,0.06)" strokeWidth="0.5"/>
        ))}
      </g>
      {/* Center */}
      <circle cx={cx} cy={cy} r={5} fill="rgba(157,78,221,0.5)"
        style={{filter:'blur(1px)'}}/>
      <circle cx={cx} cy={cy} r={2} fill="rgba(199,125,255,0.9)"/>
    </svg>
  );
}

// ─── Ticker ────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  {t:'info', s:'◈ task received'},
  {t:'run',  s:'⚡ spawning market_researcher'},
  {t:'run',  s:'⚡ spawning competitor_analyst'},
  {t:'run',  s:'⚡ spawning data_analyst'},
  {t:'info', s:'⬡ building dependency graph'},
  {t:'done', s:'✓ 0 cycles — graph valid'},
  {t:'run',  s:'▶ level 0: data_ingestion'},
  {t:'run',  s:'▶ level 1: market_researcher ‖ competitor_analyst'},
  {t:'done', s:'✓ level 1 complete (2 agents, parallel)'},
  {t:'run',  s:'▶ level 2: synthesizer_market_data'},
  {t:'done', s:'✓ synthesis complete · QC notes attached'},
  {t:'run',  s:'▶ level 3: strategy_agent'},
  {t:'done', s:'✓ strategy_agent complete'},
  {t:'info', s:'◈ compiling 8 artifacts'},
  {t:'done', s:'✓ pipeline complete — 6 agents · 8 artifacts'},
];

function RunTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop
  return (
    <div className={styles.ticker}>
      <div className={styles.tickerTrack}>
        {items.map((item, i) => (
          <span
            key={i}
            className={`${styles.tickerItem} ${
              item.t === 'done' ? styles.tickerDone :
              item.t === 'run'  ? styles.tickerRun  : styles.tickerInfo
            }`}
          >
            {item.s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

const TASKS = [
  '"Go-to-market strategy for a B2B SaaS product"',
  '"Competitive analysis for an AI infrastructure startup"',
  '"Research report on LLM inference optimization"',
  '"Technical architecture for a microservices migration"',
  '"Investment thesis for a climate tech portfolio"',
];

function Hero() {
  const task = useTypewriter(TASKS);
  return (
    <header className={styles.heroBanner}>
      <ParticleCanvas />
      <Sigil />

      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgePulse} />
          v0.2.0 · open source
        </div>

        <h1 className={styles.heroTitle}>Coven</h1>

        <p className={styles.heroTypewriter}>
          {task || ' '}
          <span className={styles.heroTypewriterCursor} aria-hidden />
        </p>

        <p className={styles.heroTagline}>
          Speak the task. The coven does the rest.{' '}
          <strong>Spawn agents.</strong> Wire the graph.{' '}
          <strong>Execute in parallel.</strong> Compile to output.
        </p>

        <div className={styles.terminal}>
          <div className={styles.terminalBar}>
            <span className={`${styles.dot} ${styles.dotR}`}/>
            <span className={`${styles.dot} ${styles.dotY}`}/>
            <span className={`${styles.dot} ${styles.dotG}`}/>
            <span className={styles.terminalFile}>main.py</span>
          </div>
          <div className={styles.terminalBody}>
            <pre><code>
              <span className={styles.kw}>from</span>{' '}
              <span className={styles.mod}>coven</span>{' '}
              <span className={styles.kw}>import</span>{' '}
              <span className={styles.cls}>Coven</span>
              {'\n\n'}
              <span className={styles.cmt}>{'# one call. five stages. zero boilerplate.'}</span>
              {'\n'}
              <span className={styles.var}>coven</span>
              {' = '}
              <span className={styles.cls}>Coven</span>
              <span className={styles.pun}>{'('}</span>
              {'model='}
              <span className={styles.str}>"gpt-4o"</span>
              <span className={styles.pun}>{')'}</span>
              {'\n'}
              <span className={styles.var}>dag</span>
              {'   = '}
              <span className={styles.kw}>await</span>
              {' coven.'}
              <span className={styles.fn}>run</span>
              <span className={styles.pun}>{'('}</span>
              <span className={styles.str}>"Produce a go-to-market strategy for a B2B SaaS product"</span>
              <span className={styles.pun}>{')'}</span>
              {'\n'}
              <span className={styles.fn}>print</span>
              <span className={styles.pun}>{'('}</span>
              {'coven.'}
              <span className={styles.fn}>to_text</span>
              <span className={styles.pun}>{'('}</span>
              <span className={styles.var}>dag</span>
              <span className={styles.pun}>{'))'}</span>
            </code></pre>
          </div>
        </div>

        <div className={styles.buttons}>
          <Link className={styles.btnPrimary} to="/docs/getting-started">
            Get Started →
          </Link>
          <Link className={styles.btnGhost} to="/docs/how-it-works">
            How It Works
          </Link>
          <Link className={styles.btnGhost} href="https://github.com/sujal-maheshwari2004/coven">
            GitHub
          </Link>
        </div>

        <div className={styles.installPill}>
          $ pip install <strong>coven-ai</strong>
        </div>
      </div>
    </header>
  );
}

// ─── Pipeline ──────────────────────────────────────────────────────────────

const STAGES = [
  {
    num: 'STAGE_01',
    name: 'Decomposer',
    desc: 'Breaks your task into focused agent nodes and artifacts. Each node gets a scoped system prompt, artifact wiring, and tool descriptions.',
    accent: 'rgba(199,125,255,0.5)',
    glow: 'rgba(157,78,221,0.12)',
  },
  {
    num: 'STAGE_02',
    name: 'Graph Builder',
    desc: 'Verifies wiring, formalizes all edges, detects and repairs mismatches, flags multi-contributor artifacts for synthesis. Cycle check is algorithmic — the LLM can\'t skip it.',
    accent: 'rgba(99,102,241,0.5)',
    glow: 'rgba(99,102,241,0.1)',
  },
  {
    num: 'STAGE_03',
    name: 'Sorter',
    desc: 'Pure topological sort via networkx. Produces execution levels — each level runs in full parallel. No LLM, no guessing. Pre-sort validation catches bad states before they run.',
    accent: 'rgba(245,158,11,0.5)',
    glow: 'rgba(245,158,11,0.1)',
  },
  {
    num: 'STAGE_04',
    name: 'Executor',
    desc: 'Level-wise asyncio.gather. Nodes with query_tool get a dedicated ToolStorePy MCP server built before execution. Parallel nodes build in parallel. Failure in any level halts the run.',
    accent: 'rgba(255,107,53,0.5)',
    glow: 'rgba(255,107,53,0.1)',
  },
  {
    num: 'STAGE_05',
    name: 'Compiler',
    desc: 'Reads every artifact body and compiles a structured final output: title, summary, sections with source citations, recommendations, and synthesis QC metadata.',
    accent: 'rgba(236,72,153,0.5)',
    glow: 'rgba(236,72,153,0.1)',
  },
];

function PipelineSection() {
  const [rowRef, rowVisible] = useReveal();
  return (
    <section className={styles.pipelineSection}>
      <div className="container">
        <p className={styles.sectionEyebrow}>The Ritual</p>
        <h2 className={styles.sectionTitle}>Five stages. One incantation.</h2>
        <p className={styles.sectionSub}>
          Each stage is isolated, validated, and can't corrupt the next.
          The graph is never trusted on structure alone.
        </p>

        <div className={styles.pipelineRow} ref={rowRef}>
          {STAGES.map((s, i) => (
            <>
              <div
                key={s.num}
                className={`${styles.stageWrap} ${rowVisible ? styles.visible : ''}`}
              >
                <div
                  className={styles.stageCard}
                  style={{'--stage-accent': s.accent, '--stage-glow': s.glow} as React.CSSProperties}
                >
                  <span className={styles.stageNum}
                    style={{color: s.accent} as React.CSSProperties}>
                    {s.num}
                  </span>
                  <div className={styles.stageName}>{s.name}</div>
                  <p className={styles.stageDesc}>{s.desc}</p>
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div key={`arr-${i}`} className={styles.stageArrow}>›</div>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '◎',
    title: 'Plain English in. Finished output out.',
    desc: 'No DSL, no YAML, no agent config. Describe your task and Coven handles decomposition, wiring, and execution automatically.',
    glow: 'rgba(199,125,255,0.08)',
  },
  {
    icon: '⚡',
    title: 'The coven thinks in parallel.',
    desc: '10 agents across 3 dependency levels = 3 round trips. asyncio.gather runs every level concurrently. Nothing waits that doesn\'t have to.',
    glow: 'rgba(245,158,11,0.08)',
  },
  {
    icon: '⬡',
    title: 'Auto MCP servers, per agent.',
    desc: 'Agents describe tools in plain English. Coven calls ToolStorePy, builds a dedicated MCP server per node, and injects it before execution — automatically.',
    glow: 'rgba(99,102,241,0.08)',
  },
  {
    icon: '⧖',
    title: 'Conflicting agents? Synthesized.',
    desc: 'When multiple agents write to the same artifact, a Synthesizer node is auto-injected. It merges, reconciles, and attaches QC notes. You never wired it.',
    glow: 'rgba(157,78,221,0.08)',
  },
  {
    icon: '∿',
    title: 'gpt-4o. claude. gemini. yours.',
    desc: 'LiteLLM under the hood. Any provider, any model string. Switch with one argument. OpenAI, Anthropic, Azure, Gemini — all work.',
    glow: 'rgba(255,107,53,0.08)',
  },
  {
    icon: '◈',
    title: 'Structure all the way down.',
    desc: 'Pydantic + instructor on every stage. No freeform text parsing. Every LLM response is validated before the next stage runs. Garbage in, error out.',
    glow: 'rgba(236,72,153,0.08)',
  },
];

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <p className={styles.sectionEyebrow}>The Craft</p>
        <h2 className={styles.sectionTitle}>Built different.</h2>
        <p className={styles.sectionSub}>
          Not a chat wrapper. Not a prompt chain. A real orchestration framework.
        </p>

        <div className={styles.featuresGrid}>
          {FEATURES.map(f => (
            <div
              key={f.title}
              className={styles.featureCell}
              style={{'--feat-glow': f.glow} as React.CSSProperties}
            >
              <span className={styles.featureIcon}
                style={{'--feat-glow': f.glow.replace('0.08', '0.5')} as React.CSSProperties}>
                {f.icon}
              </span>
              <div className={styles.featureTitle}>{f.title}</div>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Output Preview ────────────────────────────────────────────────────────

function OutputSection() {
  const [ref, visible] = useReveal(0.1);
  return (
    <section className={styles.outputSection}>
      <div className="container">
        <div className={styles.outputInner}>
          <div className={styles.outputText}>
            <p className={styles.sectionEyebrow}>The Result</p>
            <h2 className={styles.sectionTitle}>
              One call.<br />One coherent result.
            </h2>
            <p className={styles.outputBody}>
              <code>coven.to_text(dag)</code> renders a structured report — sections, citations, recommendations, and synthesis metadata. Or access the raw dict directly.
            </p>
            <ul className={styles.outputList}>
              <li>Every section cites its source artifacts</li>
              <li>Synthesizer QC notes surfaced in metadata</li>
              <li>Inspect every node status after the run</li>
              <li>Raw access via <code>dag.final_output</code>, <code>dag.nodes</code>, <code>dag.artifacts</code></li>
            </ul>
          </div>

          <div
            className={styles.outTerminal}
            ref={ref}
            style={{opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease'}}
          >
            <div className={styles.outTerminalBar}>
              <span className={`${styles.dot} ${styles.dotR}`}/>
              <span className={`${styles.dot} ${styles.dotY}`}/>
              <span className={`${styles.dot} ${styles.dotG}`}/>
              <span className={styles.terminalFile}>output</span>
            </div>
            <div className={styles.outTerminalBody}>
              <span className={styles.outSep}>{'════════════════════════════════════════════'}</span>{'\n'}
              <span className={styles.outTitle}>{'GO-TO-MARKET STRATEGY: B2B SAAS PRODUCT'}</span>{'\n'}
              <span className={styles.outSep}>{'════════════════════════════════════════════'}</span>{'\n\n'}
              <span className={styles.outBody}>{'Executive summary of what was produced...'}</span>{'\n\n'}
              <span className={styles.outHead}>{'── Market Analysis ──────────────────────────'}</span>{'\n'}
              <span className={styles.outBody}>{'Market sizing, segments, growth trends...'}</span>{'\n'}
              <span className={styles.outSrc}>{'  [sources: market_analysis_report]'}</span>{'\n\n'}
              <span className={styles.outHead}>{'── Competitive Landscape ────────────────────'}</span>{'\n'}
              <span className={styles.outBody}>{'Positioning gaps and differentiators...'}</span>{'\n'}
              <span className={styles.outSrc}>{'  [sources: competitive_analysis]'}</span>{'\n\n'}
              <span className={styles.outHead}>{'── Recommendations ──────────────────────────'}</span>{'\n'}
              <span className={styles.outRec}>{'  1. Target mid-market — faster sales cycles'}</span>{'\n'}
              <span className={styles.outRec}>{'  2. Lead with integration story'}</span>{'\n\n'}
              <span className={styles.outMeta}>{'── Metadata ─────────────────────────────────'}</span>{'\n'}
              <span className={styles.outMeta}>{'  Agents: 6  ·  Artifacts: 8'}</span>{'\n'}
              <span className={styles.outSep}>{'════════════════════════════════════════════'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaContent}>
        <h2 className={styles.ctaTitle}>Ready to summon<br />your first pipeline?</h2>
        <p className={styles.ctaBody}>
          Two minutes from install to first run.<br />
          One model string. Infinite complexity.
        </p>
        <div className={styles.buttons}>
          <Link className={styles.btnPrimary} to="/docs/getting-started">
            Get Started →
          </Link>
          <Link className={styles.btnGhost} href="https://pypi.org/project/coven-ai/">
            View on PyPI
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Multi-agent DAG pipeline framework. Speak the task — Coven spawns specialized agents, builds the dependency graph, executes in parallel, and compiles the output.">
      <Hero />
      <RunTicker />
      <main>
        <PipelineSection />
        <FeaturesSection />
        <OutputSection />
        <CTASection />
      </main>
    </Layout>
  );
}
