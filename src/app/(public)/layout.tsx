import type { ReactNode } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingBar from "../../components/BookingBar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />

      <div className="relative flex-1 w-full pt-24">{children}</div>

      <Footer />

      <BookingBar />
    </>
  );
}
