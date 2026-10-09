"use client";
import {useEffect,useState} from "react";
import {ArrowRight,CheckCircle2,ClipboardCheck,FileText,Search,ShieldCheck,Stethoscope} from "lucide-react";

export type ReferralStatus="Pending Verification"|"Need Revision"|"Approved"|"Rejected";
export type ReferralDraft={refNumber:string;specialty:string;doctor:string;diagnosis:string;reason:string;documentReference:string};
export type ReferralRequest=ReferralDraft&{id:string;kind:"Internal (Satu Atap)"|"Eksternal";sourceCaseId:string;sourceProviderCode:string;targetProviderCode:string;targetProviderName:string;status:ReferralStatus;submittedAt:number;reviewedAt?:number;reviewer?:string;reviewNote?:string;linkedCaseId?:string};
export type ReferralRow={id:string;name:string;memberId:string;provider:string;providerCode?:string;status:string;careLevel?:string;accessRoute?:string;referral?:ReferralRequest;issue:string;parentCaseId?:string};
const HERM="PRV-HERMINA-KMY-001";
const specialties=["Penyakit Dalam","Anak","Obgyn","Bedah","Ortopedi","Jantung","Mata","THT","Saraf","Kulit & Kelamin","Gigi Spesialis","Lainnya"];

export function ProviderReferrals({cases,eligibleIds,selectedId,onSelect,onSubmit,onDetail,onViewLinked}:{
 cases:ReferralRow[];eligibleIds:string[];selectedId:string|null;
 onSelect:(id:string|null)=>void;onSubmit:(id:string,draft:ReferralDraft)=>void;
 onDetail:(id:string)=>void;onViewLinked:(id:string)=>void;
}){
 const selected=cases.find(c=>c.id===selectedId)||null;
 const [refNumber,setRefNumber]=useState("");
 const [specialty,setSpecialty]=useState("");
 const [doctor,setDoctor]=useState("");
 const [diagnosis,setDiagnosis]=useState("");
 const [reason,setReason]=useState("");
 const [documentReference,setDocumentReference]=useState("");
 useEffect(()=>{
  const prev=selected?.referral;
  setRefNumber(prev?.refNumber||"");setSpecialty(prev?.specialty||"");setDoctor(prev?.doctor||"");
  setDiagnosis(prev?.diagnosis||"");setReason(prev?.reason||"");setDocumentReference(prev?.documentReference||"");
 },[selected?.id,selected?.referral?.submittedAt]);
 const available=selected&&eligibleIds.includes(selected.id);
 const target=selected?.providerCode===HERM?"Internal (Satu Atap)":"Eksternal";
 const valid=!!refNumber.trim()&&!!specialty.trim()&&!!doctor.trim()&&!!diagnosis.trim()&&!!reason.trim()&&!!documentReference.trim();
 return <section className="card referralPanel">
  <div className="sectionHead"><div><h2>Pengajuan Rujukan FKTP → FKRTL</h2><p>FKTP Kimia Farma dapat merujuk ke Hermina; FKTP Hermina dapat melakukan rujukan internal satu atap. Semua rujukan harus disetujui Call Center sebelum pelayanan spesialis.</p></div><span className="countPill">{cases.filter(c=>c.referral).length} rujukan</span></div>
  <div className="referralSteps"><span>1 · Admission FKTP disetujui</span><ArrowRight size={15}/><span>2 · Pengajuan Rujukan</span><ArrowRight size={15}/><span>3 · Verifikasi Call Center</span><ArrowRight size={15}/><span>4 · Admission FKRTL otomatis</span></div>
  <div className="referralList">
   <h3>Episode FKTP</h3>
   {cases.filter(c=>(c.careLevel||"FKTP")==="FKTP").length===0?<p className="referralEmpty">Belum ada episode FKTP. Lakukan Admission FKTP terlebih dahulu.</p>:cases.filter(c=>(c.careLevel||"FKTP")==="FKTP").map(c=><div className="referralRow" key={c.id}>
    <div><strong>{c.name}</strong><small>{c.id} · {c.memberId} · {c.status}</small><small>{c.referral?"Rujukan: "+c.referral.status:"Belum ada rujukan"}</small></div>
    <div className="referralRowButtons">
     {eligibleIds.includes(c.id)&&<button className="primary" type="button" onClick={()=>onSelect(c.id)}>{c.referral?.status==="Need Revision"?"Revisi Rujukan":"Buat Rujukan"}</button>}
     {c.referral?.linkedCaseId&&<button type="button" className="reviewClear" onClick={()=>onViewLinked(c.referral!.linkedCaseId!)}>Lihat FKRTL</button>}
     <button type="button" className="reviewClear" onClick={()=>onDetail(c.id)}>Detail FKTP</button>
    </div>
   </div>)}
  </div>
  {selected&&<div className="referralForm"><div className="reviewHead"><div><b>{selected.referral?.status==="Need Revision"?"Revisi Rujukan":"Form Rujukan Baru"}</b><span>{selected.name} · {selected.id} · {target} → RS Hermina Kemayoran (FKRTL)</span></div><button className="reviewClear" onClick={()=>onSelect(null)}>Tutup</button></div>
   {!available?<div className="referralWarning">Episode tidak memenuhi syarat pembuatan rujukan FKTP, atau rujukan masih menunggu/sudah diputuskan. Pilih case lain atau lihat status saat ini.</div>:<>
   {selected.referral?.reviewNote&&<div className="referralWarning"><strong>Catatan Call Center:</strong> {selected.referral.reviewNote}</div>}
   <div className="workflowGrid">
    <label>Nomor Rujukan *<input value={refNumber} onChange={e=>setRefNumber(e.target.value)} placeholder="Nomor surat / referensi internal"/></label>
    <label>Jenis Rujukan<input readOnly value={target}/></label>
    <label>Faskes Tujuan<input readOnly value="RS Hermina Kemayoran — FKRTL"/></label>
    <label>Poli / Spesialis Tujuan *<select value={specialty} onChange={e=>setSpecialty(e.target.value)}><option value="">Pilih spesialis</option>{specialties.map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Dokter FKTP Perujuk *<input value={doctor} onChange={e=>setDoctor(e.target.value)} placeholder="Nama dokter FKTP"/></label>
    <label>Referensi Dokumen Medis *<input value={documentReference} onChange={e=>setDocumentReference(e.target.value)} placeholder="Nomor berkas / catatan lokasi dokumen"/></label>
    <label className="full">Diagnosis Awal *<textarea value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} placeholder="Diagnosis atau dugaan diagnosis dari pemeriksaan FKTP"/></label>
    <label className="full">Indikasi / Alasan Rujukan *<textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Mengapa membutuhkan pemeriksaan spesialis"/></label>
   </div>
   <div className="referralWarning">Prototype ini menyimpan nomor/referensi dokumen, bukan file medis sebenarnya. Pelayanan spesialis menunggu keputusan Approved dari Call Center PertaLife.</div>
   <div className="workflowActions"><span>Persetujuan rujukan otomatis membuat episode FKRTL tanpa approval Admission kedua.</span><button type="button" className="primary" disabled={!valid} onClick={()=>{onSubmit(selected.id,{refNumber:refNumber.trim(),specialty,doctor:doctor.trim(),diagnosis:diagnosis.trim(),reason:reason.trim(),documentReference:documentReference.trim()});onSelect(null)}}><FileText size={17}/>Submit Rujukan</button></div>
   </>}
  </div>}
 </section>;
}

export function CallCenterReferrals({cases,onReview,onDetail,onViewBenefit}:{
 cases:ReferralRow[];onReview:(id:string,outcome:"Approved"|"Need Revision"|"Rejected")=>void;
 onDetail:(id:string)=>void;onViewBenefit:(id:string)=>void;
}){
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const referrals=cases.filter(c=>!!c.referral).sort((a,b)=>(b.referral?.submittedAt||0)-(a.referral?.submittedAt||0));
 const selected=referrals.find(c=>c.id===selectedId);
 return <section className="card referralPanel">
  <div className="sectionHead"><div><h2>Referral Approval — Call Center</h2><p>Verifikasi dokumen, status kepesertaan, diagnosis, spesialis tujuan, dan benefit sebelum rujukan disetujui. Tidak ada approval Admission FKRTL kedua setelah rujukan Approved.</p></div><span className="countPill">{referrals.filter(c=>c.referral?.status==="Pending Verification").length} pending</span></div>
  <div className="referralList">{referrals.length===0?<p className="referralEmpty">Belum ada rujukan. Rujukan akan tampil setelah FKTP mengirim pengajuan.</p>:referrals.map(c=><div className="referralRow" key={c.id}>
   <div><strong>{c.name}</strong><small>{c.id} · {c.memberId} · {c.provider}</small><small>{c.referral?.kind} · {c.referral?.specialty} · <b>{c.referral?.status}</b></small></div>
   <div className="referralRowButtons"><button className="reviewClear" onClick={()=>{setSelectedId(prev=>prev===c.id?null:c.id);onViewBenefit(c.id)}}><Search size={14}/>Review Rujukan</button><button className="reviewClear" onClick={()=>onDetail(c.id)}>Detail Case</button></div>
  </div>)}</div>
  {selected&&selected.referral&&<div className="referralReview">
   <div className="reviewHead"><div><b>Verifikasi Rujukan · {selected.referral.id}</b><span>{selected.name} · {selected.referral.status}</span></div><button className="reviewClear" onClick={()=>{setSelectedId(null);onViewBenefit("")}}>Tutup</button></div>
   <div className="detailGrid detailGridWide caseDetailGrid">
    <div><span>Jenis Rujukan</span><b>{selected.referral.kind}</b></div>
    <div><span>Faskes Asal</span><b>{selected.provider}</b></div>
    <div><span>Faskes Tujuan</span><b>{selected.referral.targetProviderName} (FKRTL)</b></div>
    <div><span>Poli</span><b>{selected.referral.specialty}</b></div>
    <div><span>Nomor Rujukan</span><b>{selected.referral.refNumber}</b></div>
    <div><span>Dokter Perujuk</span><b>{selected.referral.doctor}</b></div>
    <div><span>Diagnosis</span><b>{selected.referral.diagnosis}</b></div>
    <div><span>Indikasi Medis</span><b>{selected.referral.reason}</b></div>
    <div><span>Referensi Dokumen</span><b>{selected.referral.documentReference}</b></div>
    <div><span>Keputusan</span><b>{selected.referral.status}</b></div>
    {selected.referral.reviewNote&&<div><span>Catatan Call Center</span><b>{selected.referral.reviewNote}</b></div>}
    {selected.referral.linkedCaseId&&<div><span>Episode FKRTL</span><b>{selected.referral.linkedCaseId}</b></div>}
   </div>
   <div className="workflowActions"><span>Periksa benefit dan validitas dokumen sebelum memilih keputusan. Catat nama verifier dan pertimbangannya.</span>
   {selected.referral.status==="Pending Verification"?<div className="referralRowButtons">
    <button className="primary" onClick={()=>onReview(selected.id,"Approved")}><CheckCircle2 size={16}/>Approve & Buat FKRTL</button>
    <button className="reviewClear" onClick={()=>onReview(selected.id,"Need Revision")}>Need Revision</button>
    <button className="dangerBtn" onClick={()=>onReview(selected.id,"Rejected")}>Reject</button>
   </div>:<span className="muted">{selected.referral.status==="Approved"?"Approved — episode FKRTL tersedia":"Menunggu tindak lanjut atau keputusan baru"}</span>}
   </div>
  </div>}
 </section>;
}
