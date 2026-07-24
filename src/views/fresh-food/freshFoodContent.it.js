// Fresh-food homepage content — Italian (concise business Italian).
// Claude-produced translation of the approved English source; a native
// operator/editor should make the final call (see
// docs/fresh-food-locale-review.md). No em dashes in rendered copy.
// Evidence values are unchanged; number separators follow Italian convention.

export const it = {
  locale: "it",
  languageName: "Italiano",

  nav: {
    ariaLabel: "Navigazione principale",
    homeAriaLabel: "Home Eclipsai",
    product: "Come funziona",
    proof: "Le prove",
    vision: "Oltre la produzione",
    cta: "Inizia gratis",
    chooseLanguage: "Scegli la lingua",
    availableLanguages: "Lingue disponibili",
  },

  hero: {
    eyebrow: "Intelligenza operativa per il fresco.",
    h1: "Sapere cosa produrre domani. Meno sprechi. Più vendite.",
    copy: "Eclipsai individua dove le aziende del fresco perdono profitto, applica il cambiamento e ne dimostra l'impatto economico. Parte dalla produzione, poi si estende a ordini, prezzi, acquisti e personale.",
    examples: [
      "Adegua gli ordini di produzione di domani.",
      "Segue gli ordini speciali fino a consegna e fatturazione.",
      "Segnala i rincari dei fornitori e i prezzi che non coprono più i costi.",
    ],
    cta: "Inizia gratis",
    audience: "Per aziende del fresco in crescita, da 2 a 20 punti vendita.",
  },

  problem: {
    eyebrow: "Quello che i titolari sanno e i sistemi non vedono",
    h2: "Il piano di domani si decide prima che vendite e segnalazioni dal punto vendita possano correggerlo.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Contare cosa resta", p: "Ciò che non può restare sullo scaffale finisce nei sacchetti sorpresa o nel bidone. Il conteggio quasi mai viene registrato." },
      { time: "19:00", state: "time-1900", h3: "Fissare l'ordine di domani", p: "L'ordine di domani nasce da medie, modelli, ordini speciali ed esperienza, mentre il negozio è ancora da pulire." },
      { time: "02:00", state: "time-0200", h3: "Parte la produzione", p: "La decisione di ieri diventa la merce deperibile di oggi." },
      { time: "11:40", state: "time-1140", h3: "Il vassoio si svuota", p: "Un esaurito può voler dire che il piano era giusto, oppure che una vendita è andata persa. La cassa non distingue i due casi." },
    ],
    quote: "La cassa registra ciò che è stato venduto. Non registra ciò che è rimasto, ciò che si è esaurito, né ciò che i clienti hanno chiesto a scaffale vuoto. È lì che si perde profitto.",
  },

  product: {
    eyebrow: "Intelligenza operativa al lavoro",
    h2: "Osserva ogni punto vendita, ogni giorno. Chiede quando i dati non bastano.",
    lede: "Eclipsai collega vendite giornaliere, produzione, consegne e ciò che vede il vostro team. Quando i dati non spiegano cosa è successo, lo chiede a chi lo sa. Porta i pochi cambiamenti che contano nella revisione settimanale e risponde alle domande man mano che emergono.",
    mediaLabel: "Esempio: Eclipsai segue una decisione di produzione in un canale di team già familiare",
    whatChanges: "Come lavora Eclipsai",
    items: [
      { strong: "Raccoglie ciò che i dati non dicono", text: "Avanzi, esauriti, richieste dei clienti e il contesto che li spiega." },
      { strong: "Individua dove il piano perde profitto", text: "Per punto vendita, prodotto e giorno." },
      { strong: "Consiglia il prossimo cambiamento", text: "Mostra cosa cambiare, perché e cosa è in gioco." },
      { strong: "Dimostra il risultato", text: "Confronta ogni cambiamento con il piano che ha sostituito, in termini economici." },
    ],
  },

  proof: {
    metadata: "Prove da un'azienda · 16 mesi",
    h2Before: "In una sola azienda abbiamo individuato un'opportunità da ",
    h2Value: "40–60 mila euro",
    h2After: " di profitto annuo.",
    lede: "Un'azienda del fresco con più punti vendita ci ha dato sedici mesi di dati. Abbiamo collegato cassa e produzione e confrontato ciò che è stato consegnato con ciò che è stato venduto, per punto vendita, prodotto e giorno.",
    ledgerLabel: "Dati analizzati per una singola azienda",
    rows: [
      { h3: "unità analizzate", value: "860.000", copy: "Sedici mesi di dati di vendita e produzione. Ne abbiamo riconciliato il 92% tra i due sistemi." },
      { h3: "unità consegnate invendute", ratioLabel: "Una unità consegnata su quattro è rimasta invenduta", value: "1 su 4", copy: "Il fenomeno si concentrava su punti vendita, prodotti e giorni della settimana precisi." },
      { h3: "di opportunità annua", value: "40–60 mila euro", copy: "Schemi di produzione ricorrenti non corrispondevano più alla domanda. Il costo degli ingredienti di tutte le unità invendute era di €190K." },
      { h3: "delle riduzioni ha coperto la domanda", value: "86%", copy: "La regola storica più solida riduceva ordini mirati senza far mancare il prodotto." },
    ],
    bridgeBefore: "Una parte dello spreco protegge le vendite. L'opportunità da ",
    bridgeValue: "40–60 mila euro",
    bridgeAfter: " nasceva da sovrapproduzione ripetuta dopo che la domanda era cambiata.",
    note: "Dai dati di un'azienda con più punti vendita, dal 2024 al 2025. Risultati specifici di quell'azienda, non una promessa.",
    lessonHeading: "Cosa abbiamo imparato",
    lessonParagraphs: [
      "Nella nostra simulazione storica, lasciare che una sola regola previsionale decidesse ogni ordine di produzione ha generato una perdita. Riduceva gli sprechi, ma piccoli errori di previsione diventavano esauriti il cui margine perso superava gli ingredienti risparmiati.",
      "La domanda sui piccoli volumi è instabile. I dati non contengono ogni evento locale e non dicono cosa abbia significato un esaurito.",
      "Eclipsai aggiunge le informazioni mancanti, applica solo i pochi cambiamenti che le prove sostengono e ne misura l'impatto economico.",
    ],
  },

  loop: {
    eyebrow: "Cosa facciamo",
    h2: "Come nascono decisioni migliori.",
    lede: "Lo stesso ciclo può migliorare il profitto in tutti i vostri punti vendita.",
    listLabel: "Ciclo decisionale",
    steps: [
      { b: "Raccogliere", p: "Collega vendite giornaliere, produzione, consegne e ciò che vede il vostro team." },
      { b: "Decidere", p: "Individua le poche decisioni che vale la pena cambiare e soppesa gli sprechi rispetto alle vendite perse." },
      { b: "Agire", p: "Aggiorna l'ordine o esegue il passo approvato, entro i limiti definiti dall'azienda." },
      { b: "Misurare", p: "Verifica il risultato su vendite e costi reali, in termini economici." },
      { b: "Migliorare", p: "Mantiene i cambiamenti che migliorano il risultato e corregge gli altri." },
    ],
  },

  replay: {
    title: "Ordini di croissant proposti dal 7 al 13 luglio",
    changeStrong: "130 in meno",
    changeSpan: "unità sprecate",
    dotKey: "1 punto = 5 unità",
    ariaTitle: "Simulazione della decisione di produzione dei croissant",
    ariaDesc: "Quattordici giorni di vendite di croissant in punti blu, gli scarti con l'ordine attuale in punti arancioni e una linea continua per l'ordine proposto. La proposta mantiene 988 vendite e riduce gli scarti da 319 a 189 unità.",
    days: ["L 23", "M 24", "M 25", "G 26", "V 27", "S 28", "D 29", "L 30", "M 1", "M 2", "G 3", "V 4", "S 5", "D 6"],
    legendSold: "Venduto",
    legendWaste: "Scarti con il piano attuale",
    legendProposed: "Ordine proposto",
    tableLabel: "Risultati della simulazione decisionale",
    thPlan: "Piano",
    thSales: "Vendite",
    thWaste: "Scarti",
    rowCurrent: "Attuale",
    rowProposed: "Proposto",
  },

  vision: {
    eyebrow: "Oltre la produzione",
    h2: "Le prossime decisioni da migliorare.",
    intro: "La produzione viene prima perché la decisione si ripete ogni giorno e il risultato si vede in fretta.",
    pathLabel: "Percorso di espansione di Eclipsai",
    steps: [
      { index: "Inizio", h3: "Produzione e sprechi", p: "Proteggere le vendite riducendo gli sprechi ripetuti ed evitabili. Correggere i piani di produzione che non corrispondono più alla domanda." },
      { index: "Poi", h3: "Acquisti e prezzi", p: "Segnalare i rincari dei fornitori e i prezzi che non coprono più i costi." },
      { index: "In seguito", h3: "Personale e operazioni", p: "Vedere quando lotti più piccoli riducono gli sprechi ma aggiungono lavoro, o quando il personale insufficiente costa vendite." },
      { index: "Crescendo", h3: "Il prossimo punto vendita", p: "Usare ciò che funziona nei punti vendita attuali per avviare il prossimo." },
    ],
  },

  offer: {
    h2: "Eclipsai vi aiuta a prendere le decisioni quotidiane che determinano il profitto.",
    copy: "Collega vendite, produzione e ciò che vede il vostro team per trovare le poche decisioni su cui vale la pena agire e dimostrarne il risultato economico.",
    cardH3: "Inizia gratis",
    items: [
      "Dove perdete profitto, punto vendita per punto vendita, nel tempo",
      "Piani di produzione migliori, testati sui dati passati",
      "Raccomandazioni per gli ordini della prossima settimana",
      "Misurazione continua rispetto al piano che usate oggi",
    ],
    audience: "Per aziende del fresco in crescita, da 2 a 20 punti vendita.",
    cta: "Inizia gratis",
  },

  faq: {
    eyebrow: "Domande frequenti",
    h2: "Cosa vogliono sapere i titolari prima di iniziare.",
    items: [
      {
        q: "Se produciamo meno, rischiamo di esaurire il prodotto?",
        a: "Eclipsai soppesa entrambi i rischi. Una vendita persa può costare più degli ingredienti risparmiati. Propone di produrre meno solo quando le prove lo sostengono, poi misura il risultato rispetto al piano che ha sostituito.",
      },
      {
        q: "Il nostro sistema consiglia già le quantità. Cosa cambia?",
        a: "Eclipsai mantiene il piano attuale come riferimento, aggiunge ciò che manca nei dati e propone un ordine diverso solo dove le prove lo sostengono. Poi ne misura il risultato economico.",
      },
      {
        q: "Quanto lavoro richiede al team?",
        a: "Eclipsai lavora sui dati di vendita e produzione. Fa una domanda breve al team solo quando i dati non spiegano cosa è successo, come un esaurito, avanzi insoliti o un evento locale.",
      },
      {
        q: "E se i nostri dati sono disordinati?",
        a: "Riconciliamo i dati affidabili e rendiamo visibili le lacune. Se i dati non sostengono una raccomandazione, Eclipsai chiede contesto oppure lascia il piano invariato.",
      },
      {
        q: "Dobbiamo cambiare tutti i punti vendita in una volta?",
        a: "No. Iniziamo dalle combinazioni punto vendita-prodotto con le prove più solide. Usiamo quel risultato prima di applicare la stessa regola altrove.",
      },
      {
        q: "Come vi fate pagare?",
        a: "Iniziare è gratis. Se proseguite, applichiamo un canone mensile per punto vendita, in base a negozi, sistemi e decisioni monitorate.",
      },
    ],
  },

  footer: {
    tagline: "Intelligenza operativa per il fresco.",
    location: "Zurigo, Svizzera",
  },

  meta: {
    title: "Eclipsai | Intelligenza operativa per il fresco",
    description: "Eclipsai aiuta le aziende del fresco a prendere le decisioni quotidiane che determinano il profitto, a partire dalla produzione di domani.",
    ogDescription: "Sapere cosa produrre domani. Meno sprechi. Più vendite.",
  },
};
