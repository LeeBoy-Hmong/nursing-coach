import httpx
import asyncio
import pprint
from app.config import settings

# Write a function to wrap fields in a list -- Pull elment(indicie) 0, or None(Null)
def zero(value: list | None) -> str | None:
    '''openFDA wraps every field in a list. Pull element 0, or None.'''
    if not value:
        return None
    return value[0]


# Set up an async function to -- have 'drug_name' as the parameter and pull null
async def retrieve_openfda(drug_name: str) -> dict[str, str | None] | None:  # This needs to match the return of the function.
    # set up the parameters
    param = {
        # https://api.fda.gov/drug/label.json?search=openfda.generic_name%3Ainsulin&limit=1
        "search": f'openfda.generic_name:{drug_name}',
        "limit": 1
    }

    try:
        # Set up a try statement - use a .get() method to pull the url and the parameters.
        async with httpx.AsyncClient(timeout=10.0) as client:
            label_ep = f"{settings.openfda_base}/label.json"
            response = await client.get(label_ep, params=param)
            # Raise a status from the response we're attempting to call.
            response.raise_for_status()
            # Parse the Json with .json()
            data = response.json()

            results = data["results"][0]  # Root level JSON

            openfda = results.get("openfda", {})

            return {
                'generic_name': zero(openfda.get("generic_name")),
                'brand_name': zero(openfda.get("brand_name")),
                'route': zero(openfda.get("route")),
                'rxcui': zero(openfda.get("rxcui")),
                'indication': zero(results.get("indications_and_usage")),
                'contraindications':   zero(results.get("contraindications")),
                'adverse_effects':     zero(results.get("adverse_reactions")),
                'mechanism_of_action': zero(results.get("mechanism_of_action")),
                'dose':                zero(results.get("dosage_and_administration")),
                'patient_teaching':    zero(results.get("information_for_patients"))
            }

    # Create an except of HTTPStatusError and RequestError
    except httpx.HTTPStatusError as error:
        print(f"opendFDA call is experiencing a server error: {error.response.status_code}: {error}")
        return None
    except httpx.RequestError as error:
        print(f"Could not connect to the API: {error}")
        return None

if __name__ == "__main__":
    pprint.pprint(asyncio.run(retrieve_openfda("insulin")))