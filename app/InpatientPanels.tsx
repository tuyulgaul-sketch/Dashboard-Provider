"use client";
import {useState} from "react";
import {BedDouble,CheckCircle2,Clock3,FileSpreadsheet,ShieldCheck,X} from "lucide-react";
import {
 blankInpatientForm,blankInpatientBilling,CONDITION_LABELS,INPATIENT_COST_CATEGORIES,
 totalSubmitted,totalApproved,withComputedExcess,validateInpatientRequest,dateOffset
} from "./inpatient-model";
import type {InpatientForm,InpatientBilling,InpatientEpisode} from "./inpatient-model";

const rupiah=(v:number)=>"Rp "+Math.max(0,v||0).toLocaleString("id-ID");
type Patient={name:string;memberId:string;company:string;provider:string;gender?:string;dob?:string;planName?:string};
const Field=({label,value,onChange,required=false,placeholder="",type="text"}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean;placeholder?:string;type?:string})=>
 <label className="inpatientField">{label}{required&&<em> *</em>}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required}/></label>;
const Multiline=({label,value,onChange,required=false}:{label:string;value:string;onChange:(v:string)=>void;required?:boolean})=>
 <label className="inpatientField full">{label}{required&&<em> *</em>}<textarea rows={2} value={value} onChange={e=>onChange(e.target.value)} required={required}/></label>;
export function InpatientRequestForm({patient,onSubmit,onCancel}:{patient:Patient;onSubmit:(form:InpatientForm)=>void;onCancel:()=>void}){
 const [form,setForm]=useState<InpatientForm>(blankInpatientForm);
 const [error,setError]=useState("");
 const update=<K extends keyof InpatientForm>(key:K,value:InpatientForm[K])=>setForm(s=>({...s,[key]:value}));
 const money=(raw:string)=>Math.max(0,Number(raw.replace(/\D/g,""))||0);
 const submit=(e:React.FormEvent)=>{e.preventDefault();const validation=validateInpatientRequest(form);if(validation){setError(validation);return;}onSubmit(form)};
 return <section className="card inpatientCard">
  <div className="sectionHead"><div><h2>Surat Permintaan Jaminan Rawat Inap</h2><p>E-form berdasarkan Formulir Prokes. Identitas peserta diisi otomatis dari case.</p></div><button className="reviewClear" type="button" onClick={onCancel}><X size={16}/> Batal</button></div>
  <form className="inpatientEform" onSubmit={submit}>
   <h3>1. Identitas Pasien dan Informasi Kamar</h3>
   <div className="inpatientIdentity">
    <div><span>Nama Pasien</span><strong>{patient.name}</strong></div>
    <div><span>No. Peserta</span><strong>{patient.memberId}</strong></div>
    <div><span>Perusahaan</span><strong>{patient.company}</strong></div>
    <div><span>Provider</span><strong>{patient.provider}</strong></div>
    <div><span>Jenis Kelamin / Tanggal Lahir</span><strong>{patient.gender||"-"} / {patient.dob||"-"}</strong></div>
    <div><span>Managed Health Care Plan</span><strong>{patient.planName||"-"}</strong></div>
   </div>
   <div className="inpatientFields">
    <Field label="Tanggal Masuk" type="date" required value={form.admissionDate} onChange={v=>update("admissionDate",v)}/>
    <Field label="Diagnosis Masuk" required value={form.admissionDiagnosis} onChange={v=>update("admissionDiagnosis",v)}/>
    <Field label="Kelas Kamar" required value={form.roomClass} onChange={v=>update("roomClass",v)}/>
    <label className="inpatientField">Tarif Kamar per Hari (Rp) *<input inputMode="numeric" value={form.roomRate||""} onChange={e=>update("roomRate",money(e.target.value))} required/></label>
    <Field label="Jenis Plan (Supra/Utama/Madya/Standar)" value={form.managedCarePlan} onChange={v=>update("managedCarePlan",v)}/>
    <label className="inpatientField">Hak Kamar Peserta (Rp)<input inputMode="numeric" value={form.roomEntitlement||""} onChange={e=>update("roomEntitlement",money(e.target.value))}/></label>
   </div>
   <h3>2. Indikasi Medis & Pemeriksaan</h3>
   <div className="inpatientFields">
    <Multiline label="Keluhan Utama (Indikasi Kuat Rawat Inap)" required value={form.mainComplaint} onChange={v=>update("mainComplaint",v)}/>
    <Multiline label="Keluhan Tambahan" value={form.additionalComplaint} onChange={v=>update("additionalComplaint",v)}/>
    <Field label="Lama Keluhan Dirasakan" value={form.symptomDuration} onChange={v=>update("symptomDuration",v)}/>
    <Field label="Kesadaran" value={form.consciousness} onChange={v=>update("consciousness",v)}/>
    <Field label="GCS" value={form.gcs} onChange={v=>update("gcs",v)}/>
    <Field label="Tekanan Darah / TTD" value={form.bloodPressure} onChange={v=>update("bloodPressure",v)}/>
    <Field label="Nadi" value={form.pulse} onChange={v=>update("pulse",v)}/>
    <Field label="RR" value={form.respiratoryRate} onChange={v=>update("respiratoryRate",v)}/>
    <Field label="Suhu" value={form.temperature} onChange={v=>update("temperature",v)}/>
    <label className="inpatientField">Tujuan Perawatan<select value={form.carePurpose} onChange={e=>update("carePurpose",e.target.value as InpatientForm["carePurpose"])}><option value="Observasi">Observasi</option><option value="Terapi/Tindakan bedah">Terapi/Tindakan bedah</option></select></label>
    <Multiline label="Etiologi Diagnosa" value={form.etiology} onChange={v=>update("etiology",v)}/>
    <Multiline label="Pemeriksaan Penunjang" value={form.supportingExams} onChange={v=>update("supportingExams",v)}/>
    <Multiline label="Diagnosis" required value={form.diagnosis} onChange={v=>update("diagnosis",v)}/>
    <Multiline label="Jenis Terapi dan Obat-obatan" value={form.therapies} onChange={v=>update("therapies",v)}/>
    <Multiline label="Riwayat Perawatan Sebelumnya" value={form.priorCare} onChange={v=>update("priorCare",v)}/>
    <Field label="Dokter dan Instansi Perujuk (jika ada)" value={form.referringDoctor} onChange={v=>update("referringDoctor",v)}/>
    <Multiline label="Tindakan / Operasi yang Direncanakan" value={form.plannedProcedure} onChange={v=>update("plannedProcedure",v)}/>
    <Multiline label="Alasan Jenis Tindakan" value={form.procedureReason} onChange={v=>update("procedureReason",v)}/>
    <label className="inpatientField">Perkiraan Lama Perawatan (Hari) *<input type="number" min={1} max={180} step={1} value={form.estimatedDays} onChange={e=>update("estimatedDays",Number(e.target.value))} required/></label>
   </div>
   <h3>3. Pertanyaan Kondisi Terkait</h3>
   <div className="inpatientConditions">{CONDITION_LABELS.map(label=><label key={label}><span>{label}</span><select value={form.conditions[label]||""} onChange={e=>update("conditions",{...form.conditions,[label]:e.target.value as "Ya"|"Tidak"|""})}><option value="">Belum diisi</option><option>Ya</option><option>Tidak</option></select></label>)}</div>
   <div className="inpatientFields"><Multiline label="Jika Ya, Harap Jelaskan" value={form.conditionNotes} onChange={v=>update("conditionNotes",v)}/></div>
   <h3>4. Pernyataan Dokter / Provider</h3>
   <div className="inpatientFields">
    <Field label="Nama Jelas Dokter Pemeriksa" required value={form.physicianName} onChange={v=>update("physicianName",v)}/>
    <Field label="Nama / Stempel Rumah Sakit (identitas)" value={form.hospitalSignatory} onChange={v=>update("hospitalSignatory",v)}/>
    <Field label="Tempat dan Tanggal" value={form.declaredAt} onChange={v=>update("declaredAt",v)}/>
   </div>
   <p className="inpatientNote">Pernyataan dokter: seluruh informasi di atas benar menurut pengetahuan dan keyakinan pengisi. Prototype e-form ini belum menjadi tanda tangan digital dokter atau stempel RS.</p>
   {error&&<div className="caseUploadError" role="alert">{error}</div>}
   <div className="inpatientActions"><button className="primary" type="submit"><BedDouble size={17}/> Kirim Permintaan Rawat Inap</button></div>
  </form>
 </section>;
}
export function InpatientBillingForm({patient,episode,onSubmit,onCancel,uploadSlot,disabled=false}:{
 patient:Patient;episode:InpatientEpisode;onSubmit:(form:InpatientBilling)=>void;onCancel:()=>void;uploadSlot?:React.ReactNode;disabled?:boolean;
}){
 const [form,setForm]=useState<InpatientBilling>(()=>blankInpatientBilling(episode.request.admissionDate));
 const [error,setError]=useState("");
 const update=(key:keyof InpatientBilling,value:string)=>setForm(v=>({...v,[key]:value}));
 const changeCost=(index:number,value:number)=>setForm(v=>({...v,lines:v.lines.map((x,i)=>i===index?{...x,submitted:Math.max(0,value)}:x)}));
 const submit=(e:React.FormEvent)=>{
  e.preventDefault();
  if(!form.exitDate||!form.finalDiagnosis.trim()){setError("Tanggal keluar dan diagnosis akhir wajib diisi.");return;}
  if(form.exitDate<episode.request.admissionDate){setError("Tanggal keluar tidak boleh sebelum tanggal masuk.");return;}
  if(totalSubmitted(form.lines)<=0){setError("Isi minimal satu komponen biaya yang diajukan.");return;}
  setError("");onSubmit(form);
 };
 return <section className="card inpatientCard">
  <div className="sectionHead"><div><h2>Perhitungan Billing Pasien Pulang Rawat Inap</h2><p>Form sesuai struktur perhitungan pasien pulang. Provider hanya mengisi biaya yang diajukan.</p></div><button className="reviewClear" onClick={onCancel}><X size={16}/> Batal</button></div>
  <form className="inpatientEform" onSubmit={submit}>
   <h3>1. Identitas Pasien</h3>
   <div className="inpatientIdentity">
    <div><span>Nama Peserta</span><strong>{patient.name}</strong></div>
    <div><span>No. Peserta</span><strong>{patient.memberId}</strong></div>
    <div><span>Perusahaan</span><strong>{patient.company}</strong></div>
    <div><span>Rumah Sakit</span><strong>{patient.provider}</strong></div>
   </div>
   <h3>2. Informasi Perawatan</h3>
   <div className="inpatientFields">
    <Field label="Hak Kamar" value={form.roomEntitlementDescription} onChange={v=>update("roomEntitlementDescription",v)}/>
    <Field label="Kamar Toleransi Perawatan 2×24 Jam" value={form.roomTolerance} onChange={v=>update("roomTolerance",v)}/>
    <Field label="Kamar Perawatan Saat Ini" value={form.roomOccupied} onChange={v=>update("roomOccupied",v)}/>
    <Field label="Kamar ICU / HCU / NICU" value={form.icuRoom} onChange={v=>update("icuRoom",v)}/>
    <Field label="Kamar Intermediate" value={form.intermediateRoom} onChange={v=>update("intermediateRoom",v)}/>
    <label className="inpatientField">Tanggal Masuk<input value={episode.request.admissionDate} readOnly/></label>
    <Field label="Tanggal Keluar" type="date" required value={form.exitDate} onChange={v=>update("exitDate",v)}/>
    <Field label="Prorate" value={form.prorate} onChange={v=>update("prorate",v)}/>
    <div className="inpatientDuration"><Clock3 size={15}/> Durasi kalender: {Math.max(0,Math.round((new Date(form.exitDate+"T12:00:00").getTime()-new Date(episode.request.admissionDate+"T12:00:00").getTime())/86400000))} hari</div>
   </div>
   <h3>3. Assessment — Biaya yang Diajukan Provider</h3>
   <p className="inpatientNote">Kolom Biaya Disetujui dan Biaya Tidak Dijaminkan akan diisi/ditentukan Call Center pada tahap verifikasi.</p>
   <div className="inpatientBillTable"><table><thead><tr><th>Manfaat Benefit</th><th>Biaya yang Diajukan (Rp)</th><th>Biaya yang Disetujui</th><th>Biaya Tidak Dijaminkan</th></tr></thead><tbody>
    {form.lines.map((line,i)=><tr key={line.category}><td>{line.category}</td><td><input inputMode="numeric" aria-label={"Biaya yang diajukan: "+line.category} value={line.submitted||""} onChange={e=>changeCost(i,Number(e.target.value.replace(/\D/g,""))||0)}/></td><td className="inpatientLockedCell">Diisi PertaLife</td><td className="inpatientLockedCell">Diisi PertaLife</td></tr>)}
    <tr className="inpatientBillTotal"><td>TOTAL</td><td>{rupiah(totalSubmitted(form.lines))}</td><td>—</td><td>—</td></tr>
   </tbody></table></div>
   <h3>4. Diagnosis & Catatan Pasien Pulang</h3>
   <div className="inpatientFields">
    <Multiline label="Diagnosa Akhir" required value={form.finalDiagnosis} onChange={v=>update("finalDiagnosis",v)}/>
    <Multiline label="Obat yang Dibawa Pulang" value={form.homeMedication} onChange={v=>update("homeMedication",v)}/>
    <Multiline label="Catatan Provider" value={form.providerNotes} onChange={v=>update("providerNotes",v)}/>
   </div>
   {uploadSlot}
   {error&&<div className="caseUploadError" role="alert">{error}</div>}
   <div className="inpatientActions"><button className="primary" type="submit" disabled={disabled}><FileSpreadsheet size={17}/> Submit Perhitungan Pasien Pulang</button></div>
  </form>
 </section>;
}
type ReviewMode="admission"|"extension"|"billing";
export function InpatientReviewModal({mode,episode,patient,onClose,onDecision}:{
 mode:ReviewMode;episode:InpatientEpisode;patient:Patient;onClose:()=>void;
 onDecision:(review:{doctor:string;days:number;note:string;approvedCosts?:number[];nonCoveredExplanation?:string;bufferNotes?:string})=>void;
}){
 const [doctor,setDoctor]=useState("");
 const [days,setDays]=useState(mode==="admission"?episode.request.estimatedDays:1);
 const [note,setNote]=useState("");
 const [approved,setApproved]=useState<number[]>(episode.billing?.lines.map(line=>line.submitted)||[]);
 const [nonCovered,setNonCovered]=useState("");
 const [bufferNotes,setBufferNotes]=useState("");
 const [error,setError]=useState("");
 const pending=episode.extensions.findLast(x=>x.status==="Pending");
 const billing=episode.billing;
 const total=billing?totalSubmitted(billing.lines):0;
 const approvedTotal=approved.reduce((n,v)=>n+v,0);
 const submit=(e:React.FormEvent)=>{
  e.preventDefault();
  if(!doctor.trim()||!note.trim()){setError("Nama dokter dan catatan persetujuan/pertimbangan wajib diisi.");return;}
  if(mode!=="billing"&&(!Number.isInteger(days)||days<1||days>180)){setError("Jumlah hari persetujuan harus 1–180 hari.");return;}
  if(mode==="billing"&&billing&&(approved.some((v,i)=>!Number.isFinite(v)||v<0||v>billing.lines[i].submitted))){
   setError("Biaya yang disetujui tidak boleh melebihi biaya diajukan dan tidak boleh negatif.");return;
  }
  onDecision({doctor:doctor.trim(),days:mode==="billing"?0:days,note:note.trim(),approvedCosts:mode==="billing"?approved:undefined,
   nonCoveredExplanation:nonCovered,bufferNotes});
 };
 return <div className="caseModalOverlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="card inpatientReviewDialog" role="dialog" aria-modal="true" aria-labelledby="inpatient-review-title">
   <div className="medicalApprovalHeading"><div><h2 id="inpatient-review-title">{mode==="admission"?"Approval Permintaan Rawat Inap":mode==="extension"?"Approval Perpanjangan Rawat Inap":"Verifikasi Perhitungan Pasien Pulang"}</h2><p>{patient.name} · {patient.memberId} · {patient.provider}</p></div><button type="button" className="reviewClear" onClick={onClose}><X size={16}/> Tutup</button></div>
   <form onSubmit={submit} className="inpatientReviewBody">
    {mode==="admission"&&<div className="inpatientReviewSummary"><span>Indikasi: {episode.request.mainComplaint}</span><span>Diagnosis: {episode.request.diagnosis}</span><span>Perkiraan Provider: {episode.request.estimatedDays} hari</span><span>Tanggal Masuk: {episode.request.admissionDate}</span><span>Dokter Pemeriksa: {episode.request.physicianName}</span></div>}
    {mode==="extension"&&<div className="inpatientReviewSummary"><span>Alasan Extend: {pending?.reason||"-"}</span><span>Tanggal Akhir Jaminan Saat Ini: {episode.extensions.filter(x=>x.status==="Approved").at(-1)?.endDate||episode.approval?.endDate||"-"}</span></div>}
    {mode==="billing"&&billing&&<>
     <div className="inpatientReviewSummary"><span>Diagnosis Akhir: {billing.finalDiagnosis}</span><span>Periode: {episode.request.admissionDate} s.d. {billing.exitDate}</span><strong>Tagihan Provider: {rupiah(total)}</strong></div>
     <div className="inpatientBillTable"><table><thead><tr><th>Manfaat</th><th>Diajukan</th><th>Disetujui (input PertaLife)</th><th>Tidak Dijaminkan (otomatis)</th></tr></thead><tbody>
      {billing.lines.map((line,i)=><tr key={line.category}><td>{line.category}</td><td>{rupiah(line.submitted)}</td><td><input type="number" min={0} max={line.submitted} value={approved[i]??0} aria-label={"Biaya disetujui "+line.category} onChange={e=>setApproved(v=>v.map((x,j)=>j===i?Number(e.target.value):x))}/></td><td>{rupiah(Math.max(0,line.submitted-(approved[i]||0)))}</td></tr>)}
      <tr className="inpatientBillTotal"><td>TOTAL</td><td>{rupiah(total)}</td><td>{rupiah(approvedTotal)}</td><td>{rupiah(Math.max(0,total-approvedTotal))}</td></tr>
     </tbody></table></div>
     <label className="inpatientField">Penjelasan Biaya Tidak Dijaminkan<textarea value={nonCovered} onChange={e=>setNonCovered(e.target.value)} rows={2} placeholder="Contoh sumber lampiran: glove non steril, konsul gizi"/></label>
     <label className="inpatientField">Catatan Buffer / Excess<textarea value={bufferNotes} onChange={e=>setBufferNotes(e.target.value)} rows={2} placeholder="Bila ada ketentuan buffer atau excess"/></label>
    </>}
    {mode!=="billing"&&<label className="inpatientField">Jumlah Hari {mode==="extension"?"Tambahan yang Disetujui":"Rawat Inap yang Disetujui"} *<input autoFocus type="number" min={1} max={180} step={1} value={days} onChange={e=>setDays(Number(e.target.value))} required/></label>}
    {mode!=="billing"&&<div className="inpatientNote">Tanggal akhir persetujuan dihitung dari tanggal masuk / tanggal akhir jaminan sebelumnya. Provider dapat mengajukan discharge lebih awal.</div>}
    <label className="inpatientField">Dokter Pemberi Approval *<input value={doctor} onChange={e=>setDoctor(e.target.value)} autoFocus={mode==="billing"} required/></label>
    <label className="inpatientField">Catatan Approval / Pertimbangan Medis *<textarea value={note} rows={3} onChange={e=>setNote(e.target.value)} required/></label>
    {error&&<div className="caseUploadError" role="alert">{error}</div>}
    <div className="medicalApprovalActions"><button type="button" className="reviewClear" onClick={onClose}>Batal</button><button className="primary" type="submit"><ShieldCheck size={16}/> Simpan Persetujuan PertaLife</button></div>
   </form>
  </section>
 </div>;
}
