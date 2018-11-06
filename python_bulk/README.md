# Usage

Pour brancher la base de donnée de production en local (comme si elle était en local), on peut faire :
```
ssh -N -l root -L 27017:localhost:27017 mes-aides.gouv.fr
```

Il est recommandé d'utiliser un environnement virtuel.

Les dépendances de cette expérimentation peuvent être installées à partir du fichier `requirements.txt`.
```
pip install -r requirements.txt
```
Il est aussi nécessaire d'installer les dépendances OpenFisca de Mes Aides (depuis `mes-aides-ui/openfisca/requirements.txt`).

Le fichier `parallel.py` permet d'aggréger des situations et d'effectuer des calculs sur ces situations.
