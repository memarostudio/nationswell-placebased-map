import { html, renderComponent, useEffect, useState } from "./js/preact-htm.js";
import { Map } from "./js/map.js";
import { REPO_URL } from "./js/helper.js";
import { getAllFocusAreaGroupsForProject } from "./js/focusAreas.js";

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
    fetch(REPO_URL + "/data/states-albers-10m.json")
      .then((res) => res.json())
      .then(setUsGeoData);

    d3.csv(
      REPO_URL + "/data/places_with_id.csv"
      //"./data/places.csv"
    ).then((data) => {
      // preprocess data as needed
      data.forEach((d) => {
        d["approved"] =
          d["Approval?"] && d["Approval?"].trim() === "Approved" ? true : false;
        d["id"] = +d["Id"];
        d["lat"] = +d["Latitude"];
        d["lon"] = +d["Longitude"];
        d["gini"] = +d["Gini Coefficient"];
        d["name"] = d["Project Name"];
        d["startYear"] =
          d["Start Year"] && d["Start Year"] !== "" ? d["Start Year"] : "20xx";
        d["endYear"] = d["End Year"];
        d["previewDescription"] =
          d["Project Preview Description"] &&
          d["Project Preview Description"] !== ""
            ? d["Project Preview Description"]
            : "Placeholder MPN functions as both a network catalyst and a collaborative architect, enabling funders to come together, learn together, and act together. ";
        d["description"] =
          d["Project Description"] && d["Project Description"] !== ""
            ? d["Project Description"]
            : "No description available.";
        d["highlight"] =
          d["Key Highlight"] && d["Key Highlight"] !== ""
            ? d["Key Highlight"]
            : "No key highlight available.";
        d["city"] = d["City"];
        d["state"] = d["State"];
        d["focusAreas"] =
          d["Focus Area(s) (Dropdown)"] && d["Focus Area(s) (Dropdown)"] !== ""
            ? d["Focus Area(s) (Dropdown)"].split(",").map((f) => f.trim())
            : [];
        d["areaType"] =
          d["Area Type"] && d["Area Type"] !== "" ? d["Area Type"] : null;

        d["populationSize"] =
          d["Population Size (City)"] && d["Population Size (City)"] !== ""
            ? d["Population Size (City)"]
            : null;
        d["populationDataYear"] =
          d["Population Data Year"] && d["Population Data Year"] !== ""
            ? d["Population Data Year"]
            : null;
        d["projectLink"] =
          d["Project Link (URL)"] && d["Project Link (URL)"] !== ""
            ? d["Project Link (URL)"]
            : null;
        d["partners"] =
          d["Partner(s) "] && d["Partner(s) "] !== ""
            ? d["Partner(s) "].split(",").map((p) => p.trim())
            : [];
      });
      data.forEach((d) => {
        d["focusAreaGroups"] =
          d["focusAreas"].length > 0
            ? getAllFocusAreaGroupsForProject(d["focusAreas"])
            : [];
      });

      data = data.filter((p) => p["name"] !== "" && p["approved"]);
      console.log("Loaded places data:", data);
      setPlacesData(data);
    });
  }, []);

  return html`
    ${usGeoData
      ? html`<${Map} usGeoData=${usGeoData} places=${placesData} />`
      : "Loading..."}
  `;
}
