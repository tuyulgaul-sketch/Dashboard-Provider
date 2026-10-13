import type {CaseFileMeta} from "./case-files";
export const CLAIM_MAX_FILES=10;
export const CLAIM_MAX_BYTES=20*1024*1024;
export type ClaimVisitSource={careLevel?:"FKTP"|"FKRTL";accessRoute?:"FKTP"|"Referral"|"Emergency";visitType:string;provider:string;inpatient?:{state?:string}};
export function claimTypeFromAdmission(c:ClaimVisitSource):string{
 if(c.inpatient?.state==="Discharged")return "Rawat Inap";
 const visit=(c.visitType||"").toLowerCase();
 if(c.accessRoute==="Emergency"||/\bigd\b|\bugd\b|gawat darurat|pertolongan darurat/.test(visit))return "IGD / Emergency";
 if(/rawat inap|inap|hospitalisasi/.test(visit))return "Rawat Inap";
 if(/gigi/.test(visit))return "Rawat Jalan Gigi";
 if(c.careLevel==="FKRTL"||c.accessRoute==="Referral"||/spesialis/.test(visit))return "Rawat Jalan Spesialis";
 return "Rawat Jalan FKTP";
}
export function claimTypeSummary(cases:readonly ClaimVisitSource[]):string{
 const types=Array.from(new Set(cases.map(claimTypeFromAdmission)));
 return types.length===1?types[0]:types.join(" + ");
}
export function validateClaimFiles(existing:readonly CaseFileMeta[],pending:readonly File[],incoming:readonly File[]=[]):void{
 const count=existing.length+pending.length+incoming.length;
 const size=existing.reduce((n,f)=>n+f.size,0)+[...pending,...incoming].reduce((n,f)=>n+f.size,0);
 if(count>CLAIM_MAX_FILES)throw new Error("Batas dokumen klaim adalah 10 file untuk satu nomor pengajuan (single ataupun bundle).");
 if(size>CLAIM_MAX_BYTES)throw new Error("Total dokumen klaim maksimum 20 MB untuk satu nomor pengajuan. Ukuran saat ini "+(size/1024/1024).toFixed(2)+" MB.");
}
