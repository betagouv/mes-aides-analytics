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
    # -- Get all possible key values (to speed-up the process)
    keys = get_all_possible_keys(serie)
    table = pd.DataFrame(columns=list(keys))

    len_serie = len(serie)
    k = 0
    for i in serie:
        if(type(i) == list):
            if (len(i) > 0):
                df = pd.DataFrame(list(i[0].items()))
            else:
                continue
        elif(type(i) == dict):
            df = pd.DataFrame(list(i.items()))
        else:
            continue
        df = df.transpose()
        df.columns = df.iloc[0]
        df = df.reindex(df.index.drop(0))
        table = pd.concat([table, df], axis=0)
        k += 1
        print('%s / %s' % (k, len_serie))
        clear_output(wait=True)
        sys.stdout.flush()
    return table
