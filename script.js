// ==========================================
// MOBILE MENU
// ==========================================

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuToggle && mobileMenu) {

    menuToggle.addEventListener("click", () => {

        const isOpen = mobileMenu.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen
        );

        // Animate hamburger into an X
        const lines = menuToggle.querySelectorAll("span");

        if (isOpen) {

            lines[0].style.transform =
                "translateY(6.5px) rotate(45deg)";

            lines[1].style.opacity = "0";

            lines[2].style.transform =
                "translateY(-6.5px) rotate(-45deg)";

        } else {

            lines[0].style.transform = "none";
            lines[1].style.opacity = "1";
            lines[2].style.transform = "none";

        }

    });


    // Close mobile menu when a link is clicked
    const mobileLinks =
        mobileMenu.querySelectorAll("a");

    mobileLinks.forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            const lines =
                menuToggle.querySelectorAll("span");

            lines[0].style.transform = "none";
            lines[1].style.opacity = "1";
            lines[2].style.transform = "none";

        });

    });

// ==========================================
// HEADER SEARCH
// ==========================================

const searchToggle = document.getElementById("searchToggle");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

if (searchToggle && searchForm && searchInput) {

    // Open / close search bar
    searchToggle.addEventListener("click", () => {

        searchForm.classList.toggle("active");

        if (searchForm.classList.contains("active")) {
            searchInput.focus();
        }

    });

    // Submit search
    searchForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const searchTerm = searchInput.value.trim();

        if (searchTerm) {

            window.location.href =
                `shop.html?q=${encodeURIComponent(searchTerm)}`;

        }

    });
}
}
