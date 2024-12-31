import pyodbc
import os
from decimal import Decimal
from datetime import date, datetime


# Environment variables for DB credentials
DB_HOST = os.environ['DB_HOST']
DB_PORT = os.environ.get('DB_PORT', 1433)
DB_NAME = os.environ['DB_NAME']
DB_USER = os.environ['DB_USER']
DB_PASS = os.environ['DB_PASS']

def get_db_connection():
    """
    Establishes a connection to the database.
    """
    # Connection string
    connection_string = (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={DB_HOST},{DB_PORT};"
        f"DATABASE={DB_NAME};"
        f"UID={DB_USER};"
        f"PWD={DB_PASS};"
    )

    return pyodbc.connect(connection_string)

def execute_query(query, params=None, commit=False):
    """
    Executes a SQL query on the database.

    Args:
        query (str): SQL query to execute.
        commit (bool): Whether to commit the transaction (default is False).
    
    Returns:
        list: Query results for SELECT queries.
    """
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # cursor.execute(query, params)
            # print(f"Cursor Fetchall Rows: {cursor.fetchall()}")

            # Execute query with or without parameters
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)

            if commit:
                try:
                    connection.commit()
                    return {"message": "Transaction committed successfully"}
                except Exception as e:
                    # Handle commit-specific errors
                    raise Exception(f"Commit failed: {str(e)}")
            
            # Fetch results and convert to list of dictionaries
            columns = [column[0] for column in cursor.description]  # Get column names
            rows = cursor.fetchall()

             # Convert Decimal values to float
            results = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                row_dict = {key: convert_to_serializable(value) for key, value in row_dict.items()}
                results.append(row_dict)

            print(f"Results in db_client: {results}")
            return results
    finally:
        connection.close()

def convert_to_serializable(value):
    """
    Converts non-serializable types (Decimal, datetime) to serializable formats.
    """
    if isinstance(value, Decimal):
        return float(value)  # Convert Decimal to float
    elif isinstance(value, (datetime, date)):
        return value.isoformat()  # Convert datetime to ISO 8601 string
    return value  # Return other types as-is
