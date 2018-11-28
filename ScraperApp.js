const ScraperDataAccess = require("./ScraperDataAccess");
const ScrapingIndexCreator = require("./ScrapingIndexCreator");
const FotocasaBoxScraper = require("./scrapers/FotocasaBoxScraper");

module.exports = class ScraperApp {
    constructor(){
        require('dotenv').load();
        this.db = new ScraperDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"], process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);
        this.indexCreator = new ScrapingIndexCreator();
        this.configPath = "./config/scrapingConfig.json";
        this.config = require(this.configPath);
        this.scraper = new FotocasaBoxScraper();
    }

    async startScraper(){
        const numPieces = await this.db.countIndexEntries();
        if (!numPieces || numPieces===0){
            await this.indexCreator.regenerateScrapingIndex();
        }
        let nextPieceToScrap = await this.db.getNextPieceToScrap();
        console.log(nextPieceToScrap);
        while (nextPieceToScrap){
            console.log("----\n scraping " + nextPieceToScrap.piece_id + "\n----");
            const boundingBox = [[nextPieceToScrap.bounding_box1_x, nextPieceToScrap.bounding_box1_y],
            [nextPieceToScrap.bounding_box2_x, nextPieceToScrap.bounding_box2_y]];
            const centerPoint = [nextPieceToScrap.center_point_x, nextPieceToScrap.center_point_y];
            
            const dataBuy = await this.scraper.extractDataFromBox(boundingBox, centerPoint, "comprar");
            const dataRent = await this.scraper.extractDataFromBox(boundingBox, centerPoint, "alquiler");
            await this.saveData(nextPieceToScrap,dataBuy,dataRent);
            await this.saveActivityInLog(nextPieceToScrap);
            await this.db.setIndexPieceAsScraped(nextPieceToScrap.piece_id);

            nextPieceToScrap= await this.db.getNextPieceToScrap();
        }

        await this.db.setIndexAsNotScraped();
        
    }

    async saveData(nextPieceToScrap,dataBuy,dataRent){
        console.log("saving new data in database for " + nextPieceToScrap.piece_id);
        console.log(dataBuy);
        const record = {
            piece_id: nextPieceToScrap.piece_id, scraping_id: this.config.sessionId,
            app_id: this.config.appId, device_id: this.config.deviceId,
            average_prize_buy: dataBuy.averagePrize, number_of_ads_buy: dataBuy.numberOfAds,
            average_prize_rent: dataRent.averagePrize, number_of_ads_rent: dataRent.numberOfAds, extra_data: ""
        }
        await this.db.saveScrapingResults(record);
    }

    async saveActivityInLog(nextPieceToScrap){
        console.log("updating activity log");
        const record = { scraping_id: this.config.sessionId, last_piece: nextPieceToScrap.piece_id }
        await this.db.saveExecutionLog(record);
    }

} 