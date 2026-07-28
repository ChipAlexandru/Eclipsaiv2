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
    copy: "Eclipsai găsește unde afacerile cu produse proaspete pierd profit, aplică schimbarea și îi dovedește impactul financiar. Începe cu producția, apoi se extinde la comenzi, prețuri, achiziții și personal.",
    examples: [
      "Ajustează comenzile de producție pentru mâine.",
      "Urmărește comenzile speciale până la livrare și facturare.",
      "Semnalează scumpirile furnizorilor și prețurile care nu mai acoperă costurile.",
    ],
    cta: "Programați o discuție de 20 de minute",
    audience: "Pentru afaceri cu produse proaspete în creștere, cu 2 până la 20 de locații.",
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
      { strong: "Găsește puținele schimbări care merită făcute", text: "Pe magazine, produse și zile, cântărește risipa față de vânzările ratate." },
      { strong: "Formulează recomandări zilnice", text: "Patronul vede cantitatea recomandată, motivul și impactul estimat asupra profitului." },
      { strong: "Analizează rezultatele săptămânal", text: "Analiza săptămânală arată ce schimbări au îmbunătățit profitul și care ar trebui să intre în planul standard." },
      { strong: "Aplică deciziile care s-au dovedit fiabile", text: "La început, patronul aprobă fiecare schimbare. După ce un tip de recomandare se dovedește fiabil, produsul actualizează planul de producție în limitele stabilite de patron și măsoară îmbunătățirea profitului față de planul vechi." },
    ],
  },

  proof: {
    metadata: "Dovezi de la o singură afacere · 16 luni",
    h2Before: "Am găsit la o singură afacere o oportunitate de profit anual de ",
    h2Value: "€40–60K",
    h2After: ".",
    lede: "O afacere cu produse proaspete și mai multe locații ne-a pus la dispoziție șaisprezece luni de date. Am conectat casele de marcat și producția și am comparat ce a fost livrat cu ce s-a vândut, pe magazine, produse și zile.",
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
    h2: "Următoarele decizii de îmbunătățit.",
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
        q: "Dacă producem mai puțin, rămânem fără marfă?",
        a: "Eclipsai cântărește ambele riscuri. O vânzare ratată poate costa mai mult decât ingredientele economisite. Propune să produceți mai puțin doar când dovezile o susțin, apoi măsoară rezultatul față de planul pe care l-a înlocuit.",
      },
      {
        q: "Sistemul nostru recomandă deja cantități. Ce este diferit?",
        a: "Eclipsai păstrează planul actual ca punct de referință, adaugă ce lipsește din date și propune o comandă diferită doar acolo unde dovezile o susțin. După aprobare, poate aplica schimbarea în sistemul de producție și îi poate măsura impactul financiar.",
      },
      {
        q: "Cât de multă muncă cere echipei?",
        a: "Eclipsai lucrează cu datele de vânzări și producție. Pune echipei o întrebare scurtă doar când datele nu explică ce s-a întâmplat, cum ar fi un stoc epuizat, resturi neobișnuite sau un eveniment local.",
      },
      {
        q: "Dar dacă datele noastre sunt dezordonate?",
        a: "Corelăm datele în care se poate avea încredere și facem lipsurile vizibile. Dacă datele nu susțin o recomandare, Eclipsai cere context sau lasă planul neschimbat.",
      },
      {
        q: "Trebuie să schimbăm toate magazinele deodată?",
        a: "Nu. Începem cu combinațiile magazin-produs unde dovezile sunt cele mai solide. Folosim rezultatul de acolo înainte de a aplica aceeași regulă în altă parte.",
      },
      {
        q: "Cum percepeți plata?",
        a: "Începutul este gratuit. Dacă continuați, percepem un abonament lunar în funcție de numărul de locații și de domeniile decizionale monitorizate.",
      },
    ],
  },

  footer: {
    tagline: "Inteligență operațională pentru afacerile cu produse proaspete.",
    location: "Zürich, Elveția",
  },

  meta: {
    title: "Eclipsai | Inteligență operațională pentru produse proaspete",
    description: "Eclipsai ia deciziile zilnice care fac să funcționeze o afacere alimentară, începând cu ce trebuie produs mâine.",
    ogDescription: "Știți ce să produceți mâine. Mai puțină risipă. Mai multe vânzări.",
  },
};
