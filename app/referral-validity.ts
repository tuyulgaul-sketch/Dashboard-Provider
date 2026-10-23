/** Rules for the local prototype only. Server-side enforcement is required for production. */
export const REFERRAL_MAX_VISITS=3;
export const REFERRAL_VALID_MONTHS=3;
export type ReferralValidityInput={
 status:string;
 reviewedAt?:number;
 specialistDoctor?:string;
};
/** End of calendar date exactly three months after approval (clamped for short months). */
export function referralExpiresAt(approvedAt:number):number{
 const start=new Date(approvedAt);
 if(!Number.isFinite(start.getTime()))return 0;
 const target=new Date(start.getFullYear(),start.getMonth()+REFERRAL_VALID_MONTHS,1);
 const lastDay=new Date(target.getFullYear(),target.getMonth()+1,0).getDate();
 target.setDate(Math.min(start.getDate(),lastDay));
 target.setHours(23,59,59,999);
 return target.getTime();
}
export function referralEligibility(referral:ReferralValidityInput|undefined,used:number,at=Date.now()){
 if(!referral||referral.status!=="Approved"||!referral.reviewedAt)return {valid:false,reason:"Nomor rujukan belum disetujui.",expiresAt:0,used};
 const expiresAt=referralExpiresAt(referral.reviewedAt);
 if(at>expiresAt)return {valid:false,reason:"Nomor rujukan telah melewati masa berlaku 3 bulan kalender.",expiresAt,used};
 if(used>=REFERRAL_MAX_VISITS)return {valid:false,reason:"Nomor rujukan sudah digunakan 3 kali.",expiresAt,used};
 if(!referral.specialistDoctor?.trim())return {valid:false,reason:"Dokter spesialis tujuan belum tercatat; perlu validasi Call Center.",expiresAt,used};
 return {valid:true,reason:"Eligible untuk kunjungan berikutnya pada dokter spesialis yang sama.",expiresAt,used};
}
