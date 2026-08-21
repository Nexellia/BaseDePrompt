# BaseDePrompt

Bibliothèque publique de prompts issue du fichier Excel de la formation.

## Mettre à jour la bibliothèque

1. Conserver les en-têtes de colonnes existants dans le classeur.
2. Ajouter ou compléter la colonne `Compétence` lorsque les données sont disponibles.
3. Remplacer `data/BibliothèquePrompt.xlsx` dans GitHub par la nouvelle version.
4. Attendre la fin de l'action **Mettre à jour la bibliothèque**.

Le site est ensuite actualisé automatiquement à l'adresse :

https://nexellia.github.io/BaseDePrompt/

## Colonnes utilisées

- `Nom` et `Prompt_Complet` sont obligatoires.
- `Session` alimente le filtre Session.
- `Compétence` alimente exclusivement le filtre Compétence. Tant que cette colonne est vide, le filtre reste désactivé.
- Les autres colonnes enrichissent la recherche et la fiche du prompt.

La première feuille du classeur est utilisée comme source. Les valeurs multiples peuvent être séparées par une puce, un point-virgule, une barre verticale ou un retour à la ligne.
