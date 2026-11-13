"use client";
import {useEffect,useState} from "react";
import {AlertTriangle,CheckCircle2,Trash2,X} from "lucide-react";

export type ResetScope="transactions"|"all";

type Props={
 caseCount:number;
 memberCount:number;
 onClose:()=>void;
 onConfirm:(scope:ResetScope)=>Promise<void>;
};

export default function ResetDataDialog({caseCount,memberCount,onClose,onConfirm}:Props){
 const [scope,setScope]=useState<ResetScope>("transactions");
 const [confirmation,setConfirmation]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const canReset=!busy&&(scope==="transactions"||confirmation.trim()==="RESET");

 useEffect(()=>{
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const onEscape=(event:KeyboardEvent)=>{
   if(event.key==="Escape"&&!busy){event.preventDefault();onClose();}
  };
  window.addEventListener("keydown",onEscape);
  return ()=>{document.body.style.overflow=previousOverflow;window.removeEventListener("keydown",onEscape);};
 },[busy,onClose]);

 async function confirm(){
  if(!canReset)return;
  setBusy(true);setError("");
  try{await onConfirm(scope);onClose();}
  catch(err){setError(err instanceof Error?err.message:"Reset data gagal. Silakan coba kembali.");}
  finally{setBusy(false);}
 }

 return <div className="providerResetOverlay" role="presentation">
  <section className="providerResetDialog" role="dialog" aria-modal="true" aria-labelledby="provider-reset-title" aria-describedby="provider-reset-description">
   <div className="providerResetHeader">
    <div className="providerResetIcon"><AlertTriangle size={23}/></div>
    <button type="button" className="providerResetClose" aria-label="Tutup dialog reset" disabled={busy} onClick={onClose}><X size={19}/></button>
   </div>
   <h2 id="provider-reset-title">Reset Data Dashboard Provider</h2>
   <p id="provider-reset-description">Hanya berlaku untuk data prototype yang tersimpan pada browser ini. Pilih cakupan reset sebelum melanjutkan. Data yang dihapus tidak dapat dikembalikan.</p>
   <fieldset className="providerResetChoices" disabled={busy}>
    <legend>Pilih data yang akan dihapus</legend>
    <label className={"providerResetChoice "+(scope==="transactions"?"selected":"")}>
     <input type="radio" name="provider-reset-scope" checked={scope==="transactions"} onChange={()=>{setScope("transactions");setConfirmation("");setError("");}}/>
     <span><strong>Reset Transaksi ({caseCount} episode)</strong><small>Hapus seluruh admission, referral, verifikasi, treatment, discharge, klaim, komentar, riwayat, dan lampiran. Master Peserta dan profil Provider tetap tersimpan.</small></span>
    </label>
    <label className={"providerResetChoice "+(scope==="all"?"selected":"")}>
     <input type="radio" name="provider-reset-scope" checked={scope==="all"} onChange={()=>{setScope("all");setError("");}}/>
     <span><strong>Reset Semua Data Uji ({caseCount} episode + {memberCount} peserta)</strong><small>Hapus seluruh transaksi dan lampiran, Master Peserta, serta kembalikan profil Provider ke pengaturan awal.</small></span>
    </label>
   </fieldset>
   {scope==="all"&&<label className="providerResetPhrase">Ketik <strong>RESET</strong> untuk mengonfirmasi penghapusan seluruh data
    <input type="text" autoComplete="off" spellCheck={false} value={confirmation} onChange={event=>setConfirmation(event.target.value)} placeholder="Ketik RESET"/>
   </label>}
   <div className="providerResetWarning"><AlertTriangle size={17}/><span>Ini bukan reset database pusat. Data di browser atau perangkat lain tidak terpengaruh. Account Switcher pada prototype belum menggunakan autentikasi pengguna.</span></div>
   {error&&<p role="alert" className="providerResetError">{error}</p>}
   <div className="providerResetActions">
    <button type="button" disabled={busy} onClick={onClose}>Batal</button>
    <button type="button" className="providerResetConfirm" disabled={!canReset} onClick={confirm}>{busy?<><span className="providerResetSpinner"/>Menghapus data...</>:<><Trash2 size={16}/>Ya, Reset Data</>}</button>
   </div>
  </section>
 </div>;
}
