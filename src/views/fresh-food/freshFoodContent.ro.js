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
    proof: "Impact",
    vision: "Acțiuni",
    cta: "Programați o discuție",
    chooseLanguage: "Alegeți limba",
    availableLanguages: "Limbi disponibile",
  },

  hero: {
    eyebrow: "Produse proaspete:",
    h1: "The Profit Brain conectează vânzările, producția și datele financiare pentru acțiuni zilnice care influențează profitul",
    h1Primary: "The Profit Brain",
    h1Support: "Conectează vânzările, producția și datele financiare pentru acțiuni zilnice care influențează profitul",
    copy: "Stabiliți cât produceți pentru fiecare magazin, produs și zi a săptămânii. Măsurați zilnic efectul asupra profitului, vânzărilor și risipei.",
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
    production: "Producție",
    linesChanged: "modificări ale comenzilor de producție (linii)",
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
    h2: "Construiți cicluri zilnice de îmbunătățire a profitului",
    h2Primary: "Construiți",
    h2Secondary: "cicluri zilnice de îmbunătățire a profitului",
    lede: "Eclipsai conectează sistemele de vânzări, producție, comenzi și facturare cu e-mailul, canalele de chat ale echipelor și datele externe relevante. Când datele nu explică ce s-a întâmplat, adresează personalului o întrebare punctuală. Echipele pot răspunde prin text, fotografii sau mesaje vocale.",
    mediaLabel: "Exemplu: Eclipsai urmărește o decizie de producție printr-un canal de echipă deja familiar",
    whatChanges: "Cum lucrează Eclipsai",
    diagram: {
      ariaLabel: "The Profit Brain corelează datele, măsoară profitul, creează acțiuni, citește sistemele companiei și aplică deciziile pentru profit",
      correlate: "Corelează date", measure: "Măsoară profitul", actions: "Creează acțiuni",
      read: "Citește datele", implement: "Aplică deciziile", systems: "Sistemele companiei",
      production: "Producție", ops: "Operare",
    },
    items: [
      { strong: "Citește și analizează datele din toate sistemele", text: "Fiecare magazin, produs și zi a săptămânii are propriul tipar de cerere. The Profit Brain ia în calcul zile de vânzare comparabile, ritmul vânzărilor, epuizările probabile, risipa estimată, economia produsului și constrângerile operaționale." },
      { strong: "Identifică deciziile care influențează profitul", text: "Pentru fiecare linie de producție, The Profit Brain compară cantitatea actuală cu alternativele fezabile. Cântărește costul produselor nevândute față de marja pusă în pericol atunci când se produce prea puțin." },
      { strong: "Aplică, măsoară și urmărește rezultatul", text: "Deciziile aprobate sunt introduse în software-ul de producție și confirmate. Zilnic, The Profit Brain măsoară efectul asupra vânzărilor, risipei estimate, epuizărilor timpurii și numerarului. Rezultatele orientează deciziile următoare." },
    ],
  },

  demo: {
    open: "Demo",
    close: "Închideți",
    chooseView: "Alegeți ecranul demonstrației",
    viewOf: "din",
    slides: [
      "Creează imaginea zilnică a afacerii",
      "Propune cantități de producție",
      "Aplică direct în sistemul de producție (API sau utilizarea computerului pentru sistemele vechi)",
      "Analizează rezultatele zilnic",
      "Raportează profitul și risipa",
    ],
  },

  proof: {
    metadata: "Impactul nostru",
    h2Before: "Vom obține o marjă a profitului de ",
    h2Value: "1%",
    h2After: "",
    lede: "Lucrăm cu un lanț de brutării din Zürich pentru a stabili cantitățile de producție și sortimentul pentru fiecare magazin",
    tracker: {
      period: "Obținerea unei marje a profitului de 1%",
      cash: "Impact asupra numerarului", economic: "Profit economic", waste: "Risipă evitată",
      projected: "proiectat", ingredients: "Ingrediente",
      economics: "Ingrediente + muncă standard + energie",
      fullYear: "An întreg", measured: "Impact măsurat",
      ofSales: "din vânzări", units: "unități", wasteRate: "rata risipei",
      actuals: "VALORI REALE", annualized: "IMPACT ANUALIZAT", fullYearAxis: "AN ÎNTREG",
    },
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
    h2: "Următoarele acțiuni pentru profit",
    intro: "Odată conectați la sistemele și datele companiei, putem identifica noi oportunități, implementa schimbări și măsura rezultatul.",
    pathLabel: "Traseul de extindere al The Profit Brain",
    steps: [
      { index: "Start", h3: "Producție și risipă", p: "Reduceți risipa repetată și evitabilă și captați cererea nouă." },
      { index: "Urmează", h3: "Achiziții și prețuri", p: "Urmăriți scumpirile furnizorilor și impactul lor asupra profitabilității produselor." },
      { index: "Apoi", h3: "Personal și operațiuni", p: "Echilibrați personalul în funcție de vânzări și cerere." },
      { index: "Pe măsură ce creșteți", h3: "Următoarea locație", p: "Construiți noi modele de cerere pe baza a ceea ce funcționează în magazine similare." },
    ],
  },

  offer: {
    h2: "The Profit Brain pentru acțiunile zilnice care influențează profitul",
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
    h2: "Întrebări frecvente",
    items: [
      {
        q: "Dacă producem mai puțin, punem vânzările în pericol?",
        a: "Echilibrăm ambele riscuri. O vânzare ratată costă, în general, mai mult decât ingredientele economisite. Propunem să produceți mai puțin când dovezile susțin schimbarea, apoi măsurăm rezultatul față de planul inițial.",
      },
      {
        q: "Prin ce diferă The Profit Brain de cantitățile deja recomandate de sistemul nostru?",
        a: "The Profit Brain testează cantitatea actuală față de alternativele fezabile folosind ritmul vânzărilor, epuizările probabile, risipa, economia produsului și constrângerile operaționale. Impactul asupra profitului al fiecărei schimbări este măsurat și raportat.",
      },
      {
        q: "Trebuie să înlocuim sistemele existente?",
        a: "Nu. Operăm sistemele deja utilizate prin API-uri sau prin utilizarea directă a computerului pentru sistemele mai vechi.",
      },
      {
        q: "Cât de multă muncă cere echipei?",
        a: "Aplicăm schimbările direct și întrebăm echipa doar atunci când datele nu explică ce s-a întâmplat în magazin.",
      },
      {
        q: "Cum începem?",
        a: "Ne conectăm la sisteme și analizăm datele istorice pentru a crea o primă estimare a potențialului. Apoi propunem schimbări fără să le implementăm și măsurăm îmbunătățirea estimată.",
      },
    ],
  },

  footer: {
    tagline: "Inteligență operațională pentru afacerile cu produse proaspete.",
    location: "Zürich, Elveția",
  },

  meta: {
    title: "Eclipsai — The Profit Brain pentru produse proaspete",
    description: "The Profit Brain conectează vânzările, producția și finanțele, pune în practică acțiuni zilnice pentru profit și măsoară rezultatele.",
    ogDescription: "Conectați vânzările, producția și finanțele pentru acțiuni zilnice care cresc profitul.",
  },
};
