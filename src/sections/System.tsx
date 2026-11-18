import { system } from "../data/site";
import { img } from "../lib/media";
import { DepthCollage, ParallaxPhoto } from "../components/Media";
import { DriftWord, FadeUp, RiseText, ScrollFillText } from "../components/motion";
import { Icon } from "../components/ui";

const WORDS = ["Menü", "Sipariş", "Servis"];

/* Sistem — önce kaydırınca dolan tek bir cümle; ardından zeus kurumsal sayfasındaki
   vizyon/misyon düzeni: arkada dev, soluk bir kelime yatayda kayar, yazı üstte durur,
   yanında metne uyan görsel. Bölümler sağ/sol dönüşümlü. */
export default function System() {
  return (
    <section id="sistem" data-scene="Sistem" className="relative overflow-x-clip">
      <div className="wrap flex flex-col justify-center pt-24 pb-6 md:min-h-[80svh] md:py-28">
        <p className="label eyebrow">{system.eyebrow}</p>
        <ScrollFillText as="h2" text="Bir menü sayfası değil, *çalışan bir sistem*" className="t-1 mt-8 max-w-[15ch]" />
        <FadeUp>
          <p className="t-lead mt-10 max-w-md text-mute">{system.lead}</p>
        </FadeUp>
      </div>

      {system.chapters.map((c, i) => {
        const flip = i % 2 === 1;
        return (
          <div key={c.k} className="relative py-16 md:py-32">
            <DriftWord word={WORDS[i]!} dir={flip ? -1 : 1} className={flip ? "right-0" : "left-0"} />
            <div className="wrap relative grid items-center gap-12 md:grid-cols-12 md:gap-8">
              <div className={`md:col-span-5 ${flip ? "md:col-start-8 md:row-start-1" : "md:col-start-1"}`}>
                <p className="label text-mute">{c.k}</p>
                <RiseText text={c.t} className="t-2 mt-5 max-w-[13ch]" />
                <FadeUp stagger={0.06}>
                  <p className="t-lead mt-6 max-w-md text-mute">{c.d}</p>
                  <ul className="mt-8 flex flex-col">
                    {c.list.map((l) => (
                      <li key={l} className="flex gap-3 border-t border-line py-3">
                        <span className="check">
                          <Icon name="check" className="size-3" />
                        </span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </FadeUp>
              </div>
              <div className={`md:col-span-6 ${flip ? "md:col-start-1 md:row-start-1" : "md:col-start-7"}`}>
                {i === 0 ? (
                  <DepthCollage
                    items={[
                      { label: "San Sebastian Cheesecake", note: "₺185", img: img.cheesecake },
                      { label: "Iced Caramel Latte", note: "₺120", img: img.latte },
                      { label: "Trüflü Makarna", note: "₺240", img: img.pasta },
                    ]}
                  />
                ) : (
                  <ParallaxPhoto img={i === 1 ? img.posKitchen : img.waiterSalad} className="aspect-[4/5] rounded-[1.4rem] md:aspect-[5/6]" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
