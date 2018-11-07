# -*- coding: utf-8 -*-
from openfisca_core.scripts import build_tax_benefit_system
from openfisca_core.simulations import Simulation
import openfisca_france
import requests

country_package = 'openfisca_france'

tax_benefit_system = build_tax_benefit_system(
    country_package_name = country_package,
    extensions = [],
    reforms = None
)

allMonths = ['2018-11']
calculs = {
    'af': allMonths,
}

situation = {
    "individus": {
        "pere": {
        },
        "mere": {
        },
        "enf1": {
            "date_naissance": {
                "2018-08": "2014-02-27"
            }
        },
        "enf2": {
            "date_naissance": {
                "2018-08": "2012-07-10"
            }
        }
    },
    "familles": {
        "_": {
            "parents": ["pere", "mere"],
            "enfants": ["enf1", "enf2"]
        }
    },
    "menages": {
        "_":  {
            "personne_de_reference": ["pere"],
            "conjoint": ["mere"],
            "enfants": ["enf1", "enf2"]
        }
    },
    "foyers_fiscaux": {
        "_":  {
            "declarants": ["pere", "mere"],
            "personnes_a_charge": ["enf1", "enf2"]
        }
    }
}

simulation_actuelle = Simulation(
    tax_benefit_system=tax_benefit_system,
    simulation_json=situation)

checkPeriod = "2018-07"
for calcul, periods in calculs.iteritems():
    for period in periods:
        data = simulation_actuelle.calculate(calcul, period)
        print(calcul, period, data)
