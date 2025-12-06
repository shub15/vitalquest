from datetime import date, timedelta, datetime
import random
from schemas.vital_quest import DailyLog, SleepSegment, SleepStage, ManualWorkout

def generate_dummy_data(days: int = 365) -> list[DailyLog]:
    """Generates dummy DailyLog data for the past 'days'."""
    today = date.today()
    logs = []
    
    activities = ["Gym", "Run", "Yoga", "Swim", "Cycle", "Hike"]
    
    for i in range(days):
        d = today - timedelta(days=i)
        
        # Randomize stats
        steps = random.randint(3000, 15000)
        active_cals = steps * 0.04 + random.randint(100, 500)
        
        # Sleep
        sleep_dur = random.randint(300, 540) # 5h to 9h
        deep_min = random.randint(30, 120)
        
        # Create base datetime for that day (approx)
        base_dt = datetime.combine(d, datetime.min.time())
        
        segments = [
            SleepSegment(
                start_time=base_dt.replace(hour=23), 
                end_time=base_dt.replace(hour=7), # +1 day ideally but keeping simple for dummy
                stage=SleepStage.light,
                duration_minutes=sleep_dur - deep_min
            ),
             SleepSegment(
                start_time=base_dt.replace(hour=2),
                end_time=base_dt.replace(hour=3),
                stage=SleepStage.deep,
                duration_minutes=deep_min
            )
        ]
        
        # Workout (randomly skip)
        workouts = []
        if random.random() > 0.3:
            workouts.append(ManualWorkout(
                activity_type=random.choice(activities),
                duration_minutes=random.randint(30, 90),
                intensity_rpe=random.randint(4, 9),
                calories_burnt=random.randint(200, 800)
            ))

        # Note: We skip heart rate samples for bulk dummy data to keep it light 
        # as aggregation usually looks at high level metrics.
        
        logs.append(DailyLog(
            date=d,
            total_steps=steps,
            total_calories_active=active_cals,
            sleep_segments=segments,
            heart_rate_samples=[],
            manual_workouts=workouts
        ))
        
    return logs

# Cache dummy data in memory
DUMMY_DB = generate_dummy_data(365)

def get_aggregated_stats(timeframe: str) -> dict:
    """
    Timeframe: 'daily', 'weekly', 'monthly', 'yearly'
    """
    # Filter data
    # daily = today
    # weekly = last 7 days
    # monthly = last 30 days
    # yearly = last 365 days
    
    limit = 1
    if timeframe == 'weekly': limit = 7
    elif timeframe == 'monthly': limit = 30
    elif timeframe == 'yearly': limit = 365
    
    # DUMMY_DB is sorted desc by date (generated that way)
    relevant_logs = DUMMY_DB[:limit]
    
    if not relevant_logs:
        return {}

    # Aggregate
    total_steps = sum(l.total_steps for l in relevant_logs)
    total_cals = sum(l.total_calories_active for l in relevant_logs)
    
    total_sleep_mins = sum(sum(s.duration_minutes for s in l.sleep_segments) for l in relevant_logs)
    avg_sleep_mins = total_sleep_mins / limit
    
    # Workout stats
    workout_count = sum(len(l.manual_workouts) for l in relevant_logs)
    all_workouts = [w for l in relevant_logs for w in l.manual_workouts]
    
    top_activity = "None"
    if all_workouts:
        # Simple mode
        counts = {}
        for w in all_workouts:
            counts[w.activity_type] = counts.get(w.activity_type, 0) + 1
        top_activity = max(counts, key=counts.get)

    return {
        "title": f"Your {timeframe.capitalize()} Recap",
        "total_steps": total_steps,
        "avg_steps": int(total_steps / limit),
        "total_calories": int(total_cals),
        "avg_sleep_hours": round(avg_sleep_mins / 60, 1),
        "total_workouts": workout_count,
        "favorite_activity": top_activity,
        "period_days": limit
    }
