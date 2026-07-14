// Fresh-food homepage content — Romanian (with correct diacritics ă â î ș ț).
// Claude-produced translation of freshFoodContent.en.js; native review
// recommended before broad launch. No em dashes in rendered copy.
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
    cta: "Descoperă unde pierzi marjă",
    chooseLanguage: "Alegeți limba",
    availableLanguages: "Limbi disponibile",
  },

  hero: {
    eyebrow: "Inteligență operațională pentru afacerile cu produse proaspete",
    h1: "Știți ce să produceți mâine. Mai puțină risipă. Mai multe vânzări.",
    copy: "Eclipsai găsește schimbările care merită făcute pornind de la vânzările zilnice, producție, livrări și ce observă echipa dumneavoastră. Măsurăm impactul financiar al fiecărei schimbări.",
    cta: "Descoperă unde pierzi marjă",
    audience: "Creat pentru operatori de produse proaspete în creștere, cu 2 până la 20 de locații.",
  },

  problem: {
    eyebrow: "Ce știu patronii și sistemele nu văd",
    h2: "Ziua de mâine se decide înainte ca ziua de azi să fie înțeleasă.",
    lede: "Comenzile de mâine combină ce a rămas, comenzile speciale, mediile din trecut și experiența. Peste sute de decizii magazin × produs × zi a săptămânii, alegerea care face profitul se ia la închidere.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Numărați ce a rămas", p: "Ce nu poate rămâne pe raft ajunge în pungi surpriză sau la gunoi, rareori înregistrat." },
      { time: "19:00", state: "time-1900", h3: "Stabiliți comanda de mâine", p: "Mediile, șabloanele și memoria se luptă pentru atenție în timp ce magazinul încă trebuie curățat." },
      { time: "02:00", state: "time-0200", h3: "Începe producția", p: "Decizia de ieri devine marfa perisabilă de azi." },
      { time: "11:40", state: "time-1140", h3: "Tava se golește", p: "Pare un succes. Clienții continuă să ceară produsul." },
    ],
    quote: "Casa de marcat înregistrează ce s-a vândut. Nu raftul gol, resturile sau întrebarea de la tejghea. Acolo se pierde marja.",
  },

  product: {
    eyebrow: "Inteligență operațională, mereu activă",
    h2: "Urmărește fiecare magazin, în fiecare zi. Întreabă atunci când e nevoie.",
    lede: "Eclipsai conectează vânzările zilnice, producția, livrările și ce observă echipa dumneavoastră. Când o schimbare este în test, întreabă persoana potrivită ce s-a întâmplat. Aduce deciziile care merită luate într-o revizuire săptămânală și răspunde la întrebări oricând.",
    mediaLabel: "Exemplu: Eclipsai urmărește o decizie de producție printr-un canal de echipă deja familiar",
    whatChanges: "Ce se schimbă",
    items: [
      { n: "01", strong: "Adună ce este necesar.", text: "Resturi, stocuri epuizate și cereri ale clienților." },
      { n: "02", strong: "Monitorizează fiecare magazin, produs și zi.", text: "Găsește oportunități în risipă, costuri și vânzări." },
      { n: "03", strong: "Propune și răspunde.", text: "Scoate la suprafață schimbările care merită făcute săptămâna viitoare și răspunde la întrebări când le puneți." },
      { n: "04", strong: "Raportează rezultatele.", text: "Arată performanța magazinelor și măsoară impactul financiar al fiecărei decizii față de alternativă." },
    ],
  },

  proof: {
    metadata: "Dovezi de la un operator · 16 luni",
    h2Before: "Am găsit la un operator o oportunitate anuală de profit de ",
    h2Value: "€40-60K",
    h2After: ".",
    lede: "Un operator de produse proaspete cu mai multe locații și-a deschis datele. Am conectat casele de marcat și sistemele de producție și am urmărit fiecare produs în fiecare magazin, zi de zi.",
    ledgerLabel: "Registrul de dovezi al unui operator",
    rows: [
      { index: "01", h3: "Am urmărit fiecare bucată", value: "860.000", copy: "Șaisprezece luni de vânzări și livrări, corelate între casă și producție. 92% din toate bucățile acoperite." },
      { index: "02", h3: "Am găsit ce nu s-a vândut niciodată", ratioLabel: "Una din patru bucăți nu s-a vândut niciodată", value: "1 din 4", copy: "Una din patru bucăți livrate nu s-a vândut niciodată. Greu de văzut de la o zi la alta, evident peste produse, magazine și zilele săptămânii." },
      { index: "03", h3: "Am dimensionat oportunitatea", value: "€40-60K", copy: "Oportunitatea anuală credibilă era concentrată în tipare de producție vechi și repetate. Întregul fond de ingrediente nevândute valora €190K." },
      { index: "04", h3: "Am testat corecțiile", value: "86%", copy: "Când regula cea mai puternică recomanda să se producă mai puțin, raftul rezista totuși până seara de 86 de ori din 100." },
    ],
    bridgeBefore: "O parte din risipă protejează vânzările. Oportunitatea de ",
    bridgeValue: "€40-60K",
    bridgeAfter: " venea din risipă excesivă, blocată în tipare de producție vechi și repetate.",
    note: "Din datele unui operator cu mai multe locații, 2024-2025. Specifice acelei afaceri, nu o promisiune.",
    lessonHeading: "Ce am învățat",
    lessonBefore: "În testul nostru, prognoza singură ",
    lessonStrong: "a pierdut bani",
    lessonAfter: ". Cererea la volume mici este instabilă, context important rămâne în afara datelor, iar o vânzare ratată costă mai mult decât ingredientele în exces. Abordarea noastră adaugă semnalele care lipsesc prognozelor, schimbă doar puținele decizii care merită schimbate și măsoară fiecare rezultat. În fiecare săptămână, pentru fiecare produs și locație.",
  },

  loop: {
    eyebrow: "Ce facem",
    h2: "Cum recuperăm marja pierdută.",
    lede: "Bucla care a găsit oportunitatea poate rula continuu în magazinele dumneavoastră.",
    listLabel: "Bucla de decizie",
    steps: [
      { n: "01", b: "Conectăm.", p: "Datele de vânzări și producție sunt reunite într-un istoric la nivel de unitate." },
      { n: "02", b: "Găsim.", p: "Tiparele repetate ies la suprafață: produsul risipit în fiecare vineri, epuizarea de sâmbătă și comanda permanentă care s-a învechit." },
      { n: "03", b: "Propunem.", p: "Schimbări mici și reversibile sosesc în nota săptămânală. Cu motivele atașate." },
      { n: "04", b: "Măsurăm.", p: "Fiecare decizie este verificată pe vânzările reale și măsurată prin impactul financiar." },
      { n: "05", b: "Corectăm planul.", p: "Schimbările care se dovedesc bune rămân. Restul sunt revizuite sau retrase." },
      { n: "06", b: "Rămânem atenți.", p: "Numărătoarea nu se oprește niciodată, ca nimic să nu revină pe furiș." },
    ],
  },

  replay: {
    title: "Comenzi de croasanți propuse pentru 7-13 iulie",
    changeStrong: "cu 130 mai puține",
    changeSpan: "unități risipite",
    dotKey: "1 punct = 5 unități",
    ariaTitle: "Reluarea deciziei de producție a croasanților",
    ariaDesc: "Paisprezece zile de vânzări de croasanți în puncte albastre, risipa cu comanda actuală în puncte portocalii și o linie continuă pentru comanda propusă. Propunerea păstrează 988 de vânzări și reduce risipa de la 319 la 189 de unități.",
    days: ["L 23", "M 24", "M 25", "J 26", "V 27", "S 28", "D 29", "L 30", "M 1", "M 2", "J 3", "V 4", "S 5", "D 6"],
    legendSold: "Vândut",
    legendWaste: "Risipă cu planul actual",
    legendProposed: "Comanda propusă",
    tableLabel: "Rezultatele reluării deciziei",
    thPlan: "Plan",
    thSales: "Vânzări",
    thWaste: "Risipă",
    rowCurrent: "Actual",
    rowProposed: "Propus",
  },

  vision: {
    eyebrow: "Dincolo de producție",
    h2: "Extindeți la fiecare decizie care aduce profit.",
    intro: "Producția vine prima pentru că decizia se repetă zilnic, iar rezultatul se vede repede.",
    pathLabel: "Traseul de extindere Eclipsai",
    steps: [
      { index: "01 · Acum", h3: "Producție și risipă", p: "Protejați vânzările fără să repetați risipa evitabilă. Corectați planurile de producție învechite și măsurați impactul financiar al fiecărei schimbări." },
      { index: "02 · Urmează", h3: "Achiziții și prețuri", p: "Prindeți scumpirile furnizorilor, marjele slabe și prețurile care nu mai acoperă costurile." },
      { index: "03 · Apoi", h3: "Personal și operațiuni", p: "Vedeți când loturile mai mici reduc risipa dar adaugă muncă, sau când personalul insuficient costă vânzări." },
      { index: "04 · Pe măsură ce creșteți", h3: "Următoarea locație", p: "Aplicați tot ce a învățat Eclipsai din magazinele dumneavoastră la următorul." },
    ],
    closing: "Decizie cu decizie, Eclipsai vă ajută să păstrați mai mult din ce câștigă afacerea dumneavoastră.",
  },

  offer: {
    eyebrow: "Vedeți în propriile magazine",
    h2: "Găsiți marja pierdută care merită recuperată mai întâi.",
    copy: "Pornim de la datele de vânzări și producție pe care le aveți deja. Găsim risipa repetată, vânzările ratate și planurile de producție care nu se mai potrivesc, apoi arătăm impactul financiar al fiecăreia.",
    cardH3: "Prima dumneavoastră analiză",
    items: [
      "Pierderile de marjă care merită recuperate mai întâi",
      "Dovezile din spatele fiecăreia",
      "Impactul financiar al oportunității",
      "Primele schimbări reversibile de testat",
    ],
    reassurance: "Niciun sistem nou pentru echipă. Nimic nu se schimbă până când dovezile nu sunt clare.",
    audience: "Pentru operatori de produse proaspete în creștere, cu 2 până la 20 de locații.",
    cta: "Descoperă unde pierzi marjă",
    mailSubject: "Descoperă unde pierzi marjă",
    mailBody: "Număr de locații:\nCine stabilește comanda de mâine:\nSisteme actuale:\n",
  },

  faq: {
    eyebrow: "Întrebări frecvente",
    h2: "Ce vor să știe patronii înainte de a începe.",
    items: [
      {
        q: "Dacă producem mai puțin, rămânem fără marfă?",
        a: "Eclipsai măsoară ambele riscuri. Risipa costă ingrediente, iar o vânzare ratată costă cea mai mare parte din prețul de vânzare. Propunem schimbări mici și verificăm ce s-a întâmplat cu adevărat înainte de a modifica planul permanent.",
      },
      {
        q: "Sistemul nostru recomandă deja cantități. Ce este diferit?",
        a: "Majoritatea sistemelor produc o prognoză sau o comandă sugerată. Eclipsai adună în plus ce observă echipa, propune deciziile care merită schimbate și măsoară dacă fiecare schimbare a adus sau a pierdut bani.",
      },
      {
        q: "Cât de multă muncă cere echipei?",
        a: "Foarte puțină. Eclipsai folosește datele pe care le aveți deja și pune întrebări scurte și țintite doar când lipsește un semnal important, cum ar fi o epuizare de stoc, resturi neobișnuite sau un eveniment local.",
      },
      {
        q: "Dar dacă datele noastre sunt dezordonate?",
        a: "Este normal. Corelăm ce este de încredere, identificăm lipsurile și arătăm ce pot susține dovezile înainte de a recomanda o schimbare.",
      },
      {
        q: "Trebuie să schimbăm toate magazinele deodată?",
        a: "Nu. Începem cu schimbări mici și reversibile pentru produse și locații anume. O schimbare se extinde doar după ce rezultatul o susține.",
      },
      {
        q: "Cum percepeți plata?",
        a: "Un abonament lunar pe locație. Aria de acoperire depinde de numărul de magazine, sisteme și decizii monitorizate.",
      },
    ],
  },

  footer: {
    tagline: "Inteligență operațională pentru afacerile cu produse proaspete.",
    location: "Zürich, Elveția",
  },

  meta: {
    title: "Eclipsai | Inteligență operațională pentru afacerile cu produse proaspete",
    description: "Eclipsai ajută operatorii de produse proaspete în creștere să decidă ce să producă mâine, să reducă risipa și să măsoare impactul financiar al fiecărei schimbări.",
    ogDescription: "Știți ce să produceți mâine. Mai puțină risipă. Mai multe vânzări.",
  },
};
