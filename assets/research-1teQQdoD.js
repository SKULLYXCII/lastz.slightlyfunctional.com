import{r as N,w as y,c as v}from"./chunk-JZWAC4HX-xdtSG26H.js";
import{j as e}from"./jsx-runtime-u17CrQMm.js";
import{u as S}from"./useLocalStorage-CxO-xjO9.js";
import{u as R,P}from"./PageHeader-vSO7spar.js";
import{c as k,a as B}from"./useTreeCompletion-D_rTg1xW.js";
import{S as M}from"./ProfileContext-C8BvP_C0.js";
import{g as L}from"./index-D78VjQ0o.js";
import{p as T}from"./BackButton-rWdebNTP.js";
import{S as _}from"./SkeletonImage-BcnPkLfr.js";
import"./DrawerShell-DQlLILIm.js";
import"./index-sB5zhkNA.js";

function q(){
  const{getStorageKey:l}=R(),g=l(M.TREE_COMPLETIONS),[t,m]=S(g,{});
  return N.useEffect(()=>{
    if(!t||typeof t!="object"||!("summaries"in t)||!("completions"in t))return;
    const r=t.summaries||{},u=t.completions||{},h=Object.keys(r).filter(o=>r[o]&&r[o].totalLevels===void 0);
    if(h.length===0)return;
    const d={...r};
    for(const o of h){
      const f=L(o);
      if(f){
        const b=u[o]||{};
        d[o]=k(f,b)
      }else delete d[o]
    }
    m({...t,summaries:d})
  },[t,m]),N.useMemo(()=>t&&typeof t=="object"&&"summaries"in t?{summaries:t.summaries||{},milestones:t.milestones||{},completions:t.completions||{}}:{summaries:{},milestones:{},completions:{}},[t])
}

function w(l){
  const g=l&&l.total>0?(l.total-l.remaining)/l.total*100:0,t=l&&l.total>0?Math.floor(l.completed/l.total*100):0,m=l&&(l.totalLevels??0)>0?Math.floor((l.completedLevels??0)/l.totalLevels*100):0;
  return{progressPercent:g,badgePercent:t,levelPercent:m}
}

function C(l){
  return Number.isFinite(l)?l.toLocaleString():"0"
}

function I(l,g){
  return l==="percent"?`${g%1===0?g:g.toFixed(1)}%`:l==="number"?C(g):String(g)
}

function U(l,g){
  if(l.format==="text")return{label:l.label,value:String(l.values[g]??""),format:l.format,isText:!0};
  const t=l.values[g],m=g>0?l.values[g-1]:0;
  if(typeof t!="number")return null;
  const r=typeof m=="number"?t-m:t;
  return r?{label:l.label,value:r,format:l.format,isText:!1}:null
}

const V=[
  {id:"assaulter",label:"Assaulters",color:"text-red-300",match:["assaulter","melee"]},
  {id:"shooter",label:"Shooters",color:"text-cyan-300",match:["shooter","weapon"]},
  {id:"rider",label:"Riders",color:"text-emerald-300",match:["rider","mobility"]}
];

function F(l,g){
  return Math.min(l.maxLevel,g.maxLevel)
}

function H(l,g){
  if(!g.size)return 0;
  const t=`${l.key} ${l.label}`.toLowerCase();
  if(l.key==="power"||l.format==="text")return 0;
  const m=/(^|[^a-z])(atk|attack|def|defense|hp)([^a-z]|$)/.test(t),r=/troop|unit/.test(t);
  for(const u of V)if(g.has(u.id)&&u.match.some(h=>t.includes(h)))return m?5:2.25;
  if(r&&m)return 3.5;
  if(/\btraining\b|march|siege/.test(t))return 1.25;
  return 0
}

function J(l,g,t){
  let m=0,r=0,u=0,h=0;
  for(const d of l.stats||[]){
    const o=U(d,g);
    if(!o||o.isText)continue;
    const f=H(d,t);
    if(d.key==="power")h=typeof o.value=="number"?o.value:0;
    else if(f>0){
      m+=f;
      if(typeof o.value=="number")r+=o.value*f;
      u+=1
    }
  }
  return{directWeight:m,statScore:r,relevantStats:u,powerGain:h}
}

function K(l,g,t,m){
  const r=new Map(l.map(c=>[c.id,c])),u=new Map,h=c=>{
    if(u.has(c))return u.get(c);
    const x=r.get(c);
    if(!x)return 0;
    let p=J(x,m[x.id]||0,t).directWeight;
    for(const s of g.get(c)||[])p=Math.max(p,h(s)*.85);
    u.set(c,p);
    return p
  };
  return h
}

function G(l){
  return String(l).toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim()
}

function Q(l,g,t={},x={}){
  const m=new Map(g.map(r=>[G(r.name),r.id]));
  for(const r of l.unlockRequirements||[]){
    const u=String(r),h=u.match(/(\d+(?:\.\d+)?)%\s+(.+)/);
    if(!h){
      if(!x[G(u)])return!1;
      continue
    }
    const d=m.get(G(h[2]));
    if(!d){
      if(!x[G(u)])return!1;
      continue
    }
    const o=t[d],f=o&&(o.totalLevels??0)>0?o.completedLevels/o.totalLevels*100:o&&o.total>0?o.completed/o.total*100:0;
    if(f<Number(h[1]))return!1
  }
  return!0
}

function W(l){
  const g=new Set(l.map(t=>G(t.name))),m=new Set,r=[];
  for(const t of l)for(const u of t.unlockRequirements||[]){
    const h=String(u),d=h.match(/(\d+(?:\.\d+)?)%\s+(.+)/);
    if(d&&g.has(G(d[2])))continue;
    const o=G(h);
    m.has(o)||(m.add(o),r.push({key:o,label:h}))
  }
  return r
}

function X(l,g,t,m,s,a){
  const r=[];
  for(const u of l){
    if(!Q(u,l,s,a))continue;
    const h=t[u.id]||{},d=new Map(u.nodes.map(n=>[n.id,n])),o=new Map;
    for(const n of u.nodes)o.set(n.id,[]);
    for(const n of u.nodes)for(const x of n.parents||[])o.get(x)?.push(n.id);
    const f=K(u.nodes,o,m,h);
    for(const n of u.nodes){
      const x=h[n.id]||0;
      if(x>=n.maxLevel)continue;
      const p=n.badgeCost?.[x];
      if(!Number.isFinite(p)||p<=0)continue;
      const b=(n.parents||[]).every(s=>{
        const a=d.get(s);
        return a&&(h[s]||0)>=F(a,n)
      });
      if(!b)continue;
      const c=[],j=J(n,x,m);
      for(const s of n.stats||[]){
        const a=U(s,x);
        if(!a)continue;
        s.key==="power"||c.push(a)
      }
      let A=0,E=null;
      for(const s of o.get(n.id)||[]){
        const a=d.get(s),i=a?F(n,a):n.maxLevel;
        if(x<i&&x+1<=i){
          const Q=f(s);
          Q>A&&(A=Q,E=a?.name??null)
        }
      }
      const ee=j.directWeight+A*.75;
      if(m.size>0&&ee<=0)continue;
      const te=j.powerGain/p,se=te*(1+ee)+(j.statScore/p)*1000;
      p<=g&&r.push({treeId:u.id,treeName:u.name,nodeId:n.id,nodeName:n.name,icon:n.icon,fromLevel:x,toLevel:x+1,cost:p,powerGain:j.powerGain,powerPerBadge:te,stats:c,directWeight:j.directWeight,pathWeight:A,pathTarget:E,score:se,relevantStats:j.relevantStats})
    }
  }
  return r.sort((u,h)=>h.score-u.score||h.powerPerBadge-u.powerPerBadge||h.powerGain-u.powerGain||u.cost-h.cost).slice(0,8)
}

function O(l,t,s,a){
  let m=null;
  for(const r of l){
    if(!Q(r,l,s,a))continue;
    const u=t[r.id]||{},h=new Map(r.nodes.map(d=>[d.id,d]));
    for(const d of r.nodes){
      const o=u[d.id]||0;
      if(o>=d.maxLevel)continue;
      const f=d.badgeCost?.[o];
      if(!Number.isFinite(f)||f<=0)continue;
      const b=(d.parents||[]).every(c=>{
        const x=h.get(c);
        return x&&(u[c]||0)>=F(x,d)
      });
      if(b&&(!m||f<m.cost))m={treeName:r.name,nodeName:d.name,toLevel:o+1,cost:f}
    }
  }
  return m
}

function D({trees:l,completions:g,summaries:s={}}){
  const{getStorageKey:a}=R(),i=a("RESEARCH_EXTERNAL_REQUIREMENTS"),n=a("RESEARCH_TROOP_FOCUS"),x=a("RESEARCH_BADGE_COUNT"),[A,E]=S(i,{}),[p,z]=S(n,V.map(s=>s.id)),[t,m]=S(x,""),r=N.useMemo(()=>new Set(Array.isArray(p)?p:V.map(s=>s.id)),[p]),h=N.useMemo(()=>Math.max(0,parseInt(String(t).replace(/[^\d]/g,""),10)||0),[t]),d=N.useMemo(()=>h>0?X(l,h,g,r,s,A):[],[l,h,g,r,s,A]),o=N.useMemo(()=>O(l,g,s,A),[l,g,s,A]),f=s=>{m(a=>String(Math.max(0,(parseInt(String(a).replace(/[^\d]/g,""),10)||0)+s)))},b=s=>{z(a=>{const i=new Set(Array.isArray(a)?a:V.map(n=>n.id));return i.has(s)?i.delete(s):i.add(s),Array.from(i)})},c=N.useMemo(()=>W(l),[l]),j=n=>{E(x=>({...x,[n]:!x?.[n]}))};
  return e.jsxs("section",{className:"mb-4 bg-slate-900 border border-slate-700 rounded-lg p-3 sm:p-4",children:[
    e.jsxs("div",{className:"mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",children:[
      e.jsx("div",{className:"text-xs font-medium text-slate-400 uppercase tracking-wide",children:"Troop Focus"}),
      e.jsx("div",{className:"grid grid-cols-3 gap-2",children:V.map(s=>{const a=r.has(s.id);return e.jsxs("label",{className:`flex items-center justify-center gap-1.5 px-2 py-2 rounded border cursor-pointer select-none transition-colors ${a?"bg-slate-800 border-cyan-500/60 text-white":"bg-slate-950/40 border-slate-700 text-slate-500 hover:text-slate-300"}`,children:[
        e.jsx("input",{type:"checkbox",checked:a,onChange:()=>b(s.id),className:"sr-only"}),
        e.jsx("span",{className:`w-3.5 h-3.5 rounded border flex items-center justify-center ${a?"bg-cyan-500 border-cyan-400":"border-slate-600"}`,children:a&&e.jsx("svg",{className:"w-3 h-3 text-white",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{fillRule:"evenodd",d:"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",clipRule:"evenodd"})})}),
        e.jsx("span",{className:`text-xs font-medium ${a?s.color:""}`,children:s.label})
      ]},s.id)})})
    ]}),
    c.length>0&&e.jsxs("div",{className:"mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",children:[
      e.jsx("div",{className:"text-xs font-medium text-slate-400 uppercase tracking-wide",children:"Other Requirements"}),
      e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-2",children:c.map(n=>{const x=!!A?.[n.key];return e.jsxs("label",{className:`flex items-center justify-center gap-1.5 px-2 py-2 rounded border cursor-pointer select-none transition-colors ${x?"bg-slate-800 border-emerald-500/60 text-white":"bg-slate-950/40 border-slate-700 text-slate-500 hover:text-slate-300"}`,children:[
        e.jsx("input",{type:"checkbox",checked:x,onChange:()=>j(n.key),className:"sr-only"}),
        e.jsx("span",{className:`w-3.5 h-3.5 rounded border flex items-center justify-center ${x?"bg-emerald-500 border-emerald-400":"border-slate-600"}`,children:x&&e.jsx("svg",{className:"w-3 h-3 text-white",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{fillRule:"evenodd",d:"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",clipRule:"evenodd"})})}),
        e.jsx("span",{className:"text-xs font-medium",children:n.label})
      ]},n.key)})})
    ]}),
    e.jsxs("div",{className:"flex flex-col md:flex-row md:items-end gap-3",children:[
      e.jsxs("div",{className:"flex-1",children:[
        e.jsx("label",{htmlFor:"research-badges",className:"block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1",children:"Badges Available"}),
        e.jsxs("div",{className:"relative",children:[
          e.jsx("img",{src:"/icons/other/badge_icon.png",alt:"",className:"absolute top-1/2 -translate-y-1/2 pointer-events-none",style:{left:"0.75rem",width:"1.25rem",height:"1.25rem"}}),
          e.jsx("input",{id:"research-badges",inputMode:"numeric",value:String(t??""),onChange:s=>m(s.target.value.replace(/[^\d]/g,"")),placeholder:"0",style:{paddingLeft:"2.75rem"},className:"w-full pr-10 py-2 bg-slate-800 border border-slate-600 rounded text-white tabular-nums focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"}),
          t&&e.jsx("button",{onClick:()=>m(""),className:"absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors","aria-label":"Clear badges",children:e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})
        ]})
      ]}),
      e.jsxs("div",{className:"flex gap-2",children:[
        e.jsx("button",{onClick:()=>f(500),className:"px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 transition-colors",children:"+500"}),
        e.jsx("button",{onClick:()=>f(1000),className:"px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 transition-colors",children:"+1k"}),
        e.jsx("button",{onClick:()=>f(5000),className:"px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-slate-200 transition-colors",children:"+5k"})
      ]})
    ]}),
    h===0&&e.jsx("div",{className:"mt-3 text-sm text-slate-500 text-center py-2",children:"Enter your badge inventory to see research recommendations."}),
    h>0&&r.size===0&&e.jsx("div",{className:"mt-3 text-sm text-slate-500 text-center py-2",children:"Select at least one troop focus to see faction recommendations."}),
    h>0&&r.size>0&&d.length===0&&e.jsxs("div",{className:"mt-3 text-sm text-slate-400 text-center py-2",children:["No unlocked research fits ",C(h)," badges for the selected focus.",o&&e.jsxs("span",{className:"block text-xs text-slate-500 mt-1",children:["Cheapest unlocked: ",o.treeName," - ",o.nodeName," Lv ",o.toLevel," (",C(o.cost),")"]})]}),
    d.length>0&&e.jsxs("div",{className:"mt-4 space-y-2",children:[
      e.jsx("div",{className:"text-xs text-slate-400 uppercase tracking-wide text-center",children:"Research Recommendations"}),
      e.jsx("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-2",children:d.map((s,a)=>e.jsxs(v,{to:`/research/${s.treeId}`,className:`block rounded border p-3 transition-colors ${a===0?"bg-cyan-950/30 border-cyan-500/50 hover:border-cyan-400":"bg-slate-800/70 border-slate-700 hover:border-slate-600"}`,children:[
        e.jsxs("div",{className:"flex items-start gap-3",children:[
          e.jsx("div",{className:"w-9 h-9 rounded bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden",children:s.icon?e.jsx("img",{src:s.icon,alt:"",className:"w-8 h-8 object-contain"}):e.jsx("span",{className:"text-cyan-400 font-semibold",children:s.nodeName.charAt(0)})}),
          e.jsxs("div",{className:"min-w-0 flex-1",children:[
            e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[
              e.jsxs("div",{className:"min-w-0",children:[
                e.jsx("div",{className:"text-[11px] text-slate-500 truncate",children:s.treeName}),
                e.jsx("div",{className:"text-sm font-semibold text-white truncate",children:s.nodeName})
              ]}),
              e.jsxs("div",{className:"flex shrink-0 gap-1",children:[
                a===0&&e.jsx("span",{className:"px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[11px] font-medium",children:"Best"}),
                s.directWeight===0&&s.pathWeight>0&&e.jsx("span",{className:"px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-medium",children:s.pathTarget?`Path to ${s.pathTarget}`:"Path"})
              ]})
            ]}),
            e.jsxs("div",{className:"mt-2 grid grid-cols-3 gap-2 text-xs",children:[
              e.jsxs("div",{children:[e.jsx("div",{className:"text-slate-500",children:"Level"}),e.jsxs("div",{className:"text-slate-200 tabular-nums",children:[s.fromLevel," -> ",s.toLevel]})]}),
              e.jsxs("div",{children:[e.jsx("div",{className:"text-slate-500",children:"Cost"}),e.jsxs("div",{className:"flex items-center gap-1 text-amber-400 font-medium tabular-nums",children:[e.jsx("img",{src:"/icons/other/badge_icon.png",alt:"",className:"w-4 h-4"}),C(s.cost)]})]}),
              e.jsxs("div",{children:[e.jsx("div",{className:"text-slate-500",children:"Power"}),e.jsxs("div",{className:"text-green-400 font-medium tabular-nums",children:["+",C(s.powerGain)]})]})
            ]}),
            s.stats.length>0&&e.jsx("div",{className:"mt-2 flex flex-wrap gap-1",children:s.stats.slice(0,3).map(n=>e.jsxs("span",{className:"inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700 text-[11px]",children:[
              e.jsx("span",{className:"text-slate-300",children:n.label}),
              e.jsx("span",{className:"text-cyan-300 font-medium",children:n.isText?n.value:`+${I(n.format,n.value)}`})
            ]},n.label))})
          ]})
        ]}),
        e.jsxs("div",{className:"mt-2 text-[11px] text-slate-500 text-right",children:[C(Math.round(s.powerPerBadge))," power / badge"]})
      ]},`${s.treeId}-${s.nodeId}`))})
    ]})
  ]})
}

function Z({}){return[{title:T("Research Trees")},{name:"description",content:"Browse game research trees"}]}

const A=y(function({loaderData:g}){
  const{trees:t,incompleteTrees:m}=g,{summaries:r,milestones:u,completions:h}=q(),{totalBadges:d,totalRemaining:o,totalSpent:f}=N.useMemo(()=>{
    let s=0,a=0;
    for(const n of t){
      s+=n.totalBadges;
      const c=r[n.id];
      c?a+=c.remaining:a+=n.totalBadges
    }
    return{totalBadges:s,totalRemaining:a,totalSpent:s-a}
  },[t,r]),b=N.useMemo(()=>{
    let s=0;
    for(const a of t){
      const n=u[a.id];
      if(!n)continue;
      const c=new Map(a.nodes.map(i=>[i.id,i])),x=new Map(a.nodes.map(i=>[i.id,i.parents])),p=h[a.id]||{};
      s+=B(n,p,c,x)
    }
    return s
  },[t,u,h]);
  const j=s=>{
    const a=r[s.id],n=a?a.remaining:s.totalBadges,{progressPercent:c,badgePercent:x,levelPercent:p}=w(a);
    return e.jsxs(v,{to:`/research/${s.id}`,className:"block bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors overflow-hidden",children:[
      e.jsxs("div",{className:"relative",children:[
        e.jsx(_,{src:`/icons/research-trees/${s.id}.png`,alt:s.name,aspectRatio:"313/398",containerClassName:"w-full",className:"w-full h-full object-contain"}),
        e.jsxs("span",{className:"sr-only",children:[s.name," - ",s.nodes.length," nodes"]}),
        n>0&&e.jsxs("span",{className:"absolute top-2 right-2 flex items-center gap-1 pl-1 pr-2 py-0.5 bg-slate-900/80 rounded text-amber-400 text-sm font-medium overflow-visible",children:[e.jsx("img",{src:"/icons/other/badge_icon.png",alt:"",className:"w-6 h-6 -ml-3 -my-1"}),n.toLocaleString()]}),
        a&&(x>0||p>0)&&e.jsxs("span",{className:"absolute inset-x-0 top-[40%] sm:top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 py-1 bg-slate-900/60 text-xs sm:text-base font-semibold [text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]",children:[e.jsxs("span",{className:"text-base sm:text-xl text-white",children:[p,"%"]}),e.jsxs("span",{className:"text-white",children:["Badges: ",x,"%"]})]}),
        a&&a.total>0&&e.jsx("div",{className:"absolute bottom-0 left-0 right-0 h-1.5 bg-slate-700",children:e.jsx("div",{className:"h-full bg-green-500 transition-all duration-300",style:{width:`${c}%`}})})
      ]}),
      s.unlockRequirements&&s.unlockRequirements.length>0&&e.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 py-1.5 text-[11px] leading-tight text-slate-400 border-t border-slate-700",children:[
        e.jsx("svg",{className:"w-4 h-4 shrink-0 text-slate-500",viewBox:"0 0 24 24",fill:"currentColor",children:e.jsx("path",{d:"M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Z"})}),
        e.jsx("div",{className:"text-center sm:text-left",children:s.unlockRequirements.map((i,j)=>e.jsx("div",{children:e.jsx("span",{className:"text-slate-300",children:i})},j))})
      ]})
    ]},s.id)
  };
  return e.jsxs("div",{className:"min-h-screen bg-slate-950 text-white",children:[
    e.jsx(P,{backTo:"/",title:"Research Trees",subtitle:"Your progress is saved automatically - it'll be here when you return.",className:"py-3",children:e.jsxs("div",{className:"relative bg-slate-800 rounded border border-slate-600 border-b-0 self-start",children:[
      e.jsxs("div",{className:"flex flex-col gap-1.5 px-2 py-2.5 text-sm",children:[
        e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"font-medium text-slate-300",children:"Spent:"}),e.jsx("img",{src:"/icons/other/badge_icon.png",alt:"",className:"w-5 h-5"}),e.jsx("span",{className:"text-cyan-400 font-semibold tabular-nums",children:f.toLocaleString()})]}),
        e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"font-medium text-slate-300",children:"Remaining:"}),e.jsx("img",{src:"/icons/other/badge_icon.png",alt:"",className:"w-5 h-5"}),e.jsx("span",{className:"text-amber-400 font-semibold tabular-nums",children:o.toLocaleString()})]}),
        b>0&&e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"font-medium text-slate-300",children:"Goals:"}),e.jsx("img",{src:"/icons/other/badge_icon.png",alt:"",className:"w-5 h-5"}),e.jsx("span",{className:"text-cyan-400 font-semibold tabular-nums",children:b.toLocaleString()})]})
      ]}),
      e.jsx("div",{className:"h-0.5 bg-slate-600",children:e.jsx("div",{className:"h-full bg-green-500 transition-all duration-300",style:{width:`${d>0?(d-o)/d*100:0}%`}})})
    ]})}),
    e.jsxs("main",{className:"p-4 max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto",children:[
      e.jsx(D,{trees:t,completions:h,summaries:r}),
      e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",children:t.map(j)}),
      t.length===0&&e.jsx("div",{className:"text-center py-12 text-slate-400",children:"No research trees available yet."}),
      m.length>0&&e.jsxs("section",{className:"mt-6",children:[
        e.jsx("h2",{className:"text-sm font-medium text-slate-400 mb-3",children:"Incomplete Data"}),
        e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",children:m.map(j)})
      ]})
    ]})
  ]})
});

export{A as default,Z as meta};
