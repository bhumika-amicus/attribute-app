import { seedApplicationData } from "./storage.js";
import {initList} from "./list.js";



document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await seedApplicationData();

    initList();

  }
);