from pydantic import BaseModel
from typing import Optional, Dict, Any

class HealthData(BaseModel):
    user_id: str
    date: str
    steps: int
    heart_rate_avg: Optional[float] = None
    sleep_total_minutes: Optional[int] = 0
    sleep_deep_minutes: Optional[int] = 0
    sleep_light_minutes: Optional[int] = 0
    calories_burned: Optional[float] = 0

class UserProfile(BaseModel):
    user_id: str
    username: Optional[str]
    team_id: Optional[str]
    height_cm: Optional[int]
    weight_kg: Optional[int]
    rpg_stats: Optional[Dict[str, Any]]

class XPResult(BaseModel):
    user_id: str
    xp_gained: float
    new_xp_total: int
    leveled_up: bool
    new_level: int

class BattleCreate(BaseModel):
    team_a_id: str
    team_b_id: str
    start_date: str
    end_date: str


# Additional models for DailyLog and manual workouts (from user's attachment)
from enum import Enum
from datetime import datetime, date
from typing import List
from pydantic import Field


class SleepStage(str, Enum):
    deep = "deep"
    light = "light"
    rem = "rem"


class SleepSegment(BaseModel):
    start_time: datetime
    end_time: datetime
    stage: SleepStage
    duration_minutes: int = Field(..., ge=0)


class HeartRateSample(BaseModel):
    timestamp: datetime
    bpm: int = Field(..., ge=0)


class ManualWorkout(BaseModel):
    activity_type: str
    duration_minutes: int = Field(..., ge=0)
    intensity_rpe: int = Field(..., ge=1, le=10)
    calories_burnt: int = Field(..., ge=0)
    notes: Optional[str] = None


class DailyLog(BaseModel):
    date: date
    total_steps: int = Field(..., ge=0)
    total_calories_active: float = Field(..., ge=0)
    sleep_segments: List[SleepSegment] = Field(default_factory=list)
    heart_rate_samples: List[HeartRateSample] = Field(default_factory=list)
    manual_workouts: List[ManualWorkout] = Field(default_factory=list)
