import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Bluebird School | Project Portal",
  description: "Student project submissions and mentor reviews.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            closeButton
            richColors
            theme="light"
            toastOptions={{
              classNames: {
                toast: "font-sans",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
