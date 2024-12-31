window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 50) {
      navbar.classList.remove("bg-transparent");
      navbar.classList.add("bg-white", "shadow-md");
      navbar.querySelectorAll("a").forEach((link) => {
        link.classList.remove("text-black");
        link.classList.add("text-black");
      });
    } else {
      navbar.classList.add("bg-transparent");
      navbar.classList.remove("bg-white", "shadow-md");
      navbar.querySelectorAll("a").forEach((link) => {
        link.classList.remove("text-black");
        link.classList.add("text-black");
      });
    }
  });
  