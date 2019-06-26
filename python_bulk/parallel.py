# -*- coding: utf-8 -*-

import logging
FORMAT = '%(asctime)-15s %(message)s'
logging.basicConfig(format=FORMAT)
log = logging.getLogger()
log.setLevel(logging.INFO)

from openfisca_core.scripts import build_tax_benefit_system
from openfisca_core.simulations import Simulation
import openfisca_france

import copy
import json
import os
import requests
import sys

import utils

country_package = 'openfisca_france'
extensions = ['openfisca_bacASable', 'openfisca_paris', 'openfisca_brestmetropole', 'openfisca_rennesmetropole']


log.info('build_tax_benefit_system')
tax_benefit_system = build_tax_benefit_system(
    country_package_name = country_package,
    extensions = extensions,
    reforms = None
)

if False:
    situation_id = '5b86aa7d869153471529eb98'
    url = 'http://localhost:9000/api/situations/' + situation_id + '/openfisca-request'
    r = requests.get(url)
    situation = r.json()

    situations = copy.deepcopy(situation)

    for i in range(1, 800):
      situations = utils.merge(situations, utils.prefix(str(i), situation))

log.info('import server')
import server
#s = server.getBogusSituations()
#s = server.getDailySituations(int(sys.argv[-1]))
s = server.getSituationSubset()
remoteSituations = server.processSituations(s, remote=False)
situations = utils.empty()
for prefix, situation in remoteSituations.iteritems():
    situations = utils.merge(situations, utils.prefix(prefix, situation))

allMonths = ['2018-10']
calculs = {
    'aspa': allMonths,
    'acs': allMonths,
    'asi': allMonths,
    'cmu_c': allMonths,
    'af': allMonths,
    'cf': allMonths,
    'asf': allMonths,
    'paje_base': allMonths,
    'rsa': allMonths,
    'aide_logement': allMonths,
    'ppa': allMonths,
    'aah': allMonths,
    'ass': allMonths,
#    'cheque_energie': allMonths,
    'bourse_college': allMonths,
    'bourse_lycee': allMonths,
#    'logement_social_eligible': allMonths,
    # 'paris_logement_familles': allMonths,
    # 'paris_forfait_famille': allMonths,
    # 'paris_logement_psol': allMonths,
    # 'paris_logement': allMonths,
    # 'paris_logement_aspeh': allMonths,
    # 'paris_logement_plfm': allMonths,
    # 'paris_energie_famille': allMonths,
    # 'paris_complement_sante': allMonths,
    'rennes_metropole_transport': allMonths,
    'brest_metropole_transport': allMonths,
    'alfortville_noel_enfants': allMonths,
}

calculs = {
    'af': allMonths,
    'aide_logement': allMonths,
    'rsa': allMonths,
    'ppa': allMonths,
}

import pandas as pd
results = pd.DataFrame()

log.info('Simulation')
simulation_actuelle = Simulation(
    tax_benefit_system=tax_benefit_system,
    simulation_json=situations)
results['ids'] = simulation_actuelle.get_variable_entity('af').ids

log.info('calculate')
for calcul, periods in calculs.iteritems():
    for period in periods:
        data = simulation_actuelle.calculate(calcul, period)
        results[calcul] = data


log.info('save')
results.to_csv('file.csv', index=False)
log.info('end')
