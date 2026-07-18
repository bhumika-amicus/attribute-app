import {
  loadAttributes,
  saveAttributes
} from "./storage.js";


export function getAll() {

  return loadAttributes();

}


export function getById(id) {

  const attributes = getAll();

  return attributes.find(
    attribute => attribute.id === id
  );

}


export function remove(id) {

  const attributes = getAll();


  const updatedAttributes =
    attributes.filter(
      attribute => attribute.id !== id
    );


  saveAttributes(
    updatedAttributes
  );


  return updatedAttributes;

}


export function create(attribute) {

  const attributes = getAll();


  attributes.push(attribute);


  saveAttributes(
    attributes
  );


  return attribute;

}


export function update(id, updatedData) {

  const attributes = getAll();


  const updatedAttributes =
    attributes.map(attribute => {

      if (attribute.id === id) {

        return {
          ...attribute,
          ...updatedData
        };

      }

      return attribute;

    });


  saveAttributes(
    updatedAttributes
  );


  return updatedAttributes;

}

export function getSortedAttributes(
  attributes,
  sortColumn,
  sortDirection
) {

  if (
    !sortColumn ||
    sortDirection === "none"
  ) {
    return attributes;
  }

  const sorted = [...attributes];

  return sorted.sort(
    (a, b) =>
      compareAttributes(
        a,
        b,
        sortColumn,
        sortDirection
      )
  );
}


function compareAttributes(
  a,
  b,
  sortColumn,
  sortDirection,
  lookups
) {

  let valueA;
  let valueB;

  switch (sortColumn) {

    case "attributeName":

      valueA =
        a.attributeName;

      valueB =
        b.attributeName;

      break;

    case "businessUnit":

      valueA =
        lookups.businessUnits.find(
            bu => bu.id === a.businessUnitId
          )
          ?.name || "";

      valueB =
        lookups.businessUnits
          .find(
            bu => bu.id === b.businessUnitId
          )
          ?.name || "";

      break;

    case "location":

      valueA =
        lookups.locations.find(
            loc => loc.id === a.customerLocationId
          )
          ?.name || "";
      valueB =
        lookups.locations.find(
            loc => loc.id === b.customerLocationId
          )
          ?.name || "";
      break;

    case "company":

      valueA =
        lookups.companies
          .find(
            comp => comp.id === a.companyId
          )
          ?.name || "";
      valueB =
        lookups.companies
          .find(
            comp => comp.id === b.companyId
          )
          ?.name || "";
      break;


    case "createdOn":

      valueA =
        a.createdOn;

      valueB =
        b.createdOn;

      break;

    case "isActive":

      valueA =
        a.isActive;

      valueB =
        b.isActive;

      break;

    default:

      return 0;

  }

  let result = 0;

  if (
    typeof valueA === "string"
  ) {

    result =
      valueA.localeCompare(
        valueB
      );

  } else if (
    typeof valueA === "number"
  ) {

    result =
      valueA - valueB;

  } else if (
    typeof valueA === "boolean"
  ) {

    result =
      Number(valueA) -
      Number(valueB);

  }

  if (
    sortDirection ===
    "descending"
  ) {

    result *= -1;

  }

  return result;

}
