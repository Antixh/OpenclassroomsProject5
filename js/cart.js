// Récupération du localStorage
const myLocalStorage = JSON.parse(window.localStorage.getItem("panier"));

// Appel à l'API
async function produitsAPI() {
    const reponse = await fetch("http://localhost:3000/api/products");
    if (reponse.ok === true) {
        return reponse.json();
    }
    throw new Error("Erreur de connexion au serveur de l'API");
}

/*
    Affichage des différents canapés du localStorage
    Écouteurs d'événements pour la modification et la suppression d'un canapé
*/
async function constructionDOM() {
    return produitsAPI()
    .then(listeCanapes => {
        const listeArticles = document.getElementById("cart__items");
        // On crée une boucle pour parcourir le localStorage et afficher chacun des items
        for (let i = 0; i < myLocalStorage.length; i++) {
            const refIndex = listeCanapes.findIndex(item => item._id === myLocalStorage[i].id);
            const refCanape = listeCanapes[refIndex];
            const canapeStorage = myLocalStorage[i];
            let monCanapPrix = refCanape.price * canapeStorage.quantite;
            listeArticles.insertAdjacentHTML('afterbegin', `
                <article class="cart__item" data-id="${canapeStorage.id}" data-color="${canapeStorage.couleur}">
                    <div class="cart__item__img">
                        <img src="${refCanape.imageUrl}" alt="Photographie d'un canapé">
                    </div>
                    <div class="cart__item__content">
                        <div class="cart__item__content__description">
                            <h2>${refCanape.name}</h2>
                            <p>${canapeStorage.couleur}</p>
                            <p class="prix_article">${monCanapPrix}€</p>
                        </div>
                        <div class="cart__item__content__settings">
                            <div class="cart__item__content__settings__quantity">
                                <p>Qté : </p>
                                <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${canapeStorage.quantite}">
                            </div>
                            <div class="cart__item__content__settings__delete">
                                <p class="deleteItem">Supprimer</p>
                            </div>
                        </div>
                    </div>
                </article>
            `);

            // Catch de la modification de quantité
            const modifQuantite = document.querySelector(`article[data-id="${canapeStorage.id}"] .itemQuantity`);
            modifQuantite.addEventListener("change", () => {
                const nouvelleQuantite = Number(modifQuantite.value);
                const filtreCanape = myLocalStorage.findIndex(obj => canapeStorage.id === obj.id && canapeStorage.couleur === obj.couleur);
                myLocalStorage[filtreCanape].quantite = nouvelleQuantite;
                monCanapPrix = nouvelleQuantite * refCanape.price;
                const nouveauPanier = JSON.stringify(myLocalStorage);
                window.localStorage.setItem("panier", nouveauPanier);
                const prixArticle = document.querySelector(`article[data-id="${canapeStorage.id}"]  .prix_article`);
                prixArticle.innerHTML = `${monCanapPrix}€`;

                totalCanapesPanier();
                prixTotal();
            });

            // Catch de la suppression d'un canapé
            const supprCanape = document.querySelector(`article[data-id="${canapeStorage.id}"] .deleteItem`);
            supprCanape.addEventListener("click", () => {
                myLocalStorage.splice(i, 1);
                const nouveauPanier = JSON.stringify(myLocalStorage);
                window.localStorage.setItem("panier", nouveauPanier);
                if(myLocalStorage.length === 0) {
                    localStorage.removeItem("panier");
                }
                listeArticles.innerHTML = "";
                // On attend que le DOM soit reconstruit pour réafficher le total ou panier vide
                async function attenteDOM() {
                    await constructionDOM();
                    totalCanapesPanier();
                    prixTotal();
                }
                attenteDOM();
            })
        }
    });
}

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

// Affichage prix total
function prixTotal() {
    const getPrix = document.getElementsByClassName("prix_article");
    let tableauPrix = [];
    if (getPrix.length !== 0) {
        for (let i = 0; i < getPrix.length; i++) {
            let valeur = getPrix[i].outerText;
            let recuperationPrix = Number(valeur.substring(0, valeur.length - 1));
            tableauPrix.push(recuperationPrix);
        }
        let sommePrix = tableauPrix.reduce((a, b) => a + b, 0);
        const prixTotalHTML = document.getElementById("totalPrice");
        prixTotalHTML.innerHTML = sommePrix;
    } else if(getPrix.length === 0) {
        const prixTotalHTML = document.getElementById("totalPrice");
        prixTotalHTML.innerHTML = 0;
        panierVide();
    }
}

// Gestion du panier vide
function panierVide() {
    const listeArticles = document.getElementById("cart__items");
        listeArticles.insertAdjacentHTML('afterbegin',
        `<p>Votre panier est vide, vous pouvez trouver l'ensemble de nos produits en suivant ce <a href="./index.html">lien</a>.</p>`);
        const infoPanier = document.querySelectorAll(".cart__price");
        for(const el of infoPanier) {
            el.parentNode.removeChild(el);
        }
}

/*
    On attend que l'appel d'API soit terminé pour construire la page et afficher les valeurs 
    Quantité totale de canapé(s)
    Prix total du panier
    Si le panier est vide on met un lien vers la page d'accueil
*/
function pagePanier() {
    constructionDOM()
    .then(() => {
        totalCanapesPanier();
        prixTotal();
    })
    .catch(error => {
        panierVide();
    });
}

pagePanier();