"use client";
import {FilePlus2,FileText,X} from "lucide-react";
import {CASE_FILE_LIMIT,fileSizeLabel} from "./case-files";
import type {CaseFileMeta} from "./case-files";

type Props={
 title?:string;existing:readonly CaseFileMeta[];pending:readonly File[];
 disabled?:boolean;required?:boolean;maxTotalMB?:number;accept?:string;onAdd:(files:File[])=>void;onRemove:(index:number)=>void;
};
export default function CaseFilePicker({title="Lampirkan Dokumen",existing,pending,disabled=false,required=false,maxTotalMB=10,accept,onAdd,onRemove}:Props){
 const used=existing.reduce((sum,file)=>sum+file.size,0)+pending.reduce((sum,file)=>sum+file.size,0);
 const count=existing.length+pending.length;
 const maxBytes=maxTotalMB*1024*1024;
 const full=count>=CASE_FILE_LIMIT||used>=maxBytes;
 return <div className="caseFilePicker">
  <div className="caseFilePickerHead"><div><strong>{title}</strong><span>{accept?"PDF, JPG, JPEG, PNG":"Semua tipe file"} · Maksimal 10 dokumen per case · Total gabungan {maxTotalMB} MB. {required?"Minimal 1 bukti tagihan wajib.":"Opsional."}</span></div><span className="caseFileQuota">{count}/{CASE_FILE_LIMIT} file · {fileSizeLabel(used)}/{maxTotalMB} MB</span></div>
  <label className={"caseFileChoose "+(full||disabled?"disabled":"")}>
   <FilePlus2 size={17}/> {full?"Batas dokumen tercapai":"Pilih Dokumen"} 
   <input type="file" multiple accept={accept} disabled={disabled||full} aria-label={"Unggah dokumen pendukung, maksimal 10 file dan "+maxTotalMB+" MB gabungan"} onChange={event=>{onAdd(Array.from(event.currentTarget.files||[]));event.currentTarget.value="";}}/>
  </label>
  {!!pending.length&&<div className="caseFilePending">
   {pending.map((file,index)=><div className="caseFilePendingRow" key={index+"-"+file.name}><FileText size={14}/><span title={file.name}>{file.name}</span><small>{fileSizeLabel(file.size)}</small><button type="button" aria-label={"Hapus file "+file.name} disabled={disabled} onClick={()=>onRemove(index)}><X size={14}/></button></div>)}
  </div>}
  <small className="caseFileLocalDisclaimer">Simulasi: isi file disimpan lokal di browser ini (IndexedDB), tidak terkirim ke server atau perangkat lain. Gunakan dokumen dummy saja.</small>
 </div>;
}
