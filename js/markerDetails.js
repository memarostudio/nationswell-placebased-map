import { html } from "./preact-htm.js";
import { REPO_URL } from "./helper.js";

export function MarkerDetails({
  markerDetails,
  viewProjectDetails,
  handleCloseDetails,
}) {
  return html`<div
    className="marker-details absolute bg-white p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 max-w-md"
    style="top: ${markerDetails
      ? markerDetails.y - 20
      : 0}px; left: ${markerDetails ? markerDetails.x + 66 / 2 + 5 : 0}px;"
  >
    <svg
      class="close-icon absolute top-2 right-2 cursor-pointer h-8 w-8"
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
    <div class="flex items-center gap-2">
      <svg
        width="21"
        height="21"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.349 8.80827C17.349 12.4902 10.6823 18.8083 10.6823 18.8083C10.6823 18.8083 4.01562 12.4902 4.01562 8.80827C4.01562 5.12637 7.00039 2.1416 10.6823 2.1416C14.3642 2.1416 17.349 5.12637 17.349 8.80827Z"
          stroke="black"
          stroke-width="1.25"
        />
        <path
          d="M10.6849 9.64128C11.1451 9.64128 11.5182 9.26819 11.5182 8.80794C11.5182 8.34771 11.1451 7.97461 10.6849 7.97461C10.2246 7.97461 9.85156 8.34771 9.85156 8.80794C9.85156 9.26819 10.2246 9.64128 10.6849 9.64128Z"
          fill="black"
          stroke="black"
          stroke-width="1.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p class="uppercase font-sora text-sm text-vis-text-primary">
        ${markerDetails.city}, ${markerDetails.state}
      </p>
    </div>
    <div class="bg-[#F3F0E9] py-4 px-6 flex flex-col items-start">
      <div>
        <p class="font-libre text-lg font-italic text-vis-text-secondary">
          ${markerDetails.startYear}${" "}–${" "}
          ${markerDetails.endYear ? markerDetails.endYear : "present"}
        </p>
      </div>

      <p
        class="font-sora text-sm text-vis-text-primary font-bold uppercase mt-2"
      >
        ${markerDetails.name}
      </p>
      <p
        class="font-authentic font-md line-height-[155%] text-vis-text-primary mt-1"
      >
        ${markerDetails.previewDescription || "TODO"}
      </p>
      <button
        onclick=${() => viewProjectDetails(markerDetails.id)}
        class="bg-vis-main-blue w-full flex flex-row justify-between px-4 py-2 mt-4 bg-cover bg-center"
        style="background-image: url('${REPO_URL}/assets/gradient_texture_blue_button.png');"
      >
        <span class="font-sora text-sm uppercase text-vis-text-inverted"
          >View project details</span
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
  </div>`;
}
