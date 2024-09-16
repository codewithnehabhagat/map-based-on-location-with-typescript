"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const ol_1 = require("ol");
const layer_1 = require("ol/layer");
const source_1 = require("ol/source");
const Feature_1 = __importDefault(require("ol/Feature"));
const Point_1 = __importDefault(require("ol/geom/Point"));
const proj_1 = require("ol/proj");
const style_1 = require("ol/style");
const form = document.querySelector("form");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const countryInput = document.getElementById("country");
const postalCodeInput = document.getElementById("postalcode");
var AddressType;
(function (AddressType) {
    AddressType["CITY"] = "city";
    AddressType["STATE"] = "state";
    AddressType["COUNTRY"] = "country";
    AddressType["POSTCODE"] = "postcode";
})(AddressType || (AddressType = {}));
function getCoordinates() {
    return axios_1.default.get(`https://nominatim.openstreetmap.org/search?city=${cityInput.value}&state=${stateInput.value}&country=${countryInput.value}&postalcode=${postalCodeInput.value}&format=json&polygon=1&addressdetails=1`);
}
function getZoomBasedOnAddressType(type) {
    switch (type) {
        case AddressType.COUNTRY:
            return 3;
        case AddressType.STATE:
            return 5;
        case AddressType.CITY:
            return 6;
        case AddressType.POSTCODE:
            return 10;
        default:
            return 10;
    }
}
function searchAddressHandler(event) {
    event.preventDefault();
    document.getElementById("response").innerHTML = "";
    document.getElementById("map").innerHTML = "";
    getCoordinates().then((response) => {
        const data = response === null || response === void 0 ? void 0 : response.data;
        if (data.length > 0) {
            const relevantEntryToDisplay = data[0];
            document.getElementById("response").innerHTML =
                relevantEntryToDisplay.display_name;
            const coord = (0, proj_1.fromLonLat)([
                Number.parseFloat(relevantEntryToDisplay.lon),
                Number.parseFloat(relevantEntryToDisplay.lat),
            ]);
            const marker = new Feature_1.default({
                geometry: new Point_1.default(coord),
            });
            const markerLayer = new layer_1.Vector({
                source: new source_1.Vector({
                    features: [marker],
                }),
                style: new style_1.Style({
                    image: new style_1.Icon({
                        anchor: [0.5, 1],
                        src: "./assets/marker.svg",
                    }),
                }),
            });
            new ol_1.Map({
                layers: [
                    new layer_1.Tile({
                        source: new source_1.OSM(),
                    }),
                    markerLayer,
                ],
                target: "map",
                view: new ol_1.View({
                    center: coord,
                    zoom: getZoomBasedOnAddressType(relevantEntryToDisplay.addresstype),
                }),
            });
        }
        else {
            document.getElementById("response").innerHTML = "No Records Found.";
        }
    });
}
form.addEventListener("submit", searchAddressHandler);
//# sourceMappingURL=app.js.map