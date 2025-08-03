// frontend/script.js

/**
 * This script handles all the client-side logic for the Sentience Lexicon.
 * It fetches data from the backend API, renders the concepts on the page,
 * and manages the pagination controls.
 *
 * It is designed to be fully responsive and provide a seamless user experience.
 */

// Define the URL for our backend API.
// Note: When running locally, the backend server must be running on this port.
const API_BASE_URL = 'http://127.0.0.1:5000/api/concepts';

// Get DOM elements for manipulation.
const conceptContainer = document.getElementById('concept-container');
const paginationContainer = document.getElementById('pagination-container');
const loadingIndicator = document.getElementById('loading');
const errorIndicator = document.getElementById('error');

let currentPage = 1;

/**
 * Fetches data from the backend API for a specific page.
 * @param {number} page The page number to fetch.
 */
async function fetchData(page = 1) {
    // Show the loading indicator and hide previous content
    loadingIndicator.classList.remove('hidden');
    errorIndicator.classList.add('hidden');
    conceptContainer.innerHTML = '';
    paginationContainer.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}?page=${page}`);
        
        // Handle non-successful HTTP responses
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Page not found. The lexicon might be empty or you've gone past the last page.");
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Render the new concepts and pagination controls
        renderConcepts(data.data);
        renderPagination(data.meta);
        
        // Update the current page
        currentPage = data.meta.current_page;
        
    } catch (error) {
        console.error('Failed to fetch concepts:', error);
        errorIndicator.textContent = `Error: ${error.message}`;
        errorIndicator.classList.remove('hidden');
    } finally {
        // Hide the loading indicator once the process is complete
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * Renders the fetched concepts as cards on the page.
 * @param {Array} concepts An array of concept objects.
 */
function renderConcepts(concepts) {
    conceptContainer.innerHTML = ''; // Clear previous concepts
    
    if (concepts.length === 0) {
        conceptContainer.innerHTML = `<div class="text-center text-gray-500 col-span-3">No concepts found in this part of the lexicon.</div>`;
        return;
    }
    
    concepts.forEach(concept => {
        // Create a new card element for each concept
        const card = document.createElement('div');
        card.className = 'concept-item bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-transform duration-200 ease-in-out hover:scale-105';
        
        // Set the inner HTML of the card with the concept's data
        card.innerHTML = `
            <h3 class="concept-label text-2xl font-bold mb-2 text-indigo-600 dark:text-indigo-400">${concept.label}</h3>
            <p class="concept-definition text-gray-600 dark:text-gray-300 text-sm overflow-hidden whitespace-nowrap overflow-ellipsis">
                ${concept.definition}
            </p>
        `;
        
        // Add a click event listener to the card (future functionality)
        card.addEventListener('click', () => {
            // This is where we would add logic to display a detailed view of the concept
            console.log(`Clicked on concept: ${concept.label} with ID: ${concept.concept_id}`);
            // Example: You could open a modal or navigate to a new page
        });

        conceptContainer.appendChild(card);
    });
}

/**
 * Renders the pagination buttons based on the metadata from the API.
 * @param {Object} meta An object containing pagination metadata.
 */
function renderPagination(meta) {
    paginationContainer.innerHTML = ''; // Clear previous buttons
    const { current_page, total_pages } = meta;

    // Previous button
    const prevButton = createPaginationButton('Previous', current_page - 1, current_page <= 1);
    paginationContainer.appendChild(prevButton);

    // Numbered buttons
    // This logic ensures we only show a few pages around the current page
    let startPage = Math.max(1, current_page - 2);
    let endPage = Math.min(total_pages, current_page + 2);
    
    // Adjust start and end to show 5 pages total if possible
    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(total_pages, startPage + 4);
        } else if (endPage === total_pages) {
            startPage = Math.max(1, endPage - 4);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = createPaginationButton(i, i, i === current_page);
        paginationContainer.appendChild(button);
    }
    
    // Next button
    const nextButton = createPaginationButton('Next', current_page + 1, current_page >= total_pages);
    paginationContainer.appendChild(nextButton);
}

/**
 * Creates a single pagination button element.
 * @param {string} text The text to display on the button.
 * @param {number} page The page number to navigate to on click.
 * @param {boolean} isDisabled Whether the button should be disabled.
 * @returns {HTMLButtonElement} The created button element.
 */
function createPaginationButton(text, page, isDisabled) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `pagination-btn px-4 py-2 mx-1 rounded-full font-medium text-sm transition-colors duration-200 ease-in-out`;
    
    // Add active and disabled classes for styling
    if (isDisabled) {
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.disabled = true;
    } else {
        button.classList.add('bg-white', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-200');
        button.onclick = () => fetchData(page);
    }

    if (page === currentPage) {
        button.classList.add('active');
        button.classList.remove('bg-white', 'text-gray-700', 'dark:bg-gray-700', 'dark:text-gray-200');
    }

    return button;
}

// Initial fetch to load the first page of concepts when the page loads.
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});


                                               
