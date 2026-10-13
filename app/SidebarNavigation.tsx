"use client";
import {useEffect,useState} from "react";
import {Activity,ArrowRight,Building2,ChevronDown,Clock3,Database,FileCheck2,FileSpreadsheet,Settings,ShieldCheck,Stethoscope,UserRound} from "lucide-react";

type Role="provider"|"callcenter";
type Item={label:string;view:string;icon:typeof Activity;route?:string;resetFilter?:boolean;profile?:boolean};
type Group={key:string;label:string;icon:typeof Activity;items:Item[]};
type Props={role:Role;view:string;onNavigate:(view:string,resetFilter?:boolean)=>void;onOpenProviderProfile:()=>void};

const providerGroups:Group[]=[
 {key:"services",label:"Pelayanan Peserta",icon:Stethoscope,items:[
  {label:"Pendaftaran Peserta",view:"registration",icon:UserRound,resetFilter:true},
  {label:"Pengajuan Rujukan",view:"referrals",icon:ArrowRight},
  {label:"Treatment Request",view:"treatment",icon:Stethoscope,resetFilter:true},
  {label:"Discharge",view:"discharge",icon:FileCheck2,resetFilter:true},
  {label:"Case Peserta",view:"cases",icon:Activity,resetFilter:true}
 ]},
 {key:"finance",label:"Klaim & Riwayat",icon:FileSpreadsheet,items:[
  {label:"Riwayat Discharge",view:"history",icon:Clock3},
  {label:"Pengajuan Klaim",view:"claim",route:"history",icon:FileSpreadsheet}
 ]},
 {key:"settings",label:"Pengaturan",icon:Settings,items:[
  {label:"Profile Provider",view:"profile",icon:Building2,profile:true}
 ]}
];
const callCenterGroups:Group[]=[
 {key:"verification",label:"Verifikasi Medis",icon:ShieldCheck,items:[
  {label:"Verification Queue",view:"queue",icon:Clock3,resetFilter:true},
  {label:"Referral Approval",view:"referrals",icon:ArrowRight},
  {label:"Eligibility Review",view:"eligibility",icon:ShieldCheck}
 ]},
 {key:"participants",label:"Data Peserta",icon:Database,items:[
  {label:"Master Peserta",view:"master",icon:Database}
 ]},
 {key:"finance",label:"Klaim & Pembayaran",icon:FileSpreadsheet,items:[
  {label:"Riwayat Discharge",view:"history",icon:Clock3},
  {label:"Klaim Provider",view:"claim",route:"history",icon:FileSpreadsheet}
 ]},
 {key:"oversight",label:"Monitoring",icon:FileCheck2,items:[
  {label:"Audit Trail",view:"audit",icon:FileCheck2}
 ]}
];
export default function SidebarNavigation({role,view,onNavigate,onOpenProviderProfile}:Props){
 const [openGroup,setOpenGroup]=useState<string|null>(null);
 const groups=role==="provider"?providerGroups:callCenterGroups;
 useEffect(()=>{
  const active=groups.find(group=>group.items.some(item=>item.view===view));
  setOpenGroup(active?.key??null);
 },[role,view]);
 function navigate(item:Item){
  if(item.profile){onOpenProviderProfile();return;}
  onNavigate(item.route??item.view,!!item.resetFilter);
 }
 return <nav aria-label="Navigasi utama" className="navAccordion">
  <button type="button" title="Dashboard" className={"navDashboard "+(view==="dashboard"?"active":"")} onClick={()=>{setOpenGroup(null);onNavigate("dashboard")}}>
   <Activity size={18}/><span>Dashboard</span>
  </button>
  {groups.map(group=>{
   const Icon=group.icon, open=openGroup===group.key;
   const hasActive=group.items.some(item=>item.view===view);
   return <div key={group.key} className={"navGroup "+(open?"isOpen ":"")+(hasActive?"hasActive":"")}>
    <button type="button" className="navGroupToggle" title={group.label} aria-expanded={open} aria-controls={open?"nav-group-"+group.key:undefined} onClick={()=>setOpenGroup(prev=>prev===group.key?null:group.key)}>
     <Icon size={18}/><span className="navGroupTitle">{group.label}</span><ChevronDown size={16} className="navGroupChevron"/>
    </button>
    {open&&<div className="navGroupItems" id={"nav-group-"+group.key}>
     {group.items.map(item=>{
      const ItemIcon=item.icon;
      return <button type="button" title={item.label} key={item.label} className={view===item.view?"active":""} onClick={()=>navigate(item)}>
       <ItemIcon size={16}/><span>{item.label}</span>
      </button>;
     })}
    </div>}
   </div>;
  })}
 </nav>;
}
