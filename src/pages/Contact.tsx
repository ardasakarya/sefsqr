import { useEffect, useState, type FormEvent } from "react";
import { contact, WA } from "../data/site";
import PageHero from "../components/PageHero";
import { img } from "../lib/media";
import { FadeUp, RiseText } from "../components/motion";
import { Icon, SmartLink } from "../components/ui";

const ICONS = ["sparkle", "mail", "wa", "globe", "pin"];

/* Mesaj formu: bilgiler hiçbir sunucuya gitmez — WhatsApp hazır metinle açılır. */
function WaForm() {
  const [f, setF] = useState({ biz: "", name: "", topic: contact.topics[0]!.t, msg: "" });
  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = [`Merhaba, ben ${f.name || "-"}${f.biz ? ` (${f.biz})` : ""}.`, `Konu: ${f.topic}`, f.msg].filter(Boolean).join("\n");
    window.open(`${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };
  const field = "h-12 w-full rounded-2xl border border-line bg-white/70 px-4 outline-none transition-colors focus:border-[var(--c-accent)]";
  return (
    <form onSubmit={send} className="card flex flex-col gap-4 !bg-white/50 p-6 md:p-8">
      <p className="label text-mute">WhatsApp'a hazır mesaj</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          İşletme adı
          <input className={field} value={f.biz} onChange={(e) => setF({ ...f, biz: e.target.value })} autoComplete="organization" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Adınız
          <input className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Konu
        <select className={field} value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>
          {contact.topics.map((t) => (
            <option key={t.t}>{t.t}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Mesajınız
        <textarea className={`${field} h-32 resize-none py-3`} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} />
      </label>
      <button type="submit" className="btn btn-soft mt-2 self-start">
        <Icon name="wa" className="size-4" /> WhatsApp'ta aç
      </button>
      <p className="text-xs text-mute">Bilgileriniz bu sitede saklanmaz; mesaj WhatsApp'ta sizin onayınızla gönderilir.</p>
    </form>
  );
}

export default function Contact() {
  useEffect(() => {
    document.title = "İletişim | SELF'S QR";
  }, []);
  return (
    <>
      <PageHero title="Menünüzü *gönderin*, aynı gün yayına alalım" crumbs={[{ label: "Ana sayfa", href: "/" }, { label: contact.title }]} image={img.barista} />

      <section className="pb-24">
        <div className="wrap grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {contact.info.map((x, i) => {
            const inner = (
              <>
                <span className="grid size-11 flex-none place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-accent)_18%,transparent)]">
                  <Icon name={ICONS[i]!} className="size-5" />
                </span>
                <span className="sm:mt-auto sm:pt-8">
                  <span className="label block text-mute">{x.k}</span>
                  <b className="mt-2 block font-display text-lg leading-snug font-medium">{x.v}</b>
                </span>
              </>
            );
            return x.href ? (
              <SmartLink key={x.k} href={x.href} className="card flex items-center gap-4 p-5 transition-transform duration-500 hover:-translate-y-1 sm:min-h-48 sm:flex-col sm:items-start sm:gap-0 sm:p-6">
                {inner}
              </SmartLink>
            ) : (
              <div key={x.k} className="card flex items-center gap-4 p-5 sm:min-h-48 sm:flex-col sm:items-start sm:gap-0 sm:p-6">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <RiseText text={contact.topicsTitle} className="t-2 max-w-[14ch]" />
            <FadeUp as="ul" className="mt-10 flex flex-col">
              {contact.topics.map((t) => (
                <li key={t.t} className="border-t border-line py-6 last:border-b">
                  <h3 className="t-3">{t.t}</h3>
                  <p className="mt-2 text-mute">{t.d}</p>
                </li>
              ))}
            </FadeUp>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="lg:sticky lg:top-28">
              <WaForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="wrap max-w-3xl">
          <h2 className="t-3">{contact.privacyTitle}</h2>
          <p className="mt-4 text-mute">
            {contact.privacy}{" "}
            <SmartLink href="/kvkk" className="text-accent underline underline-offset-4">
              KVKK Aydınlatma Metni
            </SmartLink>{" "}
            ·{" "}
            <SmartLink href="/gizlilik-politikasi" className="text-accent underline underline-offset-4">
              Gizlilik Politikası
            </SmartLink>
          </p>
        </div>
      </section>
    </>
  );
}
