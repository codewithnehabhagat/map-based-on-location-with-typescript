import axios, { AxiosResponse } from "axios";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as LayerVector } from "ol/layer";
import { OSM, Vector as SourceVector } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Icon, Style } from "ol/style";

const form = document.querySelector("form")!;

const cityInput = document.getElementById("city")! as HTMLInputElement;
const stateInput = document.getElementById("state")! as HTMLInputElement;
const countryInput = document.getElementById("country")! as HTMLInputElement;
const postalCodeInput = document.getElementById(
  "postalcode"
)! as HTMLInputElement;

enum AddressType {
  CITY = "city",
  STATE = "state",
  COUNTRY = "country",
  POSTCODE = "postcode",
}
type CoordResponse = {
  place_id: number;
  display_name: string;
  lon: string;
  lat: string;
  addresstype: AddressType;
};

function getCoordinates(): Promise<AxiosResponse<CoordResponse[]>> {
  return axios.get(
    `https://nominatim.openstreetmap.org/search?city=${cityInput.value}&state=${stateInput.value}&country=${countryInput.value}&postalcode=${postalCodeInput.value}&format=json&polygon=1&addressdetails=1`
  );
}

function getZoomBasedOnAddressType(type: AddressType) {
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

function searchAddressHandler(event: Event) {
  event.preventDefault();
  document.getElementById("response")!.innerHTML = "";
  document.getElementById("map")!.innerHTML = "";

  getCoordinates().then((response) => {
    const data = response?.data;
    if (data.length > 0) {
      const relevantEntryToDisplay = data[0];
      document.getElementById("response")!.innerHTML =
        relevantEntryToDisplay.display_name;

      const coord = fromLonLat([
        Number.parseFloat(relevantEntryToDisplay.lon),
        Number.parseFloat(relevantEntryToDisplay.lat),
      ]);

      const marker = new Feature({
        geometry: new Point(coord),
      });

      const markerLayer = new LayerVector({
        source: new SourceVector({
          features: [marker],
        }),
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: "./assets/marker.svg",
          }),
        }),
      });

      new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          markerLayer,
        ],
        target: "map",
        view: new View({
          center: coord,
          zoom: getZoomBasedOnAddressType(relevantEntryToDisplay.addresstype),
        }),
      });
    } else {
      document.getElementById("response")!.innerHTML = "No Records Found.";
    }
  });
}

form.addEventListener("submit", searchAddressHandler);
