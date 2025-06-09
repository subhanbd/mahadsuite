
import React, { useMemo } from 'react';
import { Santri, SantriStatus } from '../types';
import StatCard from './StatCard';
import UsersIcon from './icons/UsersIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import MapPinIcon from './icons/MapPinIcon';
import UserGroupIcon from './icons/UserGroupIcon'; 

interface DashboardViewProps {
  santriList: Santri[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ santriList }) => {
  const stats = useMemo(() => {
    const totalAktif = santriList.filter(s => s.status === SantriStatus.AKTIF).length;
    const totalAlumni = santriList.filter(s => s.status === SantriStatus.ALUMNI).length;
    const totalSantri = santriList.length; 

    const santriByDaerah = santriList.reduce((acc, santri) => {
      const daerah = santri.daerahasal?.trim() || 'Tidak Diketahui'; // daerahasal
      acc[daerah] = (acc[daerah] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalAktif, totalAlumni, totalSantri, santriByDaerah };
  }, [santriList]);

  if (santriList.length === 0) {
    return (
         <div className="text-center py-16 bg-base-100 rounded-xl shadow-lg">
            <UserGroupIcon className="mx-auto h-20 w-20 text-slate-400 mb-6" />
            <h3 className="mt-2 text-2xl font-semibold text-neutral-content">Belum Ada Data Santri</h3>
            <p className="mt-2 text-base text-base-content/80">Statistik akan muncul di sini setelah data santri ditambahkan.</p>
            <p className="mt-1 text-sm text-base-content/60">Mulai dengan mengklik tombol "Tambah Santri".</p>
        </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-neutral-content mb-8">Ringkasan Statistik Santri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <StatCard 
            title="Total Santri Terdaftar" 
            value={stats.totalSantri} 
            icon={<UserGroupIcon />} 
            bgColorClass="bg-nifty-indigo" 
            textColorClass="text-white"
            iconColorClass="text-indigo-200"
          />
          <StatCard 
            title="Santri Aktif" 
            value={stats.totalAktif} 
            icon={<UsersIcon />} 
            bgColorClass="bg-nifty-green"
            textColorClass="text-white"
            iconColorClass="text-green-100"
          />
          <StatCard 
            title="Total Alumni" 
            value={stats.totalAlumni} 
            icon={<AcademicCapIcon />} 
            bgColorClass="bg-nifty-blue"
            textColorClass="text-white"
            iconColorClass="text-sky-100"
          />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-neutral-content mb-6 flex items-center">
            <MapPinIcon className="w-7 h-7 mr-2.5 text-secondary"/>
            Statistik Santri Berdasarkan Wilayah
        </h3>
        {Object.keys(stats.santriByDaerah).length > 0 ? (
            <div className="bg-base-100 shadow-xl rounded-xl p-6">
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {Object.entries(stats.santriByDaerah)
                    .sort(([, countA], [, countB]) => countB - countA) 
                    .map(([daerah, count]) => (
                    <li key={daerah} className="flex justify-between items-center p-3.5 bg-neutral hover:bg-neutral-focus rounded-lg transition-colors duration-150 ease-in-out">
                        <span className="font-medium text-base-content">{daerah}</span>
                        <span className="text-lg font-semibold text-secondary">{count} santri</span>
                    </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p className="text-base-content/80 bg-base-100 shadow-lg rounded-xl p-8 text-center">Belum ada data wilayah santri yang tercatat untuk ditampilkan.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
