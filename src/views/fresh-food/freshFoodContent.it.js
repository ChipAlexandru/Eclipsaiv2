// Fresh-food homepage content — Italian (concise business Italian).
// Claude-produced translation of freshFoodContent.en.js; native review
// recommended before broad launch. No em dashes in rendered copy.
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
    cta: "Scopri dove perdi margine",
    chooseLanguage: "Scegli la lingua",
    availableLanguages: "Lingue disponibili",
  },

  hero: {
    eyebrow: "Intelligenza operativa per il fresco",
    h1: "Sapere cosa produrre domani. Meno sprechi. Più vendite.",
    copy: "Eclipsai individua le decisioni che vale la pena cambiare analizzando vendite giornaliere, produzione, consegne e ciò che osserva il team. Misuriamo l'impatto economico di ogni cambiamento.",
    cta: "Scopri dove perdi margine",
    audience: "Pensato per operatori del fresco in crescita, da 2 a 20 punti vendita.",
  },

  problem: {
    eyebrow: "Quello che i titolari sanno e i sistemi non vedono",
    h2: "Il domani si decide prima di aver capito l'oggi.",
    lede: "Gli ordini di domani mettono insieme rimanenze, ordini speciali, medie passate ed esperienza. Su centinaia di decisioni negozio × prodotto × giorno della settimana, la scelta che fa il profitto si prende alla chiusura.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Contare cosa resta", p: "Ciò che non può restare sullo scaffale finisce nei sacchetti sorpresa o nel bidone, quasi mai registrato." },
      { time: "19:00", state: "time-1900", h3: "Fissare l'ordine di domani", p: "Medie, modelli e memoria si contendono l'attenzione mentre il negozio è ancora da pulire." },
      { time: "02:00", state: "time-0200", h3: "Parte la produzione", p: "La decisione di ieri diventa la merce deperibile di oggi." },
      { time: "11:40", state: "time-1140", h3: "Il vassoio si svuota", p: "Sembra un successo. I clienti continuano a chiederlo." },
    ],
    quote: "La cassa registra ciò che è stato venduto. Non lo scaffale vuoto, gli avanzi o la domanda al banco. È lì che si perde margine.",
  },

  product: {
    eyebrow: "Intelligenza operativa, sempre attiva",
    h2: "Osserva ogni negozio, ogni giorno. Chiede quando serve.",
    lede: "Eclipsai collega vendite giornaliere, produzione, consegne e ciò che vede il vostro team. Quando un cambiamento è in prova, chiede alla persona giusta cosa è successo. Porta le decisioni che contano in una revisione settimanale e risponde alle domande in qualsiasi momento.",
    mediaLabel: "Esempio: Eclipsai segue una decisione di produzione in un canale di team già familiare",
    whatChanges: "Cosa cambia",
    items: [
      { n: "01", strong: "Raccoglie ciò che serve.", text: "Avanzi, esauriti e richieste dei clienti." },
      { n: "02", strong: "Monitora ogni negozio, prodotto e giorno.", text: "Trova opportunità in sprechi, costi e vendite." },
      { n: "03", strong: "Propone e risponde.", text: "Fa emergere i cambiamenti che convengono la prossima settimana e risponde alle domande quando le fate." },
      { n: "04", strong: "Rendiconta i risultati.", text: "Mostra le prestazioni dei punti vendita e misura l'impatto economico di ogni decisione rispetto all'alternativa." },
    ],
  },

  proof: {
    metadata: "Dati reali di un'azienda · 16 mesi",
    h2Before: "In una sola azienda abbiamo individuato un'opportunità da ",
    h2Value: "40-60 mila euro",
    h2After: " di profitto annuo.",
    lede: "Un'azienda del fresco con più punti vendita ci ha messo a disposizione i suoi dati. Abbiamo incrociato vendite e produzione e analizzato ogni prodotto, in ogni punto vendita, giorno per giorno.",
    ledgerLabel: "Dati analizzati per una singola azienda",
    rows: [
      { index: "01", h3: "Abbiamo tracciato ogni unità prodotta", value: "860.000", copy: "Sedici mesi di vendite e consegne, riconciliati tra cassa e produzione, con una copertura del 92% delle unità." },
      { index: "02", h3: "Abbiamo individuato ciò che non è stato venduto", ratioLabel: "Una unità consegnata su quattro non è stata venduta", value: "1 su 4", copy: "Una unità consegnata su quattro non è stata venduta. Difficile da vedere giorno per giorno, evidente analizzando prodotti, punti vendita e giorni della settimana." },
      { index: "03", h3: "Abbiamo quantificato l'opportunità", value: "€40-60K", copy: "L'opportunità annua credibile era concentrata in schemi di produzione vecchi e ripetuti. Il totale degli ingredienti invenduti valeva €190K." },
      { index: "04", h3: "Abbiamo testato le correzioni", value: "86%", copy: "Quando la regola più solida consigliava di produrre meno, lo scaffale reggeva comunque fino a sera 86 volte su 100." },
    ],
    bridgeBefore: "Una parte dello spreco protegge le vendite. L'opportunità di ",
    bridgeValue: "€40-60K",
    bridgeAfter: " veniva da sprechi eccessivi, incastrati in vecchi schemi di produzione ripetuti.",
    note: "Dati di un'azienda con più punti vendita, dal 2024 al 2025. Risultati specifici di quell'azienda, non una promessa.",
    lessonHeading: "Cosa abbiamo imparato",
    lessonBefore: "Nel nostro test, la sola previsione ",
    lessonStrong: "ha generato una perdita",
    lessonAfter: ". La domanda sui piccoli volumi è instabile, contesto importante resta fuori dai dati e una vendita persa costa più degli ingredienti in eccesso. Il nostro approccio aggiunge i segnali che mancano alle previsioni, cambia solo le poche decisioni che convengono e misura ogni risultato. Ogni settimana, su ogni prodotto e punto vendita.",
  },

  loop: {
    eyebrow: "Cosa facciamo",
    h2: "Come recuperiamo il margine perso.",
    lede: "Il ciclo che ha trovato l'opportunità può girare in continuo nei vostri negozi.",
    listLabel: "Ciclo decisionale",
    steps: [
      { n: "01", b: "Collegare.", p: "I dati di vendita e produzione confluiscono in uno storico a livello di singola unità." },
      { n: "02", b: "Individuare.", p: "Emergono gli schemi ricorrenti: il prodotto buttato ogni venerdì, l'esaurito del sabato e l'ordine fisso ormai superato." },
      { n: "03", b: "Proporre.", p: "Piccoli cambiamenti reversibili arrivano nella nota settimanale. Con le motivazioni." },
      { n: "04", b: "Misurare.", p: "Ogni decisione viene verificata sulle vendite reali e misurata in termini economici." },
      { n: "05", b: "Correggere il piano.", p: "I cambiamenti che si dimostrano validi restano. Gli altri vengono rivisti o ritirati." },
      { n: "06", b: "Tenere d'occhio.", p: "Il monitoraggio non si ferma mai, così nulla torna a sfuggire." },
    ],
  },

  replay: {
    title: "Ordini di croissant proposti dal 7 al 13 luglio",
    changeStrong: "130 in meno",
    changeSpan: "unità di scarto",
    dotKey: "1 punto = 5 unità",
    ariaTitle: "Replay della decisione di produzione dei croissant",
    ariaDesc: "Quattordici giorni di vendite di croissant in punti blu, gli scarti con l'ordine attuale in punti arancioni e una linea continua per l'ordine proposto. La proposta mantiene 988 vendite e riduce gli scarti da 319 a 189 unità.",
    days: ["L 23", "M 24", "M 25", "G 26", "V 27", "S 28", "D 29", "L 30", "M 1", "M 2", "G 3", "V 4", "S 5", "D 6"],
    legendSold: "Venduto",
    legendWaste: "Scarti con il piano attuale",
    legendProposed: "Ordine proposto",
    tableLabel: "Risultati del replay decisionale",
    thPlan: "Piano",
    thSales: "Vendite",
    thWaste: "Scarti",
    rowCurrent: "Attuale",
    rowProposed: "Proposto",
  },

  vision: {
    eyebrow: "Oltre la produzione",
    h2: "Estendersi a ogni decisione che genera profitto.",
    intro: "La produzione viene prima perché la decisione si ripete ogni giorno e il risultato si vede in fretta.",
    pathLabel: "Percorso di espansione di Eclipsai",
    steps: [
      { index: "01 · Ora", h3: "Produzione e sprechi", p: "Proteggere le vendite senza ripetere sprechi evitabili. Correggere piani di produzione superati e misurare l'impatto economico di ogni cambiamento." },
      { index: "02 · Poi", h3: "Acquisti e prezzi", p: "Intercettare aumenti dei fornitori, margini deboli e prezzi che non coprono più i costi." },
      { index: "03 · In seguito", h3: "Personale e operazioni", p: "Vedere quando lotti più piccoli riducono gli sprechi ma aggiungono lavoro, o quando il personale insufficiente costa vendite." },
      { index: "04 · Crescendo", h3: "Il prossimo punto vendita", p: "Applicare al prossimo negozio tutto ciò che Eclipsai ha imparato dai vostri." },
    ],
    closing: "Una decisione alla volta, Eclipsai vi aiuta a tenere di più di quello che la vostra azienda guadagna.",
  },

  offer: {
    eyebrow: "Da vedere nei vostri negozi",
    h2: "Individua le perdite di margine su cui intervenire per prime.",
    copy: "Partiamo dai dati di vendita e produzione che avete già. Troviamo sprechi ripetuti, vendite perse e piani di produzione che non funzionano più, poi mostriamo il valore economico di ciascuno.",
    cardH3: "La vostra prima revisione",
    items: [
      "Le perdite di margine su cui intervenire per prime",
      "Le prove dietro ciascuna",
      "Il valore economico dell'opportunità",
      "I primi cambiamenti reversibili da testare",
    ],
    reassurance: "Nessun nuovo sistema per il vostro team. Nulla cambia finché le prove non sono chiare.",
    audience: "Per operatori del fresco in crescita, da 2 a 20 punti vendita.",
    cta: "Scopri dove perdi margine",
    mailSubject: "Scopri dove perdi margine",
    mailBody: "Numero di punti vendita:\nChi decide l'ordine di domani:\nSistemi attuali:\n",
  },

  faq: {
    eyebrow: "Domande frequenti",
    h2: "Cosa vogliono sapere i titolari prima di iniziare.",
    items: [
      {
        q: "Se produciamo meno, rischiamo di esaurire il prodotto?",
        a: "Eclipsai misura entrambi i rischi. Lo spreco costa ingredienti, mentre una vendita persa costa gran parte del prezzo di vendita. Proponiamo piccoli cambiamenti e verifichiamo cosa è successo davvero prima di cambiare il piano fisso.",
      },
      {
        q: "Il nostro sistema consiglia già le quantità. Cosa cambia?",
        a: "La maggior parte dei sistemi produce una previsione o un ordine suggerito. Eclipsai raccoglie anche ciò che vede il team, propone le decisioni che vale la pena cambiare e misura se ogni cambiamento ha fatto guadagnare o perdere denaro.",
      },
      {
        q: "Quanto lavoro richiede al team?",
        a: "Pochissimo. Eclipsai usa i dati che avete già e fa domande brevi e mirate solo quando manca un segnale importante, come un esaurito, avanzi insoliti o un evento locale.",
      },
      {
        q: "E se i nostri dati sono disordinati?",
        a: "È normale. Riconciliamo ciò che è affidabile, identifichiamo le lacune e mostriamo cosa le prove possono sostenere prima di raccomandare un cambiamento.",
      },
      {
        q: "Dobbiamo cambiare tutti i negozi in una volta?",
        a: "No. Iniziamo con piccoli cambiamenti reversibili su prodotti e punti vendita specifici. Un cambiamento si estende solo dopo che il risultato lo conferma.",
      },
      {
        q: "Come vi fate pagare?",
        a: "Un canone mensile per punto vendita. Il perimetro dipende dal numero di negozi, sistemi e decisioni monitorate.",
      },
    ],
  },

  footer: {
    tagline: "Intelligenza operativa per il fresco.",
    location: "Zurigo, Svizzera",
  },

  meta: {
    title: "Eclipsai | Intelligenza operativa per il fresco",
    description: "Eclipsai aiuta le aziende del fresco in crescita a decidere cosa produrre domani, ridurre gli sprechi e misurare l'impatto economico di ogni cambiamento.",
    ogDescription: "Sapere cosa produrre domani. Meno sprechi. Più vendite.",
  },
};
