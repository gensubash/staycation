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
const favorites = new Set();
let toastTimer;

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

function openHostModal() {
  modalContent.innerHTML = `
    <p class="modal-kicker">A place of your own</p>
    <h2 id="modal-title">Make room for good things.</h2>
    <p>Staycation is a thoughtful home for New Hampshire hosts. Start with your place, and we’ll help you take it from there.</p>
    <div class="host-steps">
      <div class="host-step"><strong>01 &nbsp; Tell us about your place</strong><span>Share the kind of stay you’d love to offer.</span></div>
      <div class="host-step"><strong>02 &nbsp; Create your listing</strong><span>Add a few photos, details, and a nightly rate.</span></div>
      <div class="host-step"><strong>03 &nbsp; Welcome your first guests</strong><span>Manage requests and stays from your host space.</span></div>
    </div>
    <button class="modal-action" type="button" id="host-start">Start a listing <span aria-hidden="true">→</span></button>`;
  modal.showModal();
  document.querySelector("#host-start").addEventListener("click", () => {
    modal.close();
    showToast("Host sign-up is part of the next Staycation build.");
  });
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
      favorites.delete(index);
      showToast("Removed from your saved stays.");
    } else {
      favorites.add(index);
      showToast("Saved for your next getaway.");
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
document.querySelector("#profile-button").addEventListener("click", () => showToast("Guest and host accounts are part of the next Staycation build."));
document.querySelector("#map-toggle").addEventListener("click", () => showToast("An interactive map is planned for the next build."));
document.querySelector("#modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

renderStays();
