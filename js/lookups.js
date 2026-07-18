import {
    loadBusinessUnits,
    loadLocations,
    loadCompanies
}
from "./storage.js";


export function getBusinessUnits() {

  return loadBusinessUnits();

}


export function getLocations() {

  return loadLocations();

}


export function getCompanies() {

  return loadCompanies();

}
