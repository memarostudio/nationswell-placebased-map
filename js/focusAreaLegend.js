import { html } from "./preact-htm.js";

const focusAreas = [
  { label: "Arts & Culture", icon: "arts_culture.svg" },
  { label: "Capacity Building", icon: "capacity_building.svg" },
  { label: "Social Systems", icon: "social_systems.svg" },
  { label: "Economic Development", icon: "economic_development.svg" },
  { label: "Built Environment", icon: "built_environment.svg" },
];

export function FocusAreaLegend() {
  return html`<div
    class="absolute top-[100px] left-[calc(2.5%+250px)] right-[2.5%] bg-vis-main-blue flex justify-between px-4 py-2"
  >
    ${focusAreas.map((area) => {
      return html`<div class="flex items-center space-x-2">
        <img
          src="../assets/${area.icon}"
          alt="${area.label} icon"
          class="w-[18px] h-[18px]"
        />
        <span class="text-lg font-libre text-vis-text-inverted"
          >${area.label}</span
        >
      </div>`;
    })}
  </div>`;
}
