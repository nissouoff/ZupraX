
  window.addEventListener("DOMContentLoaded", () => {
    // Vérifie si on est dans Telegram
    if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
      const user = Telegram.WebApp.initDataUnsafe.user;

      if (user) {
        // Exemple : afficher dans un élément avec id="alp"
        const infoHTML = `
          👤 <strong>${user.first_name}</strong><br>
          🆔 <strong>${user.id}</strong><br>
          🧑‍💼 <strong>@${user.username || 'no username'}</strong><br>
          🌐 Langue : <strong>${user.language_code}</strong>
        `;

        document.getElementById('alp').innerHTML = infoHTML;
      } else {
        document.getElementById('alp').innerText = "Utilisateur non détecté.";
      }
    } else {
      document.getElementById('alp').innerText = "Non lancé depuis Telegram.";
    }
    
  });

  