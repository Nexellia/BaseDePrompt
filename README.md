# BaseDePrompt

Bibliothèque publique de prompts issue du fichier Excel de la formation.

## Mettre à jour la bibliothèque

1. Conserver les en-têtes de colonnes existants dans le classeur.
2. Ajouter ou compléter les colonnes `Compétences` et `Module`.
3. Remplacer `data/BibliothèquePrompt.xlsx` dans GitHub par la nouvelle version.
4. Attendre la fin de l'action **Mettre à jour la bibliothèque**.

Le site est ensuite actualisé automatiquement à l'adresse :

https://nexellia.github.io/BaseDePrompt/

## Colonnes utilisées

- `Nom` et `Prompt_Complet` sont obligatoires.
- `Session` alimente le filtre Session.
- `Module` alimente le filtre Module.
- `Compétences` alimente exclusivement le filtre Compétence.
- Les autres colonnes enrichissent la recherche et la fiche du prompt.

La première feuille du classeur est utilisée comme source. Les valeurs multiples peuvent être séparées par une puce, un point-virgule, une barre verticale ou un retour à la ligne.