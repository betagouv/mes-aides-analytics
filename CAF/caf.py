# -*- coding: utf-8 -*-
from openfisca_core.scripts import build_tax_benefit_system
from openfisca_core.simulations import Simulation
import openfisca_france
import requests

import copy
import utils

country_package = 'openfisca_france'

tax_benefit_system = build_tax_benefit_system(
    country_package_name = country_package,
    extensions = [],
    reforms = None
)
allMonths = ['2018-08']
calculs = {
    'af': allMonths,
    'af_nbenf': allMonths,
    'af_taux_modulation': allMonths,
    'prestations_familiales_base_ressources': allMonths,
}

calculs = {
    'af': allMonths,
}

import experiment_af
import situations
situation = utils.merge(utils.prefix('7618153', situations.situation_7618153), utils.prefix('6771069', situations.situation_6771069))

simulation_actuelle = Simulation(
    tax_benefit_system=tax_benefit_system,
    simulation_json=situation)

checkPeriod = "2018-07"
for calcul, periods in calculs.iteritems():
    ids = simulation_actuelle.get_variable_entity(calcul).ids
    for period in periods:
        data = simulation_actuelle.calculate(calcul, period)
        result = dict(zip(ids, data))
        for mid, value in result.iteritems():
            print(mid, value, value * 0.995)
            # source = situation["familles"][mid]["af"][checkPeriod]
            # if abs(source - value)>1:
            #     print (mid, source, value)

from pprint import pprint
#pprint(situation)
