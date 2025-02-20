import geoData from '../data/geoData.json'; 
export default defineEventHandler(async (event) => {
    return {
        message: 'Success',
        data: geoData
    } 
})
