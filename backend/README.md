# Akkor Hotel — Backend API

API REST Node.js/Express pour la gestion d'hôtels et de réservations.

## Stack technique
- **Runtime** : Node.js 20
- **Framework** : Express 4
- **Base de données** : MongoDB / Mongoose
- **Auth** : JWT (jsonwebtoken)
- **Validation** : Joi
- **Tests** : Jest + Supertest
- **Documentation** : Swagger / OpenAPI

---

## Installation

```bash
npm install
```

Créer un fichier `.env` à partir du modèle :

```bash
cp .env.example .env
```

Contenu du `.env` :

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/akkor-hotel
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=http://localhost:5173
```

---

## Démarrage

```bash
# Production
npm start

# Développement (avec nodemon)
npm run dev
```

---

## Tests

```bash
npm test
```

---

## Documentation API

Une fois le serveur démarré, ouvrez : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Endpoints principaux

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /users/register | Non | Créer un compte |
| POST | /users/login | Non | Se connecter |
| GET | /users/:id | User | Voir son profil |
| PUT | /users/:id | User | Modifier son profil |
| DELETE | /users/:id | User | Supprimer son compte |
| GET | /hotels | Non | Lister les hôtels |
| GET | /hotels/:id | Non | Détail d'un hôtel |
| POST | /hotels | Admin | Créer un hôtel |
| PUT | /hotels/:id | Admin | Modifier un hôtel |
| DELETE | /hotels/:id | Admin | Supprimer un hôtel |
| GET | /reservations | User | Mes réservations |
| POST | /reservations | User | Créer une réservation |
| PUT | /reservations/:id | User | Modifier une réservation |
| DELETE | /reservations/:id | User | Supprimer une réservation |
| GET | /reservations/search | Admin | Chercher par email/pseudo |
