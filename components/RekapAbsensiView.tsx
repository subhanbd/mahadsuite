
import React, { useState, useMemo } from 'react';
import { Santri, AttendanceRecord, AttendanceStatus, UserRole, AttendanceSummary, RekapFilterType, userRoleDisplayNames, KelasRecord } from '../types'; // Added KelasRecord
import PrinterIcon from './icons/PrinterIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import DocumentChartBarIcon from './icons/DocumentChartBarIcon';

interface RekapAbsensiViewProps {
  activeSantriList: Santri[];
  allAttendanceRecords: AttendanceRecord[];
  onPrintRekap: (rekapData: AttendanceSummary[], periodDescription: string, selectedKelas: string, generatedByUserName: string) => void;
  currentUserRole: UserRole;
  kelasRecords: KelasRecord[]; // Added prop
}

const getWeekRange = (date: Date): { start: Date, end: Date } => {
    const d = new Date(date);
    d.setHours(0,0,0,0); 
    const day = d.getDay(); 
    const diffToMonday = day === 0 ? -6 : 1 - day; 
    const startDate = new Date(d);
    startDate.setDate(d.getDate() + diffToMonday);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return { start: startDate, end: endDate };
};

const getMonthRange = (date: Date): { start: Date, end: Date } => {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); 
    endDate.setHours(23, 59, 59, 999);
    return { start: startDate, end: endDate };
};

const getYearRange = (date: Date): { start: Date, end: Date } => {
    const startDate = new Date(date.getFullYear(), 0, 1); 
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date.getFullYear(), 11, 31); 
    endDate.setHours(23, 59, 59, 999);
    return { start: startDate, end: endDate };
};


const RekapAbsensiView: React.FC<RekapAbsensiViewProps> = ({
  activeSantriList,
  allAttendanceRecords,
  onPrintRekap,
  currentUserRole,
  kelasRecords, // Destructure prop
}) => {
  const today = new Date();
  const toYYYYMMDD_forInput = (date: Date): string => date.toISOString().split('T')[0];

  const [filterType, setFilterType] = useState<RekapFilterType>('Bulanan');
  const [referenceDateInput, setReferenceDateInput] = useState<string>(toYYYYMMDD_forInput(today)); 
  const [selectedKelasFilterId, setSelectedKelasFilterId] = useState<string>("Semua Kelas"); // Store ID

  const uniqueKelasOptions = useMemo(() => {
    if (!Array.isArray(activeSantriList) || !Array.isArray(kelasRecords)) return [{ id: "Semua Kelas", namaKelas: "Semua Kelas" }];
    const klasses = new Map<string, string>();
    activeSantriList.forEach(santri => {
        if (santri.kelasid) {
            const kelas = kelasRecords.find(k => k.id === santri.kelasid);
            if (kelas && !klasses.has(kelas.id)) {
                klasses.set(kelas.id, kelas.namaKelas);
            }
        }
    });
    const optionsFromMap = Array.from(klasses, ([id, namaKelas]) => ({ id, namaKelas }));
    return [{ id: "Semua Kelas", namaKelas: "Semua Kelas" }, ...optionsFromMap.sort((a,b) => (kelasRecords.find(k=>k.id === a.id)?.urutanTampilan ?? 99) - (kelasRecords.find(k=>k.id === b.id)?.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas))];
  }, [activeSantriList, kelasRecords]);

  const derivedDateRange = useMemo(() => {
    const parts = referenceDateInput.split('-').map(Number);
    const refDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    refDateObj.setHours(0,0,0,0); 

    let startDateObj: Date;
    let endDateObj: Date;
    let description: string = '';

    switch (filterType) {
      case 'Harian':
        startDateObj = new Date(refDateObj); 
        endDateObj = new Date(refDateObj);
        endDateObj.setHours(23,59,59,999); 
        description = `Harian: ${startDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        break;
      case 'Mingguan':
        const weekRange = getWeekRange(refDateObj);
        startDateObj = weekRange.start;
        endDateObj = weekRange.end;
        description = `Mingguan: ${startDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${endDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        break;
      case 'Bulanan':
        const monthRange = getMonthRange(refDateObj);
        startDateObj = monthRange.start;
        endDateObj = monthRange.end;
        description = `Bulanan: ${startDateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
        break;
      case 'Tahunan':
        const yearRange = getYearRange(refDateObj);
        startDateObj = yearRange.start;
        endDateObj = yearRange.end;
        description = `Tahunan: ${startDateObj.getFullYear()}`;
        break;
      default: 
        startDateObj = new Date(refDateObj);
        endDateObj = new Date(refDateObj);
        endDateObj.setHours(23,59,59,999);
    }
    return { 
        startDateObj, 
        endDateObj,   
        description 
    };
  }, [filterType, referenceDateInput]);


  const attendanceRecapData = useMemo((): AttendanceSummary[] => {
    if (!Array.isArray(activeSantriList) || !Array.isArray(allAttendanceRecords) || !derivedDateRange.startDateObj || !derivedDateRange.endDateObj) {
      return [];
    }
    
    const startRange = derivedDateRange.startDateObj; 
    const endRange = derivedDateRange.endDateObj;     

    const filteredRecords = allAttendanceRecords.filter(record => {
      const recordDateParts = record.date.split('-').map(Number);
      const recordDateObj = new Date(recordDateParts[0], recordDateParts[1] - 1, recordDateParts[2]);
      recordDateObj.setHours(0,0,0,0); 
      
      return recordDateObj >= startRange && recordDateObj <= endRange;
    });

    const santriToDisplay = selectedKelasFilterId === "Semua Kelas"
      ? activeSantriList
      : activeSantriList.filter(s => s.kelasid === selectedKelasFilterId);

    return santriToDisplay.map(santri => {
      const namaKelas = kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas;
      const summary: AttendanceSummary = {
        santriId: santri.id,
        namaLengkap: santri.namalengkap,
        nomorKTT: santri.nomorktt,
        kelas: namaKelas,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpa: 0,
        totalRecords: 0,
        persentaseKehadiran: 0,
      };

      filteredRecords.forEach(record => {
        if (record.santriId === santri.id) {
          summary.totalRecords++;
          switch (record.status) {
            case AttendanceStatus.HADIR: summary.hadir++; break;
            case AttendanceStatus.SAKIT: summary.sakit++; break;
            case AttendanceStatus.IZIN: summary.izin++; break;
            case AttendanceStatus.ALPA: summary.alpa++; break;
          }
        }
      });
      
      if (summary.totalRecords > 0) {
        summary.persentaseKehadiran = parseFloat(((summary.hadir / summary.totalRecords) * 100).toFixed(1));
      }

      return summary;
    }).sort((a,b) => (a.namaLengkap || '').localeCompare(b.namaLengkap || ''));
  }, [activeSantriList, allAttendanceRecords, derivedDateRange.startDateObj, derivedDateRange.endDateObj, selectedKelasFilterId, kelasRecords]);
  
  const handleExportToPdf = () => {
    if (attendanceRecapData.length > 0) {
      const generatedBy = userRoleDisplayNames[currentUserRole] || 'Pengguna Sistem';
      const selectedKelasName = uniqueKelasOptions.find(opt => opt.id === selectedKelasFilterId)?.namaKelas || "Semua Kelas";
      onPrintRekap(attendanceRecapData, derivedDateRange.description, selectedKelasName, generatedBy);
    } else {
      alert("Tidak ada data untuk diexport pada filter yang dipilih.");
    }
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90 mb-1";
  const filterTypes: RekapFilterType[] = ['Harian', 'Mingguan', 'Bulanan', 'Tahunan'];


  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">Rekapitulasi Absensi Santri</h2>
        <p className="text-sm text-base-content/70">Filter berdasarkan jenis rekap, tanggal acuan, dan kelas untuk melihat rekapitulasi kehadiran.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
            <label htmlFor="filterType" className={labelClass}>Jenis Rekap:</label>
            <select 
                id="filterType" 
                value={filterType} 
                onChange={e => setFilterType(e.target.value as RekapFilterType)} 
                className={inputClass}
            >
                {filterTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
        </div>
        <div>
          <label htmlFor="referenceDate" className={labelClass}>
            {filterType === 'Harian' ? 'Tanggal Harian:' : 
             filterType === 'Mingguan' ? 'Pilih Tanggal dalam Minggu:' :
             filterType === 'Bulanan' ? 'Pilih Tanggal dalam Bulan:' :
             'Pilih Tanggal dalam Tahun:'
            }
          </label>
          <input type="date" id="referenceDate" value={referenceDateInput} onChange={e => setReferenceDateInput(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="rekapKelasFilter" className={labelClass}>Filter Kelas:</label>
          <select id="rekapKelasFilter" value={selectedKelasFilterId} onChange={e => setSelectedKelasFilterId(e.target.value)} className={inputClass}>
            {uniqueKelasOptions.map(kelas => (<option key={kelas.id} value={kelas.id}>{kelas.namaKelas}</option>))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <button
            onClick={handleExportToPdf}
            disabled={attendanceRecapData.length === 0 || (!currentUserRole.includes(UserRole.ADMINISTRATOR_UTAMA) && !currentUserRole.includes(UserRole.ASATIDZ))}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Export Rekap Absensi ke PDF"
        >
            <PrinterIcon className="w-5 h-5" /> Export ke PDF
        </button>
      </div>


      {(!Array.isArray(activeSantriList) || activeSantriList.length === 0) ? (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow">
          <InformationCircleIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
          <h3 className="text-xl font-semibold text-neutral-content">Tidak Ada Santri Aktif</h3>
          <p className="mt-1 text-sm text-base-content/70">Data rekapitulasi akan muncul di sini setelah ada santri aktif.</p>
        </div>
      ) : attendanceRecapData.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow">
          <InformationCircleIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
          <h3 className="text-xl font-semibold text-neutral-content">Tidak Ada Data Absensi</h3>
          <p className="mt-1 text-sm text-base-content/70">Tidak ada data absensi yang ditemukan untuk filter yang dipilih: <strong className="font-semibold">{derivedDateRange.description}</strong> untuk kelas <strong className="font-semibold">{uniqueKelasOptions.find(opt => opt.id === selectedKelasFilterId)?.namaKelas || "Semua Kelas"}</strong>.</p>
          <p className="mt-1 text-sm text-base-content/60">Pastikan ada data absensi pada rentang tanggal tersebut atau coba ubah filter.</p>
        </div>
      ) : (
        <>
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md text-sm text-indigo-700 shadow">
            Menampilkan rekap untuk: <strong className="font-semibold">{derivedDateRange.description}</strong>
            {selectedKelasFilterId !== "Semua Kelas" && <>, Kelas: <strong className="font-semibold">{uniqueKelasOptions.find(opt => opt.id === selectedKelasFilterId)?.namaKelas || "Semua Kelas"}</strong></>}
        </div>
        <div className="overflow-x-auto rounded-lg shadow border border-base-300">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-neutral-content">No</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-neutral-content">Nama Santri</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-neutral-content">KTT</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-neutral-content">Kelas</th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs sm:text-sm font-semibold text-neutral-content">Hadir</th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs sm:text-sm font-semibold text-neutral-content">Sakit</th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs sm:text-sm font-semibold text-neutral-content">Izin</th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs sm:text-sm font-semibold text-neutral-content">Alpa</th>
                <th scope="col" className="px-3 py-3.5 text-center text-xs sm:text-sm font-semibold text-neutral-content">% Hadir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 bg-base-100">
              {attendanceRecapData.map((summary, index) => (
                <tr key={summary.santriId} className="hover:bg-base-200/30 transition-colors duration-150">
                  <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-base-content">{index + 1}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm font-medium text-neutral-content">{summary.namaLengkap}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-base-content">{summary.nomorKTT || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-base-content">{summary.kelas || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-center text-green-600 font-semibold">{summary.hadir}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-center text-yellow-600 font-semibold">{summary.sakit}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-center text-blue-600 font-semibold">{summary.izin}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-center text-red-600 font-semibold">{summary.alpa}</td>
                  <td className={`whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-center font-bold ${summary.persentaseKehadiran >= 75 ? 'text-success' : summary.persentaseKehadiran >= 50 ? 'text-warning' : 'text-error'}`}>
                    {summary.totalRecords > 0 ? `${summary.persentaseKehadiran}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
      {attendanceRecapData.length > 0 && (
          <div className="mt-4 text-xs text-base-content/60">
              <p>* Persentase Kehadiran dihitung berdasarkan: (Total Hadir / Total Hari Tercatat Absensi) x 100%.</p>
              <p>* Total Hari Tercatat Absensi adalah jumlah hari dimana santri memiliki status Hadir, Sakit, Izin, atau Alpa dalam rentang periode terpilih.</p>
          </div>
      )}

       {(!currentUserRole.includes(UserRole.ADMINISTRATOR_UTAMA) && !currentUserRole.includes(UserRole.ASATIDZ)) && attendanceRecapData.length > 0 && (
           <div className="p-4 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-md text-sm shadow mt-6 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5"/> 
                Anda tidak memiliki izin untuk mengekspor rekap absensi. Fitur ini tersedia untuk Administrator dan Asatidz.
            </div>
       )}
    </div>
  );
};

export default RekapAbsensiView;
