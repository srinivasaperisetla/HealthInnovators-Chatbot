// app/nppes-test/page.tsx
'use client'

import { useState, FormEvent } from 'react'

type Provider = {
  basic: {
    first_name: string
    last_name: string
  }
  addresses?: Array<{
    address_purpose: string
    address_1?: string
    address_2?: string
    city?: string
    state?: string
    postal_code?: string
    telephone_number?: string
  }>
  taxonomies?: Array<{
    code?: string
    desc?: string
    primary?: boolean | 'Y' | 'N'
  }>
  number: string
}

export default function NppesTestPage() {
  const [city, setCity] = useState('')
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/nppes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, limit }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProviders(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test NPPES Lookup</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 border p-4 rounded-lg"
      >
        <label className="flex flex-col">
          City
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="mt-1 p-2 border rounded"
          />
        </label>

        <label className="flex flex-col">
          Limit
          <input
            type="number"
            value={limit}
            min={1}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="mt-1 p-2 border rounded"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Looking up…' : 'Fetch Providers'}
        </button>
      </form>

      {error && (
        <div className="text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}

      {providers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results ({providers.length})</h2>
          <ul className="space-y-4">
            {providers.map((p) => {
              // find practice location (address_purpose="LOCATION") :contentReference[oaicite:0]{index=0}
              const practice = p.addresses?.find(a => a.address_purpose === 'LOCATION')
              // find primary taxonomy entry :contentReference[oaicite:1]{index=1}
              const primaryTax = p.taxonomies?.find(t => t.primary === true || t.primary === 'Y')

              return (
                <li key={p.number} className="border p-4 rounded-lg">
                  {/* Name */}
                  <div className="font-medium text-lg">
                    {p.basic.first_name} {p.basic.last_name}
                  </div>

                  {/* Address */}
                  {practice && (
                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Address:</strong>{' '}
                      {[practice.address_1, practice.address_2]
                        .filter(Boolean)
                        .join(' ')},{' '}
                      {practice.city}, {practice.state} {practice.postal_code}
                    </div>
                  )}

                  {/* Phone */}
                  {practice?.telephone_number && (
                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Phone:</strong> {practice.telephone_number}
                    </div>
                  )}

                  {/* Primary Taxonomy */}
                  {primaryTax?.desc && (
                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Primary Taxonomy:</strong> {primaryTax.desc} ({primaryTax.code})
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
