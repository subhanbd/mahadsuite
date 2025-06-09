
import React from 'react';
import { BillDefinition, UserRole } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';

interface FinancialManagementViewProps {
  billDefinitions: BillDefinition[];
  onAddBillDefinition: () => void;
  onEditBillDefinition: (billDef: BillDefinition) => void;
  onDeleteBillDefinition: (billDefId: string) => void;
  currentUserRole: UserRole;
}

const FinancialManagementView: React.FC<FinancialManagementViewProps> = ({ 
  billDefinitions, 
  onAddBillDefinition, 
  onEditBillDefinition, 
  onDeleteBillDefinition,
  currentUserRole
}) => {
  
  const isAdmin = currentUserRole === UserRole.ADMINISTRATOR_UTAMA;

  const buttonClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100";
  const editButtonClass = `${buttonClass} text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500`;
  const deleteButtonClass = `${buttonClass} text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500`;
  const addButtonClass = `flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-neutral text-sm`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString; // return original if parsing fails
    }
  };

  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-3 sm:mb-0">
          Manajemen Jenis Tagihan Keuangan
        </h2>
        {isAdmin && (
          <button 
            onClick={onAddBillDefinition}
            className={addButtonClass}
            aria-label="Tambah Jenis Tagihan Baru"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Jenis Tagihan
          </button>
        )}
      </div>

       <div className="text-sm text-base-content/70 mb-8 p-4 bg-sky-50 border border-sky-300 rounded-md shadow">
        <p className="font-semibold text-sky-700">Informasi:</p>
        <ul className="list-disc list-inside ml-2 text-sky-600">
            <li>Bagian ini digunakan untuk mendefinisikan jenis tagihan, nominal, tanggal jatuh tempo bulanan, label periode, serta rentang tanggal berlaku tagihan.</li>
            <li>Data ini akan menjadi dasar untuk pengelolaan keuangan lebih lanjut.</li>
            {!isAdmin && currentUserRole === UserRole.BENDAHARA && (
                 <li>Sebagai Bendahara, Anda dapat melihat daftar jenis tagihan. Pengelolaan (tambah/edit/hapus) dilakukan oleh Administrator Utama.</li>
            )}
        </ul>
      </div>

      {billDefinitions.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow border border-base-300">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Nama Tagihan</th>
                <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-neutral-content">Nominal</th>
                <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-neutral-content">Jatuh Tempo</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Label Periode</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Tgl Mulai</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Tgl Akhir</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Deskripsi</th>
                {isAdmin && <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-neutral-content">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 bg-base-100">
              {billDefinitions.map(billDef => (
                <tr key={billDef.id} className="hover:bg-base-200/50 transition-colors duration-150">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-neutral-content">{billDef.namaTagihan}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content text-right">{formatCurrency(billDef.nominal)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content text-center">{billDef.tanggalJatuhTempo}{getDaySuffix(billDef.tanggalJatuhTempo)} per bulan</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{billDef.periodeTahun || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{formatDate(billDef.tanggalMulaiPenagihan)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{formatDate(billDef.tanggalAkhirPenagihan)}</td>
                  <td className="px-4 py-4 text-sm text-base-content max-w-xs truncate" title={billDef.deskripsi}>{billDef.deskripsi || '-'}</td>
                  {isAdmin && (
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => onEditBillDefinition(billDef)}
                          className={editButtonClass}
                          aria-label={`Edit tagihan ${billDef.namaTagihan}`}
                        >
                          <PencilIcon className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => onDeleteBillDefinition(billDef.id)}
                          className={deleteButtonClass}
                          aria-label={`Hapus tagihan ${billDef.namaTagihan}`}
                        >
                          <TrashIcon className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow">
            <CurrencyDollarIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
            <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Jenis Tagihan Didefinisikan</h3>
            {isAdmin ? (
                <p className="mt-1 text-sm text-base-content/70">Silakan tambahkan jenis tagihan baru untuk memulai pengelolaan keuangan.</p>
            ) : (
                 <p className="mt-1 text-sm text-base-content/70">Administrator Utama belum mendefinisikan jenis tagihan.</p>
            )}
        </div>
      )}
    </div>
  );
};

export default FinancialManagementView;
