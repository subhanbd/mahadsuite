
import React from 'react';
import { Santri, PesantrenProfileData, JenisKelamin, SantriStatus, StatusHidup, PilihanYaTidak, IdentitasWali, JenisPendidikanTerakhir, StatusKealumnian, Kewarganegaraan, TingkatPendidikan, StatusKeorganisasian } from '../types';

interface SantriDetailPrintoutProps {
  santri: Santri;
  pesantrenProfile: PesantrenProfileData;
  printedByUserName: string;
  namaKelas?: string; 
  namaBlok?: string;  
  pasFotoUrlForPdf?: string; 
}

const SantriDetailPrintout: React.FC<SantriDetailPrintoutProps> = ({ santri, pesantrenProfile, printedByUserName, namaKelas, namaBlok, pasFotoUrlForPdf }) => {
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const fieldRow = (label: string, value?: string | number | null, fullWidthValue: boolean = false): JSX.Element | null => {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      return null; // Don't render if value is not meaningful
    }
    return (
      <tr>
        <td className="w-1/3 py-0.5 pr-2 align-top">{label}</td>
        <td className="w-px py-0.5 pr-1 align-top">:</td>
        <td className={`py-0.5 align-top ${fullWidthValue ? 'w-2/3' : ''}`}>{String(value)}</td>
      </tr>
    );
  };

  const sectionTitle = (title: string): JSX.Element => (
    <h3 className="text-sm font-semibold uppercase border-b border-gray-400 mb-1.5 mt-3 pb-0.5">{title}</h3>
  );
  
  const formatAlamat = (s: Partial<Santri>, entityType: '' | 'ayah' | 'ibu' | 'wali' | 'wakilwali' = ''): string => {
    let alamatLengkap, dusun, rt, rw, desakelurahan, kecamatan, kotakabupaten, provinsi;

    if (entityType === 'ayah') {
        alamatLengkap = s.alamatlengkapayah; dusun = s.dusunayah; rt = s.rtayah; rw = s.rwayah;
        desakelurahan = s.desakelurahanayah; kecamatan = s.kecamatanayah; kotakabupaten = s.kotakabupatenayah; provinsi = s.provinsiayah;
    } else if (entityType === 'ibu') {
        alamatLengkap = s.alamatlengkapibu; dusun = s.dusunibu; rt = s.rtibu; rw = s.rwibu;
        desakelurahan = s.desakelurahanibu; kecamatan = s.kecamatanibu; kotakabupaten = s.kotakabupatenibu; provinsi = s.provinsiibu;
    } else if (entityType === 'wali') {
        alamatLengkap = s.alamatlengkapwali; dusun = s.dusunwali; rt = s.rtwali; rw = s.rwwali;
        desakelurahan = s.desakelurahanwali; kecamatan = s.kecamatanwali; kotakabupaten = s.kotakabupatenwali; provinsi = s.provinsiwali;
    } else if (entityType === 'wakilwali') {
        alamatLengkap = s.alamatlengkapwakilwali; dusun = s.dusunwakilwali; rt = s.rtwakilwali; rw = s.rwwakilwali;
        desakelurahan = s.desakelurahanwakilwali; kecamatan = s.kecamatanwakilwali; kotakabupaten = s.kotakabupatenwakilwali; provinsi = s.provinsiwakilwali;
    } else { // Santri
        alamatLengkap = s.alamatlengkap; dusun = s.dusun; rt = s.rt; rw = s.rw;
        desakelurahan = s.desakelurahan; kecamatan = s.kecamatan; kotakabupaten = s.kotakabupaten; provinsi = s.provinsi;
    }

    const parts = [
        dusun,
        (rt && rw) ? `RT ${rt}/${rw}` : (rt ? `RT ${rt}` : (rw ? `RW ${rw}` : '')),
        desakelurahan,
        kecamatan,
        kotakabupaten,
        provinsi,
    ].filter(Boolean).join(', ');
    return alamatLengkap ? `${alamatLengkap}${parts ? `. ${parts}` : ''}` : parts || '-';
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
        {pasFotoUrlForPdf && ( 
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
              {fieldRow("Kelas/Halaqah", namaKelas)}
              {fieldRow("Blok/Asrama", namaBlok)}
              {fieldRow("No. Kamar", santri.nomorkamar)}
            </tbody>
          </table>
        </div>
      </div>

      {sectionTitle("Data Diri Santri")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("NIK", santri.nomorindukkependudukan)}
          {fieldRow("No. KK", santri.nomorkartukeluarga)}
          {fieldRow("Tempat, Tanggal Lahir", `${santri.tempatlahir}, ${formatDate(santri.tanggallahir)}`)}
          {fieldRow("Jenis Kelamin", santri.jeniskelamin)}
          {fieldRow("Kewarganegaraan", santri.kewarganegaraan === Kewarganegaraan.WNA ? `WNA (${santri.negaraasal || 'Negara tidak diisi'})` : Kewarganegaraan.WNI )}
          {fieldRow("Suku", santri.suku)}
          {fieldRow("Alamat Lengkap", formatAlamat(santri), true)}
          {fieldRow("Hobi", santri.hobi)}
          {fieldRow("Cita-cita", santri.citacita)}
          {fieldRow("Bakat", santri.bakat)}
        </tbody>
      </table>

      {sectionTitle("Riwayat Pendidikan Terakhir")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Jenis Pendidikan", santri.jenispendidikanterakhir)}
          {santri.jenispendidikanterakhir !== JenisPendidikanTerakhir.TIDAK_SEKOLAH && fieldRow("Tingkat", santri.tingkatpendidikanterakhir)}
          {santri.namalembagapendidikanterakhir && fieldRow("Nama Lembaga Formal", santri.namalembagapendidikanterakhir)}
          {(santri.tahunmasukformal || santri.tahunkeluarformal) && fieldRow("Periode Formal", `${santri.tahunmasukformal || '?'} - ${santri.tahunkeluarformal || '?'}`)}
          {santri.namalembaganonformal && fieldRow("Nama Lembaga Non-Formal", santri.namalembaganonformal)}
          {(santri.tahunmasuknonformal || santri.tahunkeluarnonformal) && fieldRow("Periode Non-Formal", `${santri.tahunmasuknonformal || '?'} - ${santri.tahunkeluarnonformal || '?'}`)}
        </tbody>
      </table>
      
      {sectionTitle("Data Ayah")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Nama Ayah", santri.namaayah)}
          {fieldRow("NIK Ayah", santri.nikayah)}
          {fieldRow("Pekerjaan Ayah", santri.pekerjaanayah)}
          {fieldRow("Status Hidup Ayah", santri.statushidupayah)}
          {santri.statushidupayah === StatusHidup.MASIH_ADA && fieldRow("Status Kealumnian Ayah", santri.statuskealumnianayah)}
          {santri.statuskealumnianayah === StatusKealumnian.ALUMNI && fieldRow("Periode Alumni Ayah", `${santri.tahunmasukalumniayah || '?'} - ${santri.tahunkeluaralumniayah || '?'}`)}
          {santri.statushidupayah === StatusHidup.MASIH_ADA && fieldRow("Terlibat Organisasi Pesantren?", santri.isayahorganisasi)}
          {santri.isayahorganisasi === PilihanYaTidak.YA && fieldRow("Nama Organisasi Ayah", santri.namaorganisasiayah)}
          {santri.isayahorganisasi === PilihanYaTidak.YA && fieldRow("Status Organisasi Ayah", santri.statusorganisasiayah)}
          {santri.statushidupayah === StatusHidup.MASIH_ADA && fieldRow("Alamat Sama dengan Santri?", santri.isalamatayahsama)}
          {santri.isalamatayahsama === PilihanYaTidak.TIDAK && fieldRow("Alamat Ayah", formatAlamat(santri, 'ayah'), true)}
        </tbody>
      </table>

      {sectionTitle("Data Ibu")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Nama Ibu", santri.namaibu)}
          {fieldRow("NIK Ibu", santri.nikibu)}
          {fieldRow("Pekerjaan Ibu", santri.pekerjaanibu)}
          {fieldRow("Status Hidup Ibu", santri.statushidupibu)}
          {santri.statushidupibu === StatusHidup.MASIH_ADA && fieldRow("Terlibat Organisasi Pesantren?", santri.isibuorganisasi)}
          {santri.isibuorganisasi === PilihanYaTidak.YA && fieldRow("Nama Organisasi Ibu", santri.namaorganisasiibu)}
          {santri.isibuorganisasi === PilihanYaTidak.YA && fieldRow("Status Organisasi Ibu", santri.statusorganisasiibu)}
          {santri.statushidupibu === StatusHidup.MASIH_ADA && fieldRow("Alamat Sama dengan Santri?", santri.isalamatibusama)}
          {santri.isalamatibusama === PilihanYaTidak.TIDAK && fieldRow("Alamat Ibu", formatAlamat(santri, 'ibu'), true)}
        </tbody>
      </table>
      {fieldRow("No. Telepon Orang Tua", santri.nomorteleponorangtua)}

      {sectionTitle("Data Wali Utama")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Nama Wali", santri.namawali)}
          {fieldRow("NIK Wali", santri.nikwali)}
          {fieldRow("No. Telepon Wali", santri.nomorteleponwali)}
          {fieldRow("Identitas Wali", santri.identitaswaliutama === IdentitasWali.LAINNYA ? `Lainnya (${santri.hubunganwalilainnya || 'Tidak diisi'})` : santri.identitaswaliutama)}
          {fieldRow("Pekerjaan Wali", santri.pekerjaanwali)}
          {fieldRow("Status Kealumnian Wali", santri.statuskealumnianwali)}
          {santri.statuskealumnianwali === StatusKealumnian.ALUMNI && fieldRow("Periode Alumni Wali", `${santri.tahunmasukalumniwali || '?'} - ${santri.tahunkeluaralumniwali || '?'}`)}
          {fieldRow("Alamat Sama dengan Santri?", santri.isalamatwalisama)}
          {santri.isalamatwalisama === PilihanYaTidak.TIDAK && fieldRow("Alamat Wali", formatAlamat(santri, 'wali'), true)}
        </tbody>
      </table>
      
      {santri.namawakilwali && sectionTitle("Data Wakil Wali (Opsional)")}
      {santri.namawakilwali && (
        <table className="w-full mb-3">
            <tbody>
            {fieldRow("Nama Wakil Wali", santri.namawakilwali)}
            {fieldRow("NIK Wakil Wali", santri.nikwakilwali)}
            {fieldRow("No. Telepon Wakil Wali", santri.nomorteleponwakilwali)}
            {fieldRow("Hubungan Wakil Wali", santri.hubunganwakilwali === IdentitasWali.LAINNYA ? `Lainnya (${santri.hubunganwakilwalilainnya || 'Tidak diisi'})` : santri.hubunganwakilwali)}
            {fieldRow("Pekerjaan Wakil Wali", santri.pekerjaanwakilwali)}
            {fieldRow("Status Kealumnian Wakil Wali", santri.statuskealumnianwakilwali)}
            {santri.statuskealumnianwakilwali === StatusKealumnian.ALUMNI && fieldRow("Periode Alumni Wakil Wali", `${santri.tahunmasukalumniwakilwali || '?'} - ${santri.tahunkeluaralumniwakilwali || '?'}`)}
            {fieldRow("Alamat Sama dengan Santri?", santri.isalamatwakilwalisama)}
            {santri.isalamatwakilwalisama === PilihanYaTidak.TIDAK && fieldRow("Alamat Wakil Wali", formatAlamat(santri, 'wakilwali'), true)}
            </tbody>
        </table>
      )}

      {sectionTitle("Data Administratif Pesantren")}
      <table className="w-full mb-3">
        <tbody>
          {fieldRow("Tanggal Masuk", formatDate(santri.tanggalmasuk))}
          {fieldRow("Daerah Asal (Umum)", santri.daerahasal)}
          {santri.catatan && fieldRow("Catatan Tambahan", santri.catatan, true)}
        </tbody>
      </table>
      
      <footer className="mt-10 pt-6 text-xs">
        <div className="flex justify-between">
            <div>
                <p>Dicetak oleh: {printedByUserName}</p>
                <p>Tanggal Cetak: {formatDate(new Date().toISOString())}</p>
            </div>
            <div className="text-center w-1/3">
                <p>Mengetahui,</p>
                <p className="mt-12">(_________________________)</p>
                <p className="border-t border-gray-400 mx-auto w-full mt-0.5 pt-0.5">Sekretariat Pesantren</p>
            </div>
        </div>
        <p className="text-center text-gray-500 mt-8">Dokumen ini dicetak melalui Sistem Ma’had Suite.</p>
      </footer>
    </div>
  );
};

export default SantriDetailPrintout;
