// static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayTalks(); // Load all talks initially
    populateCategoryFilter(); // Populate the category filter dropdown

    // Event listener for the category select dropdown
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', (event) => {
            const selectedCategory = event.target.value;
            // When a category is selected, clear the title search input
            const titleSearchInput = document.getElementById('title-search');
            if (titleSearchInput) {
                titleSearchInput.value = '';
            }
            if (selectedCategory) {
                // Fetch talks for the selected category
                fetchAndDisplayTalks(`/api/talks/category/${encodeURIComponent(selectedCategory)}`);
            } else {
                // If "All Categories" is selected, fetch all talks
                fetchAndDisplayTalks('/api/talks');
            }
        });
    }

    // Event listener for the title search button
    const searchButton = document.getElementById('search-button');
    const titleSearchInput = document.getElementById('title-search');

    if (searchButton && titleSearchInput) {
        searchButton.addEventListener('click', () => {
            performTitleSearch(titleSearchInput.value);
        });

        // Optional: Allow search on Enter key press in the input field
        titleSearchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performTitleSearch(titleSearchInput.value);
            }
        });
    }
});

function performTitleSearch(searchTerm) {
    const trimmedSearchTerm = searchTerm.trim();
    const categorySelect = document.getElementById('category-select');

    if (trimmedSearchTerm) {
        fetchAndDisplayTalks(`/api/talks/search?title=${encodeURIComponent(trimmedSearchTerm)}`);
        // Reset category filter when a title search is performed
        if (categorySelect) {
            categorySelect.value = ""; 
        }
    } else {
        // If search term is empty, show all talks (or you could show a message)
        fetchAndDisplayTalks('/api/talks');
        // Also ensure category filter is reset if search is cleared
        if (categorySelect) {
            categorySelect.value = ""; 
        }
    }
}
async function fetchAndDisplayTalks(url = '/api/talks') {
    const talksContainer = document.getElementById('talks-container');
    talksContainer.innerHTML = '<p>Loading talks...</p>'; // Show loading message each time

    try {
        const response = await fetch(url); 
        if (!response.ok) {
            const errorData = await response.json().catch(() => null); // Try to parse error response
            const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }
        const talks = await response.json();

        if (!Array.isArray(talks) || talks.length === 0) { // Check if talks is an array
            talksContainer.innerHTML = '<p>No talks available for the current selection.</p>';
            return;
        }

        talksContainer.innerHTML = ''; // Clear loading message or previous talks
        talks.forEach(talk => {
            const talkCard = document.createElement('div');
            talkCard.className = 'talk-card';
            
            // Handle cases where speakers or categories might be missing or empty
            let speakersHtml = 'N/A';
            if (talk.speakers && talk.speakers.length > 0) {
                speakersHtml = talk.speakers.map(s => `${s.firstName || ''} ${s.lastName || ''}`.trim()).join(', ');
            }

            let categoriesHtml = 'N/A';
            if (talk.categories && talk.categories.length > 0) {
                categoriesHtml = talk.categories.join(', ');
            }

            talkCard.innerHTML = `
                <h3>${talk.title || 'Untitled Talk'}</h3>
                <p><strong>ID:</strong> ${talk.id || 'N/A'}</p>
                <p><strong>Speakers:</strong> ${speakersHtml}</p>
                <p><strong>Categories:</strong> ${categoriesHtml}</p>
                <p><strong>Duration:</strong> ${talk.duration !== undefined ? talk.duration + ' minutes' : 'N/A'}</p>
                <p><strong>Summary:</strong> ${talk.summary || 'No summary available.'}</p>
            `;
            talksContainer.appendChild(talkCard);
        });

    } catch (error) {
        talksContainer.innerHTML = `<p>Error loading talks: ${error.message}. Make sure the backend API is running and the URL is correct.</p>`;
        console.error('Error fetching talks:', error);
    }
}

async function populateCategoryFilter() {
    const categorySelect = document.getElementById('category-select');
    if (!categorySelect) return; // Guard clause if element doesn't exist

    try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categories = await response.json();

        if (Array.isArray(categories)) {
            // Clear previous options except the first "All Categories" one
            while (categorySelect.options.length > 1) {
                categorySelect.remove(1);
            }
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Error loading categories";
        option.disabled = true;
        // Ensure it's added after clearing or as the only other option if "All Categories" is present
        if (categorySelect.options.length <=1) {
            categorySelect.appendChild(option);
        } else {
            // If "All Categories" is there, and we want to add error as the next one
            // This part might need adjustment based on desired behavior for error display
        }
    }
}
