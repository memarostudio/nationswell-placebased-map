import { html, useState } from "./preact-htm.js";
import { getFocusAreaGroupIcon } from "./focusAreas.js";

export function FocusAreaDropdown({ focusAreas }) {
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
      <div class="mb-2">
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
