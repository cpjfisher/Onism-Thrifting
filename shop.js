// ==========================================
// ONISM THRIFTING
// SHOP SYSTEM
// ==========================================


document.addEventListener("DOMContentLoaded", () => {


    // ======================================
    // ELEMENTS
    // ======================================

    const productGrid =
        document.querySelector("#product-grid");

    const categoryTabs =
        document.querySelectorAll(".category-tab");

    const sortSelect =
        document.querySelector("#sort-products");

    const productCount =
        document.querySelector("#product-count");

    const emptyState =
        document.querySelector("#shop-empty");

    const resetButton =
        document.querySelector(".reset-filters");


    // ======================================
    // SAFETY CHECK
    // ======================================

    if (!productGrid) {
        return;
    }


    if (!Array.isArray(products)) {

        console.error(
            "Onism Thrifting: products.js could not be loaded."
        );

        return;

    }


    // ======================================
    // STATE
    // ======================================

    let currentCategory = "all";


    // ======================================
    // CREATE PRODUCT CARD
    // ======================================

    function createProductCard(product) {

        const article =
            document.createElement("article");

        article.className =
            "shop-product-card";


        article.dataset.category =
            product.category;

        article.dataset.gender =
            product.gender;

        article.dataset.price =
            product.price;


        article.innerHTML = `

            <a
                href="product.html?id=${encodeURIComponent(product.id)}"
                class="shop-product-image"
            >

                ${
                    product.badge
                        ? `
                            <span class="shop-product-badge">
                                ${product.badge}
                            </span>
                          `
                        : ""
                }


                <img
                    src="${product.images[0]}"
                    alt="${product.name}"
                    loading="lazy"
                >


                <button
                    type="button"
                    class="shop-wishlist"
                    aria-label="Add ${product.name} to wishlist"
                >
                    ♡
                </button>

            </a>


            <div class="shop-product-info">

                <div>

                    <h2>
                        ${product.name}
                    </h2>

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


    // ======================================
    // FILTER PRODUCTS
    // ======================================

    function filterProducts() {

        return products.filter((product) => {


            // Don't display unavailable products

            if (!product.available) {
                return false;
            }


            // All

            if (currentCategory === "all") {
                return true;
            }


            // Under R200

            if (currentCategory === "under-200") {

                return product.price <= 200;

            }


            // Gender

            if (
                currentCategory === "men" ||
                currentCategory === "women" ||
                currentCategory === "unisex"
            ) {

                return product.gender ===
                    currentCategory;

            }


            // Clothing category

            if (
                currentCategory === "tops" ||
                currentCategory === "bottoms" ||
                currentCategory === "jackets" ||
                currentCategory === "dresses" ||
                currentCategory === "shoes"
            ) {

                return product.category ===
                    currentCategory;

            }


            return false;

        });

    }


    // ======================================
    // SORT PRODUCTS
    // ======================================

    function sortProducts(productList) {

        const sorted =
            [...productList];


        const sortValue =
            sortSelect
                ? sortSelect.value
                : "newest";


        if (sortValue === "price-low") {

            sorted.sort(
                (a, b) => a.price - b.price
            );

        }


        else if (sortValue === "price-high") {

            sorted.sort(
                (a, b) => b.price - a.price
            );

        }


        else {

            // Newest products first

            sorted.sort(
                (a, b) =>
                    Number(b.newDrop) -
                    Number(a.newDrop)
            );

        }


        return sorted;

    }


    // ======================================
    // RENDER PRODUCTS
    // ======================================

    function renderProducts() {

        const filteredProducts =
            filterProducts();


        const sortedProducts =
            sortProducts(filteredProducts);


        productGrid.innerHTML = "";


        sortedProducts.forEach((product) => {

            const card =
                createProductCard(product);


            productGrid.appendChild(card);

        });


        // Update product count

        if (productCount) {

            productCount.textContent =
                sortedProducts.length;

        }


        // Empty state

        if (
            emptyState &&
            sortedProducts.length === 0
        ) {

            emptyState.hidden = false;

        } else if (emptyState) {

            emptyState.hidden = true;

        }


        initialiseWishlists();

    }


    // ======================================
    // CATEGORY BUTTONS
    // ======================================

    categoryTabs.forEach((tab) => {

        tab.addEventListener("click", () => {


            categoryTabs.forEach((item) => {

                item.classList.remove(
                    "active"
                );

            });


            tab.classList.add(
                "active"
            );


            currentCategory =
                tab.dataset.category;


            renderProducts();

        });

    });


    // ======================================
    // SORT
    // ======================================

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            renderProducts
        );

    }


    // ======================================
    // RESET
    // ======================================

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                currentCategory =
                    "all";


                categoryTabs.forEach(
                    (tab) => {

                        tab.classList.toggle(
                            "active",
                            tab.dataset.category ===
                                "all"
                        );

                    }
                );


                if (sortSelect) {

                    sortSelect.value =
                        "newest";

                }


                renderProducts();

            }
        );

    }


    // ======================================
    // WISHLIST
    // ======================================

    function initialiseWishlists() {

        const wishlistButtons =
            document.querySelectorAll(
                ".shop-wishlist"
            );


        wishlistButtons.forEach(
            (button) => {


                button.addEventListener(
                    "click",
                    (event) => {

                        event.preventDefault();

                        event.stopPropagation();


                        button.classList.toggle(
                            "active"
                        );


                        button.textContent =
                            button.classList.contains(
                                "active"
                            )
                                ? "♥"
                                : "♡";

                    }
                );

            }
        );

    }


    // ======================================
    // URL CATEGORY
    // ======================================

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlCategory =
        params.get("category");


    if (urlCategory) {

        const matchingTab =
            document.querySelector(
                `.category-tab[data-category="${urlCategory}"]`
            );


        if (matchingTab) {


            categoryTabs.forEach(
                (tab) => {

                    tab.classList.remove(
                        "active"
                    );

                }
            );


            matchingTab.classList.add(
                "active"
            );


            currentCategory =
                urlCategory;

        }

    }


    // ======================================
    // INITIAL RENDER
    // ======================================

    renderProducts();

});