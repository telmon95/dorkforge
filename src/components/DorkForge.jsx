import { useState, useEffect, useRef } from "react";

// ─── Full Production Dork Library ─────────────────────────────────────────────
// Sourced from real bug bounty recon methodology + BugBountyHunter reference
const buildDorkLibrary = (domain, target) => ({
  git_folders: {
    label: ".git Folders",
    color: "#ff5555",
    group: "infra",
    dorks: [`inurl:"/.git" ${domain} -github`],
  },
  backup_files: {
    label: "Backup Files",
    color: "#ff8800",
    group: "files",
    dorks: [`site:${domain} ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup`],
  },
  exposed_docs: {
    label: "Exposed Documents",
    color: "#ffaa00",
    group: "files",
    dorks: [
      `site:${domain} ext:doc | ext:docx | ext:odt | ext:pdf | ext:rtf | ext:sxw | ext:psw | ext:ppt | ext:pptx | ext:pps | ext:csv`,
      `site:${domain} filetype:doc | filetype:docx | filetype:xls | filetype:xlsx | filetype:ppt | filetype:pptx | filetype:mdb | filetype:pdf | filetype:sql | filetype:txt`,
      `site:${domain} filetype:rtf | filetype:csv | filetype:xml | filetype:conf | filetype:dat | filetype:ini | filetype:log | filetype:py | filetype:html | filetype:sh`,
      `site:${domain} filetype:key | filetype:sign | filetype:md | filetype:old | filetype:bin | filetype:cer | filetype:crt | filetype:pfx | filetype:crl | filetype:crs | filetype:der`,
    ],
  },
  confidential: {
    label: "Confidential Docs",
    color: "#ff4488",
    group: "files",
    dorks: [
      `inurl:${target} not for distribution | confidential | "employee only" | proprietary | "top secret" | classified | "trade secret" | internal | private filetype:xls OR filetype:csv OR filetype:doc OR filetype:pdf`,
    ],
  },
  config_files: {
    label: "Config Files",
    color: "#ff6600",
    group: "config",
    dorks: [
      `site:${domain} ext:xml | ext:conf | ext:cnf | ext:reg | ext:inf | ext:rdp | ext:cfg | ext:txt | ext:ora | ext:env | ext:ini`,
    ],
  },
  database_files: {
    label: "Database Files",
    color: "#cc4444",
    group: "config",
    dorks: [`site:${domain} ext:sql | ext:dbf | ext:mdb`],
  },
  private_keys: {
    label: "Private Keys & Secrets",
    color: "#ff2244",
    group: "secrets",
    dorks: [
      `intext:"BEGIN RSA PRIVATE KEY" "${target}"`,
      `intext:"BEGIN OPENSSH PRIVATE KEY" "${target}"`,
      `intext:"api_key" "${target}"`,
      `intext:"client_secret" "${target}"`,
      `intext:"secret_key" "${target}"`,
      `intext:"access_token" "${target}"`,
      `intext:"PRIVATE KEY" "${target}"`,
    ],
  },
  sensitive_files: {
    label: "Sensitive File Types",
    color: "#ff6633",
    group: "secrets",
    dorks: [
      `filetype:env "${target}"`,
      `filetype:sql "${target}"`,
      `filetype:log "${target}"`,
      `filetype:bak inurl:${target}`,
      `filetype:xls intext:"${target}"`,
      `inurl:wp-config.php`,
      `inurl:.env "${target}"`,
    ],
  },
  other_files: {
    label: "Other Interesting Files",
    color: "#dd6600",
    group: "files",
    dorks: [
      `site:${domain} intitle:index.of | ext:log | ext:php intitle:phpinfo "published by the PHP Group"`,
      `site:${domain} inurl:shell | inurl:backdoor | inurl:wso | inurl:cmd | shadow | passwd | boot.ini`,
      `site:${domain} inurl:readme | inurl:license | inurl:install | inurl:setup | inurl:config`,
      `site:${domain} inurl:"/phpinfo.php" | inurl:".htaccess" | ext:swf`,
    ],
  },
  sql_errors: {
    label: "SQL Errors",
    color: "#ffcc00",
    group: "errors",
    dorks: [
      `site:${domain} intext:"sql syntax near" | intext:"syntax error has occurred" | intext:"incorrect syntax near"`,
      `site:${domain} intext:"unexpected end of SQL command" | intext:"Warning: mysql_connect()" | intext:"Warning: mysql_query()" | intext:"Warning: pg_connect()"`,
    ],
  },
  php_errors: {
    label: "PHP Errors",
    color: "#aa88ff",
    group: "errors",
    dorks: [`site:${domain} "PHP Parse error" | "PHP Warning" | "PHP Error"`],
  },
  generic_errors: {
    label: "Generic Error Leaks",
    color: "#ffaa44",
    group: "errors",
    dorks: [
      `site:${domain} "error"`,
      `site:${domain} "stack trace"`,
      `site:${domain} "exception"`,
      `site:${domain} "warning"`,
    ],
  },
  subdomains: {
    label: "Surface Mapping",
    color: "#00aaff",
    group: "recon",
    dorks: [
      `site:*.${domain}`,
      `site:*.*.${domain}`,
      `site:${domain}`,
      `site:${domain} -www`,
    ],
  },
  api_surface: {
    label: "API Surface",
    color: "#00ccff",
    group: "recon",
    dorks: [
      `site:${domain} inurl:api`,
      `site:${domain} inurl:api/v1 OR inurl:api/v2`,
      `site:${domain} inurl:graphql`,
      `site:${domain} inurl:rest`,
    ],
  },
  frontend_intel: {
    label: "Frontend / JS Intel",
    color: "#88ccff",
    group: "recon",
    dorks: [
      `site:${domain} filetype:js`,
      `site:${domain} inurl:static/js`,
      `site:${domain} "window.__"`,
      `site:${domain} "config"`,
      `site:${domain} "api"`,
    ],
  },
  dev_staging: {
    label: "Dev & Staging",
    color: "#66aaff",
    group: "recon",
    dorks: [
      `site:${domain} (dev OR test OR staging OR sandbox)`,
      `site:${domain} inurl:dev`,
      `site:${domain} inurl:test`,
      `site:${domain} inurl:staging`,
    ],
  },
  api_docs: {
    label: "API Documentation",
    color: "#5599ff",
    group: "recon",
    dorks: [
      `site:${domain} swagger`,
      `site:${domain} openapi`,
      `site:${domain} docs`,
      `site:${domain} developer`,
    ],
  },
  login_pages: {
    label: "Login & Admin Pages",
    color: "#aa44ff",
    group: "recon",
    dorks: [
      `site:${domain} inurl:signup | inurl:register | intitle:Signup | inurl:admin | inurl:login | inurl:adminlogin | inurl:cplogin | inurl:weblogin | inurl:quicklogin`,
      `site:${domain} inurl:wp-admin | inurl:wp-login | inurl:portal | inurl:userportal | inurl:loginpanel | inurl:memberlogin | inurl:remote | inurl:dashboard | inurl:auth | inurl:exchange | inurl:ForgotPassword | inurl:test`,
    ],
  },
  open_redirects: {
    label: "Open Redirects",
    color: "#44ffaa",
    group: "vulns",
    dorks: [`site:${domain} inurl:redir | inurl:url | inurl:redirect | inurl:return | inurl:src=http | inurl:r=http`],
  },
  path_traversal: {
    label: "Directory Listings",
    color: "#ffdd44",
    group: "vulns",
    dorks: [
      `"${target}" intitle:"index of" "parent directory" | intitle:"index of" "DCIM" | intitle:"index of" "ftp"`,
      `"${target}" intitle:"index of" "backup" | intitle:"index of" "mail" | intitle:"index of" "password" | intitle:"index of" "pub" | intitle:"index of" ".git"`,
      `site:${domain} intitle:"directory listing"`,
    ],
  },
  apache_struts: {
    label: "Apache Struts RCE",
    color: "#ff4400",
    group: "vulns",
    dorks: [`site:${domain} ext:action | ext:struts | ext:do`],
  },
  wordpress: {
    label: "WordPress Files",
    color: "#4488ff",
    group: "cms",
    dorks: [`site:${domain} inurl:wp-content | inurl:wp-includes`],
  },
  cloud_buckets: {
    label: "Cloud Buckets (S3/GCP)",
    color: "#ff9900",
    group: "cloud",
    dorks: [`site:.s3.amazonaws.com | site:storage.googleapis.com | site:amazonaws.com "${target}"`],
  },
  traefik: {
    label: "Traefik Dashboard",
    color: "#00ddff",
    group: "cloud",
    dorks: [`intitle:traefik inurl:8080/dashboard "${target}"`],
  },
  jenkins: {
    label: "Jenkins",
    color: "#cc4400",
    group: "cloud",
    dorks: [`intitle:"Dashboard [Jenkins]" "${target}"`],
  },
  project_mgmt: {
    label: "Project Management",
    color: "#00bbff",
    group: "third_party",
    dorks: [`site:trello.com | site:*.atlassian.net "${target}"`],
  },
  code_repos: {
    label: "Code Repositories",
    color: "#8844ff",
    group: "third_party",
    dorks: [`site:github.com | site:gitlab.com | site:bitbucket.org "${target}"`],
  },
  secrets_third_party: {
    label: "Secrets on 3rd Parties",
    color: "#ff2266",
    group: "third_party",
    dorks: [
      `site:pastebin.com "${target}"`,
      `site:trello.com "${target}"`,
      `site:gitlab.com "${target}"`,
      `site:s3.amazonaws.com "${target}"`,
      `site:codeshare.io "${target}"`,
      `site:jsfiddle.net "${target}"`,
      `site:scribd.com "${target}"`,
      `site:codepad.co "${target}"`,
      `site:npmjs.com "${target}"`,
      `site:replit.com "${target}"`,
    ],
  },
  code_share: {
    label: "Code Share Sites",
    color: "#6644ff",
    group: "third_party",
    dorks: [
      `site:sharecode.io | site:controlc.com | site:codepad.co | site:ideone.com | site:codebeautify.org "${target}"`,
      `site:jsdelivr.com | site:codeshare.io | site:codepen.io | site:repl.it | site:jsfiddle.net "${target}"`,
    ],
  },
  pastebin: {
    label: "Pastebin Sites",
    color: "#44ddaa",
    group: "third_party",
    dorks: [`site:justpaste.it | site:heypasteit.com | site:pastebin.com "${target}"`],
  },
  stackoverflow: {
    label: "Stack Overflow",
    color: "#ff8800",
    group: "third_party",
    dorks: [`site:stackoverflow.com "${domain}"`],
  },
  other_third_party: {
    label: "Other 3rd Party Sites",
    color: "#44bbff",
    group: "third_party",
    dorks: [
      `site:gitter.im | site:papaly.com | site:productforums.google.com | site:coggle.it | site:replt.it | site:ycombinator.com "${target}"`,
      `site:libraries.io | site:npm.runkit.com | site:npmjs.com | site:scribd.com "${target}"`,
    ],
  },
  linkedin: {
    label: "LinkedIn Employees",
    color: "#0088cc",
    group: "osint",
    dorks: [`site:linkedin.com employees ${domain}`],
  },
});

const GROUPS = {
  infra: { label: "Infrastructure", color: "#ff5555" },
  files: { label: "Files & Docs", color: "#ffaa00" },
  config: { label: "Config & DB", color: "#ff6600" },
  secrets: { label: "Secrets & Keys", color: "#ff2244" },
  errors: { label: "Error Leaks", color: "#ffcc00" },
  recon: { label: "Recon", color: "#00aaff" },
  vulns: { label: "Vulnerabilities", color: "#ff4444" },
  cms: { label: "CMS", color: "#4488ff" },
  cloud: { label: "Cloud & DevOps", color: "#00ddff" },
  third_party: { label: "3rd Party Intel", color: "#aa44ff" },
  osint: { label: "OSINT", color: "#44bbff" },
};

const buildGoogleUrl = (q) =>
  `https://www.google.com/search?q=${encodeURIComponent(q)}`;

const scanlineStyle = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
  pointerEvents: "none", zIndex: 9999,
};

// ─── TerminalHeader ───────────────────────────────────────────────────────────
function TerminalHeader({ target, totalSelected, totalDorks }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ borderBottom: "1px solid #1a3a1a", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,15,0,0.8)", backdropFilter: "blur(4px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color:"#00ff41", fontFamily:"'Share Tech Mono',monospace", fontSize:13, letterSpacing:3 }}>
          DORKFORGE PRO
        </span>
        {target && <span style={{ color:"#006622", fontSize:11, fontFamily:"monospace" }}>TARGET: <span style={{ color:"#00ff41" }}>{target}</span></span>}
      </div>
      <div style={{ display:"flex", gap:20, alignItems:"center" }}>
        <span style={{ color:"#004422", fontSize:10, fontFamily:"monospace" }}>{totalSelected}/{totalDorks} SELECTED</span>
        <span style={{ color:"#003311", fontSize:10, fontFamily:"monospace" }}>{time.toISOString().replace("T"," ").slice(0,19)} UTC</span>
      </div>
    </div>
  );
}

// ─── GroupFilter ──────────────────────────────────────────────────────────────
function GroupFilter({ activeGroups, onToggle, dorkLib }) {
  const groupCounts = {};
  Object.values(dorkLib).forEach(cat => {
    groupCounts[cat.group] = (groupCounts[cat.group] || 0) + 1;
  });
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:5, padding:"10px 14px", borderBottom:"1px solid #0a1e0a" }}>
      <button onClick={() => onToggle("ALL")} style={{ border:`1px solid #1a4a1a`, background:"transparent", color:"#446644", padding:"4px 10px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:11 }}>
        ALL
      </button>
      <button onClick={() => onToggle("NONE")} style={{ border:`1px solid #1a4a1a`, background:"transparent", color:"#446644", padding:"4px 10px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:11 }}>
        NONE
      </button>
      {Object.entries(GROUPS).map(([key, g]) => (
        <button key={key} onClick={() => onToggle(key)}
          style={{ border:`1px solid ${activeGroups.has(key)?g.color:"#1a3a1a"}`, background:activeGroups.has(key)?`${g.color}15`:"transparent", color:activeGroups.has(key)?g.color:"#335533", padding:"4px 9px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:10, transition:"all 0.15s", boxShadow:activeGroups.has(key)?`0 0 6px ${g.color}33`:"none" }}>
          {g.label} <span style={{ opacity:0.6 }}>({groupCounts[key]||0})</span>
        </button>
      ))}
    </div>
  );
}

// ─── DorkRow ──────────────────────────────────────────────────────────────────
function DorkRow({ dork, selected, onToggle, catColor, onOpenTab }) {
  const [copied, setCopied] = useState(false);
  const copy = e => { e.stopPropagation(); navigator.clipboard.writeText(dork); setCopied(true); setTimeout(()=>setCopied(false),1200); };
  return (
    <div onClick={onToggle} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"7px 12px", borderBottom:"1px solid #081408", cursor:"pointer", background:selected?`${catColor}0d`:"transparent", transition:"background 0.1s" }}>
      <div style={{ width:12, height:12, border:`1px solid ${selected?catColor:"#1a3a1a"}`, background:selected?catColor:"transparent", borderRadius:2, flexShrink:0, marginTop:2, boxShadow:selected?`0 0 5px ${catColor}88`:"none", transition:"all 0.15s" }} />
      <code style={{ flex:1, color:selected?"#00ff41":"#446644", fontSize:11, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.5, wordBreak:"break-all" }}>
        {dork}
      </code>
      <div style={{ display:"flex", gap:4, flexShrink:0, paddingTop:1 }}>
        <button onClick={copy} style={{ background:"transparent", border:`1px solid ${copied?"#00ff41":"#152515"}`, color:copied?"#00ff41":"#2a4a2a", padding:"1px 7px", borderRadius:2, cursor:"pointer", fontSize:9, fontFamily:"monospace" }}>
          {copied?"COPIED":"COPY"}
        </button>
        <button onClick={e=>{e.stopPropagation();onOpenTab(dork);}} style={{ background:"transparent", border:"1px solid #152515", color:"#2a4a2a", padding:"1px 7px", borderRadius:2, cursor:"pointer", fontSize:9, fontFamily:"monospace" }}>
          OPEN
        </button>
      </div>
    </div>
  );
}

// ─── AIPanel ──────────────────────────────────────────────────────────────────
function AIPanel({ target, selectedDorks }) {
  const [messages, setMessages] = useState([
    { role:"assistant", text:`DorkForge AI online. Loaded with full bug bounty recon methodology.\n\nI can:\n- Suggest additional dork patterns for your target\n- Explain what findings might indicate\n- Prioritize which categories to run first\n- Help interpret results\n\nSet a target domain and ask me anything.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newHistory = [...historyRef.current, { role:"user", content:userMsg }];
    historyRef.current = newHistory;
    setMessages(prev => [...prev, { role:"user", text:userMsg }]);
    setLoading(true);

    const sys = `You are DorkForge AI, an expert security researcher specializing in Google Dorking, OSINT, and attack surface enumeration for legitimate authorized penetration testing and bug bounty programs.

Current recon session:
- Target domain: ${target || "(not set)"}
- Active selected dorks: ${selectedDorks.length} queries selected
${selectedDorks.length > 0 ? `- Sample queries: ${selectedDorks.slice(0,4).join(" | ")}` : ""}

Your role: Help the user discover additional attack surface, explain what findings mean, suggest prioritization strategies, and interpret results. Format dork queries in backticks. Be concise, technical, and practical.
Always remind that queries should only be used on authorized targets.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: sys, messages: newHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API request failed");
      const reply = data.reply || "No response.";
      historyRef.current = [...newHistory, { role: "assistant", content: reply }];
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const renderText = text => {
    const parts = text.split(/(`[^`\n]+`)/g);
    return parts.map((p,i) =>
      p.startsWith("`") && p.endsWith("`")
        ? <code key={i} style={{ background:"#001800", border:"1px solid #1a4a1a", padding:"1px 5px", borderRadius:2, color:"#00ff41", fontSize:10, display:"inline-block" }}>{p.slice(1,-1)}</code>
        : <span key={i}>{p}</span>
    );
  };

  const quickPrompts = [
    "What categories should I prioritize for a bug bounty?",
    "Explain what .git folder exposure means",
    "How do I interpret SQL error findings?",
    "Suggest cloud-specific dorks for AWS targets",
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
        {messages.map((m,i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{
              maxWidth:"92%", background:m.role==="user"?"#001a08":"#000d00",
              border:`1px solid ${m.role==="user"?"#00aa44":"#1a4a1a"}`,
              padding:"8px 11px", borderRadius:m.role==="user"?"8px 8px 2px 8px":"8px 8px 8px 2px",
              color:m.role==="user"?"#00ff41":"#88cc88", fontSize:11, fontFamily:"monospace", lineHeight:1.65, whiteSpace:"pre-wrap",
            }}>
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:4, padding:"4px 0" }}>
            {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#00ff41", animation:`blink 1s ${i*0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length < 3 && (
        <div style={{ padding:"0 14px 8px", display:"flex", flexWrap:"wrap", gap:5 }}>
          {quickPrompts.map((p,i) => (
            <button key={i} onClick={()=>{ setInput(p); }} style={{ background:"transparent", border:"1px solid #1a3a1a", color:"#336633", padding:"4px 8px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:10, textAlign:"left" }}>
              {p}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding:"10px 14px", borderTop:"1px solid #0a1e0a", display:"flex", gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask about dork patterns, findings, strategy..."
          style={{ flex:1, background:"#000d00", border:"1px solid #1a3a1a", color:"#00ff41", padding:"7px 10px", borderRadius:3, fontFamily:"monospace", fontSize:11, outline:"none" }}
        />
        <button onClick={send} disabled={loading} style={{ background:loading?"#001500":"#00aa44", color:"#000", border:"none", padding:"7px 14px", borderRadius:3, cursor:loading?"not-allowed":"pointer", fontFamily:"monospace", fontSize:12, fontWeight:700 }}>SEND</button>
      </div>
    </div>
  );
}

// ─── FindingsWorkspace ────────────────────────────────────────────────────────
function FindingsWorkspace({ findings, onAdd, onDelete, onExport }) {
  const [form, setForm] = useState({ query:"", severity:"info", notes:"", finding:"" });
  const [adding, setAdding] = useState(false);
  const save = () => {
    if (!form.query.trim()) return;
    onAdd({ ...form, date:new Date().toISOString() });
    setForm({ query:"", severity:"info", notes:"", finding:"" });
    setAdding(false);
  };
  const sevColors = { critical:"#ff2244", high:"#ff6600", medium:"#ffaa00", low:"#44ff88", info:"#44aaff" };

  return (
    <div style={{ padding:14, display:"flex", flexDirection:"column", gap:10, height:"100%", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ color:"#00aa44", fontSize:11, fontFamily:"monospace" }}>FINDINGS ({findings.length})</span>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onExport} style={{ background:"transparent", border:"1px solid #1a4a1a", color:"#446644", padding:"4px 9px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>EXPORT</button>
          <button onClick={()=>setAdding(!adding)} style={{ background:"transparent", border:"1px solid #00aa44", color:"#00aa44", padding:"4px 9px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>
            {adding?"CANCEL":"+ ADD"}
          </button>
        </div>
      </div>

      {adding && (
        <div style={{ border:"1px solid #1a4a1a", borderRadius:3, padding:10, background:"#000d00", display:"flex", flexDirection:"column", gap:7 }}>
          {[["Query / Dork Used","query","site:example.com filetype:sql"],["Notes","notes","What you observed..."],["Finding","finding","Asset/exposure discovered"]].map(([label,key,ph])=>(
            <div key={key}>
              <div style={{ color:"#335533", fontSize:9, fontFamily:"monospace", marginBottom:2 }}>{label.toUpperCase()}</div>
              <input value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                style={{ width:"100%", background:"#000800", border:"1px solid #1a3a1a", color:"#00ff41", padding:"5px 8px", borderRadius:2, fontFamily:"monospace", fontSize:10, outline:"none", boxSizing:"border-box" }}
              />
            </div>
          ))}
          <div>
            <div style={{ color:"#335533", fontSize:9, fontFamily:"monospace", marginBottom:2 }}>SEVERITY</div>
            <div style={{ display:"flex", gap:5 }}>
              {Object.entries(sevColors).map(([s,c])=>(
                <button key={s} onClick={()=>setForm(p=>({...p,severity:s}))}
                  style={{ border:`1px solid ${form.severity===s?c:"#1a3a1a"}`, background:form.severity===s?`${c}22`:"transparent", color:form.severity===s?c:"#335533", padding:"3px 8px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:9, textTransform:"uppercase" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={save} style={{ background:"#00aa44", color:"#000", border:"none", padding:"6px", borderRadius:2, cursor:"pointer", fontFamily:"monospace", fontSize:10, fontWeight:700 }}>SAVE ENTRY</button>
        </div>
      )}

      {findings.length===0 && !adding && (
        <div style={{ color:"#1a3a1a", fontFamily:"monospace", fontSize:11, textAlign:"center", padding:"40px 0", lineHeight:2 }}>
          No findings yet.<br/>Run your dorks and document discovered assets.
        </div>
      )}

      {findings.map((f,i)=>(
        <div key={i} style={{ border:`1px solid ${sevColors[f.severity]||"#1a4a1a"}22`, borderLeft:`3px solid ${sevColors[f.severity]||"#1a4a1a"}`, borderRadius:3, padding:"9px 11px", background:"#000d00" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, alignItems:"flex-start", gap:8 }}>
            <code style={{ color:"#00ff41", fontSize:10, flex:1, wordBreak:"break-all" }}>{f.query}</code>
            <div style={{ display:"flex", gap:5, flexShrink:0 }}>
              <span style={{ color:sevColors[f.severity], fontSize:9, fontFamily:"monospace", textTransform:"uppercase", border:`1px solid ${sevColors[f.severity]}44`, padding:"1px 5px", borderRadius:2 }}>{f.severity}</span>
              <span style={{ color:"#224422", fontSize:9, fontFamily:"monospace" }}>{f.date.slice(0,10)}</span>
              <button onClick={()=>onDelete(i)} style={{ background:"transparent", border:"1px solid #2a1a1a", color:"#442222", padding:"1px 5px", borderRadius:2, cursor:"pointer", fontSize:9, fontFamily:"monospace" }}>DEL</button>
            </div>
          </div>
          {f.notes && <div style={{ color:"#558855", fontSize:10, fontFamily:"monospace", marginBottom:3 }}>Notes: {f.notes}</div>}
          {f.finding && <div style={{ color:"#448844", fontSize:10, fontFamily:"monospace", background:"#001500", padding:"4px 6px", borderRadius:2 }}>Finding: {f.finding}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function DorkForge() {
  const [target, setTarget] = useState("");
  const [domain, setDomain] = useState("");
  const [activeGroups, setActiveGroups] = useState(new Set(["infra","files","config","secrets","recon","errors"]));
  const [selected, setSelected] = useState(new Set());
  const [customDorks, setCustomDorks] = useState([]);
  const [newCustom, setNewCustom] = useState("");
  const [tab, setTab] = useState("builder");
  const [findings, setFindings] = useState([]);
  const [notification, setNotification] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [expandedCats, setExpandedCats] = useState(new Set());

  const notify = (msg, color="#00ff41") => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 2200);
  };

  // Derive domain & target from input
  const handleTargetChange = (val) => {
    const cleaned = val.replace(/https?:\/\//g,"").split("/")[0];
    setTarget(cleaned);
    setDomain(cleaned);
  };

  const dorkLib = buildDorkLibrary(domain || "{domain}", target || "{target}");

  const activeCats = Object.entries(dorkLib).filter(([,v]) => activeGroups.has(v.group));

  const allDorkEntries = [
    ...activeCats.flatMap(([catKey, cat]) =>
      cat.dorks
        .filter(d => !searchFilter || d.toLowerCase().includes(searchFilter.toLowerCase()))
        .map(dork => ({ dork, catKey, catColor:cat.color }))
    ),
    ...customDorks.map(dork => ({ dork, catKey:"custom", catColor:"#00ccaa" })),
  ];

  const toggleGroup = (g) => {
    if (g === "ALL") { setActiveGroups(new Set(Object.keys(GROUPS))); return; }
    if (g === "NONE") { setActiveGroups(new Set()); return; }
    setActiveGroups(prev => { const n=new Set(prev); n.has(g)?n.delete(g):n.add(g); return n; });
  };

  const toggleDork = (idx) => setSelected(prev => { const n=new Set(prev); n.has(idx)?n.delete(idx):n.add(idx); return n; });
  const selectAll = () => setSelected(new Set(allDorkEntries.map((_,i)=>i)));
  const selectNone = () => setSelected(new Set());

  const resolvedSelected = [...selected]
    .map(i => allDorkEntries[i]?.dork)
    .filter(Boolean);

  const openSelected = () => {
    if (!target.trim()) { notify("Set a target domain first!", "#ff4444"); return; }
    if (selected.size === 0) { notify("Select at least one dork.", "#ffaa00"); return; }
    resolvedSelected.forEach(q => window.open(buildGoogleUrl(q), "_blank"));
    notify(`Opened ${selected.size} tabs`);
  };

  const exportJSON = () => {
    const data = JSON.stringify({
      target, generated:new Date().toISOString(),
      total_queries:resolvedSelected.length,
      queries:resolvedSelected.map(q=>({ query:q, url:buildGoogleUrl(q) })),
      findings,
    }, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data],{type:"application/json"}));
    a.download = `dorkforge-${target||"export"}-${Date.now()}.json`;
    a.click();
    notify("JSON exported");
  };

  const exportFindings = () => {
    const lines = findings.map(f =>
      `[${f.severity.toUpperCase()}] ${f.date.slice(0,10)} | ${f.query}\nNotes: ${f.notes}\nFinding: ${f.finding}\n`
    ).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines],{type:"text/plain"}));
    a.download = `dorkforge-findings-${target||"export"}-${Date.now()}.txt`;
    a.click();
    notify("Findings exported");
  };

  const addCustomDork = () => {
    if (!newCustom.trim()) return;
    setCustomDorks(p=>[...p, newCustom.trim()]);
    setNewCustom("");
    notify("Custom dork added");
  };

  const toggleCat = (key) => setExpandedCats(prev => { const n=new Set(prev); n.has(key)?n.delete(key):n.add(key); return n; });

  // Group active cats by group for rendering
  const catsByGroup = {};
  activeCats.forEach(([key,cat]) => {
    if (!catsByGroup[cat.group]) catsByGroup[cat.group] = [];
    catsByGroup[cat.group].push([key,cat]);
  });

  return (
    <div style={{ position:"fixed", inset:0, background:"#010901", color:"#00cc44", fontFamily:"monospace", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600&family=Share+Tech+Mono&display=swap');
        html, body, #root { margin:0; padding:0; width:100%; height:100%; background:#010901; overflow:hidden; }
        * { box-sizing:border-box; scrollbar-width:thin; scrollbar-color:#1a4a1a #010901; }
        ::-webkit-scrollbar { width:4px; height:4px; } ::-webkit-scrollbar-track { background:#010901; } ::-webkit-scrollbar-thumb { background:#1a4a1a; }
        input::placeholder { color:#1a3a1a; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .cat-row:hover { background:#001a00 !important; }
      `}</style>
      <div style={scanlineStyle} />

      {notification && (
        <div style={{ position:"fixed", top:60, right:18, background:"#010901", border:`1px solid ${notification.color}`, color:notification.color, padding:"7px 14px", borderRadius:3, fontFamily:"monospace", fontSize:11, zIndex:10000, boxShadow:`0 0 12px ${notification.color}44`, animation:"pulse 0.3s ease-in" }}>
          {notification.msg}
        </div>
      )}

      <TerminalHeader target={target} totalSelected={selected.size} totalDorks={allDorkEntries.length} />

      {/* Top bar */}
      <div style={{ padding:"10px 18px", borderBottom:"1px solid #0a1e0a", display:"flex", gap:10, alignItems:"center", background:"#000d00" }}>
        <span style={{ color:"#335533", fontSize:11, whiteSpace:"nowrap" }}>TARGET</span>
        <input value={target} onChange={e=>handleTargetChange(e.target.value)}
          placeholder="example.com"
          style={{ flex:1, maxWidth:320, background:"#000800", border:"1px solid #1a4a1a", color:"#00ff41", padding:"7px 11px", fontFamily:"'JetBrains Mono',monospace", fontSize:13, borderRadius:3, outline:"none" }}
        />
        <input value={searchFilter} onChange={e=>setSearchFilter(e.target.value)}
          placeholder="Filter dorks..."
          style={{ flex:1, maxWidth:220, background:"#000800", border:"1px solid #152515", color:"#448844", padding:"7px 11px", fontFamily:"monospace", fontSize:11, borderRadius:3, outline:"none" }}
        />
        <div style={{ display:"flex", gap:6, marginLeft:"auto" }}>
          <button onClick={selectAll} style={{ background:"transparent", border:"1px solid #1a3a1a", color:"#335533", padding:"7px 10px", borderRadius:3, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>ALL</button>
          <button onClick={selectNone} style={{ background:"transparent", border:"1px solid #1a3a1a", color:"#335533", padding:"7px 10px", borderRadius:3, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>CLEAR</button>
          <button onClick={openSelected}
            style={{ background:selected.size>0&&target?"#00aa44":"#001500", color:selected.size>0&&target?"#000":"#1a3a1a", border:`1px solid ${selected.size>0&&target?"#00aa44":"#152515"}`, padding:"7px 14px", borderRadius:3, cursor:"pointer", fontFamily:"monospace", fontSize:11, fontWeight:700, transition:"all 0.2s" }}>
            OPEN {selected.size>0?`(${selected.size})`:""}
          </button>
          <button onClick={exportJSON} style={{ background:"transparent", border:"1px solid #1a3a1a", color:"#335533", padding:"7px 10px", borderRadius:3, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>EXPORT JSON</button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* Left panel */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", borderRight:"1px solid #0a1e0a", overflow:"hidden", minWidth:0 }}>
          <GroupFilter activeGroups={activeGroups} onToggle={toggleGroup} dorkLib={dorkLib} />

          <div style={{ flex:1, overflowY:"auto" }}>
            {Object.entries(catsByGroup).map(([groupKey, cats]) => (
              <div key={groupKey}>
                {/* Group header */}
                <div style={{ padding:"5px 14px", background:"#000500", borderBottom:"1px solid #081208", color:GROUPS[groupKey]?.color||"#446644", fontSize:10, letterSpacing:2, display:"flex", alignItems:"center", gap:8 }}>
                  {GROUPS[groupKey]?.label?.toUpperCase()}
                </div>

                {cats.map(([catKey, cat]) => {
                  const catDorks = allDorkEntries.filter(d=>d.catKey===catKey);
                  const catSelected = catDorks.filter((_,i)=>{
                    const globalIdx = allDorkEntries.indexOf(catDorks[i] === allDorkEntries[allDorkEntries.indexOf(catDorks[i])] ? catDorks[i] : null);
                    return selected.has(allDorkEntries.indexOf(catDorks[i]));
                  }).length;
                  const expanded = expandedCats.has(catKey);

                  return (
                    <div key={catKey}>
                      <div className="cat-row" onClick={()=>toggleCat(catKey)}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderBottom:"1px solid #061006", cursor:"pointer", background:expanded?`${cat.color}08`:"transparent", transition:"background 0.1s" }}>
                        <span style={{ flex:1, color:expanded?cat.color:"#446644", fontSize:11, fontFamily:"monospace" }}>{cat.label}</span>
                        <span style={{ color:"#224422", fontSize:10 }}>{cat.dorks.filter(d=>!searchFilter||d.toLowerCase().includes(searchFilter.toLowerCase())).length} dorks</span>
                        {catSelected>0 && <span style={{ background:cat.color, color:"#000", borderRadius:10, padding:"1px 6px", fontSize:9, fontWeight:700 }}>{catSelected}</span>}
                        <span style={{ color:"#224422", fontSize:10 }}>{expanded?"-":"+"}</span>
                      </div>
                      {expanded && cat.dorks
                        .filter(d=>!searchFilter||d.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map(dork => {
                          const globalIdx = allDorkEntries.findIndex(e=>e.dork===dork && e.catKey===catKey);
                          return (
                            <DorkRow key={dork} dork={dork} selected={selected.has(globalIdx)}
                              onToggle={()=>toggleDork(globalIdx)} catColor={cat.color}
                              onOpenTab={q=>window.open(buildGoogleUrl(q),"_blank")}
                            />
                          );
                        })
                      }
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Custom dorks */}
            {customDorks.length > 0 && (
              <div>
                <div style={{ padding:"5px 14px", background:"#000500", borderBottom:"1px solid #081208", color:"#00ccaa", fontSize:10, letterSpacing:2 }}>CUSTOM DORKS</div>
                {customDorks.map((dork,j)=>{
                  const globalIdx = allDorkEntries.findIndex(e=>e.dork===dork&&e.catKey==="custom");
                  return (
                    <div key={j} style={{ display:"flex", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <DorkRow dork={dork} selected={selected.has(globalIdx)} onToggle={()=>toggleDork(globalIdx)} catColor="#00ccaa" onOpenTab={q=>window.open(buildGoogleUrl(q),"_blank")} />
                      </div>
                      <button onClick={()=>setCustomDorks(p=>p.filter((_,i)=>i!==j))} style={{ background:"transparent", border:"none", color:"#442222", cursor:"pointer", padding:"8px 10px", fontSize:11, flexShrink:0 }}>DEL</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add custom dork */}
          <div style={{ padding:"9px 14px", borderTop:"1px solid #0a1e0a", display:"flex", gap:7, background:"#000900" }}>
            <input value={newCustom} onChange={e=>setNewCustom(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomDork()}
              placeholder='Custom: intext:"api_key" "{target}" or filetype:env site:{target}'
              style={{ flex:1, background:"#000600", border:"1px solid #1a3a1a", color:"#00cc88", padding:"6px 9px", borderRadius:3, fontFamily:"monospace", fontSize:10, outline:"none" }}
            />
            <button onClick={addCustomDork} style={{ background:"transparent", border:"1px solid #1a4a1a", color:"#446644", padding:"6px 12px", borderRadius:3, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>+ ADD</button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width:370, display:"flex", flexDirection:"column", background:"#010801", borderLeft:"1px solid #0a1e0a" }}>
          <div style={{ display:"flex", borderBottom:"1px solid #0a1e0a" }}>
            {[["builder","QUEUE"],["ai","AI"],["findings","FINDINGS"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"9px 4px", background:tab===t?"#001a00":"transparent", border:"none", borderBottom:tab===t?"2px solid #00ff41":"2px solid transparent", color:tab===t?"#00ff41":"#336633", cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ flex:1, overflow:"hidden" }}>
            {tab==="builder" && (
              <div style={{ padding:14, height:"100%", overflowY:"auto" }}>
                <div style={{ color:"#00aa44", fontSize:11, marginBottom:10, fontFamily:"monospace" }}>
                  QUERY QUEUE - {resolvedSelected.length} queries
                </div>
                {resolvedSelected.length===0 ? (
                  <div style={{ color:"#1a3a1a", fontSize:11, textAlign:"center", padding:"30px 0", lineHeight:2 }}>
                    Expand categories on the left<br/>and select dorks to build your queue.
                  </div>
                ) : resolvedSelected.map((q,i)=>(
                  <div key={i} style={{ background:"#000d00", border:"1px solid #152515", borderRadius:2, padding:"7px 9px", marginBottom:5 }}>
                    <code style={{ color:"#448844", fontSize:10, wordBreak:"break-all", display:"block", marginBottom:4 }}>{q}</code>
                    <a href={buildGoogleUrl(q)} target="_blank" rel="noreferrer" style={{ color:"#2a4a2a", fontSize:9, fontFamily:"monospace", textDecoration:"none" }}>google.com/search?q=...</a>
                  </div>
                ))}

                {resolvedSelected.length > 0 && (
                  <div style={{ marginTop:12, padding:10, background:"#000d00", border:"1px solid #152515", borderRadius:3 }}>
                    <div style={{ color:"#335533", fontSize:9, marginBottom:6, fontFamily:"monospace", letterSpacing:1 }}>SESSION SUMMARY</div>
                    <div style={{ color:"#558855", fontSize:10, lineHeight:1.8 }}>
                      Target: <span style={{ color:"#00ff41" }}>{target||"—"}</span><br/>
                      Queued: <span style={{ color:"#00ff41" }}>{resolvedSelected.length}</span> queries<br/>
                      Findings: <span style={{ color:"#00ff41" }}>{findings.length}</span> logged<br/>
                      Groups: <span style={{ color:"#00ff41" }}>{activeGroups.size}</span> active
                    </div>
                  </div>
                )}
              </div>
            )}
            {tab==="ai" && <AIPanel target={target} selectedDorks={resolvedSelected} />}
            {tab==="findings" && (
              <FindingsWorkspace findings={findings} onAdd={f=>setFindings(p=>[f,...p])} onDelete={i=>setFindings(p=>p.filter((_,j)=>j!==i))} onExport={exportFindings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
