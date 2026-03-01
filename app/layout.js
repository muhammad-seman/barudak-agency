import './globals.css';

export const metadata = {
  title: 'Barudak Agency | Solusi Mewah Wedding & Event Organizer',
  description: 'Wujudkan momen spesial Anda bersama Barudak Agency. Spesialis Wedding Organizer, Event Planner, dan MC profesional di Indonesia. Desain elegan Gold & Pink untuk hari sempurna Anda.',
  keywords: 'wedding organizer, event planner, master of ceremony, wedding planner indonesia, luxury weddings, barudak agency',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
