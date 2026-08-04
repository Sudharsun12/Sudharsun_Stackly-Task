/**
 * Task 8: Country Explorer — Application Logic
 * Pure JavaScript (ES6+) with REST API Integration & Fallback Resilience
 */

// Application State
let allCountries = [];
let filteredCountries = [];
let favourites = new Set(JSON.parse(localStorage.getItem('country_explorer_favs') || '[]'));
let activeTab = 'all'; // 'all' | 'fav'

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear');
const regionSelect = document.getElementById('region-select');
const sortSelect = document.getElementById('sort-select');
const tabAllBtn = document.getElementById('tab-all');
const tabFavBtn = document.getElementById('tab-fav');
const favCountSpan = document.getElementById('fav-count');
const resultsCountBadge = document.getElementById('results-count');
const resetFiltersBtn = document.getElementById('reset-filters');
const themeToggleBtn = document.getElementById('theme-toggle');

// State Containers
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');
const countryGrid = document.getElementById('country-grid');
const retryBtn = document.getElementById('retry-btn');
const emptyResetBtn = document.getElementById('empty-reset-btn');

// Detail Modal Elements
const detailModal = document.getElementById('detail-modal');
const modalBackBtn = document.getElementById('modal-back-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalFlag = document.getElementById('modal-flag');
const modalCountryName = document.getElementById('modal-country-name');
const modalOfficialName = document.getElementById('modal-official-name');
const modalCapital = document.getElementById('modal-capital');
const modalRegion = document.getElementById('modal-region');
const modalSubregion = document.getElementById('modal-subregion');
const modalPopulation = document.getElementById('modal-population');
const modalArea = document.getElementById('modal-area');
const modalLanguages = document.getElementById('modal-languages');
const modalCurrencies = document.getElementById('modal-currencies');
const modalFavBtn = document.getElementById('modal-fav-btn');

let currentModalCountry = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateFavBadge();
  setupEventListeners();
  fetchCountries();
});

// Theme Initialization
function initTheme() {
  const savedTheme = localStorage.getItem('country_explorer_theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
    updateThemeIcon(true);
  } else {
    document.body.classList.remove('dark-theme');
    updateThemeIcon(false);
  }
}

function updateThemeIcon(isDark) {
  const themeIcon = themeToggleBtn.querySelector('.theme-icon');
  const themeText = themeToggleBtn.querySelector('.theme-text');
  if (isDark) {
    themeIcon.textContent = '☀️';
    themeText.textContent = 'Light Mode';
  } else {
    themeIcon.textContent = '🌙';
    themeText.textContent = 'Dark Mode';
  }
}

// Fetch Countries with Automatic Resilient Fallback
async function fetchCountries() {
  showState('loading');

  try {
    // 1. Attempt primary REST Countries API
    const response = await fetch('https://restcountries.com/v3.1/all');
    
    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // Check if the response contains deprecated payload object instead of country list array
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('REST Countries endpoint returned non-array payload');
    }

    allCountries = normalizeData(data);
    showState('grid');
    applyFiltersAndRender();
  } catch (primaryError) {
    console.warn('Primary REST Countries API failed or deprecated. Switching to bundled local fallback:', primaryError.message);
    
    // 2. Resilient Fallback: Load bundled fallback dataset (in-memory window.COUNTRIES_DATA or fetch)
    try {
      let fallbackData = null;
      if (window.COUNTRIES_DATA && Array.isArray(window.COUNTRIES_DATA)) {
        fallbackData = window.COUNTRIES_DATA;
      } else {
        const fallbackResponse = await fetch('./countries.json');
        if (!fallbackResponse.ok) {
          throw new Error('Local fallback JSON load failed');
        }
        fallbackData = await fallbackResponse.json();
      }

      allCountries = normalizeData(fallbackData);
      showState('grid');
      applyFiltersAndRender();
    } catch (fallbackError) {
      console.error('Both primary API and fallback dataset failed:', fallbackError);
      showState('error');
    }
  }
}

// Data Normalizer (ensures uniform access to name, capital, population, flags, etc.)
function normalizeData(rawData) {
  return rawData.map(c => {
    const commonName = c.name?.common || c.name?.official || 'Unknown Country';
    const officialName = c.name?.official || commonName;
    const countryId = c.cca3 || c.cca2 || commonName;

    // Capital normalization
    let capitalStr = 'N/A';
    if (Array.isArray(c.capital) && c.capital.length > 0) {
      capitalStr = c.capital.join(', ');
    } else if (typeof c.capital === 'string') {
      capitalStr = c.capital;
    }

    // Flag URL normalization
    const flagUrl = c.flags?.png || c.flags?.svg || `https://flagcdn.com/w320/${(c.cca2 || 'xx').toLowerCase()}.png`;

    return {
      id: countryId,
      name: {
        common: commonName,
        official: officialName
      },
      capital: capitalStr,
      region: c.region || 'Unspecified',
      subregion: c.subregion || 'Unspecified',
      population: typeof c.population === 'number' ? c.population : 0,
      area: typeof c.area === 'number' ? c.area : null,
      flags: {
        png: flagUrl,
        alt: c.flags?.alt || `Flag of ${commonName}`
      },
      languages: c.languages || null,
      currencies: c.currencies || null
    };
  });
}

// UI State Switcher
function showState(state) {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  emptyState.classList.add('hidden');
  countryGrid.classList.add('hidden');

  if (state === 'loading') loadingState.classList.remove('hidden');
  else if (state === 'error') errorState.classList.remove('hidden');
  else if (state === 'empty') emptyState.classList.remove('hidden');
  else if (state === 'grid') countryGrid.classList.remove('hidden');
}

// Combined Search, Filter, Sort & Tab Renderer
function applyFiltersAndRender() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedRegion = regionSelect.value;
  const selectedSort = sortSelect.value;

  // Toggle clear search button visibility
  if (query.length > 0) searchClearBtn.classList.remove('hidden');
  else searchClearBtn.classList.add('hidden');

  // Check if filters are active to toggle Reset button
  const hasActiveFilters = query.length > 0 || selectedRegion !== 'All' || activeTab === 'fav';
  if (hasActiveFilters) resetFiltersBtn.classList.remove('hidden');
  else resetFiltersBtn.classList.add('hidden');

  // Filter Algorithm
  filteredCountries = allCountries.filter(country => {
    // Search match (Common or Official name)
    const matchesSearch = country.name.common.toLowerCase().includes(query) ||
                          country.name.official.toLowerCase().includes(query);

    // Region match
    const matchesRegion = selectedRegion === 'All' || country.region === selectedRegion;

    // Tab match
    const matchesTab = activeTab === 'all' || favourites.has(country.id);

    return matchesSearch && matchesRegion && matchesTab;
  });

  // Sorting Algorithm
  filteredCountries.sort((a, b) => {
    if (selectedSort === 'name-asc') {
      return a.name.common.localeCompare(b.name.common);
    } else if (selectedSort === 'name-desc') {
      return b.name.common.localeCompare(a.name.common);
    } else if (selectedSort === 'pop-desc') {
      return b.population - a.population;
    } else if (selectedSort === 'pop-asc') {
      return a.population - b.population;
    }
    return 0;
  });

  // Update Status Count Badge
  resultsCountBadge.textContent = `Showing ${filteredCountries.length} of ${allCountries.length} countries`;

  // Render Grid or Empty State
  if (filteredCountries.length === 0) {
    showState('empty');
  } else {
    showState('grid');
    renderGrid(filteredCountries);
  }
}

// DOM Card Grid Generator
function renderGrid(countries) {
  countryGrid.innerHTML = '';

  const fragment = document.createDocumentFragment();

  countries.forEach(country => {
    const isFav = favourites.has(country.id);
    
    // Format population with commas (e.g. 1,000,000)
    const formattedPopulation = country.population.toLocaleString('en-US');

    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${country.name.common} country card`);

    card.innerHTML = `
      <div class="card-flag-wrapper">
        <img src="${country.flags.png}" alt="${country.flags.alt}" class="card-flag" loading="lazy">
        <button class="btn-fav-card ${isFav ? 'is-fav' : ''}" data-id="${country.id}" aria-label="Favourite ${country.name.common}">
          ★
        </button>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(country.name.common)}</h3>
        <ul class="card-info-list">
          <li><strong>Population:</strong> <span>${formattedPopulation}</span></li>
          <li><strong>Region:</strong> <span>${escapeHTML(country.region)}</span></li>
          <li><strong>Capital:</strong> <span>${escapeHTML(country.capital)}</span></li>
        </ul>
      </div>
    `;

    // Click card to open Detail View
    card.addEventListener('click', (e) => {
      // Prevent opening modal if clicking favourite button
      if (e.target.closest('.btn-fav-card')) return;
      openDetailModal(country);
    });

    // Keyboard ENTER key on focused card
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        openDetailModal(country);
      }
    });

    // Favourite Button Click
    const favBtn = card.querySelector('.btn-fav-card');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavourite(country.id);
    });

    fragment.appendChild(card);
  });

  countryGrid.appendChild(fragment);
}

// Detail Modal Controller
function openDetailModal(country) {
  currentModalCountry = country;

  modalFlag.src = country.flags.png;
  modalFlag.alt = country.flags.alt;
  modalCountryName.textContent = country.name.common;
  modalOfficialName.textContent = country.name.official;
  modalCapital.textContent = country.capital;
  modalRegion.textContent = country.region;
  modalSubregion.textContent = country.subregion;
  
  // Formatted Population with commas
  modalPopulation.textContent = country.population.toLocaleString('en-US');

  // Formatted Area
  modalArea.textContent = country.area ? `${country.area.toLocaleString('en-US')} km²` : 'N/A';

  // Languages Formatting
  if (country.languages && Object.keys(country.languages).length > 0) {
    modalLanguages.textContent = Object.values(country.languages).join(', ');
  } else {
    modalLanguages.textContent = 'N/A';
  }

  // Currencies Formatting
  if (country.currencies && Object.keys(country.currencies).length > 0) {
    const currList = Object.values(country.currencies)
      .map(c => c.symbol ? `${c.name} (${c.symbol})` : c.name)
      .join(', ');
    modalCurrencies.textContent = currList;
  } else {
    modalCurrencies.textContent = 'N/A';
  }

  // Favourite Button State
  updateModalFavBtnState();

  // Show Modal
  detailModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent page scroll behind modal
}

function closeDetailModal() {
  detailModal.classList.add('hidden');
  document.body.style.overflow = '';
  currentModalCountry = null;
}

function updateModalFavBtnState() {
  if (!currentModalCountry) return;
  const isFav = favourites.has(currentModalCountry.id);
  if (isFav) {
    modalFavBtn.classList.add('is-fav');
  } else {
    modalFavBtn.classList.remove('is-fav');
  }
}

// Favourite Toggle Handler
function toggleFavourite(countryId) {
  if (favourites.has(countryId)) {
    favourites.delete(countryId);
  } else {
    favourites.add(countryId);
  }

  // Save to localStorage
  localStorage.setItem('country_explorer_favs', JSON.stringify(Array.from(favourites)));

  updateFavBadge();
  updateModalFavBtnState();
  applyFiltersAndRender();
}

function updateFavBadge() {
  favCountSpan.textContent = favourites.size;
}

// Helper: Escape HTML strings to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Event Listeners Setup
function setupEventListeners() {
  // Search Input (Real-time input event)
  searchInput.addEventListener('input', () => {
    applyFiltersAndRender();
  });

  // Search Clear Button
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    applyFiltersAndRender();
    searchInput.focus();
  });

  // Region Filter Select
  regionSelect.addEventListener('change', () => {
    applyFiltersAndRender();
  });

  // Sort Select
  sortSelect.addEventListener('change', () => {
    applyFiltersAndRender();
  });

  // Filter Tabs
  tabAllBtn.addEventListener('click', () => {
    activeTab = 'all';
    tabAllBtn.classList.add('active');
    tabAllBtn.setAttribute('aria-selected', 'true');
    tabFavBtn.classList.remove('active');
    tabFavBtn.setAttribute('aria-selected', 'false');
    applyFiltersAndRender();
  });

  tabFavBtn.addEventListener('click', () => {
    activeTab = 'fav';
    tabFavBtn.classList.add('active');
    tabFavBtn.setAttribute('aria-selected', 'true');
    tabAllBtn.classList.remove('active');
    tabAllBtn.setAttribute('aria-selected', 'false');
    applyFiltersAndRender();
  });

  // Reset Filters Buttons
  const resetHandler = () => {
    searchInput.value = '';
    regionSelect.value = 'All';
    sortSelect.value = 'name-asc';
    activeTab = 'all';
    tabAllBtn.classList.add('active');
    tabFavBtn.classList.remove('active');
    applyFiltersAndRender();
  };

  resetFiltersBtn.addEventListener('click', resetHandler);
  emptyResetBtn.addEventListener('click', resetHandler);

  // Retry Button on API Error
  retryBtn.addEventListener('click', () => {
    fetchCountries();
  });

  // Theme Toggle Button
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('country_explorer_theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
  });

  // Modal Close & Back Actions
  modalBackBtn.addEventListener('click', closeDetailModal);
  modalCloseBtn.addEventListener('click', closeDetailModal);

  // Modal Backdrop Click
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      closeDetailModal();
    }
  });

  // Modal Favourite Toggle Button
  modalFavBtn.addEventListener('click', () => {
    if (currentModalCountry) {
      toggleFavourite(currentModalCountry.id);
    }
  });

  // Keyboard ESC to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
      closeDetailModal();
    }
  });
}
