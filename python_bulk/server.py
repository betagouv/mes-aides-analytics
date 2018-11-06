import datetime

# pip install pymongo==3.4.0
# pymongo latest version is not compatible with our mongodb version
from pymongo import MongoClient
from bson.objectid import ObjectId
from pprint import pprint

import requests

client = MongoClient() # ('localhost', 27018)
db = client.dds

def getDailySituations():
  today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
  return db.situations.find({ "dateDeValeur": { "$gt": today, "$lt": today + datetime.timedelta(1)}}).skip(4).limit(10)


def getBogusSituations():
  ids = [
    '5be0efea1da54d6d646c739e',
    '5be0de9e38af9e6d10ec4259'
  ]
  return db.situations.find({"_id": {"$in": [ObjectId(i) for i in ids]}})


def processSituations(cursor, remote=False):
  if cursor.count() > 50 and remote:
    raise 'You can\'t rely on the production webserver with many situations. Please, setup a local node server.'

  situations = dict()
  for s in cursor:
    sid = str(s['_id'])

    if remote:
      url = 'https://mes-aides.gouv.fr/api/situations/' + sid + '/openfisca-request'
    else:
      url = 'http://localhost:9000/api/situations/' + sid + '/openfisca-request'

    print(url)
    r = requests.get(url, cookies={"situation_" + sid : s['token']})
    situation = r.json()
    situations[sid] = situation

  return situations
