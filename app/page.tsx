import ScanVogueLanding from "./scan-vogue-landing";
 
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ScanVogue",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Platformă de gestionare a recenziilor și reclamațiilor pentru restaurante, cafenele și hoteluri din România, cu triaj automat prin inteligență artificială.",
  offers: {
    "@type": "Offer",
    price: "200",
    priceCurrency: "RON",
  },
  provider: {
    "@type": "Organization",
    name: "ScanVogue",
    url: "https://scanvogue.ro",
    email: "scanvogue@gmail.com",
  },
  areaServed: {
    "@type": "Country",
    name: "România",
  },
};
 
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScanVogueLanding />
    </>
  );
}
