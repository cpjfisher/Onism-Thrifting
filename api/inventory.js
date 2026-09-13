// ==========================================
// ONISM THRIFTING
// PUBLIC INVENTORY API
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


        const response =
            await fetch(

                `${supabaseUrl}/rest/v1/products?select=id,price,available,reserved_until`,

                {

                    headers: {

                        apikey:
                            supabaseSecret,

                        Authorization:
                            `Bearer ${supabaseSecret}`

                    }

                }

            );


        if (!response.ok) {

            const error =
                await response.text();


            console.error(
                "Inventory error:",
                error
            );


            throw new Error(
                "Unable to load inventory."
            );

        }


        const products =
            await response.json();


        const now =
            Date.now();


        const inventory =
            products.map(
                product => {


                    const reservationActive =
                        product.reserved_until &&
                        new Date(
                            product.reserved_until
                        ).getTime() > now;


                    return {

                        id:
                            product.id,

                        price:
                            Number(
                                product.price
                            ),

                        available:
                            Boolean(
                                product.available
                            ) &&
                            !reservationActive

                    };

                }
            );


        // We want stock to stay fresh.
        res.setHeader(
            "Cache-Control",
            "no-store"
        );


        return res
            .status(200)
            .json(
                inventory
            );


    } catch (error) {

        console.error(
            "Inventory API error:",
            error
        );


        return res
            .status(500)
            .json({
                error:
                    "Unable to load inventory."
            });

    }

}