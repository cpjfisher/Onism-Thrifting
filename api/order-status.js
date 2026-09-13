// ==========================================
// ONISM THRIFTING
// ORDER STATUS API
// ==========================================

export default async function handler(
    req,
    res
) {

    if (req.method !== "GET") {

        return res
            .status(405)
            .json({
                error: "Method not allowed."
            });

    }


    try {

        const orderId =
            String(
                req.query.order || ""
            ).trim();


        // ======================================
        // VALIDATE ORDER ID
        // ======================================

        if (
            !orderId ||
            !/^ONISM-[A-Za-z0-9-]+$/.test(orderId) ||
            orderId.length > 100
        ) {

            return res
                .status(400)
                .json({
                    error: "Invalid order number."
                });

        }


        const supabaseUrl =
            process.env.SUPABASE_URL;


        const supabaseSecret =
            process.env.SUPABASE_SECRET_KEY;


        if (
            !supabaseUrl ||
            !supabaseSecret
        ) {

            throw new Error(
                "Supabase configuration missing."
            );

        }


        // ======================================
        // GET ORDER
        // ======================================

        const response =
            await fetch(

                `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(
                    orderId
                )}&select=id,status,total,paid_at`,

                {

                    headers: {

                        apikey:
                            supabaseSecret,

                        Authorization:
                            `Bearer ${supabaseSecret}`,

                        Accept:
                            "application/json"

                    }

                }

            );


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Order status error:",
                errorText
            );


            throw new Error(
                "Unable to retrieve order."
            );

        }


        const orders =
            await response.json();


        const order =
            orders[0];


        if (!order) {

            return res
                .status(404)
                .json({
                    error: "Order not found."
                });

        }


        // Prevent browsers/CDNs from caching
        // payment status.

        res.setHeader(
            "Cache-Control",
            "no-store"
        );


        return res
            .status(200)
            .json({

                orderId:
                    order.id,

                status:
                    order.status,

                total:
                    Number(
                        order.total
                    ),

                paidAt:
                    order.paid_at

            });


    } catch (error) {

        console.error(
            "Order status API error:",
            error
        );


        return res
            .status(500)
            .json({
                error:
                    "Unable to check order status."
            });

    }

}