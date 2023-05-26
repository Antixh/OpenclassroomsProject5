// Récupération de l'id de la commande dans l'url
let getCommande = new URL(location.href).searchParams.get("id");

// Affichage de l'id de la commande et suppression du localStorage
function confirmOrder() {
    const confirmation = document.querySelector("#orderId");
    confirmation.innerHTML = `${getCommande}`;
    localStorage.clear();
}

confirmOrder();