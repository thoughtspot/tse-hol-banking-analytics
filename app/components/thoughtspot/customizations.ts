import type {
  CustomCssVariables,
  CustomisationsInterface,
} from "@thoughtspot/visual-embed-sdk";

/**
 * Forest-green theme for every embed. Applied once through init(), so the
 * Liveboard and the Spotter ("Banksy") embeds share it. Variables only: no
 * selector rules.
 */
const FOREST = "#123524";
const FOREST_TINT = "#EAF3EE";
const FOREST_TINT_STRONG = "#D3E6DA";
const FOREST_MID = "#1F6B45";
const FOREST_MID_HOVER = "#17553A";
const FOREST_MID_ACTIVE = "#0F4630";
const INK_GREEN = "#0F2A1D";
const INK_GREEN_SOFT = "#1B3A2B";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const POSITIVE_GREEN = "#0B6B2E";
const NEGATIVE_RED = "#A11B1B";
const SQUARE = "0";

const variables: CustomCssVariables = {
  // Square corners.
  "--ts-var-button-border-radius": SQUARE,
  "--ts-var-button--icon-border-radius": SQUARE,
  "--ts-var-chip-border-radius": SQUARE,
  "--ts-var-liveboard-tab-border-radius": SQUARE,

  // Buttons: strong contrast everywhere, including those inside visualizations.
  "--ts-var-button--primary-background": FOREST_MID,
  "--ts-var-button--primary-color": WHITE,
  "--ts-var-button--primary-border-color": FOREST_MID,
  "--ts-var-button--primary--hover-background": FOREST_MID_HOVER,
  "--ts-var-button--primary--active-background": FOREST_MID_ACTIVE,
  "--ts-var-button--secondary-background": WHITE,
  "--ts-var-button--secondary-color": INK_GREEN,
  "--ts-var-button--secondary-border-color": FOREST_MID,
  "--ts-var-button--secondary--hover-background": FOREST_TINT,
  "--ts-var-button--secondary--active-background": FOREST_TINT_STRONG,
  "--ts-var-button--tertiary-background": FOREST_TINT,
  "--ts-var-button--tertiary-color": INK_GREEN,
  "--ts-var-button--tertiary-border-color": FOREST_TINT_STRONG,
  "--ts-var-button--tertiary--hover-background": FOREST_TINT_STRONG,
  "--ts-var-button--tertiary--active-background": FOREST_TINT_STRONG,
  "--ts-var-liveboard-header-action-button-background": WHITE,
  "--ts-var-liveboard-header-action-button-font-color": INK_GREEN,
  "--ts-var-liveboard-header-action-button-hover-color": FOREST_TINT_STRONG,
  "--ts-var-liveboard-header-action-button-active-color": FOREST_TINT_STRONG,
  "--ts-var-liveboard-chip-background": FOREST_TINT,
  "--ts-var-liveboard-chip-color": INK_GREEN,
  "--ts-var-liveboard-chip--hover-background": FOREST_TINT_STRONG,
  "--ts-var-liveboard-chip--active-background": FOREST_TINT_STRONG,
  "--ts-var-liveboard-edit-toolbar-text": INK_GREEN,
  "--ts-var-liveboard-edit-toolbar-hover-background": FOREST_TINT_STRONG,
  "--ts-var-liveboard-edit-toolbar-hover-text-color": INK_GREEN,
  "--ts-var-liveboard-edit-toolbar-selected-background": FOREST_MID,
  "--ts-var-liveboard-edit-toolbar-selected-text-color": WHITE,
  "--ts-var-viz-legend-hover-background": FOREST_TINT,

  // Liveboard surfaces: dark forest canvas, white tiles, black headers.
  "--ts-var-liveboard-layout-background": FOREST,
  "--ts-var-liveboard-header-background": FOREST_TINT,
  "--ts-var-liveboard-header-font-color": BLACK,
  "--ts-var-liveboard-tab-background": FOREST_TINT,
  "--ts-var-liveboard-tab-color": BLACK,
  "--ts-var-liveboard-tab-hover-background": FOREST_TINT_STRONG,
  "--ts-var-liveboard-tab-hover-color": BLACK,
  "--ts-var-liveboard-tab-selected-background": WHITE,
  "--ts-var-liveboard-tab-selected-color": BLACK,
  "--ts-var-liveboard-tile-background": WHITE,
  "--ts-var-liveboard-tile-table-header-background": FOREST_TINT,
  "--ts-var-liveboard-group-background": FOREST_TINT,
  "--ts-var-liveboard-group-title-font-color": BLACK,
  "--ts-var-liveboard-group-description-font-color": INK_GREEN_SOFT,
  "--ts-var-liveboard-group-tile-background": WHITE,
  "--ts-var-liveboard-group-tile-title-font-color": BLACK,
  "--ts-var-liveboard-group-tile-description-font-color": INK_GREEN_SOFT,
  "--ts-var-liveboard-notetitle-heading-font-color": BLACK,
  "--ts-var-viz-background": WHITE,
  "--ts-var-viz-title-color": BLACK,
  "--ts-var-viz-description-color": INK_GREEN_SOFT,

  // KPI tiles.
  "--ts-var-kpi-hero-color": INK_GREEN,
  "--ts-var-kpi-comparison-color": INK_GREEN_SOFT,
  "--ts-var-kpi-analyze-text-color": INK_GREEN_SOFT,
  "--ts-var-kpi-positive-change-color": POSITIVE_GREEN,
  "--ts-var-kpi-negative-change-color": NEGATIVE_RED,

  // Spotter chat page.
  "--ts-var-root-background": FOREST_TINT,
  "--ts-var-root-color": INK_GREEN,
  "--ts-var-spotter-input-background": WHITE,
  "--ts-var-spotter-prompt-background": FOREST_TINT_STRONG,
  "--ts-var-saved-chats-bg": FOREST_TINT,
  "--ts-var-saved-chats-text-color": INK_GREEN,
  "--ts-var-saved-chats-title-color": BLACK,
  "--ts-var-saved-chats-section-title-color": INK_GREEN_SOFT,
  "--ts-var-saved-chats-border-color": FOREST_TINT_STRONG,
  "--ts-var-saved-chats-header-border": FOREST_TINT_STRONG,
  "--ts-var-saved-chats-footer-border": FOREST_TINT_STRONG,
  "--ts-var-saved-chats-btn-bg": FOREST_MID,
  "--ts-var-saved-chats-btn-hover-bg": FOREST_MID_HOVER,
  "--ts-var-saved-chats-conv-text-color": INK_GREEN,
  "--ts-var-saved-chats-conv-hover-bg": FOREST_TINT_STRONG,
  "--ts-var-saved-chats-conv-active-bg": FOREST_TINT_STRONG,
};

export const THOUGHTSPOT_CUSTOMIZATIONS: CustomisationsInterface = {
  style: { customCSS: { variables } },
  content: {
    strings: {
      Spotter: "Banksy",
    },
  },
};
