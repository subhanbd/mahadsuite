
import React, { useState, useMemo, useEffect, useRef } from 'react'; 
import { Santri, BillDefinition, SantriPaymentRecord, PaymentStatus, UserRole, PaymentConfirmationData, SantriStatus, PesantrenProfileData, KelasRecord } from '../types'; 
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import SearchIcon from './icons/SearchIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import UserIcon from './icons/UserIcon';
import PrinterIcon from './icons/PrinterIcon'; 
import PaymentReceipt from './PaymentReceipt'; 
import { storage as appwriteStorage, APPWRITE_BUCKET_ID_SANTRI_PHOTOS } from '../services/appwriteClient';


interface SantriPaymentManagementViewProps {
  santriList: Santri[]; 
  billDefinitions: BillDefinition[];
  paymentRecords: SantriPaymentRecord[];
  onOpenPaymentConfirmationModal: (data: PaymentConfirmationData) => void;
  currentUserRole: UserRole;
  pesantrenProfile: PesantrenProfileData;
  kelasRecords: KelasRecord[]; 
}

const SantriPaymentManagementView: React.FC<SantriPaymentManagementViewProps> = ({
  santriList,
  billDefinitions,
  paymentRecords,
  onOpenPaymentConfirmationModal,
  currentUserRole,
  pesantrenProfile,
  kelasRecords, 
}) => {
  const [kttSearch, setKttSearch] = useState('');
  const [foundSantri, setFoundSantri] = useState<Santri | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [pasFotoUrl, setPasFotoUrl] = useState<string | null>(null);
  
  const searchTimeoutRef = useRef<number | null>(null); 

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; 

  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<string>(
    `${currentYear}-${String(currentMonth).padStart(2, '0')}`
  );

  const [receiptDataForPrint, setReceiptDataForPrint] = useState<{
    santri: Santri;
    billDefinition: BillDefinition;
    paymentRecord: SantriPaymentRecord;
    pesantrenProfile: PesantrenProfileData;
    namaKelas?: string; 
  } | null>(null);

  const billingPeriodOptions = useMemo(() => {
    const options = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(currentYear, currentMonth - 1 + i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      options.push({
        value: `${year}-${month}`,
        label: date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      });
    }
    return options;
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const currentKTTInInput = kttSearch.trim().toLowerCase();
    
    if (!currentKTTInInput) {
      setFoundSantri(null);
      setPasFotoUrl(null);
      setSearchMessage('');
      setIsLoadingSearch(false); 
    } else {
      const kttOfFoundSantri = foundSantri?.nomorktt?.trim().toLowerCase(); // nomorktt
      if (foundSantri && currentKTTInInput !== kttOfFoundSantri) {
        setFoundSantri(null);
        setPasFotoUrl(null);
        setSearchMessage(''); 
      }
    }
  }, [kttSearch, foundSantri]);

  useEffect(() => {
    if (foundSantri && foundSantri.pasFotoFileId) {
      try {
        const url = appwriteStorage.getFilePreview(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, foundSantri.pasFotoFileId);
        setPasFotoUrl(url);
      } catch (error) {
        console.error("Error fetching pas foto preview:", error);
        setPasFotoUrl(null);
      }
    } else {
      setPasFotoUrl(null);
    }
  }, [foundSantri]);

  const handleSearchSantri = () => {
    const trimmedKttSearch = kttSearch.trim();
    if (!trimmedKttSearch) {
      setFoundSantri(null);
      setPasFotoUrl(null);
      setSearchMessage("Mohon masukkan Nomor KTT Santri untuk dicari.");
      setIsLoadingSearch(false); 
      return;
    }

    setIsLoadingSearch(true);
    setSearchMessage(''); 
    setFoundSantri(null); 
    setPasFotoUrl(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current); 
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      const searchTermNormalized = trimmedKttSearch.toLowerCase();
      const santri = santriList.find( 
        s => s.nomorktt?.trim().toLowerCase() === searchTermNormalized && s.status === SantriStatus.AKTIF // nomorktt
      );

      if (santri) {
        setFoundSantri(santri);
        setSearchMessage('');
      } else {
        setFoundSantri(null);
        setSearchMessage(`Santri aktif dengan Nomor KTT "${trimmedKttSearch}" tidak ditemukan.`);
      }
      setIsLoadingSearch(false);
    }, 500); 
  };

  useEffect(() => {
    if (receiptDataForPrint) {
      const printTimer = setTimeout(() => {
        window.print();
        const cleanupTimer = setTimeout(() => {
          setReceiptDataForPrint(null);
        }, 100); 
      }, 75); 
      return () => {
        clearTimeout(printTimer);
      };
    }
  }, [receiptDataForPrint]);

  const handlePrintReceipt = (billDef: BillDefinition, paymentRecord: SantriPaymentRecord) => {
    if (foundSantri) {
      const namaKelas = kelasRecords.find(k => k.id === foundSantri.kelasid)?.namaKelas; // kelasid
      setReceiptDataForPrint({
        santri: foundSantri,
        billDefinition: billDef,
        paymentRecord: paymentRecord,
        pesantrenProfile: pesantrenProfile,
        namaKelas,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getPaymentDetailsForBill = (billDef: BillDefinition, santriId: string, period: string) => {
    const record = paymentRecords.find(
      pr => pr.santriId === santriId &&
            pr.billDefinitionId === billDef.id &&
            pr.billingPeriod === period &&
            pr.paymentStatus === PaymentStatus.LUNAS
    );

    if (record) {
      return { status: PaymentStatus.LUNAS, record };
    }

    const [year, month] = period.split('-').map(Number);
    const dueDateForBill = new Date(year, month - 1, billDef.tanggalJatuhTempo);
    const billingPeriodDate = new Date(year, month - 1, 15); 
    
    let isActiveBill = true;
    if (billDef.tanggalMulaiPenagihan && new Date(billDef.tanggalMulaiPenagihan) > billingPeriodDate) {
        isActiveBill = false;
    }
    if (billDef.tanggalAkhirPenagihan && new Date(billDef.tanggalAkhirPenagihan) < billingPeriodDate) {
        isActiveBill = false;
    }

    if (!isActiveBill) {
        return { status: PaymentStatus.BELUM_LUNAS, isOverdue: false, isInactiveBill: true };
    }
    
    const isOverdue = today > dueDateForBill;
    
    return { status: PaymentStatus.BELUM_LUNAS, isOverdue, isInactiveBill: false };
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90";
  const buttonBaseClass = "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100";


  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-8">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-1">
          Manajemen Pembayaran Santri
        </h2>
        <p className="text-sm text-base-content/70">
          Masukkan Nomor KTT Santri, lalu klik "Cari Santri" untuk melihat dan mengonfirmasi status pembayaran.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="kttSearch" className={labelClass}>Nomor KTT Santri</label>
          <input
            type="text"
            id="kttSearch"
            value={kttSearch}
            onChange={(e) => setKttSearch(e.target.value)}
            className={inputClass}
            placeholder="Ketik Nomor KTT..."
            aria-label="Nomor KTT Santri"
          />
        </div>
        <button
            onClick={handleSearchSantri}
            className={`${buttonBaseClass} bg-secondary text-secondary-content hover:bg-secondary-focus focus:ring-secondary w-full sm:w-auto`}
            disabled={isLoadingSearch || !kttSearch.trim()}
        >
            {isLoadingSearch ? (
                <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Mencari...
                </>
            ) : (
                <>
                    <SearchIcon className="w-4 h-4" /> Cari Santri
                </>
            )}
        </button>
      </div>

      {isLoadingSearch && (
        <div className="p-4 bg-blue-50 border border-blue-300 text-blue-700 rounded-md text-sm shadow flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 animate-pulse"/> Mencari data santri...
        </div>
      )}

      {!isLoadingSearch && (
        <>
          {searchMessage && ( 
            <div className="p-4 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-md text-sm shadow flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5"/> {searchMessage}
            </div>
          )}

          {foundSantri && !searchMessage && ( 
            <div className="space-y-6 pt-6 border-t border-base-300">
              <div className="flex flex-col sm:flex-row items-start gap-6 p-6 bg-neutral/30 rounded-lg shadow">
                <div className="flex-shrink-0">
                    {pasFotoUrl ? ( 
                        <img src={pasFotoUrl} alt={foundSantri.namalengkap} className="w-28 h-28 object-cover rounded-lg shadow-md" /> 
                    ) : (
                        <div className="w-28 h-28 rounded-lg bg-slate-200 flex items-center justify-center shadow-md">
                            <UserIcon className="w-20 h-20 text-slate-400" />
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-secondary">{foundSantri.namalengkap}</h3> 
                    <p className="text-base-content/80">({foundSantri.namapanggilan || 'Nama Panggilan Tidak Ada'})</p> 
                    <div className="mt-2 space-y-1 text-sm text-base-content/90">
                        <p><strong className="font-semibold">No. KTT:</strong> {foundSantri.nomorktt}</p> 
                        <p><strong className="font-semibold">Kelas:</strong> {kelasRecords.find(k => k.id === foundSantri.kelasid)?.namaKelas || 'Belum ada data'}</p> 
                        <p><strong className="font-semibold">Status:</strong> <span className="font-bold text-success">{foundSantri.status}</span></p>
                    </div>
                </div>
                <div className="w-full sm:w-auto sm:max-w-xs">
                    <label htmlFor="billingPeriod" className={labelClass}>Periode Tagihan</label>
                    <select
                        id="billingPeriod"
                        value={selectedBillingPeriod}
                        onChange={(e) => setSelectedBillingPeriod(e.target.value)}
                        className={inputClass}
                    >
                        {billingPeriodOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
              </div>
              
              <h4 className="text-xl font-semibold text-neutral-content pt-4 border-t border-base-200">
                Rincian Tagihan untuk Periode: {billingPeriodOptions.find(opt => opt.value === selectedBillingPeriod)?.label}
              </h4>

              {billDefinitions.length > 0 ? (
                <div className="space-y-4">
                  {billDefinitions.map(billDef => {
                    const paymentInfo = getPaymentDetailsForBill(billDef, foundSantri.id, selectedBillingPeriod);
                    let statusElement;
                    let actionButton = null;
                    let printButton = null;

                    if (paymentInfo.isInactiveBill) {
                        statusElement = (
                            <div className="flex items-center gap-2 text-slate-500">
                                <InformationCircleIcon className="w-5 h-5" />
                                <span className="font-semibold">Tagihan tidak aktif untuk periode ini</span>
                            </div>
                        );
                    } else if (paymentInfo.status === PaymentStatus.LUNAS && paymentInfo.record) {
                      statusElement = (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="font-semibold">Lunas</span>
                          <span className="text-xs text-slate-500">({new Date(paymentInfo.record.paymentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})</span>
                        </div>
                      );
                      if (currentUserRole === UserRole.BENDAHARA || currentUserRole === UserRole.ADMINISTRATOR_UTAMA) {
                        printButton = (
                            <button
                                onClick={() => handlePrintReceipt(billDef, paymentInfo.record!)}
                                className={`${buttonBaseClass} bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500 text-xs py-1.5 px-3`}
                                aria-label="Cetak Bukti Pembayaran"
                            >
                                <PrinterIcon className="w-4 h-4" /> Cetak Bukti
                            </button>
                        );
                      }
                    } else {
                      const statusText = paymentInfo.isOverdue ? "Jatuh Tempo" : "Belum Lunas";
                      const statusColor = paymentInfo.isOverdue ? "text-error" : "text-warning";
                        statusElement = (
                            <div className={`flex items-center gap-2 ${statusColor}`}>
                            <XCircleIcon className="w-5 h-5" />
                            <span className="font-semibold">{statusText}</span>
                            </div>
                        );
                      if (currentUserRole === UserRole.BENDAHARA || currentUserRole === UserRole.ADMINISTRATOR_UTAMA) {
                        actionButton = (
                          <button
                            onClick={() => onOpenPaymentConfirmationModal({
                              santriId: foundSantri.id,
                              santriName: foundSantri.namalengkap, 
                              billDefinitionId: billDef.id,
                              billName: billDef.namaTagihan,
                              billingPeriod: selectedBillingPeriod,
                              nominalToPay: billDef.nominal,
                            })}
                            className={`${buttonBaseClass} bg-accent text-accent-content hover:bg-accent-focus focus:ring-accent text-xs py-1.5 px-3`}
                          >
                            <CreditCardIcon className="w-4 h-4" /> Konfirmasi Bayar
                          </button>
                        );
                      }
                    }

                    return (
                      <div key={billDef.id} className="p-4 border border-base-300 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-base-200/30 transition-colors">
                        <div className="flex-grow">
                          <h5 className="font-semibold text-neutral-content">{billDef.namaTagihan}</h5>
                          <p className="text-sm text-secondary font-medium">{formatCurrency(billDef.nominal)}</p>
                          {billDef.periodeTahun && <p className="text-xs text-slate-500 mt-0.5">Label Periode: {billDef.periodeTahun}</p>}
                          <p className="text-xs text-slate-500 mt-0.5">
                            Berlaku: {billDef.tanggalMulaiPenagihan ? new Date(billDef.tanggalMulaiPenagihan).toLocaleDateString('id-ID') : 'Selalu'} - {billDef.tanggalAkhirPenagihan ? new Date(billDef.tanggalAkhirPenagihan).toLocaleDateString('id-ID') : 'Selalu'}
                          </p>
                          {billDef.deskripsi && <p className="text-xs text-base-content/70 mt-0.5 italic">{billDef.deskripsi}</p>}
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                            {statusElement}
                            {actionButton}
                            {printButton}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-base-200 rounded-lg text-center">
                  <InformationCircleIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-neutral-content font-semibold">Belum ada jenis tagihan yang didefinisikan.</p>
                  <p className="text-sm text-base-content/70">Silakan tambahkan jenis tagihan di menu "Jenis Tagihan".</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
       {receiptDataForPrint && (
        <div className="print-section hidden">
          <PaymentReceipt
            santri={receiptDataForPrint.santri}
            billDefinition={receiptDataForPrint.billDefinition}
            paymentRecord={receiptDataForPrint.paymentRecord}
            pesantrenProfile={receiptDataForPrint.pesantrenProfile}
            namaKelas={receiptDataForPrint.namaKelas}
          />
        </div>
      )}
    </div>
  );
};

export default SantriPaymentManagementView;
