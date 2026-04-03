import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const POPULAR_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
];

const CACHE_KEY = 'habex-exchange-rates';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

interface CachedRates {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

const getCachedRates = (base: string): Record<string, number> | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedRates = JSON.parse(cached);
    if (data.base !== base || Date.now() - data.timestamp > CACHE_DURATION) return null;
    return data.rates;
  } catch {
    return null;
  }
};

const setCachedRates = (base: string, rates: Record<string, number>) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, base, timestamp: Date.now() }));
};

const CurrencyConverter: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('1000');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async (base: string) => {
    const cached = getCachedRates(base);
    if (cached) {
      setRates(cached);
      setLastUpdated(new Date());
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRates(data.rates);
      setCachedRates(base, data.rates);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Exchange rate fetch error:', err);
      // Fallback approximate rates if API fails
      if (base === 'INR') {
        setRates({ USD: 0.012, EUR: 0.011, GBP: 0.0094, JPY: 1.78, AUD: 0.018, CAD: 0.016, AED: 0.044, SGD: 0.016, CHF: 0.011, CNY: 0.086, SAR: 0.045, INR: 1 });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates(fromCurrency);
  }, [fromCurrency, fetchRates]);

  const convertedAmount = rates[toCurrency]
    ? (parseFloat(amount || '0') * rates[toCurrency]).toFixed(2)
    : '—';

  const rate = rates[toCurrency] ? rates[toCurrency].toFixed(4) : '—';

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const fromInfo = POPULAR_CURRENCIES.find(c => c.code === fromCurrency);
  const toInfo = POPULAR_CURRENCIES.find(c => c.code === toCurrency);

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Currency Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="text-lg font-semibold"
          />
        </div>

        {/* Currency Selectors */}
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={swapCurrencies}
            className="mt-5 hover:bg-primary/10 rounded-full"
          >
            <motion.div whileTap={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <ArrowRightLeft className="w-4 h-4 text-primary" />
            </motion.div>
          </Button>

          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${fromCurrency}-${toCurrency}-${amount}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-muted/50 rounded-xl p-4 space-y-1"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {toInfo?.symbol}{convertedAmount}
              </span>
              <span className="text-sm text-muted-foreground">{toCurrency}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              1 {fromCurrency} = {rate} {toCurrency}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading rates...'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem(CACHE_KEY);
              fetchRates(fromCurrency);
            }}
            disabled={loading}
            className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
