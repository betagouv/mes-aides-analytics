# -*- coding: utf-8 -*-


def generate(path):

    import csv

    situations = {
      "individus": {},
      "familles": {},
      "foyers_fiscaux": {},
      "menages": {},
    }

    period = "2018-08"

    def set(value):
        return {
          period: value
        }

    with open(path) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=";")
        for row in reader:
            MATRICUL = row['MATRICUL']
            situations['individus'][MATRICUL] = {}
            situations['familles'][MATRICUL] = {
                "parents": [MATRICUL],
                "af_nbenf": set(row['NBENFCHA']),
                "af": { "2018-07": float(row['MTAFVERS'])},
                "prestations_familiales_base_ressources": set(row['MTREVBRU']),
            }
            situations['foyers_fiscaux'][MATRICUL] = {
                "declarants": [MATRICUL]
            }
            situations['menages'][MATRICUL] = {
                "personne_de_reference": [MATRICUL]
            }

    return situations
