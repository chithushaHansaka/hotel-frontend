export function reloadRoute(event, path) {
  event.preventDefault();
  window.location.assign(path);
}
