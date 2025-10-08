import { html } from "./preact-htm.js";

export function Overlay({ place, handleCloseOverlay }) {
  if (!place) {
    return null;
  }

  const titleClasses = "font-sora text-sm uppercase mb-4 font-bold";
  return html`<div class="map-details-overlay absolute inset-0 z-[10001]">
    <div
      class="map-details-content absolute bg-white rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[11] w-[80%] max-h-[80%] overflow-y-auto"
    >
      <svg
        class="close-icon absolute top-2 right-2 cursor-pointer h-8 w-8"
        onclick=${handleCloseOverlay}
        width="34"
        height="35"
        viewBox="0 0 34 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.7574 13.56L17 17.8027M17 17.8027L21.2426 22.0453M17 17.8027L21.2426 13.56M17 17.8027L12.7574 22.0453"
          stroke="lightgray"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div
        class="flex flex-row items-end justify-between bg-blue-600 px-6 pt-[33px] pb-6"
        style="background-image: url('../assets/gradient_texture_blue_overlay_header.png'); background-size: cover; background-position: center;"
      >
        <div class="flex flex-col items-start gap-2">
          <p class="font-libre text-lg font-italic text-vis-text-inverted">
            ${place.startYear}${" "}–${" "}
            ${place.endYear ? place.endYear : "present"}
          </p>
          <p class="text-vis-text-inverted text-[32px]">${place.name}</p>
        </div>
        <button
          onclick=${() => viewProjectDetails(markerDetails.id)}
          class="bg-[#0F100F] flex flex-row justify-between px-4 py-[10px] mt-4"
        >
          <span class="font-sora text-sm uppercase text-vis-text-inverted pr-6"
            >Learn more</span
          >
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.30859 7.84961C3.96342 7.84961 3.68359 8.12943 3.68359 8.47461C3.68359 8.81979 3.96342 9.09961 4.30859 9.09961L4.30859 8.47461L4.30859 7.84961ZM13.5005 8.91655C13.7446 8.67247 13.7446 8.27675 13.5005 8.03267L9.52306 4.05519C9.27898 3.81111 8.88325 3.81111 8.63918 4.05519C8.3951 4.29927 8.3951 4.695 8.63918 4.93908L12.1747 8.47461L8.63918 12.0101C8.3951 12.2542 8.3951 12.6499 8.63918 12.894C8.88325 13.1381 9.27898 13.1381 9.52306 12.894L13.5005 8.91655ZM4.30859 8.47461L4.30859 9.09961L13.0586 9.09961L13.0586 8.47461L13.0586 7.84961L4.30859 7.84961L4.30859 8.47461Z"
              fill="#FBF9F4"
            />
          </svg>
        </button>
      </div>
      <div class="grid grid-cols-5">
        <div class="col-span-2 p-6">longer text here</div>
        <div class="col-span-1 p-6 bg-vis-surface-primary-tonal">
          <p class="${titleClasses} text-vis-text-primary">location</p>
        </div>
        <div class="col-span-1">state shape</div>
        <div class="col-span-1 p-6 bg-vis-surface-primary-tonal">
          <p class="${titleClasses}  text-vis-text-primary">gini coefficient</p>
        </div>
      </div>
      <div class="grid grid-cols-5">
        <div class="col-span-2 p-6 bg-vis-surface-primary">
          <p class="${titleClasses} text-vis-text-primary">highlight</p>
          longer text here
        </div>
        <div class="col-span-3">
          <div class="p-6">
            <p class="${titleClasses} text-vis-text-primary">focus area(s)</p>
          </div>
          <div class="p-6 bg-vis-main-blue">
            <p class="${titleClasses} text-vis-text-inverted">support types</p>
          </div>
          <div class="p-6">
            <p class="${titleClasses} text-vis-text-primary">partners</p>
          </div>
        </div>
      </div>
    </div>
    <div
      class="map-details-background absolute inset-0 bg-black opacity-50 backdrop-blur-md"
    ></div>
  </div>`;
}
