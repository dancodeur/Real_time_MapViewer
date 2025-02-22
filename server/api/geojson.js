import data from "../data/geojson/regions.json"
export default defineEventHandler(async (event) => {
 
  return data;
});


