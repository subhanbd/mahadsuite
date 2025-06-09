

import React from 'react';
import { Santri, BillDefinition, SantriPaymentRecord, PesantrenProfileData } from '../types';

interface PaymentReceiptProps {
  santri: Santri;
  billDefinition: BillDefinition;
  paymentRecord: SantriPaymentRecord;
  pesantrenProfile: PesantrenProfileData;
  namaKelas?: string; // Added prop
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ santri, billDefinition, paymentRecord, pesantrenProfile, namaKelas }) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const formatBillingPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white text-black p-8 font-sans" style={{ width: '210mm', minHeight: '100mm', margin: '0 auto', border: '1px solid #ccc' }}>
      <header className="text-center mb-6 pb-4 border-b-2 border-black">
        <h1 className="text-2xl font-bold uppercase">{pesantrenProfile.namaPesantren}</h1>
        <p className="text-sm">{pesantrenProfile.alamatLengkap}</p>
        {pesantrenProfile.nomorTelepon && <p className="text-sm">Telp: {pesantrenProfile.nomorTelepon}</p>}
      </header>

      <section className="mb-6 text-center">
        <h2 className="text-xl font-semibold uppercase underline">Bukti Pembayaran</h2>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-x-4 text-sm">
        <div>
          <p><strong className="font-semibold">No. Transaksi:</strong> {paymentRecord.id.substring(0, 8).toUpperCase()}</p>
          <p><strong className="font-semibold">Tanggal Bayar:</strong> {formatDate(paymentRecord.paymentDate)}</p>
        </div>
        <div className="text-right">
           <p><strong className="font-semibold">Metode Bayar:</strong> {paymentRecord.paymentMethod}</p>
        </div>
      </section>

      <section className="mb-6 p-4 border border-gray-300 rounded">
        <h3 className="text-md font-semibold mb-2">Data Santri:</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="font-medium pr-2 py-0.5 w-1/3">Nama Lengkap</td>
              <td className="pr-1 py-0.5 w-px">:</td>
              <td className="py-0.5">{santri.namalengkap}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 py-0.5">Nomor KTT</td>
              <td className="pr-1 py-0.5">:</td>
              <td className="py-0.5">{santri.nomorktt || '-'}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 py-0.5">Kelas</td>
              <td className="pr-1 py-0.5">:</td>
              <td className="py-0.5">{namaKelas || '-'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h3 className="text-md font-semibold mb-2">Rincian Pembayaran:</h3>
        <table className="w-full text-sm border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Deskripsi Tagihan</th>
              <th className="border border-gray-300 p-2 text-left">Periode</th>
              <th className="border border-gray-300 p-2 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{billDefinition.namaTagihan}</td>
              <td className="border border-gray-300 p-2">{formatBillingPeriod(paymentRecord.billingPeriod)}</td>
              <td className="border border-gray-300 p-2 text-right">{formatCurrency(billDefinition.nominal)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="font-semibold bg-gray-50">
              <td colSpan={2} className="border border-gray-300 p-2 text-right">Jumlah Dibayar:</td>
              <td className="border border-gray-300 p-2 text-right">{formatCurrency(paymentRecord.amountPaid)}</td>
            </tr>
            <tr className="font-bold text-lg bg-green-100 text-green-700">
              <td colSpan={2} className="border border-gray-300 p-2 text-right">STATUS:</td>
              <td className="border border-gray-300 p-2 text-right">LUNAS</td>
            </tr>
          </tfoot>
        </table>
      </section>
      
      {paymentRecord.notes && (
        <section className="mb-6 text-sm">
          <h3 className="text-md font-semibold mb-1">Catatan:</h3>
          <p className="italic p-2 border border-gray-200 rounded bg-gray-50">{paymentRecord.notes}</p>
        </section>
      )}

      <footer className="mt-12 pt-8 text-sm text-center">
        <div className="grid grid-cols-2 gap-8">
            <div>
                <p className="mb-12">Bendahara,</p>
                <p>(_________________________)</p>
            </div>
            <div>
                <p className="mb-1">Terima kasih atas pembayarannya.</p>
                <p className="text-xs text-gray-600">Bukti ini sah dan dicetak oleh sistem.</p>
                <p className="text-xs text-gray-500 mt-4">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default PaymentReceipt;
