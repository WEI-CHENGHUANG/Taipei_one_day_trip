import json

data = ["DisneyPlus", "Netflix", "Peacock"]
json_string = json.dumps(data)
print(json_string)
print(type(data))
print(type(json_string))