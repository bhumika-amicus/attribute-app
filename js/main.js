import { seedApplicationData } from "./storage.js";
import { initList } from "./list.js";
import { initForm } from "./forms.js";



document.addEventListener(
  "DOMContentLoaded",
  async () => {
    await seedApplicationData();
    // Only run list logic if the table exists
    if (document.getElementById("attribute-table-body")) {
      initList();
    }

    // Only run form logic if the form exists
    if (document.getElementById("attribute-form")) {
      initForm();
    }
  }
);