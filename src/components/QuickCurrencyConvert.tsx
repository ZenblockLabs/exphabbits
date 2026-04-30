import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CURRENCIES = [
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', flag: '🇸🇬' },
  { code: 'CHF', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', flag: '🇨🇳' },
  { code: 'SAR', symbol: '﷼', flag: '🇸🇦' },
];

const FALLBACK_RATES: Record<string, number> = {
  USD: 83.5, EUR: 91.2, GBP: 106.1, JPY: 0.56, AUD: 54.8,
  CAD: 62.1, AED: 22.7, SGD: 62.5, CHF: 94.3, CNY: 11.5, SAR: 22.3,
};

const CACHE_KEY = 'habex-exchange-rates';
const CACHE_DURATION = 60 * 60 * 1000;

type RateSource = 'live' | 'cached' | 'fallback';

export interface CurrencyConversionDetails {
  inrAmount: number;
  foreignAmount: number;
  currency: string;
  symbol: string;
  rate: number;
  source: RateSource;
  storeOriginal: boolean;
}

interface QuickCurrencyConvertProps {
  onConvert: (details: CurrencyConversionDetails) => void;
}

const QuickCurrencyConvert: React.FC<QuickCurrencyConvertProps> = ({ onConvert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [foreignAmount, setForeignAmount] = useState('');
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [rateSource, setRateSource] = useState<RateSource>('fallback');
  const [loading, setLoading] = useState(false);
  const [storeOriginal, setStoreOriginal] = useState(true);

  const fetchRates = useCallback(async () => {
    const forceFallback = new URLSearchParams(window.location.search).has('forceRatesFallback');

    try {
      if (!forceFallback) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION && data) {
            const inrRates: Record<string, number> = {};
            CURRENCIES.forEach(c => {
              if (data[c.code] && data['INR']) {
                inrRates[c.code] = data['INR'] / data[c.code];
              }
            });
            if (Object.keys(inrRates).length > 0) {
              setRates(inrRates);
              setRateSource('cached');
            }
            return;
          }
        }
      }

      setLoading(true);
      if (forceFallback) throw new Error('Fallback mode requested');

      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!res.ok) throw new Error('Rate request failed');

      const json = await res.json();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: json.rates, timestamp: Date.now() }));
      const inrRates: Record<string, number> = {};
      CURRENCIES.forEach(c => {
        if (json.rates[c.code] && json.rates['INR']) {
          inrRates[c.code] = json.rates['INR'] / json.rates[c.code];
        }
      });
      if (Object.keys(inrRates).length > 0) {
        setRates(inrRates);
        setRateSource('live');
      }
    } catch {
      setRates(FALLBACK_RATES);
      setRateSource('fallback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchRates();
  }, [isOpen, fetchRates]);

  const numericForeignAmount = parseFloat(foreignAmount) || 0;
  const rate = rates[fromCurrency] || 0;
  const convertedINR = numericForeignAmount * rate;
  const selectedCurrency = CURRENCIES.find(c => c.code === fromCurrency);

  const handleUseAmount = () => {
    if (convertedINR > 0 && selectedCurrency) {
      onConvert({
        inrAmount: Math.round(convertedINR * 100) / 100,
        foreignAmount: numericForeignAmount,
        currency: fromCurrency,
        symbol: selectedCurrency.symbol,
        rate,
        source: rateSource,
        storeOriginal,
      });
      setForeignAmount('');
      setIsOpen(false);
    }
  };

  return (
    <div className="mb-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-xs"
      >
        <Globe className="w-3.5 h-3.5" />
        {isOpen ? 'Close Converter' : 'Convert Foreign Currency → ₹'}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Foreign Amount</label>
                  <div className="flex gap-2">
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="w-[120px] h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-1.5">
                              <span>{c.flag}</span>
                              <span>{c.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={foreignAmount}
                      onChange={e => setForeignAmount(e.target.value)}
                      placeholder={`${selectedCurrency?.symbol || ''} Amount`}
                      className="h-9 text-sm flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2">
                <Checkbox
                  id="store-original-currency"
                  checked={storeOriginal}
                  onCheckedChange={(checked) => setStoreOriginal(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="store-original-currency" className="text-xs leading-relaxed cursor-pointer">
                  Store original currency value and rate as an Other Expenses note
                </Label>
              </div>

              {foreignAmount && convertedINR > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 rounded-md bg-primary/10 p-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {selectedCurrency?.flag} {selectedCurrency?.symbol}{numericForeignAmount.toLocaleString()}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold text-primary">
                      🇮🇳 ₹{convertedINR.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUseAmount}
                    className="h-7 text-xs px-3"
                  >
                    Use ₹ Amount
                  </Button>
                </motion.div>
              )}

              {loading && (
                <p className="text-xs text-muted-foreground">Fetching latest rates...</p>
              )}

              <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <p>
                  Rate: 1 {fromCurrency} = ₹{rate?.toFixed(2) || '—'} · {rateSource === 'fallback' ? 'Using offline fallback rate because live rates are unavailable.' : rateSource === 'cached' ? 'Using recently cached live rate.' : 'Using live exchange rate.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickCurrencyConvert;
