
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Santri, 
  JenisKelamin, 
  SantriStatus, 
  Kewarganegaraan, 
  TingkatPendidikan,
  JenisPendidikanTerakhir,
  RegionOption,
  StatusHidup,
  StatusKealumnian,
  StatusKeorganisasian,
  PilihanYaTidak,
  IdentitasWali,
  daftarNegara,
  daftarSukuIndonesia,
  daftarTingkatPendidikan,
  daftarJenisPendidikanTerakhir,
  daftarStatusSantriForm,
  daftarStatusHidup,
  daftarStatusKealumnian,
  daftarStatusKeorganisasian,
  daftarPilihanYaTidak,
  daftarIdentitasWali,
  KelasRecord, 
  BlokRecord,
  AppwriteDocument   
} from '../types';
import { storage as appwriteStorage, APPWRITE_BUCKET_ID_SANTRI_PHOTOS, ID as AppwriteID } from '../services/appwriteClient'; // Import Appwrite storage

type SantriPayload = Omit<Santri, 'id' | keyof AppwriteDocument>;

interface SantriFormProps {
  onSubmit: (santri: SantriPayload, pasFotoFile?: File | null, idToUpdate?: string) => void;
  initialData?: Santri | null;
  onClose: () => void;
  kelasRecords: KelasRecord[]; 
  blokRecords: BlokRecord[];   
}

const BYTEBINDER_API_KEY = '9b7668095b62a9be4c9bc77bd454fdf14c9b3030e4371237b5985964e290c5af';
const BYTEBINDER_BASE_URL = 'https://api.binderbyte.com/wilayah';

const daftarTingkatPendidikanFormal = daftarTingkatPendidikan.filter(
  level => level !== TingkatPendidikan.TIDAK_SEKOLAH && level !== TingkatPendidikan.LAINNYA
);

const SantriForm: React.FC<SantriFormProps> = ({ onSubmit, initialData, onClose, kelasRecords, blokRecords }) => {
  const getInitialFormState = useCallback((): SantriPayload => {
    const sortedKelas = [...kelasRecords].sort((a,b) => (a.urutanTampilan ?? 99) - (b.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas));
    const sortedBlok = [...blokRecords].sort((a,b) => a.namaBlok.localeCompare(b.namaBlok));
    
    return {
      namalengkap: '',
      namapanggilan: '',
      nomorindukkependudukan: '',
      nomorkartukeluarga: '',
      nomorktt: '',
      kewarganegaraan: Kewarganegaraan.WNI,
      negaraasal: '', 
      suku: '',
      tempatlahir: '',
      tanggallahir: '',
      jeniskelamin: JenisKelamin.LAKI_LAKI,
      
      provinsi: '',
      kotakabupaten: '', 
      kecamatan: '',
      desakelurahan: '', 
      dusun: '',
      rt: '',
      rw: '',
      alamatlengkap: '', 
      
      hobi: '',
      citacita: '', 
      bakat: '',

      jenispendidikanterakhir: JenisPendidikanTerakhir.TIDAK_SEKOLAH, 
      tingkatpendidikanterakhir: TingkatPendidikan.TIDAK_SEKOLAH, 
      namalembagapendidikanterakhir: '', 
      tahunmasukformal: '', 
      tahunkeluarformal: '', 

      namalembaganonformal: '', 
      tahunmasuknonformal: '', 
      tahunkeluarnonformal: '', 

      namaayah: '', 
      nikayah: '', 
      pekerjaanayah: '', 
      statushidupayah: StatusHidup.MASIH_ADA, 
      statuskealumnianayah: StatusKealumnian.BUKAN_ALUMNI, 
      tahunmasukalumniayah: '', 
      tahunkeluaralumniayah: '', 
      isayahorganisasi: PilihanYaTidak.TIDAK, 
      namaorganisasiayah: '', 
      statusorganisasiayah: StatusKeorganisasian.TIDAK_AKTIF, 
      isalamatayahsama: PilihanYaTidak.YA, 
      alamatlengkapayah: '', 
      provinsiayah: '', 
      kotakabupatenayah: '', 
      kecamatanayah: '', 
      desakelurahanayah: '', 
      dusunayah: '', 
      rtayah: '', 
      rwayah: '', 

      namaibu: '', 
      nikibu: '', 
      pekerjaanibu: '', 
      statushidupibu: StatusHidup.MASIH_ADA, 
      isibuorganisasi: PilihanYaTidak.TIDAK, 
      namaorganisasiibu: '', 
      statusorganisasiibu: StatusKeorganisasian.TIDAK_AKTIF, 
      isalamatibusama: PilihanYaTidak.YA, 
      alamatlengkapibu: '', 
      provinsiibu: '', 
      kotakabupatenibu: '', 
      kecamatanibu: '', 
      desakelurahanibu: '', 
      dusunibu: '', 
      rtibu: '', 
      rwibu: '', 
      
      nomorteleponorangtua: '', 

      namawali: '', 
      nikwali: '', 
      nomorteleponwali: '', 
      identitaswaliutama: '', 
      hubunganwalilainnya: '', 
      pekerjaanwali: '', 
      statuskealumnianwali: StatusKealumnian.BUKAN_ALUMNI, 
      tahunmasukalumniwali: '', 
      tahunkeluaralumniwali: '', 
      isalamatwalisama: PilihanYaTidak.YA, 
      alamatlengkapwali: '', 
      provinsiwali: '', 
      kotakabupatenwali: '', 
      kecamatanwali: '', 
      desakelurahanwali: '', 
      dusunwali: '', 
      rtwali: '', 
      rwwali: '', 

      namawakilwali: '', 
      nikwakilwali: '', 
      nomorteleponwakilwali: '', 
      pekerjaanwakilwali: '', 
      hubunganwakilwali: '', 
      hubunganwakilwalilainnya: '', 
      statuskealumnianwakilwali: StatusKealumnian.BUKAN_ALUMNI, 
      tahunmasukalumniwakilwali: '', 
      tahunkeluaralumniwakilwali: '', 
      isalamatwakilwalisama: PilihanYaTidak.YA, 
      alamatlengkapwakilwali: '', 
      provinsiwakilwali: '', 
      kotakabupatenwakilwali: '', 
      kecamatanwakilwali: '', 
      desakelurahanwakilwali: '', 
      dusunwakilwali: '', 
      rtwakilwali: '', 
      rwwakilwali: '', 

      tanggalmasuk: '', 
      kelasid: sortedKelas.length > 0 ? sortedKelas[0].id : '', 
      blokid: sortedBlok.length > 0 ? sortedBlok[0].id : '',  
      nomorkamar: '', 
      catatan: '',
      
      pasFotoFileId: undefined, 
      dokumendomisilibase64: '', 

      status: SantriStatus.AKTIF,
      daerahasal: '', 
    };
  }, [kelasRecords, blokRecords]);

  const [formData, setFormData] = useState<SantriPayload>(getInitialFormState());
  const [pasFotoPreview, setPasFotoPreview] = useState<string | null>(null);
  const [pasFotoFile, setPasFotoFile] = useState<File | null>(null); 
  const [namaFileDomisili, setNamaFileDomisili] = useState<string | null>(null);

  // ... (Region state and effects remain the same) ...
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [cities, setCities] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [villages, setVillages] = useState<RegionOption[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [provincesLoading, setProvincesLoading] = useState<boolean>(false);
  const [citiesLoading, setCitiesLoading] = useState<boolean>(false);
  const [districtsLoading, setDistrictsLoading] = useState<boolean>(false);
  const [villagesLoading, setVillagesLoading] = useState<boolean>(false);
  const [regionApiError, setRegionApiError] = useState<string | null>(null);

  const [provincesAyah, setProvincesAyah] = useState<RegionOption[]>([]);
  const [citiesAyah, setCitiesAyah] = useState<RegionOption[]>([]);
  const [districtsAyah, setDistrictsAyah] = useState<RegionOption[]>([]);
  const [villagesAyah, setVillagesAyah] = useState<RegionOption[]>([]);
  const [selectedProvinceIdAyah, setSelectedProvinceIdAyah] = useState<string>('');
  const [selectedCityIdAyah, setSelectedCityIdAyah] = useState<string>('');
  const [selectedDistrictIdAyah, setSelectedDistrictIdAyah] = useState<string>('');
  const [selectedVillageIdAyah, setSelectedVillageIdAyah] = useState<string>('');
  const [provincesAyahLoading, setProvincesAyahLoading] = useState<boolean>(false);
  const [citiesAyahLoading, setCitiesAyahLoading] = useState<boolean>(false);
  const [districtsAyahLoading, setDistrictsAyahLoading] = useState<boolean>(false);
  const [villagesAyahLoading, setVillagesAyahLoading] = useState<boolean>(false);
  const [regionApiErrorAyah, setRegionApiErrorAyah] = useState<string | null>(null);

  const [provincesIbu, setProvincesIbu] = useState<RegionOption[]>([]);
  const [citiesIbu, setCitiesIbu] = useState<RegionOption[]>([]);
  const [districtsIbu, setDistrictsIbu] = useState<RegionOption[]>([]);
  const [villagesIbu, setVillagesIbu] = useState<RegionOption[]>([]);
  const [selectedProvinceIdIbu, setSelectedProvinceIdIbu] = useState<string>('');
  const [selectedCityIdIbu, setSelectedCityIdIbu] = useState<string>('');
  const [selectedDistrictIdIbu, setSelectedDistrictIdIbu] = useState<string>('');
  const [selectedVillageIdIbu, setSelectedVillageIdIbu] = useState<string>('');
  const [provincesIbuLoading, setProvincesIbuLoading] = useState<boolean>(false);
  const [citiesIbuLoading, setCitiesIbuLoading] = useState<boolean>(false);
  const [districtsIbuLoading, setDistrictsIbuLoading] = useState<boolean>(false);
  const [villagesIbuLoading, setVillagesIbuLoading] = useState<boolean>(false);
  const [regionApiErrorIbu, setRegionApiErrorIbu] = useState<string | null>(null);
  
  const [provincesWali, setProvincesWali] = useState<RegionOption[]>([]);
  const [citiesWali, setCitiesWali] = useState<RegionOption[]>([]);
  const [districtsWali, setDistrictsWali] = useState<RegionOption[]>([]);
  const [villagesWali, setVillagesWali] = useState<RegionOption[]>([]);
  const [selectedProvinceIdWali, setSelectedProvinceIdWali] = useState<string>('');
  const [selectedCityIdWali, setSelectedCityIdWali] = useState<string>('');
  const [selectedDistrictIdWali, setSelectedDistrictIdWali] = useState<string>('');
  const [selectedVillageIdWali, setSelectedVillageIdWali] = useState<string>('');
  const [provincesWaliLoading, setProvincesWaliLoading] = useState<boolean>(false);
  const [citiesWaliLoading, setCitiesWaliLoading] = useState<boolean>(false);
  const [districtsWaliLoading, setDistrictsWaliLoading] = useState<boolean>(false);
  const [villagesWaliLoading, setVillagesWaliLoading] = useState<boolean>(false);
  const [regionApiErrorWali, setRegionApiErrorWali] = useState<string | null>(null);

  const [provincesWakilWali, setProvincesWakilWali] = useState<RegionOption[]>([]);
  const [citiesWakilWali, setCitiesWakilWali] = useState<RegionOption[]>([]);
  const [districtsWakilWali, setDistrictsWakilWali] = useState<RegionOption[]>([]);
  const [villagesWakilWali, setVillagesWakilWali] = useState<RegionOption[]>([]);
  const [selectedProvinceIdWakilWali, setSelectedProvinceIdWakilWali] = useState<string>('');
  const [selectedCityIdWakilWali, setSelectedCityIdWakilWali] = useState<string>('');
  const [selectedDistrictIdWakilWali, setSelectedDistrictIdWakilWali] = useState<string>('');
  const [selectedVillageIdWakilWali, setSelectedVillageIdWakilWali] = useState<string>('');
  const [provincesWakilWaliLoading, setProvincesWakilWaliLoading] = useState<boolean>(false);
  const [citiesWakilWaliLoading, setCitiesWakilWaliLoading] = useState<boolean>(false);
  const [districtsWakilWaliLoading, setDistrictsWakilWaliLoading] = useState<boolean>(false);
  const [villagesWakilWaliLoading, setVillagesWakilWaliLoading] = useState<boolean>(false);
  const [regionApiErrorWakilWali, setRegionApiErrorWakilWali] = useState<string | null>(null);
  
  // Fetch Regions (no change needed here)
  const fetchRegions = useCallback(async (
    url: string, 
    setter: React.Dispatch<React.SetStateAction<RegionOption[]>>, 
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => { 
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data && data.value) { // Ensure data.value exists
          setter(data.value as RegionOption[]);
        } else {
          console.warn("Region API response did not contain 'value' field or was empty:", data);
          setter([]); // Set to empty array if data.value is not present
        }
      } catch (error: any) {
        console.error("Error fetching regions:", error);
        setError(`Gagal mengambil data wilayah: ${error.message}`);
        setter([]); // Reset to empty on error
      } finally {
        setLoading(false);
      }
   }, []);

  useEffect(() => { fetchRegions(`${BYTEBINDER_BASE_URL}/provinsi?api_key=${BYTEBINDER_API_KEY}`, setProvinces, setProvincesLoading, setRegionApiError); }, [fetchRegions]);
  useEffect(() => { if (selectedProvinceId) { setCities([]); setSelectedCityId(''); setDistricts([]); setSelectedDistrictId(''); setVillages([]); setSelectedVillageId(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kabupaten?api_key=${BYTEBINDER_API_KEY}&id_provinsi=${selectedProvinceId}`, setCities, setCitiesLoading, setRegionApiError); } else { setCities([]); setSelectedCityId(''); } }, [selectedProvinceId, fetchRegions]);
  useEffect(() => { if (selectedCityId) { setDistricts([]); setSelectedDistrictId(''); setVillages([]); setSelectedVillageId(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kecamatan?api_key=${BYTEBINDER_API_KEY}&id_kabupaten=${selectedCityId}`, setDistricts, setDistrictsLoading, setRegionApiError); } else { setDistricts([]); setSelectedDistrictId(''); } }, [selectedCityId, fetchRegions]);
  useEffect(() => { if (selectedDistrictId) { setVillages([]); setSelectedVillageId(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kelurahan?api_key=${BYTEBINDER_API_KEY}&id_kecamatan=${selectedDistrictId}`, setVillages, setVillagesLoading, setRegionApiError); } else { setVillages([]); setSelectedVillageId(''); } }, [selectedDistrictId, fetchRegions]);
  
  useEffect(() => { fetchRegions(`${BYTEBINDER_BASE_URL}/provinsi?api_key=${BYTEBINDER_API_KEY}`, setProvincesAyah, setProvincesAyahLoading, setRegionApiErrorAyah); }, [fetchRegions]);
  useEffect(() => { if (selectedProvinceIdAyah) { setCitiesAyah([]); setSelectedCityIdAyah(''); setDistrictsAyah([]); setSelectedDistrictIdAyah(''); setVillagesAyah([]); setSelectedVillageIdAyah(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kabupaten?api_key=${BYTEBINDER_API_KEY}&id_provinsi=${selectedProvinceIdAyah}`, setCitiesAyah, setCitiesAyahLoading, setRegionApiErrorAyah); } else { setCitiesAyah([]); setSelectedCityIdAyah(''); } }, [selectedProvinceIdAyah, fetchRegions]);
  useEffect(() => { if (selectedCityIdAyah) { setDistrictsAyah([]); setSelectedDistrictIdAyah(''); setVillagesAyah([]); setSelectedVillageIdAyah(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kecamatan?api_key=${BYTEBINDER_API_KEY}&id_kabupaten=${selectedCityIdAyah}`, setDistrictsAyah, setDistrictsAyahLoading, setRegionApiErrorAyah); } else { setDistrictsAyah([]); setSelectedDistrictIdAyah(''); } }, [selectedCityIdAyah, fetchRegions]);
  useEffect(() => { if (selectedDistrictIdAyah) { setVillagesAyah([]); setSelectedVillageIdAyah(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kelurahan?api_key=${BYTEBINDER_API_KEY}&id_kecamatan=${selectedDistrictIdAyah}`, setVillagesAyah, setVillagesAyahLoading, setRegionApiErrorAyah); } else { setVillagesAyah([]); setSelectedVillageIdAyah(''); } }, [selectedDistrictIdAyah, fetchRegions]);

  useEffect(() => { fetchRegions(`${BYTEBINDER_BASE_URL}/provinsi?api_key=${BYTEBINDER_API_KEY}`, setProvincesIbu, setProvincesIbuLoading, setRegionApiErrorIbu); }, [fetchRegions]);
  useEffect(() => { if (selectedProvinceIdIbu) { setCitiesIbu([]); setSelectedCityIdIbu(''); setDistrictsIbu([]); setSelectedDistrictIdIbu(''); setVillagesIbu([]); setSelectedVillageIdIbu(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kabupaten?api_key=${BYTEBINDER_API_KEY}&id_provinsi=${selectedProvinceIdIbu}`, setCitiesIbu, setCitiesIbuLoading, setRegionApiErrorIbu); } else { setCitiesIbu([]); setSelectedCityIdIbu(''); } }, [selectedProvinceIdIbu, fetchRegions]);
  useEffect(() => { if (selectedCityIdIbu) { setDistrictsIbu([]); setSelectedDistrictIdIbu(''); setVillagesIbu([]); setSelectedVillageIdIbu(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kecamatan?api_key=${BYTEBINDER_API_KEY}&id_kabupaten=${selectedCityIdIbu}`, setDistrictsIbu, setDistrictsIbuLoading, setRegionApiErrorIbu); } else { setDistrictsIbu([]); setSelectedDistrictIdIbu(''); } }, [selectedCityIdIbu, fetchRegions]);
  useEffect(() => { if (selectedDistrictIdIbu) { setVillagesIbu([]); setSelectedVillageIdIbu(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kelurahan?api_key=${BYTEBINDER_API_KEY}&id_kecamatan=${selectedDistrictIdIbu}`, setVillagesIbu, setVillagesIbuLoading, setRegionApiErrorIbu); } else { setVillagesIbu([]); setSelectedVillageIdIbu(''); } }, [selectedDistrictIdIbu, fetchRegions]);

  useEffect(() => { fetchRegions(`${BYTEBINDER_BASE_URL}/provinsi?api_key=${BYTEBINDER_API_KEY}`, setProvincesWali, setProvincesWaliLoading, setRegionApiErrorWali); }, [fetchRegions]);
  useEffect(() => { if (selectedProvinceIdWali) { setCitiesWali([]); setSelectedCityIdWali(''); setDistrictsWali([]); setSelectedDistrictIdWali(''); setVillagesWali([]); setSelectedVillageIdWali(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kabupaten?api_key=${BYTEBINDER_API_KEY}&id_provinsi=${selectedProvinceIdWali}`, setCitiesWali, setCitiesWaliLoading, setRegionApiErrorWali); } else { setCitiesWali([]); setSelectedCityIdWali(''); } }, [selectedProvinceIdWali, fetchRegions]);
  useEffect(() => { if (selectedCityIdWali) { setDistrictsWali([]); setSelectedDistrictIdWali(''); setVillagesWali([]); setSelectedVillageIdWali(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kecamatan?api_key=${BYTEBINDER_API_KEY}&id_kabupaten=${selectedCityIdWali}`, setDistrictsWali, setDistrictsWaliLoading, setRegionApiErrorWali); } else { setDistrictsWali([]); setSelectedDistrictIdWali(''); } }, [selectedCityIdWali, fetchRegions]);
  useEffect(() => { if (selectedDistrictIdWali) { setVillagesWali([]); setSelectedVillageIdWali(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kelurahan?api_key=${BYTEBINDER_API_KEY}&id_kecamatan=${selectedDistrictIdWali}`, setVillagesWali, setVillagesWaliLoading, setRegionApiErrorWali); } else { setVillagesWali([]); setSelectedVillageIdWali(''); } }, [selectedDistrictIdWali, fetchRegions]);

  useEffect(() => { fetchRegions(`${BYTEBINDER_BASE_URL}/provinsi?api_key=${BYTEBINDER_API_KEY}`, setProvincesWakilWali, setProvincesWakilWaliLoading, setRegionApiErrorWakilWali); }, [fetchRegions]);
  useEffect(() => { if (selectedProvinceIdWakilWali) { setCitiesWakilWali([]); setSelectedCityIdWakilWali(''); setDistrictsWakilWali([]); setSelectedDistrictIdWakilWali(''); setVillagesWakilWali([]); setSelectedVillageIdWakilWali(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kabupaten?api_key=${BYTEBINDER_API_KEY}&id_provinsi=${selectedProvinceIdWakilWali}`, setCitiesWakilWali, setCitiesWakilWaliLoading, setRegionApiErrorWakilWali); } else { setCitiesWakilWali([]); setSelectedCityIdWakilWali(''); } }, [selectedProvinceIdWakilWali, fetchRegions]);
  useEffect(() => { if (selectedCityIdWakilWali) { setDistrictsWakilWali([]); setSelectedDistrictIdWakilWali(''); setVillagesWakilWali([]); setSelectedVillageIdWakilWali(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kecamatan?api_key=${BYTEBINDER_API_KEY}&id_kabupaten=${selectedCityIdWakilWali}`, setDistrictsWakilWali, setDistrictsWakilWaliLoading, setRegionApiErrorWakilWali); } else { setDistrictsWakilWali([]); setSelectedDistrictIdWakilWali(''); } }, [selectedCityIdWakilWali, fetchRegions]);
  useEffect(() => { if (selectedDistrictIdWakilWali) { setVillagesWakilWali([]); setSelectedVillageIdWakilWali(''); fetchRegions(`${BYTEBINDER_BASE_URL}/kelurahan?api_key=${BYTEBINDER_API_KEY}&id_kecamatan=${selectedDistrictIdWakilWali}`, setVillagesWakilWali, setVillagesWakilWaliLoading, setRegionApiErrorWakilWali); } else { setVillagesWakilWali([]); setSelectedVillageIdWakilWali(''); } }, [selectedDistrictIdWakilWali, fetchRegions]);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...dataToEdit } = initialData;
      const baseFormData: SantriPayload = { 
        ...getInitialFormState(), 
        ...dataToEdit, 
        jeniskelamin: initialData.jeniskelamin || JenisKelamin.LAKI_LAKI 
      };
      setFormData(baseFormData);

      if (initialData.pasFotoFileId) {
        try {
          const url = appwriteStorage.getFilePreview(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, initialData.pasFotoFileId);
          setPasFotoPreview(url.toString());
        } catch (error) {
          console.error("Error generating pasFoto preview URL:", error);
          setPasFotoPreview(null);
        }
      } else {
        setPasFotoPreview(null);
      }
      setPasFotoFile(null); 
      setNamaFileDomisili(dataToEdit.dokumendomisilibase64 ? 'Dokumen tersimpan' : null);

       // Region initialization remains the same
       if (dataToEdit.provinsi && provinces.length > 0) { const province = provinces.find(p => p.name === dataToEdit.provinsi); if (province) setSelectedProvinceId(province.id); }
       if (dataToEdit.provinsiayah && provincesAyah.length > 0) { const province = provincesAyah.find(p => p.name === dataToEdit.provinsiayah); if (province) setSelectedProvinceIdAyah(province.id); }
       if (dataToEdit.provinsiibu && provincesIbu.length > 0) { const province = provincesIbu.find(p => p.name === dataToEdit.provinsiibu); if (province) setSelectedProvinceIdIbu(province.id); }
       if (dataToEdit.provinsiwali && provincesWali.length > 0) { const province = provincesWali.find(p => p.name === dataToEdit.provinsiwali); if (province) setSelectedProvinceIdWali(province.id); }
       if (dataToEdit.provinsiwakilwali && provincesWakilWali.length > 0) { const province = provincesWakilWali.find(p => p.name === dataToEdit.provinsiwakilwali); if (province) setSelectedProvinceIdWakilWali(province.id); }

    } else {
       setFormData(getInitialFormState());
       setPasFotoPreview(null); setPasFotoFile(null); setNamaFileDomisili(null);
       setSelectedProvinceId(''); setSelectedCityId(''); setSelectedDistrictId(''); setSelectedVillageId('');
       setSelectedProvinceIdAyah(''); setSelectedCityIdAyah(''); setSelectedDistrictIdAyah(''); setSelectedVillageIdAyah('');
       setSelectedProvinceIdIbu(''); setSelectedCityIdIbu(''); setSelectedDistrictIdIbu(''); setSelectedVillageIdIbu('');
       setSelectedProvinceIdWali(''); setSelectedCityIdWali(''); setSelectedDistrictIdWali(''); setSelectedVillageIdWali('');
       setSelectedProvinceIdWakilWali(''); setSelectedCityIdWakilWali(''); setSelectedDistrictIdWakilWali(''); setSelectedVillageIdWakilWali('');
    }
  }, [initialData, getInitialFormState, provinces, provincesAyah, provincesIbu, provincesWali, provincesWakilWali]); 

  useEffect(() => { if (initialData?.kotakabupaten && selectedProvinceId && cities.length > 0 && !selectedCityId) { const city = cities.find(c => c.name === initialData.kotakabupaten); if (city) setSelectedCityId(city.id); } }, [initialData, selectedProvinceId, cities, selectedCityId]);
  useEffect(() => { if (initialData?.kecamatan && selectedCityId && districts.length > 0 && !selectedDistrictId) { const district = districts.find(d => d.name === initialData.kecamatan); if (district) setSelectedDistrictId(district.id); } }, [initialData, selectedCityId, districts, selectedDistrictId]);
  useEffect(() => { if (initialData?.desakelurahan && selectedDistrictId && villages.length > 0 && !selectedVillageId) { const village = villages.find(v => v.name === initialData.desakelurahan); if (village) setSelectedVillageId(village.id); } }, [initialData, selectedDistrictId, villages, selectedVillageId]);

  useEffect(() => { if (initialData?.kotakabupatenayah && selectedProvinceIdAyah && citiesAyah.length > 0 && !selectedCityIdAyah) { const city = citiesAyah.find(c => c.name === initialData.kotakabupatenayah); if (city) setSelectedCityIdAyah(city.id); } }, [initialData, selectedProvinceIdAyah, citiesAyah, selectedCityIdAyah]);
  useEffect(() => { if (initialData?.kecamatanayah && selectedCityIdAyah && districtsAyah.length > 0 && !selectedDistrictIdAyah) { const district = districtsAyah.find(d => d.name === initialData.kecamatanayah); if (district) setSelectedDistrictIdAyah(district.id); } }, [initialData, selectedCityIdAyah, districtsAyah, selectedDistrictIdAyah]);
  useEffect(() => { if (initialData?.desakelurahanayah && selectedDistrictIdAyah && villagesAyah.length > 0 && !selectedVillageIdAyah) { const village = villagesAyah.find(v => v.name === initialData.desakelurahanayah); if (village) setSelectedVillageIdAyah(village.id); } }, [initialData, selectedDistrictIdAyah, villagesAyah, selectedVillageIdAyah]);

  useEffect(() => { if (initialData?.kotakabupatenibu && selectedProvinceIdIbu && citiesIbu.length > 0 && !selectedCityIdIbu) { const city = citiesIbu.find(c => c.name === initialData.kotakabupatenibu); if (city) setSelectedCityIdIbu(city.id); } }, [initialData, selectedProvinceIdIbu, citiesIbu, selectedCityIdIbu]);
  useEffect(() => { if (initialData?.kecamatanibu && selectedCityIdIbu && districtsIbu.length > 0 && !selectedDistrictIdIbu) { const district = districtsIbu.find(d => d.name === initialData.kecamatanibu); if (district) setSelectedDistrictIdIbu(district.id); } }, [initialData, selectedCityIdIbu, districtsIbu, selectedDistrictIdIbu]);
  useEffect(() => { if (initialData?.desakelurahanibu && selectedDistrictIdIbu && villagesIbu.length > 0 && !selectedVillageIdIbu) { const village = villagesIbu.find(v => v.name === initialData.desakelurahanibu); if (village) setSelectedVillageIdIbu(village.id); } }, [initialData, selectedDistrictIdIbu, villagesIbu, selectedVillageIdIbu]);

  useEffect(() => { if (initialData?.kotakabupatenwali && selectedProvinceIdWali && citiesWali.length > 0 && !selectedCityIdWali) { const city = citiesWali.find(c => c.name === initialData.kotakabupatenwali); if (city) setSelectedCityIdWali(city.id); } }, [initialData, selectedProvinceIdWali, citiesWali, selectedCityIdWali]);
  useEffect(() => { if (initialData?.kecamatanwali && selectedCityIdWali && districtsWali.length > 0 && !selectedDistrictIdWali) { const district = districtsWali.find(d => d.name === initialData.kecamatanwali); if (district) setSelectedDistrictIdWali(district.id); } }, [initialData, selectedCityIdWali, districtsWali, selectedDistrictIdWali]);
  useEffect(() => { if (initialData?.desakelurahanwali && selectedDistrictIdWali && villagesWali.length > 0 && !selectedVillageIdWali) { const village = villagesWali.find(v => v.name === initialData.desakelurahanwali); if (village) setSelectedVillageIdWali(village.id); } }, [initialData, selectedDistrictIdWali, villagesWali, selectedVillageIdWali]);

  useEffect(() => { if (initialData?.kotakabupatenwakilwali && selectedProvinceIdWakilWali && citiesWakilWali.length > 0 && !selectedCityIdWakilWali) { const city = citiesWakilWali.find(c => c.name === initialData.kotakabupatenwakilwali); if (city) setSelectedCityIdWakilWali(city.id); } }, [initialData, selectedProvinceIdWakilWali, citiesWakilWali, selectedCityIdWakilWali]);
  useEffect(() => { if (initialData?.kecamatanwakilwali && selectedCityIdWakilWali && districtsWakilWali.length > 0 && !selectedDistrictIdWakilWali) { const district = districtsWakilWali.find(d => d.name === initialData.kecamatanwakilwali); if (district) setSelectedDistrictIdWakilWali(district.id); } }, [initialData, selectedCityIdWakilWali, districtsWakilWali, selectedDistrictIdWakilWali]);
  useEffect(() => { if (initialData?.desakelurahanwakilwali && selectedDistrictIdWakilWali && villagesWakilWali.length > 0 && !selectedVillageIdWakilWali) { const village = villagesWakilWali.find(v => v.name === initialData.desakelurahanwakilwali); if (village) setSelectedVillageIdWakilWali(village.id); } }, [initialData, selectedDistrictIdWakilWali, villagesWakilWali, selectedVillageIdWakilWali]);


  // handleChange and handleRegionChange remain the same
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>, level: 'province' | 'city' | 'district' | 'village', entity: 'santri' | 'ayah' | 'ibu' | 'wali' | 'wakilwali' = 'santri') => {
    const { value, options, selectedIndex } = e.target;
    const selectedName = options[selectedIndex].text;

    const stateUpdaterMap = {
      santri: { province: setSelectedProvinceId, city: setSelectedCityId, district: setSelectedDistrictId, village: setSelectedVillageId },
      ayah: { province: setSelectedProvinceIdAyah, city: setSelectedCityIdAyah, district: setSelectedDistrictIdAyah, village: setSelectedVillageIdAyah },
      ibu: { province: setSelectedProvinceIdIbu, city: setSelectedCityIdIbu, district: setSelectedDistrictIdIbu, village: setSelectedVillageIdIbu },
      wali: { province: setSelectedProvinceIdWali, city: setSelectedCityIdWali, district: setSelectedDistrictIdWali, village: setSelectedVillageIdWali },
      wakilwali: { province: setSelectedProvinceIdWakilWali, city: setSelectedCityIdWakilWali, district: setSelectedDistrictIdWakilWali, village: setSelectedVillageIdWakilWali },
    };
    
    const formDataFieldMap = {
      santri: { province: 'provinsi', city: 'kotakabupaten', district: 'kecamatan', village: 'desakelurahan' },
      ayah: { province: 'provinsiayah', city: 'kotakabupatenayah', district: 'kecamatanayah', village: 'desakelurahanayah' },
      ibu: { province: 'provinsiibu', city: 'kotakabupatenibu', district: 'kecamatanibu', village: 'desakelurahanibu' },
      wali: { province: 'provinsiwali', city: 'kotakabupatenwali', district: 'kecamatanwali', village: 'desakelurahanwali' },
      wakilwali: { province: 'provinsiwakilwali', city: 'kotakabupatenwakilwali', district: 'kecamatanwakilwali', village: 'desakelurahanwakilwali' },
    };

    stateUpdaterMap[entity][level](value);
    const fieldName = formDataFieldMap[entity][level];
    setFormData(prev => ({ ...prev, [fieldName]: selectedName === 'Pilih...' ? '' : selectedName }));

    // Reset lower levels
    if (level === 'province') {
      stateUpdaterMap[entity].city(''); stateUpdaterMap[entity].district(''); stateUpdaterMap[entity].village('');
      setFormData(prev => ({ ...prev, [formDataFieldMap[entity].city]: '', [formDataFieldMap[entity].district]: '', [formDataFieldMap[entity].village]: '' }));
    } else if (level === 'city') {
      stateUpdaterMap[entity].district(''); stateUpdaterMap[entity].village('');
      setFormData(prev => ({ ...prev, [formDataFieldMap[entity].district]: '', [formDataFieldMap[entity].village]: '' }));
    } else if (level === 'district') {
      stateUpdaterMap[entity].village('');
      setFormData(prev => ({ ...prev, [formDataFieldMap[entity].village]: '' }));
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'pasFoto' | 'dokumenDomisili') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'pasFoto') {
        setPasFotoFile(file); 
        const reader = new FileReader();
        reader.onloadend = () => { setPasFotoPreview(reader.result as string); };
        reader.readAsDataURL(file);
      } else { 
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({ ...prev, dokumendomisilibase64: base64String })); 
          setNamaFileDomisili(file.name); 
        };
        reader.readAsDataURL(file);
      }
    } else { 
        if (fileType === 'pasFoto') { 
            setPasFotoFile(null); 
            if (initialData?.pasFotoFileId) {
              try {
                const url = appwriteStorage.getFilePreview(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, initialData.pasFotoFileId);
                setPasFotoPreview(url.toString());
              } catch {setPasFotoPreview(null);}
            } else {
              setPasFotoPreview(null);
            }
        } else { 
            setFormData(prev => ({...prev, dokumendomisilibase64: ''})); 
            setNamaFileDomisili(null); 
        }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalFormData = { ...formData };
    if (formData.identitaswaliutama === IdentitasWali.AYAH) {
        finalFormData.namawali = formData.namaayah || 'Data Ayah Tidak Lengkap';
        finalFormData.nomorteleponwali = formData.nomorteleponorangtua || 'Nomor Tidak Ada'; 
    } else { if (!formData.namawali || !formData.nomorteleponwali) { alert("Mohon lengkapi Nama Wali dan Nomor Telepon Wali."); return; }}
    if (!finalFormData.namalengkap || !finalFormData.tanggallahir || !finalFormData.namawali || !finalFormData.tanggalmasuk ) { alert("Mohon lengkapi semua kolom yang wajib diisi (Nama Lengkap, Tanggal Lahir, Nama Wali, Tanggal Masuk)."); return; }
    
    const { pasFotoFileId, ...dataToSubmit } = finalFormData;
    
    const submissionPayload: SantriPayload = initialData?.id && !pasFotoFile 
        ? { ...dataToSubmit, pasFotoFileId: initialData.pasFotoFileId } 
        : dataToSubmit;

    onSubmit(submissionPayload, pasFotoFile, initialData?.id);
  };

  // ... (Rest of the component, including JSX, remains largely the same, with pasfotourl related logic adapted for pasFotoFileId and pasFotoPreview)
  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors disabled:bg-slate-100 disabled:text-slate-500";
  const labelClass = "block text-sm font-medium text-neutral-content/90";
  const sectionTitleClass = "text-xl font-bold text-neutral-content border-b-2 border-secondary pb-2 mb-6 mt-8";
  const subSectionTitleClass = "text-lg font-semibold text-neutral-content border-b border-slate-300 pb-2 mb-4 mt-6";
  const requiredStarClass = "text-red-500 ml-0.5";

  const showFormalFields = formData.jenispendidikanterakhir === JenisPendidikanTerakhir.FORMAL || formData.jenispendidikanterakhir === JenisPendidikanTerakhir.FORMAL_DAN_NON_FORMAL;
  const showNonFormalFields = formData.jenispendidikanterakhir === JenisPendidikanTerakhir.NON_FORMAL || formData.jenispendidikanterakhir === JenisPendidikanTerakhir.FORMAL_DAN_NON_FORMAL;
  
  const showAlamatAyah = formData.isalamatayahsama === PilihanYaTidak.TIDAK;
  const showAyahOrganisasiDetails = formData.isayahorganisasi === PilihanYaTidak.YA;
  const showAyahAlumniDetails = formData.statuskealumnianayah === StatusKealumnian.ALUMNI;

  const showAlamatIbu = formData.isalamatibusama === PilihanYaTidak.TIDAK;
  const showIbuOrganisasiDetails = formData.isibuorganisasi === PilihanYaTidak.YA;
  
  const showWaliDetails = formData.identitaswaliutama !== IdentitasWali.AYAH && formData.identitaswaliutama !== '';
  const showHubunganWaliLainnya = formData.identitaswaliutama === IdentitasWali.LAINNYA;
  const showWaliAlumniDetails = formData.statuskealumnianwali === StatusKealumnian.ALUMNI && showWaliDetails;
  const showAlamatWali = formData.isalamatwalisama === PilihanYaTidak.TIDAK && showWaliDetails;

  const showHubunganWakilWaliLainnya = formData.hubunganwakilwali === IdentitasWali.LAINNYA;
  const showWakilWaliAlumniDetails = formData.statuskealumnianwakilwali === StatusKealumnian.ALUMNI;
  const showAlamatWakilWali = formData.isalamatwakilwalisama === PilihanYaTidak.TIDAK;

  const sortedKelasRecords = [...kelasRecords].sort((a,b) => (a.urutanTampilan ?? 99) - (b.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas));
  const sortedBlokRecords = [...blokRecords].sort((a,b) => a.namaBlok.localeCompare(b.namaBlok));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-base-100 p-1 rounded-lg">
      
      {regionApiError && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm mb-4">{regionApiError}</div>}
      {/* ... other region error messages ... */}

      <h3 className={sectionTitleClass}>Informasi Dasar Santri</h3>
      {/* ... (Most form fields remain the same) ... */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {/* ... other fields ... */}
        <div> <label htmlFor="status" className={labelClass}>Status Santri <span className={requiredStarClass}>*</span></label> <select name="status" id="status" value={formData.status} onChange={handleChange} className={inputClass} required> {daftarStatusSantriForm.map(s => <option key={s} value={s}>{s}</option>)} </select> </div>
        <div> <label htmlFor="namalengkap" className={labelClass}>Nama Lengkap <span className={requiredStarClass}>*</span></label> <input type="text" name="namalengkap" id="namalengkap" value={formData.namalengkap} onChange={handleChange} className={inputClass} required /> </div>
        {/* ... other fields ... */}
      </div>
      
      {/* ... (Alamat fields remain the same) ... */}

      {/* ... (Minat dan Pendidikan fields remain the same) ... */}
      
      {/* ... (Informasi Akademik Pesantren fields remain the same) ... */}
      
      {/* ... (Data Orang Tua & Wali sections remain the same) ... */}
      
      <h3 className={sectionTitleClass}>Unggah Dokumen</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div> 
          <label htmlFor="pasFoto" className={labelClass}>Unggah Pas Foto (Max 2MB)</label> 
          <input type="file" name="pasFoto" id="pasFoto" onChange={(e) => handleFileChange(e, 'pasFoto')} accept="image/png, image/jpeg, image/webp" className={`${inputClass} p-0 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-colors`} /> 
          {pasFotoPreview && ( 
            <div className="mt-3 w-32 h-32 border border-slate-300 rounded-md overflow-hidden shadow"> 
              <img src={pasFotoPreview} alt="Preview Pas Foto" className="w-full h-full object-cover" /> 
            </div> 
          )} 
        </div>
        <div> 
          <label htmlFor="dokumenDomisili" className={labelClass}>Unggah Surat Domisili (PDF, Max 5MB)</label> 
          <input type="file" name="dokumenDomisili" id="dokumenDomisili" onChange={(e) => handleFileChange(e, 'dokumenDomisili')} accept=".pdf" className={`${inputClass} p-0 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-colors`} /> 
          {namaFileDomisili && <p className="text-xs text-slate-500 mt-1">File terpilih: {namaFileDomisili}</p>} 
        </div>
      </div>
      
      <div> <label htmlFor="catatan" className={labelClass}>Catatan Tambahan</label> <textarea name="catatan" id="catatan" value={formData.catatan || ''} onChange={handleChange} rows={3} className={inputClass} /> </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-base-300 mt-8">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md"> Batal </button>
        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md"> {initialData ? 'Simpan Perubahan' : 'Tambah Santri'} </button>
      </div>
    </form>
  );
};

export default SantriForm;
