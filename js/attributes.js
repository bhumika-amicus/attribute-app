import {
  loadAttributes,
  loadBusinessUnits,
  loadCompanies,
  loadLocations,
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

export function getBusinessUnits() {

  return loadBusinessUnits();

}


export function getLocations() {

  return loadLocations();

}


export function getCompanies() {

  return loadCompanies();

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

      if(attribute.id === id){

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