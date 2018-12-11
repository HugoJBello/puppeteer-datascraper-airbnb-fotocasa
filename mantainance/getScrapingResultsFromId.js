const ScraperDataAccess = require('../ScraperDataAccess');
const ObjectsToCsv = require('objects-to-csv');
const GeojsonGeneratorFromBoundingBox = require('./GeoJsonGeneratorFromBoundingBox');
const GeojsonGeneratorFromCusec = require('./GeoJsonGeneratorFromCusec');

const fs = require('fs');

require('dotenv').load();

(async () => {
    const db = new ScraperDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"], process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);
    const geojsonGenBoundingBox = new GeojsonGeneratorFromBoundingBox();
    const geojsonGenCusec = new GeojsonGeneratorFromCusec();

    //const id = "scraping-airbnb-gCloud--2018-11-29_14_04_43";
    //const id = "scraping-fotocasa-gCloud--12_7_2018,_7_11_51_AM";
    const id = "scraping-fotocasa-raspberryOld--12_9_2018,_8_31_26_AM";
    const outputPath = "tmp";
    const cities = await db.getScrapedCities(id);

    console.log(cities);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    if (!fs.existsSync(outputPath + "/geoJson_output")) {
        fs.mkdirSync(outputPath + "/geoJson_output");
    }
    if (!fs.existsSync(outputPath + "/geoJson_output/" + id )) {
        fs.mkdirSync(outputPath + "/geoJson_output/" + id);
    }
    if (!fs.existsSync(outputPath + "/csv_output")) {
        fs.mkdirSync(outputPath + "/csv_output");
    }
    if (!fs.existsSync(outputPath + "/csv_output/" + id)) {
        fs.mkdirSync(outputPath + "/csv_output/" + id);
    }

    for (const city of cities) {
        const results = await db.getScrapingResultsCity(city.city_name, id);
        let csv = new ObjectsToCsv(results);
        let geoJson;
        console.log(results);
        if (results[0].method==="cusec"){
            geoJson = geojsonGenCusec.generateGeoJsonFromResultFromCusec(results);
        } else {
            geoJson = geojsonGenBoundingBox.generateGeoJsonFromResultFromBoundingBox(results);
        }
        //console.log(await csv.toString());

        const geoJsonPath = "./" + outputPath + "/geoJson_output/" + id + "/" + city.city_name + "-" + results[0].scraping_id + ".json";
        const csvPath = "./" + outputPath + "/csv_output/" + id +"/" + city.city_name + "-" + results[0].scraping_id + ".csv";
        console.log(geoJsonPath);

        csv.toDisk(csvPath,{header:true});
        fs.writeFileSync(geoJsonPath, JSON.stringify(geoJson));
    }

})()