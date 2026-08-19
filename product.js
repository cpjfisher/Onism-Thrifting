// ==========================================
// ONISM THRIFTING - PRODUCT PAGE
// ==========================================


// ==========================================
// PRODUCT DATA
// ==========================================

const products = {

    "vintage-denim-jacket": {

        name: "Vintage Denim Jacket",

        price: 180,

        category: "VINTAGE",

        badge: "JUST DROPPED",

        condition: "Very Good",

        size: "M",

        description:
            "A classic pre-loved denim jacket with a relaxed everyday fit. Easy to pair with jeans, cargos or your favourite basic tee.",

        measurements: {

            chest: "104 cm",
            length: "67 cm",
            shoulder: "45 cm",
            sleeve: "61 cm"

        },

        images: [

            "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90",

            "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85"

        ]

    },


    "graphic-tee": {

        name: "Oversized Graphic Tee",

        price: 120,

        category: "UNISEX",

        badge: "ONE OF ONE",

        condition: "Excellent",

        size: "L",

        description:
            "An easy oversized graphic tee with a relaxed streetwear silhouette. A versatile everyday piece.",

        measurements: {

            chest: "112 cm",
            length: "74 cm",
            shoulder: "50 cm",
            sleeve: "23 cm"

        },

        images: [

            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90",

            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",

            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85"

        ]

    }

};


// ==========================================
// GET PRODUCT FROM URL
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id") ||
    "vintage-denim-jacket";


const product =
    products[productId];


// ==========================================
// DOM ELEMENTS
// ==========================================

const productName =
    document.querySelector("#product-name");

const productPrice =
    document.querySelector("#product-price");

const productCategory =
    document.querySelector("#product-category");

const productBadge =
    document.querySelector("#product-badge");

const productCondition =
    document.querySelector("#product-condition");

const productSize =
    document.querySelector("#product-size");

const productDescription =
    document.querySelector("#product-description");

const breadcrumbName =
    document.querySelector("#breadcrumb-name");

const mainImage =
    document.querySelector("#main-product-image");

const thumbnails =
    document.querySelector("#product-thumbnails");

const measurementChest =
    document.querySelector("#measurement-chest");

const measurementLength =
    document.querySelector("#measurement-length");

const measurementShoulder =
    document.querySelector("#measurement-shoulder");

const measurementSleeve =
    document.querySelector("#measurement-sleeve");

const wishlistButton =
    document.querySelector("#wishlist-button");

const wishlistTextButton =
    document.querySelector(
        "#wishlist-text-button"
    );

const addToCartButton =
    document.querySelector("#add-to-cart");


// ==========================================
// HANDLE INVALID PRODUCT
// ==========================================

if (!product) {

    document.title =
        "Product Not Found | Onism Thrifting";

    document.querySelector(
        ".product-layout"
    ).innerHTML = `
        <div class="product-not-found">
            <p>PRODUCT NOT FOUND</p>

            <h1>
                This piece is no longer available.
            </h1>

            <a href="shop.html">
                Back to Shop →
            </a>
        </div>
    `;

} else {


    // ==========================================
    // PAGE INFORMATION
    // ==========================================

    document.title =
        `${product.name} | Onism Thrifting`;


    productName.textContent =
        product.name;

    productPrice.textContent =
        product.price;

    productCategory.textContent =
        product.category;

    productBadge.textContent =
        product.badge;

    productCondition.textContent =
        product.condition;

    productSize.textContent =
        product.size;

    productDescription.textContent =
        product.description;

    breadcrumbName.textContent =
        product.name;


    // ==========================================
    // MEASUREMENTS
    // ==========================================

    measurementChest.textContent =
        product.measurements.chest;

    measurementLength.textContent =
        product.measurements.length;

    measurementShoulder.textContent =
        product.measurements.shoulder;

    measurementSleeve.textContent =
        product.measurements.sleeve;


    // ==========================================
    // MAIN IMAGE
    // ==========================================

    function setMainImage(imageUrl) {

        mainImage.style.opacity = "0";


        setTimeout(() => {

            mainImage.src =
                imageUrl;

            mainImage.alt =
                product.name;

            mainImage.style.opacity = "1";

        }, 120);

    }


    setMainImage(
        product.images[0]
    );


    // ==========================================
    // THUMBNAILS
    // ==========================================

    thumbnails.innerHTML = "";


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
                        .forEach((item) => {

                            item.classList.remove(
                                "active"
                            );

                        });


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


    // ==========================================
    // WISHLIST
    // ==========================================

    function toggleWishlist() {

        const isActive =
            wishlistButton.classList.toggle(
                "active"
            );

        wishlistTextButton.classList.toggle(
            "active",
            isActive
        );


        wishlistButton.textContent =
            isActive
                ? "♥"
                : "♡";


        wishlistTextButton.textContent =
            isActive
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


    // ==========================================
    // ADD TO CART
    // ==========================================

    addToCartButton.addEventListener(
        "click",
        () => {

            addToCartButton.disabled =
                true;

            addToCartButton.innerHTML =
                "Added to Cart ✓";


            setTimeout(() => {

                addToCartButton.disabled =
                    false;

                addToCartButton.innerHTML =
                    `Add to Cart <span>→</span>`;

            }, 1800);

        }
    );

}