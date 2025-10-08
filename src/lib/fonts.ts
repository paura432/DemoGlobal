import localFont from 'next/font/local';

// Configuración de Telefónica Sans usando archivos .otf
export const telefonicaSans = localFont({
  src: [
    // Hairline (100)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Hairline.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Hairline Italic.otf',
      weight: '100',
      style: 'italic',
    },
    // Thin (200)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Thin.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Thin Italic.otf',
      weight: '200',
      style: 'italic',
    },
    // Light (300)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Light Italic.otf',
      weight: '300',
      style: 'italic',
    },
    // Regular (400)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Italic.otf',
      weight: '400',
      style: 'italic',
    },
    // Medium (500)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Medium Italic.otf',
      weight: '500',
      style: 'italic',
    },
    // DemiBold (600)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans DemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans DemiBold Italic.otf',
      weight: '600',
      style: 'italic',
    },
    // Bold (700)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Bold Italic.otf',
      weight: '700',
      style: 'italic',
    },
    // ExtraBold (800)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans ExtraBold Italic.otf',
      weight: '800',
      style: 'italic',
    },
    // Black (900)
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Black.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/telefonica-sans/Telefonica Sans Black Italic.otf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-telefonica-sans',
  display: 'swap',
});