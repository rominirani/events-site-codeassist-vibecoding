import json
from flask import Flask, jsonify, request, send_from_directory # Added send_from_directory
import os # Added os

app = Flask(__name__)

# Load data from JSON file
def load_talks_data():
    try:
        with open('data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("ERROR: data.json not found!")
        return []
    except json.JSONDecodeError:
        print("ERROR: data.json is not valid JSON!")
        return []

talks_data = load_talks_data()

@app.route('/api/', methods=['GET'])
def api_root():
    return jsonify({
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
    })

@app.route('/api/talks', methods=['GET'])
def get_all_talks():
    return jsonify(talks_data)

@app.route('/api/talks/category/<string:category_name>', methods=['GET'])
def get_talks_by_category(category_name):
    filtered_talks = [
        talk for talk in talks_data
        if category_name.lower() in [cat.lower() for cat in talk.get('categories', [])]
    ]
    if not filtered_talks:
        return jsonify({"message": f"No talks found for category: {category_name}"}), 404
    return jsonify(filtered_talks)

@app.route('/api/talks/speaker', methods=['GET'])
def get_talks_by_speaker():
    speaker_name_query = request.args.get('name', '').lower()
    if not speaker_name_query:
        return jsonify({"message": "Please provide a 'name' query parameter for the speaker."}), 400

    filtered_talks = []
    for talk in talks_data:
        for speaker in talk.get('speakers', []):
            full_name = f"{speaker.get('firstName', '').lower()} {speaker.get('lastName', '').lower()}"
            if speaker_name_query in speaker.get('firstName', '').lower() or \
               speaker_name_query in speaker.get('lastName', '').lower() or \
               speaker_name_query in full_name:
                filtered_talks.append(talk)
                break # Avoid adding the same talk multiple times if multiple speakers match
    if not filtered_talks:
        return jsonify({"message": f"No talks found for speaker containing: {speaker_name_query}"}), 404
    return jsonify(filtered_talks)

@app.route('/api/talks/search', methods=['GET'])
def search_talks_by_title():
    title_query = request.args.get('title', '').lower()
    if not title_query:
        return jsonify({"message": "Please provide a 'title' query parameter to search."}), 400

    filtered_talks = [
        talk for talk in talks_data
        if title_query in talk.get('title', '').lower()
    ]

    if not filtered_talks:
        return jsonify({"message": f"No talks found with title containing: '{title_query}'"}), 404
    return jsonify(filtered_talks)

@app.route('/api/talks/id/<string:talk_id>', methods=['GET'])
def get_talk_by_id(talk_id):
    for talk in talks_data:
        if talk.get('id') == talk_id:
            return jsonify(talk)
    return jsonify({"message": f"Talk with ID '{talk_id}' not found."}), 404

@app.route('/api/categories', methods=['GET'])
def get_all_categories():
    all_categories = set()
    for talk in talks_data:
        for category in talk.get('categories', []):
            all_categories.add(category)
    # Sort for consistent order, though not strictly necessary for functionality
    return jsonify(sorted(list(all_categories)))

@app.route('/api/speakers', methods=['GET'])
def get_all_speakers():
    unique_speakers_list = []
    # Use a set of tuples to track seen speakers (firstName, lastName) for case-insensitive uniqueness
    seen_speakers_tuples = set()

    for talk in talks_data:
        for speaker in talk.get('speakers', []):
            first_name = speaker.get('firstName', '')
            last_name = speaker.get('lastName', '')
            
            # Create a canonical representation for uniqueness checking (e.g., lowercase tuple)
            speaker_tuple = (first_name.lower(), last_name.lower())
            
            if speaker_tuple not in seen_speakers_tuples:
                seen_speakers_tuples.add(speaker_tuple)
                # Add the original speaker object (with original casing)
                unique_speakers_list.append({"firstName": first_name, "lastName": last_name})
                
    # Sort speakers by last name, then by first name (case-insensitive)
    unique_speakers_list.sort(key=lambda s: (s.get('lastName', '').lower(), s.get('firstName', '').lower()))
    
    return jsonify(unique_speakers_list)

@app.route('/')
def serve_index():
    # Serves index.html from the root directory
    # For production, static files are usually served by a web server like Nginx or from a CDN
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=8080)
