import { html, renderComponent, useEffect, useState } from "./js/preact-htm.js";
import { Map } from "./js/map.js";
import { REPO_URL } from "./js/helper.js";
import {
  getAllFocusAreaGroupsForProject,
  getFocusAreaGroupIcon,
} from "./js/focusAreas.js";

console.log("Script for place-based map loaded.");
main();

function main() {
  // fetch focus area data
  d3.csv(
    // REPO_URL + "/data/focusAreasData.csv"
    "./data/focusAreasData.csv"
  ).then((data) => {
    // process focus area data
    data.forEach((d) => {
      d["group"] = d["Focus Area Category"];
      d["area"] = d["Focus Area"];
    });

    // group focus area data by focus group
    const groupedData = d3.group(data, (d) => d["group"]);
    const groupedDataArray = Array.from(groupedData, ([group, areas]) => ({
      group,
      areas: areas.map((d) => d["area"]),
    }));

    // render focus areas dropdown within Webflow container
    renderFocusAreasDropdown(groupedDataArray);

    // render main content
    renderContent(data);
  });
}

function renderFocusAreasDropdown(focusAreas) {
  // get trigger element and add event listener to toggle visibility of container
  const triggerElement = document.getElementById(
    "focus-areas-dropdown-trigger"
  );
  if (triggerElement) {
    const triggerRightX = triggerElement.getBoundingClientRect().right;
    const triggerY = triggerElement.getBoundingClientRect().top;

    triggerElement.addEventListener("click", () => {
      const containerElement = document.getElementById(
        "focus-areas-dropdown-container"
      );
      if (containerElement) {
        containerElement.style.top = `${triggerY}px`;
        containerElement.style.left = `${triggerRightX + 10}px`;
        if (containerElement.style.display !== "block") {
          containerElement.style.display = "block";
        } else {
          containerElement.style.display = "none";
        }

        renderComponent(
          html`<${FocusAreaDropdown} focusAreas=${focusAreas} />`,
          containerElement
        );
      }
    });
  }

  function FocusAreaDropdown({ focusAreas }) {
    const [selectedAreas, setSelectedAreas] = useState([]);

    const groupElements = focusAreas.map((group) => {
      return html` <div
          class="font-libre w-full block border-b border-vis-surface-primary border-solid text-base italic leading-[135%] flex flex-row items-center p-1"
        >
          <div class="h-[18px] w-[18px] inline-block align-middle mr-2">
            ${getFocusAreaGroupIcon(group.group, "#FBF9F4")}
          </div>
          <span>${group.group}</span>
        </div>
        <div class="">
          ${group.areas.map((area) => {
            const id = area.replace(/\s+/g, "-"); // replace spaces with hyphens for id
            return html`<div
              class="hover:bg-[#2148D1] rounded-md cursor-pointer flex flex-row items-center"
            >
              <input
                type="checkbox"
                id=${id}
                name="Focus Areas"
                value=${area}
                class="block"
                style="margin-left: 8px; margin-right: 8px;"
                checked=${selectedAreas.includes(area)}
                onchange=${(e) => {
                  const newSelectedAreas = e.target.checked
                    ? [...selectedAreas, area]
                    : selectedAreas.filter((a) => a !== area);
                  setSelectedAreas(newSelectedAreas);
                  document.dispatchEvent(
                    new CustomEvent("dropdown-focus-areas-changed", {
                      detail: { selectedFocusAreas: newSelectedAreas },
                    })
                  );
                }}
              />
              <label
                for=${id}
                class="inline-block font-authentic text-[14px] leading-[155%] mb-0 p-2 pt-3 grow cursor-pointer"
                >${area}</label
              >
            </div>`;
          })}
        </div>`;
    });

    return html`<div
      class="text-vis-text-inverted p-2 w-full h-full overflow-y-auto"
    >
      ${groupElements}
    </div>`;
  }
}

function renderContent(focusAreas) {
  const containerElement = document.getElementById("map");
  if (containerElement) {
    // clear existing content before rendering
    containerElement.innerHTML = "";

    // wait for async Vis to resolve before rendering
    (async () => {
      renderComponent(
        html`<${Content} focusAreas=${focusAreas} />`,
        containerElement
      );
    })();
  } else {
    console.error(`Could not find container element for ${vis.id}`);
  }
}

function Content({ focusAreas }) {
  const [usGeoData, setUsGeoData] = useState(null);
  const [placesData, setPlacesData] = useState(null);
  const [partnersData, setPartnersData] = useState(null);

  const [statusShowInactiveFilter, setStatusShowInactiveFilter] =
    useState(true);

  const [selectedFocusAreas, setSelectedFocusAreas] = useState([]);

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

        d["status"] = d["Status"] && d["Status"] !== "" ? d["Status"] : null;
      });
      data.forEach((d) => {
        d["focusAreaGroups"] =
          d["focusAreas"].length > 0
            ? getAllFocusAreaGroupsForProject(d["focusAreas"])
            : [];
      });

      data = data.filter((p) => p["name"] !== "" && p["approved"]);
      // console.log("Loaded places data:", data);
      setPlacesData(data);
    });

    d3.csv(
      REPO_URL + "/data/partnerData.csv"
      // "./data/partnerData.csv"
    ).then((data) => {
      // preprocess data as needed
      data.forEach((d) => {
        d["partnerName"] = d["Funder Name"];
        d["partnerLink"] = d["Partner Link"];
      });
      // console.log("Loaded partner data:", data);
      setPartnersData(data);
    });
  }, []);

  // add event listener for checkbox with id "Status"
  useEffect(() => {
    const statusCheckbox = document.getElementById("Status");
    if (statusCheckbox) {
      const handleStatusChange = (e) => {
        const value = e.target.checked;
        console.log("Status filter changed to:", value);
        setStatusShowInactiveFilter(value);
      };
      statusCheckbox.addEventListener("change", handleStatusChange);
      return () => {
        statusCheckbox.removeEventListener("change", handleStatusChange);
      };
    }
  }, []);

  // listen to change in focus area dropdown
  useEffect(() => {
    const handleFocusAreasChange = (e) =>
      setSelectedFocusAreas(e.detail.selectedFocusAreas);
    document.addEventListener(
      "dropdown-focus-areas-changed",
      handleFocusAreasChange
    );
    return () => {
      document.removeEventListener(
        "dropdown-focus-areas-changed",
        handleFocusAreasChange
      );
    };
  }, []);

  // filter places data based on statusInactiveFilter
  let filteredPlacesData = placesData
    ? placesData.filter((p) =>
        statusShowInactiveFilter ? true : p["status"] === "Active"
      )
    : null;

  // also filter by focus areas if any are selected
  if (filteredPlacesData && selectedFocusAreas.length > 0) {
    filteredPlacesData = filteredPlacesData.filter((p) => {
      return p["focusAreas"].some((area) => selectedFocusAreas.includes(area));
    });
  }

  return html`
    ${usGeoData
      ? html`<${Map}
          usGeoData=${usGeoData}
          places=${filteredPlacesData}
          partners=${partnersData}
        />`
      : "Loading..."}
  `;
}
