import { html, useEffect, useState } from "./preact-htm.js";
import {
  getFocusAreaGroupIcon,
  getFocusAreaGroupFromArea,
} from "./focusAreas.js";
import { REPO_URL } from "./helper.js";

export function Overlay({
  place,
  partners,
  allFocusAreas,
  handleCloseOverlay,
}) {
  if (!place) {
    return null;
  }

  console.log("Rendering Overlay for place:", place);

  // get random value between 1 and 6 for state shape image
  const randomAreaImage = Math.floor(Math.random() * 6) + 1;
  let areaImageName = "";
  switch (place.areaType) {
    case "Urban":
      areaImageName = `Area Type=Urban, Option=${randomAreaImage}.png`;
      break;
    case "Suburban":
      areaImageName = `Area Type=Suburban, Option=${randomAreaImage}.png`;
      break;
    case "Rural":
      areaImageName = `Area Type=Rural, Option=${randomAreaImage}.png`;
      break;
    default:
      areaImageName = `Area Type=Suburban, Option=${randomAreaImage}.png`;
      break;
  }

  const titleClasses = "font-sora text-sm uppercase mb-4 font-bold";
  return html`<div class="map-details-overlay fixed inset-0 z-[10001]">
    <div
      class="map-details-content absolute bg-white rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[11] w-[90%] max-h-[90%] xl:max-h-[80%] xl:w-[80%] overflow-y-auto"
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
        class="flex flex-row items-end justify-between bg-blue-600 px-6 pt-[33px] pb-6 bg-cover bg-center"
        style="background-image: url('${REPO_URL}/assets/gradient_texture_blue_overlay_header.png');"
      >
        <div class="flex flex-col items-start gap-2">
          <p
            class="font-libre italic text-lg font-italic text-vis-text-inverted"
          >
            ${place.startYear}${" "}–${" "}
            ${place.endYear ? place.endYear : "present"}
          </p>
          <p class="text-vis-text-inverted text-[32px]">${place.name}</p>
        </div>
        <a
          href=${place.projectLink}
          target="_blank"
          rel="noopener noreferrer"
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
        </a>
      </div>
      <div class="grid grid-cols-5">
        <div
          class="col-span-2 p-6 text-vis-text-primary text-[16px] leading-[155%] font-authentic"
        >
          ${place.description}
        </div>
        <div class="col-span-1 p-6 bg-vis-surface-primary-tonal">
          <p class="${titleClasses} text-vis-text-primary">location</p>
          <div
            class="flex flex-col space-y-2 font-authentic text-[16px] leading-[155%] text-vis-text-primary"
          >
            <div class="flex flex-row space-x-1">
              <svg width="21" height="21" fill="none" viewBox="0 0 21 21">
                <g>
                  <path
                    stroke="#000"
                    stroke-width="1.25"
                    d="M16.898 8.833c0 3.682-6.667 10-6.667 10s-6.667-6.318-6.667-10a6.667 6.667 0 1 1 13.334 0Z"
                  />
                  <path
                    fill="#000"
                    stroke="#000"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.25"
                    d="M10.23 9.667a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667Z"
                  />
                </g></svg
              ><span>${place.city}, ${place.state}</span>
            </div>
            <div class="flex flex-row space-x-1">
              <svg width="21" height="21" fill="none" viewBox="0 0 21 21">
                <g>
                  <path
                    stroke="#000"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.25"
                    d="M6.064 8.008 6.073 8m3.323.008L9.405 8m-3.341 3.342.009-.01m3.323.01.009-.01m-3.341 3.343.009-.009m3.323.009.009-.009M12.73 18h-9.5a.5.5 0 0 1-.5-.5V5.167a.5.5 0 0 1 .5-.5h4.5V3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5V8m0 10h4.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-4.5m0 10v-3.333m0-6.667v3.333m0 3.334v-3.334m0 3.334h1.667m-1.667-3.334h1.667"
                  />
                </g>
              </svg>
              <span>${place.areaType}</span>
            </div>
            <div class="flex flex-row space-x-1">
              <svg width="21" height="21" fill="none" viewBox="0 0 21 21">
                <defs>
                  <clipPath id="a" class="a">
                    <path fill="#fff" d="M.23.5h20v20h-20z" />
                  </clipPath>
                </defs>
                <g clip-path="url(#a)">
                  <path
                    stroke="#000"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.25"
                    d="M6.064 15.5v-.833a4.167 4.167 0 1 1 8.334 0v.833m-13.334 0v-.834a2.5 2.5 0 0 1 2.5-2.5M19.396 15.5v-.834a2.5 2.5 0 0 0-2.5-2.5"
                  />
                  <path
                    stroke="#000"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.25"
                    d="M10.23 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-6.667 1.667a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333Zm13.334 0a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333Z"
                  />
                </g>
              </svg>
              <div>
                <span>${place.populationSize}</span>
                <span
                  class="block font-libre italic text-[14px] leading-[135%] text-vis-text-secondary"
                  >as of ${place.populationDataYear}</span
                >
              </div>
            </div>
          </div>
        </div>
        <div
          class="col-span-1 bg-cover bg-center bg-no-repeat"
          style="background-image: url('${REPO_URL}/assets/areaImages/${areaImageName}'); margin: -2px;"
        ></div>
        <${GiniCoefficientChart}
          gini=${place.gini}
          titleClasses=${titleClasses}
        />
      </div>
      <div class="grid grid-cols-5">
        <div
          class="col-span-2 p-6 bg-vis-surface-primary bg-cover bg-center"
          style="background-image: url('${REPO_URL}/assets/gradient_texture_gray_bg.png');"
        >
          <p class="${titleClasses} text-vis-text-primary">highlight</p>
          <span
            class="text-vis-text-primary text-[16px] leading-[155%] font-authentic "
            >${place.highlight}</span
          >
        </div>
        <div class="col-span-3">
          <div class="p-6 bg-vis-main-blue">
            <p class="${titleClasses} text-vis-text-inverted">Focus area(s)</p>
            <div class="flex flex-wrap gap-2">
              ${place.focusAreas && place.focusAreas.length > 0
                ? place.focusAreas.map((focusArea) => {
                    return html`<div
                      class="flex flex-row space-x-2 items-center text-vis-text-primary px-3 py-1 rounded-full text-sm font-sora uppercase bg-vis-surface-primary-tonal"
                    >
                      <div class="w-[10px] h-[10px]">
                        ${getFocusAreaGroupIcon(
                          getFocusAreaGroupFromArea(focusArea, allFocusAreas),
                          "#0F100F"
                        )}
                      </div>
                      <span>${focusArea}</span>
                    </div>`;
                  })
                : null}
            </div>
          </div>

          <div class="p-6 bg-white">
            <p class="${titleClasses} text-vis-text-primary">Partners</p>
            <div class="flex flex-row gap-8 items-center h-12 overflow-y-auto">
              ${place.partners && place.partners.length > 0
                ? place.partners.map((partner) => {
                    const partnerData = partners.find(
                      (p) => p.partnerName === partner
                    );
                    if (!partnerData || !partnerData.partnerLink)
                      return html`<img
                        src="${REPO_URL}/assets/partnerLogos/Partner Name=${partner}.png"
                        alt="${partner} logo"
                        class="h-12 object-contain"
                      />`;
                    return html`<a
                      href=${partnerData.partnerLink}
                      target="_blank"
                      ><img
                        src="${REPO_URL}/assets/partnerLogos/Partner Name=${partner}.png"
                        alt="${partner} logo"
                        class="h-12 min-w-12 object-contain"
                    /></a>`;
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="map-details-background absolute inset-0 bg-black opacity-50 backdrop-blur-md"
      onclick=${handleCloseOverlay}
    ></div>
  </div>`;
}

function GiniCoefficientChart({ gini, titleClasses }) {
  if (!gini) {
    return html`<p>No Gini Coefficient data available.</p>`;
  }

  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatedGini, setAnimatedGini] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // get width and height of the image
  useEffect(() => {
    const giniEllipse = document.getElementById("gini-ellipse");
    if (giniEllipse) {
      const handleLoad = () => {
        setWidth(giniEllipse.naturalWidth || giniEllipse.width);
        setHeight(giniEllipse.naturalHeight || giniEllipse.height);
      };
      if (giniEllipse.complete) {
        handleLoad();
      } else {
        giniEllipse.addEventListener("load", handleLoad);
        return () => {
          giniEllipse.removeEventListener("load", handleLoad);
        };
      }
    }
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const giniContainer = document.getElementById("gini-container");
    if (!giniContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the component is visible
      }
    );

    observer.observe(giniContainer);

    return () => {
      observer.unobserve(giniContainer);
    };
  }, [isVisible]);

  // Animate gini value counting up
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startValue = 0;
    const endValue = gini;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setAnimatedGini(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isVisible, gini]);

  // Map gini value (0-1) to angle range:
  const startAngle = Math.PI; // 180° (left)
  const endAngle = 2 * Math.PI; // 360° (right)
  const angle = startAngle + animatedGini * (endAngle - startAngle);

  const lineLength = height * 0.625; // Length of the line as 62.5% of the image height
  const centerX = width / 2;
  const centerY = height; // Bottom center of SVG

  // Calculate start and end points of the line
  const startX = centerX + (height + 0.01) * Math.cos(angle);
  const startY = centerY + (height + 0.01) * Math.sin(angle);
  const endX = centerX + lineLength * Math.cos(angle);
  const endY = centerY + lineLength * Math.sin(angle);

  return html` <div class="col-span-1 p-6 bg-vis-surface-primary-tonal">
    <div class="flex flex-row gap-1 items-center relative">
      <span class="${titleClasses} text-vis-text-primary">gini coefficient</span
      ><img
        src="../assets/question_icon.svg"
        class="cursor-pointer mb-4"
        onmouseenter="${() => setShowTooltip(true)}"
        onmouseleave="${() => setShowTooltip(false)}"
      />
      <div
        class="bg-[#0F100F] px-4 py-2 absolute top-[30px] right-0 font-authentic text-base leading-[155%] text-vis-text-inverted text-transform-none z-10 ${showTooltip
          ? ""
          : "hidden"}"
      >
        The Gini coefficient measures inequality on a scale ranging from${" "}
        <span class="font-bold">0%</span>
        (complete equality: everyone has the same income) to${" "}
        <span class="font-bold">100%</span> (complete inequality: one person has
        all the income).
      </div>
    </div>
    <div class="relative" id="gini-container">
      <img
        src="${REPO_URL}/assets/gini_coefficient_ellipse.png"
        alt="Gini Coefficient Chart"
        id="gini-ellipse"
      />
      ${width && height
        ? html`<svg
            width="${width}"
            height="${height}"
            style="position: absolute; top: 0; left: 0; overflow: visible;"
          >
            <rect width="${width}" height="${height}" fill="red" opacity="0" />
            <line
              x1="${startX}"
              y1="${startY}"
              x2="${endX}"
              y2="${endY}"
              stroke="#0F100F"
              stroke-width="3"
              stroke-linecap="round"
              style="transition: all 0.1s ease-out;"
            />
            <g opacity="0">
              <circle cx="${centerX}" cy="${centerY}" r="2" fill="red" />
              <circle cx="${startX}" cy="${startY}" r="2" fill="green" />
              <circle cx="${endX}" cy="${endY}" r="2" fill="blue" />
            </g>
            <text
              x="${centerX}"
              y="${centerY}"
              dy="-12"
              fill="#0f100f"
              font-size="14"
              text-anchor="middle"
              class="font-sora font-bold"
              style="transition: all 0.1s ease-out;"
            >
              ${(animatedGini * 100).toFixed(0)}%
            </text>
          </svg>`
        : null}
      <div class="flex justify-between w-full mt-2" style="width: ${width}px">
        <p
          class="italic font-libre text-[14px] leading-[135%] text-vis-text-secondary "
        >
          complete<br />equality
        </p>
        <p
          class="italic font-libre text-[14px] leading-[135%] text-vis-text-secondary text-right"
        >
          complete<br />inequality
        </p>
      </div>
    </div>
  </div>`;
}
