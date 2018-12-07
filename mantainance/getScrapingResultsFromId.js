const ScraperDataAccess = require('../ScraperDataAccess');
const ObjectsToCsv = require('objects-to-csv');
const GeojsonGeneratorFromResult = require('./GeoJsonGeneratorFromResult');
const fs = require('fs');

require('dotenv').load();

(async () => {
    const db = new ScraperDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"], process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);
    const geojsonGen = new GeojsonGeneratorFromResult();

    //const id = "scraping-airbnb-gCloud--2018-11-29_14_04_43";
    //const id = "scraping-fotocasa-gCloud--12_7_2018,_7_11_51_AM";
    const id = "scraping-airbnb-raspberry3bp--2018-11-29_14_04_43";
    const outputPath = "tmp";
    const cities = await db.getScrapedCities(id);

    console.log(cities);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    if (!fs.existsSync(outputPath + "/geoJson_output")) {
        fs.mkdirSync(outputPath + "/geoJson_output");
    }
    if (!fs.existsSync(outputPath + "/csv_output")) {
        fs.mkdirSync(outputPath + "/csv_output");
    }

    for (const city of cities) {
        const results = await db.getScrapingResultsCity(city.city_name, id);
        let csv = new ObjectsToCsv(results);

        const geoJson = geojsonGen.generateGeoJsonFromResult(results);
        //console.log(await csv.toString());

        const geoJsonPath = "./" + outputPath + "/geoJson_output/" + city.city_name + "-" + results[0].scraping_id + ".json";
        const csvPath = "./" + outputPath + "/csv_output/" + city.city_name + "-" + results[0].scraping_id + ".csv";
        console.log(geoJsonPath);

        csv.toDisk(csvPath);
        fs.writeFileSync(geoJsonPath, JSON.stringify(geoJson));
    }

})()