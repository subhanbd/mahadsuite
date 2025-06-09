

import React from 'react';
import DashboardIcon from './icons/DashboardIcon';
import UsersIcon from './icons/UsersIcon';
// import CogIcon from './icons/CogIcon'; // Not currently used for settings page
import LogoutIcon from './icons/LogoutIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon'; 
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import CreditCardIcon from './icons/CreditCardIcon'; 
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import DocumentChartBarIcon from './icons/DocumentChartBarIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import UserMinusIcon from './icons/UserMinusIcon';
import AcademicCapIcon from './icons/AcademicCapIcon'; // For Kelas & Munjiz
import UserGroupIcon from './icons/UserGroupIcon'; // For Ketua Blok
import PencilSquareIcon from './icons/PencilSquareIcon'; // For Ujian

import { AppView, UserRole, userRoleDisplayNames, menuAccessConfig } from '../types';

interface NavbarProps {
  isSidebarOpen: boolean;
  activeView: AppView;
  onNavigate: (view: AppView, params?: Record<string, string>) => void;
  onLogout: () => void;
  currentUserRole: UserRole; 
  setCurrentUserRole: (role: UserRole) => void;
  isActualAdminSession: boolean; 
}

const Navbar: React.FC<NavbarProps> = ({ 
  isSidebarOpen, 
  activeView, 
  onNavigate, 
  onLogout, 
  currentUserRole, 
  setCurrentUserRole,
  isActualAdminSession 
}) => {
  const allMenuItems: { label: string; icon: JSX.Element; view: AppView }[] = [
    { label: 'Dashboard', icon: <DashboardIcon />, view: 'Dashboard' },
    { label: 'Data Santri Aktif', icon: <UsersIcon />, view: 'DataSantri' },
    { label: 'Data Alumni', icon: <UsersIcon />, view: 'DataAlumni' },
    { label: 'Data Santri Munjiz', icon: <AcademicCapIcon />, view: 'DataMunjiz'}, 
    { label: 'Manajemen Kelas', icon: <AcademicCapIcon />, view: 'KelasManagement' },
    { label: 'Manajemen Blok', icon: <BuildingLibraryIcon />, view: 'BlokManagement' },
    { label: 'List Ketua Blok', icon: <UserGroupIcon />, view: 'KetuaBlokList' },
    { label: 'Coret KTT', icon: <UserMinusIcon />, view: 'CoretKtt' },
    { label: 'Perizinan Santri', icon: <ClipboardDocumentListIcon />, view: 'PerizinanSantri' },
    { label: 'Absensi', icon: <ClipboardDocumentCheckIcon />, view: 'Absensi' },
    { label: 'Rekap Absensi', icon: <DocumentChartBarIcon />, view: 'RekapAbsensi' },
    { label: 'Ujian Iqsam', icon: <PencilSquareIcon/>, view: 'ManajemenUjianIqsam'},
    { label: 'Ujian Tamrin', icon: <PencilSquareIcon/>, view: 'ManajemenUjianTamrin'},
    { label: 'Manajemen Pengguna', icon: <ShieldCheckIcon />, view: 'UserManagement' }, 
    { label: 'Jenis Tagihan', icon: <CurrencyDollarIcon />, view: 'FinancialManagement'},
    { label: 'Pembayaran Santri', icon: <CreditCardIcon />, view: 'SantriPaymentManagement'},
    { label: 'Profil Pesantren', icon: <BuildingLibraryIcon />, view: 'PesantrenProfile' },
  ];

  const getVisibleMenuItems = () => {
    const accessibleViews = menuAccessConfig[currentUserRole];
    if (!accessibleViews) {
      return allMenuItems.filter(item => item.view === 'Dashboard');
    }
    return allMenuItems.filter(item => accessibleViews.includes(item.view));
  };

  const visibleMenuItems = getVisibleMenuItems();

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentUserRole(event.target.value as UserRole);
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-64 
        bg-primary shadow-xl transition-transform duration-300 ease-in-out print:hidden
        lg:shadow-lg 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      aria-label="Sidebar"
    >
      <div 
        className="flex flex-col h-full overflow-x-hidden"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-3 border-b border-primary-focus px-4 shrink-0 text-center">
          <h1 className="text-2xl font-bold text-primary-content truncate"> 
            Ma’had Suite
          </h1>
          <p className="text-xs text-primary-content/80 mt-1 px-2 py-0.5 bg-primary-focus/50 rounded-md">
            {userRoleDisplayNames[currentUserRole]}
          </p>
        </div>

        {isActualAdminSession && (
          <div className="px-3 pt-3 pb-2 border-b border-primary-focus">
            <label htmlFor="role-selector" className="block text-xs font-medium text-primary-content/70 mb-1">Simulasikan Peran:</label>
            <select 
              id="role-selector"
              value={currentUserRole} 
              onChange={handleRoleChange}
              className="w-full p-2 text-sm rounded-md bg-primary-focus text-primary-content border border-primary-content/30 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
              aria-label="Simulasikan peran pengguna"
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>
                  {userRoleDisplayNames[role]}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {visibleMenuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.view)}
              className={`
                w-full flex items-center gap-x-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-secondary
                ${activeView === item.view
                  ? 'bg-secondary text-secondary-content shadow-md' 
                  : 'text-slate-300 hover:bg-primary-focus hover:text-primary-content'
                }
              `}
              aria-current={activeView === item.view ? 'page' : undefined}
            >
              {React.cloneElement(item.icon, { 
                className: `w-5 h-5 shrink-0 ${activeView === item.view ? 'text-secondary-content' : 'text-slate-400 group-hover:text-primary-content'}`
              })}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 mt-auto border-t border-primary-focus shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-x-3.5 px-3.5 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-700/80 hover:text-white transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-red-500"
            aria-label="Logout"
          >
            <LogoutIcon className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-white" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;