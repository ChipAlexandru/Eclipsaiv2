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
    cta: "Începeți gratuit",
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
    cta: "Începeți gratuit",
    audience: "Pentru afaceri cu produse proaspete în creștere, cu 2 până la 20 de locații.",
  },

  problem: {
    eyebrow: "Ce știu patronii și sistemele nu văd",
    h2: "Planul de mâine se fixează înainte ca vânzările și semnalele din magazin să îl mai poată schimba.",
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
    lede: "Eclipsai conectează vânzările zilnice, producția, livrările și ce observă echipa dumneavoastră. Când datele nu explică ce s-a întâmplat, întreabă persoana care știe. Aduce puținele schimbări care contează în analiza săptămânală și răspunde la întrebări pe măsură ce apar.",
    mediaLabel: "Exemplu: Eclipsai urmărește o decizie de producție printr-un canal de echipă deja familiar",
    whatChanges: "Cum lucrează Eclipsai",
    items: [
      { strong: "Adună ce lipsește din date", text: "Resturi, stocuri epuizate, cereri ale clienților și contextul din spatele lor." },
      { strong: "Găsește unde planul pierde profit", text: "Pe magazine, produse și zile." },
      { strong: "Recomandă următoarea schimbare", text: "Arată ce trebuie schimbat, de ce și ce este în joc." },
      { strong: "Dovedește rezultatul", text: "Compară fiecare schimbare cu planul pe care l-a înlocuit, ca impact financiar." },
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
      { h3: "dintre reduceri au acoperit cererea", value: "86%", copy: "Cea mai solidă regulă istorică a redus comenzi selectate fără ca produsul să se termine." },
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

  loop: {
    eyebrow: "Ce facem",
    h2: "Cum se iau decizii mai bune.",
    lede: "Aceeași buclă poate îmbunătăți profitul în toate magazinele dumneavoastră.",
    listLabel: "Bucla de decizie",
    steps: [
      { b: "Colectăm", p: "Conectăm vânzările zilnice, producția, livrările și ce observă echipa dumneavoastră." },
      { b: "Decidem", p: "Identificăm puținele decizii care merită schimbate și cântărim risipa față de vânzările ratate." },
      { b: "Acționăm", p: "Actualizăm comanda sau executăm pasul aprobat, în limitele stabilite de afacere." },
      { b: "Măsurăm", p: "Verificăm rezultatul pe vânzările și costurile reale, ca impact financiar." },
      { b: "Îmbunătățim", p: "Păstrăm schimbările care îmbunătățesc rezultatul și le corectăm pe celelalte." },
    ],
  },

  replay: {
    title: "Comenzi de croasanți propuse pentru 7-13 iulie",
    changeStrong: "cu 130 mai puține",
    changeSpan: "unități risipite",
    dotKey: "1 punct = 5 unități",
    ariaTitle: "Simularea deciziei de producție a croasanților",
    ariaDesc: "Paisprezece zile de vânzări de croasanți în puncte albastre, risipa cu comanda actuală în puncte portocalii și o linie continuă pentru comanda propusă. Propunerea păstrează 988 de vânzări și reduce risipa de la 319 la 189 de unități.",
    days: ["L 23", "M 24", "M 25", "J 26", "V 27", "S 28", "D 29", "L 30", "M 1", "M 2", "J 3", "V 4", "S 5", "D 6"],
    legendSold: "Vândut",
    legendWaste: "Risipă cu planul actual",
    legendProposed: "Comanda propusă",
    tableLabel: "Rezultatele simulării deciziei",
    thPlan: "Plan",
    thSales: "Vânzări",
    thWaste: "Risipă",
    rowCurrent: "Actual",
    rowProposed: "Propus",
  },

  vision: {
    eyebrow: "Dincolo de producție",
    h2: "Următoarele decizii de îmbunătățit.",
    intro: "Producția vine prima pentru că decizia se repetă zilnic, iar rezultatul se vede repede.",
    pathLabel: "Traseul de extindere Eclipsai",
    steps: [
      { index: "Start", h3: "Producție și risipă", p: "Protejați vânzările reducând în același timp risipa repetată și evitabilă. Corectați planurile de producție care nu mai corespund cererii." },
      { index: "Urmează", h3: "Achiziții și prețuri", p: "Semnalați scumpirile furnizorilor și prețurile care nu mai acoperă costurile." },
      { index: "Apoi", h3: "Personal și operațiuni", p: "Vedeți când loturile mai mici reduc risipa dar adaugă muncă, sau când personalul insuficient costă vânzări." },
      { index: "Pe măsură ce creșteți", h3: "Următoarea locație", p: "Folosiți ce funcționează în magazinele actuale pentru a deschide următorul." },
    ],
  },

  offer: {
    h2: "Eclipsai vă ajută la deciziile zilnice care hotărăsc profitul.",
    copy: "Conectează vânzările, producția și ce observă echipa dumneavoastră ca să găsească puținele decizii care merită acțiune și să dovedească rezultatul ca impact financiar.",
    cardH3: "Începeți gratuit",
    items: [
      "Unde pierdeți profit, magazin cu magazin, în timp",
      "Planuri de producție mai bune, testate pe datele din trecut",
      "Recomandări pentru comenzile din săptămâna următoare",
      "Măsurare continuă față de planul pe care îl folosiți azi",
    ],
    audience: "Pentru afaceri cu produse proaspete în creștere, cu 2 până la 20 de locații.",
    cta: "Începeți gratuit",
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
        a: "Eclipsai păstrează planul actual ca punct de referință, adaugă ce lipsește din date și propune o comandă diferită doar acolo unde dovezile o susțin. Apoi măsoară rezultatul ca impact financiar.",
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
        a: "Începutul este gratuit. Dacă continuați, percepem un abonament lunar pe locație, în funcție de magazinele, sistemele și deciziile monitorizate.",
      },
    ],
  },

  footer: {
    tagline: "Inteligență operațională pentru afacerile cu produse proaspete.",
    location: "Zürich, Elveția",
  },

  meta: {
    title: "Eclipsai | Inteligență operațională pentru produse proaspete",
    description: "Eclipsai ajută afacerile cu produse proaspete la deciziile zilnice care hotărăsc profitul, începând cu producția de mâine.",
    ogDescription: "Știți ce să produceți mâine. Mai puțină risipă. Mai multe vânzări.",
  },
};
