# -*- coding: utf-8 -*-
import sys
import numpy as np
import pandas as pd
from IPython.display import clear_output
from datetime import date
import ast


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


def add_id_to_serie(df, serie, df_id, serie_id):
    """parameter : -df : a pandas DataFrame contaning '_id' and a serie of
                         list of dict.
                   -serie (str) : Name of the pandas Serie contaning a list
                                  of dict.
                   -df_id (str) : name of df id (must starts with '_id_')
                   -serie_id (str) : name of newly created serie id (must
                                     starts with '_id_')
    role : add the "_id_xxx" on each dicts of the pandas Serie
    """
    k = 0
    assert type(serie) == str, "serie parameter must be a valid str"
    assert type(df_id) == str, "df_id parameter must be a valid str"
    assert type(serie_id) == str, "new_id parameter must be a valid str"
    assert str(serie) in df.columns.tolist(), "serie must be in df columns"
    for list_ind in df[str(serie)]:
        if len(list_ind) > 0:
            for d in list_ind:
                d[str(df_id)] = df.iloc[k][str(serie_id)]
        k += 1


def calculate_age(born):
    today = date.today()
    return today.year - born.year - ((today.month, today.day) <
                                     (born.month, born.day))


def clean_individus(path):
    """import and clean table individus
    - returns : pandas Dataframe
    """
    t_individus = pd.read_csv(path + "individus.csv", index_col=False)
    t_individus = t_individus.rename(columns={'_id': '_id_individu'})
    del t_individus['Unnamed: 0']
    # -- On ne conserve que la date (sans les nanosecondes..)
    t_individus.dateDeNaissance =\
        [x.split(' ')[0] for x in t_individus.dateDeNaissance]
    t_individus.dateDeNaissance =\
        pd.to_datetime(t_individus.dateDeNaissance, errors='coerce')
    t_individus = t_individus.loc[t_individus.dateDeNaissance != '12-12-2012']
    # -- Clean situation_pro dicts
    t_individus.situationsPro =\
        t_individus.situationsPro.apply(
            lambda x: [] if (pd.isnull(x) or x == '[]') else x)
    t_individus.situationsPro =\
        [ast.literal_eval(x.replace("ObjectId('", '\'').replace("')", '\''))
            if type(x) == str else x for x in t_individus.situationsPro]
    t_individus['age'] = t_individus.dateDeNaissance.apply(calculate_age)
    t_individus.drop_duplicates(subset=['_id_individu'], inplace=True)
    # -- dtypes
    t_individus.statutMarital = t_individus.statutMarital.astype(str)
    t_individus.statutMarital =\
        t_individus.statutMarital.replace('nan', np.nan)

    return t_individus


def clean_simulations(path):
    """import and clean table simulations
    - returns : pandas Dataframe
    """
    t_simulations = pd.read_csv(path + 'simulations.csv')
    t_simulations.dateDeValeur = pd.to_datetime(t_simulations.dateDeValeur)
    t_simulations =\
        t_simulations.loc[t_simulations.dateDeValeur >= '01-01-2015']
    t_simulations._id = t_simulations._id.astype(str)

    return t_simulations


def clean_logements(path):
    """import and clean table simulations
    - returns : pandas Dataframe
    """
    t_logements = pd.read_csv(path + 'logements.csv')
    del t_logements['Unnamed: 0']
    t_logements.adresse =\
        t_logements.adresse.apply(
            lambda x: [] if (pd.isnull(x) or x == '[]') else x)
    t_logements.adresse =\
        [ast.literal_eval(x) if (
            type(x) == str) else x for x in t_logements.adresse]
    t_logements.adresse =\
        t_logements.adresse.apply(lambda x: [x] if type(x) != list else x)
    t_logements._id_demandeur = t_logements._id_demandeur.astype('str')

    return t_logements
