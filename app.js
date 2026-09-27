const stays = [
  {
    name: "The Stillwater Cabin", place: "Jackson, New Hampshire", type: "Cabin",
    price: 245, rating: "4.98", reviews: 42, guests: 4, bedrooms: 2, beds: 2,
    tag: "Guest favorite", photo: "photo-1449158743715-0a90ebb6d2d8",
    description: "A tucked-away timber cabin for quiet mornings, wooded trails, and evenings by the fire. Set just outside Jackson, with the White Mountains close at hand."
  },
  {
    name: "The Lake House", place: "Meredith, New Hampshire", type: "Lakehouse",
    price: 320, rating: "4.96", reviews: 28, guests: 6, bedrooms: 3, beds: 4,
    tag: "By the water", photo: "photo-1470770841072-f978cf4d019e",
    description: "Step from the porch to the water at this sunny lakeside home. Make coffee slowly, take the kayaks out, and watch the lake change color at dusk."
  },
  {
    name: "Little Bear A-Frame", place: "Lincoln, New Hampshire", type: "Mountain",
    price: 189, rating: "4.92", reviews: 67, guests: 3, bedrooms: 1, beds: 2,
    tag: "A little different", photo: "photo-1510798831971-661eb04b3739",
    description: "A small, bright A-frame with room for deep breaths. Find hiking, ski trails, and the kind of starry skies that make you forget to check your phone."
  },
  {
    name: "Pine & Hearth", place: "Franconia, New Hampshire", type: "Cabin",
    price: 275, rating: "4.99", reviews: 53, guests: 5, bedrooms: 2, beds: 3,
    tag: "Guest favorite", photo: "photo-1505693416388-ac5ce068fe85",
    description: "Gather around the hearth after a day exploring Franconia Notch. This welcoming hideaway makes it easy to settle in and make the most of the mountains."
  },
  {
    name: "The Fernwood Cottage", place: "North Conway, New Hampshire", type: "Unique",
    price: 210, rating: "4.91", reviews: 35, guests: 4, bedrooms: 2, beds: 2,
    tag: "Tucked in the woods", photo: "photo-1449158743715-0a90ebb6d2d8",
    description: "A thoughtfully restored cottage ringed by ferns and old trees. Wander downtown North Conway, then come back to a garden, a good book, and nowhere else to be."
  },
  {
    name: "Sunrise on Winnipesaukee", place: "Wolfeboro, New Hampshire", type: "Lakehouse",
    price: 360, rating: "4.97", reviews: 19, guests: 8, bedrooms: 4, beds: 5,
    tag: "Lakefront", photo: "photo-1499793983690-e29da59ef1c2",
    description: "Watch the sun come up over the lake from your own private dock. An easygoing home for families and friends to spend their summer days together."
  },
  {
    name: "Above the Clouds", place: "Bretton Woods, New Hampshire", type: "Mountain",
    price: 295, rating: "4.95", reviews: 31, guests: 6, bedrooms: 3, beds: 4,
    tag: "Mountain views", photo: "photo-1510798831971-661eb04b3739",
    description: "Open the windows to mountain air and long views across the Presidential Range. A warm, quiet base for trails, snow, and slow weekends all year round."
  },
  {
    name: "The Little Glass House", place: "Hancock, New Hampshire", type: "Unique",
    price: 230, rating: "4.94", reviews: 24, guests: 2, bedrooms: 1, beds: 1,
    tag: "A little different", photo: "photo-1499793983690-e29da59ef1c2",
    description: "Big windows, little distractions. This intimate woodland stay is designed for two and for remembering what it feels like to have a whole day to yourself."
  }
];

const imageUrl = (id, width = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
const grid = document.querySelector("#property-grid");
const emptyState = document.querySelector("#empty-state");
const resultsCount = document.querySelector("#results-count");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const toast = document.querySelector("#toast");
let selectedType = "all";
let searchDestination = "";
let toastTimer;

const storageKeys = {
  profile: "staycation-demo-profile",
  favorites: "staycation-demo-favorites",
  listings: "staycation-demo-listings",
  reservations: "staycation-demo-reservations"
};

function readStoredValue(key, fallback, isValid) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    if (!isValid(value)) throw new Error("Saved demo data has an unexpected format.");
    return value;
  } catch (error) {
    showToast(error instanceof SyntaxError
      ? "Saved demo data could not be read. Clear this site's data to reset the demo."
      : `Could not load saved demo data: ${error.message}`);
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    showToast(`Could not save demo data in this browser: ${error.message}`);
    return false;
  }
}

function isDemoProfile(value) {
  return value && typeof value.name === "string" && ["guest", "host"].includes(value.role);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

let demoProfile = readStoredValue(storageKeys.profile, null, (value) => value === null || isDemoProfile(value));
const favoriteIndices = readStoredValue(
  storageKeys.favorites,
  [],
  (value) => Array.isArray(value) && value.every((index) => Number.isInteger(index) && index >= 0 && index < stays.length)
);
const hostListings = readStoredValue(
  storageKeys.listings,
  [],
  (value) => Array.isArray(value) && value.every((listing) =>
    listing && ["title", "city", "description"].every((key) => typeof listing[key] === "string")
    && Number.isFinite(listing.price) && Number.isInteger(listing.guests))
);
const reservations = readStoredValue(
  storageKeys.reservations,
  [],
  (value) => Array.isArray(value) && value.every((reservation) =>
    reservation && typeof reservation.id === "string"
    && Number.isInteger(reservation.stayIndex) && reservation.stayIndex >= 0 && reservation.stayIndex < stays.length
    && typeof reservation.guestName === "string"
    && typeof reservation.checkIn === "string" && typeof reservation.checkOut === "string"
    && Number.isInteger(reservation.guests) && Number.isInteger(reservation.nights)
    && Number.isFinite(reservation.total) && ["demo-reserved", "cancelled"].includes(reservation.status))
);
const favorites = new Set(favoriteIndices);
let searchCheckIn = "";
let searchCheckOut = "";
let searchGuestCount = 0;
let pendingBookingStay = null;

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nightsBetween(checkIn, checkOut) {
  const [startYear, startMonth, startDay] = checkIn.split("-").map(Number);
  const [endYear, endMonth, endDay] = checkOut.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.round((end - start) / 86400000);
}

function hasAvailability(stayIndex, checkIn, checkOut) {
  return !reservations.some((reservation) =>
    reservation.status === "demo-reserved"
    && reservation.stayIndex === stayIndex
    && checkIn < reservation.checkOut
    && checkOut > reservation.checkIn
  );
}

function renderStays() {
  const destination = searchDestination.trim().toLocaleLowerCase();
  const visible = stays.filter((stay) => {
    const matchesType = selectedType === "all" || stay.type === selectedType;
    const matchesDestination = !destination || `${stay.name} ${stay.place} ${stay.type}`.toLocaleLowerCase().includes(destination);
    const matchesGuests = !searchGuestCount || stay.guests >= searchGuestCount;
    const index = stays.indexOf(stay);
    const matchesDates = !searchCheckIn || !searchCheckOut || hasAvailability(index, searchCheckIn, searchCheckOut);
    return matchesType && matchesDestination && matchesGuests && matchesDates;
  });

  grid.innerHTML = visible.map((stay) => {
    const index = stays.indexOf(stay);
    const image = imageUrl(stay.photo, 800);
    return `
      <article class="property-card" data-index="${index}" tabindex="0" role="button" aria-label="View ${stay.name}, ${stay.place}">
        <div class="property-photo-wrap">
          <img class="property-photo" src="${image}" alt="${stay.name}, a ${stay.type.toLowerCase()} in ${stay.place}" loading="${index < 4 ? "eager" : "lazy"}">
          <span class="photo-shade" aria-hidden="true"></span>
          <span class="photo-tag">${stay.tag}</span>
          <button class="favorite-button ${favorites.has(index) ? "saved" : ""}" type="button" aria-label="${favorites.has(index) ? "Remove from" : "Add to"} saved stays" aria-pressed="${favorites.has(index)}" data-favorite="${index}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.9c0 4.2-8.8 10.1-8.8 10.1S3.2 13.1 3.2 8.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.8 1.9Z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <div class="property-info">
          <div class="property-title-row"><h3 class="property-title">${stay.name}</h3><span class="rating"><span>★</span> ${stay.rating}</span></div>
          <p class="property-subtitle">${stay.place}</p>
          <p class="property-price"><strong>$${stay.price}</strong> night · ${stay.reviews} reviews</p>
        </div>
      </article>`;
  }).join("");

  grid.hidden = visible.length === 0;
  emptyState.hidden = visible.length !== 0;
  const countLabel = visible.length === 1 ? "stay" : "stays";
  const availabilityLabel = searchCheckIn && searchCheckOut ? "available " : "";
  resultsCount.textContent = searchDestination
    ? `${visible.length} ${availabilityLabel}${countLabel} for “${searchDestination}”`
    : searchCheckIn && searchCheckOut
      ? `${visible.length} ${availabilityLabel}${countLabel}`
      : `${visible.length} thoughtful ${visible.length === 1 ? "place" : "places"}, picked for you`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderAccount() {
  if (!demoProfile) {
    modalContent.innerHTML = `
      <p class="modal-kicker">Welcome to Staycation</p>
      <h2 id="modal-title">A getaway starts here.</h2>
      <p>Create a local demo profile to try the guest or host experience. No password or email is needed.</p>
      <form id="account-form" class="account-form">
        <label class="form-label" for="account-name">What should we call you?</label>
        <input class="form-input" id="account-name" name="name" maxlength="50" autocomplete="name" placeholder="Your name" required>
        <fieldset class="role-picker">
          <legend class="form-label">How would you like to use Staycation?</legend>
          <label class="role-option"><input type="radio" name="role" value="guest" checked><span><strong>Find a stay</strong><small>Save getaways for later</small></span></label>
          <label class="role-option"><input type="radio" name="role" value="host"><span><strong>Host a stay</strong><small>Start a property listing</small></span></label>
        </fieldset>
        <button class="modal-action" type="submit">Create demo profile <span aria-hidden="true">→</span></button>
      </form>
      <p class="demo-disclaimer">Demo only: profiles are stored in this browser, not shared across devices. This is not secure authentication; anyone using this browser may see the demo details. Do not enter sensitive information.</p>`;
    modal.showModal();
    return;
  }

  const isHost = demoProfile.role === "host";
  const safeName = escapeHTML(demoProfile.name);
  modalContent.innerHTML = `
    <p class="modal-kicker">${isHost ? "Your host space" : "Your guest space"}</p>
    <h2 id="modal-title">Good to see you, ${safeName}.</h2>
    <p>This is your Staycation ${isHost ? "host" : "guest"} demo profile.</p>
    <div class="account-toolbar">
      <span class="role-badge">${isHost ? "Host" : "Guest"} profile</span>
      <button class="text-button" id="switch-role" type="button">Switch to ${isHost ? "guest" : "host"}</button>
      <button class="text-button" id="sign-out" type="button">Sign out</button>
    </div>
    ${isHost ? renderHostDashboard() : renderGuestDashboard()}
    <p class="demo-disclaimer">Demo only: profile and listing data stays in this browser, may be visible to others using it, and is not shared across devices. Nothing here is published or bookable; do not enter sensitive information.</p>`;
  modal.showModal();
}

function renderGuestDashboard() {
  const saved = Array.from(favorites).map((index) => stays[index]).filter(Boolean);
  const trips = reservations.filter((reservation) => reservation.guestName === demoProfile.name);
  return `
    <section class="dashboard-section">
      <div class="dashboard-heading"><h3>Saved stays</h3><span>${saved.length}</span></div>
      ${saved.length
        ? `<div class="saved-stays">${saved.map((stay) => `
          <button class="saved-stay" type="button" data-open-stay="${stays.indexOf(stay)}">
            <img src="${imageUrl(stay.photo, 180)}" alt="">
            <span><strong>${escapeHTML(stay.name)}</strong><small>${escapeHTML(stay.place)}</small></span>
            <span class="saved-price">$${stay.price}<small> / night</small></span>
          </button>`).join("")}</div>`
        : `<div class="dashboard-empty"><strong>Your next favorite is out there.</strong><span>Tap the heart on any stay to save it here.</span><button class="text-button" id="browse-stays" type="button">Explore stays</button></div>`}
    </section>
    <section class="dashboard-section">
      <div class="dashboard-heading"><h3>Your trips</h3><span>${trips.filter((trip) => trip.status === "demo-reserved").length}</span></div>
      ${trips.length
        ? `<div class="trip-list">${trips.map((trip) => {
          const stay = stays[trip.stayIndex];
          return `<article class="trip-card ${trip.status === "cancelled" ? "cancelled" : ""}">
            <div class="trip-card-heading"><strong>${escapeHTML(stay.name)}</strong><span class="reservation-badge">${trip.status === "cancelled" ? "Cancelled" : "Demo reservation · unpaid"}</span></div>
            <span class="trip-dates">${formatDateRange(trip.checkIn, trip.checkOut)} · ${trip.guests} guest${trip.guests === 1 ? "" : "s"}</span>
            <span class="trip-total">Sample total: <strong>$${trip.total.toFixed(2)}</strong></span>
            ${trip.status === "demo-reserved" ? `<button class="text-button" type="button" data-cancel-reservation="${escapeHTML(trip.id)}">Cancel demo reservation</button>` : ""}
          </article>`;
        }).join("")}
        <p class="demo-disclaimer">These are unpaid local demo reservations. They are not confirmed bookings, and no payment was collected.</p>`
        : `<div class="dashboard-empty"><strong>No trips yet.</strong><span>Choose a stay and dates to try the booking preview. Checkout is simulated; no payment is collected.</span></div>`}
    </section>`;
}

function formatDateRange(checkIn, checkOut) {
  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  const options = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, options)} – ${end.toLocaleDateString(undefined, options)}`;
}

function renderHostDashboard() {
  return `
    <section class="dashboard-section">
      <div class="dashboard-heading"><h3>Your listings</h3><span>${hostListings.length} drafts</span></div>
      ${hostListings.length
        ? `<div class="host-listings">${hostListings.map((listing, index) => `
          <article class="host-listing">
            <div><strong>${escapeHTML(listing.title)}</strong><span>${escapeHTML(listing.city)}, New Hampshire · ${listing.guests} guests</span></div>
            <span class="draft-badge">Draft</span>
            <strong class="saved-price">$${listing.price}<small> / night</small></strong>
            <button class="text-button" type="button" data-delete-listing="${index}" aria-label="Delete ${escapeHTML(listing.title)}">Remove</button>
          </article>`).join("")}</div>`
        : `<div class="dashboard-empty"><strong>Your host journey starts with a place.</strong><span>Create a listing draft to see your owner dashboard take shape.</span></div>`}
    </section>
    <section class="dashboard-section">
      <div class="dashboard-heading"><h3>Start a listing</h3><span>Step 1 of 3</span></div>
      <form id="listing-form" class="listing-form">
        <label class="form-label" for="listing-title">Property name</label>
        <input class="form-input" id="listing-title" name="title" maxlength="70" placeholder="e.g. The Pine Cabin" required>
        <div class="form-row">
          <label><span class="form-label">New Hampshire town</span><input class="form-input" name="city" maxlength="50" placeholder="e.g. Jackson" required></label>
          <label><span class="form-label">Guests</span><input class="form-input" name="guests" type="number" min="1" max="30" value="2" required></label>
        </div>
        <div class="form-row">
          <label><span class="form-label">Nightly price (USD)</span><input class="form-input" name="price" type="number" min="1" max="10000" value="150" required></label>
          <label><span class="form-label">Stay type</span><select class="form-input" name="type"><option>Cabin</option><option>Lakehouse</option><option>Mountain</option><option>Unique</option></select></label>
        </div>
        <label class="form-label" for="listing-description">What makes it special?</label>
        <textarea class="form-input form-textarea" id="listing-description" name="description" maxlength="400" placeholder="A few words about your place" required></textarea>
        <button class="modal-action" type="submit">Save listing draft <span aria-hidden="true">→</span></button>
      </form>
    </section>
    <div class="host-next-step"><strong>What happens next?</strong><span>In a live service, Staycation would review your details before a listing goes public. This demo doesn't publish listings or accept reservations.</span></div>`;
}

function openHostModal() {
  if (demoProfile?.role === "host") {
    renderAccount();
    return;
  }
  if (demoProfile?.role === "guest") {
    demoProfile.role = "host";
    if (writeStoredValue(storageKeys.profile, demoProfile)) renderAccount();
    return;
  }
  renderAccount();
  const hostChoice = modalContent.querySelector('input[name="role"][value="host"]');
  if (hostChoice) hostChoice.checked = true;
}

function openAccountModal() {
  renderAccount();
}

function openStayModal(stay) {
  modalContent.innerHTML = `
    <img class="modal-photo" src="${imageUrl(stay.photo, 1000)}" alt="${stay.name}">
    <p class="modal-kicker">${stay.type} · ${stay.place}</p>
    <h2 id="modal-title">${stay.name}</h2>
    <p>${stay.description}</p>
    <div class="modal-details"><span>★ ${stay.rating} (${stay.reviews} reviews)</span><span>${stay.guests} guests</span><span>${stay.bedrooms} bedroom${stay.bedrooms === 1 ? "" : "s"}</span><span>${stay.beds} beds</span></div>
    <p><strong>$${stay.price}</strong> per night · sample price, before taxes</p>
    <p class="demo-disclaimer">Demo listing only. Availability and prices are examples, not live offers.</p>
    <button class="modal-action" type="button" id="request-booking">Choose dates <span aria-hidden="true">→</span></button>`;
  modal.showModal();
  document.querySelector("#request-booking").addEventListener("click", () => {
    if (!demoProfile) {
      pendingBookingStay = stays.indexOf(stay);
      renderAccount();
      modalContent.querySelector('input[name="role"][value="guest"]').checked = true;
      return;
    }
    if (demoProfile.role !== "guest") {
      modalContent.innerHTML = `
        <p class="modal-kicker">Guest account needed</p>
        <h2 id="modal-title">Booking starts with a guest profile.</h2>
        <p>Switch this demo profile to guest mode before trying the booking flow.</p>
        <button class="modal-action" id="switch-to-guest-booking" type="button">Switch to guest <span aria-hidden="true">→</span></button>
        <p class="demo-disclaimer">Demo only: no real reservation or payment will be created.</p>`;
      document.querySelector("#switch-to-guest-booking").addEventListener("click", () => {
        demoProfile.role = "guest";
        if (writeStoredValue(storageKeys.profile, demoProfile)) {
          updateProfileButton();
          openBookingModal(stay);
        }
      });
      return;
    }
    openBookingModal(stay);
  });
}

function openBookingModal(stay, booking = null) {
  const stayIndex = stays.indexOf(stay);
  const checkIn = booking?.checkIn || (searchCheckIn && searchCheckOut ? searchCheckIn : "");
  const checkOut = booking?.checkOut || (searchCheckIn && searchCheckOut ? searchCheckOut : "");
  const guests = booking?.guests || searchGuestCount || 1;
  const minimumDate = localDateString();
  modalContent.innerHTML = `
    <p class="modal-kicker">A few details, then a clear price</p>
    <h2 id="modal-title">Plan your stay.</h2>
    <div class="booking-summary">
      <img src="${imageUrl(stay.photo, 240)}" alt="">
      <span><strong>${escapeHTML(stay.name)}</strong><small>${escapeHTML(stay.place)}</small><small>$${stay.price} per night · demo price</small></span>
    </div>
    <form class="booking-form" id="booking-form" data-stay-index="${stayIndex}">
      <div class="form-row">
        <label><span class="form-label">Check-in</span><input class="form-input" name="checkIn" type="date" min="${minimumDate}" value="${checkIn}" required></label>
        <label><span class="form-label">Check-out</span><input class="form-input" name="checkOut" type="date" min="${minimumDate}" value="${checkOut}" required></label>
      </div>
      <label class="form-label" for="booking-guests">Guests (up to ${stay.guests})</label>
      <input class="form-input" id="booking-guests" name="guests" type="number" min="1" max="${stay.guests}" value="${Math.min(guests, stay.guests)}" required>
      <p class="booking-error" id="booking-error" role="alert" hidden></p>
      <button class="modal-action" type="submit">Review price <span aria-hidden="true">→</span></button>
    </form>
    <p class="demo-disclaimer">This is a booking demo using sample listing data. It does not check a live calendar or charge you.</p>`;
  modal.showModal();
  const startInput = modalContent.querySelector('[name="checkIn"]');
  const endInput = modalContent.querySelector('[name="checkOut"]');
  startInput.addEventListener("change", () => {
    endInput.min = startInput.value || minimumDate;
    if (endInput.value && endInput.value <= startInput.value) endInput.value = "";
  });
}

function renderCheckout(stay, details) {
  const nights = nightsBetween(details.checkIn, details.checkOut);
  const accommodation = stay.price * nights;
  const serviceFee = Math.round(accommodation * 0.1 * 100) / 100;
  const total = accommodation + serviceFee;
  const safeName = escapeHTML(demoProfile.name);
  modalContent.innerHTML = `
    <p class="modal-kicker">Step 2 of 2 · Review & checkout</p>
    <h2 id="modal-title">Your getaway, at a glance.</h2>
    <div class="checkout-stay"><img src="${imageUrl(stay.photo, 320)}" alt=""><div><strong>${escapeHTML(stay.name)}</strong><span>${escapeHTML(stay.place)}</span><span>${formatDateRange(details.checkIn, details.checkOut)} · ${details.guests} guest${details.guests === 1 ? "" : "s"}</span></div></div>
    <div class="price-breakdown">
      <div><span>$${stay.price} × ${nights} night${nights === 1 ? "" : "s"}</span><span>$${accommodation.toFixed(2)}</span></div>
      <div><span>Sample service fee (10%)</span><span>$${serviceFee.toFixed(2)}</span></div>
      <div class="price-total"><strong>Estimated total</strong><strong>$${total.toFixed(2)}</strong></div>
    </div>
    <section class="payment-placeholder" aria-label="Payment information">
      <span class="payment-icon" aria-hidden="true">▣</span>
      <div><strong>Secure payment isn't connected yet</strong><p>In a live service, checkout would continue on the payment provider's secure page. This prototype never asks for or stores card details.</p></div>
    </section>
    <button class="modal-action" id="save-demo-reservation" type="button">Save demo reservation (no payment)</button>
    <button class="checkout-back" id="edit-booking" type="button">← Change dates or guests</button>
    <p class="demo-disclaimer">Sample estimate only: no tax, cleaning, or other fees are included. This unpaid demo reservation is not a real booking or confirmation.</p>`;
  modal.showModal();

  document.querySelector("#edit-booking").addEventListener("click", () => openBookingModal(stay, details));
  document.querySelector("#save-demo-reservation").addEventListener("click", () => {
    const reservation = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      stayIndex: stays.indexOf(stay),
      guestName: demoProfile.name,
      checkIn: details.checkIn,
      checkOut: details.checkOut,
      guests: details.guests,
      nights,
      total,
      status: "demo-reserved"
    };
    reservations.push(reservation);
    if (!writeStoredValue(storageKeys.reservations, reservations)) {
      reservations.pop();
      return;
    }
    modalContent.innerHTML = `
      <p class="modal-kicker">Demo flow complete · no charge made</p>
      <h2 id="modal-title">Your sample stay is saved.</h2>
      <p>${escapeHTML(stay.name)} · ${formatDateRange(details.checkIn, details.checkOut)} · ${details.guests} guest${details.guests === 1 ? "" : "s"}</p>
      <div class="price-total confirmation-total"><strong>Sample total</strong><strong>$${total.toFixed(2)}</strong></div>
      <div class="payment-placeholder"><span class="payment-icon" aria-hidden="true">✓</span><div><strong>No payment was collected</strong><p>This unpaid reservation exists only in this browser. It is not sent to a host, and the dates are not actually held.</p></div></div>
      <button class="modal-action" id="view-demo-trip" type="button">View my trips</button>`;
    document.querySelector("#view-demo-trip").addEventListener("click", renderAccount);
  });
}

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".category.active")?.classList.remove("active");
    button.classList.add("active");
    selectedType = button.dataset.filter;
    renderStays();
  });
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  searchDestination = document.querySelector("#destination").value;
  searchCheckIn = document.querySelector("#check-in-search").value;
  searchCheckOut = document.querySelector("#check-out-search").value;
  searchGuestCount = Number(document.querySelector("#guests").value) || 0;
  if (searchCheckIn && searchCheckIn < localDateString()) {
    showToast("Choose a check-in date from today onward.");
    return;
  }
  if (Boolean(searchCheckIn) !== Boolean(searchCheckOut) || (searchCheckOut && searchCheckOut <= searchCheckIn)) {
    showToast("Add a valid check-in and check-out date.");
    return;
  }
  renderStays();
  document.querySelector("#stays").scrollIntoView({ behavior: "smooth" });
});

const searchCheckInInput = document.querySelector("#check-in-search");
const searchCheckOutInput = document.querySelector("#check-out-search");
searchCheckInInput.min = localDateString();
searchCheckOutInput.min = localDateString();
searchCheckInInput.addEventListener("change", () => {
  searchCheckOutInput.min = searchCheckInInput.value || localDateString();
  if (searchCheckOutInput.value && searchCheckOutInput.value <= searchCheckInInput.value) {
    searchCheckOutInput.value = "";
  }
});

document.querySelector("#clear-search").addEventListener("click", () => {
  document.querySelector("#destination").value = "";
  document.querySelector("#check-in-search").value = "";
  document.querySelector("#check-out-search").value = "";
  document.querySelector("#guests").value = "";
  searchDestination = "";
  searchCheckIn = "";
  searchCheckOut = "";
  searchGuestCount = 0;
  selectedType = "all";
  document.querySelectorAll(".category").forEach((button) => button.classList.toggle("active", button.dataset.filter === "all"));
  renderStays();
});

grid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    event.stopPropagation();
    const index = Number(favoriteButton.dataset.favorite);
    if (favorites.has(index)) {
      const updated = Array.from(favorites).filter((favorite) => favorite !== index);
      if (writeStoredValue(storageKeys.favorites, updated)) {
        favorites.delete(index);
        showToast("Removed from your saved stays.");
      }
    } else {
      const updated = [...favorites, index];
      if (writeStoredValue(storageKeys.favorites, updated)) {
        favorites.add(index);
        showToast("Saved for your next getaway.");
      }
    }
    renderStays();
    return;
  }
  const card = event.target.closest(".property-card");
  if (card) openStayModal(stays[Number(card.dataset.index)]);
});

grid.addEventListener("keydown", (event) => {
  const card = event.target.closest(".property-card");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openStayModal(stays[Number(card.dataset.index)]);
  }
});

document.querySelector("#host-link").addEventListener("click", openHostModal);
document.querySelector("#banner-host").addEventListener("click", openHostModal);
document.querySelector("#profile-button").addEventListener("click", openAccountModal);
document.querySelector("#map-toggle").addEventListener("click", () => showToast("An interactive map is planned for the next build."));
document.querySelector("#modal-close").addEventListener("click", () => modal.close());
modalContent.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  if (form.id === "account-form") {
    const name = String(formData.get("name")).trim();
    const role = formData.get("role");
    if (!name || !["guest", "host"].includes(role)) {
      showToast("Enter your name and choose a guest or host profile.");
      return;
    }
    demoProfile = { name, role };
    if (writeStoredValue(storageKeys.profile, demoProfile)) {
      renderAccount();
      updateProfileButton();
      if (pendingBookingStay !== null && role === "guest") {
        const stay = stays[pendingBookingStay];
        pendingBookingStay = null;
        if (stay) openBookingModal(stay);
      }
    } else {
      demoProfile = null;
    }
    return;
  }

  if (form.id === "booking-form") {
    const stay = stays[Number(form.dataset.stayIndex)];
    const details = {
      checkIn: String(formData.get("checkIn")),
      checkOut: String(formData.get("checkOut")),
      guests: Number(formData.get("guests"))
    };
    const error = document.querySelector("#booking-error");
    const nights = nightsBetween(details.checkIn, details.checkOut);
    if (!stay || details.checkIn < localDateString() || nights < 1 || !Number.isInteger(details.guests)
        || details.guests < 1 || details.guests > stay.guests) {
      error.textContent = `Choose valid dates and 1–${stay?.guests || 0} guests.`;
      error.hidden = false;
      return;
    }
    if (!hasAvailability(stays.indexOf(stay), details.checkIn, details.checkOut)) {
      error.textContent = "Those dates overlap another demo reservation in this browser. Choose different dates.";
      error.hidden = false;
      return;
    }
    renderCheckout(stay, details);
    return;
  }

  if (form.id === "listing-form") {
    const listing = {
      title: String(formData.get("title")).trim(),
      city: String(formData.get("city")).trim(),
      guests: Number(formData.get("guests")),
      price: Number(formData.get("price")),
      type: String(formData.get("type")),
      description: String(formData.get("description")).trim()
    };
    if (!listing.title || !listing.city || !listing.description || !Number.isInteger(listing.guests)
        || listing.guests < 1 || listing.guests > 30 || !Number.isFinite(listing.price)
        || listing.price < 1 || listing.price > 10000) {
      showToast("Check the listing details and try again.");
      return;
    }
    hostListings.push(listing);
    if (writeStoredValue(storageKeys.listings, hostListings)) {
      renderAccount();
      showToast("Listing draft saved in this browser.");
    } else {
      hostListings.pop();
    }
  }
});

modalContent.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.id === "switch-role") {
    demoProfile.role = demoProfile.role === "host" ? "guest" : "host";
    if (writeStoredValue(storageKeys.profile, demoProfile)) {
      renderAccount();
      updateProfileButton();
    } else {
      demoProfile.role = demoProfile.role === "host" ? "guest" : "host";
    }
  } else if (target.id === "sign-out") {
    try {
      localStorage.removeItem(storageKeys.profile);
      demoProfile = null;
      updateProfileButton();
      renderAccount();
    } catch (error) {
      showToast(`Could not sign out of this demo profile: ${error.message}`);
    }
  } else if (target.id === "browse-stays") {
    modal.close();
    document.querySelector("#stays").scrollIntoView({ behavior: "smooth" });
  } else if (target.hasAttribute("data-cancel-reservation")) {
    const reservation = reservations.find((item) => item.id === target.dataset.cancelReservation);
    if (!reservation || reservation.status !== "demo-reserved") return;
    reservation.status = "cancelled";
    if (writeStoredValue(storageKeys.reservations, reservations)) {
      renderAccount();
      showToast("Demo reservation cancelled. No payment was collected.");
    } else {
      reservation.status = "demo-reserved";
    }
  } else if (target.hasAttribute("data-open-stay")) {
    const stay = stays[Number(target.dataset.openStay)];
    if (stay) openStayModal(stay);
  } else if (target.hasAttribute("data-delete-listing")) {
    const index = Number(target.dataset.deleteListing);
    const [removed] = hostListings.splice(index, 1);
    if (writeStoredValue(storageKeys.listings, hostListings)) {
      renderAccount();
      showToast("Listing draft removed.");
    } else {
      hostListings.splice(index, 0, removed);
    }
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

function updateProfileButton() {
  const button = document.querySelector("#profile-button");
  button.setAttribute("aria-label", demoProfile ? `Open ${demoProfile.role} profile` : "Create a guest or host demo profile");
  button.classList.toggle("has-profile", Boolean(demoProfile));
  const initials = button.querySelector(".profile-initials");
  if (initials) initials.textContent = demoProfile ? demoProfile.name.trim().slice(0, 1).toLocaleUpperCase() : "";
  button.querySelector(".profile-dot").hidden = !demoProfile;
}

updateProfileButton();
renderStays();
