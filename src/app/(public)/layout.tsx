import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BotonWhatsAppFlotante from "@/components/BotonWhatsAppFlotante";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BotonWhatsAppFlotante />
    </>
  );
}
