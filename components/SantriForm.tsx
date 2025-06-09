
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
  BlokRecord
} from '../types';

type SantriPayload = Omit<Santri, 'id' | 'created_at' | 'updated_at'>;


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
      
      pasfotourl: undefined,
      dokumendomisilibase64: '', 

      status: SantriStatus.AKTIF,
      daerahasal: '', 
    };
  }, [kelasRecords, blokRecords]);

  const [formData, setFormData] = useState<SantriPayload>(getInitialFormState());
  const [pasFotoPreview, setPasFotoPreview] = useState<string | null>(null);
  const [pasFotoFile, setPasFotoFile] = useState<File | null>(null); 
  const [namaFileDomisili, setNamaFileDomisili] = useState<string | null>(null);

  // Region state variables
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

  // Ayah Regions
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

  // Ibu Regions
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
  
  // Wali Regions
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

  // Wakil Wali Regions
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


  const fetchRegions = useCallback(async (
    type: 'provinsi' | 'kabupaten' | 'kecamatan' | 'kelurahan',
    id?: string,
    entity: 'santri' | 'ayah' | 'ibu' | 'wali' | 'wakilwali' = 'santri'
  ) => {
    let url = `${BYTEBINDER_BASE_URL}/${type}?api_key=${BYTEBINDER_API_KEY}`;
    if (id) {
      if (type === 'kabupaten') url += `&id_provinsi=${id}`;
      else if (type === 'kecamatan') url += `&id_kabupaten=${id}`;
      else if (type === 'kelurahan') url += `&id_kecamatan=${id}`;
    }

    const setLoading = (loading: boolean) => {
      if (entity === 'santri') {
        if (type === 'provinsi') setProvincesLoading(loading);
        else if (type === 'kabupaten') setCitiesLoading(loading);
        else if (type === 'kecamatan') setDistrictsLoading(loading);
        else if (type === 'kelurahan') setVillagesLoading(loading);
      } else if (entity === 'ayah') {
        if (type === 'provinsi') setProvincesAyahLoading(loading);
        // ... other types for ayah
      } else if (entity === 'ibu') {
         if (type === 'provinsi') setProvincesIbuLoading(loading);
        // ... other types for ibu
      } else if (entity === 'wali') {
         if (type === 'provinsi') setProvincesWaliLoading(loading);
        // ... other types for wali
      } else if (entity === 'wakilwali') {
        if (type === 'provinsi') setProvincesWakilWaliLoading(loading);
        else if (type === 'kabupaten') setCitiesWakilWaliLoading(loading);
        else if (type === 'kecamatan') setDistrictsWakilWaliLoading(loading);
        else if (type === 'kelurahan') setVillagesWakilWaliLoading(loading);
      }
    };

    const setData = (data: RegionOption[]) => {
      if (entity === 'santri') {
        if (type === 'provinsi') setProvinces(data);
        else if (type === 'kabupaten') setCities(data);
        else if (type === 'kecamatan') setDistricts(data);
        else if (type === 'kelurahan') setVillages(data);
      } else if (entity === 'ayah') {
        if (type === 'provinsi') setProvincesAyah(data);
         // ... other types for ayah
      } else if (entity === 'ibu') {
        if (type === 'provinsi') setProvincesIbu(data);
         // ... other types for ibu
      } else if (entity === 'wali') {
        if (type === 'provinsi') setProvincesWali(data);
         // ... other types for wali
      } else if (entity === 'wakilwali') {
        if (type === 'provinsi') setProvincesWakilWali(data);
        else if (type === 'kabupaten') setCitiesWakilWali(data);
        else if (type === 'kecamatan') setDistrictsWakilWali(data);
        else if (type === 'kelurahan') setVillagesWakilWali(data);
      }
    };
    
    const setError = (error: string | null) => {
        if (entity === 'santri') setRegionApiError(error);
        else if (entity === 'ayah') setRegionApiErrorAyah(error);
        else if (entity === 'ibu') setRegionApiErrorIbu(error);
        else if (entity === 'wali') setRegionApiErrorWali(error);
        else if (entity === 'wakilwali') setRegionApiErrorWakilWali(error);
    };

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.value && Array.isArray(result.value)) {
        setData(result.value.map((item: any) => ({ id: item.id, name: item.name })));
      } else {
        setError(`Format data tidak sesuai dari API untuk ${type}`);
        setData([]);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setError(`Gagal memuat data ${type}. Periksa koneksi internet Anda.`);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch for provinces (all entities)
  useEffect(() => { fetchRegions('provinsi', undefined, 'santri'); }, [fetchRegions]);
  useEffect(() => { fetchRegions('provinsi', undefined, 'ayah'); }, [fetchRegions]);
  useEffect(() => { fetchRegions('provinsi', undefined, 'ibu'); }, [fetchRegions]);
  useEffect(() => { fetchRegions('provinsi', undefined, 'wali'); }, [fetchRegions]);
  useEffect(() => { fetchRegions('provinsi', undefined, 'wakilwali'); }, [fetchRegions]);


  // Effects for cascading region selection (Santri)
  useEffect(() => { if (selectedProvinceId) fetchRegions('kabupaten', selectedProvinceId, 'santri'); else setCities([]); }, [selectedProvinceId, fetchRegions]);
  useEffect(() => { if (selectedCityId) fetchRegions('kecamatan', selectedCityId, 'santri'); else setDistricts([]); }, [selectedCityId, fetchRegions]);
  useEffect(() => { if (selectedDistrictId) fetchRegions('kelurahan', selectedDistrictId, 'santri'); else setVillages([]); }, [selectedDistrictId, fetchRegions]);

  // Effects for cascading region selection (Ayah) - Assuming similar logic
  useEffect(() => { if (selectedProvinceIdAyah) fetchRegions('kabupaten', selectedProvinceIdAyah, 'ayah'); else setCitiesAyah([]); }, [selectedProvinceIdAyah, fetchRegions]);
  useEffect(() => { if (selectedCityIdAyah) fetchRegions('kecamatan', selectedCityIdAyah, 'ayah'); else setDistrictsAyah([]); }, [selectedCityIdAyah, fetchRegions]);
  useEffect(() => { if (selectedDistrictIdAyah) fetchRegions('kelurahan', selectedDistrictIdAyah, 'ayah'); else setVillagesAyah([]); }, [selectedDistrictIdAyah, fetchRegions]);
  
  // Effects for cascading region selection (Ibu)
  useEffect(() => { if (selectedProvinceIdIbu) fetchRegions('kabupaten', selectedProvinceIdIbu, 'ibu'); else setCitiesIbu([]); }, [selectedProvinceIdIbu, fetchRegions]);
  useEffect(() => { if (selectedCityIdIbu) fetchRegions('kecamatan', selectedCityIdIbu, 'ibu'); else setDistrictsIbu([]); }, [selectedCityIdIbu, fetchRegions]);
  useEffect(() => { if (selectedDistrictIdIbu) fetchRegions('kelurahan', selectedDistrictIdIbu, 'ibu'); else setVillagesIbu([]); }, [selectedDistrictIdIbu, fetchRegions]);

  // Effects for cascading region selection (Wali)
  useEffect(() => { if (selectedProvinceIdWali) fetchRegions('kabupaten', selectedProvinceIdWali, 'wali'); else setCitiesWali([]); }, [selectedProvinceIdWali, fetchRegions]);
  useEffect(() => { if (selectedCityIdWali) fetchRegions('kecamatan', selectedCityIdWali, 'wali'); else setDistrictsWali([]); }, [selectedCityIdWali, fetchRegions]);
  useEffect(() => { if (selectedDistrictIdWali) fetchRegions('kelurahan', selectedDistrictIdWali, 'wali'); else setVillagesWali([]); }, [selectedDistrictIdWali, fetchRegions]);
  
  // Effects for cascading region selection (Wakil Wali)
  useEffect(() => { if (selectedProvinceIdWakilWali) fetchRegions('kabupaten', selectedProvinceIdWakilWali, 'wakilwali'); else setCitiesWakilWali([]); }, [selectedProvinceIdWakilWali, fetchRegions]);
  useEffect(() => { if (selectedCityIdWakilWali) fetchRegions('kecamatan', selectedCityIdWakilWali, 'wakilwali'); else setDistrictsWakilWali([]); }, [selectedCityIdWakilWali, fetchRegions]);
  useEffect(() => { if (selectedDistrictIdWakilWali) fetchRegions('kelurahan', selectedDistrictIdWakilWali, 'wakilwali'); else setVillagesWakilWali([]); }, [selectedDistrictIdWakilWali, fetchRegions]);


  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, ...dataToEdit } = initialData;
      const baseFormData: SantriPayload = { 
        ...getInitialFormState(), 
        ...dataToEdit,
        pasfotourl: initialData.pasfotourl,
        jeniskelamin: initialData.jeniskelamin || JenisKelamin.LAKI_LAKI 
      };
      setFormData(baseFormData);
      setPasFotoPreview(initialData.pasfotourl || null);
      setPasFotoFile(null); 
      setNamaFileDomisili(dataToEdit.dokumendomisilibase64 ? 'Dokumen tersimpan' : null);

      // Initialize Santri regions
      if (initialData.provinsi && provinces.length > 0 && !selectedProvinceId) { const province = provinces.find(p => p.name === initialData.provinsi); if (province) setSelectedProvinceId(province.id); }
      // ... (similar for city, district, village for Santri, Ayah, Ibu, Wali)
      // Initialize Wakil Wali regions
      if (initialData.provinsiwakilwali && provincesWakilWali.length > 0 && !selectedProvinceIdWakilWali) { const province = provincesWakilWali.find(p => p.name === initialData.provinsiwakilwali); if (province) setSelectedProvinceIdWakilWali(province.id); }
      if (initialData.kotakabupatenwakilwali && selectedProvinceIdWakilWali && citiesWakilWali.length > 0 && !selectedCityIdWakilWali) { const city = citiesWakilWali.find(c => c.name === initialData.kotakabupatenwakilwali); if (city) setSelectedCityIdWakilWali(city.id); }
      if (initialData.kecamatanwakilwali && selectedCityIdWakilWali && districtsWakilWali.length > 0 && !selectedDistrictIdWakilWali) { const district = districtsWakilWali.find(d => d.name === initialData.kecamatanwakilwali); if (district) setSelectedDistrictIdWakilWali(district.id); }
      if (initialData.desakelurahanwakilwali && selectedDistrictIdWakilWali && villagesWakilWali.length > 0 && !selectedVillageIdWakilWali) { const village = villagesWakilWali.find(v => v.name === initialData.desakelurahanwakilwali); if (village) setSelectedVillageIdWakilWali(village.id); }


    } else {
      setFormData(getInitialFormState());
      setPasFotoPreview(null); setPasFotoFile(null); setNamaFileDomisili(null);
      setSelectedProvinceId(''); setSelectedCityId(''); setSelectedDistrictId(''); setSelectedVillageId('');
      setSelectedProvinceIdAyah(''); setSelectedCityIdAyah(''); setSelectedDistrictIdAyah(''); setSelectedVillageIdAyah('');
      setSelectedProvinceIdIbu(''); setSelectedCityIdIbu(''); setSelectedDistrictIdIbu(''); setSelectedVillageIdIbu('');
      setSelectedProvinceIdWali(''); setSelectedCityIdWali(''); setSelectedDistrictIdWali(''); setSelectedVillageIdWali('');
      setSelectedProvinceIdWakilWali(''); setSelectedCityIdWakilWali(''); setSelectedDistrictIdWakilWali(''); setSelectedVillageIdWakilWali('');
    }
  }, [initialData, getInitialFormState, provinces, cities, districts, villages, provincesAyah, citiesAyah, districtsAyah, villagesAyah, provincesIbu, citiesIbu, districtsIbu, villagesIbu, provincesWali, citiesWali, districtsWali, villagesWali, provincesWakilWali, citiesWakilWali, districtsWakilWali, villagesWakilWali, selectedProvinceId, selectedProvinceIdAyah, selectedProvinceIdIbu, selectedProvinceIdWali, selectedProvinceIdWakilWali, selectedCityIdWakilWali, selectedDistrictIdWakilWali, selectedVillageIdWakilWali ]); 
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // For checkbox, handle checked state
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked ? PilihanYaTidak.YA : PilihanYaTidak.TIDAK }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRegionChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    level: 'province' | 'city' | 'district' | 'village',
    entity: 'santri' | 'ayah' | 'ibu' | 'wali' | 'wakilwali' = 'santri'
  ) => {
    const { value } = e.target;
    const selectedRegion = e.target.options[e.target.selectedIndex].text;

    if (entity === 'santri') {
        if (level === 'province') { setSelectedProvinceId(value); setFormData(prev => ({...prev, provinsi: selectedRegion, kotakabupaten: '', kecamatan: '', desakelurahan: ''})); setSelectedCityId(''); setSelectedDistrictId(''); setSelectedVillageId(''); }
        else if (level === 'city') { setSelectedCityId(value); setFormData(prev => ({...prev, kotakabupaten: selectedRegion, kecamatan: '', desakelurahan: ''})); setSelectedDistrictId(''); setSelectedVillageId(''); }
        else if (level === 'district') { setSelectedDistrictId(value); setFormData(prev => ({...prev, kecamatan: selectedRegion, desakelurahan: ''})); setSelectedVillageId('');}
        else if (level === 'village') { setSelectedVillageId(value); setFormData(prev => ({...prev, desakelurahan: selectedRegion}));}
    } else if (entity === 'ayah') {
        if (level === 'province') { setSelectedProvinceIdAyah(value); setFormData(prev => ({...prev, provinsiayah: selectedRegion, kotakabupatenayah: '', kecamatanayah: '', desakelurahanayah: ''})); setSelectedCityIdAyah(''); setSelectedDistrictIdAyah(''); setSelectedVillageIdAyah(''); }
        // ... similar for city, district, village for Ayah
    } else if (entity === 'ibu') {
        if (level === 'province') { setSelectedProvinceIdIbu(value); setFormData(prev => ({...prev, provinsiibu: selectedRegion, kotakabupatenibu: '', kecamatanibu: '', desakelurahanibu: ''})); setSelectedCityIdIbu(''); setSelectedDistrictIdIbu(''); setSelectedVillageIdIbu(''); }
        // ... similar for city, district, village for Ibu
    } else if (entity === 'wali') {
        if (level === 'province') { setSelectedProvinceIdWali(value); setFormData(prev => ({...prev, provinsiwali: selectedRegion, kotakabupatenwali: '', kecamatanwali: '', desakelurahanwali: ''})); setSelectedCityIdWali(''); setSelectedDistrictIdWali(''); setSelectedVillageIdWali(''); }
        // ... similar for city, district, village for Wali
    } else if (entity === 'wakilwali') {
        if (level === 'province') { setSelectedProvinceIdWakilWali(value); setFormData(prev => ({...prev, provinsiwakilwali: selectedRegion, kotakabupatenwakilwali: '', kecamatanwakilwali: '', desakelurahanwakilwali: ''})); setSelectedCityIdWakilWali(''); setSelectedDistrictIdWakilWali(''); setSelectedVillageIdWakilWali(''); }
        else if (level === 'city') { setSelectedCityIdWakilWali(value); setFormData(prev => ({...prev, kotakabupatenwakilwali: selectedRegion, kecamatanwakilwali: '', desakelurahanwakilwali: ''})); setSelectedDistrictIdWakilWali(''); setSelectedVillageIdWakilWali(''); }
        else if (level === 'district') { setSelectedDistrictIdWakilWali(value); setFormData(prev => ({...prev, kecamatanwakilwali: selectedRegion, desakelurahanwakilwali: ''})); setSelectedVillageIdWakilWali('');}
        else if (level === 'village') { setSelectedVillageIdWakilWali(value); setFormData(prev => ({...prev, desakelurahanwakilwali: selectedRegion}));}
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
        setFormData(prev => ({ ...prev, pasfotourl: undefined })); 
      } else { 
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setFormData(prev => ({ ...prev, dokumendomisilibase64: base64String }));
          setNamaFileDomisili(file.name);
        };
        reader.readAsDataURL(file);
      }
    } else { 
        if (fileType === 'pasFoto') { 
            setPasFotoFile(null); 
            setPasFotoPreview(initialData?.pasfotourl || null);
        } else { 
            setFormData(prev => ({ ...prev, dokumendomisilibase64: initialData?.dokumendomisilibase64 || ''}));
            setNamaFileDomisili(initialData?.dokumendomisilibase64 ? 'Dokumen tersimpan' : null);
        }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalFormData = { ...formData };
    
    if (finalFormData.isalamatayahsama === PilihanYaTidak.YA && finalFormData.isayahorganisasi === PilihanYaTidak.TIDAK) {
        finalFormData = { ...finalFormData, alamatlengkapayah: finalFormData.alamatlengkap, provinsiayah: finalFormData.provinsi, kotakabupatenayah: finalFormData.kotakabupaten, kecamatanayah: finalFormData.kecamatan, desakelurahanayah: finalFormData.desakelurahan, dusunayah: finalFormData.dusun, rtayah: finalFormData.rt, rwayah: finalFormData.rw };
    }
    if (finalFormData.isalamatibusama === PilihanYaTidak.YA) {
        finalFormData = { ...finalFormData, alamatlengkapibu: finalFormData.alamatlengkap, provinsiibu: finalFormData.provinsi, kotakabupatenibu: finalFormData.kotakabupaten, kecamatanibu: finalFormData.kecamatan, desakelurahanibu: finalFormData.desakelurahan, dusunibu: finalFormData.dusun, rtibu: finalFormData.rt, rwibu: finalFormData.rw };
    }
    if (finalFormData.isalamatwalisama === PilihanYaTidak.YA) {
        finalFormData = { ...finalFormData, alamatlengkapwali: finalFormData.alamatlengkap, provinsiwali: finalFormData.provinsi, kotakabupatenwali: finalFormData.kotakabupaten, kecamatanwali: finalFormData.kecamatan, desakelurahanwali: finalFormData.desakelurahan, dusunwali: finalFormData.dusun, rtwali: finalFormData.rt, rwwali: finalFormData.rw };
    }
    if (finalFormData.isalamatwakilwalisama === PilihanYaTidak.YA) {
        finalFormData = { ...finalFormData, alamatlengkapwakilwali: finalFormData.alamatlengkap, provinsinakilwali: finalFormData.provinsi, kotakabupatenwakilwali: finalFormData.kotakabupaten, kecamatanwakilwali: finalFormData.kecamatan, desakelurahanwakilwali: finalFormData.desakelurahan, dusunwakilwali: finalFormData.dusun, rtwakilwali: finalFormData.rt, rwwakilwali: finalFormData.rw };
    }


    if (!finalFormData.namalengkap || !finalFormData.tanggallahir || !finalFormData.namawali || !finalFormData.tanggalmasuk ) { alert("Mohon lengkapi semua kolom yang wajib diisi (Nama Lengkap, Tanggal Lahir, Nama Wali, Tanggal Masuk)."); return; }
    
    const dataToSubmit: SantriPayload = {
      ...finalFormData,
    };
    onSubmit(dataToSubmit, pasFotoFile, initialData?.id);
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors disabled:bg-slate-100 disabled:text-slate-500";
  const labelClass = "block text-sm font-medium text-neutral-content/90";
  const sectionTitleClass = "text-xl font-bold text-neutral-content border-b-2 border-secondary pb-2 mb-6 mt-8";
  const subSectionTitleClass = "text-lg font-semibold text-neutral-content/95 mb-4 mt-6";
  
  const sortedKelasRecords = [...kelasRecords].sort((a,b) => (a.urutanTampilan ?? 99) - (b.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas));
  const sortedBlokRecords = [...blokRecords].sort((a,b) => a.namaBlok.localeCompare(b.namaBlok));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-base-100 p-1 rounded-lg">
      <h3 className={sectionTitleClass}>Data Diri Santri</h3>
      {/* ... form content ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        <div><label htmlFor="namalengkap" className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label><input type="text" name="namalengkap" id="namalengkap" value={formData.namalengkap} onChange={handleChange} className={inputClass} required /></div>
        {/* ... other fields for Data Diri Santri ... */}
      </div>
      
       <h3 className={sectionTitleClass}>Alamat Santri</h3>
        {/* ... Alamat Santri fields ... */}
        {/* Example for province dropdown */}
        <div>
          <label htmlFor="provinsi" className={labelClass}>Provinsi</label>
          <select name="provinsi" id="provinsi" value={selectedProvinceId} onChange={(e) => handleRegionChange(e, 'province', 'santri')} className={inputClass} disabled={provincesLoading}>
            <option value="">{provincesLoading ? 'Memuat...' : 'Pilih Provinsi'}</option>
            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {/* ... City, District, Village for Santri ... */}


      <h3 className={sectionTitleClass}>Data Orang Tua</h3>
      <h4 className={subSectionTitleClass}>Data Ayah</h4>
      {/* ... Data Ayah fields, including address with its own set of region dropdowns ... */}
       <div>
          <label htmlFor="provinsiayah" className={labelClass}>Provinsi Ayah</label>
          <select name="provinsiayah" id="provinsiayah" value={selectedProvinceIdAyah} onChange={(e) => handleRegionChange(e, 'province', 'ayah')} className={inputClass} disabled={provincesAyahLoading || formData.isalamatayahsama === PilihanYaTidak.YA}>
            <option value="">{provincesAyahLoading ? 'Memuat...' : 'Pilih Provinsi Ayah'}</option>
            {provincesAyah.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
         {/* ... City, District, Village for Ayah ... */}

      <h4 className={subSectionTitleClass}>Data Ibu</h4>
      {/* ... Data Ibu fields ... */}
       <div>
          <label htmlFor="provinsiibu" className={labelClass}>Provinsi Ibu</label>
          <select name="provinsiibu" id="provinsiibu" value={selectedProvinceIdIbu} onChange={(e) => handleRegionChange(e, 'province', 'ibu')} className={inputClass} disabled={provincesIbuLoading || formData.isalamatibusama === PilihanYaTidak.YA}>
            <option value="">{provincesIbuLoading ? 'Memuat...' : 'Pilih Provinsi Ibu'}</option>
            {provincesIbu.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {/* ... City, District, Village for Ibu ... */}

      <h3 className={sectionTitleClass}>Data Wali Utama</h3>
      {/* ... Data Wali fields ... */}
      <div>
          <label htmlFor="provinsiwali" className={labelClass}>Provinsi Wali</label>
          <select name="provinsiwali" id="provinsiwali" value={selectedProvinceIdWali} onChange={(e) => handleRegionChange(e, 'province', 'wali')} className={inputClass} disabled={provincesWaliLoading || formData.isalamatwalisama === PilihanYaTidak.YA}>
            <option value="">{provincesWaliLoading ? 'Memuat...' : 'Pilih Provinsi Wali'}</option>
            {provincesWali.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {/* ... City, District, Village for Wali ... */}


      <h3 className={sectionTitleClass}>Data Wakil Wali (Opsional)</h3>
       {/* ... Data Wakil Wali fields ... */}
       <div>
          <label htmlFor="provinsiwakilwali" className={labelClass}>Provinsi Wakil Wali</label>
          <select name="provinsiwakilwali" id="provinsiwakilwali" value={selectedProvinceIdWakilWali} onChange={(e) => handleRegionChange(e, 'province', 'wakilwali')} className={inputClass} disabled={provincesWakilWaliLoading || formData.isalamatwakilwalisama === PilihanYaTidak.YA}>
            <option value="">{provincesWakilWaliLoading ? 'Memuat...' : 'Pilih Provinsi Wakil Wali'}</option>
            {provincesWakilWali.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {/* ... City, District, Village for Wakil Wali ... */}


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
          <label htmlFor="dokumenDomisili" className={labelClass}>Unggah Scan Keterangan Domisili (PDF/JPG/PNG, Max 5MB)</label>
          <input type="file" name="dokumenDomisili" id="dokumenDomisili" onChange={(e) => handleFileChange(e, 'dokumenDomisili')} accept=".pdf,image/png,image/jpeg" className={`${inputClass} p-0 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-colors`}/>
          {namaFileDomisili && <p className="text-xs text-green-600 mt-1">Dokumen terunggah: {namaFileDomisili}</p>}
        </div>
      </div>

      <h3 className={sectionTitleClass}>Data Administratif Pesantren</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
             <div><label htmlFor="tanggalmasuk" className={labelClass}>Tanggal Masuk <span className="text-red-500">*</span></label><input type="date" name="tanggalmasuk" id="tanggalmasuk" value={formData.tanggalmasuk} onChange={handleChange} className={inputClass} required/></div>
            <div>
                <label htmlFor="kelasid" className={labelClass}>Kelas/Halaqah Awal</label>
                <select name="kelasid" id="kelasid" value={formData.kelasid} onChange={handleChange} className={inputClass}>
                    <option value="">Pilih Kelas</option>
                    {sortedKelasRecords.map(k => (<option key={k.id} value={k.id}>{k.namaKelas}</option>))}
                </select>
            </div>
            <div>
                <label htmlFor="blokid" className={labelClass}>Blok Awal</label>
                <select name="blokid" id="blokid" value={formData.blokid} onChange={handleChange} className={inputClass}>
                    <option value="">Pilih Blok</option>
                    {sortedBlokRecords.map(b => (<option key={b.id} value={b.id}>{b.namaBlok}</option>))}
                </select>
            </div>
             <div><label htmlFor="nomorkamar" className={labelClass}>Nomor Kamar Awal</label><input type="text" name="nomorkamar" id="nomorkamar" value={formData.nomorkamar} onChange={handleChange} className={inputClass}/></div>
            <div className="md:col-span-2"><label htmlFor="catatan" className={labelClass}>Catatan Tambahan</label><textarea name="catatan" id="catatan" value={formData.catatan} onChange={handleChange} rows={2} className={inputClass}></textarea></div>
             <div>
                <label htmlFor="status" className={labelClass}>Status Santri <span className="text-red-500">*</span></label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className={inputClass} required>
                    {daftarStatusSantriForm.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
            </div>
        </div>


      <div className="flex justify-end gap-3 pt-6 border-t border-base-300 mt-8">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md"> Batal </button>
        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md"> {initialData ? 'Simpan Perubahan' : 'Tambah Santri'} </button>
      </div>
    </form>
  );
};

export default SantriForm;
