# Meet Loca - End-to-End Testing Plan

## Test Environment Status
- ✅ Backend: Running on port 3001
- ✅ MongoDB Atlas: Connected (meetloca database)
- ✅ Frontend: http://localhost:5174
- ✅ APIs: Google Places API, AeroDataBox Flight API

---

## 1. Backend Server & Database ✅ VERIFIED

### Tests:
- [x] Server health check: `GET /api/health`
- [x] MongoDB connection established
- [x] Database: `meetloca` active
- [x] 1 existing trip found in database

### Current Status:
```
Server running on port 3001
MongoDB client connected
Using database: meetloca
```

---

## 2. Trip List & Dashboard 🔄 TO TEST

### Manual Test Steps:
1. Open browser: `http://localhost:5174`
2. Navigate to "My Trips" or home page
3. Verify existing trip displays:
   - Trip name: "duabi" (Dubai)
   - Dates: Nov 13-16, 2025
   - Status: Planning
   - Shows flight and hotel count

### Expected Results:
- [ ] Trip list loads from MongoDB
- [ ] Trip card shows correct info
- [ ] Click on trip navigates to details

### API Verification:
```bash
curl http://localhost:3001/api/trips
# Should return 1 trip with complete data
```

---

## 3. Create New Trip Wizard 🔄 TO TEST

### Manual Test Steps:
1. Click "Create New Trip" or "+ New Trip"
2. Fill in basic information:
   - **Trip Name**: "Paris Adventure"
   - **Destination**: "Paris, France"
   - **Start Date**: Pick a future date
   - **End Date**: Pick date after start date
   - **Budget**: 5000
   - **Travelers**: 2

### Field Validations to Test:
- [ ] Trip name required
- [ ] Start date required
- [ ] End date must be after start date
- [ ] Destination required

### Expected Results:
- [ ] Form validates required fields
- [ ] Shows validation errors
- [ ] Saves to MongoDB on submit
- [ ] Redirects to trip details page

---

## 4. Flight Search - One-Way ✈️ TO TEST

### Manual Test Steps:
1. Open trip details
2. Click "Add Flight"
3. Select "One Way"
4. Enter flight details:
   - **Flight Number**: `LY973`
   - **Flight Date**: `2025-11-13`
5. Click "Search Flight"

### Expected API Response:
```json
{
  "airline": "El Al",
  "flightNumber": "LY 973",
  "departureAirportCode": "TLV",
  "departureCity": "Tel Aviv Yafo",
  "departureDateTime": "2025-11-13 14:00+02:00",
  "arrivalAirportCode": "DXB",
  "arrivalCity": "Dubai",
  "arrivalDateTime": "2025-11-13 19:15+04:00",
  "duration": "5h 15m",
  "terminal": {"departure": "3", "arrival": "1"}
}
```

### Verify Display:
- [ ] Departure time shown in local time (14:00 Tel Aviv time)
- [ ] Arrival time shown in local time (19:15 Dubai time)
- [ ] Flight duration calculated: **5h 15m**
- [ ] Terminal info displayed (Dep: 3, Arr: 1)
- [ ] Baggage checkboxes appear
- [ ] Booking number field available

### Additional Fields to Fill:
- [ ] Price: 450
- [ ] Baggage: Check "Carry-on" and "Checked"
- [ ] Booking Number: ABC123456
- [ ] Booking Company: El Al

### Click "Add Flight":
- [ ] Flight saved to trip
- [ ] Returns to trip details
- [ ] Flight appears in itinerary

---

## 5. Flight Search - Round Trip ✈️ TO TEST

### Manual Test Steps:
1. Click "Add Flight"
2. Select "Round Trip"
3. **Outbound Flight**:
   - Flight Number: `LY973`
   - Date: `2025-11-13`
   - Click "Search Outbound Flight"
4. **Return Flight**:
   - Flight Number: `LY974`
   - Date: `2025-11-16`
   - Click "Search Return Flight"

### Expected Results:
- [ ] Outbound flight details populate (LY973)
  - Departure: 14:00 (TLV) → Arrival: 19:15 (DXB)
  - Duration: 5h 15m
- [ ] Return flight details populate (LY974)
  - Shows departure/arrival times in local timezone
  - Duration calculated automatically
- [ ] Two separate sections: "Outbound Flight" and "Return Flight"
- [ ] Each flight has its own:
  - Price field
  - Baggage checkboxes
  - Terminal info
  - Booking details

### Click "Add Flight":
- [ ] **TWO** flight records created
- [ ] Outbound flight: TLV → DXB
- [ ] Return flight: DXB → TLV
- [ ] Both appear in trip itinerary

---

## 6. Hotel Search & Add 🏨 TO TEST

### Manual Test Steps:
1. Click "Add Hotel"
2. Type in search: "Hilton Paris"
3. Select hotel from autocomplete dropdown
4. Fill in details:
   - Check-in: Start date
   - Check-out: End date
   - Price per night: 250
   - Booking confirmation: BOOKING789

### Expected Results:
- [ ] Autocomplete shows hotel suggestions from Google Places
- [ ] Selecting hotel populates:
  - Hotel name
  - Full address
  - Latitude/longitude
  - Rating (if available)
- [ ] Distance from airport calculated (if flight exists)
- [ ] Hotel saved to trip
- [ ] Appears in itinerary with dates

### API Verification:
```bash
curl "http://localhost:3001/api/hotels/autocomplete?input=Hilton%20Paris"
# Should return hotel predictions with placeId
```

---

## 7. Ride/Taxi Search & Add 🚗 TO TEST

### Manual Test Steps:
1. Click "Add Transportation"
2. Select type: "Taxi" or "Ride Share"
3. **Pickup Location**: Start typing "Dubai Airport"
4. **Drop-off Location**: Start typing hotel address
5. System calculates:
   - Distance
   - Travel time
6. Fill in:
   - Pickup time
   - Price: 50
   - Service: Uber/Careem

### Expected Results:
- [ ] Location autocomplete works (Google Places)
- [ ] Distance calculated automatically (Google Distance Matrix)
- [ ] Travel time shown (e.g., "25 mins")
- [ ] Ride saved with all details
- [ ] Appears in itinerary at correct day/time

### API Verification:
```bash
curl "http://localhost:3001/api/rides/autocomplete?input=Dubai%20Airport"
# Should return location predictions

curl "http://localhost:3001/api/rides/distance?origin=DXB&destination=lat,lng"
# Should return distance and duration
```

---

## 8. Attractions & Activities 🎭 TO TEST

### Manual Test Steps:
1. Click "Add Activity"
2. Search for: "Burj Khalifa"
3. Select from autocomplete
4. Fill in details:
   - Visit Date & Time
   - Duration: 2 hours
   - Cost: 150
   - Category: Sightseeing
   - Notes: "Observation deck tickets"

### Expected Results:
- [ ] Autocomplete shows attractions (Google Places)
- [ ] Each option has unique `placeId` (no duplicate key errors)
- [ ] Selecting populates:
  - Name
  - Address
  - Location
- [ ] Activity saved to trip
- [ ] Appears in correct day in itinerary

### Verify No Duplicate Keys:
- [ ] Console has no warnings about duplicate keys
- [ ] Fixed with `key={option.placeId}` in AttractionSearch

---

## 9. Trip Details & Itinerary Display 📅 TO TEST

### Manual Test Steps:
1. Navigate to trip details page
2. View complete itinerary

### Expected Display:
**Day 1 (Nov 13, 2025)**
- [ ] Flight LY973: TLV → DXB (14:00 - 19:15, Duration: 5h 15m)
- [ ] Ride: Airport → Hotel (19:30, Duration: 25 mins, Cost: $50)
- [ ] Hotel: Kempinski (Check-in, $323/night)

**Day 2 (Nov 14, 2025)**
- [ ] Activity: Burj Khalifa (10:00, Duration: 2h, Cost: $150)
- [ ] Hotel: Kempinski

**Day 3 (Nov 15, 2025)**
- [ ] Hotel: Kempinski (Check-out)

**Day 4 (Nov 16, 2025)**
- [ ] Flight LY974: DXB → TLV (Return flight)

### Summary Section:
- [ ] Total flights: 2
- [ ] Total hotels: 1  
- [ ] Total rides: 1
- [ ] Total activities: 1
- [ ] **Total Cost**: Sum of all items
- [ ] **Total Travel Time**: Sum of flight/ride durations

---

## 10. MongoDB Persistence 💾 TO TEST

### Test CRUD Operations:

#### CREATE:
1. Create new trip "Test Trip"
2. Refresh page (F5)
3. **Verify**: Trip still exists
4. **Check MongoDB**: 
   ```bash
   curl http://localhost:3001/api/trips | grep "Test Trip"
   ```

#### READ:
1. Navigate away from trip
2. Come back to trip list
3. **Verify**: All trips load correctly

#### UPDATE:
1. Open existing trip
2. Add a new flight/hotel/activity
3. Refresh page
4. **Verify**: New item persists

#### DELETE:
1. Delete a trip (if delete function exists)
2. Refresh page
3. **Verify**: Trip no longer appears
4. **Check MongoDB**: Trip removed from database

### Expected Results:
- [ ] All data persists across page refreshes
- [ ] No data loss on browser close/reopen
- [ ] MongoDB stores all trip changes
- [ ] Timestamps (createdAt, updatedAt) are set correctly

---

## 11. Error Handling ⚠️ TO TEST

### Flight Search Errors:
1. Enter invalid flight: `FAKE123`
2. Date: `2025-11-13`
3. Click Search
4. **Expected**: Error message "Flight not found" (NO MOCK DATA)

### Required Field Validation:
1. Try to save flight without airline
2. **Expected**: Validation error
3. Try to save hotel without name
4. **Expected**: Validation error

### API Failure Handling:
1. Stop backend server
2. Try to create trip
3. **Expected**: User-friendly error message

### Network Issues:
- [ ] Shows loading indicators during API calls
- [ ] Displays error messages when APIs fail
- [ ] No silent failures
- [ ] No mock data shown when real data unavailable

---

## 12. Final Integration Review ✅ TO TEST

### Complete User Journey:
1. ✅ **Start**: Open app → See trip list
2. ✅ **Create**: Make new trip → Fill details → Save
3. ✅ **Add Flight**: Search LY973 → Verify times/duration → Save
4. ✅ **Add Hotel**: Search → Select → Verify distance → Save
5. ✅ **Add Ride**: Enter locations → Check distance/time → Save
6. ✅ **Add Activity**: Search attraction → Set time/cost → Save
7. ✅ **View Itinerary**: See all items organized by day
8. ✅ **Check Costs**: Verify total cost calculation
9. ✅ **Refresh Page**: Confirm all data persists
10. ✅ **Complete**: Full trip with flights, hotels, rides, activities

### API Integration Checklist:
- [ ] **AeroDataBox**: Real flight data with times/durations
- [ ] **Google Places**: Hotels and attractions autocomplete
- [ ] **Google Distance Matrix**: Distance/time calculations
- [ ] **MongoDB Atlas**: All data persisted

### Console Checks:
- [ ] No JavaScript errors
- [ ] No duplicate React keys warnings
- [ ] No failed API calls (except intentional error tests)
- [ ] Proper loading states

### Data Quality:
- [ ] All times in local timezone at location
- [ ] Durations calculated correctly (flights: hours/minutes)
- [ ] Costs displayed with currency
- [ ] Dates formatted properly
- [ ] No "undefined" or "null" displayed to user

---

## Test Results Summary

**Backend Tests**: ✅ All Passing
- Server: Running
- MongoDB: Connected
- APIs: Configured

**Frontend Tests**: 🔄 Manual Testing Required
- Navigate to: http://localhost:5174
- Follow test steps 2-12 above
- Mark checkboxes as you verify each item

**Critical Issues Found**: (List any blockers here)

**Nice to Have Improvements**: (List enhancements here)

---

## Quick Test Commands

```bash
# Check backend status
curl http://localhost:3001/api/health

# Get all trips
curl http://localhost:3001/api/trips | python3 -m json.tool

# Test flight search
curl "http://localhost:3001/api/flights/search/LY973?date=2025-11-13" | python3 -m json.tool

# Test hotel autocomplete
curl "http://localhost:3001/api/hotels/autocomplete?input=Hilton" | python3 -m json.tool

# Check MongoDB data
curl http://localhost:3001/api/trips/690e66731f3a158d36480151 | python3 -m json.tool
```

---

**Ready to test!** Follow the manual test steps above and check off each item as you verify it works correctly. 🚀
