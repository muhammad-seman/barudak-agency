import './globals.css';

export const metadata = {
  title: 'BarudakAgency',
  description: 'Sistem Manajemen Wedding Agency',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
