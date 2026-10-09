"use client";
import {useMemo,useState} from "react";
import {AlertCircle,BookOpen,Search,ShieldCheck} from "lucide-react";
import {PILOT_BENEFITS,PILOT_CATEGORIES,PILOT_DISCLAIMER,PILOT_PERIOD,toRupiah} from "./pilot-benefits";

type Beneficiary={cardNo:string;name:string;policyNo:string;planName:string;planCode?:string};
type Props={member:Beneficiary;memberActive:boolean;variant?:"provider"|"callcenter"};

export default function BenefitCoverage({member,memberActive,variant="provider"}:Props){
 const [query,setQuery]=useState("");
 const [category,setCategory]=useState("all");
 const [filter,setFilter]=useState<"all"|"as-charged"|"nominal"|"exhausted">("all");
 const [open,setOpen]=useState(true);
 const shown=useMemo(()=>PILOT_BENEFITS.filter(item=>{
  if(category!=="all"&&item.category!==category)return false;
  if(filter==="as-charged"&&item.kind!=="as-charged")return false;
  if(filter==="nominal"&&item.kind!=="nominal")return false;
  if(filter==="exhausted"&&(item.kind!=="nominal"||item.paid<item.limit))return false;
  const needle=query.trim().toLowerCase();
  return !needle||[item.name,item.category,item.restriction].some(v=>v.toLowerCase().includes(needle));
 }),[query,category,filter]);
 const asCharged=PILOT_BENEFITS.filter(i=>i.kind==="as-charged").length;
 const exhausted=PILOT_BENEFITS.filter(i=>i.kind==="nominal"&&i.paid>=i.limit).length;
 return <section className="card benefitsSection" aria-label="Benefit & Coverage">
  <div className="benefitsHeading">
   <div className="benefitsHeaderIcon"><BookOpen size={22}/></div>
   <div className="benefitsHeaderText">
    <div className="benefitsHeadingLine"><h2>Benefit & Coverage</h2><span className="benefitDemoBadge">DATA SIMULASI</span></div>
    <p>Satu paket contoh manfaat berlaku untuk seluruh Master Peserta dalam pilot.</p>
   </div>
   <button type="button" className="benefitCollapse" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?"Sembunyikan":"Lihat Benefit"}</button>
  </div>
  {open&&<>
   <div className="benefitIdentity">
    <div><small>PESERTA</small><strong>{member.name}</strong><span>{member.cardNo}</span></div>
    <div><small>POLIS / PLAN PESERTA</small><strong>{member.policyNo||"-"}</strong><span>{member.planName||"-"} {member.planCode?"· "+member.planCode:""}</span></div>
    <div><small>PERIODE DATA SAMPLE BENEFIT</small><strong>01 Mar 2026 – 31 Agu 2027</strong><span>Tidak mengganti tanggal aktif peserta.</span></div>
    <div><small>STATUS KEPESERTAAN</small><strong className={memberActive?"benefitStatusOn":"benefitStatusOff"}>{memberActive?"Aktif":"Tidak Aktif"}</strong><span>{memberActive?"Tetap perlu verifikasi medis":"Tidak dapat submit admission"}</span></div>
   </div>
   <div className="benefitSummaryGrid">
    <button type="button" className={filter==="all"?"isSelected":""} onClick={()=>setFilter("all")}><span>Total Item</span><strong>{PILOT_BENEFITS.length}</strong><small>Seluruh kategori</small></button>
    <button type="button" className={filter==="as-charged"?"isSelected":""} onClick={()=>setFilter("as-charged")}><span>As Charged</span><strong>{asCharged}</strong><small>Bukan limit nol</small></button>
    <button type="button" className={filter==="nominal"?"isSelected":""} onClick={()=>setFilter("nominal")}><span>Limit Nominal</span><strong>{PILOT_BENEFITS.length-asCharged}</strong><small>Sesuai dokumen</small></button>
    <button type="button" className={filter==="exhausted"?"isSelected":""} onClick={()=>setFilter("exhausted")}><span>Limit Nominal Habis</span><strong>{exhausted}</strong><small>Angka sampel</small></button>
   </div>
   <div className="benefitExplainer"><AlertCircle size={18}/><p><strong>Aturan penting:</strong> Manfaat bernilai 0 berarti <strong>As Charged</strong>, bukan tidak dijamin. Sisa nominal = manfaat − dibayar hanya untuk manfaat dengan plafon angka. Batasan frekuensi, UCR, syarat medis, dan approval tetap berlaku. Nominal manfaat <strong>per polis</strong> bukan hak otomatis setiap peserta.</p></div>
   <div className="benefitTools">
    <label className="benefitSearch"><Search size={17}/><input aria-label="Cari item benefit" placeholder="Cari item atau batasan benefit..." value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <label className="benefitSelect"><span>Kategori</span><select aria-label="Filter kategori benefit" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Semua kategori</option>{PILOT_CATEGORIES.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
    <button className="benefitReset" type="button" onClick={()=>{setQuery("");setCategory("all");setFilter("all")}}>Reset Filter</button>
   </div>
   <div className="benefitTableWrap"><table className="benefitTable"><thead><tr><th>No.</th><th>Item Manfaat</th><th>Batasan / Ketentuan</th><th>Manfaat</th><th>Dibayar</th><th>Sisa Nominal</th></tr></thead><tbody>
    {shown.length?shown.map(item=><tr key={item.id}>
     <td>{item.id}</td>
     <td><strong>{item.name}</strong><small>{item.category}</small>{item.scope==="per-polis"&&<span className="benefitScope">PER POLIS</span>}</td>
     <td>{item.restriction||<span className="benefitMuted">Tidak dicantumkan pada sampel</span>}</td>
     <td>{item.kind==="as-charged"?<span className="benefitAsCharged">As Charged</span>:<strong>{toRupiah(item.limit)}</strong>}</td>
     <td>{toRupiah(item.paid)}</td>
     <td>{item.kind==="as-charged"?<span className="benefitMuted">Tidak dihitung</span>:item.limit-item.paid<=0?<span className="benefitExhausted">Rp0 · Habis*</span>:<strong className="benefitRemaining">{toRupiah(item.limit-item.paid)}</strong>}</td>
    </tr>):<tr><td colSpan={6} className="benefitEmpty">Tidak ada item benefit pada filter ini.</td></tr>}
   </tbody></table></div>
   <div className="benefitFoot"><ShieldCheck size={17}/><div><strong>{shown.length} dari {PILOT_BENEFITS.length} item benefit</strong><span>{PILOT_DISCLAIMER} {variant==="provider"?"Provider tetap perlu persetujuan sesuai alur Call Center.":"Call Center tetap memeriksa kelayakan tindakan sebelum persetujuan."} *“Habis” hanya menunjukkan sisa nominal contoh, bukan keputusan akhir coverage.</span></div></div>
  </>}
 </section>;
}
