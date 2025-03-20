# preprocess.py - Mock preprocessing steps
def preprocess_ingredients(text):
    return text.lower().replace(',', '').split()  # Simple mock processing