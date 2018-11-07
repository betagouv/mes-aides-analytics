# -*- coding: utf-8 -*-


# 7618153
# 131.16 / 131.81 / 0.65

situation_7618153 = {
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


# 6771069

situation_6771069 = {
    "individus": {
        "pere": {
            "salaire_imposable": {
                "2016": 200000
            }
        },
        "mere": {
        },
        "enf1": {
            "date_naissance": {
                "2018-08": "2013-01-01"
            }
        },
        "enf2": {
            "date_naissance": {
                "2018-08": "2009-12-01"
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