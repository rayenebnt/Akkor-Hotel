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
MONGODB_URI=mongodb://localhost:27017/akkor
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=http://localhost:5173
```

> MongoDB doit être démarré avant de lancer le serveur.  
> Sur WSL : `sudo mongod --dbpath /var/lib/mongodb`

---

## Démarrage
```bash
npm start
```

---

## Tests
```bash
npm test
```

---

## Documentation API

Une fois le serveur démarré : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Créer un compte admin

Après avoir créé un compte via l'interface, passer le rôle admin avec :
```bash
mongosh akkor --eval 'db.users.updateOne({email: "votre@email.com"}, {$set: {role: "admin"}})'
```

Se déconnecter et reconnecter pour que le nouveau rôle soit pris en compte.

---

## Endpoints

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

---

## CI/CD

- **PR vers main** → lance les tests automatiquement
- **Merge vers main** → Tests → Audit sécurité → Build → Deploy