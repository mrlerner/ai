// ---- Furniture data. Edit this list to change names, descriptions, prices, or photos. ----
// After editing, run `node build.js` to regenerate the per-item pages.
const ITEMS = [
  {
    id: "stools",
    sources: [["DWR – Bottega Piston Stool","https://www.dwr.com/kitchen-dining-bar-counter-stools/bottega-piston-stool/6904.html"]],
    eyebrow: "Set of 3 · Bar / counter stools",
    name: "Bottega Piston Stools, Black Leather",
    brand: "Frag (Italy) · sold by Design Within Reach · designed by Renzo Fauciglietti &amp; Graziella Bianchi",
    price: "$1,326.50 each",
    priceNote: "current DWR sale price",
    desc: [
      "The classic DWR piston stool. Black split-grain leather is hand-sewn over a lightly padded steel frame, on a brushed stainless-steel column with a square plate base and oval footrest.",
      "A lever under the seat raises or lowers the seat with a gas piston, so the same stool works at counter height or bar height. The seat swivels a full 360°. Made in Italy, Frag logo embossed on the leather."
    ],
    specs: [["Seat height","21¾\" to 31½\" (adjustable)"],["Overall","38⅝\" H × 17⅜\" W × 18½\" D"],["Materials","Split-grain leather, steel frame, stainless-steel piston and base"],["Condition","Used, light wear to leather and base plates (see photos)"]],
    tags: ["Set of 3","Adjustable height","Swivel","Made in Italy"],
    photos: ["IMG_8455","IMG_8456","IMG_8454","IMG_8448"],
    videos: ["IMG_8452"]
  },
  {
    id: "leather-sofa",
    sources: [["CB2 – Moet Charcoal Leather Tufted Sofa","https://www.cb2.ae/en/product/moet-charcoal-leather-tufted-sofa/484783_CB2"]],
    eyebrow: "Sofa · Leather",
    name: "Moet Charcoal Leather Tufted Sofa",
    brand: "CB2 · designed by Jannis Ellenberger (Ellenberger Studio, Bremen), 2020",
    price: "≈ $4,300",
    priceNote: "discontinued in the US; converted from CB2 UAE's current listing",
    desc: [
      "A low, deep 96-inch sofa in charcoal-black leather with a button-tufted back and seat, wrapped over an open acacia-wood frame. The leather back and side panels are set into the wood frame, so the sofa looks finished from every angle and can float in a room.",
      "Designed for CB2 by German designer Jannis Ellenberger, whose work for CB2 also includes the Brace sofa and Drommen bed. The leather has a natural, lightly distressed finish that varies across the hide."
    ],
    specs: [["Overall","95¾\" W × 35\" D × 29¾\" H"],["Materials","Leather upholstery, solid acacia wood frame"],["Condition","Used, leather shows natural patina; frame in good shape (see photos)"]],
    tags: ["Leather","Acacia frame","Tufted","Discontinued"],
    photos: ["IMG_8466","IMG_8461","IMG_8468","IMG_8463","IMG_8464","IMG_8471","IMG_8462"],
    videos: ["IMG_8460"]
  },
  {
    id: "fabric-sofa",
    sources: [["DWR – Jonas Sofa","https://www.dwr.com/living-sofas/jonas-sofa/2195231.html"]],
    eyebrow: "Sofa · Fabric",
    name: "Jonas Sofa, Light Gray with Black Legs",
    brand: "Design Within Reach · designed by Jonas Wagell (Sweden), 2016",
    price: "$4,295",
    priceNote: "DWR list price in the base fabric",
    desc: [
      "DWR's best-known modern sofa. Swedish designer Jonas Wagell gave it feather-and-fiber back cushions with eased edges, gently arced arms, and slender, tall cast-aluminum legs, here in the black powder-coat finish.",
      "Upholstered in a light gray textured weave. Two loose seat cushions and two back cushions; the back cushions were updated in 2019 for better shape retention. Made in the USA."
    ],
    specs: [["Overall","87½\" W × 37½\" D × 32½\" H"],["Seat","20\" H × 70\" W × 22\" D"],["Legs","Cast aluminum, black powder-coat, 7½\""],["Condition","Used, good; fabric clean (see photos)"]],
    tags: ["Feather back cushions","Made in USA","87.5\" wide"],
    photos: ["IMG_8477","IMG_8478","IMG_8479"],
    videos: ["IMG_8473","IMG_8476"]
  },
  {
    id: "bench",
    sources: [["West Elm – Celine Bench, Metal Legs","https://www.westelm.com/products/celine-bench-metal-legs-h13652/"]],
    eyebrow: "Bench · Velvet",
    name: "Celine Bench, Pewter Distressed Velvet with Brass Legs",
    brand: "West Elm",
    price: "$699",
    priceNote: "West Elm list price for this fabric and finish",
    desc: [
      "Inspired by the sculptural forms of Italian mid-century design, the Celine Bench curves a low upholstered back around a thick, reversible cushion. Upholstered in West Elm's Performance Distressed Velvet in Pewter, on slender tapered metal legs in an antique brass finish.",
      "Works at the foot of a bed, in an entryway, or as extra seating in a living room. Solid wood frame, GREENGUARD Gold certified, contract grade."
    ],
    specs: [["Overall","52\" W × 19\" D × 23¼\" H"],["Fabric","Performance Distressed Velvet, Pewter"],["Legs","Tapered metal, antique brass finish, removable"],["Condition","Used, good; some pile variation typical of distressed velvet"]],
    tags: ["Velvet","Brass legs","52\" wide"],
    photos: ["IMG_8489","IMG_8488"],
    videos: ["IMG_8490"]
  },
  {
    id: "coffee-table",
    eyebrow: "Coffee table · Glass",
    name: "Sculptural Black Glass Coffee Table",
    brand: "Maker not yet confirmed",
    price: "TBD",
    priceNote: "no maker label found on the piece",
    desc: [
      "A freeform, rounded-triangle top of smoked black tempered glass floats on a matte black sculpted base shaped like a boat hull or a fin, with no legs. The glass reads as a black mirror and the base tapers to a narrow footprint, so the table looks very light for its size.",
      "Pairs well with either of the sofas above and sits at a low lounge height."
    ],
    specs: [["Top","Freeform black tempered glass"],["Base","Matte black sculpted base (lacquered composite or fiberglass)"],["Condition","Used, good; glass unchipped in photos"]],
    tags: ["Black glass","Sculptural base","Freeform"],
    photos: ["IMG_8486","IMG_8485","IMG_8487"],
    videos: [],
  },
  {
    id: "tv",
    eyebrow: "Electronics",
    name: "Sony Bravia 85\" X950G 4K HDR TV with Soundbar",
    brand: "Sony · XBR-85X950G (2019)",
    price: "$4,999.99",
    priceNote: "Sony launch price, 2019; discontinued",
    desc: [
      "Sony's 2019 flagship LED, the X950G, in the largest 85\" size. Full-array local dimming backlight, X1 Ultimate processor, 120 Hz native panel, and X-Wide Angle for even color off-axis. HDR10, Dolby Vision, HLG and IMAX Enhanced; Android TV with Google Assistant, Chromecast built in, and Alexa compatible.",
      "Wall mounted with a full-width fabric-grille soundbar beneath it, cut to the same width as the panel. Thin brushed-metal bezel, Sony badge centered on the bottom edge. Buyer would need to arrange removal from the wall mount."
    ],
    specs: [["Model","XBR-85X950G"],["Screen","84.6\" diagonal, 4K UHD 3840 × 2160, 120 Hz"],["Backlight","Full-array LED with local dimming"],["HDR","HDR10, Dolby Vision, HLG, IMAX Enhanced"],["Inputs","4 × HDMI (eARC), 3 × USB, Ethernet, Wi-Fi, Bluetooth"],["Smart","Android TV, Google Assistant, Chromecast, Alexa compatible"],["Includes","Full-width soundbar mounted below the screen, sized to match the 85\" panel"],["Condition","Used, working"]],
    tags: ["Sony","85 inch","Full-array local dimming","Wall mounted","Soundbar included"],
    photos: ["IMG_8480","IMG_8484","IMG_2628"],
    videos: [],
  },
  {
    id: "orb-chair",
    sources: [["West Elm – Orb Upholstered Dining Chair","https://www.westelm.com/products/orb-upholstered-dining-chair-h2410/"]],
    eyebrow: "Dining chair · Upholstered",
    name: "Orb Upholstered Dining Chair, Charcoal Tweed, Metal Legs",
    brand: "West Elm",
    price: "≈ $349–$449",
    priceNote: "last West Elm list range by fabric; discontinued (\"no longer available\" on westelm.com)",
    desc: [
      "West Elm's Orb chair: a scooped, rounded shell with a cutout at the back, a fixed padded seat, and slim tapered legs in black powder-coated metal. Upholstered in a charcoal flecked tweed weave.",
      "Contract grade. Works as a dining chair, a desk chair, or an occasional chair in a bedroom corner."
    ],
    specs: [["Overall","24¼\" W × 22½\" D × 31.6\" H"],["Upholstery","Charcoal flecked tweed, fixed seat cushion"],["Legs","Tapered metal, black powder-coat, floor glides"],["Quantity","1 (see photos)"],["Condition","Used, good; no visible wear to fabric in photos"]],
    tags: ["West Elm","Tweed","Metal legs","Discontinued"],
    photos: ["IMG_8494","IMG_8495"],
    videos: ["IMG_8493"]
  },
  {
    id: "tub-chairs",
    eyebrow: "Pair · Tub chairs",
    name: "Pair of Upholstered Tub Chairs, Black & White Dash Weave",
    brand: "Maker not yet confirmed",
    price: "TBD",
    priceNote: "no maker label visible in the photos",
    desc: [
      "Two matching barrel-back club chairs, fully upholstered including the legs (Parsons style), in a heavy black weave with an irregular white broken-dash pattern. The back wraps in a continuous curve into low arms, over a tight seat.",
      "Compact enough for a bedroom or a reading corner, and comfortable for their size."
    ],
    specs: [["Style","Barrel / tub chair, fully upholstered, Parsons legs"],["Fabric","Black with white broken-dash jacquard weave"],["Quantity","2"],["Condition","Used, good; fabric clean in photos"]],
    tags: ["Set of 2","Tub chair","Patterned weave"],
    photos: ["IMG_8497"],
    videos: ["IMG_8496"],
  },
  {
    id: "media-console",
    sources: [["2Modern – BDI Corridor 8177","https://2modern.com/products/corridor-8177-tv-console"]],
    eyebrow: "Media console · Louvered",
    name: "BDI Corridor 8177 Media Console, Charcoal Stained Ash",
    brand: "BDI (USA) · designed by Matthew Weatherly",
    price: "$3,799",
    priceNote: "BDI list price via 2Modern, September 2026",
    desc: [
      "BDI's Corridor console in the charcoal-stained ash finish, topped with black satin-etched tempered glass. The slatted hardwood louvers on the doors and drawer front pass remote signals and ventilate the components behind them.",
      "Louvered doors on each side conceal adjustable shelving; the center bay is open with an adjustable shelf, and a wide louvered drawer below it holds media and remotes. Built-in cord management, flow-through ventilation, and hidden casters make it easy to pull out from the wall."
    ],
    specs: [["Overall","65\" W × 20¼\" D × 28¼\" H (8177)"],["Top","Black satin-etched tempered glass, 150 lb capacity"],["Materials","Stained solid hardwood and hardwood veneer, powder-coated steel"],["Features","Louvered doors and drawer, adjustable shelves, cable management, hidden casters"],["Condition","Used, good; louvers intact, glass unchipped in photos"]],
    tags: ["BDI","Charcoal ash","Glass top","Cable management","Hidden casters"],
    photos: ["IMG_8528","IMG_8531","IMG_8532","IMG_8498","IMG_8499"],
    videos: ["IMG_8530"],
  },
  {
    id: "patio-bar-set",
    sources: [["Tolix – H75 stool, raw steel","https://www.thecoolrepublic.com/en-us/furniture/bar-stools/stool-in-steel-h75-brut-satin-varnished-tolix"]],
    eyebrow: "Outdoor · Bar table + 4 stools",
    name: "Outdoor Bar Table with 4 Tolix H Stools",
    brand: "Tolix (France) stools · table maker not yet confirmed",
    price: "≈ $307 per stool + table TBD",
    priceNote: "Tolix H75 raw-steel list price; no label found for the table",
    desc: [
      "A square bar-height table in black powder-coated aluminum with a slatted plank top and an umbrella hole, paired with four original Tolix H stools at 75 cm bar height. The stools carry the Tolix stamp on the seat apron.",
      "The stools are the raw-steel varnished finish, which Tolix rates for indoor use, so they have taken on surface patina and light rust from living on the balcony. Stackable."
    ],
    specs: [["Table","Square slat-top bar table, black aluminum, umbrella hole"],["Stools","Tolix H stool, 75 cm (29½\") seat height, raw steel with clear varnish, stackable"],["Quantity","1 table, 4 stools"],["Condition","Used outdoors; stools show patina and rust spots, table finish good"]],
    tags: ["Outdoor","Tolix","Bar height","Set of 4 stools"],
    photos: ["IMG_8500"],
    videos: [],
  },
  {
    id: "outdoor-chairs",
    eyebrow: "Outdoor · Pair of lounge chairs",
    name: "Pair of Outdoor Lounge Chairs, Black Aluminum with Blush Cushions",
    brand: "Maker not yet confirmed",
    price: "TBD",
    priceNote: "no maker label visible in the photos",
    desc: [
      "Two deep-seat outdoor lounge chairs with black powder-coated aluminum frames and wide flat arms, fitted with thick back and seat cushions in a blush pink stripe outdoor fabric with welted edges.",
      "Shown on the balcony with a concrete drum side table between them."
    ],
    specs: [["Frame","Black powder-coated aluminum, flat slab arms"],["Cushions","Blush pink stripe outdoor fabric, welted, back and seat"],["Quantity","2 chairs"],["Condition","Used outdoors; cushions show some fading and water marks (see photos)"]],
    tags: ["Outdoor","Set of 2","Aluminum","Cushions included"],
    photos: ["IMG_8502","IMG_8501","IMG_8503"],
    videos: [],
  },
  {
    id: "console-tables",
    eyebrow: "Set of 2 · Console tables",
    name: "Nesting Console Tables, Reclaimed Wood and Black Iron",
    brand: "Maker not yet confirmed",
    price: "TBD",
    priceNote: "no maker label visible in the photos",
    desc: [
      "Two console tables that nest one under the other: a taller, narrower table and a lower, deeper one. Each has a thick plank top of reclaimed wood with a weathered, uneven surface, on a thin welded square-tube iron frame in matte black with a stretcher at the base.",
      "Use them nested against a wall, side by side as a long console, or split up as a sofa table and an entry table."
    ],
    specs: [["Tops","Reclaimed wood planks, natural finish"],["Frames","Square-tube iron, matte black"],["Quantity","2 (nesting set)"],["Condition","Used, good; tops have the intended reclaimed-wood texture and checks"]],
    tags: ["Set of 2","Nesting","Reclaimed wood","Iron frame"],
    photos: ["IMG_8506","IMG_8509","IMG_8508"],
    videos: ["IMG_8507"]
  },
  {
    id: "mobican-bed",
    sources: [["Design Quest – Mobican Lea Bed","https://www.designquest.biz/mobican-lea-bed-with-upholstered-headboard.html"], ["Design Quest – Mobican Alexia Night Tables","https://www.designquest.biz/mobican-alexia-2-drawer-night-table-with-glass-top.html"]],
    eyebrow: "Bedroom set · Walnut",
    name: "Mobican Lea Bed with Upholstered Headboard and Pair of Alexia Night Tables, Walnut",
    brand: "Mobican (Quebec, Canada)",
    price: "$3,293 bed + $982 per night table",
    priceNote: "Design Quest list prices, queen bed; king is $62 more",
    desc: [
      "A Canadian-made walnut bedroom set. The Lea platform bed has an upholstered headboard in two dark gray panels, capped and framed in walnut, on a walnut rail base with gently splayed tapered legs. It takes a mattress only, on a European slat system.",
      "The two Alexia night tables match in warm walnut: a single soft-close drawer with a notched integrated pull, an open shelf below, a finished back, and a dark ebony-tinted glass top. The drawer boxes are solid maple and stamped Mobican."
    ],
    specs: [["Bed (queen)","67\" W × 85½\" L × 40\" H, 11\" floor to mattress (measure to confirm queen vs. king)"],["Night tables","25\" W × 17½\" D × 19\" H each, 1 drawer with open shelf, ebony glass top"],["Materials","Walnut veneer and solid wood, maple drawer boxes, upholstered headboard"],["Condition","Used, good; headboard fabric shows some surface marks (see photos)"]],
    tags: ["Mobican","Walnut","Made in Canada","Glass top","Bed + 2 night tables"],
    photos: ["IMG_8513","IMG_8514","IMG_8510","IMG_8511","IMG_8512"],
    videos: [],
  },
  {
    id: "gray-bed",
    eyebrow: "Bed · Upholstered",
    name: "Gray Upholstered Platform Bed",
    brand: "Maker not yet confirmed",
    price: "TBD",
    priceNote: "no maker label visible in the photos",
    desc: [
      "A low platform bed fully upholstered in a light gray wool-look weave. The headboard is a thick, gently angled slab with stitched vertical and horizontal seams that divide it into a grid of panels, and the side rails are wide, square-edged boxes that continue the same fabric.",
      "It sits on short black block feet that tuck under the frame, so the bed appears to float just above the floor."
    ],
    specs: [["Style","Low platform, box side rails, stitched panel headboard"],["Fabric","Light gray heathered weave"],["Feet","Black block feet, recessed"],["Condition","Used, good; fabric clean in photos"]],
    tags: ["Upholstered","Platform","Light gray"],
    photos: ["IMG_8515","IMG_8525","IMG_8518","IMG_8526","IMG_8527"],
    videos: [],
  },
  {
    id: "orange-armchair",
    eyebrow: "Armchair · Upholstered",
    name: "Mid-Century Armchair, Rust Orange Tweed with Walnut Legs",
    brand: "Maker not yet confirmed",
    price: "TBD",
    priceNote: "no maker label visible in the photos",
    desc: [
      "A mid-century style lounge chair upholstered in a rust-orange heathered tweed weave. The tall, slightly reclined back is a single tight-upholstered panel with a gentle curve at the top, and the low boxy arms flare out from the seat with a welted edge. A loose, welted seat cushion sits on a tight deck.",
      "Slim round tapered legs in a dark walnut finish are splayed outward. Comfortable as a reading chair or as a pair of accent chairs in a living room."
    ],
    specs: [["Style","Mid-century lounge chair, tight back, loose seat cushion"],["Fabric","Rust-orange heathered tweed weave, welted seams"],["Legs","Round tapered wood, dark walnut finish"],["Quantity","1"],["Condition","Used, good; fabric clean in photos"]],
    tags: ["Mid-century","Rust orange","Walnut legs","Tweed"],
    photos: ["IMG_8534","IMG_8535","IMG_8537"],
    videos: [],
  },
  {
    id: "reclaimed-dresser",
    eyebrow: "Dresser · Reclaimed wood",
    name: "Reclaimed Wood Gentleman's Chest, Mixed Planks with Black Drawers",
    brand: "Maker not yet confirmed",
    price: "TBD",
    priceNote: "no maker label visible in the photos",
    desc: [
      "A tall dresser built from mixed reclaimed hardwood planks, each drawer and door front showing a different tone and grain, from pale weathered gray to deep red-brown. Two small drawers run across the top; below them, a column of three black-painted drawers with curved cutout pulls sits beside a single-door cabinet, and two full-width drawers finish the bottom.",
      "Matte black round knobs on the wood fronts, and the whole case sits on short angled black feet. Plenty of storage for a bedroom or a large entry."
    ],
    specs: [["Layout","2 small top drawers, 3 black drawers + 1 door in the middle, 2 wide bottom drawers"],["Materials","Reclaimed mixed hardwood planks, black-painted drawer fronts, black metal knobs"],["Feet","Angled black wood feet"],["Condition","Used, good; reclaimed surfaces have the intended checks and nail marks"]],
    tags: ["Reclaimed wood","Dresser","Gentleman's chest","Black accents"],
    photos: ["IMG_8540","IMG_8538"],
    videos: [],
  }
];

if (typeof module !== "undefined") module.exports = ITEMS;
