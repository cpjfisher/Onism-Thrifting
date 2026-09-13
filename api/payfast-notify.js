import crypto from "crypto";


// ==========================================
// ONISM THRIFTING
// PAYFAST ITN HANDLER
// ==========================================


// ==========================================
// PAYFAST URL ENCODING
// PHP urlencode-style encoding
// ==========================================

function encodePayFastValue(value) {

    return encodeURIComponent(
        String(value)
    )
        .replace(
            /[!'()*~]/g,
            character =>
                "%" +
                character
                    .charCodeAt(0)
                    .toString(16)
                    .toUpperCase()
        )
        .replace(/%20/g, "+");

}


// ==========================================
// NORMALISE REQUEST BODY
// ==========================================

function getPayFastData(body) {

    if (!body) {
        return {};
    }


    // If Vercel gives us a raw
    // URL-encoded string
    if (typeof body === "string") {

        return Object.fromEntries(
            new URLSearchParams(body)
        );

    }


    return body;

}


// ==========================================
// CREATE PAYFAST PARAMETER STRING
// ==========================================

function createParameterString(data) {

    const parameters = [];


    for (
        const [key, value]
        of Object.entries(data)
    ) {

        // PayFast places signature at the end.
        // Stop before adding it to the string.
        if (key === "signature") {
            break;
        }


        // IMPORTANT:
        // ITN signature validation must include
        // empty fields sent by PayFast.
        parameters.push(

            `${key}=${encodePayFastValue(
                value ?? ""
            )}`

        );

    }


    return parameters.join("&");

}


// ==========================================
// VERIFY PAYFAST SIGNATURE
// ==========================================

function verifySignature(
    payFastData,
    parameterString
) {

    const receivedSignature =
        String(
            payFastData.signature || ""
        )
            .trim()
            .toLowerCase();


    if (!receivedSignature) {
        return false;
    }


    const passphrase =
        process.env
            .PAYFAST_PASSPHRASE;


    let signatureString =
        parameterString;


    if (passphrase) {

        signatureString +=
            `&passphrase=${encodePayFastValue(
                passphrase.trim()
            )}`;

    }


    const calculatedSignature =
        crypto
            .createHash("md5")
            .update(signatureString)
            .digest("hex");


    return (
        receivedSignature ===
        calculatedSignature
    );

}


// ==========================================
// IP HELPERS
// ==========================================

function normaliseIp(ip) {

    if (!ip) {
        return "";
    }


    return String(ip)
        .trim()
        .replace(/^::ffff:/, "");

}


function ipv4ToNumber(ip) {

    const parts =
        ip.split(".")
            .map(Number);


    if (
        parts.length !== 4 ||
        parts.some(
            part =>
                !Number.isInteger(part) ||
                part < 0 ||
                part > 255
        )
    ) {

        return null;

    }


    return (

        (
            parts[0] * 256 * 256 * 256
        ) +

        (
            parts[1] * 256 * 256
        ) +

        (
            parts[2] * 256
        ) +

        parts[3]

    );

}


function ipInCidr(
    ip,
    network,
    prefixLength
) {

    const ipNumber =
        ipv4ToNumber(ip);


    const networkNumber =
        ipv4ToNumber(network);


    if (
        ipNumber === null ||
        networkNumber === null
    ) {

        return false;

    }


    const blockSize =
        2 ** (
            32 -
            prefixLength
        );


    return (

        Math.floor(
            ipNumber / blockSize
        ) ===

        Math.floor(
            networkNumber / blockSize
        )

    );

}


// ==========================================
// VERIFY PAYFAST SOURCE
// ==========================================

function verifyPayFastSource(req) {

    const forwardedFor =
        req.headers[
            "x-forwarded-for"
        ];


    let requestIp = "";


    if (forwardedFor) {

        requestIp =
            normaliseIp(
                String(forwardedFor)
                    .split(",")[0]
            );

    } else {

        requestIp =
            normaliseIp(
                req.socket
                    ?.remoteAddress
            );

    }


    // PayFast published server ranges

    const validRanges = [

        {
            network:
                "197.97.145.144",
            prefix:
                28
        },

        {
            network:
                "41.74.179.192",
            prefix:
                27
        },

        {
            network:
                "102.216.36.0",
            prefix:
                28
        },

        {
            network:
                "102.216.36.128",
            prefix:
                28
        }

    ];


    const validSingleIps = [

        "144.126.193.139"

    ];


    const exactMatch =
        validSingleIps.includes(
            requestIp
        );


    const rangeMatch =
        validRanges.some(
            range =>
                ipInCidr(
                    requestIp,
                    range.network,
                    range.prefix
                )
        );


    if (
        !exactMatch &&
        !rangeMatch
    ) {

        console.error(
            "Invalid PayFast source IP:",
            requestIp
        );


        return false;

    }


    return true;

}


// ==========================================
// SUPABASE CONFIG
// ==========================================

function getSupabaseConfig() {

    const url =
        process.env
            .SUPABASE_URL;


    const secret =
        process.env
            .SUPABASE_SECRET_KEY;


    if (
        !url ||
        !secret
    ) {

        throw new Error(
            "Supabase environment variables are missing."
        );

    }


    return {
        url,
        secret
    };

}


// ==========================================
// GET ORDER FROM SUPABASE
// ==========================================

async function getOrder(orderId) {

    const {
        url,
        secret
    } = getSupabaseConfig();


    const response =
        await fetch(

            `${url}/rest/v1/orders?id=eq.${encodeURIComponent(
                orderId
            )}&select=id,status,total,payfast_payment_id`,

            {

                method:
                    "GET",

                headers: {

                    apikey:
                        secret,

                    Authorization:
                        `Bearer ${secret}`,

                    Accept:
                        "application/json"

                }

            }

        );


    if (!response.ok) {

        const errorText =
            await response.text();


        console.error(
            "Supabase get order error:",
            errorText
        );


        throw new Error(
            "Unable to retrieve order."
        );

    }


    const orders =
        await response.json();


    return (
        orders[0] ||
        null
    );

}


// ==========================================
// VERIFY ITN WITH PAYFAST SERVER
// ==========================================

async function verifyWithPayFast(
    parameterString
) {

    const validationUrl =

        process.env.PAYFAST_MODE ===
        "live"

            ? "https://www.payfast.co.za/eng/query/validate"

            : "https://sandbox.payfast.co.za/eng/query/validate";


    const response =
        await fetch(

            validationUrl,

            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded"

                },

                body:
                    parameterString

            }

        );


    if (!response.ok) {

        console.error(
            "PayFast validation HTTP error:",
            response.status
        );


        return false;

    }


    const result =
        await response.text();


    console.log(
        "PayFast validation response:",
        result.trim()
    );


    return (
        result.trim() ===
        "VALID"
    );

}


// ==========================================
// CONFIRM PAID ORDER IN SUPABASE
// ==========================================

async function confirmOrder(
    orderId,
    payFastPaymentId,
    amount
) {

    const {
        url,
        secret
    } = getSupabaseConfig();


    const response =
        await fetch(

            `${url}/rest/v1/rpc/confirm_paid_order`,

            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    apikey:
                        secret,

                    Authorization:
                        `Bearer ${secret}`

                },

                body:
                    JSON.stringify({

                        p_order_id:
                            orderId,

                        p_payfast_payment_id:
                            payFastPaymentId,

                        p_amount:
                            Number(amount)

                    })

            }

        );


    const responseText =
        await response.text();


    let result;


    try {

        result =
            JSON.parse(
                responseText
            );

    } catch {

        result =
            responseText;

    }


    if (!response.ok) {

        console.error(
            "Confirm order error:",
            result
        );


        throw new Error(
            "Supabase could not confirm the paid order."
        );

    }


    return result;

}

// ==========================================
// HTML SAFETY
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// GET FULL ORDER FOR EMAIL
// ==========================================

async function getOrderForEmail(
    orderId
) {

    const {
        url,
        secret
    } = getSupabaseConfig();


    // ======================================
    // ORDER
    // ======================================

    const orderResponse =
        await fetch(

            `${url}/rest/v1/orders?id=eq.${encodeURIComponent(
                orderId
            )}&select=id,status,first_name,last_name,email,phone,address,suburb,city,province,postal_code,subtotal,shipping,total,customer_email_sent_at,admin_email_sent_at`,

            {

                headers: {

                    apikey:
                        secret,

                    Authorization:
                        `Bearer ${secret}`,

                    Accept:
                        "application/json"

                }

            }

        );


    if (!orderResponse.ok) {

        throw new Error(
            "Unable to load order for email."
        );

    }


    const orders =
        await orderResponse.json();


    const order =
        orders[0];


    if (!order) {

        throw new Error(
            "Order not found for email."
        );

    }


    // ======================================
    // ORDER ITEMS
    // ======================================

    const itemsResponse =
        await fetch(

            `${url}/rest/v1/order_items?order_id=eq.${encodeURIComponent(
                orderId
            )}&select=product_id,product_name,price`,

            {

                headers: {

                    apikey:
                        secret,

                    Authorization:
                        `Bearer ${secret}`,

                    Accept:
                        "application/json"

                }

            }

        );


    if (!itemsResponse.ok) {

        throw new Error(
            "Unable to load order items for email."
        );

    }


    const items =
        await itemsResponse.json();


    return {
        ...order,
        items
    };

}


// ==========================================
// SEND RESEND EMAIL
// ==========================================

async function sendResendEmail({
    to,
    subject,
    html,
    idempotencyKey
}) {

    const apiKey =
        process.env.RESEND_API_KEY;


    const from =
        process.env.RESEND_FROM_EMAIL;


    if (
        !apiKey ||
        !from
    ) {

        throw new Error(
            "Resend environment variables are missing."
        );

    }


    const response =
        await fetch(
            "https://api.resend.com/emails",
            {

                method:
                    "POST",

                headers: {

                    Authorization:
                        `Bearer ${apiKey}`,

                    "Content-Type":
                        "application/json",

                    "Idempotency-Key":
                        idempotencyKey

                },

                body:
                    JSON.stringify({

                        from,

                        to: [to],

                        subject,

                        html

                    })

            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        console.error(
            "Resend error:",
            result
        );


        throw new Error(
            result.message ||
            "Unable to send email."
        );

    }


    return result;

}

// ==========================================
// RECORD EMAIL AS SENT
// ==========================================

async function markEmailSent(
    orderId,
    type,
    emailId
) {

    const {
        url,
        secret
    } = getSupabaseConfig();


    let updateData;


    if (
        type === "customer"
    ) {

        updateData = {

            customer_email_sent_at:
                new Date().toISOString(),

            customer_email_id:
                emailId || null

        };

    } else {

        updateData = {

            admin_email_sent_at:
                new Date().toISOString(),

            admin_email_id:
                emailId || null

        };

    }


    const response =
        await fetch(

            `${url}/rest/v1/orders?id=eq.${encodeURIComponent(
                orderId
            )}`,

            {

                method:
                    "PATCH",

                headers: {

                    apikey:
                        secret,

                    Authorization:
                        `Bearer ${secret}`,

                    "Content-Type":
                        "application/json",

                    Prefer:
                        "return=minimal"

                },

                body:
                    JSON.stringify(
                        updateData
                    )

            }

        );


    if (!response.ok) {

        const errorText =
            await response.text();


        console.error(
            "Email tracking error:",
            errorText
        );


        throw new Error(
            "Unable to record sent email."
        );

    }

}

// ==========================================
// SEND ORDER EMAILS
// ==========================================

async function sendOrderEmails(
    orderId
) {

    const order =
        await getOrderForEmail(
            orderId
        );


    if (
        order.status !==
        "paid"
    ) {

        throw new Error(
            "Cannot send confirmation for unpaid order."
        );

    }


    // ======================================
    // BUILD PRODUCT ROWS
    // ======================================

    const productRows =
        order.items
            .map(
                item => `

                    <tr>

                        <td
                            style="
                                padding: 12px 0;
                                border-bottom: 1px solid #eeeeee;
                            "
                        >
                            ${escapeHtml(
                                item.product_name
                            )}
                        </td>

                        <td
                            style="
                                padding: 12px 0;
                                border-bottom: 1px solid #eeeeee;
                                text-align: right;
                            "
                        >
                            R${Number(
                                item.price
                            ).toFixed(2)}
                        </td>

                    </tr>

                `
            )
            .join("");


    const shippingText =
        Number(
            order.shipping
        ) === 0

            ? "FREE"

            : `R${Number(
                order.shipping
            ).toFixed(2)}`;


    const customerName =
        `${order.first_name} ${order.last_name}`;


    const addressHtml = `

        ${escapeHtml(order.address)}<br>
        ${escapeHtml(order.suburb)}<br>
        ${escapeHtml(order.city)}<br>
        ${escapeHtml(order.province)}<br>
        ${escapeHtml(order.postal_code)}

    `;


    // ======================================
    // CUSTOMER EMAIL
    // ======================================

    if (
        !order.customer_email_sent_at
    ) {

        const customerHtml = `

            <div
                style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    color: #111111;
                "
            >

                <h1>
                    Order confirmed
                </h1>

                <p>
                    Hi ${escapeHtml(
                        order.first_name
                    )},
                </p>

                <p>
                    Thanks for shopping with
                    Onism Thrifting. Your payment
                    has been confirmed and we've
                    received your order.
                </p>

                <p>
                    <strong>
                        Order ${escapeHtml(
                            order.id
                        )}
                    </strong>
                </p>


                <table
                    style="
                        width: 100%;
                        border-collapse: collapse;
                        margin: 30px 0;
                    "
                >

                    ${productRows}

                    <tr>

                        <td
                            style="
                                padding-top: 16px;
                            "
                        >
                            Subtotal
                        </td>

                        <td
                            style="
                                padding-top: 16px;
                                text-align: right;
                            "
                        >
                            R${Number(
                                order.subtotal
                            ).toFixed(2)}
                        </td>

                    </tr>


                    <tr>

                        <td
                            style="
                                padding-top: 10px;
                            "
                        >
                            Shipping
                        </td>

                        <td
                            style="
                                padding-top: 10px;
                                text-align: right;
                            "
                        >
                            ${shippingText}
                        </td>

                    </tr>


                    <tr>

                        <td
                            style="
                                padding-top: 16px;
                                font-weight: bold;
                            "
                        >
                            Total
                        </td>

                        <td
                            style="
                                padding-top: 16px;
                                text-align: right;
                                font-weight: bold;
                            "
                        >
                            R${Number(
                                order.total
                            ).toFixed(2)}
                        </td>

                    </tr>

                </table>


                <h3>
                    Delivery address
                </h3>

                <p
                    style="
                        line-height: 1.6;
                    "
                >
                    ${addressHtml}
                </p>


                <p
                    style="
                        margin-top: 30px;
                        color: #666666;
                    "
                >
                    We'll keep you updated
                    regarding your order.
                </p>


                <p>
                    ONISM THRIFTING
                </p>

            </div>

        `;


        const customerEmail =
            await sendResendEmail({

                to:
                    order.email,

                subject:
                    `Order confirmed – ${order.id}`,

                html:
                    customerHtml,

                idempotencyKey:
                    `customer-order/${order.id}`

            });


        await markEmailSent(

            order.id,

            "customer",

            customerEmail.id

        );


        console.log(
            "Customer confirmation email sent:",
            order.id
        );

    }


    // ======================================
    // ADMIN EMAIL
    // ======================================

    if (
        !order.admin_email_sent_at
    ) {

        const adminEmail =
            process.env
                .STORE_ORDER_EMAIL;


        if (!adminEmail) {

            throw new Error(
                "STORE_ORDER_EMAIL is missing."
            );

        }


        const adminHtml = `

            <div
                style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    color: #111111;
                "
            >

                <h1>
                    New paid order
                </h1>


                <p>
                    <strong>
                        ${escapeHtml(
                            order.id
                        )}
                    </strong>
                </p>


                <h3>
                    Customer
                </h3>

                <p>
                    ${escapeHtml(
                        customerName
                    )}<br>

                    ${escapeHtml(
                        order.email
                    )}<br>

                    ${escapeHtml(
                        order.phone
                    )}
                </p>


                <h3>
                    Items
                </h3>

                <table
                    style="
                        width: 100%;
                        border-collapse: collapse;
                    "
                >

                    ${productRows}

                </table>


                <p>
                    Subtotal:
                    <strong>
                        R${Number(
                            order.subtotal
                        ).toFixed(2)}
                    </strong>
                </p>

                <p>
                    Shipping:
                    <strong>
                        ${shippingText}
                    </strong>
                </p>

                <p>
                    Total:
                    <strong>
                        R${Number(
                            order.total
                        ).toFixed(2)}
                    </strong>
                </p>


                <h3>
                    Delivery address
                </h3>

                <p
                    style="
                        line-height: 1.6;
                    "
                >
                    ${addressHtml}
                </p>

            </div>

        `;


        const adminResult =
            await sendResendEmail({

                to:
                    adminEmail,

                subject:
                    `New paid order – ${order.id}`,

                html:
                    adminHtml,

                idempotencyKey:
                    `admin-order/${order.id}`

            });


        await markEmailSent(

            order.id,

            "admin",

            adminResult.id

        );


        console.log(
            "Admin order email sent:",
            order.id
        );

    }

}

// ==========================================
// MAIN PAYFAST ITN HANDLER
// ==========================================

export default async function handler(
    req,
    res
) {

    // ======================================
    // ONLY ACCEPT POST
    // ======================================

    if (
        req.method !==
        "POST"
    ) {

        return res
            .status(405)
            .send(
                "Method not allowed"
            );

    }


    try {

        // ======================================
        // READ PAYFAST DATA
        // ======================================

        const payFastData =
            getPayFastData(
                req.body
            );


        const orderId =
            payFastData
                .m_payment_id;


        const paymentId =
            payFastData
                .pf_payment_id;


        const paymentStatus =
            payFastData
                .payment_status;


        const amountGross =
            Number(
                payFastData
                    .amount_gross
            );


        console.log(
            "PayFast ITN received:",
            {
                orderId,
                paymentId,
                paymentStatus,
                amountGross
            }
        );


        // ======================================
        // REQUIRED VALUES
        // ======================================

        if (
            !orderId ||
            !paymentId
        ) {

            console.error(
                "Missing PayFast payment details"
            );


            return res
                .status(400)
                .send(
                    "Missing payment details"
                );

        }


        // ======================================
        // ONLY PROCESS COMPLETE PAYMENTS
        // ======================================

        if (
            paymentStatus !==
            "COMPLETE"
        ) {

            console.log(
                "PayFast payment not COMPLETE:",
                paymentStatus
            );


            // Notification was received,
            // but there is nothing to fulfil.

            return res
                .status(200)
                .send("OK");

        }


        // ======================================
        // CREATE PARAMETER STRING
        // ======================================

        const parameterString =
            createParameterString(
                payFastData
            );


        // ======================================
        // CHECK 1
        // VERIFY SIGNATURE
        // ======================================

        const signatureValid =
            verifySignature(

                payFastData,

                parameterString

            );


        if (!signatureValid) {

            console.error(
                "Invalid PayFast signature"
            );


            return res
                .status(400)
                .send(
                    "Invalid signature"
                );

        }


        console.log(
            "PayFast signature valid"
        );


        // ======================================
        // CHECK 2
        // VERIFY SOURCE
        // ======================================

        const sourceValid =
            verifyPayFastSource(
                req
            );


        if (!sourceValid) {

            return res
                .status(400)
                .send(
                    "Invalid PayFast source"
                );

        }


        console.log(
            "PayFast source valid"
        );


        // ======================================
        // GET REAL ORDER FROM DATABASE
        // ======================================

        const order =
            await getOrder(
                orderId
            );


        if (!order) {

            console.error(
                "Order not found:",
                orderId
            );


            return res
                .status(400)
                .send(
                    "Order not found"
                );

        }


        // ======================================
        // CHECK 3
        // VERIFY AMOUNT
        // ======================================

        const expectedAmount =
            Number(
                order.total
            );


        if (
            !Number.isFinite(
                amountGross
            ) ||
            !Number.isFinite(
                expectedAmount
            ) ||
            Math.abs(
                expectedAmount -
                amountGross
            ) > 0.01
        ) {

            console.error(
                "PayFast amount mismatch:",
                {
                    expected:
                        expectedAmount,

                    received:
                        amountGross
                }
            );


            return res
                .status(400)
                .send(
                    "Amount mismatch"
                );

        }


        console.log(
            "PayFast amount valid:",
            amountGross
        );


        // ======================================
        // CHECK 4
        // VERIFY DIRECTLY WITH PAYFAST
        // ======================================

        const serverConfirmed =
            await verifyWithPayFast(
                parameterString
            );


        if (!serverConfirmed) {

            console.error(
                "PayFast server validation failed"
            );


            return res
                .status(400)
                .send(
                    "PayFast validation failed"
                );

        }


        console.log(
            "PayFast server confirmation valid"
        );


        // ======================================
        // ALL CHECKS PASSED
        //
        // MARK ORDER PAID
        // MARK PRODUCTS SOLD
        // ======================================

        const confirmation =
            await confirmOrder(

                orderId,

                paymentId,

                amountGross

            );


        console.log(
            "Onism order confirmed:",
            confirmation
        );

        // ======================================
        // SEND ORDER CONFIRMATION EMAILS
        // ======================================

        await sendOrderEmails(
            orderId
        );


        console.log(
            "Order emails completed:",
            orderId
        );  


        // ======================================
        // SUCCESS
        // ======================================

        return res
            .status(200)
            .send("OK");


    } catch (error) {

        console.error(
            "PayFast ITN processing error:",
            error
        );


        // Non-200 means PayFast may retry
        // the notification.

        return res
            .status(500)
            .send(
                "ITN processing error"
            );

    }

}