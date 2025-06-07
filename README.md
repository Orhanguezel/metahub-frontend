# 🧠 MindPick - Interaktives Quizspiel

**MindPick** ist ein modernes Multiple-Choice-Quizspiel, bei dem Benutzer Fragen beantworten, Punkte sammeln und ihre Leistung mit anderen vergleichen können. Das Projekt wurde mit einer sauberen **MERN-Architektur (MongoDB, Express, React, Node.js)** entwickelt und ist vollständig responsive.

---

## 📁 Projektstruktur

### 🔧 Backend – `./backend`

- Node.js + Express + MongoDB
- RESTful API mit Mongoose Models
- Daten-Seeding: Benutzer, Fragen, Antworten
- Routenstruktur:
  ```
  backend/
  ├── controllers/
  │   ├── userController.js
  │   ├── questionController.js
  │   └── answerController.js
  ├── models/
  │   ├── User.js
  │   ├── Question.js
  │   └── Answer.js
  ├── router/
  │   ├── userRoutes.js
  │   ├── questionRoutes.js
  │   ├── answerRoutes.js
  │   └── index.js
  ├── utils/
  │   └── connect.js
  ├── seederUser.js
  ├── seederQuestion.js
  ├── seederAnswer.js
  └── server.js
  ```

---

### 💻 Frontend – `./frontend`

- React + Vite + React Router
- Modular aufgebaut mit `pages`, `components`, `styles`, `services`, `utils`
- Zustandverwaltung mit `useState`, `useEffect`

```
frontend/src/
├── assets/
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Button.jsx
│   └── QuestionCard.jsx
├── layout/
│   └── Layout.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Results.jsx
│   └── Answer.jsx
├── services/
│   ├── userService.js
│   ├── questionService.js
│   └── answerService.js
├── styles/
│   ├── AuthForm.css
│   ├── Home.css
│   ├── Results.css
│   └── QuestionCard.css
├── utils/
│   └── localStorage.js
├── App.jsx
└── main.jsx
```

---

## 🚀 Features

✅ Benutzerregistrierung & Login  
✅ Dynamische Frageauswahl  
✅ Punkteberechnung pro Antwort  
✅ Leaderboard & Auswertung  
✅ Antwort-Historie pro Benutzer  
✅ Sauberes Layout & Responsiveness  
✅ Lokaler Auth (localStorage)  
✅ Seeding-Skripte für Dummy-Daten  
✅ Modularer Code & File Separation  

---

## 🔗 API-Endpunkte (Base URL: `http://localhost:5011/api`)

### 👤 Benutzer (`/api/users`)
| Methode | Endpoint                | Beschreibung                        |
|--------|--------------------------|-------------------------------------|
| POST   | `/users/register`        | Benutzer registrieren               |
| POST   | `/users/login`           | Benutzer einloggen                  |
| GET    | `/users`                 | Alle Benutzer inkl. Punkte          |
| GET    | `/users/:userId/score`   | Punktestand eines Benutzers         |

### ❓ Fragen (`/api/questions`)
| Methode | Endpoint             | Beschreibung                       |
|---------|----------------------|------------------------------------|
| GET     | `/questions`         | Alle Fragen anzeigen                |
| GET     | `/questions/random`  | Eine zufällige Frage abrufen        |

### ✅ Antworten (`/api/answers`)
| Methode | Endpoint                   | Beschreibung                              |
|---------|----------------------------|-------------------------------------------|
| POST    | `/answers`                 | Antwort speichern & Punkte berechnen     |
| GET     | `/answers/:userId`         | Alle Antworten eines Benutzers            |

---

## 🖼️ Beispielablauf im Frontend

1. Startseite → Willkommen, Login/Register  
2. Nach Login → Button "Quiz starten"  
3. `/questions` → Frage für Frage beantworten  
4. Nach 10 Fragen → Weiterleitung zu `/results`  
   - Punktestand + Bestenliste  
   - Link zur Detailseite `/answers`

---

## 🧪 Testdaten (Seeding)

Du kannst das Backend initial mit Dummy-Daten füllen:

```bash
# Benutzer:
node backend/seederUser.js

# Fragen:
node backend/seederQuestion.js

# Antworten (zufällig):
node backend/seederAnswer.js
```

---

## 📦 Installation & Start

### 1️⃣ Backend starten
```bash
cd backend
npm install
npm run dev
```

### 2️⃣ Frontend starten
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Hinweise zur Authentifizierung

- Aktuell basiert das Login auf localStorage ohne Token
- Für eine produktive App wird JWT dringend empfohlen

---

## ✨ Geplante Erweiterungen

- JWT & geschützte Routen  
- Admin-Panel für Fragenverwaltung  
- Zeitbasierte Punkte (Speed-Bonus)  
- Frage-Schwierigkeitsgrade  
- Dark Mode / Mehrsprachigkeit  



## 👨‍💼 Projektleitung & Umsetzung

| Name    | Rolle             |
|---------|-------------------|
| Orhan   | Fullstack Dev, PM |
| Bassam  | Backend Dev       |
| Dennis  | Frontend Dev      |
| Radoslava | UI/UX & Frontend |

---

## © 2025 – MindPick Game Team
