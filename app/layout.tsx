import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { Metadata } from "next";
import SideNav from "./ui/sidenav";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | AIBOLID",
    default: "AIBOLID",
  },
  description: "Система управления складом и заказами",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
              <SideNav />
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
