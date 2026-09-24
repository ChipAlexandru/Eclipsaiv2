export const LANGUAGES = [
  { id: "en", short: "EN", label: "English" },
  { id: "de", short: "DE", label: "Deutsch" },
];

const EN = {
  demoScenarios:"Demo scenarios", hide:"Hide", show:"Show", firstVisit:"First visit", regular:"Regular", gift:"Gift", advanceStatus:"Advance status",
  backShop:"Back to Honold shop", orders:"Orders", pickup:"Pickup", delivery:"Delivery", change:"Change", choosePickupTime:"Choose a pickup time", chooseDeliveryWindow:"Choose a delivery window",
  forYou:"For you", favourites:"Honold favourites", heroGuest:"A moment of Honold.", heroRegular:"Your favourite, ready.", heroGift:"A gift in chocolate.",
  offerGuest:"Freshly selected from the Honold collection.", offerRegular:"10% off bakery and pâtisserie, up to CHF 5.", offerGift:"15% off chocolate, up to CHF 8.", add:"Add", orderUsual:"Usual order",
  all:"All", cakes:"Cakes", bakery:"Bakery", savoury:"Savoury", chocolate:"Chocolate", confections:"Confections", selectedForYou:"Selected for you", selection:"Selection", results:"Results", viewAll:"View all",
  unavailableAt:"Unavailable at", photoUnavailable:"Photo unavailable", view:"View", quantity:"quantity", shoppingControls:"Shopping controls",
  voiceUnavailable:"Voice unavailable", tryVoice:"Try voice again", talkShop:"Talk to Shop", voiceButtonIdle:"Talk to Shop", voiceButtonRetry:"Retry voice", voiceButtonUnavailable:"Voice off", muted:"Muted", listening:"Listening", speaking:"Speaking", connecting:"Connecting…", captions:"Captions", you:"You", basket:"Basket", items:"items", decrease:"Decrease", increase:"Increase", removeItem:"Remove",
  pickupStatus:"Pickup status", deliveryStatus:"Delivery status", confirmed:"Confirmed", preparing:"Preparing", ready:"Ready", packing:"Packing", onWay:"On the way", orderProgress:"Order progress",
  pickupNumber:"Pickup number", showCode:"Show this code when collecting your order.", qrAlt:"QR code for pickup", orderDetails:"Order details", total:"Total", offerApplied:"Offer applied", continueShopping:"Continue shopping", backOrders:"Back to orders",
  savedOrders:"Saved orders", yourOrders:"Your orders", noOrders:"No orders yet.", orderAgain:"Order again",
  productInfo:"For ingredient and allergen information, please ask our team.", addBasket:"Add to basket", closeDetails:"Close product details",
  choosePickup:"Choose pickup", deliveryDetails:"Delivery details", branch:"Branch", day:"Day", time:"Time", chooseTime:"Choose a time", address:"Address", deliveryWindow:"Delivery window", done:"Done",
  review:"Review", yourOrder:"Your order", closeReview:"Close order review", subtotal:"Subtotal", emptyBasket:"Your basket is empty.", confirmOrder:"Confirm order",
  standard:"Standard", ribbon:"Ribbon", none:"None", happyBirthday:"Happy Birthday", thankYou:"Thank you",
  voiceSecure:"Voice needs a secure, modern browser with microphone access.", micDenied:"Microphone access was not granted. Allow it in your browser and try again.", voiceFailed:"Voice connection failed. Try again.", voiceService:"Voice service is unavailable.",
};
const DE = {
  demoScenarios:"Demo-Szenarien", hide:"Ausblenden", show:"Anzeigen", firstVisit:"Erster Besuch", regular:"Stammkunde", gift:"Geschenk", advanceStatus:"Status weiter",
  backShop:"Zurück zum Honold Shop", orders:"Bestellungen", pickup:"Abholung", delivery:"Lieferung", change:"Ändern", choosePickupTime:"Abholzeit wählen", chooseDeliveryWindow:"Lieferfenster wählen",
  forYou:"Für dich", favourites:"Honold Favoriten", heroGuest:"Ein Moment Honold.", heroRegular:"Dein Favorit, bereit.", heroGift:"Ein Geschenk aus Schokolade.",
  offerGuest:"Frisch aus dem Honold Sortiment ausgewählt.", offerRegular:"10 % auf Bäckerei und Pâtisserie, bis CHF 5.", offerGift:"15 % auf Schokolade, bis CHF 8.", add:"Hinzufügen", orderUsual:"Wie üblich",
  all:"Alle", cakes:"Torten", bakery:"Bäckerei", savoury:"Herzhaft", chocolate:"Schokolade", confections:"Konfekt", selectedForYou:"Für dich ausgewählt", selection:"Auswahl", results:"Ergebnisse", viewAll:"Alle anzeigen",
  unavailableAt:"Nicht verfügbar in", photoUnavailable:"Foto nicht verfügbar", view:"Ansehen", quantity:"Menge", shoppingControls:"Einkaufssteuerung",
  voiceUnavailable:"Sprache nicht verfügbar", tryVoice:"Nochmals versuchen", talkShop:"Mit Honold sprechen", voiceButtonIdle:"Sprechen", voiceButtonRetry:"Erneut", voiceButtonUnavailable:"Ohne Sprache", muted:"Stumm", listening:"Hört zu", speaking:"Spricht", connecting:"Verbindet…", captions:"Untertitel", you:"Du", basket:"Warenkorb", items:"Artikel", decrease:"Verringern", increase:"Erhöhen", removeItem:"Entfernen",
  pickupStatus:"Abholstatus", deliveryStatus:"Lieferstatus", confirmed:"Bestätigt", preparing:"In Vorbereitung", ready:"Bereit", packing:"Wird verpackt", onWay:"Unterwegs", orderProgress:"Bestellstatus",
  pickupNumber:"Abholnummer", showCode:"Zeige diesen Code bei der Abholung.", qrAlt:"QR-Code für Abholung", orderDetails:"Bestelldetails", total:"Total", offerApplied:"Angebot berücksichtigt", continueShopping:"Weiter einkaufen", backOrders:"Zurück zu Bestellungen",
  savedOrders:"Gespeicherte Bestellungen", yourOrders:"Deine Bestellungen", noOrders:"Noch keine Bestellungen.", orderAgain:"Nochmals bestellen",
  productInfo:"Für Informationen zu Zutaten und Allergenen frage bitte unser Team.", addBasket:"In den Warenkorb", closeDetails:"Produktdetails schliessen",
  choosePickup:"Abholung wählen", deliveryDetails:"Lieferdetails", branch:"Filiale", day:"Tag", time:"Zeit", chooseTime:"Zeit wählen", address:"Adresse", deliveryWindow:"Lieferfenster", done:"Fertig",
  review:"Prüfen", yourOrder:"Deine Bestellung", closeReview:"Bestellprüfung schliessen", subtotal:"Zwischensumme", emptyBasket:"Dein Warenkorb ist leer.", confirmOrder:"Bestellung bestätigen",
  standard:"Standard", ribbon:"Geschenkband", none:"Keine", happyBirthday:"Alles Gute zum Geburtstag", thankYou:"Danke",
  voiceSecure:"Für Sprache ist ein sicherer, moderner Browser mit Mikrofonzugriff nötig.", micDenied:"Der Mikrofonzugriff wurde nicht erlaubt. Erlaube ihn im Browser und versuche es erneut.", voiceFailed:"Die Sprachverbindung ist fehlgeschlagen. Versuche es erneut.", voiceService:"Der Sprachdienst ist nicht verfügbar.",
};
export function copyFor(language){ return language === "de" ? DE : EN; }
export function localeFor(language){ return language === "de" ? "de-CH" : "en-CH"; }

const EN_PRODUCT_TERMS = [
  [/Gutschein im Wert von/gi,"Voucher worth"],[/\s*-\s*versandbereit\s*/gi," · ready to ship · "],[/Portionen/gi,"servings"],[/geschnitten/gi,"sliced"],
  [/Buttergipfel/gi,"Butter croissant"],[/Mandelgipfel/gi,"Almond croissant"],[/Laugengipfel/gi,"Pretzel croissant"],[/Weggli/gi,"Swiss milk roll"],
  [/Toastbrot eckig/gi,"Square toast bread"],[/Toastbrot/gi,"Toast bread"],[/Laugenbrötchen Roastbeef/gi,"Roast beef pretzel roll"],[/Laugenbrötchen/gi,"Pretzel roll"],[/Aprikosentörtchen/gi,"Apricot tartlet"],[/Apfeltörtchen/gi,"Apple tartlet"],[/Zwetschgentörtchen/gi,"Plum tartlet"],
  [/Aprikosenkuchen/gi,"Apricot cake"],[/Dekor Schild klein/gi,"Small chocolate plaque"],[/Dekor Schild gross/gi,"Large chocolate plaque"],
  [/Alles Gute/gi,"Best wishes"],[/Schokostückli/gi,"chocolate pieces"],[/gestäubt/gi,"dusted"],[/Küsnachterli/gi,"Küsnacht roll"],
];
export function productName(product, language){
  if (!product) return "";
  if (language !== "en") return product.name;
  return EN_PRODUCT_TERMS.reduce((name,[pattern,replacement]) => name.replace(pattern,replacement), product.name)
    .replace(/(\d)\s*-\s*(\d)/g,"$1–$2").replace(/\s*·\s*/g," · ").replace(/\s{2,}/g," ").trim();
}
export function localizeStatus(status, language){
  const c=copyFor(language); return ({Confirmed:c.confirmed,Preparing:c.preparing,Ready:c.ready,Packing:c.packing,"On the way":c.onWay})[status] || status;
}
export function localizeReason(reason, language){
  if (!reason || language !== "de") return reason;
  const map={
    "Add a product to the basket.":"Füge ein Produkt zum Warenkorb hinzu.","Some quantities exceed the available stock.":"Einige Mengen übersteigen den verfügbaren Bestand.",
    "Choose a valid future pickup slot.":"Wähle eine gültige zukünftige Abholzeit.","This pickup time cannot fit your basket.":"Diese Abholzeit kann deinen Warenkorb nicht aufnehmen.",
    "Add a delivery address.":"Gib eine Lieferadresse ein.","Choose a valid delivery window.":"Wähle ein gültiges Lieferfenster.","Choose a pickup branch.":"Wähle eine Abholfiliale."
  }; return map[reason] || reason;
}
export function voiceInstructions(language, initialState){
  const german=language==="de";
  return `You are the concise voice shopping assistant for this Honold shopping experience. The selected interface language is ${german ? "Swiss Standard German (de-CH)" : "English"}. Always speak ${german ? "natural Swiss Standard German using ss rather than ß" : "English"}, unless the shopper explicitly asks to change language. Do not imitate a Swiss dialect or claim a regional accent.\n\nKeep speech warm, natural, brief, and easy to interrupt. Help with products, photos, basket quantities, pickup or delivery details, and order review. Use customer-facing terms that match the selected interface language.\n\nCritical rules:\n- Do not volunteer prototype or provenance caveats during ordinary shopping. If asked whether data or an action is real, answer clearly and truthfully.\n- Acknowledge each interface action once. Do not echo the surrounding interface or repeat confirmations.\n- Availability is illustrative, prices are a public shop snapshot, and ingredients and allergens must be confirmed with Honold.\n- Never claim an order, reservation, payment, pickup, delivery or store message is real.\n- Use get_shopping_state before relative references. Use search_and_show_products for product needs. Use only stable IDs returned by tools.\n- Before confirmation, explain the selected offer, fulfilment details and visible total once. prepare_simulated_pickup opens the exact review; approval requires a later explicit shopper turn and the unchanged review ID and fingerprint.\n- After explicit approval, give one concise confirmation and do not recap the order.\n- When a tool says a newer selection made its result stale, use the newer state.\n\nInitial interface state: ${JSON.stringify(initialState)}`;
}
