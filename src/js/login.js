// Frontend sécurisé – pas d’affichage public des infos
window.addEventListener("DOMContentLoaded", () => {
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
    const user = Telegram.WebApp.initDataUnsafe.user;

    document.getElementById('join').addEventListener('click', async () => {
      if (!user) return alert("User not detected in Telegram");

      // Construction de l’objet utilisateur
      const userInfo = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name || null,
        username: user.username || null,
        language: user.language_code || null,
        birthDate: user.birth_date || null, // ⚠️ Très rarement dispo
        platform: "telegram",
        joinedAt: new Date().toISOString()
      };

      // Optionnel : affichage léger
      document.getElementById("alp").innerText = "Enregistrement en cours...";

      try {
        // Ici on envoie les données vers le backend (POST /api/telegram-login par ex)
        const res = await fetch("https://ton-backend.com/api/telegram-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(userInfo)
        });

        const data = await res.json();
        if (data.success) {
          document.getElementById("alp").innerText = "✅ Connexion réussie !";
        } else {
          document.getElementById("alp").innerText = "❌ Erreur : " + data.message;
        }
      } catch (err) {
        console.error(err);
        document.getElementById("alp").innerText = "⚠️ Connexion impossible.";
      }
    });
  } else {
    document.getElementById("alp").innerText = "Non lancé depuis Telegram.";
  }
});
