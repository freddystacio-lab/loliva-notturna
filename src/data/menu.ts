export type DietaryTag = "vegetarian" | "vegan" | "glutenFree" | "spicy";
export type LocalizedText = {es: string; en: string; it: string};
export type MenuItem = {name: LocalizedText; description: LocalizedText; price: number; tags?: DietaryTag[]; available?: boolean};

export const menuSections: {title: LocalizedText; items: MenuItem[]}[] = [
  {title: {es: "Antipasti", en: "Antipasti", it: "Antipasti"}, items: [
    {name: {es: "Burrata al limone", en: "Lemon burrata", it: "Burrata al limone"}, description: {es: "Tomates asados, limón confitado y aceite de albahaca.", en: "Roasted tomatoes, preserved lemon and basil oil.", it: "Pomodori arrosto, limone confit e olio al basilico."}, price: 12900, tags: ["vegetarian", "glutenFree"]},
    {name: {es: "Vitello tonnato", en: "Vitello tonnato", it: "Vitello tonnato"}, description: {es: "Ternera rosada, alcaparras fritas y salsa de atún.", en: "Pink veal, fried capers and tuna sauce.", it: "Vitello rosato, capperi fritti e salsa tonnata."}, price: 14900},
    {name: {es: "Carciofi alla brace", en: "Charred artichokes", it: "Carciofi alla brace"}, description: {es: "Alcachofas, crema de cannellini y menta.", en: "Artichokes, cannellini cream and mint.", it: "Carciofi, crema di cannellini e menta."}, price: 11900, tags: ["vegan", "glutenFree"]}
  ]},
  {title: {es: "Pasta e risotti", en: "Pasta & risotto", it: "Pasta e risotti"}, items: [
    {name: {es: "Tagliolini al granchio", en: "Crab tagliolini", it: "Tagliolini al granchio"}, description: {es: "Centolla, mantequilla de limón y pangrattato.", en: "King crab, lemon butter and pangrattato.", it: "Granchio reale, burro al limone e pangrattato."}, price: 21900},
    {name: {es: "Ravioli di zucca", en: "Pumpkin ravioli", it: "Ravioli di zucca"}, description: {es: "Zapallo asado, salvia, avellanas y parmigiano.", en: "Roasted pumpkin, sage, hazelnuts and parmigiano.", it: "Zucca arrosto, salvia, nocciole e parmigiano."}, price: 17900, tags: ["vegetarian"]},
    {name: {es: "Risotto verde", en: "Green risotto", it: "Risotto verde"}, description: {es: "Arvejas, espárragos, pecorino y hierbas costeras.", en: "Peas, asparagus, pecorino and coastal herbs.", it: "Piselli, asparagi, pecorino ed erbe costiere."}, price: 18900, tags: ["vegetarian", "glutenFree"]}
  ]},
  {title: {es: "Secondi", en: "Main courses", it: "Secondi"}, items: [
    {name: {es: "Branzino mediterraneo", en: "Mediterranean sea bass", it: "Branzino mediterraneo"}, description: {es: "Pesca del día, hinojo, aceitunas y azafrán.", en: "Catch of the day, fennel, olives and saffron.", it: "Pescato del giorno, finocchio, olive e zafferano."}, price: 23900, tags: ["glutenFree"]},
    {name: {es: "Melanzana notturna", en: "Notturna aubergine", it: "Melanzana notturna"}, description: {es: "Berenjena glaseada, tomate ahumado y piñones.", en: "Glazed aubergine, smoked tomato and pine nuts.", it: "Melanzana glassata, pomodoro affumicato e pinoli."}, price: 16900, tags: ["vegan", "glutenFree", "spicy"]}
  ]},
  {title: {es: "Dolci", en: "Desserts", it: "Dolci"}, items: [
    {name: {es: "Tiramisù della casa", en: "House tiramisù", it: "Tiramisù della casa"}, description: {es: "Mascarpone, café, cacao y amaretto.", en: "Mascarpone, coffee, cocoa and amaretto.", it: "Mascarpone, caffè, cacao e amaretto."}, price: 8900, tags: ["vegetarian"]},
    {name: {es: "Panna cotta all'oliva", en: "Olive oil panna cotta", it: "Panna cotta all'oliva"}, description: {es: "Aceite de oliva, cítricos y sal marina.", en: "Olive oil, citrus and sea salt.", it: "Olio d'oliva, agrumi e sale marino."}, price: 8500, tags: ["vegetarian", "glutenFree"]}
  ]}
];

export function formatClp(value: number) { return new Intl.NumberFormat("es-CL", {style: "currency", currency: "CLP", maximumFractionDigits: 0}).format(value); }
