import { html, renderComponent, useEffect, useState } from "./js/preact-htm.js";
import { Map } from "./js/map.js";

console.log("Script for place-based map loaded.");

renderContent();

function renderContent() {
  const containerElement = document.getElementById("map");
  if (containerElement) {
    // clear existing content before rendering
    containerElement.innerHTML = "";

    // wait for async Vis to resolve before rendering
    (async () => {
      renderComponent(html`<${Content} />`, containerElement);
    })();
  } else {
    console.error(`Could not find container element for ${vis.id}`);
  }
}

function Content() {
  const [usGeoData, setUsGeoData] = useState(null);
  const [placesData, setPlacesData] = useState(null);

  // load data
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/memarostudio/nationswell-placebased-map/refs/heads/main/data/states-albers-10m.json"
    )
      .then((res) => res.json())
      .then(setUsGeoData);

    d3.csv(
      // "https://raw.githubusercontent.com/memarostudio/nationswell-placebased-map/refs/heads/main/data/states-albers-10m.json"
      "./data/places.csv"
    ).then((data) => {
      // preprocess data as needed
      data.forEach((d) => {
        d["lat"] = +d["Latitude"];
        d["lon"] = +d["Longitude"];
        d["gini"] = +d["Gini Coefficient"];
        d["name"] = d["Project Name"];
        d["id"] = +d["Id"];
      });
      data = data.filter((p) => p["name"] !== "");
      setPlacesData(data);
    });
  }, []);

  return html`
    ${usGeoData
      ? html`<${Map} usGeoData=${usGeoData} places=${placesData} />`
      : "Loading..."}
  `;
}
