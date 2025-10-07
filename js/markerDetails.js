import { html } from "./preact-htm.js";

export function MarkerDetails({ markerDetails, viewProjectDetails }) {
  return html`<div
    className="marker-details"
    style="top: ${markerDetails ? markerDetails.y : 0}px; left: ${markerDetails
      ? markerDetails.x
      : 0}px;"
  >
    <p>${markerDetails.name}</p>
    <button onclick=${() => viewProjectDetails(markerDetails.id)}>
      View project details
    </button>
  </div>`;
}
