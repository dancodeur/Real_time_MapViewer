import data from "../data/geojson/departements.json"
export default defineEventHandler(async (event) => {
 
  return data;
});


