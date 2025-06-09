
import React from 'react';
import { Santri, PesantrenProfileData, JenisKelamin, SantriStatus, StatusHidup, PilihanYaTidak, IdentitasWali, JenisPendidikanTerakhir, StatusKealumnian } from '../types';

interface SantriDetailPrintoutProps {
  santri: Santri;
  pesantrenProfile: PesantrenProfileData;
  printedByUserName: string;
  namaKelas?: string; 
  namaBlok?: string;  
  pasFotoUrlForPdf?: string; // New prop for pre-generated URL
}

const SantriDetailPrintout: React.FC<SantriDetailPrintoutProps> = ({ santri, pesantrenProfile, printedByUserName, namaKelas, namaBlok, pasFotoUrlForPdf }) => {
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    try {
      // Handles YYYY-MM-DD
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
  
  const fieldRow = (label: string, value?: string | number | null, fullWidthValue: boolean = false) => {
    const val = value !== undefined && value !== null && value !== '' ? value : '-';
    if (fullWidthValue) {
      return (
        <tr>
          <td className="font-semibold pr-2 py-0.5 align-top w-1/3">{label}</td>
          <td className="pr-1 py-0.5 align-top w-px">:</td>
          <td className="py-0.5 align-top" colSpan={3}>{String(val)}</td> {/* Ensure val is string for colSpan cell */}
        </tr>
      );
    }
    return (
      <tr>
        <td className="font-semibold pr-2 py-0.5 align-top w-1/3">{label}</td>
        <td className="pr-1 py-0.5 align-top w-px">:</td>
        <td className="py-0.5 align-top">{String(val)}</td> {/* Ensure val is string */}
      </tr>
    );
  };
  
  const sectionTitle = (title: string) => (
    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 bg-gray-100 p-2 my-2 border-b-2 border-t-2 border-gray-300">{title}</h3>
  );

  const formatAlamat = (s: Partial<Santri>, entityType: '' | 'ayah' | 'ibu' | 'wali' | 'wakilwali' = '') => {
    const getField = (baseName: keyof Santri): string | undefined => {
        let finalKey = baseName;
        if (entityType) {
            const entitySpecificKey = `${baseName}${entityType}` as keyof Santri;
            if (entitySpecificKey in s) { // Check if the entity-specific key exists
              finalKey = entitySpecificKey;
            } else if (!(baseName in s)) { // If base key also doesn't exist
              return undefined;
            }
            // If entitySpecificKey doesn't exist but baseName does, finalKey remains baseName (should not happen with current logic)
        }
        
        const value = s[finalKey as keyof Santri];
        if (value === null || value === undefined) return undefined;
        if (Array.isArray(value)) return value.join(' '); // Should not happen based on Santri type
        return String(value);
    };
    
    const dusun = getField('dusun');
    const rt = getField('rt');
    const rw = getField('rw');
    const desa = getField('desakelurahan');
    const kecamatan = getField('kecamatan');
    const kota = getField('kotakabupaten');
    const provinsi = getField('provinsi');
    const alamatlengkap = getField('alamatlengkap');

    const parts = [
        dusun,
        (rt && rw) ? `RT ${rt} / RW ${rw}` : (rt ? `RT ${rt}` : (rw ? `RW ${rw}` : '')),
        desa,
        kecamatan,
        kota,
        provinsi,
    ].filter(Boolean).join(', ');

    return parts || alamatlengkap || '-';
  };
  

  return (
    <div id="santri-detail-print-content" className="bg-white text-black p-5 font-sans text-xs" style={{ width: '100%', margin: '0 auto' }}>
      <header className="text-center mb-4 pb-2 border-b-2 border-black">
        <h1 className="text-lg font-bold uppercase">{pesantrenProfile.namaPesantren}</h1>
        {pesantrenProfile.alamatLengkap && <p className="text-xs">{pesantrenProfile.alamatLengkap}</p>}
        {pesantrenProfile.nomorTelepon && <p className="text-xs">Telp: {pesantrenProfile.nomorTelepon}</p>}
      </header>

      <section className="mb-3 text-center">
        <h2 className="text-base font-semibold uppercase underline">Ringkasan Data Santri</h2>
      </section>

      <div className="flex mb-3">
        {pasFotoUrlForPdf && ( // Use the new prop here
          <div className="w-1/4 pr-3 flex-shrink-0">
            <img src={pasFotoUrlForPdf} alt="Pas Foto" className="w-full h-auto border border-gray-400 p-0.5 object-contain" style={{maxHeight: '160px'}}/>
          </div>
        )}
        <div className={pasFotoUrlForPdf ? "w-3/4" : "w-full"}>
          <table className="w-full">
            <tbody>
              {fieldRow("Nama Lengkap", santri.namalengkap)}
              {fieldRow("Nama Panggilan", santri.namapanggilan)}
              {fieldRow("No. KTT", santri.nomorktt)}
              {fieldRow("Status Santri", santri.status)}
            </tbody>
          </table>
        </div>
      </div>

      {sectionTitle("Data Diri Santri")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("NIK", santri.nomorindukkependudukan)}
          {fieldRow("No. Kartu Keluarga", santri.nomorkartukeluarga)}
          {fieldRow("Tempat, Tanggal Lahir", `${santri.tempatlahir || '-'}, ${formatDate(santri.tanggallahir)}`)}
          {fieldRow("Jenis Kelamin", santri.jeniskelamin)}
          {fieldRow("Kewarganegaraan", santri.kewarganegaraan)}
          {santri.kewarganegaraan === 'WNA' && fieldRow("Negara Asal", santri.negaraasal)}
          {santri.kewarganegaraan === 'WNI' && fieldRow("Suku", santri.suku)}
          {fieldRow("Alamat Lengkap", formatAlamat(santri), true)}
          {fieldRow("Hobi", santri.hobi)}
          {fieldRow("Cita-cita", santri.citacita)}
          {fieldRow("Bakat", santri.bakat)}
        </tbody>
      </table>

      {sectionTitle("Data Akademik Pesantren")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Tanggal Masuk Pesantren", formatDate(santri.tanggalmasuk))}
          {fieldRow("Kelas/Halaqah Saat Ini", namaKelas)}
          {fieldRow("Blok Pesantren", namaBlok)}
          {fieldRow("Nomor Kamar", santri.nomorkamar)}
          {fieldRow("Daerah Asal (Umum)", santri.daerahasal)}
        </tbody>
      </table>
      
      {sectionTitle("Riwayat Pendidikan Terakhir")}
      <table className="w-full mb-3">
        <tbody>
            {fieldRow("Jenis Pendidikan", santri.jenispendidikanterakhir)}
            {(santri.jenispendidikanterakhir === JenisPendidikanTerakhir.FORMAL || santri.jenispendidikanterakhir === JenisPendidikanTerakhir.FORMAL_DAN_NON_FORMAL) && (
            <>
                {fieldRow("Tingkat (Formal)", santri.tingkatpendidikanterakhir)}
                {fieldRow("Nama Lembaga (Formal)", santri.namalembagapendidikanterakhir)}
                {fieldRow("Tahun Masuk (Formal)", formatDate(santri.tahunmasukformal))}
                {fieldRow("Tahun Keluar (Formal)", formatDate(santri.tahunkeluarformal))}
            </>
            )}
            {(santri.jenispendidikanterakhir === JenisPendidikanTerakhir.NON_FORMAL || santri.jenispendidikanterakhir === JenisPendidikanTerakhir.FORMAL_DAN_NON_FORMAL) && (
            <>
                {fieldRow("Nama Lembaga (Non-Formal)", santri.namalembaganonformal)}
                {fieldRow("Tahun Masuk (Non-Formal)", formatDate(santri.tahunmasuknonformal))}
                {fieldRow("Tahun Keluar (Non-Formal)", formatDate(santri.tahunkeluarnonformal))}
            </>
            )}
        </tbody>
      </table>

      {sectionTitle("Data Ayah")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Nama Ayah", santri.namaayah)}
          {fieldRow("NIK Ayah", santri.nikayah)}
          {fieldRow("Pekerjaan Ayah", santri.pekerjaanayah)}
          {fieldRow("Status Hidup Ayah", santri.statushidupayah)}
          {fieldRow("Status Kealumnian Ayah", santri.statuskealumnianayah)}
          {santri.statuskealumnianayah === StatusKealumnian.ALUMNI && fieldRow("Tahun Alumni Ayah", `${formatDate(santri.tahunmasukalumniayah)} - ${formatDate(santri.tahunkeluaralumniayah)}`)}
          {fieldRow("Ayah Tergabung Organisasi?", santri.isayahorganisasi)}
          {santri.isayahorganisasi === PilihanYaTidak.YA && fieldRow("Nama & Status Organisasi Ayah", `${santri.namaorganisasiayah || ''} (${santri.statusorganisasiayah || ''})`)}
          {fieldRow("Alamat Ayah Sama dengan Santri?", santri.isalamatayahsama)}
          {santri.isalamatayahsama === PilihanYaTidak.TIDAK && fieldRow("Alamat Lengkap Ayah", formatAlamat(santri, 'ayah'), true)}
        </tbody>
      </table>

      {sectionTitle("Data Ibu")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Nama Ibu", santri.namaibu)}
          {fieldRow("NIK Ibu", santri.nikibu)}
          {fieldRow("Pekerjaan Ibu", santri.pekerjaanibu)}
          {fieldRow("Status Hidup Ibu", santri.statushidupibu)}
          {fieldRow("Ibu Tergabung Organisasi?", santri.isibuorganisasi)}
          {santri.isibuorganisasi === PilihanYaTidak.YA && fieldRow("Nama & Status Organisasi Ibu", `${santri.namaorganisasiibu || ''} (${santri.statusorganisasiibu || ''})`)}
          {fieldRow("Alamat Ibu Sama dengan Santri?", santri.isalamatibusama)}
          {santri.isalamatibusama === PilihanYaTidak.TIDAK && fieldRow("Alamat Lengkap Ibu", formatAlamat(santri, 'ibu'), true)}
        </tbody>
      </table>
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("No. Telepon Orang Tua", santri.nomorteleponorangtua)}
        </tbody>
      </table>

      {sectionTitle("Data Wali Utama")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Wali Utama Adalah", santri.identitaswaliutama === IdentitasWali.LAINNYA ? `${santri.identitaswaliutama} (${santri.hubunganwalilainnya || 'Tidak disebutkan'})` : santri.identitaswaliutama)}
          {fieldRow("Nama Wali Utama", santri.namawali)}
          {fieldRow("No. HP Wali Utama", santri.nomorteleponwali)}
          {santri.identitaswaliutama !== IdentitasWali.AYAH && (
            <>
              {fieldRow("NIK Wali", santri.nikwali)}
              {fieldRow("Pekerjaan Wali", santri.pekerjaanwali)}
              {fieldRow("Status Kealumnian Wali", santri.statuskealumnianwali)}
              {santri.statuskealumnianwali === StatusKealumnian.ALUMNI && fieldRow("Tahun Alumni Wali", `${formatDate(santri.tahunmasukalumniwali)} - ${formatDate(santri.tahunkeluaralumniwali)}`)}
              {fieldRow("Alamat Wali Sama dengan Santri?", santri.isalamatwalisama)}
              {santri.isalamatwalisama === PilihanYaTidak.TIDAK && fieldRow("Alamat Lengkap Wali", formatAlamat(santri, 'wali'), true)}
            </>
          )}
        </tbody>
      </table>

      {santri.namawakilwali && (
        <>
          {sectionTitle("Data Wakil Wali")}
          <table className="w-full mb-3">
            <tbody>
              {fieldRow("Nama Wakil Wali", santri.namawakilwali)}
              {fieldRow("No. HP Wakil Wali", santri.nomorteleponwakilwali)}
              {fieldRow("Hubungan Wakil Wali", santri.hubunganwakilwali === IdentitasWali.LAINNYA ? `${santri.hubunganwakilwali} (${santri.hubunganwakilwalilainnya || 'Tidak disebutkan'})` : santri.hubunganwakilwali)}
              {fieldRow("NIK Wakil Wali", santri.nikwakilwali)}
              {fieldRow("Pekerjaan Wakil Wali", santri.pekerjaanwakilwali)}
              {fieldRow("Status Kealumnian Wakil Wali", santri.statuskealumnianwakilwali)}
              {santri.statuskealumnianwakilwali === StatusKealumnian.ALUMNI && fieldRow("Tahun Alumni Wakil Wali", `${formatDate(santri.tahunmasukalumniwakilwali)} - ${formatDate(santri.tahunkeluaralumniwakilwali)}`)}
              {fieldRow("Alamat Wakil Wali Sama?", santri.isalamatwakilwalisama)}
              {santri.isalamatwakilwalisama === PilihanYaTidak.TIDAK && fieldRow("Alamat Lengkap Wakil Wali", formatAlamat(santri, 'wakilwali'), true)}
            </tbody>
          </table>
        </>
      )}

      {santri.catatan && (
        <>
          {sectionTitle("Catatan Tambahan")}
          <p className="mb-3 p-1.5 border border-gray-300 rounded bg-gray-50">{santri.catatan}</p>
        </>
      )}

      <footer className="mt-10 pt-6 text-xs">
        <div className="flex justify-end">
            <div className="text-center" style={{ width: '200px' }}>
                <p className="mb-12">Dicetak oleh,</p>
                <p className="font-semibold">({printedByUserName})</p>
                <p className="border-t border-gray-400 pt-1">Nama Jelas & Tanda Tangan</p>
            </div>
        </div>
        <p className="text-center text-gray-500 mt-8">Dokumen ini dicetak melalui Sistem Ma’had Suite pada tanggal {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.</p>
      </footer>
    </div>
  );
};

export default SantriDetailPrintout;
