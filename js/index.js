/* Kevin Chen */

const projects = document.getElementById("projects");
const imageGrid = document.getElementById("image-grid");

document.querySelectorAll("[data-project]").forEach((element) => {
  ["mouseenter", "touchstart"].forEach((type) => {
    element.addEventListener(type, (event) => {
      const project = event.target.dataset.project;
      projects.querySelector(`[data-project='${project}']`).classList.add("selected");
      imageGrid.querySelector(`[data-project='${project}']`).classList.add("selected");
    })
  });
  ["mouseleave", "touchend", "touchcancel"].forEach((type) => {
    element.addEventListener(type, (event) => {
      const project = event.target.dataset.project;
      projects.querySelector(`[data-project='${project}']`).classList.remove("selected");
      imageGrid.querySelector(`[data-project='${project}']`).classList.remove("selected");
    });
  });
});

const buttonNames = ["design", "programming", "other"];

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", function (_) {
    const numSelected = document.querySelectorAll("button.selected").length;
    const element = this;
    const buttonName = element.getAttribute("name");

    if (numSelected == 1 && element.classList.contains("selected")) {
      element.classList.remove("selected");
      projects.querySelectorAll("*").forEach((el) => {
        el.style.opacity = "";
        el.style.filter = "";
      });
      imageGrid.querySelectorAll("*").forEach((el) => {
        el.style.opacity = "";
        el.style.filter = "";
      });
      return;
    }

    element.classList.add("selected");

    for (const name of buttonNames) {
      if (name === buttonName) {
        projects.querySelectorAll(`.color-${name}`).forEach((el) => {
          el.style.opacity = "";
          el.style.filter = "";
        });
        imageGrid.querySelectorAll(`.color-${name}`).forEach((el) => {
          el.style.opacity = "";
          el.style.filter = "";
        });
      } else {
        document.querySelector(`button[name='${name}']`).classList.remove("selected");
        projects.querySelectorAll(`.color-${name}`).forEach((el) => {
          el.style.opacity = "0.25";
          el.style.filter = "blur(2px)";
        });
        imageGrid.querySelectorAll(`.color-${name}`).forEach((el) => {
          el.style.opacity = "0.1";
          el.style.filter = "blur(4px)";
        });
      }
    }
  });
});
