import { html } from "./preact-htm.js";

const focusAreasGroups = [
  {
    label: "Arts & Culture",
    icon: "arts_culture.svg",
    areas: ["Sports", "Music", "Arts & Culture", "Performance"],
  },
  {
    label: "Capacity Building",
    icon: "capacity_building.svg",
    areas: [
      "Youth Leadership",
      "Community Leadership",
      "Skills Training",
      "Cradle to Career",
    ],
  },
  {
    label: "Social Systems",
    icon: "social_systems.svg",
    areas: ["Care Support Systems", "Social Justice", "Criminal Justice"],
  },
  {
    label: "Economic Development",
    icon: "economic_development.svg",
    areas: [
      "Economic Opportunity",
      "Retail",
      "Industry",
      "Economic Mobility & Generational Wealthbuilding",
    ],
  },
  {
    label: "Built Environment",
    icon: "built_environment.svg",
    areas: ["Housing", "Public Space"],
  },
];

export function FocusAreaGroupLegend() {
  return html`<div
    class="absolute top-0 left-0 right-0 bg-[#E9FBAE] flex justify-between px-4 py-2 gap-2"
  >
    ${focusAreasGroups.map((areaGroup) => {
      return html`<div class="flex items-center space-x-2">
        <div class="w-[18px] h-[18px]">
          ${getFocusAreaGroupIcon(areaGroup.label, "#12266B")}
        </div>
        <span class="text-lg font-libre text-vis-text-primary"
          >${areaGroup.label}</span
        >
      </div>`;
    })}
  </div>`;
}

export function getFocusAreaGroupFromArea(area) {
  for (const group of focusAreasGroups) {
    if (group.areas.includes(area)) {
      return group.label;
    }
  }
  return null; // or some default value if area not found
}

export function getAllFocusAreaGroupsForProject(focusAreas) {
  const groups = new Set();
  focusAreas.forEach((area) => {
    const group = getFocusAreaGroupFromArea(area);
    if (group) {
      groups.add(group);
    }
  });
  const groupsArray = Array.from(groups);

  // sort groupsArray based on the order in focusAreasGroups
  groupsArray.sort((a, b) => {
    const indexA = focusAreasGroups.findIndex((group) => group.label === a);
    const indexB = focusAreasGroups.findIndex((group) => group.label === b);
    return indexA - indexB;
  });

  return groupsArray;
}

export function getFocusAreaGroupIcon(
  focusAreaGroup,
  color = "#12266B",
  size = null
) {
  if (!focusAreaGroup) return null;
  switch (focusAreaGroup) {
    case "Arts & Culture":
      return html`<svg
        width="${size ? size : "100%"}"
        viewBox="0 0 19 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.0898 6.03711L18.2812 6.97949L13.8262 11.3799L14.8438 17.5596L9.28125 14.6826L3.71875 17.5596L4.73633 11.3799L0.28125 6.97949L6.47266 6.03711L9.28125 0.44043L12.0898 6.03711Z"
          fill="${color}"
        />
      </svg>`;
    case "Capacity Building":
      return html`<svg
        width="${size ? size : "100%"}"
        viewBox="0 0 19 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="4.5"
          height="18"
          transform="matrix(4.37114e-08 1 1 -4.37114e-08 0.28125 6.75)"
          fill="${color}"
        />
        <rect
          width="4.5"
          height="18"
          transform="matrix(-1 0 0 1 11.5312 0)"
          fill="${color}"
        />
      </svg> `;
    case "Social Systems":
      return html`<svg
        width="${size ? size : "100%"}"
        viewBox="0 0 19 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.28223 0C6.79702 -1.08632e-07 4.78234 2.01482 4.78223 4.5C2.29702 4.5 0.282345 6.51482 0.282227 9C0.282227 11.4853 2.29695 13.5 4.78223 13.5L4.78809 13.7314C4.90855 16.1092 6.87457 18 9.28223 18C11.7675 18 13.7822 15.9853 13.7822 13.5C16.2671 13.4995 18.2812 11.485 18.2812 9C18.2811 6.51513 16.267 4.5005 13.7822 4.5C13.7821 2.01484 11.7674 2.61798e-05 9.28223 0Z"
          fill="${color}"
        />
      </svg> `;
    case "Economic Development":
      return html`<svg
        width="${size ? size : "100%"}"
        viewBox="0 0 19 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.28125 0C4.31069 0 0.28125 4.02944 0.28125 9C0.28125 13.9706 4.31069 18 9.28125 18C14.2518 18 18.2812 13.9706 18.2812 9C18.2812 4.02944 14.2518 0 9.28125 0ZM9.28125 4.37598C11.8236 4.37598 13.8846 6.43718 13.8848 8.97949C13.8848 11.522 11.8237 13.583 9.28125 13.583C6.73881 13.5829 4.67773 11.5219 4.67773 8.97949C4.67795 6.43722 6.73894 4.37604 9.28125 4.37598Z"
          fill="${color}"
        />
      </svg> `;
    case "Built Environment":
      return html`<svg
        width="${size ? size : "100%"}"
        viewBox="0 0 19 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.28125 18H18.2812V8.10059L9.28125 0L0.28125 8.10059V18Z"
          fill="${color}"
        />
      </svg> `;
    default:
      return null;
  }
}
