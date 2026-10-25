/** E-form models grounded in the uploaded Prokes Rawat Inap PDF and
 * Perhitungan Billing Pasien Pulang Rawat Inap worksheet. Browser prototype only. */
export const INPATIENT_COST_CATEGORIES=[
 "Biaya Kamar Per Hari",
 "Biaya Obat -Obatan & Alkes",
 "Obat-obatan AB3 (75%)",
 "Obat-obatan AB3 (25%)",
 "Biaya Penunjang Diagnostik",
 "Biaya Visite Dokter Per Hari",
 "Biaya Konsul Dokter Per Hari",
 "Biaya Tindakan Perawatan & Jasa Perawatan",
 "Administrasi",
 "UGD",
 "Kamar Operasi",
 "Biaya Dokter Operator",
 "Biaya Dokter Anastesi",
 "Biaya Obat & Alkes Kamar Operasi"
] as const;
export const CONDITION_LABELS=[
 "Kelainan Bawaan","Herediter","Kecelakaan","Kehamilan",
 "Orang Dalam Gangguan Jiwa (ODGJ)","Kesuburan / Fertilitas",
 "Gangguan Hormonal","Kosmetik atau Estetika","Penyakit Menular Seksual","Tindakan bunuh diri"
] as const;
export type InpatientForm={
 admissionDate:string;admissionDiagnosis:string;roomClass:string;roomRate:number;
 managedCarePlan:string;roomEntitlement:number;
 mainComplaint:string;additionalComplaint:string;symptomDuration:string;
 consciousness:string;gcs:string;bloodPressure:string;pulse:string;respiratoryRate:string;temperature:string;
 carePurpose:"Observasi"|"Terapi/Tindakan bedah";etiology:string;supportingExams:string;diagnosis:string;
 therapies:string;priorCare:string;referringDoctor:string;plannedProcedure:string;procedureReason:string;
 estimatedDays:number;conditions:Record<string,"Ya"|"Tidak"| "">;conditionNotes:string;
 physicianName:string;hospitalSignatory:string;declaredAt:string;
};
export type InpatientApproval={doctor:string;days:number;note:string;approvedAt:number;startDate:string;endDate:string};
export type InpatientExtension={id:string;reason:string;requestedAt:number;status:"Pending"|"Approved";doctor?:string;approvedDays?:number;note?:string;reviewedAt?:number;endDate?:string};
export type InpatientBillLine={category:string;submitted:number;approved?:number;excluded?:number};
export type InpatientBilling={
 exitDate:string;roomEntitlementDescription:string;roomTolerance:string;roomOccupied:string;
 icuRoom:string;intermediateRoom:string;prorate:string;
 finalDiagnosis:string;nonCoveredExplanation?:string;homeMedication:string;providerNotes:string;
 lines:InpatientBillLine[];submittedAt:number;reviewedAt?:number;
 bufferNotes?:string;callCenterNotes?:string;reviewerDoctor?:string;
};
export type InpatientEpisode={
 state:"Waiting Approval"|"Active"|"Waiting Extension"|"Waiting Discharge"|"Discharged";
 request:InpatientForm;requestedAt:number;
 approval?:InpatientApproval;
 extensions:InpatientExtension[];
 billing?:InpatientBilling;
};
export function isHospitalEligible(providerCode?:string,providerType?:string){
 // Pilot hospital: Hermina supports FKTP + FKRTL + emergency under one roof.
 return providerCode==="PRV-HERMINA-KMY-001"||providerType?.toLowerCase()==="rumah sakit";
}
export function isoToday(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
export function dateOffset(iso:string,deltaDays:number){
 const d=new Date(iso+"T12:00:00");
 if(Number.isNaN(d.getTime()))return "";
 d.setDate(d.getDate()+deltaDays);
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
export function isExtensionWindow(endDate:string,today=isoToday()){
 const lastDayMinusOne=dateOffset(endDate,-1);
 return !!endDate&&today>=lastDayMinusOne;
}
export function totalSubmitted(lines:InpatientBillLine[]){return lines.reduce((n,x)=>n+(x.submitted||0),0)}
export function totalApproved(lines:InpatientBillLine[]){return lines.reduce((n,x)=>n+(x.approved||0),0)}
export function withComputedExcess(lines:InpatientBillLine[]):InpatientBillLine[]{
 return lines.map(x=>({...x,approved:x.approved??0,excluded:Math.max(0,(x.submitted||0)-(x.approved||0))}));
}
export function blankInpatientForm():InpatientForm{
 return {admissionDate:isoToday(),admissionDiagnosis:"",roomClass:"",roomRate:0,managedCarePlan:"",roomEntitlement:0,
 mainComplaint:"",additionalComplaint:"",symptomDuration:"",consciousness:"",gcs:"",bloodPressure:"",pulse:"",respiratoryRate:"",temperature:"",
 carePurpose:"Observasi",etiology:"",supportingExams:"",diagnosis:"",therapies:"",priorCare:"",referringDoctor:"",
 plannedProcedure:"",procedureReason:"",estimatedDays:1,conditions:Object.fromEntries(CONDITION_LABELS.map(c=>[c,""])) as InpatientForm["conditions"],
 conditionNotes:"",physicianName:"",hospitalSignatory:"",declaredAt:isoToday()};
}
export function blankInpatientBilling(admissionDate:string):InpatientBilling{
 return {exitDate:isoToday(),roomEntitlementDescription:"",roomTolerance:"",roomOccupied:"",icuRoom:"",intermediateRoom:"",prorate:"",
 finalDiagnosis:"",homeMedication:"",providerNotes:"",
 lines:INPATIENT_COST_CATEGORIES.map(category=>({category,submitted:0})),submittedAt:0};
}
export function validateInpatientRequest(x:InpatientForm):string|null{
 if(!x.admissionDate||!x.admissionDiagnosis.trim()||!x.mainComplaint.trim()||!x.diagnosis.trim()||!x.physicianName.trim())return "Tanggal masuk, diagnosis masuk, keluhan utama, diagnosis dan nama dokter pemeriksa wajib diisi.";
 if(!["Supra","Utama","Madya","Standar"].includes(x.managedCarePlan))return "Pilih Jenis Plan: Supra, Utama, Madya, atau Standar.";
 if(x.admissionDate!==isoToday())return "Tanggal admission dikunci pada tanggal hari ini. Perubahan tanggal memerlukan bypass resmi Call Center.";
 if(!Number.isInteger(x.estimatedDays)||x.estimatedDays<1||x.estimatedDays>180)return "Estimasi lama rawat harus 1–180 hari.";
 if(!x.carePurpose)return "Tentukan tujuan perawatan.";
 return null;
}
