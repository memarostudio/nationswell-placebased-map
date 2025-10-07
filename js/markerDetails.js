import { html } from "./preact-htm.js";

export function MarkerDetails({
  markerDetails,
  viewProjectDetails,
  handleCloseDetails,
}) {
  return html`<div
    className="marker-details absolute bg-white p-4 rounded shadow-lg"
    style="top: ${markerDetails ? markerDetails.y : 0}px; left: ${markerDetails
      ? markerDetails.x
      : 0}px;"
  >
    <svg
      class="close-icon absolute top-2 right-2 cursor-pointer h-6 w-6"
      onclick=${handleCloseDetails}
      width="34"
      height="35"
      viewBox="0 0 34 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.7574 13.56L17 17.8027M17 17.8027L21.2426 22.0453M17 17.8027L21.2426 13.56M17 17.8027L12.7574 22.0453"
        stroke="#0F100F"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <p>${markerDetails.name}</p>
    <button
      onclick=${() => viewProjectDetails(markerDetails.id)}
      class="bg-vis-main-blue text-white"
    >
      View project details
    </button>
  </div>`;
}
