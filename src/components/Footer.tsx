import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background-surface border-t border-border-subtle mt-20 pt-12 pb-10 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border-subtle">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2 group select-none">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center font-black text-white text-base">
                <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                i<span className="text-primary">Watch</span>
              </span>
            </Link>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-md">
              Platform streaming anime subtitle Indonesia generasi berikutnya dengan antarmuka tajam, responsif, bebas iklan pop-up mengganggu, dan berkinerja tinggi.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1">
              <span>Dibangun dengan React & Tailwind</span>
              <span>•</span>
              <span>Didukung Samehadaku REST API</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-neutral-200 font-semibold text-xs tracking-wider uppercase">Navigasi Cepat</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Beranda Utama</Link>
              </li>
              <li>
                <Link to="/katalog" className="hover:text-white transition-colors">Katalog Seluruh Anime</Link>
              </li>
              <li>
                <Link to="/jadwal" className="hover:text-white transition-colors">Jadwal Rilis Harian</Link>
              </li>
              <li>
                <Link to="/top-10" className="hover:text-white transition-colors">Top 10 Terpopuler</Link>
              </li>
              <li>
                <Link to="/riwayat" className="hover:text-white transition-colors">Riwayat Tontonan</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="text-neutral-200 font-semibold text-xs tracking-wider uppercase">Pemberitahuan</h4>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              iWatch adalah klien web pihak ketiga non-komersial. Kami tidak meng-hosting berkas media video apa pun di server kami. Seluruh tautan video dan metadata diambil dari penyedia publik pihak ketiga.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} iWatch Streaming Platform. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-1">
            <span>Didesain dengan presisi editorial modern</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

