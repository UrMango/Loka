import { useState } from 'react'
import { createTrip } from '../services/api'
import type { Trip } from '../types/domain'
import { useNavigate } from 'react-router-dom'
import { AddFlightForm, AddHotelForm, AddRideForm, AddAttractionForm } from '../components/AddItemForms'

interface BasicInfo { name: string; destinations: string; startDate: string; endDate: string }

const steps = ['Basic Info','Flights','Hotels','Rides','Attractions','Review'] as const

export default function NewTripWizard() {
  const [step, setStep] = useState<number>(0)
  const [basic, setBasic] = useState<BasicInfo>({ name: '', destinations: '', startDate: '', endDate: '' })
  const [creating, setCreating] = useState(false)
  const [trip, setTrip] = useState<Trip | null>(null)
  const navigate = useNavigate()

  const next = () => setStep(s => Math.min(s+1, steps.length-1))
  const prev = () => setStep(s => Math.max(s-1, 0))

  async function createBasicTrip() {
    if (!basic.name || !basic.startDate || !basic.endDate) return
    setCreating(true)
    try {
      const newTrip = await createTrip({
        name: basic.name,
        destinations: basic.destinations.split(',').map(d => d.trim()).filter(Boolean),
        startDate: basic.startDate,
        endDate: basic.endDate,
        flights: [], hotels: [], rides: [], attractions: []
      } as any)
      setTrip(newTrip)
      next()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message)
    } finally { setCreating(false) }
  }

  const canFinish = !!trip

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">New Trip Wizard</h1>
      <div className="flex gap-2 flex-wrap">
        {steps.map((label,i) => (
          <div key={label} className={`px-3 py-1 rounded text-sm ${i===step?'bg-primary text-white':'bg-gray-100 text-gray-600'}`}>{label}</div>
        ))}
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Trip Name</label>
            <input className="mt-1 w-full bg-white border border-gray-300 rounded px-3 py-2" value={basic.name} onChange={e=>setBasic({...basic,name:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium">Destinations (comma separated)</label>
            <input className="mt-1 w-full bg-white border border-gray-300 rounded px-3 py-2" value={basic.destinations} onChange={e=>setBasic({...basic,destinations:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input type="date" className="mt-1 w-full bg-white border border-gray-300 rounded px-3 py-2" value={basic.startDate} onChange={e=>setBasic({...basic,startDate:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input type="date" className="mt-1 w-full bg-white border border-gray-300 rounded px-3 py-2" value={basic.endDate} onChange={e=>setBasic({...basic,endDate:e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={!basic.name || !basic.startDate || !basic.endDate || creating}
              onClick={createBasicTrip}
              className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
            >
              {creating ? 'Creating…' : (trip ? 'Update Trip' : 'Create Trip')}
            </button>
            <button
              onClick={async ()=>{ if(!trip){ await createBasicTrip(); if(!trip) return } next() }}
              disabled={!basic.name || !basic.startDate || !basic.endDate || creating}
              className="px-4 py-2 rounded bg-secondary text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Flights step */}
      {step === 1 && (
        <StepCard title="Add Flights" subtitle={trip ? `Trip: ${trip.name}` : 'Create the trip first to add items.'}>
          {trip ? (
            <div className="space-y-4">
              <AddFlightForm tripId={trip.id} onUpdated={setTrip} />
              {trip.flights.length>0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Flights added</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {trip.flights.map((f,i)=> (
                      <li key={i}>{f.flightNumber} {f.departureAirportCode}→{f.arrivalAirportCode} ({(f.departureDateTime||'').slice(0,10)})</li>
                    ))}
                  </ul>
                </div>
              )}
              <WizardNav onBack={prev} onNext={next} />
            </div>
          ) : (
            <WizardNav onBack={prev} onNext={next} nextDisabled />
          )}
        </StepCard>
      )}

      {/* Hotels step */}
      {step === 2 && (
        <StepCard title="Add Hotels" subtitle={trip ? `Trip: ${trip.name}` : 'Create the trip first to add items.'}>
          {trip ? (
            <div className="space-y-4">
              <AddHotelForm tripId={trip.id} onUpdated={setTrip} />
              {trip.hotels.length>0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Hotels added</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {trip.hotels.map((h,i)=> (
                      <li key={i}>{h.name} ({h.checkIn} → {h.checkOut})</li>
                    ))}
                  </ul>
                </div>
              )}
              <WizardNav onBack={prev} onNext={next} />
            </div>
          ) : (
            <WizardNav onBack={prev} onNext={next} nextDisabled />
          )}
        </StepCard>
      )}

      {/* Rides step */}
      {step === 3 && (
        <StepCard title="Add Rides" subtitle={trip ? `Trip: ${trip.name}` : 'Create the trip first to add items.'}>
          {trip ? (
            <div className="space-y-4">
              <AddRideForm tripId={trip.id} onUpdated={setTrip} />
              {trip.rides.length>0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Rides added</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {trip.rides.map((r,i)=> (
                      <li key={i}>{r.pickup} → {r.dropoff} {r.distance? `(${r.distance})`:''}</li>
                    ))}
                  </ul>
                </div>
              )}
              <WizardNav onBack={prev} onNext={next} />
            </div>
          ) : (
            <WizardNav onBack={prev} onNext={next} nextDisabled />
          )}
        </StepCard>
      )}

      {/* Attractions step */}
      {step === 4 && (
        <StepCard title="Add Attractions" subtitle={trip ? `Trip: ${trip.name}` : 'Create the trip first to add items.'}>
          {trip ? (
            <div className="space-y-4">
              <AddAttractionForm tripId={trip.id} onUpdated={setTrip} />
              {trip.attractions.length>0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Attractions added</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {trip.attractions.map((a,i)=> (
                      <li key={i}>{a.name} {a.scheduledDate? `(${a.scheduledDate}${a.scheduledTime? ' '+a.scheduledTime:''})`:''}</li>
                    ))}
                  </ul>
                </div>
              )}
              <WizardNav onBack={prev} onNext={next} />
            </div>
          ) : (
            <WizardNav onBack={prev} onNext={next} nextDisabled />
          )}
        </StepCard>
      )}

      {/* Review step */}
      {step === 5 && (
        <StepCard title="Review & Finish" subtitle={trip ? `Trip: ${trip.name}` : 'Create the trip first.'}>
          {trip ? (
            <div className="space-y-4">
              <div className="rounded border p-3 bg-white">
                <div className="font-medium">Summary</div>
                <ul className="text-sm text-gray-700 list-disc pl-5 mt-2">
                  <li>Dates: {trip.startDate} → {trip.endDate}</li>
                  {trip.destinations?.length ? <li>Destinations: {trip.destinations.join(', ')}</li> : null}
                  <li>Flights: {trip.flights.length}</li>
                  <li>Hotels: {trip.hotels.length}</li>
                  <li>Rides: {trip.rides.length}</li>
                  <li>Attractions: {trip.attractions.length}</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="px-4 py-2 rounded bg-gray-200">Back</button>
                <button disabled={!canFinish} onClick={()=>navigate(`/trips/${trip!.id}`)} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50">Finish</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={prev} className="px-4 py-2 rounded bg-gray-200">Back</button>
              <button disabled className="px-4 py-2 rounded bg-primary text-white opacity-50">Finish</button>
            </div>
          )}
        </StepCard>
      )}
    </div>
  )
}

function StepCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-lg font-semibold">{title}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
      <div className="rounded border border-gray-200 bg-white p-4">
        {children}
      </div>
    </div>
  )
}

function WizardNav({ onBack, onNext, nextDisabled }: { onBack: ()=>void; onNext: ()=>void; nextDisabled?: boolean }) {
  return (
    <div className="flex gap-2">
      <button onClick={onBack} className="px-4 py-2 rounded bg-gray-200">Back</button>
      <button onClick={onNext} disabled={!!nextDisabled} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50">Next</button>
    </div>
  )
}

