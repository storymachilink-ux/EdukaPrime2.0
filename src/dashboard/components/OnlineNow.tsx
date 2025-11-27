import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface User {
  id: number;
  name: string;
  status: 'online' | 'acabou de entrar';
}

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Ana Silva', status: 'online' },
  { id: 2, name: 'João Santos', status: 'online' },
  { id: 3, name: 'Maria Costa', status: 'acabou de entrar' },
  { id: 4, name: 'Pedro Lima', status: 'online' },
  { id: 5, name: 'Sofia Oliveira', status: 'acabou de entrar' },
  { id: 6, name: 'Carlos Ferreira', status: 'online' },
];

const NEW_USERS = [
  'Luciana Rocha',
  'Roberto Alves',
  'Fernanda Dias',
  'Miguel Torres',
  'Isabella Mendes',
  'Gabriel Souza',
  'Camila Barbosa',
  'Rafael Nunes',
  'Juliana Castro',
  'Diego Martins',
];

export const OnlineNow: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [newUserIndex, setNewUserIndex] = useState(0);

  useEffect(() => {
    // Add new user every 20 seconds
    const addUserInterval = setInterval(() => {
      const newUser: User = {
        id: Date.now(),
        name: NEW_USERS[newUserIndex % NEW_USERS.length],
        status: 'acabou de entrar',
      };

      setUsers(prevUsers => [newUser, ...prevUsers.slice(0, 5)]);
      setNewUserIndex(prev => prev + 1);
    }, 20000);

    // Recycle list every 4 minutes
    const recycleInterval = setInterval(() => {
      setUsers(INITIAL_USERS);
      setNewUserIndex(0);
    }, 240000);

    return () => {
      clearInterval(addUserInterval);
      clearInterval(recycleInterval);
    };
  }, [newUserIndex]);

  return (
    <div className="bg-white border border-[#FFE3A0] rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#033258]" />
        <h3 className="text-lg font-semibold text-[#033258]">
          Pessoas Online agora
        </h3>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <span className="text-[#624044] text-sm">{user.name}</span>
            <span
              className={`text-xs font-medium ${
                user.status === 'online'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {user.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[#FFE3A0]">
        <p className="text-xs text-[#624044] text-center">
          {users.length} pessoas conectadas
        </p>
      </div>
    </div>
  );
};