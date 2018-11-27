CREATE DATABASE IF NOT EXISTS scraping;

-- DROP TABLE scraping_pieces_index;

-- DROP TABLE scraping_results;

-- DROP TABLE scraping_execution_log;

USE scraping;

CREATE TABLE IF NOT EXISTS scraping_pieces_index (piece_id VARCHAR(80) not null key, 
                                    piece_name VARCHAR(40), 
                                    city_name VARCHAR(40), 
                                    scraped BOOLEAN, 
                                    boundingBox1X FLOAT, 
                                    boundingBox1Y FLOAT, 
                                    boundingBox2X FLOAT, 
                                    boundingBox2Y FLOAT);

CREATE TABLE IF NOT EXISTS scraping_results (piece_id VARCHAR(80) NOT NULL key references scraping_pieces_index(piece_id),
								scraping_id VARCHAR(80),
                                app_id VARCHAR(40),
                                device_id VARCHAR(40),
                                date_scraped DATETIME,
                                average_prize_buy FLOAT, 
                                number_of_ads_buy INT, 
                                average_prize_rent FLOAT, 
                                number_of_ads_rent INT,  
                                extra_data TEXT);
                                
CREATE TABLE IF NOT EXISTS scraping_execution_log (scraping_id VARCHAR(80) not null key,
                                last_piece VARCHAR(40) not null references scraping_results(piece_id)
                                );
                                
-- data input mocked
 
-- REPLACE INTO scraping_pieces_index (piece_id, piece_name, city_name, scraped, boundingBox1X, boundingBox1Y, boundingBox2X, boundingBox2Y) VALUES("testId-piece-0-0", "piece-0-0", "Madrid", true, 0.22, 1.33, 1.44, 0.22); 

--  REPLACE INTO scraping_results (piece_id, scraping_id, app_id, device_id, date_scraped, average_prize_buy, number_of_ads_buy, average_prize_rent, number_of_ads_rent, extra_data) values( "testId-piece-0-0", "scraping-id-test", "app-test", "device-test", sysdate(), 14.44, 4, 123.44, 6, "bla bla bla []");

--  REPLACE INTO scraping_execution_log (scraping_id, last_piece) values ("scraping-id-test", "testId-piece-0-0");
 
--  select * from scraping_pieces_index;

--  select * from scraping_results;
 
--  select * from scraping_execution_log;