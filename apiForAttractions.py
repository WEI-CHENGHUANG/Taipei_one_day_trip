# This article is really important cuz it diplays how the RESTful api interact with Flask_Blueprint.
# https://dev.to/paurakhsharma/flask-rest-api-part-2-better-structure-with-blueprint-and-flask-restful-2n93#:~:text=Blueprint%3A%20It%20is%20used%20to,quickly%20and%20following%20best%20practices.

from databaseFunctions.database import queryOneClauseNew, queryKeyword
from flask_restful import Resource
from flask  import *
import json

def queryPageResultFunction(queryPageResult):
    try :
        data = []
        for i in queryPageResult:
            jsonToList = json.loads(i[9])
            eachRow = {"id": i[0], 
                    "name": i[1], 
                    "category": i[2],
                    "description": i[3],
                    "address": i[4],
                    "transport": i[5],
                    "mrt": i[6],
                    "latitude": float(i[7]),
                    "longitude": float(i[8]),
                    "images": jsonToList}
            data.append(eachRow)
        return data
    except:
        response = make_response(jsonify({"error": True, "message": "Internal Server Error, we are working on it, sorry"}),500)
        return response
        

def responseQueryResult(nextPage, data):
    response = jsonify({"nextPage": nextPage, "data": queryPageResultFunction(data)})
    return response


# This attractions API is for the home page to load the attractions data.
class attractions(Resource):
    def get(self):
        # indirect refterence start from 3:28: https://www.youtube.com/watch?v=yTbKm_6PsxY
        # This is to get the query parameters from URL. For example, url=> http://13.210.218.205:4000/api/attractions?page=10, query parameter=> page=10
        page = request.args.get('page')
        # This If is to check the only keyword input situation
        if page is None:
            page = 0
        # This try is to avoid the user to provide a character as a page number.
        try:
            offsetPage = int(page)*12
        except:
            response = make_response(jsonify({"error": True, "message": "Wrong number input"}),400)

            return response
        # LIMIT means every query only returns 13 rows result and OFFSET means the system will skip how many rows first. 
        queryPage ="SELECT id, name, category, description, address, transport, mrt, latitude, longitude, images FROM taipeiAttractions LIMIT 13 OFFSET %s;"
        queryPageResult = queryOneClauseNew(queryPage, offsetPage)[0:12]
        keywordQuery = request.args.get('keyword')
        # Keyword query is according to user's input to select the first 12 results and return it to client side.
        queryKeyWord ="SELECT id, name, category, description, address, transport, mrt, latitude, longitude, images FROM taipeiAttractions WHERE name like %s LIMIT 13 OFFSET %s;"
        NewkeywordQuery = f'%{keywordQuery}%'
        queryKeyWordResult = queryKeyword(queryKeyWord, (NewkeywordQuery, offsetPage))[0:12]
        
        if keywordQuery == None:
            if queryPageResult == "Wrong":
                response = make_response(jsonify({"error": True, "message": "Internal Server Error, we are working on it, sorry, line54"}),500)
                return response
            else:
                if len(queryOneClauseNew(queryPage, offsetPage))<13:
                        return responseQueryResult(None, queryPageResult)
                return responseQueryResult(int(page)+1, queryPageResult)
        else:
            if queryKeyWordResult == "Wrong":
                response = make_response(jsonify({"error": True, "message": "Internal Server Error, we are working on it, sorry, line59"}),500)
                return response
            else:
                if len(queryKeyword(queryKeyWord, (NewkeywordQuery, offsetPage)))<13:
                        return responseQueryResult(None, queryKeyWordResult)
                return responseQueryResult(int(page)+1, queryKeyWordResult)
                
    
    
    
class attractionId(Resource):
    # Check Udemy class section 65
    def get(self, attractionId):
        
        queryId ="SELECT id, name, category, description, address, transport, mrt, latitude, longitude, images FROM taipeiAttractions WHERE id=%s;" 
        queryIdResult = queryOneClauseNew(queryId, attractionId)
        try:
            if queryIdResult:
                response = jsonify({"data": queryPageResultFunction(queryIdResult)[0]})
                return response
            else:
                response = make_response(jsonify({"error": True, "message": f"Sorry, could not find ID:{attractionId}"}),400)
                return response
        except:
            response = make_response(jsonify({"error": True, "message": "Internal Server Error, we are working on it, sorry"}),500)
            return response


