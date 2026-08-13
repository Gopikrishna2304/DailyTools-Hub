/* ==========================================================================
   DailyTools Hub — converters.js
   Conversion tables and logic for the Unit Converter and Temperature
   Converter tools.
   ========================================================================== */

/* Each category stores factors relative to a base unit */
const UNIT_CATEGORIES = {
  length: {
    label: "Length",
    base: "meter",
    units: {
      meter: { label: "Meters (m)", factor: 1 },
      kilometer: { label: "Kilometers (km)", factor: 1000 },
      centimeter: { label: "Centimeters (cm)", factor: 0.01 },
      millimeter: { label: "Millimeters (mm)", factor: 0.001 },
      mile: { label: "Miles (mi)", factor: 1609.344 },
      yard: { label: "Yards (yd)", factor: 0.9144 },
      foot: { label: "Feet (ft)", factor: 0.3048 },
      inch: { label: "Inches (in)", factor: 0.0254 },
    },
  },
  weight: {
    label: "Weight",
    base: "kilogram",
    units: {
      kilogram: { label: "Kilograms (kg)", factor: 1 },
      gram: { label: "Grams (g)", factor: 0.001 },
      milligram: { label: "Milligrams (mg)", factor: 0.000001 },
      pound: { label: "Pounds (lb)", factor: 0.45359237 },
      ounce: { label: "Ounces (oz)", factor: 0.0283495231 },
      tonne: { label: "Metric Tonnes (t)", factor: 1000 },
    },
  },
  area: {
    label: "Area",
    base: "sqmeter",
    units: {
      sqmeter: { label: "Square Meters (m²)", factor: 1 },
      sqkilometer: { label: "Square Kilometers (km²)", factor: 1000000 },
      sqfoot: { label: "Square Feet (ft²)", factor: 0.09290304 },
      sqyard: { label: "Square Yards (yd²)", factor: 0.83612736 },
      acre: { label: "Acres", factor: 4046.8564224 },
      hectare: { label: "Hectares", factor: 10000 },
    },
  },
  speed: {
    label: "Speed",
    base: "mps",
    units: {
      mps: { label: "Meters/second (m/s)", factor: 1 },
      kmph: { label: "Kilometers/hour (km/h)", factor: 0.277778 },
      mph: { label: "Miles/hour (mph)", factor: 0.44704 },
      knot: { label: "Knots", factor: 0.514444 },
    },
  },
  volume: {
    label: "Volume",
    base: "liter",
    units: {
      liter: { label: "Liters (L)", factor: 1 },
      milliliter: { label: "Milliliters (mL)", factor: 0.001 },
      gallon: { label: "US Gallons (gal)", factor: 3.785411784 },
      quart: { label: "US Quarts (qt)", factor: 0.946352946 },
      cup: { label: "US Cups", factor: 0.2365882365 },
      cubicmeter: { label: "Cubic Meters (m³)", factor: 1000 },
    },
  },
};

function convertUnit(category, fromUnit, toUnit, value) {
  const cat = UNIT_CATEGORIES[category];
  if (!cat) return null;
  const fromFactor = cat.units[fromUnit]?.factor;
  const toFactor = cat.units[toUnit]?.factor;
  if (fromFactor == null || toFactor == null) return null;
  const baseValue = value * fromFactor;
  return baseValue / toFactor;
}

/* ---------- Temperature ---------- */
function convertTemperature(fromUnit, toUnit, value) {
  let celsius;
  switch (fromUnit) {
    case "celsius": celsius = value; break;
    case "fahrenheit": celsius = (value - 32) * (5 / 9); break;
    case "kelvin": celsius = value - 273.15; break;
    default: return null;
  }
  switch (toUnit) {
    case "celsius": return celsius;
    case "fahrenheit": return celsius * (9 / 5) + 32;
    case "kelvin": return celsius + 273.15;
    default: return null;
  }
}
