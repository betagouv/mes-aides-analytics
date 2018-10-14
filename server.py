import datetime

# pip install pymongo==3.4.0
# pymongo latest version is not compatible with our mongodb version
from pymongo import MongoClient
from pprint import pprint

import requests

client = MongoClient() # ('localhost', 27018)
db = client.dds


def getSituations():
  today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
  situations = dict()
  for s in  db.situations.find({ "dateDeValeur": { "$gt": today, "$lt": today + datetime.timedelta(1)}}).skip(5).limit(2):
    sid = str(s['_id'])
    #url = 'https://mes-aides.gouv.fr/api/situations/' + sid + '/openfisca-request'
    url = 'http://localhost:9000/api/situations/' + sid + '/openfisca-request'
    print(url)
    r = requests.get(url, cookies={"situation_" + sid : s['token']})
    situation = r.json()
    situations[sid] = situation

  return situations
