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


def dict_to_df(serie):
    """parameters : - series : a Pandas Series where each row is a dict.
       returns: - a pandas DataFrame containing all keys as columns.
    """
    # -- Get all possible key values
    serie = data.logement
    keys = get_all_possible_keys(serie)
    len_serie = len(serie)
    # -- Pre-allocate memory by declaring size
    table = pd.DataFrame(np.nan, index=range(0, len_serie), columns=list(keys))
    # -- Fill row by row
    k = 0
    for i in serie:
        if(type(i) == list):
            if (len(i) > 0):
                df.loc[k] = pd.Series(i[0])
            else:
                continue
        elif(type(i) == dict):
            df.loc[k] = pd.Series(i)
        else:
            continue
        k += 1
        print('%s / %s' % (k, len_serie))
        clear_output(wait=True)
        sys.stdout.flush()

    return table
