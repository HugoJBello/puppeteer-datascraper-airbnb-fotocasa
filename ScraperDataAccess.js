const fs = require('fs');
const mysql = require('mysql');

module.exports = class ScraperDataAccess {
    constructor(mysqlHost, mysqlUser, mysqlPassword, mysqlDatabase, sqlCreationPath="./mantainance/initalize.sql") {
        this.mysqlHost = mysqlHost;
        this.mysqlUser = mysqlUser;
        this.mysqlPassword = mysqlPassword;
        this.mysqlDatabase = mysqlDatabase;
        this.multipleStatements = true;

        this.connection = null;
        this.tableCreatorScriptPath = sqlCreationPath;
        this.createConnection();
    }

    createConnection() {
        console.log("creating connection " + this.mysqlHost + " " + this.mysqlUser + " " + this.mysqlPassword + " " + this.mysqlDatabase)
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
        (piece_id, piece_name, city_name, device_id, scraped, bounding_box1_x, bounding_box1_y, bounding_box2_x, bounding_box2_y, center_point_x, center_point_y) VALUES("${scapingPiecesIndexRecord.piece_id}", "${scapingPiecesIndexRecord.piece_name}", "${scapingPiecesIndexRecord.city_name}","${scapingPiecesIndexRecord.device_id}", ${scapingPiecesIndexRecord.scraped}, ${scapingPiecesIndexRecord.bounding_box1_x},  ${scapingPiecesIndexRecord.bounding_box1_y},  ${scapingPiecesIndexRecord.bounding_box2_x}, ${scapingPiecesIndexRecord.bounding_box2_y}, ${scapingPiecesIndexRecord.center_point_x}, ${scapingPiecesIndexRecord.center_point_y});`;
        //console.log(sql);
        return await this.runQuery(sql);
    }

    async saveScrapingResults(scapingResultsRecord) {
        const sql = `REPLACE INTO scraping_results(piece_id, scraping_id, app_id, device_id, date_scraped, average_prize_buy, number_of_ads_buy, average_prize_rent, number_of_ads_rent, extra_data) values( "${scapingResultsRecord.piece_id}",  "${scapingResultsRecord.scraping_id}", "${scapingResultsRecord.app_id}", "${scapingResultsRecord.device_id}", sysdate(),${scapingResultsRecord.average_prize_buy}, ${scapingResultsRecord.number_of_ads_buy},${scapingResultsRecord.average_prize_rent}, ${scapingResultsRecord.number_of_ads_rent}, "${scapingResultsRecord.extra_data}");`
        return await this.runQuery(sql);
    }

    async dropIndex(device_id){
        const sql = `DELETE from scraping_pieces_index WHERE device_id="${device_id}"`;
        //console.log(sql);
        return await this.runQuery(sql);
    }
    async getNextPieceToScrap() {
        const sql = "select * from scraping_pieces_index where scraped = false order by piece_id asc limit 1;";
        const result = await this.runQuery(sql);
        return result[0];
    }
    async setIndexAsNotScraped(){
        const sql = "update scraping_pieces_index set scraped = false where scraped = true;";
        return await this.runQuery(sql);
    }

    async setIndexPieceAsScraped(piece_id){
        const sql = `update scraping_pieces_index set scraped = true where piece_id = "${piece_id}";`;
        return await this.runQuery(sql);
    }

    async countIndexEntries(){
        const sql = "select count(*) from scraping_pieces_index";
        let result;
        try{
            result = await this.runQuery(sql);
            return parseInt(result[0]["count(*)"]);
        } catch (err){
            return null;
        }

    }
}