# -*- coding: utf-8 -*-
import sys
import numpy as np
import pandas as pd
from IPython.display import clear_output


def get_all_possible_keys(serie):
    """parameters : - series : a Pandas Series where each row is a dict.
       returns: - set of all unique keys.
    """
    keys = set()
    for i in serie:
        if((type(i) == list) and (len(i) > 0)):
            for key in list(i[0].keys()):
                keys.add(key)
        elif((type(i) == dict)):
            for key in list(i.keys()):
                keys.add(key)
        else:
            continue
    return keys


def add_id_to_individus(serie):
    """parameter : -serie : a Pandas Series where each row is a person ([dict])
                            or a list of person (list of dicts)
    role : add the "_id_demandeur" on each dicts.
    """
    for list_ind in serie:
        if len(list_ind) > 0:
            for d in list_ind:
                d['_id_demandeur'] = list_ind[0]['_id']
