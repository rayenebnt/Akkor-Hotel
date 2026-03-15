# Akkor Hotel — Frontend

Interface utilisateur React pour la plateforme de réservation d'hôtels Akkor Hotel.

## Stack technique
- **Framework** : React 19 + Vite
- **Routing** : React Router v7
- **HTTP** : Axios
- **Auth** : JWT (jwt-decode)
- **Tests** : Vitest + React Testing Library

---

## Installation
```bash
npm install
```

---

## Démarrage
```bash
npm run dev
```

L'application sera disponible sur : [http://localhost:5173](http://localhost:5173)

> ⚠️ Le backend doit tourner sur `http://localhost:3000`

---

## Tests
```bash
npm run test
```

---

## Pages disponibles

| Route | Description | Auth requise |
|-------|-------------|--------------|
| `/` | Liste des hôtels | Non |
| `/hotels/:id` | Détail d'un hôtel + réservation | Non |
| `/login` | Connexion | Non |
| `/register` | Inscription | Non |
| `/reservations` | Mes réservations | Oui |
| `/profile` | Mon profil | Oui |
| `/admin` | Gestion des hôtels | Admin uniquement |

---

## Fonctionnalités

- Inscription et connexion avec JWT
- Session persistée au rechargement de la page
- Liste des hôtels avec tri et pagination
- Réservation d'un hôtel avec choix des dates
- Modification et suppression de ses réservations
- Modification et suppression de son compte
- Panel admin pour créer, modifier, supprimer des hôtels
- Interface responsive (mobile + desktop)