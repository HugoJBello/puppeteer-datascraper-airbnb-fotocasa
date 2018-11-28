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

    }

} 