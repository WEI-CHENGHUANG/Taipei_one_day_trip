#coding=utf-8
# Reference for above: https://www.bilibili.com/video/BV1Mb411Y7Lk/
from base64 import decode
import json
# from mysql.connector import pooling, Error
import mysql.connector


# Issue occured: https://exerror.com/solved-mysql-connector-errors-notsupportederror-authentication-plugin-caching_sha2_password-is-not-supported/
db = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="Class412127",
    database = "website"
)

mycursor = db.cursor()



with open("new-taipei-attractions.json") as result:
    data = json.load(result)

for i in data:
    for x in i["data"]:
        # Reference=> how to insert JSON in mysql: https://sebhastian.com/mysql-array/#:~:text=You%20can't%20create%20a,storing%20JSON%20arrays%20and%20objects.
        # Reference=> how to how convert list to JSON: https://appdividend.com/2022/01/28/how-to-convert-python-list-to-json/#:~:text=To%20convert%20the%20list%20to,returns%20the%20json%20data%20type.
        covertImage = json.dumps(x["images"])
        eachRow = (x["id"], x["name"], x["category"], x["description"], x["address"], x["transport"], x["mrt"], x["latitude"], x["longitude"], covertImage)
     
        insertValue = "INSERT INTO taipeiAttractions (id, name, category, description, address, transport, mrt, latitude, longitude, images) VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        mycursor.execute(insertValue, eachRow)

db.commit()


