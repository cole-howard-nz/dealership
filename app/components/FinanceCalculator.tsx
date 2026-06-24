"use client";

import { useMemo, useState } from "react";
import Link from 'next/link'
import { Percent } from "lucide-react";
import { formatPrice } from "../lib/format";

const RATE = 0.0995; // illustrative flat annual rate, replace with real lender rate

interface Props {
  defaultPrice?: number;
  vehicleId?: string;
}

export function FinanceCalculator({ defaultPrice = 25000, vehicleId }: Props) {
  const [price, setPrice] = useState(defaultPrice);
  const [deposit, setDeposit] = useState(Math.round(defaultPrice * 0.1));
  const [term, setTerm] = useState(60);

  const depositError = deposit > price ? "Deposit can't exceed the purchase price." : "";

  const monthly = useMemo(() => {
    if (depositError) return null;
    const principal = price - deposit;
    const monthlyRate = RATE / 12;
    const n = term;
    if (principal <= 0) return 0;
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    return Math.round(payment);
  }, [price, deposit, term, depositError]);

  return (
    <div className="bg-surface border border-border rounded-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Percent className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="font-heading font-semibold text-lg">Estimate your repayments</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="text-sm font-semibold flex flex-col gap-1">
          Purchase price
          <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))}
            className="rounded-sm border border-border px-3 py-2 font-normal" />
        </label>
        <label className="text-sm font-semibold flex flex-col gap-1">
          Deposit / trade-in
          <input type="number" min={0} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))}
            className="rounded-sm border border-border px-3 py-2 font-normal" />
        </label>
        <label className="text-sm font-semibold flex flex-col gap-1">
          Term (months)
          <select value={term} onChange={(e) => setTerm(Number(e.target.value))} className="rounded-sm border border-border px-3 py-2 font-normal">
            {[12, 24, 36, 48, 60].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {depositError ? (
        <p className="text-sm text-error mt-4" role="alert">{depositError}</p>
      ) : (
        <p className="text-2xl font-bold mt-5">
          {monthly !== null ? formatPrice(monthly) : "—"} <span className="text-sm font-normal text-ink-muted">/ month estimate</span>
        </p>
      )}
      <p className="text-xs text-ink-muted mt-2">
        Estimate only, based on an illustrative {Math.round(RATE * 1000) / 10}% p.a. rate. Not a quote or offer of credit.
      </p>

      <Link
        href={`/finance/apply${vehicleId ? `?vehicleId=${vehicleId}&price=${price}&deposit=${deposit}&term=${term}` : ""}`}
        className="inline-flex mt-4 items-center justify-center rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-hover"
      >
        Apply Now
      </Link>
    </div>
  );
}
