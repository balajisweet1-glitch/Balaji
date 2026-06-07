import { useState, useEffect, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SITUATIONS = [
  {id:"c1",cat:"communication",text:"We fight often",pos:false},
  {id:"c2",cat:"communication",text:"My messages get ignored",pos:false},
  {id:"c3",cat:"communication",text:"We talk openly and honestly",pos:true},
  {id:"c4",cat:"communication",text:"We work through issues calmly",pos:true},
  {id:"t1",cat:"trust",text:"I feel insecure about us",pos:false},
  {id:"t2",cat:"trust",text:"They keep things from me",pos:false},
  {id:"t3",cat:"trust",text:"I trust them completely",pos:true},
  {id:"t4",cat:"trust",text:"We are fully honest with each other",pos:true},
  {id:"a1",cat:"affection",text:"I feel genuinely loved",pos:true},
  {id:"a2",cat:"affection",text:"Affection feels rare or forced",pos:false},
  {id:"a3",cat:"affection",text:"We have lost our spark",pos:false},
  {id:"k1",cat:"conflict",text:"Arguments often go unresolved",pos:false},
  {id:"k2",cat:"conflict",text:"We handle disagreements maturely",pos:true},
  {id:"k3",cat:"conflict",text:"There is passive aggression between us",pos:false},
  {id:"n1",cat:"attention",text:"We barely spend time together",pos:false},
  {id:"n2",cat:"attention",text:"We enjoy regular quality time",pos:true},
  {id:"n3",cat:"attention",text:"I often feel ignored",pos:false},
  {id:"s1",cat:"support",text:"They support me emotionally",pos:true},
  {id:"s2",cat:"support",text:"I feel alone in my struggles",pos:false},
  {id:"s3",cat:"support",text:"We truly lift each other up",pos:true},
  {id:"r1",cat:"respect",text:"My boundaries are respected",pos:true},
  {id:"r2",cat:"respect",text:"I feel dismissed or belittled",pos:false},
  {id:"x1",cat:"connection",text:"We feel emotionally distant",pos:false},
  {id:"x2",cat:"connection",text:"We have grown apart lately",pos:false},
  {id:"x3",cat:"connection",text:"I feel deeply connected to them",pos:true},
];

const CATS = {
  communication:{label:"Communication",short:"Comm.",color:"#FF6B81",bg:"#FFF0F2"},
  trust:        {label:"Trust",        short:"Trust", color:"#9B7FFF",bg:"#F5F0FF"},
  affection:    {label:"Affection",    short:"Affec.",color:"#F472B6",bg:"#FDF0F8"},
  conflict:     {label:"Conflict",     short:"Conflic.",color:"#FF8C42",bg:"#FFF3EC"},
  attention:    {label:"Attention",    short:"Attn.", color:"#5B9FFF",bg:"#EFF6FF"},
  support:      {label:"Support",      short:"Support",color:"#2DD4A0",bg:"#ECFDF5"},
  respect:      {label:"Respect",      short:"Respect",color:"#F5C842",bg:"#FFFBEB"},
  connection:   {label:"Connection",   short:"Connect.",color:"#7C7FE8",bg:"#F0F0FF"},
};
const CAT_KEYS = Object.keys(CATS);

// ─── Scoring ──────────────────────────────────────────────────────────────────

function computeScores(selectedIds, level) {
  const posW = [8,13,17][level-1];
  const negW = [10,17,23][level-1];
  const items = SITUATIONS.filter(s => selectedIds.has(s.id));
  const catScores = {};
  CAT_KEYS.forEach(cat => {
    const ci = items.filter(s => s.cat === cat);
    if (!ci.length) return;
    let score = 65;
    ci.forEach(i => { score += i.pos ? posW : -negW; });
    catScores[cat] = Math.max(5, Math.min(100, Math.round(score)));
  });
  const vals = Object.values(catScores);
  const overall = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 65;
  return {catScores, overall};
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const scoreColor = s => s>=75?"#0FBD84":s>=55?"#F59E0B":s>=35?"#FF8C42":"#EF4444";
const scoreBg    = s => s>=75?"#ECFDF5":s>=55?"#FFFBEB":s>=35?"#FFF3EC":"#FEF2F2";
const scoreLabel = s => s>=75?"Healthy & Thriving":s>=55?"Needs Attention":s>=35?"At Risk":"Needs Care";
const scoreEmoji = s => s>=75?"💚":s>=55?"💛":s>=35?"🧡":"❤️";

// ─── Fallbacks ────────────────────────────────────────────────────────────────

const SOLO_FB = {
  summary:"Your relationship reflects genuine emotional depth and a real desire to grow. With consistent small actions, meaningful change is absolutely within reach.",
  strengths:[
    {title:"Emotional Self-Awareness",detail:"Reflecting honestly on your relationship shows emotional maturity that forms the foundation for real positive change."},
    {title:"Courage to Reflect",detail:"Seeking insight rather than ignoring issues means you are already taking a step most people avoid entirely."},
    {title:"Investment in Growth",detail:"Caring enough to evaluate your relationship is itself a strong sign of commitment to making things better."}
  ],
  concerns:[
    {title:"Communication Patterns",detail:"Unresolved communication habits can quietly erode trust and intimacy if left unaddressed over time."},
    {title:"Emotional Distance",detail:"Feeling disconnected can become a default pattern — intentional daily reconnection is essential to reverse it."}
  ],
  weekPlan:[
    {week:"Week 1",focus:"Communication",action:"Each evening share one feeling using: I felt [emotion] when [situation] because [reason]. No fixing, just listening."},
    {week:"Week 2",focus:"Affection",action:"Send one specific appreciation message every day — name something real and specific, not a generic compliment."},
    {week:"Week 3",focus:"Quality Time",action:"Plan one 45-minute phone-free activity together: a walk, cooking a meal, or a simple board game."},
    {week:"Week 4",focus:"Check-In",action:"Sit together 20 minutes: each share one thing going well, one thing you need more of, and one gratitude."}
  ],
  dailyHabit:"Spend 10 minutes before bed sharing one high and one low from your day. No advice, just listening with full presence.",
  warningSign:"If emotional distance continues without deliberate daily reconnection, it can quietly become emotional detachment — which is much harder to reverse.",
  hopefulNote:"The very act of honestly checking in on your relationship is a powerful form of love. You are already doing something that truly matters."
};

const COUPLE_FB = {
  summary:"Together your combined score shows real emotional investment from both sides. There are meaningful alignments to build on and clear gaps worth bridging with daily intention.",
  alignments:[
    {title:"Shared Desire to Grow",detail:"Both choosing to reflect honestly together shows a deep shared commitment to making this relationship stronger."},
    {title:"Mutual Emotional Investment",detail:"Completing this together means you both want to understand each other more deeply — that shared motivation is rare and valuable."}
  ],
  gaps:[
    {title:"Emotional Expression Styles",who:"Both",detail:"Partners often feel differently about how and when to share emotions — left unaddressed, this creates quiet distance over time."},
    {title:"Connection Needs",who:"Both",detail:"When one partner needs more togetherness while the other needs space, it can feel like rejection even when it is not intended."}
  ],
  weekPlan:[
    {week:"Week 1",focus:"Understanding",action:"Each write 3 things you need more of in the relationship and swap lists. Read and reflect for 24 hours before discussing."},
    {week:"Week 2",focus:"Communication",action:"Practice the speaker-listener technique: one speaks for 3 minutes uninterrupted, the other listens and summarises."},
    {week:"Week 3",focus:"Affection",action:"Each perform one unexpected act of care tailored to what the OTHER person values, not what you yourself would want."},
    {week:"Week 4",focus:"Reconnection",action:"Go on a state-of-us conversation: share what is going well, what you each need more of, and one shared goal for next month."}
  ],
  p1Advice:"Focus on expressing your needs clearly and directly. Your feelings are completely valid and your partner genuinely wants to understand them.",
  p2Advice:"Focus on creating emotional safety through consistent small daily gestures. Reliability and presence matter far more than occasional grand acts.",
  dailyRitual:"Share a 10-minute Rose and Thorn each evening — one good thing and one hard thing from your day. No fixing, just listening with full attention.",
  hopefulNote:"Two people willing to look honestly at their relationship together already have something most couples never find. That courage is the foundation of lasting love."
};

// ─── API ──────────────────────────────────────────────────────────────────────

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1400,
      messages:[{role:"user",content:prompt}]
    })
  });
  const data = await res.json();
  return data.content.map(b => b.text||"").join("");
}

async function fetchAdvice(selectedIds, level, scores) {
  const items = SITUATIONS.filter(s => selectedIds.has(s.id));
  const lvl = ["mild","moderate","serious"][level-1];
  const list = items.map(i => "- "+i.text+" ("+CATS[i.cat].label+", "+(i.pos?"positive":"concerning")+")").join("\n");
  const weak = Object.entries(scores.catScores).filter(([,v])=>v<55).map(([k])=>CATS[k].label).join(", ")||"none";
  const strong = Object.entries(scores.catScores).filter(([,v])=>v>=75).map(([k])=>CATS[k].label).join(", ")||"none";
  const schema = '{"summary":"2-sentence assessment","strengths":[{"title":"4-word title","detail":"sentence"},{"title":"title","detail":"sentence"},{"title":"title","detail":"sentence"}],"concerns":[{"title":"4-word title","detail":"sentence"},{"title":"title","detail":"sentence"}],"weekPlan":[{"week":"Week 1","focus":"area","action":"specific action"},{"week":"Week 2","focus":"area","action":"action"},{"week":"Week 3","focus":"area","action":"action"},{"week":"Week 4","focus":"area","action":"action"}],"dailyHabit":"15-min daily habit","warningSign":"one warning sentence","hopefulNote":"one encouraging sentence"}';
  const prompt = "You are a relationship wellness advisor. Provide clear, structured, actionable guidance.\n\nCLIENT DATA:\n- Overall health: "+scores.overall+"% ("+scoreLabel(scores.overall)+")\n- Intensity: "+lvl+"\n- Strong areas: "+strong+"\n- Weak areas: "+weak+"\n- Feelings:\n"+list+"\n\nRespond ONLY with valid JSON matching this exact structure (no markdown, no backticks):\n"+schema;
  try {
    const t = await callClaude(prompt);
    return JSON.parse(t.replace(/^```[\w]*\n?/,"").replace(/\n?```$/,"").trim());
  } catch(e) {
    return SOLO_FB;
  }
}

async function fetchCoupleAdvice(p1Name, p1Scores, p1Items, p2Name, p2Scores, p2Items) {
  const fmt = items => items.map(i => "- "+i.text+" ("+CATS[i.cat].label+", "+(i.pos?"positive":"concerning")+")").join("\n");
  const avg = Math.round((p1Scores.overall+p2Scores.overall)/2);
  const schema = '{"summary":"2-sentence couple assessment","alignments":[{"title":"4-word title","detail":"sentence"},{"title":"title","detail":"sentence"}],"gaps":[{"title":"4-word title","who":"Partner name or Both","detail":"sentence"},{"title":"title","who":"...","detail":"sentence"}],"weekPlan":[{"week":"Week 1","focus":"area","action":"joint action"},{"week":"Week 2","focus":"area","action":"action"},{"week":"Week 3","focus":"area","action":"action"},{"week":"Week 4","focus":"area","action":"action"}],"p1Advice":"one sentence for '+p1Name+'","p2Advice":"one sentence for '+p2Name+'","dailyRitual":"10-15 min daily ritual","hopefulNote":"one encouraging sentence"}';
  const prompt = "You are a couples relationship advisor. Provide clear structured guidance.\n\nPARTNER 1 - "+p1Name+" ("+p1Scores.overall+"%):\n"+fmt(p1Items)+"\n\nPARTNER 2 - "+p2Name+" ("+p2Scores.overall+"%):\n"+fmt(p2Items)+"\n\nCombined: "+avg+"%\n\nRespond ONLY with valid JSON (no markdown, no backticks):\n"+schema;
  try {
    const t = await callClaude(prompt);
    return JSON.parse(t.replace(/^```[\w]*\n?/,"").replace(/\n?```$/,"").trim());
  } catch(e) {
    return COUPLE_FB;
  }
}

// ─── Couple session helpers ───────────────────────────────────────────────────

function genCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i=0; i<6; i++) s += c[Math.floor(Math.random()*c.length)];
  return s;
}
function saveSession(code, data) {
  try {
    const all = JSON.parse(localStorage.getItem("lhc_c")||"{}");
    all[code] = {...data, ts: Date.now()};
    localStorage.setItem("lhc_c", JSON.stringify(all));
  } catch(e) {}
}
function loadSession(code) {
  try {
    const all = JSON.parse(localStorage.getItem("lhc_c")||"{}");
    return all[code]||null;
  } catch(e) { return null; }
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const S = {
  page: {maxWidth:420,margin:"0 auto",fontFamily:"'Nunito',sans-serif",minHeight:"100vh"},
  btn:  {borderRadius:14,cursor:"pointer",fontFamily:"'Nunito',sans-serif",letterSpacing:0.3,transition:"all 0.15s",display:"block",width:"100%",textAlign:"center",padding:"13px 20px",fontSize:15,fontWeight:800,border:"none"},
  card: {background:"#fff",borderRadius:20,padding:20,boxShadow:"0 2px 20px rgba(167,139,250,0.1),0 1px 4px rgba(0,0,0,0.05)",marginBottom:12},
};

// ─── Base Components ──────────────────────────────────────────────────────────

function BackBtn({onBack, label}) {
  return (
    <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:800,color:"#9988BB",fontFamily:"'Nunito',sans-serif",padding:"4px 0",marginBottom:2}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      {label||"Back"}
    </button>
  );
}

function LogoutBtn({onLogout}) {
  return (
    <button onClick={onLogout} style={{position:"fixed",top:14,right:14,zIndex:999,display:"flex",alignItems:"center",gap:6,padding:"7px 14px 7px 10px",background:"rgba(255,255,255,0.92)",border:"1.5px solid #EDE8F8",borderRadius:99,fontSize:12,fontWeight:800,color:"#9988BB",fontFamily:"'Nunito',sans-serif",cursor:"pointer",boxShadow:"0 2px 12px rgba(167,139,250,0.15)",backdropFilter:"blur(8px)"}}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
      Sign out
    </button>
  );
}

function HeartSVG({size, color, pulse}) {
  const sz = size||40;
  const cl = color||"#FF6B81";
  return (
    <div style={pulse ? {animation:"hb 1.6s ease-in-out infinite"} : {}}>
      <svg width={sz} height={sz*0.9} viewBox="0 0 100 90">
        <path d="M50 85 C50 85 7 53 7 27 C7 14 17 5 32 5 C41 5 48 10 50 18 C52 10 59 5 68 5 C83 5 93 14 93 27 C93 53 50 85 50 85Z" fill={cl}/>
      </svg>
    </div>
  );
}

// ─── Animated Score Circle ────────────────────────────────────────────────────

function AnimatedCircle({score, size}) {
  const sz = size||164;
  const [anim, setAnim] = useState(0);
  const r = sz===164?62:46;
  const circ = 2*Math.PI*r;
  const rafRef = useRef(null);
  const cx = sz/2, cy = sz/2;

  useEffect(() => {
    let cur = 0;
    const tick = () => {
      cur = Math.min(cur+1.8, score);
      setAnim(Math.round(cur));
      if (cur < score) rafRef.current = requestAnimationFrame(tick);
    };
    const t = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, 500);
    return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  const color = scoreColor(score);
  const offset = circ - (anim/100)*circ;
  const sw = sz===164?12:9;
  const fsz = sz===164?34:24;

  return (
    <svg width={sz} height={sz} viewBox={"0 0 "+sz+" "+sz}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0E8FF" strokeWidth={sw}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={"rotate(-90 "+cx+" "+cy+")"}
        style={{transition:"stroke-dashoffset 0.04s linear"}}/>
      <text x={cx} y={cy-8} textAnchor="middle" fontSize={fsz} fontWeight={900} fill={color} fontFamily="Nunito,sans-serif">{anim}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={sz===164?12:10} fill="#C0A8D8" fontFamily="Nunito,sans-serif" fontWeight={600}>/ 100</text>
    </svg>
  );
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────

function RadarChart({catScores, catScores2, name1, name2, size}) {
  const sz = size||260;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  const cx = sz/2, cy = sz/2;
  const cats = CAT_KEYS.filter(k => catScores[k]!=null || (catScores2&&catScores2[k]!=null));
  if (!cats.length) return null;

  const n = cats.length;
  const maxR = sz*0.34;
  const labelR = sz*0.46;
  const angle = i => (Math.PI*2*i/n) - Math.PI/2;

  const pt = (i, val) => {
    const a = angle(i);
    const frac = animated ? (val/100) : 0;
    return {x: cx + maxR*frac*Math.cos(a), y: cy + maxR*frac*Math.sin(a)};
  };
  const gpt = (i, frac) => {
    const a = angle(i);
    return {x: cx+maxR*frac*Math.cos(a), y: cy+maxR*frac*Math.sin(a)};
  };
  const lpt = i => {
    const a = angle(i);
    return {x: cx+labelR*Math.cos(a), y: cy+labelR*Math.sin(a)};
  };
  const poly = pts => pts.map((p,i) => (i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ")+"Z";

  const p1Pts = cats.map((k,i) => pt(i, catScores[k]||0));
  const p2Pts = catScores2 ? cats.map((k,i) => pt(i, catScores2[k]||0)) : null;

  const n1 = name1||"You";
  const n2 = name2||"Partner";

  return (
    <svg width={sz} height={sz} viewBox={"0 0 "+sz+" "+sz} style={{overflow:"visible"}}>
      {[0.25,0.5,0.75,1].map(f => (
        <polygon key={f}
          points={cats.map((_,i) => { const p=gpt(i,f); return p.x+","+p.y; }).join(" ")}
          fill="none" stroke={f===1?"#DDD6F0":"#EDE8F8"} strokeWidth={f===1?1.5:0.8}/>
      ))}
      {cats.map((_,i) => { const p=gpt(i,1); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#EDE8F8" strokeWidth={1}/>; })}

      {p2Pts && (
        <path d={poly(p2Pts)} fill="rgba(155,127,255,0.12)" stroke="#9B7FFF" strokeWidth={2}
          style={{transition:"d 0.9s cubic-bezier(0.16,1,0.3,1)"}}/>
      )}
      {p2Pts && p2Pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill="#9B7FFF"/>)}

      <path d={poly(p1Pts)}
        fill={catScores2?"rgba(255,107,129,0.12)":"rgba(167,139,250,0.16)"}
        stroke={catScores2?"#FF6B81":"#A78BFA"} strokeWidth={2.5}
        style={{transition:"d 0.9s cubic-bezier(0.16,1,0.3,1)"}}/>
      {p1Pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={catScores2?3:4} fill={catScores2?"#FF6B81":"#A78BFA"}/>)}

      {cats.map((k,i) => {
        const lp = lpt(i);
        const cat = CATS[k];
        const anchor = lp.x < cx-10 ? "end" : lp.x > cx+10 ? "start" : "middle";
        return (
          <g key={k}>
            <text x={lp.x} y={lp.y} textAnchor={anchor} fontSize={9.5} fontWeight={800}
              fill={cat.color} fontFamily="Nunito,sans-serif" dy="0.35em">{cat.short}</text>
            {!catScores2 && (
              <text x={lp.x} y={lp.y+12} textAnchor={anchor} fontSize={9} fontWeight={700}
                fill="#9988BB" fontFamily="Nunito,sans-serif">{catScores[k]}%</text>
            )}
          </g>
        );
      })}

      {catScores2 && (
        <g>
          <circle cx={cx-38} cy={sz-12} r={5} fill="#FF6B81"/>
          <text x={cx-30} y={sz-12} fontSize={9} fontWeight={800} fill="#FF6B81"
            fontFamily="Nunito,sans-serif" dy="0.35em">{n1.split(" ")[0]}</text>
          <circle cx={cx+8} cy={sz-12} r={5} fill="#9B7FFF"/>
          <text x={cx+16} y={sz-12} fontSize={9} fontWeight={800} fill="#9B7FFF"
            fontFamily="Nunito,sans-serif" dy="0.35em">{n2.split(" ")[0]}</text>
        </g>
      )}
    </svg>
  );
}

// ─── Bar Components ───────────────────────────────────────────────────────────

function BarRow({label, score}) {
  const color = scoreColor(score);
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:12,fontWeight:700,color:"#555577"}}>{label}</span>
        <span style={{fontSize:12,fontWeight:800,color}}>{score}%</span>
      </div>
      <div style={{height:7,borderRadius:4,background:"#F0E8FF",overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:4,background:color,width:score+"%",transition:"width 1.1s cubic-bezier(0.16,1,0.3,1) 0.3s"}}/>
      </div>
    </div>
  );
}

function DualBarRow({label, score1, score2, name1, name2}) {
  const c1 = scoreColor(score1), c2 = scoreColor(score2);
  const diff = Math.abs(score1-score2);
  return (
    <div style={{marginBottom:13}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:700,color:"#555577"}}>{label}</span>
        {diff>=20 && (
          <span style={{fontSize:10,fontWeight:800,color:"#FF8C42",background:"#FFF3EC",padding:"2px 7px",borderRadius:99}}>Gap</span>
        )}
      </div>
      {[[name1,score1,c1,"#FF6B81"],[name2,score2,c2,"#9B7FFF"]].map((row,idx) => (
        <div key={idx} style={{display:"flex",alignItems:"center",gap:8,marginBottom:idx===0?4:0}}>
          <span style={{fontSize:10,fontWeight:800,color:row[3],minWidth:30,flexShrink:0}}>{row[0].split(" ")[0]}</span>
          <div style={{flex:1,height:6,borderRadius:4,background:"#F0E8FF",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,background:row[2],width:row[1]+"%",transition:"width 1.1s cubic-bezier(0.16,1,0.3,1) "+(0.3+idx*0.2)+"s"}}/>
          </div>
          <span style={{fontSize:11,fontWeight:800,color:row[2],minWidth:28,textAlign:"right"}}>{row[1]}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Week Plan Timeline ───────────────────────────────────────────────────────

function WeekPlan({weekPlan}) {
  const colors = ["#FF6B81","#9B7FFF","#0FBD84","#F59E0B"];
  const bgs    = ["#FFF0F2","#F5EEFF","#ECFDF5","#FFFBEB"];
  return (
    <div style={{position:"relative",paddingLeft:28}}>
      <div style={{position:"absolute",left:10,top:8,bottom:8,width:2,background:"linear-gradient(180deg,#FF6B81,#9B7FFF,#0FBD84,#F59E0B)",borderRadius:2}}/>
      {weekPlan.map((w,i) => (
        <div key={i} style={{position:"relative",marginBottom:i<weekPlan.length-1?16:0}}>
          <div style={{position:"absolute",left:-22,top:12,width:12,height:12,borderRadius:"50%",background:colors[i]}}/>
          <div style={{background:bgs[i],borderRadius:14,padding:"12px 14px",border:"1.5px solid "+colors[i]+"30"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <span style={{fontSize:10,fontWeight:900,color:colors[i],background:colors[i]+"18",padding:"2px 8px",borderRadius:99}}>{w.week}</span>
              <span style={{fontSize:11,fontWeight:800,color:"#555577"}}>{w.focus}</span>
            </div>
            <p style={{fontSize:13,color:"#333355",margin:0,lineHeight:1.6,fontWeight:600}}>{w.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Export component
export default function LoveHealthCheck() {
  return (
    <div style={{fontFamily:"'Nunito',sans-serif",minHeight:"100vh",background:"linear-gradient(160deg,#FFF0F4,#F3EEFF)"}}>
      <div style={{textAlign:"center",padding:"40px 20px"}}>
        <h1 style={{fontSize:28,fontWeight:900,color:"#1A1A2E"}}>Love Health Check</h1>
        <p style={{fontSize:14,color:"#9988BB"}}>Relationship wellness assessment tool</p>
      </div>
    </div>
  );
}
