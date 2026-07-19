import { seedApplicationData } from "./storage.js";
import { initList } from "./list.js";
import { initForm } from "./forms.js";
import { initTheme } from "./theme.js";

// A small helper to inject HTML at the top of the main content area
function renderBanner(html) {
  const mainEl = document.getElementById("main-content");
  // We create a temporary banner container
  let banner = document.getElementById("app-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "app-banner";
    mainEl.prepend(banner);
  }
  banner.innerHTML = html;
}

// We wrap everything in a function so the Retry button can call it again!
async function bootApplication() {

  initTheme();

  renderBanner(`<p class="loading-text">Loading application data...</p>`);

  try {

    // Wait for the simulated backend to finish loading
    await seedApplicationData();

    // If it succeeds, clear the loading banner!
    renderBanner("");

    // Initialize whichever page we are currently on
    if (document.getElementById("attribute-table-body")) initList();
    if (document.getElementById("attribute-form")) initForm();

  } catch (error) {
    // If the network fails, catch the error and show a Retry button!
    renderBanner(`
            <div class="form-error" role="alert">
                <strong>Error:</strong> Failed to connect to the database. 
                <button type="button" id="retry-button" class="btn btn--primary">Retry</button>
            </div>
        `);

    // Wire up the retry button to run this exact function again
    document.getElementById("retry-button").addEventListener("click", bootApplication);
  }
}

document.addEventListener("DOMContentLoaded", bootApplication);
