from databaseFunctions.database import queryOneClauseNew, insertNewMembers, deleteOldrecord
from flask_restful import Resource
from flask import *
import jwt
import os


class bookingFunction(Resource):
    def get(self):
        cookies = request.cookies
        if cookies:
            decoded = jwt.decode(request.cookies['access_token_cookie'], os.environ.get(
                'SECRETKEY'), algorithms=['HS256'])
            email = decoded["sub"]["data"]["email"]
            query = "select bookingInfo.travelDate, bookingInfo.travelTime, bookingInfo.price, taipeiAttractions.id,\
                    taipeiAttractions.name, taipeiAttractions.address, taipeiAttractions.images\
                    from bookingInfo LEFT JOIN taipeiAttractions ON bookingInfo.attractionId = taipeiAttractions.id\
                    WHERE bookingInfo.email=%s;"
            queryResult = queryOneClauseNew(query, (email))

            if queryResult == "Wrong":
                response = make_response(jsonify(
                    {"error": True, "message": "Internal Server Error, we are working on it, sorry, queryResult(GET)"}), 500)
                return response
            elif queryResult == []:
                # This query result will return None to frontend due to no result return. (usera havn't had any booking attractions yet.)
                return None
            else:
                jsonToList = json.loads(queryResult[0][6])
                response = make_response(jsonify({"data": {"attraction": {"id": queryResult[0][3], "name": queryResult[0][4], "address": queryResult[0][5],
                                                                          "image": jsonToList}, "date": queryResult[0][0], "time": queryResult[0][1], "price": queryResult[0][2]}}), 200)
                return response
        else:
            response = make_response(jsonify(
                {"error": True, "message": "You havn't logged in the system, so you can not book any attracitons."}), 403)
            return response

    def post(self):
        cookies = request.cookies
        if cookies:
            decoded = jwt.decode(request.cookies['access_token_cookie'], os.environ.get(
                'SECRETKEY'), algorithms=['HS256'])
            content_type = request.headers.get('Content-Type')
            if (content_type == 'application/json'):
                responsejson = request.get_json()
                attractionId = responsejson["attractionId"]
                date = responsejson["date"]
                time = responsejson["time"]
                price = responsejson["price"]
                email = decoded["sub"]["data"]["email"]
                # Check if the attraction exists inside of the database.
                query = "SELECT id FROM taipeiAttractions WHERE id=%s;"
                queryResultPost = queryOneClauseNew(query, attractionId)
                if queryResultPost == "Wrong":
                    response = make_response(jsonify(
                        {"error": True, "message": "Internal Server Error, we are working on it, sorry, queryResultPost"}), 500)
                    return response
                elif queryResultPost == []:
                    response = make_response(jsonify(
                        {"error": True, "message": "attractions inputed does not exist at all"}), 400)
                    return response
                else:
                    # Here, I need to delete the exist booking info then insert a new booking info.
                    # First, check if the existing booking inof.
                    queryExistBookingAttractionSyntax = "SELECT * FROM bookingInfo WHERE email=%s;"
                    queryExistBookingAttraction = queryOneClauseNew(
                        queryExistBookingAttractionSyntax, email)
                    # The code below is for more then one booking info.
                    # queryExistBookingAttractionSyntax ="SELECT * FROM bookingInfo WHERE attractionId = %s and email=%s;"
                    # queryExistBookingAttraction = queryMultileClausesNew(queryExistBookingAttractionSyntax, (attractionId, email))

                    if queryExistBookingAttraction == "Wrong":
                        response = make_response(jsonify(
                            {"error": True, "message": "Internal Server Error, we are working on it, sorry, queryExistBookingAttraction"}), 500)
                        return response
                    elif queryExistBookingAttraction == []:
                        insert = "INSERT INTO bookingInfo (attractionId, travelDate, travelTime, price, email) VALUES(%s, %s, %s, %s, %s)"
                        insertResult = insertNewMembers(
                            insert, (attractionId, date, time, price, email))
                        if insertResult == "Wrong":
                            response = make_response(jsonify(
                                {"error": True, "message": "Internal Server Error, we are working on it, sorry, insertResult"}), 500)
                            return response
                        else:
                            response = make_response(
                                jsonify({"ok": True}), 200)
                            return response
                    else:
                        deleteOldRecord = "DELETE FROM bookingInfo WHERE email=%s;"
                        deleteResult = deleteOldrecord(
                            deleteOldRecord, (email,))
                        if deleteResult == "Wrong":
                            response = make_response(jsonify(
                                {"error": True, "message": "Internal Server Error, we are working on it, sorry, deleteOldRecord"}), 500)
                            return response
                        else:
                            insert = "INSERT INTO bookingInfo (attractionId, travelDate, travelTime, price, email) VALUES(%s, %s, %s, %s, %s)"
                            insertResult = insertNewMembers(
                                insert, (attractionId, date, time, price, email))
                            if insertResult == "Wrong":
                                response = make_response(jsonify(
                                    {"error": True, "message": "Internal Server Error, we are working on it, sorry, insertResult here last step"}), 500)
                                return response
                            else:
                                response = make_response(
                                    jsonify({"ok": True}), 200)
                                return response
            else:
                response = make_response(jsonify(
                    {"error": True, "message": "The request header may be wrong, pls check the request header again. "}), 500)
                return response
        else:
            response = make_response(jsonify(
                {"error": True, "message": "You havn't logged in the system, so you can not book any attracitons. "}), 403)
            return response

    # This is delete the shopping car item.

    def delete(self):
        cookies = request.cookies
        if cookies:
            decoded = jwt.decode(request.cookies['access_token_cookie'], os.environ.get(
                'SECRETKEY'), algorithms=['HS256'])
            email = decoded["sub"]["data"]["email"]
            deleteOldRecord = "DELETE FROM bookingInfo WHERE email=%s;"
            deleteResult = deleteOldrecord(deleteOldRecord, (email,))
            if deleteResult == "Wrong":
                response = make_response(jsonify(
                    {"error": True, "message": "Internal Server Error, we are working on it, sorry, deleteOldRecord"}), 500)
                return response
            else:
                response = make_response(jsonify({"ok": True}), 200)
                return response
        else:
            response = make_response(jsonify(
                {"error": True, "message": "You havn't logged in the system, so tou can not book any attracitons. "}), 403)
            return response
