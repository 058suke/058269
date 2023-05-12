window.addEventListener('load', () => {
  const menuBtn = document.getElementById("toggle-menu-btn");
  const navCon = document.getElementById("nav-menu");
  const navBg = document.getElementById("nav-menu-background");

  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("open");
    navCon.classList.toggle("open");
    navBg.classList.toggle("open");
  });

  navBg.addEventListener("click", () => {
    menuBtn.classList.toggle("open");
    navCon.classList.toggle("open");
    navBg.classList.toggle("open");
  });
});
