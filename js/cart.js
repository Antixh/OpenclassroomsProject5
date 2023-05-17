// Récupération du localStorage
const myLocalStorage = JSON.parse(window.localStorage.getItem("panier"));
console.log(myLocalStorage);

// Gestion des promesses
const gestionPromesse = myLocalStorage.map(reference => {
    return new Promise((resolve, reject) => {
        // Appel à l'API
        const idCanape = reference.id;
        async function canapeAPI() {
            const reponse = await fetch(`http://localhost:3000/api/products/${ idCanape }`);
            if (reponse.ok === true) {
                return reponse.json();
            }
            throw new Error("Erreur de connexion au serveur de l'API");
        }

        canapeAPI().then( canape => {
            // Affichage liste des canapés dans le panier
            let prix = canape.price * reference.quantite;
            const listeArticles = document.getElementById("cart__items");
            listeArticles.insertAdjacentHTML('afterbegin', 
            `
                <article class="cart__item" data-id="${ idCanape }" data-color="${ reference.couleur }">
                    <div class="cart__item__img">
                        <img src="${ canape.imageUrl }" alt="Photographie d'un canapé">
                    </div>
                    <div class="cart__item__content">
                        <div class="cart__item__content__description">
                            <h2>${ canape.name }</h2>
                            <p>${ reference.couleur }</p>
                            <p class="prix_article">${ prix }€</p>
                        </div>
                        <div class="cart__item__content__settings">
                            <div class="cart__item__content__settings__quantity">
                                <p>Qté : </p>
                                <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${ reference.quantite }">
                            </div>
                            <div class="cart__item__content__settings__delete">
                                <p class="deleteItem">Supprimer</p>
                            </div>
                        </div>
                    </div>
                </article>
            `);

            // Supression de canapé(s) dans le panier
            const supprimerCanape = document.querySelector(`article[data-id="${ idCanape }"] .deleteItem`);
            supprimerCanape.addEventListener("click", () => {
                console.log(`Supprimer canapé(s): ${canape.name}, id: ${canape._id}`);
            });
            
            // Modification de la quantité de canapé(s) dans le panier
            const modifQuantite = document.querySelector(`article[data-id="${ idCanape }"] .itemQuantity`);
            modifQuantite.addEventListener("change", () => {
                const nouvelleQuantite = Number(modifQuantite.value);
                const filtreCanape = myLocalStorage.findIndex(obj => reference.id === obj.id && reference.couleur === obj.couleur);
                myLocalStorage[filtreCanape].quantite = nouvelleQuantite;
                prix = nouvelleQuantite * canape.price;
                const nouveauPanier = JSON.stringify(myLocalStorage);
                window.localStorage.setItem("panier", nouveauPanier);
                const prixArticle = document.querySelector(`article[data-id="${ idCanape }"]  .prix_article`);
                prixArticle.innerHTML = `${prix}€`;
                totalCanapesPanier();
                prixTotal();
            });
        });
        console.log("Ok");
        resolve();
    })
})

// On attend que toutes les promesses soient résolues pour afficher le prix total
Promise.all(gestionPromesse)
    .then(() => {
        prixTotal();
    })
    .catch(error => {
        console.error(error);
    })

// Affichage total canapés
function totalCanapesPanier() {
    function recupQuantite(myLocalStorage) {
        return myLocalStorage.quantite;
    }
    const recupValeurQuantite = myLocalStorage.map(recupQuantite);
    const totalCanapes = recupValeurQuantite.reduce((a, b) => a + b, 0);
    const totalQuantite = document.getElementById("totalQuantity");
    totalQuantite.innerHTML = totalCanapes;
}

totalCanapesPanier();

function prixTotal() {
    const getPrix = document.getElementsByClassName("prix_article");
    let tableauPrix = [];
    console.log(getPrix);

    if (getPrix.length !== 0) {
        for (let i = 0; i < getPrix.length; i++) {
            let valeur = getPrix[i].outerText;
            let recuperationPrix = Number(valeur.substring(0, valeur.length - 1));
            tableauPrix.push(recuperationPrix);
        }
        let sommePrix = tableauPrix.reduce((a, b) => a + b, 0);
        const prixTotalHTML = document.getElementById("totalPrice");
        prixTotalHTML.innerHTML = sommePrix;
    } else {
        console.log("Panier vide");
        const listeArticles = document.getElementById("cart__items");
        listeArticles.insertAdjacentHTML('afterbegin',
        `<p>Votre panier est vide, vous pouvez trouver l'ensemble de nos produits en suivant ce <a href="./index.html">lien</a>.</p>`);
    }
}