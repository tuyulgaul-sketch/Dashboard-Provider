/* Browser-local binary storage for pilot case attachments.
   Stores File blobs in IndexedDB; only small metadata goes into localStorage.
   No production server, user authentication, cross-device sync, or medical-record retention guarantee. */
export const CASE_FILE_LIMIT=10;
export const CASE_FILE_TOTAL_BYTES=10*1024*1024;
const DB_NAME="pertalife-case-attachments-v1",STORE="files";
export type CaseFileMeta={
 id:string;caseId:string;name:string;size:number;type:string;addedAt:number;
 origin:"admission"|"comment"|"treatment";commentId?:string;
};
type FileRecord={id:string;blob:Blob};
export function fileSizeLabel(bytes:number){
 if(bytes<1024)return bytes+" B";
 if(bytes<1024*1024)return (bytes/1024).toFixed(1)+" KB";
 return (bytes/(1024*1024)).toFixed(2)+" MB";
}
export function validateCaseFiles(existing:readonly CaseFileMeta[],pending:readonly File[],next:readonly File[]){
 const count=existing.length+pending.length+next.length;
 const bytes=existing.reduce((sum,f)=>sum+f.size,0)+
   [...pending,...next].reduce((sum,f)=>sum+f.size,0);
 if(count>CASE_FILE_LIMIT)throw Error("Maksimal "+CASE_FILE_LIMIT+" dokumen per case. Sudah ada "+existing.length+" dokumen tersimpan dan "+pending.length+" dokumen dipilih.");
 if(bytes>CASE_FILE_TOTAL_BYTES)throw Error("Total dokumen maksimal 10 MB per case. Total pilihan "+fileSizeLabel(bytes)+".");
}
function openCaseFileDb():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==="undefined"){reject(new Error("Browser ini tidak mendukung penyimpanan file lokal (IndexedDB)."));return;}
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{
   if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:"id"});
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error("Gagal membuka penyimpanan dokumen."));
 });
}
export async function saveCaseFiles(caseId:string,files:readonly File[],origin:CaseFileMeta["origin"],commentId?:string):Promise<CaseFileMeta[]>{
 if(!files.length)return [];
 const at=Date.now();
 const metadata:CaseFileMeta[]=files.map((file,i)=>({
  id:"CF-"+at.toString(36)+"-"+i+"-"+Math.random().toString(36).slice(2,9),
  caseId,name:file.name,size:file.size,type:file.type||"application/octet-stream",addedAt:at,origin,commentId
 }));
 const db=await openCaseFileDb();
 try{
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(STORE,"readwrite");
   for(let i=0;i<files.length;i++)tx.objectStore(STORE).put({id:metadata[i].id,blob:files[i]} satisfies FileRecord);
   tx.oncomplete=()=>resolve();
   tx.onerror=()=>reject(tx.error||new Error("Gagal menyimpan lampiran."));
   tx.onabort=()=>reject(tx.error||new Error("Penyimpanan lampiran dibatalkan."));
  });
  return metadata;
 }finally{db.close();}
}
export async function downloadCaseFile(meta:CaseFileMeta):Promise<void>{
 const db=await openCaseFileDb();
 let blob:Blob;
 try{
  blob=await new Promise<Blob>((resolve,reject)=>{
   const req=db.transaction(STORE,"readonly").objectStore(STORE).get(meta.id);
   req.onsuccess=()=>{
    const record=req.result as FileRecord|undefined;
    record?.blob?resolve(record.blob):reject(new Error("File ini tidak ditemukan pada browser ini. Data dokumen belum disinkronkan antarperangkat."));
   };
   req.onerror=()=>reject(req.error||new Error("Gagal membaca dokumen."));
  });
 }finally{db.close();}
 const url=URL.createObjectURL(blob);
 const link=document.createElement("a");
 link.href=url;link.download=meta.name;link.style.display="none";
 document.body.appendChild(link);link.click();link.remove();
 // Release after the browser has started processing the click.
 window.setTimeout(()=>URL.revokeObjectURL(url),3000);
}
