// ==========================================
// ONISM THRIFTING
// LIVE INVENTORY
// ==========================================


async function syncProductsWithInventory() {

    const response =
        await fetch(
            "/api/inventory",
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load live inventory."
        );

    }


    const inventory =
        await response.json();


    const inventoryMap =
        new Map(

            inventory.map(
                item => [
                    item.id,
                    item
                ]
            )

        );


    products.forEach(
        product => {


            const liveProduct =
                inventoryMap.get(
                    product.id
                );


            // Product isn't registered
            // in Supabase.
            if (!liveProduct) {

                product.available =
                    false;

                return;

            }


            // Supabase controls these values.

            product.available =
                liveProduct.available;


            product.price =
                Number(
                    liveProduct.price
                );

        }
    );


    return products;

}