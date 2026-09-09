// ---- Furniture data. Edit this list to change names, descriptions, prices, or photos. ----
// After editing, run `node build.js` to regenerate the per-item pages.
const ITEMS = [
  {
    id: "stools",
    sources: [["DWR – Bottega Piston Stool","https://www.dwr.com/kitchen-dining-bar-counter-stools/bottega-piston-stool/6904.html"]],
    eyebrow: "Set of 3 · Bar / counter stools",
    name: "Bottega Piston Stools, Dark Brown Leather",
    brand: "Frag (Italy) · sold by Design Within Reach · designed by Renzo Fauciglietti &amp; Graziella Bianchi",
    price: "$1,326.50 each",
    desc: [
      "The classic DWR piston stool. Dark brown split-grain leather is hand-sewn over a lightly padded steel frame, on a brushed stainless-steel column with a square plate base and oval footrest.",
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
    sources: [["Design Quest – Mobican Lea Bed","https://www.designquest.biz/mobican-lea-bed-with-upholstered-headboard.html"]],
    eyebrow: "Bed · Walnut",
    name: "Mobican Lea Bed with Upholstered Headboard, Walnut",
    brand: "Mobican (Quebec, Canada)",
    price: "$3,293",
    desc: [
      "A Canadian-made walnut platform bed. The Lea has an upholstered headboard in two dark gray panels, capped and framed in walnut, on a walnut rail base with gently splayed tapered legs. It takes a mattress only, on a European slat system.",
      "The matching pair of Alexia night tables and the leather storage bench at the foot of the bed are listed separately."
    ],
    specs: [["Bed (queen)","67\" W × 85½\" L × 40\" H, 11\" floor to mattress (measure to confirm queen vs. king)"],["Materials","Walnut veneer and solid wood, upholstered headboard"],["Condition","Used, good; headboard fabric shows some surface marks (see photos)"]],
    tags: ["Mobican","Walnut","Made in Canada","Platform bed"],
    photos: ["IMG_2641","IMG_2642","IMG_2643"],
    videos: [],
  },
  {
    id: "night-tables",
    sources: [["Mobican – Alexia Night Table, 1 Drawer with Glass Top","https://mobican.com/en/product/alexia-night-table-1-drawer-with-glass-top/"], ["City Schemes – Mobican collection (pricing)","https://www.cityschemes.com/collections/mobican"]],
    eyebrow: "Set of 2 · Night tables · Walnut",
    name: "Pair of Mobican Alexia Night Tables, Walnut with Ebony Glass Top",
    brand: "Mobican (Quebec, Canada)",
    price: "$857 each",
    desc: [
      "Two matching night tables from Mobican's Alexia collection, in warm walnut with a dark ebony-tinted glass top. Each has a single soft-close drawer with a notched integrated pull cut into the top edge, and an open shelf below.",
      "The back is finished, so they can sit away from a wall. Drawer boxes are solid maple and stamped Mobican. They match the Lea bed also on this list."
    ],
    specs: [["Each","25\" W × 17½\" D × 19\" H"],["Storage","1 soft-close drawer, open shelf"],["Materials","Walnut veneer and solid wood, maple drawer box, tempered glass top"],["Condition","Used, good (see photos)"]],
    tags: ["Set of 2","Mobican","Walnut","Made in Canada","Glass top"],
    photos: ["IMG_2644","IMG_2646","IMG_2645","IMG_2647"],
    videos: [],
  },
  {
    id: "storage-bench",
    sources: [["CB2 – Dusk Leather and Wood Storage Bench (archived listing)","https://web.archive.org/web/20200505083812/https://www.cb2.com/dusk-leather-and-wood-storage-bench/s206064"]],
    eyebrow: "Bench · Storage",
    name: "CB2 Dusk Leather and Wood Storage Bench",
    brand: "CB2",
    price: "$799",
    desc: [
      "CB2's Dusk storage bench: a tufted, dark brown leather top on a warm walnut box, with a half circle of brass at the center and walnut veneer rays fanning out from it across the front. It sits on short tapered legs.",
      "The leather lid lifts on soft-close hinges to a roomy storage compartment, sized for blankets and pillows. Made for the foot of a bed or an entryway."
    ],
    specs: [["Overall","58\" W × 17¼\" D × 18½\" H"],["Interior","56\" W × 15½\" D × 10¾\" H"],["Materials","Leather top, solid and veneer walnut frame, brass inlay, soft-close hinges"],["Condition","Used; leather shows some creasing and light scuffs (see photos)"]],
    tags: ["Storage","Leather","Walnut","Brass","Discontinued"],
    photos: ["IMG_2638","IMG_2639","IMG_2640"],
    videos: [],
  },
  {
    id: "rug",
    sources: [["West Elm – Ombre Pop Indoor/Outdoor Rug","https://www.westelm.com/products/ombre-pop-indoor-outdoor-rug-t4390/"], ["West Elm Australia – Ombre Pop Indoor/Outdoor Rug, Iron","https://www.westelm.com.au/ombre-pop-indoor-outdoor-rug-t4390"]],
    eyebrow: "Rug · Indoor/outdoor",
    name: "West Elm Ombre Pop Indoor/Outdoor Rug, Iron",
    brand: "West Elm",
    price: "$399 (8' × 10') or $699 (9' × 12')",
    priceNote: "West Elm 2019 list prices; measure to confirm size",
    desc: [
      "West Elm's Ombre Pop rug: a handwoven, flat-pile indoor/outdoor rug in 100% recycled polyester that feels close to wool. The Iron colorway reads as a soft oatmeal ground with faint horizontal linework and darker flecks, finished with a knotted fringe at each end.",
      "It is reversible, shed-resistant and rated for outdoor use, so it works under a bed, in an entry, or on a covered patio. Made in India. Seen in the bed and night-table photos; it is the rug under the walnut bedroom set."
    ],
    specs: [["Size","8' × 10' or 9' × 12' (to be measured)"],["Pile","Flat, 6 mm"],["Materials","100% recycled polyester, handwoven, reversible"],["Care","Vacuum on low without a beater bar; professional cleaning for stains"],["Condition","Used, good; some flattening in the traffic path (see photos)"]],
    tags: ["West Elm","Indoor/outdoor","Recycled polyester","Reversible","Fringe"],
    photos: ["IMG_2647","IMG_2646","IMG_2640","IMG_2638"],
    videos: [],
  },
  {
    id: "gray-bed",
    eyebrow: "Bed · Upholstered",
    name: "Gray Upholstered Platform Bed",
    brand: "Maker not yet confirmed",
    price: "TBD",
    desc: [
      "A low platform bed fully upholstered in a light gray wool-look weave. The headboard is a thick, gently angled slab with stitched vertical and horizontal seams that divide it into a grid of panels, and the side rails are wide, square-edged boxes that continue the same fabric.",
      "It sits on short black block feet that tuck under the frame, so the bed appears to float just above the floor."
    ],
    specs: [["Style","Low platform, box side rails, stitched panel headboard"],["Fabric","Light gray heathered weave"],["Feet","Black block feet, recessed"],["Condition","Used, good; fabric clean in photos"]],
    tags: ["Upholstered","Platform","Light gray"],
    photos: ["IMG_2650","IMG_2648","IMG_2651"],
    videos: [],
  },
  {
    id: "orange-armchair",
    eyebrow: "Armchair · Upholstered",
    name: "Mid-Century Armchair, Rust Orange Tweed with Walnut Legs",
    brand: "Maker not yet confirmed",
    price: "TBD",
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
    sources: [["Crate &amp; Barrel – Atwood Tall Chest","https://www.crateandbarrel.com/atwood-tall-chest/s404066"]],
    eyebrow: "Tall chest · Reclaimed peroba &amp; walnut",
    name: "Crate &amp; Barrel Atwood Tall Chest, Reclaimed Peroba Wood and Black Walnut",
    brand: "Crate &amp; Barrel exclusive",
    price: "$2,600",
    priceLabel: "Original price",
    desc: [
      "Atwood mixes rustic reclaimed peroba wood from Brazil with refined solid black walnut. Uniquely weathered planks of live-edge wood show distinctive variations in texture and tone, blending contemporary design with rustic materials for an earthy look that is modern and bold.",
      "The tall chest combines four traditional drawers, an open cubby and three easy-access bins in a versatile storage piece with loads of character. It stands on angular lacquered steel legs, and one door conceals a fixed shelf, with antique iron hardware matching the drawers. A Crate &amp; Barrel exclusive."
    ],
    specs: [["Overall","40¼\" W × 20½\" D × 56\" H"],["Layout","4 drawers, 3 open bins, 1 open cubby, 1 door with fixed shelf"],["Materials","Reclaimed peroba wood, solid black walnut, lacquered steel legs, antique iron hardware"],["Condition","Used, good; reclaimed surfaces have the intended checks and nail marks"]],
    tags: ["Crate &amp; Barrel","Reclaimed peroba","Black walnut","Discontinued"],
    photos: ["IMG_8540","IMG_8538","IMG_8541"],
    videos: [],
  },
  {
    id: "corridor-sv-credenza",
    eyebrow: "Media credenza · Louvered · 79\" wide",
    name: "BDI Corridor SV 7129 Media Credenza, Charcoal Stained Ash",
    brand: "BDI (USA) · designed by Matthew Weatherly",
    price: "$3,499",
    sources: [["The Century House – BDI Corridor SV 7129","https://centuryhouseinc.com/product/bdi-corridor-sv-7129-media-console/"]],
    desc: [
      "The larger sibling of the Corridor 8177 console also in this list: BDI's Corridor SV 7129 in charcoal-stained ash, a 79-inch four-door credenza raised on a slim black steel leg frame. The louvered solid-wood doors pass remote signals and let components breathe, and the top is black satin-etched tempered glass.",
      "Behind the doors are two side compartments and a wide center compartment, each with adjustable shelves and flow-through ventilation. Rated for a TV up to 80 inches with a soundbar and six to eight components. The slim 15½-inch depth also works as a sideboard in a dining room or a long console in an entry."
    ],
    specs: [["Overall","79\" W × 15½\" D × 30\" H (10\" legs)"],["Doors","4 louvered doors, solid wood"],["Interior","2 side compartments (19\" W) and 1 center compartment (37.9\" W), adjustable shelves"],["Top","Black satin-etched tempered glass"],["Materials","Stained ash veneer and solid hardwood, powder-coated steel legs with levelers"],["Condition","Used, good; louvers intact, glass unchipped in photos"]],
    tags: ["BDI","Charcoal ash","Glass top","Steel legs","79\" wide"],
    photos: ["IMG_2630","IMG_2631","IMG_2632"],
    videos: [],
  },
  {
    id: "bdi-desk",
    sources: [["BDI – Corridor 6521 Executive Desk","https://www.bdiusa.com/products/corridor-6521-modern-executive-office-desk"],["2Modern – BDI Corridor 6521 Desk (pricing)","https://2modern.com/products/corridor-6521-desk"]],
    eyebrow: "Desk · Executive · 68\" wide",
    name: "BDI Corridor 6521 Executive Desk",
    brand: "BDI (USA) · designed by Matthew Weatherly",
    price: "$3,499",
    desc: [
      "The executive desk from BDI's Corridor Office collection, matching the two Corridor media pieces in this list. A satin-etched tempered glass work surface sits on a louvered hardwood case with a full modesty panel, so the desk looks finished from the front and can float in a room.",
      "Two side storage drawers and a flip-front keyboard drawer, all lined with non-slip material, plus wire management channels to keep cords out of sight. The satin-etched glass has a soft matte finish that resists scratches and fingerprints."
    ],
    specs: [["Overall","67¾\" W × 32¼\" D × 29¾\" H"],["Top","Black satin-etched tempered glass"],["Storage","2 side drawers, 1 flip-front keyboard drawer, non-slip liners"],["Materials","Stained solid wood and hardwood veneer, tempered glass, powder-coated steel"],["Finish","To confirm (offered in charcoal stained ash, chocolate stained walnut, natural walnut)"],["Weight","183 lb"],["Condition","Used, good"]],
    tags: ["BDI","Desk","Glass top","Keyboard drawer","Cable management"],
    photos: [],
    videos: [],
  },
  {
    id: "fir-desk",
    eyebrow: "Desk · Reclaimed fir · 60\" wide",
    name: "Reclaimed Fir Desk on Black Steel Base",
    brand: "Custom fabricated in Fremont, Seattle",
    price: "$1,000",
    priceLabel: "Original price",
    asking: "$500",
    desc: [
      "A simple, solid work table: a thick top of reclaimed solid fir on a welded black steel base. Custom fabricated by a shop in Fremont, so it is one of a kind.",
      "At 60 by 30 inches it fits two monitors with room to spare, and the plain steel base leaves the full width open underneath. Works as a desk, a craft table, or a compact dining table."
    ],
    specs: [["Overall","60\" L × 30\" W × 30\" H"],["Top","Solid reclaimed fir"],["Base","Black steel"],["Condition","Used, good; reclaimed fir has natural checks and grain variation"]],
    tags: ["Reclaimed fir","Steel base","Custom made","Seattle made"],
    photos: [],
    videos: [],
  },
  {
    id: "steelcase-credenza",
    eyebrow: "Credenza · Vintage 1960s · Refurbished",
    name: "Steelcase 1960s Credenza, Fully Refurbished",
    brand: "Steelcase (USA), 1960s · restored in Ballard, Seattle",
    price: "≈ $5,000",
    priceLabel: "Original price",
    desc: [
      "A mid-century steel credenza from Steelcase, the maker of the classic tanker desk, professionally refurbished about ten years ago. Steelcase built these for offices in the 1960s, so the case is heavy-gauge steel that will outlast anything made today.",
      "Believed to have been restored by Space Oddity Vintage Furniture Studio in Ballard, which specializes in stripping and refinishing vintage Steelcase pieces. Works as a media console, a sideboard, or office storage."
    ],
    specs: [["Era","1960s"],["Materials","Steel case, refinished"],["Condition","Refurbished about 2016; used since, good"]],
    tags: ["Steelcase","Vintage","Mid-century","Refurbished"],
    photos: [],
    videos: [],
  }
];

if (typeof module !== "undefined") module.exports = ITEMS;
