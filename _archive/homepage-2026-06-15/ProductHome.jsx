"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader.jsx";
import { AboutPopup } from "../components/AboutPopup.jsx";

// ─── PRODUCT HOME (root /) ───────────────────────────────────────────
// Faithful React port of the finished mockup
// (4. Workflow harness/website mockups/home-scroll-deck-eclipsai-fonts.html).
//
// An eight-section vertical scroll-snap deck (Home, Why, How, What stays,
// Why now, Who, Pricing and value, Start) with a per-section progress bar and
// LinkedIn contact CTAs. The masthead is the shared <SiteHeader> rendered on
// every section, and a single shared <AboutPopup> (opened from any header or
// the footer) keeps the chrome identical to the rest of the site.
//
// Behaviour parity notes:
//  - The mockup put scroll-snap on <html>; here the snap container is the
//    `.ep-scroller` div so the behaviour is fully scoped to this route and
//    torn down on navigation away (no global <html> mutation).
//  - All section copy is ported verbatim from the mockup.

const LINKEDIN = "https://www.linkedin.com/in/chip-alexandru/";

// Ported verbatim from the mockup <style>, scoped under `.ep-scroller`. The
// masthead/About styles are gone — that chrome now lives in <SiteHeader> /
// <AboutPopup>. `--sans` resolves to the Inter face loaded via next/font.
const CSS = `
.ep-root{
  --bg:#F8F4EE;--surface:#FFFCF7;--border:rgba(74,28,42,.1);--borderLight:rgba(74,28,42,.06);
  --text:#4A1C2A;--textMed:#6B4B5A;--textLight:#8A7A76;--accent:#D04A28;--wine:#8C3A4F;
  --serif:Georgia, serif;
  --sans:var(--font-inter), 'Inter', -apple-system, sans-serif;
  height:100vh;height:100dvh;display:flex;flex-direction:column;
  background:var(--bg);color:var(--text);font-family:var(--sans);
}
.ep-root *{box-sizing:border-box}
.ep-scroller{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:y mandatory;scroll-behavior:smooth}
.ep-scroller::-webkit-scrollbar{width:5px}
.ep-scroller::-webkit-scrollbar-track{background:transparent}
.ep-scroller::-webkit-scrollbar-thumb{background:rgba(74,28,42,.12);border-radius:3px}
.ep-scroller .slide{min-height:100%;scroll-snap-align:start;display:flex;align-items:flex-start;justify-content:center;position:relative;padding:clamp(16px,3vh,40px) clamp(20px,4vw,48px)}
.ep-scroller .inner{max-width:960px;width:100%;display:flex;flex-direction:column;gap:clamp(28px,4vh,48px);padding:8px 4px}
.ep-scroller .h1{font-size:clamp(32px,5.2vw,60px);font-weight:600;margin:0;line-height:1.06;color:var(--text);letter-spacing:-1.2px;max-width:820px}
.ep-scroller .eb{font-size:11px;font-weight:800;letter-spacing:2px;color:var(--accent);text-transform:uppercase;margin:0 0 14px}
.ep-scroller .stmt{font-family:var(--serif);font-size:clamp(24px,3vw,30px);font-weight:700;line-height:1.2;letter-spacing:-.3px;margin:0 0 18px;color:var(--text);max-width:760px}
.ep-scroller .lead{font-size:clamp(16px,1.7vw,18px);line-height:1.6;color:var(--textMed);max-width:640px;margin:0}
.ep-scroller .home-title .home-line{display:block}
.ep-scroller .home-offer{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px 24px 24px;max-width:860px}
.ep-scroller .offer-label{font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin:0 0 12px}
.ep-scroller .offer-title{font-family:var(--serif);font-size:clamp(22px,2.6vw,28px);font-weight:800;line-height:1.22;letter-spacing:-.4px;color:var(--text);margin:0 0 12px;max-width:720px}
.ep-scroller .offer-copy{font-size:16px;line-height:1.62;color:var(--textLight);max-width:720px;margin:0}
.ep-scroller .offer-action{display:flex;justify-content:flex-end;margin-top:18px}
.ep-scroller .offer-action .text-action{color:var(--wine)}
.ep-scroller .text-action{font-size:15px;font-weight:600;color:var(--accent);text-decoration:none}
.ep-scroller .text-action:hover{text-decoration:underline;text-underline-offset:4px}
.ep-scroller .start-contact{font-size:16px;line-height:1.62;color:var(--textMed);max-width:680px;margin:18px 0 0}
.ep-scroller .start-contact .text-action{font-size:16px;color:#0A66C2}
.ep-scroller .footer-links a{color:var(--textLight);text-decoration:none}
.ep-scroller .footer-links a:hover{color:var(--accent);text-decoration:underline;text-underline-offset:4px}
.ep-scroller .bd{font-size:16px;line-height:1.62;color:var(--textMed);max-width:680px;margin:0 0 12px}
.ep-scroller .why-stack{display:flex;flex-direction:column;gap:12px;max-width:760px;margin-top:24px}
.ep-scroller .why-box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 20px}
.ep-scroller .why-box-label{font-family:var(--serif);font-size:17px;font-weight:700;line-height:1.25;color:var(--text);margin:0 0 8px}
.ep-scroller .why-box p{font-size:16px;line-height:1.62;color:var(--textMed);margin:0}
.ep-scroller .method-steps{display:flex;flex-direction:column;gap:12px;max-width:820px;margin-top:24px}
.ep-scroller .method-step{display:grid;grid-template-columns:42px 1fr;gap:16px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 20px}
.ep-scroller .method-num{font-family:var(--serif);font-size:20px;font-weight:700;color:var(--wine);line-height:1.2}
.ep-scroller .method-title{font-family:var(--serif);font-size:18px;font-weight:700;line-height:1.25;color:var(--text);margin:0 0 8px}
.ep-scroller .method-copy{font-size:16px;line-height:1.62;color:var(--textMed);margin:0}
.ep-scroller .proof-card{max-width:820px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-top:16px}
.ep-scroller .proof-title{font-family:var(--serif);font-size:17px;font-weight:800;color:var(--text);line-height:1.25;margin:0 0 12px}
.ep-scroller .proof-table{width:100%;border-collapse:collapse;font-size:13px}
.ep-scroller .proof-table th{font-size:11px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:var(--textLight);text-align:left;padding:0 0 8px}
.ep-scroller .proof-table th:not(:first-child),.ep-scroller .proof-table td:not(:first-child){text-align:right}
.ep-scroller .proof-table td{border-top:1px solid var(--borderLight);padding:10px 0;color:var(--textMed);line-height:1.35}
.ep-scroller .proof-table td:first-child{color:var(--text);font-weight:700}
.ep-scroller .proof-note{font-size:11px;line-height:1.5;color:var(--textLight);margin:12px 0 0}
.ep-scroller .stays-panel{max-width:820px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:24px}
.ep-scroller .stays-row{display:grid;grid-template-columns:minmax(210px,.72fr) 1fr;gap:22px;padding:15px 18px;border-top:1px solid var(--borderLight)}
.ep-scroller .stays-row:first-child{border-top:0}
.ep-scroller .stays-title{font-family:var(--serif);font-size:17px;font-weight:700;line-height:1.28;color:var(--text)}
.ep-scroller .stays-copy{font-size:15px;line-height:1.56;color:var(--textMed)}
.ep-scroller .why-now-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;max-width:860px;margin-top:26px}
.ep-scroller .why-now-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px 18px 18px;min-height:190px;display:flex;flex-direction:column}
.ep-scroller .why-now-card::before{content:"";width:32px;height:2px;background:var(--accent);margin-bottom:18px}
.ep-scroller .why-now-title{font-family:var(--serif);font-size:18px;font-weight:800;line-height:1.22;letter-spacing:-.3px;color:var(--text);margin:0 0 10px}
.ep-scroller .why-now-copy{font-size:15px;line-height:1.58;color:var(--textMed);margin:0}
.ep-scroller .who-intro{max-width:760px;margin-top:24px}
.ep-scroller .examples-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;max-width:820px}
.ep-scroller .example-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px}
.ep-scroller .example-title{font-family:var(--serif);font-size:17px;font-weight:700;line-height:1.28;color:var(--text);margin:0 0 7px}
.ep-scroller .example-copy{font-size:15px;line-height:1.56;color:var(--textMed);margin:0}
.ep-scroller .pricing-layout{max-width:760px;margin-top:24px}
.ep-scroller .pricing-terms{display:flex;flex-direction:column;gap:12px}
.ep-scroller .pricing-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:17px 18px}
.ep-scroller .pricing-title{font-family:var(--serif);font-size:18px;font-weight:700;line-height:1.25;color:var(--text);margin:0 0 8px}
.ep-scroller .pricing-copy{font-size:15px;line-height:1.58;color:var(--textMed);margin:0}
.ep-scroller .value-copy{font-size:15px;line-height:1.58;color:var(--textMed);margin:0}
.ep-scroller .value-box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:17px 18px}
.ep-scroller .hint{display:flex;align-items:center;gap:12px}
.ep-scroller .hint i{width:30px;height:1px;background:var(--textLight);opacity:.4}
.ep-scroller .hint span{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--textLight)}
.ep-scroller .home-title{animation:cardSlideUp .6s ease .12s both}
.ep-scroller .home-slide .home-offer{animation:cardSlideUp .5s ease .28s both}
.ep-scroller .home-slide .hint{animation:cardSlideUp .5s ease .46s both}
@keyframes cardSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){
 .ep-scroller .slide{align-items:flex-start;padding:12px 16px 8px}
 .ep-scroller .inner{gap:24px;padding:8px 4px}
 .ep-scroller .h1{font-size:32px;line-height:1.08;letter-spacing:-.4px}
 .ep-scroller .stmt{font-size:22px;line-height:1.22;letter-spacing:-.2px}
 .ep-scroller .lead,.ep-scroller .bd{font-size:15px;line-height:1.55}
 .ep-scroller .offer-copy{font-size:15px;line-height:1.55}
 .ep-scroller .home-offer{padding:22px 20px 18px}
 .ep-scroller .why-box{padding:16px 18px}
 .ep-scroller .why-box p{font-size:15px;line-height:1.55}
 .ep-scroller .method-step{grid-template-columns:34px 1fr;padding:16px 18px}
 .ep-scroller .method-title{font-size:17px}
 .ep-scroller .method-copy{font-size:15px;line-height:1.55}
 .ep-scroller .proof-card{padding:14px 16px}
 .ep-scroller .proof-table{font-size:12px}
 .ep-scroller .proof-table th{font-size:10px;letter-spacing:1px}
 .ep-scroller .stays-row{grid-template-columns:1fr;gap:6px;padding:14px 16px}
 .ep-scroller .why-now-grid{grid-template-columns:1fr;gap:10px}
 .ep-scroller .why-now-card{min-height:0;padding:16px 18px}
 .ep-scroller .why-now-card::before{margin-bottom:12px}
 .ep-scroller .examples-grid{grid-template-columns:1fr}
}
`;

export function ProductHome() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollerRef = useRef(null);
  const openAbout = () => setAboutOpen(true);

  // Drive the top progress divider from scroll position through the 8 sections,
  // so the header + bar chrome reads the same as the App shell on /insights.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const total = el.scrollHeight;
      setProgress(total > 0 ? Math.min(1, (el.scrollTop + el.clientHeight) / total) : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="ep-root">
      <style>{CSS}</style>

      {/* Fixed top chrome — global header + scroll-progress divider */}
      <div style={{ flexShrink: 0, background: "var(--bg)" }}>
        <div style={{ padding: "12px clamp(20px, 4vw, 48px)" }}>
          <SiteHeader active="home" onAboutOpen={openAbout} />
        </div>
        <div style={{ height: 3, background: "var(--borderLight)" }}>
          <div style={{ height: "100%", background: "var(--accent)", width: `${(progress * 100).toFixed(2)}%`, borderRadius: "0 2px 2px 0", transition: "width 0.12s linear" }} />
        </div>
      </div>

      <div className="ep-scroller" ref={scrollerRef}>

      {/* ── 01 · Home ───────────────────────────────────────────── */}
      <section className="slide home-slide" id="home" style={{ "--p": 1 }}>
        <div className="inner">
          <h1 className="h1 home-title"><span className="home-line" style={{ color: "var(--accent)" }}>One deliverable,</span><span className="home-line">then a workflow that <span style={{ color: "var(--accent)" }}>stays.</span></span></h1>
          <div className="home-offer">
            <div className="offer-label">What we do</div>
            <div className="offer-title">We turn the AI tools you already use into recurring work you can trust.</div>
            <p className="offer-copy">We take one recurring deliverable, produce it with the AI tools you already use, and prove it on your next live deadline: a weekly commercial report, a monthly management note, or a finance review. It includes the verification, analysis, and implications a decision needs, and runs again every cycle.</p>
            <div className="offer-action"><a className="text-action" href="#start">Bring one recurring deliverable</a></div>
          </div>
          <div className="hint"><i></i><span>Or scroll to begin</span></div>
        </div>
      </section>

      {/* ── 02 · Why ────────────────────────────────────────────── */}
      <section className="slide" id="why" style={{ "--p": 2 }}>
        <div className="inner">
          <div>
            <div className="eb">Why</div>
            <div className="stmt">If the AI can do it, why does your team make it by hand?</div>
            <div className="why-stack">
              <div className="why-box">
                <div className="why-box-label">The problem</div>
                <p>AI helps today with drafts, summaries, and research. The work that matters still sits with your team: the weekly commercial report, the monthly management note, the board pack.</p>
              </div>
              <div className="why-box">
                <div className="why-box-label">Why it is hard</div>
                <p>Producing a good draft once is easy. Producing it again next cycle is hard. The output has to meet your standard, earn the reviewer&apos;s trust, show its cost, and stay right when the inputs, templates, and priorities change.</p>
              </div>
              <div className="why-box">
                <div className="why-box-label">Solution</div>
                <p>We add the missing layer to the AI tools you already use: a written standard, worked examples, checks, and tracking. We run it and watch it, so the work stays right every cycle.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 · How ────────────────────────────────────────────── */}
      <section className="slide" id="how" style={{ "--p": 3 }}>
        <div className="inner">
          <div>
            <div className="eb">How</div>
            <div className="stmt">Built inside your AI tools, calibrated on your own work.</div>
            <div className="method-steps">
              <div className="method-step">
                <div className="method-num">1</div>
                <div>
                  <div className="method-title">Reproduce the last version</div>
                  <p className="method-copy">We start with a deliverable you already produce, using your data, your reviewer, and a real next deadline. We rebuild the most recent finished version and compare it side by side, so the standard is visible immediately.</p>
                </div>
              </div>
              <div className="method-step">
                <div className="method-num">2</div>
                <div>
                  <div className="method-title">Turn corrections into the workflow</div>
                  <p className="method-copy">Where our version falls short, your reviewer&apos;s corrections become written rules, worked examples, and checks. This is the part that stays, and why each cycle needs less review.</p>
                </div>
              </div>
              <div className="method-step">
                <div className="method-num">3</div>
                <div>
                  <div className="method-title">Run the next cycle live</div>
                  <p className="method-copy">Then we run the next cycle on the actual deadline. You get the deliverable, the comparison, cost per run, reviewer time saved, and the workflow installed.</p>
                </div>
              </div>
            </div>
            <div className="proof-card">
              <div className="proof-title">Our layer improved deliverable quality and consistency.</div>
              <table className="proof-table">
                <tbody>
                  <tr><th></th><th>AI on its own</th><th>AI with our layer</th></tr>
                  <tr><td>Quality (independent grader, 0–100)</td><td>81</td><td>88</td></tr>
                  <tr><td>Consistency across runs</td><td>Swings 77–85</td><td>88 every run</td></tr>
                  <tr><td>Cost per run</td><td>~CHF 0.08</td><td>~CHF 0.08</td></tr>
                </tbody>
              </table>
              <p className="proof-note">Source: Eclipsai build test on a weekly treasury review. We rebuilt the deliverable and ran each setup three times. Quality was graded 0–100 by an independent grader. Costs are estimated from current model prices. Both setups used the same best-in-class AI model.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · What stays ─────────────────────────────────────── */}
      <section className="slide" id="what" style={{ "--p": 4 }}>
        <div className="inner">
          <div>
            <div className="eb">What stays</div>
            <div className="stmt">After the first job, five things stay. Together, they are the product.</div>
            <div className="stays-panel">
              <div className="stays-row"><div className="stays-title">The standard, written down and portable across AI tools.</div><div className="stays-copy">Your quality criteria and the reviewer&apos;s corrections are recorded, so the work is judged the same way every cycle, even when your best person is away.</div></div>
              <div className="stays-row"><div className="stays-title">Quality checks.</div><div className="stays-copy">They flag a result below standard before anyone uses it. This keeps the work right as inputs and templates change.</div></div>
              <div className="stays-row"><div className="stays-title">The workflow, running.</div><div className="stays-copy">The deliverable is set up to run again each cycle, not handed over as a one-off draft.</div></div>
              <div className="stays-row"><div className="stays-title">A cost and usage record.</div><div className="stays-copy">How often the workflow runs, what it costs, and whether quality is holding.</div></div>
              <div className="stays-row"><div className="stays-title">A management view.</div><div className="stays-copy">One row at first: this workflow, its cost, its quality. As more workflows run, it becomes a portfolio view.</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 · Why now ────────────────────────────────────────── */}
      <section className="slide" id="why-now" style={{ "--p": 5 }}>
        <div className="inner">
          <div>
            <div className="eb">Why now</div>
            <div className="stmt">No reason to wait. A better AI tool won&apos;t work the way you do.</div>
            <div className="why-now-grid">
              <div className="why-now-card">
                <div className="why-now-title">The last mile is judgement.</div>
                <p className="why-now-copy">AI tools stop at the last mile: the judgement that makes the work usable. That part is still yours to add.</p>
              </div>
              <div className="why-now-card">
                <div className="why-now-title">A vendor cannot hand you your standard.</div>
                <p className="why-now-copy">No tool does it out of the box. And if one did, it would learn from your work and sell the pattern to others.</p>
              </div>
              <div className="why-now-card">
                <div className="why-now-title">Your own setup stays portable.</div>
                <p className="why-now-copy">So we build yours instead. It works now, and with whatever tool you use next.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 · Who ────────────────────────────────────────────── */}
      <section className="slide" id="who" style={{ "--p": 6 }}>
        <div className="inner">
          <div>
            <div className="eb">Who</div>
            <div className="stmt">For companies using AI but not seeing the work move.</div>
            <div className="who-intro">
              <p className="bd">Best fit: a mid-sized company where teams already use AI tools or agents, and management wants that usage tied to measurable work: quality, reviewer time saved, and cost per run.</p>
              <p className="bd">We work with the person who owns the deliverable. IT helps with access and security. The standard stays with the team that produces the work.</p>
              <p className="bd" style={{ marginBottom: 0 }}>Good starting points are internal decision-support deliverables:</p>
            </div>
            <div className="examples-grid">
              <div className="example-card"><div className="example-title">Retail and consumer</div><p className="example-copy">Weekly commercial brief, category review, supplier meeting pack, promotion post-mortem.</p></div>
              <div className="example-card"><div className="example-title">Finance and FP&amp;A</div><p className="example-copy">Monthly management commentary, variance narrative, CFO exception pack.</p></div>
              <div className="example-card"><div className="example-title">Strategy, corporate development, and PE portfolio ops</div><p className="example-copy">Market scan, investment memo review, synergy assumption check.</p></div>
              <div className="example-card"><div className="example-title">Customer and sales operations</div><p className="example-copy">Account brief, QBR pack.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 07 · Pricing and value ──────────────────────────────── */}
      <section className="slide" id="pricing" style={{ "--p": 7 }}>
        <div className="inner">
          <div>
            <div className="eb">Pricing and value</div>
            <div className="stmt">Start fixed scope. Continue only where value is proven.</div>
            <div className="pricing-layout">
              <div className="pricing-terms">
                <div className="pricing-card">
                  <div className="pricing-title">First deliverable</div>
                  <p className="pricing-copy">The first job is fixed scope. A low-risk way to start.</p>
                </div>
                <div className="pricing-card">
                  <div className="pricing-title">Ongoing workflow</div>
                  <p className="pricing-copy">Once the workflow is proven, ongoing work is priced as a fraction of the value created. It covers running and checking the workflows, updating them, investigating failures, reporting cost and quality, and adding the next workflows.</p>
                </div>
                <div className="value-box"><p className="value-copy">The value stays with the company even if the AI tools change. Most of what makes the work good is specific to the company. No single tool delivers this out of the box.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 08 · Start ──────────────────────────────────────────── */}
      <section className="slide" id="start" style={{ "--p": 8 }}>
        <div className="inner">
          <div>
            <div className="eb">Start</div>
            <div className="stmt">Two to three weeks with your team. You keep what we build.</div>
            <p className="bd">We are taking on a small number of founding clients.</p>
            <p className="start-contact"><a className="text-action" href={LINKEDIN} target="_blank" rel="noopener noreferrer">Message Chip on LinkedIn</a> to bring one recurring deliverable.</p>
            <div className="footer-links" style={{ marginTop: 48, paddingTop: 18, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--textLight)", display: "flex", justifyContent: "space-between", maxWidth: 640 }}>
              <span><Link href="/insights">Insights</Link> · <a href="#home" onClick={(e) => { e.preventDefault(); setAboutOpen(true); }}>About</a> · <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">Contact</a></span>
              <span>© Eclipsai</span>
            </div>
          </div>
        </div>
      </section>
      </div>

      <AboutPopup open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
