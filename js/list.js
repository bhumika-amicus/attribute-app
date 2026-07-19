// js/list.js

import { getAll, getSortedAttributes, remove } from "./attributes.js";
import { getBusinessUnits, getLocations, getCompanies } from "./lookups.js";
import { formatFullDate } from "./dateUtils.js";
import { $, createFragment } from "./dom.js";


const state = {
    search: "",
    businessUnit: "",
    status: "",

    sortColumn: "",
    sortDirection: "none",

    currentPage: 1,
    rowsPerPage: 5
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

    if (state.currentPage > 1) {
        params.set("page", state.currentPage);
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

    const pageParam = params.get("page");
    state.currentPage = pageParam ? parseInt(pageParam, 10) : 1;
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

            state.currentPage = 1;

            updateUrlFromState();

            render();

        }, 500)
    );



    businessUnitSelect?.addEventListener(
        "change",
        event => {

            state.businessUnit =
                event.target.value;

            state.currentPage = 1;

            updateUrlFromState();

            render();

        }
    );

    statusSelect?.addEventListener(
        "change",
        event => {

            state.status =
                event.target.value;

            state.currentPage = 1;

            updateUrlFromState();

            render();

        }
    );
    //one listener on tablehead for event delegation
    tableHead.addEventListener(
        "click",
        handleSortClick
    );

    const paginationList = document.getElementById("pagination-list");

    paginationList?.addEventListener("click", handlePaginationClick);

    tableBody.addEventListener("click", handleTableClick);

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

    //index and slicing for pagination
    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const endIndex = startIndex + state.rowsPerPage;
    const paginatedAttributes = attributes.slice(startIndex, endIndex);

    tableBody.replaceChildren();
    const fragment = createFragment();

    paginatedAttributes.forEach(attribute => {

        const row =
            createRow(attribute,
                businessUnits,
                locations,
                companies);
        fragment.appendChild(row);

    });

    tableBody.appendChild(fragment);

    renderPagination(attributes.length);

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
    deleteButton.dataset.name =
        attribute.attributeName;


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

function handlePaginationClick(event) {
    const target = event.target;
    const button = target.closest("button");
    if (!button || button.disabled) {
        return;
    }

    const newPage = parseInt(button.dataset.page, 10);

    //do not render if on same page 
    if (newPage && newPage !== state.currentPage) {
        state.currentPage = newPage;
        updateUrlFromState();
        render();
    }
}

function renderPagination(totalItems) {
    const paginationList = document.getElementById("pagination-list");
    if (!paginationList) return;

    paginationList.replaceChildren();

    // Total number of pages 
    const totalPages = Math.ceil(totalItems / state.rowsPerPage);
    if (totalPages === 0) {
        return;
    }

    const fragment = createFragment();

    // Prev Button
    const prevLi = document.createElement("li");
    prevLi.classList.add("pagination__item");
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.classList.add("pagination__button");

    //find previous page 
    prevBtn.dataset.page = state.currentPage - 1;
    //dont find previous if current page is 1 as it will be 0
    prevBtn.disabled = state.currentPage === 1;

    prevBtn.setAttribute("aria-label", "Previous page");
    prevBtn.textContent = "← Prev";
    prevLi.appendChild(prevBtn);
    fragment.appendChild(prevLi);


    // Numbered Pages
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement("li");
        pageLi.classList.add("pagination__item");
        const pageBtn = document.createElement("button");
        pageBtn.type = "button";

        // In the original, the active state is .pagination__link--active, 
        // but here it's a button. We will use a button instead of a link.
        pageBtn.classList.add("pagination__link");
        if (i === state.currentPage) {
            pageBtn.classList.add("pagination__link--active");
            pageBtn.setAttribute("aria-current", "page");
        }

        pageBtn.dataset.page = i;
        pageBtn.setAttribute("aria-label", `Page ${i}`);
        pageBtn.textContent = i;
        pageLi.appendChild(pageBtn);
        fragment.appendChild(pageLi);
    }

    // Next Button
    const nextLi = document.createElement("li");
    nextLi.classList.add("pagination__item");
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.classList.add("pagination__button");

    // find next page 
    nextBtn.dataset.page = state.currentPage + 1;
    //dont find next if current page is last page
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.setAttribute("aria-label", "Next page");
    nextBtn.textContent = "Next →";
    nextLi.appendChild(nextBtn);
    fragment.appendChild(nextLi);

    paginationList.appendChild(fragment);
}

// --- Toast & Delete Logic ---
const toastTimers = new Map();

export function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    toast.innerHTML = `
        <div class="toast__content">
            <p class="toast__title">${message}</p>
        </div>
        <button type="button" class="toast__close" aria-label="Close notification">
            &times;
        </button>
    `;

    container.appendChild(toast);

    // Close button logic
    const closeBtn = toast.querySelector(".toast__close");
    closeBtn.addEventListener("click", () => {
        if (toastTimers.has(toast)) {
            clearTimeout(toastTimers.get(toast));
            toastTimers.delete(toast);
        }
        toast.remove();
    });

    // Auto-dismiss after 3s
    const timerId = setTimeout(() => {
        toast.remove();
        toastTimers.delete(toast);
    }, 3000);

    // Track timer for this specific toast to handle cleanup if closed manually
    toastTimers.set(toast, timerId);
}

function handleTableClick(event) {
    const deleteBtn = event.target.closest(".delete-button");
    if (!deleteBtn) return;

    const id = deleteBtn.dataset.id;
    const name = deleteBtn.dataset.name;

    if (confirm(`Are you sure you want to delete ${name}?`)) {
        remove(id);

        // Adjust pagination if we deleted the last item on the current page
        const filteredAttributes = getFilteredAttributes();
        const totalPages = Math.ceil(filteredAttributes.length / state.rowsPerPage);
        if (state.currentPage > totalPages && totalPages > 0) {
            state.currentPage = totalPages;
            updateUrlFromState();
        }

        render();
        showToast(`Deleted Attribute '${name}'`);
    }
}

