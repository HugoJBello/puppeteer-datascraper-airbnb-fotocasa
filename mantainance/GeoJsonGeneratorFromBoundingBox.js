

module.exports = class GeoJsonGeneratorFromBoundingBox {
    constructor() {
        this.maxOpacity = 0.8;
    }

    generateGeoJsonFromResultFromBoundingBox(scrapingCityResult) {
        const result = { type: "FeatureCollection", features: [] };
        const maxValues = this.calculateMaxValues(scrapingCityResult);
        console.log(maxValues);
        for (const resultScraping of scrapingCityResult) {

            const boundingBox = this.getBoundingBox(resultScraping)

            const feature = this.generateFeature(boundingBox, resultScraping, maxValues);
            result.features.push(feature);
        }
        return result;
    }

    getBoundingBox(result) {
        return [[result.bounding_box1_x, result.bounding_box1_y], [result.bounding_box2_x, result.bounding_box2_y]]
    }

    //modeoutpu can be "buy-prize" "buy-ads" "rent-prize" or "rent-ads", first param is buy/rent second if we want to display
    // number of ads or average prize. This will set the stiles of the geojson
    generateFeature(boundingBox, result, maxValues, modeOutput = "buy-prize") {
        const feature = {
            type: "Feature", properties: {}, bbox: [], geometry: {
                type: "Polygon", coordinates: []
            }
        };

        if (result) {
            feature.properties = {
                name: result.piece_id,
                number_of_ads_buy: result.number_of_ads_buy,
                average_prize_buy: result.average_prize_buy,
                number_of_ads_rent: result.number_of_ads_rent,
                average_prize_rent: result.average_prize_rent,
                normalized_prize_buy: (result.average_prize_buy / maxValues.maxPrizeBuy),
                normalized_ads_buy: (result.number_of_ads_buy / maxValues.maxNumberAdsBuy),
                normalized_prize_rent: (result.average_prize_rent / maxValues.maxPrizeRent),
                normalized_ads_rent: (result.number_of_ads_rent / maxValues.maxNumberAdsRent),
                date: result.date_scraped
            };

        }


        if (modeOutput === "buy-prize") {
            feature.properties["fill-opacity"] = feature.properties.normalized_prize_buy * this.maxOpacity;
        } else if (modeOutput === "buy-ads") {
            feature.properties["fill-opacity"] = feature.properties.normalized_ads_buy * this.maxOpacity;
        } else if (modeOutput === "rent-prize") {
            feature.properties["fill-opacity"] = feature.properties.normalized_prize_rent * this.maxOpacity;
        } else {
            feature.properties["fill-opacity"] = feature.properties.normalized_ads_rent * this.maxOpacity;
        }
        feature.properties.fill = "#ff0000";

        /*
        feature.geometry.style = {
            "stroke-width": "3",
            "fill-opacity": 0.2
        }
        */

        const bbox = [boundingBox[1][0], boundingBox[1][1], boundingBox[0][0], boundingBox[0][1]];
        const coordinates = [[[bbox[0], bbox[3]], [bbox[2], bbox[3]], [bbox[2], bbox[1]], [bbox[0], bbox[1]], [bbox[0], bbox[3]]]]

        feature.bbox = bbox;
        feature.geometry.coordinates = coordinates;
        return feature;
    }

    calculateMaxValues(results) {
        let maxPrizeRent = 0;
        let maxPrizeBuy = 0;
        let maxNumberAdsRent = 0;
        let maxNumberAdsBuy = 0;
        for (const result of results) {
            maxPrizeBuy = Math.max(maxPrizeBuy, result.average_prize_buy);
            maxPrizeRent = Math.max(maxPrizeRent, result.average_prize_rest);
            maxNumberAdsBuy = Math.max(maxNumberAdsBuy, result.number_of_ads_buy);
            maxNumberAdsRent = Math.max(maxNumberAdsBuy, result.number_of_ads_rent);
        }
        return { maxNumberAdsBuy, maxNumberAdsRent, maxPrizeBuy, maxPrizeRent };
    }
}