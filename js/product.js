// Récupération de l'id du produit depuis l'url de la page
const adresse = window.location.href;
const url = new URL(adresse);
const produitID = url.searchParams.get("id");

// Appel à l'API
async function canapeAPI() {
    const reponse = await fetch(`http://localhost:3000/api/products/${ produitID }`);
    if (reponse.ok === true) {
        return reponse.json();
    }
    throw new Error("Erreur de connexion au serveur de l'API");
}

// Affichage des données du canapé
canapeAPI().then( canape => {
    const imgCanape = document.getElementsByClassName("item__img");
    imgCanape[0].innerHTML = `<img src="${canape.imageUrl}" alt="${canape.altTxt}">`;

    const titreCanape = document.getElementById("title");
    titreCanape.innerHTML = canape.name;

    const prixCanape = document.getElementById("price");
    prixCanape.innerHTML = canape.price;

    const descriptionCanape = document.getElementById("description");
    descriptionCanape.innerHTML = canape.description;

    const couleurCanape = document.getElementById("colors");
    for(const color of canape.colors) {
        couleurCanape.innerHTML += `<option value="${ color }">${ color }</option>`;
    }
});


// GESTION DU PANIER
const panierCommande = [];
const ajoutPanier = document.getElementById("addToCart");

// Ajout d'un article dans le panier
ajoutPanier.addEventListener("click", function () {
    const couleurCanape = document.getElementById("colors").value;
    const quantiteCanape = document.getElementById("quantity").value;

    // Vérification des valeurs rentrées par l'utilisateur
    if(couleurCanape === "" || quantiteCanape <= 0 || quantiteCanape > 100) {
        alert(`Merci de selectionner une couleur ainsi qu'une quantité d'article comprise entre 1 et 100.`);
    } else {
        // Création de l'article à push dans le localStorage
        const article = {
            id: produitID,
            couleur: couleurCanape,
            quantite: Number(quantiteCanape)
        };

        // Vérification du panier en fonction de l'existant
        const myLocalStorage = window.localStorage.getItem("panier");
        if (myLocalStorage === null) {
            panierCommande.push(article);
            const articleAjoute = JSON.stringify(panierCommande);
            window.localStorage.setItem("panier", articleAjoute);
        } else {
            const listeCanapes = JSON.parse(myLocalStorage);
            // Vérifier si il n'y a pas déjà une référence à cet article et push en conséquence
            const filtrePanier = listeCanapes.findIndex(obj => obj.id === article.id && obj.couleur === article.couleur);
            if(filtrePanier === -1){
                listeCanapes.push(article);
            } else {
                listeCanapes[filtrePanier].quantite = listeCanapes[filtrePanier].quantite + article.quantite;
            }
            const nouveauPanier = JSON.stringify(listeCanapes);
            window.localStorage.setItem("panier", nouveauPanier);
        }

        // Ajout du texte de confirmation à la fin du formulaire
        const sectionConfirmation = document.querySelector(".item__content");
        const texteConfirmation = document.createElement("p");
        texteConfirmation.innerText = "Votre article a bien été ajouté au panier.";
        sectionConfirmation.appendChild(texteConfirmation);
    }
});