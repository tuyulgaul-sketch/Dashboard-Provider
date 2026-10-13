"use client";
import {FilePlus2,FileText,X} from "lucide-react";
import {CASE_FILE_LIMIT,CASE_FILE_TOTAL_BYTES,fileSizeLabel} from "./case-files";
import type {CaseFileMeta} from "./case-files";

type Props={
 title?:string;existing:readonly CaseFileMeta[];pending:readonly File[];
 disabled?:boolean;onAdd:(files:File[])=>void;onRemove:(index:number)=>void;
};
export default function CaseFilePicker({title="Lampirkan Dokumen",existing,pending,disabled=false,onAdd,onRemove}:Props){
 const used=existing.reduce((sum,file)=>sum+file.size,0)+pending.reduce((sum,file)=>sum+file.size,0);
 const count=existing.length+pending.length;
 const full=count>=CASE_FILE_LIMIT||used>=CASE_FILE_TOTAL_BYTES;
 return <div className="caseFilePicker">
  <div className="caseFilePickerHead"><div><strong>{title}</strong><span>Semua tipe file · Maksimal 10 dokumen per case · Total gabungan 10 MB. Opsional.</span></div><span className="caseFileQuota">{count}/{CASE_FILE_LIMIT} file · {fileSizeLabel(used)}/10 MB</span></div>
  <label className={"caseFileChoose "+(full||disabled?"disabled":"")}>
   <FilePlus2 size={17}/> {full?"Batas dokumen tercapai":"Pilih Dokumen"} 
   <input type="file" multiple disabled={disabled||full} aria-label="Unggah dokumen pendukung, maksimal 10 file dan 10 MB gabungan" onChange={event=>{onAdd(Array.from(event.currentTarget.files||[]));event.currentTarget.value="";}}/>
  </label>
  {!!pending.length&&<div className="caseFilePending">
   {pending.map((file,index)=><div className="caseFilePendingRow" key={index+"-"+file.name}><FileText size={14}/><span title={file.name}>{file.name}</span><small>{fileSizeLabel(file.size)}</small><button type="button" aria-label={"Hapus file "+file.name} disabled={disabled} onClick={()=>onRemove(index)}><X size={14}/></button></div>)}
  </div>}
  <small className="caseFileLocalDisclaimer">Simulasi: isi file disimpan lokal di browser ini (IndexedDB), tidak terkirim ke server atau perangkat lain. Gunakan dokumen dummy saja.</small>
 </div>;
}
