import { html, useState } from "./preact-htm.js";
import { getFocusAreaGroupIcon } from "./focusAreas.js";
import { REPO_URL } from "./helper.js";

export function FocusAreaDropdown({ focusAreas }) {
  const [selectedAreas, setSelectedAreas] = useState([]);

  const groupElements = focusAreas.map((group) => {
    return html` <div
        class="font-libre w-full block border-b border-vis-surface-primary border-solid text-base italic leading-[135%] flex flex-row items-center p-2"
      >
        <div class="h-[18px] w-[18px] inline-block align-middle mr-[10px]">
          ${getFocusAreaGroupIcon(group.group, "#FBF9F4")}
        </div>
        <span>${group.group}</span>
      </div>
      <div class="mb-2">
        ${group.areas.map((area) => {
          const id = area.replace(/\s+/g, "-"); // replace spaces with hyphens for id
          return html`<div
            class="hover:bg-[#2148D1] rounded-md cursor-pointer flex flex-row items-center"
            onclick=${() => {
              const isChecked = selectedAreas.includes(area);
              const newSelectedAreas = isChecked
                ? selectedAreas.filter((a) => a !== area)
                : [...selectedAreas, area];
              setSelectedAreas(newSelectedAreas);
              document.dispatchEvent(
                new CustomEvent("dropdown-focus-areas-changed", {
                  detail: { selectedFocusAreas: newSelectedAreas },
                })
              );
            }}
          >
            <div class="ml-2 w-5 h-5 flex items-center justify-center shrink-0">
              ${selectedAreas.includes(area)
                ? html`<img
                    src="${REPO_URL}/assets/checkbox_checked.svg"
                    alt="Checked"
                    class="w-5 h-5"
                  />`
                : html`<img
                    src="${REPO_URL}/assets/checkbox_unchecked.svg"
                    alt="Unchecked"
                    class="w-5 h-5"
                  />`}
            </div>
            <span
              class="inline-block font-authentic text-[14px] leading-[155%] mb-0 p-2 pt-3 grow cursor-pointer text-balance"
              >${area}</span
            >
          </div>`;
        })}
      </div>`;
  });

  return html`<div class="text-vis-text-inverted p-2 w-full">
    ${groupElements}
  </div>`;
}
