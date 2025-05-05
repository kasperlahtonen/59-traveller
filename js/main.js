document.addEventListener("DOMContentLoaded", () => {
    const lang = localStorage.getItem("lang") || "fi";
    loadHeaderFooter();
    loadLanguage(lang);

    document.getElementById("lang-switch").addEventListener("click", () => {
        const newLang = (localStorage.getItem("lang") === "fi") ? "en" : "fi";
        localStorage.setItem("lang", newLang);
        loadLanguage(newLang);
    });
});

function loadHeaderFooter() {
    fetch("/components/header.html")
        .then(res => res.text())
        .then(data => {
            document.querySelector("header").innerHTML = data;
        })
        .then(() => {
            document.getElementById("lang-switch").addEventListener("click", () => {
                const newLang = (localStorage.getItem("lang") === "fi") ? "en" : "fi";
                localStorage.setItem("lang", newLang);
                loadLanguage(newLang);
            });
        });

    fetch("/components/footer.html")
        .then(res => res.text())
        .then(data => {
            document.querySelector("footer").innerHTML = data;
        });
}

function loadLanguage(lang) {
    fetch(`/lang/${lang}.json`)
        .then(res => res.json())
        .then(translations => {
            document.querySelectorAll("[data-translate]").forEach(el => {
                const key = el.getAttribute("data-translate");
                if (translations[key]) {
                    el.textContent = translations[key];
                }
            });
            document.getElementById("lang-switch").textContent = (lang === "fi") ? "EN" : "FI";
        });
}
