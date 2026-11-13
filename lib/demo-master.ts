import {members as sourceMembers} from "./mock-data";

/**
 * Synthetic starter records for the public Managed Care prototype.
 * Never put real participant data in this file or public frontend assets.
 */
export type DemoMasterMember={
 policyNo:string;company:string;department:string;startDate:string;endDate:string;
 membershipNo:string;name:string;employeeName:string;employeeMembershipNo:string;dob:string;
 inception:string;expiry:string;gender:string;maritalStatus:string;relation:string;cardNo:string;
 product:string;planName:string;planCode:string;faskes1Code:string;faskes1Name:string;
};

export const DEMO_CARD_PREFIX="DEMO-";

export function makeDemoMaster():DemoMasterMember[]{
 return sourceMembers.map((source,index)=>{
  const provider=index%2===0
   ? {code:"PRV-HERMINA-KMY-001",name:"RS Hermina Kemayoran"}
   : {code:"PRV-KF-CBT-001",name:"Klinik Kimia Farma Cibitung"};
  const startDate="2026-01-01";
  const endDate=source.active?"2028-12-31":"2026-01-31";
  const cardNo=DEMO_CARD_PREFIX+source.cardNo;
  return {
   policyNo:"DEMO-"+source.policyNo,
   company:source.company,
   department:"Data Uji - Bukan Peserta Asli",
   startDate,endDate,
   membershipNo:"DEMO-MBR-"+String(index+1).padStart(5,"0"),
   name:source.name,
   employeeName:source.relation==="Karyawan"?source.name:"Peserta Simulasi",
   employeeMembershipNo:"DEMO-EMP-"+String(index+1).padStart(5,"0"),
   dob:source.dob,
   inception:startDate,expiry:endDate,
   gender:source.gender==="Laki-laki"?"MALE":"FEMALE",
   maritalStatus:"MARRIED",
   relation:source.relation==="Karyawan"?"EMPLOYEE":source.relation==="Pasangan"?"SPOUSE":"CHILD",
   cardNo,
   product:"Managed Care (Demo)",
   planName:source.plan,
   planCode:"DEMO-PLAN-"+(index+1),
   faskes1Code:provider.code,
   faskes1Name:provider.name
  };
 });
}
