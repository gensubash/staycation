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
  listings: "staycation-demo-listings"
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
const favorites = new Set(favoriteIndices);

function renderStays() {
  const destination = searchDestination.trim().toLocaleLowerCase();
  const visible = stays.filter((stay) => {
    const matchesType = selectedType === "all" || stay.type === selectedType;
    const matchesDestination = !destination || `${stay.name} ${stay.place} ${stay.type}`.toLocaleLowerCase().includes(destination);
    return matchesType && matchesDestination;
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
  resultsCount.textContent = searchDestination
    ? `${visible.length} ${visible.length === 1 ? "stay" : "stays"} for “${searchDestination}”`
    : `${visible.length} thoughtful places, picked for you`;
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
      <div class="dashboard-heading"><h3>Your trips</h3><span>0</span></div>
      <div class="dashboard-empty"><strong>No trips booked yet.</strong><span>Reservations are not enabled in this preview.</span></div>
    </section>`;
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
    <button class="modal-action" type="button" id="request-booking">Request to book <span aria-hidden="true">→</span></button>`;
  modal.showModal();
  document.querySelector("#request-booking").addEventListener("click", () => {
    modal.close();
    showToast("Booking and secure payments are planned for the next build.");
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
  renderStays();
  document.querySelector("#stays").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#clear-search").addEventListener("click", () => {
  document.querySelector("#destination").value = "";
  searchDestination = "";
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
    } else {
      demoProfile = null;
    }
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
