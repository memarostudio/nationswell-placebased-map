import { html } from "./preact-htm.js";

export function MarkerDetails({ markerDetails, viewProjectDetails }) {
  return html`<div
    className="marker-details"
    style="top: ${markerDetails ? markerDetails.y : 0}px; left: ${markerDetails
      ? markerDetails.x
      : 0}px;"
  >
    <p>Marker Details</p>
    <button onclick=${() => viewProjectDetails(markerDetails)}>
      View project details
    </button>
  </div>`;
}
