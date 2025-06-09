
import React from 'react';
import { AttendanceSummary } from '../types';

interface RekapAbsensiPrintoutProps {
  rekapData: AttendanceSummary[];
  periodDescription: string;
  selectedKelas: string;
  pesantrenName: string;
  pesantrenAlamat?: string;
  pesantrenTelepon?: string;
  generatedByUserName: string;
}

const RekapAbsensiPrintout: React.FC<RekapAbsensiPrintoutProps> = ({
  rekapData,
  periodDescription,
  selectedKelas,
  pesantrenName,
  pesantrenAlamat,
  pesantrenTelepon,
  generatedByUserName,
}) => {

  return (
    <div id="rekap-absensi-print-content" className="bg-white text-black p-6 font-sans" style={{ width: '100%', margin: '0 auto' }}>
      <header className="text-center mb-6 pb-4 border-b-2 border-black">
        <h1 className="text-xl font-bold uppercase">{pesantrenName}</h1>
        {pesantrenAlamat && <p className="text-xs">{pesantrenAlamat}</p>}
        {pesantrenTelepon && <p className="text-xs">Telp: {pesantrenTelepon}</p>}
      </header>

      <section className="mb-4 text-center">
        <h2 className="text-lg font-semibold uppercase underline">Rekapitulasi Absensi Santri</h2>
      </section>

      <section className="mb-4 text-xs">
        <table className="w-full">
            <tbody>
                <tr>
                    <td className="font-medium pr-2 py-0.5">Periode Rekap</td>
                    <td className="pr-1 py-0.5 w-px">:</td>
                    <td className="py-0.5">{periodDescription}</td>
                </tr>
                <tr>
                    <td className="font-medium pr-2 py-0.5">Kelas</td>
                    <td className="pr-1 py-0.5">:</td>
                    <td className="py-0.5">{selectedKelas}</td>
                </tr>
                 <tr>
                    <td className="font-medium pr-2 py-0.5">Tanggal Cetak</td>
                    <td className="pr-1 py-0.5">:</td>
                    <td className="py-0.5">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                </tr>
            </tbody>
        </table>
      </section>

      <section className="mb-4">
        <table className="w-full text-xs border-collapse border border-gray-600">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-500 p-1.5 text-center">No</th>
              <th className="border border-gray-500 p-1.5 text-left">Nama Santri</th>
              <th className="border border-gray-500 p-1.5 text-left">KTT</th>
              <th className="border border-gray-500 p-1.5 text-left">Kelas</th>
              <th className="border border-gray-500 p-1.5 text-center">Hadir (H)</th>
              <th className="border border-gray-500 p-1.5 text-center">Sakit (S)</th>
              <th className="border border-gray-500 p-1.5 text-center">Izin (I)</th>
              <th className="border border-gray-500 p-1.5 text-center">Alpa (A)</th>
              <th className="border border-gray-500 p-1.5 text-center">% Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {rekapData.map((summary, index) => (
              <tr key={summary.santriId}>
                <td className="border border-gray-500 p-1.5 text-center">{index + 1}</td>
                <td className="border border-gray-500 p-1.5 text-left">{summary.namaLengkap}</td>
                <td className="border border-gray-500 p-1.5 text-left">{summary.nomorKTT || '-'}</td>
                <td className="border border-gray-500 p-1.5 text-left">{summary.kelas || '-'}</td>
                <td className="border border-gray-500 p-1.5 text-center">{summary.hadir}</td>
                <td className="border border-gray-500 p-1.5 text-center">{summary.sakit}</td>
                <td className="border border-gray-500 p-1.5 text-center">{summary.izin}</td>
                <td className="border border-gray-500 p-1.5 text-center">{summary.alpa}</td>
                <td className="border border-gray-500 p-1.5 text-center font-semibold">
                  {summary.totalRecords > 0 ? `${summary.persentaseKehadiran}%` : '-'}
                </td>
              </tr>
            ))}
            {rekapData.length === 0 && (
                <tr>
                    <td colSpan={9} className="border border-gray-500 p-4 text-center text-gray-500">
                        Tidak ada data absensi untuk ditampilkan dengan filter yang dipilih.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </section>
        
      <footer className="mt-10 pt-6 text-xs">
        <div className="flex justify-end">
            <div className="text-center w-1/3 mr-8"> {/* Adjusted for right alignment, can be centered too */}
                <p>Dicetak oleh,</p>
                <p className="mt-12 font-semibold">({generatedByUserName})</p>
                <p className="border-t border-gray-400 mx-auto w-full mt-1 pt-0.5">Tanda Tangan & Nama Jelas</p>
            </div>
        </div>
        <p className="text-center text-gray-500 mt-8">Dokumen ini dicetak melalui Sistem Ma’had Suite.</p>
      </footer>
    </div>
  );
};

export default RekapAbsensiPrintout;