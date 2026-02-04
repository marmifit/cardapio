export default function initgoToStart() {
  const btn = document.querySelector("[data-gotostart]");
  const events = ["click", "touch"];
  const initPage = 0;

  if (btn) {
    window.addEventListener("scroll", handleScroll);

    function handleScroll(e) {
      const metadeTela = document.body.scrollHeight / 2;

      const passouDaMetade = window.scrollY > metadeTela;

      if (passouDaMetade) {
        btn.classList.add("show");
        events.forEach((userEvent) =>
          btn.addEventListener(userEvent, (e) => {
            e.preventDefault();
            window.scrollTo({
              top: initPage,
              behavior: "smooth",
            });
          }),
        );
      } else {
        btn.classList.remove("show");
      }
    }
  }
}
