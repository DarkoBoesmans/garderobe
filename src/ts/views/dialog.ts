// Eén native <dialog> voor alle pop-ups: focus, Escape en schermlezers werken vanzelf.
const dlg = () => document.getElementById("dlg") as HTMLDialogElement;

export function openDialog(html: string, label: string) {
  const d = dlg();
  d.setAttribute("aria-label", label);
  d.innerHTML = `<div class="c-dialog__close"><button type="button" class="c-btn c-btn--ghost c-btn--small" data-close>Sluiten</button></div>${html}`;
  if (!d.open) d.showModal();
  d.scrollTop = 0;
}

export const closeDialog = () => dlg().close();

document.addEventListener("click", (e) => {
  const t = e.target as HTMLElement;
  if (t.closest("[data-close]") || t === dlg()) closeDialog();
});
