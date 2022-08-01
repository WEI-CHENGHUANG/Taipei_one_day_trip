# This article is really important cuz it diplays how the RESTful api interact with Flask_Blueprint.
# https://dev.to/paurakhsharma/flask-rest-api-part-2-better-structure-with-blueprint-and-flask-restful-2n93#:~:text=Blueprint%3A%20It%20is%20used%20to,quickly%20and%20following%20best%20practices.
from flask import *
from flask_restful import Api
from routes import initialize_routes
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

# This article has explained what __name__ is and its function=> https://segmentfault.com/a/1190000040512120
app = Flask(__name__)
# https://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
# how to keep order of sorted dictionary passed to jsonify() function? : https://stackoverflow.com/questions/54446080/how-to-keep-order-of-sorted-dictionary-passed-to-jsonify-function
app.config['JSON_SORT_KEYS'] = False
# https://flask-jwt-extended.readthedocs.io/en/3.0.0_release/tokens_in_cookies/
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_SECRET_KEY'] = os.environ.get('SECRETKEY')


cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
# This is for RESTful api to use.
api = Api(app)
initialize_routes(api)
jwt = JWTManager(app)

# Pages


@app.route("/")
def index():
    # abort(400)
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


@app.route("/membership")
def membership():
    return render_template("membership.html")


if __name__ == "__main__":
    app.run(port=3000, debug=True)
    # app.run(host='0.0.0.0', port=3000, debug=True)
