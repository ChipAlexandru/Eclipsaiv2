// Fresh-food homepage content — Romanian (with full diacritics ă â î ș ț).
// Claude-produced translation of the approved English source; a native
// operator/editor should make the final call (see
// docs/fresh-food-locale-review.md). No em dashes in rendered copy.
// Evidence values are unchanged; number separators follow Romanian convention.

export const ro = {
  locale: "ro",
  languageName: "Română",

  nav: {
    ariaLabel: "Navigare principală",
    homeAriaLabel: "Pagina principală Eclipsai",
    product: "Cum funcționează",
    proof: "Dovezi",
    vision: "Dincolo de producție",
    cta: "Programați o discuție",
    chooseLanguage: "Alegeți limba",
    availableLanguages: "Limbi disponibile",
  },

  hero: {
    eyebrow: "Inteligență operațională pentru afacerile cu produse proaspete.",
    h1: "Știți ce să produceți mâine. Mai puțină risipă. Mai multe vânzări.",
    copy: "Eclipsai conectează sistemele de vânzări, producție și financiar-contabile. Ia decizii de producție pentru fiecare magazin, produs și zi a săptămânii, introduce schimbările aprobate în sistemul de producție și măsoară zilnic efectul lor asupra profitului, risipei și epuizării timpurii a stocului.",
    examples: [
      "Ajustează comenzile de producție pentru mâine.",
      "Urmărește comenzile speciale până la livrare și facturare.",
      "Semnalează scumpirile furnizorilor și prețurile care nu mai acoperă costurile.",
    ],
    cta: "Programați o discuție de 20 de minute",
    audience: "Pentru afaceri cu produse proaspete în creștere, cu 2 până la 20 de locații.",
  },

  live: {
    ariaLabel: "Rezultatele ultimelor șapte zile încheiate",
    period: "Ultimele șapte zile încheiate",
    live: "LIVE",
    snapshot: "ULTIMELE REZULTATE VERIFICATE",
    linesChanged: "linii modificate în comenzile de producție",
    profitImpact: "impact asupra profitului ca procent din vânzări",
    wasteReduction: "reducere estimată a risipei ca procent din risipa inițială",
    updated: "Actualizat la",
  },

  problem: {
    eyebrow: "Ce știu patronii și sistemele nu văd",
    h2: "Planul de producție pentru mâine este stabilit înainte ca vânzările de astăzi și observațiile echipelor din magazine să poată fi luate în calcul.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Numărați ce a rămas", p: "Ce nu poate rămâne pe raft ajunge în pungi surpriză sau la gunoi. Numărătoarea este rareori înregistrată." },
      { time: "19:00", state: "time-1900", h3: "Stabiliți comanda de mâine", p: "Comanda de mâine se construiește din medii, șabloane, comenzi speciale și experiență, în timp ce magazinul încă trebuie curățat." },
      { time: "02:00", state: "time-0200", h3: "Începe producția", p: "Decizia de ieri devine marfa perisabilă de azi." },
      { time: "11:40", state: "time-1140", h3: "Tava se golește", p: "Un stoc epuizat poate însemna că planul a fost corect sau că o vânzare a fost ratată. Casa de marcat nu arată care dintre ele." },
    ],
    quote: "Casa de marcat înregistrează ce s-a vândut. Nu înregistrează ce a rămas, ce s-a epuizat sau ce au cerut clienții după ce raftul s-a golit. Acolo se pierde profitul.",
  },

  product: {
    eyebrow: "Inteligența operațională la lucru",
    h2: "Urmărește fiecare magazin, în fiecare zi. Întreabă atunci când datele nu sunt de ajuns.",
    lede: "Eclipsai conectează sistemele de vânzări, producție, comenzi și facturare cu e-mailul, canalele de chat ale echipelor și datele externe relevante. Când datele nu explică ce s-a întâmplat, adresează personalului o întrebare punctuală. Echipele pot răspunde prin text, fotografii sau mesaje vocale.",
    mediaLabel: "Exemplu: Eclipsai urmărește o decizie de producție printr-un canal de echipă deja familiar",
    whatChanges: "Cum lucrează Eclipsai",
    items: [
      { strong: "Citim și analizăm datele din toate sistemele", text: "Fiecare magazin, produs și zi a săptămânii are propriul tipar de cerere. Eclipsai ia în calcul zile de vânzare comparabile, ritmul vânzărilor, epuizările probabile, risipa estimată, economia produsului și constrângerile operaționale." },
      { strong: "Identificăm deciziile care au sens economic", text: "Pentru fiecare linie de producție, Eclipsai compară cantitatea actuală cu alternativele fezabile. Cântărește costul produselor nevândute față de marja pusă în pericol atunci când se produce prea puțin." },
      { strong: "Implementăm și urmărim rezultatul", text: "Deciziile aprobate sunt introduse în software-ul de producție și confirmate. După închiderea fiecărui magazin, Eclipsai măsoară efectul asupra vânzărilor, risipei estimate, epuizărilor timpurii și profitului. Rezultatul devine dovadă pentru următoarea decizie." },
    ],
  },

  demo: {
    open: "Vedeți demonstrația",
    close: "Închideți",
  },

  proof: {
    metadata: "Impactul nostru",
    h2Before: "Am găsit la o singură afacere o oportunitate de profit anual de ",
    h2Value: "CHF 40–60K",
    h2After: ".",
    lede: "Lucrăm acum împreună cu această afacere pentru a introduce schimbările în producția zilnică.",
    ledgerLabel: "Registrul de dovezi al unei afaceri",
    rows: [
      { h3: "unități analizate", value: "860.000", copy: "Șaisprezece luni de date de vânzări și producție. Am corelat 92% între cele două." },
      { h3: "unități livrate nevândute", ratioLabel: "Una din patru unități livrate a rămas nevândută", value: "1 din 4", copy: "Tiparul se concentra pe anumite magazine, produse și zile ale săptămânii." },
      { h3: "oportunitate anuală", value: "€40–60K", copy: "Tipare de producție repetate nu mai corespundeau cererii. Costul ingredientelor pentru toate unitățile nevândute a fost de €190K." },
      { h3: "reduceri propuse cu valoare netă estimată pozitivă", value: "86%", copy: "Economiile la ingrediente au depășit întreaga marjă a oricărei vânzări care ar fi putut fi ratată. Reducerile au avut o valoare netă pozitivă în toate cele nouă luni testate." },
    ],
    bridgeBefore: "O parte din risipă protejează vânzările. Oportunitatea de ",
    bridgeValue: "€40–60K",
    bridgeAfter: " venea din supraproducție repetată, după ce cererea se schimbase.",
    note: "Din datele unei afaceri cu mai multe locații, 2024-2025. Specifice acelei afaceri, nu o promisiune.",
    lessonHeading: "Ce am învățat",
    lessonParagraphs: [
      "În simularea noastră pe date istorice, lăsarea unei singure reguli de prognoză să stabilească fiecare comandă de producție a pierdut bani. A redus risipa, dar abaterile mici de prognoză au devenit stocuri epuizate a căror marjă pierdută a depășit ingredientele economisite.",
      "Cererea la volume mici este instabilă. Datele nu conțin fiecare eveniment local și nu spun ce a însemnat un stoc epuizat.",
      "Eclipsai adaugă informația care lipsește, face doar puținele schimbări pe care dovezile le susțin și măsoară impactul financiar.",
    ],
  },

  vision: {
    eyebrow: "Dincolo de producție",
    h2: "Următoarele decizii.",
    intro: "După conectarea la sistemele și canalele de comunicare ale companiei, Eclipsai poate adăuga informațiile necesare pentru fiecare decizie nouă, poate aplica schimbarea și poate măsura rezultatul.",
    pathLabel: "Traseul de extindere Eclipsai",
    steps: [
      { index: "Start", h3: "Producție și risipă", p: "Protejați vânzările reducând în același timp risipa repetată și evitabilă. Corectați planurile de producție care nu mai corespund cererii." },
      { index: "Urmează", h3: "Achiziții și prețuri", p: "Semnalați scumpirile furnizorilor și prețurile care nu mai acoperă costurile." },
      { index: "Apoi", h3: "Personal și operațiuni", p: "Vedeți când loturile mai mici reduc risipa dar adaugă muncă, sau când personalul insuficient costă vânzări." },
      { index: "Pe măsură ce creșteți", h3: "Următoarea locație", p: "Folosiți ce funcționează în magazinele actuale pentru a deschide următorul." },
    ],
  },

  offer: {
    h2: "Eclipsai ia deciziile zilnice care fac să funcționeze o afacere alimentară.",
    copy: "Conectează vânzările, producția și ce observă echipa dumneavoastră ca să găsească puținele decizii care merită acțiune și să dovedească rezultatul ca impact financiar.",
    cardH3: "Începeți gratuit",
    items: [
      "Unde pierdeți profit, magazin cu magazin, în timp",
      "Planuri de producție mai bune, testate pe datele din trecut",
      "Recomandări pentru comenzile din săptămâna următoare",
      "Măsurare continuă față de planul pe care îl folosiți azi",
    ],
    audience: "Pentru afaceri cu produse proaspete în creștere, cu 2 până la 20 de locații.",
    cta: "Programați o discuție de 20 de minute",
  },

  faq: {
    eyebrow: "Întrebări frecvente",
    h2: "Ce vor să știe patronii înainte de a începe.",
    items: [
      {
        q: "Dacă producem mai puțin, punem vânzările în pericol?",
        a: "Eclipsai cântărește ambele riscuri. O vânzare ratată poate costa mai mult decât ingredientele economisite. Propune să produceți mai puțin doar când dovezile o susțin, apoi măsoară rezultatul față de planul pe care l-a înlocuit.",
      },
      {
        q: "Prin ce diferă Eclipsai de cantitățile deja recomandate de sistemul nostru?",
        a: "Eclipsai testează cantitatea actuală față de alternativele fezabile folosind ritmul vânzărilor, epuizările probabile, risipa, economia produsului și constrângerile operaționale. Schimbările aprobate sunt introduse în sistemul de producție și măsurate financiar.",
      },
      {
        q: "Trebuie să înlocuim sistemele existente?",
        a: "Nu. Eclipsai lucrează cu sistemele deja utilizate. Citește și scrie date prin API-uri sau prin utilizarea directă a computerului pentru sistemele mai vechi.",
      },
      {
        q: "Cât de multă muncă cere echipei?",
        a: "Eclipsai lucrează cu datele de vânzări și producție. Pune echipei o întrebare scurtă doar când datele nu explică ce s-a întâmplat, cum ar fi un stoc epuizat, resturi neobișnuite sau un eveniment local.",
      },
      {
        q: "Cum începem?",
        a: "Începem cu datele de încredere și combinațiile magazin-produs pentru care dovezile sunt cele mai solide. Când datele nu sunt suficiente, Eclipsai cere context sau lasă cantitatea neschimbată. Nu trebuie să schimbați toate magazinele deodată.",
      },
    ],
  },

  footer: {
    tagline: "Inteligență operațională pentru afacerile cu produse proaspete.",
    location: "Zürich, Elveția",
  },

  meta: {
    title: "Eclipsai | Inteligență operațională pentru produse proaspete",
    description: "Eclipsai ia și implementează decizii zilnice de producție pentru afacerile cu produse proaspete, apoi le măsoară efectul asupra profitului, risipei și vânzărilor.",
    ogDescription: "Știți ce să produceți mâine. Mai puțină risipă. Mai multe vânzări.",
  },
};
