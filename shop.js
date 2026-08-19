// ==========================================
// ONISM THRIFTING - SHOP
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const productGrid =
        document.querySelector("#product-grid");

    const products =
        Array.from(
            document.querySelectorAll(".shop-product-card")
        );

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


    if (!productGrid || !products.length) {
        return;
    }


    let currentCategory = "all";


    // ==========================================
    // FILTER + SORT
    // ==========================================

    function updateProducts() {

        let visibleProducts =
            products.filter((product) => {

                if (currentCategory === "all") {
                    return true;
                }

                const categories =
                    product.dataset.category
                        .toLowerCase()
                        .split(" ");

                if (currentCategory === "under-200") {

                    return Number(
                        product.dataset.price
                    ) <= 200;

                }

                return categories.includes(
                    currentCategory
                );

            });


        // Sort products

        const sortValue =
            sortSelect.value;


        visibleProducts.sort((a, b) => {

            const priceA =
                Number(a.dataset.price);

            const priceB =
                Number(b.dataset.price);

            const indexA =
                Number(a.dataset.index);

            const indexB =
                Number(b.dataset.index);


            if (sortValue === "price-low") {
                return priceA - priceB;
            }


            if (sortValue === "price-high") {
                return priceB - priceA;
            }


            // Newest
            return indexA - indexB;

        });


        // Hide everything

        products.forEach((product) => {
            product.style.display = "none";
        });


        // Display matching products

        visibleProducts.forEach((product) => {
            product.style.display = "block";
            productGrid.appendChild(product);
        });


        // Update count

        productCount.textContent =
            visibleProducts.length;


        // Empty state

        if (visibleProducts.length === 0) {

            emptyState.hidden = false;

        } else {

            emptyState.hidden = true;

        }

    }


    // ==========================================
    // CATEGORY BUTTONS
    // ==========================================

    categoryTabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            categoryTabs.forEach((item) => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            currentCategory =
                tab.dataset.category;

            updateProducts();

        });

    });


    // ==========================================
    // SORT
    // ==========================================

    sortSelect.addEventListener(
        "change",
        updateProducts
    );


    // ==========================================
    // RESET
    // ==========================================

    resetButton.addEventListener("click", () => {

        currentCategory = "all";

        categoryTabs.forEach((tab) => {

            tab.classList.toggle(
                "active",
                tab.dataset.category === "all"
            );

        });

        sortSelect.value = "newest";

        updateProducts();

    });


    // ==========================================
    // WISHLIST
    // ==========================================

    const wishlistButtons =
        document.querySelectorAll(".shop-wishlist");


    wishlistButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            event.stopPropagation();

            button.classList.toggle("active");

            button.textContent =
                button.classList.contains("active")
                    ? "♥"
                    : "♡";

        });

    });


    // ==========================================
    // URL CATEGORY
    // Example:
    // shop.html?category=under-200
    // ==========================================

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

            categoryTabs.forEach((tab) => {
                tab.classList.remove("active");
            });

            matchingTab.classList.add("active");

            currentCategory =
                urlCategory;

        }

    }


    // Initial render

    updateProducts();

});