// Appel à l'API
async function produitsAPI() {
    const reponse = await fetch("http://localhost:3000/api/products");
    if (reponse.ok === true) {
        return reponse.json();
    }
    throw new Error("Erreur de connexion au serveur de l'API");
}

// Affichage des produits sur la page d'accueil
produitsAPI().then(produits => {
    for(const item of produits) {
        const refCanape = item;
        const fiche = document.getElementById("items");
        fiche.innerHTML += `
        <a href="./product.html?id=${refCanape._id}">
            <article>
                <img src="${refCanape.imageUrl}" alt="${refCanape.altTxt}">
                <h3 class="productName">${refCanape.name}</h3>
                <p class="productDescription">${refCanape.description}</p>
            </article>
        </a>`
}});