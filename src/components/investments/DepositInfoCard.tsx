import React from 'react';
import { Calendar, Percent, ShieldCheck, Clock } from 'lucide-react';
import { InvestmentHolding } from '../../types/finance';
import { formatDate, formatCurrency } from '../../lib/finance/formatters';

interface DepositInfoCardProps {
  holding: InvestmentHolding;
}

export const DepositInfoCard: React.FC<DepositInfoCardProps> = ({ holding }) => {
  const { principalAmount, interestRate, openedAt, maturityDate, currency, status } = holding;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const maturity = maturityDate ? new Date(maturityDate) : null;
  if (maturity) maturity.setHours(0, 0, 0, 0);

  const diffTime = maturity ? maturity.getTime() - now.getTime() : 0;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const isMatured = status === 'matured' || (maturity && now >= maturity);
  const interestEarnedEstimate = principalAmount && interestRate
    ? principalAmount * interestRate * ((maturity && openedAt) 
        ? (maturity.getTime() - new Date(openedAt).getTime()) / (1000 * 60 * 60 * 24 * 365) 
        : 1)
    : 0;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3.5 text-xs select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fixed Deposit Terms</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
            status === 'active' && !isMatured
              ? 'bg-blue-50 text-blue-600'
              : status === 'matured' || isMatured
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {status === 'active' && isMatured ? 'Matured (Pending Close)' : status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3.5 gap-x-2.5">
        <div className="flex items-start gap-2">
          <Percent size={14} className="text-primary mt-0.5" />
          <div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Interest Rate</span>
            <span className="font-extrabold text-slate-700">
              {interestRate ? `${(interestRate * 100).toFixed(2)}% p.a.` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <ShieldCheck size={14} className="text-emerald-500 mt-0.5" />
          <div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Est. Total Yield</span>
            <span className="font-extrabold text-slate-700">
              {interestEarnedEstimate > 0 ? formatCurrency(interestEarnedEstimate, currency) : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar size={14} className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Placement Dates</span>
            <span className="font-extrabold text-slate-700 block">
              Opened: {openedAt ? formatDate(openedAt) : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Maturity: {maturityDate ? formatDate(maturityDate) : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock size={14} className="text-indigo-400 mt-0.5" />
          <div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Time to Maturity</span>
            {status === 'closed' || status === 'matured' ? (
              <span className="font-extrabold text-slate-500 uppercase">Deposit Completed</span>
            ) : daysRemaining > 0 ? (
              <span className="font-extrabold text-indigo-600 animate-pulse">
                {daysRemaining} Days Left
              </span>
            ) : (
              <span className="font-extrabold text-emerald-600 uppercase">Ready to Redeem</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DepositInfoCard;
