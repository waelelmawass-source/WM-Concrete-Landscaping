/* =========================================================
   YOUR BUSINESS DETAILS — edit these and the whole site updates.
   ========================================================= */
window.SITE = {
  businessName: "WM Concreting & Landscaping",
  tagline: "Concreting & Landscaping",
  phone: "0414 233 639",              // shown on the site + used for the Call button
  whatsapp: "61414233639",            // international format, no + or spaces (Australia = 61, drop the leading 0)
  email: "WM.decorative.concrete@gmail.com",
  serviceArea: "All of Victoria",
  hours: "Available 24/7",
  abn: "",                            // optional, e.g. "ABN 12 345 678 901"
  whatsappMessage: "Hi! I found your website and I'd like a quote for ",
  instagram: "",                      // optional full URL
  facebook: ""                        // optional full URL
};

/* =========================================================
   SERVICES — each one has a matching photo folder in /gallery
   (folder = the name of the folder inside /gallery)
   ========================================================= */
window.CATEGORIES = [
  // Landscaping
  { folder: "synthetic-turf", group: "landscaping", title: "Synthetic Turf",
    desc: "Low-maintenance, year-round green lawns, play areas and putting greens with a properly prepared, free-draining base." },
  { folder: "natural-turf", group: "landscaping", title: "Natural Turf",
    desc: "Soil preparation, levelling and fresh instant turf laid for a healthy lawn that establishes fast." },
  { folder: "planting-garden-beds", group: "landscaping", title: "Planting & Garden Beds",
    desc: "Garden bed design and build, edging, soil, mulch and planting chosen to suit your site and style." },
  { folder: "retaining-walls", group: "landscaping", title: "Retaining Walls",
    desc: "Sleeper, block and concrete retaining walls built to hold the ground and level out your yard." },
  { folder: "water-features", group: "landscaping", title: "Water Features",
    desc: "Feature walls, ponds and modern fountains that add sound and movement to your outdoor space." },
  { folder: "decking", group: "landscaping", title: "Decking",
    desc: "Merbau hardwood and composite decks: entertaining areas, steps and pool surrounds built to last." },

  // Concrete
  { folder: "driveways", group: "concrete", title: "Driveways",
    desc: "Plain, coloured, exposed aggregate and stamped driveways, with excavation, base and steel done right." },
  { folder: "crossovers-footpaths", group: "concrete", title: "Council Crossovers & Footpaths",
    desc: "Vehicle crossovers and footpaths built to council specifications, including permits and inspections." },
  { folder: "car-parks", group: "concrete", title: "Car Parks",
    desc: "Commercial and residential car parks and hardstands designed for heavy traffic and proper drainage." },
  { folder: "slabs", group: "concrete", title: "Shed & Garage Slabs",
    desc: "Level, reinforced slabs for sheds, garages, carports and workshops, ready for your build." },
  { folder: "floating-steps", group: "concrete", title: "Floating Steps",
    desc: "Striking cantilevered concrete steps for entrances, gardens and level changes." },
  { folder: "decorative-concrete", group: "concrete", title: "Decorative Concrete",
    desc: "Exposed aggregate, honed, coloured and stencilled finishes for patios, paths and pool areas." },
  { folder: "steppers", group: "concrete", title: "Concrete Steppers",
    desc: "Precast or poured-in-place stepping pads set in turf, pebbles or garden beds." },
  { folder: "benchtops", group: "concrete", title: "Concrete Benchtops",
    desc: "Custom-made polished concrete benchtops for kitchens, bathrooms and outdoor BBQ areas." }
];
