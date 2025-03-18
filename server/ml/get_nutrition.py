import requests

api_url = 'https://api.calorieninjas.com/v1/nutrition?query='
query = 'Freeze-Dried Chicken  2 oz, Chicken-Flavored T.V.P. 4 oz, 4 Chicken Bouillon Cube, 0.25 cups Chicken Bouillon Granules, 8oz enriched pasta, 1 ts dill weed, 1 Cream Of Onion Soup Mix, 8oz Sour Cream Mix, 0.5c Sliced Almonds, 2oz freeze-dried peas, 8 cups of water'
response = requests.get(api_url + query, headers={'X-Api-Key': 'BKR603XEePKwVMGDXT61yg==CtllA9b6Jt9wO29z'})
if response.status_code == requests.codes.ok:
    print(response.text)
else:
    print("Error:", response.status_code, response.text)