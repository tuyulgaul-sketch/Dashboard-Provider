/* Provider-facing pilot benefit group mapping. Catalog is unchanged: 79 source rows.
   Financial/reimbursement/admin entitlements are visible to Call Center only.
   Keep every pilot benefit assigned to exactly one provider group OR the financial-only set. */
export type ProviderBenefitGroupId="fktp"|"specialist"|"inpatient"|"emergency"|"special";
export const PROVIDER_BENEFIT_GROUPS:{
 id:ProviderBenefitGroupId;title:string;shortTitle:string;description:string;itemIds:readonly number[];
}[]=[
  {
    "id": "fktp",
    "title": "Rawat Jalan FKTP & Gigi",
    "shortTitle": "FKTP & Gigi",
    "description": "Dokter umum, dokter gigi, obat, imunisasi, dan tindakan awal.",
    "itemIds": [
      1,
      2,
      3,
      4,
      5,
      6,
      14,
      15,
      17,
      22,
      23,
      27,
      28
    ]
  },
  {
    "id": "specialist",
    "title": "Spesialis & Diagnostik",
    "shortTitle": "Spesialis & Diagnostik",
    "description": "Konsultasi spesialis, laboratorium, pencitraan, dan penunjang.",
    "itemIds": [
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      16,
      18,
      19,
      21,
      24,
      25,
      26,
      30,
      61,
      62
    ]
  },
  {
    "id": "inpatient",
    "title": "Rawat Inap & Pembedahan",
    "shortTitle": "Rawat Inap & Operasi",
    "description": "Kamar perawatan, ICU, operasi, serta terapi selama rawat inap.",
    "itemIds": [
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41
    ]
  },
  {
    "id": "emergency",
    "title": "Emergency & IGD",
    "shortTitle": "Emergency & IGD",
    "description": "Ketentuan pelayanan kegawatdaruratan. Tindakan lanjutan mengikuti manfaat terkait.",
    "itemIds": [
      42
    ]
  },
  {
    "id": "special",
    "title": "Manfaat Khusus & Tambahan",
    "shortTitle": "Manfaat Khusus",
    "description": "Maternitas, dialisis, kemoterapi, optik, dan alat bantu medis.",
    "itemIds": [
      20,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      51,
      52,
      53,
      54,
      59,
      60
    ]
  }
];
export const CALLCENTER_ONLY_BENEFIT_IDS:readonly number[]=[29,50,55,56,57,58,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79];
export const providerBenefitGroup=(benefitId:number):ProviderBenefitGroupId|null=>
 PROVIDER_BENEFIT_GROUPS.find(group=>group.itemIds.includes(benefitId))?.id??null;
export const PROVIDER_MEDICAL_BENEFIT_IDS=new Set(PROVIDER_BENEFIT_GROUPS.flatMap(g=>g.itemIds));
export const getRecommendedBenefitGroup=(service:"FKTP"|"FKRTL"|"Emergency"):ProviderBenefitGroupId=>
 service==="Emergency"?"emergency":service==="FKRTL"?"specialist":"fktp";
