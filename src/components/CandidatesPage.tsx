import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Clock, Euro, Briefcase, User, Mail, Phone, Sparkles, CheckCircle, AlertCircle, FileText, Star, TrendingUp, Zap, Check } from 'lucide-react';
import { getJobs } from '../lib/jobService';
import { COLORS } from '../lib/constants';
import { detectJob } from '../lib/jobDetection';
import { UWiLogo } from './UWiLogo';

interface Job {
  id: string;
  title: string;
  created_at: string;
  role: string;
  city: string;
  date: string;
  duration: string;
  hourly?: string;
  company_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export default function CandidatesPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'offer'>('search');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // État pour "Proposer mes services" avec UWi
  const [freelancePrompt, setFreelancePrompt] = useState('');
  const [freelanceProfile, setFreelanceProfile] = useState<any>(null);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [freelanceContact, setFreelanceContact] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const freelanceInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, filterCity, filterRole]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await getJobs();
      console.log('Annonces chargées:', jobsData);
      setJobs(jobsData as Job[]);
      setFilteredJobs(jobsData as Job[]);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(query) ||
        job.role?.toLowerCase().includes(query) ||
        job.city?.toLowerCase().includes(query) ||
        job.company_name?.toLowerCase().includes(query)
      );
    }

    if (filterCity) {
      filtered = filtered.filter(job => 
        job.city?.toLowerCase().includes(filterCity.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter(job => 
        job.role?.toLowerCase().includes(filterRole.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  // Parser pour extraire les infos du profil freelance
  const parseFreelanceProfile = (text: string) => {
    const lower = text.toLowerCase();
    const profile: any = {
      skills: [] as string[],
      availability: '',
      hourlyRate: '',
      city: '',
      description: ''
    };

    // Détection des compétences/métiers
    const jobKeywords: Record<string, string> = {
      'serveur': 'Serveur', 'serveuse': 'Serveuse', 'cuisinier': 'Cuisinier', 'cuisinière': 'Cuisinière',
      'livreur': 'Livreur', 'livreuse': 'Livreuse', 'vendeur': 'Vendeur', 'vendeuse': 'Vendeuse',
      'barista': 'Barista', 'barman': 'Barman', 'barmaid': 'Barmaid',
      'agent de sécurité': 'Agent de sécurité', 'sécurité': 'Agent de sécurité',
      'déménageur': 'Déménageur', 'magasinier': 'Magasinier', 'caissier': 'Caissier', 'caissière': 'Caissière'
    };

    for (const [keyword, job] of Object.entries(jobKeywords)) {
      if (lower.includes(keyword) && !profile.skills.includes(job)) {
        profile.skills.push(job);
      }
    }

    // Si pas de métier détecté, essayer avec detectJob
    if (profile.skills.length === 0) {
      const detected = detectJob(lower);
      if (detected) {
        profile.skills.push(detected.name);
      }
    }

    // Détection disponibilités
    const availabilityPatterns = [
      { pattern: /\b(soir|soirée|soirées)\b/i, value: 'Soirées' },
      { pattern: /\b(matin|matinée|matinées)\b/i, value: 'Matinées' },
      { pattern: /\b(après[-\s]?midi|aprem)\b/i, value: 'Après-midi' },
      { pattern: /\b(week[-\s]?end|weekends?)\b/i, value: 'Week-ends' },
      { pattern: /\b(urgent|disponible|dispo)\b/i, value: 'Disponible immédiatement' },
      { pattern: /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i, value: 'Jours de semaine' }
    ];

    const availabilities: string[] = [];
    availabilityPatterns.forEach(({ pattern, value }) => {
      if (pattern.test(text) && !availabilities.includes(value)) {
        availabilities.push(value);
      }
    });
    profile.availability = availabilities.join(', ') || '';

    // Détection tarif horaire
    const ratePatterns = [
      /(\d{2,3})\s*(?:€|eur|euros?)\s*\/\s*h(?:eure)?s?/gi,
      /(\d{2,3})\s*(?:€|eur|euros?)\s+par\s+heure/gi,
      /(\d{2,3})\s*(?:€|eur|euros?)\s+heure/gi,
      /tarif[:\s]+(\d{2,3})\s*(?:€|eur)/gi
    ];

    for (const pattern of ratePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = match[1];
        if (parseInt(amount, 10) >= 10 && parseInt(amount, 10) <= 200) {
          profile.hourlyRate = `${amount}€/h`;
          break;
        }
      }
    }

    // Détection ville
    const cities = ['Paris', 'Lyon', 'Lille', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes', 'Strasbourg', 'Bruxelles', 'Namur', 'Mouscron'];
    for (const city of cities) {
      if (lower.includes(city.toLowerCase())) {
        profile.city = city;
        break;
      }
    }

    // Description = texte original si pas d'autres infos extraites
    if (text.trim() && !profile.description) {
      profile.description = text.trim();
    }

    return profile;
  };

  // Générer le profil avec UWi
  const generateProfile = () => {
    if (!freelancePrompt.trim()) return;
    
    setIsGeneratingProfile(true);
    setTimeout(() => {
      const parsed = parseFreelanceProfile(freelancePrompt);
      setFreelanceProfile(parsed);
      setIsGeneratingProfile(false);
    }, 800);
  };

  const handleFreelanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelanceContact.name || !freelanceContact.email) {
      alert('Veuillez renseigner au moins votre nom et email');
      return;
    }
    if (!freelanceProfile || freelanceProfile.skills.length === 0) {
      alert('Veuillez d\'abord générer votre profil en décrivant vos compétences');
      return;
    }
    // TODO: Implémenter la soumission du profil freelance
    alert('Profil créé avec succès ! (Fonctionnalité de sauvegarde en cours de développement)');
  };

  const handleApply = (job: Job) => {
    if (job.contact_email) {
      const subject = encodeURIComponent(`[LastMinuteJob] Candidature - ${job.title || job.role}`);
      window.location.href = `mailto:${job.contact_email}?subject=${subject}`;
    } else if (job.contact_phone) {
      window.location.href = `tel:${job.contact_phone.replace(/\s+/g, '')}`;
    }
  };

  const popularRoles = ['Serveur', 'Cuisinier', 'Livreur', 'Vendeur', 'Agent de sécurité', 'Barista', 'Déménageur', 'Magasinier'];
  const popularCities = ['Lille', 'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes', 'Strasbourg'];

  return (
    <main className="min-h-screen" style={{ backgroundColor: COLORS.neutralBg }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12 md:py-16 border-b border-slate-200" aria-label="En-tête de la page">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
              {activeTab === 'search' ? (
                <>Trouvez votre <span className="text-blue-600">prochaine mission</span></>
              ) : (
                <>Proposez vos <span className="text-blue-600">services</span></>
              )}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {activeTab === 'search' 
                ? 'Des centaines de missions ponctuelles et flexibles près de chez vous'
                : 'Créez votre profil et soyez contacté directement par les recruteurs'}
            </p>
          </div>

          {/* Onglets */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Chercher une mission
            </button>
            <button
              onClick={() => setActiveTab('offer')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'offer'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300'
              }`}
            >
              <Briefcase className="w-4 h-4 inline mr-2" />
              Proposer mes services
            </button>
          </div>
        </div>
      </section>

      {/* Contenu selon l'onglet actif */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' ? (
          <>
            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-8 shadow-sm">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Recherche
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Métier, compétence, entreprise..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ville
                  </label>
                  <input
                    type="text"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    placeholder="Toutes les villes"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Métier
                  </label>
                  <input
                    type="text"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    placeholder="Tous les métiers"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Suggestions rapides */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Suggestions rapides :</p>
                <div className="flex flex-wrap gap-2">
                  {popularRoles.slice(0, 4).map(role => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      {role}
                    </button>
                  ))}
                  {popularCities.slice(0, 4).map(city => (
                    <button
                      key={city}
                      onClick={() => setFilterCity(city)}
                      className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Liste des annonces */}
            <section aria-label="Liste des offres d'emploi">
            {loading ? (
              <div className="text-center py-12" role="status" aria-live="polite">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true"></div>
                <p className="mt-4 text-slate-600">Chargement des annonces...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {jobs.length === 0 
                    ? "Aucune annonce disponible pour le moment" 
                    : "Aucune annonce ne correspond à vos critères"}
                </h2>
                <p className="text-slate-600 mb-4">
                  {jobs.length === 0 
                    ? "Revenez plus tard pour découvrir de nouvelles missions" 
                    : "Essayez de modifier vos critères de recherche"}
                </p>
                {jobs.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCity('');
                      setFilterRole('');
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'annonce trouvée' : 'annonces trouvées'}
                  </h2>
                </div>
                {filteredJobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{job.title || `${job.role} - ${job.city}`}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-3">
                          {job.role && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.role}
                            </span>
                          )}
                          {job.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.city}
                            </span>
                          )}
                          {job.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {job.date}
                            </span>
                          )}
                          {job.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.duration}
                            </span>
                          )}
                          {job.hourly && (
                            <span className="flex items-center gap-1">
                              <Euro className="w-4 h-4" />
                              {job.hourly}
                            </span>
                          )}
                        </div>
                        {job.company_name && (
                          <p className="text-sm text-slate-500 mb-2">
                            <span className="font-medium">Entreprise :</span> {job.company_name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {(job.contact_email || job.contact_phone) ? (
                          <>
                            {job.contact_email && (
                              <button
                                onClick={() => handleApply(job)}
                                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <Mail className="w-4 h-4" />
                                Postuler
                              </button>
                            )}
                            {job.contact_phone && !job.contact_email && (
                              <a
                                href={`tel:${job.contact_phone.replace(/\s+/g, '')}`}
                                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <Phone className="w-4 h-4" />
                                Appeler
                              </a>
                            )}
                          </>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2.5 rounded-lg bg-slate-200 text-slate-500 font-semibold cursor-not-allowed"
                          >
                            Coordonnées indisponibles
                          </button>
                        )}
                        <a
                          href={`#/job/${job.id}`}
                          className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-center"
                        >
                          Voir détails
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </section>
          </>
        ) : (
          <>
            {/* Section "Créer mon profil avec UWi" */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Colonne gauche : Description et génération */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Créez votre profil avec <UWiLogo size="sm" /></h2>
                  </div>
                  <p className="text-slate-600 mb-6">
                    Décrivez simplement ce que vous faites, vos compétences et vos disponibilités. <UWiLogo size="sm" /> génère automatiquement votre profil professionnel.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Décrivez vos compétences et disponibilités
                      </label>
                      <textarea
                        ref={freelanceInputRef}
                        value={freelancePrompt}
                        onChange={(e) => setFreelancePrompt(e.target.value)}
                        placeholder="Ex: Je suis serveur expérimenté, disponible en soirées et week-ends à Lille. Tarif souhaité 15€/h"
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-y"
                      />
                    </div>
                    
                    <button
                      onClick={generateProfile}
                      disabled={!freelancePrompt.trim() || isGeneratingProfile}
                      className="w-full px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ backgroundColor: COLORS.blue }}
                    >
                      {isGeneratingProfile ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Génération en cours...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Générer mon profil avec <UWiLogo size="sm" /></span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Aperçu du profil généré */}
                {freelanceProfile && (
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border-2 border-blue-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Aperçu de votre profil
                    </h3>
                    <div className="space-y-3">
                      {freelanceProfile.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Compétences :</p>
                          <div className="flex flex-wrap gap-2">
                            {freelanceProfile.skills.map((skill: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {freelanceProfile.availability && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Disponibilités :</p>
                          <p className="text-slate-600">{freelanceProfile.availability}</p>
                        </div>
                      )}
                      {freelanceProfile.hourlyRate && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Tarif horaire :</p>
                          <p className="text-slate-600">{freelanceProfile.hourlyRate}</p>
                        </div>
                      )}
                      {freelanceProfile.city && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Localisation :</p>
                          <p className="text-slate-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {freelanceProfile.city}
                          </p>
                        </div>
                      )}
                      {freelanceProfile.description && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Description :</p>
                          <p className="text-slate-600">{freelanceProfile.description}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setFreelancePrompt('');
                        setFreelanceProfile(null);
                      }}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Modifier la description
                    </button>
                  </div>
                )}

                {/* Formulaire de contact */}
                {freelanceProfile && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Vos coordonnées</h3>
                    <form onSubmit={handleFreelanceSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={freelanceContact.name}
                          onChange={(e) => setFreelanceContact({ ...freelanceContact, name: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={freelanceContact.email}
                            onChange={(e) => setFreelanceContact({ ...freelanceContact, email: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                            placeholder="jean@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={freelanceContact.phone}
                            onChange={(e) => setFreelanceContact({ ...freelanceContact, phone: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                            placeholder="06 12 34 56 78"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all"
                        style={{ backgroundColor: COLORS.blue }}
                      >
                        <Check className="w-4 h-4 inline mr-2" />
                        Publier mon profil
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Informations et avantages */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    Pourquoi créer un profil ?
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">Soyez contacté directement par les recruteurs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">Mettez en avant vos compétences et disponibilités</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">Recevez des alertes pour les missions qui vous correspondent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">Gratuit et sans engagement</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Métiers les plus demandés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularRoles.map(role => (
                      <span
                        key={role}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Conseils pour votre profil
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Soyez précis sur vos compétences</li>
                    <li>• Indiquez clairement vos disponibilités</li>
                    <li>• Ajoutez une description qui vous met en valeur</li>
                    <li>• Mettez à jour régulièrement votre profil</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Section Témoignages */}
      <section className="bg-slate-50 py-12 mt-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Ils ont trouvé leur mission</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Marie L.', role: 'Serveuse', text: 'J\'ai trouvé plusieurs missions de serveuse en quelques jours. Très pratique !' },
              { name: 'Thomas D.', role: 'Livreur', text: 'Parfait pour compléter mes revenus. Les missions sont bien rémunérées.' },
              { name: 'Sophie M.', role: 'Cuisinière', text: 'Je reçois régulièrement des propositions qui correspondent à mes compétences.' }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section className="py-12" aria-label="Questions fréquentes">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Comment postuler à une mission ?',
                a: 'Cliquez sur "Postuler" dans l\'annonce qui vous intéresse. Vous serez redirigé vers un email pré-rempli ou un numéro de téléphone selon les coordonnées disponibles.'
              },
              {
                q: 'Les missions sont-elles rémunérées ?',
                a: 'Oui, toutes les missions affichées indiquent la rémunération horaire. Les paiements se font directement avec l\'employeur.'
              },
              {
                q: 'Puis-je créer plusieurs profils ?',
                a: 'Non, un seul profil par personne. Vous pouvez cependant indiquer plusieurs compétences dans votre profil.'
              },
              {
                q: 'Mon profil est-il visible par tous ?',
                a: 'Votre profil sera visible par les recruteurs qui recherchent des profils correspondant à vos compétences et disponibilités.'
              }
            ].map((faq, idx) => (
              <details key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
                <summary className="font-semibold text-slate-900 cursor-pointer">{faq.q}</summary>
                <p className="mt-3 text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

