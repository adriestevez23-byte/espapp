// js/navigation.js
export function mostrarSeccion(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
  document.querySelectorAll("aside nav a").forEach(a => a.classList.remove("active"));
  const link = document.getElementById(`link-${id}`);
  if (link) link.classList.add("active");
}
