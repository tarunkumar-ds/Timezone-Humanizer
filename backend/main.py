from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
import pytz
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TimeRequest(BaseModel):
    base_time: str
    base_zone: str
    zones: list[str]

@app.post("/convert-time")
def convert_time(req: TimeRequest):
    base_tz = pytz.timezone(req.base_zone)

    # Use TODAY's date
    now = datetime.now(base_tz)
    base_dt = datetime.strptime(req.base_time, "%H:%M")
    base_dt = now.replace(hour=base_dt.hour, minute=base_dt.minute, second=0)
    base_dt = base_tz.localize(base_dt.replace(tzinfo=None))

    results = []

    for zone in req.zones:
        tz = pytz.timezone(zone)
        converted = base_dt.astimezone(tz)

        day_offset = (converted.date() - base_dt.date()).days

        results.append({
            "zone": zone,
            "local_time": converted.strftime("%H:%M"),
            "day_offset": day_offset
        })

    return results
