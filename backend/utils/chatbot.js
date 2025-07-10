const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

// Define model directory path
const MODEL_DIR = path.join(__dirname, '..', 'model');

// Property search related keywords
const PROPERTY_SEARCH_KEYWORDS = [
    // Action words
    'want', 'looking', 'search', 'find', 'need', 'show', 'get', 'see', 'view',
    
    // Property types
    'house', 'apartment', 'flat', 'property', 'home', 'residence', 'unit', 'space',
    
    // Room specifications
    'bhk', 'bedroom', 'room', 'studio', '1bhk', '2bhk', '3bhk', '4bhk', '5bhk',
    '1bed', '2bed', '3bed', '4bed', '5bed', '1bedroom', '2bedroom', '3bedroom',
    
    // Location indicators
    'in', 'at', 'near', 'around', 'close to', 'within',
    
    // Property features
    'furnished', 'unfurnished', 'semi-furnished', 'parking', 'balcony', 'garden',
    'pool', 'gym', 'lift', 'security', 'pet-friendly',
    
    // Price related
    'budget', 'price', 'rent', 'cost', 'affordable', 'cheap', 'expensive',
    
    // Time related
    'available', 'immediate', 'ready', 'vacant'
];


const INTENT_PATTERNS = {
    // Property Listing (intent_id: 1)
    1: [
        /(?:want|need|looking) to (?:list|post|add|put) (?:my|our|the) (?:property|house|apartment|flat|room)/i,
        /(?:how|what) to (?:list|post|add|put) (?:my|our|the) (?:property|house|apartment|flat|room)/i,
        /(?:list|post|add|put) (?:my|our|the) (?:property|house|apartment|flat|room)/i,
        /(?:advertise|promote) (?:my|our|the) (?:property|house|apartment|flat|room)/i
    ],
    
    // Property Search (intent_id: 2)
    2: [
        // BHK specific patterns
        /(?:want|need|looking) (?:for|to find)? (?:a|an|the)? (\d+)(?:bhk|bedroom|bed) (?:house|apartment|flat|property)/i,
        /(?:find|search|show) (?:me|us)? (?:a|an|the)? (\d+)(?:bhk|bedroom|bed) (?:house|apartment|flat|property)/i,
        /(?:looking|searching) (?:for|to find)? (?:a|an|the)? (\d+)(?:bhk|bedroom|bed) (?:house|apartment|flat|property)/i,
        
        // Location specific patterns
        /(?:want|need|looking) (?:for|to find)? (?:a|an|the)? (?:house|apartment|flat|property) (?:in|at|near) ([A-Za-z\s]+)/i,
        /(?:find|search|show) (?:me|us)? (?:a|an|the)? (?:house|apartment|flat|property) (?:in|at|near) ([A-Za-z\s]+)/i,
        
        // General property search patterns
        /(?:want|need|looking) (?:for|to find) (?:a|an|the) (?:property|house|apartment|flat|room)/i,
        /(?:find|search|show) (?:me|us) (?:a|an|the) (?:property|house|apartment|flat|room)/i,
        /(?:looking|searching) (?:for|to find) (?:a|an|the) (?:property|house|apartment|flat|room)/i,
        /(?:need|want) (?:a|an|the) (?:property|house|apartment|flat|room)/i
    ],
    
    // Contact Support (intent_id: 3)
    3: [
        /(?:how|what) to (?:contact|reach|get in touch with) (?:support|help|customer service)/i,
        /(?:need|want) to (?:contact|reach|get in touch with) (?:support|help|customer service)/i,
        /(?:contact|reach|get in touch with) (?:support|help|customer service)/i,
        /(?:call|phone|email) (?:support|help|customer service)/i
    ],
    
    // Favorites (intent_id: 4)
    4: [
        /(?:where|how) to (?:find|see|view) (?:my|our) (?:favorites|saved|bookmarked) (?:properties|listings)/i,
        /(?:show|display) (?:my|our) (?:favorites|saved|bookmarked) (?:properties|listings)/i,
        /(?:access|view) (?:my|our) (?:favorites|saved|bookmarked) (?:properties|listings)/i,
        /(?:favorites|saved|bookmarked) (?:properties|listings)/i
    ],
    
    // Callback Request (intent_id: 0)
    0: [
        /(?:want|need) (?:a|to get) (?:callback|call back|phone call)/i,
        /(?:please|can you) (?:call|ring) (?:me|us) (?:back|at)/i,
        /(?:request|ask for) (?:a|to get) (?:callback|call back|phone call)/i,
        /(?:schedule|arrange) (?:a|to get) (?:callback|call back|phone call)/i
    ]
};


let vocabulary, modelParams, dataset, fuzzyDataset;

try {
    vocabulary = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'vocabulary.json'), 'utf8'));
    modelParams = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'model_params.json'), 'utf8'));
    
    
    dataset = fs.readFileSync(path.join(MODEL_DIR, 'dataset.csv'), 'utf8')
        .split('\n')
        .slice(1) 
        .filter(line => line.trim()) 
        .map(line => {
            const [text, label] = line.split(',').map(item => item.trim());
            return { text, label };
        });

    
    fuzzyDataset = fs.readFileSync(path.join(MODEL_DIR, 'fuzzy_search_dataset.csv'), 'utf8')
        .split('\n')
        .slice(1) 
        .filter(line => line.trim()) 
        .map(line => {
            const [text, label] = line.split(',').map(item => item.trim());
            return { text, label };
        });
} catch (error) {
    console.error('Error loading model files:', error);
    throw new Error('Failed to load model files. Please ensure all required files are present in the model directory.');
}


const fuseOptions = {
    keys: ['text'],
    threshold: 0.4,
    includeScore: true
};


function preprocessText(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input text');
    }
    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')  
        .replace(/\s+/g, ' ')      
        .trim();                   
}


function textToVector(text, vocabulary) {
    const words = preprocessText(text).split(' ');
    const vector = new Array(Object.keys(vocabulary).length).fill(0);
    
    words.forEach(word => {
        if (vocabulary[word] !== undefined) {
            vector[vocabulary[word]] += 1; 
        }
    });
    
    return vector;
}


function calculateTfIdf(vector, vocabularySize) {
    const nonZeroCount = vector.filter(x => x > 0).length;
    return vector.map(count => count > 0 ? 1 + Math.log(count) : 0);
}


function predict(text) {
    try {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input text');
        }

        
        const vector = textToVector(text, vocabulary);
        
        
        const tfidfVector = calculateTfIdf(vector, vector.length);
        
        
        const scores = modelParams.classes.map((classId, classIndex) => {
            let score = modelParams.intercept[classIndex];
            
            for (let i = 0; i < tfidfVector.length; i++) {
                score += tfidfVector[i] * modelParams.coefficients[classIndex][i];
            }
            
            return {
                class: classId,
                score: score
            };
        });
        
        scores.sort((a, b) => b.score - a.score);
        
        const confidence = Math.exp(scores[0].score) / scores.reduce((sum, item) => sum + Math.exp(item.score), 0);
        
        
        if (confidence < 0.70) {
            
            for (const [intentId, patterns] of Object.entries(INTENT_PATTERNS)) {
                if (patterns.some(pattern => pattern.test(text))) {
                    return {
                        predictedClass: intentId,
                        confidence: 0.8, 
                        allScores: scores,
                        usedPatternMatch: true
                    };
                }
            }
            
            
            const fuse = new Fuse(fuzzyDataset, fuseOptions);
            const fuzzyResults = fuse.search(text);
            
            if (fuzzyResults.length > 0) {
                const bestMatch = fuzzyResults[0];
                console.log('[DEBUG] Fuzzy search used. Best match:', bestMatch.item.text, '| Label:', bestMatch.item.label, '| Score:', bestMatch.score);
                
                if (bestMatch.score === 1) {
                    return {
                        predictedClass: 'can you rephrase the sentence',
                        confidence: 0,
                        allScores: scores,
                        usedFuzzySearch: true
                    };
                }
                return {
                    predictedClass: bestMatch.item.label,
                    confidence: 1 - bestMatch.score,
                    allScores: scores,
                    usedFuzzySearch: true
                };
            }
        }
        
        return {
            predictedClass: scores[0].class,
            confidence: confidence,
            allScores: scores,
            usedPatternMatch: false,
            usedFuzzySearch: false
        };
    } catch (error) {
        console.error('Error in prediction:', error);
        throw new Error('Failed to process the input text');
    }
}

module.exports = {
    predict
}; 