
import React from 'react';
import Modal from './Modal';
import InformationCircleIcon from './icons/InformationCircleIcon'; // Optional: for a nice icon

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sectionTitleClass = "text-lg font-semibold text-secondary mb-2 mt-4 flex items-center";
  const paragraphClass = "text-base-content/90 leading-relaxed";
  const detailLabelClass = "font-medium text-neutral-content";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tentang Aplikasi Ma’had Suite">
      <div className="space-y-5 text-sm">
        
        <div className="p-4 bg-base-200 rounded-lg shadow-inner">
            <div className={sectionTitleClass}>
                <InformationCircleIcon className="w-5 h-5 mr-2" />
                Pengembang Aplikasi
            </div>
            <p className={paragraphClass}>
              <span className={detailLabelClass}>Nama:</span> Subhan Ubaidi
            </p>
            <p className={paragraphClass}>
              <span className={detailLabelClass}>Domisili:</span> RT/RW: 010/002, Kel. Curahdami, Kec. Curahdami, Kab. Bondowoso, Jawa Timur, 68251.
            </p>
        </div>

        <div className="p-4 bg-base-200 rounded-lg shadow-inner">
            <div className={sectionTitleClass}>
                 <InformationCircleIcon className="w-5 h-5 mr-2" />
                Dedikasi Aplikasi
            </div>
            <p className={paragraphClass}>
            Aplikasi Ma’had Suite ini didedikasikan untuk <strong className="font-semibold text-secondary">Pondok Pesantren Tempurejo</strong>.
            </p>
            <p className={`${paragraphClass} mt-2`}>
            Semoga aplikasi ini dapat menjadi amal jariyah bagi pengembang dan dapat memberikan manfaat yang besar bagi kemajuan Pondok Pesantren dalam mengelola data serta administrasi.
            </p>
            <p className={`${paragraphClass} mt-2`}>
            Masukan dan saran untuk pengembangan lebih lanjut sangat kami harapkan.
            </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AboutUsModal;
