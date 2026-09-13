// ==========================================
// ONISM THRIFTING
// CHECKOUT
// ==========================================


document.addEventListener(
    "DOMContentLoaded",
    () => {


        const checkoutItems =
            document.querySelector(
                "#checkout-items"
            );


        if (!checkoutItems) {
            return;
        }


        const checkoutContent =
            document.querySelector(
                "#checkout-content"
            );


        const checkoutEmpty =
            document.querySelector(
                "#checkout-empty"
            );


        const subtotalElement =
            document.querySelector(
                "#checkout-subtotal"
            );


        const shippingElement =
            document.querySelector(
                "#checkout-shipping"
            );


        const totalElement =
            document.querySelector(
                "#checkout-total"
            );


        const shippingMessage =
            document.querySelector(
                "#checkout-shipping-message"
            );


        const checkoutForm =
            document.querySelector(
                "#checkout-form"
            );


        // ======================================
        // GET CART
        // ======================================

        const cart =
            getCart();


        const cartProducts =
            cart
                .map(
                    cartItem => {

                        return products.find(
                            product =>
                                product.id ===
                                cartItem.id
                        );

                    }
                )
                .filter(
                    product =>
                        product &&
                        product.available
                );


        // ======================================
        // EMPTY CART
        // ======================================

        if (
            cartProducts.length === 0
        ) {

            checkoutContent.hidden =
                true;


            checkoutEmpty.hidden =
                false;


            return;

        }


        checkoutContent.hidden =
            false;


        checkoutEmpty.hidden =
            true;


        // ======================================
        // DISPLAY PRODUCTS
        // ======================================

        checkoutItems.innerHTML =
            "";


        cartProducts.forEach(
            product => {


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "checkout-item";


                item.innerHTML = `

                    <img
                        src="${product.images[0]}"
                        alt="${product.name}"
                        class="checkout-item-image"
                    >


                    <div class="checkout-item-info">

                        <strong>
                            ${product.name}
                        </strong>

                        <span>
                            Size ${product.size}
                        </span>

                    </div>


                    <strong class="checkout-item-price">
                        R${product.price}
                    </strong>

                `;


                checkoutItems.appendChild(
                    item
                );

            }
        );


        // ======================================
        // CALCULATE SUBTOTAL
        // ======================================

        const subtotal =
            cartProducts.reduce(
                (total, product) => {

                    return total +
                        Number(
                            product.price
                        );

                },
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

        subtotalElement.textContent =
            `R${subtotal}`;


        shippingElement.textContent =
            shipping === 0
                ? "FREE"
                : `R${shipping}`;


        totalElement.textContent =
            `R${total}`;


        // ======================================
        // SHIPPING MESSAGE
        // ======================================

        if (
            subtotal >=
            FREE_SHIPPING_THRESHOLD
        ) {

            shippingMessage.textContent =
                "✓ You've unlocked FREE shipping.";

        } else {

            const remaining =
                FREE_SHIPPING_THRESHOLD -
                subtotal;


            shippingMessage.textContent =
                `Add R${remaining} more to unlock FREE shipping.`;

        }


        // ======================================
        // CHECKOUT FORM
        // ======================================

        checkoutForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // ======================================
        // DISABLE PAYMENT BUTTON
        // ======================================

        const payButton =
            document.querySelector(
                "#pay-button"
            );


        if (payButton) {

            payButton.disabled =
                true;

            payButton.textContent =
                "Preparing Payment...";

        }


        try {

            // ======================================
            // CUSTOMER DETAILS
            // ======================================

            const formData =
                new FormData(
                    checkoutForm
                );


            const customerDetails =
                Object.fromEntries(
                    formData.entries()
                );


            // ======================================
            // SEND ORDER TO SERVER
            // ======================================

            console.log(
                "Sending product IDs:",
                cartProducts.map(
                product => product.id
                )
            );

            const response =
                await fetch(
                    "/api/create-payment",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                customer:
                                    customerDetails,

                                productsIds:
                                    cartProducts.map(
                                        product => 
                                            product.id
                                    )

                            })

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Unable to prepare payment."
                );

            }


            // ======================================
            // CREATE PAYFAST FORM
            // ======================================

            const payFastForm =
                document.createElement(
                    "form"
                );


            payFastForm.method =
                "POST";


            payFastForm.action =
                result.paymentUrl;


            Object.entries(
                result.paymentData
            )
                .forEach(
                    ([name, value]) => {

                        const input =
                            document.createElement(
                                "input"
                            );


                        input.type =
                            "hidden";

                        input.name =
                            name;

                        input.value =
                            value;


                        payFastForm.appendChild(
                            input
                        );

                    }
                );


            document.body.appendChild(
                payFastForm
            );


            // ======================================
            // REDIRECT TO PAYFAST
            // ======================================

            payFastForm.submit();


        } catch (error) {

            console.error(
                "Checkout payment error:",
                error
            );


            alert(
                error.message ||
                "We couldn't start the payment. Please try again."
            );


            if (payButton) {

                payButton.disabled =
                    false;

                payButton.textContent =
                    "Continue to Payment";

            }

        }

    }
);

    }
);