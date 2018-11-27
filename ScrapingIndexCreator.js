
const ExtractBoundingBoxScraper = require('./scrapers/ExtractBoundingBoxScraper')
const ScraperDataAcess = require('./ScraperDataAccess');

module.exports = class ScrapingIndexCreator {
    constructor() {
        this.citiesPath = './config/cities.json';
        this.cities = require(this.citiesPath);
        this.scraper = new ExtractBoundingBoxScraper();
        this.db = new ScraperDataAcess();

    }

    async regenerateScrapingIndex() {
        await this.db.dropIndex();

        await this.db.createTables();

        this.scrapingIndex = []

        for (const cityName of this.cities) {
            const boundingBox = await this.scraper.extractBoundingBoxFromCityName(cityName);
            const boxSize = Math.min(parseFloat(-boundingBox[0][0]) + parseFloat(boundingBox[1][0]), parseFloat(boundingBox[0][1]) - parseFloat(boundingBox[1][1]));

            const distX = parseFloat(boundingBox[1][0]) - parseFloat(boundingBox[0][0]);
            const distY = parseFloat(boundingBox[0][1]) - parseFloat(boundingBox[1][1]);


            console.log(boxSize);

            if ((distX) > 0) {
                console.log("generating index and pieces");
                let lengthX = this.calculateNumberRows(distX)
                let lengthY = this.calculateNumberRows(distY)

                const childrenSmallBoxes = this.popullateBoundingBoxWithPieces(boundingBox, distX, distY, lengthX, lengthY)
                
                for (const pieceName in childrenSmallBoxes){
                    const pieceId = cityName + "--" + pieceName;
                    const boundingBox = childrenSmallBoxes[pieceName];
                    const centerPoint = this.getCenterPoint(boundingBox);


                    const record = {
                        piece_id: pieceId, piece_name: pieceName, city_name: cityName, scraped: false,
                        bounding_box1_x: boundingBox[0][0], bounding_box1_y: boundingBox[0][1],
                        bounding_box2_x: boundingBox[1][0], bounding_box2_y: boundingBox[1][1],
                        center_point_x:centerPoint[0], center_point_y:centerPoint[1]
                    }
                    this.scrapingIndex.push(record);
                    this.db.saveScrapingPiecesIndex(record);
                    
                }
            }
        }
    }

    
    calculateNumberRows(boxSize) {
        let result = Math.floor(boxSize / this.maxSize)
        // we make sure the number is not too small (must be bigger than minNumberRows)
        result = Math.max(result, this.minNumberRows);

        // we make sure the number is not too big
        result = Math.min(result, this.maxNumberRows);
        return result;
    }
    popullateBoundingBoxWithPieces(boundingBox, distX, distY, lengthX, lengthY) {
        let childrenSmallBoxes = {}

        for (let i = 0; i < lengthX; i++) {
            for (let j = 0; j < lengthY; j++) {

                const newBox00 = parseFloat(boundingBox[0][0]) + (i / lengthX) * distX;
                const newBox01 = parseFloat(boundingBox[0][1]) - (j / lengthY) * distY;
                const newBox10 = newBox00 + (1 / lengthX) * distX;
                const newBox11 = newBox01 - (1 / lengthY) * distY;

                const box = [[newBox00, newBox01], [newBox10, newBox11]]
                const pieceBoxId = "piece--" + i + "-" + j;
                childrenSmallBoxes[pieceBoxId] = {
                    boundingBox: box, centerPoint: this.getCenterPoint(box)
                };
            }
        }
        return childrenSmallBoxes;
    }

    getCenterPoint(boundingBox) {
        return [(boundingBox[0][0] + boundingBox[1][0]) / 2, (boundingBox[0][1] + boundingBox[1][1]) / 2]
    }


}