# -*- coding: utf-8 -*-
import copy

entityGroups = {
  'familles': ['parents', 'enfants'],
  'foyers_fiscaux': ['declarants', 'personnes_a_charge'],
  'menages': ['personne_de_reference', 'conjoint', 'enfants']
}

def empty():
  result = { entityName: dict() for entityName in entityGroups }
  result['individus'] = dict()

  return result


def prefix(prefix, situation):
  new_situation = { entityName: { prefix + entityId: copy.deepcopy(entity) for entityId, entity in entities.iteritems()} for entityName, entities in situation.iteritems()}

  for entityName, fields in entityGroups.iteritems():
    for entity in new_situation[entityName].values():
      for field in fields:
        if field in entity:
          entity[field] = [prefix + v for v in entity[field]]

  return new_situation


def merge(situation, additions):
  for entityName, entities in situation.iteritems():
    for entityId, entity in additions[entityName].iteritems():
      situation[entityName][entityId] = entity

  return situation
