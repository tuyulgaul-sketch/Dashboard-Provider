"use client";
import {useEffect,useMemo,useState} from "react";
import {Activity,AlertTriangle,ArrowRight,Building2,CheckCircle2,ChevronDown,Clock3,Database,FileCheck2,FileSpreadsheet,HeartPulse,Plus,Search,ShieldCheck,Stethoscope,Upload,UserRound} from "lucide-react";

type Role="provider"|"callcenter";
type CaseStatus="Waiting Admission"|"Treatment Active"|"Waiting Treatment Approval"|"Waiting Discharge"|"Closed";
type Member={
 policyNo:string;company:string;department:string;startDate:string;endDate:string;
 membershipNo:string;name:string;employeeName:string;employeeMembershipNo:string;dob:string;
 inception:string;expiry:string;gender:string;maritalStatus:string;relation:string;cardNo:string;
 product:string;planName:string;planCode:string;faskes1:string;
};
type CareCase={id:string;name:string;memberId:string;company:string;provider:string;status:CaseStatus;urgent:boolean;submittedAt:number;issue:string;visitType:string;urgencyReason?:string;policyNo?:string;planName?:string};
type UploadIssue={row:number;cardNo:string;name:string;missing:string[];duplicate:boolean};
type UploadReview={file:string;total:number;valid:number;incomplete:number;duplicate:number;unmappedFaskes:number;missingHeaders:string[];issues:UploadIssue[];staged:Member[]};

const PROVIDER="RS Hermina Kemayoran";
const urgencyOptions=["Kecelakaan","Kondisi akut / kegawatdaruratan","Di luar area Faskes 1","Faskes 1 tidak beroperasi","Emergency gigi - dokter gigi umum","Kondisi on-site di lokasi kerja","Lainnya"];
const requiredHeaders=["POLICYNO","COMPANY","DEPARTMENT","START DATE","END DATE","MEMBERSHIP NO","MEMBER NAME","EMPLOYEE NAME","EMPLOYEE MEMBERSHIP NO","DOB","INCEPTION","EXPIRY","GENDER","MARITAL STATUS","RELATIONSHIP","CARD NO","PRODUCT","PLAN NAME","PLAN CODE"];

function fmt(ms:number){const s=Math.max(0,Math.floor(ms/1000));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function niceDate(v:string){if(!v)return "-";const d=new Date(v+"T00:00:00");return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d)}
function isActiveMember(m:Member){
 const today=new Date();today.setHours(0,0,0,0);
 const start=m.inception||m.startDate,end=m.expiry||m.endDate;
 const s=start?new Date(start+"T00:00:00"):null,e=end?new Date(end+"T23:59:59"):null;
 return (!s||Number.isNaN(s.getTime())||today>=s)&&(!e||Number.isNaN(e.getTime())||today<=e);
}
function relationLabel(v:string){const r=v.toUpperCase();if(r==="EMPLOYEE")return "Pekerja";if(r==="SPOUSE")return "Pasangan";if(r==="CHILD")return "Anak";return v||"-"}

export default function Page(){
 const [role,setRole]=useState<Role>("provider"),[now,setNow]=useState(Date.now()),[cases,setCases]=useState<CareCase[]>([]),[members,setMembers]=useState<Member[]>([]);
 const [query,setQuery]=useState(""),[memberQuery,setMemberQuery]=useState(""),[statusFilter,setStatusFilter]=useState<CaseStatus|"Open"|null>(null),[hydrated,setHydrated]=useState(false);
 const [cardNo,setCardNo]=useState(""),[visitType,setVisitType]=useState("Rawat Jalan"),[found,setFound]=useState<Member|null>(null),[lookupDone,setLookupDone]=useState(false);
 const [urgent,setUrgent]=useState(false),[urgencyReason,setUrgencyReason]=useState(""),[urgencyText,setUrgencyText]=useState(""),[complaint,setComplaint]=useState("");
 const [view,setView]=useState("dashboard"),[notice,setNotice]=useState(""),[defaultFaskes,setDefaultFaskes]=useState("");
 const [uploadReview,setUploadReview]=useState<UploadReview|null>(null);

 useEffect(()=>{try{const m=localStorage.getItem("pertalife-managed-care-members-v2"),c=localStorage.getItem("pertalife-managed-care-cases");if(m)setMembers(JSON.parse(m));if(c)setCases(JSON.parse(c));}catch{}setHydrated(true);const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 useEffect(()=>{if(hydrated){localStorage.setItem("pertalife-managed-care-members-v2",JSON.stringify(members));localStorage.setItem("pertalife-managed-care-cases",JSON.stringify(cases));}},[members,cases,hydrated]);

 const waiting=useMemo(()=>cases.filter(c=>c.status.startsWith("Waiting")),[cases]);
 const filtered=cases.filter(c=>(c.name+" "+c.memberId+" "+c.company+" "+c.id).toLowerCase().includes(query.toLowerCase())).filter(c=>statusFilter==="Open"?c.status!=="Closed":statusFilter?c.status===statusFilter:true);
 const filteredMembers=members.filter(m=>(m.cardNo+" "+m.name+" "+m.membershipNo+" "+m.employeeName+" "+m.employeeMembershipNo+" "+m.company+" "+m.department+" "+m.policyNo).toLowerCase().includes(memberQuery.toLowerCase()));
 const active=!!found&&isActiveMember(found);
 const faskesMapped=!!found&&!!found.faskes1.trim();
 const faskesMatch=!!found&&found.faskes1.trim().toLowerCase()===PROVIDER.toLowerCase();
 const canSubmit=!!found&&active&&!!complaint.trim()&&(faskesMatch||(urgent&&!!urgencyReason&&(urgencyReason!=="Lainnya"||!!urgencyText.trim())));

 async function bulkUpload(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];if(!file)return;
  try{
   const XLSX=await import("xlsx");
   const wb=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:true});
   const ws=wb.Sheets[wb.SheetNames[0]];
   const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(ws,{defval:""});
   const headerRow=(XLSX.utils.sheet_to_json<unknown[]>(ws,{header:1,defval:""})[0]||[]).map(v=>String(v).trim().toUpperCase());
   const missingHeaders=requiredHeaders.filter(h=>!headerRow.includes(h));
   const asText=(v:unknown)=>String(v??"").trim();
   const asDate=(v:unknown)=>{
    if(!v)return "";
    if(v instanceof Date&&!Number.isNaN(v.getTime()))return v.toISOString().slice(0,10);
    if(typeof v==="number"){const p=XLSX.SSF.parse_date_code(v);if(p)return String(p.y).padStart(4,"0")+"-"+String(p.m).padStart(2,"0")+"-"+String(p.d).padStart(2,"0")}
    const s=asText(v);const m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);if(m)return m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");
    return s.slice(0,10);
   };
   const existing=new Set(members.map(m=>m.cardNo.toLowerCase())),batch=new Set<string>();
   let incomplete=0,duplicate=0,unmappedFaskes=0;
   const staged:Member[]=[],issues:UploadIssue[]=[];
   rows.forEach((r,index)=>{
    const missing=requiredHeaders.filter(h=>!asText(r[h]));
    const card=asText(r["CARD NO"]),key=card.toLowerCase();
    const isDuplicate=!!card&&(existing.has(key)||batch.has(key));
    if(card&&!isDuplicate)batch.add(key);
    if(missing.length)incomplete++;
    if(isDuplicate)duplicate++;
    if(missing.length||isDuplicate){
     issues.push({row:index+2,cardNo:card||"-",name:asText(r["MEMBER NAME"])||"-",missing,duplicate:isDuplicate});
     return;
    }
    const rowFaskes=asText(r["FASKES 1"]||r["FASKES1"])||defaultFaskes.trim();if(!rowFaskes)unmappedFaskes++;
    staged.push({
     policyNo:asText(r["POLICYNO"]),company:asText(r["COMPANY"]),department:asText(r["DEPARTMENT"]),startDate:asDate(r["START DATE"]),endDate:asDate(r["END DATE"]),
     membershipNo:asText(r["MEMBERSHIP NO"]),name:asText(r["MEMBER NAME"]),employeeName:asText(r["EMPLOYEE NAME"]),employeeMembershipNo:asText(r["EMPLOYEE MEMBERSHIP NO"]),dob:asDate(r["DOB"]),inception:asDate(r["INCEPTION"]),expiry:asDate(r["EXPIRY"]),
     gender:asText(r["GENDER"]),maritalStatus:asText(r["MARITAL STATUS"]),relation:asText(r["RELATIONSHIP"]),cardNo:card,product:asText(r["PRODUCT"]),planName:asText(r["PLAN NAME"]),planCode:asText(r["PLAN CODE"]),faskes1:rowFaskes
    });
   });
   setUploadReview({file:file.name,total:rows.length,valid:staged.length,incomplete,duplicate,unmappedFaskes,missingHeaders,issues,staged});
   setNotice("File berhasil dibaca. Review hasil validasi sebelum Confirm Upload.");
  }catch{
   setUploadReview(null);
   setNotice("File Excel tidak dapat dibaca. Pastikan struktur kolom sesuai master peserta Managed Care.");
  }
  e.target.value="";
 }
 function confirmUpload(){
  if(!uploadReview)return;
  const blocked=uploadReview.missingHeaders.length>0||uploadReview.incomplete>0||uploadReview.duplicate>0;
  if(blocked){setNotice("Upload diblokir. Perbaiki seluruh error pada file lalu pilih ulang file Excel.");return}
  setMembers(v=>[...uploadReview.staged,...v]);
  setNotice(uploadReview.valid+" peserta berhasil diupload ke Master Peserta.");
  setUploadReview(null);
 }
 function lookup(){const m=members.find(x=>x.cardNo.toLowerCase()===cardNo.trim().toLowerCase())||null;setFound(m);setLookupDone(true);setUrgent(false);setUrgencyReason("");setUrgencyText("");setComplaint("");}
 function submitAdmission(){if(!found||!canSubmit)return;const id="MC-"+new Date().toISOString().slice(2,10).replaceAll("-","")+"-"+String(cases.length+1).padStart(4,"0");setCases(v=>[{id,name:found.name,memberId:found.cardNo,company:found.company,provider:PROVIDER,status:"Waiting Admission",urgent,submittedAt:Date.now(),issue:complaint,visitType,urgencyReason:urgent?(urgencyReason==="Lainnya"?urgencyText:urgencyReason):undefined,policyNo:found.policyNo,planName:found.planName},...v]);setNotice("Admission berhasil dikirim ke Call Center PertaLife.");setFound(null);setCardNo("");setLookupDone(false);setComplaint("");setUrgent(false);}
 const decide=(id:string,status:CaseStatus)=>setCases(v=>v.map(c=>c.id===id?{...c,status,submittedAt:Date.now()}:c));

 return <div className="shell">
 <aside>
  <div className="brand"><div className="brandMark"><HeartPulse size={22}/></div><div><b>PertaLife</b><span>Managed Care</span></div></div>
  <nav>
   <button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}><Activity size={18}/>Dashboard</button>
   {role==="provider"?<>
    <button className={view==="registration"?"active":""} onClick={()=>setView("registration")}><UserRound size={18}/>Pendaftaran Peserta</button>
    <button className={view==="treatment"?"active":""} onClick={()=>setView("treatment")}><Stethoscope size={18}/>Treatment Request</button>
    <button className={view==="discharge"?"active":""} onClick={()=>setView("discharge")}><FileCheck2 size={18}/>Discharge</button>
   </>:<>
    <button className={view==="master"?"active":""} onClick={()=>setView("master")}><Database size={18}/>Master Peserta</button>
    <button className={view==="queue"?"active":""} onClick={()=>setView("queue")}><Clock3 size={18}/>Verification Queue</button>
    <button className={view==="eligibility"?"active":""} onClick={()=>setView("eligibility")}><ShieldCheck size={18}/>Eligibility Review</button>
    <button className={view==="audit"?"active":""} onClick={()=>setView("audit")}><FileCheck2 size={18}/>Audit Trail</button>
   </>}
  </nav>
  <div className="sideFoot"><span>Prototype Mode</span><small>Browser data · No production DB</small></div>
 </aside>
 <main>
  <header><div><h1>{role==="provider"?"Provider Dashboard":"Managed Care Command Center"}</h1><p>{role==="provider"?"Kelola pendaftaran, treatment, dan discharge peserta.":"Master peserta mengikuti struktur data Managed Care PertaLife."}</p></div><div className="switchWrap"><span className="switchLabel">Account Switcher</span><button className="account" onClick={()=>{setRole(role==="provider"?"callcenter":"provider");setView("dashboard");setNotice("")}}><div className="avatar">{role==="provider"?<Building2 size={18}/>:<ShieldCheck size={18}/>}</div><div><b>{role==="provider"?PROVIDER:"Call Center PertaLife"}</b><span>{role==="provider"?"Provider":"Verifier 24/7"}</span></div><ChevronDown size={17}/></button></div></header>
  {notice&&<div className="notice">{notice}</div>}

  {view==="dashboard"&&<section className="stats">
   {([["Waiting Admission","Waiting Admission",UserRound],["Waiting Treatment","Waiting Treatment Approval",Stethoscope],["Waiting Discharge","Waiting Discharge",FileCheck2],["Open Cases","Open",Activity]] as const).map(([label,key,Icon])=><button key={label} className={"card stat "+(statusFilter===key?"selected":"")} onClick={()=>setStatusFilter(statusFilter===key?null:key)}><div><span>{label}</span><strong>{key==="Open"?cases.filter(c=>c.status!=="Closed").length:cases.filter(c=>c.status===key).length}</strong></div><div className="icon"><Icon/></div></button>)}
  </section>}

  {role==="callcenter"&&(view==="dashboard"||view==="master"||view==="eligibility")&&<section className="card master">
   <div className="sectionHead"><div><h2>Master Peserta Managed Care</h2><p>Struktur upload: 19 kolom master peserta existing. Lookup utama Provider menggunakan CARD NO.</p></div><span className="countPill">{members.length} peserta</span></div>
   {(view==="dashboard"||view==="master")&&<>
    <div className="bulkBox"><div className="bulkIcon"><FileSpreadsheet/></div><div><b>Bulk Upload Data Peserta</b><span>POLICYNO, COMPANY, DEPARTMENT, START/END DATE, membership, data keluarga, CARD NO, PRODUCT, PLAN NAME, PLAN CODE.</span></div><div className="uploadControls"><label>Default Faskes 1 <input value={defaultFaskes} onChange={e=>setDefaultFaskes(e.target.value)} placeholder="Opsional, contoh RS Hermina Kemayoran"/></label><label className="uploadBtn"><Upload size={17}/>Pilih File Excel<input type="file" accept=".xlsx,.xls" onChange={bulkUpload}/></label></div></div>
    {uploadReview&&<div className="reviewPanel">
     <div className="reviewHead"><div><b>Review Upload: {uploadReview.file}</b><span>Data belum masuk Master Peserta sampai lo menekan Confirm Upload.</span></div><button className="reviewClear" onClick={()=>setUploadReview(null)}>Batalkan Review</button></div>
     <div className="reviewStats">
      <div><span>Total Row</span><strong>{uploadReview.total}</strong></div>
      <div className="okReview"><span>Lengkap</span><strong>{uploadReview.valid}</strong></div>
      <div className={uploadReview.incomplete?"badReview":""}><span>Tidak Lengkap</span><strong>{uploadReview.incomplete}</strong></div>
      <div className={uploadReview.duplicate?"badReview":""}><span>Duplicate Card</span><strong>{uploadReview.duplicate}</strong></div>
      <div className={uploadReview.unmappedFaskes?"warnReview":""}><span>Tanpa Faskes 1</span><strong>{uploadReview.unmappedFaskes}</strong></div>
     </div>
     {uploadReview.missingHeaders.length>0&&<div className="reviewBlocker"><AlertTriangle size={18}/><div><b>Header wajib belum lengkap</b><span>{uploadReview.missingHeaders.join(", ")}</span></div></div>}
     {uploadReview.issues.length>0&&<div className="issueWrap"><div className="issueTitle"><b>Data yang harus diperbaiki</b><span>Menampilkan maksimal 100 issue pertama dari file.</span></div><table><thead><tr><th>Row Excel</th><th>Card No</th><th>Member Name</th><th>Masalah</th></tr></thead><tbody>{uploadReview.issues.slice(0,100).map((x,i)=><tr key={i}><td><b>{x.row}</b></td><td>{x.cardNo}</td><td>{x.name}</td><td>{x.missing.length>0&&<span className="issueTag">Kosong: {x.missing.join(", ")}</span>}{x.duplicate&&<span className="issueTag duplicateTag">Duplicate CARD NO</span>}</td></tr>)}</tbody></table></div>}
     <div className="reviewActions"><span>{uploadReview.missingHeaders.length||uploadReview.incomplete||uploadReview.duplicate?<><AlertTriangle size={16}/> Upload dikunci sampai seluruh error diperbaiki.</>:<><CheckCircle2 size={16}/> Semua data lolos validasi dan siap diupload.</>}</span><button className="primary" disabled={uploadReview.missingHeaders.length>0||uploadReview.incomplete>0||uploadReview.duplicate>0||uploadReview.total===0} onClick={confirmUpload}><CheckCircle2 size={17}/>Confirm Upload {uploadReview.valid} Peserta</button></div>
    </div>}
   </>}
   <div className="masterToolbar"><div className="search"><Search size={16}/><input value={memberQuery} onChange={e=>setMemberQuery(e.target.value)} placeholder="Cari CARD NO, nama, membership, pekerja, perusahaan..."/></div><small>{filteredMembers.length} dari {members.length} peserta</small></div>
   <div className="miniTable"><table><thead><tr><th>Card / Membership</th><th>Peserta & Relasi</th><th>Pekerja</th><th>Perusahaan</th><th>Polis / Plan</th><th>Periode</th><th>Faskes 1</th><th>Status</th></tr></thead><tbody>
    {filteredMembers.length===0?<tr><td colSpan={8} className="emptyState"><b>Belum ada data peserta</b><small>Upload file Excel master peserta dari menu ini.</small></td></tr>:filteredMembers.map(m=><tr key={m.cardNo}><td><b>{m.cardNo}</b><small>{m.membershipNo}</small></td><td><b>{m.name}</b><small>{relationLabel(m.relation)} · {m.gender||"-"} · {m.maritalStatus||"-"}</small></td><td><b>{m.employeeName||"-"}</b><small>{m.employeeMembershipNo||"-"}</small></td><td><b>{m.company}</b><small>{m.department||"-"}</small></td><td><b>{m.policyNo||"-"}</b><small>{m.product||"-"} · {m.planName||"-"} {m.planCode?"("+m.planCode+")":""}</small></td><td><b>{niceDate(m.inception||m.startDate)}</b><small>s.d. {niceDate(m.expiry||m.endDate)}</small></td><td><b>{m.faskes1||"Belum dimapping"}</b></td><td><span className={"statusDot "+(isActiveMember(m)?"ok":"no")}>{isActiveMember(m)?"Aktif":"Tidak Aktif"}</span></td></tr>)}
   </tbody></table></div>
  </section>}

  {role==="provider"&&(view==="dashboard"||view==="registration")&&<section className="card eligibility">
   <div><h2>Cek Eligibility Peserta</h2><p>Provider aktif: <b>{PROVIDER}</b>. Cari menggunakan <b>CARD NO</b> dari master peserta PertaLife.</p></div>
   <div className="eligGrid"><label>Card No<input value={cardNo} onChange={e=>setCardNo(e.target.value)} placeholder="Contoh CARD-DUMMY-000001"/></label><label>Jenis Kunjungan<select value={visitType} onChange={e=>setVisitType(e.target.value)}><option>Rawat Jalan</option><option>UGD / IGD</option><option>Emergency Gigi</option></select></label><button className="primary" onClick={lookup}><Search size={17}/>Cek Eligibility</button></div>
   {lookupDone&&!found&&<div className="result bad"><AlertTriangle/><div><b>Peserta tidak ditemukan</b><span>Pastikan CARD NO sudah masuk melalui bulk upload PertaLife.</span></div></div>}
   {found&&<div className="eligResult">
    <div className="resultTop"><div><span className={"statusDot "+(active?"ok":"no")}>{active?"COVERAGE AKTIF":"COVERAGE TIDAK AKTIF"}</span><h3>{found.name}</h3><p>{found.cardNo} · {found.membershipNo}</p></div><div className={"matchBox "+(faskesMatch?"match":"mismatch")}><b>{!faskesMapped?"Faskes 1 Belum Dimapping":faskesMatch?"Faskes 1 Sesuai":"Faskes 1 Tidak Sesuai"}</b><span>{found.faskes1||"Mapping diperlukan oleh PertaLife"}</span></div></div>
    <div className="detailGrid detailGridWide">
     <div><span>Perusahaan</span><b>{found.company||"-"}</b></div><div><span>Department</span><b>{found.department||"-"}</b></div><div><span>Relationship</span><b>{relationLabel(found.relation)}</b></div>
     <div><span>Employee</span><b>{found.employeeName||"-"}</b></div><div><span>Employee Membership</span><b>{found.employeeMembershipNo||"-"}</b></div><div><span>DOB</span><b>{niceDate(found.dob)}</b></div>
     <div><span>Gender / Marital</span><b>{found.gender||"-"} / {found.maritalStatus||"-"}</b></div><div><span>Policy No</span><b>{found.policyNo||"-"}</b></div><div><span>Product</span><b>{found.product||"-"}</b></div>
     <div><span>Plan</span><b>{found.planName||"-"} {found.planCode?"("+found.planCode+")":""}</b></div><div><span>Coverage</span><b>{niceDate(found.inception||found.startDate)} - {niceDate(found.expiry||found.endDate)}</b></div><div><span>Card No</span><b>{found.cardNo}</b></div>
    </div>
    {!faskesMatch&&active&&<div className="override"><label className="check"><input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)}/>Override sebagai Urgent</label>{urgent&&<><label>Alasan Urgent<select value={urgencyReason} onChange={e=>setUrgencyReason(e.target.value)}><option value="">Pilih alasan</option>{urgencyOptions.map(x=><option key={x}>{x}</option>)}</select></label>{urgencyReason==="Lainnya"&&<label>Penjelasan<input value={urgencyText} onChange={e=>setUrgencyText(e.target.value)} placeholder="Jelaskan alasan urgency"/></label>}</>}</div>}
    <div className="admissionBox"><label>Keluhan / Indikasi *<textarea value={complaint} onChange={e=>setComplaint(e.target.value)} placeholder="Jelaskan keluhan utama peserta"/></label><button className="primary" disabled={!canSubmit} onClick={submitAdmission}>Submit Admission <ArrowRight size={17}/></button>{!active&&<small>Coverage peserta sedang tidak aktif berdasarkan periode INCEPTION/EXPIRY atau START/END DATE.</small>}{active&&!faskesMatch&&!urgent&&<small>{faskesMapped?"Submit terkunci karena Faskes 1 tidak sesuai.":"Submit normal terkunci karena Faskes 1 belum dimapping."} Aktifkan Urgent untuk meminta override.</small>}</div>
   </div>}
  </section>}

  {(view==="dashboard"||view==="queue"||view==="treatment"||view==="discharge"||view==="audit")&&<section className="card queue">
   <div className="sectionHead"><div><h2>{role==="provider"?"Case Peserta":"Real-time Verification Queue"}</h2><p>{role==="provider"?"Pantau status verifikasi setiap case yang disubmit.":"Semua admission tetap harus diverifikasi PertaLife."}</p></div><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari case, nama, CARD NO..."/></div></div>
   <div className="tableWrap"><table><thead><tr><th>Case</th><th>Peserta</th><th>Provider / Perusahaan</th><th>Polis / Plan</th><th>Status</th><th>SLA</th>{role==="callcenter"&&<th>Aksi</th>}</tr></thead><tbody>
    {filtered.length===0?<tr><td colSpan={role==="callcenter"?7:6} className="emptyState"><b>{cases.length===0?"Belum ada case":"Tidak ada case pada filter ini"}</b><small>{cases.length===0?"Case akan muncul setelah Provider submit admission.":"Klik card aktif lagi untuk menghapus filter."}</small></td></tr>:filtered.map(c=><tr key={c.id}><td><b>{c.id}</b><small>{c.issue}</small></td><td><b>{c.name}</b><small>{c.memberId}</small></td><td><b>{c.provider}</b><small>{c.company}</small></td><td><b>{c.policyNo||"-"}</b><small>{c.planName||"-"}</small></td><td><span className={"badge "+(c.urgent?"urgent":"")}>{c.urgent&&<AlertTriangle size={13}/>} {c.status}</span>{c.urgencyReason&&<small>Urgent: {c.urgencyReason}</small>}</td><td><span className="sla"><Clock3 size={14}/>{fmt(now-c.submittedAt)}</span></td>{role==="callcenter"&&<td>{c.status==="Waiting Admission"?<div className="actions"><button className="approve" onClick={()=>decide(c.id,"Treatment Active")}><CheckCircle2 size={15}/>Approve</button><button>Need Confirmation</button><button>Reject</button></div>:<span className="muted">No action</span>}</td>}</tr>)}
   </tbody></table></div>
  </section>}
  {role==="callcenter"&&(view==="dashboard"||view==="queue")&&<section className="hint"><ShieldCheck/><div><b>Semua case tetap memerlukan verifikasi PertaLife.</b><span>Eligibility hanya membantu review; tidak ada auto-approval.</span></div><b>{waiting.length} waiting</b></section>}
 </main>
 </div>
}
