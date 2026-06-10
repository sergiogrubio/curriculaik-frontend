import { useState, useEffect } from 'react'

const BASE_URL = 'https://api.frankfurter.app/latest?from=USD&to=EUR,GBP'

export function useExchangeRate() {
  const [rates, setRates] = useState({ USD: 1, EUR: null, GBP: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    // Check cache first (refresh every 60 minutes)
    const cached = localStorage.getItem('exchange_rates')
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const ageMinutes = (Date.now() - timestamp) / 1000 / 60
      if (ageMinutes < 60) {
        setRates({ USD: 1, ...data.rates })
        setLastUpdated(new Date(timestamp))
        setLoading(false)
        return
      }
    }

    fetch(BASE_URL)
      .then(res => res.json())
      .then(data => {
        const newRates = { USD: 1, ...data.rates }
        setRates(newRates)
        setLastUpdated(new Date())
        localStorage.setItem('exchange_rates', JSON.stringify({
          data,
          timestamp: Date.now()
        }))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const convert = (amountUSD, toCurrency) => {
    if (toCurrency === 'USD') return amountUSD
    const rate = rates[toCurrency]
    if (!rate) return amountUSD
    return amountUSD * rate
  }

  return { rates, loading, error, convert, lastUpdated }
}
