# pip install python-dotenv
# pip install mysql-connector-python
from mysql.connector import pooling, Error
from dotenv import load_dotenv
import os


# Hiding password video: https://www.youtube.com/watch?v=YdgIWTYQ69A
load_dotenv()


connection_pool = pooling.MySQLConnectionPool(
    pool_name = "myWeHelpPool",
    pool_size = 5,
    pool_reset_session = True,
    host = "localhost",
    database = "website",
    user = "root",
    passwd = os.environ.get('password')
)

# ========================================#
# 1. 找到結果, 2. 傳回空值 [], 3. 傳回錯誤
def queryOneClauseNew(query, condition):
    try:
        oneConnection = connection_pool.get_connection()
        cursor = oneConnection.cursor(buffered=True)
        cursor.execute(query, (condition,))
        userNameQuery = cursor.fetchall()
        return userNameQuery
    except Error as e:
        return "Wrong"
    finally:
        oneConnection.close()


# # 1. 找到結果, 2. 傳回空值 [], 3. 傳回錯誤    
def queryMultileClausesNew(query, *args):
    try:
        oneConnection = connection_pool.get_connection()
        cursor = oneConnection.cursor(buffered=True)
        cursor.execute(query, *args)
        userNameQuery = cursor.fetchall()
        return userNameQuery
    except Error as e:
        return "Wrong"

    finally:
        oneConnection.close()
    

def queryKeyword(query, *args):
    try:
        oneConnection = connection_pool.get_connection()

        cursor = oneConnection.cursor(buffered=True)
        cursor.execute(query, *args)
        userNameQuery = cursor.fetchall()
        return userNameQuery
    
    except Error as e:
        return "Wrong"
    
    finally:
        oneConnection.close()
    
        
def insertNewMembers(insert, *args):
    try:
        oneConnection = connection_pool.get_connection()
        cursor = oneConnection.cursor(buffered=True)
        cursor.execute(insert, *args)
        oneConnection.commit()
    except Error as e:
        return "Wrong"
    
    finally:
        if oneConnection.in_transaction:
            oneConnection.rollback()
        oneConnection.close()
        
        
def deleteOldrecord(deleterecord, *args):
    try:
        oneConnection = connection_pool.get_connection()
        cursor = oneConnection.cursor(buffered=True)
        cursor.execute(deleterecord, *args)
        oneConnection.commit()
    except Error as e:
        return "Wrong"
    
    finally:
        if oneConnection.in_transaction:
            oneConnection.rollback()
        oneConnection.close()

def updateRecored(insert, *args):
    try:
        oneConnection = connection_pool.get_connection()
        cursor = oneConnection.cursor(buffered=True)
        cursor.execute(insert, *args)
        oneConnection.commit()
        
    except Error as e:
        return "Wrong"
    
    finally:
        if oneConnection.in_transaction:
            oneConnection.rollback()
        oneConnection.close()