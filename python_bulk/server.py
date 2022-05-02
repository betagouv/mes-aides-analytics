import datetime

# pip install pymongo==3.4.0
# pymongo latest version is not compatible with our mongodb version
from pymongo import MongoClient
from bson.objectid import ObjectId
from pprint import pprint

import atexit
import cPickle
import logging
import os
import requests

log = logging.getLogger()

class Cache(object):
  """docstring for Cache"""
  def __init__(self, path = '/var/tmp/mes-aides-cache.pickle'):
    super(Cache, self).__init__()
    self.path = path
    if os.path.isfile(self.path):
      with open(self.path, 'r') as file:
        self.data = cPickle.load(file)
    else:
      self.data = dict()
    atexit.register(self.unload)

  def unload(self):
    with open(self.path, 'w+') as file:
      cPickle.dump(self.data, file)

    logging.info('unload cache')

  def __setitem__(self, key, value):
    self.data[key] = value 

  def __getitem__(self, key):
    return self.data[key]


cache = Cache()
client = MongoClient() # ('localhost', 27018)
db = client.dds

def getDailySituations(limit):
  logging.info('getDailySituations')
  today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
  return db.situations.find({ "dateDeValeur": { "$gt": today, "$lt": today + datetime.timedelta(1)}}).sort("dateDeValeur").limit(limit)

def getSituationSubset():
  ids = [
    '5bec2c578936627a083a4bbe',
    '5bec2bfd30b0b27a5e4cbbbb',
    '5bec2b558936627a083a4b6e',
    '5bec2a048d98067a098916ea',
    '5bec29b38d98067a098916ce'
  ]
  return db.situations.find({"_id": {"$in": [ObjectId(i) for i in ids]}})

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

    try:
      situation = cache[sid]
    except KeyError:
      if remote:
        url = 'https://mes-aides.gouv.fr/api/situations/' + sid + '/openfisca-request'
      else:
        url = 'http://localhost:9000/api/situations/' + sid + '/openfisca-request'
      r = requests.get(url, cookies={"situation_" + sid : s['token']})

      situation = r.json()
    finally:
      cache[sid] = situation
      situations[sid] = situation


  return situations
