
const stakeBtn = document.getElementById("stakeBtn");
const recoverBtn = document.getElementById("recoverBtn"); 
const resultBtn = document.getElementById("resultBtn"); 
const etape1 = document.getElementById("et1");
const etape2 = document.getElementById("et2");


stakeBtn.addEventListener("click", () => { 
    etape1.style.display = "none";
    etape2.style.display = "flex";

});


