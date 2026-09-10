import crypto from "crypto";


// ==========================================
// PAYFAST ENCODING
// ==========================================

function encodePayFastValue(value) {

    return encodeURIComponent(
        String(value).trim()
    )
        .replace(/%20/g, "+");

}


// ==========================================
// GENERATE SIGNATURE
// ==========================================

function generateSignature(
    data,
    passphrase
) {

    const parameterString =
        Object.entries(data)
            .filter(
                ([, value]) =>
                    value !== "" &&
                    value !== null &&
                    value !== undefined
            )
            .map(
                ([key, value]) =>
                    `${key}=${encodePayFastValue(value)}`
            )
            .join("&");


    const stringToHash =
        passphrase
            ? `${parameterString}&passphrase=${encodePayFastValue(passphrase)}`
            : parameterString;


    return crypto
        .createHash("md5")
        .update(stringToHash)
        .digest("hex");

}


// ==========================================
// API
// ==========================================

export default async function handler(
    req,
    res
) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed."
        });

    }


    try {

        const {
            customer,
            products,
            subtotal,
            shipping,
            total
        } = req.body;


        if (
            !customer ||
            !Array.isArray(products) ||
            products.length === 0
        ) {

            return res.status(400).json({
                error: "Invalid order."
            });

        }


        // ======================================
        // RE-CALCULATE ORDER SERVER SIDE
        // ======================================

        const calculatedSubtotal =
            products.reduce(
                (sum, product) =>
                    sum +
                    Number(product.price),
                0
            );


        const calculatedShipping =
            calculatedSubtotal >= 500
                ? 0
                : 60;


        const calculatedTotal =
            calculatedSubtotal +
            calculatedShipping;


        // Basic consistency check

        if (
            Number(total) !==
            calculatedTotal
        ) {

            return res.status(400).json({
                error:
                    "Order total does not match."
            });

        }


        // ======================================
        // ORDER NUMBER
        // ======================================

        const orderId =
            `ONISM-${Date.now()}`;


        // ======================================
        // PAYFAST DATA
        // ======================================

        const paymentData = {

            merchant_id:
                process.env
                    .PAYFAST_MERCHANT_ID,

            merchant_key:
                process.env
                    .PAYFAST_MERCHANT_KEY,


            return_url:
                `${process.env.SITE_URL}/payment-success.html`,

            cancel_url:
                `${process.env.SITE_URL}/checkout.html`,

            notify_url:
                `${process.env.SITE_URL}/api/payfast-notify`,


            name_first:
                customer.firstName,

            name_last:
                customer.lastName,

            email_address:
                customer.email,


            m_payment_id:
                orderId,

            amount:
                calculatedTotal.toFixed(2),

            item_name:
                `Onism Thrifting ${orderId}`

        };


        const signature =
            generateSignature(
                paymentData,
                process.env
                    .PAYFAST_PASSPHRASE
            );


        paymentData.signature =
            signature;


        const paymentUrl =
            process.env.PAYFAST_MODE ===
            "live"

                ? "https://www.payfast.co.za/eng/process"

                : "https://sandbox.payfast.co.za/eng/process";


        return res.status(200).json({

            paymentUrl,

            paymentData,

            orderId

        });


    } catch (error) {

        console.error(
            "PayFast error:",
            error
        );


        return res.status(500).json({

            error:
                "Unable to create payment."

        });

    }

}