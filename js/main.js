import { seedApplicationData } from "./storage.js";


document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const data = await seedApplicationData();

    console.log(
      "Seed successful",
      data
    );

  }
);