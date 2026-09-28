"use client";
import {useEffect,useMemo,useState} from "react";
import {Activity,Building2,CheckCircle2,ChevronDown,Clock3,FileCheck2,HeartPulse,Search,ShieldCheck,Stethoscope,UserRound,AlertTriangle,Plus,Database,ArrowRight} from "lucide-react";

type Role="provider"|"callcenter";
type CaseStatus="Waiting Admission"|"Treatment Active"|"Waiting Treatment Approval"|"Waiting Discharge"|"Closed";
type Member={cardNo:string;name:string;dob:string;gender:string;company:string;policyNo:string;plan:string;relation:string;active:boolean;faskes1:string;providerCategory:string;roomClass:string;annualLimit:number;remainingLimit:number};
type CareCase={id:string;name:string;memberId:string;company:string;provider:string;status:CaseStatus;urgent:boolean;submittedAt:number;issue:string;visitType:string;urgencyReason?:string};

const PROVIDER="RS Hermina Kemayoran";
const urgencyOptions=["Kecelakaan","Kondisi akut / kegawatdaruratan","Di luar area Faskes 1","Faskes 1 tidak beroperasi","Emergency gigi - dokter gigi umum","Kondisi on-site di lokasi kerja","Lainnya"];
function fmt(ms:number){const s=Math.max(0,Math.floor(ms/1000));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function money(v:number){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v||0)}

export default function Page(){
 const [role,setRole]=useState<Role>("provider"),[now,setNow]=useState(Date.now()),[cases,setCases]=useState<CareCase[]>([]),[members,setMembers]=useState<Member[]>([]);
 const [query,setQuery]=useState(""),[statusFilter,setStatusFilter]=useState<CaseStatus|"Open"|null>(null),[hydrated,setHydrated]=useState(false);
 const [cardNo,setCardNo]=useState(""),[visitType,setVisitType]=useState("Rawat Jalan"),[found,setFound]=useState<Member|null>(null),[lookupDone,setLookupDone]=useState(false);
 const [urgent,setUrgent]=useState(false),[urgencyReason,setUrgencyReason]=useState(""),[urgencyText,setUrgencyText]=useState(""),[complaint,setComplaint]=useState("");
 const blank:Member={cardNo:"",name:"",dob:"",gender:"Laki-laki",company:"",policyNo:"",plan:"",relation:"Karyawan",active:true,faskes1:"",providerCategory:"Rumah Sakit",roomClass:"",annualLimit:0,remainingLimit:0};
 const [form,setForm]=useState<Member>(blank),[notice,setNotice]=useState("");

 useEffect(()=>{try{const m=localStorage.getItem("pertalife-managed-care-members"),c=localStorage.getItem("pertalife-managed-care-cases");if(m)setMembers(JSON.parse(m));if(c)setCases(JSON.parse(c));}catch{}setHydrated(true);const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 useEffect(()=>{if(hydrated){localStorage.setItem("pertalife-managed-care-members",JSON.stringify(members));localStorage.setItem("pertalife-managed-care-cases",JSON.stringify(cases));}},[members,cases,hydrated]);

 const waiting=useMemo(()=>cases.filter(c=>c.status.startsWith("Waiting")),[cases]);
 const filtered=cases.filter(c=>(c.name+" "+c.memberId+" "+c.company+" "+c.id).toLowerCase().includes(query.toLowerCase())).filter(c=>statusFilter==="Open"?c.status!=="Closed":statusFilter?c.status===statusFilter:true);
 const faskesMatch=!!found&&found.faskes1.trim().toLowerCase()===PROVIDER.toLowerCase();
 const canSubmit=!!found&&found.active&&!!complaint.trim()&&(faskesMatch||(urgent&&!!urgencyReason&&(urgencyReason!=="Lainnya"||!!urgencyText.trim())));

 function saveMember(e:React.FormEvent){e.preventDefault();if(!form.cardNo.trim()||!form.name.trim()||!form.company.trim()||!form.faskes1.trim()){setNotice("Nomor kartu, nama, perusahaan, dan Faskes 1 wajib diisi.");return}if(members.some(m=>m.cardNo.toLowerCase()===form.cardNo.trim().toLowerCase())){setNotice("Nomor kartu sudah terdaftar.");return}setMembers(v=>[{...form,cardNo:form.cardNo.trim()},...v]);setForm(blank);setNotice("Master peserta berhasil disimpan di browser ini.");}
 function lookup(){const m=members.find(x=>x.cardNo.toLowerCase()===cardNo.trim().toLowerCase())||null;setFound(m);setLookupDone(true);setUrgent(false);setUrgencyReason("");setUrgencyText("");setComplaint("");}
 function submitAdmission(){if(!found||!canSubmit)return;const id="MC-"+new Date().toISOString().slice(2,10).replaceAll("-","")+"-"+String(cases.length+1).padStart(4,"0");setCases(v=>[{id,name:found.name,memberId:found.cardNo,company:found.company,provider:PROVIDER,status:"Waiting Admission",urgent,submittedAt:Date.now(),issue:complaint,visitType,urgencyReason:urgent?(urgencyReason==="Lainnya"?urgencyText:urgencyReason):undefined},...v]);setNotice("Admission berhasil dikirim ke Call Center PertaLife.");setFound(null);setCardNo("");setLookupDone(false);setComplaint("");setUrgent(false);}
 const decide=(id:string,status:CaseStatus)=>setCases(v=>v.map(c=>c.id===id?{...c,status,submittedAt:Date.now()}:c));

 return <div className="shell">
 <aside><div className="brand"><div className="brandMark"><HeartPulse size={22}/></div><div><b>PertaLife</b><span>Managed Care</span></div></div><nav><a className="active"><Activity size={18}/>Dashboard</a>{role==="provider"?<><a><UserRound size={18}/>Pendaftaran Peserta</a><a><Stethoscope size={18}/>Treatment Request</a><a><FileCheck2 size={18}/>Discharge</a></>:<><a><Database size={18}/>Master Peserta</a><a><Clock3 size={18}/>Verification Queue</a><a><ShieldCheck size={18}/>Eligibility Review</a><a><FileCheck2 size={18}/>Audit Trail</a></>}</nav><div className="sideFoot"><span>Prototype Mode</span><small>Browser data · No production DB</small></div></aside>
 <main><header><div><h1>{role==="provider"?"Provider Dashboard":"Managed Care Command Center"}</h1><p>{role==="provider"?"Kelola pendaftaran, treatment, dan discharge peserta.":"Kelola master peserta dan verifikasi seluruh case provider secara real-time 24/7."}</p></div><div className="switchWrap"><span className="switchLabel">Account Switcher</span><button className="account" onClick={()=>{setRole(role==="provider"?"callcenter":"provider");setNotice("")}}><div className="avatar">{role==="provider"?<Building2 size={18}/>:<ShieldCheck size={18}/>}</div><div><b>{role==="provider"?PROVIDER:"Call Center PertaLife"}</b><span>{role==="provider"?"Provider":"Verifier 24/7"}</span></div><ChevronDown size={17}/></button></div></header>
 {notice&&<div className="notice">{notice}</div>}
 <section className="stats">
 {([["Waiting Admission","Waiting Admission",UserRound],["Waiting Treatment","Waiting Treatment Approval",Stethoscope],["Waiting Discharge","Waiting Discharge",FileCheck2],["Open Cases","Open",Activity]] as const).map(([label,key,Icon])=><button key={label} className={"card stat "+(statusFilter===key?"selected":"")} onClick={()=>setStatusFilter(statusFilter===key?null:key)}><div><span>{label}</span><strong>{key==="Open"?cases.filter(c=>c.status!=="Closed").length:cases.filter(c=>c.status===key).length}</strong></div><div className="icon"><Icon/></div></button>)}
 </section>

 {role==="callcenter"&&<section className="card master"><div className="sectionHead"><div><h2>Master Peserta Managed Care</h2><p>Bangun data eligibility sendiri. Data hanya tersimpan di browser ini.</p></div><span className="countPill">{members.length} peserta</span></div>
 <form className="masterForm" onSubmit={saveMember}>
  <label>Nomor Kartu *<input value={form.cardNo} onChange={e=>setForm({...form,cardNo:e.target.value})} placeholder="Contoh MC10000001"/></label>
  <label>Nama Peserta *<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
  <label>Perusahaan *<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label>
  <label>Faskes 1 *<input value={form.faskes1} onChange={e=>setForm({...form,faskes1:e.target.value})} placeholder={PROVIDER}/></label>
  <label>No. Polis<input value={form.policyNo} onChange={e=>setForm({...form,policyNo:e.target.value})}/></label>
  <label>Plan<input value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})}/></label>
  <label>Tanggal Lahir<input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/></label>
  <label>Jenis Kelamin<select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option>Laki-laki</option><option>Perempuan</option></select></label>
  <label>Hubungan<select value={form.relation} onChange={e=>setForm({...form,relation:e.target.value})}><option>Karyawan</option><option>Pasangan</option><option>Anak</option></select></label>
  <label>Kategori Provider<select value={form.providerCategory} onChange={e=>setForm({...form,providerCategory:e.target.value})}><option>Rumah Sakit</option><option>Klinik</option><option>Puskesmas/FKTP</option><option>Dokter Praktik</option><option>Dokter Gigi</option><option>Laboratorium</option><option>Apotek</option></select></label>
  <label>Kelas Kamar<input value={form.roomClass} onChange={e=>setForm({...form,roomClass:e.target.value})}/></label>
  <label>Limit Tahunan<input type="number" value={form.annualLimit||""} onChange={e=>setForm({...form,annualLimit:Number(e.target.value)})}/></label>
  <label>Sisa Limit<input type="number" value={form.remainingLimit||""} onChange={e=>setForm({...form,remainingLimit:Number(e.target.value)})}/></label>
  <label>Status<select value={form.active?"Aktif":"Tidak Aktif"} onChange={e=>setForm({...form,active:e.target.value==="Aktif"})}><option>Aktif</option><option>Tidak Aktif</option></select></label>
  <button className="primary saveBtn" type="submit"><Plus size={17}/>Simpan Peserta</button>
 </form>
 {members.length>0&&<div className="miniTable"><table><thead><tr><th>No. Kartu</th><th>Peserta</th><th>Perusahaan</th><th>Faskes 1</th><th>Status</th></tr></thead><tbody>{members.map(m=><tr key={m.cardNo}><td><b>{m.cardNo}</b></td><td><b>{m.name}</b><small>{m.relation} · {m.plan||"-"}</small></td><td>{m.company}</td><td>{m.faskes1}</td><td><span className={"statusDot "+(m.active?"ok":"no")}>{m.active?"Aktif":"Tidak Aktif"}</span></td></tr>)}</tbody></table></div>}
 </section>}

 {role==="provider"&&<section className="card eligibility"><div><h2>Cek Eligibility Peserta</h2><p>Provider aktif: <b>{PROVIDER}</b>. Cari menggunakan Nomor Kartu.</p></div><div className="eligGrid"><label>Nomor Kartu<input value={cardNo} onChange={e=>setCardNo(e.target.value)} placeholder="Masukkan nomor kartu"/></label><label>Jenis Kunjungan<select value={visitType} onChange={e=>setVisitType(e.target.value)}><option>Rawat Jalan</option><option>UGD / IGD</option><option>Emergency Gigi</option></select></label><button className="primary" onClick={lookup}><Search size={17}/>Cek Eligibility</button></div>
 {lookupDone&&!found&&<div className="result bad"><AlertTriangle/><div><b>Peserta tidak ditemukan</b><span>Pastikan Nomor Kartu sudah dibuat dari POV Call Center.</span></div></div>}
 {found&&<div className="eligResult"><div className="resultTop"><div><span className={"statusDot "+(found.active?"ok":"no")}>{found.active?"PESERTA AKTIF":"PESERTA TIDAK AKTIF"}</span><h3>{found.name}</h3><p>{found.cardNo} · {found.company}</p></div><div className={"matchBox "+(faskesMatch?"match":"mismatch")}><b>{faskesMatch?"Faskes 1 Sesuai":"Faskes 1 Tidak Sesuai"}</b><span>{found.faskes1}</span></div></div>
 <div className="detailGrid"><div><span>No. Polis</span><b>{found.policyNo||"-"}</b></div><div><span>Plan</span><b>{found.plan||"-"}</b></div><div><span>Hubungan</span><b>{found.relation}</b></div><div><span>Kelas</span><b>{found.roomClass||"-"}</b></div><div><span>Limit Tahunan</span><b>{money(found.annualLimit)}</b></div><div><span>Sisa Limit</span><b>{money(found.remainingLimit)}</b></div></div>
 {!faskesMatch&&found.active&&<div className="override"><label className="check"><input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)}/>Override sebagai Urgent</label>{urgent&&<><label>Alasan Urgent<select value={urgencyReason} onChange={e=>setUrgencyReason(e.target.value)}><option value="">Pilih alasan</option>{urgencyOptions.map(x=><option key={x}>{x}</option>)}</select></label>{urgencyReason==="Lainnya"&&<label>Penjelasan<input value={urgencyText} onChange={e=>setUrgencyText(e.target.value)} placeholder="Jelaskan alasan urgency"/></label>}</>}</div>}
 <div className="admissionBox"><label>Keluhan / Indikasi *<textarea value={complaint} onChange={e=>setComplaint(e.target.value)} placeholder="Jelaskan keluhan utama peserta"/></label><button className="primary" disabled={!canSubmit} onClick={submitAdmission}>Submit Admission <ArrowRight size={17}/></button>{!found.active&&<small>Peserta tidak aktif. Admission tidak dapat disubmit.</small>}{found.active&&!faskesMatch&&!urgent&&<small>Submit terkunci karena Faskes 1 tidak sesuai. Aktifkan Urgent untuk meminta override.</small>}</div>
 </div>}
 </section>}

 <section className="card queue"><div className="sectionHead"><div><h2>{role==="provider"?"Case Peserta":"Real-time Verification Queue"}</h2><p>{role==="provider"?"Pantau status verifikasi setiap case yang lo submit.":"Semua admission tetap harus diverifikasi PertaLife."}</p></div><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari case, nama, nomor kartu..."/></div></div><div className="tableWrap"><table><thead><tr><th>Case</th><th>Peserta</th><th>Provider / Perusahaan</th><th>Status</th><th>SLA</th>{role==="callcenter"&&<th>Aksi</th>}</tr></thead><tbody>
 {filtered.length===0?<tr><td colSpan={role==="callcenter"?6:5} className="emptyState"><b>{cases.length===0?"Belum ada case":"Tidak ada case pada filter ini"}</b><small>{cases.length===0?"Case akan muncul setelah Provider submit admission.":"Klik card aktif lagi untuk menghapus filter."}</small></td></tr>:filtered.map(c=><tr key={c.id}><td><b>{c.id}</b><small>{c.issue}</small></td><td><b>{c.name}</b><small>{c.memberId}</small></td><td><b>{c.provider}</b><small>{c.company}</small></td><td><span className={"badge "+(c.urgent?"urgent":"")}>{c.urgent&&<AlertTriangle size={13}/>} {c.status}</span>{c.urgencyReason&&<small>Urgent: {c.urgencyReason}</small>}</td><td><span className="sla"><Clock3 size={14}/>{fmt(now-c.submittedAt)}</span></td>{role==="callcenter"&&<td>{c.status==="Waiting Admission"?<div className="actions"><button className="approve" onClick={()=>decide(c.id,"Treatment Active")}><CheckCircle2 size={15}/>Approve</button><button>Need Confirmation</button><button>Reject</button></div>:<span className="muted">No action</span>}</td>}</tr>)}
 </tbody></table></div></section>
 {role==="callcenter"&&<section className="hint"><ShieldCheck/><div><b>Semua case tetap memerlukan verifikasi PertaLife.</b><span>Eligibility dan kesesuaian Faskes hanya membantu review, tidak melakukan auto-approval.</span></div><b>{waiting.length} waiting</b></section>}
 </main></div>
}