// ==========================================
// ONISM THRIFTING
// PRODUCT DATABASE
// ==========================================
//
// Add and edit products ONLY in this file.
//
// Each product needs:
// id
// name
// price
// gender
// category
// size
// condition
// badge
// description
// measurements
// images
// available
// newDrop
//
// ==========================================


const products = [

    // ======================================
    // TEMPORARY PRODUCT 1
    // ======================================

    {
        id: "blue-top",

        name: "Blue Top",

        price: 200,

        gender: "women",

        category: "tops",

        size: "S",

        condition: "Very Good",

        badge: "JUST DROPPED",

        description:
            "A classic pre-loved blue top with a relaxed everyday fit. Easy to pair with jeans, cargos or your favourite basic tee.",

        measurements: {
            chest: "104 cm",
            length: "67 cm",
            shoulder: "45 cm",
            sleeve: "61 cm"
        },

        images: [
            "images/blue-top/bluetop.jpg",
            "images/blue-top/back.jpg",
            "images/blue-top/detail.jpg"
        ],

        available: true,

        newDrop: true
    },


    // ======================================
    // TEMPORARY PRODUCT 2
    // ======================================

    {
        id: "red-sandal",

        name: "Red Sandal",

        price: 250,

        gender: "women",

        category: "shoes",

        size: "4",

        condition: "Very Good",

        badge: "ONE OF ONE",

        description:
            "A stylish red sandal with a comfortable fit. Perfect for everyday wear.",

        measurements: {
            chest: "112 cm",
            length: "74 cm",
            shoulder: "50 cm",
            sleeve: "23 cm"
        },

        images: [
            "images/red-sandal/red-sandal.jpg",
            "images/red-sandal/back.jpg",
            "images/red-sandal/detail.jpg"
        ],

        available: true,

        newDrop: true
    },

    // ======================================
    // TEMPORARY PRODUCT 3
    // ======================================

    {
        id: "blackboots",

        name: "Black Boots",

        price: 350,

        gender: "women",

        category: "shoes",

        size: "4",

        condition: "Very Good",

        badge: "ONE OF ONE",

        description:
            "A stylish black boot with a comfortable fit. Perfect for everyday wear.",

        measurements: {
            chest: "112 cm",
            length: "74 cm",
            shoulder: "50 cm",
            sleeve: "23 cm"
        },

        images: [
            "images/blackboots/blackboots.jpg",
            "images/blackboots/back.jpg",
            "images/blackboots/detail.jpg"
        ],

        available: true,

        newDrop: true
    },

];