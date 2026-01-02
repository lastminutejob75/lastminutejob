import { useState, useEffect, useMemo } from 'react';
import { Users, MapPin, Calendar, Clock, Building2, Save, Check, Zap, Sparkles, Truck, Utensils, Coffee, ChefHat, Package, ShoppingCart, Shield, Sparkle, FileText, Rocket, Smile, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { generateAllVariants, lightSpellCheck, formatBullets, type AnnouncementVariant } from '../lib/textQuality';
import { findTemplate, generateEnhancedAnnouncement } from '../lib/jobTemplates';
import { publishJob } from '../lib/jobService';
import { getAutoCompleteContext, saveDraft } from '../lib/autoComplete';
import PrescreenQuestions from './PrescreenQuestions';
import { supabase } from '../lib/supabase';
import { generateSmartAnnouncement } from '../lib/smartAnnouncementGenerator';

function isValidEmail(s=""){const e=(s||"").trim();if(!e||!e.includes("@"))return false;const [l,dom]=e.split("@");if(!l||!dom||!dom.includes("."))return false;return dom.split(".").pop()!.length>=2}
function isValidPhone(s=""){return /^\+?\d[\d\s]{5,14}$/.test(s||"")}

function extractDateFr(text=""){
  const t=(text||"").toLowerCase();
  const today=new Date();today.setHours(0,0,0,0);
  const tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
  const dayAfter=new Date(today);dayAfter.setDate(dayAfter.getDate()+2);
  const daysOfWeek=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
  const months=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

  if(/\b(aujourd'?hui?|ce soir|tonight)\b/i.test(t)){const d=today;return`${daysOfWeek[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`}
  if(/\bdemain\b/i.test(t)){const d=tomorrow;return`${daysOfWeek[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`}
  if(/\bapr[eè]s[- ]?demain\b/i.test(t)){const d=dayAfter;return`${daysOfWeek[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`}

  for(let i=0;i<7;i++){
    const day=daysOfWeek[i];
    if(new RegExp(`\\b${day}\\b`,"i").test(t)){
      let target=new Date(today);
      const diff=(i-target.getDay()+7)%7;
      target.setDate(target.getDate()+(diff||7));
      return`${daysOfWeek[target.getDay()]} ${target.getDate()} ${months[target.getMonth()]}`;
    }
  }

  return "";
}

function Chip({children,onClick,active}:{children:React.ReactNode;onClick:()=>void;active?:boolean}){
  return (
    <button 
      onClick={onClick} 
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-md scale-105' 
          : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 shadow-sm'
      }`}
    >
      {children}
    </button>
  )
}

function Field({label,children,error}:{label:string;children:React.ReactNode;error?:boolean}){
  return (
    <label className="block">
      <div className={`text-xs font-medium mb-1.5 ${error ? 'text-red-600' : 'text-slate-700'}`}>{label}</div>
      {children}
    </label>
  )
}

function Input({value,onChange,type="text",placeholder,error,onKeyDown}:{value:string;onChange:(v:string)=>void;type?:string;placeholder?:string;error?:boolean;onKeyDown?:(e:any)=>void}){
  return (
    <input 
      type={type} 
      value={value} 
      placeholder={placeholder} 
      onChange={e=>onChange((e.target as HTMLInputElement).value)}
      onKeyDown={onKeyDown}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all ${
        error 
          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
          : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
      } outline-none`}
    />
  )
}

function capWords(s:string){
  return s.split(' ').map(w=>w?w[0].toUpperCase()+w.slice(1).toLowerCase():'').join(' ');
}

function genAnnouncement({role,city,date,duration,hourly,contractType,missionType,experience,skills}:{role:string;city:string;date:string;duration:string;hourly:string;contractType?:string;missionType?:string;experience?:string;skills?:string[];}){
  return generateEnhancedAnnouncement(role, city, date, duration, hourly, contractType, missionType, experience, skills);
}

function iconForRole(role:string){
  const r=(role||"").toLowerCase();
  if(r.includes("déménag")||r.includes("demenag")||r.includes("livreur")||r.includes("livreuse")||r.includes("coursier")||r.includes("chauffeur")||r.includes("conducteur")) return Truck;
  if(r.includes("serveur")||r.includes("rang")||r.includes("hôte")||r.includes("runner")) return Utensils;
  if(r.includes("barista")||r.includes("barman")||r.includes("barmaid")||r.includes("sommelier")) return Coffee;
  if(r.includes("cuisin")||r.includes("chef")||r.includes("commis")||r.includes("pizzaiolo")||r.includes("pâtiss")||r.includes("boulang")) return ChefHat;
  if(r.includes("magasin")||r.includes("logist")||r.includes("prépar")||r.includes("prepar")||r.includes("cariste")||r.includes("manutent")) return Package;
  if(r.includes("vendeur")||r.includes("vendeuse")||r.includes("caisse")||r.includes("commercial")) return ShoppingCart;
  if(r.includes("sécur")||r.includes("secur")||r.includes("vigile")||r.includes("gardien")||r.includes("surveillance")) return Shield;
  if(r.includes("nettoy")||r.includes("entretien")||r.includes("ménage")||r.includes("propreté")) return Sparkles;
  return Users;
}

export default function ReviewOptimized({parsed,setParsed,sourceText,onPublish,contact,setContact,quickPublish,user}:{parsed:any;setParsed:(v:any)=>void;sourceText:string;onPublish:(job:any,url:string,editUrl:string)=>void;contact:any;setContact:(v:any)=>void;quickPublish?:boolean;user:any;}){
  const [draft,setDraft]=useState("");
  const [saving,setSaving]=useState(false);
  const [selectedVariant, setSelectedVariant]=useState(0);
  const [variants, setVariants]=useState<AnnouncementVariant[]>([]);
  const [prescreenQuestions, setPrescreenQuestions] = useState<Array<{question_text: string; question_order: number}>>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    extract: true,
    complete: true,
    variants: true,
    edit: false
  });
  const announcement=useMemo(()=>genAnnouncement(parsed),[parsed, parsed.contractType, parsed.missionType, parsed.experience, parsed.skills]);

  useEffect(()=>{setDraft(`${announcement.title}\n\n${announcement.body}`)},[announcement.title,announcement.body]);

  useEffect(()=>{
    const classicVariants = generateAllVariants(parsed.role, parsed.city, parsed.date, parsed.duration, parsed.hourly, parsed.contractType, parsed.missionType, parsed.experience, parsed.skills);
    
    let smartVariants: AnnouncementVariant[] = [];
    
    try {
      const smartContext = {
        role: parsed.role || '',
        city: parsed.city || '',
        date: parsed.date || '',
        duration: parsed.duration || '',
        hourly: parsed.hourly || '',
        contractType: parsed.contractType,
        missionType: parsed.missionType,
        experience: parsed.experience,
        skills: parsed.skills,
        urgency: parsed.urgency,
        language: parsed.language,
        availability: parsed.availability,
        company: contact.company,
      };
      
      const smartAnnouncements = generateSmartAnnouncement(smartContext);
      
      smartVariants = smartAnnouncements
        .filter(sa => sa.style.name !== 'Recommandé')
        .map(sa => ({
          name: sa.style.name,
          description: sa.style.description,
          title: sa.title,
          body: formatBullets(lightSpellCheck(sa.body))
        }));
    } catch (error) {
      console.error('❌ Error generating smart variants:', error);
    }
    
    const allVariants: AnnouncementVariant[] = [
      ...classicVariants,
      ...smartVariants
    ];
    
    setVariants(allVariants);
    if (allVariants.length > 0 && selectedVariant < allVariants.length) {
      setDraft(`${allVariants[selectedVariant].title}\n\n${allVariants[selectedVariant].body}`);
    }
  }, [JSON.stringify(parsed), JSON.stringify(contact)]);

  useEffect(() => {
    getAutoCompleteContext().then(ctx => {
      if (ctx.recentContact && !contact.email && !contact.phone) {
        setContact({
          company: ctx.recentCompany || '',
          name: ctx.recentContact.name || '',
          email: ctx.recentContact.email || '',
          phone: ctx.recentContact.phone || ''
        });
      }
    });
  }, []);

  useEffect(() => {
    const autoSave = setTimeout(() => {
      saveDraft(parsed, sourceText, contact).then(() => setSaving(false));
    }, 2000);
    setSaving(true);
    return () => clearTimeout(autoSave);
  }, [parsed, contact]);

  const autoDate=extractDateFr(draft);
  const haveDate=Boolean(parsed.date||autoDate);
  const missing={ role:!parsed.role, city:!parsed.city, date:!haveDate, duration:!parsed.duration };

  const Icon=iconForRole(parsed.role||"");

  const validEmail=isValidEmail(contact.email);
  const validPhone=isValidPhone(contact.phone);
  const validContact=validEmail||validPhone||user;

  function apply(patch:any){
    const next={...parsed,...patch};
    const template = findTemplate(next.role || '');
    if (template) {
      if (!next.duration && template.defaultDuration) next.duration = template.defaultDuration;
      if (!next.hourly && template.defaultHourly) next.hourly = template.defaultHourly;
    }
    setParsed(next);
    const a=genAnnouncement(next);
    setDraft(`${a.title}\n\n${a.body}`);
  }

  const extractionComplete = parsed.role && parsed.city && (parsed.date || autoDate) && parsed.duration && validContact;
  const extractionScore = [
    parsed.role, parsed.city, (parsed.date || autoDate), parsed.duration, parsed.hourly,
    contact.company, validContact
  ].filter(Boolean).length;
  const extractionPercent = Math.round((extractionScore / 7) * 100);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header simplifié */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Finalisez votre annonce</h1>
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500" 
                style={{width: `${extractionPercent}%`}}
              />
            </div>
            <div className="text-sm font-semibold text-slate-700">{extractionPercent}% complété</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Section: Aperçu de l'annonce */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600"/>
                  Aperçu de l'annonce
                </h2>
                {variants.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {variants.slice(0, 4).map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedVariant(idx);
                          setDraft(`${v.title}\n\n${v.body}`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                          selectedVariant === idx
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Aperçu éditable */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Titre de l'annonce</label>
                    <input
                      type="text"
                      value={draft.split("\n")[0] || ""}
                      onChange={(e) => {
                        const lines = draft.split("\n");
                        lines[0] = e.target.value;
                        setDraft(lines.join("\n"));
                      }}
                      placeholder="Titre de l'annonce"
                      className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-lg text-sm font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description de l'annonce</label>
                    <textarea
                      value={draft.split("\n").slice(1).join("\n") || ""}
                      onChange={(e) => {
                        const title = draft.split("\n")[0] || "";
                        setDraft(title ? `${title}\n\n${e.target.value}` : e.target.value);
                      }}
                      placeholder="Description de l'annonce..."
                      rows={12}
                      className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-700 leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white resize-y"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const corrected = formatBullets(lightSpellCheck(draft));
                      setDraft(corrected);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-300 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4"/>
                    Corriger l'orthographe
                  </button>
                  <button
                    onClick={() => {
                      const title = draft.split("\n")[0] || "";
                      const body = draft.split("\n").slice(1).join("\n");
                      const formatted = formatBullets(body);
                      setDraft(title ? `${title}\n\n${formatted}` : formatted);
                    }}
                    className="px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 hover:border-slate-300 transition-all text-sm flex items-center justify-center gap-2"
                    title="Formater les puces"
                  >
                    <FileText className="w-4 h-4"/>
                    Formater
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contact - Simplifié */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Vos coordonnées</h3>
              
              {(contact.company || contact.name || contact.email || contact.phone) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600"/>
                    <span className="text-xs font-semibold text-blue-700">Auto-détecté</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    {contact.company && <div>• {contact.company}</div>}
                    {contact.name && <div>• {contact.name}</div>}
                    {contact.email && <div>• {contact.email}</div>}
                    {contact.phone && <div>• {contact.phone}</div>}
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Établissement</label>
                  <Input value={contact.company} onChange={v=>setContact({...contact,company:v})} placeholder="Ex: Restaurant"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom</label>
                  <Input value={contact.name} onChange={v=>setContact({...contact,name:v})} placeholder="Ex: Marie"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email <span className="text-amber-600">*</span>
                  </label>
                  <Input type="email" value={contact.email} onChange={v=>setContact({...contact,email:v})} placeholder="contact@exemple.fr" error={!validEmail && contact.email.length > 0}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile <span className="text-amber-600">*</span>
                  </label>
                  <Input type="tel" value={contact.phone} onChange={v=>setContact({...contact,phone:v})} placeholder="06 12 34 56 78" error={!validPhone && contact.phone.length > 0}/>
                </div>
                
                {!validContact && (
                  <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0"/>
                      <p className="text-xs text-amber-700 font-medium">Email ou mobile requis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prescreen Questions */}
            <PrescreenQuestions questions={prescreenQuestions} onChange={setPrescreenQuestions} />

            {/* Bouton Publier - Toujours visible et proéminent */}
            <div className="sticky top-6">
              <button 
                onClick={async ()=>{
                  if(!validContact){
                    alert("Veuillez renseigner un email ou un téléphone valide pour publier");
                    return;
                  }

                  try {
                    const title=draft.split("\n")[0]||"Annonce";
                    const body=draft.split("\n").slice(1).join("\n");
                    const editToken = Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);

                    const jobData = {
                      title,
                      body,
                      role: parsed.role,
                      city: parsed.city,
                      date: parsed.date,
                      duration: parsed.duration,
                      hourly_rate: parsed.hourly,
                      company_name: contact.company,
                      contact_name: contact.name,
                      contact_email: contact.email,
                      contact_phone: contact.phone,
                      edit_token: editToken,
                      user_id: null
                    };

                    const job = await publishJob(jobData);
                    if(job){
                      if(prescreenQuestions.length > 0){
                        const questionsToInsert = prescreenQuestions
                          .filter(q => q.question_text.trim())
                          .map(q => ({
                            job_id: job.id,
                            question_text: q.question_text,
                            question_order: q.question_order
                          }));

                        if(questionsToInsert.length > 0){
                          const { error: questionsError } = await supabase.from('prescreen_questions').insert(questionsToInsert);
                          if(questionsError){
                            console.error('Error inserting questions:', questionsError);
                          }
                        }
                      }

                      const url=`${location.origin}${location.pathname}#/${job.id}`;
                      const editUrl=`${location.origin}${location.pathname}#/${job.id}?edit=${editToken}`;
                      onPublish(job,url,editUrl);
                    } else {
                      alert("❌ Erreur lors de la publication. Vérifiez la console pour plus de détails.");
                    }
                  } catch (error) {
                    console.error('❌ ERREUR PUBLICATION:', error);
                    let errorMsg = 'Erreur inconnue';
                    if (error instanceof Error) {
                      errorMsg = error.message;
                    } else if (typeof error === 'object' && error !== null) {
                      errorMsg = JSON.stringify(error, null, 2);
                    }
                    alert(`❌ Erreur publication:\n\n${errorMsg}\n\nVérifie la console (F12) pour plus de détails.`);
                  }
                }} 
                disabled={!validContact} 
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {extractionComplete ? (
                  <>
                    <CheckCircle2 className="w-6 h-6"/>
                    Publier l'annonce
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-6 h-6"/>
                    Publier ({extractionPercent}%)
                  </>
                )}
              </button>
              
              {extractionComplete && (
                <div className="mt-3 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600"/>
                    <p className="text-xs text-green-700 font-semibold">Prêt à publier !</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
