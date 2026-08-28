### RXNorm is to grab the ID of the medication

import httpx
import asyncio
from app.config import settings

async def retrieve_rxnorm_drug(drug_name: str) -> str | None:
    param = {
        "name": drug_name
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            url = f"{settings.rxnorm_base}/rxcui.json"
            response = await client.get(url, params=param)

            response.raise_for_status()

            data = response.json()

            id_group = data.get('idGroup', {})
            rxnorm_id = id_group.get('rxnormID')

            if not rxnorm_id:  # Catch both None and []
                return None

            return rxnorm_id[0]

        except httpx.HTTPStatusError as error:  # This covers a server response error -- Application/Protocol Level
            print(f"RxNorm API returned a error status {error.response.status_code}: {error}")
            return None
        except httpx.RequestError as error:  # This covers a communication response error -- Network/Transport level
            print(f"Request to fetch API failed: {error}")
            return None

if __name__ == "__main__":
    asyncio.run(retrieve_rxnorm_drug("asdfgh"))