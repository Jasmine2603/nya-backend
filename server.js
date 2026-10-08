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
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Serveur NAYA lancé sur http://localhost:${PORT}`);
});