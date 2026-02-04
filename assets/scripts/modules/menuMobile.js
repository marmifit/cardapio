export default function initMenuHamburguer() {
  const btnMenu = document.querySelector('[data-toggle="collapse"]');
  const hamburguer = document.querySelector('[data-toggle="hamburguer"]');
  const menu = document.querySelector("#menu");

  const events = ["click", "touch"];

  const nomeClasse = "open";

  if (btnMenu && hamburguer) {
    events.forEach((userEvents) => btnMenu.addEventListener(userEvents, handleClick));

    function handleClick(e) {
      e.preventDefault();
      this.classList.toggle(nomeClasse);
      menu.classList.add(nomeClasse);

      const hasClass = this.classList.contains(nomeClasse) && menu.classList.contains(nomeClasse);

      if (hasClass) {
        this.setAttribute("aria-label", "Fechar Menu");
        this.setAttribute("aria-expanded", hasClass);
        document.body.style.overflow = "hidden";
        menu.classList.add(nomeClasse);
      } else {
        this.setAttribute("aria-label", "Abrir Menu");
        menu.classList.remove(nomeClasse);
        document.body.style.overflow = "auto";
      }
    }
  }
}
