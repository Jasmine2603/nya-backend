const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const usersFile = path.join(__dirname, "data", "users.json");

// Vérifier que le fichier users.json existe
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "API NAYA fonctionne !"
  });
});

// INSCRIPTION
app.post("/api/register", (req, res) => {
  const { nom, email, password } = req.body;

  if (!nom || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Tous les champs sont obligatoires."
    });
  }

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  // Vérifier si l'email existe déjà
  const existingUser = users.find(
    user => user.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Cet email est déjà utilisé."
    });
  }

  const newUser = {
    id: users.length + 1,
    nom: nom,
    email: email,
    password: password
  };

  users.push(newUser);

  fs.writeFileSync(
    usersFile,
    JSON.stringify(users, null, 2)
  );

  res.status(201).json({
    success: true,
    message: "Compte créé avec succès.",
    user: {
      id: newUser.id,
      nom: newUser.nom,
      email: newUser.email
    }
  });
});
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "L'email et le mot de passe sont obligatoires."
    });
  }

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  const user = users.find(
    user =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email ou mot de passe incorrect."
    });
  }

  res.json({
    success: true,
    message: "Connexion réussie.",
    user: {
      id: user.id,
      nom: user.nom,
      email: user.email
    }
  });
});
// ==========================================
// TRAJETS
// ==========================================

app.get("/api/trajets", (req, res) => {
  try {
    const trajets = [
      {
        id: 1,
        user_id: 1,

        depart: "Abidjan",
        destination: "Yamoussoukro",

        distance_km: 248,
        duree_minutes: 180,

        date_depart: "2026-10-10",
        heure_depart: "07:00",
        heure_arrivee: "10:00",

        prix: 5000,
        places: 3,
        statut: "Disponible",

        nom: "Jimo",
        prenom: "Yasmine"
      },
      {
        id: 2,
        user_id: 1,

        depart: "Abidjan",
        destination: "Bouaké",

        distance_km: 360,
        duree_minutes: 270,

        date_depart: "2026-10-11",
        heure_depart: "06:30",
        heure_arrivee: "11:00",

        prix: 7000,
        places: 2,
        statut: "Disponible",

        nom: "Jimo",
        prenom: "Yasmine"
      },
      {
        id: 3,
        user_id: 1,

        depart: "Yamoussoukro",
        destination: "Abidjan",

        distance_km: 248,
        duree_minutes: 180,

        date_depart: "2026-10-12",
        heure_depart: "14:00",
        heure_arrivee: "17:00",

        prix: 5000,
        places: 3,
        statut: "Disponible",

        nom: "Jimo",
        prenom: "Yasmine"
      }
    ];

    const depart = req.query.depart
      ? req.query.depart.trim().toLowerCase()
      : "";

    const destination = req.query.destination
      ? req.query.destination.trim().toLowerCase()
      : "";

    const date = req.query.date
      ? req.query.date.trim()
      : "";

    const places = req.query.places
      ? parseInt(req.query.places)
      : 1;

    let resultats = trajets.filter((trajet) => {

      if (
        depart &&
        !trajet.depart.toLowerCase().includes(depart)
      ) {
        return false;
      }

      if (
        destination &&
        !trajet.destination.toLowerCase().includes(destination)
      ) {
        return false;
      }

      if (
        date &&
        trajet.date_depart !== date
      ) {
        return false;
      }

      if (
        places > 0 &&
        trajet.places < places
      ) {
        return false;
      }

      return trajet.statut === "Disponible";
    });

    resultats.sort((a, b) => {
      return (
        a.date_depart + a.heure_depart
      ).localeCompare(
        b.date_depart + b.heure_depart
      );
    });

    res.json({
      success: true,
      trajets: resultats
    });

  } catch (error) {

    console.error("Erreur trajets :", error);

    res.status(500).json({
      success: false,
      message: "Impossible de récupérer les trajets."
    });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur NAYA lancé sur http://localhost:${PORT}`);
});