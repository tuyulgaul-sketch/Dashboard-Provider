"use client";
import {useEffect,useMemo,useState} from "react";
import {Activity,AlertTriangle,ArrowRight,Building2,CheckCircle2,ChevronDown,ChevronLeft,ChevronRight,Clock3,Database,Eye,FileCheck2,FileSpreadsheet,Plus,Search,Settings,ShieldCheck,Stethoscope,Trash2,Upload,UserRound,X} from "lucide-react";
import SidebarNavigation from "./SidebarNavigation";
import BenefitCoverage from "./BenefitCoverage";
import {ProviderReferrals,CallCenterReferrals} from "./ReferralPanels";
import type {ReferralDraft,ReferralRequest,ReferralStatus} from "./ReferralPanels";

type Role="provider"|"callcenter";
type CaseStatus="Waiting Admission"|"Treatment Active"|"Waiting Treatment Approval"|"Treatment Approved"|"Waiting Discharge"|"Closed";
type Member={
 policyNo:string;company:string;department:string;startDate:string;endDate:string;
 membershipNo:string;name:string;employeeName:string;employeeMembershipNo:string;dob:string;
 inception:string;expiry:string;gender:string;maritalStatus:string;relation:string;cardNo:string;
 product:string;planName:string;planCode:string;faskes1Code:string;faskes1Name:string;faskes1?:string;
};
type ProviderProfile={
 providerCode:string;providerName:string;providerType:string;address:string;city:string;contactPerson:string;
 phone:string;email:string;paymentMethod:string;bankName:string;accountNo:string;accountName:string;updatedAt?:number;
};
type ClaimDocument={label:string;submitted:boolean;fileName?:string;cs:boolean;cl:boolean;fa:boolean;remark:string};
type ClaimSubmission={
 receiptDate:string;product:string;claimType:string;reimbursementType:string;bankName:string;
 applicantName:string;participantName:string;participantNo:string;phone:string;email:string;description:string;
 paymentMethod:string;accountNo:string;accountName:string;applicationStatus:string;submittedBy:string;receivedBy:string;
 claimProkes:boolean;submittedAt:number;documents:ClaimDocument[];bundleId?:string;bundleCaseIds?:string[];bundleTotalBill?:number;
};
type CaseHistory={at:number;actor:string;event:string;detail?:string};
type CareCase={id:string;name:string;memberId:string;company:string;provider:string;providerCode?:string;status:CaseStatus;urgent:boolean;submittedAt:number;issue:string;visitType:string;careLevel?:"FKTP"|"FKRTL";accessRoute?:"FKTP"|"Emergency"|"Referral";parentCaseId?:string;originReferralId?:string;specialty?:string;referral?:ReferralRequest;urgencyReason?:string;policyNo?:string;planName?:string;
 treatmentRequest?:{diagnosis:string;procedure:string;medication:string;reason?:string;attachments?:string[];estimatedCost:number;submittedAt:number};
 treatmentApproval?:{doctor:string;note:string;approvedAt:number};
 dischargeRequest?:{finalDiagnosis:string;finalBill:number;notes:string;submittedAt:number};
 dischargeApproval?:{doctor:string;note:string;approvedAt:number};
 confirmation?:{stage:"Admission"|"Treatment"|"Discharge";reason:string;requestedAt:number;response?:string;respondedAt?:number};
 billing?:{status:"Submitted"|"Under Verification"|"Approved"|"Scheduled for Payment"|"Paid";submittedAt:number;updatedAt:number;reminderCount:number;lastReminderAt?:number};
 claimSubmission?:ClaimSubmission;
 history?:CaseHistory[];
};
type UploadPreviewRow={row:number;cardNo:string;name:string;missingRequired:string[];missingOptional:string[];duplicate:boolean};
type UploadReview={file:string;total:number;valid:number;duplicate:number;optionalWarnings:number;missingHeaders:string[];missingOptionalHeaders:string[];previewRows:UploadPreviewRow[];staged:Member[]};

const providerAccounts=[
 {code:"PRV-HERMINA-KMY-001",name:"RS Hermina Kemayoran"},
 {code:"PRV-KF-CBT-001",name:"Klinik Kimia Farma Cibitung"}
] as const;
const defaultProviderProfiles:Record<string,ProviderProfile>={
 "PRV-HERMINA-KMY-001":{providerCode:"PRV-HERMINA-KMY-001",providerName:"RS Hermina Kemayoran",providerType:"Rumah Sakit",address:"",city:"",contactPerson:"",phone:"",email:"",paymentMethod:"Transfer",bankName:"",accountNo:"",accountName:""},
 "PRV-KF-CBT-001":{providerCode:"PRV-KF-CBT-001",providerName:"Klinik Kimia Farma Cibitung",providerType:"Klinik",address:"",city:"",contactPerson:"",phone:"",email:"",paymentMethod:"Transfer",bankName:"",accountNo:"",accountName:""}
};
const bankOptions=[
 {code:"008",name:"Bank Mandiri (Persero) Tbk",alias:"mandiri"},
 {code:"002",name:"Bank Rakyat Indonesia (Persero) Tbk",alias:"bri"},
 {code:"009",name:"Bank Negara Indonesia (Persero) Tbk",alias:"bni"},
 {code:"200",name:"Bank Tabungan Negara (Persero) Tbk",alias:"btn"},
 {code:"014",name:"Bank Central Asia Tbk",alias:"bca"},
 {code:"022",name:"Bank CIMB Niaga Tbk",alias:"cimb niaga"},
 {code:"011",name:"Bank Danamon Indonesia Tbk",alias:"danamon"},
 {code:"013",name:"Bank Permata Tbk",alias:"permata"},
 {code:"019",name:"Panin Bank Tbk",alias:"panin"},
 {code:"028",name:"Bank OCBC NISP Tbk",alias:"ocbc nisp"},
 {code:"016",name:"Bank Maybank Indonesia Tbk",alias:"maybank"},
 {code:"023",name:"Bank UOB Indonesia",alias:"uob"},
 {code:"426",name:"Bank Mega Tbk",alias:"mega"},
 {code:"153",name:"Bank Sinarmas Tbk",alias:"sinarmas"},
 {code:"441",name:"Bank KB Bukopin Tbk",alias:"kb bukopin"},
 {code:"536",name:"Bank BCA Syariah",alias:"bca syariah"},
 {code:"451",name:"Bank Syariah Indonesia Tbk",alias:"bsi syariah indonesia"},
 {code:"147",name:"Bank Muamalat Indonesia Tbk",alias:"muamalat"},
 {code:"506",name:"Bank Mega Syariah",alias:"mega syariah"},
 {code:"405",name:"Bank Victoria Syariah",alias:"victoria syariah"},
 {code:"517",name:"Bank Panin Dubai Syariah Tbk",alias:"panin dubai syariah"},
 {code:"947",name:"Bank Aladin Syariah Tbk",alias:"aladin"},
 {code:"547",name:"Bank BTPN Syariah Tbk",alias:"btpn syariah"},
 {code:"213",name:"Bank SMBC Indonesia Tbk",alias:"smbc btpn"},
 {code:"542",name:"Bank Jago Tbk",alias:"jago"},
 {code:"535",name:"SeaBank Indonesia",alias:"seabank"},
 {code:"567",name:"Allo Bank Indonesia Tbk",alias:"allo"},
 {code:"490",name:"Bank Neo Commerce Tbk",alias:"neo commerce bnc"},
 {code:"562",name:"Superbank Indonesia",alias:"superbank"},
 {code:"501",name:"Bank Digital BCA",alias:"blu bca digital"},
 {code:"494",name:"Bank Raya Indonesia Tbk",alias:"raya"},
 {code:"553",name:"Bank Hibank Indonesia",alias:"hibank"},
 {code:"523",name:"Bank Sahabat Sampoerna",alias:"sampoerna"},
 {code:"531",name:"Amar Bank Indonesia Tbk",alias:"amar"},
 {code:"161",name:"Bank Ganesha Tbk",alias:"ganesha"},
 {code:"054",name:"Bank Capital Indonesia Tbk",alias:"capital"},
 {code:"036",name:"Bank China Construction Bank Indonesia Tbk",alias:"ccb"},
 {code:"164",name:"Bank ICBC Indonesia",alias:"icbc"},
 {code:"212",name:"Bank Woori Saudara Indonesia 1906 Tbk",alias:"woori saudara"},
 {code:"167",name:"Bank QNB Indonesia Tbk",alias:"qnb"},
 {code:"087",name:"Bank HSBC Indonesia",alias:"hsbc"},
 {code:"046",name:"Bank DBS Indonesia",alias:"dbs"},
 {code:"484",name:"Bank KEB Hana Indonesia",alias:"hana keb"},
 {code:"048",name:"Bank Mizuho Indonesia",alias:"mizuho"},
 {code:"042",name:"MUFG Bank Ltd. Jakarta Branch",alias:"mufg tokyo mitsubishi"},
 {code:"050",name:"Standard Chartered Bank Indonesia",alias:"standard chartered scb"},
 {code:"095",name:"Bank JTrust Indonesia Tbk",alias:"jtrust"},
 {code:"047",name:"Bank Resona Perdania",alias:"resona"},
 {code:"057",name:"Bank BNP Paribas Indonesia",alias:"bnp paribas"},
 {code:"061",name:"ANZ Indonesia",alias:"anz"},
 {code:"152",name:"Bank Shinhan Indonesia",alias:"shinhan"},
 {code:"498",name:"Bank SBI Indonesia",alias:"sbi"},
 {code:"945",name:"Bank IBK Indonesia Tbk",alias:"ibk"},
 {code:"146",name:"Bank of India Indonesia Tbk",alias:"bank of india"},
 {code:"157",name:"Bank Maspion Indonesia Tbk",alias:"maspion"},
 {code:"503",name:"Bank Nationalnobu Tbk",alias:"nobu nationalnobu"},
 {code:"566",name:"Bank Oke Indonesia Tbk",alias:"oke"},
 {code:"485",name:"Bank MNC Internasional Tbk",alias:"mnc"},
 {code:"076",name:"Bank Bumi Arta Tbk",alias:"bumi arta"},
 {code:"688",name:"Bank Krom Indonesia Tbk",alias:"krom"},
 {code:"097",name:"Bank Mayapada Internasional Tbk",alias:"mayapada"},
 {code:"037",name:"Bank Artha Graha Internasional Tbk",alias:"artha graha"},
 {code:"555",name:"Bank Index Selindo",alias:"index"},
 {code:"151",name:"Bank Mestika Dharma Tbk",alias:"mestika"},
 {code:"564",name:"Bank Mandiri Taspen",alias:"mantap mandiri taspen"},
 {code:"110",name:"Bank Jabar Banten (BJB)",alias:"bjb jawa barat banten"},
 {code:"111",name:"Bank DKI",alias:"dki jakarta"},
 {code:"112",name:"Bank BPD DIY",alias:"bpd diy yogyakarta"},
 {code:"113",name:"Bank Jateng",alias:"jateng jawa tengah"},
 {code:"114",name:"Bank Jatim",alias:"jatim jawa timur"},
 {code:"115",name:"Bank Jambi",alias:"jambi"},
 {code:"116",name:"Bank Aceh Syariah",alias:"aceh"},
 {code:"117",name:"Bank Sumut",alias:"sumut sumatera utara"},
 {code:"118",name:"Bank Nagari",alias:"nagari sumatera barat"},
 {code:"119",name:"Bank Riau Kepri Syariah",alias:"riau kepri"},
 {code:"120",name:"Bank Sumsel Babel",alias:"sumsel babel sumatera selatan"},
 {code:"121",name:"Bank Lampung",alias:"lampung"},
 {code:"122",name:"Bank Kalsel",alias:"kalsel kalimantan selatan"},
 {code:"123",name:"Bank Kalbar",alias:"kalbar kalimantan barat"},
 {code:"124",name:"Bank Kaltimtara",alias:"kaltimtara kalimantan timur utara"},
 {code:"125",name:"Bank Kalteng",alias:"kalteng kalimantan tengah"},
 {code:"126",name:"Bank Sulselbar",alias:"sulselbar sulawesi selatan barat"},
 {code:"127",name:"Bank SulutGo",alias:"sulutgo sulawesi utara gorontalo"},
 {code:"128",name:"Bank NTB Syariah",alias:"ntb nusa tenggara barat"},
 {code:"129",name:"Bank Bali",alias:"bali"},
 {code:"130",name:"Bank NTT",alias:"ntt nusa tenggara timur"},
 {code:"131",name:"Bank Maluku Malut",alias:"maluku malut"},
 {code:"132",name:"Bank Papua",alias:"papua"},
 {code:"133",name:"Bank Bengkulu",alias:"bengkulu"},
 {code:"134",name:"Bank Sulteng",alias:"sulteng sulawesi tengah"},
 {code:"135",name:"Bank Sultra",alias:"sultra sulawesi tenggara"},
 {code:"137",name:"Bank Banten",alias:"banten"},
 {code:"069",name:"Bank of China (Hong Kong) Jakarta Branch",alias:"bank of china"},
 {code:"031",name:"Citibank N.A. Indonesia",alias:"citi citibank"}
] as const;
const urgencyOptions=["Kecelakaan","Kondisi akut / kegawatdaruratan","Di luar area Faskes 1","Faskes 1 tidak beroperasi","Emergency gigi - dokter gigi umum","Kondisi on-site di lokasi kerja","Lainnya"];
const requiredHeaders=["POLICYNO","COMPANY","DEPARTMENT","START DATE","END DATE","MEMBERSHIP NO","MEMBER NAME","EMPLOYEE NAME","EMPLOYEE MEMBERSHIP NO","DOB","INCEPTION","EXPIRY","GENDER","MARITAL STATUS","RELATIONSHIP","CARD NO","PRODUCT","PLAN NAME","FASKES 1 CODE","FASKES 1 NAME"];
const optionalReviewHeaders=["PLAN CODE"];
const claimDocumentLabels=[
 "Fotokopi Kartu Peserta / No. Eligible / No. Pegawai",
 "Formulir Keterangan Medis Rawat Jalan",
 "Surat Jaminan Rawat Inap dari Provider",
 "Formulir Keterangan Medis Rawat Inap (Perorangan)",
 "Resume Medis Rawat Inap",
 "Perincian Biaya Rawat Inap",
 "Kwitansi Asli",
 "Fotokopi Resep di belakang Kwitansi / Copy Resep",
 "Jenis Pemeriksaan Lab, Rontgen dan Pemeriksaan Medis",
 "Fotokopi Surat Kelahiran / Kematian",
 "Surat Rujukan",
 "Resep Asli / Carbonized (Provider)"
];

function fmt(ms:number){const s=Math.max(0,Math.floor(ms/1000));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function niceDate(v:string){if(!v)return "-";const d=new Date(v+"T00:00:00");return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d)}
function isActiveMember(m:Member){
 const today=new Date();today.setHours(0,0,0,0);
 const start=m.inception||m.startDate,end=m.expiry||m.endDate;
 const s=start?new Date(start+"T00:00:00"):null,e=end?new Date(end+"T23:59:59"):null;
 return (!s||Number.isNaN(s.getTime())||today>=s)&&(!e||Number.isNaN(e.getTime())||today<=e);
}
function relationLabel(v:string){const r=v.toUpperCase();if(r==="EMPLOYEE")return "Pekerja";if(r==="SPOUSE")return "Pasangan";if(r==="CHILD")return "Anak";return v||"-"}
function faskesName(m:Member){return m.faskes1Name||m.faskes1||""}
function faskesCode(m:Member){return m.faskes1Code||""}
function formatAmountInput(v:string){const digits=v.replace(/\D/g,"");return digits?Number(digits).toLocaleString("id-ID"):""}
function parseAmount(v:string){return Number(v.replace(/\D/g,""))||0}
function formatRupiah(v:number){return "Rp "+Math.max(0,v||0).toLocaleString("id-ID")}
function withHistory(c:CareCase,event:string,actor:string,detail?:string,at=Date.now()):CareCase{
 return {...c,history:[...(c.history||[]),{at,actor,event,detail}]};
}
function fallbackHistory(c:CareCase):CaseHistory[]{
 const h:CaseHistory[]=[];
 if(c.treatmentRequest)h.push({at:c.treatmentRequest.submittedAt,actor:c.provider,event:"Treatment Request Submitted",detail:c.treatmentRequest.diagnosis});
 if(c.treatmentApproval)h.push({at:c.treatmentApproval.approvedAt,actor:"dr. "+c.treatmentApproval.doctor+" / PertaLife",event:"Treatment Approved",detail:c.treatmentApproval.note});
 if(c.dischargeRequest)h.push({at:c.dischargeRequest.submittedAt,actor:c.provider,event:"Discharge Submitted",detail:c.dischargeRequest.finalDiagnosis+" · "+formatRupiah(c.dischargeRequest.finalBill)});
 if(c.dischargeApproval)h.push({at:c.dischargeApproval.approvedAt,actor:"dr. "+c.dischargeApproval.doctor+" / PertaLife",event:"Final Discharge Approved",detail:c.dischargeApproval.note});
 if(c.confirmation)h.push({at:c.confirmation.requestedAt,actor:"Call Center PertaLife",event:"Need Confirmation - "+c.confirmation.stage,detail:c.confirmation.reason});
 if(c.confirmation?.respondedAt)h.push({at:c.confirmation.respondedAt,actor:c.provider,event:"Confirmation Response",detail:c.confirmation.response});
 if(c.claimSubmission?.submittedAt)h.push({at:c.claimSubmission.submittedAt,actor:c.provider,event:"Claim Submitted",detail:c.claimSubmission.bundleId||c.id});
 if(c.billing?.updatedAt)h.push({at:c.billing.updatedAt,actor:"PertaLife",event:"Payment Status: "+c.billing.status});
 return h.sort((a,b)=>a.at-b.at);
}

export default function Page(){
 const [role,setRole]=useState<Role>("provider"),[activeProviderCode,setActiveProviderCode]=useState(providerAccounts[0].code),[now,setNow]=useState(Date.now()),[cases,setCases]=useState<CareCase[]>([]),[members,setMembers]=useState<Member[]>([]);
 const [query,setQuery]=useState(""),[memberQuery,setMemberQuery]=useState(""),[statusFilter,setStatusFilter]=useState<CaseStatus|"Open"|null>(null),[hydrated,setHydrated]=useState(false);
 const [cardNo,setCardNo]=useState(""),[visitType,setVisitType]=useState("Rawat Jalan"),[found,setFound]=useState<Member|null>(null),[lookupDone,setLookupDone]=useState(false);
 const [careAccess,setCareAccess]=useState<"FKTP"|"FKRTL"|"Emergency">("FKTP");
 const [referralSearch,setReferralSearch]=useState("");
 const [fkrtlBenefitCard,setFkrtlBenefitCard]=useState<string|null>(null);
 const [urgent,setUrgent]=useState(false),[urgencyReason,setUrgencyReason]=useState(""),[urgencyText,setUrgencyText]=useState(""),[complaint,setComplaint]=useState("");
 const [view,setView]=useState("dashboard"),[notice,setNotice]=useState("");
 const [selectedCaseId,setSelectedCaseId]=useState<string|null>(null),[showCaseDetail,setShowCaseDetail]=useState(false);
 const [treatmentDiagnosis,setTreatmentDiagnosis]=useState(""),[treatmentProcedure,setTreatmentProcedure]=useState(""),[treatmentMedication,setTreatmentMedication]=useState(""),[treatmentCost,setTreatmentCost]=useState(""),[treatmentReason,setTreatmentReason]=useState(""),[treatmentAttachments,setTreatmentAttachments]=useState<string[]>([]);
 const [finalDiagnosis,setFinalDiagnosis]=useState(""),[finalBill,setFinalBill]=useState(""),[dischargeNotes,setDischargeNotes]=useState("");
 const [claimDraft,setClaimDraft]=useState<ClaimSubmission|null>(null),[selectedClaimCases,setSelectedClaimCases]=useState<string[]>([]);
 const [providerProfiles,setProviderProfiles]=useState<Record<string,ProviderProfile>>(defaultProviderProfiles),[profileDraft,setProfileDraft]=useState<ProviderProfile|null>(null),[bankSearch,setBankSearch]=useState(""),[bankOpen,setBankOpen]=useState(false);
 const [uploadReview,setUploadReview]=useState<UploadReview|null>(null); const [reviewFilter,setReviewFilter]=useState("all"); const [memberPage,setMemberPage]=useState(1); const [memberPageSize,setMemberPageSize]=useState(50);

 useEffect(()=>{try{const m=localStorage.getItem("pertalife-managed-care-members-v2"),c=localStorage.getItem("pertalife-managed-care-cases"),p=localStorage.getItem("pertalife-managed-care-provider-profiles");if(m)setMembers(JSON.parse(m));if(c)setCases(JSON.parse(c));if(p)setProviderProfiles({...defaultProviderProfiles,...JSON.parse(p)});}catch{}setHydrated(true);const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 useEffect(()=>{if(hydrated)localStorage.setItem("pertalife-managed-care-members-v2",JSON.stringify(members));},[members,hydrated]);
 useEffect(()=>{if(hydrated)localStorage.setItem("pertalife-managed-care-cases",JSON.stringify(cases));},[cases,hydrated]);
 useEffect(()=>{if(hydrated)localStorage.setItem("pertalife-managed-care-provider-profiles",JSON.stringify(providerProfiles));},[providerProfiles,hydrated]);

 const activeProvider=providerAccounts.find(p=>p.code===activeProviderCode)||providerAccounts[0];
 const activeProviderProfile=providerProfiles[activeProvider.code]||defaultProviderProfiles[activeProvider.code];
 const filteredBanks=useMemo(()=>{
  const q=bankSearch.trim().toLowerCase();
  if(!q)return bankOptions;
  return bankOptions.filter(b=>(b.name+" "+b.code+" "+b.alias).toLowerCase().includes(q));
 },[bankSearch]);
 const visibleCases=useMemo(()=>role==="provider"?cases.filter(c=>c.providerCode===activeProvider.code||(!c.providerCode&&c.provider===activeProvider.name)):cases,[cases,role,activeProvider.code,activeProvider.name]);
 const waiting=useMemo(()=>visibleCases.filter(c=>c.status.startsWith("Waiting")),[visibleCases]);
 const approvedFKRTLCases=useMemo(()=>visibleCases
  .filter(c=>c.careLevel==="FKRTL"&&c.accessRoute==="Referral"&&!!c.originReferralId)
  .sort((a,b)=>b.submittedAt-a.submittedAt),[visibleCases]);
 const filteredFKRTLCases=approvedFKRTLCases.filter(c=>(c.name+" "+c.memberId+" "+c.id+" "+(c.specialty||"")).toLowerCase().includes(referralSearch.trim().toLowerCase()));
 const fkrtlBenefitMember=fkrtlBenefitCard?members.find(m=>m.cardNo.toLowerCase()===fkrtlBenefitCard.toLowerCase()):null;
 const pendingReferrals=cases.filter(c=>c.referral?.status==="Pending Verification");
 const eligibleReferralIds=visibleCases.filter(c=>{
  if((c.careLevel||"FKTP")!=="FKTP"||c.accessRoute==="Emergency")return false;
  if(!["Treatment Active","Treatment Approved"].includes(c.status))return false;
  if(c.referral&&c.referral.status!=="Need Revision")return false;
  const member=members.find(m=>m.cardNo.toLowerCase()===c.memberId.toLowerCase());
  return !!member&&isActiveMember(member)&&faskesCode(member).toLowerCase()===String(c.providerCode||"").toLowerCase();
 }).map(c=>c.id);
 const filtered=visibleCases.filter(c=>(c.name+" "+c.memberId+" "+c.company+" "+c.id).toLowerCase().includes(query.toLowerCase())).filter(c=>{
  if(statusFilter==="Open")return c.status!=="Closed";
  if(statusFilter)return c.status===statusFilter;
  if(role==="provider"&&view==="registration")return c.status==="Waiting Admission";
  if(role==="provider"&&view==="treatment")return ["Treatment Active","Waiting Treatment Approval","Treatment Approved"].includes(c.status);
  if(role==="provider"&&view==="discharge")return ["Treatment Approved","Waiting Discharge"].includes(c.status);
  if(role==="provider"&&view==="cases")return c.status!=="Closed";
  return true;
 });
 const selectedCase=selectedCaseId?cases.find(c=>c.id===selectedCaseId)||null:null;
 const selectedHistory=selectedCase?(selectedCase.history?.length?selectedCase.history:fallbackHistory(selectedCase)):[];
 const referralMember=selectedCase?.referral?members.find(m=>m.cardNo.toLowerCase()===selectedCase.memberId.toLowerCase()):null;
 const dischargeHistory=useMemo(()=>visibleCases.filter(c=>!!c.dischargeRequest).sort((a,b)=>(b.dischargeRequest?.submittedAt||0)-(a.dischargeRequest?.submittedAt||0)),[visibleCases]);
 const filteredMembers=useMemo(()=>members.filter(m=>(m.cardNo+" "+m.name+" "+m.membershipNo+" "+m.employeeName+" "+m.employeeMembershipNo+" "+m.company+" "+m.department+" "+m.policyNo).toLowerCase().includes(memberQuery.toLowerCase())),[members,memberQuery]);
 const memberPageCount=Math.max(1,Math.ceil(filteredMembers.length/memberPageSize));
 const safeMemberPage=Math.min(memberPage,memberPageCount);
 const pageMembers=useMemo(()=>filteredMembers.slice((safeMemberPage-1)*memberPageSize,safeMemberPage*memberPageSize),[filteredMembers,safeMemberPage,memberPageSize]);
 const reviewMissingCounts=useMemo(()=>{
  if(!uploadReview)return [] as [string,number][];
  const counts=new Map<string,number>();
  uploadReview.previewRows.forEach(r=>r.missingRequired.forEach(col=>counts.set(col,(counts.get(col)||0)+1)));
  return Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]);
 },[uploadReview]);
 const filteredPreviewRows=useMemo(()=>{
  if(!uploadReview)return [];
  if(reviewFilter==="valid")return uploadReview.previewRows.filter(r=>!r.missingRequired.length&&!r.duplicate);
  if(reviewFilter==="duplicate")return uploadReview.previewRows.filter(r=>r.duplicate);
  if(reviewFilter==="optional")return uploadReview.previewRows.filter(r=>r.missingOptional.length>0);
  if(reviewFilter.startsWith("missing:")){const col=reviewFilter.slice(8);return uploadReview.previewRows.filter(r=>r.missingRequired.includes(col))}
  return uploadReview.previewRows;
 },[uploadReview,reviewFilter]);
 const active=!!found&&isActiveMember(found);
 const foundFaskesName=found?faskesName(found):"";
 const foundFaskesCode=found?faskesCode(found):"";
 const faskesMapped=!!found&&!!foundFaskesName&&!!foundFaskesCode;
 const faskesMatch=!!found&&foundFaskesCode.trim().toLowerCase()===activeProvider.code.toLowerCase();
 const canSubmit=careAccess!=="FKRTL"&&!!found&&active&&!!complaint.trim()&&(careAccess==="Emergency"||faskesMatch||(urgent&&!!urgencyReason&&(urgencyReason!=="Lainnya"||!!urgencyText.trim())));

 async function bulkUpload(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];if(!file)return;
  try{
   const XLSX=await import("xlsx");
   const wb=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:true});
   const ws=wb.Sheets[wb.SheetNames[0]];
   const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(ws,{defval:""});
   const headerRow=(XLSX.utils.sheet_to_json<unknown[]>(ws,{header:1,defval:""})[0]||[]).map(v=>String(v).trim().toUpperCase());
   const missingHeaders=requiredHeaders.filter(h=>!headerRow.includes(h));
   const missingOptionalHeaders=optionalReviewHeaders.filter(h=>!headerRow.includes(h));
   const asText=(v:unknown)=>String(v??"").trim();
   const asDate=(v:unknown)=>{
    if(!v)return "";
    if(v instanceof Date&&!Number.isNaN(v.getTime()))return v.toISOString().slice(0,10);
    if(typeof v==="number"){const p=XLSX.SSF.parse_date_code(v);if(p)return String(p.y).padStart(4,"0")+"-"+String(p.m).padStart(2,"0")+"-"+String(p.d).padStart(2,"0")}
    const s=asText(v);const m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);if(m)return m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");
    return s.slice(0,10);
   };
   const existing=new Set(members.map(m=>m.cardNo.toLowerCase())),batch=new Set<string>();
   let duplicate=0,optionalWarnings=0;
   const staged:Member[]=[],previewRows:UploadPreviewRow[]=[];
   rows.forEach((r,index)=>{
    const missingRequired=requiredHeaders.filter(h=>!asText(r[h]));
    const missingOptional=optionalReviewHeaders.filter(h=>!asText(r[h]));
    const card=asText(r["CARD NO"]),key=card.toLowerCase();
    const isDuplicate=!!card&&(existing.has(key)||batch.has(key));
    if(card&&!isDuplicate)batch.add(key);
    if(missingOptional.length)optionalWarnings++;
    if(isDuplicate)duplicate++;
    previewRows.push({row:index+2,cardNo:card||"-",name:asText(r["MEMBER NAME"])||"-",missingRequired,missingOptional,duplicate:isDuplicate});
    if(missingRequired.length||isDuplicate)return;
    staged.push({
     policyNo:asText(r["POLICYNO"]),company:asText(r["COMPANY"]),department:asText(r["DEPARTMENT"]),startDate:asDate(r["START DATE"]),endDate:asDate(r["END DATE"]),
     membershipNo:asText(r["MEMBERSHIP NO"]),name:asText(r["MEMBER NAME"]),employeeName:asText(r["EMPLOYEE NAME"]),employeeMembershipNo:asText(r["EMPLOYEE MEMBERSHIP NO"]),dob:asDate(r["DOB"]),inception:asDate(r["INCEPTION"]),expiry:asDate(r["EXPIRY"]),
     gender:asText(r["GENDER"]),maritalStatus:asText(r["MARITAL STATUS"]),relation:asText(r["RELATIONSHIP"]),cardNo:card,product:asText(r["PRODUCT"]),planName:asText(r["PLAN NAME"]),planCode:asText(r["PLAN CODE"]),faskes1Code:asText(r["FASKES 1 CODE"]),faskes1Name:asText(r["FASKES 1 NAME"])
    });
   });
   setUploadReview({file:file.name,total:rows.length,valid:staged.length,duplicate,optionalWarnings,missingHeaders,missingOptionalHeaders,previewRows,staged});
   setReviewFilter("all");
   setNotice("File berhasil dibaca. Review hasil validasi sebelum Confirm Upload.");
  }catch{
   setUploadReview(null);setReviewFilter("all");
   setNotice("File Excel tidak dapat dibaca. Pastikan struktur kolom sesuai master peserta Managed Care.");
  }
  e.target.value="";
 }
 function confirmUpload(){
  if(!uploadReview)return;
  const incomplete=uploadReview.previewRows.some(r=>r.missingRequired.length>0);
  const blocked=uploadReview.missingHeaders.length>0||incomplete||uploadReview.duplicate>0;
  if(blocked){setNotice("Upload diblokir. Perbaiki seluruh error pada file lalu pilih ulang file Excel.");return}
  setMembers(v=>[...uploadReview.staged,...v]);
  setNotice(uploadReview.valid+" peserta berhasil diupload ke Master Peserta.");
  setUploadReview(null);
 }
 function deleteMember(card:string,name:string){
  if(!window.confirm("Hapus "+name+" ("+card+") dari Master Peserta? Case yang sudah pernah dibuat tidak ikut terhapus."))return;
  setMembers(v=>v.filter(m=>m.cardNo!==card));
  setNotice("Peserta "+name+" berhasil dihapus dari Master Peserta.");
 }
 function deleteAllMembers(){
  if(!members.length)return;
  if(!window.confirm("Hapus seluruh "+members.length+" data peserta dari Master Peserta? Case yang sudah pernah dibuat tidak ikut terhapus."))return;
  setMembers([]);setUploadReview(null);setReviewFilter("all");setMemberQuery("");
  setNotice("Seluruh data Master Peserta berhasil dihapus.");
 }
 function lookup(){const m=members.find(x=>x.cardNo.toLowerCase()===cardNo.trim().toLowerCase())||null;setFound(m);setLookupDone(true);setUrgent(false);setUrgencyReason("");setUrgencyText("");setComplaint("");}
 function chooseAccess(route:"FKTP"|"FKRTL"|"Emergency"){
  setCareAccess(route);setVisitType(route==="Emergency"?"UGD / IGD":"Rawat Jalan");
  setFound(null);setLookupDone(false);setComplaint("");setUrgent(false);setUrgencyReason("");setUrgencyText("");
  setShowCaseDetail(false);setSelectedCaseId(null);setFkrtlBenefitCard(null);setNotice("");
 }
 function submitAdmission(){
 if(!found||!canSubmit)return;
 const id="MC-"+new Date().toISOString().slice(2,10).replaceAll("-","")+"-"+String(cases.length+1).padStart(4,"0");
 const at=Date.now(),isEmergency=careAccess==="Emergency";
 const admissionLevel=isEmergency&&activeProvider.code==="PRV-HERMINA-KMY-001"?"FKRTL":"FKTP";
 setCases(v=>[{
  id,name:found.name,memberId:found.cardNo,company:found.company,
  provider:activeProvider.name,providerCode:activeProvider.code,status:"Waiting Admission",
  urgent:isEmergency||urgent,submittedAt:at,issue:complaint,visitType:isEmergency?(activeProvider.code==="PRV-HERMINA-KMY-001"?"UGD / IGD":"Pertolongan Darurat Awal"):visitType,
  careLevel:admissionLevel,accessRoute:isEmergency?"Emergency":"FKTP",
  urgencyReason:isEmergency?"Penilaian awal gawat darurat: "+complaint.trim():urgent?(urgencyReason==="Lainnya"?urgencyText:urgencyReason):undefined,
  policyNo:found.policyNo,planName:found.planName,
  history:[{at,actor:activeProvider.name,event:isEmergency?"Emergency Admission Submitted":"FKTP Admission Submitted",detail:complaint}]
 },...v]);
 setNotice(isEmergency?"Emergency tercatat dan dikirim untuk verifikasi Call Center. Penanganan kegawatdaruratan tidak boleh tertunda karena administrasi.":"Admission FKTP dikirim ke Call Center PertaLife.");
 setFound(null);setCardNo("");setLookupDone(false);setComplaint("");setUrgent(false);setCareAccess("FKTP");setVisitType("Rawat Jalan");setReferralSearch("");
}
 function openReferral(id:string){setSelectedCaseId(id);setShowCaseDetail(false);setView("referrals");setNotice("");}
 function submitReferral(caseId:string,draft:ReferralDraft){
  const source=cases.find(c=>c.id===caseId);
  if(!source||!eligibleReferralIds.includes(caseId)){setNotice("Rujukan hanya dapat dibuat dari episode FKTP yang sesuai dengan Faskes 1 dan sudah disetujui Call Center.");return;}
  const at=Date.now();
  const referral:ReferralRequest={
   ...draft,id:source.referral?.id||"RF-"+at.toString(36).toUpperCase(),
   kind:source.providerCode==="PRV-HERMINA-KMY-001"?"Internal (Satu Atap)":"Eksternal",
   sourceCaseId:source.id,sourceProviderCode:source.providerCode||"",
   targetProviderCode:"PRV-HERMINA-KMY-001",targetProviderName:"RS Hermina Kemayoran",
   status:"Pending Verification",submittedAt:at
  };
  setCases(current=>current.map(c=>c.id===caseId?withHistory({...c,referral},"Referral Submitted",c.provider,
   referral.kind+" · "+referral.specialty+" · "+referral.refNumber,at):c));
  setNotice("Rujukan FKTP dikirim ke Referral Approval Call Center. Pelayanan spesialis belum dapat dimulai.");
 }
 function reviewReferral(caseId:string,outcome:ReferralStatus){
  const source=cases.find(c=>c.id===caseId);
  if(!source?.referral||source.referral.status!=="Pending Verification")return;
  const member=members.find(m=>m.cardNo.toLowerCase()===source.memberId.toLowerCase());
  if(outcome==="Approved"&&(!member||!isActiveMember(member)||faskesCode(member).toLowerCase()!==String(source.providerCode||"").toLowerCase())){
   setNotice("Approval ditolak oleh validasi: kepesertaan aktif dan Faskes 1 asal harus sesuai. Periksa Master Peserta.");return;
  }
  const verifier=window.prompt("Nama verifier Call Center PertaLife:");
  if(!verifier?.trim())return;
  const note=window.prompt(outcome==="Approved"?"Catatan verifikasi dan pertimbangan approval:":"Alasan "+outcome+" (wajib tercatat):");
  if(!note?.trim())return;
  const at=Date.now();
  const targetCaseId="MC-FKRTL-"+at.toString(36).toUpperCase()+"-"+(cases.length+1);
  setCases(current=>{
   const origin=current.find(c=>c.id===caseId);
   if(!origin?.referral||origin.referral.status!=="Pending Verification")return current;
   const referral=origin.referral;
   const updatedReferral:ReferralRequest={...referral,status:outcome,reviewedAt:at,reviewer:verifier.trim(),reviewNote:note.trim(),
    linkedCaseId:outcome==="Approved"?targetCaseId:undefined};
   const updatedOrigin=withHistory({...origin,referral:updatedReferral},"Referral "+outcome,"Call Center — "+verifier.trim(),
    note.trim()+(outcome==="Approved"?" · Admission FKRTL otomatis "+targetCaseId:""),at);
   const updated=current.map(c=>c.id===caseId?updatedOrigin:c);
   if(outcome!=="Approved"||current.some(c=>c.originReferralId===referral.id))return updated;
   const target:CareCase={
    id:targetCaseId,name:origin.name,memberId:origin.memberId,company:origin.company,
    provider:referral.targetProviderName,providerCode:referral.targetProviderCode,
    status:"Treatment Active",urgent:false,submittedAt:at,issue:"Rujukan spesialis: "+referral.diagnosis,
    visitType:"Rawat Jalan Spesialis",careLevel:"FKRTL",accessRoute:"Referral",
    parentCaseId:origin.id,originReferralId:referral.id,specialty:referral.specialty,
    policyNo:origin.policyNo,planName:origin.planName,
    history:[{at,actor:"Call Center — "+verifier.trim(),event:"Referral Approved / Admission FKRTL Automatic",
     detail:"FKTP "+origin.provider+" ("+origin.id+") → FKRTL "+referral.targetProviderName+" · "+referral.specialty+" · "+note.trim()}]
   };
   return [target,...updated];
  });
  setNotice(outcome==="Approved"?"Rujukan Approved. Admission FKRTL Hermina otomatis dibuat tanpa approval Admission kedua. Treatment tetap perlu persetujuan tersendiri.":"Rujukan "+outcome+". Provider dapat melihat catatan verifikasi.");
 }
 function openCaseDetail(id:string){setSelectedCaseId(id);setShowCaseDetail(true)}
 function openTreatment(id:string){setSelectedCaseId(id);setTreatmentDiagnosis("");setTreatmentProcedure("");setTreatmentMedication("");setTreatmentCost("");setTreatmentReason("");setTreatmentAttachments([]);setView("treatment");setShowCaseDetail(false)}
 function submitTreatment(){
  if(!selectedCase||!treatmentDiagnosis.trim()||!treatmentProcedure.trim()||!treatmentReason.trim()||!treatmentCost.trim())return;
  const at=Date.now();setCases(v=>v.map(c=>c.id===selectedCase.id?withHistory({...c,status:"Waiting Treatment Approval",submittedAt:at,treatmentRequest:{diagnosis:treatmentDiagnosis.trim(),procedure:treatmentProcedure.trim(),medication:treatmentMedication.trim(),reason:treatmentReason.trim(),attachments:treatmentAttachments,estimatedCost:parseAmount(treatmentCost),submittedAt:at}},"Treatment Request Submitted",c.provider,treatmentDiagnosis.trim(),at):c));
  setNotice("Treatment Request berhasil dikirim ke Call Center PertaLife.");
  setView("dashboard");setSelectedCaseId(null);
 }
 function openDischarge(id:string){setSelectedCaseId(id);setFinalDiagnosis("");setFinalBill("");setDischargeNotes("");setView("discharge");setShowCaseDetail(false)}
 function submitDischarge(){
  if(!selectedCase||!finalDiagnosis.trim()||!finalBill.trim())return;
  const at=Date.now();setCases(v=>v.map(c=>c.id===selectedCase.id?withHistory({...c,status:"Waiting Discharge",submittedAt:at,dischargeRequest:{finalDiagnosis:finalDiagnosis.trim(),finalBill:parseAmount(finalBill),notes:dischargeNotes.trim(),submittedAt:at}},"Discharge Submitted",c.provider,finalDiagnosis.trim()+" · "+formatRupiah(parseAmount(finalBill)),at):c));
  setNotice("Discharge Request berhasil dikirim ke Call Center PertaLife.");
  setView("dashboard");setSelectedCaseId(null);
 }
 function requestConfirmation(id:string,stage:"Admission"|"Treatment"|"Discharge"){
  const reason=window.prompt("Masukkan alasan Need Confirmation untuk Provider:");
  if(!reason||!reason.trim())return;
  const at=Date.now();setCases(v=>v.map(c=>c.id===id?withHistory({...c,confirmation:{stage,reason:reason.trim(),requestedAt:at},submittedAt:at},"Need Confirmation - "+stage,"Call Center PertaLife",reason.trim(),at):c));
  setNotice("Need Confirmation dikirim ke Provider.");
 }
 function respondConfirmation(id:string){
  const response=window.prompt("Masukkan respons / klarifikasi untuk PertaLife:");
  if(!response||!response.trim())return;
  const at=Date.now();setCases(v=>v.map(c=>c.id===id&&c.confirmation?withHistory({...c,confirmation:{...c.confirmation,response:response.trim(),respondedAt:at},submittedAt:at},"Confirmation Response",c.provider,response.trim(),at):c));
  setNotice("Klarifikasi berhasil dikirim ke Call Center PertaLife.");
 }
 function openProviderProfile(){
  const profile=providerProfiles[activeProvider.code]||defaultProviderProfiles[activeProvider.code];
  setProfileDraft({...profile,providerCode:activeProvider.code,providerName:activeProvider.name});
  setBankSearch(profile.bankName||"");setBankOpen(false);setView("profile");setNotice("");
 }
 function saveProviderProfile(){
  if(!profileDraft)return;
  if(!profileDraft.providerName.trim()){setNotice("Nama Provider tidak boleh kosong.");return}
  if(profileDraft.bankName&&!bankOptions.some(b=>b.name===profileDraft.bankName)){setNotice("Nama bank wajib dipilih dari daftar bank yang tersedia.");return}
  if(bankSearch.trim()&&!profileDraft.bankName){setNotice("Pilih nama bank dari hasil pencarian, jangan hanya mengetik nama bank.");return}
  const saved={...profileDraft,providerCode:activeProvider.code,providerName:activeProvider.name,updatedAt:Date.now()};
  setProviderProfiles(v=>({...v,[activeProvider.code]:saved}));
  setProfileDraft(saved);setBankSearch(saved.bankName||"");setBankOpen(false);
  setNotice("Profile "+activeProvider.name+" berhasil disimpan.");
 }
 function toggleClaimCase(id:string){
  setSelectedClaimCases(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 }
 function openClaimBundle(ids:string[]){
  const eligible=cases.filter(c=>ids.includes(c.id)&&c.status==="Closed"&&c.dischargeRequest&&!c.billing);
  if(!eligible.length){setNotice("Pilih minimal satu discharge approved yang belum diajukan klaim.");return}
  const first=eligible[0],m=members.find(x=>x.cardNo===first.memberId),profile=providerProfiles[first.providerCode||activeProvider.code]||defaultProviderProfiles[first.providerCode||activeProvider.code]||activeProviderProfile;
  const bundleId="BCL-"+new Date().toISOString().slice(2,10).replaceAll("-","")+"-"+String(Date.now()).slice(-5);
  const total=eligible.reduce((sum,x)=>sum+(x.dischargeRequest?.finalBill||0),0);
  setClaimDraft({
   receiptDate:new Date().toISOString().slice(0,10),product:m?.product||"Prokes",claimType:"Bundle Provider",reimbursementType:"",
   bankName:profile?.bankName||"",applicantName:first.provider,participantName:eligible.length+" peserta",participantNo:"MULTI-CASE",
   phone:profile?.phone||"",email:profile?.email||"",description:"Bundle klaim "+first.provider+" ("+eligible.length+" case)",paymentMethod:profile?.paymentMethod||"Transfer",
   accountNo:profile?.accountNo||"",accountName:profile?.accountName||"",applicationStatus:"Diajukan",submittedBy:profile?.contactPerson||first.provider,receivedBy:"",claimProkes:true,submittedAt:0,
   documents:claimDocumentLabels.map(label=>({label,submitted:false,cs:false,cl:false,fa:false,remark:""})),
   bundleId,bundleCaseIds:eligible.map(x=>x.id),bundleTotalBill:total
  });
  setSelectedCaseId(first.id);setView("claim");setShowCaseDetail(false);
 }
 function openClaimSubmission(id:string){
  const c=cases.find(x=>x.id===id);if(!c||!c.dischargeRequest)return;
  if(c.claimSubmission){setClaimDraft(c.claimSubmission);setSelectedCaseId(id);setView("claim");return}
  openClaimBundle([id]);
 }
 function submitClaim(){
  if(!selectedCase||!claimDraft)return;
  if(!claimDraft.bankName.trim()||!claimDraft.accountNo.trim()||!claimDraft.accountName.trim()){
   setNotice("Nama Bank, No. Rekening, dan Atas Nama wajib diisi sebelum submit klaim.");return;
  }
  const submittedAt=Date.now();
  const bundleIds=claimDraft.bundleCaseIds?.length?claimDraft.bundleCaseIds:[selectedCase.id];
  setCases(v=>v.map(c=>bundleIds.includes(c.id)?withHistory({...c,claimSubmission:{...claimDraft,applicationStatus:"Diterima",submittedAt},billing:{status:"Submitted",submittedAt,updatedAt:submittedAt,reminderCount:0}},"Claim Submitted",c.provider,(claimDraft.bundleId||c.id)+" · "+formatRupiah(c.dischargeRequest?.finalBill||0),submittedAt):c));
  setNotice("Bundle klaim "+(claimDraft.bundleId||"")+" berhasil dikirim ke PertaLife ("+bundleIds.length+" case).");
  setClaimDraft(null);setSelectedCaseId(null);setSelectedClaimCases([]);setView("history");
 }
 function updateClaimDocument(caseId:string,index:number,patch:Partial<ClaimDocument>){
  setCases(v=>v.map(c=>c.id===caseId&&c.claimSubmission?{...c,claimSubmission:{...c.claimSubmission,documents:c.claimSubmission.documents.map((d,i)=>i===index?{...d,...patch}:d)}}:c));
 }
 function updateClaimMeta(caseId:string,patch:Partial<ClaimSubmission>){
  setCases(v=>v.map(c=>c.id===caseId&&c.claimSubmission?{...c,claimSubmission:{...c.claimSubmission,...patch}}:c));
 }
 function sendPaymentReminder(id:string){
  const at=Date.now();setCases(v=>v.map(c=>c.id===id&&c.billing&&c.billing.status!=="Paid"?withHistory({...c,billing:{...c.billing,reminderCount:(c.billing.reminderCount||0)+1,lastReminderAt:at,updatedAt:at}},"Payment Reminder Sent",c.provider,"Reminder ke PertaLife",at):c));
  setNotice("Reminder pembayaran berhasil dikirim ke PertaLife.");
 }
 function advanceBilling(id:string,status:"Under Verification"|"Approved"|"Scheduled for Payment"|"Paid"){
  const at=Date.now();setCases(v=>v.map(c=>c.id===id&&c.billing?withHistory({...c,billing:{...c.billing,status,updatedAt:at}},"Payment Status Updated","PertaLife",status,at):c));
 }
 function approveMedical(id:string,stage:"Treatment"|"Discharge"){
  const doctor=window.prompt("Nama dokter PertaLife yang memberikan approval:");
  if(!doctor||!doctor.trim())return;
  const note=window.prompt("Catatan approval / pertimbangan medis:");
  if(note===null||!note.trim())return;
  const at=Date.now();
  setCases(v=>v.map(c=>c.id===id?stage==="Treatment"?withHistory({...c,status:"Treatment Approved",treatmentApproval:{doctor:doctor.trim(),note:note.trim(),approvedAt:at},confirmation:undefined,submittedAt:at},"Treatment Approved","dr. "+doctor.trim()+" / PertaLife",note.trim(),at):withHistory({...c,status:"Closed",dischargeApproval:{doctor:doctor.trim(),note:note.trim(),approvedAt:at},confirmation:undefined,submittedAt:at},"Final Discharge Approved","dr. "+doctor.trim()+" / PertaLife",note.trim(),at):c));
  setNotice((stage==="Treatment"?"Treatment":"Final discharge")+" disetujui oleh dr. "+doctor.trim()+".");
 }
 const decide=(id:string,status:CaseStatus)=>{const at=Date.now();setCases(v=>v.map(c=>c.id===id?withHistory({...c,status,confirmation:undefined,submittedAt:at},status==="Treatment Active"?"Admission Approved":"Status Updated","Call Center PertaLife",status,at):c));};

 return <div className="shell">
 <aside>
  <div className="brand"><div className="brandLogoFrame"><img src="/pertalife-logo.webp" alt="PertaLife Insurance" className="brandLogo" width="360" height="170"/></div><span className="brandCaption">MANAGED CARE PORTAL</span></div>
  <SidebarNavigation role={role} view={view} onNavigate={(target,resetFilter)=>{setView(target);if(resetFilter)setStatusFilter(null);if(target==="referrals"){setSelectedCaseId(null);setShowCaseDetail(false)}}} onOpenProviderProfile={openProviderProfile}/>
  <div className="sideFoot"><span>Prototype Mode</span><small>Browser data · No production DB</small></div>
 </aside>
 <main>
  <header><div><h1>{role==="provider"?"Provider Dashboard":"Managed Care Command Center"}</h1><p>{role==="provider"?"Kelola pendaftaran, treatment, dan discharge peserta.":"Master peserta mengikuti struktur data Managed Care PertaLife."}</p></div><div className="switchWrap"><span className="switchLabel">Account Switcher</span><div className="account accountSelector"><div className="avatar">{role==="provider"?<Building2 size={18}/>:<ShieldCheck size={18}/>}</div><div className="accountSelectText"><b>{role==="provider"?activeProvider.name:"Call Center PertaLife"}</b><span>{role==="provider"?activeProvider.code:"Verifier 24/7"}</span></div><select aria-label="Account Switcher" value={role==="callcenter"?"callcenter":activeProvider.code} onChange={e=>{const v=e.target.value;if(v==="callcenter"){setRole("callcenter")}else{setRole("provider");setActiveProviderCode(v as typeof activeProviderCode)}setView("dashboard");setCareAccess("FKTP");setVisitType("Rawat Jalan");setReferralSearch("");setFkrtlBenefitCard(null);setNotice("");setFound(null);setLookupDone(false);setProfileDraft(null);setBankSearch("");setBankOpen(false)}}><option value="callcenter">Call Center PertaLife</option>{providerAccounts.map(p=><option key={p.code} value={p.code}>{p.name} — {p.code}</option>)}</select><ChevronDown size={17}/></div></div></header>
  {notice&&<div className="notice">{notice}</div>}

  {view==="dashboard"&&<section className="stats">
   {([["Waiting Admission","Waiting Admission",UserRound,role==="callcenter"?"queue":"registration"],["Waiting Treatment","Waiting Treatment Approval",Stethoscope,role==="callcenter"?"queue":"treatment"],["Waiting Discharge","Waiting Discharge",FileCheck2,role==="callcenter"?"queue":"discharge"],["Open Cases","Open",Activity,role==="callcenter"?"queue":"cases"]] as const).map(([label,key,Icon,target])=><button key={label} className="card stat" onClick={()=>{setStatusFilter(key);setView(target);setTimeout(()=>document.getElementById("case-queue")?.scrollIntoView({behavior:"smooth",block:"start"}),0)}}><div><span>{label}</span><strong>{key==="Open"?visibleCases.filter(c=>c.status!=="Closed").length:visibleCases.filter(c=>c.status===key).length}</strong></div><div className="icon"><Icon/></div></button>)}
  </section>}

  {role==="callcenter"&&view==="master"&&<section className="card master">
   <div className="sectionHead"><div><h2>Master Peserta Managed Care</h2><p>Struktur upload: 21 kolom master peserta. FASKES 1 CODE & FASKES 1 NAME wajib, PLAN CODE opsional.</p></div><div className="masterHeadActions"><span className="countPill">{members.length} peserta</span>{members.length>0&&<button className="dangerBtn" onClick={deleteAllMembers}><Trash2 size={15}/>Hapus Semua</button>}</div></div>
   {view==="master"&&<>
    <div className="bulkBox"><div className="bulkIcon"><FileSpreadsheet/></div><div><b>Bulk Upload Data Peserta</b><span>21 kolom termasuk FASKES 1 CODE dan FASKES 1 NAME. PLAN CODE boleh kosong.</span></div><div className="uploadControls"><label className="uploadBtn"><Upload size={17}/>Pilih File Excel<input type="file" accept=".xlsx,.xls" onChange={bulkUpload}/></label></div></div>
    {uploadReview&&<div className="reviewPanel">
     <div className="reviewHead"><div><b>Review Upload: {uploadReview.file}</b><span>Data belum masuk Master Peserta sampai lo menekan Confirm Upload.</span></div><button className="reviewClear" onClick={()=>setUploadReview(null)}>Batalkan Review</button></div>
     <div className="reviewStats reviewStatsClickable">
      <button className={reviewFilter==="all"?"selectedReview":""} onClick={()=>setReviewFilter("all")}><span>Total Row</span><strong>{uploadReview.total}</strong></button>
      <button className={"okReview "+(reviewFilter==="valid"?"selectedReview":"")} onClick={()=>setReviewFilter("valid")}><span>Lolos Validasi</span><strong>{uploadReview.valid}</strong></button>
      {reviewMissingCounts.map(([col,count])=><button key={col} className={"badReview "+(reviewFilter==="missing:"+col?"selectedReview":"")} onClick={()=>setReviewFilter("missing:"+col)}><span>{col}</span><strong>{count}</strong></button>)}
      {uploadReview.duplicate>0&&<button className={"badReview "+(reviewFilter==="duplicate"?"selectedReview":"")} onClick={()=>setReviewFilter("duplicate")}><span>Duplicate CARD NO</span><strong>{uploadReview.duplicate}</strong></button>}
      {uploadReview.optionalWarnings>0&&<button className={"warnReview "+(reviewFilter==="optional"?"selectedReview":"")} onClick={()=>setReviewFilter("optional")}><span>PLAN CODE (Optional)</span><strong>{uploadReview.optionalWarnings}</strong></button>}
     </div>
     {uploadReview.missingHeaders.length>0&&<div className="reviewBlocker"><AlertTriangle size={18}/><div><b>Header wajib belum lengkap</b><span>{uploadReview.missingHeaders.join(", ")}</span></div></div>}
     {uploadReview.missingOptionalHeaders.length>0&&<div className="reviewWarning"><AlertTriangle size={18}/><div><b>Header optional tidak ditemukan</b><span>{uploadReview.missingOptionalHeaders.join(", ")} — tidak memblokir upload.</span></div></div>}
     <div className="issueWrap"><div className="issueTitle"><b>Preview Data Excel</b><span>{reviewFilter==="all"?"Semua row":reviewFilter==="valid"?"Hanya row yang lolos validasi":reviewFilter==="duplicate"?"Hanya duplicate CARD NO":reviewFilter==="optional"?"Hanya row dengan PLAN CODE kosong":"Hanya row dengan "+reviewFilter.replace("missing:","")+" kosong"} · menampilkan maksimal 100 row.</span></div><table><thead><tr><th>Row Excel</th><th>Card No</th><th>Member Name</th><th>Remark</th></tr></thead><tbody>{filteredPreviewRows.length===0?<tr><td colSpan={4} className="emptyState"><b>Tidak ada data pada filter ini</b></td></tr>:filteredPreviewRows.slice(0,100).map((x,i)=>{const parts=[];if(x.missingRequired.length)parts.push("Kosong wajib: "+x.missingRequired.join(", "));if(x.missingOptional.length)parts.push("Kosong optional: "+x.missingOptional.join(", "));if(x.duplicate)parts.push("Duplicate CARD NO");if(!parts.length)parts.push("Lolos validasi");return <tr key={i}><td><b>{x.row}</b></td><td>{x.cardNo}</td><td>{x.name}</td><td><span className={x.missingRequired.length||x.duplicate?"remarkBlocker":x.missingOptional.length?"remarkWarning":"remarkOk"}>{parts.join(" | ")}</span></td></tr>})}</tbody></table></div>
     <div className="reviewActions"><span>{uploadReview.missingHeaders.length||uploadReview.previewRows.some(r=>r.missingRequired.length>0)||uploadReview.duplicate?<><AlertTriangle size={16}/> Upload dikunci sampai seluruh kolom wajib lengkap dan CARD NO unik.</>:<><CheckCircle2 size={16}/> Semua data wajib lolos validasi. PLAN CODE boleh kosong.</>}</span><button className="primary" disabled={uploadReview.missingHeaders.length>0||uploadReview.previewRows.some(r=>r.missingRequired.length>0)||uploadReview.duplicate>0||uploadReview.total===0} onClick={confirmUpload}><CheckCircle2 size={17}/>Confirm Upload {uploadReview.valid} Peserta</button></div>
    </div>}
   </>}
   <div className="masterToolbar"><div className="search"><Search size={16}/><input value={memberQuery} onChange={e=>{setMemberQuery(e.target.value);setMemberPage(1)}} placeholder="Cari CARD NO, nama, membership, pekerja, perusahaan..."/></div><div className="masterToolbarRight"><small>{filteredMembers.length} dari {members.length} peserta</small><label>Tampilkan <select value={memberPageSize} onChange={e=>{setMemberPageSize(Number(e.target.value));setMemberPage(1)}}><option value={50}>50</option><option value={100}>100</option><option value={250}>250</option></select></label></div></div>
   <div className="miniTable"><table><thead><tr><th>Card / Membership</th><th>Peserta & Relasi</th><th>Pekerja</th><th>Perusahaan</th><th>Polis / Plan</th><th>Periode</th><th>Faskes 1</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
    {filteredMembers.length===0?<tr><td colSpan={9} className="emptyState"><b>Belum ada data peserta</b><small>Upload file Excel master peserta dari menu ini.</small></td></tr>:pageMembers.map(m=><tr key={m.cardNo}><td><b>{m.cardNo}</b><small>{m.membershipNo}</small></td><td><b>{m.name}</b><small>{relationLabel(m.relation)} · {m.gender||"-"} · {m.maritalStatus||"-"}</small></td><td><b>{m.employeeName||"-"}</b><small>{m.employeeMembershipNo||"-"}</small></td><td><b>{m.company}</b><small>{m.department||"-"}</small></td><td><b>{m.policyNo||"-"}</b><small>{m.product||"-"} · {m.planName||"-"} {m.planCode?"("+m.planCode+")":""}</small></td><td><b>{niceDate(m.inception||m.startDate)}</b><small>s.d. {niceDate(m.expiry||m.endDate)}</small></td><td><b>{faskesName(m)||"Belum dimapping"}</b><small>{faskesCode(m)||"-"}</small></td><td><span className={"statusDot "+(isActiveMember(m)?"ok":"no")}>{isActiveMember(m)?"Aktif":"Tidak Aktif"}</span></td><td><button className="rowDelete" onClick={()=>deleteMember(m.cardNo,m.name)}><Trash2 size={15}/>Hapus</button></td></tr>)}
   </tbody></table></div>
   {filteredMembers.length>0&&<div className="pagination"><span>Menampilkan {(safeMemberPage-1)*memberPageSize+1}-{Math.min(safeMemberPage*memberPageSize,filteredMembers.length)} dari {filteredMembers.length}</span><div><button disabled={safeMemberPage<=1} onClick={()=>setMemberPage(Math.max(1,safeMemberPage-1))}><ChevronLeft size={16}/>Sebelumnya</button><b>Halaman {safeMemberPage} / {memberPageCount}</b><button disabled={safeMemberPage>=memberPageCount} onClick={()=>setMemberPage(Math.min(memberPageCount,safeMemberPage+1))}>Berikutnya<ChevronRight size={16}/></button></div></div>}
  </section>}

  {role==="provider"&&view==="profile"&&profileDraft&&<section className="card providerProfile">
   <div className="sectionHead"><div><h2>Profile Provider</h2><p>Data ini digunakan untuk kebutuhan operasional dan autofill pengajuan klaim.</p></div><span className="countPill">{activeProvider.code}</span></div>
   <div className="profileSection">
    <div className="profileSectionTitle"><Building2 size={18}/><div><b>Identitas Provider</b><span>Kode dan nama provider terkunci mengikuti akun provider.</span></div></div>
    <div className="profileGrid">
     <label>Provider Code<input value={profileDraft.providerCode} readOnly/></label>
     <label>Provider Name<input value={profileDraft.providerName} readOnly/></label>
     <label>Jenis Provider<select value={profileDraft.providerType} onChange={e=>setProfileDraft({...profileDraft,providerType:e.target.value})}><option>Rumah Sakit</option><option>Klinik</option><option>Puskesmas/FKTP</option><option>Dokter Praktik</option><option>Dokter Gigi</option><option>Laboratorium</option><option>Apotek</option></select></label>
     <label>Kota<input value={profileDraft.city} onChange={e=>setProfileDraft({...profileDraft,city:e.target.value})} placeholder="Kota / Kabupaten"/></label>
     <label className="full">Alamat Provider<textarea value={profileDraft.address} onChange={e=>setProfileDraft({...profileDraft,address:e.target.value})} placeholder="Alamat lengkap provider"/></label>
     <label>PIC / Contact Person<input value={profileDraft.contactPerson} onChange={e=>setProfileDraft({...profileDraft,contactPerson:e.target.value})} placeholder="Nama PIC provider"/></label>
     <label>Telepon<input value={profileDraft.phone} onChange={e=>setProfileDraft({...profileDraft,phone:e.target.value})} placeholder="Nomor telepon"/></label>
     <label>Email<input type="email" value={profileDraft.email} onChange={e=>setProfileDraft({...profileDraft,email:e.target.value})} placeholder="Email provider"/></label>
    </div>
   </div>
   <div className="profileSection bankProfile">
    <div className="profileSectionTitle"><FileSpreadsheet size={18}/><div><b>Data Rekening Pembayaran</b><span>Akan otomatis terisi saat Provider membuat single claim maupun bundle claim.</span></div></div>
    <div className="profileGrid">
     <label>Metode Pembayaran<select value={profileDraft.paymentMethod} onChange={e=>setProfileDraft({...profileDraft,paymentMethod:e.target.value})}><option>Transfer</option><option>Giro</option></select></label>
     <label>Nama Bank<div className="bankCombobox"><div className="bankSearchInput"><Search size={15}/><input value={bankSearch} onFocus={()=>setBankOpen(true)} onChange={e=>{setBankSearch(e.target.value);setProfileDraft({...profileDraft,bankName:""});setBankOpen(true)}} placeholder="Cari nama bank / kode bank..."/><ChevronDown size={15}/></div>{bankOpen&&<div className="bankDropdown">{filteredBanks.length===0?<div className="bankEmpty">Bank tidak ditemukan</div>:filteredBanks.map(b=><button type="button" key={b.code+"-"+b.name} onMouseDown={e=>e.preventDefault()} onClick={()=>{setProfileDraft({...profileDraft,bankName:b.name});setBankSearch(b.name);setBankOpen(false)}}><span>{b.name}</span><small>Kode {b.code}</small></button>)}</div>}</div>{profileDraft.bankName&&<small className="bankSelected">Terpilih: {profileDraft.bankName}</small>}</label>
     <label>No. Rekening<input inputMode="numeric" value={profileDraft.accountNo} onChange={e=>setProfileDraft({...profileDraft,accountNo:e.target.value.replace(/\D/g,"")})} placeholder="Nomor rekening"/></label>
     <label>Atas Nama Rekening<input value={profileDraft.accountName} onChange={e=>setProfileDraft({...profileDraft,accountName:e.target.value})} placeholder="Nama pemilik rekening"/></label>
    </div>
   </div>
   <div className="profileActions"><div>{profileDraft.updatedAt?<span>Terakhir disimpan {new Date(profileDraft.updatedAt).toLocaleString("id-ID")}</span>:<span>Profile belum pernah disimpan.</span>}</div><button className="primary" onClick={saveProviderProfile}><CheckCircle2 size={17}/>Simpan Profile</button></div>
  </section>}

  {role==="provider"&&(view==="dashboard"||view==="registration")&&<section className="card eligibility">
   <div><h2>Pendaftaran & Eligibility Peserta</h2><p>Provider: <b>{activeProvider.name}</b> · <b>{activeProvider.code}</b>. Pilih jalur pasien terlebih dahulu, lalu lakukan pengecekan peserta atau buka rujukan yang sudah disetujui.</p></div>
   <div className="entryPathIntro"><span className="entryStepTag">LANGKAH 1 · JALUR KEDATANGAN PASIEN</span><h3>Pasien datang untuk pelayanan apa?</h3><p>Pilih sesuai kondisi kedatangan pasien. Sistem akan menampilkan alur verifikasi yang sesuai.</p></div>
   <div className="entryPathCards" role="group" aria-label="Pilih jalur akses pelayanan">
    <button type="button" className={"entryPathCard "+(careAccess==="FKTP"?"selected":"")} aria-pressed={careAccess==="FKTP"} onClick={()=>chooseAccess("FKTP")}>
     <span className="entryPathIcon"><Stethoscope size={22}/></span>
     <span className="entryPathText"><strong>FKTP · Pemeriksaan Awal</strong><small>Dokter umum atau dokter gigi; pasien terdaftar pada Faskes 1 ini.</small><em>Verifikasi Faskes 1 & kepesertaan</em></span>
     <CheckCircle2 className="entryPathCheck" size={18}/>
    </button>
    {activeProvider.code==="PRV-HERMINA-KMY-001"&&<button type="button" className={"entryPathCard "+(careAccess==="FKRTL"?"selected":"")} aria-pressed={careAccess==="FKRTL"} onClick={()=>chooseAccess("FKRTL")}>
     <span className="entryPathIcon"><Building2 size={22}/></span>
     <span className="entryPathText"><strong>FKRTL · Rujukan Spesialis</strong><small>Pasien sudah dirujuk dan disetujui Call Center PertaLife.</small><em>Buka episode FKRTL yang sudah dibuat</em></span>
     <CheckCircle2 className="entryPathCheck" size={18}/>
    </button>}
    <button type="button" className={"entryPathCard emergency "+(careAccess==="Emergency"?"selected":"")} aria-pressed={careAccess==="Emergency"} onClick={()=>chooseAccess("Emergency")}>
     <span className="entryPathIcon"><AlertTriangle size={22}/></span>
     <span className="entryPathText"><strong>{activeProvider.code==="PRV-HERMINA-KMY-001"?"IGD · Gawat Darurat":"Pertolongan Darurat Awal"}</strong><small>{activeProvider.code==="PRV-HERMINA-KMY-001"?"Pasien gawat darurat datang langsung ke IGD, tanpa surat rujukan awal.":"Penilaian, pertolongan awal, dan koordinasi rujukan darurat sesuai kemampuan klinik."}</small><em>{activeProvider.code==="PRV-HERMINA-KMY-001"?"Tidak perlu rujukan awal":"Bukan unit IGD rumah sakit"}</em></span>
     <CheckCircle2 className="entryPathCheck" size={18}/>
    </button>
   </div>
   {careAccess==="FKRTL"?<div className="referralEntry">
    <div className="referralEntryIntro"><div><span className="entryStepTag">LANGKAH 2 · EPISODE YANG SUDAH DISETUJUI</span><h3>Daftar Rujukan ke FKRTL Hermina</h3><p>Episode FKRTL dibuat otomatis saat Call Center menyetujui rujukan internal maupun eksternal. <b>Jangan membuat Admission baru untuk rujukan yang sama.</b></p></div><span className="countPill">{approvedFKRTLCases.length} episode</span></div>
    <label className="referralEntrySearch"><Search size={17}/><input aria-label="Cari episode FKRTL" value={referralSearch} onChange={e=>setReferralSearch(e.target.value)} placeholder="Cari nama, CARD NO, Case ID, atau poli spesialis..."/></label>
    {filteredFKRTLCases.length===0?<div className="referralEntryEmpty"><ShieldCheck size={20}/><div><strong>{approvedFKRTLCases.length?"Tidak ditemukan episode sesuai pencarian.":"Belum ada rujukan yang disetujui."}</strong><p>Rujukan dibuat dari episode FKTP (Kimia Farma atau Hermina), lalu diverifikasi melalui Referral Approval Call Center. Setelah Approved, episode FKRTL otomatis muncul di sini.</p></div></div>:<div className="referralEntryList">{filteredFKRTLCases.map(c=><div className="referralEntryRow" key={c.id}><div><strong>{c.name}</strong><small>{c.memberId} · {c.id}</small><small>Poli: {c.specialty||"Rujukan Spesialis"} · FKTP asal: {c.parentCaseId||"-"}</small></div><div className="referralEntryActions"><span className={"statusDot "+(c.status==="Closed"?"no":"ok")}>{c.status}</span><button type="button" className="reviewClear" onClick={()=>openCaseDetail(c.id)}><Eye size={15}/>Detail</button><button type="button" className="reviewClear" aria-pressed={fkrtlBenefitCard===c.memberId} onClick={()=>setFkrtlBenefitCard(current=>current===c.memberId?null:c.memberId)}><ShieldCheck size={15}/>Benefit & Limit</button>{c.status==="Treatment Active"&&<button type="button" className="primary" onClick={()=>openTreatment(c.id)}><Stethoscope size={16}/>Treatment Request</button>}</div></div>)}</div>}
    <div className="referralEntryNotice"><ShieldCheck size={17}/><span>Approval rujukan adalah izin memulai pelayanan spesialis sesuai rujukan. Tindakan lanjutan tetap mengikuti proses Treatment Request dan batasan benefit.</span></div>
   </div>:<>
    <div className="entryPathInstruction"><span className="entryStepTag">LANGKAH 2 · VERIFIKASI PESERTA</span><div className="accessModeNote"><ShieldCheck size={17}/><span>{careAccess==="Emergency"?(activeProvider.code==="PRV-HERMINA-KMY-001"?"Lakukan asesmen kegawatdaruratan dan stabilisasi segera. Administrasi penjaminan dan verifikasi Call Center tidak boleh menunda penanganan medis.":"Lakukan pertolongan awal sesuai kemampuan klinik; koordinasikan transfer darurat bila diperlukan. Penjaminan tetap diverifikasi PertaLife."):"Cek kepesertaan dan kecocokan Faskes 1. Jika memerlukan spesialis, dokter FKTP membuat rujukan dari episode yang sudah disetujui."}</span></div></div>
    <div className="eligGrid"><label>Card No<input value={cardNo} onChange={e=>setCardNo(e.target.value)} placeholder="Contoh CARD-DUMMY-000001"/></label><label>{careAccess==="Emergency"?"Jenis Pelayanan":"Pelayanan FKTP"}{careAccess==="Emergency"?<input readOnly value={activeProvider.code==="PRV-HERMINA-KMY-001"?"IGD / Gawat Darurat":"Pertolongan Darurat Awal"}/>:<select value={visitType} onChange={e=>setVisitType(e.target.value)}><option value="Rawat Jalan">Rawat Jalan Dokter Umum</option><option value="Rawat Jalan Gigi">Rawat Jalan Dokter Gigi</option></select>}</label><button className="primary" onClick={lookup}><Search size={17}/>Cek Eligibility</button></div>
   {lookupDone&&!found&&<div className="result bad"><AlertTriangle/><div><b>Peserta tidak ditemukan</b><span>Pastikan CARD NO sudah masuk melalui bulk upload PertaLife.</span></div></div>}
   {found&&<div className="eligResult">
    <div className="resultTop"><div><span className={"statusDot "+(active?"ok":"no")}>{active?"COVERAGE AKTIF":"COVERAGE TIDAK AKTIF"}</span><h3>{found.name}</h3><p>{found.cardNo} · {found.membershipNo}</p></div><div className={"matchBox "+(careAccess==="Emergency"||faskesMatch?"match":"mismatch")}><b>{careAccess==="Emergency"?"Jalur Emergency — Rujukan Awal Tidak Wajib":!faskesMapped?"Faskes 1 Belum Dimapping":faskesMatch?"Faskes 1 Sesuai":"Faskes 1 Tidak Sesuai"}</b><span>{foundFaskesName||"Mapping diperlukan oleh PertaLife"}{foundFaskesCode?" · "+foundFaskesCode:""}</span><small>{careAccess==="Emergency"?"Perlu asesmen medis & verifikasi PertaLife":"Matching berdasarkan FASKES 1 CODE"}</small></div></div>
    <div className="detailGrid detailGridWide">
     <div><span>Perusahaan</span><b>{found.company||"-"}</b></div><div><span>Department</span><b>{found.department||"-"}</b></div><div><span>Relationship</span><b>{relationLabel(found.relation)}</b></div>
     <div><span>Employee</span><b>{found.employeeName||"-"}</b></div><div><span>Employee Membership</span><b>{found.employeeMembershipNo||"-"}</b></div><div><span>DOB</span><b>{niceDate(found.dob)}</b></div>
     <div><span>Gender / Marital</span><b>{found.gender||"-"} / {found.maritalStatus||"-"}</b></div><div><span>Policy No</span><b>{found.policyNo||"-"}</b></div><div><span>Product</span><b>{found.product||"-"}</b></div>
     <div><span>Plan</span><b>{found.planName||"-"} {found.planCode?"("+found.planCode+")":""}</b></div><div><span>Coverage</span><b>{niceDate(found.inception||found.startDate)} - {niceDate(found.expiry||found.endDate)}</b></div><div><span>Card No</span><b>{found.cardNo}</b></div>
    </div>
    {careAccess==="FKTP"&&!faskesMatch&&active&&<div className="override"><label className="check"><input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)}/>Ajukan pengecualian Faskes 1 (butuh verifikasi)</label>{urgent&&<><label>Alasan Urgent<select value={urgencyReason} onChange={e=>setUrgencyReason(e.target.value)}><option value="">Pilih alasan</option>{urgencyOptions.map(x=><option key={x}>{x}</option>)}</select></label>{urgencyReason==="Lainnya"&&<label>Penjelasan<input value={urgencyText} onChange={e=>setUrgencyText(e.target.value)} placeholder="Jelaskan alasan urgency"/></label>}</>}</div>}
    <div className="admissionBox"><label>{careAccess==="Emergency"?"Hasil Triase / Asesmen Darurat *":"Keluhan / Indikasi *"}<textarea value={complaint} onChange={e=>setComplaint(e.target.value)} placeholder={careAccess==="Emergency"?"Jelaskan kondisi darurat, hasil triase, tanda vital bila ada, dan penanganan awal...":"Jelaskan keluhan utama peserta"}/></label><button className="primary" disabled={!canSubmit} onClick={submitAdmission}>{careAccess==="Emergency"?"Submit Admission Darurat":"Submit Admission FKTP"} <ArrowRight size={17}/></button>{!active&&<small>Coverage peserta sedang tidak aktif berdasarkan periode INCEPTION/EXPIRY atau START/END DATE.</small>}{careAccess==="Emergency"&&<small>Jalur emergency mengikuti asesmen kegawatdaruratan. Admission tetap diverifikasi Call Center; penanganan pasien tidak ditunda.</small>}{careAccess==="FKTP"&&active&&!faskesMatch&&!urgent&&<small>{faskesMapped?"Submit terkunci karena Faskes 1 tidak sesuai.":"Submit normal terkunci karena Faskes 1 belum dimapping."} Aktifkan permintaan pengecualian jika diperlukan; Call Center tetap harus memverifikasi.</small>}</div>
   </div>}
   </>}
  </section>}
  {role==="provider"&&(view==="dashboard"||view==="registration")&&found&&careAccess!=="FKRTL"&&<BenefitCoverage key={found.cardNo} member={found} memberActive={active} variant="provider"/>}
  {role==="provider"&&(view==="dashboard"||view==="registration")&&careAccess==="FKRTL"&&fkrtlBenefitMember&&<BenefitCoverage key={fkrtlBenefitMember.cardNo} member={fkrtlBenefitMember} memberActive={isActiveMember(fkrtlBenefitMember)} variant="provider"/>}
  {role==="provider"&&view==="referrals"&&<ProviderReferrals cases={visibleCases} eligibleIds={eligibleReferralIds} selectedId={selectedCaseId} onSelect={id=>{setSelectedCaseId(id);setShowCaseDetail(false)}} onSubmit={submitReferral} onDetail={openCaseDetail} onViewLinked={id=>{const child=cases.find(c=>c.id===id);if(child?.providerCode===activeProvider.code)openCaseDetail(id);else setNotice("Episode FKRTL berada di provider tujuan; status approval dan ID-nya sudah tampil pada rujukan.")}}/>}
  {role==="callcenter"&&view==="referrals"&&<CallCenterReferrals cases={cases} onReview={reviewReferral} onDetail={openCaseDetail} onViewBenefit={id=>{setSelectedCaseId(id||null);setShowCaseDetail(false)}}/>}
  {role==="callcenter"&&view==="referrals"&&referralMember&&selectedCase?.referral&&<BenefitCoverage key={referralMember.cardNo} member={referralMember} memberActive={isActiveMember(referralMember)} variant="callcenter"/>}

  {role==="callcenter"&&view==="eligibility"&&<section className="card eligibility">
   <div><h2>Eligibility Review — Call Center</h2><p>Cek status kepesertaan dan 79 item manfaat simulasi. Manfaat sama untuk seluruh peserta Master Peserta pada pilot ini.</p></div>
   <div className="eligGrid"><label>Card No<input value={cardNo} onChange={e=>setCardNo(e.target.value)} placeholder="CARD-DUMMY-000001"/></label><div/><button type="button" className="primary" onClick={lookup}><Search size={17}/>Cari Peserta</button></div>
   {lookupDone&&!found&&<div className="result bad"><AlertTriangle/><div><b>Peserta tidak ditemukan</b><span>Periksa CARD NO atau upload Master Peserta terlebih dahulu.</span></div></div>}
   {found&&<div className="eligResult"><div className="resultTop"><div><span className={"statusDot "+(active?"ok":"no")}>{active?"AKTIF":"TIDAK AKTIF"}</span><h3>{found.name}</h3><p>{found.cardNo} · {found.membershipNo}</p></div></div><div className="detailGrid"><div><span>POLICYNO</span><b>{found.policyNo||"-"}</b></div><div><span>Plan</span><b>{found.planName||"-"}</b></div><div><span>Faskes 1</span><b>{faskesName(found)||"-"} ({faskesCode(found)||"-"})</b></div></div></div>}
  </section>}
  {role==="callcenter"&&view==="eligibility"&&found&&<BenefitCoverage key={found.cardNo} member={found} memberActive={active} variant="callcenter"/>}

  {role==="provider"&&view==="treatment"&&selectedCase&&<section className="card workflowForm">
   <div className="sectionHead"><div><h2>Treatment Request</h2><p>{selectedCase.id} · {selectedCase.name} · {selectedCase.memberId}</p></div><button className="reviewClear" onClick={()=>{setView("dashboard");setSelectedCaseId(null)}}><X size={15}/> Batal</button></div>
   <div className="workflowGrid">
    <label>Diagnosis *<input value={treatmentDiagnosis} onChange={e=>setTreatmentDiagnosis(e.target.value)} placeholder="Diagnosis / dugaan diagnosis"/></label>
    <label>Estimasi Biaya *<div className="moneyInput"><span>Rp</span><input inputMode="numeric" value={treatmentCost} onChange={e=>setTreatmentCost(formatAmountInput(e.target.value))} placeholder="0"/></div></label>
    <label className="full">Tindakan / Lab / Pemeriksaan *<textarea value={treatmentProcedure} onChange={e=>setTreatmentProcedure(e.target.value)} placeholder="Rincian tindakan, pemeriksaan, atau lab yang diminta"/></label>
    <label className="full">Obat / Resep<textarea value={treatmentMedication} onChange={e=>setTreatmentMedication(e.target.value)} placeholder="Nama obat, dosis, frekuensi, durasi, qty bila ada"/></label>
   </div>
   <div className="treatmentReasonCard"><div><b>Alasan / Dasar Pemberian Treatment *</b><span>Jelaskan pertimbangan klinis mengapa obat, pemeriksaan, atau tindakan ini diperlukan.</span></div><textarea value={treatmentReason} onChange={e=>setTreatmentReason(e.target.value)} placeholder="Contoh: berdasarkan diagnosis dan hasil pemeriksaan awal, diperlukan ..."/></div>
   <div className="treatmentUploadCard"><div><b>Lampiran Treatment</b><span>Upload foto obat, resep, permintaan tindakan, hasil pemeriksaan, atau dokumen pendukung.</span></div><label className="uploadBtn"><Upload size={16}/>Pilih Foto / Dokumen<input type="file" multiple accept="image/*,.pdf" onChange={e=>setTreatmentAttachments(Array.from(e.target.files||[]).map(f=>f.name))}/></label>{treatmentAttachments.length>0&&<div className="attachmentList">{treatmentAttachments.map(x=><span key={x}>{x}</span>)}</div>}</div>
   <div className="workflowActions"><span>Request ini akan masuk ke Waiting Treatment Approval.</span><button className="primary" disabled={!treatmentDiagnosis.trim()||!treatmentProcedure.trim()||!treatmentReason.trim()||!treatmentCost.trim()} onClick={submitTreatment}>Submit Treatment Request <ArrowRight size={17}/></button></div>
  </section>}

  {role==="provider"&&view==="discharge"&&selectedCase&&<section className="card workflowForm">
   <div className="sectionHead"><div><h2>Discharge Request</h2><p>{selectedCase.id} · {selectedCase.name} · {selectedCase.memberId}</p></div><button className="reviewClear" onClick={()=>{setView("dashboard");setSelectedCaseId(null)}}><X size={15}/> Batal</button></div>
   <div className="workflowGrid">
    <label>Final Diagnosis *<input value={finalDiagnosis} onChange={e=>setFinalDiagnosis(e.target.value)} placeholder="Diagnosis akhir"/></label>
    <label>Final Bill *<div className="moneyInput"><span>Rp</span><input inputMode="numeric" value={finalBill} onChange={e=>setFinalBill(formatAmountInput(e.target.value))} placeholder="0"/></div></label>
    <label className="full">Catatan Discharge<textarea value={dischargeNotes} onChange={e=>setDischargeNotes(e.target.value)} placeholder="Ringkasan tindakan, obat, kondisi pulang, atau catatan lain"/></label>
   </div>
   <div className="workflowActions"><span>Peserta belum dianggap selesai sampai Call Center melakukan verifikasi discharge.</span><button className="primary" disabled={!finalDiagnosis.trim()||!finalBill.trim()} onClick={submitDischarge}>Submit Discharge <ArrowRight size={17}/></button></div>
  </section>}

  {view==="claim"&&selectedCase&&role==="provider"&&claimDraft&&<section className="card claimForm">
   <div className="sectionHead"><div><h2>Pengajuan Klaim Pembayaran</h2><p>{claimDraft.bundleId||selectedCase.id} · {claimDraft.bundleCaseIds?.length||1} case · Total {formatRupiah(claimDraft.bundleTotalBill||selectedCase.dischargeRequest?.finalBill||0)}</p></div><button className="reviewClear" onClick={()=>{setClaimDraft(null);setSelectedCaseId(null);setView("history")}}><X size={15}/> Batal</button></div>
   {claimDraft.bundleCaseIds&&<div className="bundleSummary"><b>Case dalam Bundle</b><div className="tableWrap"><table><thead><tr><th>Case</th><th>Peserta</th><th>Diagnosis</th><th>Final Bill</th></tr></thead><tbody>{claimDraft.bundleCaseIds.map(id=>{const bc=cases.find(x=>x.id===id);return bc?<tr key={id}><td>{bc.id}</td><td><b>{bc.name}</b><small>{bc.memberId}</small></td><td>{bc.dischargeRequest?.finalDiagnosis||"-"}</td><td><b>{formatRupiah(bc.dischargeRequest?.finalBill||0)}</b></td></tr>:null})}</tbody></table></div></div>}
   <div className="claimGrid">
    <label>Tanggal Penerimaan<input type="date" value={claimDraft.receiptDate} onChange={e=>setClaimDraft({...claimDraft,receiptDate:e.target.value})}/></label>
    <label>Produk<input value={claimDraft.product} onChange={e=>setClaimDraft({...claimDraft,product:e.target.value})}/></label>
    <label>Jenis Klaim<select value={claimDraft.claimType} onChange={e=>setClaimDraft({...claimDraft,claimType:e.target.value})}><option>Rumah Sakit</option><option>Klinik</option><option>Rawat Jalan</option><option>Rawat Inap</option><option>UGD / IGD</option><option>Emergency Gigi</option></select></label>
    <label>Jenis Reimbursement<input value={claimDraft.reimbursementType} onChange={e=>setClaimDraft({...claimDraft,reimbursementType:e.target.value})} placeholder="Opsional"/></label>
    <label>Nama Bank *<input value={claimDraft.bankName} onChange={e=>setClaimDraft({...claimDraft,bankName:e.target.value})} placeholder="Contoh Bank Mandiri"/></label>
    <label>Metode Pembayaran<select value={claimDraft.paymentMethod} onChange={e=>setClaimDraft({...claimDraft,paymentMethod:e.target.value})}><option>Transfer</option><option>Giro</option></select></label>
    <label>No. Rekening *<input value={claimDraft.accountNo} onChange={e=>setClaimDraft({...claimDraft,accountNo:e.target.value.replace(/\D/g,"")})} inputMode="numeric"/></label>
    <label>Atas Nama *<input value={claimDraft.accountName} onChange={e=>setClaimDraft({...claimDraft,accountName:e.target.value})}/></label>
    <label>Nama Pemohon<input value={claimDraft.applicantName} onChange={e=>setClaimDraft({...claimDraft,applicantName:e.target.value})}/></label>
    <label>Nama Peserta<input value={claimDraft.participantName} readOnly/></label>
    <label>No. Peserta<input value={claimDraft.participantNo} readOnly/></label>
    <label>Telepon<input value={claimDraft.phone} onChange={e=>setClaimDraft({...claimDraft,phone:e.target.value})}/></label>
    <label>Email<input type="email" value={claimDraft.email} onChange={e=>setClaimDraft({...claimDraft,email:e.target.value})}/></label>
    <label>Status Pengajuan<input value={claimDraft.applicationStatus} readOnly/></label>
    <label>Pengaju<input value={claimDraft.submittedBy} readOnly/></label>
    <label>Diterima Oleh<input value={claimDraft.receivedBy} readOnly placeholder="Diisi PertaLife"/></label>
    <label className="claimCheck"><input type="checkbox" checked={claimDraft.claimProkes} onChange={e=>setClaimDraft({...claimDraft,claimProkes:e.target.checked})}/>Checklist Klaim Prokes</label>
    <label className="full">Keterangan<textarea value={claimDraft.description} onChange={e=>setClaimDraft({...claimDraft,description:e.target.value})}/></label>
   </div>
   <div className="claimDocs"><div className="claimDocsHead"><h3>Dokumen Persyaratan Klaim</h3><span>Tandai dokumen yang tersedia. Nama file dicatat untuk prototype; file belum disimpan ke server.</span></div>
    <table><thead><tr><th>No</th><th>Dokumen</th><th>Tersedia</th><th>File</th></tr></thead><tbody>{claimDraft.documents.map((d,i)=><tr key={d.label}><td>{i+1}</td><td><b>{d.label}</b></td><td><input type="checkbox" checked={d.submitted} onChange={e=>{const docs=claimDraft.documents.map((x,j)=>j===i?{...x,submitted:e.target.checked}:x);setClaimDraft({...claimDraft,documents:docs})}}/></td><td><input type="file" onChange={e=>{const fileName=e.target.files?.[0]?.name||"";const docs=claimDraft.documents.map((x,j)=>j===i?{...x,fileName,submitted:!!fileName||x.submitted}:x);setClaimDraft({...claimDraft,documents:docs})}}/>{d.fileName&&<small>{d.fileName}</small>}</td></tr>)}</tbody></table>
   </div>
   <div className="workflowActions"><span>Total Bundle yang diajukan: <b>{formatRupiah(claimDraft.bundleTotalBill||selectedCase.dischargeRequest?.finalBill||0)}</b></span><button className="primary" onClick={submitClaim}>Submit Klaim ke PertaLife <ArrowRight size={17}/></button></div>
  </section>}

  {view==="claim"&&selectedCase&&role==="callcenter"&&selectedCase.claimSubmission&&<section className="card claimForm">
   <div className="sectionHead"><div><h2>Review Klaim Provider</h2><p>{selectedCase.id} · {selectedCase.provider} · {selectedCase.name}</p></div><button className="reviewClear" onClick={()=>{setSelectedCaseId(null);setView("history")}}><X size={15}/> Tutup</button></div>
   <div className="claimSummary">
    <div><span>Tanggal Penerimaan</span><b>{niceDate(selectedCase.claimSubmission.receiptDate)}</b></div><div><span>Produk</span><b>{selectedCase.claimSubmission.product||"-"}</b></div><div><span>Jenis Klaim</span><b>{selectedCase.claimSubmission.claimType||"-"}</b></div><div><span>Jenis Reimbursement</span><b>{selectedCase.claimSubmission.reimbursementType||"-"}</b></div>
    <div><span>Nama Bank</span><b>{selectedCase.claimSubmission.bankName||"-"}</b></div><div><span>Metode Pembayaran</span><b>{selectedCase.claimSubmission.paymentMethod||"-"}</b></div><div><span>No. Rekening</span><b>{selectedCase.claimSubmission.accountNo||"-"}</b></div><div><span>Atas Nama</span><b>{selectedCase.claimSubmission.accountName||"-"}</b></div>
    <div><span>Nama Pemohon</span><b>{selectedCase.claimSubmission.applicantName||"-"}</b></div><div><span>Nama Peserta</span><b>{selectedCase.claimSubmission.participantName}</b></div><div><span>No. Peserta</span><b>{selectedCase.claimSubmission.participantNo}</b></div><div><span>Final Bill</span><b>{formatRupiah(selectedCase.dischargeRequest?.finalBill||0)}</b></div>
    <div><span>Telepon</span><b>{selectedCase.claimSubmission.phone||"-"}</b></div><div><span>Email</span><b>{selectedCase.claimSubmission.email||"-"}</b></div><div><span>Status Pengajuan</span><b>{selectedCase.claimSubmission.applicationStatus}</b></div><div><span>Checklist Prokes</span><b>{selectedCase.claimSubmission.claimProkes?"Ya":"Tidak"}</b></div>
    <div className="full"><span>Keterangan</span><b>{selectedCase.claimSubmission.description||"-"}</b></div>
   </div>
   <div className="claimReceive"><label>Diterima Oleh<input value={selectedCase.claimSubmission.receivedBy} onChange={e=>updateClaimMeta(selectedCase.id,{receivedBy:e.target.value})} placeholder="Nama PIC PertaLife"/></label></div>
   <div className="claimDocs"><div className="claimDocsHead"><h3>Dokumen Persyaratan Klaim</h3><span>Checklist internal PertaLife: CS / CL / FA dan keterangan.</span></div>
    <table><thead><tr><th>No</th><th>Dokumen</th><th>Provider</th><th>CS</th><th>CL</th><th>FA</th><th>Keterangan</th></tr></thead><tbody>{selectedCase.claimSubmission.documents.map((d,i)=><tr key={d.label}><td>{i+1}</td><td><b>{d.label}</b><small>{d.fileName||"Tidak ada file"}</small></td><td><span className={d.submitted?"remarkOk":"remarkWarning"}>{d.submitted?"Ada":"Tidak Ada"}</span></td><td><input type="checkbox" checked={d.cs} onChange={e=>updateClaimDocument(selectedCase.id,i,{cs:e.target.checked})}/></td><td><input type="checkbox" checked={d.cl} onChange={e=>updateClaimDocument(selectedCase.id,i,{cl:e.target.checked})}/></td><td><input type="checkbox" checked={d.fa} onChange={e=>updateClaimDocument(selectedCase.id,i,{fa:e.target.checked})}/></td><td><input value={d.remark} onChange={e=>updateClaimDocument(selectedCase.id,i,{remark:e.target.value})} placeholder="Keterangan"/></td></tr>)}</tbody></table>
   </div>
  </section>}

  {showCaseDetail&&selectedCase&&<section className="card caseDetail">
   <div className="sectionHead"><div><h2>Detail Case {selectedCase.id}</h2><p>{selectedCase.name} · {selectedCase.memberId}</p></div><button className="reviewClear" onClick={()=>setShowCaseDetail(false)}><X size={15}/> Tutup</button></div>
   <div className="detailGrid detailGridWide caseDetailGrid">
    <div><span>Status</span><b>{selectedCase.status}</b></div><div><span>Tingkat Pelayanan</span><b>{selectedCase.careLevel||"FKTP (legacy)"}</b></div><div><span>Jalur Akses</span><b>{selectedCase.accessRoute||"FKTP (legacy)"}</b></div>{selectedCase.parentCaseId&&<div><span>Episode FKTP Asal</span><b>{selectedCase.parentCaseId}</b></div>}{selectedCase.specialty&&<div><span>Poli Spesialis</span><b>{selectedCase.specialty}</b></div>}{selectedCase.referral&&<><div><span>Status Rujukan</span><b>{selectedCase.referral.status}</b></div><div><span>Rujukan</span><b>{selectedCase.referral.refNumber} · {selectedCase.referral.specialty}</b></div><div><span>Catatan Verifikasi Rujukan</span><b>{selectedCase.referral.reviewNote||"-"}</b></div>{selectedCase.referral.linkedCaseId&&<div><span>Episode FKRTL Terkait</span><b>{selectedCase.referral.linkedCaseId}</b></div>}</>}<div><span>Provider</span><b>{selectedCase.provider}</b></div><div><span>Provider Code</span><b>{selectedCase.providerCode||"-"}</b></div><div><span>Jenis Kunjungan</span><b>{selectedCase.visitType}</b></div>
    <div><span>Urgent</span><b>{selectedCase.urgent?"Ya":"Tidak"}</b></div><div><span>Alasan Urgent</span><b>{selectedCase.urgencyReason||"-"}</b></div><div><span>Keluhan</span><b>{selectedCase.issue}</b></div><div><span>Polis / Plan</span><b>{selectedCase.policyNo||"-"} / {selectedCase.planName||"-"}</b></div>
    {selectedCase.treatmentRequest&&<><div><span>Diagnosis</span><b>{selectedCase.treatmentRequest.diagnosis}</b></div><div><span>Estimasi Biaya</span><b>{formatRupiah(selectedCase.treatmentRequest.estimatedCost)}</b></div><div><span>Tindakan</span><b>{selectedCase.treatmentRequest.procedure}</b></div><div><span>Obat / Resep</span><b>{selectedCase.treatmentRequest.medication||"-"}</b></div><div><span>Alasan Treatment</span><b>{selectedCase.treatmentRequest.reason||"-"}</b></div><div><span>Lampiran Treatment</span><b>{selectedCase.treatmentRequest.attachments?.join(", ")||"-"}</b></div></>}
    {selectedCase.dischargeRequest&&<><div><span>Final Diagnosis</span><b>{selectedCase.dischargeRequest.finalDiagnosis}</b></div><div><span>Final Bill</span><b>{formatRupiah(selectedCase.dischargeRequest.finalBill)}</b></div><div><span>Catatan Discharge</span><b>{selectedCase.dischargeRequest.notes||"-"}</b></div></>}{selectedCase.treatmentApproval&&<><div><span>Approval Treatment</span><b>dr. {selectedCase.treatmentApproval.doctor}</b></div><div><span>Catatan Approval Treatment</span><b>{selectedCase.treatmentApproval.note}</b></div></>}{selectedCase.dischargeApproval&&<><div><span>Approval Final Discharge</span><b>dr. {selectedCase.dischargeApproval.doctor}</b></div><div><span>Catatan Approval Discharge</span><b>{selectedCase.dischargeApproval.note}</b></div></>}
    {selectedCase.confirmation&&<><div><span>Need Confirmation</span><b>{selectedCase.confirmation.stage}: {selectedCase.confirmation.reason}</b></div><div><span>Respons Provider</span><b>{selectedCase.confirmation.response||"Belum ada respons"}</b></div></>}
    {selectedCase.billing&&<><div><span>Status Pembayaran</span><b>{selectedCase.billing.status}</b></div><div><span>Reminder</span><b>{selectedCase.billing.reminderCount||0} kali</b></div></>}
   </div>
   <div className="caseEvidence">
    <div className="caseSubhead"><Upload size={17}/><div><b>Lampiran Case</b><span>Dokumen/foto yang dikirim Provider pada treatment dan klaim.</span></div></div>
    <div className="evidenceList">
     {selectedCase.treatmentRequest?.attachments?.length?selectedCase.treatmentRequest.attachments.map(name=><span key={"tr-"+name}><FileSpreadsheet size={14}/>{name}<small>Treatment</small></span>):null}
     {selectedCase.claimSubmission?.documents?.filter(d=>d.fileName).map(d=><span key={"cl-"+d.label}><FileSpreadsheet size={14}/>{d.fileName}<small>{d.label}</small></span>)}
     {!selectedCase.treatmentRequest?.attachments?.length&&!selectedCase.claimSubmission?.documents?.some(d=>d.fileName)&&<div className="emptyEvidence">Belum ada lampiran pada case ini.</div>}
    </div>
   </div>
   <div className="caseTimeline">
    <div className="caseSubhead"><Clock3 size={17}/><div><b>History Log Case</b><span>Jejak submit, verifikasi, approval, klaim, reminder, dan pembayaran.</span></div></div>
    <div className="timelineList">{selectedHistory.length===0?<div className="emptyEvidence">Belum ada history log yang dapat ditampilkan.</div>:selectedHistory.slice().sort((a,b)=>b.at-a.at).map((h,i)=><div className="timelineItem" key={h.at+"-"+i}><div className="timelineDot"></div><div><b>{h.event}</b><span>{h.actor} · {new Date(h.at).toLocaleString("id-ID")}</span>{h.detail&&<p>{h.detail}</p>}</div></div>)}</div>
   </div>
  </section>}

  {view==="history"&&<section className="card dischargeHistory">
   <div className="sectionHead"><div><h2>Riwayat Discharge & Pembayaran</h2><p>{role==="provider"?"Centang beberapa discharge approved untuk dijadikan satu bundle klaim ke PertaLife.":"Pantau discharge provider, bundle klaim, final bill, reminder, dan status proses pembayaran."}</p></div><div className="historyHeadActions">{role==="provider"&&<button className="primary" disabled={!selectedClaimCases.length} onClick={()=>openClaimBundle(selectedClaimCases)}>Ajukan Bundle ({selectedClaimCases.length})</button>}<span className="countPill">{dischargeHistory.length} discharge</span></div></div>
   <div className="tableWrap"><table className="historyTable"><thead><tr>{role==="provider"&&<th>Pilih</th>}<th>Case</th><th>Peserta</th><th>Provider</th><th>Final Diagnosis</th><th>Final Bill</th><th>Discharge</th><th>Pembayaran</th><th>Reminder</th><th>Aksi</th></tr></thead><tbody>
    {dischargeHistory.length===0?<tr><td colSpan={role==="provider"?10:9} className="emptyState"><b>Belum ada riwayat discharge</b><small>Riwayat akan muncul setelah Provider mengajukan discharge.</small></td></tr>:dischargeHistory.map(c=><tr key={c.id}>{role==="provider"&&<td><input type="checkbox" checked={selectedClaimCases.includes(c.id)} disabled={c.status!=="Closed"||!!c.billing} onChange={()=>toggleClaimCase(c.id)}/></td>}<td><b>{c.id}</b><small>{c.dischargeRequest?new Date(c.dischargeRequest.submittedAt).toLocaleString("id-ID"):"-"}</small></td><td><b>{c.name}</b><small>{c.memberId} · {c.company}</small></td><td><b>{c.provider}</b><small>{c.providerCode||"-"}</small></td><td><b>{c.dischargeRequest?.finalDiagnosis||"-"}</b><small>{c.dischargeRequest?.notes||"-"}</small></td><td><b>{formatRupiah(c.dischargeRequest?.finalBill||0)}</b></td><td><span className={"badge "+(c.status==="Closed"?"":"urgent")}>{c.status==="Closed"?"Discharge Approved":c.status}</span></td><td><span className={"billingBadge "+(c.billing?.status==="Paid"?"paid":"")}>{c.billing?.status||"Belum Diajukan"}</span>{c.claimSubmission&&<small>{c.claimSubmission.applicationStatus}</small>}</td><td><b>{c.billing?.reminderCount||0}x</b><small>{c.billing?.lastReminderAt?"Terakhir "+new Date(c.billing.lastReminderAt).toLocaleString("id-ID"):"-"}</small></td><td>{role==="provider"?<div className="actions historyActions">{c.status==="Closed"&&!c.billing&&<button className="approve" onClick={()=>openClaimSubmission(c.id)}>Ajukan Single Klaim</button>}{c.billing&&c.billing.status!=="Paid"&&<button onClick={()=>sendPaymentReminder(c.id)}>Kirim Reminder</button>}{c.billing?.status==="Paid"&&<span className="paidText">Sudah Dibayar</span>}<button onClick={()=>openCaseDetail(c.id)}><Eye size={14}/>Detail</button></div>:<div className="actions historyActions">{c.claimSubmission&&<button onClick={()=>{setSelectedCaseId(c.id);setView("claim")}}><FileSpreadsheet size={14}/>Review Klaim</button>}{!c.billing?<span className="muted">Belum diajukan</span>:c.billing.status==="Submitted"?<button className="approve" onClick={()=>advanceBilling(c.id,"Under Verification")}>Mulai Verifikasi</button>:c.billing.status==="Under Verification"?<button className="approve" onClick={()=>advanceBilling(c.id,"Approved")}>Approve Payment</button>:c.billing.status==="Approved"?<button className="approve" onClick={()=>advanceBilling(c.id,"Scheduled for Payment")}>Schedule Payment</button>:c.billing.status==="Scheduled for Payment"?<button className="approve" onClick={()=>advanceBilling(c.id,"Paid")}>Mark Paid</button>:<span className="paidText">Paid</span>}<button onClick={()=>openCaseDetail(c.id)}><Eye size={14}/>Detail</button></div>}</td></tr>)}
   </tbody></table></div>
  </section>}

  {(view==="dashboard"||view==="queue"||view==="registration"||view==="treatment"||view==="discharge"||view==="cases"||view==="audit")&&<section id="case-queue" className="card queue">
   <div className="sectionHead"><div><h2>{role==="provider"?(view==="registration"?"Admission / Pendaftaran":view==="treatment"?"Treatment Cases":view==="discharge"?"Discharge Cases":"Case Peserta"):"Real-time Verification Queue"}</h2><p>{role==="provider"?"Data case mengikuti menu yang sedang dibuka.":"Buka detail case sebelum melakukan verifikasi bila perlu."}</p></div><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari case, nama, CARD NO..."/></div></div>
   <div className="tableWrap"><table><thead><tr><th>Case</th><th>Peserta</th><th>Provider / Perusahaan</th><th>Polis / Plan</th><th>Status</th><th>SLA</th><th>Aksi</th></tr></thead><tbody>
    {filtered.length===0?<tr><td colSpan={7} className="emptyState"><b>{visibleCases.length===0?"Belum ada case":"Tidak ada case pada filter ini"}</b><small>{visibleCases.length===0?"Case akan muncul setelah Provider submit admission.":"Klik card aktif lagi untuk menghapus filter."}</small></td></tr>:filtered.map(c=><tr key={c.id}><td><b>{c.id}</b><small>{c.issue}</small></td><td><b>{c.name}</b><small>{c.memberId}</small></td><td><b>{c.provider}</b><small>{c.company}</small></td><td><b>{c.policyNo||"-"}</b><small>{c.planName||"-"}</small></td><td><span className={"badge "+(c.urgent?"urgent":"")}>{c.urgent&&<AlertTriangle size={13}/>} {c.status}</span>{c.urgencyReason&&<small>Urgent: {c.urgencyReason}</small>}{c.confirmation&&<small className="confirmationText">Need Confirmation ({c.confirmation.stage}): {c.confirmation.reason}{c.confirmation.response?" · Respons: "+c.confirmation.response:""}</small>}</td><td>{c.status==="Closed"?<span className="slaDone"><CheckCircle2 size={14}/>Selesai</span>:<span className="sla"><Clock3 size={14}/>{fmt(now-c.submittedAt)}</span>}</td><td>{role==="provider"?<div className="actions providerActions"><button onClick={()=>openCaseDetail(c.id)}><Eye size={15}/>Lihat Detail</button>{c.status==="Treatment Active"&&<button className="approve" onClick={()=>openTreatment(c.id)}><Stethoscope size={15}/>Buat Treatment Request</button>}{eligibleReferralIds.includes(c.id)&&<button className="approve" onClick={()=>openReferral(c.id)}><ArrowRight size={15}/>Buat Rujukan FKRTL</button>}{c.referral&&<small>Rujukan FKRTL: {c.referral.status}{c.referral.linkedCaseId?" · "+c.referral.linkedCaseId:""}</small>}{c.status==="Treatment Approved"&&<button className="approve" onClick={()=>openDischarge(c.id)}><FileCheck2 size={15}/>Ajukan Discharge</button>}{c.status==="Waiting Admission"&&<span className="waitingText">Menunggu Verifikasi PertaLife</span>}{c.status==="Waiting Treatment Approval"&&<span className="waitingText">Menunggu Approval Treatment</span>}{c.status==="Waiting Discharge"&&<span className="waitingText">Menunggu Verifikasi Discharge</span>}{c.confirmation&&!c.confirmation.response&&<button className="confirmReply" onClick={()=>respondConfirmation(c.id)}>Tanggapi Konfirmasi</button>}</div>:c.status==="Waiting Admission"?<div className="actions"><button onClick={()=>openCaseDetail(c.id)}><Eye size={15}/>Lihat Detail</button><button className="approve" onClick={()=>decide(c.id,"Treatment Active")}><CheckCircle2 size={15}/>Approve Admission</button><button onClick={()=>requestConfirmation(c.id,"Admission")}>Need Confirmation</button><button>Reject</button></div>:c.status==="Waiting Treatment Approval"?<div className="actions"><button onClick={()=>openCaseDetail(c.id)}><Eye size={15}/>Lihat Detail</button><button className="approve" onClick={()=>approveMedical(c.id,"Treatment")}><CheckCircle2 size={15}/>Approve Treatment</button><button onClick={()=>requestConfirmation(c.id,"Treatment")}>Need Confirmation</button><button>Reject</button></div>:c.status==="Waiting Discharge"?<div className="actions"><button onClick={()=>openCaseDetail(c.id)}><Eye size={15}/>Lihat Detail</button><button className="approve" onClick={()=>approveMedical(c.id,"Discharge")}><CheckCircle2 size={15}/>Approve Discharge</button><button onClick={()=>requestConfirmation(c.id,"Discharge")}>Need Confirmation</button><button>Reject</button></div>:<div className="actions"><button onClick={()=>openCaseDetail(c.id)}><Eye size={15}/>Lihat Detail</button><span className="muted">No action</span></div>}</td></tr>)}
   </tbody></table></div>
  </section>}
  {role==="callcenter"&&view==="dashboard"&&pendingReferrals.length>0&&<section className="notice referralNotice"><span><b>{pendingReferrals.length} pengajuan rujukan</b> menunggu verifikasi Call Center. Approval rujukan membuka episode FKRTL otomatis.</span><button className="primary" onClick={()=>setView("referrals")}>Review Referral <ArrowRight size={16}/></button></section>}
   {role==="callcenter"&&(view==="dashboard"||view==="queue")&&<section className="hint"><ShieldCheck/><div><b>Verifikasi pelayanan tetap dikendalikan PertaLife.</b><span>Admission FKRTL dapat otomatis aktif hanya setelah Referral Approved. Treatment dan Discharge tetap mengikuti approval masing-masing.</span></div><b>{waiting.length} waiting</b></section>}
 </main>
 </div>
}
