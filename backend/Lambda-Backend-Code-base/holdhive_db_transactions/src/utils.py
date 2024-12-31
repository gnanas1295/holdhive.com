import json

def format_response(status_code, body):
    """
    Formats the API Gateway response.
    """
    return {
        "statusCode": status_code,
        "body": body
    }
