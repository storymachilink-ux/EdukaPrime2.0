import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

interface PurchaseNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  name: string;
  product: string;
  location: string;
  timeAgo: string;
}

const PurchaseNotificationPopup: React.FC<PurchaseNotificationProps> = ({ isVisible, onClose, name, product, location, timeAgo }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-sm">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-900 font-semibold">
              {name}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Comprou: <span className="font-semibold text-[#009944]">{product}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {location} - <span className="text-gray-400">há {timeAgo}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export const PurchaseNotificationManager: React.FC = () => {
  const names = [
    'Ana Luiza',
    'Camila Ribeiro',
    'Mariana Costa',
    'Larissa Fernandes',
    'Júlia Vasconcelos',
    'Rafaela Martins',
    'Bianca Oliveira',
    'Isabela Andrade',
    'Fernanda Cardoso',
    'Letícia Moreira',
    'Gabriela Nunes',
    'Priscila Figueiredo',
    'Gabriel Almeida',
    'Lucas Ferreira',
    'Rafael Santos',
    'Henrique Barros',
    'João Pedro',
    'Tiago Carvalho',
    'Eduardo Rezende',
  ];

  const locations = [
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Salvador, BA',
    'Fortaleza, CE',
    'Manaus, AM',
    'Curitiba, PR',
    'Recife, PE',
    'Porto Alegre, RS',
  ];

  const products = [
    'Coleção Completa',
    'Coleção Básica',
  ];

  const [isVisible, setIsVisible] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [currentProduct, setCurrentProduct] = useState('Plano Premium');
  const [currentLocation, setCurrentLocation] = useState('');
  const [currentTimeAgo, setCurrentTimeAgo] = useState('');
  const [usedIndexes, setUsedIndexes] = useState<number[]>([]);

  useEffect(() => {
    const getRandomNotification = () => {
      let availableIndexes = Array.from({ length: names.length }, (_, i) => i);

      // Remove nomes já usados
      availableIndexes = availableIndexes.filter(i => !usedIndexes.includes(i));

      // Se todos os nomes foram usados, resetar
      if (availableIndexes.length === 0) {
        availableIndexes = Array.from({ length: names.length }, (_, i) => i);
        setUsedIndexes([]);
      }

      // Pegar um índice aleatório para nome
      const randomNameIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      setCurrentName(names[randomNameIndex]);
      setUsedIndexes(prev => [...prev, randomNameIndex]);

      // Pegar localização aleatória
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      setCurrentLocation(randomLocation);

      // Pegar produto aleatório
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      setCurrentProduct(randomProduct);

      // Gerar tempo aleatório entre 2-5 minutos
      const randomMinutes = Math.floor(Math.random() * 4) + 2; // 2-5
      setCurrentTimeAgo(`${randomMinutes} minuto${randomMinutes > 1 ? 's' : ''}`);

      setIsVisible(true);
    };

    const interval = setInterval(() => {
      getRandomNotification();
    }, 30000);

    // Primeira notificação após 5 segundos
    const initialTimer = setTimeout(() => {
      getRandomNotification();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [names, locations, products, usedIndexes]);

  return (
    <PurchaseNotificationPopup
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
      name={currentName}
      product={currentProduct}
      location={currentLocation}
      timeAgo={currentTimeAgo}
    />
  );
};
