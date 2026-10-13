/** Prototype-only comment timeline helpers. No remote storage or authentication. */
export type CommentRole="provider"|"callcenter";
export type CommentKind="need"|"reply"|"comment";
export type ConfirmationStage="Admission"|"Treatment"|"Discharge";
export type CaseComment={
 id:string;at:number;role:CommentRole;author:string;providerCode?:string;
 kind:CommentKind;text:string;stage?:ConfirmationStage;fileIds?:string[];
};
export type CommentCaseShape={
 comments?:CaseComment[];
 history?:{at:number;actor:string;event:string;detail?:string}[];
 confirmation?:{stage:ConfirmationStage;reason:string;requestedAt:number;response?:string;respondedAt?:number};
};
/** Legacy Need Confirmation prompts have an audit history but no comment array.
    Merge older audit events with new structured messages without duplicates. */
export function caseComments(c:CommentCaseShape):CaseComment[]{
 const existing=Array.isArray(c.comments)?c.comments:[];
 const result:CaseComment[]=[...existing];
 const pushLegacy=(at:number,kind:CommentKind,role:CommentRole,author:string,text:string,stage?:ConfirmationStage)=>{
  if(!Number.isFinite(at)||!at||!text.trim())return;
  if(result.some(item=>item.at===at&&item.kind===kind))return;
  result.push({id:"legacy-"+kind+"-"+at,at,kind,role,author,text,stage});
 };
 for(const h of c.history||[]){
  if(h.event.startsWith("Need Confirmation - ")){
   const stage=h.event.slice("Need Confirmation - ".length);
   pushLegacy(h.at,"need","callcenter",h.actor||"Call Center PertaLife",h.detail||"",stage==="Admission"||stage==="Treatment"||stage==="Discharge"?stage:undefined);
  }else if(h.event==="Confirmation Response"){
   pushLegacy(h.at,"reply","provider",h.actor||"Provider",h.detail||"");
  }
 }
 if(c.confirmation){
  pushLegacy(c.confirmation.requestedAt,"need","callcenter","Call Center PertaLife",c.confirmation.reason,c.confirmation.stage);
  if(c.confirmation.respondedAt&&c.confirmation.response)
   pushLegacy(c.confirmation.respondedAt,"reply","provider","Provider",c.confirmation.response,c.confirmation.stage);
 }
 return result.sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
}
export function unreadCaseComments(c:CommentCaseShape,viewer:CommentRole,readAt=0):number{
 return caseComments(c).filter(m=>m.role!==viewer&&m.at>readAt).length;
}
export function commentReadKey(caseId:string,viewerAccount:string):string{
 return viewerAccount+"::"+caseId;
}
