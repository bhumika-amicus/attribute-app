import { getBusinessUnits, getLocations, getCompanies } from "./lookups.js";
import { getById, getAll, create, update } from "./attributes.js";
import {
    validateAttributeName, validateBusinessUnitId,
    validateCustomerLocationId, validateCompanyId, validateCreatedOn,
    validateNotes
} from "./validation.js";

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
    businessUnitSelect.replaceChildren();
    const defaultBuOption = document.createElement("option");
    defaultBuOption.value = "";
    defaultBuOption.textContent = "Select Business Unit";
    businessUnitSelect.appendChild(defaultBuOption);
    businessUnits.forEach(bu => {
        const option = document.createElement("option");
        option.value = bu.id;
        option.textContent = bu.name;
        businessUnitSelect.appendChild(option);
    });

    // 4. Populate Company dropdown
    companySelect.replaceChildren();
    const defaultCompanyOption = document.createElement("option");
    defaultCompanyOption.value = "";
    defaultCompanyOption.textContent = "Select Company";
    companySelect.appendChild(defaultCompanyOption);
    companies.forEach(company => {
        const option = document.createElement("option");
        option.value = company.id;
        option.textContent = company.name;
        companySelect.appendChild(option);
    });

    // --- STEP 3: DEPENDENT DROPDOWN LOGIC ---

    // Helper to reset and disable Location dropdown
    const resetLocationDropdown = () => {
        customerLocationSelect.replaceChildren();
        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = "Select a Business Unit first";
        customerLocationSelect.appendChild(placeholderOption);
        customerLocationSelect.disabled = true;
    };

    // Helper to populate Location dropdown based on BU
    const populateLocationDropdown = (buId) => {
        if (!buId) {
            resetLocationDropdown();
            return;
        }

        const filteredLocations = locations.filter(loc => loc.businessUnitId === buId);
        customerLocationSelect.replaceChildren();
        const defaultLocOption = document.createElement("option");
        defaultLocOption.value = "";
        defaultLocOption.textContent = "Select Customer Location";
        customerLocationSelect.appendChild(defaultLocOption);

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

    // Set max date to today for created-on field
    const createdOnInput = document.getElementById("created-on");
    if (createdOnInput) {
        createdOnInput.setAttribute("max", new Date().toISOString().split("T")[0]);
    }

    // Listen for Business Unit changes to update Locations
    businessUnitSelect.addEventListener("change", (e) => {
        populateLocationDropdown(e.target.value);
        // If the user already typed an attribute name, re-validate it for uniqueness
        if (touchedFields.has("attribute-name")) {
            validateField("attribute-name");
        }
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

            // Fill in Created On and Notes
            const createdOnInput = document.getElementById("created-on");
            if (createdOnInput && attribute.createdOn) {
                createdOnInput.value = attribute.createdOn.split("T")[0];
            }

            const notesInput = document.getElementById("notes");
            if (notesInput) notesInput.value = attribute.notes;

            // Check the correct Active/Inactive radio button
            if (attribute.isActive) {
                document.getElementById("status-active").checked = true;
            } else {
                document.getElementById("status-inactive").checked = true;
            }

        }
    }


    // --- STEP 4: VALIDATION ENGINE ---

    // This Set keeps track of which fields the user has interacted with
    const touchedFields = new Set();
    const formEl = document.getElementById("attribute-form");

    /**
     * Helper to show or hide an error message on the screen.
     * @param {string} fieldId - The HTML id of the input (e.g., "attribute-name")
     * @param {string|null} errorMessage - The error string, or null if valid
     */
    const renderError = (fieldId, errorMessage) => {
        const inputEl = document.getElementById(fieldId);
        const errorSpan = document.getElementById(`${fieldId}-error`);

        if (!inputEl || !errorSpan) return;

        if (errorMessage) {
            // It's invalid! Show the error.
            errorSpan.textContent = errorMessage;
            inputEl.classList.add("form-field--invalid");
            inputEl.setAttribute("aria-invalid", "true");
        } else {
            // It's valid! Clear the error.
            errorSpan.textContent = "";
            inputEl.classList.remove("form-field--invalid");
            inputEl.removeAttribute("aria-invalid");
        }
    };

    /**
 * The Master Validator. Looks at a field's ID, finds its value, 
 * runs the specific pure function, and renders the error.
 * @returns {string|null} - The error message, or null if valid.
 */
    const validateField = (fieldId) => {
        const inputEl = document.getElementById(fieldId);
        if (!inputEl) return null;

        const value = inputEl.value;
        let errorMessage = null;

        // Route to the correct pure function based on the HTML ID
        switch (fieldId) {
            case "attribute-name":
                errorMessage = validateAttributeName(
                    value,
                    getAll(),
                    id, // 'id' from the URL (null if adding)
                    businessUnitSelect.value // currently selected BU
                );
                break;
            case "business-unit":
                errorMessage = validateBusinessUnitId(value);
                break;
            case "customer-location":
                errorMessage = validateCustomerLocationId(
                    value,
                    businessUnitSelect.value,
                    getLocations()
                );
                break;
            case "company":
                errorMessage = validateCompanyId(value);
                break;
            case "created-on":
                errorMessage = validateCreatedOn(value);
                break;
            case "notes":
                errorMessage = validateNotes(value);
                break;
        }

        renderError(fieldId, errorMessage);
        return errorMessage;
    };

    // --- STEP 6: TIMING EVENTS (Touched / Dirty logic) ---

    // 1. BLUR (focusout): When the user clicks away from a field
    formEl.addEventListener("focusout", (event) => {
        const fieldId = event.target.id;

        // Add it to our touched set because they interacted with it
        touchedFields.add(fieldId);

        // Validate it immediately
        validateField(fieldId);
    });

    // 2. INPUT: When the user is actively typing
    formEl.addEventListener("input", (event) => {
        const fieldId = event.target.id;

        // ONLY validate while typing IF they have already blurred it once.
        // This prevents yelling at the user while they are typing their very first letter.
        if (touchedFields.has(fieldId)) {
            validateField(fieldId);
        }
    });

    // --- STEP 7: SUBMIT EVENT & ERROR SUMMARY ---
    formEl.addEventListener("submit", (event) => {
        event.preventDefault(); // Stop the page from reloading!

        // The exact HTML IDs of the fields we need to check
        const fieldsToValidate = [
            "attribute-name",
            "business-unit",
            "customer-location",
            "company",
            "created-on",
            "notes"
        ];

        let hasErrors = false;
        const errorMessages = [];

        // Force every field to be "touched" and validate them all at once
        fieldsToValidate.forEach(fieldId => {
            touchedFields.add(fieldId);
            const error = validateField(fieldId);

            if (error) {
                hasErrors = true;
                // Find the label text so our summary box is user-friendly
                const label = document.querySelector(`label[for="${fieldId}"]`).textContent.trim();
                errorMessages.push({ fieldId, label, error });
            }
        });

        const errorSummaryEl = document.getElementById("form-error-summary");

        if (hasErrors) {
            errorSummaryEl.replaceChildren();

            const title = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = "Please fix the following errors before submitting:";
            title.appendChild(strong);
            errorSummaryEl.appendChild(title);

            const ul = document.createElement("ul");
            errorMessages.forEach(err => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = `#${err.fieldId}`;
                a.textContent = `${err.label}: ${err.error}`;
                li.appendChild(a);
                ul.appendChild(li);
            });
            errorSummaryEl.appendChild(ul);

            errorSummaryEl.hidden = false;

            // CRITICAL WCAG ACCESSIBILITY: Move focus to the summary box so screen readers 
            // instantly read out the errors to blind users, rather than them wondering why it didn't save.
            errorSummaryEl.setAttribute("tabindex", "-1");
            errorSummaryEl.focus();
        } else {
            // Form is perfectly valid! Hide the summary.
            errorSummaryEl.hidden = true;
            errorSummaryEl.replaceChildren();

            // --- TASK 12: SAVE & UPDATE LOGIC ---

            // 1. Gather all the data from the form into an object
            const formData = {
                attributeName: document.getElementById("attribute-name").value.trim(),
                businessUnitId: businessUnitSelect.value,
                customerLocationId: customerLocationSelect.value,
                companyId: companySelect.value,
                createdOn: document.getElementById("created-on").value,
                notes: document.getElementById("notes").value.trim(),

                // For radio buttons, we have to find which one is checked
                isActive: document.querySelector('input[name="isActive"]:checked').value === "active"
            };

            // 2. Decide if we are updating or creating
            if (id) {
                // We have an ID from the URL, so we are in Edit Mode
                update(id, formData);
            } else {
                // We are in Add Mode. We need to generate a unique ID for the new attribute!
                formData.id = "ATTR" + Date.now(); // Quick way to make a unique ID
                create(formData);
            }

            // 3. Send the user back to the dashboard
            window.location.href = "index.html";
        }

    });

    // --- STEP 8: LIVE CHARACTER COUNTER FOR NOTES ---
    const notesEl = document.getElementById("notes");
    const notesHintEl = document.getElementById("notes-hint");
    if (notesEl && notesHintEl) {
        notesEl.addEventListener("input", (e) => {
            const length = e.target.value.length;
            notesHintEl.textContent = `${length} / 500 characters`;
        });
    }


}

