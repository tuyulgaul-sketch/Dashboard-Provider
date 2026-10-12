
type DemoMember={cardNo:string;name:string;company:string;policyNo:string;planName:string;product:string;faskes1Code:string};
type DemoStatus="Waiting Admission"|"Treatment Active"|"Waiting Treatment Approval"|"Treatment Approved"|"Waiting Discharge"|"Closed";
type DemoHistory={at:number;actor:string;event:string;detail?:string};
export type DemoCase={
 id:string;name:string;memberId:string;company:string;provider:string;providerCode:string;status:DemoStatus;urgent:boolean;submittedAt:number;
 issue:string;visitType:string;careLevel:"FKTP"|"FKRTL";accessRoute:"FKTP"|"Emergency"|"Referral";policyNo:string;planName:string;demo:true;
 urgencyReason?:string;parentCaseId?:string;originReferralId?:string;specialty?:string;
 treatmentRequest?:{diagnosis:string;procedure:string;medication:string;reason:string;estimatedCost:number;submittedAt:number};
 treatmentApproval?:{doctor:string;note:string;approvedAt:number};
 dischargeRequest?:{finalDiagnosis:string;finalBill:number;notes:string;submittedAt:number};
 dischargeApproval?:{doctor:string;note:string;approvedAt:number};
 billing?:{status:"Submitted"|"Paid";submittedAt:number;updatedAt:number;reminderCount:number};
 claimSubmission?:{
  receiptDate:string;product:string;claimType:string;reimbursementType:string;bankName:string;applicantName:string;participantName:string;participantNo:string;
  phone:string;email:string;description:string;paymentMethod:string;accountNo:string;accountName:string;applicationStatus:string;
  submittedBy:string;receivedBy:string;claimProkes:boolean;submittedAt:number;
  documents:{label:string;submitted:boolean;cs:boolean;cl:boolean;fa:boolean;remark:string}[];
 };
 history:DemoHistory[];
};
const providers=[
 {code:"PRV-HERMINA-KMY-001",name:"RS Hermina Kemayoran"},
 {code:"PRV-KF-CBT-001",name:"Klinik Kimia Farma Cibitung"}
] as const;
const statuses:DemoStatus[]=["Waiting Admission","Treatment Active","Waiting Treatment Approval","Treatment Approved","Waiting Discharge","Closed"];
const templates=[
 ["Demam, batuk, dan pilek","ISPA akut","Konsultasi dan pemeriksaan dokter","Terapi simptomatik",375000],
 ["Nyeri gigi geraham","Karies dentin","Pemeriksaan dan tindakan konservatif gigi","Analgesik sesuai indikasi",485000],
 ["Nyeri ulu hati disertai mual","Dispepsia","Pemeriksaan klinis dan observasi","Terapi saluran cerna",420000],
 ["Nyeri sendi dan otot","Mialgia","Pemeriksaan klinis dan edukasi","Analgesik sesuai hasil pemeriksaan",315000],
 ["Kontrol tekanan darah","Hipertensi esensial","Monitoring tekanan darah dan konsultasi","Obat berdasarkan resep dokter",525000],
 ["Mual, muntah, dan lemas","Gastroenteritis akut","Evaluasi hidrasi dan pemeriksaan fisik","Terapi rehidrasi",675000]
] as const;
const documents=["Formulir Keterangan Medis","Surat Rujukan","Resume Medis","Perincian Biaya","Kwitansi Asli","Resep","Hasil Pemeriksaan"];
const hist=(at:number,event:string,actor:string,detail?:string):DemoHistory=>({at,event,actor,detail});

/** Uses only members uploaded into the current browser; never manufactures member identities. */
export function makeProviderDemoCases(activeMembers:DemoMember[]):{cases:DemoCase[];uniqueMembers:number;referrals:number}{
 const eligible=activeMembers.filter(m=>m.cardNo.trim()&&m.name.trim());
 const perProvider=providers.map(p=>eligible.filter(m=>m.faskes1Code?.trim().toUpperCase()===p.code));
 const planned:{member:DemoMember;provider:typeof providers[number];emergency:boolean}[]=[];
 for(let row=0;planned.length<20;row++){
  let inserted=false;
  for(let p=0;p<providers.length&&planned.length<20;p++){
   const member=perProvider[p][row];
   if(member){planned.push({member,provider:providers[p],emergency:false});inserted=true}
  }
  if(!inserted)break;
 }
 const selected=new Set(planned.map(x=>x.member.cardNo.toLowerCase()));
 eligible.filter(m=>!selected.has(m.cardNo.toLowerCase())).slice(0,4)
  .forEach(member=>planned.push({member,provider:providers[0],emergency:true}));
 const now=Date.now(),batch=now.toString(36).toUpperCase();
 const cases:DemoCase[]=[];
 let referrals=0;
 planned.forEach(({member,provider,emergency},i)=>{
  const [issue,diagnosis,procedure,medication,cost]=templates[i%templates.length];
  const status=statuses[i%statuses.length],at=now-(planned.length-i)*20*60000;
  const id="SIM-"+batch+"-"+String(i+1).padStart(3,"0"),history:DemoHistory[]=[
   hist(at,emergency?"Emergency Admission Submitted [DUMMY]":"FKTP Admission Submitted [DUMMY]",provider.name,issue)
  ];
  const care:DemoCase={id,name:member.name,memberId:member.cardNo,company:member.company,
   provider:provider.name,providerCode:provider.code,status,urgent:emergency,submittedAt:at,issue,
   visitType:emergency?"UGD / IGD":i%6===1?"Rawat Gigi FKTP":"Rawat Jalan FKTP",
   careLevel:emergency?"FKRTL":"FKTP",accessRoute:emergency?"Emergency":"FKTP",
   urgencyReason:emergency?"Kunjungan darurat simulasi":undefined,
   policyNo:member.policyNo,planName:member.planName,demo:true,history};
  const stage=statuses.indexOf(status);
  if(stage>=1)history.push(hist(at+60000,"Admission Approved [DUMMY]","Verifier Demo Call Center","Verifikasi simulasi"));
  if(stage>=2){
   care.treatmentRequest={diagnosis,procedure,medication,reason:"Simulasi kebutuhan berdasarkan evaluasi dokter",estimatedCost:cost,submittedAt:at+120000};
   history.push(hist(at+120000,"Treatment Request Submitted [DUMMY]",provider.name,diagnosis));
  }
  if(stage>=3){
   care.treatmentApproval={doctor:"Dokter Simulasi",note:"Approval simulasi — bukan persetujuan layanan riil",approvedAt:at+180000};
   history.push(hist(at+180000,"Treatment Approved [DUMMY]","Dokter Simulasi","Bukan approval medis riil"));
  }
  if(stage>=4){
   care.dischargeRequest={finalDiagnosis:diagnosis,finalBill:cost+75000,notes:"Discharge simulasi",submittedAt:at+240000};
   history.push(hist(at+240000,"Discharge Submitted [DUMMY]",provider.name,"Biaya simulasi"));
  }
  if(stage>=5){
   care.dischargeApproval={doctor:"Dokter Simulasi",note:"Verifikasi final simulasi",approvedAt:at+300000};
   history.push(hist(at+300000,"Final Discharge Approved [DUMMY]","Dokter Simulasi","Case ditutup dalam simulasi"));
   const paid=i%12===5;
   care.billing={status:paid?"Paid":"Submitted",submittedAt:at+360000,updatedAt:at+420000,reminderCount:0};
   care.claimSubmission={
    receiptDate:new Date(at).toISOString().slice(0,10),product:member.product||"Prokes",
    claimType:"Provider",reimbursementType:"Cashless",bankName:"BANK SIMULASI",applicantName:provider.name,
    participantName:member.name,participantNo:member.cardNo,phone:"",email:"",
    description:"DATA DUMMY — bukan pengajuan klaim/pembayaran riil",paymentMethod:"Transfer",
    accountNo:"DUMMY",accountName:"SIMULASI",applicationStatus:"Diterima (Simulasi)",
    submittedBy:"Provider Simulasi",receivedBy:"Call Center Simulasi",claimProkes:true,submittedAt:at+360000,
    documents:documents.map(label=>({label,submitted:false,cs:false,cl:false,fa:false,remark:"Dokumen simulasi"}))
   };
   history.push(hist(at+360000,"Claim Submitted [DUMMY]",provider.name,"Klaim simulasi"));
   if(paid)history.push(hist(at+420000,"Payment Status: Paid [DUMMY]","Call Center Simulasi","Bukan transfer riil"));
  }
  cases.push(care);
 });
 return {cases,uniqueMembers:planned.length,referrals};
}
