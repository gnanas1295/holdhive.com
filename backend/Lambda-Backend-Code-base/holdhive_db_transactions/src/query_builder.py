def build_insert_query(table, data):
    """
    Dynamically builds an INSERT SQL query.

    Args:
        table (str): Table name.
        data (dict): Key-value pairs for columns and values.

    Returns:
        str: INSERT SQL query string.
    """
    columns = ", ".join(data.keys())
    values = ", ".join([f"'{v}'" for v in data.values()])
    return f"INSERT INTO {table} ({columns}) VALUES ({values});"

def build_select_query(table, conditions=None):
    """
    Dynamically builds a SELECT SQL query.

    Args:
        table (str): Table name.
        conditions (dict, optional): Conditions for the WHERE clause.

    Returns:
        str: SELECT SQL query string.
    """
    query = f"SELECT * FROM {table}"
    if conditions:
        where_clause = " AND ".join([f"{k}='{v}'" for k, v in conditions.items()])
        query += f" WHERE {where_clause}"
    return query + ";"
