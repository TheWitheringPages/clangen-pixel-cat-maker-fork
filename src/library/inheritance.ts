/* 
  Based on pelts.py from ClanGen:
  https://github.com/ClanGenOfficial/clangen/blob/09a7c07772c3e33c6941b7a56b8cc5bfa83e316d/scripts/cat/pelts.py

  ClanGen source code is licensed under MPL-2.0.
*/

import { Pelt } from "./types";

const skin_sprites = [
  "BLACK",
  "PINK",
  "DARKBROWN",
  "BROWN",
  "LIGHTBROWN",
  "DARK",
  "DARKGREY",
  "GREY",
  "DARKSALMON",
  "SALMON",
  "PEACH",
  "DARKMARBLED",
  "MARBLED",
  "LIGHTMARBLED",
  "DARKBLUE",
  "BLUE",
  "LIGHTBLUE",
  "RED",
];

const pelt_colours = [
  "WHITE",
  "PALEGREY",
  "SILVER",
  "GREY",
  "DARKGREY",
  "GHOST",
  "BLACK",
  "CREAM",
  "PALEGINGER",
  "GOLDEN",
  "GINGER",
  "DARKGINGER",
  "SIENNA",
  "LIGHTBROWN",
  "LILAC",
  "BROWN",
  "GOLDEN-BROWN",
  "DARKBROWN",
  "CHOCOLATE",
];

const tortiepatterns = [
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "REDTAIL",
  "DELILAH",
  "MINIMALONE",
  "MINIMALTWO",
  "MINIMALTHREE",
  "MINIMALFOUR",
  "HALF",
  "OREO",
  "SWOOP",
  "MOTTLED",
  "SIDEMASK",
  "EYEDOT",
  "BANDANA",
  "PACMAN",
  "STREAMSTRIKE",
  "ORIOLE",
  "CHIMERA",
  "DAUB",
  "EMBER",
  "BLANKET",
  "ROBIN",
  "BRINDLE",
  "PAIGE",
  "ROSETAIL",
  "SAFI",
  "SMUDGED",
  "DAPPLENIGHT",
  "STREAK",
  "MASK",
  "CHEST",
  "ARMTAIL",
  "SMOKE",
  "GRUMPYFACE",
  "BRIE",
  "BELOVED",
  "BODY",
  "SHILOH",
  "FRECKLED",
  "HEARTBEAT",
  "MINKLITTLE",
  "MINKLIGHTTUXEDO",
  "MINKBUZZARDFANG",
  "MINKTIP",
  "MINKBLAZE",
  "MINKBIB",
  "MINKVEE",
  "MINKPAWS",
  "MINKBELLY",
  "MINKTAILTIP",
  "MINKTOES",
  "MINKBROKENBLAZE",
  "MINKLILTWO",
  "MINKSCOURGE",
  "MINKTOESTAIL",
  "MINKRAVENPAW",
  "MINKHONEY",
  "MINKLUNA",
  "MINKEXTRA",
  "MINKMUSTACHE",
  "MINKREVERSEHEART",
  "MINKSPARKLE",
  "MINKRIGHTEAR",
  "MINKLEFTEAR",
  "MINKESTRELLA",
  "MINKREVERSEEYE",
  "MINKBACKSPOT",
  "MINKEYEBAGS",
  "MINKLOCKET",
  "MINKBLAZEMASK",
  "MINKTEARS",
  "MINKTUXEDO",
  "MINKFANCY",
  "MINKUNDERS",
  "MINKDAMIEN",
  "MINKSKUNK",
  "MINKMITAINE",
  "MINKSQUEAKS",
  "MINKSTAR",
  "MINKWINGS",
  "MINKDIVA",
  "MINKSAVANNAH",
  "MINKFADESPOTS",
  "MINKBEARD",
  "MINKDAPPLEPAW",
  "MINKTOPCOVER",
  "MINKWOODPECKER",
  "MINKMISS",
  "MINKBOWTIE",
  "MINKVEST",
  "MINKFADEBELLY",
  "MINKDIGIT",
  "MINKFCTWO",
  "MINKFCONE",
  "MINKMIA",
  "MINKROSINA",
  "MINKPRINCESS",
  "MINKDOUGIE",
  "MINKANY",
  "MINKANYTWO",
  "MINKBROKEN",
  "MINKFRECKLES",
  "MINKRINGTAIL",
  "MINKHALFFACE",
  "MINKPANTSTWO",
  "MINKGOATEE",
  "MINKPRINCE",
  "MINKFAROFA",
  "MINKMISTER",
  "MINKPANTS",
  "MINKREVERSEPANTS",
  "MINKHALFWHITE",
  "MINKAPPALOOSA",
  "MINKPIEBALD",
  "MINKCURVED",
  "MINKGLASS",
  "MINKMASKMANTLE",
  "MINKMAO",
  "MINKPAINTED",
  "MINKSHIBAINU",
  "MINKOWL",
  "MINKBUB",
  "MINKSPARROW",
  "MINKTRIXIE",
  "MINKSAMMY",
  "MINKFRONT",
  "MINKBLOSSOMSTEP",
  "MINKBULLSEYE",
  "MINKFINN",
  "MINKSCAR",
  "MINKBUSTER",
  "MINKHAWKBLAZE",
  "MINKCAKE",
  "MINKVAN",
  "MINKONEEAR",
  "MINKLIGHTSONG",
  "MINKTAIL",
  "MINKHEART",
  "MINKMOORISH",
  "MINKAPRON",
  "MINKCAPSADDLE",
  "MINKCHESTSPECK",
  "MINKBLACKSTAR",
  "MINKPETAL",
  "MINKHEARTTWO",
  "MINKPEBBLESHINE",
  "MINKBOOTS",
  "MINKCOW",
  "MINKCOWTWO",
  "MINKLOVEBUG",
  "MINKSHOOTINGSTAR",
  "MINKEYESPOT",
  "MINKPEBBLE",
  "MINKTAILTWO",
  "MINKBUDDY",
  "MINKKROPKA",
  "MINKCOLOURPOINT",
  "MINKRAGDOLL",
  "MINKSEPIAPOINT",
  "MINKMINKPOINT",
  "MINKSEALPOINT",
  "MINKVITILIGO",
  "MINKVITILIGOTWO",
  "MINKMOON",
  "MINKPHANTOM",
  "MINKKARPATI",
  "MINKPOWDER",
  "MINKBLEACHED",
  "MINKSMOKEY",
  "MINKFULLWHITE",
  "CHAOSONE",
  "CHAOSTWO",
  "CHAOSTHREE",
  "CHAOSFOUR",
  "ERROR",
  "WAVE",
  "PONINTTORITE",
  "MASKTORITE",
  "LITTLESTAR",
  "TANBUNNY",
  "STRIPES",
  "PINITO",
  "SKULL",
  "SIGHT",
  "BRINDLETORITE",
  "SNOW",
  "ROSETTESTORITE",
  "AMBERONE",
  "KINTSUGIONE",
  "BENGALMASK",
  "SHADOW",
  "RAIN",
  "MGLA",
  "MOONLIGHT",
  "MOUSE",
  "SATURN",
  "MARBLETORINE",
  "AMBERTWO",
  "PATTERN",
  "MOSS",
  "MONKEY",
  "BUMBLEBEE",
  "KINTSUGITWO",
  "STORM",
  "CLASSICTORNIE",
  "STRIPEONETORITE",
  "MACKERELTORITE",
  "AMBERTHREE",
  "SHADE",
  "GRAFFITI",
  "AGOUTITORIE",
  "BENGALTORITE",
  "TABBYTORITE",
  "SOKKOKETORITE",
  "SPECKLEDTORITE",
  "TICKEDTORIE",
  "MORRO",
  "AMBERFOUR",
  "DOG",
  "ONESPOT",
  "INK",
  "WOLF",
  "EYEV",
  "GEM",
  "FOX",
  "ORCA",
  "PINTO",
  "FRECKLESTWO",
  "SOLDIER",
  "AKITA",
  "CHESSBORAD",
  "ANT",
  "CREAMV",
  "BUNNY",
  "MOJO",
  "STAINSONE",
  "STAINST",
  "HALFHEART",
  "FRECKLESTHREE",
  "KITTY",
  "SUNRISE",
  "HUSKY",
  "STATNTHREE",
  "ERAMASK",
  "S",
  "PAW",
  "SWIFTPAW",
  "BOOMSTAR",
  "MIST",
  "LEON",
  "LADY",
  "LEGS",
  "MEADOW",
  "SALT",
  "BAMBI",
  "PRIMITVE",
  "SKUNKSTRIPE",
  "NEPTUNE",
  "KARAPATITWO",
  "CHAOS",
  "MOSCOW",
  "ERAHALF",
  "CAPETOWN",
  "SUN",
  "BANAN",
  "PANDA",
  "DOVE",
  "PINTOTWO",
  "SNOWSHOE",
  "SKY",
  "MOONSTONE",
  "DRIP",
  "CRESCENT",
  "ETERNAL",
  "WINGTWO",
  "STARBORN",
  "SPIDERLEGS",
  "APPEL",
  "RUG",
  "LUCKY",
  "SOCKS",
  "BRAMBLEBERRY",
  "LATKA",
  "ASTRONAUT",
  "STORK",
];
const tortiebases = [
  "single",
  "stersingle",
  "sillysingle",
  "dancesingle",
  "mimisingle",
  "tabby",
  "stertabby",
  "sillytabby",
  "dancetabby",
  "mimitabby",
  "bengal",
  "sterbengal",
  "sillybengal",
  "dancebengal",
  "mimibengal",
  "marbled",
  "stermarbled",
  "sillymarbled",
  "dancemarbled",
  "mimimarbled",
  "ticked",
  "sterticked",
  "sillyticked",
  "danceticked",
  "mimiticked",
  "smoke",
  "stersmoke",
  "sillysmoke",
  "dancesmoke",
  "mimismoke",
  "rosette",
  "sterrosette",
  "sillyrosette",
  "dancerosette",
  "mimirosette",
  "speckled",
  "sterspeckled",
  "sillyspeckled",
  "dancespeckled",
  "mimispeckled",
  "mackerel",
  "stermackerel",
  "sillymackerel",
  "dancemackerel",
  "mimimackerel",
  "classic",
  "sterclassic",
  "sillyclassic",
  "danceclassic",
  "mimiclassic",
  "sokoke",
  "stersokoke",
  "sillysokoke",
  "dancesokoke",
  "mimisokoke",
  "agouti",
  "steragouti",
  "sillyagouti",
  "danceagouti",
  "mimiagouti",
  "singlestripe",
  "stersinglestripe",
  "dancesinglestripe",
  "sillysinglestripe",
  "mimisinglestripe",
  "masked",
  "stermasked",
  "sillymasked",
  "dancemasked",
  "mimimasked",
  "brindle",
  "wolf",
  "wildcat",
  "spots",
  "finleappatches",
  "stain",
  "maned",
  "ocelot",
  "lynx",
  "dalmatian",
  "royal",
  "bobcat",
  "cheetah",
  "abyssinian",
  "clouded",
  "doberman",
  "ghosttabby",
  "merle",
  "monarch",
  "oceloid",
  "pinstripetabby",
  "snowflake",
  "dot",
  "caliisokoke",
  "caliispeckled",
  "dotfade",
  "circletabby",
  "colourpoint",
  "lynxpoint",
  "birchtabby",
];

const eye_colours = [
  "YELLOW",
  "AMBER",
  "HAZEL",
  "PALEGREEN",
  "GREEN",
  "BLUE",
  "DARKBLUE",
  "GREY",
  "CYAN",
  "EMERALD",
  "PALEBLUE",
  "PALEYELLOW",
  "GOLD",
  "HEATHERBLUE",
  "COPPER",
  "SAGE",
  "COBALT",
  "SUNLITICE",
  "GREENYELLOW",
  "BRONZE",
  "SILVER",
  "ROSE",
  "ALGAE",
  "SEAFOAM",
  "LIGHT FLAME",
  "CLOUDY",
  "RED",
  "TURQUOISE",
  "SWAMP",
  "RAINY",
  "AQUAMARINE",
  "EARTH",
  "PUMPKIN",
  "LILAC",
  "PERIWINKLE",
  "VIOLET",
  "POND",
  "DIRT",
  "BROWN",
  "CEDAR",
  "CHRISTMAS",
  "COTTON CANDY",
  "DARK PINE",
  "FALL",
  "FOREST FIRE",
  "GOLD MOON",
  "HALLOWEEN",
  "LOBELIA",
  "MIDNIGHT",
  "MOONSTONE",
  "OXIDIZED",
  "SNOW",
  "BERRY BANANA",
  "DAWN SKY",
  "TWILIGHT SKY",
  "WORMY",
  "BLUE HAZEL",
  "THUNDERBOLT",
  "VOLCANO",
  "SEASHELL",
  "PARADOX",
  "CURSE",
  "BLESSING",
  "VALENTINE",
  "FIREWORK",
  "LUCKY",
  "LIME",
  "PALE BROWN",
  "CRIMSON",
  "DARK HAZEL",
  "ROSE GOLD",
  "DARK ROSE",
  "REVERSE SUNLITICE",
  "ICY",
  "SUNSET",
  "DARKBLUE",
  "LAVENDER",
  "ECLIPSE",
  "BLACK",
  "MUDDY",
  "DARK TURQUOISE",
  "BLACKBERRY",
  "RUSTY",
  "PASTEL",
  "AVOCADO",
  "PASTEL LAVENDER",
  "ALBINO",
  "WINTER ROSE",
  "BULLET",
  "LIGHT YELLOW",
  "SUNSHINE",
  "GOLD ORE",
  "FOSSILIZED AMBER",
  "DUSKY",
  "LICHEN",
  "SPRING",
  "TREE",
  "LEAVES",
  "EMERALD ORE",
  "HAZELNUT",
  "BLUE SKY",
  "OCEAN",
  "OVERCAST",
  "AQUA",
  "IRIS",
  "ROBIN",
  "GREY SILVER",
  "SAND",
  "MUSTARD",
  "BRONZE ORE",
  "TIMBER",
  "COPPER ORE",
  "FERN",
  "APPLE",
  "MOSS",
  "THICKET",
  "PEACOCK",
  "OLIVE",
  "STORMY BLUE",
  "DEPTHS",
  "STORMY",
  "TEAL",
  "INDIGO",
  "STEEL",
  "PEACH",
  "DAFFODIL",
  "MARIGOLD",
  "BRASS",
  "DARKAMBER",
  "DAWN SKIES",
  "MINT",
  "CHARTREUSE",
  "MEADOW",
  "LEAF",
  "LIGHT TURQUOISE",
  "SAP",
  "ALBINISTIC",
  "COBALT ORE",
  "RAIN",
  "CYAN DYE",
  "PERIWINKLE PURPLE",
  "ICY CRACK",
  "PINK",
  "MORNING",
  "DARK BROWN",
  "BAY",
  "NEON GREEN",
  "SEA",
  "DISCORD",
  "AUTUMN LEAF",
  "RUBY",
  "PHANTOM",
  "RIVER MOSS",
  "WICKED",
  "ORANGE",
];
const yellow_eyes = [
  "BULLET",
  "GREY SILVER",
  "PEACH",
  "LIGHT YELLOW",
  "SAND",
  "DAFFODIL",
  "SUNSHINE",
  "MUSTARD",
  "MARIGOLD",
  "GOLD ORE",
  "BRONZE ORE",
  "BRASS",
  "FOSSILIZED AMBER",
  "TIMBER",
  "DARKAMBER",
  "DUSKY",
  "COPPER ORE",
  "DAWN SKY",
  "YELLOW",
  "AMBER",
  "PALEYELLOW",
  "GOLD",
  "COPPER",
  "GREENYELLOW",
  "BRONZE",
  "SILVER",
  "ROSE",
  "LIGHT FLAME",
  "RED",
  "PUMPKIN",
  "BROWN",
  "CEDAR",
  "DARK PINE",
  "FALL",
  "GOLD MOON",
  "OXIDIZED",
  "BERRY BANANA",
  "WORMY",
  "THUNDERBOLT",
  "VOLCANO",
  "SEASHELL",
  "PARADOX",
  "BLESSING",
  "VALENTINE",
  "PALE BROWN",
  "CRIMSON",
  "MORNING",
  "BLACK",
  "ROSE GOLD",
  "DARK ROSE",
  "DARK BROWN",
  "MUDDY",
  "RUSTY",
  "ECLIPSE",
  "BAY",
  "DISCORD",
  "ORANGE",
  "AUTUMN LEAF"
];
const blue_eyes = [
  "BLUE SKY",
  "STORMY BLUE",
  "ALBINISTIC",
  "OCEAN",
  "DEPTHS",
  "COBALT ORE",
  "OVERCAST",
  "STORMY",
  "RAIN",
  "AQUA",
  "TEAL",
  "CYAN DYE",
  "IRIS",
  "INDIGO",
  "PERIWINKLE PURPLE",
  "ROBIN",
  "STEEL",
  "DAWN SKIES",
  "ICY CRACK",
  "BLUE",
  "DARKBLUE",
  "CYAN",
  "PALEBLUE",
  "HEATHERBLUE",
  "COBALT",
  "SUNLITICE",
  "GREY",
  "SEAFOAM",
  "CLOUDY",
  "TURQUOISE",
  "RAINY",
  "RUBY",
  "LILAC",
  "PERIWINKLE",
  "BLACKBERRY",
  "POND",
  "COTTON CANDY",
  "HALLOWEEN",
  "LOBELIA",
  "MIDNIGHT",
  "MOONSTONE",
  "SNOW",
  "WICKED",
  "PHANTOM",
  "DAWN SKY",
  "TWILIGHT SKY",
  "BLUE HAZEL",
  "CURSE",
  "FIREWORK",
  "REVERSE SUNLITICE",
  "ICY",
  "VIOLET",
  "PASTEL",
  "WINTER ROSE",
  "PASTEL LAVENDER",
  "LAVENDER",
  "PINK",
];
const green_eyes = ["LICHEN", "FERN", "MINT", "SPRING", "APPLE", "CHARTREUSE", "LEAVES", "MOSS", "MEADOW", "RIVER MOSS", "TREE", "THICKET", "LEAF", "EMERALD ORE", "PEACOCK", "LIGHT TURQUOISE", "HAZELNUT", "OLIVE", "SAP", "PALEGREEN", "GREEN", "EMERALD", "SAGE", "HAZEL", "ALGAE", "SWAMP", "AQUAMARINE", "EARTH", "DIRT", "CHRISTMAS", "FOREST FIRE",
                  "LIME", "LUCKY", "DARK HAZEL", "DARK TURQUOISE", "AVOCADO", "NEON GREEN", "SEA", "ORANGE"];
const tabbies = ["Tabby", "Stertabby", "Sillytabby", "Dancetabby", "Mimitabby",
        "Ticked", "Sterticked", "Sillyticked", "Danceticked", "Mimiticked",
        "Mackerel", "Stermackerel", "Sillymackerel", "Dancemackerel", "Mimimackerel",
        "Classic", "Sterclassic", "Sillyclassic", "Danceclassic", "Mimiclassic",
        "Sokoke", "Stersokoke", "Sillysokoke", "Dancesokoke", "Mimisokoke",
        "Agouti", "Steragouti", "Sillyagouti", "Danceagouti", "Mimiagouti",
        "Royal", "Brindle", "GhostTabby", "PinstripeTabby", "Caliisokoke", "Circletabby", "Birchtabby"];
const spotted = ["Speckled", "Sterspeckled", "Sillyspeckled", "Dancespeckled", "Mimispeckled",
        "Rosette", "Sterrosette", "Sillyrosette", "Dancerosette", "Mimirosette",
        "Lynx", "Bobcat", "Spots", "Merle", "Dot", "Caliispeckled", "Dotfade"];
const plain = ["SingleColour", "SterSingle", "SillySingle", "DanceSingle", "MimiSingle", "TwoColour",
        "Smoke", "Stersmoke", "Sillysmoke", "Dancesmoke", "Mimismoke",
        "Singlesinglestripe", "Stersinglestripe", "Dancesinglestripe", "Sillysinglestripe", "Mimisinglestripe",
        "Smokepoint", "Doberman", "Stain", "Colorpoint"];
const exotic = ["Bengal", "Sterbengal", "Sillybengal", "Dancebengal", "Mimibengal",
        "Marbled", "Stermarbled", "Sillymarbled", "Dancemarbled", "Mimimarbled",
        "Masked", "Stermasked", "Sillymasked", "Dancemasked", "Mimimasked",
        "Maned", "Ocelot", "Cheetah", "Wildcat", "Wolf", "Finleappatches", "Dalmatian", "Abyssinian", "Clouded",
        "Snowflake", "Oceloid", "Monarch", "Lynxpoint"];
const torties = ["Tortie", "Calico"];
const pelt_categories = [tabbies, spotted, plain, exotic, torties];

const ginger_colours = [
  "CREAM",
  "PALEGINGER",
  "GOLDEN",
  "GINGER",
  "DARKGINGER",
  "SIENNA",
];
const black_colours = ["GREY", "DARKGREY", "GHOST", "BLACK"];
const white_colours = ["WHITE", "PALEGREY", "SILVER"];
const brown_colours = [
  "LIGHTBROWN",
  "LILAC",
  "BROWN",
  "GOLDEN-BROWN",
  "DARKBROWN",
  "CHOCOLATE",
];
const colour_categories = [
  ginger_colours,
  black_colours,
  white_colours,
  brown_colours,
];
const little_white = [
  "LITTLE",
  "LIGHTTUXEDO",
  "BUZZARDFANG",
  "TIP",
  "BLAZE",
  "BIB",
  "VEE",
  "PAWS",
  "BELLY",
  "TAILTIP",
  "TOES",
  "BROKENBLAZE",
  "LILTWO",
  "SCOURGE",
  "TOESTAIL",
  "RAVENPAW",
  "HONEY",
  "LUNA",
  "EXTRA",
  "MUSTACHE",
  "REVERSEHEART",
  "SPARKLE",
  "RIGHTEAR",
  "LEFTEAR",
  "ESTRELLA",
  "REVERSEEYE",
  "BACKSPOT",
  "EYEBAGS",
  "LOCKET",
  "BLAZEMASK",
  "TEARS",
  "MINKMINIMALONE",
  "MINKMINIMALTWO",
  "MINKMINIMALTHREE",
  "MINKMINIMALFOUR",
  "MINKMASK",
  "MINKCHEST",
  "MINKSIDEMASK",
  "MINKEMBER",
  "MINKORIOLE",
  "MINKONE",
  "MINKDAPPLENIGHT",
  "MINKSAFI",
  "SOLDIER",
  "AKITA",
  "FRECKLESTHREE",
  "KITTY",
  "MASK",
  "PAW",
  "BOOMSTAR",
  "LEGS",
  "DOVE",
  "CRESCENT",
  "SPIDERLEGS",
  "APPEL",
  "BODYSTRIPE",
  "BLACKBODYSTRIPE",
  "BROWNBODYSTRIPE",
  "GINGERBODYSTRIPE",
  "SPRAYEDBODYSTRIPE",
  "BLACKSPRAYEDBODYSTRIPE",
  "BROWNSPRAYEDBODYSTRIPE",
  "GINGERSPRAYEDBODYSTRIPE",
];
const mid_white = [
  "TUXEDO",
  "FANCY",
  "UNDERS",
  "DAMIEN",
  "SKUNK",
  "MITAINE",
  "SQUEAKS",
  "STAR",
  "WINGS",
  "DIVA",
  "SAVANNAH",
  "FADESPOTS",
  "BEARD",
  "DAPPLEPAW",
  "TOPCOVER",
  "WOODPECKER",
  "MISS",
  "BOWTIE",
  "VEST",
  "FADEBELLY",
  "DIGIT",
  "FCTWO",
  "FCONE",
  "MIA",
  "ROSINA",
  "PRINCESS",
  "DOUGIE",
  "MINKROSETAIL",
  "MINKTWO",
  "MINKFOUR",
  "MINKREDTAIL",
  "MINKSTREAK",
  "MINKARMTAIL",
  "MINKSTREAMSTRIKE",
  "MINKDAUB",
  "MINKBRIE",
  "MINKROBIN",
  "MINKBLANKET",
  "MINKBELOVED",
  "MINKHEARTBEAT",
  "MINKCHIMERA",
  "MINKEYEDOT",
  "MINKSHILOH",
  "INK",
  "GEM",
  "FOX",
  "ORCA",
  "MOJO",
  "HALFHEART",
  "LEON",
  "MEADOW",
  "BAMBI",
  "SKUNKSTRIPE",
  "BANAN",
  "MOONSTONE",
  "WINGTWO",
  "STARBORN",
  "RUG",
];
const high_white = [
  "ANY", 
  "ANYTWO", 
  "BROKEN", 
  "FRECKLES", 
  "RINGTAIL", 
  "HALFFACE", 
  "PANTSTWO",
  "GOATEE", 
  "PRINCE", 
  "FAROFA", 
  "MISTER", 
  "PANTS", 
  "REVERSEPANTS", 
  "HALFWHITE", 
  "APPALOOSA", 
  "PIEBALD",
  "CURVED", 
  "GLASS", 
  "MASKMANTLE", 
  "MAO", 
  "PAINTED", 
  "SHIBAINU", 
  "OWL", 
  "BUB", 
  "SPARROW", 
  "TRIXIE",
  "SAMMY", 
  "FRONT", 
  "BLOSSOMSTEP", 
  "BULLSEYE", 
  "FINN", 
  "SCAR", 
  "BUSTER", 
  "HAWKBLAZE", 
  "CAKE", 
  "CHITAL",
  "MINKTHREE", 
  "MINKOREO", 
  "WOLF", 
  "PINTO", 
  "CHESSBORAD", 
  "SUNRISE",
  "HUSKY", 
  "S", 
  "STATNTHREE", 
  "MIST", 
  "LADY", 
  "HALF", 
  "SUN",
  "PINTOTWO", 
  "SKY", 
  "MINKGRUMPYFACE", 
  "MINKPACMAN", 
  "MINKPAIGE", 
  "MINKMOTTLED", 
  "MINKDELILAH", 
  "TIGERBODYSTRIPE", 
  "BLACKTIGERBODYSTRIPE", 
  "BROWNTIGERBODYSTRIPE", 
  "GINGERTIGERBODYSTRIPE",
];
const mostly_white = [
  "VAN",
  "ONEEAR",
  "LIGHTSONG",
  "TAIL",
  "HEART",
  "MOORISH",
  "APRON",
  "CAPSADDLE",
  "CHESTSPECK",
  "BLACKSTAR",
  "PETAL",
  "HEARTTWO",
  "PEBBLESHINE",
  "BOOTS",
  "COW",
  "COWTWO",
  "LOVEBUG",
  "SHOOTINGSTAR",
  "BUNNY",
  "STAINSONE",
  "STAINST",
  "SWIFTPAW",
  "DRIP",
  "PRIMITVE",
  "KARAPATITWO",
  "CHAOS",
  "MOSCOW",
  "PANDA",
  "LUCKY",
  "EYESPOT",
  "PEBBLE",
  "TAILTWO",
  "BUDDY",
  "KROPKA",
  "MINKHALF",
  "MINKBANDANA",
  "MINKSWOOP",
  "REVERSEBODYSPRITE",
  "BLACKREVERSEBODYSPRITE",
  "BROWNREVERSEBODYSPRITE",
  "GINGERREVERSEBODYSPRITE",
  "REVERSETIGERBODYSPRITE",
  "BLACKREVERSETIGERBODYSPRITE",
  "BROWNREVERSETIGERBODYSPRITE",
  "GINGERREVERSETIGERBODYSPRITE",
  "REVERSELEOPARDBODYSPRITE",
  "BLACKREVERSELEOPARDBODYSPRITE",
  "BROWNREVERSELEOPARDBODYSPRITE",
  "GINGERREVERSELEOPARDBODYSPRITE",
];
const point_markings = [
  "COLOURPOINT",
  "ANT",
  "CAPETOWN",
  "SNOWSHOE",
  "ETERNAL",
  "RAGDOLL",
  "SEPIAPOINT",
  "MINKPOINT",
  "SEALPOINT",
  "MINKSMOKE",
  "MINKBODY",
];
const vit = [
  "VITILIGO",
  "VITILIGOTWO",
  "MOON",
  "PHANTOM",
  "KARPATI",
  "POWDER",
  "BLEACHED",
  "SMOKEY",
  "MINKBRINDLE",
  "MINKFRECKLED",
  "MINKSMUDGED",
  "JACKAL",
  "EYEV",
  "FRECKLESTWO",
  "CREAMV",
  "SALT",
  "NEPTUNE",
];

const nameToSpritesname: any = {
  SingleColour: "single",
  SterSingle: "stersingle",
  SillySingle: "sillysingle",
  DanceSingle: "dancesingle",
  MimiSingle: "mimisingle",
  TwoColour: "single",
  Tabby: "tabby",
  Stertabby: "stertabby",
  Sillytabby: "sillytabby",
  Dancetabby: "dancetabby",
  Mimitabby: "mimitabby",
  Marbled: "marbled",
  Stermarbled: "stermarbled",
  Sillymarbled: "sillymarbled",
  Dancemarbled: "dancemarbled",
  Mimimarbled: "mimimarbled",
  Rosette: "rosette",
  Sterrosette: "sterrosette",
  Sillyrosette: "sillyrosette",
  Dancerosette: "dancerosette",
  Mimirosette: "mimirosette",
  Smoke: "smoke",
  Stersmoke: "stersmoke",
  Sillysmoke: "sillysmoke",
  Dancesmoke: "dancesmoke",
  Mimismoke: "mimismoke",
  Ticked: "ticked",
  Sterticked: "sterticked",
  Sillyticked: "sillyticked",
  Danceticked: "danceticked",
  Mimiticked: "mimiticked",
  Speckled: "speckled",
  Sterspeckled: "sterspeckled",
  Sillyspeckled: "sillyspeckled",
  Dancespeckled: "dancespeckled",
  Mimispeckled: "mimispeckled",
  Bengal: "bengal",
  Sterbengal: "sterbengal",
  Sillybengal: "sillybengal",
  Dancebengal: "dancebengal",
  Mimibengal: "mimibengal",
  Mackerel: "mackerel",
  Stermackerel: "stermackerel",
  Sillymackerel: "sillymackerel",
  Dancemackerel: "dancemackerel",
  Mimimackerel: "mimimackerel",
  Classic: "classic",
  Sterclassic: "sterclassic",
  Sillyclassic: "sillyclassic",
  Danceclassic: "danceclassic",
  Mimiclassic: "mimiclassic",
  Sokoke: "sokoke",
  Stersokoke: "stersokoke",
  Sillysokoke: "sillysokoke",
  Dancesokoke: "dancesokoke",
  Mimisokoke: "mimisokoke",
  Agouti: "agouti",
  Singlestripe: "singlestripe",
  Stersinglestripe: "stersinglestripe",
  Sillysinglestripe: "sillysinglestripe",
  Dancesinglestripe: "dancesinglestripe",
  Mimisinglestripe: "mimisinglestripe",
  Masked: "masked",
  Stermasked: "stermasked",
  Sillymasked: "sillymasked",
  Dancemasked: "dancemasked",
  Mimimasked: "mimimasked",
  Brindle: "brindle",
  Wolf: "wolf",
  Wildcat: "wildcat",
  Spots: "spots",
  Smokepoint: "smokepoint",
  Steragouti: "steragouti",
  Sillyagouti: "sillyagouti",
  Danceagouti: "danceagouti",
  Mimiagouti: "mimiagouti",
  Finleappatches: "finleappatches",
  Tortie: "",
  Calico: "",
  Stain: "stain",
  Maned: "maned",
  Ocelot: "ocelot",
  Lynx: "lynx",
  Dalmatian: "dalmatian",
  Royal: "royal",
  Bobcat: "bobcat",
  Cheetah: "cheetah",
  Abyssinian: "abyssinian",
  Clouded: "clouded",
  Doberman: "doberman",
  GhostTabby: "ghosttabby",
  Merle: "merle",
  Monarch: "monarch",
  Oceloid: "oceloid",
  PinstripeTabby: "pinstripetabby",
  Snowflake: "snowflake",
  Dot: "dot",
  Caliisokoke: "caliisokoke",
  Caliispeckled: "caliispeckled",
  Dotfade: "dotfade",
  Circletabby: "circletabby",
  Colourpoint: "colourpoint",
  Lynxpoint: "lynxpoint",
  Birchtabby: "birchtabby",
};

function choice<Type>(list: Type[]): Type {
  return list[Math.floor(Math.random() * list.length)];
}

function weightedChoice<Type>(list: Type[], weights: number[]) {
  if (list.length !== weights.length) {
    new Error(
      `list length is ${list.length} while weights length is ${weights.length}`,
    );
  }

  const sum = weights.reduce((prev, curr) => curr + prev);
  const normalizedWeights = weights.map((v) => v / sum);

  var runningTotal = 0;
  for (const [i, w] of normalizedWeights.entries()) {
    runningTotal += w;
    normalizedWeights[i] = runningTotal;
  }

  const randomNumber = Math.random();

  for (const [i, value] of normalizedWeights.entries()) {
    if (randomNumber <= value) {
      return list[i];
    }
  }

  return list[0];
}

function capitalize(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.substring(1);
}

function inheritEyes(parents: Pelt[], child: Pelt) {
  const parentEyeColours: string[] = parents.map((v) => v.eyeColour);

  if (parentEyeColours.length === 0) {
    child.eyeColour = choice(eye_colours);
  } else {
    child.eyeColour = choice(eye_colours.concat(parentEyeColours));
  }

  // heterochromia!
  let n = 120;
  if (
    child.whitePatches &&
    (child.whitePatches.some(w => high_white.includes(w) || mostly_white.includes(w) || w === "FULLWHITE") ||
    child.colour === "WHITE")
  ) {
    n -= 90;
  }
  if (
    (child.whitePatches && child.whitePatches.includes("FULLWHITE")) ||
    child.colour === "WHITE"
  ) {
    n -= 10;
  }

  for (const parent of parents) {
    if (parent.eyeColour2) {
      n -= 10;
    }
  }

  if (n < 0) {
    n = 1;
  }

  if (Math.random() <= 1 / n) {
    const eyeColourGroups = [yellow_eyes, blue_eyes, green_eyes];
    const choiceGroups = eyeColourGroups.filter(
      (colourGroup) => !colourGroup.includes(child.eyeColour),
    );

    child.eyeColour2 = choice(choice(choiceGroups));
  }
}

function inheritWhite(
  parents: Pelt[],
  child: Pelt,
  forceInherit: boolean = false,
) {
  const parentsVitiligo: string[] = [];
  const parentsWhite: string[][] = [];
  const parentsWhitePatches = new Set<string>();
  const parentsPoints: string[] = [];

  for (const p of parents) {
    if (p.vitiligo !== undefined) {
      parentsVitiligo.push(p.vitiligo);
    }
    if (p.whitePatches !== undefined) {
      parentsWhite.push(p.whitePatches);
      // Fix: Add each item from the array to the set individually
      p.whitePatches.forEach(wp => parentsWhitePatches.add(wp));
    }
    if (p.points !== undefined) {
      parentsPoints.push(p.points);
    }
  }

  const vitChance = Math.max(8 - parentsVitiligo.length, 0);
  if (Math.random() <= 1 / 2 ** vitChance) {
    child.vitiligo = choice(vit);
  }

  const percentagePerParent = parentsWhite.length > 0 ? Math.floor(94 / parentsWhite.length) : 0;
  let chance = 3;
  for (const _ of parentsWhite) {
    chance += percentagePerParent;
  }

  const hasWhite = Math.random() <= chance / 100;

  if (hasWhite || forceInherit) {
    if (child.name === "SingleColour") {
      child.name = "TwoColour";
    }

    // Direct inheritance
    if (parentsWhitePatches.size > 0 && Math.random() <= 1 / 16) {
      const possibleWhitePatches = new Set(parentsWhitePatches);
      if (child.name === "Calico") {
        little_white.forEach((v) => possibleWhitePatches.delete(v));
        mid_white.forEach((v) => possibleWhitePatches.delete(v));
      } else if (child.name === "Tortie") {
        high_white.forEach((v) => possibleWhitePatches.delete(v));
        mostly_white.forEach((v) => possibleWhitePatches.delete(v));
        possibleWhitePatches.delete("FULLWHITE");
      }

      if (possibleWhitePatches.size > 0) {
        const chosenWhitePatches = new Set([choice(Array.from(possibleWhitePatches.values()))]);
        for (let i = 0; i < 2; i++) {
          if (Math.floor(Math.random() * 2) === 0) {
            chosenWhitePatches.forEach((p) => possibleWhitePatches.delete(p));
            if (possibleWhitePatches.size > 0) {
              chosenWhitePatches.add(choice(Array.from(possibleWhitePatches.values())));
            }
          }
        }
        child.whitePatches = Array.from(chosenWhitePatches.values());
      }

      if (parentsPoints.length > 0 && child.name !== "Tortie") {
        child.points = choice(parentsPoints);
      } else {
        child.points = undefined;
      }
      return;
    }

    // Weighted generation
    let pointChance: number;
    if (parentsPoints.length > 0) {
      pointChance = 10 - parentsPoints.length;
    } else {
      pointChance = 40;
    }
    
    if (child.name !== "Tortie" && Math.random() <= 1 / pointChance) {
      child.points = choice(point_markings);
    } else {
      child.points = undefined;
    }

    const whiteList = [
      little_white,
      mid_white,
      high_white,
      mostly_white,
      ["FULLWHITE"],
    ];

    let w = [0, 0, 0, 0, 0];
    for (const p of parentsWhitePatches) {
      let add_weights = [0, 0, 0, 0, 0];
      if (little_white.includes(p)) add_weights = [40, 20, 15, 5, 0];
      else if (mid_white.includes(p)) add_weights = [10, 40, 15, 10, 0];
      else if (high_white.includes(p)) add_weights = [15, 20, 40, 10, 1];
      else if (mostly_white.includes(p)) add_weights = [5, 15, 20, 40, 5];
      else if (p === "FULLWHITE") add_weights = [0, 5, 15, 40, 10];

      for (let i = 0; i < w.length; i++) w[i] += add_weights[i];
    }

    if (w.every((v) => v === 0)) w = [50, 5, 0, 0, 0];

    if (child.name === "Calico") {
      const highWhiteWeights = w.slice(3);
      w = [0, 0, 0].concat(highWhiteWeights);
    } else if (child.name === "Tortie") {
      const lowWhiteWeights = w.slice(0, 1);
      w = lowWhiteWeights.concat([0, 0, 0, 0]);
    }

    if (w.every((v) => v === 0)) w = [2, 1, 0, 0, 0];

    const whitePatchesList = weightedChoice(whiteList, w);
    const chosenWhitePatches = new Set([choice(whitePatchesList)]);

    let n = Math.floor(Math.random() * 3);

    const chosenArray = Array.from(chosenWhitePatches);
    if (chosenArray.some((w) => high_white.includes(w))) {
      n -= 2;
    } else if (
      chosenArray.some((w) => little_white.includes(w)) ||
      chosenArray.some((w) => mid_white.includes(w))
    ) {
      n -= 5;
    }

    parents.forEach((p) => {
      if (p.whitePatches) {
        if (p.whitePatches.length === 0) n += 1;
        else if (p.whitePatches.length >= 2) n -= 1;
      }
    });

    if (n < 0) n = 1;

    for (let i = 0; i < 2; i++) {
      if (Math.floor(Math.random() * (n + 1)) === 0) {
        const weights = [12, 10, 3, 0, 0];
        const selectedList = weightedChoice(whiteList, weights);
        chosenWhitePatches.add(choice(selectedList));
        n++;
      }
    }

    child.whitePatches = Array.from(chosenWhitePatches);

    if (
      child.points &&
      (child.whitePatches.some((w) => high_white.includes(w)) ||
        child.whitePatches.some((w) => mostly_white.includes(w)) ||
        child.whitePatches.includes("FULLWHITE"))
    ) {
      child.points = undefined;
    }
  }
}

// doesn't include pelt length!!!
function inheritPattern(parents: Pelt[], child: Pelt) {
  const parentPeltColours = new Set<string>();
  const parentPeltNames = new Set<string>();

  for (const p of parents) {
    parentPeltColours.add(p.colour);
    if (torties.includes(p.name)) {
      parentPeltNames.add(capitalize(p.tortieBase!));
    } else {
      parentPeltNames.add(p.name);
    }
  }

  // type
  var w = [0, 0, 0, 0];
  for (const p of parentPeltNames) {
    var add_weights = [0, 0, 0, 0];
    if (tabbies.includes(p)) {
      add_weights = [50, 10, 5, 7];
    } else if (spotted.includes(p)) {
      add_weights = [10, 50, 5, 5];
    } else if (plain.includes(p)) {
      add_weights = [5, 5, 50, 0];
    } else if (exotic.includes(p)) {
      add_weights = [15, 15, 1, 45];
    }
    // TODO: SUPPORT NULL PARENTS

    for (var i = 0; i < w.length; i++) {
      w[i] += add_weights[i];
    }
  }

  if (w.every((v) => v === 0)) {
    w = [1, 1, 1, 1];
  }
  const peltCategoryChoice = weightedChoice<string[]>(pelt_categories, w);
  var pelt = choice(peltCategoryChoice);

  // tortie? all cats have f chance. sorry.
  var tortie_chance = 4;
  // if any parent is a tortie, increase tortie chance
  for (const p of parents) {
    if (torties.includes(p.name)) {
      tortie_chance = Math.floor(tortie_chance / 2);
      break;
    }
  }

  var tortieBase = undefined;
  if (Math.random() <= 1 / 2 ** tortie_chance) {
    tortieBase = pelt;
    if (tortieBase === "TwoColour" || tortieBase === "SingleColour") {
      tortieBase = "Single";
    }
    tortieBase = tortieBase.toLowerCase();
    pelt = choice(torties);
  }

  // colour
  var colour_weights = [0, 0, 0, 0];

  for (const p of parentPeltColours) {
    var add_weights = [0, 0, 0, 0];
    if (ginger_colours.includes(p)) {
      add_weights = [40, 0, 0, 10];
    } else if (black_colours.includes(p)) {
      add_weights = [0, 40, 2, 5];
    } else if (white_colours.includes(p)) {
      add_weights = [0, 5, 40, 0];
    } else if (brown_colours.includes(p)) {
      add_weights = [10, 5, 0, 35];
    }
    // TODO: SUPPORT NULL PARENTS

    for (var i = 0; i < w.length; i++) {
      colour_weights[i] += add_weights[i];
    }
  }
  if (colour_weights.every((v) => v === 0)) {
    colour_weights = [1, 1, 1, 1];
  }

  const colourCategoryChoice = weightedChoice<string[]>(
    colour_categories,
    colour_weights,
  );
  var peltColour = choice(colourCategoryChoice);

  // no support for pelt length.

  // qed
  child.name = pelt;
  child.colour = peltColour;
  child.tortieBase = tortieBase;
}

function generateTortiePattern(child: Pelt) {
  if (child.name === "Tortie" || child.name === "Calico") {
    if (child.tortieBase === undefined) {
      child.tortieBase = choice(tortiebases);
    }
    if (child.pattern === undefined) {
      child.pattern = choice(tortiepatterns);
    }

    if (child.colour) {
      // wildcard
      if (Math.random() <= 1 / 2 ** 9) {
        child.tortiePattern = choice(tortiebases);

        const possibleColours = pelt_colours.filter((v) => v !== child.colour);
        child.tortieColour = choice(possibleColours);
      } else {
        if (["singlestripe", "sterstripe", "sillystripe", "dancestripe", "mimistripe", 
                                           "smoke","stersmoke", "sillysmoke", "dancesmoke", "mimismoke", "mimisingle", "single", "smokepoint"].includes(child.tortieBase)) {
          child.tortiePattern = choice([
            "tabby",
            "stertabby",
            "sillytabby",
            "dancetabby",
            "mimitabby",
            "mackerel",
            "stermackerel",
            "sillymackerel",
            "dancemackerel",
            "mimimackerel",
            "classic",
            "sterclassic",
            "sillyclassic",
            "danceclassic",
            "mimiclassic",
            "single",
            "smoke",
            "stersmoke",
            "sillysmoke",
            "dancesmoke",
            "mimismoke",
            "mimisingle",
            "agouti",
            "steragouti",
            "sillyagouti",
            "danceagouti",
            "mimiagouti",
            "ticked",
            "sterticked",
            "sillyticked",
            "danceticked",
            "mimiticked",
            "brindle",
            "spots",
          ]);
        } else {
          child.tortiePattern = weightedChoice(
            [child.tortieBase, "single"],
            [97, 3],
          );
        }

        if (child.colour === "WHITE") {
          const possibleColours = white_colours.filter((v) => v !== "WHITE");
          child.colour = choice(possibleColours);
        }

        if (
          black_colours.includes(child.colour) ||
          white_colours.includes(child.colour)
        ) {
          child.tortieColour = choice(
            [ginger_colours, ginger_colours, brown_colours].flat(),
          );
        } else if (ginger_colours.includes(child.colour)) {
          child.tortieColour = choice(
            [brown_colours, black_colours, black_colours].flat(),
          );
        } else if (brown_colours.includes(child.colour)) {
          const possibleColours = brown_colours.filter(
            (v) => v !== child.colour,
          );
          child.tortieColour = choice(
            [
              possibleColours,
              black_colours,
              ginger_colours,
              ginger_colours,
            ].flat(),
          );
        } else {
          child.tortieColour = "GOLDEN";
        }
      }
    } else {
      child.colour = "GOLDEN";
    }
  }
}

/*
  variance (0-100) controls how strongly kits stray from their parents.
  50 matches classic behaviour; lower values raise the chance of direct
  inheritance, higher values roll in extra mutations after generation.
*/
function generateChildPelt(parents: Pelt[], variance: number = 50) {
  var defaultKit: Pelt = {
    name: "SingleColour",
    colour: "CREAM",
    skin: "BLACK",
    spritesName: "single",
    eyeColour: "YELLOW",
    tint: "none",
    whitePatchesTint: "none",
    reverse: false,
  };

  const strictness = Math.max(0, (50 - variance) / 50); // 1 at 0, 0 at 50+
  const chaos = Math.max(0, (variance - 50) / 50); // 0 at 50, 1 at 100

  // direct inheritance
  if (Math.random() <= 0.15 + strictness * 0.75) {
    const parent: Pelt = choice(parents);
    defaultKit.name = parent.name;
    defaultKit.colour = parent.colour;
    defaultKit.tortieBase = parent.tortieBase;
    inheritWhite(parents, defaultKit, true);
  } else {
    inheritPattern(parents, defaultKit);
    inheritWhite(parents, defaultKit);
  }
  inheritEyes(parents, defaultKit);

  // mutation rolls for high variance
  if (chaos > 0) {
    if (Math.random() < chaos * 0.5) {
      defaultKit.colour = choice(pelt_colours);
    }
    if (Math.random() < chaos * 0.5) {
      defaultKit.eyeColour = choice(eye_colours);
    }
    if (Math.random() < chaos * 0.3) {
      const nonTortie = [tabbies, spotted, plain, exotic].flat();
      defaultKit.name = choice(nonTortie);
      defaultKit.tortieBase = undefined;
    }
  }

  generateTortiePattern(defaultKit);
  defaultKit.skin = choice(skin_sprites);

  if (defaultKit.name === "Tortie" || defaultKit.name === "Calico") {
    defaultKit.spritesName = defaultKit.tortieBase!;
  } else {
    defaultKit.spritesName = nameToSpritesname[defaultKit.name];
  }
  if (Math.random() <= 0.5) {
    defaultKit.reverse = true;
  } else {
    defaultKit.reverse = false;
  }
  return defaultKit;
}

export {
  inheritEyes,
  inheritPattern,
  inheritWhite,
  generateTortiePattern,
  generateChildPelt,
};