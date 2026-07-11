import type { ReactNode } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingBar from "../../components/BookingBar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />

      <div className="relative w-full flex-1">{children}</div>

      <Footer />

      <BookingBar />
    </>
  );
}
