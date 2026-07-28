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
    proof: "Preuves",
    vision: "Au-delà de la production",
    cta: "Réserver un appel",
    chooseLanguage: "Choisir la langue",
    availableLanguages: "Langues disponibles",
  },

  hero: {
    eyebrow: "L'intelligence opérationnelle des métiers du frais.",
    h1: "Savoir quoi produire demain. Moins de pertes. Plus de ventes.",
    copy: "Eclipsai repère où les métiers du frais perdent du profit, applique le changement et en démontre l'impact économique. Cela commence par la production, puis s'étend aux commandes, aux prix, aux achats et au personnel.",
    examples: [
      "Ajuste les commandes de production de demain.",
      "Suit les commandes spéciales jusqu'à la livraison et la facturation.",
      "Signale les hausses de prix fournisseurs et les prix qui ne couvrent plus les coûts.",
    ],
    cta: "Réserver un appel de 20 min",
    audience: "Pour les exploitants du frais en croissance, de 2 à 20 points de vente.",
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
    h2: "Elle suit chaque boutique, chaque jour. Elle pose la question quand les données ne suffisent pas.",
    lede: "Eclipsai relie les systèmes de vente, de production, de commande et de facturation aux e-mails, aux messageries d'équipe et aux données externes pertinentes. Lorsque les données n'expliquent pas ce qui s'est passé, elle pose une question précise à l'équipe concernée. Les équipes peuvent répondre par texte, photo ou message vocal.",
    mediaLabel: "Exemple : Eclipsai suit une décision de production via un canal d'équipe familier",
    whatChanges: "Comment Eclipsai fonctionne",
    items: [
      { strong: "Repère les quelques changements qui en valent la peine", text: "Par boutique, produit et jour, elle met en balance les pertes et les ventes manquées." },
      { strong: "Formule des recommandations quotidiennes", text: "Le responsable voit la quantité recommandée, la raison et l'impact attendu sur le profit." },
      { strong: "Passe les résultats en revue chaque semaine", text: "La revue hebdomadaire montre quels changements ont amélioré le profit et lesquels doivent être intégrés au plan de référence." },
      { strong: "Met en œuvre les décisions éprouvées", text: "Au départ, chaque changement doit être approuvé. Lorsqu'un type de recommandation s'est révélé fiable, le produit met à jour le plan de production dans les limites fixées par l'exploitant et mesure l'amélioration du profit par rapport à l'ancien plan." },
    ],
  },

  proof: {
    metadata: "Preuves d'un exploitant · 16 mois",
    h2Before: "Nous avons trouvé ",
    h2Value: "€40–60K",
    h2After: " d'opportunité de profit annuel chez un exploitant.",
    lede: "Un exploitant multi-sites du frais nous a confié seize mois de données. Nous avons relié sa caisse et sa production, puis rapproché ce qui a été livré de ce qui a été vendu, par boutique, par produit et par jour.",
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
    h2: "Les prochaines décisions à améliorer.",
    intro: "Une fois Eclipsai reliée aux systèmes et aux canaux de communication de l'entreprise, elle peut ajouter les informations nécessaires à chaque nouvelle décision, mettre en œuvre le changement et en mesurer le résultat.",
    pathLabel: "Parcours d'extension d'Eclipsai",
    steps: [
      { index: "Départ", h3: "Production et pertes", p: "Protéger les ventes tout en réduisant les pertes répétées et évitables. Corriger les plans de production qui ne correspondent plus à la demande." },
      { index: "Ensuite", h3: "Achats et prix", p: "Signaler les hausses de prix fournisseurs et les prix qui ne couvrent plus les coûts." },
      { index: "Puis", h3: "Personnel et opérations", p: "Voir quand des lots plus petits réduisent les pertes mais ajoutent du travail, ou quand le sous-effectif coûte des ventes." },
      { index: "En grandissant", h3: "Le prochain point de vente", p: "Reprendre ce qui fonctionne dans vos boutiques actuelles pour ouvrir la suivante." },
    ],
  },

  offer: {
    h2: "Eclipsai prend les décisions quotidiennes qui font fonctionner une entreprise alimentaire.",
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
    h2: "Ce que les patrons veulent savoir avant de commencer.",
    items: [
      {
        q: "Produire moins va-t-il nous mettre en rupture ?",
        a: "Eclipsai met les deux risques en balance. Une vente manquée peut coûter plus cher que les ingrédients économisés. Elle ne propose de produire moins que lorsque les preuves le soutiennent, puis mesure le résultat face au plan qu'elle a remplacé.",
      },
      {
        q: "Notre système recommande déjà des quantités. Quelle est la différence ?",
        a: "Eclipsai garde le plan actuel comme référence, ajoute ce qui manque aux données et ne propose une commande différente que là où les preuves le soutiennent. Une fois approuvée, elle peut appliquer la modification dans le système de production et en mesurer l'impact économique.",
      },
      {
        q: "Quelle charge de travail pour l'équipe ?",
        a: "Eclipsai travaille à partir des données de vente et de production. Elle ne pose une question courte que lorsque les données n'expliquent pas ce qui s'est passé : une rupture, des restes inhabituels ou un événement local.",
      },
      {
        q: "Et si nos données sont en désordre ?",
        a: "Nous rapprochons les données fiables et rendons les manques visibles. Si les données ne soutiennent pas une recommandation, Eclipsai demande du contexte ou laisse le plan inchangé.",
      },
      {
        q: "Faut-il changer toutes les boutiques d'un coup ?",
        a: "Non. Nous commençons par les couples boutique-produit où les preuves sont les plus solides. Nous nous appuyons sur ce résultat avant d'appliquer la même règle ailleurs.",
      },
      {
        q: "Comment facturez-vous ?",
        a: "Le démarrage est gratuit. Si vous continuez, nous facturons un abonnement mensuel selon le nombre de points de vente et les domaines de décision suivis.",
      },
    ],
  },

  footer: {
    tagline: "L'intelligence opérationnelle des métiers du frais.",
    location: "Zurich, Suisse",
  },

  meta: {
    title: "Eclipsai | L'intelligence opérationnelle des métiers du frais",
    description: "Eclipsai prend les décisions quotidiennes qui font fonctionner une entreprise alimentaire, en commençant par ce qu'il faut produire demain.",
    ogDescription: "Savoir quoi produire demain. Moins de pertes. Plus de ventes.",
  },
};
