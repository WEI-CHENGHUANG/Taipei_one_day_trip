from databaseFunctions.database import insertNewMembers, updateRecored, deleteOldrecord, queryOneClauseNew, queryMultileClausesNew
from flask_restful import Resource
from flask import *
import jwt
import urllib.request
import json
import queue
from threading import Thread
import uuid
import re
import os

# This run function is in order to send a request to TapPay(a third-part organisation) to complete customer payment.
# The response will contain the payment status. status:0 means success,  status:1 means fail


def run(values):
    url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json')
    req.add_header('x-api-key', os.environ.get('partnerKey'))
    data = json.dumps(values)
    jsondataasbytes = data.encode('utf-8')
    with urllib.request.urlopen(req, jsondataasbytes) as response:
        result = response.read().decode('utf-8')
    return result


def getPaymentResponseFromTapPay(amount, prime, contactPhone, contactName, contactEmail):
    if amount == "2,000":
        newAmount = 2000
    else:
        newAmount = 2500
    values = {
        "prime": prime,
        "partner_key": os.environ.get('partnerKey'),
        "merchant_id": "WilsonHuang_ESUN",
        "details": "TapPay Test",
        "amount": newAmount,
        "cardholder": {
            "phone_number": contactPhone,
            "name": contactName,
            "email": contactEmail
        },
        "remember": False
    }
    # https://www.edureka.co/community/31966/how-to-get-the-return-value-from-a-thread-using-python
    # Lambda: https://www.w3schools.com/python/python_lambda.asp
    # Queue: https://www.bitdegree.org/learn/python-queue
    que = queue.Queue()
    t1 = Thread(target=lambda q, arg1: q.put(
        run(arg1)), args=(que, values))
    t1.start()
    t1.join()
    result = que.get()
    finalResult = json.loads(result)
    return finalResult["status"]


class orderingFunction(Resource):
    def post(self):
        cookies = request.cookies
        if cookies:
            decoded = jwt.decode(request.cookies['access_token_cookie'], os.environ.get(
                'SECRETKEY'), algorithms=['HS256'])
            content_type = request.headers.get('Content-Type')
            if (content_type == 'application/json'):
                resultJson = request.get_json()
                prime = resultJson["prime"]
                amount = resultJson["order"]["price"]
                attractionId = resultJson["order"]["trip"]["attraction"]["id"]
                attractionName = resultJson["order"]["trip"]["attraction"]["name"]
                attractionAddress = resultJson["order"]["trip"]["attraction"]["address"]
                attractionImg = resultJson["order"]["trip"]["attraction"]["image"]
                travelDate = resultJson["order"]["trip"]["date"]
                travelTime = resultJson["order"]["trip"]["time"]
                contactName = resultJson["order"]["contact"]["name"]
                contactEmail = resultJson["order"]["contact"]["email"]
                contactPhone = resultJson["order"]["contact"]["phone"]
                checkNumber = re.match("(^[0][9]\d{8})$", contactPhone)
                # The code below is to check the order's info to avoid the same order occure in the same person.
                memberEmail = decoded["sub"]["data"]["email"]
                queryCheck = "SELECT attractionId, travelTime, paidStatus, orderId FROM ordersInfo WHERE attractionId=%s and travelTime=%s and memberEmail=%s;"
                queryCheckResult = queryMultileClausesNew(
                    queryCheck, (attractionId, travelTime, memberEmail))
                if queryCheckResult == "Wrong":
                    response = make_response(jsonify(
                        {"error": True, "message": "Internal Server Error, we are working on it, sorry, line48"}), 500)
                    return response
                # This condition means that the customer already booked the order successfully.
                elif queryCheckResult != [] and (queryCheckResult[0][2] == 1):
                    response = make_response(
                        jsonify({"error": True, "message": "You already booked the order."}), 400)
                    return response
                # This condition means that the customer already booked the order but the payment process did not success.
                elif queryCheckResult != [] and (queryCheckResult[0][2] == 0):
                    attractionOrderId = queryCheckResult[0][3]
                    randomNumber = uuid.uuid4()
                    orderNumber = str(randomNumber)[:8] + contactPhone
                    # if the payment success, the response status will be 0.
                    if getPaymentResponseFromTapPay(amount, prime, contactPhone, contactName, contactEmail) == 0:
                        update = "UPDATE ordersInfo SET paidStatus = %s, orderNumber=%s WHERE orderId = %s"
                        updatedResult = updateRecored(
                            update, (1, orderNumber, attractionOrderId))
                        if updatedResult == "Wrong":
                            response = make_response(jsonify(
                                {"error": True, "message": "Internal Server Error, we are working on it, sorry."}), 500)
                            return response
                        else:
                            email = decoded["sub"]["data"]["email"]
                            deleteBookingInfo = "DELETE FROM bookingInfo WHERE email=%s;"
                            deleteResult = deleteOldrecord(
                                deleteBookingInfo, (email,))
                            if deleteResult == "Wrong":
                                response = make_response(jsonify(
                                    {"error": True, "message": "Internal Server Error, we are working on it, sorry, line96"}), 500)
                                return response
                            else:
                                response = make_response(jsonify({
                                    "data": {
                                        "number": orderNumber,
                                        "payment": {
                                            "status": 1,
                                            "message": "付款成功"
                                        }}}), 200)
                                return response
                    # This condition means that the payment did not success, but the system already has the customer's booked order.
                    else:
                        update = "UPDATE ordersInfo SET orderNumber=%s WHERE orderId = %s"
                        updatedResult = updateRecored(
                            update, (orderNumber, attractionOrderId))
                        if updatedResult == "Wrong":
                            response = make_response(jsonify(
                                {"error": True, "message": "Internal Server Error, we are working on it, sorry."}), 500)
                            return response
                        else:
                            pass
                            response = make_response(jsonify({
                                "data": {
                                    "number": orderNumber,
                                    "payment": {
                                        "status": 0,
                                        "message": "付款失敗"
                                    }}}), 200)
                            return response
                # This condition is the customer making the new order and the order isn't in the system.
                else:
                    if checkNumber:
                        randomNumber = uuid.uuid4()
                        orderNumber = str(randomNumber)[:8] + contactPhone
                        insert = "INSERT INTO ordersInfo (attractionId, price, attractionName, attractionAddress, attractionImg,\
                                travelDate, travelTime, contactName, contactemail, contactPhone, orderNumber, memberEmail) VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                        insertResult = insertNewMembers(insert, (attractionId, amount, attractionName, attractionAddress, attractionImg,
                                                                 travelDate, travelTime, contactName, contactEmail, contactPhone, orderNumber, memberEmail))

                        if insertResult == "Wrong":
                            response = make_response(jsonify(
                                {"error": True, "message": "Internal Server Error, we are working on it, sorry, insertResult line63"}), 500)
                            return response
                        else:

                            if getPaymentResponseFromTapPay(amount, prime, contactPhone, contactName, contactEmail) == 0:
                                update = "UPDATE ordersInfo SET paidStatus = %s WHERE orderNumber = %s"
                                updatedResult = updateRecored(
                                    update, (1, orderNumber))
                                if updatedResult == "Wrong":
                                    response = make_response(jsonify(
                                        {"error": True, "message": "Internal Server Error, we are working on it, sorry."}), 500)
                                    return response
                                else:
                                    email = decoded["sub"]["data"]["email"]
                                    deleteBookingInfo = "DELETE FROM bookingInfo WHERE email=%s;"
                                    deleteResult = deleteOldrecord(
                                        deleteBookingInfo, (email,))
                                    if deleteResult == "Wrong":
                                        response = make_response(jsonify(
                                            {"error": True, "message": "Internal Server Error, we are working on it, sorry, line96"}), 500)
                                        return response
                                    else:
                                        response = make_response(jsonify({
                                            "data": {
                                                "number": orderNumber,
                                                "payment": {
                                                    "status": 1,
                                                    "message": "付款成功"
                                                }}}), 200)
                                        return response
                            else:
                                response = make_response(jsonify({
                                    "data": {
                                        "number": orderNumber,
                                        "payment": {
                                            "status": 0,
                                            "message": "付款失敗"
                                        }}}), 200)
                                return response
                    else:
                        response = make_response(jsonify(
                            {"error": True, "message": "The phone number format is incorrect."}), 400)
                        return response
            else:
                response = make_response(
                    jsonify({"error": True, "message": "The request format is incorrect."}), 400)
                return response
        else:
            response = make_response(jsonify(
                {"error": True, "message": "You havn't logged in the system, so you can not book any attracitons. "}), 403)
            return response


class orderNumber(Resource):
    # This API is for the thank you page to get the customer order info for displaying the info to customer.
    def get(self, orderNumber):
        cookies = request.cookies
        if cookies:
            query = "SELECT * FROM ordersInfo WHERE orderNumber=%s;"
            queryResult = queryOneClauseNew(query, orderNumber)
            if queryResult == "Wrong":
                response = make_response(jsonify(
                    {"error": True, "message": "Internal Server Error, we are working on it, sorry, line133"}), 500)
                return response
            else:
                response = make_response(jsonify({
                    "data": {
                        "number": queryResult[0][12],
                        "price": queryResult[0][2],
                        "trip": {
                            "attraction": {
                                "id": queryResult[0][1],
                                "name": queryResult[0][3],
                                "address": queryResult[0][4],
                                "image": queryResult[0][5]
                            },
                            "date": queryResult[0][6],
                            "time": queryResult[0][7]
                        },
                        "contact": {
                            "name": queryResult[0][8],
                            "email": queryResult[0][9],
                            "phone": queryResult[0][10]
                        },
                        "status": queryResult[0][11]
                    }
                }), 200)
                return response

        else:
            response = make_response(jsonify(
                {"error": True, "message": "You havn't logged in the system, so you can not book any attracitons. "}), 403)
            return response
