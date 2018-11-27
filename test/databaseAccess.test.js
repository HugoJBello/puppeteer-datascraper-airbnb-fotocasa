const chai = require('chai');
const assert = chai.assert;

const expect = chai.expect;

const ScraperDataAccess = require("../ScraperDataAccess");
require('dotenv').load();
describe('App', function () {
    this.timeout(150000);

    describe('test crud operations in db', async function () {
        const db = new ScraperDataAccess(process.env["MYSQL_HOST"], process.env["MYSQL_USER"], process.env["MYSQL_PASSWORD"], process.env["MYSQL_DATABASE"]);
        db.tableCreatorScriptPath = '../mantainance/initialize.sql'
        it('should run the creation table script', async function () {
            result = await db.createTables();
            assert(result !== null);
        });

        it('should insert in index', async function () {
            const record = {
                piece_id: "testId-piece-0-0", piece_name: "piece-0-0", city_name: "Test City", scraped: true,
                boundingBox1X: 0.22, boundingBox1Y: 1.33, boundingBox2X: 1.44, boundingBox2Y: 0.22
            }
            result = await db.saveScrapingPiecesIndex(record);
            assert(result !== null);
        });

        it('should insert in results', async function () {
            //REPLACE INTO scraping_results (piece_id, scraping_id, app_id, device_id, date_scraped, average_prize_buy, number_of_ads_buy, 
            // average_prize_rent, number_of_ads_rent, extra_data) 
            // values("testId-piece-0-0", "scraping-id-test", "app-test", 
            // "device-test", sysdate(), 14.44, 4, 123.44, 6, "bla bla bla []");
            const record = {
                piece_id: "testId-piece-0-0", scraping_id: "scraping-id-test", app_id: "app-test", device_id: "device-test",
                average_prize_buy: 2.2, number_of_ads_buy: 2, average_prize_rent: 2.2, number_of_ads_rent: 3, extra_data: "bla bla 66[]"
            }
            result = await db.saveScrapingResults(record);
            assert(result !== null);
        });

        it('should insert in executions', async function () {
            //REPLACE INTO scraping_execution_log (scraping_id, last_piece) values ("scraping-id-test", "testId-piece-0-0");
            const record = { scraping_id: "scraping-id-test", last_piece: "testId-piece-0-0" }
            result = await db.saveExecutionLog(record);
            assert(result !== null);
        });

    });

});