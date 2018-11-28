const ScraperDataAccess = require("./ScraperDataAccess");
const ScrapingIndexCreator = require("./ScrapingIndexCreator");
const FotocasaBoxScraper = require("./scrapers/FotocasaBoxScraper");

module.exports = class ScraperApp {
    constructor(){
        this.db = new ScraperDataAccess();
        this.indexCreator = new ScrapingIndexCreator();
        this.configPath = "./config/scrapingConfig.json";
        this.config = require(this.configPath);
        this.scraper = new FotocasaBoxScraper();
    }

    async startScraper(){
        let nextPieceToScrap = this.db.getNextPieceToScrap();

        while (nextPieceToScrap){
            const boundingBox = [[nextPieceToScrap.bounding_box1_x, nextPieceToScrap.bounding_box1_y],
            [nextPieceToScrap.bounding_box2_x, nextPieceToScrap.bounding_box2_y]];
            const centerPoint = [nextPieceToScrap.center_point_x, nextPieceToScrap.center_point_y];
            
            const dataBuy = this.scraper.extractDataFromBox(boundingBox, centerPoint, "comprar");
            const dataRent = this.scraper.extractDataFromBox(boundingBox, centerPoint, "alquilar");
            await this.saveData(nextPieceToScrap,dataBuy,dataRent);
            nextPieceToScrap=this.db.getNextPieceToScrap();
        }

        
    }

    async saveData(nextPieceToScrap,dataBuy,dataRent){
        const record = {
            piece_id: "testId-piece-0-0", scraping_id: "scraping-id-test", app_id: "app-test", device_id: "device-test",
            average_prize_buy: 2.2, number_of_ads_buy: 2, average_prize_rent: 2.2, number_of_ads_rent: 3, extra_data: "bla bla 66[]"
        }
        result = await db.saveScrapingResults(record);
    }

} 