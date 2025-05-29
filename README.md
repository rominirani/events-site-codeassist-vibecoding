# Event and Speakers Website

A simple web application to display and filter a list of event talks and speakers. The backend is built with Python and Flask, serving a JSON API. The frontend is built with HTML, CSS, and vanilla JavaScript to consume the API and render the information dynamically.

Note: This entire site was built using Code Assist extension in VS Code. I used the Google Docs tool in Code Assist, to provide a requirements document that described this functionality that I wanted to build. Once it got that, I asked it to help me to code it out step by step. 

## Table of Contents

1.  [Tech Stack](#tech-stack)
2.  [Project Structure](#project-structure)
3.  [Backend API Endpoints](#backend-api-endpoints)
4.  [Frontend Functionality](#frontend-functionality)
5.  [Setup and Running Instructions](#setup-and-running-instructions)

## Tech Stack

*   **Backend**:
    *   Python 3.x
    *   Flask (for creating the web server and API)
*   **Frontend**:
    *   HTML
    *   CSS
    *   JavaScript (vanilla, for DOM manipulation and API calls)
*   **Data Storage**:
    *   `data.json` (a local JSON file acting as a simple database)

## Project Structure

```
event-speaker-website/
├── static/
│   ├── css/
│   │   └── style.css       # Styles for the frontend
│   └── js/
│       └── script.js       # JavaScript logic for frontend interactions
├── app.py                  # Flask backend application (API and serving HTML)
├── data.json               # Sample data for talks and speakers
├── index.html              # Main HTML page for the frontend
└── README.md               # This file
```

## Backend API Endpoints

The backend API is served by the Flask application (`app.py`). All API endpoints are prefixed with `/api`.

### 1. Root API Info

*   **Endpoint**: `GET /api/`
*   **Description**: Provides a welcome message and a list of available API resources.
*   **Response Example (200 OK)**:
    ```json
    {
      "message": "Welcome to the Event and Speakers API!",
      "resources": {
        "all_talks": "/api/talks",
        "talk_by_id": "/api/talks/id/<talk_id>",
        "talks_by_category": "/api/talks/category/<category_name>",
        "talks_by_speaker": "/api/talks/speaker?name=<speaker_name_query>",
        "search_talks_by_title": "/api/talks/search?title=<title_query>",
        "all_categories": "/api/categories",
        "all_speakers": "/api/speakers"
      },
      "version": "1.0.0"
    }
    ```

### 2. Get All Talks

*   **Endpoint**: `GET /api/talks`
*   **Description**: Retrieves a list of all talks.
*   **Response Example (200 OK)**:
    ```json
    [
      {
        "id": "unique-uuid-1",
        "title": "Introduction to AI Agents",
        "speakers": [{"firstName": "Alice", "lastName": "Wonderland"}, {"firstName": "Bob", "lastName": "The Builder"}],
        "categories": ["AI", "Agents", "Future Tech"],
        "summary": "A comprehensive overview...",
        "duration": 60
      }
      // ... more talks
    ]
    ```

### 3. Get Talks by Category

*   **Endpoint**: `GET /api/talks/category/<category_name>`
*   **Description**: Retrieves talks filtered by a specific category name (case-insensitive).
*   **Path Parameter**: `category_name` (string) - e.g., `AI`, `Java`
*   **Response Example (200 OK)**: JSON array of talk objects matching the category.
*   **Error Response (404 Not Found)**: If no talks are found for the category.
    ```json
    { "message": "No talks found for category: <category_name>" }
    ```

### 4. Get Talks by Speaker Name

*   **Endpoint**: `GET /api/talks/speaker?name=<speaker_name_query>`
*   **Description**: Retrieves talks by speakers whose first name, last name, or full name partially and case-insensitively matches the query.
*   **Query Parameter**: `name` (string) - e.g., `Alice`, `Xavier`
*   **Response Example (200 OK)**: JSON array of talk objects.
*   **Error Response (400 Bad Request)**: If the `name` query parameter is missing.
    ```json
    { "message": "Please provide a 'name' query parameter for the speaker." }
    ```
*   **Error Response (404 Not Found)**: If no talks are found for the speaker query.
    ```json
    { "message": "No talks found for speaker containing: <speaker_name_query>" }
    ```

### 5. Search Talks by Title

*   **Endpoint**: `GET /api/talks/search?title=<title_query>`
*   **Description**: Retrieves talks whose title partially and case-insensitively matches the query.
*   **Query Parameter**: `title` (string) - e.g., `Introduction`, `Java`
*   **Response Example (200 OK)**: JSON array of talk objects.
*   **Error Response (400 Bad Request)**: If the `title` query parameter is missing.
    ```json
    { "message": "Please provide a 'title' query parameter to search." }
    ```
*   **Error Response (404 Not Found)**: If no talks are found with the matching title.
    ```json
    { "message": "No talks found with title containing: '<title_query>'" }
    ```

### 6. Get Talk by ID

*   **Endpoint**: `GET /api/talks/id/<talk_id>`
*   **Description**: Retrieves a specific talk by its unique ID.
*   **Path Parameter**: `talk_id` (string) - e.g., `unique-uuid-1`
*   **Response Example (200 OK)**: JSON object of the talk.
*   **Error Response (404 Not Found)**: If the talk ID is not found.
    ```json
    { "message": "Talk with ID '<talk_id>' not found." }
    ```

### 7. Get All Unique Categories

*   **Endpoint**: `GET /api/categories`
*   **Description**: Retrieves a sorted list of all unique category names from the talks data.
*   **Response Example (200 OK)**:
    ```json
    ["AI", "Agents", "Concurrency", "Flask", "Future Tech", "Java", "Python", "Scalability", "Software Development", "Web Development"]
    ```

### 8. Get All Unique Speakers

*   **Endpoint**: `GET /api/speakers`
*   **Description**: Retrieves a sorted list of all unique speaker objects (firstName, lastName). Sorted by last name, then first name (case-insensitive).
*   **Response Example (200 OK)**:
    ```json
    [
      {"firstName": "Bob", "lastName": "The Builder"},
      {"firstName": "Diana", "lastName": "Prince"},
      {"firstName": "Alice", "lastName": "Wonderland"},
      {"firstName": "Charles", "lastName": "Xavier"}
    ]
    ```

## Frontend Functionality

The frontend is served via `index.html` and uses `static/js/script.js` for dynamic interactions.

*   **Initial Load**: Displays all talks fetched from `/api/talks`.
*   **Talk Display**: Each talk is rendered as a card showing its title, ID, speakers, categories, duration, and summary.
*   **Category Filtering**:
    *   A dropdown menu (`#category-select`) is populated with unique categories from `/api/categories`.
    *   Selecting a category filters the talks by calling `/api/talks/category/<category_name>`.
    *   The "All Categories" option reloads all talks.
    *   When a category is selected, the title search input is cleared.
*   **Title Search**:
    *   An input field (`#title-search`) and a "Search" button allow users to search talks by title.
    *   Search is triggered by button click or pressing "Enter".
    *   Calls `/api/talks/search?title=<title_query>`.
    *   When a title search is performed, the category filter is reset to "All Categories".
    *   If the search term is cleared, all talks are reloaded, and the category filter is reset.

## Setup and Running Instructions

1.  **Prerequisites**:
    *   Python 3.x
    *   pip (Python package installer)

2.  **Clone the Repository** (or set up the files manually):
    If this were a Git repository, you would clone it. For now, ensure all files (`app.py`, `index.html`, `data.json`, and the `static` directory with its contents) are in the correct structure as outlined above.

3.  **Install Dependencies**:
    The only external Python library required is Flask. Install it using pip:
    ```bash
    pip install Flask
    ```

4.  **Prepare Data**:
    Ensure the `data.json` file is present in the root directory of the project and contains the talk data in the expected JSON format.

5.  **Run the Application**:
    Navigate to the project's root directory in your terminal and run the Flask application:
    ```bash
    python app.py
    ```
    You should see output indicating the server is running, typically on `http://127.0.0.1:8080/`.

6.  **Access the Website**:
    Open your web browser and navigate to `http://127.0.0.1:8080/`.

You should now see the Event and Speakers website, be able to view talks, filter by category, and search by title.
