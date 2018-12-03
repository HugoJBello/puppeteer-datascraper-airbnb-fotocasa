const ScraperDataAccess = require('../ScraperDataAccess');
const ObjectsToCsv = require('objects-to-csv');
const GeojsonGeneratorFromResult = require('./GeoJsonGeneratorFromResult');
const fs = require('fs');

require('dotenv').load();

(async () => {
    const db = new ScraperDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"], process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);
    const geojsonGen = new GeojsonGeneratorFromResult();
    const id = "scraping-airbnb-gCloud--2018-11-29_14_04_43";
    const outputPath = "geoJson_output";
    const cities = await db.getScrapedCities(id);

    console.log(cities);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }

    for (const city of cities) {
        const results = await db.getScrapingResultsCity(city.city_name, id);
        let csv = new ObjectsToCsv(results);

        const filename = city.city_name + "-" + results[0].scraping_id + ".json";
        const geoJson = geojsonGen.generateGeoJsonFromResult(results);
        //console.log(await csv.toString());

        const geoJsonPath = "./" + outputPath + "/" + filename;
        console.log(geoJsonPath);
        fs.writeFileSync(geoJsonPath, JSON.stringify(geoJson));
    }

})()