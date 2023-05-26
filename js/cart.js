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
    const regexPrenom =  /^[A-Za-z]+[a-zA-Zéèëïü-]+[a-zA-Zéèëïü]$/m;
    const regexNom = /^[A-Za-z]+[a-zA-Zéèëïü-]+[a-zA-Zéèëïü]$/m;
    const regexaddresse = /^[0-9A-Za-z]+[A-Za-z -']+[a-zéèëïü]$/m;
    const regexVille = /^[A-Za-z][a-zA-Z' éèëêîçô-]+[a-z]$/m;
    const regexEmail = /^([a-zA-Z0-9_\.\+-]+)@([\da-z\.-]+)\.([a-z\.]{2,3})$/m;

    // On crée les variables pour récupérer les valeurs après test des regex
    let firstNameChecked;
    let lastNameChecked;
    let addressChecked;
    let cityChecked;
    let emailChecked;
    
    // On récupère les champs au cas où il y a une erreur de donnée lors des test avec regex
    const firstNameErrorMsg = document.getElementById("firstNameErrorMsg");
    const lastNameErrorMsg = document.getElementById("lastNameErrorMsg");
    const addressErrorMsg = document.getElementById("addressErrorMsg");
    const cityErrorMsg = document.getElementById("cityErrorMsg");
    const emailErrorMsg = document.getElementById("emailErrorMsg");

    // Test des valeurs avec regex, on met un message d'erreur si le test n'est pas concluant
    if (regexPrenom.test(firstName) === true) {
        firstNameErrorMsg.innerHTML = "";
        firstNameChecked = firstName;
    } else {
        firstNameErrorMsg.innerHTML = "Prénom non conforme";
    }

    if (regexNom.test(lastName) === true) {
        lastNameErrorMsg.innerHTML = "";
        lastNameChecked = lastName;
    } else {
        lastNameErrorMsg.innerHTML = "Nom non conforme";
    }

    if (regexaddresse.test(address) === true) {
        addressErrorMsg.innerHTML = "";
        addressChecked = address;
    } else {
        addressErrorMsg.innerHTML = "addresse non conforme";
    }

    if (regexVille.test(city) === true) {
        cityErrorMsg.innerHTML = "";
        cityChecked = city;
    } else {
        cityErrorMsg.innerHTML = "Ville non conforme";
    }

    if (regexEmail.test(email) === true) {
        emailErrorMsg.innerHTML = "";
        emailChecked = email;
    } else {
        emailErrorMsg.innerHTML = "Mail non conforme";
    }
    
    let contact = {
        firstName: firstNameChecked,
        lastName: lastNameChecked,
        address: addressChecked,
        city: cityChecked,
        email: emailChecked
    };
    
    // Si l'objet contact est rempli alors on peut l'utiliser
    if (typeof contact.firstName !== 'undefined' && 
        typeof contact.lastName !== 'undefined' && 
        typeof contact.address !== 'undefined' && 
        typeof contact.city !== 'undefined' && 
        typeof contact.email !== 'undefined') {
        
        envoiServeur();
    }

    // Fonction d'envoi de la requête POST à l'API
    function envoiServeur() {
        let products = [];
        for (let i = 0; i < myLocalStorage.length; i++) {
            const productId = myLocalStorage[i].id;
            products.push(productId);
        }

        const requetePost = fetch("http://localhost:3000/api/products/order", {
            method: "POST",
            body: JSON.stringify({contact, products}),
            headers: {
                "Content-Type": "application/json",
            },
        })

        requetePost.then(async(reponse) => {
            try {
                const reponseServeur = await reponse.json();
                const orderId = reponseServeur.orderId;
                document.location.href = `confirmation.html?id=${orderId}`;
            } catch(e) {
                console.log(e);
            }
        })
    }
})
