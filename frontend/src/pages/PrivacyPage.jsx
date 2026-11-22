import { Link } from 'react-router-dom'
import { Shield, FileText, ChevronRight } from 'lucide-react'
import { TomatoIcon } from '../components/TomatoIcon'
import '../styles/globals.css'
import '../styles/privacy.css'

const SECTIONS = [
  { id: 'collecte',       label: 'Données collectées' },
  { id: 'finalites',      label: 'Finalités' },
  { id: 'conservation',   label: 'Conservation' },
  { id: 'droits',         label: 'Vos droits' },
  { id: 'partage',        label: 'Partage des données' },
  { id: 'cookies',        label: 'Cookies' },
  { id: 'conditions',     label: 'Conditions d\'utilisation' },
  { id: 'commandes',      label: 'Commandes & paiement' },
  { id: 'livraison',      label: 'Livraison & retours' },
  { id: 'contact',        label: 'Contact & réclamations' },
]

export default function PrivacyPage() {
  return (
    <>
      <header className="prv-header">
        <div className="page-container prv-header-inner">
          <Link to="/" className="nav-logo prv-logo">
            <TomatoIcon size={22} />
            Tomat'chef
          </Link>
          <Link to="/auth" className="btn btn-outline btn-sm">
            <ChevronRight size={14} /> Retour
          </Link>
        </div>
      </header>

      <main className="prv-main">
        <div className="page-container prv-layout">

          {/* ── Sommaire ── */}
          <aside className="prv-toc">
            <div className="prv-toc-title">Sommaire</div>
            <nav>
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} className="prv-toc-link">{s.label}</a>
              ))}
            </nav>
          </aside>

          {/* ── Contenu ── */}
          <article className="prv-content">

            <div className="prv-hero">
              <div className="prv-hero-icon"><Shield size={28} /></div>
              <div>
                <h1 className="prv-title">Politique de confidentialité &amp; Conditions d'utilisation</h1>
                <p className="prv-meta">Dernière mise à jour&nbsp;: novembre 2026 · Applicable au Sénégal</p>
              </div>
            </div>

            <p className="prv-intro">
              Tomat'chef (ci-après «&nbsp;nous&nbsp;», «&nbsp;notre service&nbsp;») accorde une importance fondamentale à la
              protection de vos données personnelles. Le présent document expose de manière transparente
              les informations que nous collectons, les raisons pour lesquelles nous les utilisons et les droits
              dont vous disposez, conformément à la <strong>Loi n°&nbsp;2008-12 du 25&nbsp;janvier 2008</strong> portant
              sur la protection des données à caractère personnel au Sénégal (ci-après «&nbsp;la Loi&nbsp;»), ainsi
              qu'aux dispositions du Code de la consommation sénégalais.
            </p>

            {/* ── 1. Responsable ── */}
            <section className="prv-section">
              <h2 className="prv-h2">1. Responsable du traitement</h2>
              <p>
                Le responsable du traitement de vos données personnelles est <strong>Tomat'chef</strong>,
                entreprise individuelle domiciliée à Dakar, Sénégal.
              </p>
              <div className="prv-contact-box">
                <div><strong>E-mail&nbsp;:</strong> <a href="mailto:tomatchef@gmail.com">tomatchef@gmail.com</a></div>
                <div><strong>Téléphone&nbsp;:</strong> <a href="tel:+221781882583">+221 78 188 25 83</a></div>
                <div><strong>Adresse&nbsp;:</strong> Dakar, Sénégal</div>
              </div>
            </section>

            {/* ── 2. Données collectées ── */}
            <section className="prv-section" id="collecte">
              <h2 className="prv-h2">2. Données collectées</h2>
              <p>Lors de votre inscription et de votre utilisation de notre service, nous collectons les catégories de données suivantes&nbsp;:</p>
              <ul className="prv-list">
                <li><strong>Données d'identité&nbsp;:</strong> prénom, nom de famille.</li>
                <li><strong>Données de contact&nbsp;:</strong> adresse e-mail, numéro de téléphone, adresse de livraison.</li>
                <li><strong>Données de transaction&nbsp;:</strong> détail des commandes passées, montants, statuts, historique des paiements (simulés).</li>
                <li><strong>Données de fidélité&nbsp;:</strong> points accumulés, niveau de fidélité, récompenses obtenues.</li>
                <li><strong>Données techniques&nbsp;:</strong> adresse IP, type de navigateur, système d'exploitation, pages consultées, durée de session. Ces données sont collectées automatiquement à des fins de sécurité et d'amélioration du service.</li>
              </ul>
              <p>Nous ne collectons <strong>aucune donnée bancaire réelle</strong>. Les paiements sur cette plateforme sont entièrement simulés à titre de démonstration.</p>
            </section>

            {/* ── 3. Finalités ── */}
            <section className="prv-section" id="finalites">
              <h2 className="prv-h2">3. Finalités du traitement</h2>
              <p>Vos données sont traitées pour les finalités suivantes&nbsp;:</p>
              <ul className="prv-list">
                <li>Création et gestion de votre compte client.</li>
                <li>Traitement et suivi de vos commandes.</li>
                <li>Organisation de la livraison à votre adresse.</li>
                <li>Gestion du programme de fidélité et attribution des récompenses.</li>
                <li>Envoi de notifications relatives à vos commandes (statut, confirmation, livraison).</li>
                <li>Amélioration de nos services et expérience utilisateur.</li>
                <li>Respect de nos obligations légales et réglementaires.</li>
              </ul>
            </section>

            {/* ── 4. Base légale ── */}
            <section className="prv-section">
              <h2 className="prv-h2">4. Base légale</h2>
              <p>
                Conformément à la Loi n°&nbsp;2008-12, le traitement de vos données repose sur&nbsp;:
              </p>
              <ul className="prv-list">
                <li>Votre <strong>consentement explicite</strong> lors de la création de votre compte.</li>
                <li>L'<strong>exécution du contrat</strong> de vente lorsque vous passez une commande.</li>
                <li>L'<strong>intérêt légitime</strong> de Tomat'chef pour améliorer ses services et assurer la sécurité de la plateforme.</li>
              </ul>
            </section>

            {/* ── 5. Conservation ── */}
            <section className="prv-section" id="conservation">
              <h2 className="prv-h2">5. Durée de conservation</h2>
              <ul className="prv-list">
                <li><strong>Données de compte&nbsp;:</strong> conservées pendant toute la durée d'activité de votre compte et supprimées dans les 30&nbsp;jours suivant votre demande de suppression.</li>
                <li><strong>Données de commande&nbsp;:</strong> conservées 5&nbsp;ans à compter de la date de commande, conformément aux obligations comptables et fiscales sénégalaises.</li>
                <li><strong>Données techniques (logs)&nbsp;:</strong> conservées 12&nbsp;mois.</li>
              </ul>
            </section>

            {/* ── 6. Droits ── */}
            <section className="prv-section" id="droits">
              <h2 className="prv-h2">6. Vos droits</h2>
              <p>
                Conformément aux articles&nbsp;17 à 23 de la Loi n°&nbsp;2008-12 et aux prérogatives de la
                <strong> Commission des Données Personnelles (CDP)</strong> du Sénégal, vous disposez des droits suivants&nbsp;:
              </p>
              <ul className="prv-list">
                <li><strong>Droit d'accès&nbsp;:</strong> obtenir une copie des données personnelles vous concernant.</li>
                <li><strong>Droit de rectification&nbsp;:</strong> corriger des données inexactes ou incomplètes depuis votre espace «&nbsp;Mon profil&nbsp;».</li>
                <li><strong>Droit à l'effacement&nbsp;:</strong> demander la suppression de votre compte et de vos données via la section «&nbsp;Supprimer mon compte&nbsp;» dans les paramètres.</li>
                <li><strong>Droit d'opposition&nbsp;:</strong> vous opposer au traitement de vos données pour des motifs légitimes.</li>
                <li><strong>Droit à la portabilité&nbsp;:</strong> recevoir vos données dans un format structuré et lisible.</li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à <a href="mailto:tomatchef@gmail.com">tomatchef@gmail.com</a>.
                Toute réclamation non résolue peut être adressée à la <strong>CDP Sénégal</strong> (Commission des Données Personnelles, Dakar).
              </p>
            </section>

            {/* ── 7. Partage ── */}
            <section className="prv-section" id="partage">
              <h2 className="prv-h2">7. Partage des données</h2>
              <p>
                Tomat'chef ne vend, ne loue et ne partage pas vos données personnelles avec des tiers
                à des fins commerciales. Vos données peuvent uniquement être transmises&nbsp;:
              </p>
              <ul className="prv-list">
                <li>Aux prestataires techniques assurant l'hébergement et la maintenance de la plateforme, tenus par des obligations de confidentialité strictes.</li>
                <li>Aux autorités compétentes en cas d'obligation légale ou judiciaire.</li>
              </ul>
            </section>

            {/* ── 8. Cookies ── */}
            <section className="prv-section" id="cookies">
              <h2 className="prv-h2">8. Cookies et données locales</h2>
              <p>
                Notre service utilise le <strong>stockage local du navigateur</strong> (localStorage) pour conserver
                votre session de connexion et les préférences d'affichage. Ces données restent
                exclusivement sur votre appareil et ne sont pas transmises à des serveurs tiers.
              </p>
              <p>
                Nous n'utilisons pas de cookies publicitaires ni de traceurs tiers (analytics, réseaux sociaux).
              </p>
            </section>

            {/* ── 9. Conditions d'utilisation ── */}
            <div className="prv-divider" />
            <div className="prv-section-header" id="conditions">
              <div className="prv-hero-icon prv-hero-icon-alt"><FileText size={22} /></div>
              <h2 className="prv-title prv-title-alt">Conditions générales d'utilisation</h2>
            </div>

            <section className="prv-section">
              <h2 className="prv-h2">9. Objet et acceptation</h2>
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
                de la plateforme Tomat'chef, disponible à l'adresse du site. En créant un compte, vous
                acceptez sans réserve les présentes CGU. Tomat'chef se réserve le droit de les modifier
                à tout moment&nbsp;; les modifications entrent en vigueur dès leur publication.
              </p>
            </section>

            <section className="prv-section">
              <h2 className="prv-h2">10. Accès au service</h2>
              <ul className="prv-list">
                <li>L'inscription est ouverte à toute personne physique majeure résidant au Sénégal.</li>
                <li>Chaque utilisateur est responsable de la confidentialité de ses identifiants de connexion.</li>
                <li>Tout usage frauduleux ou abusif de la plateforme entraîne la suspension immédiate du compte.</li>
              </ul>
            </section>

            {/* ── 11. Commandes ── */}
            <section className="prv-section" id="commandes">
              <h2 className="prv-h2">11. Commandes &amp; paiement</h2>
              <ul className="prv-list">
                <li>Toute commande passée sur Tomat'chef constitue une <strong>offre d'achat ferme</strong>, soumise à acceptation de notre part.</li>
                <li>Les prix affichés sont exprimés en <strong>Francs CFA (XOF)</strong>, toutes taxes comprises.</li>
                <li>Tomat'chef se réserve le droit de modifier ses prix à tout moment. Le prix applicable est celui affiché au moment de la validation de la commande.</li>
                <li>En cas d'indisponibilité d'un produit après validation, nous vous en informons dans les meilleurs délais et procédons au remboursement intégral si le paiement a été encaissé.</li>
                <li><strong>Simulation de paiement&nbsp;:</strong> la plateforme utilise un système de paiement simulé à des fins de démonstration. Aucun débit réel n'est effectué sur votre compte bancaire.</li>
              </ul>
            </section>

            {/* ── 12. Livraison ── */}
            <section className="prv-section" id="livraison">
              <h2 className="prv-h2">12. Livraison &amp; retours</h2>
              <ul className="prv-list">
                <li>La livraison est assurée dans les zones définies sur la plateforme, aux tarifs indiqués lors de la commande.</li>
                <li>Les délais de livraison sont donnés à titre indicatif. Tomat'chef ne saurait être tenu responsable de retards liés à des facteurs externes (force majeure, grève, intempéries).</li>
                <li>Tout produit endommagé ou non conforme à la commande doit être signalé dans les <strong>48&nbsp;heures</strong> suivant la réception à l'adresse <a href="mailto:tomatchef@gmail.com">tomatchef@gmail.com</a>.</li>
                <li>En cas de non-conformité avérée, Tomat'chef procédera au remplacement du produit ou à un remboursement, conformément au Code de la consommation sénégalais.</li>
              </ul>
            </section>

            {/* ── 13. Propriété intellectuelle ── */}
            <section className="prv-section">
              <h2 className="prv-h2">13. Propriété intellectuelle</h2>
              <p>
                L'ensemble des éléments constituant la plateforme Tomat'chef (logo, design, textes, images, code)
                est protégé par le droit de la propriété intellectuelle sénégalais. Toute reproduction,
                représentation ou exploitation non autorisée est strictement interdite.
              </p>
            </section>

            {/* ── 14. Responsabilité ── */}
            <section className="prv-section">
              <h2 className="prv-h2">14. Limitation de responsabilité</h2>
              <p>
                Tomat'chef s'engage à mettre tout en œuvre pour assurer la disponibilité de la plateforme
                mais ne peut garantir un accès ininterrompu. Notre responsabilité ne saurait être engagée
                en cas de perte de données due à une défaillance technique indépendante de notre volonté.
              </p>
            </section>

            {/* ── 15. Loi applicable ── */}
            <section className="prv-section">
              <h2 className="prv-h2">15. Loi applicable &amp; juridiction compétente</h2>
              <p>
                Les présentes CGU et la Politique de confidentialité sont soumises au <strong>droit sénégalais</strong>.
                Tout litige relatif à leur interprétation ou à leur exécution sera soumis aux tribunaux
                compétents de Dakar, après tentative préalable de résolution amiable.
              </p>
            </section>

            {/* ── 16. Contact ── */}
            <section className="prv-section" id="contact">
              <h2 className="prv-h2">16. Contact &amp; réclamations</h2>
              <div className="prv-contact-box">
                <div><strong>E-mail&nbsp;:</strong> <a href="mailto:tomatchef@gmail.com">tomatchef@gmail.com</a></div>
                <div><strong>Téléphone&nbsp;:</strong> <a href="tel:+221781882583">+221 78 188 25 83</a></div>
                <div><strong>Adresse&nbsp;:</strong> Dakar, Sénégal</div>
              </div>
              <p style={{ marginTop: 12, fontSize: '.85rem', color: 'var(--fg-muted)' }}>
                Pour toute question relative à vos données personnelles, vous pouvez également contacter la
                <strong> Commission des Données Personnelles (CDP)</strong> — organisme de contrôle indépendant
                chargé de veiller au respect de la Loi n°&nbsp;2008-12 au Sénégal.
              </p>
            </section>

            <div className="prv-footer-note">
              © 2026 Tomat'chef · Dakar, Sénégal — Document non contractuel, à titre informatif.
            </div>

          </article>
        </div>
      </main>
    </>
  )
}
