// js/validation.js

/**
 * Validates the Attribute Name.
 * @param {string} value - The text the user typed.
 * @param {Array} allAttributes - The list of all saved attributes (for uniqueness check).
 * @param {string} currentId - The ID of the attribute we are editing (null if adding new).
 * @param {string} currentBU - The currently selected Business Unit ID.
 * @returns {string|null} - Error message if invalid, null if valid.
 */
export function validateAttributeName(value, allAttributes, currentId, currentBU) {
    // 1. Check if it's empty
    if (!value || value.trim() === "") {
        return "Attribute name is required.";
    }

    // 2. Check length
    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 100) {
        return "Attribute name must be between 3 and 100 characters.";
    }

    // 3. Check regex (Allowed characters)
    const validRegex = /^[A-Za-z0-9 _-]+$/;
    if (!validRegex.test(trimmed)) {
        return "Attribute name can only contain letters, numbers, spaces, underscores, and dashes.";
    }

    // 4. Check Uniqueness within the same Business Unit
    // We convert everything to lowercase to make it case-insensitive
    const nameLower = trimmed.toLowerCase();

    const isDuplicate = allAttributes.some(attr => {
        // Skip comparing against itself if we are editing an existing attribute
        if (currentId && attr.id === currentId) {
            return false;
        }

        // It's a duplicate if the name matches AND it's in the same Business Unit
        return attr.businessUnitId === currentBU &&
            attr.attributeName.toLowerCase() === nameLower;
    });

    if (isDuplicate) {
        return "This attribute name already exists within the selected Business Unit.";
    }

    // If it passed all tests, return null (meaning "no errors")
    return null;
}

/**
 * Validates the Business Unit selection.
 */
export function validateBusinessUnitId(value) {
    if (!value || value.trim() === "") {
        return "Business Unit is required.";
    }
    return null;
}

/**
 * Validates the Location selection.
 * @param {string} locationId - The selected location ID.
 * @param {string} buId - The selected Business Unit ID.
 * @param {Array} allLocations - Array of all location objects from lookups.js
 */
export function validateCustomerLocationId(locationId, buId, allLocations) {
    if (!locationId || locationId.trim() === "") {
        return "Customer Location is required.";
    }

    // Defense in Depth: Ensure the location actually belongs to the chosen BU
    if (buId) {
        const locationObj = allLocations.find(loc => loc.id === locationId);
        if (locationObj && locationObj.businessUnitId !== buId) {
            return "Selected location does not belong to the selected Business Unit.";
        }
    }
    return null;
}

/**
 * Validates the Company selection.
 */
export function validateCompanyId(value) {
    if (!value || value.trim() === "") {
        return "Company is required.";
    }
    return null;
}

/**
 * Validates the Created On date.
 */
export function validateCreatedOn(value) {
    if (!value || value.trim() === "") {
        return "Created On date is required.";
    }

    // Check if it's a valid date
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return "Please enter a valid date.";
    }

    // Check if it's in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today to allow today's date
    if (date > today) {
        return "Created On date cannot be in the future.";
    }

    return null;
}

/**
 * Validates the Notes field (Optional, max 500 chars).
 */
export function validateNotes(value) {
    if (value && value.trim().length > 500) {
        return "Notes cannot exceed 500 characters.";
    }
    return null;
}
