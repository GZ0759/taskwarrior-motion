import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import {
  Check, Plus, ChevronDown, ChevronUp,
  Sun, Moon, Monitor, Volume2, VolumeX,
  Calendar, FolderOpen, Tag, Sparkles, X,
  Trophy, Zap
} from "lucide-react";

// ─── Global CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
@keyframes taskShake {
  0%,100% { transform: translateX(0) rotate(0deg); }
  16%      { transform: translateX(-9px) rotate(-2.5deg); }
  33%      { transform: translateX(8px)  rotate(2deg); }
  50%      { transform: translateX(-6px) rotate(-1.5deg); }
  66%      { transform: translateX(5px)  rotate(1deg); }
  83%      { transform: translateX(-3px); }
}
@keyframes checkPop {
  0%   { transform: scale(0) rotate(-20deg); opacity:0; }
  60%  { transform: scale(1.4) rotate(5deg);  opacity:1; }
  100% { transform: scale(1)  rotate(0deg);   opacity:1; }
}
@keyframes floatStar {
  0%,100% { transform: translateY(0px) rotate(0deg); opacity:0.7; }
  50%      { transform: translateY(-6px) rotate(15deg); opacity:1; }
}
.shaking   { animation: taskShake 0.50s cubic-bezier(.36,.07,.19,.97) both; }
.check-pop { animation: checkPop  0.28s ease forwards; }
::-webkit-scrollbar { display:none; }
* { scrollbar-width:none; }
`;

// ─── Backgrounds ──────────────────────────────────────────────────────────────

const MESH_DARK = [
  "radial-gradient(ellipse 70% 60% at  8% 18%, rgba(139,92,246,.72)  0%, transparent 55%)",
  "radial-gradient(ellipse 60% 55% at 88% 12%, rgba(59,130,246,.62)  0%, transparent 52%)",
  "radial-gradient(ellipse 55% 60% at 55% 88%, rgba(236,72,153,.52)  0%, transparent 50%)",
  "radial-gradient(ellipse 48% 48% at 92% 78%, rgba(20,184,166,.48)  0%, transparent 46%)",
  "radial-gradient(ellipse 42% 42% at  5% 90%, rgba(251,146,60,.44)  0%, transparent 42%)",
  "#060010",
].join(",");

const MESH_LIGHT = [
  "radial-gradient(ellipse 70% 60% at  8% 18%, rgba(186,148,255,.50) 0%, transparent 55%)",
  "radial-gradient(ellipse 60% 55% at 88% 12%, rgba(120,185,255,.46) 0%, transparent 52%)",
  "radial-gradient(ellipse 55% 60% at 55% 88%, rgba(255,160,210,.42) 0%, transparent 50%)",
  "radial-gradient(ellipse 48% 48% at 92% 78%, rgba(100,230,210,.38) 0%, transparent 46%)",
  "radial-gradient(ellipse 42% 42% at  5% 90%, rgba(255,210,120,.36) 0%, transparent 42%)",
  "#EBE8FF",
].join(",");

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority  = "H" | "M" | "L";
type ThemeMode = "light" | "dark" | "system";

interface Task {
  id: string; description: string; project: string; tags: string[];
  priority: Priority; dueDate: string | null;
  completed: boolean; completedAt: string | null; createdAt: string;
}
interface DoneInfo { description: string; todayCount: number; totalDone: number; }

// ─── Seed data ────────────────────────────────────────────────────────────────

const _today = new Date();
const fmt = (d: Date)   => d.toISOString().split("T")[0];
const ago = (n: number) => { const d = new Date(_today); d.setDate(d.getDate()-n); return fmt(d); };
const fwd = (n: number) => { const d = new Date(_today); d.setDate(d.getDate()+n); return fmt(d); };

const SEED: Task[] = [
  {id:"1",  description:"完善 Q3 设计令牌审计",            project:"Design System", tags:["design","tokens"], priority:"H", dueDate:fwd(1),  completed:false, completedAt:null, createdAt:ago(3)},
  {id:"2",  description:"Review component library PR #247", project:"Design System", tags:["review"],          priority:"M", dueDate:fwd(2),  completed:false, completedAt:null, createdAt:ago(2)},
  {id:"3",  description:"Auth 接口迁移至 v2",               project:"API Migration", tags:["backend","auth"],  priority:"H", dueDate:fwd(0),  completed:false, completedAt:null, createdAt:ago(5)},
  {id:"4",  description:"编写 /users 接口 OpenAPI 文档",    project:"API Migration", tags:["docs"],            priority:"M", dueDate:fwd(4),  completed:false, completedAt:null, createdAt:ago(1)},
  {id:"5",  description:"更新官网首屏文案",                 project:"Marketing",     tags:["copy"],            priority:"M", dueDate:fwd(3),  completed:false, completedAt:null, createdAt:ago(4)},
  {id:"6",  description:"A/B 测试 CTA 按钮配色",            project:"Marketing",     tags:["experiment","ux"], priority:"L", dueDate:fwd(7),  completed:false, completedAt:null, createdAt:ago(1)},
  {id:"7",  description:"准备 OKR 汇报 PPT",                project:"Q3 Planning",   tags:["okr"],             priority:"H", dueDate:fwd(0),  completed:false, completedAt:null, createdAt:ago(2)},
  {id:"8",  description:"制定 Q4 招聘目标",                 project:"Q3 Planning",   tags:["hiring"],          priority:"M", dueDate:fwd(5),  completed:false, completedAt:null, createdAt:ago(1)},
  {id:"9",  description:"下线 /v1/orders 旧接口",            project:"API Migration", tags:["backend"],         priority:"L", dueDate:fwd(10), completed:false, completedAt:null, createdAt:ago(3)},
  {id:"10", description:"用户引导流程线框图",                project:"Design System", tags:["ux","design"],     priority:"M", dueDate:fwd(6),  completed:false, completedAt:null, createdAt:ago(2)},
  {id:"h1", description:"上线暗色模式",    project:"Design System", tags:[], priority:"H", dueDate:null, completed:true, completedAt:ago(0),  createdAt:ago(2)},
  {id:"h2", description:"移除 jQuery",     project:"Marketing",     tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(0),  createdAt:ago(3)},
  {id:"h3", description:"整理 Q2 复盘",    project:"Q3 Planning",   tags:[], priority:"L", dueDate:null, completed:true, completedAt:ago(1),  createdAt:ago(3)},
  {id:"h4", description:"API v2 预发环境", project:"API Migration", tags:[], priority:"H", dueDate:null, completed:true, completedAt:ago(1),  createdAt:ago(3)},
  {id:"h5", description:"更新 sitemap",    project:"Marketing",     tags:[], priority:"L", dueDate:null, completed:true, completedAt:ago(2),  createdAt:ago(3)},
  {id:"h6", description:"定价页文案",       project:"Marketing",     tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(3),  createdAt:ago(5)},
  {id:"h7", description:"组件库文档",       project:"Design System", tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(3),  createdAt:ago(5)},
  {id:"h8", description:"年度复盘报告",     project:"Q3 Planning",   tags:[], priority:"H", dueDate:null, completed:true, completedAt:ago(5),  createdAt:ago(7)},
  {id:"h9", description:"移动端性能优化",   project:"API Migration", tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(7),  createdAt:ago(9)},
  {id:"h10",description:"CI/CD 流水线",    project:"API Migration", tags:[], priority:"H", dueDate:null, completed:true, completedAt:ago(7),  createdAt:ago(9)},
  {id:"h11",description:"设计规范文档",     project:"Design System", tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(9),  createdAt:ago(11)},
  {id:"h12",description:"用户访谈报告",     project:"Q3 Planning",   tags:[], priority:"H", dueDate:null, completed:true, completedAt:ago(12), createdAt:ago(14)},
  {id:"h13",description:"数据库索引优化",   project:"API Migration", tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(15), createdAt:ago(17)},
  {id:"h14",description:"新版本公告",       project:"Marketing",     tags:[], priority:"L", dueDate:null, completed:true, completedAt:ago(18), createdAt:ago(20)},
  {id:"h15",description:"历史 Sprint 归档", project:"Q3 Planning",   tags:[], priority:"L", dueDate:null, completed:true, completedAt:ago(20), createdAt:ago(22)},
  {id:"h16",description:"安全审计报告",     project:"API Migration", tags:[], priority:"H", dueDate:null, completed:true, completedAt:ago(22), createdAt:ago(24)},
  {id:"h17",description:"品牌视觉更新",     project:"Design System", tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(25), createdAt:ago(27)},
  {id:"h18",description:"客户成功案例",     project:"Marketing",     tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(27), createdAt:ago(29)},
  {id:"h19",description:"权限系统重构",     project:"API Migration", tags:[], priority:"H", dueDate:null, completed:true, completedAt:ago(29), createdAt:ago(31)},
  {id:"h20",description:"监控报警配置",     project:"API Migration", tags:[], priority:"M", dueDate:null, completed:true, completedAt:ago(32), createdAt:ago(34)},
];

const INIT_PROJECTS = ["Design System","API Migration","Marketing","Q3 Planning"];
const INIT_TAGS = ["design","tokens","review","components","backend","auth","docs","copy","ux","okr","hiring","planning","security","seo","content","experiment","storybook","devops"];

// ─── Card styles ──────────────────────────────────────────────────────────────

const CARD_STYLES: Record<string,{gradient:string;glow:string;accent:string}> = {
  "Design System": { gradient:"linear-gradient(135deg,rgba(120,80,200,0.60) 0%,rgba(85,55,170,0.66) 100%)", glow:"rgba(120,80,200,0.20)", accent:"#C4B5FD" },
  "API Migration": { gradient:"linear-gradient(135deg,rgba(38,140,200,0.58) 0%,rgba(18,115,185,0.64) 100%)", glow:"rgba(38,140,200,0.18)", accent:"#7DD3FC" },
  "Marketing":     { gradient:"linear-gradient(135deg,rgba(205,75,145,0.58) 0%,rgba(180,50,105,0.64) 100%)", glow:"rgba(205,75,145,0.18)", accent:"#F9A8D4" },
  "Q3 Planning":   { gradient:"linear-gradient(135deg,rgba(200,135,35,0.60) 0%,rgba(195,85,45,0.66) 100%)",  glow:"rgba(200,135,35,0.20)", accent:"#FCD34D" },
};
const FALLBACK = [
  {gradient:"linear-gradient(135deg,rgba(95,90,200,0.58) 0%,rgba(70,65,175,0.64) 100%)",  glow:"rgba(95,90,200,0.18)",  accent:"#A5B4FC"},
  {gradient:"linear-gradient(135deg,rgba(28,170,120,0.58) 0%,rgba(15,145,100,0.64) 100%)", glow:"rgba(28,170,120,0.18)", accent:"#6EE7B7"},
  {gradient:"linear-gradient(135deg,rgba(220,90,40,0.58) 0%,rgba(195,65,30,0.64) 100%)",   glow:"rgba(220,90,40,0.18)",  accent:"#FCA5A5"},
];
function getCardStyle(task:Task,i:number){return CARD_STYLES[task.project]??FALLBACK[i%FALLBACK.length];}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newId(){return Math.random().toString(36).slice(2,10);}

function formatDue(d:string|null):string|null{
  if(!d)return null;
  const date=new Date(d+"T00:00:00"), now=new Date(); now.setHours(0,0,0,0);
  const diff=Math.round((date.getTime()-now.getTime())/86400000);
  if(diff===0)return"今天"; if(diff===1)return"明天";
  if(diff<0)return`逾期${Math.abs(diff)}天`; if(diff<=7)return`${diff}天后`;
  return date.toLocaleDateString("zh-CN",{month:"numeric",day:"numeric"});
}
function isOverdue(d:string|null){
  if(!d)return false;
  return new Date(d+"T00:00:00")<new Date(new Date().setHours(0,0,0,0));
}
function playSound(type:"complete"|"add",on:boolean){
  if(!on)return;
  try{
    const ctx=new AudioContext(),g=ctx.createGain(),o=ctx.createOscillator();
    o.connect(g);g.connect(ctx.destination);
    if(type==="complete"){
      o.frequency.setValueAtTime(523,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(1047,ctx.currentTime+0.18);
      g.gain.setValueAtTime(0.13,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.32);
      o.start();o.stop(ctx.currentTime+0.32);
    }else{
      o.frequency.setValueAtTime(660,ctx.currentTime);
      g.gain.setValueAtTime(0.09,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.10);
      o.start();o.stop(ctx.currentTime+0.10);
    }
  }catch(_){}
}

// ─── Heatmap ── with day numbers, theme-aware ─────────────────────────────────

interface HeatmapProps { tasks: Task[]; isDark: boolean; }

function Heatmap({tasks,isDark}:HeatmapProps){
  const countMap:Record<string,number>={};
  tasks.forEach(t=>{if(t.completed&&t.completedAt)countMap[t.completedAt]=(countMap[t.completedAt]??0)+1;});

  const todayStr=fmt(_today);
  const cells=Array.from({length:35},(_,i)=>{
    const d=new Date(_today);d.setDate(d.getDate()-(34-i));
    const ds=fmt(d);
    return{date:ds,dayNum:d.getDate(),count:countMap[ds]??0,isToday:ds===todayStr};
  });
  const firstDow=new Date(cells[0].date+"T00:00:00").getDay();
  const todayCount=countMap[todayStr]??0;
  const total=tasks.filter(t=>t.completed).length;

  // Colors adapt to theme
  function cellBg(count:number){
    if(isDark){
      if(count===0)return"rgba(255,255,255,0.09)";
      if(count===1)return"rgba(74,222,128,0.55)";
      if(count===2)return"rgba(34,197,94,0.75)";
      if(count===3)return"rgba(22,163,74,0.88)";
      return"rgba(21,128,61,0.96)";
    }else{
      if(count===0)return"rgba(0,0,0,0.07)";
      if(count===1)return"rgba(34,197,94,0.55)";
      if(count===2)return"rgba(22,163,74,0.72)";
      if(count===3)return"rgba(21,128,61,0.85)";
      return"rgba(20,83,45,0.92)";
    }
  }
  function cellTxt(count:number){
    if(count>0)return isDark?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.96)";
    return isDark?"rgba(255,255,255,0.40)":"rgba(0,0,0,0.38)";
  }
  const txtPrimary  = isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const txtMuted    = isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  const txtSubtle   = isDark?"rgba(255,255,255,0.30)":"rgba(15,10,40,0.30)";
  const weekdayClr  = isDark?"rgba(255,255,255,0.36)":"rgba(15,10,40,0.38)";
  const todayRing   = isDark?"rgba(255,255,255,0.75)":"rgba(99,102,241,0.85)";

  const msg=todayCount===0?"今天还没开始，加油！":todayCount<=2?`完成 ${todayCount} 项，继续！`:todayCount<=5?`完成 ${todayCount} 项，状态很棒！`:`完成 ${todayCount} 项，今日之星！`;

  return(
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black tabular-nums" style={{lineHeight:1,color:txtPrimary}}>{todayCount}</span>
            <span className="text-sm font-medium mb-1.5" style={{color:txtMuted}}>今日完成</span>
          </div>
          <p className="text-xs mt-1" style={{color:txtSubtle}}>{msg}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black tabular-nums" style={{lineHeight:1,color:txtPrimary}}>{total}</div>
          <div className="text-[11px] mt-0.5" style={{color:txtMuted}}>累计完成</div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["日","一","二","三","四","五","六"].map(d=>(
          <div key={d} className="text-center text-[10px] font-bold" style={{color:weekdayClr}}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({length:firstDow}).map((_,i)=><div key={`p${i}`} className="aspect-square"/>)}
        {cells.map(cell=>(
          <motion.div key={cell.date} whileHover={{scale:1.12}}
            className="aspect-square rounded-xl flex items-center justify-center relative cursor-default select-none"
            style={{backgroundColor:cellBg(cell.count)}}
            title={`${cell.date}：完成 ${cell.count} 项`}>
            <span className="text-[13px] font-bold tabular-nums" style={{color:cellTxt(cell.count)}}>{cell.dayNum}</span>
            {cell.isToday&&(
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{outline:`2.5px solid ${todayRing}`,outlineOffset:"2px"}}/>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[9px]" style={{color:txtSubtle}}>少</span>
        {[0,1,2,3,4].map(v=>(
          <div key={v} className="w-3.5 h-3.5 rounded-[4px]" style={{backgroundColor:cellBg(v)}}/>
        ))}
        <span className="text-[9px]" style={{color:txtSubtle}}>多</span>
      </div>
    </div>
  );
}

// ─── Achievement Badge (custom, no emoji) ────────────────────────────────────

function AchievementBadge(){
  return(
    <div className="w-32 h-32 mx-auto relative">
      {/* SVG sunburst */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128" overflow="visible">
        {Array.from({length:16},(_,i)=>{
          const a=i*(Math.PI*2/16);
          const x1=64+Math.cos(a)*34, y1=64+Math.sin(a)*34;
          const x2=64+Math.cos(a)*50, y2=64+Math.sin(a)*50;
          return(
            <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.38)" strokeWidth="2.5" strokeLinecap="round"
              initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.06+i*0.025}}/>
          );
        })}
      </svg>

      {/* Central badge */}
      <motion.div
        initial={{scale:0,rotate:-18}} animate={{scale:1,rotate:0}}
        transition={{delay:0.12,type:"spring",stiffness:255,damping:17}}
        className="absolute inset-[16px] rounded-full flex flex-col items-center justify-center gap-0.5"
        style={{
          background:"linear-gradient(148deg,rgba(255,255,255,0.34) 0%,rgba(255,255,255,0.14) 100%)",
          backdropFilter:"blur(16px)",
          boxShadow:"0 8px 30px rgba(0,0,0,0.14), inset 0 1.5px 0 rgba(255,255,255,0.55), 0 0 0 2px rgba(255,255,255,0.28)",
        }}>
        <Trophy size={28} strokeWidth={1.8} className="text-white" style={{filter:"drop-shadow(0 2px 5px rgba(0,0,0,0.20))"}}/>
        <span className="text-[8px] font-black text-white/80 tracking-[0.16em] mt-0.5">DONE</span>
      </motion.div>

      {/* Pulse ring */}
      <motion.div
        animate={{scale:[1,1.1,1],opacity:[0.45,0.75,0.45]}}
        transition={{duration:2.4,repeat:Infinity,ease:"easeInOut"}}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{boxShadow:"0 0 0 3px rgba(255,255,255,0.38)"}}/>
    </div>
  );
}

// ─── Completion Modal ─────────────────────────────────────────────────────────

function CompletionModal({info,onClose}:{info:DoneInfo;onClose:()=>void}){
  const PCOLS=["#FFD700","#FF9F1C","#FF6B35","#FFBF69","#FFF59D","#FF8A65","#FFCC02","#F9A825"];
  const particles=Array.from({length:24},(_,i)=>{
    const angle=(i/24)*Math.PI*2+(Math.random()-0.5)*0.4;
    const dist=55+Math.random()*85;
    return{id:i,x:Math.cos(angle)*dist,y:Math.sin(angle)*dist,color:PCOLS[i%PCOLS.length],size:4+Math.random()*8};
  });
  const stars=Array.from({length:14},(_,i)=>({
    id:i, x:(Math.random()-0.5)*300, y:(Math.random()-0.5)*380,
    size:9+Math.random()*14, delay:Math.random()*0.8,
  }));

  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="absolute inset-0"
        style={{background:"rgba(0,0,0,0.70)",backdropFilter:"blur(14px)"}}
        onClick={onClose}/>

      <motion.div
        initial={{scale:0.48,opacity:0,y:60}}
        animate={{scale:1,opacity:1,y:0}}
        exit={{scale:0.82,opacity:0,y:20}}
        transition={{type:"spring",stiffness:265,damping:22}}
        className="relative z-10 w-80 rounded-3xl overflow-hidden"
        style={{
          background:"linear-gradient(158deg,#FFBA42 0%,#FF6B35 48%,#FF3D6B 100%)",
          boxShadow:"0 32px 90px rgba(255,100,53,0.52), 0 8px 32px rgba(0,0,0,0.35)",
        }}>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          style={{background:"rgba(0,0,0,0.18)"}}>
          <X size={13} className="text-white/80"/>
        </button>

        {/* Particle burst origin */}
        <div className="absolute left-1/2 top-[34%] pointer-events-none z-0">
          {particles.map(p=>(
            <motion.div key={p.id}
              initial={{x:0,y:0,opacity:1,scale:0}}
              animate={{x:p.x,y:p.y,opacity:0,scale:1}}
              transition={{duration:0.85,delay:0.18,ease:"easeOut"}}
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{width:p.size,height:p.size,backgroundColor:p.color}}/>
          ))}
        </div>

        {/* Floating sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {stars.map(s=>(
            <motion.span key={s.id}
              initial={{opacity:0,scale:0}}
              animate={{opacity:[0,0.95,0.55,0],scale:[0,1.2,0.9,0]}}
              transition={{duration:1.5,delay:0.22+s.delay,repeat:Infinity,repeatDelay:2.0}}
              className="absolute select-none"
              style={{left:`calc(50% + ${s.x}px)`,top:`calc(50% + ${s.y}px)`,fontSize:s.size,color:"rgba(255,255,200,0.88)"}}>
              ✦
            </motion.span>
          ))}
        </div>

        <div className="relative z-10 px-6 pt-8 pb-6 text-center">
          {/* Custom badge */}
          <AchievementBadge/>

          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.32}}>
            <h2 className="text-[26px] font-black text-white mt-5 mb-1" style={{textShadow:"0 2px 10px rgba(0,0,0,0.18)"}}>
              太棒了！
            </h2>
            <p className="text-white/60 text-sm mb-5 font-medium">任务已完成</p>

            {/* Task card */}
            <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 text-left"
              style={{background:"rgba(255,255,255,0.18)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.28)"}}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{background:"rgba(255,255,255,0.32)"}}>
                <Check size={13} strokeWidth={3} className="text-white"/>
              </div>
              <p className="text-white text-[13px] font-semibold leading-snug">{info.description}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3 mb-5">
              {[{v:info.todayCount,l:"今日完成"},{v:info.totalDone,l:"累计完成"}].map(({v,l})=>(
                <div key={l} className="flex-1 rounded-2xl py-3.5 text-center"
                  style={{background:"rgba(255,255,255,0.16)",backdropFilter:"blur(8px)"}}>
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.45,type:"spring",stiffness:280,damping:18}}
                    className="text-[28px] font-black text-white tabular-nums leading-none">{v}</motion.div>
                  <div className="text-white/55 text-[10px] font-semibold mt-1">{l}</div>
                </div>
              ))}
            </div>

            <button onClick={onClose}
              className="w-full py-4 rounded-2xl text-sm font-black transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
              style={{background:"rgba(255,255,255,0.95)",color:"#E8540A",boxShadow:"0 4px 22px rgba(0,0,0,0.14)"}}>
              <Zap size={15} fill="#E8540A" strokeWidth={0}/>
              继续加油
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ProjectPicker ────────────────────────────────────────────────────────────

interface ProjectPickerProps {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  onAdd: (v: string) => void;
  onDelete: (v: string) => void;
}

function ProjectPicker({value,options,onChange,onAdd,onDelete}:ProjectPickerProps){
  const [newVal,setNewVal]=useState("");
  function submit(){const v=newVal.trim();if(v&&!options.includes(v)){onAdd(v);}setNewVal("");}

  return(
    <div className="rounded-xl overflow-hidden" style={{background:"rgba(0,0,0,0.22)"}}>
      <div className="p-1.5 space-y-0.5 max-h-36 overflow-y-auto">
        <button onClick={()=>onChange("")}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!value?"bg-white text-gray-800":"text-white/55 hover:bg-white/10 hover:text-white/80"}`}>
          无项目
        </button>
        {options.map(opt=>(
          <div key={opt} className="flex items-center gap-1">
            <button onClick={()=>onChange(opt)}
              className={`flex-1 text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${value===opt?"bg-white text-gray-800":"text-white/70 hover:bg-white/10 hover:text-white/90"}`}>
              {value===opt&&<Check size={9} strokeWidth={3}/>}
              {opt}
            </button>
            <button onClick={()=>onDelete(opt)}
              className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-white/8 transition-colors shrink-0">
              <X size={10}/>
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 px-2 pb-2 pt-1 border-t border-white/10">
        <input value={newVal} onChange={e=>setNewVal(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")submit();}}
          placeholder="添加项目…"
          className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none py-1 px-1"/>
        <button onClick={submit} className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors">
          <Plus size={12}/>
        </button>
      </div>
    </div>
  );
}

// ─── TagPicker ────────────────────────────────────────────────────────────────

interface TagPickerProps {
  selected: string[];
  options: string[];
  onChange: (v: string[]) => void;
  onAdd: (v: string) => void;
  onDelete: (v: string) => void;
}

function TagPicker({selected,options,onChange,onAdd,onDelete}:TagPickerProps){
  const [newVal,setNewVal]=useState("");

  function toggle(tag:string){
    onChange(selected.includes(tag)?selected.filter(t=>t!==tag):[...selected,tag]);
  }
  function submit(){const v=newVal.trim();if(v&&!options.includes(v)){onAdd(v);onChange([...selected,v]);}setNewVal("");}

  return(
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
        {options.map(tag=>{
          const sel=selected.includes(tag);
          return(
            <div key={tag} className="flex items-center">
              <button onClick={()=>toggle(tag)}
                className={`text-[10px] px-2.5 py-1 rounded-l-full font-semibold transition-all ${sel?"bg-white text-gray-800":"bg-white/12 text-white/65 hover:bg-white/20 hover:text-white/90"}`}>
                {sel&&<Check size={8} className="inline mr-0.5" strokeWidth={3}/>}
                {tag}
              </button>
              <button onClick={()=>{onDelete(tag);onChange(selected.filter(t=>t!==tag));}}
                className={`text-[10px] px-1.5 py-1 rounded-r-full transition-all ${sel?"bg-white/80 text-gray-600 hover:bg-white":"bg-white/8 text-white/30 hover:bg-white/18 hover:text-red-400"}`}>
                <X size={8}/>
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1 rounded-xl overflow-hidden" style={{background:"rgba(255,255,255,0.10)"}}>
        <input value={newVal} onChange={e=>setNewVal(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")submit();}}
          placeholder="输入新标签，回车添加…"
          className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none py-1.5 px-3"/>
        <button onClick={submit} className="px-2.5 text-white/40 hover:text-white transition-colors">
          <Plus size={12}/>
        </button>
      </div>
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task:Task; index:number;
  onComplete:(id:string,desc:string)=>void;
  onUpdate:(id:string,d:Partial<Task>)=>void;
  onDelete:(id:string)=>void;
  soundEnabled:boolean;
  allProjects:string[]; allTags:string[];
  onAddProject:(v:string)=>void; onDeleteProject:(v:string)=>void;
  onAddTag:(v:string)=>void;     onDeleteTag:(v:string)=>void;
}

function TaskCard({task,index,onComplete,onUpdate,onDelete,soundEnabled,allProjects,allTags,onAddProject,onDeleteProject,onAddTag,onDeleteTag}:TaskCardProps){
  const style=getCardStyle(task,index);
  const [expanded, setExpanded] =useState(false);
  const [shaking,  setShaking]  =useState(false);
  const [checked,  setChecked]  =useState(false);
  const [removing, setRemoving] =useState(false);

  const [editProject,  setEditProject]  =useState(task.project);
  const [editTags,     setEditTags]     =useState<string[]>(task.tags);
  const [editPriority, setEditPriority] =useState<Priority>(task.priority);
  const [editDue,      setEditDue]      =useState(task.dueDate??"");

  function handleCheck(){
    if(shaking||removing)return;
    setShaking(true); playSound("complete",soundEnabled);
    setTimeout(()=>{
      setShaking(false);setChecked(true);
      setTimeout(()=>{setRemoving(true);setTimeout(()=>onComplete(task.id,task.description),330);},380);
    },520);
  }
  function saveDetails(){
    onUpdate(task.id,{project:editProject,tags:editTags,priority:editPriority,dueDate:editDue||null});
    setExpanded(false);
  }
  function handleDelete(){setRemoving(true);setTimeout(()=>onDelete(task.id),300);}

  const overdue=isOverdue(task.dueDate);
  const dueLabel=formatDue(task.dueDate);

  return(
    <motion.div layout
      initial={{opacity:0,y:14,scale:0.97}}
      animate={{opacity:removing?0:1,y:0,scale:removing?0.93:1,height:removing?"0":"auto"}}
      transition={{duration:0.30,ease:[0.16,1,0.3,1]}}
      className="overflow-hidden mb-2.5">
      <div className={`rounded-2xl overflow-hidden backdrop-blur-xl ${shaking?"shaking":""}`}
        style={{background:style.gradient,boxShadow:`0 5px 28px ${style.glow}, 0 1px 0 rgba(255,255,255,0.18) inset`,border:"1px solid rgba(255,255,255,0.15)"}}>

        {/* Main row */}
        <div className="flex items-center gap-3.5 px-4 py-3.5">
          <button onClick={handleCheck}
            className="shrink-0 w-6 h-6 rounded-full border-2 border-white/45 flex items-center justify-center transition-all duration-150 hover:border-white hover:bg-white/20 focus:outline-none"
            style={{backgroundColor:checked?"rgba(255,255,255,0.92)":undefined}}>
            {checked&&<Check size={12} strokeWidth={3.5} className="check-pop" style={{color:style.accent}}/>}
          </button>
          <span className={`flex-1 text-sm font-semibold text-white leading-snug ${checked?"line-through opacity-50":""}`}>
            {task.description}
          </span>
          {dueLabel&&(
            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{background:overdue?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.17)",color:"rgba(255,255,255,0.92)"}}>
              {dueLabel}
            </span>
          )}
          <div className="shrink-0 w-1.5 h-1.5 rounded-full"
            style={{backgroundColor:task.priority==="H"?"#FCA5A5":task.priority==="M"?"#FDE68A":"#BAE6FD"}}/>
          <button onClick={()=>setExpanded(e=>!e)}
            className="shrink-0 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/15 transition-colors">
            {expanded?<ChevronUp size={13}/>:<ChevronDown size={13}/>}
          </button>
        </div>

        {/* Expanded */}
        <AnimatePresence>
          {expanded&&(
            <motion.div
              initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
              transition={{duration:0.22,ease:[0.16,1,0.3,1]}} className="overflow-hidden">
              <div className="px-4 pb-4 pt-2 space-y-3.5"
                style={{background:"rgba(0,0,0,0.22)",backdropFilter:"blur(8px)"}}>

                {/* Priority */}
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">优先级</label>
                  <div className="flex gap-2">
                    {(["H","M","L"] as Priority[]).map(p=>(
                      <button key={p} onClick={()=>setEditPriority(p)}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${editPriority===p?"bg-white text-gray-800 shadow-md":"bg-white/12 text-white/75 hover:bg-white/20"}`}>
                        {p==="H"?"紧急":p==="M"?"普通":"低优"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due date */}
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Calendar size={8}/> 截止日期
                  </label>
                  <input type="date" value={editDue} onChange={e=>setEditDue(e.target.value)}
                    className="w-full rounded-xl px-3 py-1.5 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-white/30"
                    style={{background:"rgba(255,255,255,0.12)"}}/>
                </div>

                {/* Project picker */}
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <FolderOpen size={8}/> 项目
                  </label>
                  <ProjectPicker value={editProject} options={allProjects}
                    onChange={setEditProject}
                    onAdd={onAddProject} onDelete={onDeleteProject}/>
                </div>

                {/* Tag picker */}
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Tag size={8}/> 标签
                  </label>
                  <TagPicker selected={editTags} options={allTags}
                    onChange={setEditTags}
                    onAdd={onAddTag} onDelete={onDeleteTag}/>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button onClick={()=>{setExpanded(false);setEditProject(task.project);setEditPriority(task.priority);setEditDue(task.dueDate??"");setEditTags(task.tags);}}
                    className="flex-1 py-1.5 rounded-xl text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/12 transition-colors">
                    取消
                  </button>
                  <button onClick={saveDetails}
                    className="flex-1 py-1.5 rounded-xl bg-white text-gray-800 text-[11px] font-black shadow-md hover:bg-white/90 transition-opacity">
                    保存
                  </button>
                  <button onClick={handleDelete}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white/60 hover:text-white hover:bg-red-500/35 transition-colors">
                    删除
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── AddTask ──────────────────────────────────────────────────────────────────

function AddTask({onAdd,soundEnabled,isDark}:{onAdd:(d:string)=>void;soundEnabled:boolean;isDark:boolean}){
  const [active,setActive]=useState(false);
  const [value,setValue]=useState("");
  const ref=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(active)ref.current?.focus();},[active]);
  function submit(){if(!value.trim()){setActive(false);return;}onAdd(value.trim());playSound("add",soundEnabled);setValue("");setActive(false);}
  const glass=isDark?"bg-white/[0.07] border-white/[0.13]":"bg-white/60 border-white/75";
  const txt=isDark?"text-white":"text-gray-800";
  const ph=isDark?"placeholder-white/35":"placeholder-gray-400";
  const ic=isDark?"border-white/30":"border-indigo-300";
  const icHov=isDark?"group-hover:border-white/60 group-hover:bg-white/12":"group-hover:border-indigo-400 group-hover:bg-indigo-50";
  const icTxt=isDark?"text-white/40 group-hover:text-white/80":"text-gray-400 group-hover:text-indigo-500";
  const lbl=isDark?"text-white/45 group-hover:text-white/80":"text-gray-400 group-hover:text-gray-700";
  if(!active)return(
    <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}}
      onClick={()=>setActive(true)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-xl border transition-all group ${glass}`}>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${ic} ${icHov}`}>
        <Plus size={13} strokeWidth={2.5} className={`transition-colors ${icTxt}`}/>
      </div>
      <span className={`text-sm font-semibold transition-colors ${lbl}`}>添加任务</span>
    </motion.button>
  );
  return(
    <motion.div initial={{opacity:0,y:-6,scale:0.98}} animate={{opacity:1,y:0,scale:1}}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-xl border ${glass} ${isDark?"ring-1 ring-white/18":"ring-1 ring-indigo-300/50"}`}>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${ic}`}>
        <Plus size={12} className={isDark?"text-white/35":"text-indigo-400"}/>
      </div>
      <input ref={ref} value={value} onChange={e=>setValue(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter")submit();if(e.key==="Escape"){setActive(false);setValue("");}}}
        placeholder="输入任务名称，回车确认…"
        className={`flex-1 bg-transparent text-sm font-medium outline-none ${txt} ${ph}`}/>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={()=>{setActive(false);setValue("");}}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${isDark?"text-white/45 hover:bg-white/10 hover:text-white":"text-gray-500 hover:bg-gray-100"}`}>
          取消
        </button>
        <button onClick={submit}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${isDark?"bg-white/15 text-white hover:bg-white/25":"bg-indigo-500 text-white hover:bg-indigo-600"}`}>
          确认
        </button>
      </div>
    </motion.div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App(){
  const [tasks,      setTasks]      = useState<Task[]>(SEED);
  const [allProjects,setAllProjects]= useState<string[]>(INIT_PROJECTS);
  const [allTags,    setAllTags]    = useState<string[]>(INIT_TAGS);
  const [doneInfo,   setDoneInfo]   = useState<DoneInfo|null>(null);
  const [themeMode,  setThemeMode]  = useState<ThemeMode>(()=>{
    try{return(localStorage.getItem("twm-theme") as ThemeMode)??"dark";}catch{return"dark";}
  });
  const [soundEnabled,setSoundEnabled]=useState(()=>{
    try{return localStorage.getItem("twm-sound")!=="false";}catch{return true;}
  });
  const [isDark,setIsDark]=useState(true);

  useEffect(()=>{
    function apply(dark:boolean){document.documentElement.classList.toggle("dark",dark);setIsDark(dark);}
    if(themeMode==="system"){
      const mq=window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const h=(e:MediaQueryListEvent)=>apply(e.matches);
      mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);
    }else{apply(themeMode==="dark");}
  },[themeMode]);

  useEffect(()=>{try{localStorage.setItem("twm-theme",themeMode);}catch{}},[themeMode]);
  useEffect(()=>{try{localStorage.setItem("twm-sound",String(soundEnabled));}catch{}},[soundEnabled]);

  // Project/tag CRUD
  function addProject(name:string){if(!allProjects.includes(name))setAllProjects(p=>[...p,name]);}
  function deleteProject(name:string){
    setAllProjects(p=>p.filter(x=>x!==name));
    setTasks(p=>p.map(t=>t.project===name?{...t,project:""}:t));
  }
  function addTag(name:string){if(!allTags.includes(name))setAllTags(p=>[...p,name]);}
  function deleteTag(name:string){
    setAllTags(p=>p.filter(x=>x!==name));
    setTasks(p=>p.map(t=>({...t,tags:t.tags.filter(tag=>tag!==name)})));
  }

  // Task CRUD
  function addTask(desc:string){
    setTasks(prev=>[{
      id:newId(),description:desc,project:"",tags:[],priority:"M",
      dueDate:null,completed:false,completedAt:null,createdAt:fmt(new Date()),
    },...prev]);
  }
  function completeTask(id:string,desc:string){
    const todayStr=fmt(new Date());
    setTasks(prev=>{
      const next=prev.map(t=>t.id===id?{...t,completed:true,completedAt:todayStr}:t);
      const todayCount=next.filter(t=>t.completed&&t.completedAt===todayStr).length;
      const totalDone =next.filter(t=>t.completed).length;
      setTimeout(()=>setDoneInfo({description:desc,todayCount,totalDone}),60);
      return next;
    });
  }
  function updateTask(id:string,data:Partial<Task>){
    setTasks(prev=>prev.map(t=>t.id===id?{...t,...data}:t));
  }
  function deleteTask(id:string){setTasks(prev=>prev.filter(t=>t.id!==id));}

  const active=tasks.filter(t=>!t.completed);
  const themeNext:Record<ThemeMode,ThemeMode>={light:"dark",dark:"system",system:"light"};
  const ThemeIcon=themeMode==="light"?Sun:themeMode==="dark"?Moon:Monitor;

  // Theme-aware panel classes
  const panelCls=isDark
    ?"bg-white/[0.07] backdrop-blur-2xl border border-white/[0.13]"
    :"bg-white/55 backdrop-blur-2xl border border-white/80";
  const divider =isDark?"border-white/[0.10]":"border-black/[0.07]";
  const txtMain =isDark?"rgba(255,255,255,0.90)":"rgba(15,10,40,0.88)";
  const txtMuted=isDark?"rgba(255,255,255,0.42)":"rgba(15,10,40,0.46)";
  const ctrlBtn =isDark
    ?"text-white/40 hover:text-white hover:bg-white/10"
    :"text-gray-500 hover:text-gray-800 hover:bg-black/[0.06]";

  return(
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="size-full flex overflow-hidden"
        style={{background:isDark?MESH_DARK:MESH_LIGHT,fontFamily:"'Inter',system-ui,-apple-system,sans-serif"}}>
        <div className="flex gap-5 p-5 w-full h-full">

          {/* ── LEFT PANEL ── */}
          <div className={`flex flex-col rounded-3xl shadow-2xl overflow-hidden ${panelCls}`}
            style={{width:310,minWidth:270}}>

            {/* Header */}
            <div className={`flex items-center justify-between px-5 pt-5 pb-4 border-b ${divider} shrink-0`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",boxShadow:"0 4px 14px rgba(99,102,241,0.45)"}}>
                  <Sparkles size={15} className="text-white"/>
                </div>
                <div>
                  <div className="text-[13px] font-bold" style={{color:txtMain}}>taskwarrior</div>
                  <div className="text-[10px]" style={{color:txtMuted}}>motion</div>
                </div>
              </div>
              <div className="flex gap-0.5">
                <button onClick={()=>setSoundEnabled(s=>!s)} className={`p-2 rounded-xl transition-colors ${ctrlBtn}`}>
                  {soundEnabled?<Volume2 size={14}/>:<VolumeX size={14}/>}
                </button>
                <button onClick={()=>setThemeMode(themeNext[themeMode])} className={`p-2 rounded-xl transition-colors ${ctrlBtn}`}>
                  <ThemeIcon size={14}/>
                </button>
              </div>
            </div>

            {/* Heatmap + project bars */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              <Heatmap tasks={tasks} isDark={isDark}/>

              {/* Project progress */}
              <div className={`border-t pt-5 ${divider}`}>
                <div className="text-[10px] font-black uppercase tracking-widest mb-3.5" style={{color:txtMuted}}>项目进度</div>
                <div className="space-y-3">
                  {allProjects.map(p=>{
                    const cs=CARD_STYLES[p]??FALLBACK[0];
                    const tot =tasks.filter(t=>t.project===p).length;
                    const done=tasks.filter(t=>t.project===p&&t.completed).length;
                    const pct =tot>0?Math.round((done/tot)*100):0;
                    return(
                      <div key={p}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[11px] font-semibold" style={{color:isDark?"rgba(255,255,255,0.65)":"rgba(15,10,40,0.72)"}}>{p}</span>
                          <span className="text-[11px]" style={{color:txtMuted}}>{done}/{tot}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{background:isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)"}}>
                          <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
                            transition={{duration:0.9,ease:"easeOut"}}
                            className="h-full rounded-full" style={{background:cs.gradient}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className={`flex-1 flex flex-col rounded-3xl shadow-2xl overflow-hidden ${panelCls}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 pt-5 pb-4 border-b ${divider} shrink-0`}>
              <div>
                <h1 className="text-xl font-black" style={{color:txtMain}}>待办事项</h1>
                <p className="text-xs mt-0.5" style={{color:txtMuted}}>
                  {active.length>0?`${active.length} 项待完成`:"全部完成了"}
                </p>
              </div>
            </div>

            {/* Task list — AddTask at top */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
              <div className="mb-4">
                <AddTask onAdd={addTask} soundEnabled={soundEnabled} isDark={isDark}/>
              </div>

              <AnimatePresence>
                {active.length===0&&(
                  <motion.div initial={{opacity:0}} animate={{opacity:1}}
                    className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                      style={{background:isDark?"rgba(255,255,255,0.10)":"rgba(99,102,241,0.12)",backdropFilter:"blur(12px)",border:isDark?"1px solid rgba(255,255,255,0.14)":"1px solid rgba(99,102,241,0.18)"}}>
                      <Sparkles size={26} style={{color:isDark?"rgba(255,255,255,0.45)":"#818CF8"}}/>
                    </div>
                    <p className="text-base font-black mb-1" style={{color:txtMain}}>今日任务全部完成</p>
                    <p className="text-sm" style={{color:txtMuted}}>再添加一些，继续保持状态</p>
                  </motion.div>
                )}
                {active.map((task,i)=>(
                  <TaskCard key={task.id} task={task} index={i}
                    onComplete={completeTask} onUpdate={updateTask} onDelete={deleteTask}
                    soundEnabled={soundEnabled}
                    allProjects={allProjects} allTags={allTags}
                    onAddProject={addProject} onDeleteProject={deleteProject}
                    onAddTag={addTag} onDeleteTag={deleteTag}/>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Completion modal */}
        <AnimatePresence>
          {doneInfo&&<CompletionModal info={doneInfo} onClose={()=>setDoneInfo(null)}/>}
        </AnimatePresence>

        <Toaster position="top-center" toastOptions={{
          style:{
            background:isDark?"rgba(20,8,50,0.88)":"rgba(255,255,255,0.88)",
            backdropFilter:"blur(20px)",
            color:isDark?"#fff":"#1a1a2e",
            border:isDark?"1px solid rgba(255,255,255,0.14)":"1px solid rgba(0,0,0,0.08)",
            borderRadius:"14px",fontSize:"13px",
            fontFamily:"Inter,system-ui,sans-serif",
            boxShadow:"0 8px 40px rgba(0,0,0,0.28)",
          }
        }}/>
      </div>
    </>
  );
}
