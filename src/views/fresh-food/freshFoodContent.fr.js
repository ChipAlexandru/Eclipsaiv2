// Fresh-food homepage content — French (European/Swiss French).
// Claude-produced translation of the approved English source; a native
// operator/editor should make the final call (see
// docs/fresh-food-locale-review.md). No em dashes in rendered copy.
// Evidence values are unchanged; number separators follow French convention.

export const fr = {
  locale: "fr",
  languageName: "Français",

  nav: {
    ariaLabel: "Navigation principale",
    homeAriaLabel: "Accueil Eclipsai",
    product: "Comment ça marche",
    proof: "Impact",
    vision: "Au-delà de la production",
    cta: "Réserver un appel",
    chooseLanguage: "Choisir la langue",
    availableLanguages: "Langues disponibles",
  },

  hero: {
    eyebrow: "Produits frais :",
    h1: "The Profit Brain relie ventes, production et finances pour des actions quotidiennes qui influencent le profit.",
    h1Primary: "The Profit Brain",
    h1Support: "Relie ventes, production et finances pour des actions quotidiennes qui influencent le profit.",
    copy: "Décider des quantités à produire pour chaque boutique, chaque produit et chaque jour de la semaine. Mesurer chaque jour l'effet sur le profit, les ventes et les pertes.",
    examples: [
      "Ajuste les commandes de production de demain.",
      "Suit les commandes spéciales jusqu'à la livraison et la facturation.",
      "Signale les hausses de prix fournisseurs et les prix qui ne couvrent plus les coûts.",
    ],
    cta: "Réserver un appel de 20 min",
    audience: "Pour les exploitants du frais en croissance, de 2 à 20 points de vente.",
  },

  live: {
    ariaLabel: "Résultats des sept derniers jours clôturés",
    period: "Sept derniers jours clôturés",
    live: "LIVE",
    snapshot: "DERNIERS RÉSULTATS VÉRIFIÉS",
    production: "Production",
    linesChanged: "commandes de production modifiées (lignes)",
    profitImpact: "impact sur le profit en part du chiffre d'affaires",
    wasteReduction: "réduction estimée des pertes en pourcentage des pertes initiales",
    updated: "Actualisé le",
  },

  problem: {
    eyebrow: "Ce que les patrons savent et que les systèmes ne voient pas",
    h2: "Le plan de production de demain est fixé avant que les ventes du jour et les retours des équipes en magasin puissent être pris en compte.",
    steps: [
      { time: "18:45", state: "time-1845", h3: "Compter ce qui reste", p: "Ce qui ne peut pas rester en rayon part en paniers surprises ou à la poubelle. Le comptage est rarement enregistré." },
      { time: "19:00", state: "time-1900", h3: "Fixer la commande de demain", p: "La commande de demain se construit à partir de moyennes, de modèles, de commandes spéciales et de l'expérience, pendant que la boutique reste à nettoyer." },
      { time: "02:00", state: "time-0200", h3: "La production démarre", p: "La décision d'hier devient le stock périssable d'aujourd'hui." },
      { time: "11:40", state: "time-1140", h3: "Le plateau se vide", p: "Une rupture peut vouloir dire que le plan était juste, ou qu'une vente a été manquée. La caisse ne dit pas laquelle des deux." },
    ],
    quote: "La caisse enregistre ce qui s'est vendu. Elle n'enregistre pas ce qui est resté, ce qui est parti en rupture, ni ce que les clients ont demandé une fois le rayon vide. C'est là que le profit se perd.",
  },

  product: {
    eyebrow: "L'intelligence opérationnelle au travail",
    h2: "The Profit Brain crée des cycles d'amélioration quotidiens.",
    h2Primary: "The Profit Brain",
    h2Secondary: "crée des cycles d'amélioration quotidiens.",
    lede: "Eclipsai relie les systèmes de vente, de production, de commande et de facturation aux e-mails, aux messageries d'équipe et aux données externes pertinentes. Lorsque les données n'expliquent pas ce qui s'est passé, elle pose une question précise à l'équipe concernée. Les équipes peuvent répondre par texte, photo ou message vocal.",
    mediaLabel: "Exemple : Eclipsai suit une décision de production via un canal d'équipe familier",
    whatChanges: "Comment Eclipsai fonctionne",
    diagram: {
      ariaLabel: "The Profit Brain relie les données, mesure le profit, crée des actions, lit les systèmes de l'entreprise et applique les décisions de profit",
      correlate: "Relier les données", measure: "Mesurer le profit", actions: "Créer des actions",
      read: "Lire les données", implement: "Appliquer les décisions", systems: "Systèmes de l'entreprise",
      production: "Production", ops: "Gestion",
    },
    items: [
      { strong: "Lire et analyser les données de tous les systèmes", text: "Chaque boutique, chaque produit et chaque jour de la semaine a son propre profil de demande. The Profit Brain tient compte des journées comparables, du rythme des ventes, des ruptures probables, des pertes estimées, de l'économie du produit et des contraintes opérationnelles." },
      { strong: "Identifier les décisions qui comptent pour le profit", text: "Pour chaque ligne de production, The Profit Brain compare la quantité actuelle aux alternatives réalisables. Il met en balance le coût des invendus et la marge menacée si la production est insuffisante." },
      { strong: "Mettre en œuvre, mesurer et suivre le résultat", text: "Les décisions approuvées sont inscrites dans le logiciel de production et confirmées. Chaque jour, The Profit Brain mesure l'effet sur les ventes, les pertes estimées, les ruptures précoces et la trésorerie. Les résultats orientent les décisions suivantes." },
    ],
  },

  demo: {
    open: "Démo",
    close: "Fermer",
    chooseView: "Choisir la vue de la démo",
    viewOf: "sur",
    slides: [
      "Voir l'activité du jour dans son ensemble",
      "Proposer les quantités à produire",
      "Appliquer les décisions dans le système de production (API ou utilisation de l'ordinateur pour les anciens systèmes)",
      "Analyser les résultats chaque jour",
      "Suivre le profit et les pertes",
    ],
  },

  proof: {
    metadata: "Notre impact",
    h2Before: "En voie de dégager un potentiel de marge bénéficiaire de ",
    h2Value: "1%",
    h2After: " chez un exploitant alimentaire",
    lede: "",
    tracker: {
      period: "19 août–2 septembre 2026",
      cash: "Impact en trésorerie", economic: "Profit économique", waste: "Pertes évitées",
      projected: "projeté", ingredients: "Ingrédients",
      economics: "Ingrédients + main-d'œuvre standard + énergie",
      fullYear: "Année complète", measured: "Impact mesuré",
      ofSales: "des ventes", units: "unités", wasteRate: "taux de pertes",
      actuals: "RÉALISÉ", annualized: "IMPACT ANNUALISÉ", fullYearAxis: "ANNÉE COMPLÈTE",
    },
    ledgerLabel: "Registre de preuves d'un exploitant",
    rows: [
      { h3: "pièces analysées", value: "860 000", copy: "Seize mois de données de vente et de production. Nous en avons rapproché 92 % entre les deux." },
      { h3: "pièces livrées invendues", ratioLabel: "Une pièce livrée sur quatre est restée invendue", value: "1 sur 4", copy: "Le phénomène se concentrait sur certaines boutiques, certains produits et certains jours." },
      { h3: "d'opportunité annuelle", value: "€40–60K", copy: "Des schémas de production récurrents ne correspondaient plus à la demande. Le coût des ingrédients de toutes les pièces invendues atteignait €190K." },
      { h3: "réductions proposées avec une valeur nette estimée positive", value: "86 %", copy: "Les économies d'ingrédients dépassaient la totalité de la marge de toute vente éventuellement perdue. Les réductions ont été positives en valeur nette sur chacun des neuf mois testés." },
    ],
    bridgeBefore: "Une part des pertes protège les ventes. L'opportunité de ",
    bridgeValue: "€40–60K",
    bridgeAfter: " venait d'une surproduction répétée alors que la demande avait changé.",
    note: "D'après les données d'un exploitant multi-sites, 2024 à 2025. Propre à cette entreprise, pas une promesse.",
    lessonHeading: "Ce que nous avons appris",
    lessonParagraphs: [
      "Dans notre rejeu historique, confier toutes les commandes de production à une seule règle de prévision a fait perdre de l'argent. Les pertes baissaient, mais de petits écarts de prévision créaient des ruptures dont la marge perdue dépassait les ingrédients économisés.",
      "La demande à faible volume est instable. Les données ne contiennent pas chaque événement local et ne disent pas ce qu'une rupture signifiait.",
      "Eclipsai ajoute l'information manquante, n'applique que les quelques changements que les preuves soutiennent, et en mesure l'impact économique.",
    ],
  },

  vision: {
    eyebrow: "Au-delà de la production",
    h2: "Les prochaines décisions de profit",
    intro: "Une fois connecté aux systèmes et aux canaux de communication de l'entreprise, The Profit Brain peut ajouter les informations nécessaires à chaque nouvelle décision, mettre en œuvre le changement et en mesurer le résultat.",
    pathLabel: "Parcours d'extension de The Profit Brain",
    steps: [
      { index: "Départ", h3: "Production et pertes", p: "Protéger les ventes tout en réduisant les pertes répétées et évitables. Corriger les plans de production qui ne correspondent plus à la demande." },
      { index: "Ensuite", h3: "Achats et prix", p: "Signaler les hausses de prix fournisseurs et les prix qui ne couvrent plus les coûts." },
      { index: "Puis", h3: "Personnel et opérations", p: "Voir quand des lots plus petits réduisent les pertes mais ajoutent du travail, ou quand le sous-effectif coûte des ventes." },
      { index: "En grandissant", h3: "Le prochain point de vente", p: "Reprendre ce qui fonctionne dans vos boutiques actuelles pour ouvrir la suivante." },
    ],
  },

  offer: {
    h2: "The Profit Brain pour les actions quotidiennes qui influencent le profit.",
    copy: "Elle relie les ventes, la production et ce que votre équipe observe pour trouver les quelques décisions qui méritent d'être prises et en démontrer le résultat économique.",
    cardH3: "Commencer gratuitement",
    items: [
      "Où vous perdez du profit, boutique par boutique, dans le temps",
      "De meilleurs plans de production testés sur vos données passées",
      "Des recommandations pour les commandes de la semaine prochaine",
      "Une mesure continue face au plan que vous utilisez aujourd'hui",
    ],
    audience: "Pour les exploitants du frais en croissance, de 2 à 20 points de vente.",
    cta: "Réserver un appel de 20 min",
  },

  faq: {
    eyebrow: "Questions fréquentes",
    h2: "Ce qu'il faut savoir avant de commencer.",
    items: [
      {
        q: "Produire moins va-t-il mettre nos ventes en danger ?",
        a: "The Profit Brain met les deux risques en balance. Une vente manquée peut coûter plus cher que les ingrédients économisés. Il ne propose de produire moins que lorsque les preuves le soutiennent, puis mesure le résultat face au plan précédent.",
      },
      {
        q: "En quoi The Profit Brain diffère-t-il des quantités déjà recommandées par notre système ?",
        a: "The Profit Brain teste la quantité actuelle face aux alternatives réalisables en tenant compte du rythme des ventes, des ruptures probables, des pertes, de l'économie du produit et des contraintes opérationnelles. Les changements approuvés sont inscrits dans le système de production et mesurés en trésorerie.",
      },
      {
        q: "Devons-nous remplacer nos systèmes actuels ?",
        a: "Non. The Profit Brain fonctionne avec les systèmes déjà en place. Il lit et écrit les données par API ou par utilisation directe de l'ordinateur pour les systèmes plus anciens.",
      },
      {
        q: "Quelle charge de travail pour l'équipe ?",
        a: "The Profit Brain travaille à partir des données de vente et de production. Il ne pose une question courte que lorsque les données n'expliquent pas ce qui s'est passé : une rupture, des restes inhabituels ou un événement local.",
      },
      {
        q: "Comment commençons-nous ?",
        a: "Nous commençons par les données fiables et les combinaisons boutique-produit pour lesquelles les preuves sont les plus solides. Lorsque les données ne suffisent pas, The Profit Brain demande du contexte ou laisse la quantité inchangée. Il n'est pas nécessaire de changer toutes les boutiques en même temps.",
      },
    ],
  },

  footer: {
    tagline: "L'intelligence opérationnelle des métiers du frais.",
    location: "Zurich, Suisse",
  },

  meta: {
    title: "Eclipsai — The Profit Brain pour les métiers du frais",
    description: "The Profit Brain relie ventes, production et finances, applique les actions quotidiennes sur le profit et mesure leurs résultats.",
    ogDescription: "Relier ventes, production et finances pour agir chaque jour sur le profit.",
  },
};
