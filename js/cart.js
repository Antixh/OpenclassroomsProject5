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
        if (myLocalStorage === null){
            panierVide();
        } else {
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
        }
    });
}

// Gestion du message d'erreur du formulaire avec les regex
const checkField = (regex, field, error) => {
    if (regex.test(field)) {
        error.innerHTML = "";
    } else {
        error.innerHTML = "Données non conforme";
    }
}

// Fonction d'envoi de la requête POST à l'API
function order(contact) {
    let products = [];
    for (let i = 0; i < myLocalStorage.length; i++) {
        const productId = myLocalStorage[i].id;
        products.push(productId);
    }

    fetch("http://localhost:3000/api/products/order", {
        method: "POST",
        body: JSON.stringify({contact, products}),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async(response) => {
        try {
            const reponseServeur = await response.json();
            const orderId = reponseServeur.orderId;
            document.location.href = `confirmation.html?id=${orderId}`;
        } catch(e) {
            console.log(e);
        }
    })
}

// Affichage total canapés
function totalCanapesPanier() {
    if (myLocalStorage !== null){
        function recupQuantite(myLocalStorage) {
            return myLocalStorage.quantite;
        }
        const recupValeurQuantite = myLocalStorage.map(recupQuantite);
        const totalCanapes = recupValeurQuantite.reduce((a, b) => a + b, 0);
        const totalQuantite = document.getElementById("totalQuantity");
        totalQuantite.innerHTML = totalCanapes;
    }
}

// Affichage prix total
function prixTotal() {
    if (myLocalStorage !== null) {
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
async function pagePanier() {
    await constructionDOM();
    totalCanapesPanier();
    prixTotal();
}

pagePanier();

/*
    Gestion du formulaire de confirmation de commande
*/

// écouteur sur le bouton de commande
const boutonSubmit = document.getElementById("order");
boutonSubmit.addEventListener("click", (event) => {
    event.preventDefault();
    // On récupère toutes les valeurs du formulaire
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const email = document.getElementById("email").value;
    
    // Regex pour les différents champs
    const regexField =  /^[A-Za-z]+[a-zA-Zéèëïü-]+[a-zA-Zéèëïü]$/m; 
    const regexaddresse = /^[\w]+[A-Za-z -éèëêîçô']+[a-zéèëêîçô]$/m;
    const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/m;
    
    // On récupère les champs pour les erreurs de saisie après regex
    const firstNameErrorMsg = document.getElementById("firstNameErrorMsg");
    const lastNameErrorMsg = document.getElementById("lastNameErrorMsg");
    const addressErrorMsg = document.getElementById("addressErrorMsg");
    const cityErrorMsg = document.getElementById("cityErrorMsg");
    const emailErrorMsg = document.getElementById("emailErrorMsg");

    // Test des valeurs avec regex, on met un message d'erreur si le test n'est pas concluant
    checkField(regexField, firstName, firstNameErrorMsg);
    checkField(regexField, lastName, lastNameErrorMsg);
    checkField(regexaddresse, address, addressErrorMsg);
    checkField(regexField, city, cityErrorMsg);
    checkField(regexEmail, email, emailErrorMsg);
    
    // Création de l'objet contact
    let userContact = {
        firstName,
        lastName,
        address,
        city,
        email,
    };
    
    // Si l'objet contact est rempli alors on peut l'utiliser
    (firstName && lastName  && address  && city  && email && myLocalStorage) ? order(userContact): alert("Il vous faut choisir au moins un produit");
    
})
