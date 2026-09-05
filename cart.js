// ==========================================
// ONISM THRIFTING
// CART SYSTEM
// ==========================================

const CART_KEY = "onismCart";

const SHIPPING_FEE = 60;

const FREE_SHIPPING_THRESHOLD = 500;


// ==========================================
// GET CART
// ==========================================

function getCart() {

    const savedCart =
        localStorage.getItem(CART_KEY);

    return savedCart
        ? JSON.parse(savedCart)
        : [];

}


// ==========================================
// SAVE CART
// ==========================================

function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    updateCartCount();

}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(productId) {

    const cart = getCart();


    // Prevent duplicate thrift items
    const alreadyInCart =
        cart.some(
            item => item.id === productId
        );


    if (alreadyInCart) {

        alert(
            "This item is already in your cart."
        );

        return;

    }


    const product =
        products.find(
            item => item.id === productId
        );


    if (!product) {

        console.error(
            "Product could not be found."
        );

        return;

    }


    if (!product.available) {

        alert(
            "Sorry, this item is no longer available."
        );

        return;

    }


    cart.push({
        id: product.id
    });


    saveCart(cart);


    alert(
        `${product.name} added to cart.`
    );

}


// ==========================================
// REMOVE FROM CART
// ==========================================

function removeFromCart(productId) {

    const updatedCart =
        getCart().filter(
            item => item.id !== productId
        );


    saveCart(updatedCart);

}


// ==========================================
// UPDATE CART COUNTER
// ==========================================

function updateCartCount() {

    const cart = getCart();

    const cartCounts =
        document.querySelectorAll(
            ".cart-count"
        );


    cartCounts.forEach(
        count => {

            count.textContent =
                cart.length;

        }
    );

}

// ==========================================
// RENDER CART PAGE
// ==========================================

function renderCartPage() {

    const cartItemsContainer =
        document.querySelector(
            "#cart-items"
        );


    // We're not on cart.html
    if (!cartItemsContainer) {
        return;
    }


    const cartContent =
        document.querySelector(
            "#cart-content"
        );


    const emptyCart =
        document.querySelector(
            "#cart-empty"
        );


    const subtotalElement =
        document.querySelector(
            "#cart-subtotal"
        );


    const shippingElement =
        document.querySelector(
            "#cart-shipping"
        );


    const totalElement =
        document.querySelector(
            "#cart-total"
        );


    const shippingMessage =
        document.querySelector(
            "#free-shipping-message"
        );


    // ======================================
    // GET CART PRODUCTS
    // ======================================

    const cart =
        getCart();


    const cartProducts =
        cart
            .map((cartItem) => {

                return products.find(
                    product =>
                        product.id ===
                        cartItem.id
                );

            })
            .filter(
                product =>
                    product &&
                    product.available
            );


    // ======================================
    // REMOVE INVALID / SOLD PRODUCTS
    // ======================================

    if (
        cartProducts.length !==
        cart.length
    ) {

        const cleanedCart =
            cartProducts.map(
                product => ({
                    id: product.id
                })
            );


        saveCart(cleanedCart);

    }


    // ======================================
    // EMPTY CART
    // ======================================

    if (
        cartProducts.length === 0
    ) {

        if (cartContent) {
            cartContent.hidden = true;
        }


        if (emptyCart) {
            emptyCart.hidden = false;
        }


        return;

    }


    if (cartContent) {
        cartContent.hidden = false;
    }


    if (emptyCart) {
        emptyCart.hidden = true;
    }


    // ======================================
    // CREATE CART ITEMS
    // ======================================

    cartItemsContainer.innerHTML =
        "";


    cartProducts.forEach(
        (product) => {


            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "cart-item";


            article.innerHTML = `

                <a
                    href="product.html?id=${encodeURIComponent(product.id)}"
                    class="cart-item-image"
                >

                    <img
                        src="${product.images[0]}"
                        alt="${product.name}"
                    >

                </a>


                <div class="cart-item-info">

                    <h2>
                        ${product.name}
                    </h2>

                    <p>
                        Size ${product.size}
                    </p>

                    <p>
                        ${product.condition}
                    </p>


                    <button
                        type="button"
                        class="remove-cart-item"
                        data-product-id="${product.id}"
                    >
                        Remove
                    </button>

                </div>


                <strong class="cart-item-price">
                    R${product.price}
                </strong>

            `;


            cartItemsContainer.appendChild(
                article
            );

        }
    );


    // ======================================
    // REMOVE BUTTONS
    // ======================================

    const removeButtons =
        cartItemsContainer.querySelectorAll(
            ".remove-cart-item"
        );


    removeButtons.forEach(
        button => {


            button.addEventListener(
                "click",
                () => {


                    const productId =
                        button.dataset.productId;


                    removeFromCart(
                        productId
                    );


                    renderCartPage();

                }
            );

        }
    );


    // ======================================
    // SUBTOTAL
    // ======================================

    const subtotal =
        cartProducts.reduce(
            (total, product) =>
                total + Number(product.price),
            0
        );


    // ======================================
    // SHIPPING
    // ======================================

    const shipping =
        subtotal >=
        FREE_SHIPPING_THRESHOLD

            ? 0

            : SHIPPING_FEE;


    // ======================================
    // TOTAL
    // ======================================

    const total =
        subtotal + shipping;


    // ======================================
    // DISPLAY TOTALS
    // ======================================

    if (subtotalElement) {

        subtotalElement.textContent =
            `R${subtotal}`;

    }


    if (shippingElement) {

        shippingElement.textContent =
            shipping === 0
                ? "FREE"
                : `R${shipping}`;

    }


    if (totalElement) {

        totalElement.textContent =
            `R${total}`;

    }


    // ======================================
    // FREE SHIPPING MESSAGE
    // ======================================

    if (shippingMessage) {


        if (
            subtotal >=
            FREE_SHIPPING_THRESHOLD
        ) {

            shippingMessage.textContent =
                "✓ You've unlocked FREE shipping.";

        } else {

            const amountRemaining =
                FREE_SHIPPING_THRESHOLD -
                subtotal;


            shippingMessage.textContent =
                `Add R${amountRemaining} more to unlock FREE shipping.`;

        }

    }

}


// ==========================================
// CART ICON
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCartCount();

        renderCartPage();
        

        const cartButtons =
            document.querySelectorAll(
                ".cart-button"
            );


        cartButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            "cart.html";

                    }
                );

            }
        );

    }
);