# ReLoop MVP (prototype local)
Ce MVP fonctionne sans serveur (HTML/JS + data.json) et conserve les données en local dans le navigateur (localStorage).

## Fonctionnalités
- Besoins industriels (data.json)
- 5 points de collecte (Strasbourg) + liens Google Maps
- Validation d'un dépôt (code/QR simulé) + points
- Récompenses (catalogue fictif) + classement

## Lancer en local
1) Ouvrir le dossier.
2) Lancer un petit serveur (recommandé pour charger data.json) :
   - Sur Mac/Windows/Linux si Python est installé :
     `python -m http.server 8000`
3) Ouvrir dans un navigateur : http://localhost:8000

## QR codes
Dans `qrcodes/`, 5 QR codes (STR-01 à STR-05).
Ils pointent vers une URL modèle : https://example.com/reloop/#deposit?point=STR-0X
Quand vous hébergerez le MVP, remplacez `example.com/reloop/` par votre URL.
