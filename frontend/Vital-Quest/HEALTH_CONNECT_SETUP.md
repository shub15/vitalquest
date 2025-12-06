# Health Connect Android Permissions Fix

## Problem
Health Connect permissions are not declared in AndroidManifest.xml, causing SecurityException errors.

## Solution

### 1. Add Health Connect Permissions to AndroidManifest.xml

Open: `android/app/src/main/AndroidManifest.xml`

Add these permissions inside the `<manifest>` tag (before `<application>`):

```xml
<!-- Health Connect Permissions -->
<uses-permission android:name="android.permission.health.READ_STEPS"/>
<uses-permission android:name="android.permission.health.WRITE_STEPS"/>
<uses-permission android:name="android.permission.health.READ_DISTANCE"/>
<uses-permission android:name="android.permission.health.READ_EXERCISE"/>
<uses-permission android:name="android.permission.health.WRITE_EXERCISE"/>
<uses-permission android:name="android.permission.health.READ_SLEEP"/>
<uses-permission android:name="android.permission.health.WRITE_SLEEP"/>
<uses-permission android:name="android.permission.health.READ_HEART_RATE"/>
<uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED"/>
```

### 2. Add Health Connect Intent Filter

Inside the `<application>` tag, add:

```xml
<activity-alias
    android:name="ViewPermissionUsageActivity"
    android:exported="true"
    android:targetActivity=".MainActivity"
    android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
    <intent-filter>
        <action android:name="android.intent.action.VIEW_PERMISSION_USAGE"/>
        <category android:name="android.intent.category.HEALTH_PERMISSIONS"/>
    </intent-filter>
</activity-alias>
```

### 3. Complete AndroidManifest.xml Example

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  
  <!-- Internet and basic permissions -->
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/>
  
  <!-- Health Connect Permissions -->
  <uses-permission android:name="android.permission.health.READ_STEPS"/>
  <uses-permission android:name="android.permission.health.WRITE_STEPS"/>
  <uses-permission android:name="android.permission.health.READ_DISTANCE"/>
  <uses-permission android:name="android.permission.health.READ_EXERCISE"/>
  <uses-permission android:name="android.permission.health.WRITE_EXERCISE"/>
  <uses-permission android:name="android.permission.health.READ_SLEEP"/>
  <uses-permission android:name="android.permission.health.WRITE_SLEEP"/>
  <uses-permission android:name="android.permission.health.READ_HEART_RATE"/>
  <uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED"/>

  <application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:allowBackup="true"
    android:theme="@style/AppTheme">
    
    <activity
      android:name=".MainActivity"
      android:label="@string/app_name"
      android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
      android:launchMode="singleTask"
      android:windowSoftInputMode="adjustResize"
      android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN"/>
        <category android:name="android.intent.category.LAUNCHER"/>
      </intent-filter>
    </activity>
    
    <!-- Health Connect Intent Filter -->
    <activity-alias
        android:name="ViewPermissionUsageActivity"
        android:exported="true"
        android:targetActivity=".MainActivity"
        android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
        <intent-filter>
            <action android:name="android.intent.action.VIEW_PERMISSION_USAGE"/>
            <category android:name="android.intent.category.HEALTH_PERMISSIONS"/>
        </intent-filter>
    </activity-alias>
  </application>
</manifest>
```

### 4. Rebuild the App

After making these changes:

```bash
# Clean the build
cd android
./gradlew clean

# Go back to root
cd ..

# Rebuild and run
npm run android
```

### 5. Grant Permissions

When the app runs, it will request Health Connect permissions. You need to:
1. Open Health Connect app on your device
2. Go to App permissions
3. Find "Vital Quest"
4. Grant all requested permissions

## Why This Happens

Health Connect requires explicit permission declarations in AndroidManifest.xml. The `react-native-health-connect` library doesn't automatically add these to your manifest - you must add them manually.

## Verification

After fixing, you should see in logs:
```
[Health Connect] Permissions granted: true
[Health Connect] Total steps: <number>
```

Instead of SecurityException errors.
