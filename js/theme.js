export function initTheme() {
    const themeToggleButton = document.getElementById("theme-toggle");
    if (!themeToggleButton) return;

    // 1. Read from localStorage; if absent, fall back to OS preference
    const savedTheme = localStorage.getItem("theme");
    const osPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    let currentTheme = savedTheme || (osPrefersDark ? "dark" : "light");

    // 2. Apply the theme to the root <html> tag
    document.documentElement.setAttribute("data-theme", currentTheme);

    // 3. Toggle button click listener
    themeToggleButton.addEventListener("click", () => {
        currentTheme = currentTheme === "light" ? "dark" : "light";
        
        // Update the HTML tag
        document.documentElement.setAttribute("data-theme", currentTheme);
        
        // Persist the user's explicit choice!
        localStorage.setItem("theme", currentTheme);
    });

    // 4. Add a matchMedia change listener for system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        // ONLY update if the user hasn't explicitly overridden it!
        if (!localStorage.getItem("theme")) {
            currentTheme = e.matches ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", currentTheme);
        }
    });
}
