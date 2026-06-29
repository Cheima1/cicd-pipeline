# Runbook — Sonar-scanner non reconnu

## Sujet
La commande `sonar-scanner` n'est pas reconnue lors de l'analyse SonarQube dans la pipeline CI/CD.

## Problème CI/CD traité
L'étape d'analyse SonarQube échoue car la commande `sonar-scanner` est introuvable dans le PATH, bloquant toute la pipeline.

## Symptômes
- Message d'erreur : `'sonar-scanner' n'est pas reconnu comme nom d'applet de commande`
- L'étape "Analyse SonarQube" échoue dans Jenkins
- Toutes les étapes suivantes sont skippées automatiquement

## Qui doit l'utiliser ?
Développeur ou DevOps en charge de la pipeline CI/CD.

## Quand l'appliquer ?
Tout de suite, dès que l'erreur apparaît dans les logs Jenkins.

## Quand ne pas l'appliquer ?
- Si l'erreur vient du token SonarQube (`You're not authorized`) → problème de credentials
- Si le build échoue pour une autre raison (tests, Docker...)

## Étapes à suivre

### 1. Vérifier que sonar-scanner est installé
```bash
sonar-scanner --version
```

### 2. Si non installé, l'installer
```bash
npm install -g sonarqube-scanner
```

### 3. Trouver le chemin exact
```bash
# Windows
where.exe sonar-scanner

# Linux/Mac
which sonar-scanner
```

### 4. Mettre à jour le Jenkinsfile
Sur **Windows**, utiliser le chemin complet :
```groovy
bat '"C:\\Users\\user\\AppData\\Roaming\\npm\\sonar-scanner.cmd" "-Dsonar.host.url=..." "-Dsonar.token=..."'
```

Sur **Linux (Docker)**, ajouter le paramètre Node.js :
```groovy
sh "sonar-scanner -Dsonar.host.url=... -Dsonar.token=... -Dsonar.nodejs.executable=\$(which node)"
```

### 5. Relancer le build Jenkins
Cliquer sur **"Lancer un build"** dans Jenkins.

## Résultat attendu
L'étape "Analyse SonarQube" passe avec succès et le rapport apparaît sur le dashboard SonarQube.