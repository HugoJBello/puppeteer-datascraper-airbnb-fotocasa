const fs = require('fs');
const mysql = require('mysql');

module.exports = class ScraperDataAccess {
    constructor(mysqlHost, mysqlUser, mysqlPassword, mysqlDatabase) {
        this.mysqlHost = mysqlHost;
        this.mysqlUser = mysqlUser;
        this.mysqlPassword = mysqlPassword;
        this.mysqlDatabase = mysqlDatabase;
        this.multipleStatements = true;

        this.connection = null;
        this.tableCreatorScriptPath = './mantainance/initialize.sql';
        this.createConnection();
    }

    createConnection() {
        this.connection = mysql.createConnection({
            host: this.mysqlHost,
            user: this.mysqlUser,
            password: this.mysqlPassword,
            database: this.mysqlDatabase,
            multipleStatements: this.multipleStatements
        });
    }
    async createTables() {
        const script = fs.readFileSync(this.tableCreatorScriptPath, 'utf8');
        await this.runQuery(script);
    }

    async runQuery(script) {
        const connection = this.connection;
        return new Promise((resolve, reject) => {
            connection.query(script, function (err, rows, fields) {
                if (!err) {
                    console.log('The solution is: ', rows);
                    resolve(rows);
                } else {
                    reject(err);
                    console.log('Error while performing Query.');
                    console.log(err);
                }
            });
        });
    }

    async saveExecutionLog(executionLogRecord) {
        const sql = `REPLACE INTO scraping_execution_log(scraping_id, last_piece) 
        values("${executionLogRecord.scraping_id}", "${executionLogRecord.last_piece}")`;
        return await this.runQuery(sql);
    }

    async saveScrapingPiecesIndex(scapingPiecesIndexRecord) {
        const sql = `REPLACE INTO scraping_pieces_index 
        (piece_id, piece_name, city_name, scraped, boundingBox1X, boundingBox1Y, boundingBox2X, boundingBox2Y) VALUES("${scapingPiecesIndexRecord.piece_id}", "${scapingPiecesIndexRecord.piece_name}", "${scapingPiecesIndexRecord.city_name}", ${scapingPiecesIndexRecord.scraped}, ${scapingPiecesIndexRecord.boundingBox1X},  ${scapingPiecesIndexRecord.boundingBox1Y},  ${scapingPiecesIndexRecord.boundingBox2X}, ${scapingPiecesIndexRecord.boundingBox2Y});`;
        console.log(sql);
        return await this.runQuery(sql);
    }

    async saveScrapingResults(scapingResultsRecord) {
        const sql = `REPLACE INTO scraping_results(piece_id, scraping_id, app_id, device_id, date_scraped, average_prize_buy, number_of_ads_buy, average_prize_rent, number_of_ads_rent, extra_data) values( "${scapingResultsRecord.piece_id}",  "${scapingResultsRecord.scraping_id}", "${scapingResultsRecord.app_id}", "${scapingResultsRecord.device_id}", sysdate(),${scapingResultsRecord.average_prize_buy}, ${scapingResultsRecord.number_of_ads_buy},${scapingResultsRecord.average_prize_rent}, ${scapingResultsRecord.number_of_ads_rent}, "${scapingResultsRecord.extra_data}");`
        return await this.runQuery(sql);
    }

    async getNextPieceToScrap() {

    }
}