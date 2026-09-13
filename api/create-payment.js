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
// GENERATE PAYFAST SIGNATURE
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

        return res
            .status(405)
            .json({
                error: "Method not allowed."
            });

    }


    try {

        const {
            customer,
            productIds
        } = req.body;


        // ======================================
        // VALIDATE REQUEST
        // ======================================

        if (
            !customer ||
            !Array.isArray(productIds) ||
            productIds.length === 0
        ) {

            return res
                .status(400)
                .json({
                    error: "Invalid order."
                });

        }


        const requiredFields = [

            "firstName",
            "lastName",
            "email",
            "phone",
            "address",
            "suburb",
            "city",
            "province",
            "postalCode"

        ];


        const missingField =
            requiredFields.find(
                field =>
                    !String(
                        customer[field] || ""
                    ).trim()
            );


        if (missingField) {

            return res
                .status(400)
                .json({
                    error:
                        "Missing customer details."
                });

        }


        // ======================================
        // CREATE ORDER NUMBER
        // ======================================

        const orderId =
            `ONISM-${Date.now()}-${crypto
                .randomBytes(3)
                .toString("hex")
                .toUpperCase()}`;


        // ======================================
        // SUPABASE
        // ======================================

        const supabaseUrl =
            process.env.SUPABASE_URL;


        const supabaseSecret =
            process.env.SUPABASE_SECRET_KEY;


        if (
            !supabaseUrl ||
            !supabaseSecret
        ) {

            throw new Error(
                "Supabase environment variables are missing."
            );

        }


        // ======================================
        // CREATE PENDING ORDER IN DATABASE
        // ======================================

        const rpcResponse =
            await fetch(

                `${supabaseUrl}/rest/v1/rpc/create_pending_order`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            supabaseSecret

                    },

                    body:
                        JSON.stringify({

                            p_order_id:
                                orderId,

                            p_first_name:
                                customer.firstName,

                            p_last_name:
                                customer.lastName,

                            p_email:
                                customer.email,

                            p_phone:
                                customer.phone,

                            p_address:
                                customer.address,

                            p_suburb:
                                customer.suburb,

                            p_city:
                                customer.city,

                            p_province:
                                customer.province,

                            p_postal_code:
                                customer.postalCode,

                            p_product_ids:
                                productIds

                        })

                }

            );


        const rpcResult =
            await rpcResponse.json();


        if (!rpcResponse.ok) {

            console.error(
                "Supabase order error:",
                rpcResult
            );


            return res
                .status(400)
                .json({

                    error:
                        rpcResult.message ||
                        "Unable to create order."

                });

        }


        // ======================================
        // TRUST DATABASE TOTAL
        // ======================================

        const order =
            Array.isArray(rpcResult)
                ? rpcResult[0]
                : rpcResult;


        const total =
            Number(
                order.total
            );


        if (
            !Number.isFinite(total) ||
            total <= 0
        ) {

            throw new Error(
                "Invalid total returned by database."
            );

        }


        // ======================================
        // PAYFAST PAYMENT DATA
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
                total.toFixed(2),

            item_name:
                `Onism Thrifting ${orderId}`

        };


        // ======================================
        // SIGN PAYMENT
        // ======================================

        const signature =
            generateSignature(

                paymentData,

                process.env
                    .PAYFAST_PASSPHRASE

            );


        paymentData.signature =
            signature;


        // ======================================
        // PAYFAST URL
        // ======================================

        const paymentUrl =
            process.env.PAYFAST_MODE ===
            "live"

                ? "https://www.payfast.co.za/eng/process"

                : "https://sandbox.payfast.co.za/eng/process";


        return res
            .status(200)
            .json({

                paymentUrl,

                paymentData,

                orderId

            });


    } catch (error) {

        console.error(
            "Create payment error:",
            error
        );


        return res
            .status(500)
            .json({

                error:
                    "Unable to create payment."

            });

    }

}