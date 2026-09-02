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
    cta: "Prenota una chiamata",
    chooseLanguage: "Scegli la lingua",
    availableLanguages: "Lingue disponibili",
  },

  hero: {
    eyebrow: "Intelligenza operativa per il fresco.",
    h1: "Sapere cosa produrre domani. Meno sprechi. Più vendite.",
    copy: "Eclipsai collega i sistemi di vendita, produzione e amministrazione finanziaria. Prende decisioni di produzione per ogni punto vendita, prodotto e giorno della settimana, inserisce i cambiamenti approvati nel sistema di produzione e ne misura ogni giorno l'effetto su profitto, sprechi ed esaurimenti anticipati.",
    examples: [
      "Adegua gli ordini di produzione di domani.",
      "Segue gli ordini speciali fino a consegna e fatturazione.",
      "Segnala i rincari dei fornitori e i prezzi che non coprono più i costi.",
    ],
    cta: "Prenota una chiamata di 20 minuti",
    audience: "Per aziende del fresco in crescita, da 2 a 20 punti vendita.",
  },

  live: {
    ariaLabel: "Risultati degli ultimi sette giorni completati",
    period: "Ultimi sette giorni completati",
    live: "LIVE",
    snapshot: "ULTIMI RISULTATI VERIFICATI",
    linesChanged: "righe degli ordini di produzione modificate",
    profitImpact: "impatto sul profitto in percentuale delle vendite",
    wasteReduction: "riduzione stimata degli sprechi in percentuale rispetto agli sprechi iniziali",
    updated: "Aggiornato il",
  },

  problem: {
    eyebrow: "Quello che i titolari sanno e i sistemi non vedono",
    h2: "Il piano di produzione di domani viene definito prima che si possano considerare le vendite di oggi e le osservazioni del personale nei punti vendita.",
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
    lede: "Eclipsai collega i sistemi di vendita, produzione, ordini e fatturazione con e-mail, chat di lavoro e dati esterni rilevanti. Quando i dati non spiegano cosa è successo, pone al personale una domanda mirata. Le risposte possono arrivare via testo, foto o messaggio vocale.",
    mediaLabel: "Esempio: Eclipsai segue una decisione di produzione in un canale di team già familiare",
    whatChanges: "Come lavora Eclipsai",
    items: [
      { strong: "Leggere e analizzare i dati di tutti i sistemi", text: "Ogni punto vendita, prodotto e giorno della settimana ha un proprio andamento della domanda. Eclipsai considera giornate di vendita comparabili, andamento orario delle vendite, probabili esaurimenti, sprechi stimati, economia del prodotto e vincoli operativi." },
      { strong: "Individuare le decisioni economicamente sensate", text: "Per ogni riga di produzione, Eclipsai confronta la quantità attuale con le alternative realizzabili. Soppesa il costo dell'invenduto rispetto al margine a rischio quando si produce troppo poco." },
      { strong: "Implementare e verificare", text: "Le decisioni approvate vengono inserite nel software di produzione e confermate. Dopo la chiusura di ogni punto vendita, Eclipsai misura l'effetto su vendite, sprechi stimati, esaurimenti anticipati e profitto. Il risultato diventa una prova per la decisione successiva." },
    ],
  },

  demo: {
    open: "Guarda la demo",
    close: "Chiudi",
  },

  proof: {
    metadata: "Il nostro impatto",
    h2Before: "In una sola azienda abbiamo individuato un'opportunità da ",
    h2Value: "CHF 40–60K",
    h2After: " di profitto annuo.",
    lede: "Ora lavoriamo con l'azienda per portare questi cambiamenti nella produzione quotidiana.",
    ledgerLabel: "Dati analizzati per una singola azienda",
    rows: [
      { h3: "unità analizzate", value: "860.000", copy: "Sedici mesi di dati di vendita e produzione. Ne abbiamo riconciliato il 92% tra i due sistemi." },
      { h3: "unità consegnate invendute", ratioLabel: "Una unità consegnata su quattro è rimasta invenduta", value: "1 su 4", copy: "Il fenomeno si concentrava su punti vendita, prodotti e giorni della settimana precisi." },
      { h3: "di opportunità annua", value: "40–60 mila euro", copy: "Schemi di produzione ricorrenti non corrispondevano più alla domanda. Il costo degli ingredienti di tutte le unità invendute era di €190K." },
      { h3: "riduzioni proposte con valore netto stimato positivo", value: "86%", copy: "Il risparmio sugli ingredienti superava l'intero margine di ogni eventuale vendita persa. Le riduzioni hanno avuto un valore netto positivo in tutti i nove mesi testati." },
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

  vision: {
    eyebrow: "Oltre la produzione",
    h2: "Le prossime decisioni.",
    intro: "Dopo il collegamento ai sistemi e ai canali di comunicazione dell'azienda, Eclipsai può aggiungere le informazioni necessarie a ogni nuova decisione, applicare il cambiamento e misurarne il risultato.",
    pathLabel: "Percorso di espansione di Eclipsai",
    steps: [
      { index: "Inizio", h3: "Produzione e sprechi", p: "Proteggere le vendite riducendo gli sprechi ripetuti ed evitabili. Correggere i piani di produzione che non corrispondono più alla domanda." },
      { index: "Poi", h3: "Acquisti e prezzi", p: "Segnalare i rincari dei fornitori e i prezzi che non coprono più i costi." },
      { index: "In seguito", h3: "Personale e operazioni", p: "Vedere quando lotti più piccoli riducono gli sprechi ma aggiungono lavoro, o quando il personale insufficiente costa vendite." },
      { index: "Crescendo", h3: "Il prossimo punto vendita", p: "Usare ciò che funziona nei punti vendita attuali per avviare il prossimo." },
    ],
  },

  offer: {
    h2: "Eclipsai prende le decisioni quotidiane che fanno funzionare un'attività alimentare.",
    copy: "Collega vendite, produzione e ciò che vede il vostro team per trovare le poche decisioni su cui vale la pena agire e dimostrarne il risultato economico.",
    cardH3: "Inizia gratis",
    items: [
      "Dove perdete profitto, punto vendita per punto vendita, nel tempo",
      "Piani di produzione migliori, testati sui dati passati",
      "Raccomandazioni per gli ordini della prossima settimana",
      "Misurazione continua rispetto al piano che usate oggi",
    ],
    audience: "Per aziende del fresco in crescita, da 2 a 20 punti vendita.",
    cta: "Prenota una chiamata di 20 minuti",
  },

  faq: {
    eyebrow: "Domande frequenti",
    h2: "Cosa vogliono sapere i titolari prima di iniziare.",
    items: [
      {
        q: "Produrre meno mette a rischio le vendite?",
        a: "Eclipsai soppesa entrambi i rischi. Una vendita persa può costare più degli ingredienti risparmiati. Propone di produrre meno solo quando le prove lo sostengono, poi misura il risultato rispetto al piano che ha sostituito.",
      },
      {
        q: "In cosa Eclipsai differisce dalle quantità già consigliate dal nostro sistema?",
        a: "Eclipsai verifica la quantità attuale rispetto alle alternative realizzabili considerando andamento delle vendite, probabili esaurimenti, sprechi, economia del prodotto e vincoli operativi. I cambiamenti approvati vengono inseriti nel sistema di produzione e misurati in termini finanziari.",
      },
      {
        q: "Dobbiamo sostituire i sistemi esistenti?",
        a: "No. Eclipsai lavora con i sistemi già in uso. Legge e scrive tramite API oppure tramite uso diretto del computer per i sistemi più vecchi.",
      },
      {
        q: "Quanto lavoro richiede al team?",
        a: "Eclipsai lavora sui dati di vendita e produzione. Fa una domanda breve al team solo quando i dati non spiegano cosa è successo, come un esaurito, avanzi insoliti o un evento locale.",
      },
      {
        q: "Come iniziamo?",
        a: "Iniziamo dai dati affidabili e dalle combinazioni punto vendita-prodotto con le prove più solide. Quando i dati non bastano, Eclipsai chiede contesto oppure lascia invariata la quantità. Non è necessario cambiare tutti i punti vendita insieme.",
      },
    ],
  },

  footer: {
    tagline: "Intelligenza operativa per il fresco.",
    location: "Zurigo, Svizzera",
  },

  meta: {
    title: "Eclipsai | Intelligenza operativa per il fresco",
    description: "Eclipsai prende e implementa decisioni quotidiane di produzione per le aziende del fresco, poi ne misura l'effetto su profitto, sprechi e vendite.",
    ogDescription: "Sapere cosa produrre domani. Meno sprechi. Più vendite.",
  },
};
