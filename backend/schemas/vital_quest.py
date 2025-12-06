from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


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
