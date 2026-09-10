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
      "Three Frag Bottega Piston stools from Design Within Reach. Dark brown split-grain leather seat and back on a steel frame, brushed stainless-steel column, square base plate and oval footrest. Each is 17⅜\" W × 18½\" D and 38⅝\" tall at the highest setting.",
      "A lever under the seat adjusts seat height from 21¾\" to 31½\" (counter or bar height). Seat swivels 360°. Made in Italy, Frag logo embossed on the leather."
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
      "CB2 Moet sofa, 95¾\" W × 35\" D × 29¾\" H. Charcoal-black leather with button tufting on the back and seat, over an exposed solid acacia wood frame. Back and sides are finished, so it can sit away from a wall.",
      "Designed by Jannis Ellenberger for CB2 in 2020. Discontinued."
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
      "Design Within Reach Jonas sofa, 87½\" W × 37½\" D × 32½\" H, seat 20\" high. Light gray textured fabric. Two loose seat cushions and two feather-and-fiber back cushions. Cast-aluminum legs in black powder coat, 7½\" tall.",
      "Designed by Jonas Wagell, 2016. Made in the USA."
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
      "West Elm Celine bench, 52\" W × 19\" D × 23¼\" H. Low curved upholstered back and a thick reversible seat cushion in gray (Pewter) Performance Distressed Velvet. Tapered metal legs in an antique brass finish, removable. Solid wood frame."
    ],
    specs: [["Overall","52\" W × 19\" D × 23¼\" H"],["Fabric","Performance Distressed Velvet, Pewter (gray)"],["Legs","Tapered metal, antique brass finish, removable"],["Condition","Used, good; some pile variation typical of distressed velvet"]],
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
      "Coffee table with a freeform, rounded-triangle top in smoked black tempered glass on a legless, matte black sculpted base. Maker and base material not confirmed. Dimensions to be measured."
    ],
    specs: [["Dimensions","To be measured"],["Top","Freeform black tempered glass"],["Base","Matte black sculpted base, material not confirmed"],["Condition","Used, good; glass unchipped in photos"]],
    tags: ["Black glass","Sculptural base","Freeform"],
    photos: ["IMG_8486","IMG_8485","IMG_8487"],
    videos: [],
  },
  {
    id: "orb-chair",
    sources: [["West Elm – Orb Upholstered Dining Chair","https://www.westelm.com/products/orb-upholstered-dining-chair-h2410/"]],
    eyebrow: "Set of 8 · Dining chairs · Upholstered",
    name: "Orb Upholstered Dining Chairs, Set of 8, Charcoal Tweed, Metal Legs",
    brand: "West Elm",
    price: "≈ $349–$449 each",
    desc: [
      "Eight West Elm Orb dining chairs, each 24¼\" W × 22½\" D × 31.6\" H. Charcoal flecked tweed upholstery over a rounded shell with a cutout at the back; fixed padded seat. Tapered black powder-coated metal legs with floor glides. Discontinued."
    ],
    specs: [["Overall","24¼\" W × 22½\" D × 31.6\" H"],["Upholstery","Charcoal flecked tweed, fixed seat cushion"],["Legs","Tapered metal, black powder-coat, floor glides"],["Quantity","8"],["Condition","Used, good; no visible wear to fabric in photos"]],
    tags: ["West Elm","Set of 8","Tweed","Metal legs","Discontinued"],
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
      "Two matching barrel-back tub chairs, fully upholstered including the legs, in a black weave with a white broken-dash pattern. Curved back continuing into low arms; tight seat. Maker not confirmed. Dimensions to be measured."
    ],
    specs: [["Dimensions","To be measured"],["Style","Barrel / tub chair, fully upholstered, Parsons legs"],["Fabric","Black with white broken-dash weave"],["Quantity","2"],["Condition","Used, good; fabric clean in photos"]],
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
      "BDI Corridor 8177 media console, 65\" W × 20¼\" D × 28¼\" H, in charcoal-stained ash with a black satin-etched tempered glass top (150 lb capacity).",
      "Louvered doors on each side over adjustable shelves, an open center bay with an adjustable shelf, and a louvered drawer below. Remote signals pass through the louvers. Cable management, ventilation, hidden casters."
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
    brand: "Crate and Barrel table · Tolix stools from Design Within Reach",
    price: "$545 per stool + table TBD",
    desc: [
      "Crate and Barrel square bar-height table in black powder-coated aluminum with a slatted top and an umbrella hole. Table dimensions to be measured.",
      "Four Tolix H stools from Design Within Reach, raw steel with clear varnish, 75 cm (29½\") seat height, stackable, Tolix stamp on the seat apron. This finish is rated for indoor use; the stools have lived outdoors and show surface patina and rust spots."
    ],
    specs: [["Table","Crate and Barrel square slat-top bar table, black aluminum, umbrella hole; dimensions to be measured"],["Stools","Tolix H stool from Design Within Reach, 75 cm (29½\") seat height, raw steel with clear varnish, stackable"],["Quantity","1 table, 4 stools"],["Condition","Used outdoors; stools show patina and rust spots, table finish good"]],
    tags: ["Outdoor","Crate and Barrel","Tolix","Design Within Reach","Bar height","Set of 4 stools"],
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
      "Two outdoor lounge chairs with black powder-coated aluminum frames and flat slab arms. Back and seat cushions in a blush pink striped outdoor fabric with welted edges. Maker not confirmed. Dimensions to be measured."
    ],
    specs: [["Dimensions","To be measured"],["Frame","Black powder-coated aluminum, flat slab arms"],["Cushions","Blush pink stripe outdoor fabric, welted, back and seat"],["Quantity","2 chairs"],["Condition","Used outdoors; cushions show some fading and water marks (see photos)"]],
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
      "Two nesting console tables, one taller and narrower, one lower and deeper. Reclaimed wood plank tops with a weathered surface and natural finish, on matte black welded square-tube iron frames with a base stretcher. Maker not confirmed. Dimensions to be measured."
    ],
    specs: [["Dimensions","To be measured (both tables)"],["Tops","Reclaimed wood planks, natural finish"],["Frames","Square-tube iron, matte black"],["Quantity","2 (nesting set)"],["Condition","Used, good; tops have checks and texture from the reclaimed wood"]],
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
      "Mobican Lea platform bed in walnut, made in Quebec. Headboard upholstered in two dark gray panels, framed in walnut; walnut rail base with tapered legs. Takes a mattress only (no box spring) on a slat system.",
      "Manufacturer's queen dimensions: 67\" W × 85½\" L × 40\" H, 11\" floor to mattress. Measure to confirm queen vs. king. The matching Alexia night tables and the leather storage bench are listed separately."
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
      "Two Mobican Alexia night tables, walnut with an ebony-tinted tempered glass top, each 25\" W × 17½\" D × 19\" H. One soft-close drawer with a notched pull cut into the top edge, open shelf below. Finished back. Solid maple drawer boxes stamped Mobican.",
      "Match the Lea bed on this list. Made in Quebec."
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
      "CB2 Dusk storage bench, 58\" W × 17¼\" D × 18½\" H. Tufted dark brown leather lid on a walnut box with a brass half-circle inlay and walnut veneer rays across the front. Short tapered legs.",
      "Lid lifts on soft-close hinges. Interior 56\" W × 15½\" D × 10¾\" H. Discontinued."
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
    desc: [
      "West Elm Ombre Pop indoor/outdoor rug in the Iron colorway: black, gray and oatmeal bands with thin yellow, orange and blue stripes. Handwoven reversible flatweave, 100% recycled polyester, 6 mm pile, fringed ends. Made in India.",
      "Size to be measured (made in 5' × 8', 8' × 10' and 9' × 12'). Photos are West Elm's product images."
    ],
    specs: [["Size","To be measured (made in 5' × 8', 8' × 10' and 9' × 12')"],["Pile","Flat, 6 mm"],["Materials","100% recycled polyester, handwoven, reversible"],["Care","Vacuum on low without a beater bar; blot spills"],["Condition","Used, good"]],
    tags: ["West Elm","Indoor/outdoor","Recycled polyester","Reversible","Fringe"],
    photos: ["rug-hero","rug-alt-1","rug-alt-2","rug-alt-3","rug-alt-4"],
    videos: [],
  },
  {
    id: "gray-bed",
    eyebrow: "Bed · Upholstered",
    name: "Gray Upholstered Platform Bed",
    brand: "Maker not yet confirmed",
    price: "TBD",
    desc: [
      "Low platform bed fully upholstered in a light gray heathered weave. Thick angled headboard with stitched seams forming a grid of panels; wide box side rails in the same fabric; recessed black block feet. Maker not confirmed. Mattress size and dimensions to be measured."
    ],
    specs: [["Size","To be measured"],["Style","Low platform, box side rails, stitched panel headboard"],["Fabric","Light gray heathered weave"],["Feet","Black block feet, recessed"],["Condition","Used, good; fabric clean in photos"]],
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
      "Mid-century style armchair in a rust-orange heathered tweed. Tall tight-upholstered back, low boxy arms with welted edges, loose welted seat cushion. Round tapered wood legs in a dark walnut finish. Maker not confirmed. Dimensions to be measured."
    ],
    specs: [["Dimensions","To be measured"],["Style","Mid-century lounge chair, tight back, loose seat cushion"],["Fabric","Rust-orange heathered tweed weave, welted seams"],["Legs","Round tapered wood, dark walnut finish"],["Quantity","1"],["Condition","Used, good; fabric clean in photos"]],
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
      "Crate &amp; Barrel Atwood tall chest, 40¼\" W × 20½\" D × 56\" H. Reclaimed peroba wood from Brazil (weathered live-edge planks with checks and nail marks) with solid black walnut.",
      "Four drawers, three open bins, one open cubby, and one door over a fixed shelf. Antique iron hardware, lacquered steel legs. Discontinued."
    ],
    specs: [["Overall","40¼\" W × 20½\" D × 56\" H"],["Layout","4 drawers, 3 open bins, 1 open cubby, 1 door with fixed shelf"],["Materials","Reclaimed peroba wood, solid black walnut, lacquered steel legs, antique iron hardware"],["Condition","Used, good; reclaimed surfaces have checks and nail marks"]],
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
      "BDI Corridor SV 7129 media credenza, 79\" W × 15½\" D × 30\" H, in charcoal-stained ash on a black steel leg frame (10\" legs with levelers). Black satin-etched tempered glass top.",
      "Four louvered solid-wood doors; remote signals pass through. Two side compartments (19\" W) and a center compartment (37.9\" W), each with adjustable shelves and ventilation. BDI rates it for TVs up to 80\". Larger sibling of the Corridor 8177 console on this list."
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
      "BDI Corridor 6521 executive desk, 67¾\" W × 32¼\" D × 29¾\" H, 183 lb. Black satin-etched tempered glass top on a louvered hardwood case with a full modesty panel.",
      "Two side drawers and a flip-front keyboard drawer with non-slip liners; wire management channels. Finish to be confirmed (charcoal stained ash, chocolate stained walnut or natural walnut). Photos are BDI's product images in charcoal stained ash."
    ],
    specs: [["Overall","67¾\" W × 32¼\" D × 29¾\" H"],["Top","Black satin-etched tempered glass"],["Storage","2 side drawers, 1 flip-front keyboard drawer, non-slip liners"],["Materials","Stained solid wood and hardwood veneer, tempered glass, powder-coated steel"],["Finish","To confirm (offered in charcoal stained ash, chocolate stained walnut, natural walnut)"],["Weight","183 lb"],["Condition","Used, good; product photos shown are BDI's, in charcoal stained ash"]],
    tags: ["BDI","Desk","Glass top","Keyboard drawer","Cable management"],
    photos: ["bdi-desk-2"],
    videos: [],
  }
];

if (typeof module !== "undefined") module.exports = ITEMS;
