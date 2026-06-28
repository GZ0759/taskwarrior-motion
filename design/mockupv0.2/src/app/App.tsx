import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import * as Popover from "@radix-ui/react-popover";
import {
  Check, Plus, Sun, Moon, Monitor,
  Sparkles, X, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Play, Square, Pencil, Trash2,
  LayoutGrid, CalendarDays, ListTodo, Keyboard, Settings,
  Tag as TagIcon, CircleCheckBig, Volume2, VolumeX, Medal
} from "lucide-react";

// ─── Global CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
@keyframes taskShake {
  0%,100%{transform:translateX(0) rotate(0deg);}
  16%{transform:translateX(-9px) rotate(-2.5deg);}
  33%{transform:translateX(8px) rotate(2deg);}
  50%{transform:translateX(-6px) rotate(-1.5deg);}
  66%{transform:translateX(5px) rotate(1deg);}
  83%{transform:translateX(-3px);}
}
@keyframes checkPop {
  0%{transform:scale(0) rotate(-20deg);opacity:0;}
  60%{transform:scale(1.4) rotate(5deg);opacity:1;}
  100%{transform:scale(1) rotate(0deg);opacity:1;}
}
.shaking{animation:taskShake 0.50s cubic-bezier(.36,.07,.19,.97) both;}
.check-pop{animation:checkPop 0.28s ease forwards;}
@keyframes gradFlow{0%{background-position:0% 50%;}100%{background-position:200% 50%;}}
.grad-flow{animation:gradFlow 12s linear infinite;background-size:200% 100%;}
::-webkit-scrollbar{display:none;}
*{scrollbar-width:none;}
`;

const MESH_DARK = ["radial-gradient(ellipse 70% 60% at 8% 18%,rgba(139,92,246,.72) 0%,transparent 55%)","radial-gradient(ellipse 60% 55% at 88% 12%,rgba(59,130,246,.62) 0%,transparent 52%)","radial-gradient(ellipse 55% 60% at 55% 88%,rgba(236,72,153,.52) 0%,transparent 50%)","radial-gradient(ellipse 48% 48% at 92% 78%,rgba(20,184,166,.48) 0%,transparent 46%)","radial-gradient(ellipse 42% 42% at 5% 90%,rgba(251,146,60,.44) 0%,transparent 42%)","#060010"].join(",");
const MESH_LIGHT = ["radial-gradient(ellipse 70% 60% at 8% 18%,rgba(186,148,255,.50) 0%,transparent 55%)","radial-gradient(ellipse 60% 55% at 88% 12%,rgba(120,185,255,.46) 0%,transparent 52%)","radial-gradient(ellipse 55% 60% at 55% 88%,rgba(255,160,210,.42) 0%,transparent 50%)","radial-gradient(ellipse 48% 48% at 92% 78%,rgba(100,230,210,.38) 0%,transparent 46%)","radial-gradient(ellipse 42% 42% at 5% 90%,rgba(255,210,120,.36) 0%,transparent 42%)","#EBE8FF"].join(",");

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "H"|"M"|"L";
type ThemeMode = "light"|"dark"|"system";
type RightTab = "tasks"|"kanban"|"calendar";
type LeftTab = "projects"|"tags";

interface Task {
  id:string; description:string; project:string; tags:string[];
  priority:Priority; dueDate:string|null; waitDate:string|null;
  status:"pending"|"started"|"on-hold"|"completed";
  completed:boolean; completedAt:string|null; createdAt:string;
  timerStart:number|null; timerTotal:number;
}
interface DoneInfo { description:string; todayCount:number; totalDone:number; }

// ─── Seed data ────────────────────────────────────────────────────────────────

const _t = new Date();
const fmt  = (d:Date)   => d.toISOString().split("T")[0];
const ago  = (n:number) => { const d=new Date(_t); d.setDate(d.getDate()-n); return fmt(d); };
const fwd  = (n:number) => { const d=new Date(_t); d.setDate(d.getDate()+n); return fmt(d); };
const mk   = (o:Partial<Task>):Task => ({id:"",description:"",project:"",tags:[],priority:"M",dueDate:null,waitDate:null,status:"pending",completed:false,completedAt:null,createdAt:ago(1),timerStart:null,timerTotal:0,...o});

const SEED:Task[] = [
  mk({id:"1",description:"完善 Q3 设计令牌审计",project:"Design System",tags:["design","tokens"],priority:"H",dueDate:fwd(1),createdAt:ago(3)}),
  mk({id:"2",description:"Review component library PR #247",project:"Design System",tags:["review"],priority:"M",dueDate:fwd(2),status:"started",timerStart:Date.now()-183000}),
  mk({id:"3",description:"Auth 接口迁移至 v2",project:"API Migration",tags:["backend","auth"],priority:"H",dueDate:fwd(0)}),
  mk({id:"4",description:"编写 /users 接口 OpenAPI 文档",project:"API Migration",tags:["docs"],priority:"M",dueDate:fwd(4)}),
  mk({id:"5",description:"更新官网首屏文案",project:"Marketing",tags:["copy"],priority:"M",dueDate:fwd(3)}),
  mk({id:"6",description:"A/B 测试 CTA 按钮配色",project:"Marketing",tags:["experiment","ux"],priority:"L",dueDate:fwd(7)}),
  mk({id:"7",description:"准备 OKR 汇报 PPT",project:"Q3 Planning",tags:["okr"],priority:"H",dueDate:fwd(0),status:"started",timerTotal:2400}),
  mk({id:"8",description:"制定 Q4 招聘目标",project:"Q3 Planning",tags:["hiring"],priority:"M",dueDate:fwd(5)}),
  mk({id:"9",description:"下线 /v1/orders 旧接口",project:"API Migration",priority:"L",dueDate:fwd(10),status:"on-hold",waitDate:fwd(3)}),
  mk({id:"10",description:"用户引导流程线框图",project:"Design System",tags:["ux","design"],priority:"M",dueDate:fwd(6)}),
  mk({id:"11",description:"配置监控告警规则",priority:"L",dueDate:fwd(8)}),
  mk({id:"h1",description:"上线暗色模式",project:"Design System",priority:"H",completed:true,status:"completed",completedAt:ago(0),createdAt:ago(2)}),
  mk({id:"h2",description:"移除 jQuery 依赖",project:"Marketing",priority:"M",completed:true,status:"completed",completedAt:ago(0),createdAt:ago(3)}),
  mk({id:"h3",description:"整理 Q2 复盘",project:"Q3 Planning",priority:"L",completed:true,status:"completed",completedAt:ago(1),createdAt:ago(3)}),
  mk({id:"h4",description:"API v2 预发环境搭建",project:"API Migration",priority:"H",completed:true,status:"completed",completedAt:ago(1),createdAt:ago(3)}),
  mk({id:"h5",description:"更新 sitemap",project:"Marketing",priority:"L",completed:true,status:"completed",completedAt:ago(2),createdAt:ago(3)}),
  mk({id:"h6",description:"定价页文案",project:"Marketing",priority:"M",completed:true,status:"completed",completedAt:ago(3),createdAt:ago(5)}),
  mk({id:"h7",description:"组件库文档",project:"Design System",priority:"M",completed:true,status:"completed",completedAt:ago(3),createdAt:ago(5)}),
  mk({id:"h8",description:"年度复盘报告",project:"Q3 Planning",priority:"H",completed:true,status:"completed",completedAt:ago(5),createdAt:ago(7)}),
  mk({id:"h9",description:"移动端性能优化",project:"API Migration",priority:"M",completed:true,status:"completed",completedAt:ago(7),createdAt:ago(9)}),
  mk({id:"h10",description:"CI/CD 流水线",project:"API Migration",priority:"H",completed:true,status:"completed",completedAt:ago(7),createdAt:ago(9)}),
  mk({id:"h11",description:"设计规范文档",project:"Design System",priority:"M",completed:true,status:"completed",completedAt:ago(9),createdAt:ago(11)}),
  mk({id:"h12",description:"用户访谈报告",project:"Q3 Planning",priority:"H",completed:true,status:"completed",completedAt:ago(12),createdAt:ago(14)}),
  mk({id:"h13",description:"数据库索引优化",project:"API Migration",priority:"M",completed:true,status:"completed",completedAt:ago(15),createdAt:ago(17)}),
  mk({id:"h14",description:"新版本公告",project:"Marketing",priority:"L",completed:true,status:"completed",completedAt:ago(18),createdAt:ago(20)}),
  mk({id:"h15",description:"历史 Sprint 归档",project:"Q3 Planning",priority:"L",completed:true,status:"completed",completedAt:ago(20),createdAt:ago(22)}),
  mk({id:"h16",description:"安全审计报告",project:"API Migration",priority:"H",completed:true,status:"completed",completedAt:ago(22),createdAt:ago(24)}),
  mk({id:"h17",description:"品牌视觉更新",project:"Design System",priority:"M",completed:true,status:"completed",completedAt:ago(25),createdAt:ago(27)}),
  mk({id:"h18",description:"客户成功案例",project:"Marketing",priority:"M",completed:true,status:"completed",completedAt:ago(27),createdAt:ago(29)}),
  mk({id:"h19",description:"权限系统重构",project:"API Migration",priority:"H",completed:true,status:"completed",completedAt:ago(29),createdAt:ago(31)}),
  mk({id:"h20",description:"监控报警配置",project:"API Migration",priority:"M",completed:true,status:"completed",completedAt:ago(32),createdAt:ago(34)}),
];

const INIT_PROJECTS = ["Design System","API Migration","Marketing","Q3 Planning"];
const INIT_TAGS = ["design","tokens","review","backend","auth","docs","copy","ux","okr","hiring","planning","security","seo","content","experiment","storybook","devops"];

// ─── Card styles ──────────────────────────────────────────────────────────────

const CARD_STYLES:Record<string,{gradient:string;glow:string;accent:string}> = {
  "Design System":{gradient:"linear-gradient(135deg,rgba(120,80,200,0.60) 0%,rgba(85,55,170,0.66) 100%)",glow:"rgba(120,80,200,0.20)",accent:"#C4B5FD"},
  "API Migration":{gradient:"linear-gradient(135deg,rgba(38,140,200,0.58) 0%,rgba(18,115,185,0.64) 100%)",glow:"rgba(38,140,200,0.18)",accent:"#7DD3FC"},
  "Marketing":{gradient:"linear-gradient(135deg,rgba(205,75,145,0.58) 0%,rgba(180,50,105,0.64) 100%)",glow:"rgba(205,75,145,0.18)",accent:"#F9A8D4"},
  "Q3 Planning":{gradient:"linear-gradient(135deg,rgba(200,135,35,0.60) 0%,rgba(195,85,45,0.66) 100%)",glow:"rgba(200,135,35,0.20)",accent:"#FCD34D"},
};
const FALLBACK=[
  {gradient:"linear-gradient(135deg,rgba(95,90,200,0.58) 0%,rgba(70,65,175,0.64) 100%)",glow:"rgba(95,90,200,0.18)",accent:"#A5B4FC"},
  {gradient:"linear-gradient(135deg,rgba(28,170,120,0.58) 0%,rgba(15,145,100,0.64) 100%)",glow:"rgba(28,170,120,0.18)",accent:"#6EE7B7"},
  {gradient:"linear-gradient(135deg,rgba(220,90,40,0.58) 0%,rgba(195,65,30,0.64) 100%)",glow:"rgba(220,90,40,0.18)",accent:"#FCA5A5"},
];
function getCardStyle(t:Task,i:number){return CARD_STYLES[t.project]??FALLBACK[i%FALLBACK.length];}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const newId = () => Math.random().toString(36).slice(2,10);
function formatDue(d:string|null):string|null{
  if(!d)return null;
  const date=new Date(d+"T00:00:00"),now=new Date();now.setHours(0,0,0,0);
  const diff=Math.round((date.getTime()-now.getTime())/86400000);
  if(diff===0)return"今天";if(diff===1)return"明天";
  if(diff<0)return`逾期${Math.abs(diff)}天`;if(diff<=7)return`${diff}天后`;
  return date.toLocaleDateString("zh-CN",{month:"numeric",day:"numeric"});
}
function isOverdue(d:string|null){
  if(!d)return false;
  return new Date(d+"T00:00:00")<new Date(new Date().setHours(0,0,0,0));
}
function formatTimer(s:number){
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;
  if(h>0)return`${h}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  return`${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
}
function playSound(type:"complete"|"add",on:boolean){
  if(!on)return;
  try{
    const ctx=new AudioContext(),g=ctx.createGain(),o=ctx.createOscillator();
    o.connect(g);g.connect(ctx.destination);
    if(type==="complete"){o.frequency.setValueAtTime(523,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(1047,ctx.currentTime+0.18);g.gain.setValueAtTime(0.13,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.32);o.start();o.stop(ctx.currentTime+0.32);}
    else{o.frequency.setValueAtTime(660,ctx.currentTime);g.gain.setValueAtTime(0.09,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.10);o.start();o.stop(ctx.currentTime+0.10);}
  }catch(_){}
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function Heatmap({tasks,isDark,onDayClick}:{tasks:Task[];isDark:boolean;onDayClick:(date:string)=>void}){
  const cm:Record<string,number>={};
  tasks.forEach(t=>{if(t.completed&&t.completedAt)cm[t.completedAt]=(cm[t.completedAt]??0)+1;});
  const todayStr=fmt(_t);
  const cells=Array.from({length:35},(_,i)=>{const d=new Date(_t);d.setDate(d.getDate()-(34-i));const ds=fmt(d);return{date:ds,dayNum:d.getDate(),count:cm[ds]??0,isToday:ds===todayStr};});
  const fdow=new Date(cells[0].date+"T00:00:00").getDay();
  const todayCount=cm[todayStr]??0,total=tasks.filter(t=>t.completed).length;
  function bg(n:number){return isDark?n===0?"rgba(255,255,255,0.09)":n===1?"rgba(74,222,128,0.55)":n===2?"rgba(34,197,94,0.75)":n===3?"rgba(22,163,74,0.88)":"rgba(21,128,61,0.96)":n===0?"rgba(0,0,0,0.07)":n===1?"rgba(34,197,94,0.55)":n===2?"rgba(22,163,74,0.72)":n===3?"rgba(21,128,61,0.85)":"rgba(20,83,45,0.92)";}
  function tc(n:number){return n>0?"rgba(255,255,255,0.95)":isDark?"rgba(255,255,255,0.40)":"rgba(0,0,0,0.38)";}
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)",tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)",ts=isDark?"rgba(255,255,255,0.30)":"rgba(15,10,40,0.30)",tw=isDark?"rgba(255,255,255,0.36)":"rgba(15,10,40,0.38)",tr=isDark?"rgba(255,255,255,0.75)":"rgba(99,102,241,0.85)";
  const msg=todayCount===0?"今天还没开始，加油！":todayCount<=2?`完成 ${todayCount} 项，继续！`:todayCount<=5?`完成 ${todayCount} 项，状态很棒！`:`完成 ${todayCount} 项，今日之星！`;
  return(
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div><div className="flex items-end gap-2"><span className="text-5xl font-black tabular-nums" style={{lineHeight:1,color:tp}}>{todayCount}</span><span className="text-sm font-medium mb-1.5" style={{color:tm}}>今日完成</span></div><p className="text-xs mt-1" style={{color:ts}}>{msg}</p></div>
        <div className="text-right"><div className="text-2xl font-black tabular-nums" style={{lineHeight:1,color:tp}}>{total}</div><div className="text-[11px] mt-0.5" style={{color:tm}}>累计完成</div></div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["日","一","二","三","四","五","六"].map(d=><div key={d} className="text-center text-[10px] font-bold" style={{color:tw}}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({length:fdow}).map((_,i)=><div key={`p${i}`} className="aspect-square"/>)}
        {cells.map(c=>(
          <motion.div key={c.date} whileHover={{scale:1.12}}
            onClick={()=>onDayClick(c.date)}
            className="aspect-square rounded-xl flex items-center justify-center relative select-none cursor-pointer"
            style={{backgroundColor:bg(c.count)}}
            title={c.count>0?`${c.date}：完成 ${c.count} 项`:`${c.date}：无完成任务`}>
            <span className="text-[13px] font-bold tabular-nums" style={{color:tc(c.count)}}>{c.dayNum}</span>
            {c.isToday&&<div className="absolute inset-0 rounded-xl pointer-events-none" style={{outline:`2.5px solid ${tr}`,outlineOffset:"2px"}}/>}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[9px]" style={{color:ts}}>少</span>
        {[0,1,2,3,4].map(v=><div key={v} className="w-3.5 h-3.5 rounded-[4px]" style={{backgroundColor:bg(v)}}/>)}
        <span className="text-[9px]" style={{color:ts}}>多</span>
      </div>
    </div>
  );
}

// ─── Empty state icon (quiet day) ────────────────────────────────────────────

function EmptyDayIcon({isDark}:{isDark:boolean}){
  const c=isDark?"rgba(255,255,255,0.22)":"rgba(15,10,40,0.16)";
  return(
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
      {/* Outer dashed ring */}
      <circle cx="34" cy="34" r="32" stroke={c} strokeWidth="1.5" strokeDasharray="5 3.5"/>
      {/* Crescent moon */}
      <path d="M34 18C26.3 18 20 24.3 20 32C20 39.7 26.3 46 34 46C37.5 46 40.7 44.7 43.1 42.5C41.4 43 39.5 43.3 37.5 43.3C29.8 43.3 23.6 37.1 23.6 29.4C23.6 25.8 24.9 22.5 27.1 20C26.1 18 34 18 34 18Z" fill={c}/>
      {/* Stars */}
      <circle cx="46" cy="20" r="2" fill={c}/>
      <circle cx="50" cy="28" r="1.3" fill={c}/>
      <circle cx="44" cy="13" r="1.3" fill={c}/>
      <circle cx="52" cy="22" r="0.8" fill={c}/>
      <circle cx="42" cy="24" r="0.8" fill={c}/>
    </svg>
  );
}

// ─── Glass overlay backdrop ───────────────────────────────────────────────────

function GlassOverlay({onClose}:{onClose:()=>void}){
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.18}}
      className="absolute inset-0" onClick={onClose}
      style={{background:"rgba(0,0,0,0.03)",backdropFilter:"blur(4px) saturate(120%)"}}/>
  );
}

// ─── Achievement Badge ────────────────────────────────────────────────────────

function AchievementBadge(){
  return(
    <div className="w-24 h-24 mx-auto relative">
      <motion.div initial={{scale:0,rotate:-30}} animate={{scale:1,rotate:0}} transition={{delay:0.12,type:"spring",stiffness:255,damping:17}}
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{background:"linear-gradient(135deg,#4ADE80,#22C55E)",boxShadow:"0 8px 32px rgba(34,197,94,0.35)"}}>
        <Check size={36} strokeWidth={3.5} className="text-white"/>
      </motion.div>
      <motion.div animate={{scale:[1,1.12,1],opacity:[0.5,0.8,0.5]}} transition={{duration:2,repeat:Infinity,ease:"easeInOut"}}
        className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow:"0 0 0 3px rgba(74,222,128,0.5)"}}/>
    </div>
  );
}

// ─── CompletionModal ──────────────────────────────────────────────────────────

function CompletionModal({info,onClose}:{info:DoneInfo;onClose:()=>void}){
  const isDark=document.documentElement.classList.contains("dark");
  const PC=["#FFD700","#FF9F1C","#FF6B35","#FFBF69","#FFF59D","#FF8A65","#FFCC02","#F9A825"];
  const particles=Array.from({length:24},(_,i)=>{const a=(i/24)*Math.PI*2+(Math.random()-0.5)*0.4,d=55+Math.random()*85;return{id:i,x:Math.cos(a)*d,y:Math.sin(a)*d,color:PC[i%PC.length],size:4+Math.random()*8};});
  const stars=Array.from({length:14},(_,i)=>({id:i,x:(Math.random()-0.5)*300,y:(Math.random()-0.5)*380,size:9+Math.random()*14,delay:Math.random()*0.8}));

  const cardBg=isDark?{
    background:"rgba(12,6,26,0.72)",
    backdropFilter:"blur(60px) saturate(240%)",
    WebkitBackdropFilter:"blur(60px) saturate(240%)",
    boxShadow:"0 1.5px 0 rgba(255,255,255,0.12) inset,0 40px 80px rgba(0,0,0,0.70),0 0 80px rgba(99,102,241,0.18)",
  }:{
    background:"rgba(250,248,255,0.80)",
    backdropFilter:"blur(60px) saturate(200%)",
    WebkitBackdropFilter:"blur(60px) saturate(200%)",
    boxShadow:"0 1.5px 0 rgba(255,255,255,0.88) inset,0 32px 80px rgba(80,60,180,0.16),0 0 60px rgba(99,102,241,0.10)",
  };

  const borderGrad="linear-gradient(135deg,#4ADE80,#22C55E,#06B6D4,#6366F1,#8B5CF6,#4ADE80)";

  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <GlassOverlay onClose={onClose}/>
      <motion.div initial={{scale:0.48,opacity:0,y:60}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.82,opacity:0,y:20}} transition={{type:"spring",stiffness:265,damping:22}}
        className="relative z-10 w-80 rounded-3xl grad-flow p-[1px]"
        style={{background:borderGrad,backgroundSize:"200% 100%"}}>
        <div className="rounded-3xl overflow-hidden relative" style={cardBg}>
          <button onClick={onClose} className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer" style={{background:"rgba(0,0,0,0.18)"}}><X size={13} className="text-white/80"/></button>
          <div className="absolute left-1/2 top-[34%] pointer-events-none z-0">{particles.map(p=><motion.div key={p.id} initial={{x:0,y:0,opacity:1,scale:0}} animate={{x:p.x,y:p.y,opacity:0,scale:1}} transition={{duration:0.85,delay:0.18,ease:"easeOut"}} className="absolute rounded-full -translate-x-1/2 -translate-y-1/2" style={{width:p.size,height:p.size,backgroundColor:p.color}}/>)}</div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">{stars.map(s=><motion.span key={s.id} initial={{opacity:0,scale:0}} animate={{opacity:[0,0.95,0.55,0],scale:[0,1.2,0.9,0]}} transition={{duration:1.5,delay:0.22+s.delay,repeat:Infinity,repeatDelay:2.0}} className="absolute select-none" style={{left:`calc(50% + ${s.x}px)`,top:`calc(50% + ${s.y}px)`,fontSize:s.size,color:"rgba(255,255,200,0.88)"}}>✦</motion.span>)}</div>
          <div className="relative z-10 px-6 pt-8 pb-6 text-center">
            <AchievementBadge/>
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.32}}>
              <h2 className="text-[26px] font-black my-6" style={{color:isDark?"rgba(255,255,255,0.92)":"rgba(15,10,40,0.88)",textShadow:isDark?"0 2px 10px rgba(0,0,0,0.18)":"none"}}>我完成任务啦！</h2>
              <div className="rounded-2xl px-4 py-3 mb-5 flex items-center gap-3 text-left" style={{background:isDark?"rgba(74,222,128,0.12)":"rgba(34,197,94,0.08)",border:"1px solid rgba(74,222,128,0.25)"}}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{background:"linear-gradient(135deg,#4ADE80,#22C55E)"}}><Check size={13} strokeWidth={3} className="text-white"/></div>
                <p className="text-[13px] font-semibold leading-snug" style={{color:isDark?"rgba(255,255,255,0.85)":"rgba(15,10,40,0.82)"}}>{info.description}</p>
              </div>
              <button onClick={onClose} className="w-full py-4 rounded-2xl text-sm font-black transition-opacity hover:opacity-90 cursor-pointer" style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)",color:"#fff",boxShadow:"0 4px 22px rgba(124,58,237,0.45)"}}>
                我太棒了
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── iOS Glass Modal Shell ────────────────────────────────────────────────────

function ModalShell({title,subtitle,onClose,children,isDark,maxW="max-w-md"}:{
  title:string;subtitle?:string;onClose:()=>void;children:React.ReactNode;isDark:boolean;maxW?:string;
}){
  // True liquid glass: translucent, heavy blur, saturated backdrop, top-edge highlight
  const cardStyle = isDark ? {
    background:"rgba(12,6,26,0.62)",
    backdropFilter:"blur(52px) saturate(220%)",
    WebkitBackdropFilter:"blur(52px) saturate(220%)",
    border:"1px solid rgba(255,255,255,0.13)",
    boxShadow:"0 1.5px 0 rgba(255,255,255,0.12) inset, 0 50px 100px rgba(0,0,0,0.65), 0 16px 32px rgba(0,0,0,0.35)",
  } : {
    background:"rgba(252,250,255,0.74)",
    backdropFilter:"blur(52px) saturate(180%)",
    WebkitBackdropFilter:"blur(52px) saturate(180%)",
    border:"1px solid rgba(255,255,255,0.92)",
    boxShadow:"0 1.5px 0 rgba(255,255,255,0.88) inset, 0 32px 80px rgba(80,60,180,0.12), 0 8px 24px rgba(80,60,180,0.06)",
  };
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  const divider=isDark?"rgba(255,255,255,0.08)":"rgba(15,10,40,0.07)";
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <GlassOverlay onClose={onClose}/>
      <motion.div initial={{scale:0.90,opacity:0,y:24}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.92,opacity:0,y:12}} transition={{type:"spring",stiffness:340,damping:28}}
        className={`relative z-10 w-full ${maxW} rounded-3xl flex flex-col`}
        style={{...cardStyle, maxHeight:"80vh"}}>
        <div className="flex items-start justify-between px-6 py-5 shrink-0" style={{borderBottom:`1px solid ${divider}`}}>
          <div><h2 className="text-base font-black" style={{color:tp}}>{title}</h2>{subtitle&&<p className="text-xs mt-0.5" style={{color:tm}}>{subtitle}</p>}</div>
          <button onClick={onClose} className="p-1.5 rounded-xl transition-colors mt-0.5" style={{color:tm}} onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><X size={14}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Custom Date Picker ───────────────────────────────────────────────────────

function DatePickerInput({value,onChange,placeholder="选择日期",isDark}:{value:string;onChange:(v:string)=>void;placeholder?:string;isDark:boolean;}){
  const[open,setOpen]=useState(false);
  const[vy,setVy]=useState(()=>value?new Date(value+"T00:00:00").getFullYear():new Date().getFullYear());
  const[vm,setVm]=useState(()=>value?new Date(value+"T00:00:00").getMonth():new Date().getMonth());
  const todayStr=fmt(new Date());
  const firstDay=new Date(vy,vm,1).getDay();
  const dim=new Date(vy,vm+1,0).getDate();
  const cells:Array<{day:number|null;date:string}>=[];
  for(let i=0;i<firstDay;i++)cells.push({day:null,date:""});
  for(let d=1;d<=dim;d++){const ds=`${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;cells.push({day:d,date:ds});}
  const displayVal=value?new Date(value+"T00:00:00").toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric"}):"";
  function prevM(){if(vm===0){setVy(y=>y-1);setVm(11);}else setVm(m=>m-1);}
  function nextM(){if(vm===11){setVy(y=>y+1);setVm(0);}else setVm(m=>m+1);}

  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.40)":"rgba(15,10,40,0.42)";
  const ts=isDark?"rgba(255,255,255,0.24)":"rgba(15,10,40,0.22)";
  const fieldBg=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.04)";
  const panelBg=isDark?"rgba(12,6,26,0.62)":"rgba(252,250,255,0.74)";

  return(
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all"
          style={{background:fieldBg,color:value?tp:tm,border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"}`}}>
          <span className="flex items-center gap-2"><CalendarDays size={12} style={{color:tm,flexShrink:0}}/>{displayVal||placeholder}</span>
          <div className="flex items-center gap-1">
            {value&&<span onClick={e=>{e.stopPropagation();onChange("");}} style={{color:tm}} className="hover:opacity-70 transition-opacity"><X size={11}/></span>}
            <ChevronDown size={11} style={{color:tm,transform:open?"rotate(180deg)":"",transition:"transform 0.15s"}}/>
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={4} align="start" side="bottom"
          style={{zIndex:9999,outline:"none",width:"var(--radix-popover-trigger-width)"}}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out">
          <motion.div initial={{opacity:0,scale:0.96,y:-6}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96,y:-6}} transition={{duration:0.14,ease:[0.16,1,0.3,1]}}
            style={{background:panelBg,backdropFilter:"blur(32px) saturate(200%)",WebkitBackdropFilter:"blur(32px) saturate(200%)",border:`1px solid ${isDark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.07)"}`,boxShadow:`0 24px 60px ${isDark?"rgba(0,0,0,0.65)":"rgba(80,60,180,0.14)"}`,borderRadius:16,padding:12}}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevM} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors" style={{color:tm}}><ChevronLeft size={13}/></button>
              <span className="text-xs font-bold" style={{color:tp}}>{new Date(vy,vm).toLocaleDateString("zh-CN",{year:"numeric",month:"long"})}</span>
              <button onClick={nextM} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors" style={{color:tm}}><ChevronRight size={13}/></button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {["日","一","二","三","四","五","六"].map(d=><div key={d} className="text-center text-[9px] font-bold py-1" style={{color:ts}}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {cells.map((c,i)=>{
                const sel=c.date===value,today=c.date===todayStr,past=c.date<todayStr&&c.date!=="";
                return(
                  <button key={i} onClick={()=>c.day&&(onChange(c.date),setOpen(false))} disabled={!c.day}
                    className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
                    style={{background:sel?"#6366F1":today?isDark?"rgba(99,102,241,0.22)":"rgba(99,102,241,0.12)":"transparent",color:sel?"#fff":today?"#818CF8":!c.day?"transparent":past?ts:tp,cursor:c.day?"pointer":"default",fontWeight:sel||today?700:500}}>
                    {c.day}
                  </button>
                );
              })}
            </div>
            {value!==todayStr&&<button onClick={()=>{onChange(todayStr);setOpen(false);}} className="w-full mt-2 py-1.5 rounded-xl text-[11px] font-semibold transition-colors" style={{background:isDark?"rgba(99,102,241,0.15)":"rgba(99,102,241,0.08)",color:"#818CF8"}}>选择今天</button>}
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ─── Simple Project Select ────────────────────────────────────────────────────

function SimpleProjectSelect({value,options,onChange,isDark}:{value:string;options:string[];onChange:(v:string)=>void;isDark:boolean;}){
  const[open,setOpen]=useState(false);
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.40)":"rgba(15,10,40,0.42)";
  const fieldBg=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.04)";
  const dropBg=isDark?"rgba(12,6,26,0.62)":"rgba(252,250,255,0.74)";

  return(
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all"
          style={{background:fieldBg,color:value?tp:tm,border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"}`}}>
          <span>{value||"无项目"}</span>
          <ChevronDown size={11} style={{color:tm,transform:open?"rotate(180deg)":"",transition:"transform 0.15s"}}/>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={4} align="start" side="bottom"
          style={{zIndex:9999,outline:"none",width:"var(--radix-popover-trigger-width)"}}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out">
          <motion.div initial={{opacity:0,scale:0.96,y:-6}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96,y:-6}} transition={{duration:0.14,ease:[0.16,1,0.3,1]}}
            style={{backdropFilter:"blur(32px) saturate(200%)",WebkitBackdropFilter:"blur(32px) saturate(200%)",background:dropBg,border:`1px solid ${isDark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.08)"}`,boxShadow:`0 20px 50px ${isDark?"rgba(0,0,0,0.60)":"rgba(80,60,180,0.18)"}`,borderRadius:16,overflow:"hidden"}}>
            {["无项目",...options].map((opt,i)=>{
              const v=i===0?"":opt,sel=value===v;
              return(
                <button key={opt} onClick={()=>{onChange(v);setOpen(false);}}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between"
                  style={{color:sel?(isDark?"#A5B4FC":"#6366F1"):tp,background:sel?(isDark?"rgba(99,102,241,0.14)":"rgba(99,102,241,0.07)"):undefined}}
                  onMouseEnter={e=>{if(!sel)e.currentTarget.style.background=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.03)";}}
                  onMouseLeave={e=>{if(!sel)e.currentTarget.style.background=sel?(isDark?"rgba(99,102,241,0.14)":"rgba(99,102,241,0.07)"):"transparent";}}>
                  {opt}{sel&&<Check size={10} strokeWidth={3} style={{color:isDark?"#A5B4FC":"#6366F1"}}/>}
                </button>
              );
            })}
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ─── Simple Tag Select ────────────────────────────────────────────────────────

function SimpleTagSelect({selected,options,onChange,isDark}:{selected:string[];options:string[];onChange:(v:string[])=>void;isDark:boolean;}){
  function toggle(tag:string){onChange(selected.includes(tag)?selected.filter(t=>t!==tag):[...selected,tag]);}
  return(
    <div className="flex flex-wrap gap-1.5">
      {options.map(tag=>{
        const sel=selected.includes(tag);
        return(
          <button key={tag} onClick={()=>toggle(tag)} className="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all"
            style={{background:sel?(isDark?"#5B52C8":"#6366F1"):isDark?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.05)",color:sel?"#ffffff":isDark?"rgba(255,255,255,0.55)":"rgba(15,10,40,0.48)",border:`1px solid ${sel?(isDark?"rgba(165,148,255,0.35)":"rgba(99,102,241,0.25)"):isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)"}`}}>
            {sel&&<Check size={7} className="inline mr-0.5" strokeWidth={3}/>}{tag}
          </button>
        );
      })}
    </div>
  );
}

// ─── ProjectPicker (for manage modals — keeps add/delete) ─────────────────────

function ProjectPicker({value,options,onChange,onAdd,onDelete}:{value:string;options:string[];onChange:(v:string)=>void;onAdd:(v:string)=>void;onDelete:(v:string)=>void;}){
  const[nv,setNv]=useState("");
  function submit(){const v=nv.trim();if(v&&!options.includes(v))onAdd(v);setNv("");}
  return(
    <div className="rounded-xl overflow-hidden" style={{background:"rgba(0,0,0,0.22)"}}>
      <div className="p-1.5 space-y-0.5 max-h-36 overflow-y-auto">
        <button onClick={()=>onChange("")} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!value?"bg-white text-gray-800":"text-white/55 hover:bg-white/10 hover:text-white/80"}`}>无项目</button>
        {options.map(o=>(
          <div key={o} className="flex items-center gap-1">
            <button onClick={()=>onChange(o)} className={`flex-1 text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${value===o?"bg-white text-gray-800":"text-white/70 hover:bg-white/10 hover:text-white/90"}`}>
              {value===o&&<Check size={9} strokeWidth={3}/>}{o}
            </button>
            <button onClick={()=>onDelete(o)} className="p-1.5 rounded-lg text-white/25 hover:text-red-400 transition-colors"><X size={10}/></button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 px-2 pb-2 pt-1 border-t border-white/10">
        <input value={nv} onChange={e=>setNv(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="添加项目…" className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none py-1 px-1"/>
        <button onClick={submit} className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"><Plus size={12}/></button>
      </div>
    </div>
  );
}

// ─── TagPicker (for manage modals — keeps add/delete) ─────────────────────────

function TagPicker({selected,options,onChange,onAdd,onDelete}:{selected:string[];options:string[];onChange:(v:string[])=>void;onAdd:(v:string)=>void;onDelete:(v:string)=>void;}){
  const[nv,setNv]=useState("");
  function toggle(tag:string){onChange(selected.includes(tag)?selected.filter(t=>t!==tag):[...selected,tag]);}
  function submit(){const v=nv.trim();if(v&&!options.includes(v)){onAdd(v);onChange([...selected,v]);}setNv("");}
  return(
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
        {options.map(tag=>{const sel=selected.includes(tag);return(
          <div key={tag} className="flex items-center">
            <button onClick={()=>toggle(tag)} className={`text-[10px] px-2.5 py-1 rounded-l-full font-semibold transition-all ${sel?"bg-white text-gray-800":"bg-white/12 text-white/65 hover:bg-white/20 hover:text-white/90"}`}>{sel&&<Check size={8} className="inline mr-0.5" strokeWidth={3}/>}{tag}</button>
            <button onClick={()=>{onDelete(tag);onChange(selected.filter(t=>t!==tag));}} className={`text-[10px] px-1.5 py-1 rounded-r-full transition-all ${sel?"bg-white/80 text-gray-600 hover:bg-white":"bg-white/8 text-white/30 hover:bg-white/18 hover:text-red-400"}`}><X size={8}/></button>
          </div>
        );})}
      </div>
      <div className="flex items-center gap-1 rounded-xl overflow-hidden" style={{background:"rgba(255,255,255,0.10)"}}>
        <input value={nv} onChange={e=>setNv(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="输入新标签，回车添加…" className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none py-1.5 px-3"/>
        <button onClick={submit} className="px-2.5 text-white/40 hover:text-white transition-colors"><Plus size={12}/></button>
      </div>
    </div>
  );
}

// ─── TaskEditModal ────────────────────────────────────────────────────────────

function TaskEditModal({task,isDark,allProjects,allTags,onClose,onSave,onDelete}:{
  task:Task;isDark:boolean;allProjects:string[];allTags:string[];
  onClose:()=>void;onSave:(d:Partial<Task>)=>void;onDelete:()=>void;
}){
  const[description,setDescription]=useState(task.description);
  const[priority,setPriority]=useState<Priority>(task.priority);
  const[dueDate,setDueDate]=useState(task.dueDate??"");
  const[waitDate,setWaitDate]=useState(task.waitDate??"");
  const[project,setProject]=useState(task.project);
  const[tags,setTags]=useState<string[]>(task.tags);
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.40)":"rgba(15,10,40,0.42)";
  const fieldBg=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.04)";
  return(
    <ModalShell title="编辑任务" onClose={onClose} isDark={isDark}>
      {/* Description editable */}
      <input value={description} onChange={e=>setDescription(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400/30"
        style={{background:fieldBg,color:tp,border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"}`}}/>

      {/* Priority */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest mb-2 block" style={{color:tm}}>优先级</label>
        <div className="flex gap-2">
          {(["H","M","L"] as Priority[]).map(p=>(
            <button key={p} onClick={()=>setPriority(p)}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all ${priority===p?p==="H"?"bg-red-500 text-white":p==="M"?"bg-amber-400 text-white":"bg-indigo-500 text-white":isDark?"bg-white/[0.07] text-white/55 hover:bg-white/[0.12]":"bg-black/[0.04] text-gray-500 hover:bg-black/[0.07]"}`}>
              {p==="H"?"紧急":p==="M"?"普通":"低优"}
            </button>
          ))}
        </div>
      </div>

      {/* Due date */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest mb-2 block" style={{color:tm}}>截止日期</label>
        <DatePickerInput value={dueDate} onChange={setDueDate} placeholder="选择截止日期" isDark={isDark}/>
      </div>

      {/* Wait date */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest mb-2 block" style={{color:tm}}>暂停到</label>
        <DatePickerInput value={waitDate} onChange={setWaitDate} placeholder="设置后任务进入暂停列" isDark={isDark}/>
        <p className="text-[9px] mt-1.5 ml-0.5" style={{color:isDark?"rgba(255,255,255,0.28)":"rgba(15,10,40,0.28)"}}>设置日期后，任务将进入「暂停」看板列</p>
      </div>

      {/* Project */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest mb-2 block" style={{color:tm}}>项目</label>
        <SimpleProjectSelect value={project} options={allProjects} onChange={setProject} isDark={isDark}/>
      </div>

      {/* Tags */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest mb-2 block" style={{color:tm}}>标签</label>
        <SimpleTagSelect selected={tags} options={allTags} onChange={setTags} isDark={isDark}/>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2" style={{borderTop:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"}`}}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors" style={{color:tm,background:fieldBg}} onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.06)"} onMouseLeave={e=>e.currentTarget.style.background=fieldBg}>取消</button>
        <button onClick={()=>{onSave({description:description.trim()||task.description,priority,dueDate:dueDate||null,waitDate:waitDate||null,project,tags,status:waitDate?"on-hold":task.status==="on-hold"&&!waitDate?"pending":task.status});onClose();}} className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-black hover:bg-indigo-600 transition-colors">保存</button>
        <button onClick={()=>{onDelete();onClose();}} className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-red-400 hover:bg-red-500/[0.12]">删除</button>
      </div>
    </ModalShell>
  );
}

// ─── DayCompletedModal ────────────────────────────────────────────────────────

function DayCompletedModal({date,tasks,isDark,onClose}:{date:string;tasks:Task[];isDark:boolean;onClose:()=>void;}){
  const dayTasks=tasks.filter(t=>t.completedAt===date);
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  const ts=isDark?"rgba(255,255,255,0.30)":"rgba(15,10,40,0.30)";
  const d=new Date(date+"T00:00:00");
  const title=d.toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric"});
  return(
    <ModalShell title={title} subtitle={dayTasks.length>0?`完成 ${dayTasks.length} 个任务`:"这天没有完成任务"} onClose={onClose} isDark={isDark}>
      {dayTasks.length===0?(
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <EmptyDayIcon isDark={isDark}/>
          <p className="text-sm font-semibold mt-5 mb-1.5" style={{color:tp}}>这一天安静地过去了</p>
          <p className="text-xs" style={{color:tm}}>没有完成的任务记录</p>
        </div>
      ):(
        <div className="space-y-2">
          {dayTasks.map(t=>(
            <div key={t.id} className="flex items-start gap-3 rounded-2xl px-4 py-3" style={{background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)",border:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"}`}}>
              <CircleCheckBig size={15} style={{color:"#4ADE80",marginTop:1,flexShrink:0}}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{color:tp}}>{t.description}</p>
                <p className="text-[10px] mt-0.5" style={{color:ts}}>{t.project||"无项目"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}

// ─── ProjectManageModal ───────────────────────────────────────────────────────

function ProjectManageModal({project,tasks,isDark,allProjects,onClose,onRename,onDelete,onAddProject}:{
  project:string;tasks:Task[];isDark:boolean;allProjects:string[];
  onClose:()=>void;onRename:(o:string,n:string)=>void;onDelete:(p:string)=>void;onAddProject:(v:string)=>void;
}){
  const[renaming,setRenaming]=useState(false);
  const[newName,setNewName]=useState(project);
  const[newProj,setNewProj]=useState("");
  const[confirmDel,setConfirmDel]=useState(false);
  const pTasks=tasks.filter(t=>t.project===project);
  const pending=pTasks.filter(t=>!t.completed),done=pTasks.filter(t=>t.completed);
  const pct=pTasks.length>0?Math.round((done.length/pTasks.length)*100):0;
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  const cs=CARD_STYLES[project]??FALLBACK[0];
  const fieldBg=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.04)";
  return(
    <ModalShell title={project} subtitle={`${done.length}/${pTasks.length} 完成 · ${pct}%`} onClose={onClose} isDark={isDark} maxW="max-w-lg">
      <div className="rounded-xl overflow-hidden h-2" style={{background:isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)"}}>
        <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8}} className="h-full rounded-xl" style={{background:cs.gradient}}/>
      </div>
      {!confirmDel&&!renaming&&(
        <div className="flex gap-2">
          <button onClick={()=>setRenaming(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors" style={{background:fieldBg,color:tm}}><Pencil size={11}/>重命名</button>
          <button onClick={()=>setConfirmDel(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/15 transition-colors"><Trash2 size={11}/>删除项目</button>
        </div>
      )}
      {renaming&&(
        <div className="flex gap-2">
          <input value={newName} onChange={e=>setNewName(e.target.value)} className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={{background:fieldBg,color:tp,border:`1px solid ${isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.06)"}`}}/>
          <button onClick={()=>{if(newName.trim()&&newName!==project)onRename(project,newName.trim());setRenaming(false);}} className="px-3 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold">确认</button>
          <button onClick={()=>setRenaming(false)} className="px-3 py-2 rounded-xl text-xs" style={{background:fieldBg,color:tm}}>取消</button>
        </div>
      )}
      {confirmDel&&(
        <div className="rounded-2xl p-4" style={{background:isDark?"rgba(239,68,68,0.12)":"rgba(254,242,242,1)",border:"1px solid rgba(239,68,68,0.25)"}}>
          <p className="text-sm font-medium text-red-400 mb-3">确认删除「{project}」？该项目下所有任务将失去项目关联。</p>
          <div className="flex gap-2">
            <button onClick={()=>{onDelete(project);onClose();}} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold">确认删除</button>
            <button onClick={()=>setConfirmDel(false)} className="flex-1 py-2 rounded-xl text-xs" style={{background:fieldBg,color:tm}}>取消</button>
          </div>
        </div>
      )}
      {pending.length>0&&<div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color:tm}}>待办 ({pending.length})</p>
        <div className="space-y-1">{pending.map(t=><div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)"}}><div className="w-3 h-3 rounded-full border-2 shrink-0" style={{borderColor:isDark?"rgba(255,255,255,0.25)":"rgba(0,0,0,0.20)"}}/><span className="text-xs" style={{color:tp}}>{t.description}</span></div>)}</div>
      </div>}
      {done.length>0&&<div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color:tm}}>已完成 ({done.length})</p>
        <div className="space-y-1">{done.slice(0,8).map(t=><div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)"}}><CircleCheckBig size={12} style={{color:"#4ADE80",flexShrink:0}}/><span className="text-xs line-through" style={{color:tm}}>{t.description}</span></div>)}</div>
      </div>}
      <div className="flex gap-2 pt-1">
        <input value={newProj} onChange={e=>setNewProj(e.target.value)} onKeyDown={e=>e.key==="Enter"&&newProj.trim()&&(onAddProject(newProj.trim()),setNewProj(""))} placeholder="新建项目名…" className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={{background:fieldBg,color:tp,border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.05)"}`}}/>
        <button onClick={()=>newProj.trim()&&(onAddProject(newProj.trim()),setNewProj(""))} className="px-3 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600"><Plus size={12}/></button>
      </div>
    </ModalShell>
  );
}

// ─── TagManageModal ───────────────────────────────────────────────────────────

function TagManageModal({tag,tasks,isDark,onClose,onRename,onDelete}:{
  tag:string;tasks:Task[];isDark:boolean;
  onClose:()=>void;onRename:(o:string,n:string)=>void;onDelete:(t:string)=>void;
}){
  const[renaming,setRenaming]=useState(false);
  const[newName,setNewName]=useState(tag);
  const[confirmDel,setConfirmDel]=useState(false);
  const tTasks=tasks.filter(t=>t.tags.includes(tag));
  const pending=tTasks.filter(t=>!t.completed),done=tTasks.filter(t=>t.completed);
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  const fieldBg=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.04)";
  return(
    <ModalShell title={`#${tag}`} subtitle={`${tTasks.length} 个任务`} onClose={onClose} isDark={isDark}>
      {!confirmDel&&!renaming&&(
        <div className="flex gap-2">
          <button onClick={()=>setRenaming(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors" style={{background:fieldBg,color:tm}}><Pencil size={11}/>重命名</button>
          <button onClick={()=>setConfirmDel(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/15 transition-colors"><Trash2 size={11}/>删除标签</button>
        </div>
      )}
      {renaming&&(
        <div className="flex gap-2">
          <input value={newName} onChange={e=>setNewName(e.target.value)} className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={{background:fieldBg,color:tp}}/>
          <button onClick={()=>{if(newName.trim()&&newName!==tag)onRename(tag,newName.trim());setRenaming(false);}} className="px-3 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold">确认</button>
          <button onClick={()=>setRenaming(false)} className="px-3 py-2 rounded-xl text-xs" style={{background:fieldBg,color:tm}}>取消</button>
        </div>
      )}
      {confirmDel&&(
        <div className="rounded-2xl p-4" style={{background:isDark?"rgba(239,68,68,0.12)":"rgba(254,242,242,1)",border:"1px solid rgba(239,68,68,0.25)"}}>
          <p className="text-sm font-medium text-red-400 mb-3">确认删除标签「{tag}」？</p>
          <div className="flex gap-2">
            <button onClick={()=>{onDelete(tag);onClose();}} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold">确认删除</button>
            <button onClick={()=>setConfirmDel(false)} className="flex-1 py-2 rounded-xl text-xs" style={{background:fieldBg,color:tm}}>取消</button>
          </div>
        </div>
      )}
      {pending.length>0&&<div><p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color:tm}}>待办 ({pending.length})</p><div className="space-y-1">{pending.map(t=><div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)"}}><div className="w-3 h-3 rounded-full border-2 shrink-0" style={{borderColor:isDark?"rgba(255,255,255,0.25)":"rgba(0,0,0,0.20)"}}/><span className="text-xs" style={{color:tp}}>{t.description}</span></div>)}</div></div>}
      {done.length>0&&<div><p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{color:tm}}>已完成 ({done.length})</p><div className="space-y-1">{done.slice(0,6).map(t=><div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)"}}><CircleCheckBig size={12} style={{color:"#4ADE80",flexShrink:0}}/><span className="text-xs line-through" style={{color:tm}}>{t.description}</span></div>)}</div></div>}
    </ModalShell>
  );
}

// ─── HelpModal ────────────────────────────────────────────────────────────────

function HelpModal({isDark,onClose}:{isDark:boolean;onClose:()=>void;}){
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  const shortcuts=[["n","新建任务"],["j","选择下一个"],["k","选择上一个"],["Enter","编辑选中任务"],["x","完成选中任务"],["Escape","关闭弹窗"],["?","帮助"],["Ctrl+Z","撤销"]];
  return(
    <ModalShell title="键盘快捷键" onClose={onClose} isDark={isDark} maxW="max-w-sm">
      <div className="space-y-3">
        {shortcuts.map(([key,desc])=>(
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm" style={{color:tp}}>{desc}</span>
            <kbd className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold" style={{background:isDark?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.06)",color:tp,border:`1px solid ${isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.07)"}`}}>{key}</kbd>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps{task:Task;index:number;selected:boolean;onComplete:(id:string,desc:string)=>void;onEdit:(t:Task)=>void;onTimerToggle:(id:string)=>void;timerTick:number;soundEnabled:boolean;}
function TaskCard({task,index,selected,onComplete,onEdit,onTimerToggle,timerTick,soundEnabled}:TaskCardProps){
  const style=getCardStyle(task,index);
  const[shaking,setShaking]=useState(false);
  const[checked,setChecked]=useState(false);
  const[removing,setRemoving]=useState(false);
  const overdue=isOverdue(task.dueDate);
  const dueLabel=formatDue(task.dueDate);
  const elapsed=task.timerStart?task.timerTotal+Math.floor((timerTick-task.timerStart)/1000):task.timerTotal;
  const isRunning=task.timerStart!==null;
  function handleCheck(){
    if(shaking||removing)return;
    setShaking(true);playSound("complete",soundEnabled);
    setTimeout(()=>{setShaking(false);setChecked(true);setTimeout(()=>{setRemoving(true);setTimeout(()=>onComplete(task.id,task.description),330);},380);},520);
  }
  const prioColors={H:"bg-red-500/25 text-red-300",M:"bg-amber-400/25 text-amber-200",L:"bg-blue-500/25 text-blue-300"};
  const prioLabels={H:"紧急",M:"普通",L:"低优"};
  return(
    <motion.div layout initial={{opacity:0,y:14,scale:0.97}} animate={{opacity:removing?0:1,y:0,scale:removing?0.93:1}} transition={{duration:0.30,ease:[0.16,1,0.3,1]}} className="mb-2.5" style={removing?{height:0,overflow:"hidden",marginBottom:0,pointerEvents:"none"}:{}}>
      <div className={`rounded-2xl overflow-hidden backdrop-blur-xl ${shaking?"shaking":""}`}
        style={{background:style.gradient,boxShadow:`0 5px 28px ${style.glow},0 1px 0 rgba(255,255,255,0.18) inset${selected?",0 0 0 2.5px rgba(255,255,255,0.65)":""}`,border:"1px solid rgba(255,255,255,0.15)"}}>
        <div className="flex items-center gap-3.5 px-4 pt-3.5 pb-2">
          <button onClick={handleCheck} className="shrink-0 w-6 h-6 rounded-full border-2 border-white/45 flex items-center justify-center hover:border-white hover:bg-white/20 focus:outline-none transition-all" style={{backgroundColor:checked?"rgba(255,255,255,0.92)":undefined}}>
            {checked&&<Check size={12} strokeWidth={3.5} className="check-pop" style={{color:style.accent}}/>}
          </button>
          <span className={`flex-1 text-sm font-semibold text-white leading-snug ${checked?"line-through opacity-50":""}`}>{task.description}</span>
          {dueLabel&&<span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:overdue?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.17)",color:"rgba(255,255,255,0.92)"}}>{dueLabel}</span>}
        </div>
        <div className="flex items-center gap-1.5 px-4 pb-3.5 flex-wrap">
          {task.tags.slice(0,3).map(tag=><span key={tag} className="text-[10px] px-2 py-0.5 rounded-lg" style={{background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.80)"}}>{tag}</span>)}
          {task.tags.length>3&&<span className="text-[10px] px-2 py-0.5 rounded-lg" style={{background:"rgba(255,255,255,0.10)",color:"rgba(255,255,255,0.60)"}}>+{task.tags.length-3}</span>}
          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold ${prioColors[task.priority]}`}>{prioLabels[task.priority]}</span>
          <div className="flex-1"/>
          {elapsed>0&&<span className="text-[10px] font-mono" style={{color:"rgba(255,255,255,0.80)"}}>{formatTimer(elapsed)}</span>}
          <button onClick={()=>onTimerToggle(task.id)} className="p-1 rounded-lg hover:bg-white/20 transition-colors" style={{color:isRunning?"rgba(255,220,100,0.90)":"rgba(255,255,255,0.50)"}}>{isRunning?<Square size={12} fill="currentColor"/>:<Play size={12} fill="currentColor"/>}</button>
          <button onClick={()=>onEdit(task)} className="p-1 rounded-lg hover:bg-white/20 transition-colors" style={{color:"rgba(255,255,255,0.50)"}}><ChevronDown size={13}/></button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── CompletedSection ─────────────────────────────────────────────────────────

function CompletedSection({tasks,isDark,onUncomplete}:{tasks:Task[];isDark:boolean;onUncomplete:(id:string)=>void;}){
  const[open,setOpen]=useState(false);
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.48)":"rgba(15,10,40,0.44)";
  const ts=isDark?"rgba(255,255,255,0.28)":"rgba(15,10,40,0.24)";
  if(tasks.length===0)return null;
  return(
    <div className="mt-3">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors" style={{background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",border:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"}`}}>
        <span className="text-sm font-semibold" style={{color:tm}}>已完成 ({tasks.length})</span>
        {open?<ChevronUp size={14} style={{color:ts}}/>:<ChevronDown size={14} style={{color:ts}}/>}
      </button>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}} className="overflow-hidden">
            <div className="mt-2 space-y-1">
              {tasks.slice(0,20).map(t=>(
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.02)"}}>
                  <CircleCheckBig size={14} style={{color:"#4ADE80",flexShrink:0}}/>
                  <span className="flex-1 text-sm line-through" style={{color:tm}}>{t.description}</span>
                  <span className="text-[10px]" style={{color:ts}}>{t.completedAt}</span>
                  <button onClick={()=>onUncomplete(t.id)} className="text-[10px] px-2 py-0.5 rounded-lg transition-colors" style={{color:ts,background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"}}
                    onMouseEnter={e=>e.currentTarget.style.color=tp} onMouseLeave={e=>e.currentTarget.style.color=ts}>取消完成</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── AddTaskModal ─────────────────────────────────────────────────────────────

function AddTaskModal({onAdd,onClose,soundEnabled,isDark}:{onAdd:(d:string)=>void;onClose:()=>void;soundEnabled:boolean;isDark:boolean;}){
  const[value,setValue]=useState("");
  const ref=useRef<HTMLInputElement>(null);
  useEffect(()=>{setTimeout(()=>ref.current?.focus(),60);},[]);

  function submit(){
    if(!value.trim()){onClose();return;}
    onAdd(value.trim());playSound("add",soundEnabled);onClose();
  }

  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.35)":"rgba(15,10,40,0.35)";
  const ts=isDark?"rgba(255,255,255,0.22)":"rgba(15,10,40,0.22)";

  const cardStyle=isDark?{
    background:"rgba(12,6,26,0.72)",
    backdropFilter:"blur(60px) saturate(240%)",
    WebkitBackdropFilter:"blur(60px) saturate(240%)",
    boxShadow:"0 1.5px 0 rgba(255,255,255,0.12) inset,0 40px 80px rgba(0,0,0,0.70),0 0 80px rgba(99,102,241,0.18)",
  }:{
    background:"rgba(250,248,255,0.80)",
    backdropFilter:"blur(60px) saturate(200%)",
    WebkitBackdropFilter:"blur(60px) saturate(200%)",
    boxShadow:"0 1.5px 0 rgba(255,255,255,0.88) inset,0 32px 80px rgba(80,60,180,0.16),0 0 60px rgba(99,102,241,0.10)",
  };

  const borderGrad="linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899,#F59E0B,#06B6D4,#6366F1)";

  return(
    <div className="fixed inset-0 z-50 flex items-start justify-center px-5" style={{paddingTop:"32vh"}}>
      <GlassOverlay onClose={onClose}/>
      <motion.div initial={{opacity:0,scale:0.92,y:-16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:-16}}
        transition={{type:"spring",stiffness:380,damping:28}}
        className="relative z-10 w-full max-w-xl rounded-3xl grad-flow p-[1px]"
        style={{background:borderGrad,backgroundSize:"200% 100%"}}>

        <div className="rounded-3xl overflow-hidden" style={cardStyle}>

          {/* Main input area */}
          <div className="px-7 pt-7 pb-5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] mb-4" style={{color:isDark?"#818CF8":"#6366F1"}}>
              新建任务
            </div>
            <input ref={ref} value={value} onChange={e=>setValue(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")submit();if(e.key==="Escape")onClose();}}
              placeholder="今天要完成什么？"
              className="w-full bg-transparent outline-none font-medium"
              style={{color:tp,fontSize:22,lineHeight:1.4,caretColor:"#818CF8"}}
              autoComplete="off"
            />
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-7 pb-6 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-[11px]" style={{color:ts}}>⏎ 创建</span>
              <span className="text-[11px]" style={{color:ts}}>Esc 取消</span>
            </div>
            <AnimatePresence>
              {value.trim()&&(
                <motion.button initial={{opacity:0,x:10,scale:0.90}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:10,scale:0.90}}
                  transition={{type:"spring",stiffness:400,damping:28}}
                  onClick={submit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                  style={{background:"linear-gradient(135deg,#6366F1,#8B5CF6)",boxShadow:"0 4px 18px rgba(99,102,241,0.45)"}}>
                  创建任务
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ToggleSwitch ─────────────────────────────────────────────────────────────

function ToggleSwitch({on,onChange}:{on:boolean;onChange:(v:boolean)=>void;}){
  return(
    <motion.button onClick={()=>onChange(!on)}
      className="w-10 h-6 rounded-full relative flex-shrink-0 focus:outline-none"
      style={{background:on?"#6366F1":"rgba(255,255,255,0.14)",transition:"background 0.2s"}}>
      <motion.div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
        animate={{x:on?18:2}} transition={{type:"spring",stiffness:500,damping:30}}/>
    </motion.button>
  );
}

// ─── SettingsPanel ────────────────────────────────────────────────────────────

function SettingsPanel({isDark,pos,soundEnabled,setSoundEnabled,achievementEnabled,setAchievementEnabled,onClose}:{
  isDark:boolean;pos:{top:number;left:number};
  soundEnabled:boolean;setSoundEnabled:(v:boolean)=>void;
  achievementEnabled:boolean;setAchievementEnabled:(v:boolean)=>void;
  onClose:()=>void;
}){
  useEffect(()=>{
    function h(e:MouseEvent){if(!(e.target as HTMLElement).closest("[data-settings-panel]"))onClose();}
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  const tp=isDark?"rgba(255,255,255,0.88)":"rgba(15,10,40,0.85)";
  const tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.44)";
  const divider=isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)";
  const panelStyle=isDark?{
    background:"rgba(14,8,32,0.90)",
    backdropFilter:"blur(40px) saturate(200%)",
    WebkitBackdropFilter:"blur(40px) saturate(200%)",
    border:"1px solid rgba(255,255,255,0.13)",
    boxShadow:"0 1px 0 rgba(255,255,255,0.10) inset,0 24px 60px rgba(0,0,0,0.60)",
  }:{
    background:"rgba(252,250,255,0.90)",
    backdropFilter:"blur(40px) saturate(180%)",
    WebkitBackdropFilter:"blur(40px) saturate(180%)",
    border:"1px solid rgba(255,255,255,0.92)",
    boxShadow:"0 1px 0 rgba(255,255,255,0.88) inset,0 20px 50px rgba(80,60,180,0.12)",
  };

  const rows=[
    {label:"音效",icon:<Volume2 size={13}/>,on:soundEnabled,set:setSoundEnabled},
    {label:"完成成就",icon:<Medal size={13}/>,on:achievementEnabled,set:setAchievementEnabled},
  ];

  return(
    <motion.div data-settings-panel="" initial={{opacity:0,scale:0.94,y:-8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.94,y:-8}}
      transition={{type:"spring",stiffness:420,damping:30}}
      style={{...panelStyle,position:"fixed",top:pos.top,left:pos.left,width:196,zIndex:9999,borderRadius:16,overflow:"hidden"}}>
      <div className="px-4 py-3 border-b" style={{borderColor:divider}}>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{color:tm}}>设置</span>
      </div>
      {rows.map((r,i)=>(
        <div key={r.label} className={`flex items-center justify-between px-4 py-3 ${i<rows.length-1?"border-b":""}`} style={{borderColor:divider}}>
          <div className="flex items-center gap-2.5">
            <span style={{color:tm}}>{r.icon}</span>
            <span className="text-sm font-medium" style={{color:tp}}>{r.label}</span>
          </div>
          <ToggleSwitch on={r.on} onChange={r.set}/>
        </div>
      ))}
    </motion.div>
  );
}

// ─── AddTask trigger button ───────────────────────────────────────────────────

function AddTaskBtn({onOpen,isDark}:{onOpen:()=>void;isDark:boolean;}){
  const glass=isDark?"bg-white/[0.07] border-white/[0.13]":"bg-white/60 border-white/75";
  const lbl=isDark?"text-white/45 group-hover:text-white/80":"text-gray-400 group-hover:text-gray-700";
  const ic=isDark?"border-white/30 group-hover:border-white/60 group-hover:bg-white/12":"border-indigo-300 group-hover:border-indigo-400";
  return(
    <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}} onClick={onOpen}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-xl border transition-all group cursor-pointer ${glass}`}>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all ${ic}`}>
        <Plus size={13} strokeWidth={2.5} className={`transition-colors ${lbl}`}/>
      </div>
      <span className={`text-sm font-semibold transition-colors ${lbl}`}>添加任务</span>
    </motion.button>
  );
}

// ─── KanbanView ───────────────────────────────────────────────────────────────

function KanbanView({tasks,isDark,onEdit,onComplete,onUpdate}:{tasks:Task[];isDark:boolean;onEdit:(t:Task)=>void;onComplete:(id:string,desc:string)=>void;onUpdate:(id:string,d:Partial<Task>)=>void;}){
  const cols=[{key:"inbox",label:"Inbox",filter:(t:Task)=>!t.completed&&t.status==="pending"&&!t.project},{key:"backlog",label:"Backlog",filter:(t:Task)=>!t.completed&&t.status==="pending"&&!!t.project},{key:"ip",label:"In Progress",filter:(t:Task)=>!t.completed&&t.status==="started"},{key:"hold",label:"On Hold",filter:(t:Task)=>!t.completed&&t.status==="on-hold"},{key:"done",label:"Done",filter:(t:Task)=>t.completed}];
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  return(
    <div className="flex gap-3 h-full overflow-x-auto pb-2">
      {cols.map(col=>{
        const ct=tasks.filter(col.filter);
        return(
          <div key={col.key} className="flex flex-col rounded-2xl shrink-0 overflow-hidden" style={{width:200,background:isDark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.35)",border:`1px solid ${isDark?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.60)"}`}}>
            <div className="flex items-center gap-2 px-3 py-3 shrink-0">
              <span className="text-xs font-bold" style={{color:tp}}>{col.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{background:isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.06)",color:tm}}>{ct.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
              {ct.map(t=>{
                const pc={H:"bg-red-500/20 text-red-300",M:"bg-amber-400/20 text-amber-200",L:"bg-blue-400/20 text-blue-300"};
                return(
                  <div key={t.id} className="rounded-xl p-3" style={{background:isDark?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.65)",border:`1px solid ${isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.06)"}`}}>
                    <p className="text-[13px] font-medium mb-2 leading-snug" style={{color:tp,textDecoration:t.completed?"line-through":"none",opacity:t.completed?0.55:1}}>{t.description}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {t.priority&&<span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${isDark?pc[t.priority]:"bg-gray-100 text-gray-600"}`}>{t.priority==="H"?"紧急":t.priority==="M"?"普通":"低优"}</span>}
                      {t.project&&<span className="text-[9px]" style={{color:tm}}>{t.project}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {!t.completed&&col.key!=="ip"&&<button onClick={()=>onUpdate(t.id,{status:"started",timerStart:Date.now()})} className="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer" style={{background:"rgba(59,130,246,0.20)",color:"#93c5fd"}}>开始</button>}
                      {!t.completed&&col.key==="ip"&&<button onClick={()=>onUpdate(t.id,{status:"pending",timerStart:null,timerTotal:t.timerTotal+(t.timerStart?Math.floor((Date.now()-t.timerStart)/1000):0)})} className="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer" style={{background:"rgba(234,179,8,0.20)",color:"#fde68a"}}>暂停</button>}
                      {!t.completed&&<button onClick={()=>onComplete(t.id,t.description)} className="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer" style={{background:"rgba(34,197,94,0.20)",color:"#86efac"}}>完成</button>}
                      {t.completed&&<button onClick={()=>onUpdate(t.id,{completed:false,status:"pending",completedAt:null})} className="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer" style={{background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",color:tm}}>取消</button>}
                      <button onClick={()=>onEdit(t)} className="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer" style={{background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",color:tm}}>编辑</button>
                    </div>
                  </div>
                );
              })}
              {ct.length===0&&<div className="text-center py-6 text-[11px]" style={{color:tm}}>空</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CalendarView ─────────────────────────────────────────────────────────────

function CalendarView({tasks,isDark,onEdit}:{tasks:Task[];isDark:boolean;onEdit:(t:Task)=>void;}){
  const[calDate,setCalDate]=useState(new Date());
  const[calView,setCalView]=useState<"month"|"week">("month");
  const year=calDate.getFullYear(),month=calDate.getMonth();
  const firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
  const todayStr=fmt(new Date());
  const cells:Array<{day:number|null;date:string}>=[];
  for(let i=0;i<firstDay;i++)cells.push({day:null,date:""});
  for(let d=1;d<=daysInMonth;d++){const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;cells.push({day:d,date:ds});}
  while(cells.length%7!==0)cells.push({day:null,date:""});
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)",tm=isDark?"rgba(255,255,255,0.36)":"rgba(15,10,40,0.38)";
  const chipC={H:"rgba(239,68,68,0.20) #fca5a5",M:"rgba(234,179,8,0.20) #fde68a",L:"rgba(99,102,241,0.20) #a5b4fc"};
  const weekStart=new Date(calDate);weekStart.setDate(calDate.getDate()-calDate.getDay());
  const weekDays=Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);return{date:fmt(d),day:d.getDate()};});
  const tabBtn=(v:string)=>`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${calView===v?(isDark?"bg-white/15 text-white":"bg-indigo-500 text-white"):(isDark?"text-white/40 hover:bg-white/10":"text-gray-500 hover:bg-gray-100")}`;
  return(
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex rounded-xl overflow-hidden" style={{background:isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"}}>
          <button onClick={()=>setCalView("month")} className={tabBtn("month")}>月</button>
          <button onClick={()=>setCalView("week")} className={tabBtn("week")}>周</button>
        </div>
        <button onClick={()=>{const d=new Date(calDate);calView==="month"?d.setMonth(d.getMonth()-1):d.setDate(d.getDate()-7);setCalDate(d);}} className={`p-1.5 rounded-xl ${isDark?"text-white/40 hover:text-white hover:bg-white/10":"text-gray-400 hover:text-gray-700 hover:bg-black/5"}`}><ChevronLeft size={14}/></button>
        <button onClick={()=>setCalDate(new Date())} className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold ${isDark?"bg-white/8 text-white/70 hover:bg-white/14":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>今天</button>
        <button onClick={()=>{const d=new Date(calDate);calView==="month"?d.setMonth(d.getMonth()+1):d.setDate(d.getDate()+7);setCalDate(d);}} className={`p-1.5 rounded-xl ${isDark?"text-white/40 hover:text-white hover:bg-white/10":"text-gray-400 hover:text-gray-700 hover:bg-black/5"}`}><ChevronRight size={14}/></button>
        <span className="text-sm font-semibold" style={{color:tp}}>{calView==="month"?calDate.toLocaleDateString("zh-CN",{year:"numeric",month:"long"}):weekDays[0].date+" 至 "+weekDays[6].date}</span>
      </div>
      {calView==="month"?(
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 sticky top-0 z-10" style={{background:isDark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.60)",backdropFilter:"blur(12px)"}}>
            {["日","一","二","三","四","五","六"].map(d=><div key={d} className="text-center text-[10px] font-bold py-2" style={{color:tm}}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 border-l border-t" style={{borderColor:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}}>
            {cells.map((cell,i)=>{
              const ct=cell.date?tasks.filter(t=>t.dueDate===cell.date&&!t.completed):[];
              const isToday=cell.date===todayStr;
              return(
                <div key={i} className="border-r border-b p-1.5" style={{minHeight:90,borderColor:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",background:!cell.day?isDark?"rgba(255,255,255,0.02)":undefined:isToday?isDark?"rgba(99,102,241,0.12)":"rgba(99,102,241,0.06)":undefined}}>
                  {cell.day&&<div className="text-xs font-bold mb-1" style={{color:isToday?"#818cf8":cell.date<todayStr?isDark?"rgba(255,255,255,0.30)":"rgba(0,0,0,0.30)":tp}}>{cell.day}</div>}
                  {ct.slice(0,3).map(t=>{const[bg,color]=(chipC[t.priority||"L"]).split(" ");return(<button key={t.id} onClick={()=>onEdit(t)} className="w-full text-left text-[10px] px-1.5 py-0.5 rounded-md mb-0.5 truncate font-medium hover:opacity-80" style={{background:bg,color}}>{t.description}</button>);})}
                  {ct.length>3&&<span className="text-[9px]" style={{color:tm}}>+{ct.length-3} 更多</span>}
                </div>
              );
            })}
          </div>
        </div>
      ):(
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 gap-2 h-full min-h-[200px]">
            {weekDays.map(wd=>{
              const wt=tasks.filter(t=>t.dueDate===wd.date&&!t.completed),isToday=wd.date===todayStr;
              return(
                <div key={wd.date} className="flex flex-col rounded-xl p-2" style={{background:isToday?isDark?"rgba(99,102,241,0.12)":"rgba(99,102,241,0.06)":isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.40)",border:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`}}>
                  <div className="text-xs font-bold mb-2 text-center" style={{color:isToday?"#818cf8":tp}}>{"日一二三四五六".split("")[new Date(wd.date+"T00:00:00").getDay()]}<br/><span className="text-base">{wd.day}</span></div>
                  <div className="space-y-1 flex-1">{wt.slice(0,5).map(t=>{const[bg,color]=(chipC[t.priority||"L"]).split(" ");return(<button key={t.id} onClick={()=>onEdit(t)} className="w-full text-left text-[10px] px-2 py-1 rounded-lg truncate font-medium hover:opacity-80" style={{background:bg,color}}>{t.description}</button>);})}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App(){
  const[tasks,setTasks]=useState<Task[]>(SEED);
  const[allProjects,setAllProjects]=useState<string[]>(INIT_PROJECTS);
  const[allTags,setAllTags]=useState<string[]>(INIT_TAGS);
  const[rightTab,setRightTab]=useState<RightTab>("tasks");
  const[leftTab,setLeftTab]=useState<LeftTab>("projects");
  const[themeMode,setThemeMode]=useState<ThemeMode>(()=>{try{return(localStorage.getItem("twm-theme") as ThemeMode)??"dark";}catch{return"dark";}});
  const[soundEnabled,setSoundEnabled]=useState(()=>{try{return localStorage.getItem("twm-sound")!=="false";}catch{return true;}});
  const[isDark,setIsDark]=useState(true);
  const[doneInfo,setDoneInfo]=useState<DoneInfo|null>(null);
  const[editingTask,setEditingTask]=useState<Task|null>(null);
  const[dayModal,setDayModal]=useState<string|null>(null);
  const[projectModal,setProjectModal]=useState<string|null>(null);
  const[tagModal,setTagModal]=useState<string|null>(null);
  const[showHelp,setShowHelp]=useState(false);
  const[showAddTask,setShowAddTask]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
  const[settingsPos,setSettingsPos]=useState({top:0,left:0});
  const settingsBtnRef=useRef<HTMLButtonElement>(null);
  const[achievementEnabled,setAchievementEnabled]=useState(()=>{try{return localStorage.getItem("twm-achievement")!=="false";}catch{return true;}});
  const[selectedId,setSelectedId]=useState<string|null>(null);
  const[timerTick,setTimerTick]=useState(Date.now());

  useEffect(()=>{
    function apply(dark:boolean){document.documentElement.classList.toggle("dark",dark);setIsDark(dark);}
    if(themeMode==="system"){const mq=window.matchMedia("(prefers-color-scheme: dark)");apply(mq.matches);const h=(e:MediaQueryListEvent)=>apply(e.matches);mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);}
    else apply(themeMode==="dark");
  },[themeMode]);
  useEffect(()=>{try{localStorage.setItem("twm-theme",themeMode);}catch{}},[themeMode]);
  useEffect(()=>{try{localStorage.setItem("twm-sound",String(soundEnabled));}catch{}},[soundEnabled]);
  useEffect(()=>{try{localStorage.setItem("twm-achievement",String(achievementEnabled));}catch{}},[achievementEnabled]);
  useEffect(()=>{if(!tasks.some(t=>t.timerStart!==null))return;const id=setInterval(()=>setTimerTick(Date.now()),1000);return()=>clearInterval(id);},[tasks]);

  function addTask(desc:string){setTasks(p=>[mk({id:newId(),description:desc,createdAt:fmt(new Date())}),...p]);}
  function completeTask(id:string,desc:string){
    const todayStr=fmt(new Date());
    setTasks(prev=>{
      const next=prev.map(t=>t.id===id?{...t,completed:true,status:"completed" as const,completedAt:todayStr,timerStart:null}:t);
      const tc=next.filter(t=>t.completed&&t.completedAt===todayStr).length;
      const td=next.filter(t=>t.completed).length;
      if(achievementEnabled)setTimeout(()=>setDoneInfo({description:desc,todayCount:tc,totalDone:td}),60);
      return next;
    });
  }
  function uncompleteTask(id:string){setTasks(p=>p.map(t=>t.id===id?{...t,completed:false,status:"pending" as const,completedAt:null}:t));}
  function updateTask(id:string,data:Partial<Task>){setTasks(p=>p.map(t=>t.id===id?{...t,...data}:t));}
  function deleteTask(id:string){setTasks(p=>p.filter(t=>t.id!==id));}
  function toggleTimer(id:string){setTasks(p=>p.map(t=>{if(t.id!==id)return t;if(t.timerStart!==null)return{...t,status:"pending" as const,timerStart:null,timerTotal:t.timerTotal+Math.floor((Date.now()-t.timerStart)/1000)};return{...t,status:"started" as const,timerStart:Date.now()};}));}
  function addProject(v:string){if(!allProjects.includes(v))setAllProjects(p=>[...p,v]);}
  function deleteProject(v:string){setAllProjects(p=>p.filter(x=>x!==v));setTasks(p=>p.map(t=>t.project===v?{...t,project:""}:t));}
  function renameProject(o:string,n:string){setAllProjects(p=>p.map(x=>x===o?n:x));setTasks(p=>p.map(t=>t.project===o?{...t,project:n}:t));}
  function addTag(v:string){if(!allTags.includes(v))setAllTags(p=>[...p,v]);}
  function deleteTag(v:string){setAllTags(p=>p.filter(x=>x!==v));setTasks(p=>p.map(t=>({...t,tags:t.tags.filter(tg=>tg!==v)})));}
  function renameTag(o:string,n:string){setAllTags(p=>p.map(x=>x===o?n:x));setTasks(p=>p.map(t=>({...t,tags:t.tags.map(tg=>tg===o?n:tg)})));}

  const active=tasks.filter(t=>!t.completed);
  useEffect(()=>{
    function onKey(e:KeyboardEvent){
      const tag=(e.target as HTMLElement).tagName;
      if(tag==="INPUT"||tag==="TEXTAREA")return;
      if(e.key==="?"&&!e.ctrlKey){setShowHelp(s=>!s);return;}
      if(e.key==="n"&&!e.ctrlKey){setShowAddTask(true);return;}
      if(e.key==="Escape"){setShowHelp(false);setShowAddTask(false);setShowSettings(false);setDoneInfo(null);setEditingTask(null);setDayModal(null);setProjectModal(null);setTagModal(null);return;}
      if(e.key==="j"){const ids=active.map(t=>t.id),i=selectedId?ids.indexOf(selectedId):-1;setSelectedId(ids[Math.min(i+1,ids.length-1)]||null);return;}
      if(e.key==="k"){const ids=active.map(t=>t.id),i=selectedId?ids.indexOf(selectedId):ids.length;setSelectedId(ids[Math.max(i-1,0)]||null);return;}
      if(e.key==="x"&&selectedId){const t=active.find(t=>t.id===selectedId);if(t)completeTask(t.id,t.description);return;}
      if(e.key==="Enter"&&selectedId){const t=active.find(t=>t.id===selectedId);if(t)setEditingTask(t);return;}
      if((e.key==="z"||e.key==="Z")&&e.ctrlKey){const last=tasks.filter(t=>t.completed).sort((a,b)=>(b.completedAt??"").localeCompare(a.completedAt??""))[0];if(last)uncompleteTask(last.id);}
    }
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  },[active,selectedId,tasks]);

  const panelCls=isDark?"bg-white/[0.07] backdrop-blur-2xl border border-white/[0.13]":"bg-white/55 backdrop-blur-2xl border border-white/80";
  const divider=isDark?"rgba(255,255,255,0.10)":"rgba(15,10,40,0.07)";
  const tp=isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const tm=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  const ctrlBtn=isDark?"text-white/40 hover:text-white hover:bg-white/10":"text-gray-500 hover:text-gray-800 hover:bg-black/[0.06]";
  const themeNext:Record<ThemeMode,ThemeMode>={light:"dark",dark:"system",system:"light"};
  const ThemeIcon=themeMode==="light"?Sun:themeMode==="dark"?Moon:Monitor;
  const tagFreq:Record<string,number>={};tasks.forEach(t=>t.tags.forEach(tg=>{tagFreq[tg]=(tagFreq[tg]??0)+1;}));
  const topTags=allTags.filter(t=>tagFreq[t]).sort((a,b)=>(tagFreq[b]??0)-(tagFreq[a]??0)).slice(0,8);
  const tabBtn=(id:string,cur:string)=>`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${id===cur?(isDark?"bg-white/15 text-white":"bg-indigo-500 text-white"):(isDark?"text-white/40 hover:bg-white/10 hover:text-white/70":"text-gray-500 hover:bg-gray-100")}`;
  const rtTitles={tasks:"事项",kanban:"看板",calendar:"日历"};
  const rtSubs={tasks:`${active.length} 项待完成`,kanban:`${active.filter(t=>t.status==="pending").length} 个待办 · ${active.filter(t=>t.status==="started").length} 个进行中`,calendar:`今天 ${tasks.filter(t=>t.dueDate===fmt(new Date())&&!t.completed).length} 个任务`};

  return(
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="size-full flex overflow-hidden" style={{background:isDark?MESH_DARK:MESH_LIGHT,fontFamily:"'Inter',system-ui,-apple-system,sans-serif"}}>
        <div className="flex gap-5 p-5 w-full h-full">

          {/* LEFT PANEL */}
          <div className={`flex flex-col rounded-3xl shadow-2xl overflow-hidden ${panelCls}`} style={{width:310,minWidth:270}}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0" style={{borderBottom:`1px solid ${divider}`}}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",boxShadow:"0 4px 14px rgba(99,102,241,0.45)"}}><Sparkles size={15} className="text-white"/></div>
                <div><div className="text-[13px] font-bold" style={{color:tp}}>taskwarrior</div><div className="text-[10px]" style={{color:tm}}>motion</div></div>
              </div>
              <div className="flex gap-0.5">
                <button onClick={()=>setShowHelp(true)} className={`p-2 rounded-xl transition-colors ${ctrlBtn}`} title="快捷键 (?)"><Keyboard size={14}/></button>
                <button ref={settingsBtnRef}
                  onClick={()=>{
                    if(!showSettings&&settingsBtnRef.current){
                      const r=settingsBtnRef.current.getBoundingClientRect();
                      setSettingsPos({top:r.bottom+8,left:Math.max(8,r.right-196)});
                    }
                    setShowSettings(s=>!s);
                  }}
                  className={`p-2 rounded-xl transition-colors ${showSettings?(isDark?"bg-white/12 text-white":"bg-black/8 text-gray-800"):ctrlBtn}`}
                  title="设置">
                  <Settings size={14}/>
                </button>
                <button onClick={()=>setThemeMode(themeNext[themeMode])} className={`p-2 rounded-xl transition-colors ${ctrlBtn}`}><ThemeIcon size={14}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              <Heatmap tasks={tasks} isDark={isDark} onDayClick={setDayModal}/>
              <div style={{borderTop:`1px solid ${divider}`,paddingTop:20}}>
                <div className="flex gap-1 mb-4">
                  <button onClick={()=>setLeftTab("projects")} className={tabBtn("projects",leftTab)}>项目进度</button>
                  <button onClick={()=>setLeftTab("tags")} className={tabBtn("tags",leftTab)}>标签</button>
                </div>
                {leftTab==="projects"&&(
                  <div className="space-y-3">
                    {allProjects.map(p=>{
                      const cs=CARD_STYLES[p]??FALLBACK[0];
                      const tot=tasks.filter(t=>t.project===p).length;
                      const done=tasks.filter(t=>t.project===p&&t.completed).length;
                      const pct=tot>0?Math.round((done/tot)*100):0;
                      return(
                        /* Full row is now the clickable area */
                        <button key={p} onClick={()=>setProjectModal(p)}
                          className="w-full text-left rounded-xl px-2.5 py-2 transition-colors"
                          style={{background:"transparent"}}
                          onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-[11px] font-semibold" style={{color:isDark?"rgba(255,255,255,0.65)":"rgba(15,10,40,0.72)"}}>{p}</span>
                            <span className="text-[11px]" style={{color:tm}}>{done}/{tot}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{background:isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)"}}>
                            <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.9,ease:"easeOut"}} className="h-full rounded-full" style={{background:cs.gradient}}/>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {leftTab==="tags"&&(
                  <div className="space-y-1">
                    {topTags.map(tag=>(
                      <button key={tag} onClick={()=>setTagModal(tag)} className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors"
                        onMouseEnter={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div className="flex items-center gap-2"><TagIcon size={11} style={{color:tm}}/><span className="text-[12px] font-medium" style={{color:isDark?"rgba(255,255,255,0.65)":"rgba(15,10,40,0.72)"}}>{tag}</span></div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{background:isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.06)",color:tm}}>{tagFreq[tag]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={`flex-1 flex flex-col rounded-3xl shadow-2xl overflow-hidden ${panelCls}`}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0" style={{borderBottom:`1px solid ${divider}`}}>
              <div><h1 className="text-xl font-black" style={{color:tp}}>{rtTitles[rightTab]}</h1><p className="text-xs mt-0.5" style={{color:tm}}>{rtSubs[rightTab]}</p></div>
              <div className="flex gap-1">
                {(["tasks","kanban","calendar"] as RightTab[]).map(tab=>(
                  <button key={tab} onClick={()=>setRightTab(tab)} className={tabBtn(tab,rightTab)}>
                    {tab==="tasks"?<><ListTodo size={11} className="inline mr-1"/>事项</>:tab==="kanban"?<><LayoutGrid size={11} className="inline mr-1"/>看板</>:<><CalendarDays size={11} className="inline mr-1"/>日历</>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-auto px-6 pt-4 pb-6">
              <AnimatePresence mode="wait">
                {rightTab==="tasks"&&(
                  <motion.div key="tasks" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.16}} className="flex flex-col">
                    <div className="mb-4"><AddTaskBtn onOpen={()=>setShowAddTask(true)} isDark={isDark}/></div>
                    <AnimatePresence>
                      {active.length===0&&(
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background:isDark?"rgba(255,255,255,0.10)":"rgba(99,102,241,0.12)",border:isDark?"1px solid rgba(255,255,255,0.14)":"1px solid rgba(99,102,241,0.18)"}}><Sparkles size={26} style={{color:isDark?"rgba(255,255,255,0.45)":"#818CF8"}}/></div>
                          <p className="text-base font-black mb-1" style={{color:tp}}>今日任务全部完成</p>
                          <p className="text-sm" style={{color:tm}}>再添加一些，继续保持状态</p>
                        </motion.div>
                      )}
                      {active.map((task,i)=>(
                        <TaskCard key={task.id} task={task} index={i} selected={selectedId===task.id}
                          onComplete={completeTask} onEdit={setEditingTask} onTimerToggle={toggleTimer}
                          timerTick={timerTick} soundEnabled={soundEnabled}/>
                      ))}
                    </AnimatePresence>
                    <CompletedSection tasks={tasks.filter(t=>t.completed).sort((a,b)=>(b.completedAt??"").localeCompare(a.completedAt??""))} isDark={isDark} onUncomplete={uncompleteTask}/>
                  </motion.div>
                )}
                {rightTab==="kanban"&&(
                  <motion.div key="kanban" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.16}} className="h-full">
                    <KanbanView tasks={tasks} isDark={isDark} onEdit={setEditingTask} onComplete={completeTask} onUpdate={updateTask}/>
                  </motion.div>
                )}
                {rightTab==="calendar"&&(
                  <motion.div key="calendar" initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.16}} className="h-full">
                    <CalendarView tasks={tasks} isDark={isDark} onEdit={setEditingTask}/>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showSettings&&<SettingsPanel key="settings" isDark={isDark} pos={settingsPos} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} achievementEnabled={achievementEnabled} setAchievementEnabled={setAchievementEnabled} onClose={()=>setShowSettings(false)}/>}
          {showAddTask&&<AddTaskModal key="add" onAdd={addTask} onClose={()=>setShowAddTask(false)} soundEnabled={soundEnabled} isDark={isDark}/>}
          {doneInfo&&<CompletionModal info={doneInfo} onClose={()=>setDoneInfo(null)}/>}
          {editingTask&&<TaskEditModal key="edit" task={editingTask} isDark={isDark} allProjects={allProjects} allTags={allTags} onClose={()=>setEditingTask(null)} onSave={d=>updateTask(editingTask.id,d)} onDelete={()=>deleteTask(editingTask.id)}/>}
          {dayModal&&<DayCompletedModal key="day" date={dayModal} tasks={tasks} isDark={isDark} onClose={()=>setDayModal(null)}/>}
          {projectModal&&<ProjectManageModal key="proj" project={projectModal} tasks={tasks} isDark={isDark} allProjects={allProjects} onClose={()=>setProjectModal(null)} onRename={renameProject} onDelete={deleteProject} onAddProject={addProject}/>}
          {tagModal&&<TagManageModal key="tag" tag={tagModal} tasks={tasks} isDark={isDark} onClose={()=>setTagModal(null)} onRename={renameTag} onDelete={deleteTag}/>}
          {showHelp&&<HelpModal key="help" isDark={isDark} onClose={()=>setShowHelp(false)}/>}
        </AnimatePresence>

        <Toaster position="top-center" toastOptions={{style:{background:isDark?"rgba(14,7,34,0.88)":"rgba(255,255,255,0.88)",backdropFilter:"blur(24px)",color:isDark?"#fff":"#1a1a2e",border:isDark?"1px solid rgba(255,255,255,0.12)":"1px solid rgba(0,0,0,0.07)",borderRadius:"14px",fontSize:"13px",fontFamily:"Inter,system-ui,sans-serif",boxShadow:"0 8px 40px rgba(0,0,0,0.28)"}}}/>
      </div>
    </>
  );
}
