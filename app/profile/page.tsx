import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Perfil - UTAD FastTicket',
    description: 'Aceda e altere o seu perfil da plataforma.'
};

export default function ProfilePage() {
    redirect('/dashboard/utilizador');
}