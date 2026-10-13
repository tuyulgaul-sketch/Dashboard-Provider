"use client";
import {useEffect,useMemo,useState} from "react";
import {AlertCircle,Ambulance,BedDouble,BookOpen,HeartHandshake,Microscope,Search,ShieldCheck,Stethoscope} from "lucide-react";
import {PILOT_BENEFITS,PILOT_CATEGORIES,PILOT_DISCLAIMER,toRupiah} from "./pilot-benefits";
import {getRecommendedBenefitGroup,PROVIDER_BENEFIT_GROUPS,PROVIDER_MEDICAL_BENEFIT_IDS,providerBenefitGroup} from "./provider-benefit-groups";
import type {ProviderBenefitGroupId} from "./provider-benefit-groups";

type Beneficiary={cardNo:string;name:string;policyNo:string;planName:string;planCode?:string};
type Props={
 member:Beneficiary;memberActive:boolean;variant?:"provider"|"callcenter";
 serviceContext?:"FKTP"|"FKRTL"|"Emergency";
};
const groupIcons={fktp:Stethoscope,specialist:Microscope,inpatient:BedDouble,emergency:Ambulance,special:HeartHandshake};
type BalanceFilter="all"|"as-charged"|"nominal"|"exhausted";

export default function BenefitCoverage({member,memberActive,variant="provider",serviceContext="FKTP"}:Props){
 const isProvider=variant==="provider";
 const recommended=getRecommendedBenefitGroup(serviceContext);
 const [query,setQuery]=useState("");
 const [category,setCategory]=useState("all");
 const [activeGroup,setActiveGroup]=useState<ProviderBenefitGroupId|"all">(recommended);
 const [filter,setFilter]=useState<BalanceFilter>("all");
 const [open,setOpen]=useState(true);
 useEffect(()=>{
  setActiveGroup(getRecommendedBenefitGroup(serviceContext));
  setQuery("");
 },[serviceContext,member.cardNo]);

 const allowed=useMemo(()=>isProvider?
  PILOT_BENEFITS.filter(item=>PROVIDER_MEDICAL_BENEFIT_IDS.has(item.id)):PILOT_BENEFITS,[isProvider]);
 const shown=useMemo(()=>allowed.filter(item=>{
  if(isProvider){
   if(activeGroup!=="all"&&providerBenefitGroup(item.id)!==activeGroup)return false;
  }else{
   if(category!=="all"&&item.category!==category)return false;
   if(filter==="as-charged"&&item.kind!=="as-charged")return false;
   if(filter==="nominal"&&item.kind!=="nominal")return false;
   if(filter==="exhausted"&&(item.kind!=="nominal"||item.paid<item.limit))return false;
  }
  const needle=query.trim().toLowerCase();
  return !needle||[item.name,item.category,item.restriction].some(v=>v.toLowerCase().includes(needle));
 }),[allowed,isProvider,activeGroup,category,filter,query]);

 const asCharged=PILOT_BENEFITS.filter(i=>i.kind==="as-charged").length;
 const exhausted=PILOT_BENEFITS.filter(i=>i.kind==="nominal"&&i.paid>=i.limit).length;
 const selectedGroup=PROVIDER_BENEFIT_GROUPS.find(g=>g.id===activeGroup);
 const reset=()=>{setQuery("");setFilter("all");setCategory("all");setActiveGroup(recommended)};
 return <section className="card benefitsSection" aria-label="Benefit & Coverage">
  <div className="benefitsHeading">
   <div className="benefitsHeaderIcon"><BookOpen size={22}/></div>
   <div className="benefitsHeaderText">
    <div className="benefitsHeadingLine"><h2>Benefit & Coverage</h2><span className="benefitDemoBadge">DATA SIMULASI</span><span className="benefitRoleTag">{isProvider?"TAMPILAN PROVIDER":"AKSES LENGKAP CALL CENTER"}</span></div>
    <p>{isProvider?"Pilih kelompok pelayanan agar petugas lebih cepat menemukan manfaat dan ketentuannya.":"Katalog lengkap 79 item, termasuk reimbursement, santunan, dan manfaat finansial."}</p>
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

   {isProvider?<>
    <div className="benefitProviderIntro">
     <div><strong>Kelompok Manfaat Pelayanan</strong><span>Jalur terpilih: {serviceContext==="Emergency"?"IGD / Emergency":serviceContext==="FKRTL"?"FKRTL / Rujukan Spesialis":"FKTP / Pemeriksaan Awal"}. Kategori yang relevan sudah dipilih otomatis; kategori lain tetap bisa dibuka.</span></div>
     <span className="benefitClinicalCount">{allowed.length} item medis</span>
    </div>
    <div className="providerBenefitGrid">
     {PROVIDER_BENEFIT_GROUPS.map(group=>{
      const Icon=groupIcons[group.id];
      return <button key={group.id} type="button" aria-pressed={activeGroup===group.id}
       className={"providerBenefitGroupCard "+(activeGroup===group.id?"selected":"")}
       onClick={()=>{setActiveGroup(group.id);setQuery("")}}>
       <div className="providerBenefitGroupTop"><span className="providerBenefitGroupIcon"><Icon size={20}/></span><span className="providerBenefitGroupCount">{group.itemIds.length} item</span></div>
       <strong>{group.title}</strong><small>{group.description}</small>
       {recommended===group.id&&<span className="providerBenefitRecommended">Sesuai jalur kunjungan</span>}
      </button>
     })}
    </div>
    <div className="providerBenefitSelection">
     <div><strong>{selectedGroup?selectedGroup.title:"Seluruh Manfaat Medis"}</strong><span>{selectedGroup?selectedGroup.description:"Daftar gabungan manfaat pelayanan dari 5 kategori, tanpa reimbursement dan manfaat finansial."}</span></div>
     <button type="button" className="benefitReset" onClick={()=>{setActiveGroup(activeGroup==="all"?recommended:"all");setQuery("")}}>
      {activeGroup==="all"?"Kembali ke Kategori":"Lihat Semua Manfaat Medis"}
     </button>
    </div>
   </>:<>
    <div className="benefitSummaryGrid">
     <button type="button" className={filter==="all"?"isSelected":""} onClick={()=>setFilter("all")}><span>Total Item</span><strong>{PILOT_BENEFITS.length}</strong><small>Seluruh kategori</small></button>
     <button type="button" className={filter==="as-charged"?"isSelected":""} onClick={()=>setFilter("as-charged")}><span>As Charged</span><strong>{asCharged}</strong><small>Bukan limit nol</small></button>
     <button type="button" className={filter==="nominal"?"isSelected":""} onClick={()=>setFilter("nominal")}><span>Limit Nominal</span><strong>{PILOT_BENEFITS.length-asCharged}</strong><small>Sesuai dokumen</small></button>
     <button type="button" className={filter==="exhausted"?"isSelected":""} onClick={()=>setFilter("exhausted")}><span>Limit Nominal Habis</span><strong>{exhausted}</strong><small>Angka sampel</small></button>
    </div>
   </>}

   <div className="benefitExplainer"><AlertCircle size={18}/><p><strong>Ketentuan penjaminan:</strong> Nilai manfaat 0 berarti <strong>As Charged</strong> (bukan tidak dijamin). Untuk plafon nominal, sisa contoh = manfaat − dibayar. Batas frekuensi, UCR, syarat medis, benefit per polis dan approval Call Center tetap berlaku. {isProvider?"Manfaat reimbursement, santunan, penyakit kritis, buffer ekses, dan administratif hanya ditampilkan pada akun Call Center.":""}</p></div>
   <div className="benefitTools">
    <label className="benefitSearch"><Search size={17}/><input aria-label="Cari item benefit" placeholder={isProvider?"Cari tindakan, layanan, atau ketentuan medis...":"Cari item atau batasan benefit..."} value={query} onChange={e=>setQuery(e.target.value)}/></label>
    {!isProvider&&<label className="benefitSelect"><span>Kategori</span><select aria-label="Filter kategori benefit" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Semua kategori</option>{PILOT_CATEGORIES.map(name=><option key={name} value={name}>{name}</option>)}</select></label>}
    <button type="button" className="benefitReset" onClick={reset}>Reset Filter</button>
   </div>
   <div className="benefitTableWrap"><table className="benefitTable"><thead><tr><th>No.</th><th>Item Manfaat</th><th>Batasan / Ketentuan</th><th>Manfaat</th><th>Dibayar</th><th>Sisa Nominal</th></tr></thead><tbody>
    {shown.length?shown.map(item=><tr key={item.id}>
     <td>{item.id}</td>
     <td><strong>{item.name}</strong>{!isProvider&&<small>{item.category}</small>}{item.scope==="per-polis"&&<span className="benefitScope">PER POLIS</span>}</td>
     <td>{item.restriction||<span className="benefitMuted">Tidak dicantumkan pada sampel</span>}</td>
     <td>{item.kind==="as-charged"?<span className="benefitAsCharged">As Charged</span>:<strong>{toRupiah(item.limit)}</strong>}</td>
     <td>{toRupiah(item.paid)}</td>
     <td>{item.kind==="as-charged"?<span className="benefitMuted">Tidak dihitung</span>:item.limit-item.paid<=0?<span className="benefitExhausted">Rp0 · Habis*</span>:<strong className="benefitRemaining">{toRupiah(item.limit-item.paid)}</strong>}</td>
    </tr>):<tr><td colSpan={6} className="benefitEmpty">Tidak ada item benefit pada pilihan ini. Coba kelompok lain atau ubah pencarian.</td></tr>}
   </tbody></table></div>
   <div className="benefitFoot"><ShieldCheck size={17}/><div><strong>{shown.length} dari {allowed.length} item benefit {isProvider?"pelayanan medis":"lengkap"}</strong><span>{PILOT_DISCLAIMER} {isProvider?"Petugas Provider tetap mengikuti proses persetujuan Call Center.": "Call Center memeriksa eligibility dan kebutuhan medis sebelum approval."} *“Habis” hanya menunjukkan sisa nominal contoh, bukan keputusan akhir coverage.</span></div></div>
  </>}
 </section>;
}
