
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { PaymentConfirmationData, PaymentMethod } from '../types';

interface SantriPaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentConfirmationData;
  onConfirmPayment: (
    santriId: string,
    billDefinitionId: string,
    billingPeriod: string,
    amountPaid: number,
    paymentMethod: PaymentMethod, // Still passed, but will be TUNAI
    notes?: string
  ) => void;
}

const SantriPaymentConfirmationModal: React.FC<SantriPaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  onConfirmPayment,
}) => {
  const [amountPaid, setAmountPaid] = useState<number>(paymentData.nominalToPay);
  // const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.TUNAI); // No longer needed for selection
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(paymentData.nominalToPay);
      // setPaymentMethod(PaymentMethod.TUNAI); // Default is already TUNAI
      setNotes('');
    }
  }, [isOpen, paymentData.nominalToPay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPaid <= 0) {
        alert("Jumlah bayar harus lebih besar dari 0.");
        return;
    }
    onConfirmPayment(
      paymentData.santriId,
      paymentData.billDefinitionId,
      paymentData.billingPeriod,
      amountPaid,
      PaymentMethod.TUNAI, // Hardcode to TUNAI
      notes
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  
  const billingPeriodLabel = useMemo(() => {
    const [year, month] = paymentData.billingPeriod.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [paymentData.billingPeriod]);

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Pembayaran Santri">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-4 bg-base-200 rounded-lg shadow-inner space-y-1.5">
            <p className="text-sm text-base-content"><strong className={labelClass}>Nama Santri:</strong> {paymentData.santriName}</p>
            <p className="text-sm text-base-content"><strong className={labelClass}>Jenis Tagihan:</strong> {paymentData.billName}</p>
            <p className="text-sm text-base-content"><strong className={labelClass}>Periode Tagihan:</strong> {billingPeriodLabel}</p>
            <p className="text-sm text-base-content"><strong className={labelClass}>Nominal Tagihan:</strong> {formatCurrency(paymentData.nominalToPay)}</p>
        </div>

        <div>
          <label htmlFor="amountPaid" className={labelClass}>Jumlah Bayar (Rp) <span className="text-red-500">*</span></label>
          <input
            type="number"
            id="amountPaid"
            name="amountPaid"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            className={inputClass}
            min="1"
            required
          />
        </div>

        {/* Payment Method Select Removed */}
        {/* 
        <div>
          <label htmlFor="paymentMethod" className={labelClass}>Metode Pembayaran <span className="text-red-500">*</span></label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className={inputClass}
            required
          >
            {daftarPaymentMethod.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
        */}
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-md">
            <p className="text-sm text-sky-700"><strong className={labelClass}>Metode Pembayaran:</strong> Tunai (Otomatis)</p>
        </div>


        <div>
          <label htmlFor="notes" className={labelClass}>Catatan (Opsional)</label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Contoh: Pembayaran diterima oleh Ust. Fulan"
          />
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-base-300 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md"
          >
            Simpan Pembayaran
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SantriPaymentConfirmationModal;
