// ==========================================
// ONISM THRIFTING
// PRODUCT PAGE
// ==========================================


document.addEventListener("DOMContentLoaded", () => {


    // ======================================
    // GET PRODUCT ID
    // ======================================

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    // ======================================
    // FIND PRODUCT
    // ======================================

    const product =
        products.find(
            (item) =>
                item.id === productId
        );


    // ======================================
    // ELEMENTS
    // ======================================

    const productLayout =
        document.querySelector(
            ".product-layout"
        );


    const productName =
        document.querySelector(
            "#product-name"
        );


    const productPrice =
        document.querySelector(
            "#product-price"
        );


    const productCategory =
        document.querySelector(
            "#product-category"
        );


    const productBadge =
        document.querySelector(
            "#product-badge"
        );


    const productCondition =
        document.querySelector(
            "#product-condition"
        );


    const productSize =
        document.querySelector(
            "#product-size"
        );


    const productDescription =
        document.querySelector(
            "#product-description"
        );


    const breadcrumbName =
        document.querySelector(
            "#breadcrumb-name"
        );


    const mainImage =
        document.querySelector(
            "#main-product-image"
        );


    const thumbnails =
        document.querySelector(
            "#product-thumbnails"
        );


    const measurementChest =
        document.querySelector(
            "#measurement-chest"
        );


    const measurementLength =
        document.querySelector(
            "#measurement-length"
        );


    const measurementShoulder =
        document.querySelector(
            "#measurement-shoulder"
        );


    const measurementSleeve =
        document.querySelector(
            "#measurement-sleeve"
        );


    const wishlistButton =
        document.querySelector(
            "#wishlist-button"
        );


    const wishlistTextButton =
        document.querySelector(
            "#wishlist-text-button"
        );


    const addToCartButton =
        document.querySelector(
            "#add-to-cart"
        );


    // ======================================
    // PRODUCT NOT FOUND
    // ======================================

    if (!product) {

        document.title =
            "Product Not Found | Onism Thrifting";


        if (productLayout) {

            productLayout.innerHTML = `

                <div class="product-not-found">

                    <p>
                        PRODUCT NOT FOUND
                    </p>

                    <h1>
                        This piece is no longer available.
                    </h1>

                    <a href="shop.html">
                        Back to Shop →
                    </a>

                </div>

            `;

        }


        return;

    }


    // ======================================
    // PAGE TITLE
    // ======================================

    document.title =
        `${product.name} | Onism Thrifting`;


    // ======================================
    // PRODUCT CONTENT
    // ======================================

    productName.textContent =
        product.name;


    productPrice.textContent =
        product.price;


    productCategory.textContent =
        product.category.toUpperCase();


    productBadge.textContent =
        product.badge || "";


    productBadge.style.display =
        product.badge
            ? "block"
            : "none";


    productCondition.textContent =
        product.condition;


    productSize.textContent =
        product.size;


    productDescription.textContent =
        product.description;


    breadcrumbName.textContent =
        product.name;


    // ======================================
    // MEASUREMENTS
    // ======================================

    measurementChest.textContent =
        product.measurements?.chest ||
        "—";


    measurementLength.textContent =
        product.measurements?.length ||
        "—";


    measurementShoulder.textContent =
        product.measurements?.shoulder ||
        "—";


    measurementSleeve.textContent =
        product.measurements?.sleeve ||
        "—";


    // ======================================
    // MAIN IMAGE
    // ======================================

    function setMainImage(
        imageUrl
    ) {

        mainImage.style.opacity =
            "0";


        setTimeout(() => {

            mainImage.src =
                imageUrl;


            mainImage.alt =
                product.name;


            mainImage.style.opacity =
                "1";

        }, 120);

    }


    setMainImage(
        product.images[0]
    );


    // ======================================
    // THUMBNAILS
    // ======================================

    thumbnails.innerHTML =
        "";


    product.images.forEach(
        (imageUrl, index) => {


            const thumbnail =
                document.createElement(
                    "button"
                );


            thumbnail.type =
                "button";


            thumbnail.className =
                "product-thumbnail";


            if (index === 0) {

                thumbnail.classList.add(
                    "active"
                );

            }


            thumbnail.innerHTML = `

                <img
                    src="${imageUrl}"
                    alt="${product.name} view ${index + 1}"
                >

            `;


            thumbnail.addEventListener(
                "click",
                () => {


                    document
                        .querySelectorAll(
                            ".product-thumbnail"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    thumbnail.classList.add(
                        "active"
                    );


                    setMainImage(
                        imageUrl
                    );

                }
            );


            thumbnails.appendChild(
                thumbnail
            );

        }
    );


    // ======================================
    // WISHLIST
    // ======================================

    function toggleWishlist() {


        const active =
            wishlistButton.classList.toggle(
                "active"
            );


        wishlistTextButton.classList.toggle(
            "active",
            active
        );


        wishlistButton.textContent =
            active
                ? "♥"
                : "♡";


        wishlistTextButton.textContent =
            active
                ? "♥ Saved"
                : "♡ Save for later";

    }


    wishlistButton.addEventListener(
        "click",
        toggleWishlist
    );


    wishlistTextButton.addEventListener(
        "click",
        toggleWishlist
    );


    // ======================================
    // PURCHASE BUTTON
    // ======================================
    //
    // For now this stays as a placeholder.
    //
    // Later we'll connect this to PayFast.
    //
    // ======================================

    if (addToCartButton) {

        addToCartButton.addEventListener(
            "click",
            () => {

                console.log(
                    "Product selected:",
                    product.id
                );


                addToCartButton.innerHTML =
                    "Selected ✓";


                setTimeout(() => {

                    addToCartButton.innerHTML =
                        `Add to Cart <span>→</span>`;

                }, 1800);

            }
        );

    }

});