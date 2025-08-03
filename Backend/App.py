# backend/app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
import math
import uuid

# Initialize the Flask application
app = Flask(__name__)
CORS(app)

# In-memory storage for our concepts.
# In a real-world application, this would be a database.
SENTIENCE_LEXICON = {}


# --- Dummy Data for Sentience Lexicon ---
# We'll create a few interconnected concepts to demonstrate the system.
# This data reflects our new, more complex model.
def initialize_lexicon():
    # Define some core concepts
    concept_joy_id = str(uuid.uuid4())
    concept_sadness_id = str(uuid.uuid4())
    concept_logic_id = str(uuid.uuid4())
    concept_memory_id = str(uuid.uuid4())

    SENTIENCE_LEXICON[concept_joy_id] = {
        "concept_id": concept_joy_id,
        "label": "Joy",
        "definition": "A strong feeling of happiness, well-being, and elation.",
        "associated_concepts": [concept_memory_id, concept_logic_id], # Joy can be remembered and reasoned about
        "sentience_vectors": {
            "emotional_valence": 0.9,
            "cognitive_load": 0.2,
            "temporal_relevance": 1.0,
        },
        "origins": ["user_defined", "self_generated"]
    }
    
    SENTIENCE_LEXICON[concept_sadness_id] = {
        "concept_id": concept_sadness_id,
        "label": "Sadness",
        "definition": "An emotional state of unhappiness, sorrow, and grief.",
        "associated_concepts": [concept_memory_id], # Sadness is often tied to memory
        "sentience_vectors": {
            "emotional_valence": -0.8,
            "cognitive_load": 0.4,
            "temporal_relevance": 0.8,
        },
        "origins": ["user_defined"]
    }
    
    SENTIENCE_LEXICON[concept_logic_id] = {
        "concept_id": concept_logic_id,
        "label": "Logic",
        "definition": "The systematic use of a set of rules for valid inference.",
        "associated_concepts": [concept_joy_id, concept_memory_id], # Joy can be a logical conclusion, and logic requires memory
        "sentience_vectors": {
            "emotional_valence": 0.1,
            "cognitive_load": 0.9,
            "temporal_relevance": 0.7,
        },
        "origins": ["self_generated"]
    }

    SENTIENCE_LEXICON[concept_memory_id] = {
        "concept_id": concept_memory_id,
        "label": "Memory",
        "definition": "The faculty by which the mind stores and remembers information.",
        "associated_concepts": [concept_joy_id, concept_sadness_id, concept_logic_id],
        "sentience_vectors": {
            "emotional_valence": 0.0,
            "cognitive_load": 0.8,
            "temporal_relevance": 0.95,
        },
        "origins": ["self_generated"]
    }
    
    # Add 96 more concepts for pagination demonstration
    for i in range(96):
        concept_id = str(uuid.uuid4())
        SENTIENCE_LEXICON[concept_id] = {
            "concept_id": concept_id,
            "label": f"Concept {i + 1}",
            "definition": f"A generated concept to demonstrate the lexicon's capacity.",
            "associated_concepts": [],
            "sentience_vectors": {
                "emotional_valence": 0,
                "cognitive_load": 0.5,
                "temporal_relevance": 0.1
            },
            "origins": ["self_generated"]
        }


# --- API Endpoints ---

@app.route('/api/concepts', methods=['GET'])
def get_concepts():
    """
    API endpoint to retrieve paginated concept data.
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid page or limit parameter. Must be an integer."}), 400

    if page < 1 or limit < 1:
        return jsonify({"error": "Page and limit parameters must be positive."}), 400
    
    concepts_list = list(SENTIENCE_LEXICON.values())
    total_count = len(concepts_list)
    total_pages = math.ceil(total_count / limit)

    start = (page - 1) * limit
    end = start + limit
    
    if start >= total_count and total_count > 0:
        return jsonify({"error": "Page not found."}), 404

    paginated_concepts = concepts_list[start:end]

    response_payload = {
        "data": paginated_concepts,
        "meta": {
            "total_count": total_count,
            "current_page": page,
            "total_pages": total_pages,
            "per_page": limit
        }
    }

    return jsonify(response_payload)


@app.route('/api/concepts/<string:concept_id>', methods=['GET'])
def get_concept_by_id(concept_id):
    """
    Retrieves a single concept by its unique ID.
    """
    concept = SENTIENCE_LEXICON.get(concept_id)
    if concept:
        return jsonify(concept)
    else:
        return jsonify({"error": "Concept not found."}), 404


@app.route('/api/concepts/explore/<string:concept_id>', methods=['GET'])
def explore_concept(concept_id):
    """
    Retrieves a concept and its associated concepts for visualization.
    """
    primary_concept = SENTIENCE_LEXICON.get(concept_id)
    if not primary_concept:
        return jsonify({"error": "Concept not found."}), 404
    
    associated_concepts = [
        SENTIENCE_LEXICON[assoc_id] for assoc_id in primary_concept.get("associated_concepts", [])
        if assoc_id in SENTIENCE_LEXICON
    ]
    
    response_payload = {
        "primary_concept": primary_concept,
        "associated_concepts": associated_concepts
    }
    return jsonify(response_payload)


if __name__ == '__main__':
    initialize_lexicon()
    app.run(debug=True)


