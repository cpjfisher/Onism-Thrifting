// ==========================================
// ONISM THRIFTING
// PAYMENT SUCCESS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        const title =
            document.querySelector(
                "#payment-status-title"
            );


        const message =
            document.querySelector(
                "#payment-status-message"
            );


        const loader =
            document.querySelector(
                "#payment-loader"
            );


        const orderDetails =
            document.querySelector(
                "#payment-order-details"
            );


        const orderNumber =
            document.querySelector(
                "#confirmed-order-number"
            );


        const orderTotal =
            document.querySelector(
                "#confirmed-order-total"
            );


        const checkAgainButton =
            document.querySelector(
                "#check-payment-again"
            );


        const continueShopping =
            document.querySelector(
                "#payment-continue-shopping"
            );


        const returnCheckout =
            document.querySelector(
                "#payment-return-checkout"
            );


        // ======================================
        // GET ORDER ID FROM URL
        // ======================================

        const params =
            new URLSearchParams(
                window.location.search
            );


        const orderId =
            params.get("order");


        if (!orderId) {

            showError(
                "We couldn't identify your order.",
                "Please contact us if a payment was made."
            );

            return;

        }


        // ======================================
        // SETTINGS
        // ======================================

        const MAX_ATTEMPTS =
            15;


        const CHECK_INTERVAL =
            2000;


        let attempts =
            0;


        let checking =
            false;


        // ======================================
        // WAIT
        // ======================================

        function wait(milliseconds) {

            return new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        milliseconds
                    )
            );

        }


        // ======================================
        // CLEAR CART
        // ======================================

        function clearPurchasedCart() {

            localStorage.removeItem(
                "onismCart"
            );


            document
                .querySelectorAll(
                    ".cart-count"
                )
                .forEach(
                    counter => {

                        counter.textContent =
                            "0";

                    }
                );

        }


        // ======================================
        // PAID
        // ======================================

        function showPaid(order) {

            loader.hidden =
                true;


            title.textContent =
                "Payment Confirmed";


            message.textContent =
                "Thank you. Your order has been paid successfully and is being prepared.";


            orderNumber.textContent =
                order.orderId;


            orderTotal.textContent =
                `R${Number(
                    order.total
                ).toFixed(2)}`;


            orderDetails.hidden =
                false;


            checkAgainButton.hidden =
                true;


            returnCheckout.hidden =
                true;


            continueShopping.hidden =
                false;


            clearPurchasedCart();

        }


        // ======================================
        // STILL PROCESSING
        // ======================================

        function showProcessing() {

            loader.hidden =
                false;


            title.textContent =
                "Payment is being confirmed";


            message.textContent =
                "Your payment has been submitted. We're waiting for final confirmation from PayFast.";


            checkAgainButton.hidden =
                false;

        }


        // ======================================
        // PAYMENT FAILED / CANCELLED
        // ======================================

        function showNotPaid(status) {

            loader.hidden =
                true;


            title.textContent =
                "Payment Not Confirmed";


            if (
                status === "cancelled"
            ) {

                message.textContent =
                    "This order was cancelled and no confirmed payment was recorded.";

            } else {

                message.textContent =
                    "We couldn't confirm payment for this order.";

            }


            orderDetails.hidden =
                true;


            continueShopping.hidden =
                true;


            checkAgainButton.hidden =
                true;


            returnCheckout.hidden =
                false;

        }


        // ======================================
        // ERROR
        // ======================================

        function showError(
            heading,
            text
        ) {

            loader.hidden =
                true;


            title.textContent =
                heading;


            message.textContent =
                text;


            orderDetails.hidden =
                true;


            continueShopping.hidden =
                true;


            returnCheckout.hidden =
                false;

        }


        // ======================================
        // CHECK ORDER
        // ======================================

        async function checkOrderStatus(
            allowPolling = true
        ) {

            if (checking) {
                return;
            }


            checking =
                true;


            try {

                const response =
                    await fetch(

                        `/api/order-status?order=${encodeURIComponent(
                            orderId
                        )}`,

                        {
                            cache:
                                "no-store"
                        }

                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Unable to check payment."
                    );

                }


                // ==================================
                // PAID
                // ==================================

                if (
                    result.status ===
                    "paid"
                ) {

                    showPaid(
                        result
                    );

                    checking =
                        false;

                    return;

                }


                // ==================================
                // CANCELLED / FAILED
                // ==================================

                if (
                    result.status ===
                    "cancelled" ||
                    result.status ===
                    "failed"
                ) {

                    showNotPaid(
                        result.status
                    );

                    checking =
                        false;

                    return;

                }


                // ==================================
                // PENDING
                // ==================================

                attempts++;


                title.textContent =
                    "Confirming your payment...";


                message.textContent =
                    "Your payment is being verified. Please keep this page open.";


                if (
                    allowPolling &&
                    attempts <
                    MAX_ATTEMPTS
                ) {

                    checking =
                        false;


                    await wait(
                        CHECK_INTERVAL
                    );


                    return checkOrderStatus(
                        true
                    );

                }


                showProcessing();


            } catch (error) {

                console.error(
                    "Payment status error:",
                    error
                );


                showError(
                    "Unable to Confirm Payment",
                    "We couldn't check your order right now. Your payment may still have been received."
                );

            }


            checking =
                false;

        }


        // ======================================
        // MANUAL RETRY
        // ======================================

        checkAgainButton.addEventListener(
            "click",
            () => {

                attempts =
                    0;


                checkAgainButton.hidden =
                    true;


                loader.hidden =
                    false;


                title.textContent =
                    "Checking payment...";


                message.textContent =
                    "Please wait while we check your order again.";


                checkOrderStatus(
                    true
                );

            }
        );


        // ======================================
        // START
        // ======================================

        checkOrderStatus(
            true
        );


    }
);