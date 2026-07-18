
const STORAGE_KEYS = {
  ATTRIBUTES: "ams.attributes",
  BUSINESS_UNITS: "ams.businessUnits",
  LOCATIONS: "ams.locations",
  COMPANIES: "ams.companies",
  THEME: "ams.theme",
  SEED_VERSION: "ams.seedVersion"
};


const CURRENT_SEED_VERSION = "1.0";


/* ==========================================
   Utility Functions
========================================== */


function safeParse(value, fallback = []) {

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}


/* ==========================================
   Generic Storage Helpers
========================================== */


function saveData(key, data) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(data)
    );

  } catch (error) {

    console.error(
      `Failed saving ${key}`,
      error
    );

  }
}



function loadData(key, fallback = []) {

  try {

    const value = localStorage.getItem(key);

    return safeParse(
      value,
      fallback
    );

  } catch (error) {

    console.error(
      `Failed reading ${key}`,
      error
    );

    return fallback;
  }
}



/* ==========================================
   Attribute Storage
========================================== */


export function saveAttributes(attributes) {

  saveData(
    STORAGE_KEYS.ATTRIBUTES,
    attributes
  );

}


export function loadAttributes() {

  return loadData(
    STORAGE_KEYS.ATTRIBUTES,
    []
  );

}



export function clearAttributes() {

  localStorage.removeItem(
    STORAGE_KEYS.ATTRIBUTES
  );

}



/* ==========================================
   Theme Storage
========================================== */


export function saveTheme(theme) {

  try {

    localStorage.setItem(
      STORAGE_KEYS.THEME,
      theme
    );

  } catch(error) {

    console.error(
      "Theme save failed",
      error
    );

  }

}



export function loadTheme() {

  try {

    return (
      localStorage.getItem(
        STORAGE_KEYS.THEME
      ) || "light"
    );

  } catch(error) {

    console.error(
      "Theme load failed",
      error
    );

    return "light";
  }

}



/* ==========================================
   Seed Version Storage
========================================== */


export function saveSeedVersion(version) {

  try {

    localStorage.setItem(
      STORAGE_KEYS.SEED_VERSION,
      version
    );

  } catch(error) {

    console.error(
      "Seed version save failed",
      error
    );

  }

}



export function getSeedVersion() {

  try {

    return (
      localStorage.getItem(
        STORAGE_KEYS.SEED_VERSION
      ) || ""
    );

  } catch(error) {

    return "";
  }

}



/* ==========================================
   Seed Initial Application Data
========================================== */


export async function seedApplicationData() {


  /*
    If current seed version already exists,
    data has already been loaded.
    Skip fetching JSON files again.
  */


  if (
    getSeedVersion() === CURRENT_SEED_VERSION
  ) {

    return {
      attributes: loadData(
        STORAGE_KEYS.ATTRIBUTES
      ),
      businessUnits: loadData(
        STORAGE_KEYS.BUSINESS_UNITS
      ),
      locations: loadData(
        STORAGE_KEYS.LOCATIONS
      ),
      companies: loadData(
        STORAGE_KEYS.COMPANIES
      )
    };

  }



  try {


    const [
      attributesResponse,
      businessUnitsResponse,
      locationsResponse,
      companiesResponse

    ] = await Promise.all([

      fetch("./data/attributes.json"),

      fetch("./data/businessUnits.json"),

      fetch("./data/locations.json"),

      fetch("./data/companies.json")

    ]);



    const responses = [
      attributesResponse,
      businessUnitsResponse,
      locationsResponse,
      companiesResponse
    ];



    responses.forEach(response => {

      if (!response.ok) {

        throw new Error(
          "Failed loading seed data"
        );

      }

    });



    const [

      attributes,
      businessUnits,
      locations,
      companies

    ] = await Promise.all([

      attributesResponse.json(),

      businessUnitsResponse.json(),

      locationsResponse.json(),

      companiesResponse.json()

    ]);



    saveData(
      STORAGE_KEYS.ATTRIBUTES,
      attributes
    );


    saveData(
      STORAGE_KEYS.BUSINESS_UNITS,
      businessUnits
    );


    saveData(
      STORAGE_KEYS.LOCATIONS,
      locations
    );


    saveData(
      STORAGE_KEYS.COMPANIES,
      companies
    );



    saveSeedVersion(
      CURRENT_SEED_VERSION
    );



    return {

      attributes,

      businessUnits,

      locations,

      companies

    };



  } catch(error) {


    console.error(
      "Error seeding application data:",
      error
    );


    return {

      attributes: [],

      businessUnits: [],

      locations: [],

      companies: []

    };

  }

}



/* ==========================================
   Reset Application Data
   Trainer / Demo Utility
========================================== */


export function resetApplicationData() {


  Object.values(
    STORAGE_KEYS
  ).forEach(key => {

    localStorage.removeItem(key);

  });


}



/* ==========================================
   Helpers
========================================== */


export function hasSeedData() {

  return (
    getSeedVersion() === CURRENT_SEED_VERSION
  );

}



/* ==========================================
   Exports
========================================== */


export {
  STORAGE_KEYS,
  CURRENT_SEED_VERSION
};