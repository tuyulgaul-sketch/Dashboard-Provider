"use client";
import {useEffect,useMemo,useState} from "react";
import {Activity,Building2,CheckCircle2,ChevronDown,Clock3,FileCheck2,HeartPulse,Search,ShieldCheck,Stethoscope,UserRound,AlertTriangle} from "lucide-react";

type Role="provider"|"callcenter";
type CaseStatus="Waiting Admission"|"Treatment Active"|"Waiting Treatment Approval"|"Waiting Discharge"|"Closed";
type CareCase={id:string,name:string,memberId:string,company:string,provider:string,status:CaseStatus,urgent:boolean,submittedAt:number,issue:string};

const seed:CareCase[]=[];\n\nfunction fmt(ms:number){const s=Math.max(0,Math.floor(ms/1000));const m=Math.floor(s/60);const sec=s%60;return String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0")}

export default function Page(){
 const [role,setRole]=useState<Role>("provider");
 const [now,setNow]=useState(Date.now());
 const [cases,setCases]=useState<CareCase[]>(seed);
 const [query,setQuery]=useState("");\n const [statusFilter,setStatusFilter]=useState<CaseStatus|"Open"|null>(null);\n const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{\n   try{const saved=localStorage.getItem("pertalife-managed-care-cases");if(saved)setCases(JSON.parse(saved));}catch{}\n   setHydrated(true);\n   const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)\n },[]);\n useEffect(()=>{if(hydrated)localStorage.setItem("pertalife-managed-care-cases",JSON.stringify(cases))},[cases,hydrated]);
 const waiting=useMemo(()=>cases.filter(c=>c.status.startsWith("Waiting")), [cases]);
 const filtered=cases.filter(c=>(c.name+" "+c.memberId+" "+c.company+" "+c.id).toLowerCase().includes(query.toLowerCase())).filter(c=>statusFilter==="Open"?c.status!=="Closed":statusFilter?c.status===statusFilter:true);
 const decide=(id:string,status:CaseStatus)=>setCases(v=>v.map(c=>c.id===id?{...c,status,submittedAt:Date.now()}:c));

 return <div className="shell">
  <aside>
   <div className="brand"><div className="brandMark"><HeartPulse size={22}/></div><div><b>PertaLife</b><span>Managed Care</span></div></div>
   <nav>
    <a className="active"><Activity size={18}/>Dashboard</a>
    {role==="provider"?<>
      <a><UserRound size={18}/>Pendaftaran Peserta</a>
      <a><Stethoscope size={18}/>Treatment Request</a>
      <a><FileCheck2 size={18}/>Discharge</a>
    </>:<>
      <a><Clock3 size={18}/>Verification Queue</a>
      <a><ShieldCheck size={18}/>Eligibility Review</a>
      <a><FileCheck2 size={18}/>Audit Trail</a>
    </>}
   </nav>
   <div className="sideFoot"><span>Prototype Mode</span><small>Browser data · No production DB</small></div>
  </aside>
  <main>
   <header>
    <div><h1>{role==="provider"?"Provider Dashboard":"Managed Care Command Center"}</h1><p>{role==="provider"?"Kelola pendaftaran, treatment, dan discharge peserta.":"Verifikasi seluruh case provider secara real-time 24/7."}</p></div>
    <div className="switchWrap">
      <span className="switchLabel">Account Switcher</span>
      <button className="account" onClick={()=>setRole(role==="provider"?"callcenter":"provider")}>
        <div className="avatar">{role==="provider"?<Building2 size={18}/>:<ShieldCheck size={18}/>}</div>
        <div><b>{role==="provider"?"RS Hermina Kemayoran":"Call Center PertaLife"}</b><span>{role==="provider"?"Provider":"Verifier 24/7"}</span></div>
        <ChevronDown size={17}/>
      </button>
    </div>
   </header>

   <section className="stats">
    <button className={"card stat "+(statusFilter==="Waiting Admission"?"selected":"")} onClick={()=>setStatusFilter(statusFilter==="Waiting Admission"?null:"Waiting Admission")}><div><span>Waiting Admission</span><strong>{cases.filter(c=>c.status==="Waiting Admission").length}</strong></div><div className="icon"><UserRound/></div></button>\n    <button className={"card stat "+(statusFilter==="Waiting Treatment Approval"?"selected":"")} onClick={()=>setStatusFilter(statusFilter==="Waiting Treatment Approval"?null:"Waiting Treatment Approval")}><div><span>Waiting Treatment</span><strong>{cases.filter(c=>c.status==="Waiting Treatment Approval").length}</strong></div><div className="icon"><Stethoscope/></div></button>\n    <button className={"card stat "+(statusFilter==="Waiting Discharge"?"selected":"")} onClick={()=>setStatusFilter(statusFilter==="Waiting Discharge"?null:"Waiting Discharge")}><div><span>Waiting Discharge</span><strong>{cases.filter(c=>c.status==="Waiting Discharge").length}</strong></div><div className="icon"><FileCheck2/></div></button>\n    <button className={"card stat "+(statusFilter==="Open"?"selected":"")} onClick={()=>setStatusFilter(statusFilter==="Open"?null:"Open")}><div><span>Open Cases</span><strong>{cases.filter(c=>c.status!=="Closed").length}</strong></div><div className="icon"><Activity/></div></button>\n   </section>

   {role==="provider"&&<section className="card eligibility">
      <div><h2>Cek Eligibility Peserta</h2><p>Validasi status aktif, FKTP/Faskes 1, dan kebutuhan urgency sebelum submit.</p></div>
      <div className="eligGrid">
        <label>Member ID<input placeholder="Contoh: PL-88201921"/></label>
        <label>Jenis Kunjungan<select><option>Rawat Jalan</option><option>UGD / IGD</option><option>Emergency Gigi</option></select></label>
        <button className="primary"><Search size={17}/>Cek Eligibility</button>
      </div>
   </section>}

   <section className="card queue">
    <div className="sectionHead">
      <div><h2>{role==="provider"?"Case Peserta Hari Ini":"Real-time Verification Queue"}</h2><p>{role==="provider"?"Pantau status verifikasi setiap case.":"Prioritaskan urgency, treatment berjalan, dan pasien yang menunggu discharge."}</p></div>
      <div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari case, nama, Member ID..."/></div>
    </div>
    <div className="tableWrap"><table>
      <thead><tr><th>Case</th><th>Peserta</th><th>Provider / Perusahaan</th><th>Status</th><th>SLA</th>{role==="callcenter"&&<th>Aksi</th>}</tr></thead>
      <tbody>
      {filtered.length===0?<tr><td colSpan={role==="callcenter"?6:5} className="emptyState"><b>{cases.length===0?"Belum ada case":"Tidak ada case pada filter ini"}</b><small>{cases.length===0?"Data akan muncul setelah lo membuat case dari alur Provider.":"Klik card aktif lagi untuk menghapus filter."}</small></td></tr>:filtered.map(c=><tr key={c.id}>
        <td><b>{c.id}</b><small>{c.issue}</small></td>
        <td><b>{c.name}</b><small>{c.memberId}</small></td>
        <td><b>{c.provider}</b><small>{c.company}</small></td>
        <td><span className={"badge "+(c.urgent?"urgent":"")}>{c.urgent&&<AlertTriangle size={13}/>} {c.status}</span></td>
        <td><span className={(now-c.submittedAt)>5*60*1000?"sla late":"sla"}><Clock3 size={14}/>{fmt(now-c.submittedAt)}</span></td>
        {role==="callcenter"&&<td>
          {c.status.startsWith("Waiting")?<div className="actions">
            <button className="approve" onClick={()=>decide(c.id,c.status==="Waiting Admission"?"Treatment Active":c.status==="Waiting Discharge"?"Closed":"Treatment Active")}><CheckCircle2 size={15}/>Approve</button>
            <button>Need Info</button>
          </div>:<span className="muted">No action</span>}
        </td>}
      </tr>)}
      </tbody>
    </table></div>
   </section>

   {role==="callcenter"&&<section className="hint"><ShieldCheck/><div><b>Semua case tetap memerlukan verifikasi PertaLife.</b><span>Hasil eligibility system hanya membantu review dan tidak melakukan auto-approval.</span></div><b>{waiting.length} waiting</b></section>}
  </main>
 </div>
}