import { RiseText } from "../components/motion";
import { Btn } from "../components/ui";

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[90svh] flex-col items-start justify-center pt-28">
      <p className="label eyebrow">404 · Kare bulunamadı</p>
      <RiseText as="h1" onLoad text="Bu sahne *kurguda* yok" className="t-1 mt-6 max-w-[12ch]" />
      <p className="t-lead mt-6 max-w-md text-mute">Aradığınız sayfa taşınmış ya da hiç çekilmemiş olabilir.</p>
      <Btn href="/" icon="arrow" className="mt-10">
        Anasayfaya dön
      </Btn>
    </section>
  );
}
