import httpx
import asyncio
from app.config import settings

# Set up an async function to -- have 'drug_name' as the parameter and pull null
async def retrieve_openfda(drug_name: str) -> str | None:
    # set up the parameters
    param = {
        "search": f"openfda.generic_name:{drug_name}",
        "limit": 1
    }

    try:
        # Set up a try statement - use a .get() method to pull the url and the parameters.
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = settings.openfda_base
            response = await client.get(url, params=param)
            # Raise a status from the response we're attempting to call.
            response.raise_for_status()
            # Parse the Json with .json()
            data = response.json()
            print(data)

    # Create an except of HTTPStatusError and RequestError
    except httpx.HTTPStatusError as error:
        print(f"opendFDA call is experiencing a server error: {error.response.status_code}: {error}")
        return None
    except httpx.RequestError as error:
        print(f"Could not connect to the API: {error}")
        return None

if __name__ == "__main__":
    asyncio.run(retrieve_openfda("insulin"))