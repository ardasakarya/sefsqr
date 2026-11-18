/* Açılış perdesi ile sayfa arasındaki tek sinyal: perde kalkmaya başlayınca "reveal" olur.
   Hero başlığı bu ana bağlanır; böylece sabit gecikmeler (delay: 1.5 gibi) gerekmez. */
let revealed = false;
const subs = new Set<() => void>();

export function onIntroReveal(cb: () => void) {
  if (revealed) {
    cb();
    return () => {};
  }
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

export function introReveal() {
  if (revealed) return;
  revealed = true;
  subs.forEach((f) => f());
  subs.clear();
}
