// js/list.js

import { getAll ,getSortedAttributes } from "./attributes.js";
import {getBusinessUnits, getLocations, getCompanies} from "./lookups.js";
import { formatFullDate } from "./dateUtils.js";
import { $, createFragment } from "./dom.js";


const state = {
    search: "",
    businessUnit: "",
    status: "",

    sortColumn: "",
    sortDirection: "none"
};

let tableBody;
let resultsStatus;

let searchInput;
let businessUnitSelect;
let statusSelect;

let tableHead;

function debounce(callback, delay) {

    let timeoutId;

    return (...args) => {

        clearTimeout(timeoutId);

        timeoutId = setTimeout(
            () => callback(...args),
            delay
        );

    };

}

function updateUrlFromState() {

    const params =
        new URLSearchParams();

    if (state.search) {

        params.set(
            "search",
            state.search
        );

    }

    if (state.businessUnit) {

        params.set(
            "businessUnit",
            state.businessUnit
        );

    }

    if (state.status) {

        params.set(
            "status",
            state.status
        );

    }
    const queryString = params.toString();
    history.replaceState(
        null,
        "",
        queryString
            ? `?${queryString}`
            : window.location.pathname)
}

function loadStateFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    state.search =
        params.get("search") || "";

    state.businessUnit =
        params.get("businessUnit") || "";

    state.status =
        params.get("status") || "";

}


export function initList() {

    tableHead = $("#attribute-table thead");

    tableBody =
        document.getElementById(
            "attribute-table-body"
        );
    resultsStatus =
        document.getElementById(
            "results-status"
        );


    searchInput =
        document.getElementById(
            "search"
        );

    businessUnitSelect =
        document.getElementById(
            "business-unit"
        );

    statusSelect =
        document.getElementById(
            "status"
        );

    // Read filters from URL
    loadStateFromUrl();

    // Put state values back into UI
    searchInput.value =
        state.search;

    businessUnitSelect.value =
        state.businessUnit;

    statusSelect.value =
        state.status;

    searchInput?.addEventListener(
        "input",
        debounce(event => {

            state.search =
                event.target.value;

            updateUrlFromState();

            render();

        }, 500)
    );



    businessUnitSelect?.addEventListener(
        "change",
        event => {

            state.businessUnit =
                event.target.value;

            updateUrlFromState();

            render();

        }
    );

    statusSelect?.addEventListener(
        "change",
        event => {

            state.status =
                event.target.value;

            updateUrlFromState();

            render();

        }
    );
    //one listener on tablehead for event delegation
    tableHead.addEventListener(
        "click",
        handleSortClick
    );

    const filterForm =
        document.getElementById(
            "filter-form"
        );

    filterForm?.addEventListener(
        "submit",
        event => event.preventDefault()
    );



    render();
}


function handleSortClick(event) {

    const header =
        event.target.closest(
            "[data-sort]"
        );

    if (!header) {
        return;
    }

    const column =
        header.dataset.sort;

    updateSortState(column);

    updateSortIndicators();

    console.log(
        state.sortColumn,
        state.sortDirection
    );

    render();
}

function updateSortState(column) {

    if (
        state.sortColumn !== column
    ) {

        state.sortColumn =
            column;

        state.sortDirection =
            "ascending";

        return;
    }

    if (
        state.sortDirection ===
        "ascending"
    ) {

        state.sortDirection =
            "descending";

        return;
    }

    if (
        state.sortDirection ===
        "descending"
    ) {

        state.sortDirection =
            "none";

        state.sortColumn =
            "";

        return;
    }

    state.sortDirection =
        "ascending";
}

function updateSortIndicators() {

    const headers =
        tableHead.querySelectorAll(
            "[data-sort]"
        );

    headers.forEach(header => {

        header.setAttribute(
            "aria-sort",
            "none"
        );

    });

    if (
        !state.sortColumn ||
        state.sortDirection === "none"
    ) {

        return;

    }

    const activeHeader =
        tableHead.querySelector(
            `[data-sort="${state.sortColumn}"]`
        );

    activeHeader?.setAttribute(
        "aria-sort",
        state.sortDirection
    );

}


function getFilteredAttributes() {

    const attributes =
        getAll();

    return attributes.filter(
        attribute => {

            const matchesSearch =
                attribute.attributeName
                    .toLowerCase()
                    .includes(
                        state.search
                            .trim()
                            .toLowerCase()
                    );

            const matchesBusinessUnit =
                !state.businessUnit ||
                attribute.businessUnitId ===
                state.businessUnit;

            const matchesStatus =
                !state.status ||
                (
                    state.status === "active"
                        ? attribute.isActive
                        : !attribute.isActive
                );

            return (
                matchesSearch &&
                matchesBusinessUnit && matchesStatus
            );

        }
    );

}
/*
    Main render function
*/

export function render() {


    const filteredAttributes =
        getFilteredAttributes();

   
    const businessUnits =
        getBusinessUnits();

    const locations =
        getLocations();

    const companies =
        getCompanies();
    
    const attributes =
        getSortedAttributes(
            filteredAttributes,
            state.sortColumn,
            state.sortDirection
        );


    tableBody.replaceChildren();

    const fragment =createFragment();
    
    attributes.forEach(attribute => {

        const row =
            createRow(attribute,
                businessUnits,
                locations,
                companies);
        fragment.appendChild(row);

    });

    tableBody.appendChild(fragment);

    announceResults(
        attributes.length
    );

}


/*
    Create one table row
    Uses createElement only.
*/
function createRow(attribute, businessUnits, locations, companies) {

    /*
       Attribute name
   */

    const tr =
        document.createElement("tr");
    const nameCell =
        document.createElement("th");


    nameCell.scope = "row";

    nameCell.textContent =
        attribute.attributeName;

    tr.appendChild(nameCell);

    /*
        Business Unit
    */
    const businessUnit = businessUnits.find(unit => unit.id === attribute.businessUnitId);
    const businessCell = createCell(businessUnit?.name ?? "-");

    tr.appendChild(businessCell);

    /*
        Location
    */
    const location = locations.find(unit => unit.id === attribute.customerLocationId);
    const locationCell = createCell(location?.name ?? "-");
    tr.appendChild(locationCell);

    /*
        Company
    */
    const company = companies.find(unit => unit.id === attribute.companyId);
    const companyCell = createCell(company?.name ?? "-");
    tr.appendChild(companyCell);
    /*
        Status badge
    */
    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.classList.add("badge");
    if (attribute.isActive) {

        badge.classList.add("badge--active");
        badge.textContent = "Active";
    } else {
        badge.classList.add("badge--inactive");
        badge.textContent = "Inactive";
    }
    statusCell.appendChild(badge);
    tr.appendChild(statusCell);

    /*
        Created Date
    */
    const createdCell =
        createCell(
            formatFullDate(
                attribute.createdOn
            )
        );

    tr.appendChild(createdCell);

    /* Actions */
    const actionCell = document.createElement("td");
    const actionsWrapper = document.createElement("div");
    actionsWrapper.classList.add("action-buttons", "cluster");

    const editLink =
        document.createElement("a");


    editLink.classList.add(
        "btn",
        "btn--ghost"
    );
    editLink.href =
        `edit-attribute.html?id=${attribute.id}`;

    editLink.textContent =
        "Edit";

    const deleteButton =
        document.createElement("button");


    deleteButton.type =
        "button";


    deleteButton.classList.add(
        "btn",
        "btn--danger",
        "delete-button"
    );


    deleteButton.dataset.id =
        attribute.id;


    deleteButton.textContent =
        "Delete";

    actionsWrapper.appendChild(
        editLink
    );

    actionsWrapper.appendChild(
        deleteButton
    );

    actionCell.appendChild(
        actionsWrapper
    );

    tr.appendChild(
        actionCell
    );

    return tr;
}

/*
    Create normal table cell
*/
function createCell(value) {
    const td =
        document.createElement("td");

    td.textContent =
        value;
    return td;
}
/*
    Accessibility announcement
*/

function announceResults(count) {

    if (resultsStatus) {
        resultsStatus.textContent =
            `${count} attributes shown`;
    }
}

