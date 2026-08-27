// ==========================================
// ONISM THRIFTING
// HOMEPAGE PRODUCT SYSTEM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const newDropGrid =
        document.querySelector("#new-drop-grid");


    // Stop if we're not on the homepage

    if (!newDropGrid) {
        return;
    }


    // Make sure products.js loaded

    if (!Array.isArray(products)) {

        console.error(
            "Onism Thrifting: products.js could not be loaded."
        );

        return;

    }


    // ==========================================
    // GET NEW DROP PRODUCTS
    // ==========================================

    const newDropProducts =
        products.filter((product) => {

            return (
                product.available === true &&
                product.newDrop === true
            );

        });


    // ==========================================
    // LIMIT HOMEPAGE DISPLAY
    // ==========================================

    const featuredProducts =
        newDropProducts.slice(0, 4);


    // ==========================================
    // CREATE PRODUCT CARD
    // ==========================================

    function createProductCard(product) {

        const article =
            document.createElement("article");

        article.className =
            "product-card";


        article.innerHTML = `

            <a
                href="product.html?id=${encodeURIComponent(product.id)}"
                class="product-image-wrapper"
            >

                ${
                    product.badge
                        ? `
                            <span class="product-badge">
                                ${product.badge}
                            </span>
                          `
                        : ""
                }


                <img
                    src="${product.images[0]}"
                    alt="${product.name}"
                    class="product-image"
                    loading="lazy"
                >

            </a>


            <div class="product-info">

                <div>

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        Size ${product.size} · ${product.condition}
                    </p>

                </div>


                <strong>
                    R${product.price}
                </strong>

            </div>

        `;


        return article;

    }


    // ==========================================
    // RENDER
    // ==========================================

    newDropGrid.innerHTML = "";


    featuredProducts.forEach((product) => {

        const card =
            createProductCard(product);

        newDropGrid.appendChild(card);

    });


    // ==========================================
    // EMPTY STATE
    // ==========================================

    if (featuredProducts.length === 0) {

        newDropGrid.innerHTML = `
            <p class="new-drop-empty">
                The next drop is on its way.
            </p>
        `;

        return;

    }

});