
import React from 'react';
import { CoretKttPrintData, SantriDetailForCoretPrint, PesantrenProfileData } from '../types';

const CoretKttPrintout: React.FC<CoretKttPrintData> = ({ pesantrenProfile, coretRecord, santriDetails }) => {
  
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
         if (parseInt(month,10) >= 1 && parseInt(month,10) <= 12 && parseInt(day,10) >= 1 && parseInt(day,10) <= 31) {
            return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
        }
      }
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatAlamat = (s: SantriDetailForCoretPrint) => {
    const parts = [
        s.dusun,
        (s.rt && s.rw) ? `RT ${s.rt} / RW ${s.rw}` : (s.rt ? `RT ${s.rt}` : (s.rw ? `RW ${s.rw}` : '')),
        s.desakelurahan,
        s.kecamatan,
        s.kotakabupaten,
        s.provinsi,
    ].filter(Boolean).join(', ');
    return parts || s.alamatlengkap || '-';
  };
  
  const certificateNumber = `SKB-${coretRecord.id.substring(0, 5).toUpperCase()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`;

  const getPesantrenCity = (profile?: PesantrenProfileData): string => {
    if (profile?.kotaKabupaten && profile.kotaKabupaten.trim() !== '') {
        return profile.kotaKabupaten.trim();
    }
    if (profile?.alamatLengkap) {
        const alamat = profile.alamatLengkap.toLowerCase();
        const kotaKabRegex = /(?:kota|kabupaten|kab\.)\s*([a-zA-Z\s]+)(?:,\s*|$)/;
        const match = alamat.match(kotaKabRegex);
        if (match && match[1]) {
            // Capitalize each word
            return match[1].trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        
        // Fallback: try to get the last significant part before province or postal code
        const parts = profile.alamatLengkap.split(',');
        if (parts.length > 1) {
            // Check the second to last part, assuming format "..., City, Province" or "..., City, Postal Code"
            let potentialCity = parts[parts.length - 2]?.trim();
            if (potentialCity && !/^\d{5}$/.test(potentialCity) && !potentialCity.toLowerCase().includes('provinsi')) {
                 // Check if it's likely a city/kab by excluding postal codes and "Provinsi" mentions
                 // Further check: avoid generic terms like "Jalan" or street indicators if they are somehow the last part
                if (!potentialCity.toLowerCase().match(/\b(jl|jalan|gg|gang|lorong|komplek|blok)\b/)) {
                    return potentialCity.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                }
            }
             // Check the last part if it doesn't look like a postal code or province
            potentialCity = parts[parts.length - 1]?.trim();
            if (potentialCity && !/^\d{5}$/.test(potentialCity) && !potentialCity.toLowerCase().includes('provinsi')) {
                if (!potentialCity.toLowerCase().match(/\b(jl|jalan|gg|gang|lorong|komplek|blok)\b/)) {
                   return potentialCity.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                }
            }
        }
    }
    return "Kota"; // Default placeholder if not found
  };

  const pesantrenCity = getPesantrenCity(pesantrenProfile);


  return (
    <div id="coret-ktt-print-content" className="bg-white text-black p-8 font-serif" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', boxSizing: 'border-box' }}>
      <header className="text-center mb-6 pb-3 border-b-2 border-black">
        <h1 className="text-2xl font-bold uppercase">{pesantrenProfile.namaPesantren}</h1>
        {pesantrenProfile.alamatLengkap && <p className="text-sm">{pesantrenProfile.alamatLengkap}</p>}
        {pesantrenProfile.nomorTelepon && <p className="text-sm">Telp: {pesantrenProfile.nomorTelepon}</p>}
      </header>

      <section className="mb-6 text-center">
        <h2 className="text-xl font-semibold uppercase underline">SURAT KETERANGAN BERHENTI</h2>
        <p className="text-sm">Nomor: {certificateNumber}</p>
      </section>

      <section className="mb-5 text-sm leading-relaxed">
        <p className="mb-3">Yang bertanda tangan di bawah ini, Sekretariat {pesantrenProfile.namaPesantren}, menerangkan bahwa:</p>
        <table className="w-full pl-6 text-sm">
          <tbody>
            <tr><td className="w-1/3 py-0.5 pr-2 align-top">Nama Lengkap</td><td className="w-px py-0.5 pr-1 align-top">:</td><td className="py-0.5 align-top font-semibold">{santriDetails.namalengkap}</td></tr>
            <tr><td className="py-0.5 pr-2 align-top">Nomor KTT</td><td className="py-0.5 pr-1 align-top">:</td><td className="py-0.5 align-top">{santriDetails.nomorktt || '-'}</td></tr>
            <tr><td className="py-0.5 pr-2 align-top">Tempat, Tanggal Lahir</td><td className="py-0.5 pr-1 align-top">:</td><td className="py-0.5 align-top">{santriDetails.tempatlahir}, {formatDate(santriDetails.tanggallahir)}</td></tr>
            <tr><td className="py-0.5 pr-2 align-top">Alamat</td><td className="py-0.5 pr-1 align-top">:</td><td className="py-0.5 align-top">{formatAlamat(santriDetails)}</td></tr>
            <tr><td className="py-0.5 pr-2 align-top">Kelas Terakhir</td><td className="py-0.5 pr-1 align-top">:</td><td className="py-0.5 align-top">{coretRecord.santriKelasTerakhir || '-'}</td></tr>
            <tr><td className="py-0.5 pr-2 align-top">Tanggal Masuk Pesantren</td><td className="py-0.5 pr-1 align-top">:</td><td className="py-0.5 align-top">{formatDate(coretRecord.tanggalMasukPesantren)}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mb-5 text-sm leading-relaxed">
        <p className="mb-2">Adalah benar telah berhenti dari {pesantrenProfile.namaPesantren} terhitung sejak tanggal: <strong className="font-semibold">{formatDate(coretRecord.dismissalDate)}</strong>.</p>
        <p className="mb-2">Adapun alasan berhenti santri tersebut adalah: <strong className="font-semibold">{coretRecord.reason}</strong>.</p>
      </section>

       <section className="mb-6 text-sm leading-relaxed">
        <p>Ringkasan:</p>
        <ul className="list-disc list-inside ml-4">
            <li>Lama Menempuh Pendidikan: {coretRecord.durationOfStay}</li>
            <li>Usia Saat Berhenti: {coretRecord.ageAtDismissal}</li>
        </ul>
      </section>


      <section className="mb-10 text-sm leading-relaxed">
        <p>Demikian Surat Keterangan Berhenti ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
      </section>

      <footer className="mt-16 pt-8 text-sm">
        <div className="flex justify-end">
            <div className="text-center" style={{width: '250px'}}>
                <p>{pesantrenCity}, {formatDate(new Date().toISOString().split('T')[0])}</p>
                <p className="mb-16">Sekretariat Santri,</p>
                <p className="font-semibold">(_________________________)</p>
                <p className="text-xs">Nama Jelas & Stempel</p>
            </div>
        </div>
         <p className="text-center text-gray-500 text-xs mt-12">Dokumen ini dicetak melalui Sistem Ma’had Suite.</p>
      </footer>
    </div>
  );
};

export { CoretKttPrintout };
