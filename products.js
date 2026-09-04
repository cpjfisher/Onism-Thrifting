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

        images: [
            "images/blue-top/bluetop.jpg",
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

        images: [
            "images/red-sandal/red-sandal.jpg",
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

        images: [
            "images/blackboots/blackboots.jpg",
        ],

        available: true,

        newDrop: true
    },

    // ======================================
    // TEMPORARY PRODUCT 4
    // ======================================

    {
        id: "blue-cap",

        name: "Blue 'Lucky' Cap",

        price: 100,

        gender: "unisex",

        category: "accessories",

        size: "One Size",

        condition: "Very Good",

        badge: "ONE OF ONE",

        description:
            "Bright royal-blue adjustable cap with white “Lucky” embroidery, curved peak and metal buckle closure.",

        images: [
            "images/blue-cap/front.PNG",
            "images/blue-cap/back.PNG",
            "images/blue-cap/side.PNG"
        ],

        available: true,

        newDrop: true
    },

    // ======================================
    // TEMPORARY PRODUCT 5
    // ======================================

    {
        id: "formal-pants",

        name: "Markham Houndstooth Trousers",

        price: 250,

        gender: "men",

        category: "bottoms",

        size: "32",

        condition: "Very Good",

        badge: "ONE OF ONE",

        description:
            "Black-and-white houndstooth slim tapered trousers with an elasticated waist and adjustable drawstring.",

        images: [
            "images/formal-pants/front.PNG",
            "images/formal-pants/back.PNG",
            "images/formal-pants/closeup.PNG"
        ],

        available: true,

        newDrop: true
    },

    // ======================================
    // TEMPORARY PRODUCT 6
    // ======================================

    {
        id: "levi-top",

        name: "Levi's Burgundy T-Shirt",

        price: 150,

        gender: "men",

        category: "tops",

        size: "M",

        condition: "Very Good",

        badge: "JUST DROPPED",

        description:
            "Classic burgundy Levi’s tee featuring a bold white chest logo and an easy everyday fit.",

        measurements: {
            chest: "112 cm",
            length: "74 cm",
            shoulder: "50 cm",
            sleeve: "23 cm"
        },

        images: [
            "images/levi-top/front.PNG",
            "images/levi-top/back.PNG",
        ],

        available: true,

        newDrop: true
    },

    // ======================================
    // TEMPORARY PRODUCT 7
    // ======================================

    {
        id: "tapered-jean",

        name: "Cotton On Grey Tapered Jeans",

        price: 250,

        gender: "men",

        category: "bottoms",

        size: "30",

        condition: "Good",

        badge: "ONE OF ONE",

        description:
            "Washed charcoal-grey jeans with a tapered leg, classic five-pocket styling and a versatile casual look.",

        images: [
            "images/tapered-jean/front.PNG",
            "images/tapered-jean/back.PNG",
        ],

        available: true,

        newDrop: true
    },

    // ======================================
    // TEMPORARY PRODUCT 8
    // ======================================

    {
        id: "zara-jacket",

        name: "Black Overshirt Jacket",

        price: 200,

        gender: "men",

        category: "jackets", 

        size: "M",

        condition: "Very Good",

        badge: "JUST DROPPED",

        description:
            "Versatile black collared overshirt with button fastening, two chest pockets and practical side pockets.",

        images: [
            "images/zara-jacket/front.PNG",
            "images/zara-jacket/back.PNG",
            "images/zara-jacket/closeup.PNG"
        ],

        available: true,

        newDrop: true
    },

];