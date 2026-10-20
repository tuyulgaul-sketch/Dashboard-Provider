"use client";
import {useEffect,useRef} from "react";
import type {ReactNode} from "react";
import {createPortal} from "react-dom";
import {X} from "lucide-react";
import "./workflow-modal.css";

type Props={title:string;description?:string;children:ReactNode;onClose:()=>void;size?:"large"|"wide";busy?:boolean};
export default function WorkflowModal({title,description,children,onClose,size="wide",busy=false}:Props){
 const dialog=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const previous=document.body.style.overflow;
  const last=document.activeElement instanceof HTMLElement?document.activeElement:null;
  document.body.style.overflow="hidden";
  dialog.current?.focus();
  const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!busy){event.stopPropagation();onClose();}};
  document.addEventListener("keydown",escape);
  return ()=>{document.removeEventListener("keydown",escape);document.body.style.overflow=previous;last?.focus();};
 },[onClose,busy]);
 return createPortal(
  <div className="providerWorkflowBackdrop" onMouseDown={event=>{if(event.target===event.currentTarget&&!busy)onClose()}}>
   <div className={"providerWorkflowDialog "+(size==="large"?"providerWorkflowCompact":"")} ref={dialog} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
    <div className="providerWorkflowHeader">
     <div><span className="providerWorkflowEyebrow">PERTALIFE · TRANSAKSI PROVIDER</span><h2>{title}</h2>{description&&<p>{description}</p>}</div>
     <button type="button" className="providerWorkflowClose" onClick={onClose} disabled={busy} aria-label={"Tutup "+title}><X size={20}/></button>
    </div>
    <div className="providerWorkflowBody">{children}</div>
   </div>
  </div>,document.body);
}
