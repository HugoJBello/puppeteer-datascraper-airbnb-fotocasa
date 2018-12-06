
const ExtractBoundingBoxScraper = require('./scrapers/ExtractBoundingBoxScraper')
const ScraperDataAccess = require('./ScraperDataAccess');
require('dotenv').load();

module.exports = class ScrapingIndexCreator {
    constructor(citiesPath = './config/cities.json', configPath = './config/scrapingConfig.json', sqlCreationPath = "./mantainance/initialize.sql") {
        this.citiesPath = citiesPath;
        this.configPath = configPath;
        this.config = require(this.configPath);
        this.cities = require(this.citiesPath).cities;
        this.scraper = new ExtractBoundingBoxScraper();
        this.db = new ScraperDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"],
            process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"], sqlCreationPath);

        this.mapDir = "./data/";
        this.geoJson = require(this.mapDir + "SECC_CPV_E_20111101_01_R_INE_MADRID_cs_epsg.geojson.json");
        this.maxSize = 0.005;
        this.maxNumberRows = 65; // aprox Math.sqrt(1000);
        this.minNumberRows = 4;

    }

    async regenerateScrapingIndex() {
        try {
            await this.db.dropIndex(this.config.deviceId);
        } catch (err) {
            console.log(err);
        }
        try {
            await this.db.createTables();
        } catch (err) {
            console.log(err);
        }


        this.scrapingIndex = []

        const citiesFeaturesObject = this.extractCityFeatures(this.cities);

        for (const cityName of this.cities) {

            const features = citiesFeaturesObject[cityName];

            for (const cusecFeature of features) {
                const cusec = cusecFeature["cusec"];
                console.log("saving piece " + cusec + " from " + cityName);
                const boundingBox = cusecFeature.boundingBox;
                const centerPoint = cusecFeature.centerPoint;
                const geojsonGeometry = cusecFeature.geojsonGeometry
                const pieceName = cusec;
                const pieceId = cityName + "--" + pieceName + "--" + this.config.deviceId;

                const record = {
                    piece_id: pieceId, piece_name: pieceName, city_name: cityName, device_id: this.config.deviceId, scraped: false,
                    bounding_box1_x: boundingBox[0][0], bounding_box1_y: boundingBox[0][1],
                    bounding_box2_x: boundingBox[1][0], bounding_box2_y: boundingBox[1][1],
                    center_point_x: centerPoint[0], center_point_y: centerPoint[1],
                    geojson_coordinates:geojsonGeometry, method:"cusec"
                }
                this.scrapingIndex.push(record);
                await this.db.saveScrapingPiecesIndex(record);

            }
        }
        console.log(this.scrapingIndex);
    }

    extractCityFeatures(cities) {
        console.log("extracting features from geojson ");
        const result = {};
        for (const city of cities) {
            result[city] = [];
        }

        for (const feature of this.geoJson.features) {
            if (cities.includes(feature.properties["NMUN"])) {
                let procFeature = this.processFeature(feature);
                result[feature.properties["NMUN"]].push(procFeature);
            }
        }
        return result;
    }

    processFeature(feature) {
        let processedFeature = {};
        processedFeature["cusec"] = feature.properties["CUSEC"];
        //processedFeature["coordinates"] = feature["geometry"].coordinates;
        //processedFeature["type"] = feature["geometry"].type;
        const boundingBox = this.getBoundingBox(feature["geometry"].coordinates, feature["geometry"].type);
        processedFeature["boundingBox"] = boundingBox;
        const centerPoint = this.getCenterPoint(boundingBox);
        processedFeature["centerPoint"] = centerPoint;
        processedFeature["geojsonGeometry"] =JSON.stringify({geometry:feature["geometry"]}).replace(new RegExp("\"", 'g'), "'");;
        return processedFeature;

    }

    getBoundingBox(coordinates, type) {
        if (type === "MultiPolygon") {
            let maxX = -180;
            let maxY = -180;
            let minX = 180;
            let minY = 180;
            /*
            let boundingBox = [coordinates[0][0][0], coordinates[0][0][0]];
            //console.log("\n------------------------------");
            //console.log(coordinates[0][0]);
            const reducer = (currentBBox, currentValue) => {
                return [
                    [Math.min(currentValue[0], currentBBox[0][0]), Math.max(currentValue[1], currentBBox[0][1])],
                    [Math.max(currentValue[0], currentBBox[1][0]), Math.min(currentValue[1], currentBBox[1][1])]
                ]
            }
            return coordinates[0][0].reduce(reducer, boundingBox);
            */
            for (const point of coordinates[0][0]) {
                maxX = Math.max(point[0], maxX);
                maxY = Math.max(point[1], maxY);
                minX = Math.min(point[0], minX);
                minY = Math.min(point[1], minY);
            }
            return [[minX, maxY], [maxX, minY]];
        }
    }


    getCenterPoint(boundingBox) {
        return [(boundingBox[0][0] + boundingBox[1][0]) / 2, (boundingBox[0][1] + boundingBox[1][1]) / 2]
    }


}