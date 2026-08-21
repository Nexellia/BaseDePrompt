---
name: BaseDePrompt
description: Une bibliothèque de prompts claire, rapide et accueillante pour les professionnels de la formation.
colors:
  accent: "#6752E8"
  accent-strong: "#5840D6"
  accent-soft: "#EDEAFF"
  canvas: "#F7F6FB"
  surface: "#FDFCFF"
  surface-muted: "#F2F0F6"
  ink: "#171523"
  ink-soft: "#62606D"
  border: "#E4E1EA"
  success: "#3D9665"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "3.35rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.055em"
  body:
    fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
rounded:
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "28px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "64px"
    padding: "0 18px"
  copy-button:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-strong}"
    rounded: "{rounded.md}"
    height: "43px"
    padding: "10px 13px"
  prompt-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "23px 25px"
---

## Overview

**Creative North Star: "Le pupitre calme"**

L'interface accompagne un formateur qui cherche une ressource pendant une journée de travail ou devant un groupe. Elle privilégie la lumière, la lisibilité et les repères familiers. La modernité vient de la précision des proportions, des états et des retours d'action, jamais d'un effet décoratif.

**Key Characteristics:**

- Une recherche centrale qui ressemble à un outil, pas à un héros marketing.
- Une liste verticale stable qui révèle progressivement le contenu long.
- Une couleur violette réservée aux actions, sélections et repères de session.
- Une densité confortable sur ordinateur et une lecture linéaire sur mobile.

**The Task First Rule.** À chaque écran, chercher, filtrer et copier doivent rester les actions les plus évidentes.

## Colors

La stratégie est retenue : des neutres légèrement teintés de violet et un accent limité aux états actifs. Les valeurs hexadécimales normatives sont définies dans le frontmatter ; l'implémentation CSS conserve leurs équivalents OKLCH afin de maîtriser la perception et les transparences.

**The Functional Violet Rule.** Le violet signale une action, une sélection ou une information de session. Il n'habille jamais une zone sans fonction.

**The Tinted White Rule.** Les surfaces ne sont jamais blanc pur ; leur légère teinte maintient la cohérence de l'ensemble et réduit la dureté visuelle.

## Typography

Une seule famille sans sérif porte toute l'interface. Les polices système assurent un chargement instantané et une familiarité immédiate. Les titres utilisent le poids et l'espacement pour établir la hiérarchie ; les contrôles restent compacts, stables et lisibles.

**The One Voice Rule.** Aucun caractère d'affichage ou monospace n'entre dans les libellés de l'outil. Une seule famille, plusieurs niveaux clairement espacés.

**The Reading Measure Rule.** Les descriptions et le contenu des prompts restent limités à environ 75 caractères par ligne sur grand écran.

## Elevation

L'élévation est discrète. Le panneau de recherche et les prompts ouverts reçoivent une ombre ambiante large et peu opaque ; les autres éléments utilisent principalement la bordure et la différence de surface.

**The Earned Shadow Rule.** Une ombre marque une zone active, flottante ou ouverte. Si tout semble flotter, les ombres sont trop nombreuses.

## Components

- **En-tête.** Compact, non collant, limité au nom de la bibliothèque.
- **Recherche.** Champ de 64 px sur ordinateur, icône à gauche, raccourci clavier à droite et anneau de focus violet.
- **Filtres et tri.** Sélecteurs natifs avec libellé explicite : session, module, compétence et ordre d'affichage.
- **Prompt.** Ligne verticale bordée, contenu décisionnel à gauche, actions à droite. Sur mobile, les actions occupent toute la largeur.
- **Copie.** Bouton violet doux qui passe brièvement à un état de succès vert et déclenche une annonce accessible.
- **Déploiement du prompt.** Ouverture en ligne, jamais en fenêtre modale. Le chevron pivote ; le contenu apparaît sans animation de mise en page.

**The Complete State Rule.** Chaque contrôle possède un état normal, survolé, focalisé, actif et désactivé lorsque ce dernier s'applique.

## Do's and Don'ts

### Do:

- **Do** montrer d'abord le nom, l'usage et la session, puis révéler le prompt complet.
- **Do** conserver les contrôles dans un ordre stable : recherche, session, module, compétence, tri.
- **Do** utiliser des libellés français explicites et une confirmation après copie.
- **Do** respecter les zones tactiles et le focus visible sur tous les contrôles.

### Don't:

- **Don't** reproduire les « interfaces d'administration datées » citées dans PRODUCT.md.
- **Don't** créer des « pages surchargées » ou ouvrir toutes les longues cartes par défaut.
- **Don't** utiliser des effets visuels gratuits, du verre décoratif ou du texte en dégradé.
- **Don't** remplacer les sélecteurs et boutons familiers par des affordances expérimentales.
- **Don't** utiliser une fenêtre modale pour consulter un prompt.