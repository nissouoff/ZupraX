// frontend.js

window.addEventListener("DOMContentLoaded", () => {
  const joinBtn = document.getElementById("join");
  const alp = document.getElementById("alp");

  if (!window.Telegram || !Telegram.WebApp || !Telegram.WebApp.initDataUnsafe) {
    alp.innerText = "Not running in Telegram.";
    return;
  }

  const user = Telegram.WebApp.initDataUnsafe.user;

  if (!user) {
    alp.innerText = "No Telegram user detected.";
    return;
  }

  // Masquer infos à l'écran
  alp.innerText = "Connexion en cours...";

  // Envoie des données après clic
  joinBtn.addEventListener("click", async () => {
    const userInfo = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name || null,
      username: user.username || null,
      language: user.language_code || null,
      birthDate: null,
      joinedAt: new Date().toISOString()
    };

    try {
      const res = await fetch("https://4b07-105-110-45-201.ngrok-free.app/api/telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo)
      });

      const data = await res.json();

      if (data.success) {
        alp.innerText = `Bienvenue, ${user.first_name}!`;
        // Tu peux ici rediriger vers viv.html ou autre
        // window.location.href = "/viv.html";
      } else {
        alp.innerText = "Erreur de connexion. Réessaie.";
      }
    } catch (err) {
      console.error("Erreur front:", err);
      alp.innerText = "Erreur serveur. Réessaie plus tard.";
    }
  });
});
