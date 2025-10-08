const BASE_URL = "http://localhost:8000/api/usuario";

export async function listarUsuarios() {
  const res = await fetch(BASE_URL);
  return await res.json();
}

export async function criarUsuario(usuario) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  return await res.json();
}
