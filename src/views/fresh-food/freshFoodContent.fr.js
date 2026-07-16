// Fresh-food homepage content — French (European/Swiss French).
// Claude-produced translation of freshFoodContent.en.js; native review
// recommended before broad launch. No em dashes in rendered copy.
// Evidence values are unchanged; number separators follow French convention.

export const fr = {
  locale: "fr",
  languageName: "Français",

  nav: {
    ariaLabel: "Navigation principale",
    homeAriaLabel: "Accueil Eclipsai",
    product: "Comment ça marche",
    proof: "Preuves",
    vision: "Au-delà de la production",
    cta: "Repérer les pertes de marge",
    chooseLanguage: "Choisir la langue",
    availableLanguages: "Langues disponibles",
  },

  hero: {
    eyebrow: "L'intelligence opérationnelle des métiers du frais",
    h1: "Savoir quoi produire demain. Moins de pertes. Plus de ventes.",
    copy: "Eclipsai surveille l'activité, repère ce qui doit changer, agit dans les systèmes que vous utilisez déjà, dans les limites que vous fixez, et mesure l'impact économique du résultat.",
    examples: [
      "Ajuste les commandes de production de demain.",
      "Fait passer les commandes spéciales par la production, la livraison et la facturation.",
      "Contrôle les prix fournisseurs, les coûts produits et les marges.",
    ],
    cta: "Repérer les pertes de marge",
    audience: "Conçu pour les exploitants de produits frais en croissance, de 2 à 20 points de vente.",
  },

  problem: {
    eyebrow: "Ce que les patrons savent et que les systèmes ne voient pas",
    h2: "Demain se décide avant d'avoir compris aujourd'hui.",
    lede: "Les commandes de demain combinent les restes, les commandes spéciales, les moyennes passées et l'expérience. Sur des centaines de décisions magasin × produit × jour de la semaine, le choix qui fait le profit se joue à la fermeture.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Compter ce qui reste", p: "Ce qui ne peut pas rester en rayon part en paniers surprises ou à la poubelle, rarement enregistré." },
      { time: "19:00", state: "time-1900", h3: "Fixer la commande de demain", p: "Moyennes, modèles et mémoire se disputent l'attention pendant que la boutique reste à nettoyer." },
      { time: "02:00", state: "time-0200", h3: "La production démarre", p: "La décision d'hier devient le stock périssable d'aujourd'hui." },
      { time: "11:40", state: "time-1140", h3: "Le plateau se vide", p: "On dirait un succès. Les clients continuent d'en demander." },
    ],
    quote: "La caisse enregistre ce qui s'est vendu. Pas le rayon vide, les invendus ni la question au comptoir. C'est là que la marge se perd.",
  },

  product: {
    eyebrow: "L'intelligence opérationnelle, toujours active",
    h2: "Il suit chaque boutique, chaque jour. Il pose la question quand il le faut.",
    lede: "Eclipsai relie les ventes quotidiennes, la production, les livraisons et ce que votre équipe observe. Quand un changement est à l'essai, il demande à la bonne personne ce qui s'est passé. Il rassemble les décisions qui comptent dans une revue hebdomadaire et répond aux questions à tout moment.",
    mediaLabel: "Exemple : Eclipsai suit une décision de production via un canal d'équipe familier",
    whatChanges: "Ce qui change",
    items: [
      { n: "01", strong: "Capte ce qui est nécessaire.", text: "Invendus, ruptures et demandes des clients." },
      { n: "02", strong: "Surveille chaque boutique, chaque produit, chaque jour.", text: "Repère les opportunités dans les pertes, les coûts et les ventes." },
      { n: "03", strong: "Propose et répond.", text: "Fait remonter les changements qui valent la peine la semaine prochaine et répond à vos questions quand vous les posez." },
      { n: "04", strong: "Rend compte des résultats.", text: "Montre la performance des boutiques et mesure l'impact économique de chaque décision face à l'alternative." },
    ],
  },

  proof: {
    metadata: "Preuves d'un exploitant · 16 mois",
    h2Before: "Nous avons trouvé ",
    h2Value: "€40-60K",
    h2After: " d'opportunité de profit annuel chez un exploitant.",
    lede: "Un exploitant multi-sites de produits frais a ouvert ses données. Nous avons relié la caisse et la production, puis suivi chaque produit dans chaque boutique, jour après jour.",
    ledgerLabel: "Registre de preuves d'un exploitant",
    rows: [
      { index: "01", h3: "Nous avons suivi chaque pièce", value: "860 000", copy: "Seize mois de ventes et de livraisons, rapprochés entre caisse et production. 92 % de toutes les pièces couvertes." },
      { index: "02", h3: "Nous avons trouvé ce qui ne s'est jamais vendu", ratioLabel: "Une pièce sur quatre ne s'est jamais vendue", value: "1 sur 4", copy: "Une pièce livrée sur quatre ne s'est jamais vendue. Difficile à voir au quotidien, incontestable à travers produits, boutiques et jours de la semaine." },
      { index: "03", h3: "Nous avons chiffré l'opportunité", value: "€40-60K", copy: "L'opportunité annuelle crédible se concentrait dans des schémas de production figés et répétés. Le total des ingrédients invendus atteignait €190K." },
      { index: "04", h3: "Nous avons testé les correctifs", value: "86 %", copy: "Quand la règle la plus forte recommandait de produire moins, le rayon tenait quand même la journée 86 fois sur 100." },
    ],
    bridgeBefore: "Une part des pertes protège les ventes. L'opportunité de ",
    bridgeValue: "€40-60K",
    bridgeAfter: " venait de pertes excessives, enfermées dans de vieux schémas de production répétés.",
    note: "D'après les données d'un exploitant multi-sites, 2024 à 2025. Propre à cette entreprise, pas une promesse.",
    lessonHeading: "Ce que nous avons appris",
    lessonBefore: "Dans notre test, la prévision seule ",
    lessonStrong: "a perdu de l'argent",
    lessonAfter: ". La demande à faible volume est instable, un contexte important échappe aux données, et une vente manquée coûte plus cher que des ingrédients en trop. Notre approche ajoute les signaux qui manquent aux prévisions, ne change que les quelques décisions qui en valent la peine et mesure chaque résultat. Chaque semaine, sur chaque produit et chaque point de vente.",
  },

  loop: {
    eyebrow: "Ce que nous faisons",
    h2: "Comment récupérer la marge perdue.",
    lede: "La boucle qui a trouvé l'opportunité peut tourner en continu dans vos boutiques.",
    listLabel: "Boucle de décision",
    steps: [
      { n: "01", b: "Surveiller.", p: "Relie les ventes quotidiennes, la production, les livraisons et les signaux de l'équipe." },
      { n: "02", b: "Décider.", p: "Identifie les quelques décisions qui valent la peine de changer et met en balance les pertes et les ventes manquées." },
      { n: "03", b: "Agir.", p: "Met à jour la commande ou réalise l'étape approuvée suivante, dans les limites fixées par l'exploitant." },
      { n: "04", b: "Mesurer.", p: "Vérifie le résultat face aux ventes et aux coûts réels et mesure son impact économique." },
      { n: "05", b: "Apprendre.", p: "Conserve les changements qui font leurs preuves et corrige ceux qui échouent." },
      { n: "06", b: "Rester vigilant.", p: "Continue de surveiller pour que les anciennes habitudes ne reviennent pas en douce." },
    ],
  },

  replay: {
    title: "Commandes de croissants proposées du 7 au 13 juillet",
    changeStrong: "130 de moins",
    changeSpan: "unités jetées",
    dotKey: "1 point = 5 unités",
    ariaTitle: "Rejeu de la décision de production de croissants",
    ariaDesc: "Quatorze jours de ventes de croissants en points bleus, les pertes avec la commande actuelle en points orange et une ligne continue pour la commande proposée. La proposition conserve 988 ventes et réduit les pertes de 319 à 189 unités.",
    days: ["L 23", "M 24", "M 25", "J 26", "V 27", "S 28", "D 29", "L 30", "M 1", "M 2", "J 3", "V 4", "S 5", "D 6"],
    legendSold: "Vendu",
    legendWaste: "Pertes avec le plan actuel",
    legendProposed: "Commande proposée",
    tableLabel: "Résultats du rejeu de décision",
    thPlan: "Plan",
    thSales: "Ventes",
    thWaste: "Pertes",
    rowCurrent: "Actuel",
    rowProposed: "Proposé",
  },

  vision: {
    eyebrow: "Au-delà de la production",
    h2: "Étendre à chaque décision qui fait le profit.",
    intro: "La production vient en premier parce que la décision se répète chaque jour et que le résultat se voit vite.",
    pathLabel: "Parcours d'extension d'Eclipsai",
    steps: [
      { index: "01 · Maintenant", h3: "Production et pertes", p: "Protéger les ventes sans répéter les pertes évitables. Corriger les plans de production figés et mesurer l'impact économique de chaque changement." },
      { index: "02 · Ensuite", h3: "Achats et prix", p: "Repérer les hausses de coûts fournisseurs, les marges faibles et les prix qui ne couvrent plus les coûts." },
      { index: "03 · Puis", h3: "Personnel et opérations", p: "Voir quand des lots plus petits réduisent les pertes mais ajoutent du travail, ou quand le sous-effectif coûte des ventes." },
      { index: "04 · En grandissant", h3: "Le prochain point de vente", p: "Appliquer tout ce qu'Eclipsai a appris de vos boutiques à la suivante." },
    ],
    closing: "Décision après décision, Eclipsai vous aide à garder davantage de ce que votre entreprise gagne.",
  },

  offer: {
    eyebrow: "À voir dans vos propres boutiques",
    h2: "Repérez les pertes de marge à corriger en premier.",
    copy: "Nous partons des données de vente et de production que vous avez déjà. Nous repérons les pertes répétées, les ventes manquées et les plans de production qui ne conviennent plus, puis nous montrons l'impact économique de chacun.",
    cardH3: "Votre première revue",
    items: [
      "Les pertes de marge à corriger en premier",
      "Les preuves derrière chacune",
      "L'impact économique de l'opportunité",
      "Les premiers changements réversibles à tester",
    ],
    reassurance: "Aucun nouveau système pour votre équipe. Rien ne change tant que les preuves ne sont pas claires.",
    audience: "Pour les exploitants de produits frais en croissance, de 2 à 20 points de vente.",
    cta: "Repérer les pertes de marge",
  },

  faq: {
    eyebrow: "Questions fréquentes",
    h2: "Ce que les patrons veulent savoir avant de commencer.",
    items: [
      {
        q: "Produire moins va-t-il nous mettre en rupture ?",
        a: "Eclipsai mesure les deux risques. Les pertes coûtent des ingrédients, tandis qu'une vente manquée coûte l'essentiel du prix de vente. Nous proposons de petits changements et vérifions ce qui s'est réellement passé avant de modifier le plan permanent.",
      },
      {
        q: "Notre système recommande déjà des quantités. Quelle est la différence ?",
        a: "La plupart des systèmes produisent une prévision ou une commande suggérée. Eclipsai capte aussi ce que l'équipe observe, propose les décisions qui valent la peine d'être changées et mesure si chaque changement a fait gagner ou perdre de l'argent.",
      },
      {
        q: "Quelle charge de travail pour l'équipe ?",
        a: "Très peu. Eclipsai utilise les données que vous avez déjà et pose des questions courtes et ciblées uniquement quand un signal important manque, comme une rupture, des restes inhabituels ou un événement local.",
      },
      {
        q: "Et si nos données sont en désordre ?",
        a: "C'est normal. Nous rapprochons ce qui est fiable, identifions les manques et montrons ce que les preuves permettent d'affirmer avant de recommander un changement.",
      },
      {
        q: "Faut-il changer toutes les boutiques d'un coup ?",
        a: "Non. Nous commençons par de petits changements réversibles sur des produits et des points de vente précis. Un changement ne s'étend qu'une fois le résultat confirmé.",
      },
      {
        q: "Comment facturez-vous ?",
        a: "Un abonnement mensuel par point de vente. Le périmètre dépend du nombre de boutiques, de systèmes et de décisions suivies.",
      },
    ],
  },

  footer: {
    tagline: "L'intelligence opérationnelle des métiers du frais.",
    location: "Zurich, Suisse",
  },

  meta: {
    title: "Eclipsai | L'intelligence opérationnelle des métiers du frais",
    description: "Eclipsai aide les exploitants de produits frais en croissance à décider quoi produire demain, à réduire les pertes et à mesurer l'impact économique de chaque changement.",
    ogDescription: "Savoir quoi produire demain. Moins de pertes. Plus de ventes.",
  },
};
