// js/list.js

import { getAll, getBusinessUnits, getLocations, getCompanies } from "./attributes.js";
import { formatFullDate } from "./dateUtils.js";

let tableBody;
let resultsStatus;

export function initList() {

    tableBody =
        document.getElementById(
            "attribute-table-body"
        );
    resultsStatus =
        document.getElementById(
            "results-status"
        );
    render();
}

/*
    Main render function
*/

export function render() {


    const attributes = getAll();
    const businessUnits =
        getBusinessUnits();

    const locations =
        getLocations();

    const companies =
        getCompanies();

    tableBody.replaceChildren();

    const fragment =
        document.createDocumentFragment();

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