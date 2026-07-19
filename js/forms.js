import { getBusinessUnits, getLocations, getCompanies } from "./lookups.js";
import { getById } from "./attributes.js";


export function initForm() {
    // 1. Get DOM elements
    const businessUnitSelect = document.getElementById("business-unit");
    const customerLocationSelect = document.getElementById("customer-location");
    const companySelect = document.getElementById("company");

    if (!businessUnitSelect || !customerLocationSelect || !companySelect) {
        return; // Safety check
    }

    // 2. Fetch data from storage
    const businessUnits = getBusinessUnits();
    const locations = getLocations();
    const companies = getCompanies();

    // 3. Populate Business Unit dropdown
    businessUnitSelect.innerHTML = `<option value="">Select Business Unit</option>`;
    businessUnits.forEach(bu => {
        const option = document.createElement("option");
        option.value = bu.id;
        option.textContent = bu.name;
        businessUnitSelect.appendChild(option);
    });

    // 4. Populate Company dropdown
    companySelect.innerHTML = `<option value="">Select Company</option>`;
    companies.forEach(company => {
        const option = document.createElement("option");
        option.value = company.id;
        option.textContent = company.name;
        companySelect.appendChild(option);
    });

    // --- STEP 3: DEPENDENT DROPDOWN LOGIC ---

    // Helper to reset and disable Location dropdown
    const resetLocationDropdown = () => {
        customerLocationSelect.innerHTML = `<option value="">Select a Business Unit first</option>`;
        customerLocationSelect.disabled = true;
    };

    // Helper to populate Location dropdown based on BU
    const populateLocationDropdown = (buId) => {
        if (!buId) {
            resetLocationDropdown();
            return;
        }

        const filteredLocations = locations.filter(loc => loc.businessUnitId === buId);
        customerLocationSelect.innerHTML = `<option value="">Select Customer Location</option>`;

        filteredLocations.forEach(loc => {
            const option = document.createElement("option");
            option.value = loc.id;
            option.textContent = loc.name;
            customerLocationSelect.appendChild(option);
        });

        customerLocationSelect.disabled = false;
    };

    // Initialize dependent logic on page load
    resetLocationDropdown();

    // Listen for Business Unit changes to update Locations
    businessUnitSelect.addEventListener("change", (e) => {
        populateLocationDropdown(e.target.value);
    });

    // --- EDIT MODE PRE-FILL LOGIC ---

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
        const attribute = getById(id);
        if (attribute) {
            // Fill in the basic text fields
            const nameInput = document.getElementById("attribute-name");
            if (nameInput) nameInput.value = attribute.attributeName;

            // Set the Business Unit
            businessUnitSelect.value = attribute.businessUnitId;

            // WE MUST force the location dropdown to populate based on the BU we just set
            populateLocationDropdown(attribute.businessUnitId);

            // Now we can safely set the Location and Company
            customerLocationSelect.value = attribute.customerLocationId;
            companySelect.value = attribute.companyId;
        }
    }


}
